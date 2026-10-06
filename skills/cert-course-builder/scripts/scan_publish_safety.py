#!/usr/bin/env python3
"""Scan a folder (a repo, or one finished course) for things that should not be published.

Checks
  secret      API keys, tokens and private keys                         (error)
  path        personal filesystem paths such as /home/jane/ or C:\\Users\\  (error)
  email       e-mail addresses other than documented placeholders        (warning)
  deny        project-specific words from --deny or a .publish-denylist  (error)
  cert-name   real certification / exam-body names inside *course content*
              (.js/.html/.css under a template or course folder)           (error)
  storage-key a course.config.js whose storageKey is not namespaced        (error)
  large       files above --max-mb (default 5), which hint at bundled media  (warning)

Why: a course built from this skill is derived from someone's study of a real exam. Before it is shared, you
should know whether it names the exam body, carries your private localStorage key, or has a credential or a
home-directory path in it. Documentation may name certifications nominatively (e.g. "works for any
certification such as ..."); course content files may not, unless you pass --allow-cert-names for a private build.

Usage
    python scan_publish_safety.py <folder> [--deny WORD ...] [--denylist FILE] [--strict] [--json]
Exit status: 0 clean (warnings allowed unless --strict), 1 findings, 2 bad input.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", ".venv", "venv", "dist", "build"}
TEXT_EXT = {".md", ".txt", ".js", ".mjs", ".cjs", ".json", ".html", ".htm", ".css", ".py", ".yml", ".yaml", ".toml", ".cfg", ".ini", ".svg", ".csv", ".sh"}
CONTENT_EXT = {".js", ".html", ".htm", ".css", ".json"}
CONTENT_DIR_HINTS = ("reference-template", "course", "courses")
# a file in one of these locations is *tooling about* certifications, not course content
CONTENT_EXEMPT_NAMES = {"audio-manifest.js"}

SECRET_PATTERNS = {
    "AWS access key id": r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b",
    "GitHub token": r"\bgh[pousr]_[A-Za-z0-9]{30,}\b",
    "GitHub fine-grained token": r"\bgithub_pat_[A-Za-z0-9_]{40,}\b",
    "OpenAI/Anthropic-style key": r"\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{24,}\b",
    "Google API key": r"\bAIza[0-9A-Za-z_-]{35}\b",
    "Slack token": r"\bxox[abprs]-[A-Za-z0-9-]{10,}\b",
    "Private key block": r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----",
    "Bearer token": r"(?i)\bbearer\s+[A-Za-z0-9._~+/-]{30,}=*",
    "Generic secret assignment": r"""(?i)\b(?:api[_-]?key|secret|token|passwd|password)\b\s*[:=]\s*['"][A-Za-z0-9/+_=-]{16,}['"]""",
}
PATH_PATTERNS = {
    "Linux home path": r"(?<![\w.-])/home/(?!claude\b|user\b|runner\b|you\b|name\b|username\b|<)[a-z][a-z0-9._-]{1,31}/",
    "macOS home path": r"(?<![\w.-])/Users/(?!Shared\b|user\b|you\b|name\b|username\b|<)[A-Za-z][A-Za-z0-9._-]{1,31}/",
    "Windows user path": r"(?i)\b[A-Z]:\\Users\\(?!user\b|you\b|name\b|username\b|<)[A-Za-z][A-Za-z0-9._ -]{1,31}\\",
}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
EMAIL_OK_DOMAINS = {"example.com", "example.org", "example.net", "users.noreply.github.com", "anthropic.com", "localhost"}

# real certifying bodies / exams. Nominative mentions in docs are fine; in course *content* they are not.
CERT_NAMES = [
    r"CISSP", r"CISA", r"CISM", r"CRISC", r"CGEIT", r"CCSP", r"SSCP", r"CIPP(?:/[A-Z]+)?", r"CIPM", r"CIPT", r"AIGP",
    r"PMP", r"PMI-ACP", r"CAPM", r"PRINCE2", r"ITIL\s*\d?", r"CompTIA", r"Security\+", r"Network\+", r"A\+", r"CySA\+",
    r"AWS Certified", r"Azure (?:Fundamentals|Administrator|Solutions)", r"AZ-\d{3}", r"AI-\d{3}", r"SC-\d{3}",
    r"PSM\s?I", r"PSPO", r"\bCSM\b", r"\bCSPO\b", r"ISC2", r"\(ISC\)", r"ISACA", r"IAPP", r"PeopleCert", r"AXELOS", r"Scrum\.org",
    r"CEH", r"OSCP", r"GIAC", r"SANS Institute", r"Cisco CCNA", r"CCNA", r"CCNP",
]
CERT_RE = re.compile(r"(?<![A-Za-z0-9])(?:" + "|".join(CERT_NAMES) + r")(?![A-Za-z0-9])")

STORAGE_KEY_RE = re.compile(r"""storageKey\s*:\s*['"]([^'"]+)['"]""")
STORAGE_KEY_OK = re.compile(r"^[a-z][a-z0-9]*(?:-[a-z0-9]+){2,}$")  # e.g. ccb-demo-pim-v1


def is_content_file(rel: Path, allow_cert_names: bool) -> bool:
    if allow_cert_names or rel.suffix.lower() not in CONTENT_EXT or rel.name in CONTENT_EXEMPT_NAMES:
        return False
    if rel.name == "package-lock.json" or "tests" in rel.parts or ".github" in rel.parts:
        return False
    return any(any(h in part for h in CONTENT_DIR_HINTS) for part in rel.parts[:-1]) or rel.name == "course.config.js"


def scan(root: Path, deny: list[str], strict: bool = False, allow_cert_names: bool = False, max_mb: float = 5.0) -> list[dict]:
    findings: list[dict] = []
    deny_res = [(d, re.compile(d, re.I)) for d in deny]
    secret_res = {k: re.compile(v) for k, v in SECRET_PATTERNS.items()}
    path_res = {k: re.compile(v) for k, v in PATH_PATTERNS.items()}

    def add(sev, kind, rel, line, msg, snippet=""):
        findings.append({"severity": sev, "kind": kind, "file": str(rel), "line": line, "message": msg, "snippet": snippet[:120]})

    for p in sorted(root.rglob("*")):
        rel = p.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts) or not p.is_file():
            continue
        size_mb = p.stat().st_size / 1e6
        if size_mb > max_mb:
            add("warning", "large", rel, 0, f"{size_mb:.1f} MB file: is it bundled audio/media whose licence you have checked?")
        if p.suffix.lower() not in TEXT_EXT and p.name not in {"LICENSE", "NOTICE", ".gitignore"}:
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        content = is_content_file(rel, allow_cert_names)
        # the scanner and its tests contain the patterns they look for
        self_file = rel.name in {"scan_publish_safety.py", "test_scan_publish_safety.py"}
        for n, line in enumerate(text.splitlines(), 1):
            if not self_file:
                for name, rx in secret_res.items():
                    if rx.search(line):
                        add("error", "secret", rel, n, f"possible {name}", rx.search(line).group(0)[:8] + "…")
                for name, rx in path_res.items():
                    m = rx.search(line)
                    if m:
                        add("error", "path", rel, n, f"{name}: personal path", m.group(0))
                for m in EMAIL_RE.finditer(line):
                    dom = m.group(0).split("@", 1)[1].lower()
                    if dom not in EMAIL_OK_DOMAINS and not dom.endswith(".example"):
                        add("warning", "email", rel, n, "e-mail address (intended to be public?)", m.group(0))
            for word, rx in deny_res:
                if rx.search(line):
                    add("error", "deny", rel, n, f"matches deny pattern {word!r}", line.strip())
            if content and not self_file:
                m = CERT_RE.search(line)
                if m:
                    add("error", "cert-name", rel, n, f"real certification/body name {m.group(0)!r} in course content", line.strip())
        if rel.name == "course.config.js":
            m = STORAGE_KEY_RE.search(text)
            if not m:
                add("error", "storage-key", rel, 0, "no storageKey set: progress would share the engine's default key")
            elif not STORAGE_KEY_OK.match(m.group(1)):
                add("error", "storage-key", rel, 0, f"storageKey {m.group(1)!r} is not namespaced like 'org-course-v1'")
    return findings


def load_denylist(path: Path | None) -> list[str]:
    if not path:
        return []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as e:
        raise ValueError(f"cannot read denylist {path}: {e}") from e
    return [ln.strip() for ln in lines if ln.strip() and not ln.lstrip().startswith("#")]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--deny", action="append", default=[], metavar="REGEX", help="extra case-insensitive pattern that must not appear (repeatable)")
    ap.add_argument("--denylist", type=Path, help="file with one deny pattern per line (# comments allowed)")
    ap.add_argument("--allow-cert-names", action="store_true", help="private build: do not flag real certification names in course content")
    ap.add_argument("--max-mb", type=float, default=5.0)
    ap.add_argument("--strict", action="store_true", help="treat warnings as failures")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    if not args.folder.is_dir():
        print(f"INPUT ERROR: {args.folder} is not a directory", file=sys.stderr)
        return 2
    try:
        deny = args.deny + load_denylist(args.denylist)
        for d in deny:
            re.compile(d)
    except (ValueError, re.error) as e:
        print(f"INPUT ERROR: {e}", file=sys.stderr)
        return 2
    findings = scan(args.folder, deny, args.strict, args.allow_cert_names, args.max_mb)
    errors = [f for f in findings if f["severity"] == "error"]
    warnings = [f for f in findings if f["severity"] == "warning"]
    if args.json:
        print(json.dumps({"errors": len(errors), "warnings": len(warnings), "findings": findings}, indent=2))
    else:
        for f in findings:
            loc = f"{f['file']}:{f['line']}" if f["line"] else f["file"]
            print(f"{f['severity'].upper():<8}{f['kind']:<12}{loc}  {f['message']}" + (f"  [{f['snippet']}]" if f["snippet"] else ""))
        print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)" + ("" if findings else " — nothing to publish-block"))
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())

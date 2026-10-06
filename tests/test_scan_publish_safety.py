"""Tests for scripts/scan_publish_safety.py."""
import json
import subprocess
import sys

import scan_publish_safety as sps
from conftest import SCRIPTS, TEMPLATE, ROOT


def write(tmp_path, rel, text):
    p = tmp_path / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")
    return p


def kinds(findings, sev=None):
    return {f["kind"] for f in findings if sev in (None, f["severity"])}


def test_detects_secrets(tmp_path):
    write(tmp_path, "notes.md", "key = AKIA" + "ABCDEFGHIJKLMNOP\n" + "token: ghp_" + "a" * 36 + "\n")
    write(tmp_path, "k.txt", "-----BEGIN RSA PRIVATE KEY-----\n")
    f = sps.scan(tmp_path, [])
    assert "secret" in kinds(f, "error")
    assert len([x for x in f if x["kind"] == "secret"]) >= 3


def test_detects_personal_paths_but_not_placeholders(tmp_path):
    write(tmp_path, "a.md", "cd /home/jane/projects\nopen C:\\Users\\jane\\Desktop\nsee /Users/jane/Documents\n")
    write(tmp_path, "b.md", "use /home/<you>/x or /home/user/x or C:\\Users\\you\\x\n")
    f = sps.scan(tmp_path, [])
    assert {x["file"] for x in f if x["kind"] == "path"} == {"a.md"}
    assert len([x for x in f if x["kind"] == "path"]) == 3


def test_email_is_a_warning_and_placeholders_pass(tmp_path):
    write(tmp_path, "a.md", "mail me: jane@private-corp.io\nuse you@example.com\n")
    f = sps.scan(tmp_path, [])
    emails = [x for x in f if x["kind"] == "email"]
    assert len(emails) == 1 and emails[0]["severity"] == "warning"


def test_deny_patterns_are_case_insensitive(tmp_path):
    write(tmp_path, "a.md", "Built for ACME Corp\n")
    assert "deny" in kinds(sps.scan(tmp_path, [r"acme\s+corp"]), "error")


def test_real_cert_names_in_course_content_are_errors(tmp_path):
    write(tmp_path, "reference-template/seg1.js", "{ title: 'CISSP Domain 3 security architecture' }\n")
    write(tmp_path, "docs/guide.md", "Works for any certification, e.g. CISSP or PMP.\n")
    f = sps.scan(tmp_path, [])
    hits = [x for x in f if x["kind"] == "cert-name"]
    assert [x["file"] for x in hits] == ["reference-template/seg1.js"]


def test_cert_name_check_can_be_waived_for_private_builds(tmp_path):
    write(tmp_path, "reference-template/seg1.js", "x = 'ITIL 5 Foundation'\n")
    assert sps.scan(tmp_path, [], allow_cert_names=True) == []


def test_cert_name_needs_word_boundaries(tmp_path):
    write(tmp_path, "reference-template/seg1.js", "var MPMPX = 1; const CISAX = 2; // pmpx\n")
    assert not [x for x in sps.scan(tmp_path, []) if x["kind"] == "cert-name"]


def test_storage_key_must_be_namespaced(tmp_path):
    write(tmp_path, "course.config.js", "window.COURSE_CONFIG={storageKey:'progress'};")
    assert "storage-key" in kinds(sps.scan(tmp_path, []), "error")
    write(tmp_path, "course.config.js", "window.COURSE_CONFIG={storageKey:'acme-demo-v1'};")
    assert "storage-key" not in kinds(sps.scan(tmp_path, []))
    (tmp_path / "course.config.js").write_text("window.COURSE_CONFIG={};")
    assert "storage-key" in kinds(sps.scan(tmp_path, []), "error")


def test_large_files_warn(tmp_path):
    (tmp_path / "big.mp3").write_bytes(b"0" * 2_000_000)
    assert "large" in kinds(sps.scan(tmp_path, [], max_mb=1.0), "warning")


def test_skips_git_and_node_modules(tmp_path):
    write(tmp_path, ".git/config", "token = 'AKIA" + "ABCDEFGHIJKLMNOP'\n")
    write(tmp_path, "node_modules/x/a.js", "/home/jane/x\n")
    assert sps.scan(tmp_path, []) == []


def test_cli_exit_codes(tmp_path):
    run = lambda *a: subprocess.run([sys.executable, str(SCRIPTS / "scan_publish_safety.py"), *map(str, a)], capture_output=True, text=True)
    write(tmp_path, "ok.md", "nothing to see\n")
    assert run(tmp_path).returncode == 0
    write(tmp_path, "mail.md", "x@private-corp.io\n")
    assert run(tmp_path).returncode == 0          # warning only
    assert run(tmp_path, "--strict").returncode == 1
    write(tmp_path, "p.md", "/home/jane/x\n")
    r = run(tmp_path, "--json")
    assert r.returncode == 1 and json.loads(r.stdout)["errors"] == 1
    assert run(tmp_path / "nope").returncode == 2
    assert run(tmp_path, "--deny", "(").returncode == 2


def test_the_repository_itself_is_publishable():
    """The thing this repo ships must pass the check it ships."""
    f = sps.scan(ROOT, [])
    errors = [x for x in f if x["severity"] == "error"]
    assert errors == [], errors[:5]


def test_reference_template_is_clean_of_real_exam_names():
    assert not [x for x in sps.scan(TEMPLATE, []) if x["kind"] == "cert-name"]

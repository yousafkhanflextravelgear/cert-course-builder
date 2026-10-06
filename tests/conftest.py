"""Shared fixtures: put the skill's scripts on sys.path and point at the reference template."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "skills" / "cert-course-builder" / "scripts"
TEMPLATE = ROOT / "skills" / "cert-course-builder" / "reference-template"
sys.path.insert(0, str(SCRIPTS))

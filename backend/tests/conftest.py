"""Shared pytest configuration and fixtures."""

import os
import tempfile
from pathlib import Path

import pytest

# Redirect ALL temporary file creation to D: drive because C: drive is full.
_D_TEMP = Path("D:/pip_tmp/pytest_tmp")
_D_TEMP.mkdir(parents=True, exist_ok=True)
tempfile.tempdir = str(_D_TEMP)
os.environ["TMP"] = str(_D_TEMP)
os.environ["TEMP"] = str(_D_TEMP)

# Ensure chroma and data directories live on D: drive.
os.environ.setdefault(
    "CHROMA_DIRECTORY",
    "D:/Projects/SW2627-AI-with-RAG-VeriRule/backend/data/chroma",
)
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:///D:/Projects/SW2627-AI-with-RAG-VeriRule/backend/data/verirule.db",
)
os.environ.setdefault(
    "UPLOAD_DIRECTORY",
    "D:/Projects/SW2627-AI-with-RAG-VeriRule/backend/data/uploads",
)


@pytest.fixture(scope="session")
def tmp_path_factory_base(tmp_path_factory):
    """Ensure session-scoped temp paths also land on D:."""
    return tmp_path_factory

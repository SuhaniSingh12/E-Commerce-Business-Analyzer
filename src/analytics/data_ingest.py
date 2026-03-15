"""Utilities for handling user-uploaded data bundles."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Dict

import pandas as pd

from src.data_prep import preprocess

REQUIRED_TABLES = {"orders", "customers", "products", "inventory", "returns", "traffic"}


def _read_excel(file_obj: BytesIO) -> Dict[str, pd.DataFrame]:
    xls = pd.ExcelFile(file_obj)
    tables: Dict[str, pd.DataFrame] = {}
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet)
        tables[sheet.strip().lower()] = df
    return tables


def _read_csv(file_obj: BytesIO) -> Dict[str, pd.DataFrame]:
    df = pd.read_csv(file_obj)
    return {"orders": df}


def parse_uploaded_file(file_obj, filename: str) -> Dict[str, pd.DataFrame]:
    suffix = Path(filename).suffix.lower()
    data = file_obj.getvalue() if hasattr(file_obj, "getvalue") else file_obj.read()
    buffer = BytesIO(data)
    if suffix in {".xlsx", ".xls"}:
        return _read_excel(buffer)
    if suffix in {".csv"}:
        return _read_csv(buffer)
    raise ValueError("Unsupported file format. Please upload CSV or Excel (XLSX).")


def validate_tables(tables: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    normalized = {name.lower(): df for name, df in tables.items()}
    missing = REQUIRED_TABLES - normalized.keys()
    if missing:
        raise ValueError(
            "Missing required sheets/tables: " + ", ".join(sorted(missing)) +
            ". Please upload an Excel file with sheets named 'orders', 'customers', 'products', 'inventory', 'returns', 'traffic'."
        )
    return normalized


def ensure_demo_data() -> Dict[str, pd.DataFrame]:
    datasets = preprocess.load_datasets()
    return datasets


def harmonize_tables(tables: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    result = {}
    for name, df in tables.items():
        df = df.copy()
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
        if "order_date" in df.columns:
            df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        result[name] = df
    return result

"""Export utilities for PDF/Excel."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

import pandas as pd
from fpdf import FPDF


def export_excel(tables: Dict[str, pd.DataFrame], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        for name, df in tables.items():
            df.to_excel(writer, sheet_name=name[:31], index=False)
    return output_path


class _PDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, "Business Insight Report", ln=True, align="C")
        self.ln(2)


def export_pdf(summary: Dict[str, pd.DataFrame | dict | list | float], output_path: Path) -> Path:
    pdf = _PDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    for section, content in summary.items():
        pdf.set_font("Helvetica", "B", 12)
        pdf.multi_cell(0, 8, section.replace("_", " ").title())
        pdf.set_font("Helvetica", size=10)
        if isinstance(content, pd.DataFrame):
            pdf.multi_cell(0, 5, content.head(10).to_string())
        else:
            pdf.multi_cell(0, 5, str(content))
        pdf.ln(2)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(output_path))
    return output_path

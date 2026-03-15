"""Flask API backend for analytics web application."""
from __future__ import annotations

import base64
import io
import json
import zipfile
from pathlib import Path
from typing import Dict

import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
from fpdf import FPDF

from src import config
from src.analytics import data_ingest, insights_engine
from src.data_prep.data_generator import generate_all

app = Flask(__name__)
CORS(app)

# Ensure demo data exists
DATA_DIR = Path(config.DATA_DIR)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _dataframe_to_dict(df: pd.DataFrame) -> Dict:
    """Convert DataFrame to JSON-serializable dict."""
    if df.empty:
        return {"columns": [], "data": []}
    return {
        "columns": df.columns.tolist(),
        "data": df.fillna("").values.tolist(),
        "index": df.index.tolist() if hasattr(df.index, 'tolist') else list(range(len(df)))
    }


def _serialize_insights(insights: Dict) -> Dict:
    """Serialize insights for JSON response."""
    serialized = {}
    
    # Cohort analysis
    if "cohort" in insights:
        cohort = insights["cohort"]
        serialized["cohort"] = {
            "retention": _dataframe_to_dict(cohort.retention),
            "revenue": _dataframe_to_dict(cohort.revenue),
            "repeat_rate": cohort.repeat_rate,
            "summary": cohort.summary,
            "cohort_details": _dataframe_to_dict(cohort.cohort_details),
            "comparisons": {k: _dataframe_to_dict(v) for k, v in cohort.comparisons.items()},
            "geo_insights": {
                "tier_retention": _dataframe_to_dict(cohort.geo_insights["tier_retention"]),
                "region_aov": _dataframe_to_dict(pd.DataFrame(cohort.geo_insights["region_aov"])),
                "state_discount": _dataframe_to_dict(pd.DataFrame(cohort.geo_insights["state_discount"])),
            }
        }
    
    # Product insights
    if "product_dashboard" in insights:
        serialized["product_dashboard"] = {
            k: _dataframe_to_dict(v) for k, v in insights["product_dashboard"].items()
        }
    
    for key in ["price_elasticity", "sentiment", "repeat_purchase", "return_rate", 
                "conversion_funnel", "cross_sell", "discount_dependency", "complaints"]:
        if key in insights:
            serialized[key] = _dataframe_to_dict(insights[key])
    
    if "seasonality" in insights:
        serialized["seasonality"] = {
            k: _dataframe_to_dict(v) for k, v in insights["seasonality"].items()
        }
    
    if "inventory_velocity" in insights:
        serialized["inventory_velocity"] = _dataframe_to_dict(insights["inventory_velocity"])
    
    # RFM
    if "rfm_table" in insights:
        serialized["rfm_table"] = _dataframe_to_dict(insights["rfm_table"])
    
    if "rfm_summary" in insights:
        serialized["rfm_summary"] = {
            "city_distribution": _dataframe_to_dict(pd.DataFrame(insights["rfm_summary"]["city_distribution"])),
            "segment_ltv": _dataframe_to_dict(pd.DataFrame(insights["rfm_summary"]["segment_ltv"])),
        }
    
    # Forecast
    if "forecast" in insights:
        forecast = insights["forecast"]
        serialized["forecast"] = {
            "history": _dataframe_to_dict(forecast["history"]),
            "forecast_revenue": _dataframe_to_dict(forecast["forecast_revenue"]),
            "forecast_quantity": _dataframe_to_dict(forecast["forecast_quantity"]),
        }
    
    # Anomalies
    if "anomalies" in insights:
        serialized["anomalies"] = {
            k: _dataframe_to_dict(v) for k, v in insights["anomalies"].items()
        }
    
    # Inventory
    if "inventory_health" in insights:
        serialized["inventory_health"] = _dataframe_to_dict(insights["inventory_health"])
    
    # Heatmaps
    if "heatmaps" in insights:
        serialized["heatmaps"] = {
            k: _dataframe_to_dict(v) for k, v in insights["heatmaps"].items()
        }
    
    return serialized


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze uploaded data or use demo data."""
    try:
        if 'file' in request.files:
            file = request.files['file']
            raw_tables = data_ingest.parse_uploaded_file(file, file.filename)
            tables = data_ingest.validate_tables(raw_tables)
            data_tables = data_ingest.harmonize_tables(tables)
        else:
            # Generate and use demo data
            generate_all(config.DATA_DIR)
            data_tables = data_ingest.ensure_demo_data()
        
        # Build insights
        insights = insights_engine.build_all_insights(
            data_tables["orders"],
            data_tables["customers"],
            data_tables["products"],
            data_tables["inventory"],
            data_tables["returns"],
            data_tables["traffic"],
        )
        
        # Serialize for JSON response
        serialized = _serialize_insights(insights)
        
        return jsonify({
            "success": True,
            "insights": serialized
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route('/api/export/excel', methods=['POST'])
def export_excel():
    """Export insights as Excel file."""
    try:
        data = request.json
        insights_data = data.get("insights", {})
        
        # Reconstruct DataFrames from serialized data
        excel_buf = io.BytesIO()
        
        tables = {}
        if "cohort" in insights_data:
            tables["retention"] = pd.DataFrame(
                insights_data["cohort"]["retention"]["data"],
                columns=insights_data["cohort"]["retention"]["columns"]
            )
            tables["cohort_revenue"] = pd.DataFrame(
                insights_data["cohort"]["revenue"]["data"],
                columns=insights_data["cohort"]["revenue"]["columns"]
            )
        
        if "rfm_table" in insights_data:
            tables["rfm_segments"] = pd.DataFrame(
                insights_data["rfm_table"]["data"],
                columns=insights_data["rfm_table"]["columns"]
            )
        
        if "inventory_health" in insights_data:
            tables["inventory_health"] = pd.DataFrame(
                insights_data["inventory_health"]["data"],
                columns=insights_data["inventory_health"]["columns"]
            )
        
        if "forecast" in insights_data:
            tables["forecast_revenue"] = pd.DataFrame(
                insights_data["forecast"]["forecast_revenue"]["data"],
                columns=insights_data["forecast"]["forecast_revenue"]["columns"]
            )
        
        with pd.ExcelWriter(excel_buf, engine="openpyxl") as writer:
            for sheet, df in tables.items():
                if not df.empty:
                    df.to_excel(writer, sheet_name=sheet[:31], index=False)
        
        excel_buf.seek(0)
        return send_file(
            excel_buf,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='business_insights.xlsx'
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    """Export insights as PDF report."""
    try:
        data = request.json
        insights_data = data.get("insights", {})
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "Business Insight Report", ln=True)
        
        pdf.set_font("Helvetica", size=11)
        
        if "cohort" in insights_data:
            repeat_rate = insights_data["cohort"].get("repeat_rate", 0)
            avg_revenue = insights_data["cohort"]["summary"].get("avg_monthly_revenue", 0)
            pdf.multi_cell(0, 8, f"Cohort Repeat Rate: {repeat_rate:.1%}")
            pdf.multi_cell(0, 8, f"Avg Revenue (Monthly): ₹{avg_revenue:,.2f}")
        
        pdf.ln(4)
        
        if "rfm_summary" in insights_data and "segment_ltv" in insights_data["rfm_summary"]:
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 8, "Top Customer Segments", ln=True)
            pdf.set_font("Helvetica", size=10)
            # Add segment info if available
        
        if "inventory_health" in insights_data:
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 8, "Inventory Alerts", ln=True)
            pdf.set_font("Helvetica", size=10)
            # Add inventory alerts
        
        if "anomalies" in insights_data:
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 8, "Anomaly Highlights", ln=True)
            pdf.set_font("Helvetica", size=10)
            if "return_spikes" in insights_data["anomalies"]:
                count = len(insights_data["anomalies"]["return_spikes"]["data"])
                pdf.multi_cell(0, 5, f"Return spikes detected: {count}")
        
        pdf_buf = io.BytesIO()
        pdf.output(pdf_buf)
        pdf_buf.seek(0)
        
        return send_file(
            pdf_buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='business_insights.pdf'
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)

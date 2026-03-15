"""Heatmap and engagement analytics."""
from __future__ import annotations

import pandas as pd


def build_heatmaps(traffic: pd.DataFrame) -> dict:
    df = traffic.copy()
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df["weekday"] = df["timestamp"].dt.day_name()
        df["hour"] = df["timestamp"].dt.hour
    elif "date" in df.columns and "hour" in df.columns:
        df["weekday"] = pd.to_datetime(df["date"], errors="coerce").dt.day_name()
    else:
        df["weekday"] = "Unknown"
        if "hour" not in df.columns:
            df["hour"] = 0

    visitor_heatmap = df.pivot_table(index="weekday", columns="hour", values="visitors", aggfunc="sum", fill_value=0)
    conversion_heatmap = df.pivot_table(index="weekday", columns="hour", values="purchases", aggfunc="sum", fill_value=0)
    engagement = df.groupby("weekday").agg(visitors=("visitors", "sum"), add_to_cart=("add_to_cart", "sum"), purchases=("purchases", "sum"))
    engagement["conversion_rate"] = engagement["purchases"] / engagement["visitors"].replace(0, pd.NA)
    return {
        "visitor_heatmap": visitor_heatmap,
        "conversion_heatmap": conversion_heatmap,
        "engagement": engagement,
    }

"""RFM segmentation utilities."""
from __future__ import annotations

import numpy as np
import pandas as pd

SEGMENT_MAP = {
    (5, 5): "Champions",
    (5, 4): "Champions",
    (4, 5): "Loyal",
    (4, 4): "Loyal",
    (3, 5): "Big Spenders",
    (3, 4): "Big Spenders",
    (2, 5): "Potential Loyalist",
    (2, 4): "Potential Loyalist",
}


def _score_series(series: pd.Series) -> pd.Series:
    return pd.qcut(series.rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)


def build_rfm(orders: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    df = orders.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    snapshot = df["order_date"].max() + pd.Timedelta(days=1)
    agg = (
        df.groupby("customer_id")
        .agg(
            recency=("order_date", lambda x: (snapshot - x.max()).days),
            frequency=("order_id", "nunique"),
            monetary=("revenue", "sum"),
        )
        .reset_index()
    )
    agg["R"] = pd.qcut(agg["recency"], 5, labels=[5, 4, 3, 2, 1]).astype(int)
    agg["F"] = _score_series(agg["frequency"])
    agg["M"] = _score_series(agg["monetary"])
    agg["segment_code"] = agg["R"].astype(str) + agg["F"].astype(str)

    def label_row(row):
        key = (row["R"], row["F"])
        if key in SEGMENT_MAP:
            return SEGMENT_MAP[key]
        # Lost: very low recency (R=1) and low frequency
        if row["R"] == 1 and row["F"] <= 2:
            return "Lost"
        # At Risk: low recency
        if row["R"] <= 2:
            return "At Risk"
        # Need Nurturing: moderate recency but could improve
        return "Need Nurturing"

    agg["segment"] = agg.apply(label_row, axis=1)
    enriched = agg.merge(customers[["customer_id", "city", "city_tier", "region"]], on="customer_id", how="left")
    return enriched


def segment_summary(rfm: pd.DataFrame) -> dict:
    return {
        "city_distribution": rfm.groupby("city")["customer_id"].count().sort_values(ascending=False),
        "tier_split": rfm.groupby("city_tier")["customer_id"].count(),
        "segment_ltv": rfm.groupby("segment")["monetary"].mean().sort_values(ascending=False),
    }

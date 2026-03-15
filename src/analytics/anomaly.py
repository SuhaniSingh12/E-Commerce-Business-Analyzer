"""Anomaly detection utilities."""
from __future__ import annotations

from typing import Dict

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


def _zscore(series: pd.Series) -> pd.Series:
    return (series - series.mean()) / (series.std(ddof=0) or 1)


def detect_anomalies(orders: pd.DataFrame, returns: pd.DataFrame, traffic: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    orders = orders.copy()
    orders["order_date"] = pd.to_datetime(orders["order_date"], errors="coerce")
    returns = returns.copy()
    returns["return_date"] = pd.to_datetime(returns["return_date"], errors="coerce")
    traffic = traffic.copy()
    traffic["date"] = pd.to_datetime(traffic.get("date", traffic.get("timestamp")), errors="coerce")

    daily_returns = returns.groupby("return_date").size().rename("returns")
    daily_orders = orders.groupby("order_date").size().rename("orders")
    return_ratio = (daily_returns / daily_orders).fillna(0)
    spikes = return_ratio[_zscore(return_ratio) > 2].reset_index().rename(columns={0: "return_ratio"})

    conversions = traffic.groupby("date").agg(visitors=("visitors", "sum"), purchases=("purchases", "sum"))
    conversions["conversion_rate"] = conversions["purchases"] / conversions["visitors"].replace(0, np.nan)
    conversion_drop = conversions[_zscore(conversions["conversion_rate"]).abs() > 2]

    iso_features = orders[["revenue", "discount_rate", "quantity", "supplier_delay_hours"]].fillna(0)
    detector = IsolationForest(random_state=42, contamination=0.03)
    detector.fit(iso_features)
    mask = detector.predict(iso_features) == -1
    suspicious_orders = orders.loc[mask, ["order_id", "customer_id", "revenue", "discount_rate", "supplier_delay_hours"]]

    supplier_delays = orders[orders["supplier_delay_hours"] > orders["supplier_delay_hours"].mean() + 2 * orders["supplier_delay_hours"].std()]

    return {
        "return_spikes": spikes,
        "conversion_anomalies": conversion_drop,
        "suspicious_orders": suspicious_orders,
        "supplier_delays": supplier_delays,
    }

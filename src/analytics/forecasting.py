"""Demand forecasting helpers."""
from __future__ import annotations

from typing import Dict

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def _feature_engineer(monthly: pd.DataFrame) -> pd.DataFrame:
    monthly = monthly.copy()
    monthly["month_index"] = np.arange(len(monthly))
    monthly["month"] = monthly.index.month
    monthly["month_sin"] = np.sin(2 * np.pi * monthly["month"] / 12)
    monthly["month_cos"] = np.cos(2 * np.pi * monthly["month"] / 12)
    return monthly


def forecast_monthly_demand(orders: pd.DataFrame, periods: int = 6) -> Dict[str, pd.DataFrame]:
    df = orders.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    monthly = df.groupby(pd.Grouper(key="order_date", freq="M")).agg(
        revenue=("revenue", "sum"),
        quantity=("quantity", "sum"),
    ).dropna()
    monthly_features = _feature_engineer(monthly)
    X = monthly_features[["month_index", "month_sin", "month_cos"]]
    forecasts = {}
    for target in ["revenue", "quantity"]:
        model = LinearRegression().fit(X, monthly_features[target])
        future_index = np.arange(len(monthly), len(monthly) + periods)
        future_df = pd.DataFrame({"month_index": future_index})
        last_month = monthly.index[-1]
        future_df["date"] = pd.date_range(last_month + pd.offsets.MonthEnd(), periods=periods, freq="M")
        future_df["month"] = future_df["date"].dt.month
        future_df["month_sin"] = np.sin(2 * np.pi * future_df["month"] / 12)
        future_df["month_cos"] = np.cos(2 * np.pi * future_df["month"] / 12)
        future_df[target] = model.predict(future_df[["month_index", "month_sin", "month_cos"]])
        forecasts[target] = future_df[["date", target]]

    history = monthly.reset_index().rename(columns={"order_date": "date"})
    return {"history": history, "forecast_revenue": forecasts["revenue"], "forecast_quantity": forecasts["quantity"]}

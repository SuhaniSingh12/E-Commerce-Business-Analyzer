"""Cohort analysis utilities."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np
import pandas as pd


@dataclass
class CohortOutputs:
    retention: pd.DataFrame
    revenue: pd.DataFrame
    repeat_rate: float
    summary: Dict[str, float]
    cohort_details: pd.DataFrame
    comparisons: Dict[str, pd.DataFrame]
    geo_insights: Dict[str, pd.DataFrame]


def _prepare_orders(orders: pd.DataFrame) -> pd.DataFrame:
    df = orders.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df = df.dropna(subset=["order_date"])
    df["order_month"] = df["order_date"].dt.to_period("M").dt.to_timestamp()
    first_purchase = df.groupby("customer_id")["order_date"].min().rename("cohort_date")
    df = df.join(first_purchase, on="customer_id")
    df["cohort_month"] = df["cohort_date"].dt.to_period("M").dt.to_timestamp()
    df["cohort_index"] = (
        (df["order_month"].dt.year - df["cohort_month"].dt.year) * 12
        + (df["order_month"].dt.month - df["cohort_month"].dt.month)
    )
    return df


def _retention_matrix(df: pd.DataFrame) -> pd.DataFrame:
    cohort_pivot = (
        df.groupby(["cohort_month", "cohort_index"])
        .agg(customers=("customer_id", "nunique"))
        .reset_index()
        .pivot(index="cohort_month", columns="cohort_index", values="customers")
    )
    cohort_sizes = cohort_pivot.iloc[:, 0]
    retention = cohort_pivot.divide(cohort_sizes, axis=0).round(3)
    retention.columns = [f"Month {int(c)}" for c in retention.columns]
    return retention.fillna(0)


def _revenue_matrix(df: pd.DataFrame) -> pd.DataFrame:
    revenue = (
        df.groupby(["cohort_month", "cohort_index"])
        .agg(revenue=("revenue", "sum"))
        .reset_index()
        .pivot(index="cohort_month", columns="cohort_index", values="revenue")
        .fillna(0)
    )
    revenue.columns = [f"Month {int(c)}" for c in revenue.columns]
    return revenue


def _repeat_purchase_rate(df: pd.DataFrame) -> float:
    purchases = df.groupby("customer_id")["order_id"].count()
    repeaters = (purchases > 1).mean()
    return float(repeaters)


def _cohort_summary(df: pd.DataFrame) -> pd.DataFrame:
    summary = (
        df.groupby("cohort_month")
        .agg(
            customers=("customer_id", "nunique"),
            revenue=("revenue", "sum"),
            avg_order_value=("revenue", "mean"),
        )
        .sort_index()
    )
    return summary


def _comparison_metric(df: pd.DataFrame, mask_a: pd.Series, mask_b: pd.Series) -> pd.DataFrame:
    def _summary(mask: pd.Series) -> pd.Series:
        filtered = df.loc[mask]
        return pd.Series(
            {
                "customers": filtered["customer_id"].nunique(),
                "revenue": filtered["revenue"].sum(),
                "avg_order_value": filtered["revenue"].mean(),
                "repeat_rate": _repeat_purchase_rate(filtered),
            }
        )

    return pd.concat({"A": _summary(mask_a), "B": _summary(mask_b)}, axis=1)


def build_cohort_analysis(orders: pd.DataFrame) -> CohortOutputs:
    df = _prepare_orders(orders)
    retention = _retention_matrix(df)
    revenue = _revenue_matrix(df)
    repeat_rate = _repeat_purchase_rate(df)
    cohort_details = _cohort_summary(df)
    summary = {
        "avg_repeat_rate": repeat_rate,
        "avg_monthly_revenue": float(df.groupby("order_month")["revenue"].sum().mean()),
    }

    comparisons = {
        "Diwali_vs_Rest": _comparison_metric(df, df["festival"].eq("Diwali"), df["festival"].ne("Diwali")),
        "Organic_vs_Paid": _comparison_metric(df, df["acquisition_channel"].eq("Organic"), df["acquisition_channel"].eq("Paid")),
        "Discount_vs_FullPrice": _comparison_metric(df, df["discount_rate"] > 0.15, df["discount_rate"] <= 0.05),
    }

    geo_insights = {
        "tier_retention": df.groupby(["city_tier", "cohort_index"])["customer_id"].nunique().unstack(fill_value=0),
        "region_aov": df.groupby("region")["revenue"].mean().sort_values(ascending=False),
        "state_discount": df.groupby("state")["discount_rate"].mean().sort_values(ascending=False),
    }

    return CohortOutputs(
        retention=retention,
        revenue=revenue,
        repeat_rate=repeat_rate,
        summary=summary,
        cohort_details=cohort_details,
        comparisons=comparisons,
        geo_insights=geo_insights,
    )

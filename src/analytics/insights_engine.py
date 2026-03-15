"""High-level orchestration of analytics modules."""
from __future__ import annotations

from typing import Dict

import pandas as pd

from src.analytics import anomaly, cohort, forecasting, heatmaps, inventory, product, rfm


def _ensure_dataframe(obj) -> pd.DataFrame:
    if isinstance(obj, pd.DataFrame):
        return obj.copy()
    raise ValueError("Expected pandas DataFrame inputs.")


def build_all_insights(
    orders: pd.DataFrame,
    customers: pd.DataFrame,
    products: pd.DataFrame,
    inventory_df: pd.DataFrame,
    returns: pd.DataFrame,
    traffic: pd.DataFrame,
) -> Dict[str, object]:
    orders = _ensure_dataframe(orders)
    customers = _ensure_dataframe(customers)
    products = _ensure_dataframe(products)
    inventory_df = _ensure_dataframe(inventory_df)
    returns = _ensure_dataframe(returns)
    traffic = _ensure_dataframe(traffic)

    cohort_output = cohort.build_cohort_analysis(orders)
    product_dashboard = product.hero_zero_dashboard(orders, products)
    price_elasticity = product.price_elasticity(orders)
    sentiment = product.sentiment_proxy(products)
    seasonality = product.seasonality(orders)
    repeat_rate = product.repeat_purchase_rate(orders)
    velocity = product.inventory_velocity(orders, inventory_df)
    return_rate = product.return_rate(orders, returns)
    funnel = product.conversion_funnel(orders)
    cross_sell = product.cross_sell_matrix(orders)
    discount_dep = product.discount_dependency(orders)
    complaints = product.complaint_detection(returns)

    rfm_table = rfm.build_rfm(orders, customers)
    rfm_summary = rfm.segment_summary(rfm_table)

    demand_forecast = forecasting.forecast_monthly_demand(orders)

    anomaly_outputs = anomaly.detect_anomalies(orders, returns, traffic)

    inventory_health_df = inventory.inventory_health(orders, inventory_df)

    heatmap_outputs = heatmaps.build_heatmaps(traffic)

    return {
        "cohort": cohort_output,
        "product_dashboard": product_dashboard,
        "price_elasticity": price_elasticity,
        "sentiment": sentiment,
        "seasonality": seasonality,
        "repeat_purchase": repeat_rate,
        "inventory_velocity": velocity,
        "return_rate": return_rate,
        "conversion_funnel": funnel,
        "cross_sell": cross_sell,
        "discount_dependency": discount_dep,
        "complaints": complaints,
        "rfm_table": rfm_table,
        "rfm_summary": rfm_summary,
        "forecast": demand_forecast,
        "anomalies": anomaly_outputs,
        "inventory_health": inventory_health_df,
        "heatmaps": heatmap_outputs,
    }

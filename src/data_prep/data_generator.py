"""Synthetic dataset generator for the E-Commerce Business Analyser."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd

from src import config

RNG = np.random.default_rng(config.RANDOM_STATE)

CITY_INFO = [
    ("Mumbai", "Maharashtra", "Tier-1", "West"),
    ("Delhi", "Delhi", "Tier-1", "North"),
    ("Bengaluru", "Karnataka", "Tier-1", "South"),
    ("Hyderabad", "Telangana", "Tier-1", "South"),
    ("Ahmedabad", "Gujarat", "Tier-2", "West"),
    ("Pune", "Maharashtra", "Tier-2", "West"),
    ("Jaipur", "Rajasthan", "Tier-2", "North"),
    ("Indore", "Madhya Pradesh", "Tier-2", "Central"),
    ("Lucknow", "Uttar Pradesh", "Tier-2", "North"),
    ("Chandigarh", "Chandigarh", "Tier-2", "North"),
    ("Kochi", "Kerala", "Tier-2", "South"),
    ("Nagpur", "Maharashtra", "Tier-3", "West"),
    ("Coimbatore", "Tamil Nadu", "Tier-3", "South"),
    ("Bhopal", "Madhya Pradesh", "Tier-3", "Central"),
    ("Vizag", "Andhra Pradesh", "Tier-3", "South"),
]

ACQUISITION_CHANNELS = ["Organic", "Paid", "Referral", "Marketplace", "Affiliate"]
DISCOUNT_PROFILES = ["No Discount", "Festival", "Clearance", "BOGO", "Loyalty"]
RETURN_REASONS = ["Damaged", "Defective", "Wrong Item", "Late Delivery", "Quality Issue", "No Reason"]

FESTIVAL_MAP = {
    1: "NewYear",
    3: "Holi",
    8: "RakshaBandhan",
    10: "Diwali",
    11: "Diwali",
    12: "Christmas",
}


def _ensure_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _city_row() -> tuple[str, str, str, str]:
    return CITY_INFO[RNG.integers(0, len(CITY_INFO))]


def generate_product_data(n_products: int = 120) -> pd.DataFrame:
    categories = np.array(["Electronics", "Apparel", "Home", "Beauty", "Sports", "Grocery", "Accessories"])
    product_ids = np.arange(1000, 1000 + n_products)
    base_price = RNG.uniform(10, 600, size=n_products)
    rating = np.clip(RNG.normal(4.1, 0.4, size=n_products), 2.3, 5.0)
    demand = RNG.uniform(0.15, 1.1, size=n_products)
    cost_price = base_price * RNG.uniform(0.4, 0.8, size=n_products)
    promo_factor = RNG.uniform(0.7, 1.3, size=n_products)
    sales = (650 - base_price) * demand * promo_factor + rating * 35
    sales = np.clip(sales, 15, None)

    df = pd.DataFrame(
        {
            "product_id": product_ids,
            "sku": [f"SKU-{pid}" for pid in product_ids],
            "category": RNG.choice(categories, size=n_products, p=[0.18, 0.2, 0.17, 0.13, 0.12, 0.1, 0.1]),
            "price": base_price,
            "cost_price": cost_price,
            "rating": rating,
            "demand_score": demand,
            "marketing_spend": RNG.uniform(500, 20_000, size=n_products),
            "inventory_turnover": RNG.uniform(2, 14, size=n_products),
            "sales": sales,
            "seasonality_index": RNG.uniform(0.7, 1.3, size=n_products),
        }
    )

    missing_mask = RNG.random(df.shape) < 0.01
    df = df.mask(missing_mask)
    return df


def generate_customer_data(n_customers: int = 500) -> pd.DataFrame:
    customer_ids = np.arange(5000, 5000 + n_customers)
    tenure = RNG.uniform(1, 60, size=n_customers)
    monthly_spend = np.clip(RNG.normal(380, 150, size=n_customers), 40, None)
    engagement = RNG.uniform(0, 1, size=n_customers)
    support_tickets = RNG.poisson(0.9, size=n_customers)
    churn_prob = 0.2 - 0.002 * tenure + 0.0007 * support_tickets + 0.25 * (1 - engagement)
    churn_prob = 1 / (1 + np.exp(-churn_prob))
    churn_flag = RNG.binomial(1, np.clip(churn_prob, 0.05, 0.85))

    total_spent = tenure * monthly_spend * (1 - churn_prob * 0.25)
    avg_order_value = total_spent / RNG.uniform(5, 55, size=n_customers)
    value_score = 0.5 * avg_order_value + 0.3 * tenure + 0.2 * engagement * 100
    bins = [-np.inf, 120, 260, np.inf]
    labels = ["low-value", "mid-value", "high-value"]
    value_segment = pd.cut(value_score, bins=bins, labels=labels)

    city_rows = np.array([_city_row() for _ in range(n_customers)])

    df = pd.DataFrame(
        {
            "customer_id": customer_ids,
            "age": RNG.normal(34, 10, size=n_customers).astype(int),
            "tenure_months": tenure,
            "monthly_spend": monthly_spend,
            "engagement_score": engagement,
            "support_tickets": support_tickets,
            "avg_order_value": avg_order_value,
            "visits_per_month": RNG.poisson(6, size=n_customers) + engagement * 3,
            "discount_rate": RNG.uniform(0, 0.45, size=n_customers),
            "churn": churn_flag,
            "value_segment": value_segment,
            "city": city_rows[:, 0],
            "state": city_rows[:, 1],
            "city_tier": city_rows[:, 2],
            "region": city_rows[:, 3],
            "acquisition_channel": RNG.choice(ACQUISITION_CHANNELS, size=n_customers, p=[0.35, 0.25, 0.15, 0.15, 0.1]),
            "preferred_discount_type": RNG.choice(DISCOUNT_PROFILES, size=n_customers),
        }
    )

    for col in ["age", "monthly_spend", "avg_order_value"]:
        mask = RNG.random(n_customers) < 0.02
        df.loc[mask, col] = np.nan
    return df


def _festival_flag(date) -> str:
    # Convert numpy datetime64 or pd.Timestamp to pd.Timestamp
    if isinstance(date, (np.datetime64, pd.Timestamp)):
        date = pd.Timestamp(date)
    else:
        date = pd.to_datetime(date)
    return FESTIVAL_MAP.get(date.month, "Regular")


def generate_orders_data(customers: pd.DataFrame, products: pd.DataFrame, n_orders: int = 4000) -> pd.DataFrame:
    customer_choices = RNG.choice(customers["customer_id"], size=n_orders)
    product_choices = RNG.choice(products["product_id"], size=n_orders)
    order_dates = pd.date_range("2023-10-01", periods=400, freq="D")
    order_date_choices = RNG.choice(order_dates, size=n_orders)
    quantity = RNG.integers(1, 6, size=n_orders)

    product_lookup = products.set_index("product_id")
    # Use reindex to ensure we get exactly n_orders values
    price_series = product_lookup.reindex(product_choices)["price"]
    category_series = product_lookup.reindex(product_choices)["category"]
    
    # Handle any NaN values (shouldn't happen, but just in case)
    if price_series.isna().any():
        # Fill NaN with mean price
        price_series = price_series.fillna(price_series.mean())
    if category_series.isna().any():
        # Fill NaN with first category
        category_series = category_series.fillna(category_series.iloc[0])
    
    # Convert to arrays and ensure correct length
    price = price_series.values[:n_orders]
    category = category_series.values[:n_orders]
    quantity = quantity[:n_orders] if len(quantity) > n_orders else quantity

    revenue = price * quantity
    order_hour = RNG.integers(0, 24, size=n_orders)
    discounts = RNG.choice([0, 0.05, 0.1, 0.15, 0.25, 0.35], size=n_orders, p=[0.4, 0.2, 0.15, 0.15, 0.07, 0.03])
    city_lookup = customers.set_index("customer_id")[["city", "state", "city_tier", "region", "acquisition_channel"]]
    
    # Ensure all arrays are exactly n_orders in length
    customer_choices = customer_choices[:n_orders] if len(customer_choices) > n_orders else customer_choices
    product_choices = product_choices[:n_orders] if len(product_choices) > n_orders else product_choices
    order_date_choices = order_date_choices[:n_orders] if len(order_date_choices) > n_orders else order_date_choices
    order_hour = order_hour[:n_orders] if len(order_hour) > n_orders else order_hour
    discounts = discounts[:n_orders] if len(discounts) > n_orders else discounts
    
    # Get city lookup values and ensure correct length
    city_lookup_reindexed = city_lookup.reindex(customer_choices)
    city_vals = city_lookup_reindexed["city"].values[:n_orders]
    state_vals = city_lookup_reindexed["state"].values[:n_orders]
    city_tier_vals = city_lookup_reindexed["city_tier"].values[:n_orders]
    region_vals = city_lookup_reindexed["region"].values[:n_orders]
    acquisition_channel_vals = city_lookup_reindexed["acquisition_channel"].values[:n_orders]

    df = pd.DataFrame(
        {
            "order_id": np.arange(1, n_orders + 1),
            "customer_id": customer_choices,
            "product_id": product_choices,
            "order_date": order_date_choices,
            "order_hour": order_hour,
            "quantity": quantity,
            "unit_price": price,
            "revenue": revenue * (1 - discounts),
            "discount_rate": discounts,
            "category": category,
            "festival": [_festival_flag(d) for d in order_date_choices[:n_orders]],
            "city": city_vals,
            "state": state_vals,
            "city_tier": city_tier_vals,
            "region": region_vals,
            "acquisition_channel": acquisition_channel_vals,
            "cart_adds": RNG.integers(1, 10, size=n_orders),
            "page_views": RNG.integers(5, 80, size=n_orders),
            "supplier_delay_hours": np.clip(RNG.normal(4, 2, size=n_orders), 0, None),
        }
    )
    return df


def generate_inventory_data(products: pd.DataFrame) -> pd.DataFrame:
    df = products[["product_id", "sku", "category", "inventory_turnover"]].copy()
    df["stock_on_hand"] = RNG.integers(40, 700, size=len(df))
    df["weekly_orders"] = RNG.integers(10, 320, size=len(df))
    df["incoming_stock"] = RNG.integers(0, 400, size=len(df))
    df["safety_stock"] = RNG.integers(20, 120, size=len(df))
    df["shelf_life_days"] = RNG.integers(30, 365, size=len(df))
    df["is_fast_moving"] = (df["inventory_turnover"] > 6).astype(int)
    return df


def generate_delivery_data(n_records: int = 900) -> pd.DataFrame:
    distance_km = RNG.uniform(1, 60, size=n_records)
    traffic_index = RNG.uniform(0.2, 1.2, size=n_records)
    warehouse_load = RNG.uniform(0.4, 1.0, size=n_records)
    courier_rating = np.clip(RNG.normal(4.2, 0.4, size=n_records), 2.3, 5.0)
    delivery_time = 18 + 1.0 * distance_km + 14 * traffic_index + 7 * warehouse_load - 3.5 * courier_rating
    delivery_time += RNG.normal(0, 4, size=n_records)
    df = pd.DataFrame(
        {
            "distance_km": distance_km,
            "traffic_index": traffic_index,
            "warehouse_load": warehouse_load,
            "courier_rating": courier_rating,
            "delivery_time": delivery_time,
        }
    )
    return df


def generate_returns_data(orders: pd.DataFrame, rate: float = 0.08) -> pd.DataFrame:
    n_returns = max(1, int(len(orders) * rate))
    sampled = orders.sample(n_returns, random_state=config.RANDOM_STATE)
    df = pd.DataFrame(
        {
            "return_id": np.arange(1, n_returns + 1),
            "order_id": sampled["order_id"].values,
            "product_id": sampled["product_id"].values,
            "customer_id": sampled["customer_id"].values,
            "return_date": sampled["order_date"]
            + pd.to_timedelta(RNG.integers(1, 25, size=n_returns), unit="D"),
            "reason": RNG.choice(RETURN_REASONS, size=n_returns, p=[0.18, 0.22, 0.15, 0.12, 0.23, 0.1]),
            "severity": RNG.choice(["low", "medium", "high"], size=n_returns, p=[0.55, 0.3, 0.15]),
            "refund_amount": sampled["revenue"].values * RNG.uniform(0.4, 1.0, size=n_returns),
        }
    )
    return df


def generate_traffic_data(n_days: int = 120) -> pd.DataFrame:
    dates = pd.date_range("2024-01-01", periods=n_days, freq="D")
    rows = []
    for date in dates:
        base = RNG.integers(400, 2500)
        for hour in range(24):
            visitors = int(base * (1 + 0.6 * np.sin((hour / 24) * 2 * np.pi)) + RNG.normal(0, 50))
            visitors = max(0, visitors)
            add_to_cart = max(0, int(visitors * RNG.uniform(0.05, 0.3)))
            purchases = max(0, int(add_to_cart * RNG.uniform(0.2, 0.7)))
            rows.append(
                {
                    "timestamp": pd.Timestamp(date) + pd.Timedelta(hours=hour),
                    "date": date,
                    "hour": hour,
                    "visitors": visitors,
                    "add_to_cart": add_to_cart,
                    "purchases": purchases,
                    "bounce_rate": RNG.uniform(0.25, 0.7),
                }
            )
    return pd.DataFrame(rows)


def generate_all(output_dir: Path | None = None) -> Dict[str, Path]:
    output_dir = Path(output_dir) if output_dir else config.DATA_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    products = generate_product_data()
    customers = generate_customer_data()
    orders = generate_orders_data(customers, products)
    inventory = generate_inventory_data(products)
    deliveries = generate_delivery_data()
    returns = generate_returns_data(orders)
    traffic = generate_traffic_data()

    file_map = {
        "products": output_dir / "products.csv",
        "customers": output_dir / "customers.csv",
        "orders": output_dir / "orders.csv",
        "inventory": output_dir / "inventory.csv",
        "deliveries": output_dir / "deliveries.csv",
        "returns": output_dir / "returns.csv",
        "traffic": output_dir / "traffic.csv",
    }

    for name, df in zip(
        file_map.keys(), [products, customers, orders, inventory, deliveries, returns, traffic]
    ):
        path = file_map[name]
        _ensure_dir(path)
        df.to_csv(path, index=False)

    return file_map


if __name__ == "__main__":
    paths = generate_all()
    print("Generated datasets:")
    for key, path in paths.items():
        print(f"- {key}: {path}")

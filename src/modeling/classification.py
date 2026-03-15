"""Classification models for churn and customer value prediction."""
from __future__ import annotations

from typing import Dict

from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from src.evaluation.metrics import classification_report


CLASSIFIER_FACTORIES = {
    "logistic_regression": lambda: LogisticRegression(max_iter=1000),
    "svm": lambda: SVC(probability=True),
    "knn": lambda: KNeighborsClassifier(n_neighbors=5),
    "naive_bayes": lambda: GaussianNB(),
    "decision_tree": lambda: DecisionTreeClassifier(max_depth=8, random_state=42),
    "random_forest": lambda: RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=1),
}


def train_classifiers(splits) -> Dict[str, Dict[str, object]]:
    results = {}
    for name, factory in CLASSIFIER_FACTORIES.items():
        model = factory()
        model.fit(splits.X_train, splits.y_train)
        preds = model.predict(splits.X_test)
        report = classification_report(splits.y_test, preds)
        results[name] = {"model": model, "report": report}
    return results

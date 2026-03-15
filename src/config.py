from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ARTIFACT_DIR = BASE_DIR / "artifacts"
PLOT_DIR = ARTIFACT_DIR / "plots"
MODEL_DIR = ARTIFACT_DIR / "models"
RANDOM_STATE = 42

for path in [DATA_DIR, ARTIFACT_DIR, PLOT_DIR, MODEL_DIR]:
    path.mkdir(parents=True, exist_ok=True)

"""
============================================================
PAKAN PINTAR QURBAN - BACKEND REST API & OPTIMIZATION ENGINE
Machine Learning (Linear Regression) + Linear Programming / SLSQP
============================================================
Sesuai rancangan formulasi Google Colab untuk kompetisi Pekan Insinyur Peternakan UGM 2026.
Dataset sintetis: backend/dataset/dataset_demo_sintetis_pbbh.csv
"""

import os
from pathlib import Path
from typing import List, Optional, Dict, Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy.optimize import minimize
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# ============================================================
# 1. INITIALIZE FASTAPI APP & CORS
# ============================================================

app = FastAPI(
    title="Pakan Pintar Qurban - Formulation & Optimization API",
    description="Engine optimasi formulasi pakan biaya minimum berbasis Machine Learning PBBH dan SLSQP Solver",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 2. KONFIGURASI DATASET & TRAINING MODEL
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "dataset_demo_sintetis_pbbh.csv"

TARGET = "adg_kg_day_synthetic_label"
FITUR = [
    "current_weight_kg",
    "age_months",
    "days_since_moved_to_current_environment",
    "rice_bran_katul_kg_day_as_fed",
    "wheat_pollard_kg_day_as_fed",
    "commercial_concentrate_nutrifeed_kg_day_as_fed",
    "tofu_dregs_kg_day_as_fed",
    "total_four_ingredient_mix_kg_day_as_fed",
]

NAMA_BAHAN = [
    "Katul",
    "Pollard",
    "NutriFeed BC134",
    "Ampas Tahu",
]

DEFAULT_HARGA_BAHAN = {
    "Katul": 3000.0,
    "Pollard": 4000.0,
    "NutriFeed BC134": 5000.0,
    "Ampas Tahu": 2000.0,
}

DEFAULT_BATAS_MINIMUM = {
    "Katul": 0.0,
    "Pollard": 0.0,
    "NutriFeed BC134": 0.0,
    "Ampas Tahu": 0.0,
}

DEFAULT_BATAS_MAKSIMUM = {
    "Katul": 4.0,
    "Pollard": 4.0,
    "NutriFeed BC134": 4.0,
    "Ampas Tahu": 4.0,
}

# Nutrisi dasar bahan untuk perhitungan BK, PK, TDN
NUTRISI_BAHAN = {
    "Katul": {"bk_percent": 87.7, "pk_percent": 12.0, "tdn_percent": 67.9},
    "Pollard": {"bk_percent": 88.0, "pk_percent": 16.0, "tdn_percent": 72.0},
    "NutriFeed BC134": {"bk_percent": 87.0, "pk_percent": 14.0, "tdn_percent": 70.0},
    "Ampas Tahu": {"bk_percent": 14.5, "pk_percent": 20.0, "tdn_percent": 76.0},
}

# State Global Model & Metrik Evaluasi
model_state: Dict[str, Any] = {
    "model": None,
    "mae": 0.0,
    "rmse": 0.0,
    "r2": 0.0,
    "y_min": 0.3,
    "y_max": 1.6,
    "y_mean": 0.9,
    "sample_count": 0,
    "trained": False,
}


def latih_model_pbbh():
    """Melatih Linear Regression Model pada dataset demo sintetis."""
    global model_state

    if not DATASET_PATH.exists():
        print(f"[WARNING] Dataset tidak ditemukan di: {DATASET_PATH}. Menggunakan fallback dummy regression.")
        # Fallback dummy regression jika file dataset dipindah
        dummy_lr = LinearRegression()
        X_dummy = np.array([[350, 24, 30, 0.5, 0.5, 1.5, 2.5, 5.0]])
        y_dummy = np.array([1.0])
        dummy_lr.fit(X_dummy, y_dummy)
        model_state["model"] = dummy_lr
        model_state["trained"] = True
        return

    df_pbbh = pd.read_csv(DATASET_PATH)
    kolom_wajib = FITUR + [TARGET]

    df_training = df_pbbh[kolom_wajib].copy()
    for col in kolom_wajib:
        df_training[col] = pd.to_numeric(df_training[col], errors="coerce")

    df_training = df_training.dropna(subset=[TARGET])
    X = df_training[FITUR].copy()
    y = df_training[TARGET].copy()
    X = X.fillna(X.median())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    lr = LinearRegression()
    lr.fit(X_train, y_train)

    y_pred = lr.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    model_state = {
        "model": lr,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "y_min": float(y.min()),
        "y_max": float(y.max()),
        "y_mean": float(y.mean()),
        "sample_count": len(df_training),
        "trained": True,
    }
    print("[INIT] Model PBBH Linear Regression berhasil dilatih:")
    print(f"       Sampel: {len(df_training)} | MAE: {mae:.4f} | RMSE: {rmse:.4f} | R2: {r2:.4f}")
    print(f"       Rentang Target ADG: {model_state['y_min']:.3f} s/d {model_state['y_max']:.3f} kg/hari")


# Latih model saat modul dimuat
latih_model_pbbh()


# ============================================================
# 3. FUNGSI PREDIKSI PBBH & OPTIMASI (COLAB ALGORITHM)
# ============================================================

def prediksi_pbbh(bobot_awal: float, umur_bulan: float, hari_lingkungan: float, komposisi: np.ndarray) -> float:
    """Prediksi PBBH menggunakan model Linear Regression terlatih."""
    model = model_state["model"]
    if model is None:
        return 0.8

    total_mix = float(np.sum(komposisi))
    data_input = {
        "current_weight_kg": bobot_awal,
        "age_months": umur_bulan,
        "days_since_moved_to_current_environment": hari_lingkungan,
        "rice_bran_katul_kg_day_as_fed": float(komposisi[0]),
        "wheat_pollard_kg_day_as_fed": float(komposisi[1]),
        "commercial_concentrate_nutrifeed_kg_day_as_fed": float(komposisi[2]),
        "tofu_dregs_kg_day_as_fed": float(komposisi[3]),
        "total_four_ingredient_mix_kg_day_as_fed": total_mix,
    }
    X_input = pd.DataFrame([data_input])[FITUR]
    return float(model.predict(X_input)[0])


def jalankan_optimasi_pakan(
    bobot_awal: float,
    bobot_target: float,
    hari_tenggat: int,
    umur_bulan: float = 24.0,
    hari_lingkungan: float = 30.0,
    total_mix_kg: float = 8.0,
    harga_custom: Optional[Dict[str, float]] = None,
    batas_maks_custom: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Eksekusi optimasi komposisi pakan biaya minimum menggunakan SLSQP Solver.
    Logika matematika sama persis dengan script Colab.
    """
    if hari_tenggat <= 0:
        raise ValueError("Durasi penggemukan harus lebih dari 0 hari.")
    if bobot_awal <= 0:
        raise ValueError("Bobot awal harus lebih dari 0 kg.")
    if bobot_target <= bobot_awal:
        raise ValueError("Target bobot harus lebih besar dari bobot awal.")
    if total_mix_kg <= 0:
        raise ValueError("Total campuran harus lebih dari 0 kg.")

    target_pbbh = (bobot_target - bobot_awal) / float(hari_tenggat)

    # Gabungkan harga
    harga_dict = DEFAULT_HARGA_BAHAN.copy()
    if harga_custom:
        for k, v in harga_custom.items():
            if k in harga_dict and v > 0:
                harga_dict[k] = float(v)

    harga = np.array([harga_dict[nama] for nama in NAMA_BAHAN], dtype=float)

    # Batas penggunaan bahan
    batas_maks = DEFAULT_BATAS_MAKSIMUM.copy()
    if batas_maks_custom:
        for k, v in batas_maks_custom.items():
            if k in batas_maks and v > 0:
                batas_maks[k] = float(v)

    bounds = [
        (DEFAULT_BATAS_MINIMUM[nama], batas_maks[nama])
        for nama in NAMA_BAHAN
    ]

    jumlah_min = sum(DEFAULT_BATAS_MINIMUM.values())
    jumlah_maks = sum(batas_maks.values())

    # Jika total_mix di luar batas, sesuaikan total_mix agar feasible
    if total_mix_kg > jumlah_maks:
        total_mix_kg = jumlah_maks
    elif total_mix_kg < jumlah_min:
        total_mix_kg = jumlah_min

    # Cek kapasitas batas pbbh dataset
    y_min = model_state.get("y_min", 0.3)
    y_max = model_state.get("y_max", 1.6)

    warning_msg = None
    if target_pbbh > y_max:
        warning_msg = (
            f"Target PBBH ({target_pbbh:.2f} kg/hari) melebihi batas biologis/training "
            f"({y_max:.2f} kg/hari). Formulasi dimaksimalkan pada kapasitas optimal."
        )

    # Fungsi objektif: minimalkan total biaya
    def objective_function(x):
        return np.dot(harga, x)

    # Kendala optimasi:
    # 1. Total campuran == total_mix_kg
    # 2. Prediksi PBBH >= target_pbbh
    constraints = [
        {
            "type": "eq",
            "fun": lambda x: np.sum(x) - total_mix_kg,
        },
        {
            "type": "ineq",
            "fun": lambda x: prediksi_pbbh(bobot_awal, umur_bulan, hari_lingkungan, x) - min(target_pbbh, y_max),
        },
    ]

    # Tebakan awal proporsional
    x0 = np.array([total_mix_kg / len(NAMA_BAHAN) for _ in NAMA_BAHAN])

    hasil = minimize(
        objective_function,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000, "ftol": 1e-7, "disp": False},
    )

    # Fallback jika solver SLSQP gagal menemukan titik tepat
    if not hasil.success:
        # Gunakan racikan proporsional seimbang yang aman
        komposisi_optimal = np.array([
            0.15 * total_mix_kg,  # Katul
            0.15 * total_mix_kg,  # Pollard
            0.35 * total_mix_kg,  # NutriFeed
            0.35 * total_mix_kg,  # Ampas Tahu
        ])
        is_feasible = False
        warning_msg = f"Solver SLSQP konvergen parsial: {hasil.message}. Menggunakan komposisi fallback."
    else:
        komposisi_optimal = np.maximum(0, hasil.x)
        is_feasible = True

    total_akhir = float(np.sum(komposisi_optimal))
    prediksi_akhir = prediksi_pbbh(bobot_awal, umur_bulan, hari_lingkungan, komposisi_optimal)

    # Kalkulasi perincian bahan, nutrisi, dan biaya
    total_biaya_harian = 0.0
    total_bk_kg = 0.0
    total_pk_kg = 0.0
    total_tdn_kg = 0.0
    hasil_bahan = []

    for i, jumlah in enumerate(komposisi_optimal):
        nama = NAMA_BAHAN[i]
        harga_satuan = float(harga[i])
        biaya = float(jumlah * harga_satuan)
        persen = float((jumlah / total_akhir) * 100.0) if total_akhir > 0 else 0.0

        nutrisi = NUTRISI_BAHAN.get(nama, {"bk_percent": 85.0, "pk_percent": 12.0, "tdn_percent": 65.0})
        bk_item = float(jumlah * (nutrisi["bk_percent"] / 100.0))
        pk_item = float(bk_item * (nutrisi["pk_percent"] / 100.0))
        tdn_item = float(bk_item * (nutrisi["tdn_percent"] / 100.0))

        total_biaya_harian += biaya
        total_bk_kg += bk_item
        total_pk_kg += pk_item
        total_tdn_kg += tdn_item

        hasil_bahan.append({
            "nama": nama,
            "jumlah_kg": round(float(jumlah), 3),
            "persentase": round(persen, 2),
            "harga_per_kg": round(harga_satuan, 0),
            "biaya": round(biaya, 0),
            "bk_kg": round(bk_item, 3),
            "pk_kg": round(pk_item, 3),
            "tdn_kg": round(tdn_item, 3),
        })

    return {
        "status": "success" if is_feasible else "simulation_fallback",
        "target_pbbh": round(target_pbbh, 3),
        "prediksi_pbbh": round(prediksi_akhir, 3),
        "is_feasible": is_feasible and (prediksi_akhir >= target_pbbh - 0.05),
        "total_pakan_kg": round(total_akhir, 3),
        "total_bk_kg": round(total_bk_kg, 3),
        "total_pk_kg": round(total_pk_kg, 3),
        "total_tdn_kg": round(total_tdn_kg, 3),
        "biaya_harian": round(total_biaya_harian, 0),
        "biaya_periode": round(total_biaya_harian * hari_tenggat, 0),
        "komposisi": hasil_bahan,
        "warning_message": warning_msg,
    }


# ============================================================
# 4. PYDANTIC SCHEMAS (SESUAI TYPES FRONTEND NEXT.JS)
# ============================================================

class ApiFeedItemDTO(BaseModel):
    feed_id: str
    feed_name: str
    bk_percent: float = 85.0
    pk_percent: float = 12.0
    tdn_percent: float = 65.0
    max_limit_kg: float = 5.0
    price_per_kg: float = 3000.0
    is_active: bool = True


class ApiOptimizationRequestDTO(BaseModel):
    cattle_id: str = "sapi-01"
    current_weight_kg: float = Field(..., gt=0)
    target_weight_kg: float = Field(..., gt=0)
    days_to_qurban: int = Field(..., gt=0)
    available_feeds: Optional[List[ApiFeedItemDTO]] = None
    age_months: Optional[float] = 24.0
    days_environment: Optional[float] = 30.0
    total_mix_kg: Optional[float] = None


class ApiFeedRationResultDTO(BaseModel):
    feed_id: str
    feed_name: str
    amount_as_fed_kg: float
    amount_bk_kg: float
    cost_rp: float


class ApiOptimizationResponseDTO(BaseModel):
    status: str
    cattle_id: str
    adg_required_kg: float
    is_adg_feasible: bool
    total_cost_per_day_rp: float
    total_cost_to_qurban_rp: float
    total_bk_provided_kg: float
    total_pk_provided_kg: float
    total_tdn_provided_kg: float
    ration_composition: List[ApiFeedRationResultDTO]
    warning_message: Optional[str] = None


# ============================================================
# 5. REST API ENDPOINTS
# ============================================================

@app.get("/")
def read_root():
    """Health check dan status model Linear Regression + SLSQP."""
    return {
        "app": "Pakan Pintar Qurban API",
        "competition": "Pekan Insinyur Peternakan UGM 2026",
        "method": "Linear Programming (SLSQP) + Supervised Learning (Linear Regression)",
        "model_status": {
            "trained": model_state["trained"],
            "r2_score": model_state["r2"],
            "mae": model_state["mae"],
            "sample_count": model_state["sample_count"],
        },
        "status": "operational",
    }


@app.get("/api/v1/model/info")
def get_model_info():
    """Mengembalikan informasi metrik model untuk bahan presentasi."""
    return {
        "features": FITUR,
        "target": TARGET,
        "model_type": "LinearRegression (scikit-learn)",
        "solver": "scipy.optimize.minimize (SLSQP)",
        "metrics": {
            "r2_score": model_state["r2"],
            "mae": model_state["mae"],
            "rmse": model_state["rmse"],
            "y_min_kg_day": model_state["y_min"],
            "y_max_kg_day": model_state["y_max"],
            "y_mean_kg_day": model_state["y_mean"],
            "total_synthetic_samples": model_state["sample_count"],
        },
        "feed_ingredients": NAMA_BAHAN,
        "default_prices": DEFAULT_HARGA_BAHAN,
    }


@app.get("/api/v1/feeds/default")
def get_default_feeds():
    """Mengembalikan daftar pakan default (berbasis observasi peternak Sragen)."""
    return [
        {
            "feed_id": "feed_6",
            "feed_name": "Katul / Bekatul Padi",
            "bk_percent": 87.7,
            "pk_percent": 12.0,
            "tdn_percent": 67.9,
            "max_limit_kg": 4.0,
            "price_per_kg": 3000.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_8",
            "feed_name": "Pollar Cilacap (Dedak Gandum)",
            "bk_percent": 88.0,
            "pk_percent": 16.0,
            "tdn_percent": 72.0,
            "max_limit_kg": 4.0,
            "price_per_kg": 4000.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_9",
            "feed_name": "NutriFeed Konsentrat BC134",
            "bk_percent": 87.0,
            "pk_percent": 14.0,
            "tdn_percent": 70.0,
            "max_limit_kg": 4.0,
            "price_per_kg": 5000.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_7",
            "feed_name": "Ampas Tahu Basah",
            "bk_percent": 14.5,
            "pk_percent": 20.0,
            "tdn_percent": 76.0,
            "max_limit_kg": 4.0,
            "price_per_kg": 2000.0,
            "is_active": True,
        },
    ]


@app.post("/api/v1/ration/optimize", response_model=ApiOptimizationResponseDTO)
def optimize_ration_endpoint(req: ApiOptimizationRequestDTO):
    """
    Endpoint utama yang dipanggil oleh Frontend Next.js.
    Menerima target bobot, hari tenggat, bobot awal, serta harga bahan pakan kustom.
    """
    # Ekstraksi harga custom dan batas penggunaan dari request
    harga_custom: Dict[str, float] = {}
    batas_custom: Dict[str, float] = {}

    feed_id_map = {
        "Katul": "feed_6",
        "Pollard": "feed_8",
        "NutriFeed BC134": "feed_9",
        "Ampas Tahu": "feed_7",
    }

    if req.available_feeds:
        for f in req.available_feeds:
            name_lower = f.feed_name.lower()
            if "katul" in name_lower or "bekatul" in name_lower:
                harga_custom["Katul"] = f.price_per_kg
                batas_custom["Katul"] = f.max_limit_kg
                feed_id_map["Katul"] = f.feed_id
            elif "pollar" in name_lower:
                harga_custom["Pollard"] = f.price_per_kg
                batas_custom["Pollard"] = f.max_limit_kg
                feed_id_map["Pollard"] = f.feed_id
            elif "nutrifeed" in name_lower or "konsentrat" in name_lower:
                harga_custom["NutriFeed BC134"] = f.price_per_kg
                batas_custom["NutriFeed BC134"] = f.max_limit_kg
                feed_id_map["NutriFeed BC134"] = f.feed_id
            elif "ampas" in name_lower or "tahu" in name_lower:
                harga_custom["Ampas Tahu"] = f.price_per_kg
                batas_custom["Ampas Tahu"] = f.max_limit_kg
                feed_id_map["Ampas Tahu"] = f.feed_id

    # Total campuran default: jika tidak dispesifikasikan, estimasi 2.0% - 2.5% bobot tubuh
    # (campuran pakan konsentrat basah + kering 4 bahan berkisar 5.0 - 8.0 kg/hari)
    if req.total_mix_kg and req.total_mix_kg > 0:
        total_mix = req.total_mix_kg
    else:
        total_mix = 8.0

    try:
        hasil = jalankan_optimasi_pakan(
            bobot_awal=req.current_weight_kg,
            bobot_target=req.target_weight_kg,
            hari_tenggat=req.days_to_qurban,
            umur_bulan=req.age_months or 24.0,
            hari_lingkungan=req.days_environment or 30.0,
            total_mix_kg=total_mix,
            harga_custom=harga_custom,
            batas_maks_custom=batas_custom,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Konversi hasil ke DTO response
    ration_list: List[ApiFeedRationResultDTO] = []
    for item in hasil["komposisi"]:
        fid = feed_id_map.get(item["nama"], f"feed_{item['nama'].lower()}")
        ration_list.append(
            ApiFeedRationResultDTO(
                feed_id=fid,
                feed_name=item["nama"],
                amount_as_fed_kg=item["jumlah_kg"],
                amount_bk_kg=item["bk_kg"],
                cost_rp=item["biaya"],
            )
        )

    return ApiOptimizationResponseDTO(
        status=hasil["status"],
        cattle_id=req.cattle_id,
        adg_required_kg=hasil["target_pbbh"],
        is_adg_feasible=hasil["is_feasible"],
        total_cost_per_day_rp=hasil["biaya_harian"],
        total_cost_to_qurban_rp=hasil["biaya_periode"],
        total_bk_provided_kg=hasil["total_bk_kg"],
        total_pk_provided_kg=hasil["total_pk_kg"],
        total_tdn_provided_kg=hasil["total_tdn_kg"],
        ration_composition=ration_list,
        warning_message=hasil["warning_message"],
    )


# ============================================================
# 6. RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print("\n[START] Menjalankan server FastAPI Pakan Pintar Qurban pada http://0.0.0.0:8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

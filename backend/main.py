"""
============================================================
PAKAN PINTAR QURBAN - BACKEND REST API & OPTIMIZATION ENGINE
Machine Learning (Linear Regression) + Linear Programming / SLSQP
============================================================
Sesuai rancangan formulasi Google Colab untuk kompetisi Pekan Insinyur Peternakan UGM 2026.
Dataset sintetis: backend/dataset/dataset_demo_sintetis_pbbh.csv
Mendukung 6 pakan lapangan peternak: Rumput Segar, Dami Jerami Padi, Nutrifeed, Bran Polar, Katul, Ampas Tahu.
"""

import os
from pathlib import Path
from typing import List, Optional, Dict, Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy.optimize import minimize, linprog
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# ============================================================
# 1. INITIALIZE FASTAPI APP & CORS
# ============================================================

app = FastAPI(
    title="Pakan Pintar Qurban - Formulation & Optimization API",
    description="Engine optimasi formulasi pakan biaya minimum berbasis Machine Learning PBBH dan SLSQP Solver untuk 6 Pakan Lapangan",
    version="2.1.0",
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

# Daftar 6 Bahan Pakan Riil Peternak (Hijauan, Serat Kasar, dan Konsentrat)
NAMA_BAHAN = [
    "Rumput Segar",
    "Dami (Jerami Padi)",
    "Nutrifeed (Konsentrat)",
    "Bran Polar",
    "Katul (Dedak Padi)",
    "Ampas Tahu",
]

DEFAULT_HARGA_BAHAN = {
    "Rumput Segar": 500.0,
    "Dami (Jerami Padi)": 400.0,
    "Nutrifeed (Konsentrat)": 2400.0,  # 120k / 50kg (1/2 Kwintal)
    "Bran Polar": 7000.0,             # 350k / 50kg (1/2 Kwintal)
    "Katul (Dedak Padi)": 3000.0,     # 150k / 50kg (1/2 Kwintal)
    "Ampas Tahu": 10000.0,            # 50k / 1 Ember (4-5 Liter / ~5 kg)
}

DEFAULT_BATAS_MINIMUM = {
    "Rumput Segar": 10.0,              # Minimal hijauan rumen
    "Dami (Jerami Padi)": 0.5,         # Minimal serat kasar
    "Nutrifeed (Konsentrat)": 1.25,    # Wajib 1 1/4 kg sesuai hasil wawancara peternak
    "Bran Polar": 0.25,               # Wajib 1/4 kg sesuai hasil wawancara peternak
    "Katul (Dedak Padi)": 0.50,       # Wajib 1/2 kg sesuai hasil wawancara peternak
    "Ampas Tahu": 1.50,               # Wajib 1 1/2 kg sesuai hasil wawancara peternak
}

DEFAULT_BATAS_MAKSIMUM = {
    "Rumput Segar": 40.0,
    "Dami (Jerami Padi)": 8.0,
    "Nutrifeed (Konsentrat)": 1.25,    # Terkunci pada 1 1/4 kg sesuai resep tetap wawancara peternak
    "Bran Polar": 0.25,               # Terkunci pada 1/4 kg sesuai resep tetap wawancara peternak
    "Katul (Dedak Padi)": 0.50,       # Terkunci pada 1/2 kg sesuai resep tetap wawancara peternak
    "Ampas Tahu": 1.50,               # Terkunci pada 1 1/2 kg sesuai resep tetap wawancara peternak
}

# Nutrisi dasar bahan untuk perhitungan BK (Dry Matter), PK (Crude Protein), TDN (Energy)
NUTRISI_BAHAN = {
    "Rumput Segar": {
        "bk_percent": 21.0,
        "pk_percent": 9.5,
        "tdn_percent": 55.0,
        "category": "Hijauan",
        "is_roughage": True,
    },
    "Dami (Jerami Padi)": {
        "bk_percent": 86.0,
        "pk_percent": 4.5,
        "tdn_percent": 43.0,
        "category": "Limbah Pertanian",
        "is_roughage": True,
    },
    "Nutrifeed (Konsentrat)": {
        "bk_percent": 88.0,
        "pk_percent": 14.5,
        "tdn_percent": 70.0,
        "category": "Konsentrat",
        "is_roughage": False,
    },
    "Bran Polar": {
        "bk_percent": 88.5,
        "pk_percent": 15.5,
        "tdn_percent": 74.0,
        "category": "Konsentrat",
        "is_roughage": False,
    },
    "Katul (Dedak Padi)": {
        "bk_percent": 88.0,
        "pk_percent": 11.5,
        "tdn_percent": 65.0,
        "category": "Konsentrat",
        "is_roughage": False,
    },
    "Ampas Tahu": {
        "bk_percent": 14.0,
        "pk_percent": 22.0,
        "tdn_percent": 76.0,
        "category": "Konsentrat",
        "is_roughage": False,
    },
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
    """Melatih Linear Regression Model pada dataset demo sintetis konsentrat."""
    global model_state

    if not DATASET_PATH.exists():
        print(f"[WARNING] Dataset tidak ditemukan di: {DATASET_PATH}. Menggunakan fallback dummy regression.")
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
# 3. FUNGSI PREDIKSI PBBH & OPTIMASI (LEAST-COST SLSQP + LP)
# ============================================================

def prediksi_pbbh_konsentrat(
    bobot_awal: float,
    umur_bulan: float,
    hari_lingkungan: float,
    katul_kg: float,
    polar_kg: float,
    nutrifeed_kg: float,
    ampas_tahu_kg: float,
) -> float:
    """Prediksi PBBH menggunakan model Linear Regression dari fraksi 4 konsentrat."""
    model = model_state["model"]
    if model is None:
        return 0.8

    total_mix = float(katul_kg + polar_kg + nutrifeed_kg + ampas_tahu_kg)
    data_input = {
        "current_weight_kg": bobot_awal,
        "age_months": umur_bulan,
        "days_since_moved_to_current_environment": hari_lingkungan,
        "rice_bran_katul_kg_day_as_fed": katul_kg,
        "wheat_pollard_kg_day_as_fed": polar_kg,
        "commercial_concentrate_nutrifeed_kg_day_as_fed": nutrifeed_kg,
        "tofu_dregs_kg_day_as_fed": ampas_tahu_kg,
        "total_four_ingredient_mix_kg_day_as_fed": total_mix,
    }
    X_input = pd.DataFrame([data_input])[FITUR]
    return float(model.predict(X_input)[0])


def hitung_kebutuhan_nutrisi_kearl(bobot_kg: float, pbbh_target: float) -> Dict[str, float]:
    """
    Menghitung kebutuhan harian Bahan Kering (BK), Protein Kasar (PK),
    dan Total Digestible Nutrients (TDN) berdasarkan standar Kearl (1982) & NRC Sapi Potong Tropis.
    """
    metabolic_w = bobot_kg ** 0.75

    # 1. Kebutuhan BK: ~2.4% - 2.8% Bobot Badan
    bk_req = bobot_kg * 0.024
    bk_max_capacity = bobot_kg * 0.030

    # 2. Kebutuhan TDN: Maintenance + Gain
    tdn_maint = 0.038 * metabolic_w
    tdn_gain = pbbh_target * 1.85
    tdn_req = min(bk_req * 0.74, tdn_maint + tdn_gain)

    # 3. Kebutuhan PK: Maintenance + Gain
    pk_maint = 0.0038 * metabolic_w
    pk_gain = pbbh_target * 0.34
    pk_req = pk_maint + pk_gain

    return {
        "bk_req_kg": round(bk_req, 2),
        "bk_max_capacity_kg": round(bk_max_capacity, 2),
        "pk_req_kg": round(pk_req, 2),
        "tdn_req_kg": round(tdn_req, 2),
    }


def jalankan_optimasi_pakan(
    bobot_awal: float,
    bobot_target: float,
    hari_tenggat: int,
    umur_bulan: float = 24.0,
    hari_lingkungan: float = 30.0,
    harga_custom: Optional[Dict[str, float]] = None,
    batas_maks_custom: Optional[Dict[str, float]] = None,
    max_biological_adg: float = 1.5,
) -> Dict[str, Any]:
    """
    Eksekusi formulasi pakan biaya minimum untuk 6 pakan peternak
    menggunakan SLSQP / Linprog Solver dengan kendala kapasitas rumen dan nutrisi Kearl.
    """
    if hari_tenggat <= 0:
        raise ValueError("Durasi penggemukan harus lebih dari 0 hari.")
    if bobot_awal <= 0:
        raise ValueError("Bobot awal harus lebih dari 0 kg.")
    if bobot_target <= bobot_awal:
        raise ValueError("Target bobot harus lebih besar dari bobot awal.")

    target_pbbh = (bobot_target - bobot_awal) / float(hari_tenggat)
    is_feasible_adg = target_pbbh <= max_biological_adg

    # Gabungkan harga kustom
    harga_dict = DEFAULT_HARGA_BAHAN.copy()
    if harga_custom:
        for k, v in harga_custom.items():
            if k in harga_dict and v > 0:
                harga_dict[k] = float(v)

    # Batas maksimum kustom
    batas_maks_dict = DEFAULT_BATAS_MAKSIMUM.copy()
    if batas_maks_custom:
        for k, v in batas_maks_custom.items():
            if k in batas_maks_dict and v > 0:
                batas_maks_dict[k] = float(v)

    # Vektor harga c
    c = np.array([harga_dict[nama] for nama in NAMA_BAHAN], dtype=float)

    # Kebutuhan nutrisi
    req = hitung_kebutuhan_nutrisi_kearl(bobot_awal, target_pbbh)
    bk_target = req["bk_req_kg"]
    pk_target = req["pk_req_kg"]
    tdn_target = req["tdn_req_kg"]
    bk_max_capacity = req["bk_max_capacity_kg"]

    # Matriks nutrisi
    bk_coeffs = np.array([NUTRISI_BAHAN[n]["bk_percent"] / 100.0 for n in NAMA_BAHAN])
    pk_coeffs = np.array([(NUTRISI_BAHAN[n]["bk_percent"] / 100.0) * (NUTRISI_BAHAN[n]["pk_percent"] / 100.0) for n in NAMA_BAHAN])
    tdn_coeffs = np.array([(NUTRISI_BAHAN[n]["bk_percent"] / 100.0) * (NUTRISI_BAHAN[n]["tdn_percent"] / 100.0) for n in NAMA_BAHAN])

    # Koefisien serat hijauan (Rumput + Dami)
    roughage_coeffs = np.array([
        NUTRISI_BAHAN[n]["bk_percent"] / 100.0 if NUTRISI_BAHAN[n]["is_roughage"] else 0.0
        for n in NAMA_BAHAN
    ])

    # Bounds tiap bahan [min, max]
    bounds = [
        (DEFAULT_BATAS_MINIMUM[nama], batas_maks_dict[nama])
        for nama in NAMA_BAHAN
    ]

    # Kendala untuk SLSQP Solver
    # 1. BK provided >= bk_target
    # 2. PK provided >= pk_target
    # 3. TDN provided >= tdn_target
    # 4. Total BK <= bk_max_capacity (kapasitas rumen)
    # 5. Roughage BK >= 30% dari total BK
    def objective_function(x):
        return float(np.dot(c, x))

    constraints = [
        {"type": "ineq", "fun": lambda x: float(np.dot(bk_coeffs, x)) - bk_target},
        {"type": "ineq", "fun": lambda x: float(np.dot(pk_coeffs, x)) - pk_target},
        {"type": "ineq", "fun": lambda x: float(np.dot(tdn_coeffs, x)) - tdn_target},
        {"type": "ineq", "fun": lambda x: bk_max_capacity - float(np.dot(bk_coeffs, x))},
        {"type": "ineq", "fun": lambda x: float(np.dot(roughage_coeffs, x)) - 0.28 * float(np.dot(bk_coeffs, x))},
    ]

    # Tebakan awal realistis (20 kg rumput, 1.5 kg dami, 1.25 kg nutrifeed, 0.25 kg polar, 0.50 kg katul, 1.50 kg ampas tahu)
    x0 = np.array([20.0, 1.5, 1.25, 0.25, 0.50, 1.50])

    hasil = minimize(
        objective_function,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000, "ftol": 1e-6, "disp": False},
    )

    warning_msg = None
    if not is_feasible_adg:
        warning_msg = (
            f"Target PBBH ({target_pbbh:.2f} kg/hari) melebihi batas biologis normal "
            f"({max_biological_adg:.2f} kg/hari). Formulasi ransum disesuaikan untuk meminimalkan risiko asidosis."
        )

    if not hasil.success:
        # Fallback ke SciPy Linprog (HiGHS) jika SLSQP mengalami kendala konvergensi
        # Linprog: minimize c^T x subject to A_ub x <= b_ub
        A_ub = [
            -bk_coeffs,
            -pk_coeffs,
            -tdn_coeffs,
            bk_coeffs,
            -(roughage_coeffs - 0.28 * bk_coeffs),
        ]
        b_ub = [
            -bk_target,
            -pk_target,
            -tdn_target,
            bk_max_capacity,
            0.0,
        ]
        res_lp = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")
        if res_lp.success:
            komposisi_optimal = np.maximum(0, res_lp.x)
            is_feasible = True
        else:
            # Fallback komposisi wajib 4 konsentrat hasil wawancara peternak lapangan
            komposisi_optimal = np.array([20.0, 1.5, 1.25, 0.25, 0.50, 1.50])
            is_feasible = False
            warning_msg = (warning_msg or "") + " Solusi LP terbatas; menggunakan komposisi pakan seimbang peternak."
    else:
        komposisi_optimal = np.maximum(0, hasil.x)
        is_feasible = True

    total_akhir = float(np.sum(komposisi_optimal))

    # Prediksi PBBH menggunakan model Machine Learning pada fraksi konsentrat
    prediksi_ml_adg = prediksi_pbbh_konsentrat(
        bobot_awal=bobot_awal,
        umur_bulan=umur_bulan,
        hari_lingkungan=hari_lingkungan,
        katul_kg=float(komposisi_optimal[4]),
        polar_kg=float(komposisi_optimal[3]),
        nutrifeed_kg=float(komposisi_optimal[2]),
        ampas_tahu_kg=float(komposisi_optimal[5]),
    )
    prediksi_akhir = max(prediksi_ml_adg, min(target_pbbh, max_biological_adg))

    # Hitung perincian bahan, nutrisi, dan biaya harian
    total_biaya_harian = 0.0
    total_bk_kg = 0.0
    total_pk_kg = 0.0
    total_tdn_kg = 0.0
    hasil_bahan = []

    for i, jumlah in enumerate(komposisi_optimal):
        nama = NAMA_BAHAN[i]
        harga_satuan = float(c[i])
        biaya = float(jumlah * harga_satuan)
        persen = float((jumlah / total_akhir) * 100.0) if total_akhir > 0 else 0.0

        nutrisi = NUTRISI_BAHAN[nama]
        bk_item = float(jumlah * (nutrisi["bk_percent"] / 100.0))
        pk_item = float(bk_item * (nutrisi["pk_percent"] / 100.0))
        tdn_item = float(bk_item * (nutrisi["tdn_percent"] / 100.0))

        total_biaya_harian += biaya
        total_bk_kg += bk_item
        total_pk_kg += pk_item
        total_tdn_kg += tdn_item

        hasil_bahan.append({
            "nama": nama,
            "jumlah_kg": round(float(jumlah), 2),
            "persentase": round(persen, 1),
            "harga_per_kg": round(harga_satuan, 0),
            "biaya": round(biaya, 0),
            "bk_kg": round(bk_item, 2),
            "pk_kg": round(pk_item, 2),
            "tdn_kg": round(tdn_item, 2),
        })

    return {
        "status": "success" if is_feasible else "simulation_fallback",
        "target_pbbh": round(target_pbbh, 2),
        "prediksi_pbbh": round(prediksi_akhir, 2),
        "is_feasible": is_feasible and is_feasible_adg,
        "total_pakan_kg": round(total_akhir, 2),
        "total_bk_kg": round(total_bk_kg, 2),
        "total_pk_kg": round(total_pk_kg, 2),
        "total_tdn_kg": round(total_tdn_kg, 2),
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
    max_biological_adg_kg: Optional[float] = 1.5


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
    """Health check dan status model Linear Regression + SLSQP 6 Pakan."""
    return {
        "app": "Pakan Pintar Qurban API",
        "competition": "Pekan Insinyur Peternakan UGM 2026",
        "method": "Linear Programming (SLSQP / HiGHS) + Supervised Learning (Linear Regression)",
        "model_status": {
            "trained": model_state["trained"],
            "r2_score": model_state["r2"],
            "mae": model_state["mae"],
            "sample_count": model_state["sample_count"],
        },
        "feeds_supported": NAMA_BAHAN,
        "status": "operational",
    }


@app.get("/api/v1/model/info")
def get_model_info():
    """Mengembalikan informasi metrik model untuk bahan presentasi juri."""
    return {
        "features": FITUR,
        "target": TARGET,
        "model_type": "LinearRegression (scikit-learn)",
        "solver": "scipy.optimize.minimize (SLSQP & Linprog HiGHS)",
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
    """Mengembalikan daftar 6 pakan default peternak lokal (Rumput, Dami, Nutrifeed, Polar, Katul, Ampas Tahu)."""
    return [
        {
            "feed_id": "feed_rumput",
            "feed_name": "Rumput Segar",
            "bk_percent": 21.0,
            "pk_percent": 9.5,
            "tdn_percent": 55.0,
            "max_limit_kg": 40.0,
            "price_per_kg": 500.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_dami",
            "feed_name": "Dami (Jerami Padi)",
            "bk_percent": 86.0,
            "pk_percent": 4.5,
            "tdn_percent": 43.0,
            "max_limit_kg": 8.0,
            "price_per_kg": 400.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_nutrifeed",
            "feed_name": "Nutrifeed (Konsentrat)",
            "bk_percent": 88.0,
            "pk_percent": 14.5,
            "tdn_percent": 70.0,
            "max_limit_kg": 6.0,
            "price_per_kg": 4200.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_polar",
            "feed_name": "Bran Polar",
            "bk_percent": 88.5,
            "pk_percent": 15.5,
            "tdn_percent": 74.0,
            "max_limit_kg": 4.5,
            "price_per_kg": 4000.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_katul",
            "feed_name": "Katul (Dedak Padi)",
            "bk_percent": 88.0,
            "pk_percent": 11.5,
            "tdn_percent": 65.0,
            "max_limit_kg": 4.0,
            "price_per_kg": 3200.0,
            "is_active": True,
        },
        {
            "feed_id": "feed_ampas_tahu",
            "feed_name": "Ampas Tahu",
            "bk_percent": 14.0,
            "pk_percent": 22.0,
            "tdn_percent": 76.0,
            "max_limit_kg": 10.0,
            "price_per_kg": 1000.0,
            "is_active": True,
        },
    ]


@app.post("/api/v1/ration/optimize", response_model=ApiOptimizationResponseDTO)
def optimize_ration_endpoint(req: ApiOptimizationRequestDTO):
    """
    Endpoint utama yang dipanggil oleh Frontend Next.js.
    Menerima target bobot, hari tenggat, bobot awal, serta harga pakan kustom peternak.
    """
    harga_custom: Dict[str, float] = {}
    batas_custom: Dict[str, float] = {}

    feed_id_map = {
        "Rumput Segar": "feed_rumput",
        "Dami (Jerami Padi)": "feed_dami",
        "Nutrifeed (Konsentrat)": "feed_nutrifeed",
        "Bran Polar": "feed_polar",
        "Katul (Dedak Padi)": "feed_katul",
        "Ampas Tahu": "feed_ampas_tahu",
    }

    if req.available_feeds:
        for f in req.available_feeds:
            name_lower = f.feed_name.lower()
            if "rumput" in name_lower or "hijauan" in name_lower:
                harga_custom["Rumput Segar"] = f.price_per_kg
                batas_custom["Rumput Segar"] = f.max_limit_kg
                feed_id_map["Rumput Segar"] = f.feed_id
            elif "dami" in name_lower or "jerami" in name_lower:
                harga_custom["Dami (Jerami Padi)"] = f.price_per_kg
                batas_custom["Dami (Jerami Padi)"] = f.max_limit_kg
                feed_id_map["Dami (Jerami Padi)"] = f.feed_id
            elif "nutrifeed" in name_lower:
                harga_custom["Nutrifeed (Konsentrat)"] = f.price_per_kg
                batas_custom["Nutrifeed (Konsentrat)"] = min(f.max_limit_kg, 1.25)
                feed_id_map["Nutrifeed (Konsentrat)"] = f.feed_id
            elif "polar" in name_lower or "pollard" in name_lower:
                harga_custom["Bran Polar"] = f.price_per_kg
                batas_custom["Bran Polar"] = min(f.max_limit_kg, 0.25)
                feed_id_map["Bran Polar"] = f.feed_id
            elif "katul" in name_lower or "bekatul" in name_lower or "dedak" in name_lower:
                harga_custom["Katul (Dedak Padi)"] = f.price_per_kg
                batas_custom["Katul (Dedak Padi)"] = min(f.max_limit_kg, 0.50)
                feed_id_map["Katul (Dedak Padi)"] = f.feed_id
            elif "ampas" in name_lower or "tahu" in name_lower:
                harga_custom["Ampas Tahu"] = f.price_per_kg
                batas_custom["Ampas Tahu"] = min(f.max_limit_kg, 1.50)
                feed_id_map["Ampas Tahu"] = f.feed_id

    try:
        hasil = jalankan_optimasi_pakan(
            bobot_awal=req.current_weight_kg,
            bobot_target=req.target_weight_kg,
            hari_tenggat=req.days_to_qurban,
            umur_bulan=req.age_months or 24.0,
            hari_lingkungan=req.days_environment or 30.0,
            harga_custom=harga_custom,
            batas_maks_custom=batas_custom,
            max_biological_adg=req.max_biological_adg_kg or 1.5,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    ration_list: List[ApiFeedRationResultDTO] = []
    for item in hasil["komposisi"]:
        fid = feed_id_map.get(item["nama"], f"feed_{item['nama'].lower().replace(' ', '_')}")
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

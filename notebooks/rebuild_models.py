"""
Rebuild script — regenerates data and trains both models
"""
import pandas as pd
import numpy as np
import joblib, os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

DATA_DIR  = "data"
MODEL_DIR = "models"
np.random.seed(42)

# ── MODEL A: Crop Recommendation Classifier ──────────────
print("Training Model A — Crop Recommendation Classifier...")
df = pd.read_csv(f"{DATA_DIR}/Crop_recommendation.csv")
FEATURES = ['N','P','K','temperature','humidity','ph','rainfall']

le = LabelEncoder()
df['crop_id'] = le.fit_transform(df['label'])

X = df[FEATURES].values
y = df['crop_id'].values

scaler_rec = MinMaxScaler()
X_scaled = scaler_rec.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

rf_clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf_clf.fit(X_train, y_train)
acc = accuracy_score(y_test, rf_clf.predict(X_test))
print(f"  Accuracy: {acc*100:.2f}%")

joblib.dump(rf_clf,     f"{MODEL_DIR}/crop_recommendation_model.pkl")
joblib.dump(scaler_rec, f"{MODEL_DIR}/crop_recommendation_scaler.pkl")
joblib.dump(le,         f"{MODEL_DIR}/crop_label_encoder.pkl")

# ── Synthetic Yield Data ──────────────────────────────────
print("Generating synthetic yield data...")
CROP_PROFILES = {
    "maize":    {"base": 2.5,  "opt_temp":(20,30), "opt_rain":(500,800),  "opt_N":(80,120),  "opt_ph":(5.8,7.0)},
    "rice":     {"base": 3.5,  "opt_temp":(20,35), "opt_rain":(150,300),  "opt_N":(80,100),  "opt_ph":(5.5,7.0)},
    "soybeans": {"base": 1.8,  "opt_temp":(20,30), "opt_rain":(450,700),  "opt_N":(20,40),   "opt_ph":(6.0,7.0)},
    "cassava":  {"base": 10.0, "opt_temp":(25,35), "opt_rain":(100,200),  "opt_N":(40,80),   "opt_ph":(5.5,7.0)},
    "cotton":   {"base": 1.2,  "opt_temp":(25,35), "opt_rain":(700,1300), "opt_N":(60,100),  "opt_ph":(5.8,8.0)},
    "wheat":    {"base": 2.0,  "opt_temp":(15,25), "opt_rain":(400,650),  "opt_N":(60,120),  "opt_ph":(6.0,7.5)},
}

def yield_modifier(value, opt_low, opt_high, penalty=0.3):
    if opt_low <= value <= opt_high: return 1.0
    elif value < opt_low: return max(0.4, 1.0 - penalty*(opt_low-value)/opt_low)
    else: return max(0.4, 1.0 - penalty*(value-opt_high)/opt_high)

rows = []
for crop, profile in CROP_PROFILES.items():
    for _ in range(500):
        temperature = np.random.uniform(10,40)
        rainfall    = np.random.uniform(50,1500)
        N = np.random.uniform(0,140); P = np.random.uniform(5,145); K = np.random.uniform(5,205)
        ph = np.random.uniform(3.5,10.0); humidity = np.random.uniform(14,100)
        fertilizer = np.random.choice([0,1],p=[0.4,0.6])
        irrigation  = np.random.choice([0,1],p=[0.5,0.5])
        y_val = (profile["base"]
                 * yield_modifier(temperature,*profile["opt_temp"])
                 * yield_modifier(rainfall,*profile["opt_rain"])
                 * yield_modifier(N,*profile["opt_N"])
                 * yield_modifier(ph,*profile["opt_ph"])
                 * (1.15 if fertilizer else 1.0)
                 * (1.10 if irrigation else 1.0)
                 * np.random.normal(1.0,0.08))
        rows.append({"crop":crop,"temperature":round(temperature,2),"rainfall":round(rainfall,2),
                     "N":round(N,1),"P":round(P,1),"K":round(K,1),"ph":round(ph,3),
                     "humidity":round(humidity,2),"fertilizer_used":fertilizer,
                     "irrigation_used":irrigation,"yield_tons_per_ha":max(0.1,round(y_val,3))})

ydf = pd.DataFrame(rows).sample(frac=1,random_state=42).reset_index(drop=True)
ydf.to_csv(f"{DATA_DIR}/crop_yield_synthetic.csv", index=False)

# ── MODEL B: Yield Regressor ──────────────────────────────
print("Training Model B — XGBoost Yield Regressor...")
ydf_enc = pd.get_dummies(ydf, columns=['crop'], prefix='crop')
YIELD_FEATURES = [c for c in ydf_enc.columns if c != 'yield_tons_per_ha']
Xy = ydf_enc[YIELD_FEATURES].values
yy = ydf_enc['yield_tons_per_ha'].values

scaler_yield = MinMaxScaler()
Xy_scaled = scaler_yield.fit_transform(Xy)
Xtr,Xte,ytr,yte = train_test_split(Xy_scaled,yy,test_size=0.2,random_state=42)

xgb = XGBRegressor(n_estimators=200,learning_rate=0.05,max_depth=6,random_state=42,verbosity=0)
xgb.fit(Xtr,ytr)
pred = xgb.predict(Xte)
r2  = r2_score(yte,pred)
mae = mean_absolute_error(yte,pred)
print(f"  R²: {r2:.4f}  MAE: {mae:.4f} tons/ha")

joblib.dump(xgb,          f"{MODEL_DIR}/crop_yield_model.pkl")
joblib.dump(scaler_yield, f"{MODEL_DIR}/crop_yield_scaler.pkl")
joblib.dump(YIELD_FEATURES,f"{MODEL_DIR}/yield_feature_columns.pkl")

print("\n✅ All models rebuilt and saved.")
for f in sorted(os.listdir(MODEL_DIR)):
    print(f"  {f}")

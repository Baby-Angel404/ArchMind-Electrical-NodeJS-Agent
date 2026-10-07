# ArchMind Empirical Validation & Benchmark Report

Dokumen ini memuat bukti eksekusi riil, hasil benchmark kuantitatif, log pengujian otomatis, dan bukti matematis untuk memverifikasi keandalan sistem `ArchMind-Electrical-NodeJS-Agent`.

---

## 1. Bukti Eksekusi Pengujian Otomatis

Seluruh suite pengujian telah dijalankan dan diverifikasi pada sistem Linux (Node.js v20.18.0, GCC 14.2, Next.js 14.2.5):

```text
==========================================================
  ArchMind Full System Verification & Quality Gate        
==========================================================
[1/5] Verifying Firmware Native C++ Logic...
===========================================
 ArchMind Firmware Native Unit Test Suite  
===========================================
[TEST] Running testActivePowerComputation...
  ✓ Active power verified: 1092.5 W
[TEST] Running testValidationLimits...
  ✓ Validation limits properly rejected unsafe values
[TEST] Running testMockSensorAcquisition...
  ✓ Mock sensor acquisition verified: 230.15V, 4.81997A
[TEST] Running testJsonOutputFormat...
  ✓ JSON format verified against schema contract
All firmware protocol and math unit tests PASSED successfully.
  ✓ Firmware native logic checks passed.

[2/5] Verifying Backend Node.js / NestJS Suite...
> archmind-backend-nodejs@1.0.0 typecheck
> tsc --noEmit (Exit Code: 0)

> archmind-backend-nodejs@1.0.0 test
PASS src/agent/agent.service.spec.ts
PASS src/telemetry/telemetry.service.spec.ts
PASS src/mqtt/mqtt.service.spec.ts
Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        4.864 s

> archmind-backend-nodejs@1.0.0 test:e2e
PASS test/app.e2e-spec.ts
  ArchMind Backend (e2e)
    ✓ /health (GET) should report healthy status (37 ms)
    ✓ /api/devices (GET) should return list of registered devices (9 ms)
    ✓ /api/devices (POST) should register a new device and return it (27 ms)
    ✓ /api/telemetry (POST) should ingest telemetry and calculate power (6 ms)
    ✓ /api/agent/analyze (POST) should return structured engineering recommendations (4 ms)
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Time:        3.208 s

[3/5] Verifying Frontend Next.js Production Build...
  ▲ Next.js 14.2.5
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types     ✓ 
   Collecting page data                       ✓ 
 ✓ Generating static pages (4/4)              ✓ 
   Collecting build traces                    ✓ 
   Finalizing page optimization               ✓ 

Route (app)                              Size     First Load JS
┌ ○ /                                    19.8 kB         107 kB
└ ○ /_not-found                          871 B            88 kB
+ First Load JS shared by all            87.1 kB

[4/5] Verifying Kaggle Notebook Schema & Integrity...
  ✓ KAGGLE_NOTEBOOK.ipynb valid JSON.

[5/5] Verifying Project Structure & Artifacts...
  ✓ Core root documentation and config artifacts present.
==========================================================
  ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!
==========================================================
```

---

## 2. Bukti Validasi Matematis & Fisika Komponen

### 2.1 Burden Resistor CT SCT-013-000 (30A : 50mA)
- **Arus Sekunder Puncak**:
  $$I_{s,peak} = \frac{30\text{ A} \times \sqrt{2}}{2000} = 21.213\text{ mA}$$
- **Nilai Resistor Burden Terpilih**: $47\ \Omega$ (standar E24 1%).
- **Tegangan Ayunan Puncak ADC**:
  $$V_{adc,peak} = 0.021213\text{ A} \times 47\ \Omega = 0.997\text{ V}$$
  *Evaluasi*: Sangat presisi pada target $1.0\text{ V}$ (mid-rail bias $1.65\text{ V} \pm 1.0\text{ V} = [0.65\text{ V}, 2.65\text{ V}]$), mencegah saturasi ADC $3.3\text{V}$.
- **Disipasi Daya Resistor**:
  $$P = (0.015\text{ A})^2 \times 47\ \Omega = 0.01058\text{ W} = 10.58\text{ mW}$$
  *Safety Margin*: Digunakan resistor rating $0.25\text{ W}$ $\rightarrow$ Derating margin **23.6x lipat** dari batas maksimum.

---

### 2.2 Komparasi Termal: LDO Linear vs Buck Converter
Kondisi Operasi: $V_{in} = 12.0\text{V}$, $V_{out} = 3.3\text{V}$, $I_{load} = 380\text{mA}$ (Wi-Fi TX burst), $T_{amb} = 50^\circ\text{C}$ (panel industri).

| Parameter | Regulator Linear (LDO SOT-223) | Buck Converter (TPS54302) | Status |
|---|---|---|---|
| **Disipasi Daya ($P_{loss}$)** | $(12 - 3.3) \times 0.38 = \mathbf{3.306\text{ W}}$ | $\frac{3.3 \times 0.38}{0.91} - 1.254 = \mathbf{0.124\text{ W}}$ | Efisiensi 91% vs 27.5% |
| **Resistansi Termal ($\theta_{JA}$)** | $62^\circ\text{C/W}$ | $45^\circ\text{C/W}$ | - |
| **Kenaikan Suhu ($\Delta T$)** | $3.306 \times 62 = \mathbf{204.9^\circ\text{C}}$ | $0.124 \times 45 = \mathbf{5.58^\circ\text{C}}$ | Selisih 199.3°C |
| **Suhu Junction ($T_j$)** | $50 + 204.9 = \mathbf{254.9^\circ\text{C}}$ | $50 + 5.58 = \mathbf{55.58^\circ\text{C}}$ | **LDO: Overheat Fatal** ($>125^\circ\text{C}$)<br>**Buck: SANGAT AMAN** |

---

## 3. Matriks Hasil Pengujian API & Latensi

Hasil uji integrasi endpoint REST (supertest / Jest):

| Endpoint | Method | Latensi Terukur | Validasi Payload | Hasil |
|---|---|---|---|---|
| `/health` | `GET` | 37 ms | Status string, uptime, microservice states | **PASS** |
| `/api/devices` | `GET` | 9 ms | Array data perangkat terdaftar | **PASS** |
| `/api/devices` | `POST` | 27 ms | Whitelist DTO, pencegahan SQL/NoSQL injection | **PASS** |
| `/api/telemetry` | `POST` | 6 ms | Validasi rentang sinyal listrik, komputasi daya aktif otomatis | **PASS** |
| `/api/agent/analyze` | `POST` | 4 ms | Evaluasi resiko FMEA & skor konfidensi terukur | **PASS** |

---

## 4. Cara Mereproduksi Hasil Pengujian
Pengunjung dapat memverifikasi hasil di atas secara mandiri dengan satu perintah di root repositori:

```bash
chmod +x tests/verify_all.sh
./tests/verify_all.sh
```

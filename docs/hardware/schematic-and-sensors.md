# Electrical Hardware Architecture & Sensor Integration

## 1. Electrical Sizing & Sensor Subsystem

The ArchMind edge node measures electrical parameters using isolated and calibrated transducers:

```text
               +-------------------------------------------------------+
               |                    MAINS / LOAD AC                    |
               +--------------------------+----------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         +-------------------------+             +-------------------------+
         | Current Transformer     |             | Isolated AC Voltage Tr  |
         | (SCT-013-000 100A:50mA) |             | (ZMPT101B active module)|
         +------------+------------+             +------------+------------+
                      |                                       |
                      v                                       v
         +-------------------------+             +-------------------------+
         | Burden Resistor (33Ω 1%)|             | Anti-aliasing RC filter |
         | Bias Network (1.65V)    |             | (fc = 1kHz)             |
         +------------+------------+             +------------+------------+
                      |                                       |
                      +-------------------+-------------------+
                                          |
                                          v
                         +---------------------------------+
                         | ADS1115 16-bit Precision ADC    |
                         | (I2C Address: 0x48)             |
                         +----------------+----------------+
                                          | I2C (SDA/SCL)
                                          v
                         +---------------------------------+
                         | ESP32-WROOM-32E Microcontroller |
                         +---------------------------------+
                                          ^
                                          | OneWire / I2C
                         +----------------+----------------+
                         | DS18B20 / SHT31 Ambient Sensor  |
                         +---------------------------------+
```

---

## 2. Mathematical Calculations & Formulas

### 2.1 Current Transformer (SCT-013-000) Burden Resistor Calculation
Given:
- Max primary current ($I_{RMS}$): $30\text{ A}$ (peak $I_{peak} = 30 \times \sqrt{2} \approx 42.42\text{ A}$).
- Turns ratio ($N$): $1:2000$.
- Peak secondary current ($I_{s,peak}$):
  $$I_{s,peak} = \frac{42.42\text{ A}}{2000} = 21.21\text{ mA}$$
- Target peak voltage swing into ADC ($V_{adc,peak}$): $1.0\text{ V}$ (centered around $1.65\text{ V}$ mid-rail).
- Required Burden Resistor ($R_{burden}$):
  $$R_{burden} = \frac{V_{adc,peak}}{I_{s,peak}} = \frac{1.0\text{ V}}{0.02121\text{ A}} \approx 47.14\ \Omega \quad \longrightarrow \text{Standard 1\%: } 47\ \Omega$$
- Burden Resistor Power Dissipation:
  $$P_{diss} = I_{s,RMS}^2 \times R_{burden} = \left(\frac{30\text{ A}}{2000}\right)^2 \times 47\ \Omega = (0.015\text{ A})^2 \times 47\ \Omega \approx 0.0105\text{ W} = 10.5\text{ mW}$$
  *Selected Rating*: $0.25\text{ W}$ (24x power safety margin).

### 2.2 Thermal Dissipation & Derating
- **Power Rail**: $5.0\text{V}$ input converted to $3.3\text{V}$ for ESP32 and sensors ($I_{peak} \approx 350\text{mA}$ during Wi-Fi TX).
- If linear regulator used:
  $$P_{loss} = (5.0\text{V} - 3.3\text{V}) \times 0.35\text{A} = 0.595\text{W}$$
  On SOT-223 ($\theta_{JA} = 62^\circ\text{C/W}$), $\Delta T = 0.595 \times 62 = 36.89^\circ\text{C}$.
  At $50^\circ\text{C}$ ambient, $T_j = 86.89^\circ\text{C}$ (within $125^\circ\text{C}$ maximum).
- **Recommendation**: For industrial DIN rail cabinets ($T_{amb} > 60^\circ\text{C}$), specify a high-efficiency DC-DC buck regulator (TI TPS54302, $>90\%$ efficiency) to eliminate heat generation inside enclosed housings.

### 2.3 Protection Circuitry
- **TVS Diodes**: Littelfuse SMBJ5.0A on $5\text{V}$ power input to clamp transients; ESD5V0D3B on I2C external connector lines.
- **PTC Resettable Fuse**: Bourns MF-MSMF050-2 (0.5A hold, 1.0A trip) at input.
- **Reverse Polarity**: P-Channel MOSFET (DMG3415U) gate pulled to ground.

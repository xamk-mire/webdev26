# Raportointiohjeet: Oppimistehtävä 2 – Backend (Kasvien ja laitteiden hallinta)

Näillä ohjeilla raportoidaan [Oppimistehtävä 2 – tehtävänanto (Backend)](Oppimistehtava-2-tehtavananto.md) suoritus. Kaikki API-kutsut tehdään **Scalar UI**:lla. Jokaisesta vaaditusta pyynnöstä otetaan kuvakaappaus, jossa **response** on selvästi näkyvissä.

Yleisistä raportointiperiaatteista (Scalar UI, kuvakaappauksen sisältö, JWT) voi käyttää myös [yleisiä Raportointiohjeita](Raportointiohjeet.md) (Migraatio-Suunnitelma).

**API-sopimus (tehtävänanto Vaihe 0.3 ja 2):** Laitteen tyyppi (**deviceType**) ja **status** välitetään API:ssa **numeerisina**. deviceType = 0–5 (0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor). Query-parametrit ja request/response-body käyttävät näitä numeerisia arvoja.

---

## 1. Yleistä

### 1.1 Scalar UI

- **Polku:** `http://localhost:8001/scalar` (tai projekti käyttää eri polkua, esim. `/api/docs`).
- Backend ajossa portissa **8001** ennen testausta.
- Kaikki alla olevat 2a-endpointit testataan Scalar UI:lla.

### 1.2 Kuvakaappaukset

- Jokaisesta alla listatusta pyynnöstä vaaditaan **yksi kuvakaappaus**.
- Kuvakaappauksessa näkyvät:
  - **Pyyntö:** metodi, URL ja tarvittaessa body (request auki).
  - **Vastaus (response):** statuskoodi ja **response body** (paitsi 204 No Content).
- Kuva otetaan hetkestä, jolloin pyyntö on tehty ja vastaus näkyy Scalar UI:ssa.
- Kuvakaappaukset liitetään 2a-tehtävän raporttiin.

### 1.3 Autentikointi

- Kaikki kasvi- ja laite-endpointit vaativat **JWT-tokenin** (`Authorization: Bearer <token>`).
- Kirjautuminen: `POST /api/auth/login` (body: email, password). Tallenna vastauksesta `token`.
- Aseta Scalar UI:ssa token (Authorize / Authentication). Tämän jälkeen pyynnöt lähetetään tokenilla.

---

## 2. Vaaditut pyynnöt ja kuvakaappaukset (2a)

Seuraavassa listassa on **Oppimistehtävä 2** -tehtävänannon uudet tai muuttuneet endpointit. Raportissa tulee olla kuvakaappaus **jokaisesta** kohdasta (2.1–2.12), paitsi jos tehtävänantossa on erikseen mainittu valinnaisuus.

---

### 2.1 Kasvien muokkaus: PUT /api/plants/{id}

**Pyyntö:** `PUT /api/plants/{id}`  
**Header:** `Authorization: Bearer <token>`  
**Body (JSON):** esim.

```json
{
  "name": "Muokattu kasvi",
  "species": "Monstera",
  "location": "Keittiö",
  "notes": "Päivitetty muistiinpano"
}
```

(Kaikki kentät valinnaisia osittaisen päivityksen vuoksi.)

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Päivitetty kasvi (PlantDto), sis. `devices`-lista (ei yksittäistä `device`).

**Raportointi:** Tee kutsu, varmista 200 ja body (devices-listalla). **Ota kuvakaappaus** (pyyntö + response).

---

### 2.2 Laitteiden listaus: GET /api/devices

**Pyyntö:** `GET /api/devices?offset=0&limit=20` (valinnainen suodatus: `?deviceType=2` = MoistureSensor, `?deviceType=0` = Watering, `?status=0` = Ok)  
**Header:** `Authorization: Bearer <token>`

Parametrit **numeerisina** (deviceType 0–5, status esim. 0=Ok, 1=Fault, 2=Offline). Virheellisestä arvosta → 400.

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** `{ "total", "offset", "limit", "items": [ DeviceDto, ... ] }`. Jokainen DeviceDto sisältää `deviceType` **kokonaislukuna** (0–5).

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.3 Laitteen haku: GET /api/devices/{id}

**Pyyntö:** `GET /api/devices/{id}`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` olemassa olevalla laitteen id:llä.

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Yksi DeviceDto (sis. `deviceType` numeerisena 0–5, `status`, `battery`, `watering`, `moisture`).

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.4 Laitteen luonti: POST /api/devices

**Pyyntö:** `POST /api/devices`  
**Header:** `Authorization: Bearer <token>`  
**Body (JSON):** esim. (deviceType ja status **numeerisina**, ks. tehtävänanto Vaihe 0.3)

```json
{
  "deviceType": 2,
  "status": 0,
  "battery": 85,
  "watering": false,
  "moisture": 42
}
```

`deviceType` pakollinen, **kokonaisluku 0–5** (0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor). `status` numeerinen (esim. 0=Ok).

**Odotettu vastaus:**

- **Status:** `201 Created`
- **Body:** Luotu laite (DeviceDto), sis. `deviceType` numeerisena. Location-header voi viitata GET /api/devices/{id}.

**Raportointi:** Tee kutsu, varmista 201 ja body. **Ota kuvakaappaus**. Voit käyttää tätä laitetta linkityksessä (2.8) ja muokkauksessa (2.5).

---

### 2.5 Laitteen muokkaus: PUT /api/devices/{id}

**Pyyntö:** `PUT /api/devices/{id}`  
**Header:** `Authorization: Bearer <token>`  
**Body (JSON):** esim. osittainen päivitys (kentät numeerisina):

```json
{
  "status": 0,
  "battery": 90,
  "moisture": 55
}
```

Voit sisältää myös `deviceType` (0–5). Kaikki kentät valinnaisia.

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Päivitetty DeviceDto (sis. `deviceType` numeerisena).

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.6 Laitteen poisto: DELETE /api/devices/{id}

**Pyyntö:** `DELETE /api/devices/{id}`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` poistettavan laitteen id:llä (voi olla 2.4:ssä luotu tai erillinen testilaitte).

**Odotettu vastaus:**

- **Status:** `204 No Content`
- **Body:** Tyhjä.

**Raportointi:** Tee kutsu, varmista 204. **Ota kuvakaappaus**, jossa status **204** on selvästi näkyvissä (body tyhjä / "No content").

---

### 2.7 Kasvin laitteiden listaus: GET /api/plants/{id}/devices

**Pyyntö:** `GET /api/plants/{id}/devices`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` olemassa olevan kasvin id:llä.

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Taulukko laitteista (DeviceDto[]). Voi olla tyhjä `[]`, jos kasvilla ei ole laitteita.

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.8 Laitteen linkitys kasviin: POST /api/plants/{id}/devices/{deviceId}

**Pyyntö:** `POST /api/plants/{id}/devices/{deviceId}`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` kasvin id ja `{deviceId}` laitteen id (esim. 2.4:ssä luotu laite).

**Odotettu vastaus:**

- **Status:** `204 No Content` tai `200 OK`
- **Body:** Tyhjä (204) tai päivitetty kasvi (200).

**Raportointi:** Tee kutsu, varmista 204/200. **Ota kuvakaappaus**. Toista sama linkitys → odotettu **409 Conflict** (valinnainen toinen kuvakaappaus).

---

### 2.9 Laitteen irrotus kasvista: DELETE /api/plants/{id}/devices/{deviceId}

**Pyyntö:** `DELETE /api/plants/{id}/devices/{deviceId}`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` ja `{deviceId}` kasvin ja linkitetyn laitteen id:llä.

**Odotettu vastaus:**

- **Status:** `204 No Content`
- **Body:** Tyhjä.

**Raportointi:** Tee kutsu, varmista 204. **Ota kuvakaappaus** (status + selitys body tyhjä).

---

### 2.10 Kasvin luonti (ilman device-objektia): POST /api/plants

**Pyyntö:** `POST /api/plants`  
**Header:** `Authorization: Bearer <token>`  
**Body (JSON):** esim. ilman device-objektia:

```json
{
  "name": "Uusi kasvi 2a",
  "species": "Orkidea",
  "location": "Olohuone",
  "notes": "Raportointitesti 2a"
}
```

Vaihtoehto B: lisää valinnainen `deviceIds: [1, 2]` jos backend tukee.

**Odotettu vastaus:**

- **Status:** `201 Created`
- **Body:** Luotu kasvi (PlantDto), sis. **devices**-lista (tyhjä tai linkitetyt laitteet). Ei yksittäistä `device`-kenttää.

**Raportointi:** Tee kutsu, varmista 201 ja body (devices-listalla). **Ota kuvakaappaus**.

---

### 2.11 Kasvin haku (devices-lista): GET /api/plants/{id}

**Pyyntö:** `GET /api/plants/{id}`  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` olemassa olevan kasvin id:llä (esim. 2.10:ssä luotu).

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Yksi kasvi (PlantDto), sis. **devices**-lista (DeviceDto[]). Ei yksittäistä `device`.

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.12 Water-toggle: POST /api/plants/{id}/water

**Pyyntö:** `POST /api/plants/{id}/water` (tai `?deviceId=...` jos backend tukee)  
**Header:** `Authorization: Bearer <token>`  
Korvaa `{id}` kasvin id:llä, jolla on (tai voi olla) Watering-tyyppinen laite.

**Odotettu vastaus:**

- **Status:** `200 OK`
- **Body:** Päivitetty kasvi (PlantDto) laitteineen (watering-kentät päivittyneet).

**Raportointi:** Tee kutsu, varmista 200 ja body. **Ota kuvakaappaus**.

---

### 2.13 Valinnainen: Validointivirhe (400) – POST /api/devices

**Pyyntö:** `POST /api/devices`  
**Body (JSON):** virheellinen deviceType (vain 0–5 kelpaa). Esim. `{ "deviceType": 99, "status": 0, "battery": 50, "watering": false, "moisture": 30 }` tai query GET /api/devices?deviceType=99

**Odotettu vastaus:**

- **Status:** `400 Bad Request`
- **Body:** Virheviesti (esim. `{ "error": "Invalid deviceType value. Use 0-5.", ... }`).

**Raportointi:** Valinnainen. Jos otat kuvakaappauksen, se osoittaa validointiin 2a-toteutuksessa (numeerinen deviceType 0–5).

---

## 3. Yhteenveto – vaaditut kuvakaappaukset (2a)

| Kohta | Pyyntö                                     | Odotettu status | Kuvakaappaus                                                  |
| ----- | ------------------------------------------ | --------------- | ------------------------------------------------------------- |
| 2.1   | PUT /api/plants/{id}                       | 200             | Pyyntö + response (status + body, devices-lista)              |
| 2.2   | GET /api/devices                           | 200             | Pyyntö + response (status + body; deviceType numeerisena)     |
| 2.3   | GET /api/devices/{id}                      | 200             | Pyyntö + response (status + body)                             |
| 2.4   | POST /api/devices                          | 201             | Pyyntö + response (status + body; deviceType numeerisena 0–5) |
| 2.5   | PUT /api/devices/{id}                      | 200             | Pyyntö + response (status + body)                             |
| 2.6   | DELETE /api/devices/{id}                   | 204             | Pyyntö + response (status, body tyhjä)                        |
| 2.7   | GET /api/plants/{id}/devices               | 200             | Pyyntö + response (status + body)                             |
| 2.8   | POST /api/plants/{id}/devices/{deviceId}   | 204/200         | Pyyntö + response                                             |
| 2.9   | DELETE /api/plants/{id}/devices/{deviceId} | 204             | Pyyntö + response (status, body tyhjä)                        |
| 2.10  | POST /api/plants (ilman device)            | 201             | Pyyntö + response (devices-lista)                             |
| 2.11  | GET /api/plants/{id}                       | 200             | Pyyntö + response (devices-lista)                             |
| 2.12  | POST /api/plants/{id}/water                | 200             | Pyyntö + response (status + body)                             |

**Yhteensä vähintään 12 Scalar UI -kuvakaappauksen** (2.1–2.12) tulee olla Oppimistehtävä 2 -raportissa. Jokaisessa response (status + body, paitsi 204 kohdalla body tyhjä) selvästi näkyvissä.

---

## 4. Tekstiosio raportissa

Raportissa kuvaile lyhyesti (viittaa [Oppimistehtävä 2 – tehtävänanto](./Oppimistehtava-2-tehtavananto.md)):

1. **Toteutetut vaiheet** – Mitkä tehtävänannon vaiheet (0–5) toteutettiin: Vaihe 0 (tietomalli M–N, DeviceType-enum, migraatio), Vaihe 1 (PUT /api/plants/{id}), Vaihe 2 (laitteiden CRUD), Vaihe 3 (GET/POST/DELETE /api/plants/{id}/devices), Vaihe 4 (POST /api/plants, GET-rakenne devices-listalla, POST /api/plants/{id}/water), Vaihe 5 (testaus ja raportointi).
2. **Valinnat** – Implisiittinen vs. eksplisiittinen liitostaulu (PlantDevice); kasvin luonti vaihtoehto A (vain kasvin kentät) vai B (valinnainen deviceIds-lista); water-toggle-sääntö (kaikki kasvin Watering-laitteet vs. query-parametri deviceId); API käyttää deviceType ja status numeerisena (0–5 ja status-enum).
3. **Mahdolliset rajoitteet** – Esim. migraatio olemassa olevaan dataan, tunnettu puute tai dokumentoitu poikkeama tehtävänannosta.

---

## 5. Tarkistuslista ennen luovutusta

- [ ] Backend ajossa portissa 8001, Scalar UI avattavissa.
- [ ] JWT asetettu Scalar UI:hin (kirjautuminen tehty).
- [ ] Jokainen taulukon pyyntö (2.1–2.12) tehty ja vastaus vastaa odotettua.
- [ ] Jokaisesta kohdasta (2.1–2.12) oma kuvakaappaus, jossa **response on selvästi näkyvissä**.
- [ ] Tekstiosio (toteutetut vaiheet, valinnat, rajoitteet) täytetty.

Näiden jälkeen Oppimistehtävä 2 -raportointi on kunnossa.

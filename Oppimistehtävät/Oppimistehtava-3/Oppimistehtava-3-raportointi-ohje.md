# Raportointiohjeet: Oppimistehtävä 3 – Frontend (Kasvien ja laitteiden hallinta)

Näillä ohjeilla raportoidaan [Oppimistehtävä 3 – tehtävänanto (Frontend)](Oppimistehtava-3-tehtavananto.md) suoritus. Raportointi tehdään **sovelluksen käyttöliittymästä** otettujen kuvakaappauksien avulla. Kaikki toiminnot testataan suorittamalla ne moisture-frontend -sovelluksessa selaimessa.

**Edellytys:** [Oppimistehtävä 2 (Backend)](Oppimistehtava-2-tehtavananto.md) on toteutettu tai vastaava API on käytettävissä. Frontend yhdistetty backendiin (esim. `VITE_API_BASE` tai vastaava).

---

## 1. Yleistä

### 1.1 Sovellus ja backend

- **Frontend:** moisture-frontend ajossa (esim. `npm run dev`, portti 5173 tai vastaava).
- **Backend:** moisture-backend-net (tai vastaava) ajossa portissa **8001** (tai projektin määrittämä).
- Frontend on yhdistetty backendiin oikealla API-URL:lla.

### 1.2 Kuvakaappaukset

- Kuvakaappaukset otetaan **sovelluksen käyttöliittymästä** (selain) – ei Scalar UI:sta.
- Jokaisesta alla listatusta kohdasta (3.1–3.7) vaaditaan **vähintään yksi kuvakaappaus** keskeisestä näkymästä tai toiminnasta.
- Kuvassa näkyvät:
  - Näkymä tai lomake selkeästi.
  - Ominaisuuden tila (esim. laitteet listalla, kasvin muokkauslomake avoinna).
- Kuvakaappaukset liitetään Oppimistehtävä 3 -raporttiin.

### 1.3 Autentikointi

- Kirjaudu sovellukseen (Login) ennen testausta.
- Kaikki kasvi- ja laite-endpointit vaativat JWT-tokenin; frontend hoitaa sen automaattisesti kirjautumisen jälkeen.

---

## 2. Vaaditut näkymät ja kuvakaappaukset (3)

Seuraavassa listassa on [Oppimistehtävä 3](Oppimistehtava-3-tehtavananto.md) -tehtävänannon vaiheet. Raportissa tulee olla kuvakaappaus **vähintään** kohdista 3.1–3.7 (paitsi jos vaihe on tehtävänannossa erikseen valinnainen).

---

### 3.1 Kasvien muokkaus (Vaihe 2)

**Toiminto:** Kasvin yksityisnäkymässä tai vastaavassa avataan muokkaus (esim. "Muokkaa"-nappi) ja muokataan kasvin tietoja (name, species, location, notes).

**Tarkistettavaa:**

- Muokkauslomake näkyy ja kentät ovat täytettävissä.
- Tallennus toimii (PUT /api/plants/{id}).
- Päivitys näkyy heti tai refetchin jälkeen.

**Raportointi:** Kuva kasvin yksityisnäkymästä, jossa muokkauslomake/dialogi on avoinna. **Ota kuvakaappaus**.

---

### 3.2 Laitteiden listaus (Vaihe 3)

**Toiminto:** Laitteiden sivu/näkymä, jossa listataan laitteet (GET /api/devices).

**Tarkistettavaa:**

- Laitteet näkyvät listassa (deviceType, status, battery, moisture jne.).
- Jos toteutettu: suodatus deviceType/status -parametreilla.
- deviceType näkyy oikein (numeerinen 0–5 tai vastaava selkeytys UI:ssa).

**Raportointi:** Kuva laitteiden listanäkymästä, jossa vähintään yksi laite näkyy. **Ota kuvakaappaus**.

---

### 3.3 Laitteen luonti ja muokkaus (Vaihe 3)

**Toiminto:** Uuden laitteen luonti (POST /api/devices) ja laitteen muokkaus (PUT /api/devices/{id}).

**Tarkistettavaa:**

- Luontilomake: deviceType (pakollinen, numeerinen 0–5 tai dropdown), status, battery, watering, moisture.
- Muokkauslomake: sama rakenne, kentät valinnaisia.
- Luonti/muokkaus onnistuu ja listaus päivittyy.

**Raportointi:** Kuva luonti- tai muokkauslomakkeesta/dialogista (deviceType-valinta näkyvissä). **Ota kuvakaappaus**.

---

### 3.4 Kasvin laitteet (Vaihe 4)

**Toiminto:** Kasvin yksityisnäkymässä näytetään kasviin liitetyt laitteet.

**Tarkistettavaa:**

- Kasvin laitteet listataan (GET /api/plants/{id}/devices tai plant.devices).
- Näkyvät: deviceType, status, battery, moisture jne.
- Irrotus-toiminto on saatavilla per laite.

**Raportointi:** Kuva kasvin yksityisnäkymästä, jossa kasviin linkitetyt laitteet näkyvät. **Ota kuvakaappaus**.

---

### 3.5 Laitteen linkitys (Vaihe 4)

**Toiminto:** "Linkitä laite" -toiminto: valitaan olemassa oleva laite ja linkitetään se kasviin (POST /api/plants/{id}/devices/{deviceId}).

**Tarkistettavaa:**

- Laite valitaan listasta (esim. GET /api/devices).
- Linkitys onnistuu; laite ilmestyy kasvin laitelistalle.
- 409 (jo linkitetty) ja 404 käsitellään (virheviesti käyttäjälle).

**Raportointi:** Kuva "Linkitä laite" -dialogista/modalista, jossa laitteet ovat valittavissa (tai juuri linkitetty laite näkyy kasvin laitelistalla). **Ota kuvakaappaus**.

---

### 3.6 Kasvin luonti (Vaihe 5)

**Toiminto:** Uuden kasvin luonti ilman yksittäistä device-objektia (POST /api/plants).

**Tarkistettavaa:**

- Lomake: name, species, location (valinnainen), notes (valinnainen). Ei device-objektia.
- Vaihtoehto A: laitteet linkitetään myöhemmin.
- Vaihtoehto B: valinnainen deviceIds-lista (monivalinta laitteista).

**Raportointi:** Kuva kasvin luontilomakkeesta (ilman device-objektia). **Ota kuvakaappaus**.

---

### 3.7 Water-toggle (Vaihe 6)

**Toiminto:** Kastelun kytkentä (POST /api/plants/{id}/water).

**Tarkistettavaa:**

- Kasvin näkymässä "Kastelu"/"Water"-nappi tai toggle.
- Käyttäytyminen vastaa backend-sääntöä: joko kaikki Watering-laitteet tai valittu laite (deviceId).
- Näkymä päivittyy vastauksen jälkeen.

**Raportointi:** Kuva kasvin näkymästä, jossa water-toggle on näkyvissä ja käytettävissä (esim. kasvillakin on Watering-laitteita). **Ota kuvakaappaus**.

---

### 3.8 Valinnainen: Virhetilanteet (404, 400, 409)

**Toiminto:** Virheviestit näkyvät käyttäjälle.

**Tarkistettavaa:**

- 404 (esim. ei löydy): viesti näkyy.
- 400 (validointi): esim. virheellinen deviceType.
- 409 (jo linkitetty): viesti näkyy.

**Raportointi:** Valinnainen. Voit lisätä yhden tai useamman kuvakaappauksen virhetilanteesta (esim. 409 Conflict -viesti).

---

### 3.9 Valinnainen: DevTools – Network

**Toiminto:** Tarkista, että frontend tekee oikeat API-kutsut.

**Raportointi:** Valinnainen. Voit liittää kuvakaappauksen DevTools – Network -välilehdeltä, jossa näkyy esim. PUT /api/plants/{id} tai POST /api/devices -pyyntö ja vastaus.

---

## 3. Yhteenveto – vaaditut kuvakaappaukset (3)

| Kohta | Näkymä/toiminto              | Kuvakaappaus                                 |
| ----- | ---------------------------- | -------------------------------------------- |
| 3.1   | Kasvin muokkaus              | Muokkauslomake/dialogi avoinna               |
| 3.2   | Laitteiden listaus           | Laitteiden sivu, lista näkyvissä             |
| 3.3   | Laitteen luonti tai muokkaus | Luonti-/muokkauslomake, deviceType näkyvissä |
| 3.4   | Kasvin laitteet              | Kasvin yksityisnäkymä, laitteet listattuna   |
| 3.5   | Laitteen linkitys            | Linkitä laite -dialogi tai linkitetty laite  |
| 3.6   | Kasvin luonti                | Luontilomake ilman device-objektia           |
| 3.7   | Water-toggle                 | Water-toggle näkyvissä kasvin näkymässä      |

**Vähintään 7 kuvakaappauksen** (3.1–3.7) tulee olla Oppimistehtävä 3 -raportissa. Jokainen kuva dokumentoi kyseisen vaiheen toiminnallisuuden.

---

## 4. Tekstiosio raportissa

Raportissa kuvaile lyhyesti (viittaa [Oppimistehtävä 3 – tehtävänanto](Oppimistehtava-3-tehtavananto.md)):

1. **Toteutetut vaiheet** – Mitkä tehtävänannon vaiheet (1–7) toteutettiin: Vaihe 1 (API-client, devices-lista, DeviceDto.deviceType numeerisena, API-kutsut), Vaihe 2 (kasvin muokkaus), Vaihe 3 (laitteiden listaus ja CRUD), Vaihe 4 (kasvin laitteet, linkitys, irrotus), Vaihe 5 (kasvin luonti), Vaihe 6 (water-toggle), Vaihe 7 (testaus ja raportointi).
2. **Valinnat** – Kasvin luonti: vaihtoehto A (ei deviceIds) vai B (valinnainen deviceIds); water-toggle UI (yksi nappi kaikille vs. valinta per laite); deviceType UI (dropdown 0–5, selitykset, jne.).
3. **Mahdolliset rajoitteet** – Esim. suodatus, validointi tai dokumentoitu poikkeama tehtävänannosta.

---

## 5. Tarkistuslista ennen luovutusta

- [ ] Frontend ja backend ajossa, sovellus toimii selaimessa.
- [ ] Kirjautuminen onnistuu.
- [ ] Jokainen kohdista 3.1–3.7 on testattu ja toimii.
- [ ] Jokaisesta kohdasta 3.1–3.7 on oma kuvakaappaus sovelluksen käyttöliittymästä.
- [ ] Tekstiosio (toteutetut vaiheet, valinnat, rajoitteet) täytetty.

Näiden jälkeen Oppimistehtävä 3 -raportointi on kunnossa.

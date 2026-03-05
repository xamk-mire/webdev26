# Oppimistehtävä 3: Frontend – Kasvien ja laitteiden hallinta

## Johdanto

Tämä tehtävänanto keskittyy **vain frontend-päivittämiseen**. Tavoitteena on muokata **moisture-frontend** -React-sovellus niin, että se käyttää [Tehtävänanto 2: Backend](Oppimistehtava-2-tehtavananto.md) -pohjalta toteutettua API:a:

- Kasvin tietoja voi **muokata** (PUT /api/plants/{id}).
- **Laitteet** ovat oma entiteettinsä: niitä voi listata, luoda, muokata ja poistaa (GET/POST/PUT/DELETE /api/devices).
- Kasvilla voi olla **useita laitteita**; laite voi kuulua usealle kasville. Käyttäjä voi **linkittää** laitteita kasviin ja **irrottaa** niitä (GET/POST/DELETE /api/plants/{id}/devices).
- Kasvin **luonti** ei enää sisällä yhtä device-objektia; laitteet linkitetään erikseen tai valinnaisella deviceIds-listalla.
- **Water-toggle** toimii usean kastelulaitteen tai valitun laitteen kanssa (backendin valinnan mukaan).

Backend-tehtävänanto (2) määrittelee API-sopimukset. Toteuta frontend niin, että se noudattaa näitä sopimuksia.

---

## Edellytykset

- **Backend (2)** on toteutettu tai vastaava API on käytettävissä (PUT plants, GET/POST/PUT/DELETE devices, GET/POST/DELETE plants/{id}/devices, POST plants ilman device-objektia, devices-lista PlantDto:ssa).
- **moisture-frontend** -projekti on olemassa ja yhdistetty backendiin (esim. VITE_API_URL tai vastaava).

---

## Tavoitteet (frontend)

| Tavoite                          | Kuvaus                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Datan rakenne**                | Frontend tukee uutta API-rakennetta: PlantDto sisältää `devices`-listan (ei yksittäistä `device`).                 |
| **Kasvin muokkaus**              | Käyttäjä voi muokata kasvin tietoja (nimi, laji, sijainti, muistiinpanot) omalla lomakkeellaan/dialogilla.         |
| **Laitteiden listaus**           | Näkymä/sivu laitteiden listalle (suodatus deviceType/status), laitteen luonti/muokkaus/poisto.                     |
| **Laitteen tyyppi (DeviceType)** | UI tukee deviceType-arvoja **numeerisina** (0–5) luonnissa ja muokkauksessa; vastaa [Backend 2](Oppimistehtava-2-tehtavananto.md) kohdan 0.3 API-sopimusta. |
| **Kasvin laitteet**              | Kasvin yksityisnäkymässä näytetään kasviin liitetyt laitteet; mahdollisuus linkittää uusi laite ja irrottaa laite. |
| **Kasvin luonti**                | Kasvin luontilomake ilman device-objektia; valinnainen deviceIds tai linkitys luonnin jälkeen.                     |
| **Water-toggle**                 | Kastelun kytkentä toimii usealle laitteelle tai valitulle laitteelle (backend-säännön mukaan).                     |

---

## Vaihe 1: API-client ja datan rakenne

### 1.1 Typet ja DTO:t

- Päivitä (tai luo) frontend-tyypit vastaamaan backendin vastauksia:
  - **Plant:** sisältää `devices: DeviceDto[]` (ei enää yksittäistä `device`). Jos vanha koodi olettaa `plant.device`, refaktoroi käyttämään `plant.devices` (esim. `plant.devices[0]` tai listan käsittely).
  - **DeviceDto:** `id`, `deviceType` (**number**, 0–5), `status`, `battery`, `watering`, `moisture`. Kenttä `deviceType` on **numeerinen** – vastaa [Backend 2](Oppimistehtava-2-tehtavananto.md) kohdan 0.3 DeviceType-enumia: 0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor.
- **CreatePlantRequestDto:** `name`, `species`, `location?`, `notes?`, valinnainen `deviceIds?: number[]` (jos backend tukee vaihtoehtoa B).
- **UpdatePlantRequestDto:** `name?`, `species?`, `location?`, `notes?`.
- **CreateDeviceRequestDto / UpdateDeviceRequestDto:** `deviceType` (**number**, 0–5; luonnissa pakollinen), `status`, `battery`, `watering`, `moisture`. API lähettää ja vastaanottaa deviceType **kokonaislukuna**.
- **DeviceType-numerotaulukko** (Backend 2 -sopimus, käytä samaa UI:ssa): 0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor.

### 1.2 API-funktiot

- Kasvit: GET listaus, GET by id, POST (create ilman device-objektia), PUT (update).
- Laitteet: GET listaus (query: status, deviceType **numeerisena 0–5**, offset, limit), GET by id, POST (create), PUT (update), DELETE.
- Kasvin laitteet: GET /api/plants/{id}/devices, POST /api/plants/{id}/devices/{deviceId}, DELETE /api/plants/{id}/devices/{deviceId}.
- Water-toggle: POST /api/plants/{id}/water (query-parametri deviceId jos backend tukee).

### 1.3 Tarkistuslista

- [ ] Plant-tyypissä `devices`-lista; kaikki viittaukset `plant.device` korjattu
- [ ] DeviceDto sisältää `deviceType`
- [ ] API-kutsut devices-endpointeille ja plants/{id}/devices -endpointeille toteutettu

---

## Vaihe 2: Kasvien muokkaus (UI)

### 2.1 Muokkausnäkymä

- Tarjoa tapa muokata kasvia: esim. kasvin yksityisnäkymässä "Muokkaa"-nappi tai oma muokkaussivu/modal.
- Lomake kentille: name, species, location, notes. Lähetä PUT /api/plants/{id} päivityksen yhteydessä.
- Käsittele onnistuminen (esim. päivitä paikallinen tila tai refetch) ja virheet (404, 400 – näytä virheviesti).

### 2.2 Tarkistuslista

- [ ] Muokkauslomake lähettää UpdatePlantRequestDto:n
- [ ] 404/400 näytetään käyttäjälle
- [ ] Päivitys näkyy heti (tai refetch)

---

## Vaihe 3: Laitteiden listaus ja CRUD (UI)

### 3.1 Laitteiden listaus

- Näkymä/sivu jossa listataan laitteet (GET /api/devices). Sivuutus ja suodatus (deviceType, status) valinnaisia mutta suositeltavia.
- Jokaisella listauksen laitteella: tiedot (deviceType, status, battery, jne.) ja toimintoja: muokkaa, poista.

### 3.2 Laitteen luonti

- Lomake/dialogi uuden laitteen luontiin. Kentät: deviceType (pakollinen, **numeerinen 0–5** – esim. dropdown/select arvoilla 0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor), status, battery, watering, moisture.
- Lähetä POST /api/devices. Body:n `deviceType` on **kokonaisluku** (0–5). Onnistuessa: näytä uusi laite tai ohjaa listaan. Virheellinen deviceType (esim. 99) → 400, näytä virheviesti.

### 3.3 Laitteen muokkaus

- Muokkauslomake/dialogi: sama rakenne kuin luonti, kentät valinnaisia (osittainen päivitys). PUT /api/devices/{id}. 404 käsittely.

### 3.4 Laitteen poisto

- Poistonappi + vahvistus. DELETE /api/devices/{id}. 204 → poista listasta tai refetch. 404 käsittely.

### 3.5 Tarkistuslista

- [ ] Laitteiden listaus toimii (ja suodatus jos toteutettu)
- [ ] Luonti lähettää CreateDeviceRequestDto:n, deviceType validoidaan
- [ ] Muokkaus ja poisto toimivat, virhekoodit käsitelty

---

## Vaihe 4: Kasvin laitteiden hallinta (UI)

### 4.1 Kasvin laitteiden listaus

- Kasvin yksityisnäkymässä (tai vastaavassa) näytetään kasviin liitetyt laitteet: GET /api/plants/{id}/devices tai käytä GET /api/plants/{id}:n vastauksen devices-listaa.
- Listaa laitteet (deviceType, status, jne.) ja tarjoa irrotus-toiminto per laite.

### 4.2 Laitteen linkitys kasviin

- Tapa linkittää olemassa oleva laite kasviin: esim. "Linkitä laite" -nappi, josta avautuu laitteen valinta (lista laitteista GET /api/devices). Valinnan jälkeen POST /api/plants/{id}/devices/{deviceId}.
- Käsittele 409 (linkitys jo olemassa) ja 404; näytä viesti käyttäjälle.

### 4.3 Laitteen irrotus

- Irrotus-nappi kasvin laitelistalla. DELETE /api/plants/{id}/devices/{deviceId}. Päivitä näkymä (poista listasta tai refetch).

### 4.4 Tarkistuslista

- [ ] Kasvin laitteet näkyvät
- [ ] Linkitys ja irrotus toimivat, 404/409 käsitelty

---

## Vaihe 5: Kasvin luonti

### 5.1 Luontilomake

- Kasvin luonti ilman yksittäistä device-objektia. Lomake: name, species, location (valinnainen), notes (valinnainen).
- Vaihtoehto A: ei deviceIds-kenttää; laitteet linkitetään myöhemmin (Vaihe 4).
- Vaihtoehto B: valinnainen kenttä "Linkitä laitteet" (deviceIds), esim. monivalinta olemassa olevista laitteista. Lähetä POST /api/plants bodylla jossa deviceIds.

### 5.2 Tarkistuslista

- [ ] POST /api/plants ei lähetä device-objektia
- [ ] Jos deviceIds käytössä, validointi ja 400-käsittely

---

## Vaihe 6: Water-toggle

### 6.1 Käyttäytyminen

- Backend määrittää säännön: joko kaikki kasvin Watering-tyyppiset laitteet tai yksi laite (deviceId-parametri).
- Frontend: kasvin näkymässä "Kastelu"- tai "Water"-nappi. Jos backend tukee deviceId-parametria ja kasvilla on useita kastelulaitteita, voi tarjota valinnan (mitä laitetta kytketään) tai kytkeä kaikki yhdellä napilla.
- Kutsu POST /api/plants/{id}/water (ja tarvittaessa ?deviceId=). Päivitä näkymä vastauksen jälkeen.

### 6.2 Tarkistuslista

- [ ] Water-toggle-nappi kutsuu oikeaa endpointtia
- [ ] Usean laitteen/valitun laitteen sääntö noudatettu

---

## Vaihe 7: Testaus ja raportointi

### 7.1 Toiminnallinen testaus

- Testaa koko flow: kirjautuminen, kasvien listaus (devices-listalla), kasvin muokkaus, laitteiden listaus/luonti/muokkaus/poisto, kasvin laitteiden linkitys ja irrotus, kasvin luonti, water-toggle.
- Varmista että virhetilanteet (404, 400, 409) näkyvät käyttäjälle.

### 7.2 Raportointi

- Raportoi [Oppimistehtävä 3 – raportointiohjeen](Oppimistehtava-3-raportointi-ohje.md) mukaisesti: mitkä vaiheet (1–7) toteutettiin, mitkä valinnat (esim. kasvin luonti A/B, water-toggle UI). Kuvakaappaukset keskeisistä näkymistä (kasvin muokkaus, laitteiden listaus, kasvin laitteet, linkitys).

---

## Yhteenveto (frontend)

| Vaihe | Sisältö                                                                      |
| ----- | ---------------------------------------------------------------------------- |
| 1     | API-client ja datan rakenne: devices-lista, DeviceDto.deviceType (numeerinen 0–5), API-kutsut |
| 2     | Kasvien muokkaus (PUT) – lomake ja virheenkäsittely                          |
| 3     | Laitteiden listaus ja CRUD – listaus, luonti, muokkaus, poisto               |
| 4     | Kasvin laitteiden hallinta – listaus, linkitys, irrotus                      |
| 5     | Kasvin luonti ilman device-objektia (ja mahd. deviceIds)                     |
| 6     | Water-toggle usealle/valitulle laitteelle                                    |
| 7     | Testaus ja raportointi                                                       |

Kun sekä [backend (2)](Oppimistehtava-2-tehtavananto.md) että frontend (2b) on toteutettu, sovellus tukee täysin kasvien ja laitteiden M–N-hallintaa sekä laitteiden omaa CRUDia.

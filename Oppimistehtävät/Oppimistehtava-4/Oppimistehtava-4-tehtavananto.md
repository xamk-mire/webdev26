# Oppimistehtävä 4: Plant Mock API -integraatio

## Johdanto

Tämä tehtävänanto on **jatkoa** [Oppimistehtävälle 3](../Oppimistehtava-3/Oppimistehtava-3-tethavananto.md). Tavoitteena on integroida **Plant Mock API** ([Harjoitus 3](../../Harjoitukset/Harjoitus-3/Harjoitus-3-Plant-API.md)) olemassa olevaan moisture-sovellukseen niin, että kasvien ja laitteiden **luonnissa sekä päivityksessä** voidaan hyödyntää Plant Mock API:sta saatavaa dataa.

Plant Mock API tarjoaa kasvitietoja (tieteellinen nimi, kansanomainen nimi, heimo, kuvaus, hoito-ohjeet jne.). Suunnittele ja toteuta ratkaisu, jolla nämä tiedot tuodaan hyödynniksi moisture-sovelluksen käyttäjälle.

---

## Edellytykset

- **[Oppimistehtävä 2](../Oppimistehtava-2/Oppimistehtava-2-tehtavananto.md)** (Backend) ja **[Oppimistehtävä 3](../Oppimistehtava-3/Oppimistehtava-3-tethavananto.md)** (Frontend) on toteutettu.
- **Plant Mock API** on käynnissä ([Harjoitus 3](../../Harjoitukset/Harjoitus-3/Harjoitus-3-Plant-API.md)) – Docker, migraatiot, seed-data ja API-avain luotu.

---

## Tavoitteet

Tehtävänannon tavoitteet kuvailevat **toiminnallisuuden**, ei yhtä tiettyä toteutustapaa. Suunnittele itse, miten tavoitteet saavutetaan.

| Tavoite                                       | Mitä halutaan saavuttaa                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Kasvin tietomallin laajennus**              | Olemassa olevan kasvin (Plant) tietoja laajennetaan sisältämään **hoito-ohjeet** (care).      |
| **Backend: kolmannen osapuolen API:n käyttö** | Backend voi hakea dataa Plant Mock API:sta. API-avain ei välity frontendille.                 |
| **Kasvin luonti**                             | Käyttäjä voi hyödyntää Plant Mock API:sta haettua dataa kasvin luontilomakkeen täyttämisessä. |
| **Kasvin päivitys**                           | Kasvin muokkauksessa voidaan hakea uutta dataa Plant Mock API:sta ja hyödyntää sitä.          |
| **Laitteen luonti**                           | Kasvin hoito-ohjeiden perusteella voidaan ehdottaa tai tukea sopivan laitetyypin valintaa.    |
| **Laitteen päivitys**                         | Laitetta muokattaessa voidaan hyödyntää kasvin hoito-ohjetta laitteen tyypin valinnassa.      |

---

## Plant Mock API – viitedata

Plant Mock API:n [dokumentaatio](https://github.com/xamk-mire/Plant-api/tree/main/plant-mock-api) ja [Harjoitus 3](../../Harjoitukset/Harjoitus-3/Harjoitus-3-Plant-API.md) kuvaavat endpointit ja datarakenteen. Alla lyhyt yhteenveto suhteesta moisture-sovelluksen entiteetteihin.

### Kasvitieto (Plant Mock API) ↔ moisture-Plant

Plant Mock API palauttaa kasveja kentillä mm. `scientific_name`, `common_name`, `description`, `care` (hoito-ohjeet). Moisture-sovelluksen kasvilla on kentät `name`, `species`, `location`, `notes`. **Kasvin tietomallia laajennetaan** sisältämään hoito-ohjeet – suunnittele, miten care-data tallennetaan (esim. erilliset kentät, yhdistetty notes-kenttä tai oma Care-objekti). Suunnittele myös, miten Plant Mock API:n data kohdistetaan moisture-sovelluksen kenttiin ja miten hoito-ohjeet hyödynnetään kasvin luonnissa, päivityksessä ja näyttämisessä.

### Hoito-ohjeet (Care) ↔ laitetyypit (DeviceType)

Plant Mock API:n `care`-objekti sisältää mm. `watering_frequency`, `light_requirement`, `humidity_range (min ja max arvot`, `temperature_range_c (min ja max arvot)`, `soil_type`. Moisture-sovelluksen laitteilla on DeviceType: Watering (0), Light (1), MoistureSensor (2), TemperatureSensor (3), HumiditySensor (4), LightSensor (5). Suunnittele, miten care-kentät voisivat ohjata tai ehdottaa sopivia laitetyyppejä – esim. kastelutieto → Watering, kosteustieto → MoistureSensor.

---

# Osa A — Backend

**Tavoite:** Backend voi hakea dataa Plant Mock API:sta ja palvella sitä frontendille. API-avain säilyy palvelimella. Kasvin tietomalli laajenee hoito-ohjeilla.

**Mitä suunnitella ja toteuttaa:**

- **Kasvin tietomallin laajennus** – lisää hoito-ohjeet (care) kasvi-entiteettiin. Suunnittele rakenne: erilliset kentät, JSON-kenttä vai oma Care-entiteetti. Migraatio tietokantaan.
- Tapa kutsua Plant Mock API:a (HTTP-client, konfiguraatio, API-avaimen käsittely).
- Tapa paljastaa Plant Mock API:n data frontendille – esim. proxy-endpointit tai vastaava.
- Kasvin API (POST, PUT, GET) tukee hoito-ohjeiden tallennusta ja palautusta.
- Arkkitehtuuri: missä kerroksessa kolmannen osapuolen API:ta kutsutaan (ks. [API-materiaali](../../Materiaalit/04-3-API-kaytto.md)).
- Virheenkäsittely kun Plant Mock API ei vastaa tai palauttaa virheen.

**Omat valinnat:** Hoito-ohjeiden tallennusmuoto, nimeäminen, endpoint-reitit – suunnittele itse.

---

# Osa B — Frontend: Kasvien luonti ja päivitys

**Tavoite:** Käyttäjä voi hakea kasvitietoja Plant Mock API:sta ja hyödyntää niitä kasvin luonnissa ja päivityksessä. Kasvin hoito-ohjeet näkyvät ja ovat hyödynnettävissä.

**Mitä suunnitella ja toteuttaa:**

- Tapa hakea kasvitietoja (hakusana, valinta hakutuloksista).
- Tapa täyttää tai päivittää kasvin lomakkeen kentät haetulla datalla – mikä kenttä mappautuu mihin, mukaan lukien hoito-ohjeet.
- **Hoito-ohjeiden näyttäminen** – kasvin yksityisnäkymässä tai listauksessa näytetään tallennetut hoito-ohjeet (kastelu, valo, kosteus, lämpötila, maaperä, lannoitus jne.).
- Missä kontekstissa haku tarjotaan (luontilomake, muokkauslomake, molemmat).
- Käyttökokemus: miten haku esitetään ja valinta tehdään.
- Virhetilanteiden käsittely (ei tuloksia, API ei vastaa).

**Omat valinnat:** UI-ratkaisu (dropdown, modal, erillinen sivu), hoito-ohjeiden esitystapa (esim. oma osio, laajennettava lista), mitä dataa näytetään valintalistaa varten.

---

# Osa C — Frontend: Laitteiden luonti ja päivitys

**Tavoite:** Kasvin hoito-ohjeiden perusteella voidaan ehdottaa tai tukea sopivan laitetyypin valintaa laitteen luonnissa ja päivityksessä.

**Mitä suunnitella ja toteuttaa:**

- Tapa hankkia kasvin hoito-ohjeet (esim. sama haku kuin kasvin lomakkeessa, tai linkitys olemassa olevaan kasviin).
- Logiikka: miten care-kentät mapataan suositeltaviin tai mahdollisiin laitetyyppeihin.
- Tapa esittää suositukset käyttäjälle laitteen tyypin valinnassa.
- Missä kontekstissa suositukset tarjotaan (laitteen luonti kasvin yhteydessä, yleinen laitteen luonti, molemmat).

**Omat valinnat:** Suosituslogiikka, UI (esim. ehdotuslistat, valmiiksi valitut, ohjetekstit), milloin suosituksia haetaan.

---

# Osa D — Testaus ja raportointi

**Tavoite:** Varmista toiminnallisuus ja raportoi toteutus.

- Testaa flow: Plant Mock API → backend → frontend → kasvin/laitteen luonti tai päivitys.
- Testaa virhetilanteet (esim. Plant Mock API pois päältä).
- Raportoi [Oppimistehtävä 4 – raportointiohjeen](Oppimistehtava-4-raportointi-ohje.md) mukaisesti: mitä toteutettiin, mitkä suunnitteluratkaisut tehtiin.

---

## Yhteenveto

| Osa   | Fokus                                                                                    |
| ----- | ---------------------------------------------------------------------------------------- |
| **A** | Backend: Kasvin tietomallin laajennus (hoito-ohjeet), Plant Mock API -integraatio, proxy, API-avaimen turvallinen käyttö |
| **B** | Frontend: Plant Mock -datan hyödyntäminen kasvin luonnissa ja päivityksessä, hoito-ohjeiden näyttäminen |
| **C** | Frontend: Hoito-ohjeiden hyödyntäminen laitetyypin valinnassa                            |
| **D** | Testaus ja raportointi                                                                   |

Tehtävänannon tavoitteet jättävät tilaa omaan suunnitteluun. Valitse toteutustapa (arkkitehtuuri, UI, logiikka) itse ja perustele valintasi raportissa. (Huom! "Tekoäly ehdotti" ei ole pätevä perustelu)

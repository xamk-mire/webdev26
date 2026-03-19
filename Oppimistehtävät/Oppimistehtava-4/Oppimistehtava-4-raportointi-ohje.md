# Raportointiohjeet: Oppimistehtävä 4 – Plant Mock API -integraatio

Näillä ohjeilla raportoidaan [Oppimistehtävä 4 – tehtävänanto](Oppimistehtava-4-tehtavananto.md) suoritus. Raportointi tehdään **sovelluksen käyttöliittymästä** ja **backend-rakenteesta** otettujen kuvakaappauksien avulla.

**Edellytys:** [Oppimistehtävä 2](../Oppimistehtava-2/Oppimistehtava-2-tehtavananto.md) ja [Oppimistehtävä 3](../Oppimistehtava-3/Oppimistehtava-3-tethavananto.md) on toteutettu. Plant Mock API on käynnissä ([Harjoitus 3](../../Harjoitukset/Harjoitus-3/Harjoitus-3-Plant-API.md)).

---

## 1. Yleistä

### 1.1 Sovellus ja palvelut

- **Frontend:** moisture-frontend ajossa.
- **Backend:** moisture-backend-net ajossa.
- **Plant Mock API:** ajossa osoitteessa `http://localhost:8000`.

### 1.2 Kuvakaappaukset

- Kuvakaappaukset otetaan sovelluksen käyttöliittymästä (selain) sekä tarvittaessa backendin rakenteesta (esim. Solution Explorer).
- Jokaisesta alla listatusta kohdasta vaaditaan **vähintään yksi kuvakaappaus**.

### 1.3 Autentikointi

- Kirjaudu sovellukseen ennen testausta.

---

## 2. Vaaditut kuvakaappaukset

### 4.1 Backend: Plant Mock API -proxy ja kasvin hoito-ohjeet (Osa A)

**Toiminto:** Backend tarjoaa proxy-endpointit Plant Mock API:lle. Kasvin tietomalli on laajennettu hoito-ohjeilla.

**Tarkistettavaa:**

- Kasvin entiteetti/DTO sisältää hoito-ohjeet (care).
- IPlantMockApiClient / PlantMockApiService tai vastaava toteutus.
- Proxy-endpointit: endpointit jotka ohjaavat plant-mock-api:n.
- API-avain konfiguraatiossa (ei kovakoodattuna).

**Raportointi:** Kuva backend-rakenteesta (esim. Solution Explorer: laajennettu Plant, uudet palvelut) tai Scalar UI:sta – mm. kasvin vastauksessa hoito-ohjeet näkyvät. **Ota kuvakaappaus**.

---

### 4.2 Kasvin luonti: Plant Mock API -haku (Osa B)

**Toiminto:** Kasvin luontilomakkeessa "Hae kasvitietoja" -toiminto; hakutulokset ja valinnan jälkeen täytetty lomake (mukaan lukien hoito-ohjeet).

**Tarkistettavaa:**

- Haku toimii (esim. hakusana "monstera").
- Valitun kasvin tiedot täyttävät lomakkeen (name, species, notes, hoito-ohjeet).
- Kasvi voidaan luoda onnistuneesti.

**Raportointi:** Kuva kasvin luontilomakkeesta, jossa näkyy joko hakutulokset tai valinnan jälkeen täytetty lomake (hoito-ohjeet mukana). **Ota kuvakaappaus**.

---

### 4.3 Kasvin muokkaus ja hoito-ohjeiden näyttö (Osa B)

**Toiminto:** Kasvin muokkauslomakkeessa "Hae kasvitietoja" -toiminto; valinnan jälkeen päivitetyt kentät. Kasvin yksityisnäkymässä näytetään tallennetut hoito-ohjeet.

**Tarkistettavaa:**

- Haku toimii muokkausnäkymässä.
- Valitun kasvin tiedot (mukaan lukien hoito-ohjeet) päivittävät lomakkeen kentät.
- Kasvin yksityisnäkymässä hoito-ohjeet näkyvät (kastelu, valo, kosteus, lämpötila, maaperä, lannoitus jne.).
- Muokkaus tallentuu.

**Raportointi:** Kuva kasvin muokkauslomakkeesta tai yksityisnäkymästä, jossa näkyy hakutulokset, päivitetyt kentät tai kasvin hoito-ohjeet. **Ota kuvakaappaus**.

---

### 4.4 Laitteen luonti: Hoito-ohjesuositukset (Osa C)

**Toiminto:** Laitteen luonnissa (tai muokkauksessa) kasvin hoito-ohjeiden perusteella ehdotetut laitetyypit.

**Tarkistettavaa:**

- Voidaan hakea kasvin hoito-ohjeet (Plant Mock API).
- Care-data mapataan suositeltuihin laitetyyppeihin (Watering, MoistureSensor, Light, jne.).
- Käyttäjä näkee suositukset ja voi valita laitteen tyypin.

**Raportointi:** Kuva laitteen luonti- tai muokkauslomakkeesta, jossa näkyvät hoito-ohjeen perusteella suositellut laitetyypit. **Ota kuvakaappaus**.

---

### 4.5 Valinnainen: Virhetilanne (Plant Mock API ei vastaa)

**Toiminto:** Kun Plant Mock API on pois päältä, sovellus käsittelee virheen ja näyttää viestin käyttäjälle.

**Raportointi:** Valinnainen. Kuvakaappaus virhetilanteesta (esim. "Kasvitietoja ei voitu hakea").

---

## 3. Yhteenveto – vaaditut kuvakaappaukset

| Kohta | Näkymä/toiminto                         | Kuvakaappaus                                       |
| ----- | --------------------------------------- | -------------------------------------------------- |
| 4.1   | Backend: Plant Mock API -proxy, kasvin hoito-ohjeet | Backend-rakenne tai Scalar UI (kasvin vastaus hoito-ohjeineen) |
| 4.2   | Kasvin luonti + Plant Mock -haku        | Luontilomake, haku ja/tai täytetty lomake          |
| 4.3   | Kasvin muokkaus, hoito-ohjeiden näyttö  | Muokkauslomake tai yksityisnäkymä hoito-ohjeineen  |
| 4.4   | Laitteen luonti + hoito-ohjesuositukset | Laitteen lomake, suositellut laitetyypit näkyvissä |

**Vähintään 4 kuvakaappauksen** (4.1–4.4) tulee olla Oppimistehtävä 4 -raportissa.

---

## 4. Tekstiosio raportissa

Raportissa tulee **selittää toteutustavat auki** ja **perustella valintansa**. Tämä osio on pakollinen.

### 4.1 Toteutetut osat

Kuvaile mitkä tehtävänannon osat (A, B, C) toteutettiin ja mitkä jäivät valinnaisiksi tai pois.

### 4.2 Toteutustapojen selitys ja perustelut

**Osa A – Backend:** Kuvaile omat ratkaisusi ja **perustele miksi**:

- Miten kasvin tietomalli laajennettiin hoito-ohjeilla (tallennusmuoto, rakenne)?
- Miten Plant Mock API kutsutaan (esim. HttpClient, palvelukerros, proxy-endpointit)?
- Miksi valitsit juuri tämän arkkitehtuurin tai rakenteen?
- Miten API-avain käsitellään ja miksi näin?

**Osa B – Kasvien luonti ja päivitys:** Kuvaile omat ratkaisusi ja **perustele miksi**:

- Miten Plant Mock -haku integroitui lomakkeisiin (UI-ratkaisu, hakumomentti)?
- Miten Plant Mock API:n kentät (mukaan lukien hoito-ohjeet) mapattiin moisture-sovelluksen kenttiin?
- Miten hoito-ohjeet esitetään kasvin näkymässä (yksityisnäkymä, lista)?
- Miksi valitsit juuri tämän käyttökokemuksen?

**Osa C – Laitteiden luonti ja päivitys:** Kuvaile omat ratkaisusi ja **perustele miksi**:

- Miten hoito-ohjeet (Care) mapattiin suositeltaviin laitetyyppeihin?
- Missä kontekstissa suositukset tarjotaan ja miksi?
- Miten suositukset esitettiin käyttäjälle?

### 4.3 Mahdolliset rajoitteet

Kuvaile rajoitteet tai poikkeamat (esim. virheenkäsittely, osittainen mapping). Selitä miksi jotain ei toteutettu tai miksi valinta tehtiin eri tavalla.

---

## 5. Tarkistuslista ennen luovutusta

- [ ] Plant Mock API, backend ja frontend ajossa.
- [ ] Kohdat 4.1–4.4 testattu ja toimivat.
- [ ] Jokaisesta kohdasta 4.1–4.4 on kuvakaappaus.
- [ ] Tekstiosio täytetty: toteutetut osat, **toteutustapojen selitys ja perustelut**, mahdolliset rajoitteet.

## Tehtävä: Toteuta uusi ominaisuus

Tehtävää on suositeltavaa toteuttaa raportointi ohjeiden vaiheissa. Älä toteuta sovellusta valmiiksi ja raportoi vasta sen jälkeen, sillä raportti sisältää vaiheita joita ei voida toteuttaa valmiille sovellukselle.

Pyri toteuttamaan tehtävää mahdollisimman paljon itsenäisesti, testataksesi kuinka hyvin osaat koodata sekä ymmärrät koodia ilman apuvälineitä (esim. AI työkalut).

---

**Toteuta tehtäville valinnainen määräpäivä.**

- **Backend:** Lisää valinnainen `dueDate`-kenttä (ISO-päivämäärämerkkijono, esim. `2025-03-15`). Kun arvo annetaan, validoi että se on kelvollinen päivämäärä; valinnaisesti hylkää menneet päivät. Palauta kenttä GET-vastauksessa ja hyväksy se POST- ja PUT-pyynnöissä. Tallenna se **muistissa** olevaan “tietokantaan”. (toteutus ei sisällä erillistä tietokantaa)

- **Frontend:** Lisää määräpäivän syöttökenttä “lisää tehtävä”- ja “muokkaa tehtävää”-lomakkeisiin. Näytä määräpäivä tehtävälistassa. Listatessa näytä visuaalinen vihje (esim. eri väri tai “Myöhässä”) tehtäville, joiden määräpäivä on mennyt.

Onnea; koodi on tarkoituksella "työläs", jotta jokainen refaktorointiaskel parantaa rakennetta ja ylläpidettävyyttä selkeästi.

---

# Raportoinnin ohjeet – Refaktorointiharjoitus

- **Muoto:** Vain PDF.
- **Tiedostonimi:** Käytä selkeää nimeämistä, esim. `Refaktorointiraportti_Sukunimi_Etunimi.pdf` tai `Refaktorointiraportti_Opiskelijanumero.pdf`.
- **Sisältö:** Tekstiosiot + **pakolliset kuvakaappaukset** alla olevan rakenteen mukaisesti.

---

## Raportin rakenne

Noudata tätä rakennetta PDF:ssä. Jokainen osio, jossa vaaditaan kuvakaappauksia, on merkitty **(kuvakaappaus vaaditaan)**.

### 1. Otsikko ja tunnistetiedot

- Raportin otsikko: esim. “Refaktorointiharjoitus – Task Manager”
- Nimesi ja tarvittaessa opiskelijanumero / kurssi
- Palautuspäivä
- Linkki github classroom repositorioosi

### 2. Alkuperäinen sovellus (ennen muutoksia)

**Tarkoitus:** Näytä sovelluksen lähtötila.

- **(Kuvakaappaus vaaditaan)** **Käynnissä oleva sovellus:** Yksi kuvakaappaus Task Manager -käyttöliittymästä, kun projekti on käynnissä (backend + frontend). Kuvakaappauksen tulee näyttää tehtävälista ja “lisää tehtävä” -lomake, jotta lukija näkee alkuperäisen layoutin ja kentät (määräpäivää ei vielä).
- **(Valinnainen)** Lyhyt lause, jossa todetaan, että kyseessä on muuttamaton projekti ennen määräpäiväominaisuuden toteutusta tai refaktorointia.

### 3. Määräpäiväominaisuus alkuperäisessä koodissa

**Tarkoitus:** Näytä, että toteutit määräpäiväominaisuuden _refaktoroimattomassa_ koodissa ja kuvaa vaikeudet.

- **(Kuvakaappaus vaaditaan)** **Käyttöliittymä määräpäivällä (alkuperäinen koodi):** Vähintään yksi kuvakaappaus sovelluksesta sen jälkeen, kun olet lisännyt määräpäiväominaisuuden _ilman_ refaktorointia. Kuvakaappauksen tulee näyttää:
  - Lisää tehtävä -lomake määräpäiväkentällä (tai muokkauslomake määräpäivällä).
  - Tehtävälista, jossa vähintään yhdellä tehtävällä on määräpäivä näkyvissä.
  - “Myöhässä” (tai vastaavan) vihje myöhästyneille tehtäville (esim. tehtävä, jonka määräpäivä on mennyt, ja visuaalinen vihje).

- **Lyhyt teksti (suositeltava):** Kuvaa muutamalla lauseella, mitä jouduit muuttamaan (esim. mitkä tiedostot ja metodit) ja mikä oli työlästä tai virhealtista (esim. duplikoitu validointi, monet samankaltaisesti nimetty muuttujat, useita päivitettäviä kohtia).

### 4. Refaktorointi (backend ja frontend)

**Tarkoitus:** Näytä ja kuvaa lyhyesti tekemäsi refaktorointi.

- **(Kuvakaappaus vaaditaan)** **Backend-rakenne:** Yksi tai useampi kuvakaappaus refaktoroimastasi backendistä (esim. Solution Explorer / kansiorakenne), jossa näkyvät uudet tai uudelleenjärjestetyt elementit, kuten:
  - Erilliset projektit tai kansiot DTO:ille, palveluille, repositorioille (jos otit ne käyttöön).
  - Kontrollerit, jotka delegoivat palveluille eivätkä sisällä kaikkea logiikkaa.
  - Voit lisätä kuvakaappauksen keskeisestä tiedostosta (esim. palvelu tai repositorio-rajapinta), jos se selkeyttää; pidä kuva luettavana (esim. rajaa tai zoomaa).

- **(Kuvakaappaus vaaditaan)** **Frontend-rakenne:** Yksi tai useampi kuvakaappaus refaktoroimastasi frontendistä (esim. kansio-/tiedostorakenne IDE:ssä), jossa näkyy:
  - Pilkotut komponentit ja/tai API-client-moduuli.
  - Missä tyypit ja API-kutsut sijaitsevat.

- **Lyhyt teksti (suositeltava):** Luettele lyhyesti tärkeimmät refaktorointiaskeleet (esim. “Otin käyttöön TaskService ja ITaskRepository”, “Erotin TaskForm- ja TaskList-komponentit”, “Lisäsin TypeScript-tyypit ja API-clientin”). Pitkiä koodilistauksia ei tarvita; kuvakaappaukset ja lyhyet kuvaukset riittävät.

### 5. Määräpäiväominaisuus refaktoroituun koodiin

**Tarkoitus:** Näytä, että sovellus toimii edelleen refaktoroinnin jälkeen ja että määräpäiväominaisuus on integroitu uuteen rakenteeseen.

- **(Kuvakaappaus vaaditaan)** **Käyttöliittymä määräpäivällä (refaktoroitu koodi):** Vähintään yksi kuvakaappaus sovelluksesta _refaktoroinnin jälkeen_ käynnissä, jossa näkyy:
  - Määräpäiväkenttä lisäys- ja/tai muokkauslomakkeessa.
  - Tehtävälista tehtävineen, joilla on määräpäivä (ja tarvittaessa “Myöhässä” tai vastaava vihje).
- **(Valinnainen)** Yksi kuvakaappaus pienestä, representatiivisesta refaktoroitua koodia (esim. miten määräpäivä lisätään API-clientissa tai komponentissa) osoittaaksesi, että muutos on paikallinen. Pidä pätkä lyhyenä ja luettavana.

### 6. Yhteenveto ja reflektio

- **Lyhyt teksti:** Muutamalla lauseella (tai lyhyessä kappaleessa) pohti:
  - Miten määräpäivän lisääminen _alkuperäiseen_ koodiin vertautui sen lisäämiseen (tai viimeistelemiseen) _refaktoroituun_ koodiin (esim. koskettujen tiedostojen määrä, riski rikkoa jotain, nimeämisen selkeys).
  - Mitä tekisit seuraavaksi, jos jatkaisit refaktorointia (esim. testit, lisää komponentteja, virheenkäsittely).

---

## Kuvakaappausten vaatimukset (yhteenveto)

| Oso                                   | Mitä kuvakaappauksessa näytetään                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2. Alkuperäinen sovellus              | Käynnissä oleva käyttöliittymä: tehtävälista + lisäyslomake (ilman määräpäivää).                                                            |
| 3. Määräpäivä alkuperäisessä koodissa | Käyttöliittymä määräpäiväkentällä, lista määräpäivineen ja “Myöhässä” -vihje.                                                               |
| 4. Refaktorointi                      | Backend: solution-/kansiorakenne (esim. palvelut, DTO:t, repositoriot). Frontend: kansio-/tiedostorakenne (esim. komponentit, API-moduuli). |
| 5. Määräpäivä refaktoroituun koodiin  | Käynnissä oleva käyttöliittymä refaktorointien jälkeen: määräpäivä lomakkeissa ja listassa; valinnainen: pieni koodipätkä.                  |

- **Laatu:** Kuvakaappauksen tulee olla **luettava** (riittävä resoluutio, ei liian pakattua). Rajaa tai muuta kokoa tarvittaessa, jotta oleellinen osa (esim. lomake, lista tai tiedostopuu) on selkeä.
- **Selitteet:** Voit lisätä lyhyitä selitteitä tai nuolia kuvakaappauksiin (esim. “Määräpäiväkenttä”), jos se auttaa; muuten varmista, että vaaditut elementit näkyvät ja osion teksti viittaa niihin.

---

## Palautus

- Palauta **yksi PDF-tiedosto**, joka sisältää kaikki yllä olevat osiot ja kaikki vaaditut kuvakaappaukset.
- **Älä** palauta erillisiä kuvatiedostoja, ellei opettaja erikseen pyydä; kaikki tulee sisällyttää yhteen PDF:ään.
- Varmista, että PDF avautuu oikein ja että kaikki kuvat näkyvät, kun dokumenttia katsotaan 100 % tai tavallisella zoomauksella.

---

## Tarkistuslista ennen palautusta

- [ ] PDF-muoto; tiedostonimessä nimi tai opiskelijanumero.
- [ ] Oso 1: Otsikko ja nimesi/opiskelijanumerosi ja päivämäärä.
- [ ] Oso 2: Kuvakaappaus alkuperäisestä käynnissä olevasta sovelluksesta (tehtävälista + lisäyslomake).
- [ ] Oso 3: Kuvakaappaus(ia) käyttöliittymästä määräpäivällä _alkuperäisessä_ koodissa; lyhyt kuvaus vaikeuksista.
- [ ] Oso 4: Kuvakaappaus(ia) refaktoroitu backend- ja frontend-rakenteesta; lyhyt luettelo refaktorointiaskeleista.
- [ ] Oso 5: Kuvakaappaus(ia) käyttöliittymästä määräpäivällä _refaktoroitu_ sovellus.
- [ ] Oso 6: Lyhyt yhteenveto ja reflektio.
- [ ] Kaikki kuvakaappaukset ovat luettavia ja näyttävät vaaditut elementit.

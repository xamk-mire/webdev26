# Harjoitustehtävä 3: Plant Mock API – Kolmannen osapuolen API:n käyttö

## Tavoite

Tutustut **Plant Mock API** -palveluun ja otat sen käyttöön. Harjoitus opettaa:

- verkossa olevien API:ien perustoiminnon
- kolmannen osapuolen API:n käynnistämisen (self hosted)
- API-avaimen käytön
- API:n testaamisen **Scalar API -dokumentaation** avulla

**Lue ensin materiaali:** [04-3-API-kaytto.md](../../Materiaalit/04-3-API-kaytto.md)

---

## Plant Mock API – lyhyt yleiskatsaus

Plant Mock API on REST-palvelu, joka tarjoaa kasvitietoja (tieteellinen nimi, hoito-ohjeet jne.) älykasvihuone-sovelluksille. Se toimii **read-only** -mock-datalähteenä.

| Ominaisuus    | Arvo                                                |
| ------------- | --------------------------------------------------- |
| Base URL      | `http://localhost:8000`                             |
| Autentikointi | API-avain (`X-API-Key` tai `Authorization: Bearer`) |
| Dokumentaatio | `http://localhost:8000/docs` (Scalar)               |

---

# Osa A — Plant Mock API:n käynnistys ja tutustuminen

## A1 — Hanki Plant Mock API -projekti

Lataa Plant Mock API projekti täältä: [Plant Mock API](https://github.com/xamk-mire/Plant-api/tree/main/plant-mock-api)

Varmista, että sinulla on käytettävissä:

- `plant-mock-api` -projektin kansio
- Python 3.11+
- Docker ja Docker Compose

Helpottaaksesi seuraavan oppimistehtävän tekoa projekti kannattaa sijoittaa saman kansion sisälle mistä oppimistehtävän projektikin löytyy. Sijainnilla ei ole merkitystä sovelluksen toiminnan tai käytön kannalta.

---

## A2 — Käynnistä tietokanta (Docker)

Siirry plant-mock-api -kansioon ja käynnistä PostgreSQL:

```bash
cd plant-mock-api
docker-compose up -d postgres
```

Oleta noin 10–15 sekuntia, että tietokanta on valmis.

**Tarkista:** `docker ps` – `plant-mock-db` -kontti näkyy käynnissä.

---

## A3 — Asenna riippuvuudet ja konfiguroi

```bash
pip install -r requirements.txt
cp .env.example .env
```

`.env`-tiedostossa on oletuksena oikea `DATABASE_URL` (portti 5433).

---

## A4 — Suorita migraatiot ja seed-data

```bash
alembic upgrade head
python -m scripts.seed_plants
```

**Tärkeä:** `seed_plants` tulostaa **API-avaimen** vain kerran. Tallenna se turvallisesti.

Esimerkki tulosteesta:

```
Seeded 14 plants.

--- API Key (store securely, shown once) ---
pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
--------------------------------------------
Use header: X-API-Key: <key>
```

Jos avain on jo olemassa, saat viestin "Plants already seeded". Luo uusi avain:

```bash
python -m scripts.add_api_key greenhouse-app
```

---

## A5 — Käynnistä API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

✅ **Checkpoint:** Avaa selaimessa `http://localhost:8000/health` → `{"status":"ok"}`

---

## A6 — Käytä Plant API:a Scalar API -dokumentaatiolla

Scalar on interaktiivinen API-dokumentaatio, jolla voit testata kaikkia endpointteja suoraan selaimesta.

1. Avaa **`http://localhost:8000/docs`** – Scalar API -dokumentaatio
2. Kokeile **`GET /v1/plants`** – ilman avainta saat **401 Unauthorized**
3. Lisää autentikointi: Scalarissa **Authorize** → syötä API-avain (käytä `X-API-Key` tai Bearer)
4. Kokeile uudelleen **`GET /v1/plants`** → saat listan kasveista
5. Kokeile **`GET /v1/plants/search?q=monstera`** – haun parametri on `q`
6. Kokeile **`GET /v1/plants?family=Araceae`** – suodatus heimon mukaan
7. Kopioi jonkin kasvin `id` vastauksesta ja kokeile **`GET /v1/plants/{plant_id}`** – yhden kasvin haku

✅ **Checkpoint:** Plant API on käytössä ja kaikki pääendpointit on testattu Scalarilla. Harjoitus on valmis.

---

## A7 — Testaa API esim. curlilla (valinnainen)

```bash
curl -H "X-API-Key: pk_xxx" http://localhost:8000/v1/plants
curl -H "X-API-Key: pk_xxx" "http://localhost:8000/v1/plants?search=aloe"
```

Korvaa `pk_xxx` oikealla API-avaimella.

---

# Osa B — Tutustu verkossa oleviin API:hin

Tutustu **julkisiin verkossa saatavilla oleviin API:ihin**. Näin saat kokemuksen siitä, miten ulkoisia rajapintoja dokumentoidaan, testataan ja käytetään – useimmat vaativat API-avaimen, mutta osa toimii ilman autentikointia.

## Suositeltavat julkiset API:t (ilman avainta tai ilmaisella rekisteröinnillä)

| API                 | Kuvaus                                            | Base URL                               | Dokumentaatio                                                         |
| ------------------- | ------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| **JSONPlaceholder** | Tarjoaa fake-dataa (postit, käyttäjät, kommentit) | `https://jsonplaceholder.typicode.com` | [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com/) |
| **REST Countries**  | Maatiedot (nimi, pääkaupunki, valuutta jne.)      | `https://restcountries.com/v3.1`       | [restcountries.com](https://restcountries.com/)                       |
| **Open-Meteo**      | Säädata (ei API-avainta)                          | `https://api.open-meteo.com/v1`        | [open-meteo.com](https://open-meteo.com/en/docs)                      |
| **Dog CEO**         | Satunnainen koirakuva                             | `https://dog.ceo/api`                  | [dog.ceo](https://dog.ceo/dog-api/)                                   |

## API-hakemistot

- **[Public APIs](https://github.com/public-apis/public-apis)** – lista julkisista API:ista (GitHub)
- **[API List](https://apilist.fun/)** – suodatettava lista API:ista

## Tehtävä: Kokeile yhtä API:a

1. Avaa selaimessa tai curlilla esim.:
   - `https://jsonplaceholder.typicode.com/posts/1` – yksi fake-postaus
   - `https://restcountries.com/v3.1/name/finland` – Suomen tiedot
   - `https://api.open-meteo.com/v1/forecast?latitude=60.17&longitude=24.94&current=temperature_2m` – sää Helsingissä
2. Tarkista dokumentaatiosta, mitä parametreja ja endpointteja on tarjolla
3. Kokeile vaihtaa parametreja (esim. eri maa, eri koordinaatit)

**Curl-esimerkkejä:**

```bash
curl https://jsonplaceholder.typicode.com/posts/1
curl "https://restcountries.com/v3.1/name/finland"
curl "https://api.open-meteo.com/v1/forecast?latitude=60.17&longitude=24.94&current=temperature_2m"
```

✅ **Checkpoint:** Sain vastauksen JSON-muodossa ja ymmärrän dokumentaatiosta, miten API:ta käytetään.

---

# Palautuschecklista

## Osa A — Plant API

- [ ] Docker PostgreSQL käynnissä
- [ ] Migraatiot ajettu
- [ ] Seed-data ja API-avain luotu
- [ ] API vastaa `/health` ja `/v1/plants` (avaimella)
- [ ] Kaikki endpointit testattu Scalar API -dokumentaatiolla (`/docs`)

## Osa B — Verkossa olevat API:t

- [ ] Tutustuin vähintään yhteen julkiseen API:hin
- [ ] Kokeilin API:a (selain/curl) ja sain JSON-vastauksen

---

# Bonushaasteet (valinnainen)

- ⭐ **Integroi ASP.NET Core -backendiin:** Toteuta oma backend, joka kutsuu Plant API:a HttpClientilla ja palauttaa kasvidatan
- ⭐ **Frontend:** Rakenna React-sovellus, joka hakee kasvit backending tai suoraan Plant API:sta (CORS sallittuna)
- ⭐ **Curl/Postman:** Kokeile kaikkia endpointteja curlilla tai Postmanilla API-avaimen kanssa

---

# Vianmääritys

## Plant API ei käynnisty

- Tarkista että PostgreSQL on käynnissä: `docker ps`
- Tarkista portti 5433: `netstat -ano | findstr :5433` (Windows)
- Nollaa tietokanta: `docker-compose down -v && docker-compose up -d postgres` → odota 15 s → `alembic upgrade head`

## 401 Unauthorized (Scalarissa tai curlilla)

- Varmista että API-avain on oikein (kopioi seed_plants- tai add_api_key -tulosteesta)
- Tarkista että header on `X-API-Key: pk_xxx` tai `Authorization: Bearer pk_xxx`

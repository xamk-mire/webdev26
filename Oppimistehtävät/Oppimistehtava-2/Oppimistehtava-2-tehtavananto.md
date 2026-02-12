# Oppimistehtävä 2: Backend – Kasvien muokkaus ja laitteiden erillinen hallinta (M–N)

## Johdanto

Tämä tehtävänanto keskittyy **vain backend-päivitykseen**. Tavoitteena on laajentaa **moisture-backend-net** -sovellusta (Migraatio-Suunnitelman pohjalta) niin, että API tukee:

1. **Kasvien muokkaus** – PUT-endpoint kasvien tietojen päivittämiseen sekä kasviin liitettyjen laitteiden hallintaan (listaus, linkitys, irrotus).
2. **Laitteiden erillinen hallinta** – laitteet omana entiteettinään: CRUD-endpointit (GET/POST/PUT/DELETE /api/devices), laite tyyppi (DeviceType) ja kasvi–laite -linkitys (M–N).

**Tietomallin muutos:** Nykyinen 1–1-suhde (yksi kasvi – yksi laite) korvataan **monen-suhteeseen-moneen (M–N)** -suhteella: yksi kasvi voi olla usean laitteen kanssa, yksi laite voi kuulua usealle kasville.

Frontendin päivittäminen uutta API:a vastaan käsitellään erillisessä tulevassa oppimistehtävässä.

---

## Edellytykset

- **moisture-backend-net** on [Migraatio-Suunnitelman](Migraatio-Suunnitelma.md) vaiheiden 1–7 mukaisesti toteutettu (auth, plants CRUD, water-toggle, health, Scalar UI).
- Tietokanta ja entiteetit (`User`, `Plant`, `Device`) ovat käytössä. Tehtävän toteutuksessa kasvi–laite -suhde muutetaan 1–1 → M–N (Vaihe 0).

---

## Tavoitteet (backend)

| Tavoite                   | Kuvaus                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Kasvien muokkaus**      | Kasvin tietojen päivitys (`PUT /api/plants/{id}`) sekä kasviin liitettyjen laitteiden hallinta (listaus, linkitys, irrotus). |
| **Laitteiden luonti**     | Uusien laitteiden lisääminen järjestelmään (`POST /api/devices`).                                                            |
| **Laitteiden muokkaus**   | Olemassa olevan laitteen tietojen päivitys (`PUT /api/devices/{id}`).                                                        |
| **Laitteiden poisto**     | Laitteen poistaminen (`DELETE /api/devices/{id}`); linkitykset kasveihin poistetaan.                                         |
| **Laitteen tyyppi**       | Jokaisella laitteella DeviceType (esim. Watering, MoistureSensor); tyyppi luodaan ja muokataan laitteen CRUDissa.            |
| **Kasvi–laite -linkitys** | API tarjoaa tavan listata kasvin laitteet, linkittää laite kasviin ja irrottaa laite kasvista (M–N).                         |

---

## Vaihe 0: Tietomallin muutos (Plant–Device M–N)

Nykyinen malli: `Device` sisältää `PlantId` (1–1). Uusi malli: **monen-suhteeseen-moneen** – liitostaulu kasvien ja laitteiden välillä.

### 0.1 Liitostaulu (Plant–Device M–N)

Kasvien ja laitteiden välinen M–N toteutetaan **liitostaulun** avulla. **Oletus: implisiittinen liitostaulu** (EF Core luo taulun automaattisesti); **vaihtoehto: eksplisiittinen PlantDevice-entiteetti**.

---

### 0.1 A) Oletus: Implisiittinen liitostaulu

- **Plant:** `public ICollection<Device> Devices { get; set; } = new List<Device>();`
- **Device:** `public ICollection<Plant> Plants { get; set; } = new List<Plant>();`

**AppDbContext:**

```csharp
modelBuilder.Entity<Plant>()
    .HasMany(p => p.Devices)
    .WithMany(d => d.Plants)
    .UsingEntity<Dictionary<string, object>>(
        "PlantDevice",
        j => j.HasOne<Device>().WithMany().HasForeignKey("DeviceId"),
        j => j.HasOne<Plant>().WithMany().HasForeignKey("PlantId"));
```

Vaihtoehto: `HasMany(...).WithMany(...);` ilman UsingEntity – EF luo taulun automaattisesti.

---

### 0.1 B) Vaihtoehtoinen ratkaisu: Eksplisiittinen PlantDevice-entiteetti

Jos tarvitset liitostaululle omat kentät (esim. `LinkedAt`), käytä omaa **PlantDevice**-entiteettiä (PlantId, DeviceId, navigaatiot, yhdistetty uniikki indeksi). Konfiguroi AppDbContext: DbSet, HasKey, HasOne/WithMany. Dokumentoi valinta.

---

### 0.2 Entiteettimuutokset

Rakenne riippuu valinnasta kohdassa 0.1 (implisiittinen vs. eksplisiittinen liitostaulu). Tee muutokset **järjestyksessä**, jotta viittaukset pysyvät kunnossa.

#### Plant-entiteetti

- **Poista** vanha 1–1-viittaus: yksittäinen navigaatio `Device` ja mahdollinen `DeviceId`-sarakkeen mappaus (jos oli).
- **Implisiittinen liitostaulu (oletus):** Lisää kasville laitteiden kokoelma:
  ```csharp
  public ICollection<Device> Devices { get; set; } = new List<Device>();
  ```
- **Eksplisiittinen liitostaulu:** Lisää kokoelma liitostaulu-entiteeteistä, esim. `public ICollection<PlantDevice> PlantDevices { get; set; }`. Laitteisiin pääsy esim. apupropertylla tai kyselyillä (`PlantDevices.Select(pd => pd.Device)`).
- Kasvi voi olla olemassa ilman laitteita (tyhjä kokoelma).

#### Device-entiteetti

- **Poista** vanha 1–1-viittaus: `PlantId`-kenttä ja `Plant`-navigaatio.
- **Implisiittinen:** Lisää kasvien kokoelma:
  ```csharp
  public ICollection<Plant> Plants { get; set; } = new List<Plant>();
  ```
- **Eksplisiittinen:** Lisää `public ICollection<PlantDevice> PlantDevices { get; set; }`.
- **Lisää laitteen tyyppi:** Kenttä tyyppiä **DeviceType** (enum). Enum määritellään samassa tiedostossa tai erillisessä (ks. 0.3). Esimerkki:
  ```csharp
  public DeviceType Type { get; set; }  // enum DeviceType
  ```
- Device voi olla olemassa ilman kasveja (tyhjä kokoelma). Säilytä muut kentät: Status (DeviceStatus), Battery, Watering, Moisture, CreatedAt, UpdatedAt.

#### AppDbContext

- **Poista** vanha Plant–Device 1–1 -konfiguraatio (HasOne/WithOne, HasForeignKey Device.PlantId).
- **Implisiittinen:** Lisää many-to-many kohdan 0.1 A mukaisesti (HasMany/WithMany, UsingEntity "PlantDevice").
- **Eksplisiittinen:** Lisää `DbSet<PlantDevice>` ja PlantDevice-konfiguraatio (yhdistetty avain, uniikki indeksi, HasOne/WithMany).
- **Device.Type (DeviceType-enum):** Määritä tallennusmuoto tietokantaan. Vaihtoehdot:
  - **Merkkijono (suositus lukemisen ja API-yhteensopivuuden vuoksi):**  
    `entity.Property(d => d.Type).HasConversion<string>();`  
    Tietokannassa arvot esim. "MoistureSensor", "Watering".
  - **Kokonaisluku:** Oletus (ei HasConversion) tallentaa enum-numerona (0, 1, 2, …). Dokumentoi jos käytät.
- **DeviceStatus:** Voit jättää oletukseksi (int) tai käyttää HasConversion<string> – dokumentoi.

#### Tarkistuslista (0.2)

- [ ] Plant: ei enää Device/DeviceId; kokoelma Devices (tai PlantDevices).
- [ ] Device: ei enää PlantId/Plant; kokoelma Plants (tai PlantDevices); Type (DeviceType-enum) lisätty.
- [ ] AppDbContext: vanha 1–1 poistettu; M–N konfiguroitu; Device.Type HasConversion (string tai int) asetettu.

---

### 0.3 Laite tyyppi (DeviceType) – enum koko toteutuksessa

> Huom! Mikäli käytät tehtävän teossa tekoälyä huomioi, että tekoälyökalut eivät jostain syystä tykkää Enumeista ja yrittävät usein convertoida enumit stringeiksi. (training data ongelma)

**DeviceType** käsitellään **enumina kaikkialla** sovelluslogiikassa. **API-kutsuissa (request/response ja query-parametri) DeviceType välitetään numeerisena** – eli enumin kokonaislukuarvona (0, 1, 2, …). Oletus: frontend käsittelee DeviceType:n myös enumina ja käyttää samoja numeerisia arvoja.

#### Enum-määrittely

- **Sijainti:** esim. `Models/Entities/Device.cs` (samassa tiedostossa Device-luokan kanssa) tai erillinen `Models/Entities/DeviceType.cs`.
- **Arvot ja numeerinen API-sopimus:** C#-enumin järjestys määrittää numerot. Dokumentoi frontendille sama taulukko:

| Numeerinen arvo (API) | Enum-arvo (C#)    | Kuvaus                        |
| --------------------- | ----------------- | ----------------------------- |
| 0                     | Watering          | Kastelulaite                  |
| 1                     | Light             | Valolaite (esim. kasvilamppu) |
| 2                     | MoistureSensor    | Kosteussensori                |
| 3                     | TemperatureSensor | Lämpötilasensori              |
| 4                     | HumiditySensor    | Ilmankosteussensori           |
| 5                     | LightSensor       | Valoisuussensori              |

Esimerkki:

```csharp
public enum DeviceType
{
    Watering,           // 0
    Light,              // 1
    MoistureSensor,     // 2
    TemperatureSensor,  // 3
    HumiditySensor,     // 4
    LightSensor         // 5
}
```

#### Käyttö kerroksittain (enum kaikkialla, API numeerinen)

- **Entiteetti (Data):** `Device.Type` on tyyppiä `DeviceType` (ks. 0.2). Tietokantaan tallennus: **suositus kokonaisluku** (ei HasConversion – EF tallentaa enumin numerona), jolloin API ja tietokanta ovat yhtenäiset. Vaihtoehto: HasConversion<string> jos haluat tietokannassa luettavat merkkijonot.
- **DTO:t (Models/Dtos):** Käytä **enum-tyyppiä** DTO-kentissä:
  - **DeviceDto:** `DeviceType DeviceType` (tai kentän nimi `Type`). JSON-vastauksessa arvo **kokonaislukuna** (oletus System.Text.Json).
  - **CreateDeviceRequestDto:** `DeviceType DeviceType` (pakollinen luonnissa).
  - **UpdateDeviceRequestDto:** `DeviceType? DeviceType` (valinnainen osittaisessa päivityksessä).
  - **JSON-serialisointi:** **Älä lisää** JsonStringEnumConverteria – jätetään ASP.NET Corein oletus (enum → int). Request/response sisältää siis `"deviceType": 2` eikä `"deviceType": "MoistureSensor"`.
- **Controller:** Query-parametri `deviceType` tulee HTTP:stä **numerona** (esim. `?deviceType=2`). Vastaanota esim. `int? deviceType`; tarkista `Enum.IsDefined(typeof(DeviceType), value)` ja muunna `(DeviceType)value`; virheellisestä arvosta → 400. Välitä servicelle **DeviceType?**.
- **Service (IDevicesService / DevicesService):** Sisäisesti käytä **DeviceType** / **DeviceType?** (ei string eikä int-logiikkaa). Luonti ja päivitys kuten aiemmin; listaus/suodatus `GetAllAsync(..., DeviceType? deviceType, ...)`.
- **Repository (IDevicesRepository / DevicesRepository):** Ota vastaan **DeviceType?** suodatusparametrina. Suodatus: `if (deviceType.HasValue) query = query.Where(d => d.Type == deviceType.Value);`

#### API-sopimus (numeerinen deviceType)

- **Pyynnöt (request body):** Kenttä `deviceType` **kokonaislukuna** (esim. `2` = MoistureSensor). System.Text.Json deserialisoi luvun enumin arvoksi; arvo, jota ei ole määritelty enumin arvona (esim. 99), voi aiheuttaa deserialisointivirheen tai käyttäytyä yllättäen – tarvittaessa validoi controllerissa tai servicessä `Enum.IsDefined`.
- **Vastaukset (response):** Kenttä `deviceType` **kokonaislukuna** (oletusserialisointi).
- **Query-parametri:** `GET /api/devices?deviceType=2` – suodatus laitteen tyypin mukaan. Parametri numeerinen; virheellisestä arvosta → 400.
- **Validointi:** Vain enumin määrittämät numerot (0–5) kelpaavat. Virheellisestä arvosta → **400 Bad Request**.
- **Frontend:** Oletus on, että frontend käyttää DeviceType-enumia (sama numerotaulukko) ja lähettää/vastaanottaa numeerisia arvoja API-kutsuissa.

### 0.4 Migraatio ja olemassa oleva data

#### Migraation luonti ja tarkistus

1. **Lisää entiteettimuutokset** (Vaiheet 0.1–0.3): Plant/Device-kokoelmat, DeviceType-enum, AppDbContext many-to-many ja Type HasConversion.
2. **Luo migraatio:**  
   `dotnet ef migrations add PlantDeviceManyToMany`  
   (tai vastaava nimi, esim. `AddPlantDeviceManyToMany`).
3. **Tarkista generoitu migraatio** (Projektikansio/Migrations/_PlantDevice_.cs):
   - **Devices:** Sarake `PlantId` poistetaan (DropForeignKey, DropColumn). Uusi sarake `Type` (text) lisätään. Jos taulussa on jo rivejä, migraatio voi asettaa `defaultValue` Type-sarakkeelle (esim. tyhjä merkkijono) – tarkista ja korjaa tarvittaessa oletusarvoksi esim. `"MoistureSensor"`.
   - **PlantDevice:** Uusi taulu luodaan (DeviceId, PlantId, PK (DeviceId, PlantId), FK:t Devices- ja Plants-tauluihin, cascade delete).
   - **Plants:** Ei muutoksia sarakkeisiin.
4. **Aja migraatio:**  
   `dotnet ef database update`  
   (tietokanta käynnissä ja appsettings.json -> DefaultConnection oikein).

#### Olemassa olevan 1–1-datan käsittely

Jos tietokannassa on jo **vanhaa 1–1-dataa** voit joko poistaa sen tauluista, tai vaihtoehtoisesti säilyttää sen seuraavaa oppimistehtävää varten:

#### Seed data: yhden kasvin ja yhden laitteen insert-kyselyt

Voit täydentää tietokantaa **testidatalla** (yhden kasvin ja yhden laitteen sekä niiden linkitys). Suorita kyselyt **PostgreSQL-asiakkaalla** (psql, pgAdmin, tai EF Core `ExecuteSqlRaw` seedissä) **samaan järjestykseen**. Taulujen nimet vastaavat EF Core -migraatiota (PascalCase); PostgreSQLissä lainausmerkit pakollisia, jos taulut on luotu lainattuna.

Voit ajaa INSERT queryt pgAdmini:ssa.

**1. Kasvi (yksi rivi)**

```sql
INSERT INTO "Plants" ("Name", "Species", "Location", "Notes", "CreatedAt", "UpdatedAt")
VALUES (
  'Raportointikasvi',
  'Monstera',
  'Keittiö',
  'Seed data – Tehtävänanto 2a',
  NOW() AT TIME ZONE 'UTC',
  NOW() AT TIME ZONE 'UTC'
);
```

**2. Laitte (yksi rivi)**

- `Type` = DeviceType merkkijonona (esim. `MoistureSensor`, `Watering`, `Light`).
- `Status` = kokonaisluku (0 = Ok, 1 = Fault, 2 = Offline).

```sql
INSERT INTO "Devices" ("Type", "Status", "Battery", "Watering", "Moisture", "CreatedAt", "UpdatedAt")
VALUES (
  'MoistureSensor',
  0,
  90,
  false,
  45,
  NOW() AT TIME ZONE 'UTC',
  NOW() AT TIME ZONE 'UTC'
);
```

**3. Linkitys kasvi–laite (PlantDevice)**

- Suorita **seed-kasvin ja -laitteen** insertit ensin. Jos taulut olivat tyhjiä, ensimmäisenä lisätyn kasvin Id on 1 ja laitteen Id 1. EF-migraatiossa PlantDevice:n PK on (DeviceId, PlantId), joten sarakkeet tässä järjestyksessä:

```sql
INSERT INTO "PlantDevice" ("DeviceId", "PlantId")
VALUES (1, 1);
```

- Jos tauluissa on jo dataa, käytä oikeat id:t tai hae ne alikyselyillä:

```sql
INSERT INTO "PlantDevice" ("DeviceId", "PlantId")
SELECT d."Id", p."Id"
FROM "Plants" p
CROSS JOIN "Devices" d
WHERE p."Name" = 'Raportointikasvi' AND d."Type" = 'MoistureSensor'
LIMIT 1;
```

#### Vaihtoehto: seed C#-koodissa (Program.cs tai DbContext seed)

Voit ajaa vastaavan datan myös **EF Core seed**-metodissa (`OnModelCreating` tai `HasData` / erillinen `EnsureSeedData`-metodi), jolloin käytät entiteettejä ja kontekstia – ei raakaa SQL:ää. Tällöin insert-kyselyt ovat ohjeellisia, jos haluat seedata suoraan tietokantaan (esim. psql tai migraatiossa).

### 0.5 DTO- ja API-yhteensopivuus

- **PlantDto:** Laitteet listana, esim. `IReadOnlyList<DeviceDto> Devices` (ei yksittäistä `device`).
- **Water-toggle:** Päätä sääntö: kaikki kasvin Watering-tyyppiset laitteet tai query-parametri `deviceId`.

### 0.6 Tarkistuslista

- [ ] Liitostaulu (PlantDevice) / EF many-to-many konfiguroitu
- [ ] Plant: Devices-kokoelma; Device: Plants-kokoelma, DeviceType-enum (Type)
- [ ] DeviceType käytössä enumina koko toteutuksessa (entiteetti, DTO:t, service, repository); API käyttää numeerista deviceType-arvoa (0–5)
- [ ] Migraatio luotu; olemassa oleva data käsitelty tarvittaessa
- [ ] PlantDto: devices-lista; POST /api/plants ei luo Deviceä automaattisesti

---

## Vaihe 1: Kasvien muokkaus (PUT /api/plants/{id})

Tavoitteena on mahdollistaa olemassa olevan kasvin tietojen päivittäminen API:n kautta. Endpoint ei muokkaa kasviin liitettyjä laitteita (linkitys ja irrotus tulevat Vaiheessa 3); vastauksessa palautetaan kuitenkin kasvi **devices**-listoineen (PlantDto, ks. Vaihe 0.5).

---

### 1.1 API-spesifikaatio

**PUT /api/plants/{id}**

- **Reitti:** `api/plants/{id}`. **id** on reittiparametri (kokonaisluku), viittaa kasvin Id:hen.
- **Body (JSON):** Osittainen päivitys – kaikki kentät valinnaisia. Sallitut kentät: **name** (string), **species** (string), **location** (string), **notes** (string). Lähetetään vain ne kentät, joita halutaan päivittää.
- **Autentikaatio:** JWT vaaditaan (sama kuin muut API-reitit).
- **Vastaukset:**
  - **200 OK** – Päivitys onnistui. Body: **PlantDto** (Id, Name, Species, Location, Notes, CreatedAt, UpdatedAt, **Devices** = lista DeviceDto-olioita). Laitteiden listaus vastaa Vaiheen 0 tietomallia (M–N).
  - **404 Not Found** – Kasvia ei löydy annetulla id:llä. Body esim. `{ "error": "Plant not found" }`.
  - **400 Bad Request** – Validointivirhe (esim. nimi tyhjä tai kentän arvo ei sallittu). Body esim. `{ "error": "..." }`. Validointisäännöt dokumentoidaan (vapaaehtoinen: nimen pituus, pakollisuus jne.).

---

### 1.2 Toteutus kerroksittain

Toteutus noudattaa samaa kerrosrakennetta kuin laitteiden CRUD: Controller → Service → Repository → Data. Kasvin muokkaus käyttää olemassa olevaa **IPlantsRepository** / **IPlantsService** / **PlantsController** -rakennetta; tarvittaessa laajennetaan rajapintoja ja toteutuksia.

#### Kerros 1: DTO

- **UpdatePlantRequestDto** – PUT-pyynnön body. Kentät **valinnaisia** (string? Name, string? Species, string? Location, string? Notes) osittaisen päivityksen vuoksi. Käytä samoja kentänimiä kuin PlantDto:ssa (eli JSON:ssa esim. `name`, `species`, `location`, `notes`), jotta deserialisointi toimii.
- **PlantDto** – Käytössä jo (Vaihe 0.5): sisältää **Devices**-listan (esim. IReadOnlyList\<DeviceDto\>). PUT-vastauksessa palautetaan tämä rakenne.

#### Kerros 2: Repository (IPlantsRepository + PlantsRepository)

- **Rajapinta:** Metodi **UpdateAsync(int id, UpdatePlantRequestDto dto, CancellationToken cancellationToken = default)**. Paluuarvo: **Plant?** (päivitetty kasvi tai null, jos kasvia ei löydy).
- **Toteutus:** Hae kasvi id:llä (Include(Devices), jotta Devices täyttyy). Jos ei löydy, palauta null. Päivitä **vain ne kentät**, joiden arvo DTO:ssa on annettu (ei null/tyhjä). Aseta kasvin **UpdatedAt** = DateTime.UtcNow. Tallenna SaveChangesAsync. Älä muokkaa Devices-kokoelmaa tässä vaiheessa (linkitys/irrotus on Vaihe 3).
- **Tarkistus:** Päivitys ei poista tai nollaa kenttiä, joita ei lähetetä bodyssa; puuttuvat kentät jäävät ennallaan.

#### Kerros 3: Service (IPlantsService + PlantsService)

- **Rajapinta:** Metodi **UpdateAsync(int id, UpdatePlantRequestDto dto, CancellationToken cancellationToken = default)**. Paluuarvo: **PlantDto?** (null = kasvia ei löydy).
- **Toteutus:** Kutsu repositoryn **UpdateAsync(id, dto)**. Jos palautus null → palauta null (controller vastaa 404). Muuten muunna **Plant** → **PlantDto** (sis. Devices-lista DeviceDtoiksi). Validointi (esim. nimen pakollisuus tai pituus) voi tapahtua servicessä ennen repository-kutsua; virheellisestä syötteestä heitetään esim. ArgumentException, jolloin controller voi palauttaa 400.

#### Kerros 4: Controller (PlantsController)

- **Reitti ja metodi:** **PUT**, reitti `api/plants/{id}`. **id** reittiparametrina (int). Body: **UpdatePlantRequestDto** (FromBody).
- **Logiikka:** Kutsu servicen **UpdateAsync(id, dto)**. Jos palautus **null** → **404 Not Found** + virheviesti bodyssä. Jos service heittää **ArgumentException** (validointi) → **400 Bad Request** + virheviesti. Muuten **200 OK** + **PlantDto** (sis. devices).
- **Autorisointi:** Endpoint vaatii kirjautumisen (sama käytäntö kuin muilla plants/devices-reiteillä).

---

### 1.3 Tarkistuslista (Vaihe 1)

- [ ] **UpdatePlantRequestDto** määritelty; kaikki kentät (name, species, location, notes) valinnaisia.
- [ ] **IPlantsRepository** sisältää **UpdateAsync(int id, UpdatePlantRequestDto dto, ...)**; **PlantsRepository** päivittää vain annetut kentät ja UpdatedAt; Include(Devices).
- [ ] **IPlantsService** sisältää **UpdateAsync(...)**; **PlantsService** kutsuu repositorya, muuntaa Plant → PlantDto (devices mukaan lukien); null → null.
- [ ] **PlantsController** tarjoaa PUT `api/plants/{id}`; 200 + PlantDto, 404 jos kasvia ei löydy, 400 validointivirheestä.
- [ ] PUT-vastauksen PlantDto sisältää **devices**-listan (DeviceDto[]).

---

## Vaihe 2: Laitteiden erillinen CRUD (DevicesController)

Laitteet hallitaan omilla endpointeillaan. Kaikki vaativat JWT:n. **DeviceType** välitetään API:ssa **numeerisena** (0–5), kuten Vaihe 0.3 määrittelee.

### 2.1 Listaus ja haku

- **GET /api/devices**
  - Query-parametrit (valinnaiset): esim. `status`, `deviceType`, `offset`, `limit`. Suodata `deviceType`-parametrilla **numeerisena** (esim. `?deviceType=0` = Watering, `?deviceType=2` = MoistureSensor). Virheellisestä arvosta → **400 Bad Request**.
  - **Vastaus:** **200 OK** – sivuutettu lista laitteista, esim. `{ "total", "offset", "limit", "items": [ DeviceDto, ... ] }`. Jokainen DeviceDto sisältää kentän `deviceType` **kokonaislukuna** (0–5).

- **GET /api/devices/{id}**
  - **Vastaus:** **200 OK** – yksi laite (DeviceDto), sis. `deviceType` (numeerinen). Voi sisältää listan kasveista, joihin laite on linkitetty (valinnainen). **404** jos laitetta ei löydy.

### 2.2 Luonti

- **POST /api/devices**
  - **Body (JSON):**

```json
{
  "deviceType": 0,
  "status": 0,
  "battery": 85,
  "watering": false,
  "moisture": 42
}
```

- **deviceType** (pakollinen): **kokonaisluku** 0–5 (vastaavat DeviceType-enumia: 0=Watering, 1=Light, 2=MoistureSensor, 3=TemperatureSensor, 4=HumiditySensor, 5=LightSensor). API käyttää vain numeerista muotoa (ks. Vaihe 0.3).
- **status:** numeerinen (esim. 0=Ok, 1=Fault, 2=Offline) tai dokumentoidun mukainen.
- **Vastaus:** **201 Created** – luotu laite (DeviceDto), sis. `deviceType` numeerisena. Location-header voi viitata `GET /api/devices/{id}`. **400** validointivirhe (esim. virheellinen deviceType).

### 2.3 Muokkaus

- **PUT /api/devices/{id}**
  - **Body:** sama rakenne kuin luonnissa, kaikki kentät valinnaisia osittaisen päivityksen vuoksi: `deviceType` (int?), `status`, `battery`, `watering`, `moisture`. Arvot numeerisina (deviceType 0–5).
  - **Vastaus:** **200 OK** – päivitetty laite (DeviceDto), sis. `deviceType` numeerisena. **404** jos laitetta ei löydy. **400** validointivirhe.

### 2.4 Poisto

- **DELETE /api/devices/{id}**
  - **Vastaus:** **204 No Content**. Ennen poistoa irrotetaan kaikki kasvi–laite -linkitykset (liitostaulusta). **404** jos laitetta ei löydy.

### 2.5 Toteutus kerroksittain

Toteutus etenee kerroksittain alhaalta ylös: ensin DTO:t ja entiteetit, sitten repository, palvelu ja lopuksi kontrolleri. Jokainen kerros käyttää vain alempia kerroksia (Controller → Service → Repository → Data).

---

#### Kerros 1: Models / DTO:t

**Sijainti:** esim. `Models/Dtos/DeviceDtos.cs` (tai erilliset tiedostot). DTO-kentissä käytetään **enum-tyyppiä** (DeviceType); JSON-serialisoinnissa arvot **kokonaislukuna** (System.Text.Json oletus, älä lisää JsonStringEnumConverteria).

- **DeviceDto** – API-vastauksissa käytettävä muoto. Kentät: Id, DeviceType (enum, vastauksessa numeerisena 0–5), Status (enum tai int), Battery, Watering, Moisture. Voi sisältää valinnaisesti `plantIds` tai `plants`, jos GET /api/devices/{id} palauttaa linkitetyt kasvit.
- **CreateDeviceRequestDto** – POST /api/devices -bodyn rakenne. Kenttä `DeviceType` (DeviceType-enum) pakollinen, muut valinnaisia oletusarvoilla. Validointi: DeviceType yksi enumin arvoista (0–5); Battery 0–100; Status sallituista arvoista.
- **UpdateDeviceRequestDto** – PUT /api/devices/{id} -bodyn rakenne. Kaikki kentät valinnaisia osittaisen päivityksen vuoksi: DeviceType? DeviceType, DeviceStatus? Status (tai int?), int? Battery, bool? Watering, int? Moisture. Request-body numeerisina.
- **PagedDevicesResponseDto** – GET /api/devices -vastaus: Total, Offset, Limit, Items (IReadOnlyList<DeviceDto>).
- Valinnainen: GET /api/devices/types palauttaa listan sallituista DeviceType-arvoista (esim. numeerisina `[0,1,2,3,4,5]` tai dokumentoidusti).

---

#### Kerros 2: Repositories (IDevicesRepository + DevicesRepository)

Repository vastaa **tietokantakyselyistä ja -päivityksistä**. Se käyttää vain `AppDbContext`ia ja entiteettejä (Device), ei DTO:ita muuten kuin päivityspyynnön kentissä (UpdateDeviceRequestDto). Poisto: EF Core many-to-many -konfiguraatiolla laitteen poistaminen poistaa automaattisesti liitostaulun (PlantDevice) rivit; vaihtoehtona on konfiguroida cascade poisto linkityksille.

**Rajapinta:** `Repositories/IDevicesRepository.cs`

```csharp
using Moisture.Backend.Api.Models.Dtos;
using Moisture.Backend.Api.Models.Entities;

namespace Moisture.Backend.Api.Repositories;

public interface IDevicesRepository
{
    Task<(IReadOnlyList<Device> Items, int Total)> GetAllAsync(
        DeviceStatus? status,
        DeviceType? deviceType,
        int offset,
        int limit,
        CancellationToken cancellationToken = default);

    Task<Device?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Device> AddAsync(Device device, CancellationToken cancellationToken = default);

    Task<Device?> UpdateAsync(int id, UpdateDeviceRequestDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
```

**Toteutus:** `Repositories/DevicesRepository.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Moisture.Backend.Api.Data;
using Moisture.Backend.Api.Models.Dtos;
using Moisture.Backend.Api.Models.Entities;

namespace Moisture.Backend.Api.Repositories;

public class DevicesRepository(AppDbContext db) : IDevicesRepository
{
    public async Task<(IReadOnlyList<Device> Items, int Total)> GetAllAsync(
        DeviceStatus? status,
        DeviceType? deviceType,
        int offset,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = db.Devices.AsQueryable();

        if (status.HasValue)
            query = query.Where(d => d.Status == status.Value);
        if (deviceType.HasValue)
            query = query.Where(d => d.Type == deviceType.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(d => d.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public Task<Device?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => db.Devices.Include(d => d.Plants)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<Device> AddAsync(Device device, CancellationToken cancellationToken = default)
    {
        db.Devices.Add(device);
        await db.SaveChangesAsync(cancellationToken);
        return device;
    }

    public async Task<Device?> UpdateAsync(int id, UpdateDeviceRequestDto dto, CancellationToken cancellationToken = default)
    {
        var device = await db.Devices.FindAsync([id], cancellationToken);
        if (device is null) return null;

        if (dto.DeviceType is { } type) device.Type = type;
        if (dto.Status is { } status) device.Status = status;
        if (dto.Battery is { } b) device.Battery = b;
        if (dto.Watering is { } w) device.Watering = w;
        if (dto.Moisture is { } m) device.Moisture = m;
        device.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return device;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var device = await db.Devices.FindAsync([id], cancellationToken);
        if (device is null) return false;
        db.Devices.Remove(device);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
```

- **GetAllAsync:** suodatus `status`- ja `deviceType`-parametreilla (DeviceStatus?, DeviceType? – controller vastaanottaa query-parametrit numeerisina ja tarkistaa Enum.IsDefined, välittää enumit servicelle/repositorylle). Sivutus `offset`/`limit`, järjestys esim. Id.
- **GetByIdAsync:** `Include(d => d.Plants)` jos vastauksessa tarvitaan linkitetyt kasvit.
- **UpdateAsync:** päivitetään vain ne kentät, joiden arvo on annettu (ei null). DTO käyttää enum-tyyppejä (DeviceType?, DeviceStatus?).
- **DeleteAsync:** EF Core poistaa many-to-many-linkitykset (PlantDevice-rivit) automaattisesti, kun Device poistetaan. Vaihtoehtona on konfiguroida liitostaululle cascade delete `OnModelCreating`-metodissa.

---

#### Kerros 3: Services (IDevicesService + DevicesService)

Palvelu vastaa **sovelluslogiikasta ja validointista**. Se käyttää repositorya ja käsittelee DTO:ita; sisäisesti käytetään aina **DeviceType** / **DeviceType?** ja **DeviceStatus** (ei merkkijonoja eikä raakaa int-logiikkaa). Controller kutsuu vain serviceä ja käsittelee HTTP-vastaukset (201, 404, 400).

**Rajapinta:** `Services/IDevicesService.cs`

```csharp
using Moisture.Backend.Api.Models.Dtos;
using Moisture.Backend.Api.Models.Entities;

namespace Moisture.Backend.Api.Services;

public interface IDevicesService
{
    Task<PagedDevicesResponseDto> GetAllAsync(
        DeviceStatus? status,
        DeviceType? deviceType,
        int offset,
        int limit,
        CancellationToken cancellationToken = default);

    Task<DeviceDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<DeviceDto> CreateAsync(CreateDeviceRequestDto dto, CancellationToken cancellationToken = default);

    Task<DeviceDto?> UpdateAsync(int id, UpdateDeviceRequestDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
```

**Toteutus:** `Services/DevicesService.cs`

- **CreateAsync(CreateDeviceRequestDto):**
  - Validoi **deviceType**: vain enumin arvot (0–5). Jos virheellinen → heitä `ArgumentException` (tai käytä validointitulosta) → controller palauttaa **400 Bad Request**.
  - Validoi valinnainen **Battery** (0–100) ja **Status** (sallitut DeviceStatus-arvot), jos validoit.
  - Luo **Device**-entiteetti: aseta Type, Status, Battery, Watering, Moisture, CreatedAt/UpdatedAt (oletukset puuttuville kentille). Älä aseta Id.
  - Kutsu `_repository.AddAsync(device)`.
  - Muunna luotu entiteetti **DeviceDto**:ksi (apumetodi esim. `MapToDto(Device)`) ja palauta.
- **GetByIdAsync(int id):**
  - Kutsu `_repository.GetByIdAsync(id)`. Jos `null` → palauta `null` (controller palauttaa 404).
  - Muunna entiteetti DeviceDto:ksi (sis. valinnainen plants/plantIds) ja palauta.
- **GetAllAsync(DeviceStatus?, DeviceType?, offset, limit):**
  - Kutsu `_repository.GetAllAsync(status, deviceType, offset, limit)`.
  - Muunna jokainen `Device` → `DeviceDto` (esim. `items.Select(MapToDto).ToList()`).
  - Palauta **PagedDevicesResponseDto**: Total, Offset, Limit, Items.
- **UpdateAsync(int id, UpdateDeviceRequestDto):**
  - Kutsu `_repository.UpdateAsync(id, dto)`. Jos `null` → palauta `null` (controller 404).
  - Validoi DTO:n arvot tarvittaessa (esim. DeviceType 0–5, Battery 0–100) ennen repository-kutsua; virheellisestä → ArgumentException → 400.
  - Muunna päivitetty entiteetti DeviceDto:ksi ja palauta.
- **DeleteAsync(int id):**
  - Kutsu `_repository.DeleteAsync(id)`. Palauta `true` jos poisto onnistui, `false` jos laitetta ei löydy (controller 404).

**Mapping ja validointi**

- **MapToDto(Device entity):** Luo DeviceDto: Id, DeviceType (= entity.Type), Status (= entity.Status), Battery, Watering, Moisture. Jos GET /api/devices/{id} palauttaa linkitetyt kasvit, täytä plantIds tai plants entiteetin `Plants`-kokoelmasta.
- **Validointi:** Virheellisestä deviceType:sta tai muusta validointivirheestä heitä esim. `ArgumentException("Invalid device type")` tai käytä `FluentValidation`/oman validointitulostyypin kautta; controller käsittelee poikkeuksen ja palauttaa **400** + virheviesti.

**Tarkistuslista (Kerros 3)**

- [ ] IDevicesService määritelty; DevicesService injektoi IDevicesRepository (constructor).
- [ ] CreateAsync: validointi (deviceType 0–5), entiteetin luonti, AddAsync, MapToDto.
- [ ] GetByIdAsync / GetAllAsync: repository-kutsut, MapToDto, PagedDevicesResponseDto.
- [ ] UpdateAsync: UpdateAsync-repo, validointi tarvittaessa, MapToDto; null → 404.
- [ ] DeleteAsync: DeleteAsync-repo, paluu true/false.
- [ ] Kaikki metodit käyttävät DeviceType/DeviceStatus -enumia; ei string/int-logiikkaa palvelukerroksella.

---

#### Kerros 4: Controllers (DevicesController)

Kontrolleri vastaa **HTTP-reiteistä, pyynnön parametrien lukemisesta ja vastauskoodeista**. Se kutsuu vain serviceä; ei suoraan repositorya. Kaikki reitit vaativat JWT-autentikoinnin (`[Authorize]`). Virhetilanteissa palautetaan sopiva statuskoodi (400, 404) ja tarvittaessa virheviesti bodyssa.

**Sijainti:** `Controllers/DevicesController.cs` (tai vastaava).

---

**Vaatimukset kontrolleriluokalle**

- Käytä attribuutteja: **ApiController**, **Route("api/[controller]")** (reitti on siis `api/devices`), ja **Authorize** luokan tasolla niin, että kaikki endpointit vaativat kirjautumisen.
- Kontrolleri perii **ControllerBase**.
- **IDevicesService** on injektoitava konstruktorin kautta; kontrolleri ei luo serviceä itse eikä käytä repositorya suoraan.
- Jokainen action-metodi saa tarpeen mukaan **CancellationToken**-parametrin ja välittää sen service-kutsuihin.

---

**Vaatimukset per endpoint**

**1. GET /api/devices (listaus ja suodatus)**

- **Reitti ja metodi:** GET, reitti `api/devices` (ei reittiparametreja).
- **Query-parametrit (kaikki valinnaisia):** `status` (numeerinen, DeviceStatus), `deviceType` (numeerinen 0–5, DeviceType), `offset` (sivuutus, oletus esim. 0), `limit` (sivuun koko, oletus esim. 20). Parametrit tulee lukea query-stringistä (FromQuery).
- **Validointi:** Jos `status` on annettu, tarkista että arvo on sallittu (Enum.IsDefined DeviceStatus). Jos ei → **400 Bad Request** ja virheviesti bodyssä. Jos `deviceType` on annettu, tarkista Enum.IsDefined DeviceType (0–5). Jos ei → **400 Bad Request** (esim. viesti "Invalid deviceType value. Use 0-5.").
- **Logiikka:** Muunna hyväksytyt arvot enum-tyypeiksi (DeviceStatus?, DeviceType?). Kutsu servicen **GetAllAsync** näillä parametreilla sekä offset ja limit. Kontrolleri ei tee suodatusta eikä tietokantakyselyjä.
- **Vastaus:** Aina **200 OK**. Body: **PagedDevicesResponseDto** (Total, Offset, Limit, Items). Items on lista **DeviceDto**-olioita.

**2. GET /api/devices/{id} (yksi laite)**

- **Reitti ja metodi:** GET, reitti `api/devices/{id}`. **id** on reittiparametri, kokonaisluku (rajoita reitti esim. vain kokonaislukuihin).
- **Logiikka:** Kutsu servicen **GetByIdAsync(id)**. Jos palautus on **null**, laitetta ei löydy.
- **Vastaus:** Jos laite löytyy → **200 OK**, body **DeviceDto**. Jos ei löydy → **404 Not Found**, body esim. `{ "error": "Device not found" }`.

**3. POST /api/devices (uuden laitteen luonti)**

- **Reitti ja metodi:** POST, reitti `api/devices`. Body **CreateDeviceRequestDto** (JSON, FromBody).
- **Logiikka:** Kutsu servicen **CreateAsync(dto)**. Service voi heittää **ArgumentException** (esim. virheellinen deviceType tai battery). Kontrollerissa tulee käsitellä tämä: ArgumentException → **400 Bad Request**, body esim. `{ "error": ex.Message }`.
- **Vastaus:** Jos luonti onnistuu → **201 Created**. Response-body: luotu **DeviceDto**. **Location**-header on pakollinen ja viittaa luodun resurssin URIin (GET /api/devices/{id}). Käytä tähän CreatedAtAction -tyyppistä palautetta (viittaus GET-by-id -actioniin, id = luodun laitteen Id), jolloin sekä Location että body asetetaan oikein. Validointivirhe → **400** kuten yllä.

**4. PUT /api/devices/{id} (päivitys)**

- **Reitti ja metodi:** PUT, reitti `api/devices/{id}`. **id** reittiparametrina (int). Body **UpdateDeviceRequestDto** (JSON, kaikki kentät valinnaisia).
- **Logiikka:** Kutsu servicen **UpdateAsync(id, dto)**. Palautus voi olla **null** (laite ei löydy) tai service voi heittää **ArgumentException** (validointi).
- **Vastaus:** Jos päivitys onnistuu → **200 OK**, body päivitetty **DeviceDto**. Jos laitetta ei löydy → **404 Not Found**, body esim. `{ "error": "Device not found" }`. ArgumentException → **400 Bad Request** + virheviesti bodyssä.

**5. DELETE /api/devices/{id} (poisto)**

- **Reitti ja metodi:** DELETE, reitti `api/devices/{id}`. **id** reittiparametrina (int).
- **Logiikka:** Kutsu servicen **DeleteAsync(id)**. Palautus on totuusarvo: **true** = poisto tehty, **false** = laitetta ei löydy.
- **Vastaus:** Jos poisto onnistui → **204 No Content** (ei response-bodya). Jos laitetta ei löydy → **404 Not Found**, body esim. `{ "error": "Device not found" }`.

---

**Program.cs – DI-vaatimukset**

- Rekisteröi **IDevicesRepository** → **DevicesRepository** (Scoped).
- Rekisteröi **IDevicesService** → **DevicesService** (Scoped).
- Rekisteröinnit tulee tehdä ennen sovelluksen buildia (ennen `builder.Build()`). Käytä **AddScoped** molemmille, jotta yksi HTTP-pyyntö käyttää samaa repository- ja service-instanssia.

---

**Tarkistuslista (Kerros 4)**

- [ ] DevicesController: ApiController, Route("api/[controller]"), Authorize; perii ControllerBase; IDevicesService injektoitu konstruktorissa.
- [ ] GET (lista): query-parametrit status, deviceType (numeerisina), offset, limit; Enum.IsDefined-tarkistus → 400; vain hyväksytyt arvot välitetään servicelle; vastaus 200 + PagedDevicesResponseDto.
- [ ] GET {id}: reittiparametri id (int); 200 + DeviceDto tai 404 + virheviesti.
- [ ] POST: body CreateDeviceRequestDto; 201 Created + Location-header (viittaus GET /api/devices/{id}) + body DeviceDto; ArgumentException → 400.
- [ ] PUT {id}: reittiparametri id, body UpdateDeviceRequestDto; 200 + DeviceDto tai 404; ArgumentException → 400.
- [ ] DELETE {id}: 204 No Content tai 404; ei bodya onnistuessa.
- [ ] Program.cs: IDevicesRepository ja IDevicesService rekisteröity Scoped-elinaikana.

### 2.6 Validointi ja virhekoodit

- **deviceType:** Vain enumin määrittämät numerot (0–5) kelpaavat; request-body ja query-parametri numeerisina. Virheellisestä arvosta → **400 Bad Request**.
- **status:** Jos validoidaan, arvot numeerisina (vastaavat DeviceStatus-enumia). Virheellisestä arvosta → 400.
- **battery:** 0–100 (valinnainen tarkistus).
- **404:** GET/PUT/DELETE kun id:tä ei löydy. Body `{ "error": "Device not found" }` tai vastaava.

---

## Vaihe 3: Kasvin laitteiden hallinta (linkitys ja irrotus)

Tavoitteena on tarjota API-endpointit **kasviin liitettyjen laitteiden listaukseen**, **laitteen linkittämiseen kasviin** ja **laitteen irrottamiseen kasvista**. Tietomalli on M–N (Vaihe 0): sama laite voi kuulua usealle kasville, sama kasvi voi olla usean laitteen kanssa. Kaikki reitit vaativat JWT-autentikoinnin.

---

### 3.1 API-spesifikaatio

**1. GET /api/plants/{id}/devices – kasvin laitteiden listaus**

- **Reitti:** `api/plants/{id}/devices`. **id** = kasvin Id (reittiparametri, kokonaisluku).
- **Body:** Ei bodya.
- **Vastaukset:**
  - **200 OK** – Lista kasviin linkitetyistä laitteista. Body: taulukko **DeviceDto**-olioita (sama rakenne kuin GET /api/devices/{id}: Id, deviceType, status, battery, watering, moisture jne.). Tyhjä taulukko `[]`, jos kasvilla ei ole laitteita.
  - **404 Not Found** – Kasvia ei löydy annetulla id:llä. Body esim. `{ "error": "Plant not found" }`.

**2. POST /api/plants/{id}/devices/{deviceId} – laitteen linkitys kasviin**

- **Reitti:** `api/plants/{id}/devices/{deviceId}`. **id** = kasvin Id, **deviceId** = laitteen Id (molemmat reittiparametreina, kokonaislukuja).
- **Body:** Ei bodya.
- **Vastaukset:**
  - **204 No Content** tai **200 OK** – Linkitys onnistui. Voidaan palauttaa joko ilman bodya (204) tai 200 + DeviceDto/PlantDto (dokumentoi valinta). Location-header voi viitata GET /api/plants/{id}/devices tai GET /api/plants/{id}.
  - **404 Not Found** – Kasvia tai laitetta ei löydy. Body esim. `{ "error": "Plant not found" }` tai `{ "error": "Device not found" }`. Tarkista molemmat id:t (kasvi ja laite) ja palauta selkeä viesti kumpi puuttuu (tai yleinen "Plant or device not found").
  - **409 Conflict** – Laitteella ja kasvilla on jo linkitys (M–N-liitostaulussa on jo rivi). Body esim. `{ "error": "Device is already linked to this plant" }`. Älä luo duplikaattiriviä.

**3. DELETE /api/plants/{id}/devices/{deviceId} – laitteen irrotus kasvista**

- **Reitti:** `api/plants/{id}/devices/{deviceId}`. **id** = kasvin Id, **deviceId** = laitteen Id.
- **Body:** Ei bodya.
- **Vastaukset:**
  - **204 No Content** – Irrotus onnistui. Ei response-bodya.
  - **404 Not Found** – Kasvia ei löydy, laitetta ei löydy, tai linkitystä ei ole (eli irrotettavaa ei ole). Body esim. `{ "error": "Plant not found" }` / `{ "error": "Device not found" }` / `{ "error": "Device is not linked to this plant" }`. Riittää että 404 palautetaan kun linkitystä ei löydy; virheviesti voi olla yhteinen (esim. "Link not found").

---

### 3.2 Toteutus kerroksittain

Toteutus laajentaa olemassa olevaa **IPlantsRepository** / **IPlantsService** / **PlantsController** -rakennetta. Vaihtoehtoisesti linkityslogiikka voidaan sijoittaa erilliseen **IPlantDeviceRepository** (tai vastaavaan), jos haluat pitää PlantsRepositoryn kevyenä. DTOina käytetään olemassa olevaa **DeviceDto**-tyyppiä; uusia request-DTOja ei tarvita (POST/DELETE käyttävät vain reittiparametreja).

#### Kerros 1: DTO

- Ei uusia DTOja. **DeviceDto** (Vaihe 2) käytössä GET /api/plants/{id}/devices -vastauksessa (lista DeviceDto-olioita).

#### Kerros 2: Repository (IPlantsRepository + PlantsRepository, tai IPlantDeviceRepository)

- **GetDevicesByPlantIdAsync(int plantId, CancellationToken cancellationToken = default)**
  - Paluu: lista **Device**-entiteetteja (tai IReadOnlyList\<Device\>), jotka on linkitetty annetulle kasville. Hae kasvi id:llä Include(Devices) tai kysely liitostaulun (PlantDevice) kautta; palauta vain laitteet. Jos kasvia ei löydy, voidaan palauttaa null tai tyhjä lista – dokumentoi (suositus: null, jotta controller voi erotella 404).
- **AddDeviceToPlantAsync(int plantId, int deviceId, CancellationToken cancellationToken = default)**
  - Tarkista että kasvi ja laite löytyvät. Tarkista ettei linkitys ole jo olemassa (liitostaulussa ei jo riviä (plantId, deviceId)). Jos jo olemassa → palauta esim. false tai heitä poikkeus (Conflict). Lisää linkitys: lisää Device kasvin Devices-kokoelmaan (tai liitostaulun rivi). SaveChangesAsync. Paluu: true = onnistui, false = jo linkitetty tai kasvi/laite puuttuu (tai käytä poikkeuksia / result-tyyppiä).
- **RemoveDeviceFromPlantAsync(int plantId, int deviceId, CancellationToken cancellationToken = default)**
  - Poista linkitys kasvin ja laitteen välillä (poista rivi liitostaulusta tai poista laite kasvin Devices-kokoelmasta). Jos kasvia, laitetta tai linkitystä ei löydy → palauta false (tai null). Paluu: true = irrotus tehty, false = ei löydy.

**Toteutusvihjeet:** EF Core many-to-many: kasvin Devices-kokoelman kautta voi lisätä/poistaa viittauksia (device.Plants.Add(plant) tai plant.Devices.Remove(device)). Varmista että Include(Devices) tai vastaava käytössä kun haet kasvin. Liitostaulun (PlantDevice) käsittely riippuu mallista (implisiittinen vs. eksplisiittinen, ks. Vaihe 0).

#### Kerros 3: Service (IPlantsService + PlantsService)

- **GetDevicesByPlantIdAsync(int plantId, CancellationToken cancellationToken = default)**
  - Kutsu repositoryn **GetDevicesByPlantIdAsync(plantId)**. Jos kasvia ei löydy (repo palauttaa null tai tyhjä + tarkistus) → palauta null (controller 404). Muuten muunna **Device**-lista → **DeviceDto**-lista ja palauta.
- **AddDeviceToPlantAsync(int plantId, int deviceId, CancellationToken cancellationToken = default)**
  - Kutsu repositoryn **AddDeviceToPlantAsync(plantId, deviceId)**. Tulkinta: jos repo palauttaa "jo linkitetty" → servicen tulee signaloida **409** (esim. heitä oma poikkeus tai palauta enum/result). Jos kasvi tai laite puuttuu → 404. Onnistuessa → 204/200.
- **RemoveDeviceFromPlantAsync(int plantId, int deviceId, CancellationToken cancellationToken = default)**
  - Kutsu repositoryn **RemoveDeviceFromPlantAsync(plantId, deviceId)**. Jos irrotusta ei tehty (ei linkitystä / ei kasvia / ei laitetta) → palauta false (controller 404). Muuten true → 204.

Rajapintojen paluutyypit: voidaan käyttää **bool** (true/false), **bool?** (null = 404), tai **result-tyyppiä** (Success / NotFound / Conflict). Controller tulkitsee ja palauttaa oikean statuskoodin.

#### Kerros 4: Controller (PlantsController)

- **GET api/plants/{id}/devices**
  - Reittiparametrit: **id** (kasvin id). Kutsu servicen **GetDevicesByPlantIdAsync(id)**. Jos null → **404 Not Found** + virheviesti. Muuten **200 OK** + lista DeviceDto-olioita (JSON-taulukko).
- **POST api/plants/{id}/devices/{deviceId}**
  - Reittiparametrit: **id** (kasvi), **deviceId** (laite). Kutsu servicen **AddDeviceToPlantAsync(id, deviceId)**. Jos 404 (kasvi/laite puuttuu) → **404 Not Found**. Jos 409 (jo linkitetty) → **409 Conflict** + virheviesti. Muuten **204 No Content** (tai 200 + body, dokumentointeineen).
- **DELETE api/plants/{id}/devices/{deviceId}**
  - Kutsu servicen **RemoveDeviceFromPlantAsync(id, deviceId)**. Jos false (ei irrotettavaa) → **404 Not Found**. Jos true → **204 No Content**.

Kaikki kolme endpointia vaativat kirjautumisen (Authorize). Reittiparametrit rajoitetaan kokonaislukuihin (esim. `{id:int}`, `{deviceId:int}`).

---

### 3.3 Tarkistuslista (Vaihe 3)

- [ ] **GET /api/plants/{id}/devices:** 200 + DeviceDto[] (tyhjä array jos ei laitteita); 404 jos kasvia ei löydy.
- [ ] **POST /api/plants/{id}/devices/{deviceId}:** Linkitys luodaan; 204 (tai 200); 404 jos kasvi tai laite puuttuu; 409 jos linkitys on jo olemassa.
- [ ] **DELETE /api/plants/{id}/devices/{deviceId}:** Linkitys poistetaan; 204; 404 jos kasvia, laitetta tai linkitystä ei löydy.
- [ ] Repository: GetDevicesByPlantIdAsync, AddDeviceToPlantAsync (duplikaattitarkistus), RemoveDeviceFromPlantAsync.
- [ ] Service ja Controller: 404- ja 409-käsittely; paluuarvot mapataan oikeisiin HTTP-statuskoodeihin.

---

## Vaihe 4: Kasvin luonti ja GET-rakenne

Vaihe 4 kattaa **kasvin luonnin** uudella tietomallilla (ei enää yhtä automaattisesti luotavaa laitetta), **GET-endpointtien varmistamisen** niin että PlantDto sisältää aina **devices**-listan, sekä **kastelun (water-toggle)** -endpointin. Kaikki reitit vaativat JWT-autentikoinnin.

---

### 4.1 API-spesifikaatio

**1. POST /api/plants – uuden kasvin luonti**

- **Reitti:** `api/plants`. **Body (JSON):** Kasvin kentät (name, species, location, notes – pakollisuudet ja validointi dokumentoidaan). **Ei enää yksittäistä device-objektia** bodyssa.
- **Vaihtoehto A (minimi):** Body sisältää vain kasvin kentät. Luotu kasvi tallennetaan ilman laitteita (devices = tyhjä lista). Laitteet voidaan linkittää myöhemmin Vaiheen 3 endpointilla (POST /api/plants/{id}/devices/{deviceId}).
- **Vaihtoehto B (laajennettu):** Body voi sisältää valinnaisen **deviceIds**-listan (kokonaislukuja). Jos `deviceIds` on annettu: tarkista että jokainen id viittaa olemassa olevaan laitteeseen. Jos jokin id puuttuu tai laitetta ei löydy → **400 Bad Request** (esim. `{ "error": "Device not found", "deviceId": 123 }`). Jos kaikki id:t ok, luo kasvi ja luo linkitykset näille laitteille (sama logiikka kuin Vaihe 3 linkitys). Jos `deviceIds` puuttuu tai tyhjä, käyttäytyminen kuten vaihtoehto A.
- **Vastaukset:** **201 Created** – Body: **PlantDto** (sis. **devices**-lista; tyhjä tai linkitetyt laitteet). Location-header viittaa GET /api/plants/{id}. **400** – validointivirhe tai virheellinen deviceIds. **404** – ei käytössä luonnissa, paitsi jos valitaan tulkita puuttuva laite 400:na.

**2. GET /api/plants – kasvien listaus**

- **Reitti:** `api/plants`. Query-parametrit (oletukset) kuten aiemmin (q, status, watering, species, sort, order, offset, limit).
- **Vastaus:** **200 OK** – Sivuutettu lista kasveista. Jokainen listan alkio on **PlantDto**, ja jokaisessa PlantDto:ssa on **devices**-lista (DeviceDto[]). Tyhjä lista `[]` jos kasvilla ei ole laitteita. Include(Devices) tai vastaava tietokantakyselyssä, jotta laitteet täyttyvät.

**3. GET /api/plants/{id} – yksi kasvi**

- **Reitti:** `api/plants/{id}`. **id** = kasvin Id (reittiparametri).
- **Vastaus:** **200 OK** – **PlantDto** (sis. **devices**-lista). **404 Not Found** – kasvia ei löydy. Vastauksen PlantDto sisältää aina devices-kentän (ei null), tyhjä taulukko jos ei laitteita.

**4. POST /api/plants/{id}/water – kastelu (water-toggle)**

- **Reitti:** `api/plants/{id}/water`. **id** = kasvin Id. Body voi olla tyhjä tai sisältää ohjauskentän; **query-parametri** on yleinen tapa valita laite.
- **Säännön valinta (dokumentoi toteutus):**
  - **Vaihtoehto A:** Käynnistä kastelu **kaikille** kasviin linkitetyille laitteille, joiden tyyppi on **Watering** (DeviceType.Watering). Ei query-parametria.
  - **Vaihtoehto B:** Query-parametri **deviceId** (kokonaisluku). Käynnistä kastelu vain tietylle laitteelle; tarkista että laite on kasviin linkitetty ja tyyppi on Watering. Jos deviceId puuttuu tai laite ei kelpaa → **400** tai **404**.
- **Vastaukset:** **200 OK** – Body: **PlantDto** (päivitetty, sis. devices; Watering-kentät voi päivittyä). **404 Not Found** – kasvia ei löydy tai (vaihtoehto B) laitetta ei löydy / ei linkitetty. **400** – esim. virheellinen deviceId tai kasvilla ei ole Watering-laitetta.

---

### 4.2 Toteutus kerroksittain

#### Kerros 1: DTO

- **CreatePlantRequestDto** (POST /api/plants): Kasvin kentät (Name, Species, Location, Notes). Valinnainen **DeviceIds** (lista kokonaislukuja) jos toteutat vaihtoehton B. Ei yksittäistä Device- tai DeviceDto-kenttää.
- **PlantDto** – Jo käytössä (Vaihe 0.5): sisältää **Devices**-listan. Varmista että GET /api/plants ja GET /api/plants/{id} sekä POST /api/plants (201) palauttavat aina tämän kentän (tyhjä tai täytetty).

#### Kerros 2: Repository (IPlantsRepository + PlantsRepository)

- **ListAsync / GetByIdAsync:** Varmista että kasvihaku sisältää laitteet: **Include(p => p.Devices)** (tai Include(PlantDevices).ThenInclude(Device) eksplisiittisellä liitostaululla). GET /api/plants ja GET /api/plants/{id} käyttävät näitä; vastauksessa devices täyttyy.
- **AddAsync (kasvi):** Jos vaihtoehto B: body sisältää deviceIds. Toteutus: luo kasvi (AddAsync plant ilman laitteita), tallenna, sitten luo linkitykset annetuille deviceId:lle (kutsu samaa logiikkaa kuin AddDeviceToPlantAsync tai lisää laitteet kasvin Devices-kokoelmaan ja SaveChanges). Jos jokin deviceId ei löydy, älä tallenna kasvia; palauta null tai signaloi virhe (service/controller 400). Vaihtoehto A: AddAsync vain kasvin, ilman deviceIds-käsittelyä.
- **Water-toggle:** Repository-taso voi tarjota metodin esim. **SetWateringForPlantAsync(int plantId, int? deviceId, bool value, CancellationToken)** – päivittää kasvin Watering-tyyppisten laitteiden Watering-kentän (tai yhden laitteen jos deviceId annettu). Tai logiikka servicessä: hae kasvi Include(Devices), päivitä laitteiden Watering-kentät, SaveChanges.

#### Kerros 3: Service (IPlantsService + PlantsService)

- **CreateAsync (kasvi):** Vastaanottaa CreatePlantRequestDto. Validoi kasvin kentät. Jos deviceIds mukana: tarkista että kaikki laitteet löytyvät (IDevicesRepository.GetByIdAsync tai vastaava). Jos jokin puuttuu → ArgumentException tai palauta virhekoodi → controller 400. Luo kasvi (repository.AddAsync), sitten luo linkitykset deviceIds:lle (AddDeviceToPlantAsync tai vastaava). Palauta PlantDto (sis. devices).
- **ListAsync / GetByIdAsync:** Varmista että palautetaan PlantDto, jossa Devices täytetty (repository jo Include(Devices)). Map Plant → PlantDto (devices mukaan lukien).
- **Water (WaterToggle):** GetByIdAsync kasvi Include(Devices). Suodata Watering-tyyppiset laitteet. Vaihtoehto A: päivitä kaikkien Watering-laitteiden Watering = true (tai toggle). Vaihtoehto B: tarkista deviceId, että laite kuuluu kasville ja on Watering, päivitä vain se. Tallenna (repository tai suoraan konteksti). Palauta päivitetty PlantDto. Jos kasvia ei löydy tai (B) laite ei kelpaa → null tai poikkeus → controller 404/400.

#### Kerros 4: Controller (PlantsController)

- **POST /api/plants:** Body CreatePlantRequestDto. Kutsu service.CreateAsync. 201 Created + Location (GET /api/plants/{id}) + body PlantDto. 400 validointi- tai deviceIds-virhe.
- **GET /api/plants:** Query-parametrit → service.ListAsync. 200 OK + lista PlantDto (jokaisessa devices täytetty).
- **GET /api/plants/{id}:** service.GetByIdAsync(id). 200 + PlantDto tai 404.
- **POST /api/plants/{id}/water:** Query-parametri deviceId (valinnainen). Kutsu service water-metodia. 200 + PlantDto tai 404/400.

Kaikki endpointit vaativat kirjautumisen (Authorize).

---

### 4.3 Tarkistuslista (Vaihe 4)

- [ ] **POST /api/plants:** Ei device-objektia bodyssa. Vähintään vaihtoehto A: vain kasvin kentät, devices tyhjänä. Vaihtoehto B (valinnainen): deviceIds-lista, linkitykset luodaan, 400 jos jokin id virheellinen.
- [ ] **GET /api/plants** ja **GET /api/plants/{id}:** PlantDto sisältää aina **devices**-listan (Include(Devices) tai vastaava); tyhjä array jos ei laitteita.
- [ ] **POST /api/plants/{id}/water:** Sääntö dokumentoitu (kaikki Watering-laitteet tai deviceId-parametri). 200 + PlantDto, 404 (ja tarvittaessa 400).
- [ ] Repository: ListAsync/GetByIdAsync Include(Devices); AddAsync kasvi (+ valinnainen linkitys deviceIds:lle); water-logiikka (päivitys laitteiden Watering-kenttiin).
- [ ] Service ja Controller: luonti (201, 400), listaus ja haku (devices täytetty), water (200, 404, 400).

---

## Vaihe 5: Testaus ja dokumentaatio (backend)

- **Scalar UI:** Kaikki uudet reitit näkyvät OpenAPI-kuvauksessa ja Scalar UI:ssa. Testaa JWT Authorize + jokainen endpoint vähintään kerran.
- **Checklist:** Tietomalli (M–N, devices-lista); Laitteet (POST/GET/PUT/DELETE, deviceType, 404); Kasvit (PUT, POST ilman device / deviceIds); Linkitys (POST/DELETE plants/{id}/devices); Water-toggle.
- **Raportointi:** Noudata [Oppimistehtävä 2 – raportointiohjeet](./Oppimistehtava-2-raportointi-ohje.md). Siinä määritellään vaaditut Scalar UI -kuvakaappaukset (PUT plants, GET/POST/PUT/DELETE devices, GET/POST/DELETE plants/{id}/devices, POST plants ilman device, GET plants/{id}, water-toggle) sekä raportin tekstiosio (toteutetut vaiheet, valinnat, rajoitteet).

---

## Yhteenveto (backend)

| Vaihe | Sisältö                                                                             |
| ----- | ----------------------------------------------------------------------------------- |
| 0     | Tietomalli: Plant–Device 1–1 → M–N, DeviceType-enum, migraatio, DTO-päivitys        |
| 1     | Kasvien muokkaus: PUT /api/plants/{id}                                              |
| 2     | Laitteiden CRUD: GET/POST/PUT/DELETE /api/devices                                   |
| 3     | Kasvin laitteiden hallinta: GET/POST/DELETE /api/plants/{id}/devices                |
| 4     | Kasvin luonti (ilman device / deviceIds), GET-rakenne (devices-lista), water-toggle |
| 5     | Testaus Scalar UI:lla ja raportointi                                                |

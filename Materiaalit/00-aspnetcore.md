## 🌐 ASP.NET Core

[ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet)

[ASP.NET dokumentattio](https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0&WT.mc_id=dotnet-35129-website)

**ASP.NET Core** on moderni, suorituskykyinen ja monialustainen sovelluskehys, jonka on kehittänyt **Microsoft** verkkosovellusten, rajapintojen ja hajautettujen järjestelmien rakentamiseen. Se ei ole pelkkä jatkumo perinteiselle ASP.NET:lle, vaan **täysin uudelleen suunniteltu web-kehitysalusta**, joka vastaa pilvilaskennan, mikropalveluiden ja suuren mittakaavan internet-sovellusten vaatimuksiin.

ASP.NET Core yhdistää **huippusuorituskyvyn, selkeän arkkitehtuurin ja yritystason valmiudet** yhdeksi kokonaisuudeksi, säilyttäen samalla joustavuuden niin startup-yrityksille, yksittäisille kehittäjille kuin suurille organisaatioille.

---

## 🧠 Perusfilosofia

ASP.NET Core rakentuu muutamien keskeisten periaatteiden varaan:

### 1. **Suorituskyky ensiluokkaisena tavoitteena**

Kehys on suunniteltu matalan viiveen ja suuren läpimenon kuormille. Se sijoittuu säännöllisesti maailman nopeimpien web-kehysten joukkoon ja ylittää usein dynaamiset sekä JVM-pohjaiset ratkaisut raakasuorituskyvyssä.

### 2. **Eksplisiittinen ja koostettava arkkitehtuuri**

Piilotetun logiikan ja ylikonventioiden sijaan ASP.NET Core korostaa:

* eksplisiittistä konfiguraatiota
  * Sovelluksen käyttäytyminen määritellään näkyvästi ja tarkoituksella koodissa tai konfiguraatiossa – ei piilotettujen oletusten tai taikamekanismien kautta.
  * Kehittäjä määrittää mitä middlewareja käytetään
  * Kaikki konfiguraatio on yhdistettävissä ja ylikirjoitettavissa -> Mikään ei tapahdu tarvittaessa "automaattisesti huomaamatta"
  * "Vähemmän arvauksia ja enemmän kontrollia"

* selkeää pyyntöjen käsittelyputkea (pipeline)
  * Jokainen HTTP-pyyntö kulkee ennalta määritellyn, lineaarisen ketjun läpi.
  * Pyyntö -> kirjautumis middleware -> authentikointi -> authorisaatio -> reititys -> kontrolleri -> vastaus (response)
  * Tiedetään täsmälleen mitä tapahtuu missäkin vaiheessa
 
* vastuualueiden selkeää erottelua
  * Jokaisella järjestelmän osalla on yksi selkeä vastuu
    * Controller: HTTP, I/O
    * Service: Liiketoimintalogiikka
    * Repository: Datan käsittely
    * Middleware: Poikittaiset huolenaiheet
    * Model: Datan rakenne

Tämä tekee sovelluksista helpompia ymmärtää, debugata ja skaalata pitkällä aikavälillä.

### 3. **Pilvinatiivisuus oletuksena**

ASP.NET Core olettaa modernin toimintaympäristön:

* kontit (Docker)
* horisontaalinen skaalaus
* hajautetut järjestelmät
* havainnoitavuus ja automaatio

Tämän ansiosta se soveltuu erinomaisesti DevOps-putkiin ja pilvialustoille.

---

## 🧱 Ydinarkkitehtuuri (laajennettuna)

### 🔹 Isännöinti ja ajonaikainen ympäristö

ASP.NET Core toimii **.NET-ajoympäristön** päällä ja tukee:

* Windows
* Linux
* macOS
* konttipohjaisia ympäristöjä (Docker, Kubernetes)

HTTP-pyyntöjen käsittelystä vastaa **Kestrel**, kevyt ja asynkroninen web-palvelin, joka on optimoitu nykyaikaisille prosessoreille ja muistimalleille.

---

### 🔹 Middleware-pohjainen pyyntöputki

Jokainen HTTP-pyyntö kulkee deterministisen middleware-putken läpi:

* autentikointi
* autorisointi
* reititys
* validointi
* liiketoimintalogiikka
* vastauksen muotoilu

Tämä malli mahdollistaa **erittäin tarkan kontrollin** sovelluksen käyttäytymisestä ja on yksi ASP.NET Coren vahvimmista abstrahointimalleista.

---

### 🔹 Useita ohjelmointimalleja yhdessä kehyksessä

ASP.NET Core tukee poikkeuksellisella tavalla useita eri lähestymistapoja saman alustan sisällä:

* **Minimal APIs** – erittäin kevyet ja nopeat rajapinnat
* **MVC** – selkeä ja testattava sovellusarkkitehtuuri
* **Razor Pages** – sivukeskeinen käyttöliittymäkehitys
* **Web API:t** – REST-pohjaiset taustapalvelut
* **gRPC** – sopimuspohjaiset, korkean suorituskyvyn palvelut
* **SignalR** – reaaliaikainen, kaksisuuntainen viestintä

Tiimit voivat yhdistellä näitä malleja ilman erillisiä kehyksiä.

---

## ⚙️ Suorituskyky, turvallisuus ja ylläpidettävyys

### Suorituskyky

* täysin asynkroninen I/O
* tehokas muistinkäyttö
* Span-pohjainen datankäsittely
* natiivinen HTTP/2- ja HTTP/3-tuki

### Tyyppiturvallisuus ja luotettavuus

* vahva staattinen tyypitys (C#)
* virheiden havaitseminen käännösaikana
* IDE-avusteinen refaktorointi
* ennustettava ajonaikainen käyttäytyminen

### Pitkän aikavälin ylläpidettävyys

* vahvat yhteensopivuustakuut
* yritystason työkalut
* Long-Term Support (LTS) -julkaisut

---

## 🔐 Tietoturva ja vaatimustenmukaisuus

ASP.NET Core tarjoaa tuotantovalmiin tietoturvan oletuksena:

* politiikkapohjainen autorisointi (policy/käytänne)
* OAuth 2.0 / OpenID Connect
* JWT- ja sertifikaattipohjainen autentikointi
* CSRF- ja XSS-suojaus
* HTTPS-pakotus

Tämä tekee kehyksestä erityisen houkuttelevan **säännellyille toimialoille**, kuten finanssi-, terveydenhuolto- ja julkishallinnon sovelluksille.

---

## 🔄 Vertailu vastaaviin teknologioihin

### 🟢 ASP.NET Core vs **Node.js / Express / NestJS**

| Ominaisuus         | ASP.NET Core                  | Node.js                    |
| ------------------ | ----------------------------- | -------------------------- |
| Kieli              | C# (vahva tyypitys)           | JavaScript / TypeScript    |
| Suorituskyky       | Erittäin korkea, ennustettava | Korkea mutta GC-herkkä     |
| Samanaikaisuus     | Async + monisäikeinen         | Event loop (yksisäikeinen) |
| Tyyppiturvallisuus | Käännösaikainen               | Ajonaikainen (ellei TS)    |
| Yritystyökalut     | Erinomainen                   | Hajautunut                 |

**Valitse ASP.NET Core, kun:**

* tarvitset ennustettavaa suorituskykyä kuormassa
* arvostat vahvaa tyypitystä ja turvallista refaktorointia
* rakennat pitkäikäisiä ja monimutkaisia järjestelmiä
* taustajärjestelmän oikeellisuus on kriittistä

---

### 🟡 ASP.NET Core vs **Spring Boot** (java)

| Ominaisuus       | ASP.NET Core    | Spring Boot            |
| ---------------- | --------------- | ---------------------- |
| Käynnistysaika   | Erittäin nopea  | Hitaampi               |
| Konfiguraatio    | Selkeä ja kevyt | Annotaatiopainotteinen |
| Muistinkäyttö    | Pienempi        | Suurempi               |
| Kehittäjäkokemus | Sujuva          | Monisanainen           |
| Pilvinatiivisuus | Natiivisti      | Sopeutettu             |

**Valitse ASP.NET Core, kun:**

* kylmäkäynnistykset ovat kriittisiä (kontit, serverless)
* haluat vähemmän boilerplate-koodia
* haluat modernit kieliominaisuudet ilman JVM-ylipäätä

---

### 🔵 ASP.NET Core vs **Django** (python)

| Ominaisuus   | ASP.NET Core    | Django           |
| ------------ | --------------- | ---------------- |
| Suorituskyky | Erittäin korkea | Kohtalainen      |
| Tyypitys     | Staattinen      | Dynaaminen       |
| Joustavuus   | Modulaarinen    | Mielipiteellinen |
| Async-tuki   | Ensiluokkainen  | Kehittyvä        |

**Valitse ASP.NET Core, kun:**

* suorituskyky ja skaalautuvuus ovat keskiössä
* rakennat API-pohjaisia järjestelmiä
* arvostat staattista analyysiä ja käännösaikaisia takuita

---

## 🎯 Milloin ASP.NET Core on paras valinta

ASP.NET Core loistaa erityisesti seuraavissa tilanteissa:

✅ suuren liikenteen web-alustat ja API:t
✅ mikropalvelu- ja hajautetut arkkitehtuurit
✅ yritys- ja säännellyt ympäristöt
✅ pilvinatiiviset SaaS-tuotteet
✅ reaaliaikaiset järjestelmät (SignalR, gRPC)
✅ tiimit, jotka arvostavat oikeellisuutta, ylläpidettävyyttä ja suorituskykyä

Se on erityisen vahva, kun:

* taustajärjestelmän monimutkaisuus on suuri
* järjestelmän elinkaari on pitkä
* virheettömyys ei ole neuvoteltavissa

---

## 🧠 Yhteenveto

ASP.NET Core sijoittuu ainutlaatuisesti modernien backend-teknologioiden kentässä:

* nopeampi ja kevyempi kuin perinteiset yrityskehykset
* rakenteellisempi ja luotettavampi kuin monet dynaamiset alustat
* pilvivalmis ilman arkkitehtonisia kompromisseja

Se ei ole vain kehys – se on **alusta vakavien, skaalautuvien ja pitkäikäisten ohjelmistojen rakentamiseen**.

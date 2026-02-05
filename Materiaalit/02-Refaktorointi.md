# Refaktoroinnin johdatus: Fullstack-verkkosovellukset

Alla on johdatus **refaktorointiin** erityisesti **fullstack-verkkosovellusten** (backend-API + frontend-käyttöliittymä) näkökulmasta. Materiaalissa käsitellään, mitä refaktorointi on, miksi ja milloin sitä tehdään sekä miten sitä lähestytään turvallisesti sekä palvelin- että asiakaspuolen kerroksissa.

---

## 1. Mitä on refaktorointi?

**Refaktorointi** tarkoittaa koodin **sisäisen rakenteen** muuttamista siten, että sen **havainnoitava käyttäytyminen** pysyy samana. Sovellus tekee käyttäjälle edelleen samat asiat; koodista tulee helpommin ymmärrettävää, muokattavaa ja laajennettavaa.

- **Tavoite:** Parempi suunnittelu, luettavuus ja ylläpidettävyys.
- **Rajoite:** Ohjelmiston toimintaa ei muuteta (ei uusia ominaisuuksia, ei “korjauksia”, jotka muuttavat käyttäytymistä — virheet korjataan erikseen).
- **Tulos:** Selkeämpi koodi, jota on turvallisempi muuttaa, kun lisäät ominaisuuksia tai korjaat virheitä.

Refaktorointi **ei** ole:

- Sovelluksen uudelleenkirjoittamista alusta.
- Uusien toimintojen lisäämistä (se on ominaisuus; refaktorointi usein helpottaa ominaisuuksien lisäämistä).
- Virheiden korjaamista käyttäytymisen muuttamalla (korjaa ensin virhe, refaktoroi tarvittaessa sen jälkeen).

**Fullstack**-kontekstissa “havainnoitava käyttäytyminen” tarkoittaa mm.:

- **Backend:** Samat HTTP-endpointit, samat pyyntö-/vastausrakenteet, samat statuskoodit ja virheenkäsittely.
- **Frontend:** Samat näytöt, samat käyttäjän toiminnot, sama näytetty data ja samat toiminnot.
- **Sopimus:** Frontendin ja backendin välinen API-sopimus pysyy samana (tai sitä muutetaan tietoisesti ja hallitusti).

---

## 2. Miksi refaktoroida?

### 2.1 Tekninen velka

Nopeasti tai huonosti rakennettu tai rakenteettomasti kasvanut koodi kertyy **teknisenä velkana**: tulevat muutokset hidastuvat ja riskit kasvavat. Refaktoroimalla velkaa vähennetään niin, että:

- Uudet ominaisuudet vievät vähemmän aikaa ja rikkovat vähemmän.
- Uuden tiimin tai debuggauksen on helpompi aloittaa.
- Järjestelmää on helpompi testata.

### 2.2 Ominaisuuksien lisääminen fullstack-sovelluksissa

Tyypillisessä verkkosovelluksessa:

- **Backend:** Uudet kentät, endpointit tai validointi vaativat usein muutoksia useassa kohdassa (kontrollerit, validointi, tallennus). Jos vastuut ovat sekoittuneet (esim. yksi “jumala”-kontrolleri), yksi pieni muutos voi pakottaa muokkaamaan monia rivejä ja duplikoimaan logiikkaa.
- **Frontend:** Uusi käyttöliittymä tai data tarkoittavat yleensä uutta tilaa, uusia API-kutsuja ja uutta UI:ta. Jos kaikki on yhdessä valtavassa komponentissa epäselvillä nimillä, yhden kentän (esim. “määräpäivä”) lisääminen vaatii etsimistä monista samankaltaisista muuttujista ja useista `fetch`-kutuista.

Refaktorointi **ennen** tai **ominaisuuden rinnalla** (esim. palvelukerroksen erottaminen, komponentin pilkkominen, tyyppien käyttöönotto) rajaa muutoksen pienemmälle alueelle ja vähentää riskiä rikkoa koko ratkaisua.

### 2.3 Sopimuksen teko eksplisiittiseksi

Fullstack-refaktoroinnissa tehdään usein **API-sopimus** eksplisiittiseksi: jaetut tyypit tai DTO:t, selkeät pyyntö-/vastausrakenteet ja yhtenäinen virheenkäsittely. Näin backendin tai frontendin muuttaminen on vähemmän todennäköistä rikkovan toista puolta.

---

## 3. Milloin refaktoroida (ja milloin ei)

**Hyviä hetkiä refaktoroida:**

- **Ennen ominaisuuden lisäämistä** alueella, jossa on vaikea työskennellä (esim. “Minun pitää lisätä määräpäivä; kontrolleri ja yksi iso React-komponentti ovat sekavia”).
- **Ominaisuuden lisäämisen jälkeen**, kun huomaat duplikoinnin tai epäselvyyden (esim. “jouduin kopioimaan validoinnin kahteen paikkaan”).
- **Virheen korjaamisen yhteydessä** koodissa, jota on vaikea ymmärtää — ymmärrä ensin, korjaa virhe, sitten refaktoroi, jotta virhe ei toistu.
- **Code reviewin yhteydessä**, kun tiimi on samaa mieltä, että pieni refaktorointi vähentäisi tulevaa kustannusta.

**Täytyy olla varovainen kun:**

- **Ei testejä (tai ei tapaa varmistaa käyttäytymistä):** Refaktoroi hyvin pienin askelin ja testaa sovellus käsin jokaisen askeleen jälkeen.
- **Tiukka deadline ilman varaa regressioon:** Tee mahdollisimman pieniä refaktorointeja tai ajoita refaktorointi releasea seuraavaksi.
- **“Big bang” -uudelleenkirjoitus:** Suosi vaiheittaista refaktorointia koko backendin tai frontendin kerralla uudelleenkirjoittamisen sijaan.

**Fullstack**-työssä käytännöllinen lähestymistapa:

1. Refaktoroi yksi kerros kerrallaan (esim. ensin backend, sitten frontend) tai yksi pystysuora viipale (esim. “tehtävien CRUD” API:sta käyttöliittymään).
2. Pidä API-sopimus refaktoroinnin ajan vakaana, jotta toinen kerros toimii edelleen.
3. Lisää tai paranna testejä mahdollisuuksien mukaan (esim. API-testit backendille, komponentti- tai E2E-testit frontendille), jotta refaktorointi on turvallista.

---

## 4. Turvallinen refaktorointi: käyttäytymisen säilyttäminen

Kultasääntö: **jokaisen refaktorointiaskeleen jälkeen sovellus käyttäytyy samalla tavalla.**

### 4.1 Käytä testejä, kun niitä on

- **Backend:** Yksikkötestit palveluille ja repositorioille, integraatio-/API-testit endpointeille.
- **Frontend:** Yksikkötestit hookeille ja puhdalle logiikalle, komponenttitestit UI:lle, E2E-testit kriittisille virroille.

Aja testit jokaisen pienen muutoksen jälkeen. Jos testejä ei ole, lisää muutamia refaktoroimasi käyttäytymisen osalta (erityisesti backend-APIlle ja kriittisille frontend-virroille).

### 4.2 Pienet askeleet

- Suosi monia pieniä refaktorointeja yhden valtavan muutoksen sijaan.
- Esimerkkejä: “Ota tämä validointi omaan metodiin”, “Nimeä tämä muuttuja uudelleen”, “Siirrä tämä lohko uuteen komponenttiin.” Jokaisen askeleen pitää olla helppo ymmärtää ja helppo perua.

### 4.3 Yksi asia kerrallaan

- Älä sekoita refaktorointia uuteen ominaisuuteen tai käyttäytymisen muutokseen. Tee ensin refaktorointi, commitoi, sitten lisää ominaisuus (tai korjaa virhe).

### 4.4 Fullstack: pidä sopimus vakaana

- Backendia refaktoroitaessa pidä URL, HTTP-metodit, pyynnön body ja vastauksen rakenne samana, jotta frontend toimii edelleen.
- Frontendia refaktoroitaessa pidä API-kutsut ja vastausten käyttötapa samana, kunnes päätät tietoisesti muuttaa sopimusta (esim. jaettujen tyyppien tai uuden API-version käyttöönoton yhteydessä).

---

## 5. Backendin refaktorointi (Web API)

Tyypillisessä web-API:ssa (esim. .NET, Node jne.) refaktoroinnin pääkohteita ovat **kontrollerit**, **validointi**, **liiketoimintalogiikka** ja **dataan pääsy**.

### 5.1 Tyypillisiä ongelmia

- **Jumala-kontrolleri:** Yksi kontrolleri hoitaa HTTP:n, validoinnin, “liiketoimintasäännöt” ja tietokantakyselyt. Kentän tai säännön lisääminen tarkoittaa yhden suuren tiedoston muokkaamista useassa kohdassa.
- **Ei vastuiden erottelua:** Validointi duplikoitu POST- ja PUT-metodeissa; taikasanoja ja -numeroita siellä täällä; ei selkeää paikkaa “liiketoimintasäännöille”.
- **Epäselvä tai epäjohdonmukainen nimeäminen:** Lyhyet tai epämääräiset nimet (`d`, `nxt`, `r`, `Get1`) vaikeuttavat näkemistä, mitä muuttaa ominaisuutta lisättäessä.
- **Tiukka kytkentä tallennukseen:** Staattiset listat tai suorat tietokantakutsut kontrollerissa, joten testaus tai toteutuksen vaihto on vaikeaa.
- **Ei selkeää sopimusta:** Vastaukset ad hoc -tyyppisiä (esim. `Dictionary<string, object>`), joten frontend ja backend voivat ajautua erilleen.

### 5.2 Refaktoroinnin suunnat

| Ongelma                     | Refaktoroinnin suunta                                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jumala-kontrolleri          | **Erota palvelukerros:** Siirrä validointi ja liiketoimintalogiikka esim. `TaskService`-luokkaan. Kontrolleri vain kääntää HTTP-kutsut palvelukutsuiksi ja vastauksiksi.                                                     |
| Duplikoitu validointi       | **Yksi validointimetodi tai -luokka:** Yksi paikka sääntöön “tehtävä on validi”. Kutsutaankin sekä luontia että päivitystä varten. Harkitse data-annotaatioita tai FluentValidationia.                                       |
| Taikasanat/taikanumerot     | **Vakiot tai enumit:** esim. `TaskStatus.Open`, `MaxTitleLength`, `MinPriority`, `MaxPriority`.                                                                                                                              |
| Dataan pääsy kontrollerissa | **Repository (tai vastaava):** Ota käyttöön `ITaskRepository` metodilla `GetAll`, `GetById`, `Add`, `Update`, `Delete`. Kontrolleri ja palvelu riippuvat rajapinnasta; toteutus voi olla ensin muistissa, sitten tietokanta. |
| Ad hoc -vastaukset          | **DTO:t ja vastausmallit:** Määritä esim. `TaskDto` tai `TaskResponse` selkeillä ominaisuuksilla. Palauta ne API:sta, jotta sopimus on eksplisiittinen ja johdonmukainen.                                                    |
| Huono nimeäminen            | **Nimeä uudelleen selkeyden vuoksi:** `g` → `GetAll`, `Get1` → `GetById`, `d` → `_tasks`, `id_from` → `GetIdFromTask` jne. Tee nimeämiset pienin askelin ja aja testit.                                                      |

### 5.3 Ehdotettu järjestys tyypilliselle API:lle

1. **Määritä DTO:t:** Pyyntö- ja vastaustyypit (esim. `CreateTaskRequest`, `TaskResponse`), jotta API-sopimus on selkeä.
2. **Erota validointi:** Yksi paikka, joka ottaa pyynnön (tai mallin) ja palauttaa virheet. Käytä sitä sekä luonnissa että päivityksessä.
3. **Ota käyttöön palvelu:** Siirrä liiketoimintalogiikka ja validointikutsut palveluun; kontrolleri vain delegoi ja kääntää HTTP:ksi.
4. **Ota käyttöön repository:** Siirrä tallennus rajapinnan taakse; injektoi se palveluun. Kontrollerit ja palvelut pysyvät testattavina ja tallennus vaihdettavana.
5. **Paranna nimeämistä ja poista duplikaatio:** Nimeä metodit ja muuttujat uudelleen, korvaa taika-arvot vakioilla.

---

## 6. Frontendin refaktorointi (React / SPA)

React- (tai vastaavan) frontendissa pääkohteita ovat **komponentit**, **tila**, **API-käyttö** ja **tyypit**.

### 6.1 Tyypillisiä ongelmia

- **Yksi valtava komponentti:** Kaikki tila (lista, lataus, virhe, lisäyslomake, muokkauslomake) ja kaikki API-kutsut yhdessä komponentissa. Kentän lisääminen tarkoittaa lisää tilaa ja duplikaatiota samassa tiedostossa.
- **Ei API-abstraktiota:** `fetch` ja URL:t komponentin sisällä; ei jaettuja tyyppejä pyynnölle/vastaukselle. Backendin muuttaminen pakottaa etsimään ja arvaamaan.
- **Heikot tai ei tyyppejä:** `any[]` tai `any` API-datalle, joten kirjoitusvirheet ja vääriä ominaisuudenimiä ei huomata.
- **Duplikoitu UI ja logiikka:** Lisäys- ja muokkauslomake toistavat samat kentät ja logiikan; statusvaihtoehdot ja URL:t kovakoodattuna useaan paikkaan.
- **Epäselvä nimeäminen:** Nimet kuten `lst`, `x`, `cur`, `t2`, `dc2`, `doIt` vaikeuttavat uuden kentän (esim. määräpäivä) lisäämistä oikeaan paikkaan ilman että jotain hajoaa.

### 6.2 Refaktoroinnin suunnat

| Ongelma                    | Refaktoroinnin suunta                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yksi valtava komponentti   | **Pilko komponentit:** esim. `TaskList`, `TaskForm`, `TaskItem`, `TaskEditForm`. Jokaisella selkeä vastuu. Lisäys-/muokkauslomakkeet voivat jakaa yhden esityskomponentin eri propseilla.                                                      |
| API-kutsut komponentissa   | **API-client-moduuli:** esim. `api/tasks.ts` funktioilla `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`. Komponentti kutsuu näitä; URL ja `fetch`-yksityiskohdat yhdessä paikassa.                                               |
| Ei tyyppejä                | **Jaetut tyypit:** Määritä esim. `Task`, `CreateTaskRequest` (backend-DTOjen mukaisesti). Käytä niitä API-clientissa ja komponenteissa.                                                                                                        |
| Duplikoidut lomakekentät   | **Uudelleenkäytettävä lomakekomponentti tai hook:** esim. `useTaskForm(initial)` palauttaa kentät ja käsittelijät; käytä sekä lisäyksessä että muokkauksessa. Tai yksi `TaskForm`-komponentti, joka saa `initialValues`- ja `onSubmit`-propit. |
| Inline-tyylit / taikasanat | **Vakiot ja CSS:** esim. `STATUS_OPTIONS`, `API_BASE`; siirrä tyylit CSS-moduuleihin tai pieneen design-järjestelmään.                                                                                                                         |
| Huono nimeäminen           | **Nimeä uudelleen selkeyden vuoksi:** `lst` → `tasks`, `x` → `loadTasks` tai `refetch`, `cur` → `editingTaskId`, `t2`/`dc2` → `editTitle`/`editDescription`, `doIt` → `handleAdd`, `del` → `handleDelete`, `msg` → `errorMessage`.             |

### 6.3 Ehdotettu järjestys tyypilliselle React-sovellukselle

1. **Ota käyttöön tyypit:** Määritä `Task` ja pyyntötyypit (API:n mukaiset). Käytä niitä tilassa ja API-kutsuissa.
2. **Erota API-client:** Siirrä kaikki `fetch`-kutsut yhteen moduuliin, joka palauttaa tyypitetyn datan. Korvaa inline-URL:t ja bodyt funktioparametreilla.
3. **Pilko komponentit:** Erota lista, listarivi, lisäyslomake ja muokkauslomake (tai yksi lomake tilalla). Välitä data ja callbackit propseina.
4. **Erota hookit (valinnainen, mutta hyödyllinen):** esim. `useTasks()` “listan lataus + CRUD” ja `useTaskForm()` lomakkeen tilalle. Yksinkertaistaa ylimmän tason komponenttia.
5. **Paranna nimeämistä ja tyylejä:** Nimeä tila ja käsittelijät uudelleen; siirrä tyylit CSS:ään tai design-tokeneihin.

---

## 7. Fullstack-sopimus

Frontendin ja backendin välinen **sopimus** on API: URL:t, metodit, pyynnön bodyt ja vastauksen rakenteet. Refaktorointi on helpompaa ja turvallisempaa, kun tämä sopimus on eksplisiittinen ja vakaa.

### 7.1 Sopimuksen teko eksplisiittiseksi

- **Backend:** Julkaise DTO:t tai dokumentoi pyyntö-/vastausskeemat. Käytä samoja DTO:ita (tai jaettua projektia) validoinnissa ja serialisoinnissa.
- **Frontend:** Käytä TypeScript- (tai vastaavia) tyyppejä, jotka peilataan noihin DTO:ihin. Ihanteellisesti yksi totuuden lähde (esim. OpenAPI-speksi tai jaetut tyypit), jotta molemmat puolet pysyvät synkassa.
- **Nimeäminen ja rakenne:** Johdonmukaiset ominaisuuden nimet (esim. `dueDate` sekä backendissa että frontendissa) ja yhtenäinen virhemuoto (esim. `{ message: string }` tai `{ errors: string[] }`).

### 7.2 Refaktorointi rikkomatta toista puolta

- **Backend-refaktorointi:** Pidä olemassa olevat endpointit ja vastausrakenteet, kunnes päätät versioida tai muuttaa API:ta. Uudet kentät voidaan lisätä valinnaisina, jotta vanhat frontendit toimivat edelleen.
- **Frontend-refaktorointi:** Jatka samojen endpointtien kutsumista samalla pyyntörakenteella, kunnes muutat sopimusta tietoisesti. Rakenteen parantaminen (komponentit, hookit, API-moduuli) ei vaadi sopimuksen muutosta.
- **Ominaisuuden lisääminen (esim. määräpäivä):** Sopikaa kentän nimi ja muoto (esim. `dueDate: "2025-03-15"`). Lisää se backend-DTOihin ja validointiin, sitten frontend-tyyppeihin ja lomakkeisiin. Yksi selkeä sopimus vähentää “toimii Postmanissa mutta ei UI:ssa” -tilanteita.

---

## 8. Yleisiä anti-patterneja verkkosovelluksissa (ja miten refaktoroida)

| Anti-pattern                                                                           | Mikä on vialla                                                | Refaktorointi                                                                            |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Jumala-olio** (kontrolleri tai komponentti tekee kaiken)                             | Vaikea testata, vaikea muuttaa, suuri regressioriski.         | Erota palvelut, repositoriot tai komponentit; yksi vastuu.                               |
| **Kopiointi** (sama validointi tai sama lomake kahdessa paikassa)                      | Muutokset pitää tehdä kahdesti; helppo unohtaa toinen paikka. | Erota jaettu metodi, komponentti tai hook.                                               |
| **Taikasanat/taikanumerot**                                                            | Epäselvä merkitys; vaikea muuttaa johdonmukaisesti.           | Vakiot, enumit tai konfiguraatio.                                                        |
| **Ei tyyppejä / heikot tyypit**                                                        | Sopimus implisiittinen; refaktorointi virhealtista.           | Ota käyttöön DTO:t ja frontend-tyypit; linjaa API:n kanssa.                              |
| **Sekoitetut kerrokset** (esim. SQL kontrollerissa tai fetch valtavassa komponentissa) | Kytkentää ja duplikaatiota.                                   | Erota kerrokset: kontrolleri → palvelu → repository; komponentti → API-client → backend. |
| **Epäselvä tai epäjohdonmukainen nimeäminen**                                          | Vaikea löytää muutettava kohta; helppo muuttaa väärää.        | Nimeä uudelleen pienin askelin; käytä kuvaavia, johdonmukaisia nimiä.                    |

---

## 9. Refaktoroinnin strategiat askel askeleelta

### 9.1 Erota metodi (backend tai frontend)

- **Milloin:** Koodilohkolla on selkeä tarkoitus, mutta se on upotettu pitkään metodiin/funktioon.
- **Miten:** Siirrä lohko uuteen metodiin/funktioon kuvaavalla nimellä; kutsu sitä alkuperäisestä paikasta. Parametrien ja paluuarvon pitää olla selkeitä.
- **Esimerkki (backend):** Erota “validoi tehtävän pyyntö” metodiin `ValidateTaskRequest(req)` ja kutsu sitä sekä Add- että Update-metodista.

### 9.2 Erota luokka / komponentti

- **Milloin:** Luokalla tai komponentilla on useita vastuita tai se on liian pitkä.
- **Miten:** Tunnista yhtenäinen data- ja käyttäytymisjoukko; siirrä se uuteen luokkaan tai komponenttiin. Käytä uutta luokkaa/komponenttia alkuperäisestä.
- **Esimerkki (frontend):** Erota “tehtävälista” → `TaskList`; “tehtävän lisäyslomake” → `TaskForm`; “yksi tehtävarivi” → `TaskItem`.

### 9.3 Ota käyttöön kerros (backend)

- **Milloin:** Kontrolleri (tai handler) sisältää liiketoimintalogiikkaa tai dataan pääsyä.
- **Miten:** Luo palvelu (ja tarvittaessa repository). Siirrä logiikka palveluun; siirrä dataan pääsy repositoryyn. Kontrolleri vain kääntää HTTP:n palvelukutsuiksi ja vastauksiksi.
- **Esimerkki:** `TaskController` → kutsuu `TaskService`; `TaskService` → kutsuu `ITaskRepository`. Kontrolleri pienenee ohueksi.

### 9.4 Ota käyttöön abstraktio (frontend)

- **Milloin:** API-kutsut ja URL:t ovat hajallaan ja duplikoituja.
- **Miten:** Luo API-moduuli (tai client) funktioilla, jotka ottavat tyypitettyjä parametreja ja palauttavat tyypitettyä dataa. Korvaa inline-`fetch` näiden funktioiden kutsulla.
- **Esimerkki:** `getTasks(): Promise<Task[]>`, `createTask(data: CreateTaskRequest): Promise<Task>`.

### 9.5 Nimeä uudelleen selkeyden vuoksi

- **Milloin:** Nimet ovat harhaanjohtavia, liian lyhyitä tai epäjohdonmukaisia.
- **Miten:** Nimeä uudelleen pienin askelin (yksi tunniste kerrallaan tarvittaessa). Käytä IDE:n “rename”-refaktorointia viittausten päivittämiseen. Aja testit jokaisen nimeämisen jälkeen.

---

## 10. Lisälukemista

- **Refactoring: Improving the Design of Existing Code** (Martin Fowler) — klassinen viite refaktoroinnin patternneihin ja turvallisiin askeliin.
- **Clean Code** (Robert C. Martin) — nimeäminen, funktiot ja rakenne.
- Framework oppaat (esim. .NET-dokumentaatio kontrollereista ja riippuvuuden injektoinnista, React-dokumentaatio komponenteista ja hookeista) idiomaattiseen rakenteeseen ja patterneihin.


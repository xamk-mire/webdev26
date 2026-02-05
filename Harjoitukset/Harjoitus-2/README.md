# Refaktorointiharjoitus – Task Manager

Pieni **.NET 10 Web API** - ja **React + TypeScript** -sovellus, joka on tietoisesti **huonosti suunniteltu** refaktoroinnin harjoitteluun. Koodia on tarkoituksella vaikea muuttaa, siinä on duplikaatiota ja sitä on vaikea testata. Metodien ja muuttujien nimet ovat **epäjohdonmukaisia ja epäselviä**, jotta koodissa liikkuminen ja muutokset vaikeutuvat.

**→ Yksityiskohtainen refaktoroinnin johdatus ja fullstack-verkkosovellusten refaktorointi: [docs/REFACTOROINTI-JOHDATUS-FI.md](docs/REFACTOROINTI-JOHDATUS-FI.md).**

---

## Projektin käynnistäminen

1. **Backend** (kansiosta `Backend`):

   ```bash
   cd Backend/RefactorExercise.Api
   dotnet run
   ```

   API käynnistyy osoitteeseen `http://localhost:5000`.

2. **Frontend** (kansiosta `Frontend`):
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   Käyttöliittymä käynnistyy osoitteeseen `http://localhost:5173` ja välittää `/api`-kutsut backendille.

## Mikä on vialla (ja mitä refaktoroida)

### Backend (.NET)

- **Jumala-kontrolleri** – Yksi kontrolleri hoitaa reitityksen, validoinnin, “liiketoimintasäännöt” ja dataan pääsyn. Ei palveluja, ei repositorioita.
- **Staattinen muuttuva tila** – “Tietokanta” on staattinen `List<object>`. Ei abstraktiota, ei testattavuutta.
- **Ei DTO:ita / sekoitetut muodot** – Vastaukset ovat `Dictionary<string, object>`. Ei jaettuja pyyntö-/vastaussopimuksia.
- **Duplikoitu validointi** – Samat säännöt POST- ja PUT-metodeissa. Taikasanat (`"Open"`, `"InProgress"`, `"Done"`).
- **Taikanumerot** – Prioriteetti 1–5 ja 200 merkin raja kovakoodattuna useaan paikkaan.
- **Hauraat helperit** – Helperit olettavat sanakirjarakennetta; uuden kentän lisääminen pakottaa koskemaan useaan paikkaan.
- **Huono nimeäminen** – Epäjohdonmukaiset ja ei-kuvaavat metodien ja muuttujien nimet (esim. `d`, `nxt`, `g`, `Get1`, `id_from`, `r`, `n`, `u`), jolloin on helppo käyttää väärin tai missata kohta ominaisuuksia lisättäessä.

**Refaktoroinnin ideoita:** Erota palvelukerros, ota käyttöön DTO:t ja validointi (esim. FluentValidation tai data-annotaatiot), korvaa staattinen lista rajapinnalla (esim. `ITaskRepository`), käytä vakioita/enumeja statukselle ja rajoille, lisää kunnollinen virheenkäsittely ja mahdollisesti minimaalinen Result-tyyppi.

### Frontend (React + TypeScript)

- **Yksi valtava komponentti** – Kaikki tila, kaikki API-kutsut ja koko UI ovat tiedostossa `App.tsx`.
- **Ei API-abstraktiota** – `fetch`-kutsut ja URL:t ovat komponentissa. Ei jaettuja tyyppejä vastauksille.
- **Heikko tyypitys** – `any[]` listadatalle, `any` listan alkioille. Ei Task-rajapintoja.
- **Duplikoitu UI** – Lisäys- ja muokkauslomake toistavat samat kentät ja tyylit.
- **Inline-tyylit** – Tyylit inline-objekteina, toistuvat ja vaikeasti ylläpidettävät.
- **Sekoitetut vastuut** – Lataus, virhe, CRUD ja lomakkeen tila kaikki yhdessä paikassa.
- **Taikasanat** – Statusvaihtoehdot ja URL kovakoodattuna.
- **Ei virheen nollausta** – Virheilmoitus asetetaan mutta harvoin tyhjennetään (esim. uuden onnistumisen yhteydessä).
- **Huono nimeäminen** – Epäselvät tai epäjohdonmukaiset nimet (esim. `lst`, `x`, `cur`, `t2`, `dc`, `doIt`), joten uuden kentän lisääminen tarkoittaa etsimistä monista samankaltaisista tilamuuttujista.

**Refaktoroinnin ideoita:** Pilko pienempiin komponentteihin (esim. `TaskList`, `TaskForm`, `TaskItem`, `TaskEditForm`), lisää API-client-moduuli ja jaetut tyypit (esim. `Task`, `CreateTaskRequest`), ota käyttöön custom-hookit (esim. `useTasks`, `useTaskForm`), siirrä tyylit CSS-moduuleihin tai pieneen design-järjestelmään, käytä vakioita statukselle ja API:n perus-URL:lle.

## Ehdotettu refaktoroinnin järjestys

1. **Backend:** Määritä DTO:t ja domain-malli → Erota validointi → Ota käyttöön palvelukerros → Ota käyttöön repository (rajapinta + muistitoteutus).

2. **Frontend:** Lisää TypeScript-tyypit Taskille ja API:lle → Erota API-client → Pilko komponentit → Erota hookit → Korvaa inline-tyylit.

---

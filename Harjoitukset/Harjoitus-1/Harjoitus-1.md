# Harjoitustehtävä 1: TodoItem + NoteItem backend + frontend (React + TypeScript + Tailwind)

## Tavoite

Laajenna aiemmin toteutettu **TemplateBackend.Api** lisäämällä siihen uusi resurssi:

📌 **NoteItem**

Ja rakenna käyttöliittymä käyttäen:

✅ React
✅ TypeScript
✅ Tailwind CSS

Lopputuloksena käyttäjä voi käyttää käyttöliittymästä käsin molempia resursseja:

✅ **TodoItem**
✅ **NoteItem**

---

# Osa A — Backend: NoteItem (TemplateBackend.Api)

## Ohje opiskelijalle

Tässä osassa sinun tehtäväsi on:

✅ palata aiempaan TemplateBackend.Api-johdantoon
✅ tutkia miten **TodoItem** on toteutettu
✅ toteuttaa **vastaava kokonaisuus NoteItemille** (kerrosarkkitehtuuri + CRUD)

### Backendiltä vaadittava toiminnallisuus

NoteItemille täytyy löytyä:

* Create
* Get all
* Get by id
* Update
* Delete

✅ Tee myös migraatio + päivitä tietokanta.
✅ Testaa toimivuus Scalarilla.

---

# Osa B — Frontend: React + TypeScript + Tailwind (TODO + NOTES)

## Tavoite

Toteuta käyttöliittymä, joka tukee **molempia backendin resursseja**:

✅ TodoItem (tehtävälista)
✅ NoteItem (muistiinpanot)

Frontendissä käyttäjä voi:

### TodoItem:

* nähdä listan todoista
* lisätä uuden todon
* merkitä todo valmiiksi / muokata
* poistaa todo

### NoteItem:

* nähdä listan muistiinpanoista
* lisätä uuden muistiinpanon
* muokata muistiinpanoa
* poistaa muistiinpano

---

## B1 — Luo React + TypeScript -projekti ja lisää Tailwind

Tee uusi projekti (esim. Vite + React + TS) ja lisää Tailwind.

✅ **Checkpoint**

* sovellus käynnistyy selaimeen
* Tailwind vaikuttaa ulkoasuun


# ✅ Ehdotettu frontend-rakenne (esimerkki)

Tässä yksi malli, joka skaalautuu molemmille ominaisuuksille:

```
src/
  api/
    todoApi.ts
    notesApi.ts

  components/
    layout/
      Navbar.tsx
      PageContainer.tsx

    todos/
      TodoForm.tsx
      TodoList.tsx
      TodoItemRow.tsx

    notes/
      NoteForm.tsx
      NoteList.tsx
      NoteCard.tsx

  pages/
    TodosPage.tsx
    NotesPage.tsx

  types/
    todoTypes.ts
    noteTypes.ts

  App.tsx
  main.tsx
```

### Miksi tämä rakenne on hyvä?

* Todo ja Notes pysyvät selkeästi erillään
* API-kutsut ovat yhdessä paikassa
* komponentit ovat pieninä ja uudelleenkäytettävinä

---

## B2 — Määritä API:n base URL

Frontend tarvitsee backendin osoitteen.

Suositus:

* `.env`-tiedosto
* esimerkiksi `VITE_API_BASE_URL=...`

✅ **Checkpoint**

* frontend saa yhteyden backendiin (testaa vaikka selaimen devtoolsista)

---

## B3 — Määritä TypeScript-tyypit molemmille resursseille

Luo tyypit:

* `TodoItem`
* `NoteItem`

Tyyppien pitäisi vastata backendin palauttamaa JSON-dataa.

✅ **Checkpoint**

* kun haet dataa API:sta, TS ymmärtää kentät oikein

---

## B4 — Tee API-kutsukerros molemmille

Tee erilliset API-toiminnot:

### Todo API

* get all todos
* create todo
* update todo
* delete todo

### Notes API

* get all notes
* create note
* update note
* delete note

✅ **Checkpoint**

* pystyt kutsumaan molempia API:ja ja saat dataa takaisin

---

## B5 — Rakenna käyttöliittymä kahdelle näkymälle (Todo + Notes)

Toteuta sovellukseen kaksi selkeää näkymää, esimerkiksi:

* **Todos**
* **Notes**

Toteutustapa on vapaa, mutta suositeltuja vaihtoehtoja:

✅ **Vaihtoehto A: Yksi sivu + tabit**

* käyttäjä vaihtaa “Todos / Notes” -välillä

✅ **Vaihtoehto B: Reititys (React Router)**

* `/todos`
* `/notes`

✅ **Checkpoint**

* käyttäjä pystyy siirtymään Todo- ja Notes-näkymien välillä

---

## B6 — Todo UI (CRUD)

Tee Todo-näkymä, joka sisältää:

### Todo-listaus

* näyttää kaikki todo-itemit

### Todo-luonti

* input (title)
* “Add” nappi

### Todo-päivitys

* vähintään “mark done” tai muokkaus titlelle
* (voit käyttää checkboxia tai edit-nappia)

### Todo-poisto

* delete-nappi

✅ **Checkpoint**

* Todo CRUD toimii end-to-end (frontend → backend → database)

---

## B7 — Notes UI (CRUD)

Tee Notes-näkymä, joka sisältää:

### Note-listaus

* näyttää kaikki notet

### Note-luonti

* title + content kentät
* “Create note” nappi

### Note-muokkaus

valitse jokin toteutustapa:

* modal
* erillinen sivu
* inline edit

### Note-poisto

* delete-nappi
* (suositus: varmistusdialogi)

✅ **Checkpoint**

* Notes CRUD toimii end-to-end (frontend → backend → database)

---

## B8 — Lisää käyttöliittymään loading- ja error-tilat (pakollinen)

Kun haet dataa backendiltä, käyttöliittymä ei saa olla “hiljaa”.

Tee ainakin:

* loading state (esim. “Loading…”)
* error state (esim. “Could not load data”)

✅ **Checkpoint**

* käyttäjä näkee selkeästi jos backend ei ole päällä

---

## B9 — Tyylittele Tailwindillä (siisti ja selkeä UI)

Tavoitteena ei ole täydellinen design, vaan:

* luettava layout
* selkeät napit ja inputit
* järkevä spacing
* responsiivinen perusnäkymä

✅ **Checkpoint**

* UI näyttää siistiltä sekä Todo- että Notes-osiossa

---

# Palautus checklista (deliverables)

## Backend

✅ NoteItem lisätty TodoItemin mallin mukaan
✅ migraatio tehty ja tietokanta päivitetty
✅ Scalarissa näkyy `/api/notes`
✅ Todo ja Notes endpointit toimivat

## Frontend

✅ Todo UI (CRUD) toimii
✅ Notes UI (CRUD) toimii
✅ React + TS + Tailwind käytössä
✅ loading + error -tilat toteutettu
✅ selkeä navigointi Todo/Notes välillä

---

# Bonushaasteet (valinnainen)

⭐ Haku (Todo ja Notes)
⭐ Lajittelu (uusin ensin)
⭐ Toggle done (PATCH) erillisenä toimintona
⭐ Form-validointi (front + back)
⭐ Optimistinen UI (päivitys näkyy heti)

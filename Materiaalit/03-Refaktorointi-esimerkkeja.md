# Refaktoroinnin prosessi – johdatus koodiesimerkeillä

Tässä materiaalissa esitellään **refaktorointiprosessia** konkreettisten **koodiesimerkkien** kautta. Materiaali liittyy [02-Refaktorointi.md](02-Refaktorointi.md) -dokumenttiin ja näyttää, miten yksittäisiä refaktorointiaskeleita tehdään käytännössä.

Jokaisessa esimerkissä näet **ennen**- ja **jälkeen**-koodin. Refaktoroinnin tavoite on, että **käyttäytyminen pysyy samana**; vain rakenne paranee.

---

## 1. Metodin erottaminen (backend)

**Ongelma:** Pitkä metodi sisältää useita asioita; sama logiikka toistuu useassa paikassa.

**Refaktorointi:** Ota toistuva tai selkeästi rajattu lohko omaan metodiin.

### Ennen

```csharp
[HttpPost]
public IActionResult Add([FromBody] TaskRequest r)
{
    if (r == null) return BadRequest("invalid");
    var t = r.title ?? "";
    var st = r.status ?? "Open";
    var pr = r.priority;

    // Validointi suoraan metodissa
    if (string.IsNullOrWhiteSpace(t)) return BadRequest("title required");
    if (t.Length > 200) return BadRequest("title too long");
    if (pr < 1 || pr > 5) return BadRequest("priority must be 1-5");
    if (st != "Open" && st != "InProgress" && st != "Done")
        return BadRequest("invalid status");

    var n = new Dictionary<string, object> { /* ... */ };
    d.Add(n);
    return CreatedAtAction(nameof(Get1), new { id = n["id"] }, n);
}

[HttpPut("{id}")]
public IActionResult Update(int id, [FromBody] TaskRequest r)
{
    // ... sama validointi toistuu täällä ...
}
```

### Jälkeen

```csharp
[HttpPost]
public IActionResult Add([FromBody] TaskRequest r)
{
    var validationError = ValidateTaskRequest(r);
    if (validationError != null) return validationError;

    var newTask = BuildTaskFromRequest(r, _nextId++);
    _tasks.Add(newTask);
    return CreatedAtAction(nameof(GetById), new { id = newTask["id"] }, newTask);
}

[HttpPut("{id}")]
public IActionResult Update(int id, [FromBody] TaskRequest r)
{
    var validationError = ValidateTaskRequest(r);
    if (validationError != null) return validationError;
    // ...
}

private IActionResult? ValidateTaskRequest(TaskRequest r)
{
    if (r == null) return BadRequest("invalid");
    var title = r.title ?? "";
    var status = r.status ?? "Open";
    var priority = r.priority;

    if (string.IsNullOrWhiteSpace(title)) return BadRequest("title required");
    if (title.Length > 200) return BadRequest("title too long");
    if (priority < 1 || priority > 5) return BadRequest("priority must be 1-5");
    if (status != "Open" && status != "InProgress" && status != "Done")
        return BadRequest("invalid status");

    return null; // validi
}
```

**Hyöty:** Validointi on yhdessä paikassa. Muutat säännöt kerran, ja sekä Add että Update käyttävät samaa logiikkaa.

---

## 2. Nimeäminen uudelleen (backend)

**Ongelma:** Lyhyet tai epäselvät nimet (`g`, `d`, `r`, `n`) vaikeuttavat lukemista ja muutoksia.

**Refaktorointi:** Korvaa nimet kuvaavilla nimillä. IDE:n “Rename”-toiminto päivittää kaikki viittaukset.

### Ennen

```csharp
public IActionResult g()
{
    return Ok(d);
}

public IActionResult Get1(int id)
{
    var i = d.FirstOrDefault(x => id_from(x) == id);
    if (i == null) return NotFound();
    return Ok(i);
}
```

### Jälkeen

```csharp
public IActionResult GetAll()
{
    return Ok(_tasks);
}

public IActionResult GetById(int id)
{
    var task = _tasks.FirstOrDefault(t => GetTaskId(t) == id);
    if (task == null) return NotFound();
    return Ok(task);
}
```

**Hyöty:** Koodi kertoo itse, mitä se tekee. Uuden kentän lisääminen on helpompaa, kun muuttujat ovat selkeitä.

---

## 3. Vakioiden käyttöönotto (backend)

**Ongelma:** Taikanumerot ja -merkkijonot hajallaan koodissa (`200`, `1`, `5`, `"Open"`, `"Done"`).

**Refaktorointi:** Määritä vakiot tai enumit ja käytä niitä.

### Ennen

```csharp
if (t.Length > 200) return BadRequest("title too long");
if (pr < 1 || pr > 5) return BadRequest("priority must be 1-5");
if (st != "Open" && st != "InProgress" && st != "Done")
    return BadRequest("invalid status");
```

### Jälkeen

```csharp
public static class TaskConstraints
{
    public const int MaxTitleLength = 200;
    public const int MinPriority = 1;
    public const int MaxPriority = 5;
}

public static class TaskStatus
{
    public const string Open = "Open";
    public const string InProgress = "InProgress";
    public const string Done = "Done";
    public static readonly string[] All = { Open, InProgress, Done };
}

// Käyttö:
if (title.Length > TaskConstraints.MaxTitleLength)
    return BadRequest("title too long");
if (priority < TaskConstraints.MinPriority || priority > TaskConstraints.MaxPriority)
    return BadRequest("priority must be 1-5");
if (!TaskStatus.All.Contains(status))
    return BadRequest("invalid status");
```

**Hyöty:** Rajoja ja sallittuja arvoja on helppo muuttaa yhdestä paikasta. Koodi on myös dokumentoitua.

**Lisäksi** Rajaarvot voitaisiin myös tallentaa tietokantaan, missä niitä olisi mahdollista muokata dynaamisemmin ilman koodin päivittämistä.

---

## 4. DTO:n käyttöönotto (backend)

**Ongelma:** Vastaukset rakennetaan sanakirjoina (`Dictionary<string, object>`), joten sopimus on epäselvä ja virhealtis.

**Refaktorointi:** Määritä selkeä vastausmalli (DTO) ja palauta se.

### Ennen

```csharp
var n = new Dictionary<string, object>
{
    ["id"] = nxt++,
    ["title"] = t.Trim(),
    ["description"] = (dc ?? "").Trim(),
    ["status"] = st,
    ["priority"] = pr,
    ["createdAt"] = DateTime.UtcNow.ToString("o")
};
d.Add(n);
return Ok(n);
```

### Jälkeen

```csharp
public record TaskResponse(
    int Id,
    string Title,
    string Description,
    string Status,
    int Priority,
    string CreatedAt
);

// Palvelussa tai kontrollerissa:
var task = new TaskResponse(
    Id: _nextId++,
    Title: request.Title.Trim(),
    Description: (request.Description ?? "").Trim(),
    Status: request.Status,
    Priority: request.Priority,
    CreatedAt: DateTime.UtcNow.ToString("o")
);
_tasks.Add(task);
return Ok(task);
```

**Hyöty:** API-sopimus on eksplisiittinen. Frontend voi käyttää samoja kentänimiä ja tyyppejä. Serialisointi hoitaa JSON-muunnoksen.

---

## 5. Komponentin erottaminen (React / frontend)

**Ongelma:** Yksi suuri komponentti sisältää listan, lomakkeen ja kaiken tilan; uuden kentän lisääminen tarkoittaa monia muutoksia samaan tiedostoon.

**Refaktorointi:** Erota looginen osa (esim. yhden tehtävän rivi) omaan komponenttiin.

### Ennen

```tsx
// App.tsx – kaikki yhdessä
return (
  <div>
    {/* ... lomake ... */}
    <div>
      {lst.map((item) => (
        <div key={item.id} style={{ border: '1px solid #ccc', padding: 12 }}>
          <div style={{ fontWeight: 'bold' }}>{item.title}</div>
          {item.description && <div>{item.description}</div>}
          <div>
            {item.status} | Priority: {item.priority}
          </div>
          <button onClick={() => edit(item)}>Edit</button>
          <button onClick={() => del(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  </div>
);
```

### Jälkeen

```tsx
// TaskItem.tsx
interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  return (
    <div className="taskItemContainer">
      <div className="taskItemTitle">{task.title}</div>
      {task.description && <div>{task.description}</div>}
      <div>
        {task.status} | Priority: {task.priority}
      </div>
      <button onClick={() => onEdit(task)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}

// App.tsx
return (
  <div>
    {/* ... lomake ... */}
    <div>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={edit} onDelete={del} />
      ))}
    </div>
  </div>
);
```

**Hyöty:** Yhden tehtävän näyttäminen ja muokkaus-nappulat ovat yhdessä paikassa. App.tsx pysyy lyhyempänä ja selkeämpänä. Tyylit on siiretty tyylitiedostoihin inline tyylitysten sijaan.

---

## 6. API-kutsujen erottaminen (React / frontend)

**Ongelma:** `fetch`-kutsut ja URL:t ovat komponentin sisällä; sama kutsulogiikka toistuu useassa kohdassa.

**Refaktorointi:** Luo API-moduuli, joka palauttaa tyypitettyjä dataa.

### Ennen

```tsx
// App.tsx
const API = '/api/task';

useEffect(() => {
  fetch(API)
    .then((r) => r.json())
    .then((d) => {
      setLst(d);
      setLoading(false);
    })
    .catch(() => setMsg('Failed to load'));
}, []);

function doIt(e: React.FormEvent) {
  e.preventDefault();
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: t,
      description: dc,
      status: st,
      priority: pr,
    }),
  })
    .then((r) => r.json())
    .then(() => x())
    .catch((e) => setMsg(e.message));
}
```

### Jälkeen

```ts
// api/tasks.ts
const BASE = '/api/task';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: number;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: string;
  priority: number;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

```tsx
// App.tsx
useEffect(() => {
  getTasks()
    .then(setTasks)
    .catch(() => setErrorMessage('Failed to load'))
    .finally(() => setLoading(false));
}, []);

function handleAdd(e: React.FormEvent) {
  e.preventDefault();
  createTask({ title, description, status, priority })
    .then(() => {
      resetForm();
      loadTasks();
    })
    .catch((err) => setErrorMessage(err.message));
}
```

**Hyöty:** URL ja HTTP-detaljit ovat yhdessä paikassa. Komponentti käyttää selkeitä funktioita ja tyyppejä. Backendin muutos vaikuttaa vain API-moduuliin.

**Seuraava askel** olisi siirtää kaikki API kutsut keskitetysti oman service tiedoston sisälle.

---

## 7. Tilan ja käsittelijöiden nimeäminen uudelleen (React)

**Ongelma:** Epäselvät nimet (`lst`, `x`, `cur`, `t2`, `dc2`, `doIt`, `del`) vaikeuttavat uuden kentän lisäämistä.

**Refaktorointi:** Nimeä uudelleen kuvaavasti niin, että vastaavat asiat (lisäyslomake vs. muokkauslomake) erottuvat.

### Ennen

```tsx
const [lst, setLst] = useState<any[]>([]);
const [t, setT] = useState('');
const [dc, setDc] = useState('');
const [cur, setCur] = useState<number | null>(null);
const [t2, setT2] = useState('');
const [dc2, setDc2] = useState('');

function x() {
  /* ... */
}
function doIt(e: React.FormEvent) {
  /* ... */
}
function del(id: number) {
  /* ... */
}
```

### Jälkeen

```tsx
const [tasks, setTasks] = useState<Task[]>([]);
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
const [editTitle, setEditTitle] = useState('');
const [editDescription, setEditDescription] = useState('');

function loadTasks() {
  /* ... */
}
function handleAddTask(e: React.FormEvent) {
  /* ... */
}
function handleDeleteTask(id: number) {
  /* ... */
}
```

**Hyöty:** Kun lisäät määräpäivän, tiedät heti, että tarvitset `dueDate` ja `editDueDate` (tai vastaavat) ja missä ne kytketään. Vähemmän riskiä muuttaa väärää muuttujaa.

---

## 8. Refaktorointiprosessi käytännössä

Yllä olevat esimerkit vastaavat tyypillisiä **yhtä askelta** kerrallaan -refaktorointeja:

| Askel                       | Mitä teet                             | Tavoite                                          |
| --------------------------- | ------------------------------------- | ------------------------------------------------ |
| 1. Erota metodi             | Siirrä toistuva lohko omaan metodiin  | Vähemmän duplikaatiota, yksi paikka muutoksille  |
| 2. Nimeä uudelleen          | Korvaa epäselvät nimet kuvaavilla     | Luettavuus ja turvallisemmat muutokset           |
| 3. Ota käyttöön vakiot      | Korvaa taikanumerot ja -merkkijonot   | Selkeä raja ja helpompi ylläpito                 |
| 4. Ota käyttöön DTO         | Määritä pyyntö-/vastausmallit         | Eksplisiittinen API-sopimus                      |
| 5. Erota komponentti        | Siirrä UI-lohko omaan komponenttiin   | Selkeä vastuunjako ja lyhyempi pääkomponentti    |
| 6. Erota API-client         | Siirrä fetch-funktiot omaan moduuliin | Yksi paikka API-kutsuille ja tyypeille           |
| 7. Paranna tilan nimeämistä | Nimeä state ja käsittelijät uudelleen | Helppo lisätä uusia kenttiä oikeisiin paikkoihin |

**Suositeltu järjestys:** Aloita sellaisesta kohdasta, joka helpottaa seuraavaa muutosta (esim. ennen määräpäivän lisäämistä: ensin validointi ja nimeäminen backendissa, sitten tyypit ja API-client frontendissa). Jokaisen askeleen jälkeen aja sovellus ja tarkista, että käyttäytyminen on ennallaan.

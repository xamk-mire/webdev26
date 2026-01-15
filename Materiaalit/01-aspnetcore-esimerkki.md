# Rakenna mukana: Esimerkki Template Backend (.NET 10 + PostgreSQL + Kerrosarkkitehtuuri + Scalar)

## Tavoite

Tässä ohjeessa rakennamme **uudelleen käytettävän backend-template projektin**, jota voit käyttää omien sovellusten pohjana sekä esimerkkinä.

Rakennettava sovellus:

* on **ASP.NET Core Web API**
* käyttää **PostgreSQL**-tietokantaa
* käyttää **Entity Framework Corea (EF Core)** tietokantaan
* näyttää API-dokumentaation **Scalar UI:n avulla**
* käyttää **kerrosarkkitehtuuria**, jotta koodi pysyy selkeänä

---

# 0) Varmista että .NET 10 on asennettu

## Vaihe 0.1 — Tarkista versio

```bash
dotnet --version
```

✅ Jos näkyy `10.0.x`, jatka.

## Vaihe 0.2 — Asenna / päivitä .NET 10 

Asenna [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download) ja tarkista uudelleen.

---

# 1) Luo WebApi projekti kontrollereilla (Controllers)

## Vaihe 1.1 — Luo projekti

```bash
mkdir TemplateBackend
cd TemplateBackend
dotnet new webapi -n TemplateBackend.Api --use-controllers
cd TemplateBackend.Api
```

### Miksi tämä vaihe tehdään?

Tämä luo valmiin Web API -pohjan, josta on helppo lähteä liikkeelle ja sisältää:

* ASP.NET Core asetukset
* `Program.cs`
* `appsettings.json`
* valmiit “projektirakenteen peruspalikat”

## Vaihe 1.2 — Varmista vielä .NET 10 target

Avaa `TemplateBackend.Api.csproj`:

```xml
<TargetFramework>net10.0</TargetFramework>
```

### Miksi tämä tarkistetaan?

Koska vaikka koneessa olisi .NET 10, projekti voi olla luotu eri versiolla (esim. loit projektin ennen kuin asensit .NET 10)
Tämä varmistaa että projekti kääntyy .NET 10:lle.

## Vaihe 1.3 — Käynnistä projekti

```bash
dotnet run
```

✅ **Checkpoint:** sovellus käynnistyy ilman virheitä terminaalissa.

---

# 2) Lisää tietokantapaketit + Scalar

## Vaihe 2.1 — EF Core + PostgreSQL (10.x)

```bash
dotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.0
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.0
```

### Miksi nämä paketit?

* EF Core tarvitsee “providerin”, jotta se osaa puhua PostgreSQL:lle
* Design-paketti mahdollistaa migraatiot (`dotnet ef ...`) 

---

## Vaihe 2.2 — Scalar UI

```bash
dotnet add package Scalar.AspNetCore
```

### Miksi tämä paketti?

Se lisää mahdollisuuden näyttää API-dokumentaatio UI:na reitissä `/scalar`. 

Scalar on uudempi tapa dokumentoida API rajapintoja ja toimii Swaggerin korvaajana.

---

## Vaihe 2.3 — OpenAPI JSON -generointi (Swashbuckle)

```bash
dotnet add package Swashbuckle.AspNetCore
```

### Miksi Swashbuckle tarvitaan vaikka ei käytetä Swagger UI:ta?

Scalar tarvitsee **OpenAPI JSON** -dokumentin.
Swashbuckle tekee tämän dokumentin ja julkaisee sen reitissä, esim. `/openapi/v1.json`.

---

# 3) Luo kansiorakenne

Luo kansiot:

* `Controllers`
* `Services`
* `Repositories`
* `Data`
* `Models`

### Miksi kansiot luodaan?

Koska haluamme kerrosarkkitehtuurin:

* jokainen koodipala “asuu” oikeassa paikassa
* löydät asiat helposti
* projekti pysyy selkeänä ja laajennettavana

---

# 4) Models — Tietokantamalli (TodoItem)

## ✅ Luo tiedosto: `Models/TodoItem.cs`

### Miksi tämä tiedosto luodaan?

Tämä luokka toimii **tietokantataulun mallina**.

EF Core käyttää tätä luokkaa ja luo PostgreSQL:ään taulun, jossa on sarakkeet:

* `Id`
* `Title`
* `IsDone`
* `CreatedAtUtc`

### Koodi

```csharp
namespace TemplateBackend.Api.Models;

// Entity-luokka -> muuttuu tietokantatauluksi EF Coren avulla
public class TodoItem
{
    public int Id { get; set; }                 // Primary key (uniikki id)
    public string Title { get; set; } = "";     // Tehtävän otsikko
    public bool IsDone { get; set; }            // Onko tehtävä tehty?
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow; // Luontiaika
}
```

### Mitä koodi tekee?

* `public class TodoItem` määrittelee uuden “olion” (todo-tehtävä)
* `Id` on pääavain (EF Core tunnistaa sen automaattisesti)
* muut propertyt ovat tietoa, joka tallennetaan tietokantaan
* `CreatedAtUtc` saa oletuksena nykyajan

✅ **Checkpoint:** ei punaisia virheitä editorissa.

---

# 5) Data — DbContext (tietokannan “portti”)

## ✅ Luo tiedosto: `Data/AppDbContext.cs`

### Miksi tämä tiedosto luodaan?

EF Core tarvitsee `DbContext`-luokan, jotta se osaa:

* yhdistää tietokantaan
* suorittaa kyselyitä (SELECT)
* lisätä / päivittää / poistaa rivejä
* tallentaa muutokset (`SaveChangesAsync()`)

Tämä on tavallaan “tietokannan ohjauskeskus”.

### Koodi

```csharp
using Microsoft.EntityFrameworkCore;
using TemplateBackend.Api.Models;

namespace TemplateBackend.Api.Data;

// DbContext = EF Coren yhteys ja työkalut tietokantaan
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    // DbSet = tietokantataulu (TodoItems)
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
}
```

### Mitä koodi tekee?

* `AppDbContext : DbContext` kertoo: “tämä luokka on EF Core -konteksti”
* `DbSet<TodoItem>` vastaa taulua `TodoItems`
* `options` sisältää yhteysasetukset, jotka annetaan Program.cs:ssä

✅ **Checkpoint:** tiedosto kääntyy virheettömästi.

---

# 6) Asetukset — Connection String

## ✅ Muokkaa: `appsettings.json`

### Miksi tämä muutos tehdään?

Backendin täytyy tietää, mihin PostgreSQL:ään se yhdistää.

Connection string kertoo:

* host (missä tietokanta on)
* portti
* database nimi
* käyttäjä ja salasana

### Lisättävä osa

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=template_backend;Username=postgres;Password=postgres"
  }
}
```

✅ **Checkpoint:** JSON on oikein (ei puuttuvia pilkkuja/sulkeita).

---

# 7) Repository — tietokantatoiminnot

Repository kerros hoitaa **vain tiedon käsittelyn**:

* ei HTTP:ta
* ei statuskoodeja
* ei liiketoimintasääntöjä

---

## ✅ Luo tiedosto: `Repositories/ITodoRepository.cs`

### Miksi tämä tiedosto luodaan?

Interface tekee “sopimuksen”, jonka mukaan repository toimii.

Tämän etu:

* Service ei välitä, mikä toteutus on käytössä
* myöhemmin voit tehdä testejä helpommin

### Koodi

```csharp
using TemplateBackend.Api.Models;

namespace TemplateBackend.Api.Repositories;

public interface ITodoRepository
{
    Task<List<TodoItem>> GetAllAsync();
    Task<TodoItem?> GetByIdAsync(int id);
    Task<TodoItem> AddAsync(TodoItem item);
    Task<bool> UpdateAsync(TodoItem item);
    Task<bool> DeleteAsync(int id);
}
```

### Mitä koodi tekee?

Se listaa metodit, joita repositoryn pitää tarjota:

* hae kaikki
* hae yksittäinen
* lisää
* päivitä
* poista

---

## ✅ Luo tiedosto: `Repositories/TodoRepository.cs`

### Miksi tämä tiedosto luodaan?

Tämä on “oikea toteutus”, joka tekee EF Core -kyselyt.

### Koodi

```csharp
using Microsoft.EntityFrameworkCore;
using TemplateBackend.Api.Data;
using TemplateBackend.Api.Models;

namespace TemplateBackend.Api.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly AppDbContext _db;

    public TodoRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TodoItem>> GetAllAsync()
        => await _db.TodoItems.OrderByDescending(t => t.Id).ToListAsync();

    public async Task<TodoItem?> GetByIdAsync(int id)
        => await _db.TodoItems.FindAsync(id);

    public async Task<TodoItem> AddAsync(TodoItem item)
    {
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();
        return item;
    }

    public async Task<bool> UpdateAsync(TodoItem item)
    {
        var exists = await _db.TodoItems.AnyAsync(t => t.Id == item.Id);
        if (!exists) return false;

        _db.TodoItems.Update(item);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.TodoItems.FindAsync(id);
        if (item is null) return false;

        _db.TodoItems.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
```

### Mitä tämä koodi tekee?

* käyttää `_db.TodoItems` taulua
* `ToListAsync()` hakee listan tietokannasta
* `FindAsync(id)` hakee yhden avaimella
* `SaveChangesAsync()` tallentaa muutokset PostgreSQL:ään

✅ **Checkpoint:** ei virheitä.

---

# 8) Service — sovelluslogiikka ja säännöt

Service kerros sisältää:

* validoinnin (esim. title ei tyhjä)
* päätökset (“jos ei löydy → virhe”)
* yhdistää repository-kutsut

---

## ✅ Luo tiedosto: `Services/ITodoService.cs`

### Miksi tämä tiedosto luodaan?

Interface tekee selkeän sopimuksen siitä, mitä toimintoja Todo-palvelu tarjoaa.

### Koodi

```csharp
using TemplateBackend.Api.Models;

namespace TemplateBackend.Api.Services;

public interface ITodoService
{
    Task<List<TodoItem>> GetAllAsync();
    Task<TodoItem?> GetByIdAsync(int id);

    Task<(bool Success, string? Error, TodoItem? Item)> CreateAsync(string title);
    Task<(bool Success, string? Error)> UpdateAsync(int id, string title, bool isDone);

    Task<bool> DeleteAsync(int id);
}
```

---

## ✅ Luo tiedosto: `Services/TodoService.cs`

### Miksi tämä tiedosto luodaan?

Tämä on varsinainen palvelu, jossa on sovelluksen “säännöt”.

### Koodi

```csharp
using TemplateBackend.Api.Models;
using TemplateBackend.Api.Repositories;

namespace TemplateBackend.Api.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repo;

    public TodoService(ITodoRepository repo)
    {
        _repo = repo;
    }

    public Task<List<TodoItem>> GetAllAsync() => _repo.GetAllAsync();

    public Task<TodoItem?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);

    public async Task<(bool Success, string? Error, TodoItem? Item)> CreateAsync(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return (false, "Title ei voi olla tyhjä.", null);

        var item = new TodoItem
        {
            Title = title.Trim(),
            IsDone = false
        };

        var created = await _repo.AddAsync(item);
        return (true, null, created);
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(int id, string title, bool isDone)
    {
        if (string.IsNullOrWhiteSpace(title))
            return (false, "Title ei voi olla tyhjä.");

        var existing = await _repo.GetByIdAsync(id);
        if (existing is null)
            return (false, "Todoa ei löytynyt.");

        existing.Title = title.Trim();
        existing.IsDone = isDone;

        var ok = await _repo.UpdateAsync(existing);
        return ok ? (true, null) : (false, "Päivitys epäonnistui.");
    }

    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
```

### Mitä tämä koodi tekee?

* `CreateAsync`: tarkistaa että title ei ole tyhjä, ja luo uuden TodoItemin
* `UpdateAsync`: tarkistaa että todo löytyy ennen päivitystä
* palauttaa selkeät onnistumis/virheilmoitukset controllereille

✅ **Checkpoint:** ei virheitä.

---

# 9) DTO:t — asiakaspyynnön mallit

## ✅ Luo `Models/TodoCreateRequest.cs`

### Miksi tämä luodaan?

Emme halua, että käyttäjä voi lähettää `Id` tai `CreatedAtUtc`, joten määritämme vain sen kentän mitä tarvitaan: `Title`.

```csharp
namespace TemplateBackend.Api.Models;

public class TodoCreateRequest
{
    public string Title { get; set; } = "";
}
```

---

## ✅ Luo `Models/TodoUpdateRequest.cs`

### Miksi tämä luodaan?

Päivityksessä tarvitaan:

* uusi title
* uusi IsDone-arvo

```csharp
namespace TemplateBackend.Api.Models;

public class TodoUpdateRequest
{
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
}
```

✅ **Checkpoint:** DTO:t eivät anna virheitä.

---

# 10) Controller — HTTP endpointit

## ✅ Luo `Controllers/TodosController.cs`

### Miksi tämä tiedosto luodaan?

Controller on se osa sovellusta joka:

* vastaanottaa HTTP-pyyntöjä (GET/POST/PUT/DELETE)
* kutsuu serviceä
* palauttaa HTTP-vastauksen (Ok/NotFound/BadRequest...)

```csharp
using Microsoft.AspNetCore.Mvc;
using TemplateBackend.Api.Models;
using TemplateBackend.Api.Services;

namespace TemplateBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly ITodoService _service;

    public TodosController(ITodoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoItem>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TodoItem>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<TodoItem>> Create([FromBody] TodoCreateRequest request)
    {
        var result = await _service.CreateAsync(request.Title);

        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetById), new { id = result.Item!.Id }, result.Item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TodoUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request.Title, request.IsDone);

        if (!result.Success)
        {
            if (result.Error == "Todoa ei löytynyt.")
                return NotFound(new { error = result.Error });

            return BadRequest(new { error = result.Error });
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => (await _service.DeleteAsync(id)) ? NoContent() : NotFound();
}
```

✅ **Checkpoint:** projekti kääntyy.

---

# 11) Program.cs — sovelluksen käynnistys ja Scalar

## ✅ Päivitä `Program.cs`

### Miksi tätä muokataan?

Tässä tiedostossa:

* rekisteröidään DI-palvelut (repository ja service)
* asetetaan DbContext + yhteys tietokantaan
* julkaistaan OpenAPI JSON
* näytetään Scalar UI

```csharp
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using TemplateBackend.Api.Data;
using TemplateBackend.Api.Repositories;
using TemplateBackend.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// OpenAPI JSON (Scalar tarvitsee tämän)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// PostgreSQL + EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(conn);
});

// Dependency Injection
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapSwagger("/openapi/{documentName}.json");
    app.MapScalarApiReference(); // /scalar
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
```

✅ **Checkpoint:**

* OpenAPI JSON: `/openapi/v1.json`
* Scalar UI: `/scalar`

---

# 12) Migraatiot — luo taulut tietokantaan

## Vaihe 12.1 — Asenna dotnet-ef

```bash
dotnet tool install --global dotnet-ef --version 10.0.2
```

## Vaihe 12.2 — Luo migraatio

```bash
dotnet ef migrations add InitialCreate
```

## Vaihe 12.3 — Päivitä tietokanta

```bash
dotnet ef database update
```

### Mitä tässä tapahtuu?

* EF Core luo “Migrations” -tiedostot
* EF Core ajaa SQL-komennot PostgreSQL:ään
* tuloksena syntyy `TodoItems` taulu

---

# 13) Testaa Scalarilla ✅

Käynnistä:

```bash
dotnet run
```

Avaa:

* `https://localhost:xxxx/scalar`

Testaa:

* `POST /api/todos`

  ```json
  { "title": "Testi Scalarilla" }
  ```
* `GET /api/todos`

---

# ✅ Yhteenveto: Miksi jokainen tiedosto on olemassa?

* **Models/TodoItem.cs**
  → tietokantataulu (entity)

* **Data/AppDbContext.cs**
  → EF Coren yhteys ja taulujen määrittely

* **Repositories/**
  → tietokantaoperaatiot (CRUD-kyselyt)

* **Services/**
  → säännöt ja validointi (liiketoimintalogiikka)

* **Controllers/**
  → HTTP endpointit ja statuskoodit

* **Program.cs**
  → sovelluksen käynnistys, DI, OpenAPI, Scalar UI

---


# Projektin kansiorakenne (kerrosarkkitehtuuri)

Kun käytämme kerrosarkkitehtuuria (layered architecture), meidän backend-projektin idea on jakaa koodi eri “vastuualueisiin”.

Lopputuloksena projektissa on tällainen rakenne:

```
TemplateBackend.Api/
  Controllers/
  Services/
  Repositories/
  Data/
  Models/
  Program.cs
  appsettings.json
```

Jokaisella kansiolla on oma roolinsa, ja ne toimivat yhdessä.

---

# 1) Controllers/ — “API:n ovet ulkomaailmaan”

## Mitä tänne kuuluu?

Tänne tulee **Controller-luokkia**, esimerkiksi:

* `TodosController.cs`

## Mitä Controller tekee?

Controller on se paikka, joka:

✅ vastaanottaa HTTP-pyyntöjä (GET, POST, PUT, DELETE)
✅ lukee sisääntulevan datan (JSON-body, route-parametrit)
✅ kutsuu Serviceä tekemään työn
✅ palauttaa HTTP-vastauksen (200 OK, 404 NotFound, 400 BadRequest…)

## Miksi Controllers-kansio on olemassa?

Koska haluamme, että:

* HTTP-logiikka (statuskoodit, reitit) löytyy **yhdestä paikasta**
* “web-asioita” ei sekoiteta tietokantakyselyihin tai sääntöihin

**Yksinkertaistettuna:**
📌 Controller = “API:n vastaanotto / liikenteenohjaus”

---

# 2) Services/ — “Säännöt ja sovelluslogiikka”

## Mitä tänne kuuluu?

Tänne tulee **Service-luokkia**, esimerkiksi:

* `TodoService.cs`
* `ITodoService.cs`

## Mitä Service tekee?

Service on se paikka, jossa:

✅ tehdään validointi (esim. “title ei saa olla tyhjä”)
✅ päätetään mitä sovelluksessa tapahtuu
✅ yhdistellään tarvittaessa useita repository-kutsuja
✅ toteutetaan “säännöt” (business logic)

### Esimerkki:

Kun käyttäjä tekee uuden todon:

* Service tarkistaa, onko otsikko tyhjä
* Service luo TodoItem-olion
* Service pyytää repositorya tallentamaan sen

## Miksi Services-kansio on olemassa?

Koska haluamme pitää logiikan erillään:

* Controller ei paisu liian isoksi
* Säännöt pysyvät yhdessä paikassa
* Sama logiikka voidaan tarvittaessa käyttää useasta endpointista

📌 Service = “aivot / päätökset / säännöt”

---

# 3) Repositories/ — “Tietokantakyselyt ja CRUD”

## Mitä tänne kuuluu?

Tänne tulee **Repository-luokkia**, esimerkiksi:

* `TodoRepository.cs`
* `ITodoRepository.cs`

## Mitä Repository tekee?

Repository on kerros, joka:

✅ hakee tietoa tietokannasta
✅ lisää tietoa tietokantaan
✅ päivittää rivin tietokannassa
✅ poistaa rivin tietokannasta

Repository käyttää EF Core -DbContextia (`AppDbContext`) ja tekee queryt kuten:

* `ToListAsync()` (hakee listan)
* `FindAsync(id)` (hakee yhden)
* `SaveChangesAsync()` (tallentaa)

## Miksi Repositories-kansio on olemassa?

Koska haluamme, että:

* kaikki tietokantatoiminnallisuus on yhdessä paikassa
* Service ei sisällä EF Core -kyselykoodia
* tietokannan vaihtaminen myöhemmin olisi helpompaa

📌 Repository = “tietokantakuljettaja / CRUD-kerros”

---

# 4) Data/ — “Tietokannan yhteys ja EF Core -asetukset”

## Mitä tänne kuuluu?

Tänne tulee tyypillisesti:

* `AppDbContext.cs`

## Mitä DbContext tekee?

DbContext on EF Coren “yhdistävä osa”, joka:

✅ tietää mitä tauluja tietokannassa on
✅ tarjoaa pääsyn niihin (DbSet)
✅ hoitaa yhteyden tietokantaan
✅ tallentaa muutokset (`SaveChangesAsync()`)

Esimerkiksi:

```csharp
public DbSet<TodoItem> TodoItems => Set<TodoItem>();
```

Tämä tarkoittaa:

> “Tässä tietokannassa on taulu TodoItems”

## Miksi Data-kansio on olemassa?

Koska DbContext ja tietokantaan liittyvät asetukset ovat oma kokonaisuus.

📌 Data = “EF Core -yhteys ja taulujen määrittely”

---

# 5) Models/ — “Tietomallit”

Tämä kansio sisältää yleensä kahta eri tyyppiä malleja:

## A) Entityt (tietokantataulut)

Esim:

* `TodoItem.cs`

Nämä ovat luokkia, joista EF Core rakentaa tietokantatauluja.

📌 Entity = “tietokantarivi oliona”

---

## B) DTO:t / Request-mallit (asiakkaalta tuleva data)

Esim:

* `TodoCreateRequest.cs`
* `TodoUpdateRequest.cs`

Nämä kuvaavat, **millaista dataa API odottaa käyttäjältä**.

### Miksi nämä ovat tärkeitä?

Koska emme halua, että käyttäjä voi lähettää esimerkiksi:

* `Id`
* `CreatedAtUtc`

DTO rajaa sisääntulevan datan turvalliseksi ja selkeäksi.

📌 DTO = “lomake, jonka käyttäjä täyttää”

---

# 6) Program.cs — “Sovelluksen käynnistys ja asetukset”

Tämä ei ole kansio, mutta se on tärkein tiedosto.

## Mitä Program.cs tekee?

Se:

✅ rekisteröi DI-palvelut (`AddScoped`)
✅ liittää DbContextin tietokantaan (`UseNpgsql`)
✅ laittaa Scalar UI:n päälle
✅ ottaa controllerit käyttöön (`MapControllers`)
✅ määrittää CORS-asetukset fronttia varten

📌 Program.cs = “backendin käynnistys ja kytkennät”

---

# 7) appsettings.json — “Asetustiedosto”

Täällä ovat asetukset kuten:

* tietokannan connection string
* mahdolliset ympäristökohtaiset asetukset

📌 appsettings.json = “konfiguraatio”

---

# Kokonaiskuva: miten nämä toimivat yhdessä?

Kun frontend kutsuu APIa:

### `POST /api/todos`

Koodi kulkee näin:

1. **Controller** ottaa pyynnön vastaan
2. Controller kutsuu **Serviceä**
3. Service tarkistaa säännöt ja kutsuu **Repositorya**
4. Repository käyttää **DbContextia** ja PostgreSQL:ää
5. Vastaus kulkee takaisin ylös → asiakkaalle JSONina

✅ Tämä on hyvä rakenne, koska jokainen osa tekee yhden selkeän asian.


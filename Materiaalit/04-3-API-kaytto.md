## 🌐 Johdanto API:hin ja kolmannen osapuolen API:n käyttöön

**API** (Application Programming Interface) on rajapinta, jonka kautta sovellukset voivat keskustella keskenään. Verkkosovelluksissa API:t toimivat tyypillisesti HTTP-protokollan päällä: **asiakas lähettää pyynnön, palvelin vastaa datalla**.

Tässä materiaalissa keskitytään erityisesti **kolmannen osapuolen API:iden käyttöön** – eli siihen, miten oma sovelluksesi kutsuu ulkoisia palveluja (sää, kartat, maksut, sosiaalinen media jne.) ja käsittelee niiden palauttamaa dataa.

---

## 🧠 Oma API vs. kolmannen osapuolen API

| Näkökulma | Oma API | Kolmannen osapuolen API |
| --------- | ------- | ----------------------- |
| **Kuka sitä kehittää?** | Sinä / oma tiimisi | Ulkoinen toimittaja |
| **Kuka sitä ylläpitää?** | Sinä | Palveluntarjoaja |
| **Mitä sillä tehdään?** | Tarjotaan dataa/palveluita omille asiakkaille | Haetaan dataa/palveluita omiin sovelluksiin |
| **Esimerkkejä** | `/api/todos`, `/api/users` | Sää-API, Stripe, Google Maps, X (Twitter) API |

**Kun käytät kolmannen osapuolen API:a:**

- et hallitse rajapintaa – muutokset tapahtuvat palveluntarjoajan tahdosta
- sovelluksesi riippuu ulkoisesta palvelusta – jos API on pois päältä, toiminnallisuutesi voi katketa
- usein vaaditaan **rekisteröinti ja API-avain** (API key)
- monet palvelut veloittavat käytöstä (rate limits, maksulliset tasot)

---

## 🔑 Kolmannen osapuolen API:n käytön perusvirta

1. **Rekisteröidy palveluun** ja saat API-avaimen (tai OAuth-credentials)
2. **Tutustu dokumentaatioon** – endpointit, parametrit, autentikointi
3. **Lähetä HTTP-pyyntö** oikeaan URL:ään, oikeilla parametreilla ja headerilla
4. **Käsittele vastaus** – parsi JSON/XML, tarkista statuskoodit ja virheet

---

## 🧱 HTTP:lla API:ta kutsutaan

Kolmannen osapuolen API:t käyttävät tyypillisesti **REST**-tyylisiä rajapintoja: sama HTTP, jonka selaimet käyttävät.

### Pyynnön rakenteet

| Metodi | Käyttötarkoitus | Esimerkki |
| ------ | ---------------- | --------- |
| **GET** | Hae dataa | `GET https://api.example.com/weather?city=Helsinki` |
| **POST** | Lähetä dataa (esim. luo uusi) | `POST https://api.example.com/orders` |
| **PUT** | Päivitä koko resurssi | `PUT https://api.example.com/users/123` |
| **PATCH** | Päivitä osa resurssista | `PATCH https://api.example.com/users/123` |
| **DELETE** | Poista resurssi | `DELETE https://api.example.com/users/123` |

Monet kolmannen osapuolen rajapinnat ovat **read-only** – saat vain GET-pyyntöjä. Esim. sää-API antaa säädatan, mutta et voi muuttaa sääpalvelun dataa.

### Tyypilliset headerit

| Header | Tarkoitus |
| ------ | --------- |
| `Authorization` | API-avain tai OAuth-token (esim. `Bearer abc123` tai `ApiKey xyz`) |
| `Content-Type` | Lähetettävän bodyn muoto (esim. `application/json`) |
| `Accept` | Minkä muotoista vastausta toivotaan (esim. `application/json`) |

---

## ⚙️ HttpClient .NET:ssä – suositeltu tapa kutsua API:a

ASP.NET Core -sovelluksissa kolmannen osapuolen API:ta kutsutaan **`HttpClient`**-luokan avulla. Se on tarkoitettu pitkäikäiseen käyttöön – **älä luo uutta `HttpClient`-oliota jokaiselle pyynnölle**, vaan käytä injektoitua instanssia.

### IHttpClientFactory – suositeltu tapa

`IHttpClientFactory` hoitaa yhteyksien elinkaaren ja välttää soketin kulutuksen. Rekisteröi tyypillinen HTTP-asiakas `Program.cs`:ssä:

```csharp
builder.Services.AddHttpClient();
```

Nimetty asiakas (esim. sääpalvelulle):

```csharp
builder.Services.AddHttpClient("WeatherApi", client =>
{
    client.BaseAddress = new Uri("https://api.weatherapi.com/v1/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
```

Käyttö kontrollerissa tai servicessä:

```csharp
public class WeatherService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public WeatherService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> GetWeatherAsync(string city)
    {
        var client = _httpClientFactory.CreateClient("WeatherApi");
        var response = await client.GetAsync($"current.json?q={city}&key=YOUR_API_KEY");

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"API palautti: {response.StatusCode}");

        return await response.Content.ReadAsStringAsync();
    }
}
```

### Miksi IHttpClientFactory?

* **Socket exhaustion** – jos luot uuden `HttpClient`-olion jokaiselle pyynnölle, soketteja ei vapaudu ajoissa ja saat lopulta virheitä.
* **Base URL ja headerit** – voit määrittää ne kerran rekisteröinnissä.
* **Polkujen helpottaminen** – voit injektoida `IHttpClientFactory` ja luoda tarvittavan asiakkaan metodissa.

---

## 🔐 API-avaimet ja autentikointi

Useimmat kolmannen osapuolen API:t vaativat **autentikoinnin**:

### 1. API-avain (API Key)

Avain lähetetään yleensä headerissa tai query-parametrina:

```csharp
// Headerissa
client.DefaultRequestHeaders.Add("X-Api-Key", "your-api-key");

// Tai query-parametrina
// GET https://api.example.com/data?api_key=your-api-key
```

### 2. Bearer-token (OAuth 2.0)

Kun palvelu käyttää OAuth 2.0 -flowta, saat access tokenin, joka lähetetään headerissa:

```csharp
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", accessToken);
```

### Turvallinen käsittely

**Älä koskaan kovakoodaa API-avaimia koodiin.** Käytä:

* `appsettings.json` tai `appsettings.Development.json` (älä commitoi avaimia versiohallintaan)
* **ympäristömuuttujia** (`Environment.GetEnvironmentVariable("WEATHER_API_KEY")`)
* [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) kehitysympäristössä

```csharp
var apiKey = builder.Configuration["WeatherApi:ApiKey"]
    ?? Environment.GetEnvironmentVariable("WEATHER_API_KEY");
```

---

## ⏱️ Rate limiting ja virheenkäsittely

### Rate limiting

Kolmannen osapuolen palvelut rajoittavat usein pyyntömäärää aikayksikössä (esim. 100 pyyntöä/minuutissa). Ylikuormituksesta saat esim. **429 Too Many Requests**.

**Mitä tehdä:**

* noudata dokumentaation rajoituksia
* käytä **polly**-retry/circuit breaker -kirjastoa kohtuulliseen uudelleenyritykseen
* välimuista (cache) tuloksia, kun data ei muutu jatkuvasti

### Virheenkäsittely

API voi palauttaa esim.:

| Statuskoodi | Tarkoitus |
| ----------- | --------- |
| 200 | OK |
| 400 | Virheellinen pyyntö (esim. puuttuva parametri) |
| 401 | Ei oikeuksia (väärä/vanhentunut avain) |
| 404 | Resurssia ei löydy |
| 429 | Liian monta pyyntöä |
| 500 | Palvelimen virhe |

Tarkista aina `response.IsSuccessStatusCode` ennen vastauksen parsintaa:

```csharp
var response = await client.GetAsync(url);

if (!response.IsSuccessStatusCode)
{
    var errorBody = await response.Content.ReadAsStringAsync();
    _logger.LogWarning("API virhe {StatusCode}: {Body}", response.StatusCode, errorBody);
    return null; // tai throw
}

var json = await response.Content.ReadAsStringAsync();
```

---

## 📋 Käytännön suosituksia

1. **Lue dokumentaatio** – endpointit, parametrit, rajoitukset ja virhekoodit.
2. **Käytä tyypitettyjä malleja** – deserialoi JSON `System.Text.Json` tai Newtonsoft.Json avulla olioihin.
3. **Erillinen service-kerros** – älä tee API-kutsuja suoraan kontrollerista; käytä esim. `IWeatherService` ja injektoi se.
4. **Timeout** – aseta `HttpClient.Timeout` tai `CancellationToken`, jotta sovellus ei jumita.
5. **Logging** – kirjaa epäonnistuneet kutsut ja tärkeät vastaukset, älä kuitenkaan sensitiivistä dataa.

---

## 🔄 Esimerkki: Yksinkertainen kolmannen osapuolen API-integraatio

Tässä lyhyt esimerkki rakenteesta:

```
1. Rekisteröi HttpClient (Program.cs)
2. Luo Service, joka kutsuu API:a
3. Luo DTO/Malli vastaukselle
4. Controller kutsuu Serviceä
```

### DTO vastaukselle

```csharp
public record WeatherResponse(
    Location Location,
    Current Current
);

public record Location(string Name, string Region);
public record Current(double TempC, string Condition);
```

### Service

```csharp
public interface IWeatherService
{
    Task<WeatherResponse?> GetCurrentAsync(string city);
}

public class WeatherService : IWeatherService
{
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration _config;

    public WeatherService(IHttpClientFactory http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<WeatherResponse?> GetCurrentAsync(string city)
    {
        var client = _http.CreateClient("WeatherApi");
        var apiKey = _config["WeatherApi:ApiKey"];
        var url = $"current.json?q={Uri.EscapeDataString(city)}&key={apiKey}";

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<WeatherResponse>(json);
    }
}
```

### Program.cs

```csharp
builder.Services.AddHttpClient("WeatherApi", client =>
{
    client.BaseAddress = new Uri("https://api.weatherapi.com/v1/");
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddScoped<IWeatherService, WeatherService>();
```

---

## 🧠 Yhteenveto

**Kolmannen osapuolen API:n käyttö** tarkoittaa, että sovelluksesi hakee dataa tai palveluita ulkoisesta lähteestä. Tärkeimmät asiat:

✅ Käytä **IHttpClientFactory** ja **HttpClient** – älä luo uutta HttpClientia per pyyntö  
✅ Säilytä **API-avaimet turvallisesti** (config, env, User Secrets)  
✅ Tarkista **statuskoodit** ja käsittele virheet (401, 429, 500)  
✅ Sijoita API-kutsulogiikka **erilliseen service-kerrokseen**  
✅ Noudata **rate limitejä** ja harkitse välimuistia  
✅ Lue **API:n dokumentaatio** – endpointit ja rajoitukset vaihtelevat palveluittain

Näiden perusteiden avulla voit turvallisesti ja ylläpidettävästi integroida kolmannen osapuolen palveluja omaan sovellukseesi.

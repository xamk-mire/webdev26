## 🔌 Johdanto reaaliaikaisiin yhteyksiin (WebSocket, Socket.IO)

**Reaaliaikaiset yhteydet** tarkoittavat kaksisuuntaista viestintää asiakkaan ja palvelimen välillä – palvelin voi lähettää dataa asiakkaalle **ilman**, että asiakas tekee pyyntöä. Tämä eroaa perinteisestä HTTP-mallista, jossa asiakas pyytää ja palvelin vastaa.

Tässä materiaalissa käydään läpi **WebSocket** ja **Socket.IO** – kaksi yleistä tapaa toteuttaa reaaliaikaisia sovelluksia.

---

## 🧠 Miksi reaaliaikaa tarvitaan?

Perinteinen **HTTP** toimii request–response -mallissa: asiakas lähettää pyynnön, palvelin vastaa kerran. Jos haluat uutta dataa, sinun täytyy tehdä uusi pyyntö (esim. polling).

| Skenaario             | HTTP (polling)                                                 | Reaaliaika (WebSocket)                              |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Chatti-sovellus       | Asiakas kysyy uusia viestejä säännöllisesti (esim. 2 s välein) | Palvelin lähettää viestin heti, kun joku kirjoittaa |
| Live-päivitykset      | Asiakas hakee uudelleen koko sivun tai API:lla                 | Palvelin pushaa vain muuttuneen datan               |
| Pelit, yhteiseditorit | Viive, monimutkainen synkronointi                              | Matala viive, kaksisuuntainen viestintä             |

**Reaaliaika sopii erityisesti kun:**

- palvelimen pitää **puskea** dataa asiakkaalle (ilman uusia pyyntöjä)
- viestien **ajoitus** on tärkeä (chatti, pelit, huutokaupat)
- tarvitaan **kaksisuuntaista** kommunikointia jatkuvasti

---

## 🌐 HTTP vs. WebSocket

### HTTP (request–response)

```
Asiakas  ──GET /api/messages──►  Palvelin
Asiakas  ◄──200 OK + JSON─────  Palvelin
         (yhteys suljetaan)

Asiakas  ──GET /api/messages──►  Palvelin  (uusi pyyntö)
Asiakas  ◄──200 OK + JSON─────  Palvelin
```

Jokainen pyyntö = uusi yhteys (tai yhteys uudelleenkäytettävä, mutta silti asiakas aloittaa).

### WebSocket (pysyvä, kaksisuuntainen yhteys)

```
Asiakas  ──HTTP Upgrade (WebSocket)──►  Palvelin
Asiakas  ◄──101 Switching Protocols──  Palvelin
         (yhteys pysyy auki)

Asiakas  ◄──── viesti ───────────────  Palvelin  (palvelin voi lähettää milloin tahansa)
Asiakas  ───── viesti ─────────────►  Palvelin
Asiakas  ◄──── viesti ───────────────  Palvelin
```

Yhteys pysyy auki, ja molemmat osapuolet voivat lähettää viestejä milloin tahansa.

---

## ⚡ WebSocket – standardoitu protokolla

[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) on **W3C- ja IETF-standardin** määrittelemä protokolla. Se tarjoaa täysin kaksisuuntaisen kanavan yhden TCP-yhteyden päälle.

### Miten yhteys muodostetaan?

1. **Handshake** – asiakas lähettää tavallisen HTTP-pyynnön, jossa on header `Upgrade: websocket`.
2. Palvelin vastaa `101 Switching Protocols` ja vaihtaa yhteyden WebSocket-protokollalle.
3. Sen jälkeen molemmat voivat lähettää **frameja** (viestejä) – tekstinä tai binäärinä.

### WebSocket selaimessa (TypeScript)

```typescript
const socket = new WebSocket('wss://example.com/ws');

interface HelloMessage {
  type: 'hello';
  message: string;
}

socket.onopen = () => {
  console.log('Yhteys avattu');
  const msg: HelloMessage = { type: 'hello', message: 'Terve!' };
  socket.send(JSON.stringify(msg));
};

socket.onmessage = (event: MessageEvent<string>) => {
  console.log('Vastaanotettu:', event.data);
};

socket.onclose = () => console.log('Yhteys suljettu');
socket.onerror = (err: Event) => console.error('Virhe:', err);
```

### WebSocket palvelimella (Node.js / ws-kirjasto, TypeScript)

```typescript
import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: Buffer | string) => {
    console.log('Asiakkaalta:', data.toString());
    ws.send('Palvelin vastasi: ' + data);
  });
});
```

**WebSocketin vahvuudet:**

- standardoitu, laaja tuki selaimissa ja palvelimilla
- matala overhead verrattuna HTTP-pollingiin
- tukee teksti- ja binääridataa

**Haasteet:**

- palvelimen täytyy itse ratkaista huoneet, tilat, uudelleenyrittäminen
- ei sisäänrakennettua automaattista reconnectionia

---

## 🎯 Socket.IO – WebSocket + lisäominaisuudet

[Socket.IO](https://socket.io/) ei ole pelkkä WebSocket. Se on **kirjasto**, joka käyttää WebSocketia oletuksena mutta tarjoaa ylimääräisiä ominaisuuksia:

- **Fallback** – jos WebSocket ei toimi (esim. vanha proxy), voi käyttää HTTP-long pollingia
- **Automaattinen uudelleenkytkentä** – yhteys palautetaan automaattisesti katkettuaan
- **Huoneet (rooms)** – ryhmitellään yhteyksiä (esim. chatti per kanava)
- **Nimiavaruudet (namespaces)** – looginen jakaminen eri osioihin
- **Tapahtumapohjainen API** – viestit nimetään (esim. `chat message`, `user joined`)

### Socket.IO: asiakas (TypeScript)

```typescript
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  text: string;
  sender?: string;
}

const socket: Socket = io('https://example.com');

socket.on('connect', () => {
  console.log('Yhteys avattu, id:', socket.id);
});

const msg: ChatMessage = { text: 'Hei kaikki!' };
socket.emit('chat message', msg);

socket.on('chat message', (msg: ChatMessage) => {
  console.log('Uusi viesti:', msg);
});

socket.on('disconnect', (reason: string) => {
  console.log('Yhteys katkesi:', reason);
});
```

### Socket.IO: palvelin (Node.js / TypeScript)

```typescript
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Uusi asiakas:', socket.id);

  socket.on('chat message', (msg: { text: string }) => {
    io.emit('chat message', msg); // Lähetä kaikille
  });

  socket.on('disconnect', () => {
    console.log('Asiakas poistui:', socket.id);
  });
});

httpServer.listen(3000);
```

### Huoneet (rooms)

```typescript
// Asiakas liittyy huoneeseen
socket.emit('join room', 'salasana-123');

// Palvelimella
socket.on('join room', (roomId: string) => {
  socket.join(roomId);
});

// Lähetä vain huoneen jäsenille
io.to('salasana-123').emit('chat message', msg);
```

---

## 🔄 WebSocket vs. Socket.IO – vertailu

| Ominaisuus                  | WebSocket              | Socket.IO               |
| --------------------------- | ---------------------- | ----------------------- |
| **Protokolla**              | Standardi (W3C/IETF)   | WebSocket + oma kerros  |
| **Fallback**                | Ei                     | Kyllä (long polling)    |
| **Automaattinen reconnect** | Ei                     | Kyllä                   |
| **Huoneet / nimiavaruudet** | Ei (toteutettava itse) | Kyllä                   |
| **Tapahtumapohjainen API**  | Ei (vain raaka data)   | Kyllä                   |
| **Ekosysteemi**             | Yleinen                | Erityisesti Node.js     |
| **Kevyys**                  | Kevyt                  | Hiukan enemmän overhead |

**Valitse WebSocket**, kun haluat vain standardin ja kevyen ratkaisun.

**Valitse Socket.IO**, kun tarvitset huoneet, automaattisen reconnectin ja selkeän tapahtuma-API:n (erityisesti Node.js-stackilla).

---

## 🔷 SignalR – .NET-ekosysteemin ratkaisu

ASP.NET Core tarjoaa **SignalR**-kehikön reaaliaikaiseen viestintään. Se on Microsoftin vastine WebSocket/Socket.IO-tyylisille ratkaisuille.

[SignalR dokumentaatio](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction)

### SignalR vs. WebSocket / Socket.IO

| Ominaisuus                  | SignalR                      | WebSocket | Socket.IO               |
| --------------------------- | ---------------------------- | --------- | ----------------------- |
| **Alusta**                  | .NET / ASP.NET Core          | Kaikki    | Node.js (palvelin)      |
| **Protokolla**              | WebSocket, SSE, long polling | WebSocket | WebSocket, long polling |
| **Automaattinen reconnect** | Kyllä                        | Ei        | Kyllä                   |
| **Hub-malli**               | Kyllä (metodikutsu)          | Ei        | Ei (emit/on)            |
| **Ryhmät**                  | Kyllä                        | Ei        | Kyllä (rooms)           |

SignalR on luonteva valinta, jos backend on **ASP.NET Core**. Se yhdistää asiakkaan ja palvelimen **Hub**-abstraktion kautta – palvelin kutsuu metodeja asiakkaalla ja päin vastoin.

---

## 🛠️ Esimerkki: React/TypeScript + ASP.NET Core SignalR

Alla yksinkertainen esimerkki reaaliaikaisesta chatti-tyylisestä viestinnästä React/TypeScript -frontendin ja .NET-backendin välillä SignalR:n avulla.

### 1. Backend (.NET) – Hub ja Program.cs

**Asenna SignalR-paketti** (sisältyy ASP.NET Core -sovellukseen oletuksena):

```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

**Hub-luokka** – `Hubs/ChatHub.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;

namespace RealtimeApp.Hubs;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

**Program.cs** – rekisteröi SignalR ja määritä Hub-reitti:

```csharp
builder.Services.AddSignalR();

// ...

app.MapHub<ChatHub>("/hubs/chat");
app.MapControllers();
```

### 2. Frontend (React + TypeScript) – paketit

```bash
npm install @microsoft/signalr
```

### 3. SignalR-hook (React)

**hooks/useSignalR.ts**:

```typescript
import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = 'https://localhost:7000/hubs/chat';

export interface ChatMessage {
  user: string;
  message: string;
}

export function useSignalR() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (user: string, message: string) => {
      setMessages((prev) => [...prev, { user, message }]);
    });

    conn
      .start()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => console.error('SignalR-yhteys epäonnistui:', err));

    setConnection(conn);

    return () => {
      conn.stop();
    };
  }, []);

  const sendMessage = useCallback(
    (user: string, message: string) => {
      connection?.invoke('SendMessage', user, message);
    },
    [connection],
  );

  return { messages, sendMessage, isConnected };
}
```

### 4. React-komponentti

**components/Chat.tsx**:

```tsx
import { useState } from 'react';
import { useSignalR } from '../hooks/useSignalR';

export function Chat() {
  const [user, setUser] = useState('');
  const [input, setInput] = useState('');
  const { messages, sendMessage, isConnected } = useSignalR();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() && input.trim()) {
      sendMessage(user, input);
      setInput('');
    }
  };

  return (
    <div>
      <p>Tila: {isConnected ? '🟢 Yhdistetty' : '🔴 Ei yhteyttä'}</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Käyttäjänimi"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          placeholder="Viesti"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Lähetä</button>
      </form>

      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <strong>{m.user}:</strong> {m.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. CORS

Varmista, että backend sallii frontendin originin (esim. `http://localhost:3000`):

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();  // SignalR vaatii tämän
    });
});

// ...

app.UseCors();
app.MapHub<ChatHub>("/hubs/chat");
```

### Miten esimerkki toimii

1. **React** avaa SignalR-yhteyden `/hubs/chat`-osoitteeseen.
2. Asiakas kuuntelee `ReceiveMessage`-tapahtumaa.
3. Käyttäjä lähettää viestin → `sendMessage` kutsuu `connection.invoke('SendMessage', ...)`.
4. **Backend**-Hub vastaanottaa `SendMessage`-kutsun ja lähettää kaikille asiakkaille `ReceiveMessage`.
5. Kaikki yhteydessä olevat asiakkaat saavat viestin reaaliajassa.

---

## 🔌 Esimerkki: React/TypeScript + ASP.NET Core (puhdas WebSocket)

Alla esimerkki **puhdasta WebSocket**-yhteydestä React/TypeScript-frontendin ja ASP.NET Core -backendin välillä – ilman SignalR- tai Socket.IO-kirjastoja. Sovellus on kevyempi, mutta reconnect- ja huonelogiikka pitää toteuttaa itse.

### 1. Backend (.NET) – WebSocket-endpoint

ASP.NET Core tarjoaa WebSocket-tuen sisäänrakennettuna. Ei tarvita ylimääräisiä paketteja.

**WebSocket-middleware** – `WebSocketManager.cs` (tallentaa yhteydet ja lähettää kaikille):

```csharp
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace RealtimeApp;

public static class WebSocketManager
{
    private static readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

    public static void Add(string id, WebSocket socket) => _sockets[id] = socket;

    public static void Remove(string id) => _sockets.TryRemove(id, out _);

    public static async Task BroadcastAsync(string message, CancellationToken ct = default)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        var segment = new ArraySegment<byte>(bytes);

        foreach (var (id, socket) in _sockets.ToArray())
        {
            if (socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(segment, WebSocketMessageType.Text, true, ct);
                }
                catch { /* asiakas voi olla irronnut */ }
            }
        }
    }
}
```

**Program.cs** – WebSocket-polkujen käsittely:

```csharp
app.UseWebSockets();

app.Map("/ws", async (HttpContext context) =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    var webSocket = await context.WebSockets.AcceptWebSocketAsync();
    var connectionId = Guid.NewGuid().ToString();
    WebSocketManager.Add(connectionId, webSocket);

    var buffer = new byte[1024 * 4];

    try
    {
        while (webSocket.State == WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.MessageType == WebSocketMessageType.Text && result.EndOfMessage)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                await WebSocketManager.BroadcastAsync(message);
            }
        }
    }
    finally
    {
        WebSocketManager.Remove(connectionId);
        await webSocket.CloseAsync(
            WebSocketCloseStatus.NormalClosure, "Suljetaan", CancellationToken.None);
    }
});
```

### 2. Frontend (React + TypeScript) – ei lisäpaketteja

Selaimen natiivi **WebSocket API** riittää. Ei tarvita `@microsoft/signalr` eikä muita kirjastoja.

**hooks/useWebSocket.ts**:

```typescript
import { useEffect, useState, useCallback, useRef } from 'react';

const WS_URL = 'wss://localhost:7000/ws';

export interface ChatMessage {
  user: string;
  message: string;
}

export function useWebSocket() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as ChatMessage;
          setMessages((prev) => [...prev, msg]);
        } catch {
          // Ei-JSON-viesti, ohitetaan
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Yksinkertainen reconnect 3 sekunnin kuluttua
        reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };

      socketRef.current = socket;
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((user: string, message: string) => {
    const msg: ChatMessage = { user, message };
    socketRef.current?.readyState === WebSocket.OPEN &&
      socketRef.current.send(JSON.stringify(msg));
  }, []);

  return { messages, sendMessage, isConnected };
}
```

**Komponentti** – sama käyttöliittymä kuin SignalR-esimerkissä:

```tsx
import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export function Chat() {
  const [user, setUser] = useState('');
  const [input, setInput] = useState('');
  const { messages, sendMessage, isConnected } = useWebSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() && input.trim()) {
      sendMessage(user, input);
      setInput('');
    }
  };

  return (
    <div>
      <p>Tila: {isConnected ? '🟢 Yhdistetty' : '🔴 Ei yhteyttä'}</p>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Käyttäjänimi"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          placeholder="Viesti"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Lähetä</button>
      </form>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <strong>{m.user}:</strong> {m.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Huom:** Kehitysympäristössä käytä `ws://localhost:5000/ws` tai `wss://localhost:7000/ws` backendin portin mukaan. HTTPS vaatii `wss://`.

### 3. CORS (WebSocket)

WebSocket-yhteys tehdään samalle originille tai CORS-sääntöjen sallimalle. Jos frontend on eri portissa (esim. `http://localhost:3000`), varmista että backend sallii yhteydet:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ...

app.UseCors();
app.UseWebSockets();
```

### WebSocket vs. SignalR tässä esimerkissä

| Ominaisuus            | Puhdas WebSocket             | SignalR                        |
| --------------------- | ---------------------------- | ------------------------------ |
| **Paketit**           | Ei lisäpaketteja backendillä | `Microsoft.AspNetCore.SignalR` |
| **Frontend**          | Natiivi WebSocket API        | `@microsoft/signalr`           |
| **Reconnect**         | Toteutettava itse            | Sisäänrakennettu               |
| **Huoneet/ryhmät**    | Toteutettava itse            | Sisäänrakennettu               |
| **Viestiprotiokolla** | Vapaasti (esim. JSON)        | Rakenne (metodit, parametrit)  |
| **Kevyys**            | Kevyin                       | Hieman enemmän overhead        |

---

## 📋 Milloin käyttää mitäkin?

| Tilanne                                              | Suositus                         |
| ---------------------------------------------------- | -------------------------------- |
| **Backend .NET**                                     | SignalR                          |
| **Backend Node.js**, tarvitaan huoneet ja reconnect  | Socket.IO                        |
| **Backend Node.js**, kevyt, pelkkä WebSocket riittää | `ws`-kirjasto (puhdas WebSocket) |
| **Fullstack Node.js** (React/Vue + Express)          | Socket.IO on usein helpoin       |
| **Selain ↔ kolmannen osapuolen palvelu**             | WebSocket (jos palvelu tukee)    |

---

## 🧠 Yhteenveto

**Reaaliaikaiset yhteydet** mahdollistavat kaksisuuntaisen viestinnän ilman jatkuvaa uudelleenpyyntöä. Tärkeimmät työkalut:

✅ **WebSocket** – standardoitu protokolla, kevyt ja yleiskäyttöinen  
✅ **Socket.IO** – WebSocket + huoneet, reconnect, tapahtumat (Node.js)  
✅ **SignalR** – .NET-pohjainen reaaliaikaratkaisu ASP.NET Core -sovelluksissa

Valitse ratkaisu stackisi (Node vs. .NET) ja tarpeisiisi (huoneet, fallback, reconnect) mukaan.

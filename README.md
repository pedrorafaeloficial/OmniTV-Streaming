# OmniTV-Streaming

## Diagramas de Arquitetura

### Diagrama 1 — Visão de Componentes
```mermaid
flowchart LR
    subgraph TV Apps
        direction LR
        Tizen[Tizen\n(HTML5/TS\n+ Tizen APIs)]
        webOS[webOS\n(HTML5/TS\n+ webOS bridge)]
        Roku[Roku\n(SceneGraph\n+ BrightScript/JS)]
        UI[UI Home/Busca/Detalhe]
        Player[Player\n(HLS nativo\n/hls.js)]
        Parental[Parental\nControl]
        Fav[Favoritos/Histórico\n(local)]
        Diag[Diagnóstico]
        Tele[Telemetria\n(opt-in)]
        Tizen --> UI --> Player
        webOS --> UI
        Roku --> UI
        UI --> Parental
        UI --> Fav
        UI --> Diag
        UI --> Tele
    end

    Omni[OmniTV –\nFrontend TV]
    Omni -. inclui .-> TV Apps

    subgraph Backend do Cliente
        direction TB
        Entitlement[License/Entitlement\nServer (Node/TS)]
        Auth[Auth/JWT]
        Entitle[Entitlement]
        Sessions[Device Sessions\n(limite)]
        Webhooks[Webhooks\nBilling]
        AdminAPI[Admin API]
        Logs[Logs]
        DB[(PostgreSQL\nusers/subs/devices/\nentitlements/sessions)]
        Cache[(Redis\ncache + locks)]
        Entitlement --> Auth
        Entitlement --> Entitle
        Entitlement --> Sessions
        Entitlement --> Webhooks
        Entitlement --> AdminAPI
        Entitlement --> Logs
        Entitlement --> DB
        Entitlement --> Cache
    end

    subgraph Provedores Externos
        direction TB
        Xtream["Xtream Backend\n(player_api/\npanel_api)\nlive/vod/series/epg"]
        EPG[EPG Provider\n(XMLTV/endpoint)]
        Payment[Payment Provider\n(Stripe/MercadoPago)\nWebhooks]
    end

    subgraph Outros
        AdminPortal[Admin Portal\n(React)]
    end

    Omni -->|listagens\n+ playback| Xtream
    Omni -->|session/\nentitlement| Entitlement
    Omni -->|EPG\nconsulta| EPG
    Omni -->|diagnóstico| Logs
    Entitlement -->|webhooks| Payment
    Payment -->|notificações| Entitlement
    AdminPortal -->|admin| Entitlement
    note right of Omni
        Notas: Apps acessam\nEPG direto ou via\nadapter interno
    end
```

### Diagrama 2 — Visão de Implantação
```mermaid
graph LR
    subgraph Usuario
        User[Usuário\n(Sala de Estar)]
        TV[Smart TV\n(Tizen/webOS/Roku)]
        User -->|remoto| TV
    end

    TV -->|HTTPS/TLS\n+ HLS| Internet[Internet/CDN]

    subgraph "Infra do Cliente (Cloud)"
        direction TB
        K8s[K8s/VM\nLicense Server\n(Node/TS)]
        PG[(PostgreSQL\nRDS/CloudSQL)]
        Redis[(Redis\ncache/locks)]
        Storage[Storage estático\n(assets/loja)]
        Monitor[Monitoria/Logs\n(Grafana/ELK)]
        K8s -->|SQL/TLS| PG
        K8s -->|TLS| Redis
        K8s -->|TLS| Monitor
        Storage -. deploy .-> K8s
    end

    subgraph "Provedores Externos"
        direction TB
        Xtream[Xtream\n(origem)]
        EPG[EPG Provider]
        Pay[Payment Provider\n(Stripe/MercadoPago)]
    end

    Internet -->|HTTPS/TLS| K8s
    K8s -->|HTTPS/TLS| Xtream
    K8s -->|HTTPS/TLS| EPG
    Pay -->|Webhooks\nHTTPS/TLS| K8s
    TV -->|HLS| Xtream
    TV -->|HTTPS/TLS| EPG
    note right of Internet
        Notas: Portas\nexternas mínimas\nnecessárias
    end
```

### Diagrama 3 — Fluxos de Dados
```mermaid
flowchart LR
    subgraph TV Apps
        App[OmniTV App\n(TV)]
    end

    subgraph Backend do Cliente
        License[License Server]
    end

    subgraph Provedores Externos
        Xtream[Xtream\n(player_api)]
        EPG[EPG Provider]
        Payment[Payment Provider]
    end

    User[Usuário]

    User -->|Host/User/Pass| App
    App -->|cifra local\n(WebCrypto/roRegistry)| App
    App -->|GET /entitlement/{deviceId}\n(JWT curto)| License
    License -->|status active/trial/\npast_due/expired/blocked| App
    App -->|HLS URLs| Xtream
    App -->|POST /session\n(lock/liberação)| License
    App -->|EPG pull| EPG
    Payment -->|Webhook| License
    License -->|atualiza\nsubs/entitlements| License
    App -->|diagnóstico anônimo| License
    App -. local .-|Parental PIN\nhash+salt\nregex invisível| App
    App -. opt-in .->|Telemetria mínima\nsem PIN/credenciais| License
    note right of App
        Notas: Sem M3U,\nPIN não sai do device
    end
```

### Diagrama 4 — Sequência de Login e Playback
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as OmniTV App (TV)
    participant License as License Server
    participant Xtream
    participant Payment as Payment Provider

    User->>App: Abrir app / tela Login
    App->>Xtream: Validar Host/User/Pass (player_api)
    Xtream-->>App: OK / erro timeout
    App->>App: Cifrar credenciais localmente
    App->>License: GET /entitlement/{deviceId}
    License-->>App: status active|trial|past_due|expired|blocked
    alt status active|trial
        App->>User: Entrar na Home
    else status past_due
        App->>User: Aviso + grace period
    else status expired|blocked
        App->>User: Bloqueio + CTA pagar
    end
    User->>App: Escolher Canal/Filme
    App->>License: POST /session (se limite)
    License-->>App: session OK / excedido
    App->>Xtream: Solicitar stream HLS
    Xtream-->>App: URL stream / erro 403/404/timeout
    alt stream OK
        App->>User: Reproduzir conteúdo
    else erro
        App->>User: Mensagem amigável + retry
        App->>License: Log diagnóstico mínimo
    end
    Payment-->>License: Webhook invoice.paid/failed
    License->>License: Atualiza entitlement
    App->>License: Nova checagem periódica
    License-->>App: Status atualizado
    App->>User: Continuar ou logout
    note right of App
        Notas: JWT curtos,\nrevogação via blacklist
    end
```

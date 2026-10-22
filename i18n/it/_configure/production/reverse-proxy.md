---
layout: default
title: Reverse proxy
parent: In produzione
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse proxy
{: .no_toc }

Pubblica AnsibleForms dietro Nginx, Traefik o Apache, alla radice o sotto un sottopercorso
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quando usarne uno

AnsibleForms serve l'interfaccia, l'API REST e Swagger su una sola porta; un reverse proxy davanti ti permette di:

* servirlo sulla porta 443 con un certificato gestito dai tuoi strumenti esistenti (ACME, una CA aziendale)
* condividere un nome host con altre applicazioni, pubblicando AnsibleForms sotto un sottopercorso
* tenere la porta dell'applicazione e il database fuori dalla rete pubblica

Un proxy è facoltativo: l'applicazione può servire HTTPS da sola, vedi [HTTPS](../security/https.html).

---

## Le impostazioni che contano

Solo poche impostazioni influiscono sul comportamento di AnsibleForms dietro un proxy:

| Impostazione | Dietro un proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | La porta verso cui inoltra il proxy, `8000` per impostazione predefinita. Il progetto docker-compose la imposta a `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` quando il proxy termina il TLS e raggiunge l'applicazione su una rete privata, `1` per cifrare anche quel tratto. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | Il sottopercorso, per esempio `/ansibleforms`. Lascialo a `/` quando l'applicazione ha un nome host proprio. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Quali proxy possono riportare l'indirizzo del client in `X-Forwarded-For`, di solito `1`. Vedi [Indirizzi dei client](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | La richiesta JSON più grande che l'applicazione accetta, 50 MB per impostazione predefinita. Il proxy deve consentire almeno questo. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Il file più grande che accetta un campo di caricamento di un modulo, 10 GB per impostazione predefinita. Anche il proxy deve consentirlo, altrimenti i caricamenti falliscono lì. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | L'insieme più grande di intestazioni di richiesta che l'applicazione accetta, 16 KB per impostazione predefinita, dalla 7.1.0. Vedi [Dimensione delle intestazioni della richiesta](#request-header-size). |
| **URL radice pubblica** | In **Sistema > Generale**, nella scheda **Server**: l'indirizzo che raggiungono gli utenti, sottopercorso compreso. Costruisce i collegamenti nelle mail di notifica, nei messaggi dei canali e nelle richieste di approvazione. |

Per Entra ID o OIDC, registra l'indirizzo pubblico come URI di reindirizzamento, con il sottopercorso di `BASE_URL` se impostato.

---

## Servire sotto un sottopercorso

`BASE_URL` monta l'intera applicazione sotto il sottopercorso; il proxy deve inoltrare il percorso **invariato**.
Con `BASE_URL=/ansibleforms`:

* l'interfaccia, `/api/v2/...` e l'interfaccia Swagger sono tutte servite sotto `/ansibleforms/`
* il `<base href>` dell'interfaccia viene riscritto all'avvio, così le risorse e le chiamate API si risolvono sotto il sottopercorso
* una richiesta per `/` o per `/ansibleforms` (senza slash finale) viene reindirizzata a `/ansibleforms/`

Mantieni il prefisso: niente `StripPrefix` in Traefik, nessun URI su `proxy_pass` in Nginx, perché l'applicazione se lo aspetta.

La pagina **Stato** mostra l'URL di base in vigore.

---

## Timeout, caricamenti e output in tempo reale

La pagina dei job e i contatori dei job vengono a sapere delle modifiche tramite un unico flusso di lunga durata di server-sent events,
[`/api/v2/events`](../api/events.html), tenuto aperto per ogni browser. Il flusso invia intestazioni che disattivano il buffering del proxy
(`X-Accel-Buffering: no`) e una riga di keep-alive ogni 15 secondi, così il solito timeout di lettura di 60 secondi lo tiene aperto;
quando un proxy lo chiude comunque, il browser si riconnette da solo. L'output sotto un modulo, subito dopo un avvio, viene invece
letto ogni due secondi. L'avvio di un job ritorna non appena il job viene creato, così un playbook lungo non tiene
aperta una richiesta.

Le richieste che possono durare a lungo sono:

* **backup e ripristino** dalla pagina **Backup**, che attendono la fine del comando di dump o di ripristino, fino a
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 per impostazione predefinita)
* **caricamenti grandi** tramite un campo file, che trasmettono l'intero file in una sola richiesta
* **messaggi della chat**, quando l'[assistente chat](../chat/) è abilitato, che attendono la risposta del provider del modello

I proxy spesso vanno in timeout dopo 60 secondi e limitano il corpo delle richieste (Nginx accetta 1 MB per impostazione predefinita). Aumenta entrambi per
le route di AnsibleForms, come negli esempi qui sotto.

---

## WebSocket dei runner

Dalla 7.3.0 un [Runner in uscita](../rte/modes.html#outbound) contatta l'applicazione e tiene aperto un WebSocket su
`<BASE_URL>/api/v2/rte/socket`. Il proxy deve far passare l'upgrade, altrimenti il Runner non si connette mai e continua a riprovare:

| Proxy | Di cosa ha bisogno il WebSocket |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` e le intestazioni `Upgrade` e `Connection`, che Nginx non inoltra per impostazione predefinita |
| Traefik | Niente: i WebSocket passano così come sono |
| Apache | `upgrade=websocket` sulla riga `ProxyPass` (2.4.47 e successive), o `mod_proxy_wstunnel` prima di quella versione |

Entrambi i lati inviano un ping ogni 20 secondi, così il solito timeout di lettura di 60 secondi tiene aperto un socket inattivo.

---

## Dimensione delle intestazioni della richiesta

Ogni richiesta porta il token di accesso nella sua intestazione `Authorization`, accanto ai cookie e alle intestazioni aggiunte dal proxy.
Sia il proxy sia l'applicazione limitano la dimensione delle intestazioni della richiesta, e rifiutano una richiesta oltre il limite prima che
AnsibleForms la veda, quindi nulla arriva al log del server. I valori predefiniti:

| Componente | Limite | Predefinito | Rifiutata con |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), tutte le intestazioni insieme | 16384 byte | 431 |
| Nginx | `large_client_header_buffers`, per campo di intestazione | `4 8k`: 8 KB per campo | 400 |
| Traefik | `http.maxHeaderBytes` dell'entry point, tutte le intestazioni insieme | 1 MB | 431 |
| HAProxy | `tune.bufsize` nella sezione `global`, l'intero blocco di intestazioni, meno la riserva `tune.maxrewrite` (1024 byte) | 16384 byte: 15360 byte di intestazioni | 400 |
| Apache | `LimitRequestFieldSize`, per campo di intestazione | 8190 byte | 400 |

Fino alla 7.0.3 il token di accesso conteneva ogni gruppo di un utente single sign-on, e poteva superare questi limiti, vedi
[Moduli e job vuoti dopo un single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Dalla 7.1.0 il token resta piccolo, e i valori predefiniti bastano. Quando qualcos'altro rende grandi le intestazioni, come
i cookie di altre applicazioni sullo stesso dominio o un gateway single sign-on davanti, aumenta i limiti insieme:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, o prima della 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; entrambe vengono
  lette all'avvio, quindi riavvia l'applicazione dopo una modifica
* Nginx: `large_client_header_buffers 4 32k;` nel blocco `http` o `server`
* HAProxy: `tune.bufsize 65536` nella sezione `global`; ogni flusso riceve un buffer di quella dimensione, quindi HAProxy consiglia
  di ridurre il `maxconn` globale dello stesso fattore, e HTTP/2 richiede almeno il valore predefinito 16384
* Apache: `LimitRequestFieldSize 32768` nella configurazione del server o nel virtual host

---

## Indirizzi dei client

Dietro un proxy ogni connessione arriva dal proxy. Senza [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
la traccia di audit registra l'indirizzo del proxy per ogni azione, e i
[limiti di accesso](../security/hardening.html#sign-in-limits-and-passwords) per indirizzo contano tutti i client come un solo indirizzo.
`TRUST_PROXY` dice a quali proxy l'applicazione può credere quando riportano il client in `X-Forwarded-For`:

| Valore | Indirizzo del client |
|-------|----------------|
| `0` (predefinito) | L'indirizzo della connessione. `X-Forwarded-For` viene ignorata; vuoto, `false`, `off` e `no` significano lo stesso. |
| Un numero, es. `1` | Si fida di quel numero di proxy davanti all'applicazione: `1` per un solo reverse proxy, `2` per un load balancer davanti a un ingress. |
| Una lista, es. `10.0.0.5,172.16.0.0/12` | Si fida dei proxy a questi indirizzi e intervalli CIDR. Sono accettati anche i preset `loopback`, `linklocal` e `uniquelocal`. |
| `true` | Si fida di ogni salto: si usa l'indirizzo più a sinistra di `X-Forwarded-For`. |

L'applicazione percorre `X-Forwarded-For` da destra, salta i proxy fidati, e prende il primo indirizzo che non è
uno di loro. Usa il numero esatto di proxy, o i loro indirizzi:

* `X-Forwarded-For` è una normale intestazione di richiesta che qualsiasi client può inviare. Un numero troppo alto, o `true`, permette a un
  client di scegliere l'indirizzo che registra la traccia di audit. `true` è sicuro solo quando l'applicazione è raggiungibile soltanto
  tramite il proxy, e il server registra un avviso `[SECURITY]` all'avvio quando è impostato.
* Il proxy deve aggiungere l'indirizzo da cui ha ricevuto la connessione, come fanno gli esempi qui sotto
  (`$proxy_add_x_forwarded_for` in Nginx; Traefik e Apache `mod_proxy` lo aggiungono per impostazione predefinita).
* Un valore non valido viene rifiutato nella pagina delle impostazioni; impostato nell'ambiente, viene registrato come errore all'avvio e
  non ci si fida di nessun proxy. Una modifica salvata nella pagina delle impostazioni si applica senza riavvio.

---

## Esempi

Ogni esempio pubblica AnsibleForms su `https://forms.example.com/ansibleforms/`, con il TLS terminato dal proxy e
l'applicazione in esecuzione con `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` e `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` non indica nessun URI, quindi Nginx inoltra il percorso così come è arrivato, prefisso compreso. Il blocco `map` va nel
contesto `http` (un file sotto `conf.d/` viene incluso lì), e fa passare l'upgrade WebSocket dei Runner:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Senza un sottopercorso, usa `location /` e lascia `BASE_URL` non impostato.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Label sul servizio `app` del progetto docker-compose, con Traefik sulla stessa rete Docker. Il servizio
non pubblica nessuna porta propria, Traefik lo raggiunge sulla rete:

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

Non c'è nessun middleware `StripPrefix`, di proposito. Traefik imposta da solo le intestazioni `X-Forwarded-*` e non limita
la dimensione del corpo, ma controlla i `respondingTimeouts` dell'entry point quando i backup o i caricamenti durano più del suo
timeout di lettura. Senza un sottopercorso, tieni solo la parte `Host(...)` della regola.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Richiede `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, e Apache 2.4.47 o successivo per l'`upgrade=websocket` dei Runner.
Entrambi i lati di `ProxyPass` portano il prefisso:

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Senza un sottopercorso, inoltra `/` a `http://10.0.0.20:8000/` e lascia `BASE_URL` non impostato.

</div>
</div>

Per mantenere cifrato il tratto tra il proxy e l'applicazione, esegui l'applicazione con `HTTPS=1`, punta il proxy a
`https://`, e dai all'applicazione un certificato di cui il proxy si fida, vedi [HTTPS](../security/https.html).

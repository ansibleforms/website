---
layout: default
title: Reverse proxy
parent: Draaien in productie
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse proxy
{: .no_toc }

AnsibleForms publiceren achter Nginx, Traefik of Apache, op de root of onder een subpad
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wanneer je er een gebruikt

AnsibleForms bedient de interface, de REST API en Swagger op één poort; met een reverse proxy ervoor kun je:

* het op poort 443 aanbieden met een certificaat dat door je bestaande tooling wordt beheerd (ACME, een bedrijfs-CA)
* één hostnaam delen met andere applicaties, door AnsibleForms onder een subpad te publiceren
* de applicatiepoort en de database buiten het openbare netwerk houden

Een proxy is optioneel: de applicatie kan zelf HTTPS bedienen, zie [HTTPS](../security/https.html).

---

## De instellingen die ertoe doen

Slechts een paar instellingen beïnvloeden hoe AnsibleForms zich achter een proxy gedraagt:

| Instelling | Achter een proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | De poort waarnaar de proxy doorstuurt, standaard `8000`. Het docker-compose-project zet hem op `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` als de proxy TLS afhandelt en de applicatie via een privénetwerk bereikt, `1` om ook dat traject te versleutelen. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | Het subpad, bijvoorbeeld `/ansibleforms`. Laat het op `/` als de applicatie een eigen hostnaam heeft. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Welke proxy's het clientadres in `X-Forwarded-For` mogen melden, meestal `1`. Zie [Clientadressen](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | Grootste JSON-verzoek dat de applicatie accepteert, standaard 50 MB. De proxy moet minstens dit toestaan. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Grootste bestand dat een uploadveld van een formulier accepteert, standaard 10 GB. De proxy moet het ook toestaan, anders mislukken uploads daar. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | Grootste set verzoekheaders die de applicatie accepteert, standaard 16 KB, vanaf 7.1.0. Zie [Grootte van verzoekheaders](#request-header-size). |
| **Publieke root URL** | Onder **Systeem > Algemeen**, op het tabblad **Server**: het adres dat gebruikers bereiken, subpad inbegrepen. Het bouwt de links in meldingsmails, kanaalberichten en goedkeuringsaanvragen. |

Registreer voor Entra ID of OIDC het openbare adres als omleidings-URI, met het subpad van `BASE_URL` als dat is ingesteld.

---

## Aanbieden onder een subpad

`BASE_URL` koppelt de hele applicatie onder het subpad; de proxy moet het pad **ongewijzigd** doorsturen.
Met `BASE_URL=/ansibleforms`:

* worden de interface, `/api/v2/...` en de Swagger-interface allemaal onder `/ansibleforms/` aangeboden
* wordt de `<base href>` van de interface bij het opstarten herschreven, zodat assets en API-aanroepen onder het subpad worden opgelost
* wordt een verzoek voor `/` of voor `/ansibleforms` (zonder afsluitende slash) doorgestuurd naar `/ansibleforms/`

Behoud het voorvoegsel: geen `StripPrefix` in Traefik, geen URI op `proxy_pass` in Nginx, omdat de applicatie het verwacht.

De pagina **Status** toont de geldende basis-URL.

---

## Time-outs, uploads en live uitvoer

De jobpagina en de jobtellers horen van wijzigingen via één langlevende stroom server-sent events,
[`/api/v2/events`](../api/events.html), die per browser open wordt gehouden. De stroom stuurt headers die proxybuffering uitschakelen
(`X-Accel-Buffering: no`) en elke 15 seconden een keep-alive-regel, zodat de gebruikelijke leestime-out van 60 seconden hem open houdt;
als een proxy hem toch sluit, maakt de browser zelf opnieuw verbinding. De uitvoer onder een formulier, direct na een start, wordt
in plaats daarvan elke twee seconden gelezen. Het starten van een job keert terug zodra de job is aangemaakt, zodat een lang playbook
geen verzoek open houdt.

De verzoeken die lang kunnen duren, zijn:

* **back-up en terugzetten** vanaf de pagina **Back-ups**, die wachten tot de dump- of terugzetopdracht klaar is, tot
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (standaard 3600)
* **grote uploads** via een bestandsveld, die het hele bestand in één verzoek streamen
* **chatberichten**, als de [chat-assistent](../chat/) is ingeschakeld, die wachten tot de modelprovider antwoordt

Proxy's hebben vaak een time-out na 60 seconden en begrenzen de verzoekbody (Nginx accepteert standaard 1 MB). Verhoog beide voor
de AnsibleForms-routes, zoals in de voorbeelden hieronder.

---

## Runner-WebSockets

Vanaf 7.3.0 belt een [uitgaande Runner](../rte/modes.html#outbound) de applicatie en houdt één WebSocket open op
`<BASE_URL>/api/v2/rte/socket`. De proxy moet de upgrade doorgeven, anders maakt de Runner nooit verbinding en blijft hij bellen:

| Proxy | Wat de WebSocket nodig heeft |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` en de headers `Upgrade` en `Connection`, die Nginx standaard niet doorstuurt |
| Traefik | Niets: WebSockets gaan ongewijzigd door |
| Apache | `upgrade=websocket` op de regel `ProxyPass` (2.4.47 en later), of daarvoor `mod_proxy_wstunnel` |

Beide kanten sturen elke 20 seconden een ping, zodat de gebruikelijke leestime-out van 60 seconden een inactieve socket open houdt.

---

## Grootte van verzoekheaders

Elk verzoek draagt het aanmeldtoken in de header `Authorization`, naast cookies en de headers die de proxy toevoegt.
Zowel de proxy als de applicatie begrenzen de grootte van de verzoekheaders, en weigeren een verzoek boven de grens voordat
AnsibleForms het ziet, dus er komt niets in het serverlog. De standaardwaarden:

| Component | Limiet | Standaard | Geweigerd met |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), alle headers samen | 16384 bytes | 431 |
| Nginx | `large_client_header_buffers`, per headerveld | `4 8k`: 8 KB per veld | 400 |
| Traefik | `http.maxHeaderBytes` van het entrypoint, alle headers samen | 1 MB | 431 |
| HAProxy | `tune.bufsize` in de sectie `global`, het hele headerblok, min de reserve `tune.maxrewrite` (1024 bytes) | 16384 bytes: 15360 bytes aan headers | 400 |
| Apache | `LimitRequestFieldSize`, per headerveld | 8190 bytes | 400 |

Tot en met 7.0.3 droeg het aanmeldtoken elke groep van een single sign-on-gebruiker, en kon het deze limieten ontgroeien, zie
[Lege formulieren en jobs na een single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Vanaf 7.1.0 blijft het token klein, en volstaan de standaardwaarden. Als iets anders de headers groot maakt, zoals
cookies van andere applicaties op hetzelfde domein of een single sign-on-gateway ervoor, verhoog de limieten dan samen:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, of vóór 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; beide worden
  bij het starten gelezen, dus herstart de applicatie na een wijziging
* Nginx: `large_client_header_buffers 4 32k;` in het blok `http` of `server`
* HAProxy: `tune.bufsize 65536` in de sectie `global`; elke stream krijgt een buffer van die grootte, dus HAProxy raadt aan
  de globale `maxconn` met dezelfde factor te verlagen, en HTTP/2 heeft minstens de standaard 16384 nodig
* Apache: `LimitRequestFieldSize 32768` in de serverconfiguratie of de virtual host

---

## Clientadressen

Achter een proxy komt elke verbinding van de proxy. Zonder [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY)
legt het audittrail voor elke actie het adres van de proxy vast, en tellen de
[aanmeldlimieten](../security/hardening.html#sign-in-limits-and-passwords) per adres alle clients als één adres.
`TRUST_PROXY` zegt welke proxy's de applicatie mag geloven als ze de client in `X-Forwarded-For` melden:

| Waarde | Clientadres |
|-------|----------------|
| `0` (standaard) | Het adres van de verbinding. `X-Forwarded-For` wordt genegeerd; leeg, `false`, `off` en `no` betekenen hetzelfde. |
| Een getal, bijv. `1` | Vertrouwt zoveel proxy's voor de applicatie: `1` voor één reverse proxy, `2` voor een load balancer voor een ingress. |
| Een lijst, bijv. `10.0.0.5,172.16.0.0/12` | Vertrouwt de proxy's op deze adressen en CIDR-bereiken. De presets `loopback`, `linklocal` en `uniquelocal` worden ook geaccepteerd. |
| `true` | Vertrouwt elke hop: het meest linkse adres van `X-Forwarded-For` wordt gebruikt. |

De applicatie loopt `X-Forwarded-For` van rechts af, slaat de vertrouwde proxy's over, en neemt het eerste adres dat
er geen van is. Gebruik het exacte aantal proxy's, of hun adressen:

* `X-Forwarded-For` is een gewone verzoekheader die elke client kan sturen. Een te hoog getal, of `true`, laat een
  client kiezen welk adres het audittrail vastlegt. `true` is alleen veilig als de applicatie uitsluitend via
  de proxy bereikbaar is, en de server logt bij het starten een waarschuwing `[SECURITY]` als het is ingesteld.
* De proxy moet het adres toevoegen waarvan hij de verbinding ontving, zoals de voorbeelden hieronder doen
  (`$proxy_add_x_forwarded_for` in Nginx; Traefik en Apache `mod_proxy` voegen het standaard toe).
* Een ongeldige waarde wordt op de instellingenpagina geweigerd; ingesteld in de omgeving wordt ze bij het starten als fout gelogd en
  wordt geen enkele proxy vertrouwd. Een wijziging die op de instellingenpagina is opgeslagen, geldt zonder herstart.

---

## Voorbeelden

Elk voorbeeld publiceert AnsibleForms op `https://forms.example.com/ansibleforms/`, met TLS afgehandeld door de proxy en
de applicatie draaiend met `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` en `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` noemt geen URI, dus Nginx stuurt het pad door zoals het binnenkwam, voorvoegsel inbegrepen. Het blok `map` hoort in de
context `http` (een bestand onder `conf.d/` wordt daar ingevoegd), en geeft de WebSocket-upgrade van de Runners door:

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

Gebruik zonder subpad `location /` en laat `BASE_URL` leeg.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Labels op de service `app` van het docker-compose-project, met Traefik op hetzelfde Docker-netwerk. De service
publiceert geen eigen poort, Traefik bereikt hem via het netwerk:

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

Er is bewust geen middleware `StripPrefix`. Traefik stelt de headers `X-Forwarded-*` zelf in en begrenst
de bodygrootte niet, maar controleer de `respondingTimeouts` van het entrypoint als back-ups of uploads langer duren dan de
leestime-out ervan. Houd zonder subpad alleen het deel `Host(...)` van de regel.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Vereist `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, en Apache 2.4.47 of later voor `upgrade=websocket` van de Runners.
Beide kanten van `ProxyPass` dragen het voorvoegsel:

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

Proxy zonder subpad `/` naar `http://10.0.0.20:8000/` en laat `BASE_URL` leeg.

</div>
</div>

Om het traject tussen proxy en applicatie versleuteld te houden, draai je de applicatie met `HTTPS=1`, laat je de proxy naar
`https://` wijzen, en geef je de applicatie een certificaat dat de proxy vertrouwt, zie [HTTPS](../security/https.html).

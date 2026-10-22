---
layout: default
title: Reverse Proxy
parent: Betrieb in Produktion
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse Proxy
{: .no_toc }

AnsibleForms hinter Nginx, Traefik oder Apache veröffentlichen, im Stamm oder unter einem Unterpfad
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wann man einen verwendet

AnsibleForms stellt die Oberfläche, die REST-API und Swagger auf einem Port bereit; ein vorgeschalteter Reverse Proxy ermöglicht Ihnen:

* die Bereitstellung auf Port 443 mit einem Zertifikat, das Ihre vorhandenen Werkzeuge verwalten (ACME, eine Unternehmens-CA)
* die gemeinsame Nutzung eines Hostnamens mit anderen Anwendungen, indem AnsibleForms unter einem Unterpfad veröffentlicht wird
* den Anwendungsport und die Datenbank aus dem öffentlichen Netz herauszuhalten

Ein Proxy ist optional: Die Anwendung kann HTTPS auch selbst bereitstellen, siehe [HTTPS](../security/https.html).

---

## Die wichtigen Einstellungen

Nur wenige Einstellungen beeinflussen, wie sich AnsibleForms hinter einem Proxy verhält:

| Einstellung | Hinter einem Proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | Der Port, an den der Proxy weiterleitet, standardmäßig `8000`. Das docker-compose-Projekt setzt ihn auf `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0`, wenn der Proxy TLS terminiert und die Anwendung über ein privates Netz erreicht, `1`, um auch diesen Abschnitt zu verschlüsseln. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | Der Unterpfad, zum Beispiel `/ansibleforms`. Lassen Sie ihn auf `/`, wenn die Anwendung einen eigenen Hostnamen hat. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Welche Proxys die Client-Adresse in `X-Forwarded-For` melden dürfen, meist `1`. Siehe [Client-Adressen](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | Größte JSON-Anfrage, die die Anwendung annimmt, standardmäßig 50 MB. Der Proxy muss mindestens so viel erlauben. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Größte Datei, die ein Upload-Feld eines Formulars annimmt, standardmäßig 10 GB. Der Proxy muss sie ebenfalls erlauben, sonst schlagen Uploads dort fehl. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | Größte Menge an Anfrage-Headern, die die Anwendung annimmt, standardmäßig 16 KB, ab 7.1.0. Siehe [Größe der Anfrage-Header](#request-header-size). |
| **Öffentliche Root-URL** | Unter **System > Allgemein**, im Tab **Server**: die Adresse, unter der Benutzer die Anwendung erreichen, einschließlich Unterpfad. Daraus werden die Links in Benachrichtigungsmails, Kanalnachrichten und Genehmigungsanfragen erzeugt. |

Registrieren Sie für Entra ID oder OIDC die öffentliche Adresse als Redirect URI, mit dem Unterpfad aus `BASE_URL`, falls gesetzt.

---

## Bereitstellung unter einem Unterpfad

`BASE_URL` hängt die gesamte Anwendung unter dem Unterpfad ein; der Proxy muss den Pfad **unverändert** weiterleiten.
Mit `BASE_URL=/ansibleforms`:

* die Oberfläche, `/api/v2/...` und die Swagger-Oberfläche werden alle unter `/ansibleforms/` bereitgestellt
* das `<base href>` der Oberfläche wird beim Start umgeschrieben, sodass Assets und API-Aufrufe unter dem Unterpfad aufgelöst werden
* eine Anfrage an `/` oder an `/ansibleforms` (ohne abschließenden Schrägstrich) wird auf `/ansibleforms/` umgeleitet

Behalten Sie das Präfix bei: kein `StripPrefix` in Traefik, keine URI bei `proxy_pass` in Nginx, da die Anwendung es erwartet.

Die Seite **Status** zeigt die geltende Basis-URL.

---

## Zeitüberschreitungen, Uploads und Live-Ausgabe

Die Seite Jobs und die Job-Zähler erfahren von Änderungen über einen langlebigen Strom von Server-Sent Events,
[`/api/v2/events`](../api/events.html), der pro Browser offen gehalten wird. Der Strom sendet Header, die das Puffern im Proxy abschalten
(`X-Accel-Buffering: no`), und alle 15 Sekunden eine Keep-alive-Zeile, sodass das übliche Lese-Timeout von 60 Sekunden ihn offen hält;
schließt ein Proxy ihn trotzdem, verbindet sich der Browser von selbst neu. Die Ausgabe unter einem Formular direkt nach einem Start wird
stattdessen alle zwei Sekunden gelesen. Ein Job-Start kehrt zurück, sobald der Job angelegt ist, sodass ein langes Playbook keine
Anfrage offen hält.

Die Anfragen, die lange dauern können, sind:

* **Backup und Wiederherstellung** auf der Seite **Backups**, die warten, bis der Dump- oder Wiederherstellungsbefehl fertig ist, bis zu
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (standardmäßig 3600)
* **große Uploads** über ein Dateifeld, die die gesamte Datei in einer Anfrage übertragen
* **Chat-Nachrichten**, wenn der [Chat-Assistent](../chat/) aktiviert ist, die auf die Antwort des Modellanbieters warten

Proxys brechen oft nach 60 Sekunden ab und begrenzen Anfrage-Bodys (Nginx akzeptiert standardmäßig 1 MB). Erhöhen Sie beides für
die Routen von AnsibleForms, wie in den Beispielen unten.

---

## Runner-WebSockets

Ab 7.3.0 wählt sich ein [ausgehender Runner](../rte/modes.html#outbound) bei der Anwendung ein und hält einen WebSocket auf
`<BASE_URL>/api/v2/rte/socket` offen. Der Proxy muss das Upgrade weiterreichen, sonst verbindet sich der Runner nie und wählt sich immer wieder ein:

| Proxy | Was der WebSocket braucht |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` und die Header `Upgrade` und `Connection`, die Nginx standardmäßig nicht weiterleitet |
| Traefik | Nichts: WebSockets werden unverändert durchgereicht |
| Apache | `upgrade=websocket` in der Zeile `ProxyPass` (ab 2.4.47) oder davor `mod_proxy_wstunnel` |

Beide Enden senden alle 20 Sekunden einen Ping, sodass das übliche Lese-Timeout von 60 Sekunden einen untätigen Socket offen hält.

---

## Größe der Anfrage-Header

Jede Anfrage trägt das Anmeldetoken in ihrem Header `Authorization`, neben Cookies und den Headern, die der Proxy hinzufügt.
Sowohl der Proxy als auch die Anwendung begrenzen die Größe der Anfrage-Header und weisen eine Anfrage über der Grenze ab, bevor
AnsibleForms sie sieht, sodass nichts im Serverprotokoll ankommt. Die Standardwerte:

| Komponente | Grenze | Standard | Abgewiesen mit |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), alle Header zusammen | 16384 Bytes | 431 |
| Nginx | `large_client_header_buffers`, pro Header-Feld | `4 8k`: 8 KB pro Feld | 400 |
| Traefik | `http.maxHeaderBytes` des Entry Points, alle Header zusammen | 1 MB | 431 |
| HAProxy | `tune.bufsize` im Abschnitt `global`, der gesamte Header-Block abzüglich der Reserve `tune.maxrewrite` (1024 Bytes) | 16384 Bytes: 15360 Bytes an Headern | 400 |
| Apache | `LimitRequestFieldSize`, pro Header-Feld | 8190 Bytes | 400 |

Bis 7.0.3 trug das Anmeldetoken jede Gruppe eines Single-Sign-on-Benutzers und konnte über diese Grenzen hinauswachsen, siehe
[Leere Formulare und Jobs nach einem Single Sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Ab 7.1.0 bleibt das Token klein, und die Standardwerte genügen. Wenn etwas anderes die Header groß macht, etwa
Cookies anderer Anwendungen auf derselben Domäne oder ein vorgeschaltetes Single-Sign-on-Gateway, erhöhen Sie die Grenzen gemeinsam:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536` oder vor 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; beide werden
  beim Start gelesen, starten Sie die Anwendung also nach einer Änderung neu
* Nginx: `large_client_header_buffers 4 32k;` im Block `http` oder `server`
* HAProxy: `tune.bufsize 65536` im Abschnitt `global`; jeder Stream erhält einen Puffer dieser Größe, daher empfiehlt HAProxy,
  das globale `maxconn` um denselben Faktor zu senken, und HTTP/2 braucht mindestens den Standard von 16384
* Apache: `LimitRequestFieldSize 32768` in der Serverkonfiguration oder im virtuellen Host

---

## Client-Adressen

Hinter einem Proxy kommt jede Verbindung vom Proxy. Ohne [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY)
erfasst der Audit-Verlauf für jede Aktion die Adresse des Proxys, und die adressbezogenen
[Anmeldegrenzen](../security/hardening.html#sign-in-limits-and-passwords) zählen alle Clients als eine Adresse.
`TRUST_PROXY` sagt, welchen Proxys die Anwendung glauben darf, wenn sie den Client in `X-Forwarded-For` melden:

| Wert | Client-Adresse |
|-------|----------------|
| `0` (Standard) | Die Adresse der Verbindung. `X-Forwarded-For` wird ignoriert; leer, `false`, `off` und `no` bedeuten dasselbe. |
| Eine Zahl, z. B. `1` | Vertraut so vielen Proxys vor der Anwendung: `1` für einen einzelnen Reverse Proxy, `2` für einen Load Balancer vor einem Ingress. |
| Eine Liste, z. B. `10.0.0.5,172.16.0.0/12` | Vertraut den Proxys unter diesen Adressen und CIDR-Bereichen. Die Voreinstellungen `loopback`, `linklocal` und `uniquelocal` werden ebenfalls akzeptiert. |
| `true` | Vertraut jedem Hop: Die linke Adresse von `X-Forwarded-For` wird verwendet. |

Die Anwendung durchläuft `X-Forwarded-For` von rechts, überspringt die vertrauenswürdigen Proxys und nimmt die erste Adresse, die
keiner von ihnen ist. Verwenden Sie die genaue Anzahl der Proxys oder ihre Adressen:

* `X-Forwarded-For` ist ein einfacher Anfrage-Header, den jeder Client senden kann. Eine zu hohe Zahl oder `true` lässt einen
  Client die Adresse wählen, die der Audit-Verlauf erfasst. `true` ist nur sicher, wenn die Anwendung ausschließlich über
  den Proxy erreichbar ist, und der Server protokolliert beim Start eine Warnung `[SECURITY]`, wenn es gesetzt ist.
* Der Proxy muss die Adresse hinzufügen, von der er die Verbindung empfangen hat, wie es die Beispiele unten tun
  (`$proxy_add_x_forwarded_for` in Nginx; Traefik und Apache `mod_proxy` fügen sie standardmäßig hinzu).
* Ein ungültiger Wert wird auf der Einstellungsseite abgewiesen; in der Umgebung gesetzt, wird er beim Start als Fehler protokolliert, und
  keinem Proxy wird vertraut. Eine auf der Einstellungsseite gespeicherte Änderung gilt ohne Neustart.

---

## Beispiele

Jedes Beispiel veröffentlicht AnsibleForms unter `https://forms.example.com/ansibleforms/`, wobei der Proxy TLS terminiert und
die Anwendung mit `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` und `TRUST_PROXY=1` läuft:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` nennt keine URI, daher leitet Nginx den Pfad so weiter, wie er hereinkam, einschließlich Präfix. Der Block `map` gehört in den
Kontext `http` (eine Datei unter `conf.d/` wird dort eingebunden) und reicht das WebSocket-Upgrade der Runner weiter:

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

Ohne Unterpfad verwenden Sie `location /` und lassen `BASE_URL` ungesetzt.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Labels am Dienst `app` des docker-compose-Projekts, mit Traefik im selben Docker-Netz. Der Dienst
veröffentlicht keinen eigenen Port, Traefik erreicht ihn über das Netz:

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

Es gibt absichtlich keine Middleware `StripPrefix`. Traefik setzt die Header `X-Forwarded-*` selbst und begrenzt
die Body-Größe nicht, prüfen Sie aber die `respondingTimeouts` des Entry Points, wenn Backups oder Uploads länger dauern als sein
Lese-Timeout. Ohne Unterpfad behalten Sie nur den Teil `Host(...)` der Regel.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Braucht `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl` und Apache 2.4.47 oder neuer für das `upgrade=websocket` der Runner.
Beide Seiten von `ProxyPass` tragen das Präfix:

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

Ohne Unterpfad leiten Sie `/` an `http://10.0.0.20:8000/` weiter und lassen `BASE_URL` ungesetzt.

</div>
</div>

Um den Abschnitt zwischen Proxy und Anwendung verschlüsselt zu halten, betreiben Sie die Anwendung mit `HTTPS=1`, richten den Proxy auf
`https://` und geben der Anwendung ein Zertifikat, dem der Proxy vertraut, siehe [HTTPS](../security/https.html).

---
layout: default
title: Server und Datenbank
parent: Umgebungsvariablen
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Server und Datenbank
{: .no_toc }

Der Webserver, die MySQL-Verbindung, das Admin-Konto und was jeder Prozess ausführt (AF_ROLE und die RTE_*-Variablen)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, wenn die Anwendung hinter einem Reverse Proxy, auf einem anderen Port oder gegen eine Datenbank außerhalb des Compose-Projekts läuft.

---

## Beispiel

Hinter einem Reverse Proxy, der TLS terminiert, unter `/ansibleforms`, mit einem externen MySQL. In `docker-compose.yml`:

```yaml
    environment:
      - BASE_URL=/ansibleforms        # the proxy forwards /ansibleforms/ unchanged
      - HTTPS=0                       # the proxy terminates TLS
      - PORT=8000
      - DB_HOST=mysql.example.com
      - DB_PORT=3306
      - DB_USER=ansibleforms
      - DB_PASSWORD=change-me
```

Diese ersetzen die Zeilen `DB_*` und `PORT`, die die Compose-Datei dort bereits hat und die über dieselben Namen in `.env` gewinnen. Entfernen Sie
den Dienst `mysqldb` und das `depends_on`, das auf ihn wartet, und mappen Sie Port 8000 in `ports`. Die Proxy-Seite ist auf der Seite
[Reverse Proxy](../production/reverse-proxy.html) beschrieben.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="server" %}

---
layout: default
title: Server en database
parent: Omgevingsvariabelen
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Server en database
{: .no_toc }

De webserver, de MySQL-verbinding, het adminaccount, en wat elk proces draait (AF_ROLE en de RTE_*-variabelen)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze wanneer de applicatie achter een reverse proxy draait, op een andere poort, of tegen een database buiten het compose-project.

---

## Voorbeeld

Achter een reverse proxy die TLS afhandelt, onder `/ansibleforms`, met een externe MySQL. In `docker-compose.yml`:

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

Deze vervangen de regels `DB_*` en `PORT` die het compose-bestand daar al heeft, en die voorgaan op dezelfde namen in `.env`. Verwijder
de service `mysqldb` en de `depends_on` die erop wacht, en koppel poort 8000 in `ports`. De kant van de proxy wordt beschreven op de
pagina [Reverse proxy](../production/reverse-proxy.html).

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="server" %}

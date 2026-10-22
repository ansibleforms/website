---
layout: default
title: Servidor i base de dades
parent: Variables d'entorn
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Servidor i base de dades
{: .no_toc }

El servidor web, la connexió a MySQL, el compte d'admin i el que executa cada procés (AF_ROLE i les variables RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables quan l'aplicació s'executa darrere d'un proxy invers, en un altre port o contra una base de dades de fora del projecte compose.

---

## Exemple

Darrere d'un proxy invers que termina el TLS, sota `/ansibleforms`, amb un MySQL extern. A `docker-compose.yml`:

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

Aquestes línies substitueixen les línies `DB_*` i `PORT` que el fitxer compose ja hi té, que guanyen als mateixos noms de `.env`. Treu
el servei `mysqldb` i el `depends_on` que l'espera, i mapeja el port 8000 a `ports`. La part del proxy es descriu a la
pàgina [Proxy invers](../production/reverse-proxy.html).

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="server" %}

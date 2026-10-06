---
layout: default
title: Server and database
parent: Environment Variables
nav_order: 1
---

# Server and database
{: .no_toc }

The web server, the MySQL connection and the admin account
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these when the application runs behind a reverse proxy, on another port, or against a database outside the compose project.

---

## Example

Behind a reverse proxy that terminates TLS, under `/ansibleforms`, with an external MySQL. In `docker-compose.yml`:

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

These replace the `DB_*` and `PORT` lines the compose file already has there, which win over the same names in `.env`. Remove
the `mysqldb` service and the `depends_on` that waits for it, and map port 8000 in `ports`. The proxy side is described on the
[Reverse proxy](../production/reverse-proxy.html) page.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="server" %}

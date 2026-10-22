---
layout: default
title: Server e database
parent: Variabili d'ambiente
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Server e database
{: .no_toc }

Il server web, la connessione MySQL, l'account admin, e cosa esegue ogni processo (AF_ROLE e le variabili RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale quando l'applicazione gira dietro un reverse proxy, su un'altra porta, o con un database esterno al progetto compose.

---

## Esempio

Dietro un reverse proxy che termina il TLS, sotto `/ansibleforms`, con un MySQL esterno. In `docker-compose.yml`:

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

Queste sostituiscono le righe `DB_*` e `PORT` che il file compose ha già lì, e che vincono sugli stessi nomi in `.env`. Rimuovi
il servizio `mysqldb` e il `depends_on` che lo attende, e mappa la porta 8000 in `ports`. Il lato del proxy è descritto nella pagina
[Reverse proxy](../production/reverse-proxy.html).

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="server" %}

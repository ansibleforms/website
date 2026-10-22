---
layout: default
title: Serwer i baza danych
parent: Zmienne środowiskowe
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Serwer i baza danych
{: .no_toc }

Serwer WWW, połączenie z MySQL, konto admina i to, co uruchamia każdy proces (AF_ROLE i zmienne RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, gdy aplikacja działa za reverse proxy, na innym porcie lub z bazą danych spoza projektu compose.

---

## Przykład

Za reverse proxy, które terminuje TLS, pod `/ansibleforms`, z zewnętrzną bazą MySQL. W `docker-compose.yml`:

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

Zastępują one linie `DB_*` i `PORT`, które plik compose już tam ma i które wygrywają z tymi samymi nazwami w `.env`. Usuń
usługę `mysqldb` i `depends_on`, które na nią czeka, a w `ports` zmapuj port 8000. Konfigurację po stronie proxy opisuje
strona [Reverse proxy](../production/reverse-proxy.html).

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="server" %}

---
layout: default
title: Servidor y base de datos
parent: Variables de entorno
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Servidor y base de datos
{: .no_toc }

El servidor web, la conexión a MySQL, la cuenta de admin y lo que ejecuta cada proceso (AF_ROLE y las variables RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables cuando la aplicación se ejecuta detrás de un proxy inverso, en otro puerto o contra una base de datos fuera del proyecto compose.

---

## Ejemplo

Detrás de un proxy inverso que termina TLS, bajo `/ansibleforms`, con un MySQL externo. En `docker-compose.yml`:

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

Estas líneas sustituyen a las líneas `DB_*` y `PORT` que el archivo compose ya tiene ahí, que ganan a los mismos nombres en `.env`. Quita
el servicio `mysqldb` y el `depends_on` que lo espera, y mapea el puerto 8000 en `ports`. La parte del proxy se describe en la
página [Proxy inverso](../production/reverse-proxy.html).

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="server" %}

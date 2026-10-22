---
layout: default
title: Servidor e base de dados
parent: Variáveis de ambiente
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Servidor e base de dados
{: .no_toc }

O servidor web, a ligação ao MySQL, a conta de admin, e o que cada processo corre (AF_ROLE e as variáveis RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas quando a aplicação corre atrás de um reverse proxy, noutra porta, ou contra uma base de dados fora do projeto compose.

---

## Exemplo

Atrás de um reverse proxy que termina o TLS, em `/ansibleforms`, com um MySQL externo. No `docker-compose.yml`:

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

Estas substituem as linhas `DB_*` e `PORT` que o ficheiro compose já tem aí, que prevalecem sobre os mesmos nomes no `.env`. Remova
o serviço `mysqldb` e o `depends_on` que espera por ele, e mapeie a porta 8000 em `ports`. O lado do proxy está descrito na página
[Reverse proxy](../production/reverse-proxy.html).

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="server" %}

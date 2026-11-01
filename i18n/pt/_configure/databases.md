---
layout: default
title: Bases de dados
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Bases de dados
{: .no_toc }

As bases de dados que os formulários consultam, e a sua credencial
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: dê nome às bases de dados que os seus formulários consultam, escolha a credencial com que cada uma se liga, e teste-as.

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [A página de bases de dados](databases/list.html) | A lista de bases de dados, as suas colunas, e a caixa de diálogo que adiciona uma |
| [A página de uma base de dados](databases/database-page.html) | Os separadores de uma base de dados, os formulários que a consultam, Testar ligação e Eliminar |
| [Bases de dados nos formulários](databases/in-forms.html) | Como o `dbConfig` de um campo nomeia uma base de dados, e os formulários escritos antes da 7.5.0 |

---

## Como funciona

A partir da 7.5.0, uma **base de dados** é uma ligação própria, adicionada em **Ligações > Bases de dados**, entre **Cofres de segredos** e
**Runners**. Tem três coisas:

| Campo | O que é |
|---|---|
| Nome | O nome que o `dbConfig` de um campo indica para a consultar, como `cmdb` |
| Descrição | Para que serve |
| Credencial | A credencial de [Ligações > Credenciais](credentials.html), do tipo **Base de dados**, com que se liga |

A credencial guarda tudo sobre a ligação, como antes: o tipo de base de dados (MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB),
o host e a porta, o nome da base de dados, o TLS, e o utilizador e a palavra-passe, guardados cifrados ou lidos de um [cofre de segredos](secret-stores/).
Uma base de dados não tem endereço nem segredo próprios, por isso uma base de dados e um runner escolhem a sua credencial da mesma forma.

Um campo consulta uma base de dados nomeando-a no `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Um nome que não é uma base de dados é procurado como uma credencial do tipo base de dados, como antes da 7.5.0, por isso os formulários mais
antigos continuam a funcionar sem alterações (consulte [Bases de dados nos formulários](databases/in-forms.html)).

---

## Atualizar para a 7.5.0

A atualização preenche **Ligações > Bases de dados** uma vez, para que os formulários que tem continuem a funcionar sem alterações.

Cria uma base de dados para cada credencial do tipo base de dados, com o nome e a descrição da credencial, ligando-se com essa
credencial. Um formulário cujo `dbConfig` nomeia a credencial encontra agora a base de dados com o mesmo nome, que se liga com a mesma
credencial: o resultado é o mesmo. As credenciais mantêm todos os campos que têm.

A atualização corre uma única vez: uma base de dados eliminada depois não volta a ser criada, e uma credencial de base de dados adicionada
mais tarde não recebe nenhuma base de dados até que adicione uma.

---

## Credenciais em uso

Uma credencial com que uma base de dados se liga está em uso, tal como uma com que um runner inicia sessão.

Não pode ser eliminada nem renomeada enquanto uma base de dados a nomear, e o separador **Usado por** da sua página lista as bases de dados (consulte
[Credenciais em uso](credentials.html#credentials-in-use)). Eliminar uma base de dados deixa a sua credencial como está.

---

## Quem gere as bases de dados

As bases de dados seguem as opções de função das credenciais que nomeiam.

A lista, a página de uma base de dados e a sua API precisam da opção de função `showSettings` ou `showConnectionsSettings`, tal como as credenciais.
Só um admin pode fazer uma base de dados ligar-se com uma credencial que só um admin pode nomear, como uma que lê a sua palavra-passe de um
cofre de segredos (consulte [Quem pode alterar uma credencial](credentials.html#who-may-change-a-credential)): os formulários que a consultam
ligar-se-iam com essa credencial, e **Testar ligação** enviaria o seu segredo para o seu servidor. Outro utilizador pode voltar a guardar uma
base de dados com a credencial que ela já nomeia.

Uma base de dados declarada no [config seed](seed/) é só de leitura na sua página: altere-a antes no ficheiro de seed.

---

## O config seed

Um seed declara as suas bases de dados numa secção `databases:`, depois das credenciais que estas nomeiam.

Cada item tem um `name`, uma `credential` do tipo base de dados e, opcionalmente, uma `description`. A credencial pode vir da secção
`credentials` do mesmo seed ou ser uma criada na aplicação:

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

Consulte o [exemplo](seed/example.html) completo e [Objetos geridos](seed/managed-objects.html) para ver como o seed gere o que declara.

---

## A API REST

Os scripts gerem as bases de dados através da [API REST](api/), em `/api/v2/database`, com as mesmas opções de função que a página.

| Chamada | O que faz |
|---|---|
| `GET /api/v2/database` | Lista as bases de dados, cada uma com o tipo de base de dados, a base de dados, o host e a porta da sua credencial, e quantos formulários a consultam (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Obtém a base de dados com esse nome |
| `GET /api/v2/database/<id>` | Obtém uma base de dados |
| `POST /api/v2/database` | Adiciona uma base de dados: o seu `name`, `credential` e, opcionalmente, `description` |
| `PUT /api/v2/database/<id>` | Altera uma base de dados |
| `DELETE /api/v2/database/<id>` | Elimina uma base de dados; a sua credencial mantém-se |
| `POST /api/v2/database/<id>/check` | Testa a sua ligação, com a sua credencial |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Uma `credential` que não existe, ou que não é do tipo base de dados, é recusada com `400`. Todas as alterações são escritas no registo de auditoria.

---
layout: default
title: Bases de dados nos formulários
parent: Bases de dados
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Bases de dados nos formulários
{: .no_toc }

Como o dbConfig nomeia uma base de dados, e os formulários antigos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nomear uma base de dados

Um campo com uma `query` corre-a na base de dados que o seu `dbConfig` nomeia.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

A partir da 7.5.0, o nome é procurado por esta ordem:

| Ordem | O nome é | A consulta liga-se com |
|---|---|---|
| 1 | Uma base de dados de **Ligações > Bases de dados** | A credencial que essa base de dados nomeia |
| 2 | Senão, uma credencial do tipo **Base de dados** de **Ligações > Credenciais** | Essa credencial, como antes da 7.5.0 |

O tipo de base de dados (MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB) vem da credencial, por isso o formulário nunca o indica. Uma credencial
sem tipo é lida como MySQL.

---

## Formulários escritos antes da 7.5.0

Todos os formulários que nomeavam uma credencial no `dbConfig` continuam a funcionar, sem alterações.

A [atualização para a 7.5.0](../databases.html#upgrading-to-750) cria uma base de dados para cada credencial de base de dados, com o mesmo nome e
ligando-se com essa credencial, por isso o nome que um formulário indica encontra agora primeiro a base de dados, que leva ao mesmo acesso. Uma credencial
do tipo base de dados sem nenhuma base de dados com o seu nome continua a ser encontrada pelo passo 2.

Uma base de dados e uma credencial podem partilhar um nome, como faz a atualização. A base de dados prevalece: aponte-a para outra credencial e todos
os formulários que indicam esse nome seguem-na, e é assim que um formulário passa para outro servidor sem ser editado.

---

## As formas do dbConfig

As três formas que o `dbConfig` sempre aceitou continuam a funcionar, com cada nome procurado como acima.

| `dbConfig` | Exemplo | O que faz |
|---|---|---|
| Um nome | `dbConfig: cmdb` | Consulta essa base de dados |
| Uma lista de nomes | `dbConfig: [cmdb-eu, cmdb-us]` | Corre a consulta em cada uma e junta os resultados; os duplicados não são removidos |
| Um objeto (legado) | `dbConfig: { name: cmdb, type: mysql }` | Consulta a base de dados ou a credencial `name`; obsoleto, use só o nome |

Uma referência a um [cofre de segredos](../secret-stores/#inline-without-a-credential-row), como `dbConfig: secret:vault:secret/cmdb/db`, não é
um nome de base de dados nem de credencial, e continua a ser lida do cofre como antes.

---

## Que formulários consultam uma base de dados

A aplicação lê os formulários para saber quais deles consultam cada base de dados.

A coluna **Usado por** da [página de bases de dados](list.html) conta-os, e o separador **Usado por** da
[página de uma base de dados](database-page.html#used-by) lista-os com os seus campos. Um campo que nomeia antes a credencial da base de dados
também conta. Renomeie uma base de dados só depois de alterar os formulários que indicam o seu nome antigo.

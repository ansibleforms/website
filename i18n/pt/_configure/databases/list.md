---
layout: default
title: A página de bases de dados
parent: Bases de dados
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# A página de bases de dados
{: .no_toc }

A lista de bases de dados, as suas colunas, e como adicionar uma
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A lista

A página em **Ligações > Bases de dados** lista todas as bases de dados com estas colunas:

| Coluna | Significado |
|---|---|
| Nome | Como os formulários se referem a ela, com `dbConfig: <name>` |
| Descrição | Para que serve |
| Tipo de base de dados | O da sua credencial: MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB |
| Base de dados | A base de dados que a sua credencial abre |

**Colunas** acrescenta mais duas, desligadas por predefinição: **Host**, onde a sua credencial se liga, com a porta quando tem uma, e **Usado por**,
quantos formulários a consultam, pelo seu nome ou pelo da sua credencial (consulte [Usado por](database-page.html#used-by)).

O tipo de base de dados, a base de dados e o host são lidos da credencial: altere-os na credencial, em
**Ligações > Credenciais**. Nenhuma coluna mostra um utilizador nem uma palavra-passe.

---

## Adicionar uma base de dados

**Adicionar base de dados** abre uma caixa de diálogo em dois passos, como a de um runner.

| Passo | Campos |
|---|---|
| Base de dados | **Nome** e **Descrição**. O nome é obrigatório, e único |
| Credenciais | **Credencial**, obrigatória: uma credencial do tipo **Base de dados**. Só essas são propostas |

No passo **Credenciais**, **Adicionar credencial** abre a caixa de diálogo de uma nova credencial do tipo **Base de dados** (consulte
[A página de credenciais](../credentials/list.html)) e escolhe-a depois de guardada, para que uma base de dados e o seu acesso possam ser adicionados de uma vez.

---

## O menu da linha

Uma linha abre a página própria da base de dados, e o seu menu oferece:

| Ação | O que faz |
|---|---|
| Editar | Abre a sua página |
| Testar ligação | Liga-se com a sua credencial e corre a consulta mínima do seu tipo de base de dados, e diz se funcionou |
| Eliminar | Elimina a base de dados, depois de uma confirmação. A sua credencial mantém-se |

Eliminar uma base de dados que os formulários ainda nomeiam faz falhar as suas consultas, a menos que fique uma credencial com o mesmo nome a que
possam recorrer (consulte [Bases de dados nos formulários](in-forms.html)). Verifique primeiro o seu separador **Usado por**.

---
layout: default
title: "A página de uma base de dados"
parent: Bases de dados
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# A página de uma base de dados
{: .no_toc }

Separadores, formulários que a consultam, Testar ligação e Eliminar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Separadores

A página de uma base de dados mostra os passos da sua caixa de diálogo como separadores, mais os formulários que a consultam:

| Separador | O que contém |
|---|---|
| Detalhes | O **Nome**, o que o `dbConfig` de um campo indica, e a **Descrição** |
| Credenciais | A **Credencial** com que se liga, uma credencial de Ligações > Credenciais do tipo **Base de dados**, que contém o seu tipo de base de dados, host, porta, base de dados, TLS e acesso |
| Usado por | Os formulários que a consultam, com a contagem no separador, consulte [Usado por](#used-by) |

Cada separador tem o seu próprio endereço, como `/settings/databases/<id>/used-by`, por isso uma ligação ou um marcador abre-o. A pesquisa da linha
do título filtra todos os separadores de uma vez.

No separador **Credenciais**, **Adicionar credencial** cria uma nova credencial do tipo **Base de dados** e escolhe-a. Uma palavra-passe nunca volta
a ser mostrada depois de guardada: altere-a na credencial.

---

## Usado por

O separador **Usado por** lista os formulários cujos campos consultam a base de dados, tal como a aplicação os lê dos formulários.

| Coluna | O que mostra |
|---|---|
| Formulário | O formulário, uma linha abre-o |
| Descrição | A descrição do formulário |
| Campo | Os campos desse formulário cujo `dbConfig` nomeia a base de dados |

Um campo conta quando o seu `dbConfig` nomeia a base de dados, ou nomeia a sua credencial, como faz um formulário escrito antes da 7.5.0. Ambos
se ligam com a mesma credencial, por isso ambos são listados. Quando não há nenhum, o separador diz **Nenhum formulário consulta esta base de dados.**

---

## Testar ligação e Eliminar

Os botões no canto superior direito atuam sobre a base de dados tal como está guardada.

**Testar ligação** liga-se com a sua credencial e corre a consulta mínima do seu tipo de base de dados, e depois indica-o numa mensagem,
**&lt;name&gt; connection ok**, ou porque falhou. É o mesmo teste que o **Testar ligação** da própria credencial.

**Eliminar** pergunta primeiro, depois elimina a base de dados e volta à lista. A sua credencial mantém-se em **Ligações > Credenciais**.
Ao lado deles, **Guardar** guarda os separadores Detalhes e Credenciais.

---
layout: default
title: Um grupo local
parent: Utilizadores e grupos
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Um grupo local
{: .no_toc }

A página de um grupo local e os seus separadores
{: .fs-6 .fw-300 }

Desde a 7.8.0, **Adicionar grupo** abre o assistente **Novo grupo** em três passos: **Detalhes** (o nome e a descrição), **Utilizadores**
(os utilizadores locais a colocar no grupo) e **Funções** (as funções a dar-lhe, para que os seus utilizadores as tenham). Só o nome é
obrigatório. **Guardar**, no último passo, cria o grupo, depois adiciona os utilizadores e dá as funções: o que falhar é indicado numa
mensagem, e o grupo mantém-se.

A página de um grupo, `/settings/groups/<id>`, tem estes separadores:

| Separador | O que mostra |
|---|---|
| **Detalhes** | O nome e a descrição |
| **Utilizadores** | Os utilizadores do grupo; **Adicionar utilizador** adiciona um, o menu de uma linha ou as caixas de verificação removem um |
| **Funções** | As funções que nomeiam o grupo |
| **Formulários** | Os formulários que essas funções abrem |

Um grupo com utilizadores não pode ser eliminado: remova primeiro os seus utilizadores. O grupo `admins` nunca pode ser eliminado nem renomeado.

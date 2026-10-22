---
layout: default
title: Um utilizador local
parent: Utilizadores e grupos
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Um utilizador local
{: .no_toc }

Adicionar um utilizador local, e os separadores da sua página
{: .fs-6 .fw-300 }

**Adicionar utilizador** abre um assistente em três passos: **Utilizador** (nome de utilizador, descrição, email), **Palavra-passe** e **Grupo**.

A página de um utilizador, `/settings/users/<id>`, tem estes separadores:

| Separador | O que mostra |
|---|---|
| **Detalhes** | O interruptor **Permitir início de sessão**, o nome de utilizador, a descrição, o email e, a partir da 7.3.0, o **Último início de sessão** |
| **Grupos** | Os grupos a que o utilizador pertence |
| **Funções** | As funções que o utilizador tem, e o que dá cada uma: **Diretamente**, **Através de** um grupo, ou **Todos** |
| **Formulários** | Os formulários que essas funções abrem |
| **Trabalhos** | As tarefas que o utilizador lançou, as mais recentes primeiro |
| **Tarefas guardadas** | Os valores de formulário que o utilizador guardou para voltar a executar |
| **Agendamentos** | As tarefas que o utilizador planeou com Executar mais tarde |
| **Atividade** | O que o registo de auditoria registou que o utilizador fez |
| **Tokens de API** | Os tokens de API do utilizador, com quando cada um foi criado, quando expira e quando foi usado pela última vez; **Revogar** termina um de imediato |

A partir da 7.3.0, os inícios de sessão de um utilizador local são registados, como já eram os de um utilizador LDAP ou SSO: **Último início de sessão** mostra o mais recente, e
a lista de utilizadores tem uma coluna ordenável **Último início de sessão** para todas as origens, por isso uma conta que ninguém usa salta à vista. Um início de sessão recusado não é
registado, e um utilizador local que não iniciou sessão desde a atualização mostra `–`.

**Alterar palavra-passe** e **Eliminar** estão no canto superior direito. O utilizador `admin` nunca pode ser eliminado nem renomeado.

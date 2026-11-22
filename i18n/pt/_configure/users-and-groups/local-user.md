---
layout: default
title: Um utilizador local
parent: Utilizadores e grupos
nav_order: 1
translated_from: 830382a6160c7dd5632ad0f8d89b7ad520d7ae52
---

# Um utilizador local
{: .no_toc }

Adicionar um utilizador local, e os separadores da sua página
{: .fs-6 .fw-300 }

**Adicionar utilizador** abre o assistente **Novo utilizador** em quatro passos:

| Passo | O que pede |
|---|---|
| **Utilizador** | O nome de utilizador, a descrição e o email; só o nome de utilizador é obrigatório |
| **Palavra-passe** | A palavra-passe, escrita duas vezes: **Seguinte** espera até que ambas sejam iguais |
| **Grupo** | O grupo local a que o utilizador pertence, e que lhe dá as funções do grupo |
| **Funções** | As funções dadas ao próprio utilizador, cada uma escolhida com **Adicionar função**; nenhuma é necessária |

O passo **Funções** e a palavra-passe escrita duas vezes são novos na 7.8.0. **Guardar**, no último passo, cria o utilizador e depois
dá-lhe as funções escolhidas: uma função que não lhe pôde ser dada é indicada numa mensagem, e o utilizador é criado na mesma.

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

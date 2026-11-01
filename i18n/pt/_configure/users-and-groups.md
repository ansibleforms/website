---
layout: default
title: Utilizadores e grupos
nav_order: 16
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 07178b6b66a60d91e5a8ff3c417da3771730bc5e
---

# Utilizadores e grupos
{: .no_toc }

Os utilizadores e grupos locais, os de LDAP e de início de sessão único ao lado deles, e bloquear um início de sessão
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: gira quem pode iniciar sessão em **Definições > Acesso > Utilizadores** e **Grupos**, com a opção de função `showSettings`.

O admin integrado, a ordem de início de sessão e o mapeamento para funções das contas locais estão em [Contas locais](authentication/local.html).

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [Um utilizador local](users-and-groups/local-user.html) | Adicionar um utilizador local, e os separadores da sua página |
| [Vários grupos](users-and-groups/several-groups.html) | Um utilizador local em vários grupos, e as suas funções |
| [Um grupo local](users-and-groups/local-group.html) | A página de um grupo local e os seus separadores |
| [Utilizadores e grupos de diretório](users-and-groups/directory.html) | Utilizadores e grupos de LDAP, Entra ID e OIDC, tal como foram vistos pela última vez |
| [Bloquear um início de sessão](users-and-groups/blocking-a-sign-in.html) | Permitir início de sessão: bloquear um utilizador sem eliminar nada |


---

## As listas

As listas **Utilizadores** e **Grupos** mostram os utilizadores e grupos locais e, ao lado deles, os de LDAP e de início de sessão único.

Um utilizador ou grupo de LDAP, Entra ID ou OIDC aparece na lista depois de ter iniciado sessão (ou de ter sido visto num início de sessão), ou quando uma função o nomeia.
A coluna **Origem** diz de onde vem cada um: Local, LDAP, Microsoft Entra ID ou OIDC. A partir da 7.3.0, a lista **Utilizadores** tem também
uma coluna **Último início de sessão**, que diz quando cada utilizador iniciou sessão pela última vez.

Uma linha abre a página do seu utilizador ou grupo. **Adicionar utilizador** e **Adicionar grupo** criam um local.

---

## Contas que concedem admin

A função admin no config.yaml nomeia grupos e utilizadores locais, por isso só um admin pode alterar as contas e os grupos que ela nomeia.

Um utilizador com `showSettings` mas sem a função admin não pode alterar, bloquear, mudar de grupo, definir a palavra-passe nem eliminar uma
conta local que a função admin nomeia (diretamente ou através de um dos seus grupos). Também não pode criar, renomear nem eliminar um grupo
que a função admin nomeia, nem colocar um utilizador num deles. O mesmo vale para um utilizador LDAP ou SSO que corresponde à função admin: bloqueá-lo,
terminar as suas sessões, esquecê-lo e revogar os seus tokens de API cabem a um admin. O servidor responde a um pedido destes com `403`.


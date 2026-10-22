---
layout: default
title: Utilizadores e grupos de diretório
parent: Utilizadores e grupos
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Utilizadores e grupos de diretório
{: .no_toc }

Utilizadores e grupos de LDAP, Entra ID e OIDC, tal como foram vistos pela última vez
{: .fs-6 .fw-300 }

Um utilizador de LDAP, Entra ID ou OIDC tem a sua página em `/settings/users/<source>/<name>`, com `ldap`, `azuread` ou `oidc`
como origem, como `/settings/users/ldap/jdoe`. Mostra o que foi registado no último início de sessão do utilizador, só de leitura,
já que é o diretório ou o fornecedor de identidade que define quem o utilizador é e os seus grupos.

Os seus separadores são os de um utilizador local. **Detalhes** tem o interruptor **Permitir início de sessão**, o nome de utilizador, a origem, o nome,
o email, quando o utilizador foi visto pela primeira vez e o seu último início de sessão. **Grupos** lista os grupos do último início de sessão.
**Tokens de API** lista os tokens de API do utilizador, e **Revogar** termina um de imediato.

No canto superior direito, **Terminar sessões** termina a sessão do utilizador em todo o lado, agora. **Esquecer** remove o registo, que volta
no seu início de sessão seguinte; as suas tarefas, tarefas guardadas e agendamentos ficam. Um utilizador bloqueado não pode ser esquecido, já que isso
o deixaria entrar de novo: o servidor responde `409`, por isso permita primeiro o seu início de sessão.

Os grupos deste registo são também os grupos com que a sessão do utilizador trabalha, lidos em direto. Esquecer um utilizador com sessão
iniciada deixa-o sem grupos, e sem as funções que esses grupos dão, até voltar a iniciar sessão.

Um grupo de diretório tem a sua página em `/settings/groups/<source>/<name>`, só de leitura, com os separadores **Detalhes**,
**Utilizadores** (os utilizadores vistos nele no seu último início de sessão), **Funções** e **Formulários**.

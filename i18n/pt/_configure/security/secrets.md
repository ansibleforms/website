---
layout: default
title: Segredos e cifragem
parent: Segurança
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Segredos e cifragem
{: .no_toc }

Os dois segredos mestres, o que protegem, e quanto tempo duram as sessões e os tokens
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Os dois segredos mestres

Dois segredos protegem tudo o resto. Defina ambos antes de a instância conter dados reais, guarde-os fora da instância,
e nunca os altere de ânimo leve:

| Segredo | O que protege | Se não estiver definido | Se se perder ou for alterado |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Todas as palavras-passe e tokens guardados na base de dados: credenciais, a palavra-passe de bind do LDAP, tokens dos runners, client secrets do SSO, endereços de webhooks do Slack e do Teams, a chave de API do chat | É usada uma chave predefinida, que é pública no código-fonte | Perdido: todos os segredos guardados têm de ser introduzidos de novo. Alterado: a partir da 7.3.0 todos os segredos guardados são cifrados de novo, consulte [abaixo](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | A assinatura dos access tokens e refresh tokens, incluindo os [tokens de API](../profile/api-token.html) de longa duração | É gerado um segredo aleatório em cada arranque, por isso cada reinício termina a sessão de todos | Todas as sessões e todos os tokens de API deixam de ser válidos |

Ambos são registados como um aviso `[SECURITY]` no arranque enquanto faltarem. As páginas de definições recusam-se a editá-los,
a API nunca os devolve, e as cópias de segurança deixam-nos de fora de propósito, por isso um `ENCRYPTION_SECRET` perdido não pode ser recuperado
de lado nenhum: guarde uma cópia no seu gestor de segredos. O segredo de cifragem é usado como uma chave de 32 caracteres; um valor mais curto ou
mais longo é preenchido ou cortado.

Alterar `ACCESS_TOKEN_SECRET` termina de imediato todas as sessões e todos os tokens de API. Para terminar os tokens de um utilizador ou de uma
sessão, use as revogações descritas em [Tokens](#tokens).

---

## Alterar o segredo de cifragem

A partir da 7.3.0, definir ou alterar `ENCRYPTION_SECRET` já não faz perder os segredos guardados. No arranque seguinte, o worker volta a cifrar
cada um deles com a chave nova, numa só transação da base de dados, antes de qualquer outra coisa escrever um segredo:

| Situação | O que definir |
|---|---|
| A instância correu sem `ENCRYPTION_SECRET`, com a chave predefinida pública | Só `ENCRYPTION_SECRET`: os segredos são cifrados de novo a partir da chave predefinida |
| A instância correu com uma chave sua | `ENCRYPTION_SECRET` com a chave nova e [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) com a antiga, para esse arranque |

Quando os segredos guardados foram cifrados com uma chave que não é nenhuma das duas, nada é alterado e a aplicação recusa-se a arrancar até
`ENCRYPTION_SECRET_PREVIOUS` indicar essa chave. Remova `ENCRYPTION_SECRET_PREVIOUS` depois de o arranque os ter cifrado de novo, e defina o
novo `ENCRYPTION_SECRET` em todos os nós da aplicação, no worker e em todos os RTE em modo base de dados que se registam a si próprios. Esse
autorregisto (`RTE_REGISTER`) está obsoleto na 7.3.0: um RTE que adere com um join token (`RTE_JOIN_TOKEN`) em modo
socket não precisa de `ENCRYPTION_SECRET`, consulte [Modos do RTE](../rte/modes.html).

---

## Tokens

Um início de sessão devolve um access token de curta duração e um refresh token mais longo, que o navegador usa para obter um novo par:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` por predefinição. Mais curto
  limita o uso de um token intercetado.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` por
  predefinição. É quanto tempo um navegador inativo fica com sessão iniciada.
* A opção de função `allowApiTokens` deixa um utilizador pedir um token de API válido durante um número de dias, e
  `extendedTokenExpiration` acrescenta um que nunca expira. Conceda-as só a funções que precisem de acesso à API a partir de scripts.
  Na [página de perfil](../profile/api-token.html), um token é criado a partir de uma sessão de navegador que iniciou sessão há no máximo 10 minutos,
  e nunca a partir de outro token de API. Um token que nunca expira dura 50 anos, e os eventos abaixo continuam a terminá-lo.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` por predefinição. O máximo que um token de API
  dura: um pedido mais longo é reduzido a este valor.

Um token é um JWT assinado, mas o servidor mantém também uma lista de tokens revogados, partilhada por todos os nós da aplicação, para que um token
possa terminar antes de expirar:

| Evento | O que termina |
|-------|-----------|
| Terminar sessão | Todos os tokens desse início de sessão: o access token, o seu refresh token, e um token de API quando é usado para terminar sessão |
| Uma alteração de palavra-passe, pelo utilizador ou por um admin | Todos os tokens do utilizador emitidos antes da alteração, tokens de API incluídos, em todos os dispositivos |
| O interruptor **Permitir início de sessão** de um utilizador desligado (utilizador local, LDAP ou SSO), ou um utilizador local eliminado | Todos os tokens do utilizador |
| **Terminar sessões** na página de um utilizador LDAP ou SSO | Todos os tokens do utilizador; pode voltar a iniciar sessão a menos que esteja bloqueado |
| **Revogar** num token de API, na página de perfil ou no separador **Tokens de API** do utilizador | Esse token de API, de imediato |

Um script termina o seu próprio token de API terminando sessão com ele: `POST /api/v2/auth/logout` com o token no
cabeçalho `Authorization`.

---
layout: default
title: Autenticação
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Autenticação
{: .no_toc }

Inicie sessão, renove o token ou use um token de longa duração
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Todas as chamadas precisam de um token de acesso no cabeçalho `Authorization`. Um token obtém-se iniciando sessão, e mantém-se válido com
o refresh token.

---

## Inicie sessão

Inicie sessão com autenticação básica, com o nome e a palavra-passe do utilizador:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

A resposta contém dois tokens, o token de acesso e o refresh token:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Chame a API

Envie o token de acesso como bearer token em todas as chamadas:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Renove o token

O token de acesso expira (`ACCESS_TOKEN_EXPIRATION`, 30 minutos por predefinição). Obtenha um novo com o refresh token,
sem a palavra-passe:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

A resposta contém um novo par, com o mesmo formato que o do início de sessão. Um refresh token funciona uma vez: guarde o novo para a renovação seguinte.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Tokens de longa duração

Um script que corre sem intervenção pode usar um token que dura mais tempo. A partir da 7.3.0 precisa da opção de função `allowApiTokens`:

* Crie um em [Perfil > Tokens de API](../profile/api-token.html).
* Ou inicie sessão com o parâmetro de consulta `expiryDays`, para um token válido durante esse número de dias:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` só é lido do URL, nunca do corpo. Para um utilizador cujas funções não tenham `allowApiTokens`, é ignorado,
e o início de sessão devolve um token com a duração habitual. `expiryDays=never` também precisa de `extendedTokenExpiration`. Adicione o parâmetro de consulta `name`
(`?expiryDays=90&name=nightly-backup`) para dar nome ao token na lista de tokens do utilizador.

Um token de longa duração dura no máximo [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) dias, 90 por
predefinição: um `expiryDays` maior é reduzido a esse valor, a menos que seja `never`. Renová-lo devolve um token normal, por isso inicie sessão novamente quando expirar.

### Tokens do utilizador com sessão iniciada

A vista **Tokens de API** do perfil usa estes endpoints, que funcionam para qualquer conta, SSO incluído, pois não precisam de palavra-passe:

| Chamada | O que faz |
|---|---|
| `GET /api/v2/profile/tokens` | Lista os seus tokens de API, com o seu `sid`, `name`, criação, expiração e última utilização |
| `POST /api/v2/profile/tokens` | Cria um token a partir da sua sessão; o corpo contém `expiryDays` (um número, ou `never`) e um `name` opcional |
| `DELETE /api/v2/profile/tokens/{sid}` | Revoga um dos seus tokens |

`POST` responde `403` quando é chamado com um token de API (um token não pode criar outro), sem `allowApiTokens`, ou quando a
sessão foi iniciada há mais de 10 minutos (código `sign_in_again`): inicie sessão novamente primeiro. Uma duração acima do máximo responde `400`.

---

## Quando um token termina antes do tempo

Um token, de longa duração ou não, deixa de funcionar antes de expirar quando acontece uma destas situações:

* **Um fim de sessão da sua sessão**: `POST /api/v2/auth/logout` com o token termina os tokens desse início de sessão, e apenas esses. Um
  fim de sessão no navegador não termina o token de um script.
* **Uma alteração da palavra-passe**: o utilizador altera a sua palavra-passe, ou um administrador define-a. Todos os tokens emitidos antes são recusados.
* **O utilizador é removido ou bloqueado**: eliminar um utilizador local, ou bloquear um utilizador, termina todos os seus tokens. Um administrador também pode
  terminar as sessões de um utilizador LDAP ou SSO.

Um token recusado responde `401`. Inicie sessão novamente, com a nova palavra-passe se tiver mudado.

---

## Scripts que iniciam sessão em cada execução

Os endpoints de início de sessão e de token estão protegidos contra inundações de pedidos e adivinhação de palavras-passe, por isso um script que inicia sessão sempre que corre
deve conhecer estes limites:

| Limite | Predefinição | O que acontece |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 pedidos por minuto a partir de um endereço | O início de sessão, o fim de sessão, a renovação, os endpoints de SSO, `PUT /api/v2/profile` (alteração da palavra-passe) e `POST` ou `DELETE /api/v2/profile/tokens` respondem `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 inícios de sessão falhados seguidos | A conta fica bloqueada durante [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), e todos os inícios de sessão respondem `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 inícios de sessão falhados a partir de um endereço | Todos os inícios de sessão a partir desse endereço respondem `429` até a janela terminar |

Um `429` traz um cabeçalho `Retry-After` com os segundos a aguardar: pare e espere, não volte a tentar de imediato. Uma conta bloqueada
recusa até a palavra-passe correta até o bloqueio terminar, por isso um script com uma palavra-passe errada bloqueia o seu utilizador para toda a gente.
Uma palavra-passe atual errada numa alteração de palavra-passe (`PUT /api/v2/profile`) também conta como início de sessão falhado, e uma conta bloqueada
não pode alterar a sua palavra-passe. Um início de sessão bem-sucedido limpa a contagem da conta, e o mesmo acontece quando um administrador define a palavra-passe.

Para se manter longe destes limites, inicie sessão uma vez e reutilize o token, ou use um token de longa duração, em vez de iniciar sessão em
cada chamada. Por trás de um reverse proxy, defina [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) para que o servidor veja
o endereço do cliente, caso contrário todos os clientes contam como um só.

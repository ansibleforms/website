---
layout: default
title: Token de API
parent: O seu perfil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Token de API
{: .no_toc }

Criar um token para scripts e agentes de IA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quem pode criar um

Um token de longa duração permite que os scripts chamem a API sem a sua palavra-passe. A partir da 7.3.0 precisa da opção de função `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Até à 7.2.0, a opção era só `extendedTokenExpiration`. Uma função de antes da 7.3.0 que defina só essa opção recebe
`allowApiTokens`, para manter os seus tokens; com ambas, também se pode criar um token que nunca expira. Ver [Opções de função](../config/roles.html#role-options).

---

## Criar um token

**Novo token**, na linha de título de **Perfil > Tokens de API**, abre um assistente em três passos:

1. **Detalhes**: um nome, para reconhecer o token na lista, e durante quanto tempo se mantém válido. As opções são 30, 90, 180
   ou 365 dias até [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 por predefinição), esse
   próprio máximo, e **Nunca expira** com `extendedTokenExpiration`. Escolha o período mais curto de que o seu script precisa.
2. **Confirmar**: uma conta local ou LDAP introduz a sua palavra-passe, que não é guardada no token. Uma conta Microsoft Entra ID ou
   OIDC não tem aqui palavra-passe: o seu token é criado a partir da sua sessão, que tem de ter iniciado sessão no máximo 10 minutos
   antes, pelo que o fornecedor pode pedir-lhe primeiro que inicie sessão de novo.
3. **Copiar**: o token, mostrado **só uma vez**. Copie-o com **Copiar** e guarde-o com o mesmo cuidado que uma palavra-passe.

Envie o token no cabeçalho `Authorization` de cada chamada à API:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Um token de API não pode criar outro. O token de uma conta SSO leva as funções do seu último início de sessão: uma mudança de grupo no
fornecedor de identidade só lhe chega quando iniciar sessão de novo e criar um novo token.

---

## Os seus tokens

Os tokens que criou são listados com o seu nome e quando cada um foi criado, expira e foi usado pela última vez; **Revogar** no menu de uma linha termina-o.
Um administrador também os vê e revoga na sua página em **Definições > Utilizadores**. Um token termina na sua data de expiração, ou antes:

- **uma revogação**, a partir da lista;
- **um fim de sessão com o token** (`POST /api/v2/auth/logout` com o token no cabeçalho `Authorization`), que o termina juntamente com
  a sessão em que foi criado;
- **uma alteração da palavra-passe**, que termina todos os tokens e sessões da sua conta criados antes dela, e um bloqueio da sua conta.

Um token que nunca expira também termina nestes casos. Um script também pode pedir ele próprio um token através da API de início de sessão e do
seu parâmetro `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, ou `expiryDays=never`); um `expiryDays` mais longo é reduzido
a `API_TOKEN_MAX_DAYS`.

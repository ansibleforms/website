---
layout: default
title: OIDC
parent: Autenticação
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Início de sessão único com um fornecedor OpenID Connect como o Keycloak, com funções a partir de uma claim de grupos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Como funciona

Com um fornecedor OIDC ativado, a página de início de sessão mostra um botão OpenID por baixo de **Iniciar sessão**. Um início de sessão decorre então assim:

1. O botão envia o navegador para `/api/v2/auth/oidc`, que o redireciona para o fornecedor (fluxo de código de autorização
   com PKCE).
2. O utilizador inicia sessão no fornecedor, que redireciona de volta para o **URL de redirecionamento**.
3. O servidor troca o código por tokens e lê as claims do ID token.
4. O nome de utilizador é a claim `preferred_username`, e cada valor da claim `groups` que passa o
   **Filtro de grupos** torna-se um grupo `oidc/<value>`.

O AnsibleForms pede os âmbitos `openid profile email`; os âmbitos não são configuráveis. Terminar sessão no AnsibleForms
envia também o navegador para o endpoint de fim de sessão do fornecedor, quando o fornecedor publica um.

{: .note }
> O OIDC foi testado com o Keycloak. Outros fornecedores funcionam quando cumprem os requisitos abaixo.

---

## Requisitos do fornecedor

O fornecedor tem de oferecer OpenID Connect discovery, e um cliente confidencial para o AnsibleForms:

- **Discovery**: o AnsibleForms lê `<issuer>/.well-known/openid-configuration`, por isso o emissor tem de estar acessível a partir
  do servidor do AnsibleForms, por HTTPS.
- **Um cliente confidencial** com o fluxo de código de autorização, um client ID e um client secret.
- **O URI de redirecionamento** `https://af.example.com/api/v2/auth/oidc/callback`, ou seja, o endereço em que os utilizadores chegam ao
  AnsibleForms seguido de `/api/v2/auth/oidc/callback`. Com [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, passa a ser `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Uma claim `groups` no ID token**, com uma lista de nomes de grupos. Sem ela, o utilizador não recebe grupos OIDC.
- **Uma claim `preferred_username`**, que se torna o nome de utilizador.

---

## Exemplo com Keycloak

Este exemplo usa um realm `example` em `https://keycloak.example.com`; o emissor é então
`https://keycloak.example.com/realms/example`. Nesse realm:

1. Em **Clients**, crie um cliente OpenID Connect com o client ID `ansibleforms`. Ligue **Client authentication**,
   mantenha **Standard flow**, e defina **Valid redirect URIs** como `https://af.example.com/api/v2/auth/oidc/callback`.
2. No separador **Credentials** do cliente, copie o **Client secret**.
3. No separador **Client scopes**, abra `ansibleforms-dedicated` e adicione um mapper **By configuration > Group Membership**,
   com **Token Claim Name** `groups`, **Full group path** desligado e **Add to ID token** ligado.

Com **Full group path** ligado, a claim contém caminhos como `/af-admins`, e a função tem então de usar `oidc//af-admins`.

---

## Adicionar o fornecedor

Adicione o fornecedor em **Acesso > SSO**: um assistente pede os seus campos em quatro passos, com **Open ID** no passo **Tipo**:

| Passo | Campo | Significado |
|---|---|---|
| Detalhes | Nome, Descrição | Um nome único para o fornecedor, e uma descrição opcional |
| Tipo | Fornecedor | **Open ID**; definido na criação, não muda |
| Credenciais | Credencial | Uma credencial **Open ID** de [Ligações > Credenciais](../credentials.html), ver abaixo |
| Grupos | Filtro de grupos | Expressão regular; só ficam os valores da claim `groups` que correspondem. Vazio mantém todos os grupos |

A credencial contém o cliente, por isso só um admin a pode adicionar ou alterar:

| Campo | Significado |
|---|---|
| Emissor | Obrigatório. O URL do emissor, ex. `https://keycloak.example.com/realms/example` |
| Client ID | O client ID no fornecedor, ex. `ansibleforms` |
| Client secret | O client secret, guardado cifrado ou lido de um [cofre de segredos](../secret-stores/) |
| URI de redirecionamento | Tal como registado, ex. `https://af.example.com/api/v2/auth/oidc/callback`. Vazio: o URL da aplicação e o caminho de callback |

Até à 7.2.0, o emissor, o client ID, o secret e o URL de redirecionamento eram campos do fornecedor. A atualização para a 7.3.0 move-os para uma
credencial chamada `<provider>-sso`, consulte [Endereços nas credenciais](../credentials/types.html#addresses-in-credentials).
Escolha uma credencial para cada fornecedor novo: o servidor continua a aceitar um fornecedor com o seu próprio client ID e secret de
antes da 7.3.0, que inicia sessão com eles até ser escolhida uma credencial.

Só um fornecedor OIDC está ativado de cada vez, aquele com que o botão OpenID inicia sessão. **Ativar** no menu da linha de outro,
ou o seu interruptor **Ativado**, desativa os outros do mesmo tipo; a coluna **Ativado** da lista mostra qual está em uso.
Um fornecedor pode também saltar a página de início de sessão, consulte [Alternar o início de sessão único](./#switching-single-sign-on).

Guardar o fornecedor aplica-o de imediato. Quando o emissor não está acessível, o servidor regista
`Failed to initialize OIDC strategy` e os inícios de sessão OIDC falham até o fornecedor ser guardado de novo ou o servidor reiniciar.

---

## Mapeamento para funções

No config.yaml, um grupo OIDC é `oidc/<group>` e um utilizador é `oidc/<preferred_username>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

Os valores correspondem exatamente, incluindo maiúsculas e minúsculas. Consulte [Funções](../config/roles.html) para as opções de função.

---

## Limitações

Os utilizadores OIDC iniciam sessão no fornecedor, por isso algumas coisas funcionam de forma diferente das contas locais e LDAP:

- Não têm palavra-passe no AnsibleForms, por isso não a podem alterar lá; a partir da 7.2.0 um [token de API](../profile/api-token.html)
  é criado a partir da sua sessão.
- Mantenha curta a claim `groups`: envie só os grupos que interessam ao AnsibleForms, por exemplo com um client scope
  dedicado ou uma estrutura de grupos no fornecedor, ou filtre-os com o **Filtro de grupos**. A partir da 7.1.0 o token de
  início de sessão do AnsibleForms deixou de transportar os grupos; antes, um utilizador em cem grupos ou mais podia não ver nenhum formulário, consulte
  [Formulários e tarefas vazios depois de um início de sessão único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---
layout: default
title: Entra ID
parent: Autenticação
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Início de sessão único com o Microsoft Entra ID (Azure AD), com funções a partir dos grupos do Entra ID do utilizador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Como funciona

Com um fornecedor Entra ID ativado, a página de início de sessão mostra um botão Entra ID por baixo de **Iniciar sessão**. Um início de sessão decorre então assim:

1. O botão envia o navegador para `/api/v2/auth/entraid`, que o redireciona para a Microsoft.
2. O utilizador inicia sessão na Microsoft, que redireciona de volta para o **URL de redirecionamento** com um código de autorização. O servidor
   troca esse código com a Microsoft pelo ID token e por um access token para o Microsoft Graph.
3. O servidor lê os grupos do utilizador no Microsoft Graph (`/v1.0/me/transitiveMemberOf`), por isso os grupos aninhados também contam.
4. Os grupos são filtrados com o **Filtro de grupos** pelo seu nome de apresentação, e cada grupo que fica é guardado duas vezes,
   como `azuread/<object id>` e como `azuread/<display name>`.

O nome de utilizador é a claim `upn` do token, ex. `jdoe@example.com`, ou a claim `preferred_username` quando o token
não tem `upn`; numa conta profissional ambas contêm o mesmo valor.

---

## Registar a aplicação

O AnsibleForms precisa de um registo de aplicação no Entra admin center, em **App registrations > New registration**:

1. Dê-lhe um nome, escolha **Accounts in this organizational directory only** como tipos de conta suportados e adicione um
   URI de redirecionamento do tipo **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. Em **Certificates & secrets**, crie um client secret e copie o seu valor; só é mostrado uma vez.
3. Em **API permissions**, adicione as permissões **delegated** do Microsoft Graph `User.Read` e `GroupMember.Read.All`,
   e conceda-lhes o consentimento de administrador.
4. Na página **Overview**, anote o **Application (client) ID** e o **Directory (tenant) ID**.

O URI de redirecionamento é o endereço em que os utilizadores chegam ao AnsibleForms, seguido de `/api/v2/auth/entraid/callback`.
Com [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, passa a ser
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Tem de corresponder exatamente ao **URI de redirecionamento** da
credencial do fornecedor.

Até à 7.2.0 o caminho era `/api/v2/auth/azureadoauth2/callback`. Continua a funcionar a partir da 7.3.0, por isso um registo existente
não precisa de alterações; uma credencial com o **URI de redirecionamento** vazio usa o novo caminho, por isso adicione-o então ao registo.

O AnsibleForms lê os grupos do Graph e não usa uma claim de grupos no token, por isso não é preciso configurar nenhuma claim de grupos
no registo.

---

## Adicionar o fornecedor

Adicione o fornecedor em **Acesso > SSO**: um assistente pede os seus campos em quatro passos, com **Microsoft Entra ID** no passo **Tipo**:

| Passo | Campo | Significado |
|---|---|---|
| Detalhes | Nome, Descrição | Um nome único para o fornecedor, e uma descrição opcional |
| Tipo | Fornecedor | **Microsoft Entra ID**; definido na criação, não muda |
| Credenciais | Credencial | Uma credencial **Microsoft Entra ID** de [Ligações > Credenciais](../credentials.html), ver abaixo |
| Grupos | Filtro de grupos | Expressão regular; só ficam os grupos cujo nome de apresentação corresponde. Vazio mantém todos os grupos |

A credencial contém o registo da aplicação, por isso só um admin a pode adicionar ou alterar:

| Campo | Significado |
|---|---|
| Tenant ID | Obrigatório. O Directory (tenant) ID, um GUID, ou um dos domínios do tenant. Só os utilizadores desse tenant podem iniciar sessão |
| Client ID | O Application (client) ID |
| Client secret | O valor do client secret, guardado cifrado ou lido de um [cofre de segredos](../secret-stores/) |
| URI de redirecionamento | Tal como registado, ex. `https://af.example.com/api/v2/auth/entraid/callback`. Vazio: o URL da aplicação e o caminho de callback |

Uma credencial com o tenant ID vazio é recusada ao ser guardada. Os endpoints multi-tenant `common`, `organizations`
e `consumers` são recusados quando se guarda o fornecedor que nomeia a credencial, porque deixariam iniciar sessão utilizadores de qualquer
tenant da Microsoft. No início de sessão, o servidor verifica também que o token vem do tenant configurado. Um fornecedor
guardado anteriormente sem tenant ID não deixa ninguém iniciar sessão: até o tenant ID ser preenchido, o servidor regista
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Até à 7.2.0, o tenant, o client ID, o secret e o URL de redirecionamento eram campos do fornecedor. A atualização para a 7.3.0 move-os para uma
credencial chamada `<provider>-sso`, consulte [Endereços nas credenciais](../credentials/types.html#addresses-in-credentials).
Escolha uma credencial para cada fornecedor novo: o servidor continua a aceitar um fornecedor com o seu próprio client ID e secret de
antes da 7.3.0, que inicia sessão com eles até ser escolhida uma credencial.

Só um fornecedor Entra ID está ativado de cada vez, aquele com que o botão Entra ID inicia sessão. **Ativar** no menu da linha de outro,
ou o seu interruptor **Ativado**, desativa os outros do mesmo tipo; a coluna **Ativado** da lista mostra qual está em uso. Um fornecedor
pode também saltar a página de início de sessão, consulte [Alternar o início de sessão único](./#switching-single-sign-on). Guardar aplica-o de imediato, sem reiniciar.

---

## Mapeamento para funções

No config.yaml, um grupo do Entra ID é `entraid/<object id>` ou `entraid/<display name>`, e um utilizador é `entraid/<upn>`.
O object id é único no tenant, por isso é a escolha mais segura; um nome de apresentação é mais fácil de ler:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Até à 7.2.0 o prefixo era `azuread/`. Numa função continua a corresponder aos mesmos membros a partir da 7.3.0 e será removido na 8.0; o
editor de funções escreve `entraid/`. Só as funções aceitam `entraid/`: os grupos do utilizador são guardados como `azuread/<object id>` e
`azuread/<display name>`, e a página de perfil e o extravar `ansibleforms_user` mostram-nos assim. Um **Filtro de grupos** como `^AF-` mantém só os grupos que as suas funções usam; consulte [Funções](../config/roles.html). A partir da 7.1.0
o token de início de sessão deixou de transportar os grupos, por isso o seu tamanho já não cresce com eles. O filtro continua a ser importante para
utilizadores em muitos grupos: em cada início de sessão são comparados menos grupos com as funções, e o
[registo de diretório](../users-and-groups/directory.html) do utilizador lista só os grupos que contam. Antes da 7.1.0,
um utilizador em cem grupos ou mais precisa dele para ver qualquer formulário, consulte
[Formulários e tarefas vazios depois de um início de sessão único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpoint do Microsoft Graph

O servidor inicia a sessão dos utilizadores em `https://login.microsoftonline.com` e chama o Microsoft Graph em `https://graph.microsoft.com` por predefinição:

| Variável | O que altera |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | A autoridade de início de sessão, para uma cloud nacional como `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | O endpoint do Graph de onde são lidos os grupos, como `https://graph.microsoft.us` |

Ambas recebem um URI base sem barra final, e são novas na 7.3.0. `AZURE_AUTHORITY_URI` e `AZURE_GRAPH_URI` continuam a ser lidas
quando aquelas não estão definidas, com um aviso no registo, e serão removidas na 8.0. O servidor tem de chegar ao Graph: um início de sessão falha quando os grupos não podem ser lidos.

---

## Limitações

Os utilizadores do Entra ID iniciam sessão com a Microsoft, por isso algumas coisas funcionam de forma diferente das contas locais e LDAP:

- Não têm palavra-passe no AnsibleForms, por isso não a podem alterar lá; um [token de API](../profile/api-token.html) é criado a partir da sua sessão.
- Os nomes de apresentação não são únicos no Entra ID: dois grupos com o mesmo nome correspondem à mesma função. Nomeie o grupo pelo seu
  object id na função, `entraid/<object id>`, para corresponder só a esse grupo.

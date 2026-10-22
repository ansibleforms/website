---
layout: default
title: Autenticação
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Autenticação
{: .no_toc }

Escolha como os utilizadores iniciam sessão, e como a sua conta e os seus grupos levam a funções
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Métodos de início de sessão

O AnsibleForms suporta quatro métodos de início de sessão, e vários podem estar ativos ao mesmo tempo:

| Método | Quando usar | Página |
|---|---|---|
| Contas locais | O admin integrado, contas de serviço, equipas pequenas, ou uma alternativa quando o diretório está em baixo. | [Contas locais](local.html) |
| LDAP | Os utilizadores e grupos vivem no Active Directory, no OpenLDAP ou noutro diretório LDAP. | [LDAP](ldap.html) |
| Entra ID | Os utilizadores iniciam sessão com a sua conta Microsoft 365 / Entra ID (início de sessão único). | [Entra ID](entra-id.html) |
| OIDC | Início de sessão único através de outro fornecedor OpenID Connect, como o Keycloak. | [OIDC](oidc.html) |

As contas locais e o LDAP configuram-se em **Acesso > Utilizadores**, **Grupos** e **LDAP**; o Entra ID e o OIDC em
**Acesso > SSO**.

---

## Como um início de sessão escolhe o método

A página de início de sessão tem um formulário de nome de utilizador e palavra-passe, mais um botão por cada fornecedor de início de sessão único ativado:

- **O nome de utilizador e a palavra-passe** são verificados primeiro contra os utilizadores locais. Só quando nenhum utilizador local tem esse nome, e o LDAP
  está ativado, se tenta o diretório. Um utilizador local com uma palavra-passe errada é recusado sem consultar o LDAP.
- **Os botões Entra ID e OpenID** aparecem por baixo de **Iniciar sessão** quando um fornecedor desse tipo está ativado. Enviam o navegador para
  o fornecedor e de volta; nenhuma palavra-passe chega ao AnsibleForms.

Só um fornecedor Entra ID e um fornecedor OIDC estão ativados de cada vez: ativar um desativa os outros do mesmo tipo.
Um início de sessão falhado com nome de utilizador e palavra-passe mostra sempre a mesma mensagem genérica; o motivo está no registo do servidor e no registo de auditoria.

---

## Alternar o início de sessão único

A partir da 7.3.0, cada fornecedor em **Acesso > SSO** tem dois interruptores próprios, que se aplicam sem reiniciar:

| Interruptor | Efeito |
|---|---|
| **Ativado** | Mostra o botão do fornecedor na página de início de sessão e aceita o seu início de sessão. Ligá-lo desliga os outros fornecedores do mesmo tipo. |
| **Saltar a página de início de sessão** | Os utilizadores vão diretamente para este fornecedor, sem a página de início de sessão, enquanto o fornecedor estiver ativado. Ligá-lo num fornecedor desliga-o nos outros; fica a cinzento num fornecedor desativado. |

O formulário de nome de utilizador e palavra-passe continua acessível em `/login?local`, para o admin local ou quando o fornecedor falha,
e é mostrado depois de terminar sessão e quando um início de sessão único volta com um erro.

As variáveis `ENABLE_SSO` e `SSO_AUTO_LOGIN` foram removidas na 7.3.0. O primeiro arranque da 7.3.0 lê-as uma vez, e
regista um aviso em cada arranque enquanto continuarem definidas, por isso remova-as do ambiente depois da atualização:

| Variável antes da 7.3.0 | O que faz a atualização |
|---|---|
| `ENABLE_SSO=0` | Desativa todos os fornecedores: os fornecedores continuam configurados, sem botão na página de início de sessão |
| `SSO_AUTO_LOGIN=1` | Liga **Saltar a página de início de sessão** no fornecedor ativado, quando há exatamente um ativado e `ENABLE_SSO` não é `0` |

---

## Do utilizador às funções

Cada início de sessão produz um utilizador com um **tipo** (`local`, `ldap`, `azuread` ou `oidc`), um nome de utilizador e uma lista de grupos.
Cada grupo recebe o prefixo do seu tipo, por isso um grupo do Entra ID é guardado e mostrado como `azuread/...`:

| Método de início de sessão | Nome de utilizador | Grupos |
|---|---|---|
| Local | o nome de utilizador local | `local/<group>`, um por cada grupo local do utilizador |
| LDAP, diretório `main` | o valor do Atributo do nome de utilizador | `ldap/<cn>`, o CN de cada grupo que o diretório devolve |
| LDAP, outro diretório | `<directory>/<username>` | `ldap/<directory>/<cn>`, consulte [Vários diretórios](ldap.html#several-directories) |
| Entra ID | a claim `upn`, ou `preferred_username` quando o token não tem `upn` | `azuread/<object id>` e `azuread/<display name>` de cada grupo, lidos do Microsoft Graph |
| OIDC | a claim `preferred_username` | `oidc/<name>`, da claim `groups` do ID token |

As [funções](../config/roles.html) no config.yaml correspondem depois a estes valores: uma função aplica-se quando um dos seus `groups` é um
dos grupos do utilizador, ou quando os seus `users` contêm `<type>/<username>`. Todos os utilizadores recebem também a função `default`. A partir da 7.3.0, uma
função nomeia um membro do Entra ID como `entraid/<group>` ou `entraid/<upn>`, que corresponde ao valor `azuread/` guardado; `azuread/`
numa função continua a funcionar e será removido na 8.0. O perfil e os extravars da tarefa continuam a mostrar `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

A página de **perfil** de um utilizador lista o tipo de início de sessão, os grupos e as funções, que é a forma mais rápida de verificar um mapeamento.
A opção de função `allowLogin` pode recusar o início de sessão de utilizadores que não correspondem a nenhuma função: defina-a como `false` em `default` e como
`true` nas funções que podem iniciar sessão.

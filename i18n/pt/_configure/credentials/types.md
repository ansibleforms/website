---
layout: default
title: Tipos de credencial
parent: Credenciais
nav_order: 1
translated_from: 1f21f8fc1ae73953922d8c9f21de6db05b3b1a87
---

# Tipos de credencial
{: .no_toc }

O que cada tipo contém, e onde pode ser escolhido
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Os tipos

O tipo diz para que serve uma credencial. Decide que campos a caixa de diálogo pede, e onde pode ser escolhida:

| Tipo | O que contém | Usado por |
|---|---|---|
| Utilizador e palavra-passe | Um utilizador e uma palavra-passe para qualquer acesso: uma API REST com basic auth, um serviço e mais. A predefinição | Playbooks, através das `credentials` de um formulário ou de um campo de credencial; [expressões REST](../expressions/credentials.html) |
| SSH | Um utilizador e uma palavra-passe para SSH a um servidor, com o seu host e porta | Playbooks, através das `credentials` ou `ansibleCredentials` de um formulário ou de um campo de credencial, e o acesso de um nó de workflow |
| Git | Um utilizador e uma palavra-passe ou um token para repositórios git | [Repositórios](../repositories/authentication.html) |
| API | Um utilizador e uma palavra-passe ou um token para uma API REST | [Expressões REST](../expressions/credentials.html), o token de um bot do Telegram, o bearer token de um webhook, a chave de API do assistente de chat |
| Base de dados | Um acesso a uma base de dados, com o seu tipo, host, porta e nome da base de dados | Consultas de formulários (`dbConfig`) e `fnCredentials`; pode ser testado |
| CyberArk | O endereço do CyberArk Central Credential Provider (CCP) e o seu TLS, e o AppID, o certificado de cliente e a chave com que um cofre CyberArk inicia sessão | Um cofre de segredos [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Um servidor de correio, a sua porta e TLS, e o seu acesso (nenhum para um relay) | Um [canal de notificação](../notification-channels.html) de correio |
| LDAP | Os servidores, a porta, o TLS e os certificados de um diretório, e o seu bind DN e palavra-passe | Um [diretório LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | O registo de aplicação de um fornecedor: o seu tenant ID, client ID, client secret e URI de redirecionamento | Um [fornecedor Entra ID](../authentication/entra-id.html) |
| Open ID | O cliente de um fornecedor: o seu emissor, client ID, client secret e URI de redirecionamento | Um [fornecedor OIDC](../authentication/oidc.html) |
| RTE | O token (`RTE_TOKEN`) e o endereço de um RTE | Um [runner](../runners.html) RTE |
| AWX, AAP, Ascender | O token ou o acesso, e o endereço, dessa plataforma | Um runner desse tipo |
| Semaphore, Rundeck | O token de API e o endereço desse produto | Um runner desse tipo |
| Jenkins | Um utilizador, o seu token de API e o endereço de um Jenkins | Um runner Jenkins |
| HashiCorp Vault | O token e o endereço com que um cofre Vault inicia sessão | Um cofre de segredos [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Uma credencial de base de dados pode ser do tipo MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB.

Na API e no [config seed](../seed/), os tipos são `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` e `vault`. A atualização a partir da 6
dá a todas as credenciais o tipo `userpass`, ou `database` para uma de base de dados: um formulário usa-a como na 6. Altere-o para SSH num
acesso com que se liga o playbook de um nó de workflow, ou para API numa API REST.

---

## Endereços nas credenciais

A partir da 7.3.0, um acesso que funciona num servidor transporta esse servidor, por isso o registo que o usa só nomeia a credencial:

| Registo | O que passou para a sua credencial |
|---|---|
| Um diretório LDAP | Os seus servidores, porta, TLS, certificados e conta de bind, para uma credencial `ldap` chamada `<directory>-ldap` |
| Um fornecedor SSO | O seu client ID e secret, tenant ou emissor, e URI de redirecionamento, para uma credencial `entraid` ou `oidc` chamada `<provider>-sso` |
| Um runner | O seu endereço e TLS, e o seu token ou acesso, para uma credencial do seu tipo, `<runner>-token` ou `<runner>-login` |
| Um cofre de segredos | O seu endereço e TLS, e o seu token (`<store>-token`) ou o AppID e o certificado do CyberArk (`<store>-appid`) |
| Um canal de correio | O seu servidor, porta e TLS, para a sua credencial `smtp`, ou uma nova chamada `<channel>-smtp` |

A atualização para a 7.3.0 faz estas mudanças uma vez. Um registo que já nomeava uma credencial mantém-na, e recebe uma cópia dela quando
outro registo usava o mesmo acesso com outro servidor. Os registos declarados no [config seed](../seed/) ficam como o seed os tem.
As credenciais das ligações e dos inícios de sessão só podem ser alteradas por um admin, consulte [Quem pode alterar uma credencial](../credentials.html#who-may-change-a-credential).

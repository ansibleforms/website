---
layout: default
title: Tipos de credencial
parent: Credenciais
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
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
| Utilizador e palavra-passe | Um utilizador e uma palavra-passe para qualquer acesso: uma API REST com basic auth, um serviço e mais, com um host e uma porta opcionais. A predefinição | Playbooks, através das `credentials` de um formulário ou de um campo de credencial; [expressões REST](../expressions/credentials.html) |
| SSH | Um utilizador com uma palavra-passe ou uma chave privada para SSH a um servidor, com o seu host e porta | Playbooks, através das `credentials` ou `ansibleCredentials` de um formulário ou de um campo de credencial, e o acesso de um nó de workflow |
| Git | Um token, ou um utilizador e uma palavra-passe, para repositórios git | [Repositórios](../repositories/authentication.html) |
| API | Um utilizador e uma palavra-passe ou um token para uma API REST, com um host e uma porta opcionais | [Expressões REST](../expressions/credentials.html), o token de um bot do Telegram, o bearer token de um webhook, a chave de API do assistente de chat |
| Base de dados | Um acesso a uma base de dados, com o seu tipo, host, porta e nome da base de dados | Uma [base de dados](../databases.html) que os formulários consultam (`dbConfig`), a partir da 7.5.0, ou diretamente o `dbConfig` de um formulário; `fnCredentials`; pode ser testado |
| CyberArk | O endereço do CyberArk Central Credential Provider (CCP) e o seu TLS, e o AppID, o certificado de cliente e a chave com que um cofre CyberArk inicia sessão | Um cofre de segredos [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Um servidor de correio, a sua porta e TLS, e o seu acesso opcional (nenhum para um relay) | Um [canal de notificação](../notification-channels.html) de correio |
| LDAP | Os servidores, a porta, o TLS e os certificados de um diretório, e o seu bind DN e palavra-passe | Um [diretório LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Um registo de aplicação: o seu tenant ID, client ID, client secret ou certificado, e URI de redirecionamento | Um [fornecedor Entra ID](../authentication/entra-id.html); um canal de correio que envia através do [Microsoft 365](../notification-channels/microsoft-365.html) |
| Open ID | O cliente de um fornecedor: o seu emissor, client ID, client secret e URI de redirecionamento | Um [fornecedor OIDC](../authentication/oidc.html) |
| RTE | O token (`RTE_TOKEN`) e o endereço de um RTE | Um [runner](../runners.html) RTE |
| AWX, AAP, Ascender | O token ou o acesso, e o endereço, dessa plataforma | Um runner desse tipo |
| Semaphore, Rundeck | O token de API e o endereço desse produto | Um runner desse tipo |
| Jenkins | Um utilizador, o seu token de API e o endereço de um Jenkins | Um runner Jenkins |
| HashiCorp Vault | O token e o endereço com que um cofre Vault inicia sessão | Um cofre de segredos [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Uma credencial de base de dados pode ser do tipo MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB. A partir da 7.5.0 é escolhida por uma base de
dados de [Ligações > Bases de dados](../databases.html), e a atualização para a 7.5.0 cria uma base de dados para cada uma, com o mesmo nome.

Na API e no [config seed](../seed/), os tipos são `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` e `vault`. A atualização a partir da 6
dá a todas as credenciais o tipo `userpass`, ou `database` para uma de base de dados: um formulário usa-a como na 6. Altere-o para SSH num
acesso com que se liga o playbook de um nó de workflow, ou para API numa API REST.

---

## Como uma credencial inicia sessão

A partir da 7.6.0, o passo **Acesso** destes tipos pergunta primeiro como a credencial inicia sessão, e mostra só os campos dessa escolha:

| Tipo | Escolha | Campos |
|---|---|---|
| SSH | **Iniciar sessão com**: **Palavra-passe** ou **Chave privada** | Palavra-passe: o utilizador e a sua palavra-passe. Chave privada: o utilizador, a **Chave privada** PEM ou OpenSSH e uma **Frase-passe** opcional |
| AWX, AAP, Ascender | **Iniciar sessão com**: **Token** ou **Palavra-passe** | Token: o **Token**, sem utilizador. Palavra-passe: o utilizador e a sua palavra-passe |
| Git | **Iniciar sessão com**: **Token** ou **Palavra-passe** | Token: o **Token**, sem utilizador (o git envia então o utilizador `oauth2`). Palavra-passe: o utilizador e a sua palavra-passe |
| SMTP | **Iniciar sessão com**: **Sem autenticação** ou **Autenticação** | Sem autenticação, para um relay: só o **Servidor de correio**, a **Porta de correio** e **Usar TLS**. Autenticação: esses, mais o utilizador e a sua palavra-passe |
| Microsoft Entra ID | **Iniciar sessão com**: **Segredo** ou **Certificado** | Segredo: o **Client secret**. Certificado: o **Certificado** PEM e a sua chave privada, só para correio através do Microsoft 365 |

Uma credencial guarda só o que a sua escolha precisa: uma SSH nunca tem ao mesmo tempo uma palavra-passe e uma chave, a outra é removida ao
guardar. Com **Escrever numa chave** no passo **Armazenamento**, só são oferecidas as escolhas com palavra-passe, não **Chave privada**,
**Sem autenticação** nem **Certificado**.

Os outros tipos iniciam sessão de uma só forma. Uma credencial Utilizador e palavra-passe ou API tem o interruptor **Adicionar um host e
uma porta** depois da palavra-passe, consulte [Host e porta de um acesso](#host-and-port-of-a-login). A caixa de diálogo chama à palavra-passe
de bind do LDAP **Palavra-passe**, ao token do RTE **Token**, e ao tipo de uma base de dados **Motor**.

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

---

## Host e porta de um acesso

A partir da 7.6.0, uma credencial Utilizador e palavra-passe ou API também pode ter um **Host** e uma **Porta**, ambos opcionais:
no seu passo **Acesso**, o interruptor **Adicionar um host e uma porta** depois da palavra-passe mostra-os.

Chegam ao playbook e às expressões com a credencial, como `host` e `port`, ao lado de `user` e `password`: através das
`credentials` de um formulário e de [`fn.fnCredentials`](../expressions/credentials.html). Uma credencial lida de um cofre de segredos
mantém o seu próprio host e porta, e só usa os do segredo onde os deixa vazios. As credenciais SSH e de base de dados sempre os tiveram.

---

## A chave privada de uma credencial SSH

A partir da 7.6.0, uma credencial SSH pode iniciar sessão com uma chave privada em vez da sua palavra-passe: **Iniciar sessão com**
definido como **Chave privada** pede estes campos:

| Campo | Significado |
|---|---|
| Chave privada | A chave privada PEM ou OpenSSH com que o playbook inicia sessão. Guardada cifrada, nunca mais mostrada: deixada vazia, a guardada mantém-se. |
| Frase-passe | A frase-passe da chave, se tiver uma. Guardada cifrada. |

Inicia sessão com uma ou com a outra, nunca com as duas: ao guardar, uma chave remove a palavra-passe guardada, e **Palavra-passe** remove a
chave e a frase-passe guardadas, como diz a página da credencial. A chave e a sua frase-passe nunca são devolvidas pela API, e são
mascaradas na saída da tarefa.

Quando um formulário nomeia a credencial em `ansibleCredentials`, o RTE escreve a chave num ficheiro temporário privado (numa pasta
própria, legível só pelo seu utilizador) e passa-a ao playbook como `ansible_ssh_private_key_file`. Uma chave com frase-passe é carregada
num `ssh-agent` iniciado só para essa tarefa, e o ficheiro é removido assim que é carregada. O ficheiro e o agente desaparecem quando a
tarefa termina, incluindo as que falham ou são abortadas, por isso nenhuma chave fica para trás no RTE.

As imagens do RTE têm `ssh-agent` e `ssh-add`; um RTE próprio sem eles faz falhar uma tarefa cuja chave tem frase-passe, e di-lo.

As `credentials` de um formulário que nomeiam uma credencial SSH entregam a chave ao playbook como `private_key`, e a sua frase-passe como
`private_key_passphrase`. No [config seed](../seed/), a chave é o `client_key` da credencial e a sua frase-passe `key_passphrase`.

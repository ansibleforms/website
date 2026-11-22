---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
---

# Config seed
{: .no_toc }

Declare os objetos de administração num ficheiro
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores que fazem o aprovisionamento a partir do git: declare os objetos de administração num ficheiro, para que uma instância possa ser reconstruída sobre uma base de dados vazia.

---

## O que abrange

Defina `CONFIG_SEED_PATH` com um ficheiro YAML, e o AnsibleForms aplica-o no arranque. O ficheiro declara objetos e definições que,
de outra forma, só existem na base de dados:

| Secção             | O que declara                                                                     |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Onde as tarefas correm: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins    |
| `secret_stores`    | Cofres de segredos (HashiCorp Vault, ...)                                         |
| `credentials`      | Credenciais                                                                       |
| `databases`        | As bases de dados que os formulários consultam, cada uma com a sua credencial, a partir da 7.5.0 |
| `sso`              | Fornecedores SSO: Entra ID e OIDC (`oauth2` antes da 7.8.0)                       |
| `repositories`     | Repositórios git, e o que a aplicação lê de cada um                               |
| `syslog`           | Os servidores syslog que recebem o registo do servidor e as entradas de auditoria (`syslog_servers` antes da 7.8.0) |
| `notifications`    | Servidores de correio, Slack, Teams, Telegram e webhooks (`notification_channels` antes da 7.8.0) |
| `labels`           | As etiquetas ao lado do logótipo do cabeçalho, a partir da 7.3.0                  |
| `ldap`             | A configuração LDAP                                                               |
| `settings`         | O URL público; as suas chaves de email estão obsoletas desde a 7.6.0, a favor de um canal de email |
| `chat_assistant`   | O fornecedor de modelo do assistente de chat (`chat` antes da 7.8.0)              |
| `users`            | Utilizadores, locais e de um diretório, desde a 7.8.0                             |
| `groups`           | Grupos locais e os seus membros, desde a 7.8.0                                    |
| `defaults`         | **Definições > Aparência > Predefinições**: tema, idioma, fuso horário, desde a 7.8.0 |
| `logo`, `icon`     | O logótipo e o ícone do site, ficheiros de imagem ao lado do seed, desde a 7.8.0  |
| `name`             | O nome da aplicação, desde a 7.8.0                                                |
| `links`            | As ligações do cabeçalho, e se a ligação do Designer aparece, desde a 7.8.0       |
| `announcements`    | Os anúncios por baixo do cabeçalho, desde a 7.8.0                                 |
| `disclaimer`       | As versões do aviso legal que os utilizadores aceitam, desde a 7.8.0              |
| `mcp`              | Os interruptores do servidor MCP, desde a 7.8.0                                   |
| `ssh`              | A chave privada SSH da aplicação e os seus hosts conhecidos, desde a 7.8.0        |
| `awx`              | Obsoleta desde a 7, removida na 8: use `runners` com `type: awx`                  |

O [Exemplo](example.html) mostra todas as secções, e [Objetos geridos](managed-objects.html) até onde o seed é dono do que cada uma
declara: a maioria das secções torna os seus objetos só de leitura na aplicação, algumas apenas os criam ou alteram.

Um seed escrito antes da 7 continua a funcionar: cada item da sua secção `awx` é aplicado como um runner do tipo `awx`, e o registo
avisa em cada aplicação. Mova esses itens para `runners` com `type: awx` antes de atualizar para a 8.

O seed **não** é o mesmo que o `config.yaml` (`CONFIG_PATH`), a configuração base das categorias, funções e constantes. Um
repositório pode contê-las em vez disso, e esse repositório é um dos objetos que o seed declara, por isso o seed não pode viver dentro dele.

O primeiro admin continua a vir de `ADMIN_USERNAME` / `ADMIN_PASSWORD`, e os utilizadores do LDAP ou do SSO do seu diretório no início de sessão.
Desde a 7.8.0, as secções `users` e `groups` podem acrescentar utilizadores e grupos locais, e bloquear um utilizador de diretório antes de iniciar sessão.

---

## Secções renomeadas

Desde a 7.8.0, quatro secções têm o nome das chaves sob as quais um [repositório git](../repositories/) contém os mesmos objetos, sem
`controller_` (`sso:` para `controller_sso:`):

| Antes da 7.8.0            | Desde a 7.8.0      |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Os seus itens não mudam. Os nomes antigos continuam a ser lidos, obsoletos desde a 7.8.0 e removidos na 8: cada um aplicado regista um
aviso no registo do servidor, com o nome novo. Um seed que dá uma secção com os dois nomes é recusado. Renomeie-as no
ficheiro antes de atualizar para a 8.

---

## Nesta secção

Cada tema tem uma página própria:

| Página | O que abrange |
|---|---|
| [Exemplo](example.html) | Um ficheiro de seed completo, secção a secção |
| [Objetos geridos](managed-objects.html) | Como o seed é dono dos objetos que lista, e como mantém os segredos de fora |
| [Recarregamento e arranque](reloading.html) | Alterar o ficheiro sem reiniciar, e o que acontece no arranque |
| [Kubernetes](kubernetes.html) | Aprovisionar o AnsibleForms a partir de um ConfigMap e de Secrets |
| [Edição e auditoria](environment-and-audit.html) | Bloquear as páginas de definições, e o que o registo de auditoria regista |

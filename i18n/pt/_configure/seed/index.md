---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
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

Defina `CONFIG_SEED_PATH` com um ficheiro YAML, e o AnsibleForms aplica-o no arranque. O ficheiro
declara objetos que antes só existiam na base de dados:

| Secção                  | O que declara                                                       |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Onde as tarefas correm: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Cofres de segredos (HashiCorp Vault, ...)                           |
| `credentials`           | Credenciais                                                         |
| `oauth2`                | Fornecedores SSO: Entra ID e OIDC                                   |
| `repositories`          | Repositórios git                                                    |
| `syslog_servers`        | Os servidores syslog que recebem o registo do servidor e as entradas de auditoria |
| `notification_channels` | Servidores de correio, Slack, Teams, Telegram e webhooks para as notificações |
| `labels`                | As etiquetas ao lado do logótipo do cabeçalho, a partir da 7.3.0    |
| `ldap`                  | A configuração LDAP                                                 |
| `settings`              | O URL público, e as definições de email usadas quando nenhum canal de email está ativo |
| `chat`                  | O fornecedor de modelo do assistente de chat                        |
| `awx`                   | Obsoleta desde a 7, removida na 8: use `runners` com `type: awx`    |

Um seed escrito antes da 7 continua a funcionar: cada item da sua secção `awx` é aplicado como um runner do tipo `awx`, e o registo
avisa em cada aplicação. Mova esses itens para `runners` com `type: awx` antes de atualizar para a 8.

O seed **não** é o mesmo que o `config.yaml`, que contém as categorias, funções e constantes
e tem o seu próprio `CONFIG_PATH`. Os dois são mantidos separados de propósito: o
repositório que *contém* o `config.yaml` é um dos objetos que o seed declara, por isso o seed
não pode viver dentro dele.

Os utilizadores e os grupos ficam de fora: vêm do LDAP ou do SSO, e o primeiro admin de `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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

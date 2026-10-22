---
layout: default
title: Administração
parent: Visita à interface
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administração
{: .no_toc }

O menu Definições: o sistema, a sua aparência, o acesso, as ligações e os registos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O menu Definições

**Definições** no cabeçalho abre as páginas de administração, agrupadas no menu da esquerda em **Sistema**, **Aparência**,
**Acesso**, **Ligações** e **Registos**. Cada entrada só aparece a um utilizador com a opção de função de que a sua página precisa:
`allowBackupOps` para **Cópias de segurança**, `showLogs` para **Registo do servidor** e `showSettings` para todas as outras páginas.
A partir da 7.3.0, três opções abrem uma parte delas sem o resto:

| Opção de função | Abre |
|---|---|
| `showAppearanceSettings` | As páginas de **Aparência** |
| `showConnectionsSettings` | As páginas de **Ligações**, exceto **Syslog**; os repositórios, os cofres de segredos e as credenciais protegidas continuam a ser alterados apenas por um administrador |
| `showAuditLog` | O **Registo de auditoria** |

Consulte [Funções](../config/roles.html#role-options) para as opções de função.

---

## Listas e páginas de registo

A partir da 7.3.0, as listas das definições e as páginas de registo partilham uma única disposição, com os seus controlos numa linha própria por baixo do título:

| Parte | Como funciona |
|---|---|
| Caixa de pesquisa | A primeira dessa linha em todas as páginas de definições e de registo. Uma palavra restringe todos os separadores de uma vez: os campos, as linhas ou as entradas correspondentes aparecem sob o nome do seu separador |
| Tamanho da página | Uma tabela mostra tantas linhas quantas cabem no ecrã até ser escolhido um tamanho de página: 10, 20, 50 ou 100 |
| Colunas | Todas as colunas com nome permitem ordenar, e uma célula vazia mostra `–` |
| Caixas de verificação | As linhas só as têm quando há algo a fazer com as linhas marcadas, e o menu da linha (⋮) oferece a mesma ação |
| Menu da linha | Etiquetas curtas, como **Editar** e **Eliminar**. Uma lista com uma coluna **Ativado** tem-na em primeiro lugar, e oferece **Ativar** ou **Desativar** no menu de cada linha, consoante o caso |

As listas com uma coluna **Ativado** são os fornecedores de SSO, os diretórios LDAP, os runners, os agendamentos, os canais de
notificação, os servidores syslog, os anúncios, as etiquetas e as versões do aviso legal.

---

## Sistema

A própria instância: as suas definições, a sua saúde e as suas cópias de segurança.

| Página | Para que serve |
|---|---|
| **Geral** | As variáveis de ambiente, em separadores de Configuração a Registo. Consulte [Variáveis de ambiente](../customization/). |
| **Estado** | A saúde da instância e dos sistemas de que depende, nos separadores Verificações e Informação. Consulte [Monitorização](../production/monitoring.html). |
| **Cópias de segurança** | Fazer, restaurar e eliminar cópias de segurança da base de dados, do config.yaml e dos formulários. Consulte [Cópias de segurança](../production/backups.html). |

![Definições > Geral, o separador Configuração](../assets/screenshots/settings.jpg)

### Cópias de segurança

A lista de cópias de segurança, noturnas e manuais: **Adicionar cópia de segurança** faz uma agora, e o menu de uma linha tem **Mostrar cópia de segurança**, **Restaurar** e **Eliminar**.

![Definições > Cópias de segurança](../assets/screenshots/backups.jpg)

### Restaurar

**Restaurar** mostra o que a cópia de segurança contém e depois restaura-a; **Criar uma nova cópia de segurança antes de restaurar (recomendado)** está marcado por predefinição.

![Restaurar uma cópia de segurança](../assets/screenshots/restore.jpg)

---

## Aparência

O aspeto da instância para toda a gente, e as mensagens que mostra.

| Página | Para que serve |
|---|---|
| **Predefinições** | O tema, o idioma, a vista dos formulários, o fuso horário e o formato de data dos utilizadores que não escolheram nenhum. Consulte [Predefinições](../appearance/defaults.html). |
| **Nome** | O nome no separador do navegador e na página de início de sessão. Consulte [Nome](../appearance/name.html). |
| **Logótipo** | O seu próprio logótipo no cabeçalho. Consulte [Logótipo](../appearance/logo.html). |
| **Ícone** | O seu próprio ícone no separador do navegador. Consulte [Ícone](../appearance/icon.html). |
| **Ligações** | A ligação para o Designer, e as suas próprias ligações e menus no cabeçalho. Consulte [Ligações](../appearance/links.html). |
| **Etiquetas** | Etiquetas ao lado do logótipo, como PRODUCTION e EU. Consulte [Etiquetas](../appearance/labels.html). |
| **Anúncios** | Mensagens por baixo do cabeçalho, cada uma do seu início até ao seu fim. Consulte [Anúncios](../announcements.html). |

---

## Acesso

Quem pode iniciar sessão, e o que pode fazer depois de entrar.

| Página | Para que serve |
|---|---|
| **Aviso legal** | Termos que cada utilizador aceita uma vez, e quem aceitou que versão. Consulte [Aviso legal](../disclaimer.html). |
| **Utilizadores** | Os utilizadores locais, e os de LDAP e de início de sessão único. Consulte [Utilizadores e grupos](../users-and-groups.html). |
| **Grupos** | Os grupos locais, e os de LDAP e de início de sessão único. Consulte [Utilizadores e grupos](../users-and-groups/local-group.html). |
| **Funções** | As funções do config.yaml: quem as tem e o que permitem. Consulte [Funções](../config/roles.html). |
| **LDAP** | Início de sessão com um diretório LDAP ou Active Directory. Consulte [LDAP](../authentication/ldap.html). |
| **SSO** | Início de sessão único com fornecedores Entra ID ou OpenID Connect. Consulte [Autenticação](../authentication/). |

![Acesso > LDAP, o diretório principal](../assets/screenshots/ldap.jpg)

---

## Ligações

Os sistemas a que o AnsibleForms chega, e com o que inicia sessão neles.

| Página | Para que serve |
|---|---|
| **Repositórios** | Os repositórios git de onde vêm os formulários e os playbooks. Consulte [Repositórios git](../repositories/). |
| **Credenciais** | As contas e os segredos que os formulários, os playbooks e as ligações usam. Consulte [Credenciais](../credentials.html). |
| **Cofres de segredos** | HashiCorp Vault e CyberArk, de onde as credenciais podem ser lidas. Consulte [Cofres de segredos](../secret-stores/). |
| **Runners** | Onde as tarefas são executadas: contentores RTE para playbooks, e AWX e afins para templates. Consulte [Runners](../runners.html). |
| **SSH** | O par de chaves com que a aplicação se liga ao git, e os hosts conhecidos. Consulte [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notificações** | Servidores SMTP, Slack, Microsoft Teams, Telegram e webhooks. Consulte [Canais de notificação](../notification-channels.html). |
| **Assistente de chat** | O fornecedor de IA do assistente de chat. Consulte [Assistente de chat](../chat/). |
| **MCP** | O servidor MCP para agentes de IA. Consulte [MCP](../mcp/). |
| **Syslog** | Servidores syslog que recebem o registo do servidor, o registo de auditoria, ou ambos. Consulte [Syslog](../production/logs.html#syslog). |

![Ligações > Credenciais, o separador Ligação de uma credencial](../assets/screenshots/credentials.jpg)

---

## Registos

O que aconteceu na instância.

| Página | Para que serve |
|---|---|
| **Registo de auditoria** | Quem alterou o quê, e se foi permitido, filtrado por utilizador, ação e resultado. Consulte [Registo de auditoria](../production/logs.html#audit-trail). |
| **Registo do servidor** | O próprio registo do servidor, para resolução de problemas. Consulte [Registos](../production/logs.html). |

### Registo do servidor

As últimas linhas do registo, as mais recentes em baixo, acompanhadas à medida que são escritas. A caixa de pesquisa filtra-as (uma expressão
regular), **Limpar** esvazia a vista, não o registo, e **Transferir** guarda o registo completo.

![Registos > Registo do servidor](../assets/screenshots/logs.jpg)

---

## Documentação da API

**Documentação da API** no menu de ajuda (o ponto de interrogação no cabeçalho) liga ao Swagger UI da API REST em `/api/v2/docs`.
Consulte [API](../api/).

![Interface Swagger](../assets/screenshots/swagger.jpg)

---
layout: default
title: Em produção
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# Em produção
{: .no_toc }

Publique, faça cópias de segurança e monitorize uma instância de que as pessoas dependem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Antes de entrar em produção

As predefinições põem uma instância a funcionar rapidamente, mas várias delas servem apenas para uma primeira experiência. O AnsibleForms
regista um aviso `[SECURITY]` no arranque quando `ENCRYPTION_SECRET` ou `ACCESS_TOKEN_SECRET` não estão definidas, e a
página **Estado** informa sobre as cópias de segurança, as definições de retenção e o sanitizador de expressões.

---

## Lista de verificação para produção

Percorra estes itens uma vez antes de os utilizadores dependerem da instância, e de novo depois de uma atualização importante:

| Item | O que fazer | Detalhes |
|------|------------|---------|
| Palavra-passe do admin | Altere a palavra-passe da conta de admin local | [Endurecimento](../security/hardening.html#the-admin-account) |
| Segredo de cifragem | Defina [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) antes de guardar qualquer credencial | [Segredos e cifragem](../security/secrets.html#the-two-master-secrets) |
| Segredo dos tokens | Defina [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), para que as sessões sobrevivam a um reinício | [Segredos e cifragem](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Termine o TLS com o seu próprio certificado, não com o de exemplo | [HTTPS](../security/https.html) |
| Reverse proxy | Publique a instância atrás de um proxy, opcionalmente em [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Endpoint do esquema | Defina [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) como `0` quando o esquema já existir | [Endurecimento](../security/hardening.html#the-database) |
| Chamadas de saída | Restrinja as expressões REST com [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Endurecimento](../security/hardening.html#expressions-and-outbound-calls) |
| Funcionalidades opcionais | Deixe o MCP e o assistente de chat desligados a menos que os use | [Endurecimento](../security/hardening.html#optional-features) |
| Cópias de segurança | Verifique que a cópia de segurança noturna funciona, e copie-a para fora do host | [Cópias de segurança](backups.html) |
| Retenção | Decida durante quanto tempo se mantêm as tarefas e as entradas de auditoria | [Registos](logs.html#retention) |

---

## Nesta secção

Cada tema tem uma página própria; a proteção da instância é tratada em [Segurança](../security/):

| Página | O que abrange |
|---|---|
| [Reverse proxy](reverse-proxy.html) | Publicar o AnsibleForms atrás de Nginx, Traefik ou Apache, na raiz ou num subcaminho |
| [Cópias de segurança](backups.html) | Cópias de segurança noturnas, o que contêm, restauros, e o que mais guardar |
| [Registos](logs.html) | Ficheiros de registo, syslog, o registo de auditoria, e a retenção de tarefas e entradas de auditoria |
| [Escalabilidade](scaling.html) | Vários nós da aplicação com um worker; o RTE tem a sua própria secção, [Ambientes de execução](../rte/) |
| [Monitorização](monitoring.html) | Sondas de saúde, métricas do Prometheus e a página Estado |

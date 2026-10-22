---
layout: default
title: Registos
parent: Em produção
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Registos
{: .no_toc }

Ficheiros de registo, syslog, o registo de auditoria, e durante quanto tempo se mantêm as tarefas e as entradas de auditoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ficheiros de registo

O AnsibleForms escreve dois registos com rotação diária em [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), comprime os dias anteriores e mantém-nos durante [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 por predefinição, `0` mantém todos os ficheiros; uma alteração na página de definições aplica-se de imediato):

* `ansibleforms.<date>.log` : tudo a partir de [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL)
* `ansibleforms.errors.<date>.log` : só erros

A consola, lida com `docker logs` ou `kubectl logs`, tem o seu próprio nível,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Ambos são `notice` por predefinição, o adequado para
produção; use `info` ou `debug` só enquanto investiga um problema, e deixe
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) desligada. Os níveis podem ser alterados
nas páginas de definições sem reiniciar, e a página **Registo do servidor** mostra o registo aos utilizadores com a opção `showLogs`.

---

## Linhas JSON

Para um coletor de registos como Loki, ELK ou Splunk, defina [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) como `json`. Cada
linha, na consola e nos ficheiros, passa então a ser um objeto JSON em vez de `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Campo | Conteúdo |
|-------|---------|
| `time` | A hora, em ISO 8601 UTC |
| `level` | O nível de registo |
| `message` | A mensagem |
| `requestId` | O pedido a que a linha pertence, quando foi escrita enquanto servia um |
| `role` | A função do processo, [`AF_ROLE`](scaling.html), ou `all` quando não está definida |
| `host` | O nome do host da máquina ou do contentor onde o processo corre |

Cada pedido recebe um id: o cabeçalho `X-Request-Id` que um reverse proxy enviou, ou um novo. É devolvido no cabeçalho
`X-Request-Id` da resposta e incluído em cada linha escrita enquanto o pedido é servido (como `[req <id>]` nas linhas de texto),
para que um pedido possa ser seguido pelo registo e associado ao do proxy. Uma alteração na página de definições aplica-se de imediato.

---

## Syslog

Os servidores syslog gerem-se em **Definições > Ligações > Syslog**, para que um servidor syslog ou um SIEM receba o registo à medida que é escrito.
Pode adicionar vários servidores, e cada um tem as suas próprias definições:

| Definição | O que faz |
|---------|--------------|
| Ativado | Só os servidores ativados recebem algo, por isso um servidor pode ser pausado sem o eliminar; **Ativar** e **Desativar** no menu da sua linha também o alternam |
| Protocolo | `udp4` (predefinição), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` ou `unix-connect` |
| Host e porta | O servidor para onde enviar, porta `514` por predefinição; um protocolo `unix` recebe em vez disso um caminho de socket |
| Recebe | O registo do servidor, as entradas de auditoria, ou ambos (a predefinição para um servidor novo) |
| Nível | O nível mais baixo do registo do servidor que recebe, `info` por predefinição; as entradas de auditoria são sempre enviadas |
| Formato | `BSD` (RFC 3164, a predefinição) ou `RFC 5424` |

Uma alteração aplica-se em todos os nós sem reiniciar, e a página do servidor tem um botão que lhe envia uma mensagem de teste.
Um servidor que não está acessível nunca para a aplicação: o erro é escrito na consola.

A partir da 7.3.0, os servidores syslog precisam dos direitos completos de definições, a opção de função [`showSettings`](../config/roles.html#role-options):
o acesso só às definições de ligações não chega, já que um servidor syslog recebe o registo do servidor e as entradas de auditoria.

As variáveis `LOG_SYSLOG_*` de versões anteriores estão obsoletas desde a 7. O primeiro arranque que encontra
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) definida importa-as uma vez como o servidor `syslog`,
que recebe o registo do servidor como antes, e a partir daí ignora-as. Remova-as do ambiente depois desse primeiro
arranque, e gira o servidor na página de definições.

---

## Registo de auditoria

A página **Registo de auditoria** (em **Definições > Registos**) regista quem alterou o quê, algo a que os ficheiros de registo não respondem bem.
Regista:

* todas as alterações feitas através da API (`POST`, `PUT`, `PATCH`, `DELETE`), incluindo tentativas recusadas com 401 ou 403
* inícios de sessão, com o nome de utilizador tentado
* eventos da própria aplicação, como cópias de segurança noturnas, cópias de segurança removidas, tarefas purgadas e aplicações do config seed

Cada entrada tem a sua hora, o ator (um utilizador, ou a própria aplicação nas suas próprias tarefas), o endereço IP do cliente,
a ação, o seu alvo e o seu resultado: `success`, `failure` ou `denied`. A página filtra pelo ator, pela ação e
pelo resultado, e os utilizadores com a opção de função `showSettings` podem abri-la.

O endereço IP é o que o AnsibleForms vê, que é o do proxy quando corre atrás de um. Defina
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) com o número ou os endereços dos seus proxies, e o AnsibleForms
regista em vez disso o endereço do cliente que o proxy indica em `X-Forwarded-For`; consulte [Reverse proxy](reverse-proxy.html).

Para manter o registo de auditoria fora da instância, para um SIEM, adicione um servidor syslog que receba as entradas de auditoria (consulte
[Syslog](#syslog)). Cada entrada é enviada no momento em que acontece, como uma linha `audit {...}` com a entrada em JSON, seja qual for o
nível do servidor. A cópia no syslog não é removida pela retenção abaixo, nem substituída por um restauro da base de dados.

---

## Retenção

Duas tarefas diárias com uma definição impedem a base de dados de crescer sem limite:

| Variável | Predefinição | Corre às | Remove |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | As entradas de auditoria mais antigas do que isto |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (manter tudo) | 2:30 | As tarefas terminadas mais antigas do que isto, com a sua saída |

`0` mantém tudo em ambos. Mais duas tarefas diárias não têm definição: às 3:00 são removidos os refresh tokens guardados com mais de 30 dias e
as revogações de tokens expiradas, e às 4:00 as [tarefas guardadas](../jobs/stored-jobs.html) cuja validade já passou.
As horas estão no fuso horário de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), e é o worker que as executa.

A saída das tarefas é normalmente a tabela que mais cresce: a página **Estado** indica o seu tamanho
e avisa quando passa de 1 GB sem retenção definida. As tarefas em execução e as que aguardam aprovação nunca são removidas.
Escolha uma retenção de tarefas que corresponda aos seus requisitos de auditoria, e mantenha o registo de auditoria pelo menos durante o mesmo tempo.

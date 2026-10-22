---
layout: default
title: Monitorização
parent: Em produção
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Monitorização
{: .no_toc }

Sondas de saúde para um balanceador de carga ou para o Kubernetes, métricas do Prometheus, e a página Estado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sondas de saúde

Dois endpoints dizem a um balanceador de carga, a um healthcheck de contentor ou ao Kubernetes se um processo pode receber tráfego.
Nenhum precisa de início de sessão, e nenhum devolve nada sobre a configuração:

| Endpoint | Responde | Use-o para |
|----------|---------|------------|
| `/api/v2/live` | `200` com `{"status":"live"}` enquanto o processo estiver a correr | Uma sonda de liveness: reinicie o processo quando deixar de responder |
| `/api/v2/ready` | `200` com `{"status":"ready"}`, ou `503` com `{"status":"not ready","reason":"..."}` | Uma sonda de readiness: envie tráfego só para processos prontos |

Um processo está pronto quando se verifica tudo isto:

* não está a encerrar (`stopping`)
* a base de dados responde (`database unreachable`)
* o esquema existe (`schema not provisioned`) e está completo, com todas as tabelas, colunas e índices desta versão
  (`schema not upgraded`); esta última verificação fica em cache durante 30 segundos, por isso uma sonda a cada poucos segundos continua barata

Com um [`BASE_URL`](../customization/server.html#env_BASE_URL), os caminhos começam por ele, por exemplo
`/ansibleforms/api/v2/ready`. Um ambiente de execução (RTE) responde às mesmas sondas em `/live` e `/ready`, sem a
verificação de esquema completo; não está pronto enquanto esvazia as suas tarefas no encerramento, para que não lhe seja enviada nenhuma tarefa nova. Um RTE de saída
também não está pronto (`not connected to the app`) até o seu socket para a aplicação estar aberto.
Um processo iniciado com `AF_ROLE=worker` não tem interface web: responde só a `/api/v2/version` e `/health` para o
healthcheck do seu contentor. Consulte [Escalabilidade](scaling.html) para as funções.

---

## Métricas do Prometheus

Defina [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) com uma string aleatória longa para servir métricas do Prometheus.
Um processo que serve a aplicação web responde em `/api/v2/metrics`, um RTE em `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Sem `METRICS_TOKEN` os endpoints respondem `404`, como se não existissem, e um pedido sem o cabeçalho
`Authorization: Bearer <token>` correto recebe `401`. Cada processo reporta os seus próprios valores, por isso recolha cada um:

| Métrica | O que mede |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | O processo: CPU, memória, atraso do event loop, recolha de lixo |
| `af_http_requests_total{route,method,status}` | Os pedidos servidos |
| `af_http_request_duration_seconds{route}` | Quanto tempo demoraram |
| `af_jobs{status}` | Tarefas em execução (`running`) ou a aguardar aprovação (`approve`) neste momento |
| `af_jobs_ended_24h{status}` | Tarefas que terminaram nas últimas 24 horas, por estado |
| `af_nodes{role,alive}` | Os processos registados na base de dados, por função, vivos ou não |
| `af_login_failures_total`, `af_login_lockouts_total` | Inícios de sessão falhados e bloqueios de conta |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Num RTE: os playbooks que corre agora, e quantos pode correr ao mesmo tempo |
| `af_rte_socket_connected` | Num RTE em modo socket: `1` enquanto o seu socket para a aplicação está aberto, `0` quando não está |

Os valores das tarefas e dos nós são lidos da base de dados em cada recolha. Quando a base de dados não responde ficam
de fora, e a recolha continua a ter sucesso com as outras métricas.

---

## A página Estado

A página **Estado**, em **Definições > Sistema**, mostra aos utilizadores com a opção de função `showSettings` como está a instância.
Só lê, por isso atualizá-la nunca envia emails nem lança uma tarefa. Tem dois separadores, e o número de problemas aparece na etiqueta do separador **Verificações**.

### Verificações

Cada verificação está verde (saudável), âmbar (requer atenção) ou vermelha (um problema), com os seus detalhes ao expandir a linha:

| Verificação | O que analisa |
|-------|------------------|
| Ligação à base de dados | A base de dados responde |
| Utilizador da base de dados | Âmbar quando o utilizador tem permissões em todas as bases de dados, como o `root`, em vez de só em `AnsibleForms.*` |
| Esquema da base de dados | Existem todas as tabelas, colunas e índices desta versão, e qual o patch que falhou quando não é o caso |
| Agendador | Um worker corre as tarefas de sistema, e nenhuma deixou de ser agendada |
| Nós | Os processos na base de dados, âmbar quando correm versões diferentes |
| Tarefas | Tarefas em execução e tarefas a aguardar aprovação, âmbar quando uma tarefa está a correr há mais de 24 horas |
| Ferramentas de cópia de segurança | O comando de dump de [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) existe, e a sua versão |
| Última cópia de segurança | Âmbar quando não há nenhuma ou a mais recente tem mais de dois dias, vermelho quando não tem um dump utilizável |
| Bloqueio do designer | Quem tem o bloqueio do designer, âmbar quando está mantido há mais de 8 horas |
| Repositórios | Vermelho quando um repositório falhou ou não tem working tree em disco |
| Config seed | O ficheiro do [config seed](../seed/) é legível e válido, e o seu último recarregamento funcionou |
| Cofres de segredos | Todos os cofres de segredos respondem, âmbar quando o token de um HashiCorp Vault expira em breve |
| Runners | Todos os runners respondem, âmbar quando não há nenhum ou não há um RTE predefinido |
| Expressões do servidor | Âmbar quando [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) é `legacy` |
| Segredos | Âmbar quando `ENCRYPTION_SECRET` é a predefinição pública ou `ACCESS_TOKEN_SECRET` não está definida |
| LDAP | O servidor LDAP está acessível e o seu certificado TLS é válido, sem iniciar sessão nele |
| Armazenamento de tarefas | O tamanho das tabelas de tarefas, âmbar acima de 1 GB quando não há retenção de tarefas definida |
| Pastas com permissão de escrita | Todas as pastas configuradas podem ser escritas |
| Espaço em disco | O disco que contém as cópias de segurança, âmbar a partir de 85% de uso e vermelho a partir de 95% |

### Informação

Factos sobre a instância que não têm veredicto, as primeiras coisas que se pedem num pedido de suporte: a versão do
AnsibleForms, o URL base, a versão e o host da base de dados, a origem da configuração, o config seed, as definições de
retenção, os métodos de autenticação, o servidor do [canal de email](../notification-channels.html) ativo, o nível e o caminho
do registo, o tempo de atividade, o fuso horário, a versão do Node.js e a plataforma.

A página lê `/api/v2/health`, que precisa de um utilizador com sessão iniciada e `showSettings`. Para um sistema de monitorização, use em vez disso as
sondas e as métricas acima.

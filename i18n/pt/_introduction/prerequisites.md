---
layout: default
title: Pré-requisitos
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Pré-requisitos
{: .no_toc }

O que precisa antes de instalar o AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ambiente de execução

O AnsibleForms corre como um contentor, como serviços systemd no próprio servidor ou, para quem o compila, como uma aplicação Node.js:

| Instalação | Precisa de |
|---|---|
| [Instalador](installation/installer.html) | Linux em amd64 ou arm64, `curl` ou `wget` e `sha256sum`, e os requisitos do motor em que instala (abaixo) |
| [Nativa](installation/native.html) | Root, systemd e um Linux suportado (Ubuntu, Debian, RHEL e as suas recompilações, SUSE); o instalador instala o resto |
| [Docker](installation/docker.html) | Docker ou Podman, e um servidor MySQL próprio |
| [Docker Compose](installation/docker-compose.html) | Docker Compose ou podman-compose; o projeto também inicia o MySQL |
| [Kubernetes](installation/kubernetes.html) | Um cluster, Helm 3 e uma StorageClass (ou PersistentVolumes criados previamente) |
| [A partir do código-fonte](installation/from-source.html) | Node.js 26 (no mínimo a 24) com npm, Git, e Ansible para o processo RTE que executa os playbooks |

A imagem da aplicação, `ghcr.io/ansibleforms/ansibleforms`, contém o Node.js e as ferramentas que o servidor chama (git, ssh, o cliente mariadb e
ytt), mas não contém Python nem Ansible. Os playbooks são executados num RTE (ambiente de execução), um segundo contentor a partir de
`ghcr.io/ansibleforms/ansibleforms-rte-full`, ou de uma imagem que construa sobre `ansibleforms-rte-core` (consulte [Escalar](rte/)).
Os formulários que apenas lançam templates no AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins não precisam de RTE.

---

## Base de dados

O AnsibleForms guarda as suas tarefas, utilizadores, credenciais e ligações no MySQL 8 ou posterior, ou no MariaDB.

No primeiro arranque cria ele próprio o esquema `AnsibleForms`. Dê-lhe um utilizador de base de dados próprio, com direitos apenas sobre esse esquema,
e não o root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

É tudo o que precisa: cria e atualiza o esquema, faz as suas cópias de segurança e, com vários workers, termina a sessão de um que tenha morrido.
A página **Estado** e o registo avisam quando o utilizador tem direitos sobre todas as bases de dados. Os nós da aplicação e os workers ligam-se com este
utilizador. Um RTE num modo socket (outbound ou inbound, consulte [Modos](rte/modes.html)) não guarda credenciais da base de dados: só um em modo base de dados,
descontinuado desde a 7.3.0, também se liga. Para criar o esquema por si, defina [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) como `0`.
O projeto Docker Compose e o chart de Helm (que usa `mysql:8.4`) iniciam uma base de dados por si.

---

## Dimensionamento

Não há requisitos medidos: a carga depende sobretudo de quantas tarefas são executadas ao mesmo tempo e de quanta saída escrevem.
Os recursos predefinidos do chart de Helm são um ponto de partida razoável para uma equipa pequena:

| Componente | Pedidos | Limites | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB de memória | 4 CPU, 4 GiB de memória | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB de memória | 2 CPU, 2 GiB de memória | 10 GiB |

O contentor da aplicação não executa nenhum playbook. Cada playbook é um processo `ansible-playbook`, com os seus forks, num RTE: dimensione o CPU e a
memória de cada RTE para os playbooks que executa em simultâneo, no máximo [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (`10` por predefinição), e execute mais
RTEs para executar mais. As tarefas executadas no AWX, AAP, Ascender ou nos outros runners de templates custam pouco ao AnsibleForms.

A saída das tarefas é guardada na base de dados para sempre por predefinição. Defina [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
numa instância com muita atividade para evitar que a base de dados cresça sem limite.

---

## Rede

A aplicação e cada RTE escutam numa porta própria, e abrem ligações de saída para os sistemas que os seus formulários e definições usam.

### Entrada
{: .no_toc }

O servidor escuta na porta `8000` ([`PORT`](customization/server.html#env_PORT)), por HTTP ou, com
[`HTTPS`](customization/server.html#env_HTTPS) definido como `1`, por HTTPS. O projeto Docker Compose publica-o na porta 443,
e o chart de Helm expõe-no através de um serviço ou de um ingress. Um RTE também escuta no seu próprio `PORT`, mas só a aplicação o chama:
mantenha-o fora da rede pública. Um RTE de saída não precisa de nenhuma porta de entrada: liga-se à aplicação na porta da aplicação.

### Saída
{: .no_toc }

Abra as ligações do AnsibleForms para os sistemas que usa:

| Destino | Usado para |
|---|---|
| MySQL / MariaDB | A base de dados do AnsibleForms (`DB_HOST`, `DB_PORT`, por predefinição `3306`) |
| O RTE | Ligar-se a um RTE de entrada no endereço do seu runner através de um WebSocket, ou chamar um em modo base de dados no seu [`RTE_URL`](customization/server.html#env_RTE_URL), que depois se liga ele próprio ao MySQL; um RTE de saída é que se liga à aplicação (consulte [Modos](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Lançar e acompanhar templates e jobs em [runners](runners.html), através da sua API HTTP(S) |
| Os hosts geridos | Os playbooks ligam-se a eles a partir do RTE, por exemplo por SSH ou WinRM |
| LDAP, Entra ID, OIDC | Iniciar sessão com contas de diretório ou de início de sessão único |
| Servidores Git | Clonar e atualizar repositórios, por HTTPS ou SSH |
| APIs REST e bases de dados | As fontes de dados das expressões e das consultas dos seus formulários |
| HashiCorp Vault, CyberArk | Ler credenciais a partir de um [cofre de segredos](secret-stores/) |
| Servidores de email, Slack, Teams, Telegram, webhooks | Notificações de tarefas e pedidos de aprovação, através dos [canais de notificação](notification-channels.html) |
| Fornecedor de modelos | O [assistente de chat](chat/), apenas quando está ativado |

Para limitar os hosts que as funções REST das expressões podem chamar, consulte
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) e
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Navegador

A aplicação web foi feita para navegadores atuais: Chrome ou Edge 111, Firefox 114, Safari 16.4 ou mais recentes.
Os navegadores mais antigos não são suportados.

---

## Escalar

Por predefinição, um contentor AnsibleForms executa a aplicação web e o trabalho em segundo plano em conjunto, ao lado de um RTE.

Para servir mais utilizadores, execute vários nós da aplicação por trás de um balanceador de carga (`AF_ROLE=app`) ao lado de um worker (`AF_ROLE=worker`), que executa os
agendamentos, as cópias de segurança e o restante trabalho em segundo plano; só um worker trabalha de cada vez, e um segundo espera para assumir. Partilham
a base de dados, a pasta persistente, `ACCESS_TOKEN_SECRET` e `ENCRYPTION_SECRET`. Consulte [Escalar](production/scaling.html). Execute mais
RTEs para executar mais playbooks em simultâneo: consulte [Vários RTEs](rte/several.html).

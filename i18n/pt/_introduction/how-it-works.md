---
layout: default
title: Como funciona
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Como funciona
{: .no_toc }

As partes de uma instalação, o que acontece num lançamento, e onde os dados são guardados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Arquitetura

O AnsibleForms é um servidor Node.js que serve a aplicação web e uma API REST, apoiado por uma base de dados MySQL. Lê os formulários
de ficheiros YAML e não executa nada por si: entrega cada tarefa a um [runner](runners.html). Um playbook vai para um dos seus contentores RTE
(ambiente de execução), que executa `ansible-playbook`, e um template ou job vai para o AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Arquitetura do AnsibleForms</title>
<desc id="afd-desc">O navegador e um cliente MCP opcional comunicam com o servidor AnsibleForms. O servidor guarda os seus dados no MySQL e na pasta persistente, e liga-se a fontes de dados, cofres de segredos, repositórios git, fornecedores de início de sessão, canais de notificação, servidores syslog e um fornecedor de modelos opcional. Os seus runners entregam cada playbook a um de um ou mais contentores RTE, cada um através de um WebSocket, que executam o ansible-playbook e devolvem a saída ao servidor, e cada template ou job ao AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="94" text-anchor="middle">Navegador</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formulários, designer,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">tarefas, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Cliente MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">opcional</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Servidor AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Aplicação web e API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formulários, expressões</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, agendamentos</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Servidor MCP (opcional)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runners</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">entregam as tarefas ao runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Fontes de dados</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">BD, APIs REST, ficheiros</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Cofres de segredos</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Repositórios git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formulários, playbooks, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Fornecedores de login</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Notificações</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">email, Slack, Teams, webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Servidores syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">o registo, a auditoria</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Fornecedor de modelos</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">opcional, assistente de chat</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Pasta persistente</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formulários, playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">tarefas, utilizadores,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">credenciais</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Contentores RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">executam ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">templates, jobs</text>
</svg>
</div>

Os componentes do diagrama têm cada um a sua função:

| Componente | Função |
|---|---|
| **Navegador** | A aplicação web em Vue: os formulários, o [Designer](gui/designer-and-git.html), o histórico de tarefas e as definições |
| **Servidor AnsibleForms** | Avalia os formulários, regista as tarefas, executa os workflows e os agendamentos, entrega cada tarefa ao seu runner e acompanha-a, e serve a [API REST](api/) |
| **Runners** | Onde as tarefas são executadas, adicionados em **Ligações > Runners**: um formulário indica um com `runner: <name>`, ou usa o runner predefinido do seu tipo (consulte [Runners](runners.html)) |
| **Contentores RTE** | Um ou mais contentores de ambiente de execução, o mesmo servidor iniciado com `AF_ROLE=rte`: cada um executa `ansible-playbook` para os [formulários ansible](forms/ansible.html), com as bibliotecas python e as coleções da sua imagem, e devolve a saída e o estado final ao servidor através de um WebSocket, sem credenciais da base de dados (consulte [Como o RTE é executado](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runners para templates e jobs: os [formulários AWX](forms/awx.html) lançam um job template ou um workflow template, os formulários [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) e [Jenkins](forms/jenkins.html) lançam um dos seus jobs, e o servidor acompanha a sua saída |
| **MySQL / MariaDB** | Contém as tarefas e a sua saída, os utilizadores, as credenciais e as ligações; só o servidor a lê e escreve |
| **Pasta persistente** | Contém o `config.yaml`, os ficheiros de formulários, os playbooks, os registos e as cópias de segurança |
| **Fontes de dados** | Preenchem os campos: [consultas a bases de dados](formfields/enum.html), [APIs REST](expressions/rest-apis.html), ficheiros e [outras funções](expressions/remote.html) |
| **Cofres de segredos** | Fornecem o utilizador e a palavra-passe de uma credencial no momento da utilização, consulte [Cofres de segredos](secret-stores/) |
| **Repositórios git** | Mantêm os formulários, os playbooks e o `config.yaml` sob controlo de versões |
| **Fornecedores de login** | Iniciam a sessão dos utilizadores: [LDAP, Entra ID e OIDC](authentication/), ao lado dos utilizadores locais |
| **Canais de notificação** | Transportam as [notificações](forms/notifications.html) e os pedidos de aprovação: [email, Slack, Microsoft Teams, Telegram ou um webhook](notification-channels.html) |
| **Servidores syslog** | Recebem o registo e o registo de auditoria à medida que são escritos, consulte [Syslog](production/logs.html#syslog) |
| **Cliente MCP, chat** | Opcionais, ambos desligados por predefinição: o [servidor MCP](mcp/) e o [assistente de chat](chat/), que precisa de um fornecedor de modelos |

Por predefinição, um contentor executa o servidor, a aplicação web e o trabalho em segundo plano em conjunto, ao lado de um RTE. Para vários nós da aplicação por trás de um
balanceador de carga, um worker que executa o trabalho em segundo plano, e mais RTEs, consulte [Escalar](production/scaling.html).

### Construído com

O servidor e a interface web assentam nestes componentes:

| Parte | Tecnologia |
|---|---|
| **Servidor** | Node.js e Express |
| **Base de dados** | MySQL ou MariaDB |
| **Interface web** | Vue 3, com Bootstrap 5 e Font Awesome |

---

## O que acontece quando lança um formulário

Um lançamento passa pelos mesmos passos, venha do navegador ou da [API REST](api/jobs.html):

1. **Carregar** : o servidor envia apenas os formulários que as [funções](config/roles.html) do utilizador permitem, e avalia as expressões do servidor
2. **Submeter** : o navegador transforma os valores dos campos em extravars e envia-os para `POST /api/v2/job`
3. **Verificar** : o servidor volta a carregar o formulário para as funções do utilizador e, com a [validação do lançamento](launch-validation/) ativa, verifica os valores
4. **Registar** : a tarefa é guardada com o estado `running`, e o seu ID é adicionado às extravars como `__jobid__`
5. **Aprovar** : um formulário com um ponto de [`approval`](forms/approval.html) espera até que um aprovador aceite a tarefa
6. **Credenciais** : para um playbook, a aplicação (nunca o RTE) lê as credenciais do formulário a partir da base de dados ou de um [cofre de segredos](secret-stores/)
7. **Executar** : a tarefa vai para o seu runner, aquele que o formulário indica com `runner:` ou o predefinido do seu tipo. Para um playbook, a aplicação envia a tarefa ao seu
   RTE através do WebSocket do RTE, com as credenciais seladas para ele, e o RTE executa `ansible-playbook` (consulte [Como o RTE é executado](rte/#how-the-rte-runs)),
   e o AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins executa um template ou um job. Um [workflow](workflows/) executa os seus nós, cada um como uma
   tarefa própria no seu próprio runner
8. **Acompanhar** : o servidor guarda a saída na base de dados à medida que chega, enviada pelo RTE através do seu socket no caso de um playbook, ou lida a partir dos
   outros runners. A página do formulário volta a ler a tarefa a cada dois segundos, e a página Tarefas acompanha-a em direto à medida que o servidor
   anuncia cada alteração
9. **Terminar** : a tarefa recebe o seu estado final, e as suas [`notifications`](forms/notifications.html) são enviadas por email e para os seus
   [canais de notificação](notification-channels.html) quando o formulário as pede

---

## Onde as coisas são guardadas

O AnsibleForms guarda o seu estado em dois sítios: a base de dados MySQL e a pasta persistente. Faça cópias de segurança de ambos.

### Na base de dados
{: .no_toc }

A base de dados, `AnsibleForms`, é criada no primeiro arranque (a menos que `ALLOW_SCHEMA_CREATION` seja `0`) e contém:

* as tarefas, as suas extravars e a sua saída, os agendamentos e as tarefas guardadas
* os utilizadores locais, os grupos e os tokens de API
* as credenciais, cifradas com `ENCRYPTION_SECRET`, e as ligações aos cofres de segredos
* os runners, os canais de notificação (incluindo o email), os servidores syslog, e as definições de LDAP, SSO, repositórios e do assistente de chat
* o registo de auditoria

### Na pasta persistente
{: .no_toc }

É `/app/dist/persistent` na imagem e `server/persistent` a partir do código-fonte; cada caminho tem a sua própria [variável](customization/paths.html):

| Caminho predefinido | Variável | Conteúdo |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | As categorias, as funções e as constantes |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Os ficheiros de formulários, `.yaml` ou `.yml`, em subpastas se quiser |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Os playbooks dos formulários `ansible`, e o seu diretório de trabalho |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Os clones dos repositórios git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | As cópias que o Designer faz antes de guardar |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | As cópias de segurança da base de dados |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Os ficheiros carregados através de campos `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` e `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | O certificado e a chave, quando `HTTPS` é `1` |
| `.env` | | As variáveis de ambiente guardadas a partir das páginas de definições (a menos que `ALLOW_ENV_EDIT` seja `0`) |

A chave SSH gerada fica em [`HOME_PATH`](customization/paths.html#env_HOME_PATH), fora da pasta persistente por predefinição.

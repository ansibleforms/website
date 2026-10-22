---
layout: default
title: Endurecimento
parent: Segurança
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Endurecimento
{: .no_toc }

A conta de admin, os limites de início de sessão, a base de dados, as expressões, os dados das tarefas, a política do navegador, as funcionalidades opcionais e as opções de função
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A conta de admin

A conta de admin local é criada no primeiro arranque a partir de [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
e [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), cuja predefinição é `AnsibleForms!123`.

* Um início de sessão com a palavra-passe predefinida pública `AnsibleForms!123` tem de a alterar primeiro: até lá o servidor responde
  a todos os pedidos exceto à alteração da palavra-passe com `403` (código `password_change_required`), e o navegador mostra uma
  página de alteração de palavra-passe que não pode ser fechada. A nova palavra-passe não pode voltar a ser a predefinida.
* `ADMIN_PASSWORD` só é lida quando a conta é criada pela primeira vez: defina o seu próprio valor antes do primeiro arranque.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` repõe a palavra-passe para `ADMIN_PASSWORD` em cada
  arranque. Use-a só para recuperar uma palavra-passe perdida, depois retire-a e reinicie.
* Defina primeiro os dois segredos mestres: consulte [Segredos e cifragem](secrets.html).
* Quando o início de sessão por LDAP ou SSO estiver a funcionar, mantenha o admin local só para emergências, com uma palavra-passe longa guardada no seu cofre.

---

## Limites de início de sessão e palavras-passe

A adivinhação de palavras-passe é travada por três limites. As falhas são contadas na base de dados, por isso todos os nós da aplicação veem as
mesmas tentativas, e todos os limites se aplicam sem reiniciar:

| Variável | Predefinição | O que faz |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Depois deste número de inícios de sessão falhados, uma conta local ou LDAP fica bloqueada durante `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Um endereço com este número de inícios de sessão falhados dentro de `LOGIN_LOCKOUT_MINUTES` fica retido até essa janela terminar: um endereço que tenta muitas contas. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Durante quanto tempo uma conta fica bloqueada, e a janela em que as falhas são contadas. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Pedidos por minuto de um endereço, por nó da aplicação, no início de sessão, no fim de sessão, na renovação do token e nos callbacks de início de sessão único. |

Uma conta bloqueada ou um endereço retido recebe `429` com um cabeçalho `Retry-After`, antes de qualquer palavra-passe ser verificada e
quer a conta exista quer não; acima de `AUTH_RATE_LIMIT` a resposta também é `429`. Um início de sessão bem-sucedido limpa a
contagem da conta, tal como um admin a definir a palavra-passe do utilizador. `0` desliga um limite; `LOGIN_LOCKOUT_MINUTES=0`
desliga tanto o bloqueio como o limite por endereço.

`LOGIN_MAX_FAILURES_PER_IP` e `AUTH_RATE_LIMIT` contam por endereço do cliente: atrás de um reverse proxy, defina `TRUST_PROXY`
para que o endereço seja o do cliente e não o do proxy, consulte [Endereços dos clientes](../production/reverse-proxy.html#client-addresses).

Uma palavra-passe local definida através da aplicação, para um utilizador novo, por um admin ou pelos utilizadores ao alterarem a sua, tem de ter
pelo menos [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) caracteres (`8` por predefinição,
`0` não verifica o comprimento). Não pode ser o nome de utilizador nem a palavra-passe predefinida pública. `ADMIN_PASSWORD` não é verificada.

---

## A base de dados

O AnsibleForms guarda todas as credenciais e tarefas na sua base de dados MySQL, por isso mantenha essa base de dados fora da rede:

* O projeto docker-compose publica o MySQL no host (`MYSQLDB_LOCAL_PORT`, `3306`) e vem com a palavra-passe de root
  `AnsibleForms!123`. Remova esse mapeamento de porta, ou associe-o a `127.0.0.1`, e altere a palavra-passe.
* Ligue-se com uma conta dedicada em vez de `root`, definida em [`DB_USER`](../customization/server.html#env_DB_USER) e
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Só precisa de permissões no esquema `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Isso cobre a criação do esquema (incluindo o `CREATE DATABASE`), a sua atualização com patches nas atualizações, e as
  [cópias de segurança](../production/backups.html) e os restauros, que correm com o mesmo utilizador: o dump é feito com
  `--no-tablespaces`, por isso não é necessária nenhuma permissão ao nível do servidor como `PROCESS`. Substitua `%` pelo endereço da
  aplicação sempre que puder. Um utilizador com permissões em todas as bases de dados, como tem o `root`, transforma uma falha na aplicação numa
  falha em todo o servidor de base de dados: a página **Estado** avisa disso na sua verificação **Utilizador da base de dados**, e o registo
  em cada arranque.
* Defina [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) como `0` quando o esquema já existir.
  Criar o esquema elimina primeiro todas as tabelas; com `0`, nem o arranque inicial nem o endpoint `/api/v2/schema`
  o podem executar.

---

## Expressões e chamadas de saída

As expressões do servidor correm no servidor para qualquer utilizador com sessão iniciada, por isso o sanitizador e os filtros de saída importam:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` ou `paranoid`, nunca `legacy`, que deixa os utilizadores correr código no servidor.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : hosts a que as expressões REST não podem chegar, ex. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : quando definida, as expressões REST só podem chegar
  a estes hosts e intervalos. A lista de negados prevalece sobre ela.

Ambas as listas cobrem só as funções auxiliares REST do próprio AnsibleForms; os playbooks correm fora delas e não são filtrados.

A partir da 7.3.0, as funções auxiliares REST verificam o certificado do endpoint, como fazem todas as outras ligações.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` desliga a verificação: use-a só para
endpoints com um certificado autoassinado.

---

## Dados das tarefas

Os extravars e a saída das tarefas são guardados na base de dados e mostrados a todos os que podem ver a tarefa:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : os extravars cuja chave corresponde são
  mostrados como `********`. A predefinição é `password|secret|token`; os campos de palavra-passe são sempre mascarados. Alargue-a com
  os nomes que os seus formulários usam, por exemplo `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : reduz o objeto `ansibleforms_user`
  enviado com cada tarefa, que de outra forma contém todos os grupos a que o utilizador pertence.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) só esconde tarefas ruidosas; esconda os segredos com `no_log`.

---

## A Content-Security-Policy

A interface é servida com um cabeçalho Content-Security-Policy, que limita o que uma página pode carregar e correr no navegador:

* Os scripts vêm só da própria aplicação, por isso um script injetado numa página não corre.
* Nenhum outro site pode mostrar a interface numa frame.
* Permite o que a aplicação precisa: expressões locais dos formulários avaliadas no navegador (`'unsafe-eval'`), estilos
  inline, imagens de qualquer URL (imagens de formulários e de categorias), e os workers do editor de código.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) é `1` por predefinição e deve
continuar assim. Com `0`, a política é enviada como `Content-Security-Policy-Report-Only`: a consola do navegador lista o que
bloquearia, e nada é bloqueado. Use `0` só numa configuração que ainda não funciona com a política, como um reverse proxy
que injeta um script próprio. Uma alteração na página de definições aplica-se sem reiniciar.

---

## As páginas de definições e o designer

Os administradores podem alterar grande parte da configuração a partir do navegador. Restrinja isso onde a configuração vive noutro sítio:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : definições só de leitura, para um [ambiente gerido](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : remove o designer integrado quando os formulários
  são mantidos em git.

---

## Funcionalidades opcionais

Estas funcionalidades estão desligadas por predefinição. Ligue-as só quando as usar; uma alteração na página de definições aplica-se sem reiniciar:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : serve o [servidor MCP](../mcp/) em `/api/v2/mcp`,
  para que os clientes MCP possam lançar formulários com o token de um utilizador.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : o [assistente de chat](../chat/). As definições dos formulários
  e os valores a ser preenchidos são enviados para o fornecedor de modelo configurado.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) funciona ao contrário: é `enforce`
por predefinição, por isso o servidor recusa um lançamento cujos valores violem as regras do formulário, incluindo os lançamentos através da API REST.
Mantenha-a assim: `log` só regista o que seria recusado e `off` não verifica nada, consulte [Validação no lançamento](../launch-validation/).

---

## Opções de função

Algumas opções de função no [config.yaml](../config/roles.html) dão mais do que o seu nome sugere. Conceda-as com cuidado:

| Opção | Porque importa |
|--------|----------------|
| `allowScheduledJobs` | Um utilizador com ela vê e pode alterar todos os agendamentos, e um agendamento corre com direitos de admin, para qualquer formulário. Trate-a como uma opção de nível de admin. |
| `allowBackupOps` | Inclui o **restauro**, que substitui toda a base de dados. |
| `showSettings` | Abre as páginas de administração. Sem a função admin, não pode alterar as contas e os grupos que a função admin nomeia, consulte [Utilizadores e grupos](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Mostra o registo do servidor, que pode conter nomes de host, nomes de utilizador e detalhes de erros. |
| `showConnectionsSettings` | Abre as páginas de ligações: credenciais, runners, canais de notificação e mais. Adicionar, alterar e eliminar runners e cofres de segredos continua a caber a um admin, tal como as credenciais das ligações e dos inícios de sessão. Num repositório, adicioná-lo ou eliminá-lo e alterar o seu endereço, ramo ou flags `use_for_*` continua a caber a um admin. |
| `showAllJobLogs` | Mostra as tarefas de todos os utilizadores, não só as do próprio utilizador. |
| `manageAllJobs` | Aborta, elimina e relança as tarefas de todos os utilizadores. |
| `allowApiTokens` | Deixa o utilizador criar tokens de API que duram até [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 por predefinição). Terminar sessão com um token ou revogá-lo termina-o, e uma alteração de palavra-passe termina todos os tokens do utilizador, consulte [Tokens](secrets.html#tokens). |
| `extendedTokenExpiration` | Com `allowApiTokens`, deixa também o utilizador criar tokens de API que nunca expiram. |
| `allowFileUploads` | Deixa o utilizador carregar ficheiros pelos campos de ficheiro de um formulário. Ligada para todos os utilizadores a menos que uma função a desligue. |
| `allowChat`, `allowMcp` | Deixam o utilizador usar o assistente de chat e o servidor MCP, quando estão ligados. `allowChat` está ligada para todos os utilizadores a menos que uma função a desligue, e `allowMcp` segue `allowChat` a menos que uma função a defina. |

Um utilizador sem a função `admin` não recebe nenhuma das opções de nível de admin acima a menos que uma função lha dê. Quando a função `admin`
não define opções, os seus utilizadores recebem `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` e `allowScheduledJobs`. `allowApiTokens` e
`extendedTokenExpiration` ficam desligadas mesmo para a função `admin`: defina-as nas funções que precisam delas.

Quando várias funções de um utilizador definem a mesma opção, `false` ganha. As opções da função `default` só preenchem as opções
que nenhuma das funções próprias do utilizador define; nunca se sobrepõem a elas.

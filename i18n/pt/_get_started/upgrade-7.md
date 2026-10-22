---
layout: default
title: Atualizar para a v7
parent: Atualizar
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Atualizar para a v7
{: .no_toc }

O que alterar enquanto ainda está na 6.5, e o que muda quando passa para a versão 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A versão 7 remove tudo o que a 6.x tinha descontinuado; corrija-o primeiro na 6.5, onde o antigo e o novo funcionam, e depois atualize.

---

## Antes de atualizar (na 6.5)

### Os formulários vivem nos seus próprios ficheiros

Os formulários vivem apenas na pasta de formulários (`FORMS_FOLDER_PATH`) ou num repositório de formulários; o `config.yaml` guarda as categorias, as funções e as constantes.

- **Um ficheiro `forms.yaml`:** mude-lhe o nome para `config.yaml`. Na 6.5, a página de definições tem um
  botão **Convert forms.yaml to config.yaml** para isso.
- **Uma secção `forms:` na configuração base:** a versão 7 rejeita-a. Mova cada formulário para o seu próprio ficheiro, por exemplo
  arrastando-o para um ficheiro no designer da 6.5.
- **Variáveis de ambiente:**

  | Removida | Use em vez disso |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` e `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### O campo `table`

A versão 7 rejeita os campos `table`, e as suas propriedades (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) vão com eles: use um campo `list` com um `subform`, e transforme o `from` de cada coluna numa expressão
sobre `__parent__` (consulte as [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Propriedades com novo nome

Cada propriedade removida tem uma substituição direta:

| Removida | Use em vez disso |
|---|---|
| `disableRelaunch: true` (formulário) | `allowRelaunch: false` |
| `noOutput: true` (campo) | `output: false` |
| `enableLogin` (opção de função) | `allowLogin` |

### Datasources e esquemas de dados

As importações de datasources e as suas páginas de administração foram removidas, tal como a
coleção AnsibleForms do Galaxy, cujos módulos só serviam para elas.

- As importações agendadas param e as tabelas de datasources são eliminadas: anote primeiro o que precisa.
- Os esquemas de dados que uma importação preenchia são bases de dados próprias e mantêm-se. Um formulário que
  os consulta através de uma credencial continua a funcionar.
- Para manter esses dados atualizados, execute a importação como um playbook seu, por exemplo a partir de um
  agendamento.

### API v1

`/api/v1/*` foi removida; use `/api/v2/*` (documentação interativa em `/api/v2/docs`). As chamadas que os
scripts costumam usar são:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

A v2 responde com códigos de estado HTTP (`400`, `403`, `404`, `422`) e um corpo JSON simples, e não com o envelope
`{ status, message, data }` da v1.

**Também as callbacks de início de sessão único.** Um URL de redirecionamento com `/api/v1/` deixa de responder: o início de sessão volta à
página de início de sessão sem iniciar sessão. Altere-o para `/api/v2/` em dois sítios, no fornecedor de SSO no
AnsibleForms e no fornecedor de identidade (os URIs de redirecionamento do registo da aplicação no Entra ID, os URIs de redirecionamento válidos do
cliente OIDC):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, ou `/api/v2/auth/entraid/callback` a partir da 7.3.0
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## O que muda na 7

A versão 7 muda a forma como os playbooks são executados e torna várias predefinições mais restritas. Verifique cada ponto abaixo quando passar da 6.5.

### Os playbooks são executados num RTE

A versão 7 deixa de executar `ansible-playbook` no contentor do AnsibleForms. Os playbooks são executados num ambiente de execução (RTE),
um contentor próprio, e a imagem da aplicação já não contém ansible nem python. Inicie um RTE ao lado da aplicação, a partir da
imagem `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Desde a 7.3.0, a aplicação liga-se ao RTE e mantém um WebSocket aberto (consulte
[Modos](rte/modes.html)): o RTE não recebe definições da base de dados nem o `ENCRYPTION_SECRET`. As suas definições:

| Definição | Valor |
|---|---|
| `AF_ROLE` | `rte`. As imagens do RTE já a definem. |
| `RTE_MODE` | `inbound`: a aplicação liga-se ao RTE. Um Runner noutra rede usa `outbound` (consulte [Modos](rte/modes.html)). |
| `RTE_TOKEN` | Um token com pelo menos 16 caracteres. A aplicação inicia sessão no socket do RTE com ele, e o RTE recusa-se a arrancar sem um. |
| `RTE_FILES` | `local` quando o RTE monta a mesma pasta persistente que a aplicação, como ao lado dela. |

Depois mova as montagens do ansible do contentor da aplicação para o RTE:

- `ansible.cfg` em `/etc/ansible/ansible.cfg`, as suas roles em `/etc/ansible/roles` e as suas coleções em
  `/etc/ansible/collections`.
- Monte também no RTE a mesma pasta persistente que na aplicação, para que encontre os playbooks e os repositórios.

Depois declare o RTE como runner, no [config seed](seed/) como faz o projeto Docker Compose, ou em **Ligações → Runners**:
uma credencial de RTE com o endereço do RTE (por exemplo `http://rte:8000`) e o mesmo token, e um runner do tipo RTE, em modo inbound,
que a indica:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

O seed lê `RTE_TOKEN` do ambiente da aplicação. Consulte [Runners](runners.html) e [Ambientes de execução](rte/).

{: .warning }
> **O mesmo contrato para a aplicação e para o RTE** A aplicação resolve as credenciais de uma tarefa e entrega-as ao RTE seladas para
> esse RTE (contrato RTE 2, novo na 7.0.0). Um RTE de outro contrato recusa as tarefas da aplicação: execute a imagem do RTE da mesma
> versão que a aplicação, e atualize as duas em conjunto. As versões 7 posteriores continuam a funcionar com um RTE 7 mais antigo desde que o contrato
> se mantenha (consulte [Escalar](../rte/images.html#build-your-own-rte)).


### O que contém a imagem do RTE

O RTE existe em três camadas, cada uma construída sobre a anterior. Escolha a que se adequa aos seus playbooks:

| Imagem | Conteúdo |
|---|---|
| `ansibleforms-rte-full` | A predefinida. Ansible 14 com ansible-core 2.21, e as coleções e bibliotecas python que a imagem 6.5 tinha. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core e algumas bibliotecas comuns, sem coleções. Adicione as suas numa imagem construída sobre ela. |
| `ansibleforms-rte-base` | Apenas o servidor, sem python nem ansible, para construir um RTE com as suas próprias versões. |

Passar da 6.5 (ansible 12 com ansible-core 2.19) também muda o seguinte para os seus playbooks:

- **ansible-core 2.21:** leia os [guias de migração](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  da 2.20 e da 2.21.
- **Python 3.14:** as camadas do RTE correm em python 3.14.
- **Já não há `boto`:** a antiga biblioteca `boto` 2 desapareceu. A coleção `amazon.aws` usa `boto3`, que está incluída.

Duas variáveis de ambiente pertencem agora ao RTE e já não são lidas pela aplicação, por isso defina-as no contentor do RTE:

| Variável | Alteração |
|---|---|
| `ANSIBLE_PATH` | A pasta de playbooks, no RTE. |
| `PROCESS_MAX_BUFFER` | Agora 50 MB por predefinição. Acima disso, a saída da tarefa deixa de ser guardada (a tarefa indica-o), mas o playbook continua em vez de ser parado. |


### Os contentores correm com o uid 1000

As imagens da aplicação e do RTE correm como o utilizador `node` (uid 1000) em vez de root, e a sua pasta pessoal é `/home/node`:

- **Dê os volumes ao uid 1000, uma vez.** Para os volumes persistente e ssh, execute
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; para uma pasta do host, `sudo chown -R 1000:1000 <folder>`.
  Em Kubernetes, defina `fsGroup: 1000`.
- **Monte a pasta ssh em `/home/node/.ssh`**, e não em `/root/.ssh`. Se definiu
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) como `/root`, remova-a ou defina-a como `/home/node`.
- **A sua própria imagem de RTE** construída sobre uma camada do RTE muda para `USER root` para as suas instalações e volta a `USER node` no fim.


### A validação do lançamento está ativa

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) passa a ter `enforce` como predefinição (6.5: `off`). Cada
lançamento, a partir do navegador ou de `POST /api/v2/job`, é verificado contra as regras do formulário, e a tarefa executa as extravars e as
credenciais que o servidor constrói a partir dos valores verificados.

- **Quem chama a API REST tem de enviar `rawFormData`**, os valores brutos dos campos tal como o navegador os envia. Um lançamento só com
  `extravars` é recusado, porque os seus valores não podem ser verificados.
- **Para ver primeiro o que seria recusado**, defina `LAUNCH_VALIDATION=log` e leia os avisos no registo. `off` repõe o
  comportamento da 6.5.

Consulte [Validação do lançamento](launch-validation/) para os detalhes.


### Os playbooks já não veem as definições da aplicação

Um playbook já não herda as variáveis de ambiente que o próprio AnsibleForms lê: `ENCRYPTION_SECRET`, as definições `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, as definições `VAULT_*`, todas as outras variáveis documentadas e todas as variáveis `MYSQL_*`.
O resto do ambiente do RTE, como `PATH`, proxies, definições `ANSIBLE_*` e credenciais de cloud, é passado como antes.

Um playbook que lia uma destas com `lookup('env', ...)` tem de obter o valor de outra forma: passe-o como extravar ou como
credencial, ou defina-o no RTE com outro nome.

### Só a função admin gere runners e administradores

Um utilizador com acesso às definições deixa de ter controlo total sobre quem é administrador e para onde vão as credenciais:

- **Runners:** só a função admin adiciona, altera ou elimina um runner, porque um runner recebe as credenciais das tarefas
  que executa. Os utilizadores com acesso às definições continuam a poder ver e testar runners.
- **Contas e grupos de administrador:** só a função admin concede admin. Sem ela, um utilizador não pode colocar uma conta num grupo que a
  função admin indique, nem alterar, repor ou eliminar uma conta de administrador ou um grupo desses.
- **Funções:** um designer sem a função admin não pode alterar as funções. Uma gravação ou um restauro cujas funções sejam diferentes é recusado.

Dê a função admin a quem gere runners, administradores e funções.

### A palavra-passe predefinida tem de ser alterada

Um utilizador que inicia sessão com a palavra-passe predefinida pública `AnsibleForms!123` tem de a alterar primeiro. Até lá, todas as outras chamadas
à API respondem `403` com o código `password_change_required`, e o navegador mostra a página de alteração da palavra-passe.

Inicie sessão uma vez e escolha uma nova palavra-passe, ou defina [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) antes do
primeiro arranque. Os scripts que iniciam sessão com a palavra-passe predefinida têm de usar outra.

### Os tokens terminam ao terminar sessão e ao alterar a palavra-passe

Terminar sessão passa a terminar os tokens dessa sessão, e alterar a palavra-passe termina todas as sessões desse utilizador, por isso inicie sessão novamente depois de
alterar uma palavra-passe.

Um token de API pedido com `?expiryDays=` dura no máximo [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) dias
(90 por predefinição). Os scripts que usam tokens de API de longa duração têm de pedir um novo antes de expirar.

### O Entra ID precisa do seu tenant

O início de sessão com Entra ID (Azure AD) passa a usar OpenID Connect apenas contra o seu próprio tenant, e um utilizador de outro tenant não pode iniciar
sessão. Um fornecedor sem ID de tenant, ou com `common`, `organizations` ou `consumers`, é recusado.

- **Defina o ID do tenant** no fornecedor de SSO: o ID de diretório (tenant), um GUID, ou o domínio do tenant.
- **Conceda as permissões do Graph:** o início de sessão pede `openid profile email User.Read GroupMember.Read.All`. Dê ao registo da
  aplicação as permissões delegadas do Microsoft Graph `User.Read` e `GroupMember.Read.All`, com consentimento de administrador.
- **Prefira IDs de grupo nas funções:** indique um grupo como `azuread/<object id>` (`entraid/<object id>` a partir da 7.3.0) em vez de pelo seu nome a apresentar.

Consulte [Entra ID](authentication/entra-id.html) para a configuração.

### As palavras-passe têm um comprimento mínimo

Uma palavra-passe local definida através da aplicação precisa de pelo menos
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) caracteres (8 por predefinição), e não pode ser o nome de utilizador nem a
palavra-passe predefinida. `PASSWORD_MIN_LENGTH=0` desativa a verificação do comprimento. As palavras-passe existentes continuam a funcionar.

### Execute os contentores com uma política de reinício

Uma exceção não tratada passa a terminar o processo, registada com o nível `crit`, em vez de o deixar a correr num estado desconhecido. Execute
os contentores com uma política de reinício, como `--restart unless-stopped` com Docker (o projeto docker-compose define-a).
O Kubernetes reinicia os pods sozinho.

### Ligações AWX e a ligação de início

Mais duas coisas desaparecem na 7, sem nada a fazer na 6.5:

- **Ligações AWX e AAP:** a tabela `awx`, `/api/v2/awx` e a página A.A.P. desapareceram. A atualização move cada ligação AWX ou
  AAP para **Ligações → Runners**, como um runner do tipo `awx`, e os formulários com `awx:` continuam a funcionar.
- **`NAV_HOME_LABEL` e `NAV_HOME_ICON`:** deixam de ser lidas. A primeira ligação do cabeçalho é sempre Formulários.

### Descontinuado na 7, removido na 8

Estes ainda funcionam na 7, mas cada um regista um aviso quando é usado. Passe para a substituição antes da versão 8:

| Descontinuado | Use em vez disso |
|---|---|
| Variáveis de ambiente `VAULT_*` | Um cofre de segredos chamado `vault` (**Ligações → Cofres de segredos**). O primeiro arranque da 7 importa as variáveis uma vez como esse cofre e depois ignora-as. |
| Variáveis de ambiente `LOG_SYSLOG_*` | Um servidor syslog (**Ligações → Syslog**). Quando `LOG_SYSLOG_HOST` está definida, o primeiro arranque da 7 importa-as uma vez como o servidor `syslog`, que recebe o registo do servidor como antes, e depois ignora-as. Para enviar também as entradas de auditoria, configure-o para receber ambos. |
| `vault_path` numa credencial (API, config seed) | `secret_store` e `secret_ref`. Consulte [Cofres de segredos](secret-stores/). |
| A função `public` em `config.yaml` | A função `default`. O ficheiro é alterado quando a configuração é carregada; altere à mão um template ytt. `public` no `roles:` de um formulário continua a corresponder. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` num formulário ou num passo | `approval`. `hasApproval` não tem efeito. |
| `awx: <name>` num formulário | `runner: <name>`. Uma ligação AWX é um runner do tipo `awx`. |
| `type: multistep` num formulário, com os seus `steps` | `type: workflow`, com nós que indicam um `runner`. Consulte [Formulários de workflow](forms/workflow.html). |
| A secção `awx:` do config seed | Itens `runners:` com `type: awx` |
| `LOCK_PATH` | Nada: deixa de ser lida, o bloqueio do designer é guardado na base de dados. |
| Um RTE em modo base de dados, desde a 7.3.0: `RTE_MODE=database` ou sem `RTE_MODE`, com os `DB_*` da base de dados e o `ENCRYPTION_SECRET` no RTE | `RTE_MODE=outbound` ou `RTE_MODE=inbound`, sem `DB_*`. O RTE adere uma vez com um token de adesão (`RTE_JOIN_TOKEN`), ou o seu runner é definido com esse modo em **Ligações → Runners** ou no config seed (`rte_mode`). Consulte [Modos](rte/modes.html). |
| `RTE_REGISTER`, desde a 7.3.0 (apenas modo base de dados) | Um token de adesão (`RTE_JOIN_TOKEN`): o RTE adiciona-se a si próprio como um runner que inicia sessão com uma credencial de RTE. |
| Uma credencial `api` ou `userpass` num runner do config seed, desde a 7.3.0 | Uma credencial do tipo do runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` ou `jenkins`), com o seu servidor em `url`. |
| Um runner do config seed com o seu próprio `token`, ou `username` e `password`, desde a 7.3.0 | Uma credencial do tipo do runner na secção `credentials`, com o seu servidor em `url`, que o runner indica com `credential:`. Entretanto, o seed cria uma com o nome do runner. |

`ENABLE_SSO` e `SSO_AUTO_LOGIN` deixaram de ser lidas desde a 7.3.0. O primeiro arranque da 7.3 transporta-as uma vez: `ENABLE_SSO=0` desativa
todos os fornecedores de SSO, e `SSO_AUTO_LOGIN=1` marca **Saltar a página de início de sessão** no único fornecedor ativado. Depois são ignoradas: cada arranque
regista um aviso enquanto estiverem definidas, e cada fornecedor tem **Ativado** e **Saltar a página de início de sessão** em **Acesso → SSO**.

---

## Tags da imagem

`latest` passa para a 7 com a 7.0.0. Para ficar na 6, use a tag `6` (ou `6.5`) em vez de `latest`.
Todas as tags estão listadas em [Tags da imagem](installation/#image-tags).

---

## Reverter

Faça uma cópia de segurança antes de atualizar (**Definições → Cópias de segurança**). A 6.5 corre numa base de dados atualizada para a 7, mas só
a cópia de segurança restaura as definições de datasources eliminadas.

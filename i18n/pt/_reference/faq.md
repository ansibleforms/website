---
layout: default
title: FAQ
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# Perguntas frequentes
{: .no_toc }

Perguntas e respostas comuns sobre o AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Primeiros passos

### Topologia da implementação: um contentor ou vários nós

Por predefinição, um contentor AnsibleForms executa a aplicação web e o trabalho em segundo plano num único processo, ao lado de um contentor RTE que
executa os playbooks. Execute-o com uma política de reinício (por exemplo `restart: unless-stopped` no Docker), e faça cópias de segurança tanto da base de dados como
do volume persistente.

Para executar várias réplicas por trás de um balanceador de carga, divida o processo com `AF_ROLE`:

- os nós `app` servem a interface web e a API: execute quantos quiser, cada um com o mesmo `ACCESS_TOKEN_SECRET`
- um `worker` executa o trabalho em segundo plano: o esquema e as suas atualizações, o config seed, os agendamentos, a cópia de segurança noturna, as sincronizações
  dos repositórios e as limpezas. Trabalha um worker de cada vez, que detém um bloqueio na base de dados; um segundo espera e assume quando o primeiro para
- os contentores `rte` executam os playbooks: execute mais para executar mais playbooks em simultâneo

Os nós da aplicação e o worker partilham a base de dados, o volume persistente e o `ENCRYPTION_SECRET`. Um RTE num modo socket (outbound ou
inbound, consulte [Modos](rte/modes.html)) não precisa nem da base de dados nem do `ENCRYPTION_SECRET`. O assistente de chat precisa de sessões persistentes (sticky sessions), e
cada nó mantém o seu próprio registo. Consulte [Escalar](production/scaling.html) e a configuração
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Gestão de formulários em vários repositórios

Os formulários de todos os repositórios Git com **Usar para formulários ?** ativado são juntados automaticamente; em caso de nomes de formulários duplicados, o primeiro
ganha e é registado um aviso. Mantenha o `config.yaml` num único repositório. Consulte [Repositórios git](repositories/).

### Sobre os repositórios

O AnsibleForms clona e atualiza repositórios Git no caminho dos repositórios (`REPO_PATH`), geridos em **Definições > Repositórios**.
Os interruptores de cada repositório definem o que ele contém: configuração, formulários, playbooks ou ficheiros de variáveis. Consulte [Repositórios git](repositories/).

### Validação no VS Code para ficheiros de formulários

Adicione um cabeçalho de esquema aos seus ficheiros YAML de formulários para obter validação em direto e preenchimento automático no VS Code.

Instale a [extensão YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) e adicione este comentário como **primeira linha** de qualquer ficheiro de formulário:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Isto funciona tanto para ficheiros com um único formulário (um dicionário YAML) como para ficheiros com vários formulários (uma lista YAML):

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
- name: My Form
  type: ansible
  playbook: site.yml
  roles: [default]
  fields:
    - name: env
      type: enum
      values: [dev, staging, prod]
```

O VS Code realça as propriedades desconhecidas, os campos obrigatórios em falta e os tipos incorretos à medida que escreve.

---

## Gestão de tarefas

### Relançar uma tarefa com os dados preenchidos

O botão de relançar abre o formulário preenchido com os valores da tarefa anterior; os campos de palavra-passe nunca são guardados.
Exige a opção de função `allowJobRelaunch`, e um formulário pode desativá-lo com `allowRelaunch: false`. Consulte [Relançar uma tarefa](jobs/actions.html#relaunch-a-job).

### Ficheiro de registo da tarefa

Acompanhe o progresso através de um ficheiro de registo específico da tarefa (v6.1.2).

O AnsibleForms pode mostrar um **ficheiro de registo específico da tarefa** ao lado da saída do Ansible. Isto permite acompanhar o progresso de módulos personalizados de longa duração que, de outra forma, não dariam nenhum retorno visível durante a execução.

{: .note }
> Esta funcionalidade só funciona para playbooks executados num RTE. Os templates e jobs no AWX, AAP, Ascender, Semaphore, Rundeck ou
> Jenkins não têm ficheiro de registo.

**Como funciona:**
- Durante a execução de uma tarefa, o RTE vigia um ficheiro de registo num caminho conhecido dentro da pasta do playbook
- A cada dois segundos, quando o ficheiro mudou, o RTE copia o seu conteúdo para a tarefa, e uma vez mais quando o playbook termina
- O ficheiro de registo é mostrado numa secção **Arquivo de log** da saída da tarefa, numerado como as linhas da saída: a data e hora e o nível de uma linha do registo (ERROR, WARNING, INFO, DEBUG) são lidos e coloridos como na saída, e as cores ANSI são suportadas

**Convenção do caminho do ficheiro de registo:**

O ficheiro de registo tem de ser escrito neste caminho:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**O AnsibleForms passa `__jobid__` automaticamente**, por isso pode montar o caminho no seu playbook sem qualquer configuração adicional:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Passe esta variável a qualquer role ou módulo personalizado que deva escrever o progresso no ficheiro.

**Responsabilidades de quem desenvolve o playbook / módulo:**
- **Criar** o ficheiro de registo (e o seu diretório `.joblogs/`) no início da operação
- **Escrever** mensagens de progresso com significado à medida que a operação avança

O RTE elimina o ficheiro assim que o playbook termina e o último conteúdo fica guardado na tarefa.

**A codificação de cores ANSI é suportada.**  
Os códigos de escape ANSI padrão (por exemplo, `\033[92m` para verde e `\033[91m` para vermelho) nas suas mensagens de registo são apresentados como cores na interface, para que os estados de sucesso, aviso e erro se distingam num relance.

**Caso de utilização típico:**  
Um módulo Ansible personalizado em Python que executa uma longa sequência de chamadas à API ou de operações sobre dados (por exemplo, um workflow de DR com SnapMirror) pode acrescentar uma linha por passo ao ficheiro de registo. Um operador que acompanhe a tarefa no AnsibleForms vê então o progresso em direto na secção Arquivo de log, à medida que a página da tarefa a acompanha.

### Jobid

Passe o ID da tarefa atual.

O AnsibleForms envia automaticamente o ID da tarefa atual nas extravars como `__jobid__`; não é necessária nenhuma configuração.

### Informação do utilizador

Passe o utilizador atual.

O AnsibleForms envia automaticamente a informação do utilizador nas extravars como `ansibleforms_user`; não é necessária nenhuma configuração.

Pode escolher quanta informação é enviada. `EXTRAVARS_USER_FIELDS` aceita uma lista de chaves de nível superior separadas por vírgulas
(`username,email,type`), ou `none` para não enviar nada; um formulário pode substituí-la com a sua própria propriedade `userExtravars`.
A predefinição é o objeto completo, como antes. O `__user__` do lado do formulário, descrito abaixo, vem do token de início de sessão e nunca é afetado.

### Informação do utilizador no formulário

Aceda à informação do utilizador atual no formulário (v4.0.2).

O campo `__user__` é adicionado automaticamente ao formulário e pode ser referenciado nas expressões:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Campos de formulário

### Listas pendentes encadeadas

Crie listas pendentes encadeadas.

Os campos `enum` (listas pendentes) podem conter placeholders na sua propriedade `query` ou `expression`, no formato `$(another_field)` ou `$(another_field[0].name)`.  
Assim que o campo referenciado muda, o campo que o referencia é avaliado novamente, o que resulta em listas pendentes dinâmicas e encadeadas.  
A aplicação web do cliente reavalia os campos a cada 100 ms; com os processadores atuais e o motor Chromium, a experiência é fluida.

{: .note }
> Uma referência a outro campo enum devolve os valores selecionados, **e não** a lista pendente completa. Use a propriedade `placeholderColumn` ou a notação de ponto, como `$(city.name)`.  
> **Novo na v4.0.20**: definir placeholderColumn como "*" devolve o registo completo em vez de uma única coluna.

Os exemplos consultam `CONN1`, uma [base de dados](databases.html) de Ligações > Bases de dados (a partir da 7.5.0) ou uma credencial do tipo base de dados.

```yaml
- type: enum
  dbConfig: CONN1
  query: select name from cmdb.city
  name: city_name
  label: Select a city
  default: Amsterdam
  required: true
  model: cmdb.city
  group: CMDB
- type: enum
  dbConfig: CONN1
  query: select datacenter.name from cmdb.datacenter,cmdb.city where datacenter.city_id=city.id
    and city.name='$(city_name)'
  name: datacenter_name
  label: Select a datacenter
  default: __auto__    # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB      

# or use the placeholderColumn property

- type: enum
  dbConfig: CONN1
  query: select id,name,description from cmdb.city
  name: city
  label: Select a city
  default: Amsterdam         # evaluated against valueColumn
  required: true
  model: cmdb.city
  group: CMDB
  valueColumn: name          # we choose the name column as value for placeholders
  placeholderColumn: id      # we can reference the id by using $(city)
  previewColumn: description # when you select a value, the dropdown will show description
  columns:                   # we hide id
  - name
  - description
- type: enum
  dbConfig: CONN1
  query: select name, capacity_pct from cmdb.datacenter where datacenter.city_id=$(city)
# this cascaded dropdown will react using "id" as placeholder
# or "query":"select name from cmdb.datacenter where datacenter.city_id=$(city.id)",  
# or reference the column in the placeholder                            
  name: datacenter_name
  label: Select a datacenter
  default: __auto__         # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  pctColumns:
  - capacity_pct
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB
```

### Placeholders de campos

Referencie o valor de outro campo.

Os placeholders são referências a outros campos do formulário.  
Um placeholder tem sempre o formato `$(reference)`, e tanto as expressões como as consultas podem conter placeholders.  
Um placeholder que aponta para um campo simples (text, number, password) contém o valor desse campo.  
Um placeholder que aponta para um campo enum baseado em objetos tem de usar a propriedade `placeholderColumn` ou a notação de ponto, como `$(city.name)`.  
Um placeholder que aponta para um campo de expressão devolve o objeto completo, ou pode usar uma referência avançada, ao estilo de JavaScript, como `$(myarray[0].name)`.

{: .important }
> O placeholder é substituído **antes** de a expressão ser avaliada. Se espera que o resultado seja uma string, tem de o envolver em aspas.  
> **Novo na v4.0.20**: definir placeholderColumn como "*" devolve o registo completo em vez de uma única coluna.

```yaml
- name: field1
  type: expression
  expression: "[{name: 'foo'},{name: 'bar'},{name: 'ansible'}]"
  runLocal: true
- name: field2
  type: expression
  expression: "'$(field1[0].name)'"  # result : 'foo' (note the wrapping quotes)
  runLocal: true
- name: field3
  type: expression
  expression: "$(field1)[0].name"  # result : {name: 'foo'}.name => 'foo'  
  runLocal: true    
- name: field4
  type: expression
  expression: "$(field1).slice(-1)[0].name"  # result : {name: 'ansible'}.name => 'ansible' 
  runLocal: true
- name: field5
  type: enum
  expression: $(field1).filter(x => x.name.includes('a'))   # result : [{name: 'bar'},{name: 'ansible'}]
  runLocal: true
  default: __auto__                                         # result: bar
- name: field6
  type: expression
  expression: "'$(field5)'"   # result : the selected item from field5 (default=bar)
  runLocal: true        
```

### Ocultar um campo

Oculte um campo.

Oculte um campo com a propriedade de campo `hide`, ou mostre-o e oculte-o dinamicamente com as propriedades de campo `dependencies` e `dependencyFn`.

### Agrupar campos

Agrupe campos num bloco.

Use a propriedade de campo `group`. Os campos com o mesmo nome de grupo ficam agrupados num bloco.

### Validação de campos

Valide um campo.

Use as propriedades de validação do campo, como `regex`, `minValue` e `notIn`.

### Valor predefinido num enum

Valor predefinido de um enum.

A propriedade de campo `default` define um valor predefinido, e nos campos `enum` pode usar valores como `__auto__` para selecionar automaticamente o primeiro item.

Para uma predefinição dinâmica baseada numa expressão, mova o item predefinido para o topo da lista, como no exemplo seguinte.

```yaml
# using client javascript manipulation

- type: expression
  expression: "[{name:'bert'},{name:'ernie'},{name:'pino'}]"
  name: dropdownsource
  label: Dropdown source
  runLocal: true
- type: expression
  expression: "'pino'"
  name: dropdownsourceDefault
  label: Default source
  runLocal: true
- type: enum
  expression: "[...[{name:'$(dropdownsourceDefault)'}],...$(dropdownsource).filter(x => x.name!=='$(dropdownsourceDefault)')]"
  name: dropdownwithdefault
  label: Example with expression default by moving it to top
  runLocal: true
  default: __auto__     

# explained : 
# we take our default and merge it with the source where we filter out the default (to avoid doubles)    
# the default is thus shifted to the first element, which we can now select with the default `__auto__`
```

### Valor predefinido com uma expressão

Valor predefinido a partir de uma expressão.

Para campos de texto, número ou data, a propriedade `default` define um valor predefinido estático.

Para tornar a predefinição dinâmica, baseada numa expressão, use uma de duas propriedades:
* `editable`: use a propriedade editable para tornar editável um campo de expressão
* `evalDefault`: use a propriedade evalDefault para avaliar a predefinição como uma expressão

```yaml
# using editable
- type: expression
  expression: "'$(some_other_field)'.toLowerCase()"
  name: field1
  runLocal: true
  editable: true # this will add an edit-button so you manually overwrite the expression value

# using evalDefault
- type: text
  name: field1
  default: "'$(some_other_field)'.toLowerCase()"
  evalDefault: true # it will treat the default as if it was an expression.
  # note : when `some_other_field` changes, the default will be re-evaluated
  # note2 : works for other fields too.

# more complex evalDefault example
- name: checkbox
  type: checkbox
- name: textfield1
  type: text
  line: line2
  default: ping
- name: textfield2
  type: text
  line: line2
  default: pong
- name: checkbox3
  type: checkbox
  line: line3
  label: This checkbox will default check if checkbox or textfield1==textfield2
  default: |
    (
      (c=false,t1="",t2="") => { return c || (t1==t2) }
    )( $(checkbox) , "$(textfield1)" , "$(textfield2)" )
    
  evalDefault: true
```

---

## Wizard e workflows

### Qual é a diferença entre um wizard e um workflow?

Um **wizard** e um **workflow** funcionam ambos por passos, mas atuam em camadas diferentes e podem ser combinados.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Camada** | Execução | Formulário / interface |
| **O que divide** | A tarefa em nós que correm uns a seguir aos outros, ou lado a lado | Os dados de um formulário em várias páginas |
| **Resultado** | 1 tarefa de workflow, com uma tarefa por nó (cada uma com o seu próprio playbook ou template) | 1 tarefa é executada no fim |
| **`type` do formulário** | Tem de ser `workflow` | Funciona com todos os tipos de formulário exceto `subform` |
| **Definido por** | Um [ficheiro de workflow](workflows/file.html) do designer (`workflow:`) | Uma lista de referências a [subforms](forms/subform.html) (`wizard:`) |
| **Use-o quando** | "Faz A, depois B, depois C como tarefas separadas" | "O meu formulário tem demasiados campos para uma página" |

**Ideia principal:** um workflow trata de *o que é executado e por que ordem*; `wizard` trata de *como o utilizador preenche o formulário*.

{: .note }
> O tipo de formulário `multistep`, com os seus `steps`, fazia a parte da execução antes da 7. Está descontinuado desde a 7 e é removido na
> 8: um workflow faz tudo o que um multistep faz, consulte [Formulários multistep](forms/multistep.html).

#### Só workflow
{: .no_toc }

Um formulário `type: workflow` executa um dos workflows do designer. O utilizador preenche uma única página de campos e carrega em Submeter,
e o workflow executa os seus nós, cada um com os valores do formulário como extra vars:

```yaml
- name: Provision host
  type: workflow
  workflow: provision-host
  roles:
    - default
  fields:
    - name: hostname
      type: text
```

#### Só wizard
{: .no_toc }

Um bloco `wizard:` num formulário distribui a recolha de dados por várias páginas. Só **uma** tarefa é executada no fim: as extravars juntadas de todas as páginas são enviadas para um único playbook, template ou workflow.

```yaml
- name: Provision host
  type: ansible
  roles:
    - default
  playbook: provision.yml
  wizard:
    - subform: basics
      title: Basics
    - subform: network
      title: Network
      defaultModel: net

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: ipv4
      type: text
```

Uma página de revisão só de leitura é acrescentada automaticamente como última página do wizard; não a declara no YAML.

#### Combinados (wizard sobre um workflow)
{: .no_toc }

Um wizard pode ser colocado por cima de um formulário de workflow. O utilizador preenche as páginas do wizard e carrega em Submeter, e **só então** o
workflow começa. Fazendo corresponder o `defaultModel` de um passo do wizard com o
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) de um nó, pode encaminhar **uma página do wizard para um nó**:

```yaml
- name: Provision and verify host
  type: workflow
  workflow: provision-host
  roles:
    - default
  wizard:
    - subform: basics
      title: Basics
      defaultModel: basics            # wraps basics fields under `basics`
    - subform: network
      title: Network
      defaultModel: network           # wraps network fields under `network`
```

E o workflow `provision-host`, num ficheiro de workflow do designer:

```yaml
workflow_job_templates:
  - name: provision-host
    related:
      workflow_nodes:
        - identifier: create
          unified_job_template:
            name: create_host.yml
            type: job_template
          extra_vars_key: basics      # only sees the basics page payload
          related:
            success_nodes:
              - identifier: network
        - identifier: network
          unified_job_template:
            name: configure_network.yml
            type: job_template
          extra_vars_key: network     # only sees the network page payload
```

`extra_vars_key` é uma procura de um só nível, por isso use um nome simples em `defaultModel` (por exemplo, `defaultModel: basics`, e não `defaultModel: input.basics`) quando quiser que correspondam.

Consulte a [página Wizard](forms/wizard.html) para a referência completa das propriedades.

### Como mostro ou salto passos do wizard consoante uma condição?

Use `when:` para **ocultar** um passo por completo, ou `optional: true` para deixar o utilizador **saltar** um passo visível. Os dois são independentes e, em geral, não devem ser combinados.

#### `when:`: visibilidade condicional
{: .no_toc }

O passo fica oculto quando a expressão dá um valor falso. O utilizador nunca o vê, e os seus valores não são recolhidos. A expressão pode ler os passos anteriores através de `__parent__.<stepname>.<field>`:

```yaml
wizard:
  - subform: basics             # has a `kind` enum field with values vm/bare-metal/container
    title: Basics
  - subform: virtualization
    title: Virtualization
    when: $(__parent__.basics.kind) === 'vm'
  - subform: hardware
    title: Hardware
    when: $(__parent__.basics.kind) === 'bare-metal'
```

Só é mostrada a página que corresponde ao `kind` escolhido. Os passos a seguir a um oculto são renumerados automaticamente.

#### `optional: true`: permitir saltar um passo visível
{: .no_toc }

O passo é **sempre mostrado** no indicador de passos, mas o utilizador pode carregar em **Seguinte** sem o preencher, e **Submeter** é permitido mesmo que a página nunca tenha sido visitada ou concluída:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

O utilizador pode abrir a página Advanced, deixá-la vazia, carregar em Seguinte e passar diretamente para a página de revisão.

{: .note }
> `when:` controla a *visibilidade*; `optional:` controla *se a página tem de ser concluída*. Não os combine: para fazer desaparecer uma página, use `when:`; para a manter visível mas dispensável, use `optional:`.

### Como faço referência a valores de um passo anterior do wizard?

Use `$(__parent__.<stepname>.<field>)` dentro de qualquer campo de um passo posterior.

O `name` de um passo do wizard (por predefinição o nome do seu `subform`) é o espaço de nomes sob o qual os seus valores são expostos aos passos seguintes:

```yaml
- name: Provision host
  type: ansible
  playbook: provision.yml
  roles:
    - default
  wizard:
    - subform: basics          # step name defaults to "basics"
      title: Basics
    - subform: network
      title: Network

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: fqdn
      type: text
      # Re-evaluated when basics.hostname changes
      default: $(__parent__.basics.hostname).local
```

É o mesmo mecanismo `__parent__` que os subforms de `list` e `yaml` usam; consulte [Como acedo aos dados do formulário pai dentro de um subform?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Segurança e credenciais

### Credenciais

Passe credenciais.

As credenciais podem ser passadas de várias formas:
* usando a propriedade de campo `asCredential`  
* usando a propriedade de formulário `credentials` (pares chave-valor)
* usando uma extravar chamada `__credentials__`

```yaml
# assume you have 2 credentials created in Ansible Forms
# 1: vcenter
# 2: ad

# you want them exposed to the playbook as
# 1: vc_cred
# 2: ad_cred

# Method 1 : using asCredential field-property
fields:
- name: vc_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'vcenter'"
- name: ad_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'ad'"

# Method 2 : using credentials form-property   
name: myplaybook
type: ansible
playbook: myplaybook.yaml
roles:
  - default
credentials:
  vc_cred: vcenter
  ad_cred: ad
  veeam_cred : veeam_prod,veeam_dev # will first try veeam_prod, then as fallback veeam_dev

# Method 3 : using __credentials__ extravar
fields:
- name: __credentials__
  type: expression
  runLocal: true
  expression: "{vc_cred: 'vcenter',ad_cred: 'ad',veeam_cred:'$(veeam_server)'}"
  # note : in the expression you can use placeholders to make them dynamic
```

### Recuperar uma palavra-passe de administrador perdida

Se perdeu a palavra-passe da conta local `admin` e não há outro utilizador administrador disponível, use a opção de recuperação `REINIT_ADMIN`. **Isto não é um bypass da autenticação em tempo de execução**: apenas força uma reposição única da conta de administrador local no arranque, após a qual a autenticação normal continua.

**Como funciona**

Quando `REINIT_ADMIN=1` está definido no arranque, o AnsibleForms:

1. Garante que o grupo `admins` existe (criando-o se faltar).
2. Procura o utilizador administrador local (nome de utilizador predefinido `admin`, substituído por `ADMIN_USERNAME`).
3. Se existir, repõe a sua palavra-passe com o valor de `ADMIN_PASSWORD` e volta a associá-lo ao grupo `admins`.
4. Se não existir, cria-o (como numa instalação nova).
5. Regista a ação de forma bem visível para que apareça nos registos.

**Passos**

1. Pare o AnsibleForms.
2. Defina as variáveis de ambiente (use uma palavra-passe forte):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   No Docker Compose, adicione-as ao bloco `environment:` do serviço do AnsibleForms.
3. Inicie o AnsibleForms e procure nos registos uma linha como:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Inicie sessão com `admin` / `YourNewStrongPasswordHere`.
5. **Remova `REINIT_ADMIN` (ou volte a defini-la como `0`)** e reinicie, para que os reinícios futuros não voltem a repor a palavra-passe do administrador.

**Notas**

- Se ficou sem acesso porque o LDAP era o único método de início de sessão configurado e falhou, a conta local `admin` recuperada recorre sempre à autenticação pela base de dados local, o que basta para iniciar sessão e corrigir o LDAP.
- A antiga variável de ambiente `ENABLE_BYPASS` foi removida. Permitia iniciar sessão como admin com qualquer palavra-passe e não era seguro deixá-la ativada. `REINIT_ADMIN` apenas repõe a palavra-passe; a autenticação normal aplica-se depois.
- `REINIT_ADMIN` não invalida as sessões nem os tokens existentes; só mudam o hash da palavra-passe e a pertença ao grupo.

### Restringir os destinos dos auxiliares REST (listas de permissão e de bloqueio)

Os auxiliares `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` e `fn.fnRestJwtSecure` podem ser chamados a partir das propriedades `expression` dos formulários para obter dados por HTTP. Por predefinição, quem escreve as expressões pode apontar para **qualquer** URL que o host do AnsibleForms consiga alcançar, o que pode querer limitar numa rede sensível.

Duas variáveis de ambiente fornecem uma lista de permissão e uma lista de bloqueio:

| Variável | Comportamento |
|---|---|
| `REST_ALLOWED_HOSTS` | Nomes de host ou CIDRs separados por vírgulas. Quando definida, **só** estes destinos são permitidos. |
| `REST_DENIED_HOSTS` | Nomes de host ou CIDRs separados por vírgulas. Sempre bloqueados. Tem precedência sobre a lista de permissão. |

Os nomes de host são comparados com o host do URL sem distinguir maiúsculas de minúsculas. Os CIDRs são comparados com todos os IPs para que o host resolve, por isso `10.0.0.0/8` bloqueia qualquer nome DNS que resolva para o intervalo privado.

**Exemplos:**

A primeira linha permite apenas dois hosts; a segunda bloqueia destinos específicos:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Esta proteção só protege o processo Node.js do AnsibleForms.** Assim que um playbook é executado, o próprio Ansible pode chegar a qualquer coisa a partir do host, fora do controlo do AnsibleForms. Use estas listas para impedir que quem escreve formulários transforme as expressões num proxy para serviços de metadados ou interfaces internas; não conte com elas como firewall de rede.

Desde a 7.3.0 os auxiliares REST verificam o certificado TLS do endpoint, tal como todas as outras ligações, e desistem ao fim de
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (`60` por predefinição). Confie numa CA privada com
`NODE_EXTRA_CA_CERTS`, ou defina [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) como `1` apenas para endpoints com um
certificado autoassinado.

### Integração com o HashiCorp Vault

As credenciais podem ler o seu utilizador e a sua palavra-passe a partir do HashiCorp Vault, configurado como
**cofre de segredos**. Consulte [Cofres de segredos](secret-stores). As variáveis de ambiente `VAULT_*`
das versões anteriores são importadas uma vez como o cofre `vault` no primeiro arranque da 7.x.

Para segredos usados apenas dentro de um playbook, também pode usar o plugin de lookup `community.hashi_vault`,
que lê diretamente do Vault e contorna o AnsibleForms.

---

## Integração

### Consultar o AWX/Tower/AAP

Consulte informação do AWX ou do Ansible Automation Platform.

Para preencher listas pendentes com dados do AWX ou do Tower, use `fn.fnRestBasic` ou `fn.fnRestJwtSecure`. Desde a 7.3.0 estes auxiliares verificam
o certificado do endereço do AWX: com um autoassinado, confie na sua CA com `NODE_EXTRA_CA_CERTS`, ou defina
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) como `1`.

```yaml
name: Query awx
type: awx
runner: myAwxConfigName # a runner of type awx
template: my_template # will be overwritten by the field __template__
description: ""
awxCredentials:
  - vmware
executionEnvironment: my_execution_environment
roles:
  - default
categories: []
inventory: my_inventory # will be overwritten by the field __inventory__
tileClass: bg-info-subtle
icon: bullseye
fields:
  # make sure you add credentials called "awx_rest" where the password holds the token
  # if you like basic authentication, switch the expressions below to fn.fnRestBasic instead

  - name: organization
    label: Organization
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/organizations','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: id # => we want the organisation field to hold the id !!
  - name: __template__  # use this special name to override the template from the form
    label: Template
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/job_templates?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name
  - name: __inventory__  # use this special name to override the inventory from the form
    label: Inventory
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/inventories?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name    
  - name: __awxCredentials__  # use this special name to override the credentials from the form
    label: Credentials
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/credentials?organization=$(organization)','','awx_rest','[.results[]]')"
    multiple: true
    default: __auto__
    columns:
      - name
    valueColumn: name     
  - name: __executionEnvironment__  # use this special name to override the executionEnvironment from the form
    label: Execution environment
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/execution_environments?organization=$(organization)','','awx_rest','[.results[]]')"
    default: __auto__
    columns:
      - name
    valueColumn: name           
```

---

## Personalização

### Personalização

Personalize o AnsibleForms.

O AnsibleForms é uma aplicação web. Quando o executa de forma nativa em Node.js, pode substituir ou alterar os seus ficheiros.  
A abordagem recomendada, no entanto, é executá-lo como imagem Docker e adicionar mapeamentos de volumes ou de ficheiros. Os projetos Docker Compose já mapeiam diretórios para manter persistentes a base de dados, os playbooks, os registos, os certificados e as chaves SSH, e pode adicionar mais mapeamentos. Um logótipo personalizado é carregado na página de definições **Logótipo**.  
O ficheiro `custom.js` contém as suas próprias funções JavaScript para usar nas expressões. As funções incorporadas usam o prefixo `fn.` (por exemplo, fn.fnRestBasic); as funções personalizadas usam o prefixo `fnc.`.  
Da mesma forma, pode adicionar as suas próprias definições jq no ficheiro `jq.custom.definitions`.

```yaml
volumes:
  # Mount application folder to host folder (to maintain persistency)
  - ./data:/app/dist/persistent
  # Map custom functions for js expressions and jq
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
  # Map custom sshkey to local node .ssh location
  - ./data/ssh:$HOME_DIR/.ssh
  - ./data/git/.gitconfig:$HOME_DIR/.gitconfig
```

### Ativar o YTT

Ative o ytt.

Para usar o ytt, defina `USE_YTT=1`.  
Para mais informação sobre o ytt, consulte https://carvel.dev/ytt/.

{: .important }  
> Esta funcionalidade não foi testada de forma extensiva, e não foi recebido nenhum feedback desde que foi adicionada como melhoria.  
> Ao usar o ytt, tem de desativar o designer: o designer converte os ficheiros YAML em JSON intermédio e descarta a sintaxe do ytt (que consiste em comentários YAML).

Tem de existir um diretório `lib` no diretório raiz; é incluído automaticamente na chamada ao ytt.
Os dados podem ser fornecidos globalmente definindo variáveis de ambiente com prefixo:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Em alternativa, forneça ficheiros de dados de bibliotecas:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**A biblioteca `demo` tem de existir no contexto do ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Os dados carregados podem então ser usados:

```yaml
# config.yaml
#@ load("@ytt:data", "data")
#@ load("@ytt:library", "library")
#@ demo = library.get("demo")
---
categories:
  - name: Default
    icon: bars
roles:
  - name: admin
    groups:
      - local/admins
constants:
  data_values: #@ data.values
  demo: #@ demo.data_values()
```

---

## Controlo de acesso

### Como restrinjo o que os utilizadores podem fazer (opções de função)?

Para além de restringir que formulários uma função pode ver, as `options` de uma função ativam ou desativam funcionalidades da interface para os seus membros.
Consulte [Opções de função](config/roles.html#role-options) para conhecer cada opção, a sua predefinição e a forma como as opções se combinam entre funções.

### Como implemento uma lógica RBAC própria nos meus playbooks ou formulários?

A identidade do utilizador está disponível tanto no frontend como no backend em cada execução.

Em cada submissão de um formulário, o AnsibleForms injeta automaticamente a identidade completa do utilizador atual nas extravars enviadas ao Ansible:

```yaml
ansibleforms_user:
  username: jane.doe
  groups:
    - local/admins
    - ldap/network-team
  roles:
    - admin
    - operators
  options:
    showLogs: true
    allowJobRelaunch: true
    # ...all resolved role options
```

O seu playbook ou qualquer módulo Ansible personalizado pode portanto usar `ansibleforms_user` diretamente para decisões detalhadas, por exemplo para permitir apenas a certos grupos alterar o inventário de produção, ou para escrever um registo de auditoria com o nome de utilizador de quem submeteu.

No **frontend**, o mesmo objeto está disponível através do campo especial `__user__`:

```yaml
fields:
  - name: is_admin
    type: expression
    runLocal: true
    hide: true
    expression: "$(__user__.roles).includes('admin')"

  - name: target_env
    type: enum
    # hide the production option for non-admins by cross-referencing __user__
    expression: |
      $(__user__.roles).includes('admin')
        ? ['dev','staging','production']
        : ['dev','staging']
    runLocal: true
    default: __auto__
```

**Padrões típicos:**

A identidade do utilizador suporta padrões como os seguintes:

- **Cruzar com um ficheiro de configuração ou uma base de dados de RBAC**: carregue um ficheiro YAML ou JSON (com `fn.fnReadYamlFile` ou uma expressão) que associe grupos aos recursos permitidos, e depois filtre por `$(__user__.groups)`
- **Registo de auditoria**: passe `ansibleforms_user.username` como variável extra para registar quem desencadeou a tarefa
- **Valores de campos dinâmicos**: mostre um conjunto diferente de opções de enum, preencha campos, ou oculte secções com base nos grupos ou funções do utilizador
- **Autorização do lado do playbook**: verifique que `ansibleforms_user.groups` contém um grupo obrigatório antes de o playbook continuar, como verificação de defesa em profundidade independente da lista `roles` do formulário

{: .note }
> O objeto acima é o que é enviado por predefinição. Se a instância definir `EXTRAVARS_USER_FIELDS`,
> ou o formulário definir `userExtravars`, só são enviadas as chaves aí indicadas, por isso um playbook que
> verifica `ansibleforms_user.groups` exige que `groups` seja uma delas. O campo `__user__` do
> frontend vem do token de início de sessão e nunca é reduzido por nenhuma das definições.

---

## Agendamento de tarefas

### Como agendo um formulário para ser executado automaticamente?

Abra a lista pendente ao lado de **Submeter** e escolha **Agendar (recorrente)** ou **Executar mais tarde (única)**; exigem as opções de função
`allowScheduledJobs` (nível de administrador) e `allowPlannedJobs`. Consulte [Agendamentos](jobs/schedules.html).

### Que expressões cron posso usar?

Um agendamento recorrente aceita uma expressão cron padrão de 5 campos (minuto, hora, dia do mês, mês, dia da semana).

| Expressão | Executa |
|---|---|
| `*/15 * * * *` | A cada 15 minutos |
| `0 * * * *` | A cada hora, à hora certa |
| `0 */6 * * *` | A cada 6 horas, às 00:00, 06:00, 12:00 e 18:00 |
| `0 2 * * *` | Todos os dias às 02:00 |
| `30 7 * * 1-5` | De segunda a sexta-feira às 07:30 |
| `0 8 * * MON` | Todas as segundas-feiras às 08:00 (são aceites nomes de dias e de meses) |
| `0 0 1 * *` | À meia-noite do primeiro dia de cada mês |
| `0 22 L * *` | Às 22:00 do último dia de cada mês |
| `0 6 * * 1#1` | Às 06:00 da primeira segunda-feira de cada mês |
| `*/30 * * * * *` | A cada 30 segundos (um sexto campo opcional à frente corresponde aos segundos) |

Quando tanto o dia do mês como o dia da semana estão definidos, o agendamento é executado quando qualquer um deles corresponde: `0 0 13 * 5` é executado
no dia 13 e em todas as sextas-feiras. O servidor recusa uma expressão que não consegue executar, ou uma que nunca pode ocorrer (`0 0 30 2 *`).

Na página **Agendamentos**, o editor de cron descreve a expressão e pré-visualiza as suas próximas execuções. Não aceita alcunhas
como `@daily`, o caráter universal `?` nem o modificador `W` (dia útil mais próximo), por isso mantenha-se nas formas da tabela.

{: .note }
> **Fuso horário** Os agendamentos cron são executados no fuso horário do servidor, definido com [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (predefinição `UTC`), e não no fuso horário do seu perfil ou do seu navegador. `0 2 * * *` com `LOG_TZ=Europe/Madrid` é executado às 02:00
> hora de Madrid durante todo o ano, acompanhando a hora de verão. O editor de cron pré-visualiza as próximas execuções nesse mesmo fuso. Os agendamentos de
> pull dos repositórios usam o mesmo fuso.

---

## Guardar e carregar dados de formulários

### Como guardo e volto a carregar os dados de um formulário sem executar uma tarefa?

Selecione **Guardar** na lista pendente ao lado de **Submeter** para guardar os valores dos campos, e depois **Carregar dos guardados** para os restaurar mais tarde.
Os campos de palavra-passe nunca são guardados. Exige a opção de função `allowStoredJobs`. Consulte [Tarefas guardadas](jobs/stored-jobs.html).

---

## Formulários aninhados e campos estruturados

### Como recolho dados estruturados ou repetidos num formulário?

Use campos `list` e `yaml` com subforms (6.2.0+).

Para recolher dados estruturados complexos, como uma lista de servidores, um conjunto de interfaces de rede ou um único objeto aninhado, use o tipo de campo `list` ou `yaml` em conjunto com um `subform`.

Um **subform** é um fragmento de formulário reutilizável (definido com `type: subform`) que nunca é mostrado como mosaico autónomo. Existe apenas para ser referenciado por campos de outros formulários. Consulte a [documentação de Subform](forms/subform.html) para a referência completa.

**Recolher uma lista de linhas estruturadas: campo `list`:**

Um campo `list` abre o subform referenciado uma vez por linha:

```yaml
- name: Server
  type: subform
  fields:
    - name: hostname
      type: text
      required: true
    - name: ip
      type: text
      regex:
        expression: ^\d+\.\d+\.\d+\.\d+$
        description: Must be an IPv4 address

- name: Deploy to servers
  type: ansible
  roles:
    - default
  playbook: deploy.yml
  fields:
    - name: servers
      type: list
      subform: Server   # opens Server subform in a drilldown editor per row
```

A extravar `servers` enviada ao Ansible é um array de objetos: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Editar um único objeto estruturado: campo `yaml`:**

O campo `yaml` tem três modos:

| Modo | Como | Comportamento |
|---|---|---|
| **Editor** | predefinido | Mostra um editor YAML completo com realce de sintaxe, onde o utilizador pode escrever diretamente |
| **Só de leitura** | `readonly: true` | Apresenta o valor YAML como texto formatado só de leitura, sem edição |
| **Subform** | `subform: MySubform` | Oculta o editor em bruto; abre o subform como editor de detalhe ao clicar |

```yaml
fields:
  # editor mode (default)
  - name: raw_config
    type: yaml

  # readonly mode
  - name: generated_config
    type: yaml
    readonly: true

  # subform mode
  - name: network_config
    type: yaml
    subform: NetworkConfig   # opens NetworkConfig subform as a drilldown editor
```

**Carregar e transferir: campos `list` e `yaml`:**

Os dois tipos de campo suportam a transferência de ficheiros do lado do cliente através de duas propriedades opcionais:

```yaml
fields:
  - name: servers
    type: list
    subform: Server
    showLoadButton: true      # shows an Upload button: imports content from a local file
    showDownloadButton: true  # shows a Download button: exports current content to a file

  - name: config
    type: yaml
    showLoadButton: true
    showDownloadButton: true
```

{: .note }
> O campo `list` e o tipo de formulário `subform` substituíram o campo `table` e `tableFields`, que foram removidos na 7.0.0.

### Como acedo aos dados do formulário pai dentro de um subform?

Referencie os valores dos campos do pai a partir de um subform através de `__parent__` (v6.3.0+).

Quando um subform abre, seja a partir de um campo **`list`** (o editor de cada linha) ou de um campo **`yaml`** em modo subform, o AnsibleForms injeta automaticamente no subform um campo especial só de leitura chamado `__parent__`. Contém uma fotografia de **todos os valores dos campos do formulário pai no momento em que o subform foi aberto**, incluindo constantes e vars.

Isto permite que os campos do subform usem expressões que referenciam dados do pai sem qualquer configuração adicional.

#### O que há em `__parent__`?
{: .no_toc }

`__parent__` é um objeto simples cujas chaves são os nomes dos campos do formulário pai:

```yaml
__parent__:
  environment: production          # a regular field
  region: eu-west-1
  max_nodes: 10
  owner: jane.doe                  # a constant
  default_image: ubuntu-22.04      # from varsFiles
  __user__:                        # system fields are also included
    username: jane.doe
    roles: [admin]
```

{: .note }
> `__parent__` **não é enviado ao Ansible**; tal como `__user__`, é retirado das extravars. É apenas um auxiliar do frontend para as expressões dentro dos subforms.

#### Aceder aos valores do pai nas expressões de um subform
{: .no_toc }

Referencie os valores do pai com a sintaxe de expressão padrão `$(...)`:

```yaml
- name: NodeConfig
  type: subform
  fields:
    - name: node_name
      type: text
      label: Node name
      required: true

    - name: image
      type: enum
      label: Image
      # default to the parent form's chosen image
      expression: "'$(__parent__.default_image)'"
      runLocal: true

    - name: is_production
      type: expression
      hide: true
      runLocal: true
      expression: "'$(__parent__.environment)' === 'production'"

    - name: node_type
      type: enum
      # only offer gpu nodes in production
      expression: |
        '$(__parent__.environment)' === 'production'
          ? ['standard', 'high-memory', 'gpu']
          : ['standard', 'high-memory']
      runLocal: true
      default: __auto__

- name: Deploy cluster
  type: ansible
  roles:
    - default
  playbook: deploy_cluster.yml
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]

    - name: default_image
      type: text
      default: ubuntu-22.04

    - name: nodes
      type: list
      subform: NodeConfig
      columns: [node_name, node_type]
```

#### Subforms aninhados
{: .no_toc }

`__parent__` refere-se sempre ao formulário **pai imediato**. Se aninhar uma `list` dentro de um subform que é ele próprio aberto a partir de um formulário pai, o `__parent__` do subform interior contém os dados do subform do meio. Para chegar a níveis mais acima, encadeie referências como `$(__parent__.__parent__.someField)`, se o subform do meio também propagar o seu próprio `__parent__`.

### Como migro de `table` / `tableFields` para `list` / `subform`?

O campo `table` e a propriedade `tableFields` foram descontinuados na 6.2.0 e removidos na 7.0.0, e um formulário que ainda os use falha a validação. Para migrar:

1. Extraia as colunas de `tableFields` para um novo formulário `type: subform` com `formfields` normais
2. Substitua o campo `table` por um campo `list` que referencie o subform através de `subform: MySubformName`

**Antes:**
```yaml
- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: table
      tableFields:
        - name: username
          type: text
        - name: email
          type: text
```

**Depois:**
```yaml
- name: User
  type: subform
  fields:
    - name: username
      type: text
    - name: email
      type: text

- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: list
      subform: User
```

#### Migrar `from` de `tableFields` para expressões com `__parent__`
{: .no_toc }

A propriedade `from` das colunas enum de `tableFields` preenchia as opções das listas pendentes a partir de outro campo do formulário pai. Num `subform`, é substituída por uma `expression` que lê o mesmo valor através de `__parent__`.

**Antes: `tableFields` com `from`:**

```yaml
- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: table
      tableFields:
        - name: department
          type: enum
          from: available_departments   # pulls choices from the parent field above
        - name: firstname
          type: text
```

**Depois: subform com uma expressão `__parent__`:**

```yaml
- name: Member
  type: subform
  fields:
    - name: department
      type: enum
      # replaces "from: available_departments"
      expression: "$(__parent__.available_departments)"
      runLocal: true

    - name: firstname
      type: text

- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: list
      subform: Member
```

{: .note }
> `$(__parent__.available_departments)` devolve o **valor atual** desse campo, por isso, se esse campo for ele próprio um campo de expressão dinâmico, o subform vê sempre o resultado mais recente avaliado no pai.

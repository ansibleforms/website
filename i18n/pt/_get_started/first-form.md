---
layout: default
title: O seu primeiro formulário
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# O seu primeiro formulário
{: .no_toc }

Escreva um playbook, crie um formulário para ele no Designer, lance-o e encontre a tarefa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Este tutorial parte de uma instalação nova, consulte [Instalação](installation/). Demora cerca de quinze minutos.

---

## 1. Inicie sessão

Abra o AnsibleForms num navegador e inicie sessão como administrador.

A conta predefinida é `admin` / `AnsibleForms!123` (ou os seus valores de [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)); abre-se a página **Formulários**:

![A página Formulários, com formulários de exemplo](assets/screenshots/dashboard.jpg)

---

## 2. Escreva o playbook

Um formulário `ansible` executa um playbook da pasta de playbooks, por isso o playbook vem primeiro. Guarde isto como `hello.yaml`:

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

O playbook lê quatro variáveis. O formulário que vai criar a seguir envia-lhas como extravars, uma por campo.

Coloque o ficheiro na pasta `playbooks` da pasta persistente
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); crie a pasta se ainda não existir:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">A partir do código-fonte</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

A pasta que montou em `/app/dist/persistent`, `/srv/apps/ansibleforms/persistent` no exemplo de instalação:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

A pasta `data/playbooks` do projeto docker-compose:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

O volume persistente, montado em `/app/dist/persistent` no pod do AnsibleForms. Procure o nome do pod e copie o ficheiro para dentro dele:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

A pasta `persistent/playbooks` do servidor, `/srv/apps/ansibleforms/server` no exemplo de instalação:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Quando um repositório git tem **Usar para playbooks ?** ativado, os playbooks são executados a partir desse repositório:
> faça commit de `hello.yaml` nesse repositório. Consulte [Designer e git](gui/designer-and-git.html).

---

## 3. Crie o formulário

Os formulários são ficheiros YAML na pasta de formulários. O Designer edita-os no navegador e verifica-os antes de guardar.

1. Clique em **Designer** no menu superior e depois em **Formulários** no menu da esquerda.
2. Clique no interruptor no canto superior direito (**Iniciar designer**). Bloqueia a configuração para que mais ninguém a edite ao
   mesmo tempo e passa a mostrar **Bloqueado por mim**.
3. Clique em **Novo ficheiro**, o primeiro botão da barra de ferramentas, e introduza o nome de ficheiro `hello-world.yaml`. O Designer adiciona-lhe
   um formulário chamado `New Form`.
4. Substitua o YAML no editor por este formulário:

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Clique em **Validar** (o visto) e depois em **Guardar**. Guardar escreve `hello-world.yaml` na pasta de formulários.
6. Clique novamente no interruptor para libertar o bloqueio.

![O Designer, a editar um formulário](assets/screenshots/designer.jpg)

O formulário usa quatro tipos de campo:

| Campo | Tipo | O que faz |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Uma caixa de texto obrigatória |
| `target_env` | [`enum`](formfields/enum.html) | Uma lista pendente com uma lista fixa de `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Uma lista pendente preenchida por uma [expressão](expressions/local.html) local; `__auto__` seleciona o primeiro item |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Uma caixa de verificação, enviada como `true` ou `false` |

`vm_size` mostra as duas colunas, `size` e `cpus`, e envia `size`, a primeira; `valueColumn` escolhe outra.

`roles: [default]` permite que qualquer utilizador com sessão iniciada execute o formulário, e `categories: [Default]` coloca-o na categoria que o
`config.yaml` predefinido define.

{: .note }
> Também pode copiar `hello-world.yaml` para [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) e [validá-lo no VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Lance-o

Abra o formulário a partir da página **Formulários**: clique em **Formulários** no menu superior e escolha **Hello world** na categoria **Default**.

Preencha o seu nome e altere os outros campos, se quiser. Clique em **Mostrar extravars** para ver o que o playbook vai
receber e depois clique em **Submeter**:

![Um formulário](assets/screenshots/form.jpg)

---

## 5. Acompanhe a saída

A tarefa começa de imediato e a sua saída aparece por baixo do formulário enquanto é executada, terminando com uma barra **Terminada**:

![A saída de uma tarefa](assets/screenshots/run.jpg)

A tarefa de debug mostra os seus valores, por exemplo `Hello Alice: a small machine in development (dry run: True)`.

O aviso sobre o localhost implícito é normal sem um inventário; um formulário real define [`inventory`](forms/ansible.html).

---

## 6. Encontre-a no histórico de tarefas

Cada lançamento é guardado como uma tarefa. Clique em **Tarefas** no menu superior: a nova tarefa está no topo de **Todas as tarefas**.

Clique na tarefa para voltar a ver a sua saída, e em **Mostrar extravars** para ver o que foi enviado. Os ícones à frente de cada tarefa
relançam-na ou eliminam-na:

![O histórico de tarefas](assets/screenshots/job-output.jpg)

---

## Próximos passos

Desenvolva este formulário com as páginas de referência:

* **[Formulários](forms/)** : todas as propriedades de um formulário, templates em runners, formulários de workflow, pontos de aprovação e notificações
* **[Campos de formulário](formfields/)** : todos os tipos de campo, com validação, dependências e disposição
* **[Expressões](expressions/)** : preencha campos a partir de APIs REST, bases de dados e ficheiros
* **[Funções](config/roles.html)** e **[categorias](config/categories.html)** em `config.yaml` : decida quem vê cada formulário
* **[Como funciona](how-it-works.html)** : o que acontece por trás de um lançamento e onde tudo fica guardado

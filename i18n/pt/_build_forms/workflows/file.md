---
layout: default
title: O ficheiro do workflow
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# O ficheiro do workflow
{: .no_toc }

A sintaxe do workflow, os tipos de nó e as definições de execução de cada nó
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Onde ficam os ficheiros de workflow

Os ficheiros de workflow são ficheiros YAML na pasta local de workflows e em todos os repositórios usados para workflows.

- **A pasta local** é [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), por predefinição `workflows` dentro da
  pasta persistente.
- **Um repositório** com **Usar para workflows?** ligado é lido por inteiro, pelo que os seus ficheiros de workflow podem estar em qualquer pasta. O
  designer guarda-os de volta no repositório, e **Push** envia-os para o remoto.

É lido todo o ficheiro YAML que contenha `workflow_job_templates`, até seis pastas de profundidade, e um ficheiro pode conter vários
workflows. Um formulário indica um workflow pelo seu `name`, por isso mantenha os nomes únicos: quando dois workflows partilham um nome, uma tarefa que
o execute falha e pede para mudar o nome de um deles.

---

## A sintaxe

Um ficheiro de workflow é escrito na sintaxe de uma exportação do AWX, com os nós em `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

A forma da coleção `awx.awx` também é lida: `workflow_nodes` diretamente sob o workflow, e nomes escritos como
strings simples (`inventory: staging`) em vez de mapas (`inventory: {name: staging}`).

### O workflow

Uma entrada de workflow tem algumas chaves próprias, ao lado dos seus nós:

| Chave | O que é |
|---|---|
| `name` | O nome do workflow, que o `workflow:` de um formulário indica |
| `description` | Para que serve, mostrado no designer |
| `extra_vars` | Variáveis que todos os nós recebem; os valores do formulário prevalecem sobre elas |
| `related.workflow_nodes` | Os nós |

### Um nó

Cada nó tem um identificador, o que executa e as suas ligações:

| Chave | O que é |
|---|---|
| `identifier` | O id do nó: letras, dígitos, pontos, hífenes, dois pontos e underscores, único no workflow |
| `unified_job_template.type` | O que o nó executa: ver [tipos de nó](#node-types) |
| `unified_job_template.name` | O playbook, workflow, aprovação ou repositório que executa |
| `related.success_nodes` | Os nós que correm quando este tem sucesso |
| `related.failure_nodes` | Os nós que correm quando este falha |
| `related.always_nodes` | Os nós que correm quando este terminou, seja como for |
| `all_parents_must_converge` | `true`: o nó espera que todas as ligações para ele disparem, não só uma |

As ligações têm de seguir para a frente: um workflow cujas ligações formem um ciclo não corre.

---

## Tipos de nó

Um nó executa uma de quatro coisas, com os nomes que o AWX lhes dá:

| Tipo | O que o nó executa |
|---|---|
| `job_template` | Um dos playbooks do designer, como tarefa própria no RTE; ou, com `runner:`, o modelo ou job desse runner |
| `workflow_job_template` | Outro workflow, como tarefa de workflow filha; os workflows aninham-se até cinco níveis |
| `workflow_approval_template` | Uma aprovação: a tarefa do workflow espera até alguém a aprovar ou rejeitar |
| `project` | Um pull do repositório que indica (a atualização de projeto do AWX) |

O `unified_job_template.timeout` de um nó de aprovação é em segundos. Quando passa sem resposta, o nó falha; `0` ou sem
tempo limite, espera por uma resposta o tempo que for preciso. Uma aprovação rejeitada faz falhar o nó, e o workflow continua pelas suas
ligações.

---

## Definições de execução

Um nó `job_template` aceita as definições de um nó do AWX, no próprio nó:

| Chave | O que faz |
|---|---|
| `inventory` | O inventário sobre o qual o playbook corre, pelo seu nome, como o `inventory:` de um formulário |
| `related.credentials` | As credenciais: cada uma chega ao playbook com o seu próprio nome, e a primeira *SSH* é também o login com que o ansible se liga. Uma de vault só abre os vaults |
| `limit` | Corre apenas nestes hosts (`--limit`) |
| `job_tags` | Corre apenas as tarefas com estas etiquetas (`--tags`) |
| `skip_tags` | Salta as tarefas com estas etiquetas (`--skip-tags`) |
| `verbosity` | `0` a `5`: o número de `-v` |
| `diff_mode` | `true`: mostra as alterações (`--diff`) |
| `job_type` | `check`: um ensaio (`--check`); `run` ou nenhum: uma execução real |
| `extra_data` | Variáveis que este nó recebe, abaixo das `extra_vars` do workflow e dos valores do formulário |

A tarefa do nó recebe os valores do formulário como extra vars. Os valores do formulário prevalecem sobre as `extra_vars` do workflow, que prevalecem
sobre o `extra_data` do nó, tal como fazem as respostas de um survey no AWX.

---

## Chaves próprias do AnsibleForms

Três chaves de um nó são próprias do AnsibleForms, e o AWX ignora-as, para que um workflow possa fazer o que faz um formulário multistep:

| Chave | O que faz |
|---|---|
| `runner` | Num nó `job_template`, executa o modelo ou job desse runner em vez de um playbook do designer: AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins. Um runner RTE executa aí o playbook do nó. Um mesmo workflow pode misturá-los. |
| `if_extra_var` | O nó só corre quando esta extra var é `true`, como o `ifExtraVar` de um passo multistep. Se não se cumprir, o nó é saltado, e o que vem a seguir corre como depois de um sucesso. Não se aplica a um nó de aprovação, que corre sempre. |
| `extra_vars_key` | O nó recebe só esta chave das extra vars, com o utilizador copiado, como a `key` de um passo multistep |

Num runner de modelos, `unified_job_template.name` é o modelo ou job a executar, e o `limit`, os `job_tags`, o modo check
e o modo diff do nó são passados como os passaria um formulário do tipo desse runner. Uma `verbosity` acima de `0` ativa o
`verbose` do formulário, e `skip_tags` não é passado. Só um runner AWX (AWX, AAP ou Ascender) recebe o inventário do nó, e as
credenciais como as suas credenciais AWX; Semaphore, Rundeck e Jenkins recebem as credenciais como as `credentials` de um formulário.

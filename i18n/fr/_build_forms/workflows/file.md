---
layout: default
title: Le fichier de workflow
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# Le fichier de workflow
{: .no_toc }

La syntaxe des workflows, les types de nœud et les réglages d'exécution de chaque nœud
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Où se trouvent les fichiers de workflow

Les fichiers de workflow sont des fichiers YAML du dossier local des workflows et de chaque dépôt utilisé pour les workflows.

- **Le dossier local** est [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), par défaut `workflows` dans le
  dossier persistant.
- **Un dépôt** avec **Utiliser pour les workflows ?** activé est lu en entier : ses fichiers de workflow peuvent donc se trouver dans n'importe quel dossier. Le
  concepteur les enregistre dans le dépôt, et **Push** les envoie au dépôt distant.

Chaque fichier YAML qui contient `workflow_job_templates` est lu, jusqu'à six niveaux de dossiers, et un fichier peut contenir plusieurs
workflows. Un formulaire désigne un workflow par son `name` : gardez donc des noms uniques. Quand deux workflows partagent un nom, un job qui
l'exécute échoue et demande de renommer l'un d'eux.

---

## La syntaxe

Un fichier de workflow s'écrit dans la syntaxe d'un export AWX, avec les nœuds sous `related.workflow_nodes` :

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

La forme de la collection `awx.awx` est lue aussi : `workflow_nodes` directement sous le workflow, et des noms écrits comme
de simples chaînes (`inventory: staging`) plutôt que comme des maps (`inventory: {name: staging}`).

### Le workflow

Une entrée de workflow a quelques clés propres, à côté de ses nœuds :

| Clé | Ce que c'est |
|---|---|
| `name` | Le nom du workflow, celui que désigne le `workflow:` d'un formulaire |
| `description` | À quoi il sert, affiché dans le concepteur |
| `extra_vars` | Des variables que reçoit chaque nœud ; les valeurs du formulaire l'emportent sur elles |
| `related.workflow_nodes` | Les nœuds |

### Un nœud

Chaque nœud a un identifiant, ce qu'il exécute et ses liens :

| Clé | Ce que c'est |
|---|---|
| `identifier` | L'id du nœud : lettres, chiffres, points, tirets, deux-points et tirets bas, unique dans le workflow |
| `unified_job_template.type` | Ce que le nœud exécute : voir [les types de nœud](#node-types) |
| `unified_job_template.name` | Le playbook, le workflow, l'approbation ou le dépôt qu'il exécute |
| `related.success_nodes` | Les nœuds qui s'exécutent quand celui-ci réussit |
| `related.failure_nodes` | Les nœuds qui s'exécutent quand celui-ci échoue |
| `related.always_nodes` | Les nœuds qui s'exécutent quand celui-ci est terminé, dans un cas comme dans l'autre |
| `all_parents_must_converge` | `true` : le nœud attend que tous les liens qui y mènent se déclenchent, pas un seul |

Les liens doivent aller vers l'avant : un workflow dont les liens forment une boucle ne s'exécute pas.

---

## Types de nœud

Un nœud exécute l'une de quatre choses, nommées comme AWX les nomme :

| Type | Ce que le nœud exécute |
|---|---|
| `job_template` | L'un des playbooks du concepteur, comme un job à part entière sur le RTE ; ou, avec `runner:`, le template ou le job de ce runner |
| `workflow_job_template` | Un autre workflow, comme job de workflow enfant ; les workflows s'imbriquent jusqu'à cinq niveaux |
| `workflow_approval_template` | Une approbation : le job de workflow attend que quelqu'un l'approuve ou la rejette |
| `project` | Un pull du dépôt qu'il nomme (la mise à jour de projet d'AWX) |

Le `unified_job_template.timeout` d'un nœud d'approbation est en secondes. Quand il s'écoule sans réponse, le nœud échoue ; `0` ou l'absence
de délai attend une réponse aussi longtemps qu'il le faut. Une approbation rejetée fait échouer le nœud, et le workflow continue le long de ses
liens.

---

## Réglages d'exécution

Un nœud `job_template` prend les réglages d'un nœud AWX, sur le nœud lui-même :

| Clé | Ce qu'elle fait |
|---|---|
| `inventory` | L'inventaire sur lequel le playbook s'exécute, par son nom, comme l'`inventory:` d'un formulaire |
| `related.credentials` | Les identifiants : chacun parvient au playbook sous son propre nom, et le premier de type *SSH* est aussi le login avec lequel ansible se connecte. Un identifiant vault ne fait qu'ouvrir les vaults |
| `limit` | N'exécute que sur ces hôtes (`--limit`) |
| `job_tags` | N'exécute que les tâches portant ces tags (`--tags`) |
| `skip_tags` | Ignore les tâches portant ces tags (`--skip-tags`) |
| `verbosity` | `0` à `5` : le nombre de `-v` |
| `diff_mode` | `true` : affiche les changements (`--diff`) |
| `job_type` | `check` : une exécution à blanc (`--check`) ; `run` ou rien : une exécution réelle |
| `extra_data` | Des variables que reçoit ce nœud, en dessous des `extra_vars` du workflow et des valeurs du formulaire |

Le job du nœud reçoit les valeurs du formulaire comme extra vars. Les valeurs du formulaire l'emportent sur les `extra_vars` du workflow, qui l'emportent
sur l'`extra_data` du nœud, comme les réponses d'un survey dans AWX.

---

## Les clés propres à AnsibleForms

Trois clés d'un nœud sont propres à AnsibleForms, et AWX les ignore : un workflow peut ainsi faire ce que fait un formulaire multistep :

| Clé | Ce qu'elle fait |
|---|---|
| `runner` | Sur un nœud `job_template`, exécute le template ou le job de ce runner au lieu d'un playbook du concepteur : AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins. Un runner RTE y exécute le playbook du nœud. Un même workflow peut les mélanger. |
| `if_extra_var` | Le nœud ne s'exécute que si cette extra var vaut `true`, comme l'`ifExtraVar` d'une étape multistep. Si la condition n'est pas remplie, le nœud est ignoré, et ce qui le suit s'exécute comme après un succès. Pas sur un nœud d'approbation, qui s'exécute toujours. |
| `extra_vars_key` | Le nœud ne reçoit que cette clé des extra vars, avec l'utilisateur recopié, comme la `key` d'une étape multistep |

Sur un runner de templates, `unified_job_template.name` est le template ou le job à exécuter, et les `limit`, `job_tags`, mode check
et mode diff du nœud sont transmis comme le ferait un formulaire du type de ce runner. Une `verbosity` supérieure à `0` active le
`verbose` du formulaire, et `skip_tags` n'est pas transmis. Seul un runner AWX (AWX, AAP ou Ascender) reçoit l'inventaire du nœud, et les
identifiants comme ses identifiants AWX ; Semaphore, Rundeck et Jenkins reçoivent les identifiants comme les `credentials` d'un formulaire.

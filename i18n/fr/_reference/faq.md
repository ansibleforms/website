---
layout: default
title: FAQ
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# Questions fréquentes
{: .no_toc }

Questions et réponses courantes sur AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Premiers pas

### Topologie de déploiement : un conteneur ou plusieurs nœuds

Par défaut, un conteneur AnsibleForms fait tourner l'application web et le travail en arrière-plan dans un seul processus, à côté d'un conteneur RTE qui
exécute les playbooks. Lancez-le avec une politique de redémarrage (par exemple `restart: unless-stopped` dans Docker), et sauvegardez à la fois la base de données et
le volume persistant.

Pour faire tourner plusieurs réplicas derrière un répartiteur de charge, séparez le processus avec `AF_ROLE` :

- les nœuds `app` servent l'interface web et l'API : faites-en tourner autant que vous voulez, chacun avec le même `ACCESS_TOKEN_SECRET`
- un `worker` s'occupe du travail en arrière-plan : le schéma et ses mises à niveau, le seed de configuration, les planifications, la sauvegarde nocturne, les synchronisations
  des dépôts et les nettoyages. Un seul worker travaille à la fois, en détenant un verrou de base de données ; un second attend et prend le relais quand le premier s'arrête
- les conteneurs `rte` exécutent les playbooks : faites-en tourner davantage pour exécuter plus de playbooks à la fois

Les nœuds d'application et le worker partagent la base de données, le volume persistant et `ENCRYPTION_SECRET`. Un RTE en mode socket (sortant ou
entrant, voir [Modes](rte/modes.html)) n'a besoin ni de la base de données ni d'`ENCRYPTION_SECRET`. L'assistant de chat a besoin de sessions persistantes (sticky sessions), et
chaque nœud garde son propre journal. Voir [Mise à l'échelle](production/scaling.html) et la configuration
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Gestion des formulaires sur plusieurs dépôts

Les formulaires de chaque dépôt Git qui a **Utiliser pour les formulaires ?** activé sont fusionnés automatiquement ; en cas de noms de formulaires en double, le premier
l'emporte et un avertissement est journalisé. Ne gardez `config.yaml` que dans un seul dépôt. Voir [Dépôts git](repositories/).

### À propos des dépôts

AnsibleForms clone et met à jour les dépôts Git sous le chemin des dépôts (`REPO_PATH`), gérés sous **Paramètres > Dépôts**.
Des interrupteurs sur chaque dépôt définissent ce qu'il contient : configuration, formulaires, playbooks ou fichiers de variables. Voir [Dépôts git](repositories/).

### Validation VS Code des fichiers de formulaires

Ajoutez un en-tête de schéma à vos fichiers YAML de formulaires pour obtenir la validation en direct et l'autocomplétion dans VS Code.

Installez l'[extension YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) et ajoutez ce commentaire comme **première ligne** de chaque fichier de formulaire :

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Cela fonctionne aussi bien pour les fichiers à un seul formulaire (un dict YAML) que pour les fichiers à plusieurs formulaires (une liste YAML) :

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

VS Code signale les propriétés inconnues, les champs obligatoires manquants et les types incorrects pendant la saisie.

---

## Gestion des jobs

### Relance d'un job avec des données préremplies

Le bouton de relance ouvre le formulaire prérempli avec les valeurs du job précédent ; les champs mot de passe ne sont jamais stockés.
Il nécessite l'option de rôle `allowJobRelaunch`, et un formulaire peut le désactiver avec `allowRelaunch: false`. Voir [Relancer un job](jobs/actions.html#relaunch-a-job).

### Fichier journal du job

Suivez la progression via un fichier journal propre au job (v6.1.2).

AnsibleForms peut afficher un **fichier journal propre au job** à côté de la sortie Ansible. Cela permet de suivre la progression de modules personnalisés de longue durée qui, sinon, ne donneraient aucun retour visible pendant l'exécution.

{: .note }
> Cette fonctionnalité ne marche que pour les playbooks qui s'exécutent sur un RTE. Les modèles et les jobs sur AWX, AAP, Ascender, Semaphore, Rundeck ou
> Jenkins n'ont pas de fichier journal.

**Fonctionnement :**
- Pendant l'exécution d'un job, le RTE surveille un fichier journal à un chemin connu dans le dossier du playbook
- Toutes les deux secondes, quand le fichier a changé, le RTE copie son contenu dans le job, et une dernière fois quand le playbook se termine
- Le fichier journal s'affiche dans une section **Fichier journal** de la sortie du job, numérotée comme les lignes de la sortie : l'horodatage et le niveau d'une ligne (ERROR, WARNING, INFO, DEBUG) sont lus et colorés comme ceux de la sortie, et les couleurs ANSI sont prises en charge

**Convention de chemin du fichier journal :**

Le fichier journal doit être écrit à ce chemin :

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms transmet `__jobid__` automatiquement**, vous pouvez donc construire le chemin dans votre playbook sans aucune configuration supplémentaire :

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Transmettez cette variable à tout rôle ou module personnalisé qui doit écrire sa progression dans le fichier.

**Responsabilités du développeur du playbook ou du module :**
- **Créer** le fichier journal (et son répertoire `.joblogs/`) au début de l'opération
- **Écrire** des messages de progression parlants au fil de l'opération

Le RTE supprime le fichier une fois que le playbook se termine et que le dernier contenu est stocké sur le job.

**Les couleurs ANSI sont prises en charge.**  
Les codes d'échappement ANSI standard (par exemple `\033[92m` pour le vert et `\033[91m` pour le rouge) de vos messages de journal s'affichent en couleur dans l'interface, si bien que les états de succès, d'avertissement et d'erreur se distinguent d'un coup d'œil.

**Cas d'usage typique :**  
Un module Ansible personnalisé en Python qui effectue une longue suite d'appels API ou d'opérations sur des données (par exemple un workflow de reprise SnapMirror) peut ajouter une ligne par étape au fichier journal. Un opérateur qui suit le job dans AnsibleForms voit alors la progression en direct dans la section Fichier journal à mesure que la page du job suit le job.

### Jobid

Transmettre l'ID du job courant.

AnsibleForms envoie automatiquement l'ID du job courant dans les extravars sous `__jobid__` ; aucune configuration n'est nécessaire.

### Userinfo

Transmettre l'utilisateur courant.

AnsibleForms envoie automatiquement les informations de l'utilisateur dans les extravars sous `ansibleforms_user` ; aucune configuration n'est nécessaire.

Vous pouvez choisir la quantité d'informations envoyées. `EXTRAVARS_USER_FIELDS` accepte une liste de clés de premier niveau séparées par des virgules
(`username,email,type`), ou `none` pour ne rien envoyer ; un formulaire peut la remplacer par sa propre propriété `userExtravars`.
Par défaut, c'est l'objet entier, comme avant. Le `__user__` côté formulaire décrit plus bas vient du jeton de connexion et n'est jamais concerné.

### Userinfo dans le formulaire

Accéder aux informations de l'utilisateur courant dans le formulaire (v4.0.2).

Le champ `__user__` est ajouté automatiquement au formulaire et peut être référencé dans les expressions :

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Champs de formulaire

### Listes déroulantes en cascade

Créer des listes déroulantes en cascade.

Les champs `enum` (listes déroulantes) peuvent contenir des placeholders dans leur propriété `query` ou `expression`, au format `$(another_field)` ou `$(another_field[0].name)`.  
Dès que le champ référencé change, le champ qui le référence est réévalué, ce qui donne des listes déroulantes dynamiques en cascade.  
L'application web cliente réévalue les champs toutes les 100 ms ; avec les processeurs actuels et le moteur Chromium, l'expérience est fluide.

{: .note }
> Une référence à un autre champ enum renvoie les valeurs sélectionnées, **pas** la liste déroulante complète. Utilisez la propriété `placeholderColumn` ou la notation pointée comme `$(city.name)`.  
> **Nouveau en v4.0.20** : mettre placeholderColumn à "*" renvoie l'enregistrement entier au lieu d'une seule colonne.

Les exemples interrogent `CONN1`, une [base de données](databases.html) de Connexions > Bases de données (depuis la 7.5.0) ou un identifiant de type base de données.

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

### Placeholders de champ

Référencer la valeur d'un autre champ.

Les placeholders sont des références à d'autres champs du formulaire.  
Un placeholder a toujours le format `$(reference)`, et les expressions comme les requêtes peuvent contenir des placeholders.  
Un placeholder qui pointe vers un champ simple (text, number, password) contient la valeur de ce champ.  
Un placeholder qui pointe vers un champ enum basé sur des objets doit utiliser soit la propriété `placeholderColumn`, soit la notation pointée comme `$(city.name)`.  
Un placeholder qui pointe vers un champ expression renvoie l'objet complet, ou vous pouvez utiliser une référence avancée, de type JavaScript, comme `$(myarray[0].name)`.

{: .important }
> Le placeholder est remplacé **avant** l'évaluation de l'expression. Si vous attendez une chaîne comme résultat, vous devez l'entourer de guillemets.  
> **Nouveau en v4.0.20** : mettre placeholderColumn à "*" renvoie l'enregistrement entier au lieu d'une seule colonne.

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

### Masquer un champ

Masquer un champ.

Masquez un champ avec la propriété de champ `hide`, ou affichez-le et masquez-le dynamiquement avec les propriétés de champ `dependencies` et `dependencyFn`.

### Regrouper des champs

Regrouper des champs dans un bloc.

Utilisez la propriété de champ `group`. Les champs qui ont le même nom de groupe sont regroupés dans un bloc.

### Validation d'un champ

Valider un champ.

Utilisez les propriétés de validation des champs, comme `regex`, `minValue` et `notIn`.

### Valeur par défaut d'un enum

Valeur par défaut d'un enum.

La propriété de champ `default` définit une valeur par défaut, et sur les champs `enum` vous pouvez utiliser des valeurs comme `__auto__` pour sélectionner automatiquement le premier élément.

Pour une valeur par défaut dynamique basée sur une expression, placez l'élément par défaut en tête de liste, comme dans l'exemple suivant.

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

### Valeur par défaut par expression

Valeur par défaut par expression.

Pour les champs text, number ou date, la propriété `default` définit une valeur par défaut statique.

Pour rendre la valeur par défaut dynamique, à partir d'une expression, utilisez l'une de ces deux propriétés :
* `editable` : utilisez la propriété editable pour rendre un champ expression modifiable
* `evalDefault` : utilisez la propriété evalDefault pour évaluer la valeur par défaut comme une expression

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

## Assistant et workflows

### Quelle est la différence entre un assistant et un workflow ?

Un **assistant** (wizard) et un **workflow** fonctionnent tous deux par étapes, mais ils agissent à des niveaux différents et peuvent être combinés.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Niveau** | Exécution | Formulaire / interface |
| **Ce qu'il découpe** | Le job en nœuds qui s'exécutent l'un après l'autre, ou côte à côte | La saisie d'un formulaire en plusieurs pages |
| **Résultat** | 1 job de workflow, avec un job par nœud (chacun avec son propre playbook ou modèle) | 1 job s'exécute à la fin |
| **`type` du formulaire** | Doit être `workflow` | Fonctionne avec tous les types de formulaires sauf `subform` |
| **Défini par** | Un [fichier de workflow](workflows/file.html) du concepteur (`workflow:`) | Une liste de références à des [sous-formulaires](forms/subform.html) (`wizard:`) |
| **À utiliser quand** | « Fais A, puis B, puis C comme jobs séparés » | « Mon formulaire a trop de champs pour une seule page » |

**À retenir :** un workflow concerne *ce qui s'exécute et dans quel ordre* ; `wizard` concerne *la façon dont l'utilisateur remplit le formulaire*.

{: .note }
> Le type de formulaire `multistep`, avec ses `steps`, assurait la partie exécution avant la 7. Il est obsolète depuis la 7 et supprimé en
> 8 : un workflow fait tout ce que fait un multistep, voir [Formulaires multi-étapes](forms/multistep.html).

#### Workflow seul
{: .no_toc }

Un formulaire `type: workflow` exécute l'un des workflows du concepteur. L'utilisateur remplit une seule page de champs et appuie sur Soumettre,
et le workflow exécute ses nœuds, chacun avec les valeurs du formulaire comme variables supplémentaires :

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

#### Assistant seul
{: .no_toc }

Un bloc `wizard:` sur un formulaire répartit la saisie sur plusieurs pages. Un **seul** job s'exécute à la fin : les extravars fusionnées de toutes les pages sont envoyées à un seul playbook, modèle ou workflow.

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

Une page de relecture en lecture seule est ajoutée automatiquement comme dernière page de l'assistant ; vous ne la déclarez pas dans le YAML.

#### Combinés (un assistant au-dessus d'un workflow)
{: .no_toc }

Un assistant peut se superposer à un formulaire workflow. L'utilisateur remplit les pages de l'assistant et appuie sur Soumettre, et **ensuite** le
workflow démarre. En faisant correspondre le `defaultModel` d'une étape de l'assistant avec l'[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys)
d'un nœud, vous pouvez diriger **une page de l'assistant vers un nœud** :

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

Et le workflow `provision-host`, dans un fichier de workflow du concepteur :

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

`extra_vars_key` est une recherche à un seul niveau, utilisez donc un nom plat dans `defaultModel` (par exemple `defaultModel: basics`, et non `defaultModel: input.basics`) quand vous voulez qu'ils correspondent.

Voir la [page Assistant](forms/wizard.html) pour la référence complète des propriétés.

### Comment afficher ou sauter des étapes de l'assistant sous condition ?

Utilisez `when:` pour **masquer** entièrement une étape, ou `optional: true` pour permettre à l'utilisateur de **sauter** une étape visible. Les deux sont indépendants et ne devraient généralement pas être combinés.

#### `when:` : visibilité conditionnelle
{: .no_toc }

L'étape est masquée quand l'expression donne une valeur fausse. L'utilisateur ne la voit jamais, et ses valeurs ne sont pas recueillies. L'expression peut lire les étapes précédentes via `__parent__.<stepname>.<field>` :

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

Seule la page qui correspond au `kind` choisi est affichée. Les étapes qui suivent une étape masquée sont renumérotées automatiquement.

#### `optional: true` : permettre de sauter une étape visible
{: .no_toc }

L'étape est **toujours affichée** dans la barre des étapes, mais l'utilisateur peut appuyer sur **Suivant** sans la remplir, et **Soumettre** est permis même si la page n'a jamais été visitée ni complétée :

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

L'utilisateur peut ouvrir la page Advanced, la laisser vide, appuyer sur Suivant et passer directement à la page de relecture.

{: .note }
> `when:` contrôle la *visibilité* ; `optional:` contrôle *si la page doit être complétée*. Ne les combinez pas : pour faire disparaître une page, utilisez `when:` ; pour la garder visible mais facultative, utilisez `optional:`.

### Comment référencer les valeurs d'une étape précédente de l'assistant ?

Utilisez `$(__parent__.<stepname>.<field>)` dans n'importe quel champ d'une étape ultérieure.

Le `name` d'une étape de l'assistant (par défaut, le nom de son `subform`) est l'espace de noms sous lequel ses valeurs sont exposées aux étapes suivantes :

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

C'est le même mécanisme `__parent__` qu'utilisent les sous-formulaires `list` et `yaml` ; voir [Comment accéder aux données du formulaire parent dans un sous-formulaire ?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Sécurité et identifiants

### Identifiants

Transmettre des identifiants.

Les identifiants peuvent être transmis de plusieurs façons :
* avec la propriété de champ `asCredential`  
* avec la propriété de formulaire `credentials` (paires clé-valeur)
* avec une extravar appelée `__credentials__`

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

### Récupérer un mot de passe admin perdu

Si vous avez perdu le mot de passe du compte local `admin` et qu'aucun autre utilisateur admin n'est disponible, utilisez l'option de récupération `REINIT_ADMIN`. **Ce n'est pas un contournement de l'authentification à l'exécution** : elle force seulement une réinitialisation unique du compte admin local au démarrage, après quoi l'authentification normale s'applique.

**Fonctionnement**

Quand `REINIT_ADMIN=1` est défini au démarrage, AnsibleForms :

1. S'assure que le groupe `admins` existe (en le créant s'il manque).
2. Cherche l'utilisateur admin local (nom d'utilisateur par défaut `admin`, remplacé par `ADMIN_USERNAME`).
3. S'il existe, réinitialise son mot de passe à la valeur de `ADMIN_PASSWORD` et le rattache au groupe `admins`.
4. S'il n'existe pas, le crée (comme sur une nouvelle installation).
5. Journalise l'action de façon bien visible dans les journaux.

**Étapes**

1. Arrêtez AnsibleForms.
2. Définissez les variables d'environnement (utilisez un mot de passe robuste) :
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   Dans Docker Compose, ajoutez-les au bloc `environment:` du service AnsibleForms.
3. Démarrez AnsibleForms et guettez dans les journaux une ligne comme :
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Connectez-vous avec `admin` / `YourNewStrongPasswordHere`.
5. **Supprimez `REINIT_ADMIN` (ou remettez-le à `0`)** et redémarrez, pour que les redémarrages suivants ne réinitialisent plus le mot de passe admin.

**Remarques**

- Si vous étiez bloqué parce que LDAP était la seule méthode de connexion configurée et qu'elle a échoué, le compte local `admin` récupéré utilise toujours l'authentification par la base de données locale, ce qui suffit pour se connecter et corriger LDAP.
- L'ancienne variable d'environnement `ENABLE_BYPASS` a été supprimée. Elle permettait de se connecter en admin avec n'importe quel mot de passe et était dangereuse à laisser activée. `REINIT_ADMIN` ne fait que réinitialiser le mot de passe ; l'authentification normale s'applique ensuite.
- `REINIT_ADMIN` n'invalide pas les sessions ni les jetons existants ; seuls le hash du mot de passe et l'appartenance au groupe changent.

### Restreindre les destinations des helpers REST (listes d'autorisation et de refus)

Les helpers `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` et `fn.fnRestJwtSecure` peuvent être appelés depuis les propriétés `expression` des formulaires pour récupérer des données en HTTP. Par défaut, les auteurs d'expressions peuvent viser **n'importe quelle** URL que l'hôte d'AnsibleForms peut joindre, ce que vous voudrez peut-être limiter sur un réseau sensible.

Deux variables d'environnement fournissent une liste d'autorisation et une liste de refus :

| Variable | Comportement |
|---|---|
| `REST_ALLOWED_HOSTS` | Noms d'hôtes ou CIDR séparés par des virgules. Quand elle est définie, **seules** ces cibles sont autorisées. |
| `REST_DENIED_HOSTS` | Noms d'hôtes ou CIDR séparés par des virgules. Toujours bloqués. Prioritaire sur la liste d'autorisation. |

Les noms d'hôtes sont comparés à l'hôte de l'URL sans tenir compte de la casse. Les CIDR sont comparés à chaque IP vers laquelle l'hôte se résout, si bien que `10.0.0.0/8` bloque tout nom DNS qui se résout dans la plage privée.

**Exemples :**

La première ligne n'autorise que deux hôtes ; la seconde bloque des cibles précises :

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Cette protection ne couvre que le processus Node.js d'AnsibleForms.** Une fois qu'un playbook s'exécute, Ansible lui-même peut joindre n'importe quoi depuis l'hôte, hors du contrôle d'AnsibleForms. Utilisez ces listes pour empêcher les auteurs de formulaires de transformer les expressions en proxy vers des services de métadonnées ou des interfaces internes ; ne comptez pas sur elles comme pare-feu réseau.

Depuis la 7.3.0, les helpers REST vérifient le certificat TLS de l'endpoint, comme toutes les autres connexions, et abandonnent après
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (`60` par défaut). Faites confiance à une CA privée avec
`NODE_EXTRA_CA_CERTS`, ou mettez [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) à `1` uniquement pour des endpoints avec un
certificat auto-signé.

### Intégration HashiCorp Vault

Les identifiants peuvent lire leur utilisateur et leur mot de passe dans HashiCorp Vault, configuré comme
**coffre de secrets**. Voir [Coffres de secrets](secret-stores). Les variables d'environnement `VAULT_*`
des versions précédentes sont importées une fois comme le coffre `vault` au premier démarrage en 7.x.

Pour des secrets utilisés seulement dans un playbook, vous pouvez aussi utiliser le plugin de lookup `community.hashi_vault`,
qui lit directement dans Vault sans passer par AnsibleForms.

---

## Intégration

### Interroger AWX/Tower/AAP

Interroger des informations dans AWX ou Ansible Automation Platform.

Pour remplir des listes déroulantes avec des données d'AWX ou de Tower, utilisez `fn.fnRestBasic` ou `fn.fnRestJwtSecure`. Depuis la 7.3.0, ces helpers vérifient
le certificat de l'adresse AWX : avec un certificat auto-signé, faites confiance à sa CA avec `NODE_EXTRA_CA_CERTS`, ou mettez
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) à `1`.

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

## Personnalisation

### Personnalisation

Personnaliser AnsibleForms.

AnsibleForms est une application web. Quand vous la faites tourner nativement dans Node.js, vous pouvez remplacer ou modifier ses fichiers.  
L'approche recommandée reste toutefois de la faire tourner comme image Docker et d'ajouter des montages de volumes ou de fichiers. Les projets Docker Compose montent déjà des répertoires pour rendre persistants la base de données, les playbooks, les journaux, les certificats et les clés SSH, et vous pouvez ajouter d'autres montages. Un logo personnalisé se téléverse sur la page de paramètres **Logo**.  
Le fichier `custom.js` contient vos propres fonctions JavaScript à utiliser dans les expressions. Les fonctions intégrées utilisent le préfixe `fn.` (par exemple fn.fnRestBasic) ; les fonctions personnalisées utilisent le préfixe `fnc.`.  
De la même façon, vous pouvez ajouter vos propres définitions jq dans le fichier `jq.custom.definitions`.

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

### Activer YTT

Activer ytt.

Pour utiliser ytt, définissez `USE_YTT=1`.  
Pour plus d'informations sur ytt, voir https://carvel.dev/ytt/.

{: .important }  
> Cette fonctionnalité n'a pas été testée en profondeur, et aucun retour n'a été reçu depuis son ajout comme amélioration.  
> Avec ytt, vous devez désactiver le concepteur : le concepteur convertit les fichiers YAML en JSON intermédiaire et perd la syntaxe ytt (qui se compose de commentaires YAML).

Un répertoire `lib` doit exister dans le répertoire racine ; il est inclus automatiquement dans l'appel à ytt.
Des données peuvent être fournies globalement en définissant des variables d'environnement préfixées :  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Vous pouvez aussi fournir des fichiers de données de bibliothèque :

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**La bibliothèque `demo` doit exister dans le contexte ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Les données chargées peuvent ensuite être utilisées :

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

## Contrôle d'accès

### Comment restreindre ce que les utilisateurs peuvent faire (options de rôle) ?

Au-delà de la restriction des formulaires qu'un rôle peut voir, les `options` d'un rôle activent ou désactivent des fonctions de l'interface pour ses membres.
Voir [Options de rôle](config/roles.html#role-options) pour chaque option, sa valeur par défaut et la façon dont les options se combinent entre rôles.

### Comment mettre en place une logique RBAC personnalisée dans mes playbooks ou formulaires ?

L'identité de l'utilisateur est disponible côté frontend comme côté backend à chaque exécution.

À chaque soumission de formulaire, AnsibleForms injecte automatiquement l'identité complète de l'utilisateur courant dans les extravars envoyées à Ansible :

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

Votre playbook ou tout module Ansible personnalisé peut donc utiliser `ansibleforms_user` directement pour des décisions fines, par exemple pour n'autoriser que certains groupes à modifier l'inventaire de production, ou pour écrire une piste d'audit avec le nom d'utilisateur de l'auteur de la soumission.

Dans le **frontend**, le même objet est disponible via le champ spécial `__user__` :

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

**Schémas courants :**

L'identité de l'utilisateur permet des schémas comme les suivants :

- **Croiser avec un fichier de configuration RBAC ou une base de données** : chargez un fichier YAML ou JSON (avec `fn.fnReadYamlFile` ou une expression) qui associe des groupes à des ressources autorisées, puis filtrez sur `$(__user__.groups)`
- **Piste d'audit** : passez `ansibleforms_user.username` comme variable supplémentaire pour enregistrer qui a déclenché le job
- **Valeurs de champ dynamiques** : affichez un autre ensemble de choix enum, préremplissez des champs ou masquez des sections selon les groupes ou les rôles de l'utilisateur
- **Autorisation côté playbook** : vérifiez que `ansibleforms_user.groups` contient un groupe requis avant que le playbook continue, comme contrôle de défense en profondeur indépendant de la liste `roles` du formulaire

{: .note }
> L'objet ci-dessus est ce qui est envoyé par défaut. Si l'instance définit `EXTRAVARS_USER_FIELDS`,
> ou si le formulaire définit `userExtravars`, seules les clés qui y sont nommées sont envoyées, si bien qu'un playbook qui
> vérifie `ansibleforms_user.groups` a besoin que `groups` en fasse partie. Le champ frontend
> `__user__` vient du jeton de connexion et n'est jamais réduit par aucun de ces deux paramètres.

---

## Planification des jobs

### Comment planifier l'exécution automatique d'un formulaire ?

Ouvrez la liste déroulante à côté de **Soumettre** et choisissez **Planifier (récurrent)** ou **Exécuter plus tard (une seule fois)** ; ils nécessitent les options de rôle
`allowScheduledJobs` (niveau admin) et `allowPlannedJobs`. Voir [Planifications](jobs/schedules.html).

### Quelles expressions cron puis-je utiliser ?

Une planification récurrente accepte une expression cron standard à 5 champs (minute, heure, jour du mois, mois, jour de la semaine).

| Expression | S'exécute |
|---|---|
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 * * * *` | Toutes les heures, à l'heure pile |
| `0 */6 * * *` | Toutes les 6 heures, à 00:00, 06:00, 12:00 et 18:00 |
| `0 2 * * *` | Tous les jours à 02:00 |
| `30 7 * * 1-5` | Du lundi au vendredi à 07:30 |
| `0 8 * * MON` | Tous les lundis à 08:00 (les noms de jours et de mois sont acceptés) |
| `0 0 1 * *` | À minuit le premier jour de chaque mois |
| `0 22 L * *` | À 22:00 le dernier jour de chaque mois |
| `0 6 * * 1#1` | À 06:00 le premier lundi de chaque mois |
| `*/30 * * * * *` | Toutes les 30 secondes (un sixième champ facultatif placé devant correspond aux secondes) |

Quand le jour du mois et le jour de la semaine sont tous deux définis, la planification s'exécute dès que l'un des deux correspond : `0 0 13 * 5` s'exécute le
13 et tous les vendredis. Le serveur refuse une expression qu'il ne peut pas exécuter, ou qui ne peut jamais se produire (`0 0 30 2 *`).

Sur la page **Planifications**, l'éditeur cron décrit l'expression et prévisualise ses prochaines exécutions. Il n'accepte pas les alias
comme `@daily`, le joker `?` ni le modificateur `W` (jour ouvré le plus proche), tenez-vous-en donc aux formes du tableau.

{: .note }
> **Fuseau horaire** Les planifications cron s'exécutent dans le fuseau horaire du serveur, défini avec [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (`UTC` par défaut), et non dans celui de votre profil ou de votre navigateur. `0 2 * * *` avec `LOG_TZ=Europe/Madrid` s'exécute à 02:00
> heure de Madrid toute l'année, en suivant l'heure d'été. L'éditeur cron prévisualise les prochaines exécutions dans ce même fuseau. Les planifications de
> pull des dépôts utilisent le même fuseau.

---

## Enregistrer et charger des données de formulaire

### Comment enregistrer et recharger des données de formulaire sans exécuter de job ?

Choisissez **Enregistrer** dans la liste déroulante à côté de **Soumettre** pour enregistrer les valeurs des champs, puis **Charger depuis le stockage** pour les restaurer plus tard.
Les champs mot de passe ne sont jamais enregistrés. Il faut l'option de rôle `allowStoredJobs`. Voir [Jobs enregistrés](jobs/stored-jobs.html).

---

## Formulaires imbriqués et champs structurés

### Comment recueillir des données structurées ou répétées dans un formulaire ?

Utilisez des champs `list` et `yaml` avec des sous-formulaires (6.2.0+).

Pour recueillir des données structurées complexes, comme une liste de serveurs, un ensemble d'interfaces réseau ou un seul objet imbriqué, utilisez le type de champ `list` ou `yaml` avec un `subform`.

Un **sous-formulaire** est un fragment de formulaire réutilisable (défini avec `type: subform`) qui n'est jamais affiché comme tuile à part. Il n'existe que pour être référencé par des champs d'autres formulaires. Voir la [documentation des sous-formulaires](forms/subform.html) pour la référence complète.

**Recueillir une liste de lignes structurées : le champ `list` :**

Un champ `list` ouvre le sous-formulaire référencé une fois par ligne :

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

L'extravar `servers` envoyée à Ansible est un tableau d'objets : `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Modifier un seul objet structuré : le champ `yaml` :**

Le champ `yaml` a trois modes :

| Mode | Comment | Comportement |
|---|---|---|
| **Éditeur** | par défaut | Affiche un éditeur YAML complet avec coloration syntaxique dans lequel l'utilisateur peut taper directement |
| **Lecture seule** | `readonly: true` | Affiche la valeur YAML sous forme de texte formaté en lecture seule, sans modification |
| **Sous-formulaire** | `subform: MySubform` | Masque l'éditeur brut ; ouvre le sous-formulaire comme éditeur détaillé au clic |

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

**Téléversement et téléchargement : champs `list` et `yaml` :**

Les deux types de champs prennent en charge le transfert de fichiers côté client via deux propriétés facultatives :

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
> Le champ `list` et le type de formulaire `subform` ont remplacé le champ `table` et `tableFields`, supprimés en 7.0.0.

### Comment accéder aux données du formulaire parent dans un sous-formulaire ?

Référencez les valeurs des champs parents depuis un sous-formulaire via `__parent__` (v6.3.0+).

Quand un sous-formulaire s'ouvre, que ce soit depuis un champ **`list`** (l'éditeur de chaque ligne) ou un champ **`yaml`** en mode sous-formulaire, AnsibleForms injecte automatiquement dans le sous-formulaire un champ spécial en lecture seule appelé `__parent__`. Il contient un instantané de **toutes les valeurs des champs du formulaire parent au moment de l'ouverture du sous-formulaire**, constantes et variables comprises.

Cela permet aux champs du sous-formulaire d'utiliser des expressions qui référencent les données du parent sans aucune configuration supplémentaire.

#### Que contient `__parent__` ?
{: .no_toc }

`__parent__` est un objet simple dont les clés sont les noms des champs du formulaire parent :

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
> `__parent__` n'est **pas envoyé à Ansible** ; comme `__user__`, il est retiré des extravars. C'est uniquement un auxiliaire frontend pour les expressions dans les sous-formulaires.

#### Accéder aux valeurs du parent dans les expressions d'un sous-formulaire
{: .no_toc }

Référencez les valeurs du parent avec la syntaxe d'expression standard `$(...)` :

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

#### Sous-formulaires imbriqués
{: .no_toc }

`__parent__` désigne toujours le formulaire **parent immédiat**. Si vous imbriquez une `list` dans un sous-formulaire lui-même ouvert depuis un formulaire parent, le `__parent__` du sous-formulaire intérieur contient les données du sous-formulaire intermédiaire. Pour atteindre les niveaux supérieurs, enchaînez les références comme `$(__parent__.__parent__.someField)` si le sous-formulaire intermédiaire propage aussi son propre `__parent__`.

### Comment migrer de `table` / `tableFields` vers `list` / `subform` ?

Le champ `table` et la propriété `tableFields` ont été rendus obsolètes en 6.2.0 et supprimés en 7.0.0, et un formulaire qui les utilise encore échoue à la validation. Pour migrer :

1. Extrayez les colonnes de `tableFields` dans un nouveau formulaire `type: subform` avec des `formfields` ordinaires
2. Remplacez le champ `table` par un champ `list` qui référence le sous-formulaire via `subform: MySubformName`

**Avant :**
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

**Après :**
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

#### Migrer `from` de `tableFields` vers des expressions `__parent__`
{: .no_toc }

La propriété `from` des colonnes enum de `tableFields` remplissait les choix de la liste déroulante à partir d'un autre champ du formulaire parent. Dans un `subform`, elle est remplacée par une `expression` qui lit la même valeur via `__parent__`.

**Avant : `tableFields` avec `from` :**

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

**Après : sous-formulaire avec une expression `__parent__` :**

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
> `$(__parent__.available_departments)` renvoie la **valeur actuelle** de ce champ, si bien que si ce champ est lui-même un champ expression dynamique, le sous-formulaire voit toujours le dernier résultat évalué du parent.


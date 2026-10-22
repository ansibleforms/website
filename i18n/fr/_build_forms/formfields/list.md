---
layout: default
title: List
parent: Champs de formulaire
nav_order: 13
translated_from: b6209effaf1cc9783a27c36669004a239751fb3e
---

# Champ List
{: .no_toc }

Un tableau de lignes, chacune modifiée dans un sous-formulaire
{: .fs-6 .fw-300 }

---

Un champ list affiche un tableau de lignes, chacune créée et modifiée dans un volet de **sous-formulaire** dédié (un modèle d'exploration). Il remplace le champ `table`, supprimé dans la 7.0.0.

---

## Fonctionnalités clés

Le champ list offre les possibilités suivantes :

- Chaque ligne est modifiée dans un sous-formulaire plein écran, qui donne accès à tous les types de champ, y compris les listes imbriquées.
- Le sous-formulaire est un formulaire à part entière, de type `subform`, et peut être **réutilisé par plusieurs champs list** dans différents formulaires (par ex. un seul sous-formulaire `Address` partagé par les clients, les fournisseurs, les commandes…).
- Les propriétés de marqueur (`insertMarker`, `updateMarker`, `deleteMarker`) permettent des modèles de playbook idempotents.
- Avec `allowDelete: false`, les lignes préexistantes sont protégées ; seules les lignes ajoutées pendant la session en cours (qui portent l'`insertMarker`) peuvent être supprimées.
- La propriété `columns` contrôle quels champs du sous-formulaire apparaissent comme colonnes dans le tableau récapitulatif.
- La sortie est toujours un tableau d'objets. `model`, `output`, `outputObject` et `valueColumn` déclarés sur les champs du sous-formulaire sont respectés lors de la génération des extravars.

---

## Déclaration d'un sous-formulaire

Un sous-formulaire est un formulaire à part entière avec `type: subform`, dans un fichier du dossier des formulaires comme n'importe quel autre formulaire. Il accepte le même tableau `fields` que tout autre formulaire, mais il n'apparaît jamais dans la liste des tuiles de formulaires et n'est jamais soumis directement.

```yaml
- name: Address
  type: subform
  fields:
    - name: street
      type: text
      label: Street
      required: true
    - name: city
      type: text
      label: City
      required: true
    - name: country
      type: text
      label: Country
```

---

## Propriétés

Les propriétés disponibles pour un champ `list`, regroupées par usage :

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = formfield_object.items | map: "group" | compact | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = formfield_object.items | where: "group", group %}
    {% assign has_list_props = false %}
    {% for var in group_properties %}
      {%- assign item_types = var.with_types | split: ", " %}
      {%- if var.with_types == nil or item_types contains "list" %}
        {%- assign has_list_props = true %}
      {%- endif %}
    {% endfor %}
    {% if has_list_props %}
    <tr>
      <th id="formfield_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% for var in group_properties %}
      {%- assign item_types = var.with_types | split: ", " %}
      {%- assign type_match = false %}
      {%- if var.with_types %}
        {%- if item_types contains "list" %}
          {%- assign type_match = true %}
        {%- endif %}
      {%- else %}
        {%- assign type_match = true %}
      {%- endif %}
      {%- if type_match %}
    <tr>
      <td>
        <span id="formfield_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{ var.version }}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>
          {{ var.description | markdownify }}
        </p>
        {% if var.name == "type" %}
        <div>
          <strong>Valeur :</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Choix :</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (par défaut)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Par défaut :</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Exemples</summary>
          {% for ex in var.examples %}
          <p><strong>{{ ex.name }}</strong></p>
          <pre><code class="language-yaml">{{ ex.code }}</code></pre>
          {% endfor %}
        </details>
        {% endif %}
      </td>
    </tr>
      {%- endif %}
    {% endfor %}
    {% endif %}
    {% endfor %}
  </tbody>
</table>

{%- endif %}

---

## Exemples

### Sous-formulaire d'adresse partagé

Un sous-formulaire `Address` réutilisé par deux champs list du même formulaire :

```yaml
- name: Address
  type: subform
  fields:
    - name: street
      type: text
      label: Street
      required: true
    - name: city
      type: text
      label: City
      required: true
    - name: country
      type: text
      label: Country

- name: Create customer
  type: ansible
  playbook: customer.yaml
  roles: [default]
  fields:
    - name: name
      type: text
      label: Customer name
      required: true
    - name: addresses
      type: list
      label: Addresses
      subform: Address
      columns:
        - city
        - country
      titleAdd: Add address
      titleEdit: Edit address
      allowInsert: true
      allowDelete: true
```

### Suivi par marqueurs (compatible avec l'idempotence)

Les lignes préchargées sont protégées, et les marqueurs indiquent au playbook quelles lignes sont nouvelles, modifiées ou supprimées :

```yaml
- name: people
  type: list
  label: People
  subform: Person
  allowDelete: false       # preloaded rows are protected
  insertMarker: added      # session-added rows remain removable
  updateMarker: updated
  deleteMarker: removed
  columns:
    - name
    - email
```

### Pré-remplir les lignes

Une liste peut être pré-remplie depuis trois sources. Dans tous les cas, les lignes obtenues doivent être des objets dont les clés correspondent aux noms des champs du sous-formulaire référencé.

#### `default` statique

Des lignes écrites dans le formulaire lui-même :

```yaml
- name: addresses
  type: list
  label: Addresses
  subform: Address
  columns:
    - city
    - country
  default:
    - street: Main 1
      city: Brussels
      country: BE
    - street: Side 22
      city: Paris
      country: FR
```

#### Depuis une API REST (`expression`)

Des lignes chargées depuis une API REST par une expression côté serveur :

```yaml
- name: users
  type: list
  label: Users
  subform: User
  columns:
    - username
    - email
  expression: fn.fnRestBasic('get','https://api.example.com/users','','my_api_cred','')
```

#### Depuis une requête de base de données (`dbConfig` + `query`)

Des lignes chargées depuis une requête de base de données :

```yaml
- name: servers
  type: list
  label: Servers
  subform: Server
  columns:
    - hostname
    - role
  dbConfig: CMDB_CONN
  query: SELECT hostname, role FROM servers WHERE active = 1
```

#### Depuis une expression locale (`runLocal`)

Des lignes calculées dans le navigateur par une expression locale :

```yaml
- name: ports
  type: list
  label: Open ports
  subform: Port
  columns:
    - port
    - protocol
  runLocal: true
  expression: |
    [
      { port: 22,  protocol: 'tcp' },
      { port: 80,  protocol: 'tcp' },
      { port: 443, protocol: 'tcp' }
    ]
```

### Listes imbriquées

Un sous-formulaire peut contenir son propre champ list, pour avoir une liste dans chaque ligne :

```yaml
- name: Address
  type: subform
  fields:
    - name: street
      type: text
      label: Street
    - name: city
      type: text
      label: City

- name: Person
  type: subform
  fields:
    - name: name
      type: text
      label: Name
      required: true
    - name: addresses
      type: list
      label: Addresses
      subform: Address
      columns:
        - street
        - city

- name: My Form
  type: ansible
  playbook: people.yaml
  roles: [default]
  fields:
    - name: people
      type: list
      label: People
      subform: Person
      columns:
        - name
        - addresses
```

### Accéder aux données du formulaire parent via `__parent__`

Quand l'éditeur de ligne d'un sous-formulaire s'ouvre, AnsibleForms injecte une variable `__parent__` dans le sous-formulaire. Elle contient un instantané de **toutes les valeurs des champs du formulaire parent**, y compris les constantes et les vars.

Faites-y référence avec la syntaxe d'expression standard `$(...)` dans les définitions de champ du sous-formulaire :

```yaml
- name: NodeConfig
  type: subform
  fields:
    - name: node_name
      type: text
      label: Node name
      required: true

    - name: node_type
      type: enum
      # only offer gpu in production environments (parent field)
      expression: |
        '$(__parent__.environment)' === 'production'
          ? ['standard', 'high-memory', 'gpu']
          : ['standard', 'high-memory']
      runLocal: true
      default: __auto__

- name: Deploy cluster
  type: ansible
  playbook: deploy.yml
  roles: [default]
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]
      required: true

    - name: nodes
      type: list
      subform: NodeConfig
      columns: [node_name, node_type]
```

{: .note }
> `__parent__` est une aide **propre au frontend**. Elle est retirée des extravars Ansible et n'est jamais envoyée au playbook.


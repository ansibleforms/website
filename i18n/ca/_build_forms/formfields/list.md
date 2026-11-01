---
layout: default
title: List
parent: Camps de formulari
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# Camp List
{: .no_toc }

Una taula de files, cadascuna editada en un subformulari
{: .fs-6 .fw-300 }

---

Un camp list mostra una taula de files, cadascuna creada i editada en un panell de **subformulari** dedicat (un patró de navegació en profunditat). Substitueix el camp `table`, que es va eliminar a la 7.0.0.

---

## Característiques principals

El camp list ofereix les possibilitats següents:

- Cada fila s'edita en un subformulari a pantalla completa, amb accés a tots els tipus de camp, incloses les llistes niades.
- El subformulari és un formulari en si mateix, de tipus `subform`, i es pot **reutilitzar en diversos camps list** de formularis diferents (p. ex. un sol subformulari `Address` compartit per clients, proveïdors, comandes…).
- Les propietats de marcatge (`insertMarker`, `updateMarker`, `deleteMarker`) permeten patrons de playbook idempotents.
- Amb `allowDelete: false`, les files que ja existien estan protegides; només es poden eliminar les files afegides a la sessió actual (les que porten l'`insertMarker`).
- La propietat `columns` controla quins camps del subformulari apareixen com a columnes a la taula de resum.
- La sortida és sempre una matriu d'objectes. Quan es generen les extravars, es respecten els `model`, `output`, `outputObject` i `valueColumn` declarats als camps del subformulari.

---

## Declaració del subformulari

Un subformulari és un formulari en si mateix amb `type: subform`, en un fitxer de la carpeta de formularis com qualsevol altre formulari. Accepta la mateixa matriu `fields` que qualsevol altre formulari, però no apareix mai a la llista de mosaics de formularis i no s'envia mai directament.

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

## Propietats

Les propietats disponibles per a un camp `list`, agrupades per finalitat:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatori</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / únic</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">afegit a la versió {{ var.version }}</span>{% endif %}
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
          <strong>Valor:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Opcions:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (per defecte)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Per defecte:</strong><br>
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

### Subformulari d'adreça compartit

Un subformulari `Address` reutilitzat per dos camps list del mateix formulari:

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

### Seguiment amb marcadors (pensat per a la idempotència)

Les files precarregades estan protegides, i els marcadors indiquen al playbook quines files són noves, quines han canviat i quines s'han eliminat:

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

### Emplenar les files per endavant

Una llista es pot emplenar per endavant des de tres fonts. En tots els casos, les files resultants han de ser objectes les claus dels quals coincideixin amb els noms dels camps del subformulari referenciat.

#### `default` estàtic

Files escrites al mateix formulari:

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

#### Des d'una API REST (`expression`)

Files carregades des d'una API REST per una expressió del costat del servidor:

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

#### Des d'una consulta a base de dades (`dbConfig` + `query`)

Files carregades des d'una consulta a base de dades:

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

`dbConfig` nomena una [base de dades](../databases.html) de **Connexions > Bases de dades** (des de la 7.5.0), o si no una credencial de tipus base de
dades, com abans (vegeu [Bases de dades als formularis](../databases/in-forms.html)).

#### Des d'una expressió local (`runLocal`)

Files calculades al navegador per una expressió local:

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

### Llistes niades

Un subformulari pot contenir un camp list propi, per tenir una llista dins de cada fila:

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

### Accedir a les dades del formulari pare amb `__parent__`

Quan s'obre l'editor de files d'un subformulari, AnsibleForms injecta una variable `__parent__` al subformulari. Conté una instantània de **tots els valors dels camps del formulari pare**, incloses les constants i les variables.

Fes-hi referència amb la sintaxi d'expressió estàndard `$(...)` a les definicions dels camps del subformulari:

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
> `__parent__` és una eina auxiliar **només del frontend**. Es treu de les extravars d'Ansible i no s'envia mai al playbook.


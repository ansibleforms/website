---
layout: default
title: List
parent: Campi del modulo
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# Campo List
{: .no_toc }

Una tabella di righe, ognuna modificata in un sottomodulo
{: .fs-6 .fw-300 }

---

Un campo list mostra una tabella di righe, ognuna creata e modificata in un pannello dedicato di **sottomodulo** (uno schema di drilldown). Sostituisce il campo `table`, rimosso nella 7.0.0.

---

## Caratteristiche principali

Il campo list offre le seguenti funzionalità:

- Ogni riga viene modificata in un sottomodulo a schermo intero, che dà accesso a tutti i tipi di campo, comprese le liste annidate.
- Il sottomodulo è un modulo a sé, di tipo `subform`, e può essere **riutilizzato in più campi list** di moduli diversi (ad es. un unico sottomodulo `Address` condiviso da clienti, fornitori, ordini…).
- Le proprietà marker (`insertMarker`, `updateMarker`, `deleteMarker`) supportano schemi di playbook idempotenti.
- Con `allowDelete: false`, le righe preesistenti sono protette; si possono eliminare solo le righe aggiunte nella sessione corrente (quelle con l'`insertMarker`).
- La proprietà `columns` stabilisce quali campi del sottomodulo compaiono come colonne nella tabella riepilogativa.
- L'output è sempre un array di oggetti. `model`, `output`, `outputObject` e `valueColumn` dichiarati sui campi del sottomodulo vengono rispettati quando si generano le extravars.

---

## Dichiarazione del sottomodulo

Un sottomodulo è un modulo a sé con `type: subform`, in un file della cartella dei moduli come qualsiasi altro modulo. Accetta lo stesso array `fields` di qualsiasi altro modulo, ma non compare mai nell'elenco a riquadri dei moduli e non viene mai inviato direttamente.

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

## Proprietà

Le proprietà disponibili per un campo `list`, raggruppate per scopo:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
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
        {% if var.required==true %}<span class="af-required"> / obbligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / univoco</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">aggiunto nella versione {{ var.version }}</span>{% endif %}
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
          <strong>Valore:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Scelte:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinito)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Predefinito:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Esempi</summary>
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

## Esempi

### Sottomodulo di indirizzo condiviso

Un unico sottomodulo `Address` riutilizzato da due campi list dello stesso modulo:

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

### Tracciamento con marker (attento all'idempotenza)

Le righe precaricate sono protette, e i marker indicano al playbook quali righe sono nuove, modificate o rimosse:

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

### Precompilare le righe

Una lista può essere precompilata da tre sorgenti. In ogni caso, le righe risultanti devono essere oggetti le cui chiavi corrispondono ai nomi dei campi del sottomodulo a cui si fa riferimento.

#### `default` statico

Righe scritte nel modulo stesso:

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

#### Da un'API REST (`expression`)

Righe caricate da un'API REST tramite un'espressione lato server:

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

#### Da una query su database (`dbConfig` + `query`)

Righe caricate da una query su database:

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

`dbConfig` indica un [database](../databases.html) di **Connessioni > Database** (dalla 7.5.0), o altrimenti una credenziale di tipo database,
come prima (vedi [I database nei moduli](../databases/in-forms.html)).

#### Da un'espressione locale (`runLocal`)

Righe calcolate nel browser da un'espressione locale:

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

### Liste annidate

Un sottomodulo può contenere un proprio campo list, per avere una lista dentro ogni riga:

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

### Accedere ai dati del modulo padre tramite `__parent__`

Quando si apre l'editor di una riga del sottomodulo, AnsibleForms inserisce una variabile `__parent__` nel sottomodulo. Contiene un'istantanea di **tutti i valori dei campi del modulo padre**, comprese costanti e variabili.

Fai riferimento a essa con la sintassi standard delle espressioni `$(...)` nelle definizioni dei campi del sottomodulo:

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
> `__parent__` è un helper **solo frontend**. Viene rimosso dalle extravars di Ansible e non viene mai inviato al playbook.


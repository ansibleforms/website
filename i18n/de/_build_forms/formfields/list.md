---
layout: default
title: List
parent: Formularfelder
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# List-Feld
{: .no_toc }

Eine Tabelle aus Zeilen, jede in einem Unterformular bearbeitet
{: .fs-6 .fw-300 }

---

Ein list-Feld zeigt eine Tabelle aus Zeilen, die jeweils in einem eigenen **Unterformular**-Bereich erstellt und bearbeitet werden (ein Drilldown-Muster). Es ersetzt das Feld `table`, das in 7.0.0 entfernt wurde.

---

## Hauptfunktionen

Das list-Feld bietet folgende Möglichkeiten:

- Jede Zeile wird in einem Unterformular im Vollbild bearbeitet, mit Zugriff auf alle Feldtypen, einschließlich verschachtelter Listen.
- Das Unterformular ist ein eigenes Formular vom Typ `subform` und kann **in mehreren list-Feldern** verschiedener Formulare **wiederverwendet** werden (z. B. ein einziges Unterformular `Address`, das Kunden, Lieferanten, Bestellungen… gemeinsam nutzen).
- Die Marker-Eigenschaften (`insertMarker`, `updateMarker`, `deleteMarker`) unterstützen idempotente Playbook-Muster.
- Bei `allowDelete: false` sind bereits vorhandene Zeilen geschützt; nur in der aktuellen Sitzung hinzugefügte Zeilen (mit dem `insertMarker`) können gelöscht werden.
- Die Eigenschaft `columns` steuert, welche Felder des Unterformulars als Spalten in der Übersichtstabelle erscheinen.
- Die Ausgabe ist immer ein Array von Objekten. `model`, `output`, `outputObject` und `valueColumn`, die auf Feldern des Unterformulars deklariert sind, werden beim Erzeugen der Extravars berücksichtigt.

---

## Deklaration des Unterformulars

Ein Unterformular ist ein eigenes Formular mit `type: subform`, in einer Datei des Formularordners wie jedes andere Formular. Es akzeptiert dasselbe Array `fields` wie jedes andere Formular, erscheint aber nie in der Kachelliste der Formulare und wird nie direkt abgesendet.

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

## Eigenschaften

Die für ein `list`-Feld verfügbaren Eigenschaften, nach Zweck gruppiert:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
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
        {% if var.required==true %}<span class="af-required"> / erforderlich</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / eindeutig</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">hinzugefügt in Version {{ var.version }}</span>{% endif %}
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
          <strong>Wert:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Auswahlmöglichkeiten:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (Standard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standard:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Beispiele</summary>
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

## Beispiele

### Gemeinsames Adress-Unterformular

Ein Unterformular `Address`, das von zwei list-Feldern desselben Formulars wiederverwendet wird:

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

### Nachverfolgung mit Markern (idempotent)

Vorab geladene Zeilen sind geschützt, und die Marker teilen dem Playbook mit, welche Zeilen neu, geändert oder entfernt sind:

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

### Zeilen vorab füllen

Eine Liste kann aus drei Quellen vorab gefüllt werden. In jedem Fall müssen die entstehenden Zeilen Objekte sein, deren Schlüssel zu den Feldnamen des referenzierten Unterformulars passen.

#### Statisches `default`

Zeilen, die im Formular selbst stehen:

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

#### Aus einer REST-API (`expression`)

Zeilen, die ein serverseitiger Ausdruck aus einer REST-API lädt:

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

#### Aus einer Datenbankabfrage (`dbConfig` + `query`)

Zeilen, die aus einer Datenbankabfrage geladen werden:

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

`dbConfig` nennt eine [Datenbank](../databases.html) unter **Verbindungen > Datenbanken** (ab 7.5.0) oder sonst Anmeldedaten vom Typ Datenbank,
wie bisher (siehe [Datenbanken in Formularen](../databases/in-forms.html)).

#### Aus einem lokalen Ausdruck (`runLocal`)

Zeilen, die ein lokaler Ausdruck im Browser berechnet:

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

### Verschachtelte Listen

Ein Unterformular kann ein eigenes list-Feld enthalten, für eine Liste innerhalb jeder Zeile:

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

### Über `__parent__` auf Daten des übergeordneten Formulars zugreifen

Wenn sich der Zeileneditor eines Unterformulars öffnet, fügt AnsibleForms eine Variable `__parent__` in das Unterformular ein. Sie enthält eine Momentaufnahme **aller Feldwerte des übergeordneten Formulars**, einschließlich Konstanten und Vars.

Verweisen Sie darauf mit der üblichen Ausdruckssyntax `$(...)` in den Felddefinitionen des Unterformulars:

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
> `__parent__` ist ein Hilfsmittel **nur für das Frontend**. Es wird aus den Ansible-Extravars entfernt und nie an das Playbook gesendet.


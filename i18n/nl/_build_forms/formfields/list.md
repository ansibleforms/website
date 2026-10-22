---
layout: default
title: List
parent: Formuliervelden
nav_order: 13
translated_from: b6209effaf1cc9783a27c36669004a239751fb3e
---

# Veld List
{: .no_toc }

Een tabel met rijen, elk bewerkt in een subformulier
{: .fs-6 .fw-300 }

---

Een list-veld toont een tabel met rijen, die elk worden aangemaakt en bewerkt in een eigen paneel met een **subformulier** (een drilldownpatroon). Het vervangt het veld `table`, dat in 7.0.0 is verwijderd.

---

## Belangrijkste kenmerken

Het list-veld biedt de volgende mogelijkheden:

- Elke rij wordt bewerkt in een subformulier op volledig scherm, met toegang tot elk veldtype, geneste lijsten inbegrepen.
- Het subformulier is een eigen formulier, van type `subform`, en kan worden **hergebruikt in meerdere list-velden** in verschillende formulieren (bijvoorbeeld één subformulier `Address` dat klanten, leveranciers, orders… delen).
- Markeringseigenschappen (`insertMarker`, `updateMarker`, `deleteMarker`) ondersteunen idempotente playbookpatronen.
- Met `allowDelete: false` zijn bestaande rijen beschermd; alleen rijen die in de huidige sessie zijn toegevoegd (met de `insertMarker`) kunnen worden verwijderd.
- De eigenschap `columns` bepaalt welke velden van het subformulier als kolommen in de overzichtstabel verschijnen.
- De uitvoer is altijd een array van objecten. `model`, `output`, `outputObject` en `valueColumn` die op velden van het subformulier zijn gedeclareerd, worden gerespecteerd wanneer de extravars worden gegenereerd.

---

## Declaratie van het subformulier

Een subformulier is een eigen formulier met `type: subform`, in een bestand van de formulierenmap zoals elk ander formulier. Het accepteert dezelfde array `fields` als elk ander formulier, maar het verschijnt nooit in de lijst met formuliertegels en wordt nooit rechtstreeks verzonden.

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

## Eigenschappen

De eigenschappen die beschikbaar zijn voor een `list`-veld, gegroepeerd naar doel:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
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
        {% if var.required==true %}<span class="af-required"> / verplicht</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / uniek</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">toegevoegd in versie {{ var.version }}</span>{% endif %}
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
          <strong>Waarde:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Keuzes:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (standaard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standaard:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Voorbeelden</summary>
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

## Voorbeelden

### Gedeeld adressubformulier

Eén subformulier `Address`, hergebruikt door twee list-velden van hetzelfde formulier:

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

### Bijhouden met markeringen (idempotent)

Vooraf geladen rijen zijn beschermd, en de markeringen vertellen het playbook welke rijen nieuw, gewijzigd of verwijderd zijn:

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

### Rijen vooraf vullen

Een lijst kan vanuit drie bronnen vooraf worden gevuld. In elk geval moeten de resulterende rijen objecten zijn waarvan de sleutels overeenkomen met de veldnamen van het subformulier waarnaar wordt verwezen.

#### Statische `default`

Rijen die in het formulier zelf staan:

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

#### Uit een REST API (`expression`)

Rijen die door een expressie aan de serverkant uit een REST API worden geladen:

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

#### Uit een databasequery (`dbConfig` + `query`)

Rijen die uit een databasequery worden geladen:

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

#### Uit een lokale expressie (`runLocal`)

Rijen die in de browser door een lokale expressie worden berekend:

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

### Geneste lijsten

Een subformulier kan een eigen list-veld bevatten, voor een lijst binnen elke rij:

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

### Gegevens van het bovenliggende formulier lezen via `__parent__`

Wanneer de rij-editor van een subformulier opent, voegt AnsibleForms een variabele `__parent__` aan het subformulier toe. Die bevat een momentopname van **alle veldwaarden van het bovenliggende formulier**, inclusief constanten en vars.

Verwijs ernaar met de gewone expressiesyntax `$(...)` in de velddefinities van het subformulier:

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
> `__parent__` is een hulpmiddel dat **alleen in de frontend** bestaat. Het wordt uit de Ansible-extravars verwijderd en nooit naar het playbook gestuurd.


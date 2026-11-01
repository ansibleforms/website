---
layout: default
title: List
parent: Pola formularza
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# Pole List
{: .no_toc }

Tabela wierszy, z których każdy edytuje się w podformularzu
{: .fs-6 .fw-300 }

---

Pole list wyświetla tabelę wierszy, z których każdy tworzy się i edytuje w osobnym panelu **podformularza** (wzorzec drilldown). Zastępuje pole `table`, usunięte w wersji 7.0.0.

---

## Najważniejsze funkcje

Pole list oferuje następujące możliwości:

- Każdy wiersz edytuje się w pełnoekranowym podformularzu, który daje dostęp do wszystkich typów pól, łącznie z zagnieżdżonymi listami.
- Podformularz to osobny formularz typu `subform` i można go **używać ponownie w wielu polach list** w różnych formularzach (np. jeden podformularz `Address` wspólny dla klientów, dostawców, zamówień…).
- Właściwości znaczników (`insertMarker`, `updateMarker`, `deleteMarker`) wspierają idempotentne wzorce playbooków.
- Przy `allowDelete: false` istniejące wcześniej wiersze są chronione; usunąć można tylko wiersze dodane w bieżącej sesji (oznaczone `insertMarker`).
- Właściwość `columns` określa, które pola podformularza pojawiają się jako kolumny w tabeli podsumowania.
- Wynikiem jest zawsze tablica obiektów. Właściwości `model`, `output`, `outputObject` i `valueColumn` zadeklarowane w polach podformularza są respektowane przy generowaniu extravars.

---

## Deklaracja podformularza

Podformularz to osobny formularz z `type: subform`, zapisany w pliku folderu formularzy jak każdy inny formularz. Przyjmuje tę samą tablicę `fields` co każdy inny formularz, ale nigdy nie pojawia się na liście kafelków formularzy i nigdy nie jest wysyłany bezpośrednio.

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

## Właściwości

Właściwości dostępne dla pola `list`, pogrupowane według przeznaczenia:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
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
        {% if var.required==true %}<span class="af-required"> / wymagane</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unikalne</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">dodano w wersji {{ var.version }}</span>{% endif %}
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
          <strong>Wartość:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Opcje:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (domyślnie)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Domyślnie:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Przykłady</summary>
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

## Przykłady

### Wspólny podformularz adresu

Jeden podformularz `Address` używany przez dwa pola list tego samego formularza:

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

### Śledzenie znacznikami (z myślą o idempotencji)

Wstępnie załadowane wiersze są chronione, a znaczniki mówią playbookowi, które wiersze są nowe, zmienione lub usunięte:

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

### Wstępne wypełnianie wierszy

Listę można wstępnie wypełnić z trzech źródeł. W każdym przypadku wynikowe wiersze muszą być obiektami, których klucze odpowiadają nazwom pól wskazanego podformularza.

#### Statyczny `default`

Wiersze zapisane w samym formularzu:

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

#### Z REST API (`expression`)

Wiersze ładowane z REST API przez wyrażenie po stronie serwera:

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

#### Z zapytania do bazy danych (`dbConfig` + `query`)

Wiersze ładowane z zapytania do bazy danych:

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

`dbConfig` wskazuje [bazę danych](../databases.html) z **Połączenia > Bazy danych** (od wersji 7.5.0), a w przeciwnym razie poświadczenie typu
baza danych, jak dotąd (zobacz [Bazy danych w formularzach](../databases/in-forms.html)).

#### Z wyrażenia lokalnego (`runLocal`)

Wiersze obliczane w przeglądarce przez wyrażenie lokalne:

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

### Zagnieżdżone listy

Podformularz może mieć własne pole list, aby w każdym wierszu była lista:

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

### Dostęp do danych formularza nadrzędnego przez `__parent__`

Gdy otwiera się edytor wiersza podformularza, AnsibleForms wstrzykuje do podformularza zmienną `__parent__`. Zawiera ona migawkę **wszystkich wartości pól formularza nadrzędnego**, łącznie ze stałymi i vars.

Odwołuj się do niej standardową składnią wyrażeń `$(...)` w definicjach pól podformularza:

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
> `__parent__` to pomocnik działający **wyłącznie we frontendzie**. Jest usuwany z extravars Ansible i nigdy nie trafia do playbooka.


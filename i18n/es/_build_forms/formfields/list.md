---
layout: default
title: List
parent: Campos de formulario
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# Campo List
{: .no_toc }

Una tabla de filas, cada una editada en un subformulario
{: .fs-6 .fw-300 }

---

Un campo list muestra una tabla de filas, cada una creada y editada en un panel de **subformulario** propio (un patrón de navegación en profundidad). Sustituye al campo `table`, que se eliminó en 7.0.0.

---

## Características principales

El campo list ofrece las siguientes capacidades:

- Cada fila se edita en un subformulario a pantalla completa, con acceso a todos los tipos de campo, incluidas las listas anidadas.
- El subformulario es un formulario propio, de tipo `subform`, y se puede **reutilizar en varios campos list** de distintos formularios (p. ej., un único subformulario `Address` compartido por clientes, proveedores, pedidos…).
- Las propiedades de marcador (`insertMarker`, `updateMarker`, `deleteMarker`) permiten patrones de playbook idempotentes.
- Con `allowDelete: false`, las filas preexistentes están protegidas; solo se pueden eliminar las filas añadidas en la sesión actual (las que llevan el `insertMarker`).
- La propiedad `columns` controla qué campos del subformulario aparecen como columnas en la tabla resumen.
- La salida es siempre un array de objetos. `model`, `output`, `outputObject` y `valueColumn` declarados en los campos del subformulario se respetan al generar las extravars.

---

## Declaración del subformulario

Un subformulario es un formulario propio con `type: subform`, en un archivo de la carpeta de formularios como cualquier otro formulario. Acepta el mismo array `fields` que cualquier otro formulario, pero nunca aparece en la lista de mosaicos de formularios y nunca se envía directamente.

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

## Propiedades

Las propiedades disponibles para un campo `list`, agrupadas por finalidad:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">añadido en la versión {{ var.version }}</span>{% endif %}
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
          <strong>Opciones:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (por defecto)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Por defecto:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Ejemplos</summary>
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

## Ejemplos

### Subformulario de dirección compartido

Un subformulario `Address` reutilizado por dos campos list del mismo formulario:

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

### Seguimiento con marcadores (idempotente)

Las filas precargadas están protegidas, y los marcadores indican al playbook qué filas son nuevas, se han modificado o se han eliminado:

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

### Rellenar filas de antemano

Una lista se puede rellenar de antemano desde tres fuentes. En todos los casos, las filas resultantes deben ser objetos cuyas claves coincidan con los nombres de campo del subformulario referenciado.

#### `default` estático

Filas escritas en el propio formulario:

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

#### Desde una API REST (`expression`)

Filas cargadas desde una API REST mediante una expresión del lado del servidor:

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

#### Desde una consulta a base de datos (`dbConfig` + `query`)

Filas cargadas desde una consulta a base de datos:

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

`dbConfig` nombra una [base de datos](../databases.html) de **Conexiones > Bases de datos** (desde la 7.5.0), o si no una credencial de tipo base de datos,
como antes (consulta [Bases de datos en los formularios](../databases/in-forms.html)).

#### Desde una expresión local (`runLocal`)

Filas calculadas en el navegador mediante una expresión local:

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

### Listas anidadas

Un subformulario puede contener su propio campo list, para tener una lista dentro de cada fila:

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

### Acceder a los datos del formulario padre con `__parent__`

Cuando se abre el editor de una fila del subformulario, AnsibleForms inyecta una variable `__parent__` en el subformulario. Contiene una instantánea de **todos los valores de los campos del formulario padre**, incluidas las constantes y las vars.

Haz referencia a ella con la sintaxis de expresión estándar `$(...)` en las definiciones de campos del subformulario:

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
> `__parent__` es una ayuda **solo del frontend**. Se elimina de las extravars de Ansible y nunca se envía al playbook.


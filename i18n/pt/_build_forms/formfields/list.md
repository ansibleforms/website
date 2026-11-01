---
layout: default
title: List
parent: Campos de formulário
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# Campo List
{: .no_toc }

Uma tabela de linhas, cada uma editada num subformulário
{: .fs-6 .fw-300 }

---

Um campo list mostra uma tabela de linhas, cada uma criada e editada num painel próprio de **subformulário** (um padrão de drilldown). Substitui o campo `table`, que foi removido na 7.0.0.

---

## Funcionalidades principais

O campo list oferece as seguintes capacidades:

- Cada linha é editada num subformulário em ecrã inteiro, com acesso a todos os tipos de campo, incluindo listas aninhadas.
- O subformulário é um formulário próprio, do tipo `subform`, e pode ser **reutilizado em vários campos list** de formulários diferentes (por exemplo, um único subformulário `Address` partilhado por clientes, fornecedores, encomendas…).
- As propriedades de marcação (`insertMarker`, `updateMarker`, `deleteMarker`) suportam padrões de playbook idempotentes.
- Com `allowDelete: false`, as linhas pré-existentes ficam protegidas; só as linhas adicionadas na sessão atual (que levam o `insertMarker`) podem ser eliminadas.
- A propriedade `columns` controla que campos do subformulário aparecem como colunas na tabela de resumo.
- O resultado é sempre um array de objetos. `model`, `output`, `outputObject` e `valueColumn` declarados nos campos do subformulário são respeitados quando as extravars são geradas.

---

## Declaração do subformulário

Um subformulário é um formulário próprio com `type: subform`, num ficheiro da pasta de formulários como qualquer outro formulário. Aceita o mesmo array `fields` que qualquer outro formulário, mas nunca aparece na lista de mosaicos de formulários e nunca é submetido diretamente.

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

## Propriedades

As propriedades disponíveis para um campo `list`, agrupadas por finalidade:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
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
        {% if var.required==true %}<span class="af-required"> / obrigatório</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">adicionado na versão {{ var.version }}</span>{% endif %}
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
          <strong>Opções:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinido)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Predefinição:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>Exemplos</summary>
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

## Exemplos

### Subformulário de morada partilhado

Um subformulário `Address` reutilizado por dois campos list do mesmo formulário:

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

### Seguimento com marcadores (com idempotência)

As linhas pré-carregadas ficam protegidas, e os marcadores indicam ao playbook que linhas são novas, alteradas ou removidas:

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

### Preencher linhas antecipadamente

Uma lista pode ser preenchida antecipadamente a partir de três fontes. Em todos os casos, as linhas resultantes têm de ser objetos cujas chaves correspondem aos nomes dos campos do subformulário referido.

#### `default` estático

Linhas escritas no próprio formulário:

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

#### A partir de uma API REST (`expression`)

Linhas carregadas de uma API REST por uma expressão do lado do servidor:

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

#### A partir de uma consulta à base de dados (`dbConfig` + `query`)

Linhas carregadas a partir de uma consulta à base de dados:

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

`dbConfig` nomeia uma [base de dados](../databases.html) de **Ligações > Bases de dados** (a partir da 7.5.0), ou então uma credencial do tipo
base de dados, como antes (consulte [Bases de dados nos formulários](../databases/in-forms.html)).

#### A partir de uma expressão local (`runLocal`)

Linhas calculadas no navegador por uma expressão local:

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

### Listas aninhadas

Um subformulário pode conter o seu próprio campo list, para ter uma lista dentro de cada linha:

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

### Aceder aos dados do formulário pai através de `__parent__`

Quando o editor de uma linha do subformulário abre, o AnsibleForms injeta uma variável `__parent__` no subformulário. Esta contém uma fotografia de **todos os valores dos campos do formulário pai**, incluindo constantes e vars.

Refira-a com a sintaxe de expressões habitual `$(...)` nas definições dos campos do subformulário:

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
> `__parent__` é um auxiliar **exclusivo do frontend**. É retirado das extravars do Ansible e nunca é enviado para o playbook.


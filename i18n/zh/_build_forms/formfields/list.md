---
layout: default
title: List
parent: 表单字段
nav_order: 13
translated_from: c454e7962323f4d82488bbdd30f92a7619162c32
---

# List 字段
{: .no_toc }

由多行组成的表格，每一行都在子表单中编辑
{: .fs-6 .fw-300 }

---

list 字段显示一个由多行组成的表格，每一行都在专用的**子表单**面板中创建和编辑（下钻模式）。它取代了在 7.0.0 中移除的 `table` 字段。

---

## 主要功能

list 字段提供以下功能：

- 每一行都在全屏子表单中编辑，可以使用所有字段类型，包括嵌套列表。
- 子表单本身就是一个类型为 `subform` 的独立表单，可以在不同表单的**多个 list 字段中复用**（例如客户、供应商、订单……共用同一个 `Address` 子表单）。
- 标记属性（ `insertMarker` 、 `updateMarker` 、 `deleteMarker` ）支持幂等的 playbook 模式。
- 当 `allowDelete: false` 时，已有的行受到保护；只有在当前会话中添加的行（带有 `insertMarker` ）才能删除。
- `columns` 属性控制哪些子表单字段作为列显示在汇总表格中。
- 输出始终是一个对象数组。生成 extravars 时，会遵循子表单字段上声明的 `model` 、 `output` 、 `outputObject` 和 `valueColumn` 。

---

## 子表单声明

子表单是一个带有 `type: subform` 的独立表单，和其他表单一样放在 forms 文件夹的某个文件中。它接受与其他表单相同的 `fields` 数组，但从不出现在表单磁贴列表中，也从不直接提交。

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

## 属性

`list` 字段可用的属性，按用途分组：

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
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
        {% if var.required==true %}<span class="af-required"> / 必填</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / 唯一</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{ var.version }} 中添加</span>{% endif %}
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
          <strong>值：</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>选项：</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }}（默认）</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>默认值：</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>示例</summary>
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

## 示例

### 共享的地址子表单

同一个表单中的两个 list 字段复用一个 `Address` 子表单：

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

### 标记跟踪（支持幂等）

预加载的行受到保护，标记会告诉 playbook 哪些行是新增、修改或删除的：

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

### 预填充行

列表可以从三种来源预先填充。无论哪种情况，得到的行都必须是对象，其键与所引用子表单的字段名一致。

#### 静态 `default`

直接写在表单中的行：

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

#### 来自 REST API（ `expression` ）

由服务器端表达式从 REST API 加载的行：

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

#### 来自数据库查询（ `dbConfig` + `query` ）

从数据库查询加载的行：

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

`dbConfig` 指定 **连接 > 数据库** 中的 [数据库](../databases.html)（从 7.5.0 起），否则和以前一样指定类型为数据库的
凭据（参见 [表单中的数据库](../databases/in-forms.html)）。

#### 来自本地表达式（ `runLocal` ）

由本地表达式在浏览器中计算出的行：

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

### 嵌套列表

子表单本身也可以包含 list 字段，从而在每一行中再嵌套一个列表：

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

### 通过 `__parent__` 访问父表单数据

子表单行编辑器打开时，AnsibleForms 会向子表单注入一个 `__parent__` 变量。它保存了**父表单所有字段值**的快照，包括常量和 vars。

在子表单的字段定义中，用标准的 `$(...)` 表达式语法引用它：

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
> `__parent__` 是一个**仅限前端**的辅助变量。它会从 Ansible extravars 中移除，永远不会发送给 playbook。


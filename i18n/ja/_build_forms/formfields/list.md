---
layout: default
title: List
parent: フォームフィールド
nav_order: 13
translated_from: b6209effaf1cc9783a27c36669004a239751fb3e
---

# List フィールド
{: .no_toc }

行ごとにサブフォームで編集する、行の表です
{: .fs-6 .fw-300 }

---

list フィールドは行の表を表示し、各行は専用の **サブフォーム** ペインで作成、編集します (ドリルダウン方式)。7.0.0 で削除された `table` フィールドに代わるものです。

---

## 主な機能

list フィールドには次の機能があります。

- 各行は全画面のサブフォームで編集するため、ネストしたリストを含むすべてのフィールドの種類を使用できます。
- サブフォームは `subform` 型の独立したフォームであり、別々のフォームにある **複数の list フィールドで再利用** できます (たとえば、顧客、仕入先、注文などで 1 つの `Address` サブフォームを共有できます)。
- マーカープロパティ (`insertMarker`、`updateMarker`、`deleteMarker`) により、冪等な playbook のパターンを実現できます。
- `allowDelete: false` の場合、既存の行は保護されます。削除できるのは、現在のセッションで追加された行 ( `insertMarker` が付いた行) だけです。
- `columns` プロパティで、サブフォームのどのフィールドを一覧表の列として表示するかを指定します。
- 出力は常にオブジェクトの配列です。サブフォームのフィールドで宣言した `model`、`output`、`outputObject`、`valueColumn` は、extravars の生成時に反映されます。

---

## サブフォームの宣言

サブフォームは `type: subform` を持つ独立したフォームで、ほかのフォームと同じようにフォームフォルダー内のファイルに置きます。ほかのフォームと同じ `fields` 配列を受け付けますが、フォームのタイル一覧には表示されず、直接送信されることもありません。

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

## プロパティ

`list` フィールドで使用できるプロパティを、用途別にまとめています。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
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
        {% if var.required==true %}<span class="af-required"> / 必須</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / 一意</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">バージョン {{ var.version }} で追加</span>{% endif %}
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
          <strong>値:</strong><br>
          <span>list</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>選択肢:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (既定)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>既定値:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples.size > 0 %}
        <details>
          <summary>例</summary>
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

## 例

### 共有の住所サブフォーム

同じフォームの 2 つの list フィールドで、1 つの `Address` サブフォームを再利用します。

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

### マーカーによる追跡 (冪等性に対応)

事前に読み込まれた行は保護され、どの行が新規、変更、削除なのかをマーカーで playbook に伝えます。

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

### 行を事前に入力する

list には 3 種類のソースから事前に値を入れられます。いずれの場合も、結果の行は、参照先サブフォームのフィールド名と一致するキーを持つオブジェクトである必要があります。

#### 静的な `default`

フォーム自体に記述した行です。

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

#### REST API から (`expression`)

サーバー側の式で REST API から読み込んだ行です。

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

#### データベースクエリから (`dbConfig` + `query`)

データベースクエリで読み込んだ行です。

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

#### ローカル式から (`runLocal`)

ローカル式によってブラウザーで計算した行です。

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

### ネストしたリスト

サブフォーム自体に list フィールドを持たせて、各行の中にリストを入れられます。

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

### `__parent__` で親フォームのデータを参照する

サブフォームの行エディターが開くと、AnsibleForms はサブフォームに `__parent__` 変数を注入します。この変数には **親フォームのすべてのフィールド値** のスナップショットが入っており、定数や vars も含まれます。

サブフォームのフィールド定義では、標準の `$(...)` 式の構文でこの変数を参照します。

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
> `__parent__` は **フロントエンド専用** のヘルパーです。Ansible の extravars からは取り除かれ、playbook に送られることはありません。


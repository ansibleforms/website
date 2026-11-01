---
layout: default
title: YAML
parent: 表单字段
nav_order: 14
translated_from: 8dde3e82c2a53e38adc729f5a8f3764b182718c7
---

# YAML 字段
{: .no_toc }

在 YAML 编辑器中编辑的结构化数据，支持校验和文件导入
{: .fs-6 .fw-300 }

---

## 属性

`yaml` 字段可用的属性，按用途分组：

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
    <tr>
      <th id="formfield_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% for var in group_properties %}
      {%- assign item_types = var.with_types | split: ", " %}
      {%- assign type_match = false %}
      {%- if var.with_types %}
        {%- if item_types contains "yaml" %}
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
          <span>{{ page.title | downcase }}</span>
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
      </td>
    </tr>
      {%- endif %}
    {% endfor %}
    {% endfor %}
  </tbody>
</table>

---

## 示例

`yaml` 字段示例（YAML）：

{%- assign type_choice = formfield_object.items | where: "name", "type" | first %}
{%- if type_choice.choices %}
  {%- assign yaml_type = type_choice.choices | where: "name", "yaml" | first %}
  {%- if yaml_type.examples %}
    {%- for example in yaml_type.examples %}

### {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}字段定义（YAML）：{% endif %}

```yaml
{{ example.code }}
```
    {%- endfor %}
  {%- endif %}
{%- endif %}

{%- endif %}

---

## 通过 `__parent__` 访问父表单数据

当 `yaml` 字段使用 `subform` 模式时，AnsibleForms 会向子表单注入一个 `__parent__` 变量。它保存了编辑器打开那一刻**父表单所有字段值**的快照，包括常量和 vars。

在子表单的字段定义中，用标准的 `$(...)` 表达式语法引用它：

```yaml
- name: NetworkConfig
  type: subform
  fields:
    - name: interface
      type: text
      label: Interface
      required: true

    - name: vlan
      type: enum
      label: VLAN
      # filter available VLANs based on the parent's selected region
      query: "select id,name from vlans where region='$(__parent__.region)'"
      dbConfig: MYDB      # a database of Connections > Databases
      valueColumn: id
      placeholderColumn: name

    - name: mtu
      type: number
      label: MTU
      # default to 9000 in production, 1500 elsewhere
      default: "'$(__parent__.environment)' === 'production' ? 9000 : 1500"
      evalDefault: true

- name: Configure server
  type: ansible
  playbook: configure.yml
  roles: [default]
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]

    - name: region
      type: enum
      values: [eu-west-1, us-east-1, ap-southeast-1]

    - name: nic
      type: yaml
      label: Network interface
      subform: NetworkConfig
```

{: .note }
> `__parent__` 是一个**仅限前端**的辅助变量。它会从 Ansible extravars 中移除，永远不会发送给 playbook。

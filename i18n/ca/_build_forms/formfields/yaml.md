---
layout: default
title: YAML
parent: Camps de formulari
nav_order: 14
translated_from: 8dde3e82c2a53e38adc729f5a8f3764b182718c7
---

# Camp YAML
{: .no_toc }

Dades estructurades en un editor YAML, amb validació i importació de fitxers
{: .fs-6 .fw-300 }

---

## Propietats

Les propietats disponibles per a un camp `yaml`, agrupades per finalitat:

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
          <span>{{ page.title | downcase }}</span>
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
      </td>
    </tr>
      {%- endif %}
    {% endfor %}
    {% endfor %}
  </tbody>
</table>

---

## Exemples

Exemples de camps `yaml`, en YAML:

{%- assign type_choice = formfield_object.items | where: "name", "type" | first %}
{%- if type_choice.choices %}
  {%- assign yaml_type = type_choice.choices | where: "name", "yaml" | first %}
  {%- if yaml_type.examples %}
    {%- for example in yaml_type.examples %}

### {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definició del camp, en YAML:{% endif %}

```yaml
{{ example.code }}
```
    {%- endfor %}
  {%- endif %}
{%- endif %}

{%- endif %}

---

## Accedir a les dades del formulari pare amb `__parent__`

Quan un camp `yaml` fa servir el mode `subform`, AnsibleForms injecta una variable `__parent__` al subformulari. Conté una instantània de **tots els valors dels camps del formulari pare** en el moment en què s'obre l'editor, incloses les constants i les variables.

Fes-hi referència amb la sintaxi d'expressió estàndard `$(...)` a les definicions dels camps del subformulari:

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
> `__parent__` és una eina auxiliar **només del frontend**. Es treu de les extravars d'Ansible i no s'envia mai al playbook.

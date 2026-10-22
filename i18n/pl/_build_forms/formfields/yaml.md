---
layout: default
title: YAML
parent: Pola formularza
nav_order: 14
translated_from: c7439c165a54cf525a91d0458a268a66ee8a136f
---

# Pole YAML
{: .no_toc }

Dane strukturalne w edytorze YAML, z walidacją i importem z pliku
{: .fs-6 .fw-300 }

---

## Właściwości

Właściwości dostępne dla pola `yaml`, pogrupowane według przeznaczenia:

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
          <span>{{ page.title | downcase }}</span>
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
      </td>
    </tr>
      {%- endif %}
    {% endfor %}
    {% endfor %}
  </tbody>
</table>

---

## Przykłady

Przykładowe pola `yaml` w YAML:

{%- assign type_choice = formfield_object.items | where: "name", "type" | first %}
{%- if type_choice.choices %}
  {%- assign yaml_type = type_choice.choices | where: "name", "yaml" | first %}
  {%- if yaml_type.examples %}
    {%- for example in yaml_type.examples %}

### {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Definicja pola w YAML:{% endif %}

```yaml
{{ example.code }}
```
    {%- endfor %}
  {%- endif %}
{%- endif %}

{%- endif %}

---

## Dostęp do danych formularza nadrzędnego przez `__parent__`

Gdy pole `yaml` działa w trybie `subform`, AnsibleForms wstrzykuje do podformularza zmienną `__parent__`. Zawiera ona migawkę **wszystkich wartości pól formularza nadrzędnego** z chwili otwarcia edytora, łącznie ze stałymi i vars.

Odwołuj się do niej standardową składnią wyrażeń `$(...)` w definicjach pól podformularza:

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
      dbConfig:
        name: MYDB
        type: mysql
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
> `__parent__` to pomocnik działający **wyłącznie we frontendzie**. Jest usuwany z extravars Ansible i nigdy nie trafia do playbooka.

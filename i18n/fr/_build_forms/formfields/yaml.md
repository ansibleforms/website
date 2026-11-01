---
layout: default
title: YAML
parent: Champs de formulaire
nav_order: 14
translated_from: 8dde3e82c2a53e38adc729f5a8f3764b182718c7
---

# Champ YAML
{: .no_toc }

Des données structurées dans un éditeur YAML, avec validation et import de fichier
{: .fs-6 .fw-300 }

---

## Propriétés

Les propriétés disponibles pour un champ `yaml`, regroupées par usage :

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield_object = form_object.help | where: "name", "Formfield" | first %}

{%- if formfield_object and formfield_object.items %}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{ var.version }}</span>{% endif %}
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
          <strong>Valeur :</strong><br>
          <span>{{ page.title | downcase }}</span>
        </div>
        {% elsif var.choices.size > 0 %}
        <div>
          <strong>Choix :</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (par défaut)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Par défaut :</strong><br>
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

Exemples de champs `yaml`, en YAML :

{%- assign type_choice = formfield_object.items | where: "name", "type" | first %}
{%- if type_choice.choices %}
  {%- assign yaml_type = type_choice.choices | where: "name", "yaml" | first %}
  {%- if yaml_type.examples %}
    {%- for example in yaml_type.examples %}

### {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La définition du champ, en YAML :{% endif %}

```yaml
{{ example.code }}
```
    {%- endfor %}
  {%- endif %}
{%- endif %}

{%- endif %}

---

## Accéder aux données du formulaire parent via `__parent__`

Quand un champ `yaml` utilise le mode `subform`, AnsibleForms injecte une variable `__parent__` dans le sous-formulaire. Elle contient un instantané de **toutes les valeurs des champs du formulaire parent** au moment où l'éditeur s'ouvre, y compris les constantes et les vars.

Faites-y référence avec la syntaxe d'expression standard `$(...)` dans les définitions de champ du sous-formulaire :

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
> `__parent__` est une aide **propre au frontend**. Elle est retirée des extravars Ansible et n'est jamais envoyée au playbook.

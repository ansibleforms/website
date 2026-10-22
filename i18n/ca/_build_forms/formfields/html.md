---
layout: default
title: Html
parent: Camps de formulari
nav_order: 4
translated_from: 473e446a98ddcabefb726ff75033eb3ad7135fc4
---

# Camp Html
{: .no_toc }

Contingut HTML enriquit dins d'un formulari
{: .fs-6 .fw-300 }

---

## Propietats

Les propietats disponibles per a un camp `html`, agrupades per finalitat:

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
        {%- if item_types contains "html" %}
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

Exemples de camps `html`, en YAML:

{%- assign type_choice = formfield_object.items | where: "name", "type" | first %}
{%- if type_choice.choices %}
  {%- assign html_type = type_choice.choices | where: "name", "html" | first %}
  {%- if html_type.examples %}
    {%- for example in html_type.examples %}

### {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definició del camp, en YAML:{% endif %}

```yaml
{{ example.code }}
```
    {%- endfor %}
  {%- endif %}
{%- endif %}

{%- endif %}

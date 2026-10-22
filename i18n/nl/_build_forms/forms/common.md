---
layout: default
title: Gemeenschappelijke eigenschappen
parent: Formulieren
nav_order: 1
translated_from: ce05875209a1cab9ae70d0168723f3aa615e6635
---

# Gemeenschappelijke eigenschappen van formulieren
{: .no_toc }

Eigenschappen die elk formuliertype deelt
{: .fs-6 .fw-300 }

---

Deze eigenschappen gelden voor **alle formuliertypen**: `ansible`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`,
`workflow`, `multistep` (verouderd) en `subform`.

Alle andere eigenschappen zijn specifiek per type en staan beschreven op de pagina van het betreffende formuliertype.

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign common_props = form_object.items | where_exp: "p", "p.with_types == nil" %}

{{ form_object.description | markdownify }}

---

## Eigenschappen

De eigenschappen die alle formuliertypen delen:

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {% for var in common_props %}
    <tr>
      <td>
        <span id="common_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / verplicht</span>{% endif %}
        {% if var.unique == true %}<span class="af-unique"> / uniek</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">toegevoegd in versie {{ var.version }}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.docsObjectLink %}
          {% assign link_start = var.docsObjectLink | slice: 0 %}
          <a href="{% if link_start == '/' %}{{ var.docsObjectLink | relative_url }}{% else %}{{ var.docsObjectLink }}{% endif %}">🔗 
          {% endif %}
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
          {% if var.docsObjectLink %}
          </a>
          {% endif %}
        </p>
        <p>{{ var.description | markdownify }}</p>
        {% if var.choices.size > 0 %}
        <div>
          <strong>Keuzes:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (standaard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standaard:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>Voorbeelden:</strong></p>
        {% endif %}
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

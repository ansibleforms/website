---
layout: default
title: Accions segons l'estat de la tasca
parent: Formularis
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Accions segons l'estat de la tasca
{: .no_toc }

Actua sobre el formulari quan la seva tasca s'envia, té èxit, falla o acaba
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Hi ha disponibles els ganxos següents:

- `onSubmit`: s'activa quan s'envia el formulari
- `onSuccess`: s'activa quan la tasca acaba correctament
- `onFailure`: s'activa quan la tasca falla
- `onFinish`: s'activa quan la tasca acaba, sigui quin sigui el seu estat
- `onAbort`: s'activa quan s'avorta la tasca

---

## Atributs

Els atributs d'una acció segons l'estat de la tasca:

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatori</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / únic</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">afegit a la versió {{var.version}}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{var.short}}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>
          {{ var.description | markdownify }}
        </p>
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Exemples

Exemples d'accions segons l'estat de la tasca, en YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definició, en YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

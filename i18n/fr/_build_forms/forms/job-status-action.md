---
layout: default
title: Actions sur statut de job
parent: Formulaires
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Actions sur statut de job
{: .no_toc }

Agir sur le formulaire quand son job est soumis, réussit, échoue ou se termine
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Les hooks suivants sont disponibles :

- `onSubmit` : déclenché quand le formulaire est soumis
- `onSuccess` : déclenché quand le job se termine avec succès
- `onFailure` : déclenché quand le job échoue
- `onFinish` : déclenché quand le job se termine, quel que soit son statut
- `onAbort` : déclenché quand le job est interrompu

---

## Attributs

Les attributs d'une action sur statut de job :

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{var.version}}</span>{% endif %}
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

Exemples d'actions sur statut de job, en YAML :

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La définition, en YAML :{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

---
layout: default
title: Punts d'aprovació
parent: Formularis
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Punts d'aprovació
{: .no_toc }

Atura una tasca fins que algú l'aprovi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Com funciona

Un punt d'aprovació atura la tasca en el lloc que ocupa al formulari fins que un aprovador hi respon:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Aprovar la teva pròpia tasca

A partir de la 7.3.0, l'usuari que ha llançat una tasca no la pot aprovar, encara que tingui un dels rols de l'aprovació, de manera que cal una segona persona; un administrador sempre pot aprovar, també les seves pròpies tasques.
Qui l'ha llançada encara pot rebutjar (retirar) la seva pròpia tasca. Posa `allowSelf: true` quan també la pugui aprovar, per exemple en un formulari de proves:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Atributs

Els atributs d'un punt d'aprovació:

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

Exemples de punts d'aprovació, en YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definició, en YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

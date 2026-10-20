---
layout: default
title: Puntos de aprobación
parent: Formularios
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Puntos de aprobación
{: .no_toc }

Pausa un trabajo hasta que alguien lo apruebe
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cómo funciona

Un punto de aprobación pausa el trabajo en su posición dentro del formulario hasta que un aprobador responde:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Aprobar tu propio trabajo

Desde 7.3.0, el usuario que lanzó un trabajo no puede aprobarlo, aunque tenga uno de los roles de la aprobación, así que hace falta una segunda persona; un administrador siempre puede aprobar, también sus propios trabajos.
Quien lo lanzó sí puede rechazar (retirar) su propio trabajo. Pon `allowSelf: true` cuando también pueda aprobarlo, por ejemplo en un formulario de prueba:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Atributos

Los atributos de un punto de aprobación:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">añadido en la versión {{var.version}}</span>{% endif %}
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

## Ejemplos

Ejemplos de puntos de aprobación, en YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definición, en YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

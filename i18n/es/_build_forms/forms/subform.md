---
layout: default
title: Subform
parent: Formularios
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Subform
{: .no_toc }

Un fragmento de formulario reutilizable para campos list, campos yaml y páginas de asistente
{: .fs-6 .fw-300 }

---

Un subformulario es un fragmento de formulario reutilizable. No aparece en la vista de mosaicos y no se puede enviar directamente. En su lugar, se hace referencia a él desde:

- Un campo [`list`](../formfields/list.html): abre el subformulario como editor de detalle para cada fila
- Un campo [`yaml`](../formfields/yaml.html) con la propiedad `subform`: abre el subformulario como editor de detalle para un único objeto
- Un paso de [`wizard`](wizard.html): muestra el subformulario como una página del asistente

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign subform_choice = type_prop.choices | where: "name", "subform" | first %}

{{ subform_choice.description | markdownify }}

{% if subform_choice.examples.size > 0 %}
{% for e in subform_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propiedades

Los subformularios **no tienen propiedades específicas de tipo**. Solo usan las [propiedades comunes de los formularios](common.html): `name`, `description`, `help`, `type` y `fields`.

Cuando un subformulario sirve como página de un asistente, su `description` y su `help` dan los valores predeterminados del `title` y el `help` del paso. También puede definir `showHelp` para desplegar esa ayuda al cargar la página.

Las propiedades de ejecución (`playbook`, `template`, `roles`, `inventory`, etc.) no se aplican a los subformularios, porque un subformulario nunca se envía directamente.


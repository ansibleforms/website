---
layout: default
title: Subformulari
parent: Formularis
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Subformulari
{: .no_toc }

Un fragment de formulari reutilitzable per a camps list, camps yaml i pàgines d'assistent
{: .fs-6 .fw-300 }

---

Un subformulari és un fragment de formulari reutilitzable. No apareix a la vista de mosaic i no es pot enviar directament. En lloc d'això, s'hi fa referència des de:

- Un camp [`list`](../formfields/list.html): obre el subformulari com a editor de detall per a cada fila
- Un camp [`yaml`](../formfields/yaml.html) amb la propietat `subform`: obre el subformulari com a editor de detall per a un sol objecte
- Un pas d'un [`wizard`](wizard.html): mostra el subformulari com una pàgina de l'assistent

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

## Propietats

Els subformularis **no tenen propietats específiques del tipus**. Només fan servir les [propietats comunes dels formularis](common.html): `name`, `description`, `help`, `type` i `fields`.

Quan un subformulari fa de pàgina d'un assistent, el seu `description` i el seu `help` proporcionen els valors per defecte del `title` i el `help` del pas. També pot definir `showHelp` per desplegar aquesta ajuda quan es carrega la pàgina.

Les propietats d'execució (`playbook`, `template`, `roles`, `inventory`, etc.) no s'apliquen als subformularis, perquè un subformulari no s'envia mai directament.


---
layout: default
title: Subformulier
parent: Formulieren
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Subformulier
{: .no_toc }

Een herbruikbaar formulierfragment voor list-velden, yaml-velden en wizardpagina's
{: .fs-6 .fw-300 }

---

Een subformulier is een herbruikbaar formulierfragment. Het verschijnt niet in de tegelweergave en kan niet rechtstreeks worden verzonden. In plaats daarvan wordt ernaar verwezen door:

- Een [`list`](../formfields/list.html)-veld: opent het subformulier als drilldown-editor voor elke rij
- Een [`yaml`](../formfields/yaml.html)-veld met de eigenschap `subform`: opent het subformulier als drilldown-editor voor één object
- Een stap van een [`wizard`](wizard.html): toont het subformulier als één pagina van de wizard

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

## Eigenschappen

Subformulieren hebben **geen typespecifieke eigenschappen**. Ze gebruiken alleen de [gemeenschappelijke eigenschappen van formulieren](common.html): `name`, `description`, `help`, `type` en `fields`.

Dient een subformulier als wizardpagina, dan leveren zijn `description` en `help` de standaardwaarden voor `title` en `help` van de stap. Het kan ook `showHelp` instellen om die help open te klappen wanneer de pagina laadt.

Uitvoeringseigenschappen (`playbook`, `template`, `roles`, `inventory`, enz.) gelden niet voor subformulieren, omdat een subformulier nooit rechtstreeks wordt verzonden.


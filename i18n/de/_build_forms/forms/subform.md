---
layout: default
title: Unterformular
parent: Formulare
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Unterformular
{: .no_toc }

Ein wiederverwendbarer Formularbaustein für list-Felder, yaml-Felder und Wizard-Seiten
{: .fs-6 .fw-300 }

---

Ein Unterformular ist ein wiederverwendbarer Formularbaustein. Es erscheint nicht in der Kachelansicht und kann nicht direkt abgesendet werden. Stattdessen wird darauf verwiesen von:

- einem [`list`](../formfields/list.html)-Feld: öffnet das Unterformular als Drilldown-Editor für jede Zeile
- einem [`yaml`](../formfields/yaml.html)-Feld mit der Eigenschaft `subform`: öffnet das Unterformular als Drilldown-Editor für ein einzelnes Objekt
- einem [`wizard`](wizard.html)-Schritt: stellt das Unterformular als eine Seite des Wizards dar

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

## Eigenschaften

Unterformulare haben **keine typspezifischen Eigenschaften**. Sie verwenden nur die [gemeinsamen Formulareigenschaften](common.html): `name`, `description`, `help`, `type` und `fields`.

Dient ein Unterformular als Wizard-Seite, liefern seine `description` und `help` die Standardwerte für `title` und `help` des Schritts. Es kann außerdem `showHelp` setzen, um diese Hilfe beim Laden der Seite aufzuklappen.

Ausführungseigenschaften (`playbook`, `template`, `roles`, `inventory` usw.) gelten nicht für Unterformulare, da ein Unterformular nie direkt abgesendet wird.


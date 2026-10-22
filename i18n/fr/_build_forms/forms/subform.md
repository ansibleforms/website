---
layout: default
title: Sous-formulaire
parent: Formulaires
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Sous-formulaire
{: .no_toc }

Un fragment de formulaire réutilisable pour les champs list, les champs yaml et les pages d'assistant
{: .fs-6 .fw-300 }

---

Un sous-formulaire est un fragment de formulaire réutilisable. Il n'apparaît pas dans la vue en tuiles et ne peut pas être soumis directement. Il est référencé par :

- Un champ [`list`](../formfields/list.html) : ouvre le sous-formulaire comme éditeur détaillé pour chaque ligne
- Un champ [`yaml`](../formfields/yaml.html) avec la propriété `subform` : ouvre le sous-formulaire comme éditeur détaillé pour un seul objet
- Une étape d'[`wizard`](wizard.html) : affiche le sous-formulaire comme une page de l'assistant

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

## Propriétés

Les sous-formulaires n'ont **aucune propriété propre à leur type**. Ils n'utilisent que les [propriétés communes des formulaires](common.html) : `name`, `description`, `help`, `type` et `fields`.

Quand un sous-formulaire sert de page d'assistant, sa `description` et son `help` fournissent les valeurs par défaut du `title` et du `help` de l'étape. Il peut aussi définir `showHelp` pour déplier cette aide au chargement de la page.

Les propriétés d'exécution (`playbook`, `template`, `roles`, `inventory`, etc.) ne s'appliquent pas aux sous-formulaires, car un sous-formulaire n'est jamais soumis directement.


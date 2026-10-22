---
layout: default
title: Podformularz
parent: Formularze
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Podformularz
{: .no_toc }

Fragment formularza wielokrotnego użytku dla pól list, pól yaml i stron kreatora
{: .fs-6 .fw-300 }

---

Podformularz to fragment formularza wielokrotnego użytku. Nie pojawia się w widoku kafelków i nie można go wysłać bezpośrednio. Odwołują się do niego:

- Pole [`list`](../formfields/list.html): otwiera podformularz jako edytor drilldown dla każdego wiersza
- Pole [`yaml`](../formfields/yaml.html) z właściwością `subform`: otwiera podformularz jako edytor drilldown dla pojedynczego obiektu
- Krok [`wizard`](wizard.html): wyświetla podformularz jako jedną stronę kreatora

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

## Właściwości

Podformularze **nie mają właściwości specyficznych dla typu**. Używają tylko [wspólnych właściwości formularzy](common.html): `name`, `description`, `help`, `type` i `fields`.

Gdy podformularz służy jako strona kreatora, jego `description` i `help` dostarczają wartości domyślnych dla `title` i `help` kroku. Może też ustawić `showHelp`, aby ta pomoc była rozwinięta po załadowaniu strony.

Właściwości wykonania (`playbook`, `template`, `roles`, `inventory` itp.) nie dotyczą podformularzy, ponieważ podformularz nigdy nie jest wysyłany bezpośrednio.


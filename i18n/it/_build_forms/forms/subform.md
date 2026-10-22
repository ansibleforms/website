---
layout: default
title: Sottomodulo
parent: Moduli
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Sottomodulo
{: .no_toc }

Un frammento di modulo riutilizzabile per campi list, campi yaml e pagine di wizard
{: .fs-6 .fw-300 }

---

Un sottomodulo è un frammento di modulo riutilizzabile. Non compare nella vista a riquadri e non può essere inviato direttamente. Viene invece richiamato da:

- Un campo [`list`](../formfields/list.html): apre il sottomodulo come editor di drilldown per ogni riga
- Un campo [`yaml`](../formfields/yaml.html) con la proprietà `subform`: apre il sottomodulo come editor di drilldown per un singolo oggetto
- Un passo di [`wizard`](wizard.html): mostra il sottomodulo come una pagina del wizard

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

## Proprietà

I sottomoduli **non hanno proprietà specifiche del tipo**. Usano solo le [proprietà comuni dei moduli](common.html): `name`, `description`, `help`, `type` e `fields`.

Quando un sottomodulo fa da pagina di un wizard, `description` e `help` forniscono i valori predefiniti per `title` e `help` del passo. Può anche impostare `showHelp` per espandere quell'aiuto al caricamento della pagina.

Le proprietà di esecuzione (`playbook`, `template`, `roles`, `inventory`, ecc.) non si applicano ai sottomoduli, perché un sottomodulo non viene mai inviato direttamente.


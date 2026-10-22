---
layout: default
title: Subform
parent: Formulários
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# Subform
{: .no_toc }

Um fragmento de formulário reutilizável para campos list, campos yaml e páginas de assistente
{: .fs-6 .fw-300 }

---

Um subformulário é um fragmento de formulário reutilizável. Não aparece na vista de mosaicos e não pode ser submetido diretamente. Em vez disso, é referido por:

- Um campo [`list`](../formfields/list.html): abre o subformulário como editor de drilldown para cada linha
- Um campo [`yaml`](../formfields/yaml.html) com a propriedade `subform`: abre o subformulário como editor de drilldown para um único objeto
- Um passo de [`wizard`](wizard.html): mostra o subformulário como uma página do assistente

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

## Propriedades

Os subformulários **não têm propriedades específicas do tipo**. Só usam as [propriedades comuns dos formulários](common.html): `name`, `description`, `help`, `type` e `fields`.

Quando um subformulário serve de página de um assistente, o seu `description` e o seu `help` fornecem os valores predefinidos do `title` e do `help` do passo. Também pode definir `showHelp` para expandir essa ajuda quando a página carrega.

As propriedades de execução (`playbook`, `template`, `roles`, `inventory`, etc.) não se aplicam aos subformulários, porque um subformulário nunca é submetido diretamente.


---
layout: default
title: Wizard
parent: Formulieren
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Wizard
{: .no_toc }

Verdeel de invoer van een formulier over pagina's met Terug en Volgende
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Wat is een wizard?

Een **wizard** maakt van één formulier een reeks pagina's. Elke pagina wordt opgebouwd uit een [`subform`](subform.html), en de gebruiker navigeert met de knoppen **Terug** en **Volgende**. Validatie wordt per pagina afgedwongen: de gebruiker kan pas verder als de huidige stap geldig is, tenzij de stap als `optional` is gemarkeerd.

Aan het eind van elke wizard wordt automatisch een alleen-lezen **controlepagina** toegevoegd. Die toont elke stap met de verzamelde waarden, zodat de gebruiker ze kan bevestigen voordat hij verzendt. De controlepagina wordt **niet** in YAML gedeclareerd; de titel komt uit de actieve taal.

Bij het verzenden worden **de verzamelde waarden van alle stappen samengevoegd tot één set extravars** en naar het onderliggende playbook, sjabloon of de onderliggende workflow gestuurd, precies alsof de gebruiker één groot formulier had ingevuld.

Een formulier met een `wizard` heeft geen eigen `fields` nodig, maar kan `enableForChat` niet instellen, en een `subform` kan zelf geen `wizard` hebben. [Launch-validatie](../launch-validation/rolling-it-out.html#wizard-forms) controleert een wizardstart stap voor stap.

{: .note }
> Hoe een `wizard` verschilt van een workflow, en hoe je de twee combineert, lees je in het FAQ-item [Wat is het verschil tussen een wizard en een workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Eigenschap op formulierniveau

Een wizard schakel je in met één eigenschap op formulierniveau:

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">toegevoegd in versie {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Voorbeelden:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Eigenschappen van een wizardstap

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = wizard_object.items | map: "group" | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = wizard_object.items  | where: "group",group %}
    {% if group %}
    <tr>
      <th id="wizard_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% endif %}
    {% for var in group_properties %}
    <tr>
      <td>
        <span id="wizard_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / verplicht</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / uniek</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">toegevoegd in versie {{var.version}}</span>{% endif %}
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
        {% if var.choices.size > 0 %}
        <div>
          <strong>Keuzes:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (standaard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standaard:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Toegevoegd</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Voorbeelden:</strong></p>
        {% endif %}
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endfor %}
    {% endfor %}
    {% if wizard_object.examples %}
    <tr>
      <th id="wizard_examples" colspan="2">
        Voorbeelden
      </th>
    </tr>
    <tr>
      <td colspan="2">
        {% for e in wizard_object.examples %}
        <div>
          <p id="wizard_examples_{{ forloop.index }}"><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endif %}
  </tbody>
</table>

---

## Een wizard combineren met een workflow

Een wizard kan bovenop een [workflowformulier](workflow.html) worden gelegd. Komt de `defaultModel` van elke wizardstap overeen met de [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) van het bijbehorende knooppunt van de workflow, dan krijgt elk playbook of sjabloon alleen de waarden van zijn eigen wizardpagina.

De FAQ bevat een uitgewerkt voorbeeld en de opbouw van de samengevoegde extravars: [Wat is het verschil tussen een wizard en een workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (sectie *Gecombineerd (wizard bovenop een workflow)*).

Een wizard op een verouderd [`multistep`](multistep.html)-formulier werkt op dezelfde manier, met de [`key`](multistep.html#step_key) van de stap in plaats van `extra_vars_key`.

---

## Zie ook

Gerelateerde pagina's en FAQ-items:

- [Subformulier](subform.html): wizardpagina's worden opgebouwd uit subformulieren
- [Workflowformulieren](workflow.html): de tegenhanger van de wizard op uitvoeringsniveau
- [`__parent__` in subformulieren](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): hoe je in een latere stap naar eerdere wizardstappen verwijst

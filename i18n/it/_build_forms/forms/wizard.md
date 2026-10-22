---
layout: default
title: Wizard
parent: Moduli
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Wizard
{: .no_toc }

Suddividere l'input di un modulo su più pagine con Indietro e Avanti
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Che cos'è un wizard?

Un **wizard** trasforma un singolo modulo in una sequenza di pagine. Ogni pagina viene generata da un [`subform`](subform.html) e l'utente si sposta con i pulsanti **Indietro** e **Avanti**. La convalida avviene pagina per pagina: l'utente non può andare avanti finché il passo corrente non è valido, a meno che il passo non sia contrassegnato come `optional`.

Alla fine di ogni wizard viene aggiunta automaticamente una **pagina di riepilogo** in sola lettura. Elenca ogni passo con i valori raccolti, così l'utente può confermarli prima dell'invio. La pagina di riepilogo **non** si dichiara in YAML; il suo titolo viene preso dalla lingua attiva.

All'invio, i **valori raccolti in tutti i passi vengono uniti in un unico payload di extravars** e inviati al playbook, template o workflow sottostante, esattamente come se l'utente avesse compilato un unico grande modulo.

Un modulo con un `wizard` non ha bisogno di `fields` propri, ma non può impostare `enableForChat`, e un `subform` non può avere a sua volta un `wizard`. La [validazione all'avvio](../launch-validation/rolling-it-out.html#wizard-forms) controlla l'avvio di un wizard passo per passo.

{: .note }
> Per capire in cosa un `wizard` si differenzia da un workflow, e come si combinano, vedi la voce delle FAQ [Qual è la differenza tra un wizard e un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Proprietà a livello di modulo

Un wizard si attiva con una sola proprietà a livello di modulo:

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">added in version {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Esempi:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Proprietà dei passi del wizard

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
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
        {% if var.required==true %}<span class="af-required"> / obbligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / univoco</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">aggiunto nella versione {{var.version}}</span>{% endif %}
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
          <strong>Scelte:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinito)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Predefinito:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Aggiunto</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Esempi:</strong></p>
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
        Esempi
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

## Combinare un wizard con un workflow

Un wizard si può sovrapporre a un modulo [workflow](workflow.html). Quando il `defaultModel` di ogni passo del wizard corrisponde alla [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) del nodo di workflow corrispondente, ogni playbook o template riceve solo i valori della propria pagina del wizard.

Le FAQ contengono un esempio completo e la struttura delle extravars unite: [Qual è la differenza tra un wizard e un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (sezione *Combinati (wizard sopra un workflow)*).

Un wizard su un modulo [`multistep`](multistep.html), deprecato, funziona allo stesso modo, con la [`key`](multistep.html#step_key) del passo al posto di `extra_vars_key`.

---

## Vedi anche

Pagine correlate e voci delle FAQ:

- [Sottomodulo](subform.html): le pagine del wizard vengono generate dai sottomoduli
- [Moduli workflow](workflow.html): l'equivalente del wizard a livello di esecuzione
- [`__parent__` nei sottomoduli](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): come fare riferimento ai passi precedenti del wizard da un passo successivo

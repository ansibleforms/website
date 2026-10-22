---
layout: default
title: Assistent
parent: Formularis
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Assistent
{: .no_toc }

Reparteix les dades d'un formulari en diverses pàgines amb Enrere i Següent
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Què és un assistent?

Un **assistent** (`wizard`) converteix un sol formulari en una seqüència de pàgines. Cada pàgina es genera a partir d'un [`subform`](subform.html) i l'usuari hi navega amb els botons **Enrere** i **Següent**. La validació s'aplica pàgina per pàgina: l'usuari no pot avançar fins que el pas actual sigui vàlid, tret que el pas estigui marcat com a `optional`.

Al final de cada assistent s'hi afegeix automàticament una **pàgina de revisió** de només lectura. Mostra cada pas amb els valors recollits perquè l'usuari els pugui confirmar abans d'enviar. La pàgina de revisió **no** es declara en YAML; el seu títol surt de l'idioma actiu.

En enviar, els **valors recollits de tots els passos es fusionen en un sol conjunt d'extravars** i s'envien al playbook, la plantilla o el workflow subjacent, exactament com si l'usuari hagués omplert un únic formulari gran.

Un formulari amb un `wizard` no necessita `fields` propis, però no pot definir `enableForChat`, i un `subform` no pot tenir un `wizard` propi. La [validació del llançament](../launch-validation/rolling-it-out.html#wizard-forms) comprova el llançament d'un assistent pas a pas.

{: .note }
> Per saber en què es diferencia un `wizard` d'un workflow, i com es combinen, consulta l'entrada de les PMF [Quina diferència hi ha entre un assistent i un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Propietat a nivell de formulari

Un assistent s'activa amb una única propietat a nivell de formulari:

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">afegit a la versió {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Exemples:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propietats dels passos de l'assistent

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatori</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / únic</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">afegit a la versió {{var.version}}</span>{% endif %}
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
          <strong>Opcions:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (per defecte)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Per defecte:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Afegit</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Exemples:</strong></p>
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
        Exemples
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

## Combinar un assistent amb un workflow

Un assistent es pot posar per sobre d'un formulari de [workflow](workflow.html). Quan el `defaultModel` de cada pas de l'assistent coincideix amb l'[`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) del node corresponent del workflow, cada playbook o plantilla rep només els valors de la seva pròpia pàgina de l'assistent.

Les PMF contenen un exemple complet i l'estructura de les extravars fusionades: [Quina diferència hi ha entre un assistent i un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (secció *Combinat (assistent per sobre d'un workflow)*).

Un assistent en un formulari [`multistep`](multistep.html), que està obsolet, funciona de la mateixa manera, amb la [`key`](multistep.html#step_key) del pas en lloc d'`extra_vars_key`.

---

## Vegeu també

Pàgines relacionades i entrades de les PMF:

- [Subformulari](subform.html): les pàgines de l'assistent es generen a partir de subformularis
- [Formularis de workflow](workflow.html): l'equivalent de l'assistent a la capa d'execució
- [`__parent__` als subformularis](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): com fer referència als passos anteriors de l'assistent des d'un pas posterior

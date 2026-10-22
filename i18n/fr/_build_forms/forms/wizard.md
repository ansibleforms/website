---
layout: default
title: Assistant
parent: Formulaires
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Assistant
{: .no_toc }

Répartir la saisie d'un formulaire sur plusieurs pages avec Retour et Suivant
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Qu'est-ce qu'un assistant ?

Un **assistant** (`wizard`) transforme un formulaire unique en une suite de pages. Chaque page est rendue à partir d'un [`subform`](subform.html) et l'utilisateur navigue avec les boutons **Retour** et **Suivant**. La validation s'applique page par page : l'utilisateur ne peut pas avancer tant que l'étape en cours n'est pas valide, sauf si l'étape est marquée `optional`.

Une **page de récapitulatif** en lecture seule est ajoutée automatiquement à la fin de chaque assistant. Elle liste chaque étape avec les valeurs recueillies pour que l'utilisateur puisse les confirmer avant de soumettre. La page de récapitulatif n'est **pas** déclarée en YAML ; son titre provient de la langue active.

À la soumission, les **valeurs recueillies à toutes les étapes sont fusionnées en un seul ensemble d'extravars** et envoyées au playbook, au template ou au workflow sous-jacent, exactement comme si l'utilisateur avait rempli un seul grand formulaire.

Un formulaire avec un `wizard` n'a pas besoin de ses propres `fields`, mais il ne peut pas définir `enableForChat`, et un `subform` ne peut pas avoir lui-même de `wizard`. La [validation au lancement](../launch-validation/rolling-it-out.html#wizard-forms) vérifie le lancement d'un assistant étape par étape.

{: .note }
> Pour savoir en quoi un `wizard` diffère d'un workflow, et comment combiner les deux, consultez l'entrée de FAQ [Quelle est la différence entre un assistant et un workflow ?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Propriété au niveau du formulaire

Un assistant s'active avec une seule propriété au niveau du formulaire :

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">ajouté dans la version {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Exemples :**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propriétés des étapes de l'assistant

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{var.version}}</span>{% endif %}
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
          <strong>Choix :</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (par défaut)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Par défaut :</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Ajouté</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Exemples :</strong></p>
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

## Combiner un assistant avec un workflow

Un assistant peut se superposer à un formulaire [workflow](workflow.html). Quand le `defaultModel` de chaque étape de l'assistant correspond à l'[`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) du nœud de workflow correspondant, chaque playbook ou template ne reçoit que les valeurs de sa propre page d'assistant.

La FAQ contient un exemple complet et la structure des extravars fusionnées : [Quelle est la différence entre un assistant et un workflow ?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (section *Combiné (assistant par-dessus un workflow)*).

Un assistant sur un formulaire [`multistep`](multistep.html) obsolète fonctionne de la même façon, avec la [`key`](multistep.html#step_key) de l'étape à la place d'`extra_vars_key`.

---

## Voir aussi

Pages et entrées de FAQ liées :

- [Sous-formulaire](subform.html) : les pages de l'assistant sont rendues à partir de sous-formulaires
- [Formulaires workflow](workflow.html) : l'équivalent de l'assistant du côté de l'exécution
- [`__parent__` dans les sous-formulaires](../faq.html#how-do-i-access-parent-form-data-inside-a-subform) : comment faire référence aux étapes précédentes de l'assistant depuis une étape ultérieure

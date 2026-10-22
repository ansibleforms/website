---
layout: default
title: Propriétés communes
parent: Formulaires
nav_order: 1
translated_from: ce05875209a1cab9ae70d0168723f3aa615e6635
---

# Propriétés communes des formulaires
{: .no_toc }

Les propriétés partagées par tous les types de formulaire
{: .fs-6 .fw-300 }

---

Ces propriétés s'appliquent à **tous les types de formulaire** : `ansible`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`,
`workflow`, `multistep` (obsolète) et `subform`.

Toutes les autres propriétés sont propres à un type et documentées sur la page du type de formulaire concerné.

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign common_props = form_object.items | where_exp: "p", "p.with_types == nil" %}

{{ form_object.description | markdownify }}

---

## Propriétés

Les propriétés partagées par tous les types de formulaire :

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    {% for var in common_props %}
    <tr>
      <td>
        <span id="common_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique == true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{ var.version }}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.docsObjectLink %}
          {% assign link_start = var.docsObjectLink | slice: 0 %}
          <a href="{% if link_start == '/' %}{{ var.docsObjectLink | relative_url }}{% else %}{{ var.docsObjectLink }}{% endif %}">🔗 
          {% endif %}
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
          {% if var.docsObjectLink %}
          </a>
          {% endif %}
        </p>
        <p>{{ var.description | markdownify }}</p>
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
  </tbody>
</table>

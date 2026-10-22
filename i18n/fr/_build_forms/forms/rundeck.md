---
layout: default
title: Formulaires Rundeck
parent: Formulaires
nav_order: 3.2
translated_from: 2ea4d32ab60fa14c631358d16bc118485437ecb1
---

# Formulaires Rundeck
{: .no_toc }

Des formulaires qui exécutent un job Rundeck
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign rundeck_choice = type_prop.choices | where: "name", "rundeck" | first %}

{{ rundeck_choice.description | markdownify }}

{% if rundeck_choice.examples.size > 0 %}
{% for e in rundeck_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propriétés

Propriétés propres à `type: rundeck`, en plus des [propriétés communes des formulaires](common.html).

{% assign rundeck_props = form_object.items | where_exp: "p", "p.with_types contains 'rundeck'" %}
{% assign rundeck_groups = rundeck_props | map: "group" | uniq | sort_natural %}
{% for group in rundeck_groups %}
{% assign group_props = rundeck_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="rundeck_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / obligatoire</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{ var.version }}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
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
          <strong>Par défaut :</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>Exemples :</strong></p>
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% endfor %}

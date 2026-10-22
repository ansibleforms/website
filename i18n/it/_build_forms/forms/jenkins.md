---
layout: default
title: Moduli Jenkins
parent: Moduli
nav_order: 3.3
translated_from: ff34be9b166e1c7956605787e9e6addc03bc2c57
---

# Moduli Jenkins
{: .no_toc }

Moduli che eseguono la build di un job Jenkins
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign jenkins_choice = type_prop.choices | where: "name", "jenkins" | first %}

{{ jenkins_choice.description | markdownify }}

{% if jenkins_choice.examples.size > 0 %}
{% for e in jenkins_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Proprietà

Proprietà specifiche di `type: jenkins`, in aggiunta alle [proprietà comuni dei moduli](common.html).

{% assign jenkins_props = form_object.items | where_exp: "p", "p.with_types contains 'jenkins'" %}
{% assign jenkins_groups = jenkins_props | map: "group" | uniq | sort_natural %}
{% for group in jenkins_groups %}
{% assign group_props = jenkins_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="jenkins_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / obbligatorio</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">aggiunto nella versione {{ var.version }}</span>{% endif %}
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
          <strong>Predefinito:</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>Esempi:</strong></p>
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

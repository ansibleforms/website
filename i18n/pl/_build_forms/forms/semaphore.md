---
layout: default
title: Formularze Semaphore
parent: Formularze
nav_order: 3.1
translated_from: 34f55c2309cb70bf641b642cafc27b0e703c89e6
---

# Formularze Semaphore
{: .no_toc }

Formularze, które uruchamiają szablon Semaphore UI
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign semaphore_choice = type_prop.choices | where: "name", "semaphore" | first %}

{{ semaphore_choice.description | markdownify }}

{% if semaphore_choice.examples.size > 0 %}
{% for e in semaphore_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Właściwości

Właściwości specyficzne dla `type: semaphore`, oprócz [wspólnych właściwości formularzy](common.html).

{% assign semaphore_props = form_object.items | where_exp: "p", "p.with_types contains 'semaphore'" %}
{% assign semaphore_groups = semaphore_props | map: "group" | uniq | sort_natural %}
{% for group in semaphore_groups %}
{% assign group_props = semaphore_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="semaphore_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / wymagane</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">dodano w wersji {{ var.version }}</span>{% endif %}
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
          <strong>Opcje:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (domyślnie)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Domyślnie:</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>Przykłady:</strong></p>
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

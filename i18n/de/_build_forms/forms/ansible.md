---
layout: default
title: Ansible-Formulare
parent: Formulare
nav_order: 2
translated_from: 9ddbe366d28db1f9e009d33eb7358354339a5f77
---

# Ansible-Formulare
{: .no_toc }

Formulare, die ein lokales Ansible-Playbook ausführen
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign ansible_choice = type_prop.choices | where: "name", "ansible" | first %}

{{ ansible_choice.description | markdownify }}

{% if ansible_choice.examples.size > 0 %}
{% for e in ansible_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Das Repository, aus dem ein Playbook läuft

Seit 7.8.0 kann ein Formular mit `playbookRepository` das Repository nennen, aus dem sein Playbook läuft.

Ohne diesen Schlüssel läuft das Playbook wie bisher aus dem ersten für Playbooks verwendeten Repository, aus dessen Ordner
`playbooks` (sonst aus dessen Stammverzeichnis). Mit ihm läuft das Playbook aus dem Stammverzeichnis des genannten Repositorys,
sodass dessen `ansible.cfg`, `roles/` und relative Inventarpfade gelten, und `playbook` wird ab dem Stammverzeichnis angegeben
(`playbooks/site.yml`). Der Aufbau und ein vollständiges Beispiel stehen unter [Ein Repository im Aufbau von Ansible](../repositories/ansible-layout.html).

`playbookRepository: __self__` nennt das Repository, aus dem das Formular selbst gelesen wird, sodass ein Formular, das bei
seinem Playbook liegt, sein Repository nie nennt. Ein Formular in keinem Repository (dem lokalen Formularordner) kann es nicht
verwenden: sein Start wird abgelehnt. Siehe [Das Repository, in dem das Formular liegt](../repositories/ansible-layout.html#the-repository-the-form-is-in).

---

## Eigenschaften

Eigenschaften, die speziell für `type: ansible` gelten, zusätzlich zu den [gemeinsamen Formulareigenschaften](common.html).

{% assign ansible_props = form_object.items | where_exp: "p", "p.with_types contains 'ansible'" %}
{% assign ansible_groups = ansible_props | map: "group" | uniq | sort_natural %}
{% for group in ansible_groups %}
{% assign group_props = ansible_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="ansible_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / erforderlich</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">hinzugefügt in Version {{ var.version }}</span>{% endif %}
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
          <strong>Auswahlmöglichkeiten:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (Standard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standard:</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>Beispiele:</strong></p>
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

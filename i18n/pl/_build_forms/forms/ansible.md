---
layout: default
title: Formularze Ansible
parent: Formularze
nav_order: 2
translated_from: 9ddbe366d28db1f9e009d33eb7358354339a5f77
---

# Formularze Ansible
{: .no_toc }

Formularze, które uruchamiają lokalny playbook Ansible
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

## Repozytorium, z którego działa playbook

Od 7.8.0 formularz może wskazać repozytorium, z którego uruchamia się jego playbook, przez `playbookRepository`.

Bez niego playbook działa z pierwszego repozytorium używanego do playbooków, z jego folderu `playbooks` (a w przeciwnym razie
z katalogu głównego), jak wcześniej. Z nim playbook działa z katalogu głównego wskazanego repozytorium, więc obowiązują
`ansible.cfg`, `roles/` i względne ścieżki inwentarzy tego repozytorium, a `playbook` podaje się od katalogu głównego
(`playbooks/site.yml`). Układ i pełny przykład opisuje [Repozytorium we własnym układzie Ansible](../repositories/ansible-layout.html).

`playbookRepository: __self__` wskazuje repozytorium, z którego czytany jest sam formularz, więc formularz trzymany razem ze
swoim playbookiem nigdy nie podaje nazwy repozytorium. Formularz spoza repozytoriów (z lokalnego folderu formularzy) nie może
go użyć: jego uruchomienie jest odrzucane. Zobacz [Repozytorium, w którym jest formularz](../repositories/ansible-layout.html#the-repository-the-form-is-in).

---

## Właściwości

Właściwości specyficzne dla `type: ansible`, oprócz [wspólnych właściwości formularzy](common.html).

{% assign ansible_props = form_object.items | where_exp: "p", "p.with_types contains 'ansible'" %}
{% assign ansible_groups = ansible_props | map: "group" | uniq | sort_natural %}
{% for group in ansible_groups %}
{% assign group_props = ansible_props | where: "group", group %}

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
        <span id="ansible_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

---
layout: default
title: Punkty zatwierdzenia
parent: Formularze
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Punkty zatwierdzenia
{: .no_toc }

Wstrzymanie zadania, dopóki ktoś go nie zatwierdzi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jak to działa

Punkt zatwierdzenia wstrzymuje zadanie w swoim miejscu formularza, dopóki zatwierdzający nie udzieli odpowiedzi:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Zatwierdzanie własnego zadania

Od wersji 7.3.0 użytkownik, który uruchomił zadanie, nie może go zatwierdzić, nawet jeśli ma jedną z ról zatwierdzenia, więc potrzebna jest druga osoba; administrator zawsze może zatwierdzać, także własne zadania.
Uruchamiający nadal może odrzucić (wycofać) własne zadanie. Ustaw `allowSelf: true`, jeśli on także może je zatwierdzić, na przykład w formularzu testowym:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Atrybuty

Atrybuty punktu zatwierdzenia:

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / wymagane</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unikalne</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">dodano w wersji {{var.version}}</span>{% endif %}
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Przykłady

Przykładowe punkty zatwierdzenia w YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Definicja w YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

---
layout: default
title: Genehmigungspunkte
parent: Formulare
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Genehmigungspunkte
{: .no_toc }

Einen Job anhalten, bis jemand ihn genehmigt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Funktionsweise

Ein Genehmigungspunkt hält den Job an seiner Stelle im Formular an, bis ein Genehmiger darauf antwortet:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Den eigenen Job genehmigen

Ab 7.3.0 kann der Benutzer, der einen Job gestartet hat, ihn nicht genehmigen, selbst mit einer der Rollen der Genehmigung; es braucht also eine zweite Person. Ein Admin kann immer genehmigen, auch die eigenen Jobs.
Der Starter kann seinen eigenen Job weiterhin ablehnen (zurückziehen). Setzen Sie `allowSelf: true`, wenn er ihn auch genehmigen darf, etwa in einem Testformular:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Attribute

Die Attribute eines Genehmigungspunkts:

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / erforderlich</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / eindeutig</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">hinzugefügt in Version {{var.version}}</span>{% endif %}
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

## Beispiele

Beispiele für Genehmigungspunkte, in YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Die Definition, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

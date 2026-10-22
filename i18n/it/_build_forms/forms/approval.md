---
layout: default
title: Punti di approvazione
parent: Moduli
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Punti di approvazione
{: .no_toc }

Mettere in pausa un job finché qualcuno non lo approva
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Come funziona

Un punto di approvazione mette in pausa il job nel suo punto del modulo finché un approvatore non risponde:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Approvare il proprio job

Dalla 7.3.0 l'utente che ha avviato un job non può approvarlo, nemmeno con uno dei ruoli dell'approvazione, quindi serve una seconda persona; un amministratore può sempre approvare, anche i propri job.
Chi l'ha avviato può comunque rifiutare (ritirare) il proprio job. Imposta `allowSelf: true` quando può anche approvarlo, per esempio in un modulo di test:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Attributi

Gli attributi di un punto di approvazione:

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obbligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / univoco</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">aggiunto nella versione {{var.version}}</span>{% endif %}
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

## Esempi

Esempi di punti di approvazione, in YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definizione, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

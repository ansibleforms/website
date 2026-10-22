---
layout: default
title: Campi del modulo
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Campi del modulo
{: .no_toc }

I controlli di input di un modulo
{: .fs-6 .fw-300 }

---

Per chi scrive i moduli: i tipi di campo che un modulo può contenere, e le proprietà supportate da ciascuno.

I campi del modulo definiscono i controlli di input di un modulo. Ogni tipo di campo ha proprietà e comportamento propri per raccogliere un determinato tipo di dato.

Scegli il tipo di campo adatto ai dati da raccogliere, dal semplice testo alle liste strutturate.

---

## Proprietà comuni

Tutti i campi del modulo condividono due proprietà fondamentali:

- **name** (string, obbligatorio): l'identificatore univoco del campo
- **type** (string, obbligatorio): il tipo di campo, che determina quale delle pagine seguenti descrive le proprietà disponibili

Ogni tipo di campo aggiunge proprietà specifiche della sua funzione. Seleziona un tipo di campo nella barra di navigazione laterale o nella tabella qui sotto per aprire il riferimento completo delle sue proprietà:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tipo di campo</th>
      <th>Descrizione</th>
    </tr>
  </thead>
  <tbody>
{% for type in formfile.choices %}
    <tr>
      <td><strong><a href="{{ type.name }}.html">{{ type.name }}</a></strong></td>
      <!-- markdownify, not the raw value : a description carries markdown (`code`
           spans) AND html-looking text. The `html` type documents that `<script>` is
           stripped, and unfiltered that opened a real script element which swallowed
           every row after it - the page stopped at `html`, hiding 10 of the 14 types.
           Kramdown escapes it inside the code span. -->
      <td>{{ type.description | markdownify }}</td>
    </tr>
{% endfor %}
  </tbody>
</table>

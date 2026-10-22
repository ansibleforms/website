---
layout: default
title: Formuliervelden
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Formuliervelden
{: .no_toc }

De invoerelementen van een formulier
{: .fs-6 .fw-300 }

---

Voor formulierauteurs: de veldtypen die een formulier kan bevatten, en de eigenschappen die elk type ondersteunt.

Formuliervelden definiëren de invoerelementen van een formulier. Elk veldtype heeft zijn eigen eigenschappen en gedrag om een bepaald soort gegevens te verzamelen.

Kies het veldtype dat past bij de gegevens die je wilt verzamelen, van gewone tekst tot gestructureerde lijsten.

---

## Gemeenschappelijke eigenschappen

Alle formuliervelden delen twee fundamentele eigenschappen:

- **name** (string, verplicht): de unieke identifier van het veld
- **type** (string, verplicht): het veldtype, dat bepaalt welke van de pagina's hieronder de beschikbare eigenschappen beschrijft

Elk veldtype voegt eigenschappen toe die bij zijn functie horen. Kies een veldtype in de navigatiebalk of in de tabel hieronder om de volledige referentie van zijn eigenschappen te openen:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Veldtype</th>
      <th>Beschrijving</th>
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

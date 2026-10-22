---
layout: default
title: Pola formularza
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Pola formularza
{: .no_toc }

Kontrolki wejściowe formularza
{: .fs-6 .fw-300 }

---

Dla autorów formularzy: typy pól, jakie może zawierać formularz, i właściwości obsługiwane przez każdy z nich.

Pola formularza definiują kontrolki wejściowe formularza. Każdy typ pola ma własne właściwości i zachowanie, służące do zbierania określonego rodzaju danych.

Wybierz typ pola pasujący do danych, które chcesz zebrać, od zwykłego tekstu po listy strukturalne.

---

## Wspólne właściwości

Wszystkie pola formularza mają dwie podstawowe właściwości:

- **name** (string, wymagane): unikalny identyfikator pola
- **type** (string, wymagane): typ pola, od którego zależy, która z poniższych stron opisuje dostępne właściwości

Każdy typ pola dodaje właściwości związane z jego funkcją. Wybierz typ pola w bocznym pasku nawigacji lub w tabeli poniżej, aby otworzyć pełny opis jego właściwości:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Typ pola</th>
      <th>Opis</th>
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

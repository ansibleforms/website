---
layout: default
title: Formularfelder
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Formularfelder
{: .no_toc }

Die Eingabeelemente eines Formulars
{: .fs-6 .fw-300 }

---

Für Formularautoren: die Feldtypen, die ein Formular enthalten kann, und die Eigenschaften, die jeder unterstützt.

Formularfelder definieren die Eingabeelemente eines Formulars. Jeder Feldtyp hat eigene Eigenschaften und ein eigenes Verhalten, um eine bestimmte Art von Daten zu erfassen.

Wählen Sie den Feldtyp, der zu den zu erfassenden Daten passt, von einfachem Text bis zu strukturierten Listen.

---

## Gemeinsame Eigenschaften

Alle Formularfelder haben zwei grundlegende Eigenschaften gemeinsam:

- **name** (string, erforderlich): der eindeutige Bezeichner des Felds
- **type** (string, erforderlich): der Feldtyp, der bestimmt, welche der folgenden Seiten die verfügbaren Eigenschaften beschreibt

Jeder Feldtyp fügt Eigenschaften hinzu, die zu seiner Funktion gehören. Wählen Sie einen Feldtyp in der Navigationsleiste oder in der Tabelle unten, um seine vollständige Eigenschaftsreferenz zu öffnen:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Feldtyp</th>
      <th>Beschreibung</th>
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

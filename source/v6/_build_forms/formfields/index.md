---
layout: default
title: Formfields
nav_order: 2
has_children: true
has_toc: false
---

# Formfields
{: .no_toc }

The input controls of a form
{: .fs-6 .fw-300 }

---

Formfields define the input controls of a form. Each field type has its own properties and behavior for collecting a particular kind of data.

Pick the field type that matches the data to collect, from plain text to structured lists.

## Common Properties

All formfields share two fundamental properties:

- **name** (string, required): the unique identifier of the field
- **type** (string, required): the field type, which determines the page below that describes the available properties

Each field type adds properties specific to its function. Select a field type in the navigation sidebar or in the table below to open its complete property reference:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Field Type</th>
      <th>Description</th>
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

---
layout: default
title: Tablefields (deprecated)
nav_order: 2.5
has_children: true
has_toc: false
---

# Tablefields (deprecated)
{: .no_toc }

The columns of a deprecated table field
{: .fs-6 .fw-300 }

---

{: .warning }
> **Deprecated.** Tablefields are used with the `table` formfield type, which is deprecated. Use the [`list`](../formfields/list.html) field type instead: it provides the same functionality with a drilldown subform and full output modelling support.

Tablefields are the field types used within a [`table`](../formfields/table.html) formfield. Each column of a table is defined by a tablefield, which sets the data entry control for that column.

Tablefields resemble regular formfields, but with some restrictions, because they operate within the context of a row.

## Common Properties

All tablefields share two fundamental properties:

- **name** (string, required): the unique identifier of the column
- **type** (string, required): the field type, which determines the page below that describes the available properties

Each tablefield type adds properties specific to its function. Select a tablefield type in the navigation sidebar or in the table below to open its complete property reference:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign tablefield_obj = formfield.help | where: "name", "Tablefield" | first %}
{%- assign tablefile = tablefield_obj.items | where: "name", "type" | first -%}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Field Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
{%- for type in tablefile.choices %}
    <tr>
      <td><strong><a href="{{ type.name }}.html">{{ type.name }}</a></strong></td>
      <td>{{ type.description | markdownify }}</td>
    </tr>
{%- endfor %}
  </tbody>
</table>

---
layout: default
title: Campos de formulario
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Campos de formulario
{: .no_toc }

Los controles de entrada de un formulario
{: .fs-6 .fw-300 }

---

Para autores de formularios: los tipos de campo que puede contener un formulario y las propiedades que admite cada uno.

Los campos de formulario definen los controles de entrada de un formulario. Cada tipo de campo tiene sus propias propiedades y su propio comportamiento para recoger un tipo concreto de datos.

Elige el tipo de campo que corresponda a los datos que quieres recoger, desde texto simple hasta listas estructuradas.

---

## Propiedades comunes

Todos los campos de formulario comparten dos propiedades fundamentales:

- **name** (string, obligatorio): el identificador único del campo
- **type** (string, obligatorio): el tipo de campo, que determina cuál de las páginas siguientes describe las propiedades disponibles

Cada tipo de campo añade propiedades propias de su función. Selecciona un tipo de campo en la barra lateral de navegación o en la tabla siguiente para abrir la referencia completa de sus propiedades:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tipo de campo</th>
      <th>Descripción</th>
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

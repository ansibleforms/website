---
layout: default
title: Camps de formulari
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Camps de formulari
{: .no_toc }

Els controls d'entrada d'un formulari
{: .fs-6 .fw-300 }

---

Per als autors de formularis: els tipus de camp que pot contenir un formulari i les propietats que admet cadascun.

Els camps de formulari defineixen els controls d'entrada d'un formulari. Cada tipus de camp té les seves pròpies propietats i el seu propi comportament per recollir un tipus concret de dades.

Tria el tipus de camp que correspongui a les dades que vols recollir, des de text pla fins a llistes estructurades.

---

## Propietats comunes

Tots els camps de formulari comparteixen dues propietats fonamentals:

- **name** (string, obligatori): l'identificador únic del camp
- **type** (string, obligatori): el tipus de camp, que determina quina de les pàgines següents descriu les propietats disponibles

Cada tipus de camp afegeix propietats pròpies de la seva funció. Selecciona un tipus de camp a la barra lateral de navegació o a la taula següent per obrir la referència completa de les seves propietats:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tipus de camp</th>
      <th>Descripció</th>
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

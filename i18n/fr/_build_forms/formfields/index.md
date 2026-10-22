---
layout: default
title: Champs de formulaire
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Champs de formulaire
{: .no_toc }

Les contrôles de saisie d'un formulaire
{: .fs-6 .fw-300 }

---

Pour les auteurs de formulaires : les types de champ qu'un formulaire peut contenir, et les propriétés prises en charge par chacun.

Les champs de formulaire définissent les contrôles de saisie d'un formulaire. Chaque type de champ a ses propres propriétés et son propre comportement pour recueillir un type de données particulier.

Choisissez le type de champ qui correspond aux données à recueillir, du texte simple aux listes structurées.

---

## Propriétés communes

Tous les champs de formulaire partagent deux propriétés fondamentales :

- **name** (string, obligatoire) : l'identifiant unique du champ
- **type** (string, obligatoire) : le type de champ, qui détermine laquelle des pages ci-dessous décrit les propriétés disponibles

Chaque type de champ ajoute des propriétés propres à sa fonction. Sélectionnez un type de champ dans la barre de navigation latérale ou dans le tableau ci-dessous pour ouvrir la référence complète de ses propriétés :

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Type de champ</th>
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

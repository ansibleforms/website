---
layout: default
title: Campos de formulário
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# Campos de formulário
{: .no_toc }

Os controlos de entrada de um formulário
{: .fs-6 .fw-300 }

---

Para autores de formulários: os tipos de campo que um formulário pode conter e as propriedades que cada um suporta.

Os campos de formulário definem os controlos de entrada de um formulário. Cada tipo de campo tem as suas próprias propriedades e comportamento para recolher um tipo de dados concreto.

Escolha o tipo de campo que corresponde aos dados a recolher, desde texto simples até listas estruturadas.

---

## Propriedades comuns

Todos os campos de formulário partilham duas propriedades fundamentais:

- **name** (string, obrigatório): o identificador único do campo
- **type** (string, obrigatório): o tipo de campo, que determina a página abaixo que descreve as propriedades disponíveis

Cada tipo de campo acrescenta propriedades próprias da sua função. Selecione um tipo de campo na barra lateral de navegação ou na tabela abaixo para abrir a referência completa das suas propriedades:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tipo de campo</th>
      <th>Descrição</th>
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

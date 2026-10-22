---
layout: default
title: Points d'approbation
parent: Formulaires
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Points d'approbation
{: .no_toc }

Mettre un job en pause jusqu'à ce que quelqu'un l'approuve
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fonctionnement

Un point d'approbation met le job en pause à son emplacement dans le formulaire jusqu'à ce qu'un approbateur y réponde :

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Approuver son propre job

Depuis la 7.3.0, l'utilisateur qui a lancé un job ne peut pas l'approuver, même avec l'un des rôles de l'approbation : il faut donc une deuxième personne ; un admin peut toujours approuver, y compris ses propres jobs.
Celui qui l'a lancé peut toujours rejeter (retirer) son propre job. Définissez `allowSelf: true` s'il peut aussi l'approuver, par exemple dans un formulaire de test :

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Attributs

Les attributs d'un point d'approbation :

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{var.version}}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{var.short}}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>
          {{ var.description | markdownify }}
        </p>
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Exemples

Exemples de points d'approbation, en YAML :

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La définition, en YAML :{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

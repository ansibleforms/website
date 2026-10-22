---
layout: default
title: Pontos de aprovação
parent: Formulários
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Pontos de aprovação
{: .no_toc }

Colocar uma tarefa em pausa até alguém a aprovar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Como funciona

Um ponto de aprovação coloca a tarefa em pausa no sítio onde está no formulário, até um aprovador lhe responder:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Aprovar a sua própria tarefa

A partir da 7.3.0, o utilizador que lançou uma tarefa não a pode aprovar, mesmo que tenha uma das funções da aprovação, pelo que é precisa uma segunda pessoa; um administrador pode sempre aprovar, incluindo as suas próprias tarefas.
Quem lançou a tarefa pode ainda assim rejeitá-la (retirá-la). Defina `allowSelf: true` quando essa pessoa também a puder aprovar, por exemplo num formulário de teste:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Atributos

Os atributos de um ponto de aprovação:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obrigatório</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">adicionado na versão {{var.version}}</span>{% endif %}
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

## Exemplos

Exemplos de pontos de aprovação, em YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}A definição, em YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

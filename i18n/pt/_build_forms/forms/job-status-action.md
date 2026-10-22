---
layout: default
title: Ações conforme o estado da tarefa
parent: Formulários
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Ações conforme o estado da tarefa
{: .no_toc }

Atuar sobre o formulário quando a sua tarefa é submetida, é bem-sucedida, falha ou termina
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Estão disponíveis os seguintes hooks:

- `onSubmit` - disparado quando o formulário é submetido
- `onSuccess` - disparado quando a tarefa termina com sucesso
- `onFailure` - disparado quando a tarefa falha
- `onFinish` - disparado quando a tarefa termina, seja qual for o seu estado
- `onAbort` - disparado quando a tarefa é interrompida

---

## Atributos

Os atributos de uma ação conforme o estado da tarefa:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

Exemplos de ações conforme o estado da tarefa, em YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}A definição, em YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

---
layout: default
title: Assistente
parent: Formulários
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Assistente
{: .no_toc }

Dividir os dados de um formulário por páginas com Voltar e Seguinte
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## O que é um assistente?

Um **assistente** (wizard) transforma um único formulário numa sequência de páginas. Cada página é construída a partir de um [`subform`](subform.html) e o utilizador navega com os botões **Voltar** e **Seguinte**. A validação é aplicada página a página: o utilizador não pode avançar enquanto o passo atual não for válido, a menos que o passo esteja marcado como `optional`.

No fim de cada assistente é acrescentada automaticamente uma **página de revisão** só de leitura. Enumera cada passo com os valores recolhidos, para que o utilizador os possa confirmar antes de submeter. A página de revisão **não** é declarada em YAML; o seu título vem do idioma ativo.

Ao submeter, os **valores recolhidos em todos os passos são juntados num único conjunto de extravars** e enviados para o playbook, template ou workflow subjacente, exatamente como se o utilizador tivesse preenchido um único formulário grande.

Um formulário com `wizard` não precisa dos seus próprios `fields`, mas não pode definir `enableForChat`, e um `subform` não pode ter ele próprio um `wizard`. A [validação no lançamento](../launch-validation/rolling-it-out.html#wizard-forms) verifica o lançamento de um assistente passo a passo.

{: .note }
> Para saber como um `wizard` difere de um workflow e como os dois se combinam, consulte a entrada das FAQ [Qual é a diferença entre um assistente e um workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Propriedade ao nível do formulário

Um assistente ativa-se com uma única propriedade ao nível do formulário:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">adicionado na versão {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Exemplos:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propriedades dos passos do assistente

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = wizard_object.items | map: "group" | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = wizard_object.items  | where: "group",group %}
    {% if group %}
    <tr>
      <th id="wizard_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% endif %}
    {% for var in group_properties %}
    <tr>
      <td>
        <span id="wizard_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
        {% if var.choices.size > 0 %}
        <div>
          <strong>Opções:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinido)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Predefinição:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Adicionado</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Exemplos:</strong></p>
        {% endif %}
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endfor %}
    {% endfor %}
    {% if wizard_object.examples %}
    <tr>
      <th id="wizard_examples" colspan="2">
        Exemplos
      </th>
    </tr>
    <tr>
      <td colspan="2">
        {% for e in wizard_object.examples %}
        <div>
          <p id="wizard_examples_{{ forloop.index }}"><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endif %}
  </tbody>
</table>

---

## Combinar um assistente com um workflow

Um assistente pode ser colocado por cima de um formulário de [workflow](workflow.html). Quando o `defaultModel` de cada passo do assistente corresponde ao [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) do nó de workflow correspondente, cada playbook ou template recebe só os valores da sua própria página do assistente.

As FAQ contêm um exemplo completo e a estrutura das extravars juntadas: [Qual é a diferença entre um assistente e um workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (secção *Combinados (assistente por cima de um workflow)*).

Um assistente num formulário [`multistep`](multistep.html), que está obsoleto, funciona da mesma forma, com a [`key`](multistep.html#step_key) do passo em vez de `extra_vars_key`.

---

## Ver também

Páginas e entradas das FAQ relacionadas:

- [Subform](subform.html): as páginas do assistente são construídas a partir de subformulários
- [Formulários de workflow](workflow.html): o equivalente do assistente na camada de execução
- [`__parent__` nos subformulários](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): como referir passos anteriores do assistente a partir de um passo posterior

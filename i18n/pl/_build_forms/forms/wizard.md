---
layout: default
title: Kreator
parent: Formularze
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Kreator
{: .no_toc }

Podział danych formularza na strony z przyciskami Wstecz i Dalej
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Czym jest kreator?

**Kreator** zamienia pojedynczy formularz w sekwencję stron. Każda strona jest wyświetlana z [`subform`](subform.html), a użytkownik przechodzi między nimi przyciskami **Wstecz** i **Dalej**. Walidacja odbywa się dla każdej strony osobno: użytkownik nie może przejść dalej, dopóki bieżący krok nie jest poprawny, chyba że krok jest oznaczony jako `optional`.

Na końcu każdego kreatora automatycznie dodawana jest **strona podsumowania** tylko do odczytu. Wyświetla każdy krok z zebranymi wartościami, aby użytkownik mógł je potwierdzić przed wysłaniem. Strony podsumowania **nie** deklaruje się w YAML; jej tytuł pochodzi z aktywnego języka.

Przy wysyłaniu **wartości zebrane ze wszystkich kroków są scalane w jeden zestaw extravars** i przekazywane do docelowego playbooka, szablonu lub workflow, dokładnie tak, jakby użytkownik wypełnił jeden duży formularz.

Formularz z `wizard` nie potrzebuje własnych `fields`, ale nie może ustawić `enableForChat`, a `subform` sam nie może mieć `wizard`. [Weryfikacja uruchomienia](../launch-validation/rolling-it-out.html#wizard-forms) sprawdza uruchomienie kreatora krok po kroku.

{: .note }
> Czym `wizard` różni się od workflow i jak je połączyć, opisuje wpis FAQ [Jaka jest różnica między kreatorem a workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Właściwość na poziomie formularza

Kreator włącza się jedną właściwością na poziomie formularza:

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">dodano w wersji {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Przykłady:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Właściwości kroku kreatora

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
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
        {% if var.required==true %}<span class="af-required"> / wymagane</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unikalne</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">dodano w wersji {{var.version}}</span>{% endif %}
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
          <strong>Opcje:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (domyślnie)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Domyślnie:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Dodano</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Przykłady:</strong></p>
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
        Przykłady
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

## Łączenie kreatora z workflow

Kreator można nałożyć na formularz [workflow](workflow.html). Gdy `defaultModel` każdego kroku kreatora odpowiada [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) odpowiedniego węzła workflow, każdy playbook lub szablon otrzymuje tylko wartości z własnej strony kreatora.

FAQ zawiera rozpracowany przykład i układ scalonych extravars: [Jaka jest różnica między kreatorem a workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (sekcja *Połączenie (kreator na workflow)*).

Kreator na przestarzałym formularzu [`multistep`](multistep.html) działa tak samo, z [`key`](multistep.html#step_key) kroku zamiast `extra_vars_key`.

---

## Zobacz też

Powiązane strony i wpisy FAQ:

- [Podformularz](subform.html): strony kreatora są wyświetlane z podformularzy
- [Formularze workflow](workflow.html): odpowiednik kreatora w warstwie wykonania
- [`__parent__` w podformularzach](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): jak w późniejszym kroku odwołać się do wcześniejszych kroków kreatora

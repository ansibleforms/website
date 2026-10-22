---
layout: default
title: Wizard
parent: Formulare
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Wizard
{: .no_toc }

Die Eingaben eines Formulars mit Zurück und Weiter auf Seiten verteilen
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## Was ist ein Wizard?

Ein **Wizard** macht aus einem einzelnen Formular eine Folge von Seiten. Jede Seite wird aus einem [`subform`](subform.html) dargestellt, und der Benutzer navigiert mit den Schaltflächen **Zurück** und **Weiter**. Die Validierung gilt pro Seite: Der Benutzer kann erst weitergehen, wenn der aktuelle Schritt gültig ist, es sei denn, der Schritt ist als `optional` markiert.

Am Ende jedes Wizards wird automatisch eine schreibgeschützte **Übersichtsseite** angehängt. Sie listet jeden Schritt mit den gesammelten Werten auf, damit der Benutzer sie vor dem Absenden bestätigen kann. Die Übersichtsseite wird **nicht** in YAML deklariert; ihr Titel stammt aus der aktiven Sprache.

Beim Absenden werden die **gesammelten Werte aller Schritte zu einer einzigen Extravars-Payload zusammengeführt** und an das zugrunde liegende Playbook, die Vorlage oder den Workflow gesendet, genau so, als hätte der Benutzer ein einziges großes Formular ausgefüllt.

Ein Formular mit `wizard` braucht keine eigenen `fields`, kann aber `enableForChat` nicht setzen, und ein `subform` kann selbst keinen `wizard` haben. Die [Start-Validierung](../launch-validation/rolling-it-out.html#wizard-forms) prüft den Start eines Wizards Schritt für Schritt.

{: .note }
> Wie sich ein `wizard` von einem Workflow unterscheidet und wie sich beide kombinieren lassen, steht im FAQ-Eintrag [Was ist der Unterschied zwischen einem Wizard und einem Workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Eigenschaft auf Formularebene

Ein Wizard wird mit einer einzigen Eigenschaft auf Formularebene aktiviert:

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">hinzugefügt in Version {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Beispiele:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Eigenschaften der Wizard-Schritte

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
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
        {% if var.required==true %}<span class="af-required"> / erforderlich</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / eindeutig</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">hinzugefügt in Version {{var.version}}</span>{% endif %}
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
          <strong>Auswahlmöglichkeiten:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (Standard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Standard:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Hinzugefügt</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Beispiele:</strong></p>
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
        Beispiele
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

## Einen Wizard mit einem Workflow kombinieren

Ein Wizard lässt sich auf ein [Workflow](workflow.html)-Formular aufsetzen. Wenn das `defaultModel` jedes Wizard-Schritts zum [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) des entsprechenden Workflow-Knotens passt, erhält jedes Playbook und jede Vorlage nur die Werte der eigenen Wizard-Seite.

Die FAQ enthält ein ausgearbeitetes Beispiel und den Aufbau der zusammengeführten Extravars: [Was ist der Unterschied zwischen einem Wizard und einem Workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (Abschnitt *Kombiniert (Wizard auf einem Workflow)*).

Ein Wizard auf einem veralteten [`multistep`](multistep.html)-Formular funktioniert genauso, mit dem [`key`](multistep.html#step_key) des Schritts statt `extra_vars_key`.

---

## Siehe auch

Verwandte Seiten und FAQ-Einträge:

- [Unterformular](subform.html): Wizard-Seiten werden aus Unterformularen dargestellt
- [Workflow-Formulare](workflow.html): das Gegenstück des Wizards auf der Ausführungsebene
- [`__parent__` in Unterformularen](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): wie Sie aus einem späteren Schritt auf frühere Wizard-Schritte verweisen

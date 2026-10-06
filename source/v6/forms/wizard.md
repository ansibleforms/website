---
layout: default
title: Wizard
parent: Forms
nav_order: 6
---

# Wizard
{: .no_toc }

Split a form's input across pages with Back and Next
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

## What is a wizard?

A **wizard** turns a single form into a sequence of pages. Each page is rendered from a [`subform`](subform.html) and the user navigates with **Back** and **Next** buttons. Validation is enforced per page: the user cannot move forward until the current step is valid, unless the step is marked `optional`.

A read-only **review page** is appended automatically to the end of every wizard. It lists each step with its collected values so that the user can confirm them before submitting. The review page is **not** declared in YAML; its title is taken from the active locale.

On submission, the **collected values from all steps are merged into a single extravars payload** and sent to the underlying playbook, template or multistep form, exactly as if the user had filled in a single large form.

A form with a `wizard` does not need its own `fields`, but it cannot set `launchValidation` or `enableForChat`, and a `subform` cannot have a `wizard` itself.

{: .note }
> For how a `wizard` differs from a `multistep` form, and how the two combine, see the FAQ entry [What is the difference between a wizard and a multistep form?](../faq.html#what-is-the-difference-between-a-wizard-and-a-multistep-form).

## Form-level property

A wizard is enabled with a single form-level property:

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">added in version {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Examples:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

## Wizard step properties

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Comments</th>
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
        {% if var.required==true %}<span class="af-required"> / required</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">added in version {{var.version}}</span>{% endif %}
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
          <strong>Choices:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (default)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>Default:</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Added</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Examples:</strong></p>
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
        Examples
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

## Combining a wizard with multistep

A wizard can be layered on top of a [`multistep`](multistep.html) form. When each wizard step's `defaultModel` matches the [`key`](multistep.html#step_key) of the corresponding multistep step, each playbook or template receives only the values from its own wizard page.

The FAQ contains a worked example and the layout of the merged extravars: [What is the difference between a wizard and a multistep form?](../faq.html#what-is-the-difference-between-a-wizard-and-a-multistep-form) (section *Combined (wizard on top of multistep)*).

## See also

Related pages and FAQ entries:

- [Subform](subform.html) — wizard pages are rendered from subforms
- [Multistep forms](multistep.html) — the execution-layer counterpart of the wizard
- [`__parent__` in subforms](../faq.html#how-do-i-access-parent-form-data-inside-a-subform) — how to reference earlier wizard steps from a later step

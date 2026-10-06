---
layout: default
title: Job Status Actions
parent: Forms
nav_order: 9
---

# Job Status Actions
{: .no_toc }

Act on the form when its job is submitted, succeeds, fails or finishes
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

The following hooks are available:

- `onSubmit` - triggered when the form is submitted
- `onSuccess` - triggered when the job completes successfully
- `onFailure` - triggered when the job fails
- `onFinish` - triggered when the job finishes, regardless of its status
- `onAbort` - triggered when the job is aborted

## Attributes

The attributes of a job status action:

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

## Examples

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}The definition, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

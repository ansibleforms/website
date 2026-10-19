---
layout: default
title: Approval Points
parent: Forms
nav_order: 8
---

# Approval Points
{: .no_toc }

Pause a job until someone approves it
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it works

An approval point pauses the job at its place in the form until an approver answers it:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Approving your own job

From 7.3.0 the user who launched a job cannot approve it, even with one of the approval's roles, so it takes a second person; an admin can always approve, their own jobs too.
The launcher can still reject (withdraw) their own job. Set `allowSelf: true` when they may approve it too, for example in a test form:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Attributes

The attributes of an approval point:

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

---

## Examples

Example approval points, in YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}The definition, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

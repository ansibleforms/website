---
layout: default
title: Benachrichtigungen
parent: Formulare
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Benachrichtigungen
{: .no_toc }

Eine E-Mail oder eine Kanalnachricht senden, wenn ein Job endet oder etwas mit ihm geschieht
{: .fs-6 .fw-300 }

---

Die `notifications` eines Formulars legen fest, wer über seine Jobs informiert wird und wann:

- **Wer**: `recipients`, E-Mail-Adressen, und `channels`, die Namen von
  [Benachrichtigungskanälen](../notification-channels.html) (Mail, Slack, Microsoft Teams, Telegram, ein Webhook). Mindestens eines
  der beiden ist erforderlich.
- **Wann**: `onStatus`, wenn ein Job endet (`success`, `failed`, `aborted`, `warning` oder `any`), und `onEvent`, wenn
  etwas mit einem Job geschieht (`launch`, `relaunch`, `delete`, `approve`, `reject` oder `any`).

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-teams
  onStatus:
    - failed
  onEvent:
    - approve
    - reject
```

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign notifications_object = form_object.help | where: "name", "Notifications" | first %}

{{ notifications_object.description | markdownify }}

---

## Attribute

Die Attribute des Objekts `notifications`:

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Beispiele

Beispiele für Benachrichtigungen, in YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Die Definition, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

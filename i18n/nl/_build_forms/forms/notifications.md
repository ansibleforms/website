---
layout: default
title: Meldingen
parent: Formulieren
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Meldingen
{: .no_toc }

Stuur een e-mail of een kanaalbericht wanneer een job eindigt of er iets met hem gebeurt
{: .fs-6 .fw-300 }

---

De `notifications` van een formulier bepalen wie over zijn jobs hoort, en wanneer:

- **Wie**: `recipients`, e-mailadressen, en `channels`, de namen van
  [meldingskanalen](../notification-channels.html) (mail, Slack, Microsoft Teams, Telegram, een webhook). Minstens een
  van de twee is verplicht.
- **Wanneer**: `onStatus`, wanneer een job eindigt (`success`, `failed`, `aborted`, `warning` of `any`), en `onEvent`, wanneer
  er iets met een job gebeurt (`launch`, `relaunch`, `delete`, `approve`, `reject` of `any`).

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

## Attributen

De attributen van het object `notifications`:

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / verplicht</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / uniek</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">toegevoegd in versie {{var.version}}</span>{% endif %}
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
          <strong>Keuzes:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (standaard)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Standaard:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Voorbeelden

Voorbeelden van meldingen, in YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}De definitie, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

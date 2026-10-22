---
layout: default
title: Notifiche
parent: Moduli
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Notifiche
{: .no_toc }

Inviare un'email o un messaggio su un canale quando un job termina o gli succede qualcosa
{: .fs-6 .fw-300 }

---

Le `notifications` di un modulo indicano chi viene informato dei suoi job, e quando:

- **Chi**: `recipients`, indirizzi email, e `channels`, i nomi dei
  [canali di notifica](../notification-channels.html) (mail, Slack, Microsoft Teams, Telegram, un webhook). È obbligatorio
  almeno uno dei due.
- **Quando**: `onStatus`, quando un job termina (`success`, `failed`, `aborted`, `warning` o `any`), e `onEvent`, quando
  succede qualcosa a un job (`launch`, `relaunch`, `delete`, `approve`, `reject` o `any`).

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

## Attributi

Gli attributi dell'oggetto `notifications`:

<table>
  <thead>
    <tr>
      <th>Attributo</th>
      <th>Commenti</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obbligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / univoco</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">aggiunto nella versione {{var.version}}</span>{% endif %}
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
          <strong>Scelte:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinito)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Predefinito:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Esempi

Esempi di notifiche, in YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definizione, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

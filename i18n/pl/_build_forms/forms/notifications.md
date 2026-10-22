---
layout: default
title: Powiadomienia
parent: Formularze
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Powiadomienia
{: .no_toc }

Wysyłanie e-maila lub wiadomości na kanał, gdy zadanie się kończy lub coś się z nim dzieje
{: .fs-6 .fw-300 }

---

Właściwość `notifications` formularza określa, kto i kiedy dowiaduje się o jego zadaniach:

- **Kto**: `recipients`, czyli adresy e-mail, oraz `channels`, czyli nazwy
  [kanałów powiadomień](../notification-channels.html) (poczta, Slack, Microsoft Teams, Telegram, webhook). Wymagane jest
  co najmniej jedno z nich.
- **Kiedy**: `onStatus`, gdy zadanie się kończy (`success`, `failed`, `aborted`, `warning` lub `any`), oraz `onEvent`, gdy
  coś dzieje się z zadaniem (`launch`, `relaunch`, `delete`, `approve`, `reject` lub `any`).

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

## Atrybuty

Atrybuty obiektu `notifications`:

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Przykłady

Przykładowe powiadomienia w YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Definicja w YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

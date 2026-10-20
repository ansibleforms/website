---
layout: default
title: Notificaciones
parent: Formularios
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Notificaciones
{: .no_toc }

Envía un correo o un mensaje a un canal cuando un trabajo termina o le ocurre algo
{: .fs-6 .fw-300 }

---

Las `notifications` de un formulario indican quién se entera de sus trabajos, y cuándo:

- **Quién**: `recipients`, direcciones de correo, y `channels`, los nombres de
  [canales de notificación](../notification-channels.html) (correo, Slack, Microsoft Teams, Telegram, un webhook). Se requiere
  al menos uno de los dos.
- **Cuándo**: `onStatus`, cuando un trabajo termina (`success`, `failed`, `aborted`, `warning` o `any`), y `onEvent`, cuando
  le ocurre algo a un trabajo (`launch`, `relaunch`, `delete`, `approve`, `reject` o `any`).

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

## Atributos

Los atributos del objeto `notifications`:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">añadido en la versión {{var.version}}</span>{% endif %}
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
          <strong>Opciones:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predeterminado)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Valor predeterminado:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Ejemplos

Ejemplos de notificaciones, en YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definición, en YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

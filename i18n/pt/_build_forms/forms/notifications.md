---
layout: default
title: Notificações
parent: Formulários
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# Notificações
{: .no_toc }

Enviar um email ou uma mensagem para um canal quando uma tarefa termina ou quando lhe acontece algo
{: .fs-6 .fw-300 }

---

As `notifications` de um formulário dizem quem fica a saber das suas tarefas, e quando:

- **Quem**: `recipients`, endereços de email, e `channels`, os nomes de
  [canais de notificação](../notification-channels.html) (mail, Slack, Microsoft Teams, Telegram, um webhook). É obrigatório
  pelo menos um dos dois.
- **Quando**: `onStatus`, quando uma tarefa termina (`success`, `failed`, `aborted`, `warning` ou `any`), e `onEvent`, quando
  acontece algo a uma tarefa (`launch`, `relaunch`, `delete`, `approve`, `reject` ou `any`).

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

Os atributos do objeto `notifications`:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentários</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obrigatório</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">adicionado na versão {{var.version}}</span>{% endif %}
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
          <strong>Opções:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (predefinido)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Predefinição:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Exemplos

Exemplos de notificações, em YAML:

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}A definição, em YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

---
layout: default
title: Formularze wieloetapowe
parent: Formularze
nav_order: 5
translated_from: b509f2f7365a2066cabfe1061fdb48c12c33ccbd
---

# Formularze wieloetapowe
{: .no_toc }

Uruchamianie kilku playbooków lub szablonów po kolei z jednego formularza
{: .fs-6 .fw-300 }

---

{: .warning }
> `multistep` jest przestarzały od wersji 7 i zostanie usunięty w wersji 8: zamiast niego używaj [workflow](workflow.html). Workflow robi wszystko,
> co multistep, a do tego ma warunki, własne wartości dla każdego węzła, węzły zatwierdzenia i gałęzie działające równolegle.

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign multistep_choice = type_prop.choices | where: "name", "multistep" | first %}
{% assign step_object = form_object.help | where: "name", "Step" | first %}
{% assign steps_prop = form_object.items | where: "name", "steps" | first %}

{{ multistep_choice.description | markdownify }}

{% if multistep_choice.examples.size > 0 %}
{% for e in multistep_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Właściwość na poziomie formularza

Formularz wieloetapowy definiuje swoje kroki w jednej właściwości na poziomie formularza:

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ steps_prop.name }}</strong><br>
        <span class="af-type">{{ steps_prop.type }}</span><span class="af-required"> / wymagane</span>
      </td>
      <td>
        <p><strong>{{ steps_prop.short }}</strong></p>
        {{ steps_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% assign multistep_props = form_object.items | where_exp: "p", "p.with_types contains 'multistep'" %}

Oprócz `steps` formularz wieloetapowy przyjmuje następujące właściwości na poziomie formularza, opisane na stronie [Formularze Ansible](ansible.html):
{% for p in multistep_props %}{% if p.name != "steps" %}[`{{ p.name }}`](ansible.html#ansible_{{ p.name }}){% if p.required == true %} (wymagane){% endif %}{% unless forloop.last %}, {% endunless %}{% endif %}{% endfor %}.

---

## Właściwości kroków

{{ step_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = step_object.items | map: "group" | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = step_object.items  | where: "group",group %}
    {% if group %}
    <tr>
      <th id="step_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% endif %}
    {% for var in group_properties %}
    <tr>
      <td>
        <span id="step_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
        {% if var.with_types!=nil %}
        <div>
          <strong class="af-with-types">Dostępne tylko dla typów:</strong><br>
          <span>{{ var.with_types }}</span>
          <br><br>
        </div>
        {% endif %}                          
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Dodano</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Przykłady:</strong></p>
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
    {% if step_object.examples %}          
    <tr>
      <th id="step_examples" colspan="2">
        Przykłady
      </th>
    </tr>
    <tr>
      <td colspan="2">
        {% for e in step_object.examples %}
        <div>
          <p id="step_examples_{{ forloop.index }}"><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
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

## Przykład

Formularz wieloetapowy uruchamia kilka zadań po kolei, a każdy krok uruchamia własny playbook lub szablon AWX. Wszystkie kroki współdzielą pola formularza: domyślnie każdy krok otrzymuje pełne extravars, a `key` kroku ogranicza go do tej ich części.

### Utworzenie i konfiguracja serwera

Każdy krok otrzymuje własną część extravars: krok AWX tworzy serwer, krok Ansible konfiguruje jego sieć, a ostatni krok zawsze wysyła raport:

```yaml
name: Server Provisioning
type: multistep
roles:
  - default
categories:
  - Setup
steps:
  - name: Create server
    type: awx
    template: Create VM
    key: server              # receives only the `server` part of the extravars
  - name: Configure network
    type: ansible
    playbook: configure_network.yml
    key: network             # receives only the `network` part of the extravars
  - name: Send report
    type: ansible
    playbook: email.yml
    always: true             # runs even when an earlier step failed
fields:
  - name: server_name
    type: text
    model: server.name
  - name: environment
    type: enum
    values:
      - dev
      - prod
    model: server.environment
  - name: ip_address
    type: text
    model: network.ip
  - name: gateway
    type: text
    model: network.gateway
```

---
layout: default
title: Formularis multipas
parent: Formularis
nav_order: 5
translated_from: b509f2f7365a2066cabfe1061fdb48c12c33ccbd
---

# Formularis multipas
{: .no_toc }

Executa diversos playbooks o plantilles en seqüència des d'un sol formulari
{: .fs-6 .fw-300 }

---

{: .warning }
> `multistep` està obsolet des de la 7 i s'elimina a la 8: fes servir un [workflow](workflow.html) en el seu lloc. Un workflow fa tot el que
> fa un multistep, amb condicions, valors propis per a cada node, nodes d'aprovació i branques que s'executen en paral·lel.

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

## Propietat a nivell de formulari

Un formulari multipas defineix els seus passos en una única propietat a nivell de formulari:

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ steps_prop.name }}</strong><br>
        <span class="af-type">{{ steps_prop.type }}</span><span class="af-required"> / obligatori</span>
      </td>
      <td>
        <p><strong>{{ steps_prop.short }}</strong></p>
        {{ steps_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% assign multistep_props = form_object.items | where_exp: "p", "p.with_types contains 'multistep'" %}

A més de `steps`, un formulari multipas accepta aquestes propietats a nivell de formulari, documentades a la pàgina [Formularis d'Ansible](ansible.html):
{% for p in multistep_props %}{% if p.name != "steps" %}[`{{ p.name }}`](ansible.html#ansible_{{ p.name }}){% if p.required == true %} (obligatòria){% endif %}{% unless forloop.last %}, {% endunless %}{% endif %}{% endfor %}.

---

## Propietats dels passos

{{ step_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atribut</th>
      <th>Comentaris</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatori</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / únic</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">afegit a la versió {{var.version}}</span>{% endif %}
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
          <strong>Opcions:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (per defecte)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Per defecte:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}   
        {% if var.with_types!=nil %}
        <div>
          <strong class="af-with-types">Només disponible amb els tipus:</strong><br>
          <span>{{ var.with_types }}</span>
          <br><br>
        </div>
        {% endif %}                          
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Afegit</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Exemples:</strong></p>
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
        Exemples
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

## Exemple

Un formulari multipas executa diverses tasques en seqüència, i cada pas llança el seu propi playbook o plantilla d'AWX. Tots els passos comparteixen els camps del formulari: per defecte, cada pas rep totes les extravars, i la `key` d'un pas el limita a aquesta part.

### Crear i configurar un servidor

Cada pas rep la seva pròpia part de les extravars: un pas d'AWX crea el servidor, un pas d'Ansible en configura la xarxa i un últim pas sempre envia un informe:

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

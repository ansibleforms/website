---
layout: default
title: Formulaires multistep
parent: Formulaires
nav_order: 5
translated_from: b509f2f7365a2066cabfe1061fdb48c12c33ccbd
---

# Formulaires multistep
{: .no_toc }

Exécuter plusieurs playbooks ou templates à la suite depuis un seul formulaire
{: .fs-6 .fw-300 }

---

{: .warning }
> `multistep` est obsolète depuis la 7 et supprimé dans la 8 : utilisez plutôt un [workflow](workflow.html). Un workflow fait tout ce que
> fait un multistep, avec des conditions, des valeurs propres à chaque nœud, des nœuds d'approbation et des branches qui s'exécutent en parallèle.

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

## Propriété au niveau du formulaire

Un formulaire multistep définit ses étapes dans une seule propriété au niveau du formulaire :

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ steps_prop.name }}</strong><br>
        <span class="af-type">{{ steps_prop.type }}</span><span class="af-required"> / obligatoire</span>
      </td>
      <td>
        <p><strong>{{ steps_prop.short }}</strong></p>
        {{ steps_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% assign multistep_props = form_object.items | where_exp: "p", "p.with_types contains 'multistep'" %}

Outre `steps`, un formulaire multistep accepte ces propriétés au niveau du formulaire, documentées sur la page [Formulaires Ansible](ansible.html) :
{% for p in multistep_props %}{% if p.name != "steps" %}[`{{ p.name }}`](ansible.html#ansible_{{ p.name }}){% if p.required == true %} (obligatoire){% endif %}{% unless forloop.last %}, {% endunless %}{% endif %}{% endfor %}.

---

## Propriétés des étapes

{{ step_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Commentaires</th>
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
        {% if var.required==true %}<span class="af-required"> / obligatoire</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unique</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">ajouté dans la version {{var.version}}</span>{% endif %}
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
          <strong>Choix :</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (par défaut)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>Par défaut :</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}   
        {% if var.with_types!=nil %}
        <div>
          <strong class="af-with-types">Disponible uniquement avec les types :</strong><br>
          <span>{{ var.with_types }}</span>
          <br><br>
        </div>
        {% endif %}                          
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Ajouté</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Exemples :</strong></p>
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

Un formulaire multistep exécute plusieurs jobs à la suite, chaque étape lançant son propre playbook ou template AWX. Toutes les étapes partagent les champs du formulaire : par défaut, chaque étape reçoit toutes les extravars, et la `key` d'une étape la limite à cette partie d'entre elles.

### Créer et configurer un serveur

Chaque étape reçoit sa propre partie des extravars : une étape AWX crée le serveur, une étape Ansible configure son réseau, et une dernière étape envoie toujours un rapport :

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

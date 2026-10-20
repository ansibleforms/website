---
layout: default
title: Asistente
parent: Formularios
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# Asistente
{: .no_toc }

Reparte los datos de un formulario en páginas con Atrás y Siguiente
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## ¿Qué es un asistente?

Un **asistente** (`wizard`) convierte un único formulario en una secuencia de páginas. Cada página se genera a partir de un [`subform`](subform.html) y el usuario navega con los botones **Atrás** y **Siguiente**. La validación se aplica por página: el usuario no puede avanzar hasta que el paso actual sea válido, salvo que el paso esté marcado como `optional`.

Al final de cada asistente se añade automáticamente una **página de revisión** de solo lectura. Muestra cada paso con los valores recogidos para que el usuario los confirme antes de enviar. La página de revisión **no** se declara en YAML; su título se toma del idioma activo.

Al enviar, los **valores recogidos en todos los pasos se combinan en un único conjunto de extravars** y se envían al playbook, plantilla o workflow subyacente, exactamente como si el usuario hubiera rellenado un único formulario grande.

Un formulario con `wizard` no necesita `fields` propios, pero no puede definir `enableForChat`, y un `subform` no puede tener a su vez un `wizard`. La [validación del lanzamiento](../launch-validation/rolling-it-out.html#wizard-forms) comprueba el lanzamiento de un asistente paso a paso.

{: .note }
> Para ver en qué se diferencia un `wizard` de un workflow y cómo se combinan, consulta la entrada de las preguntas frecuentes [¿Qué diferencia hay entre un wizard y un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow).

---

## Propiedad a nivel de formulario

Un asistente se activa con una única propiedad a nivel de formulario:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">añadido en la versión {{ wizard_prop.version }}</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**Ejemplos:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## Propiedades de los pasos del asistente

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = wizard_object.items | map: "group" | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = wizard_object.items  | where: "group",group %}
    {% if group %}
    <tr>
      <th id="wizard_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% endif %}
    {% for var in group_properties %}
    <tr>
      <td>
        <span id="wizard_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">Añadido</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>Ejemplos:</strong></p>
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
    {% if wizard_object.examples %}
    <tr>
      <th id="wizard_examples" colspan="2">
        Ejemplos
      </th>
    </tr>
    <tr>
      <td colspan="2">
        {% for e in wizard_object.examples %}
        <div>
          <p id="wizard_examples_{{ forloop.index }}"><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
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

## Combinar un asistente con un workflow

Un asistente puede ir sobre un formulario de [workflow](workflow.html). Cuando el `defaultModel` de cada paso del asistente coincide con la [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) del nodo correspondiente del workflow, cada playbook o plantilla recibe solo los valores de su propia página del asistente.

Las preguntas frecuentes incluyen un ejemplo completo y la estructura de las extravars combinadas: [¿Qué diferencia hay entre un wizard y un workflow?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) (sección *Combinado (asistente sobre un workflow)*).

Un asistente sobre un formulario [`multistep`](multistep.html), que está obsoleto, funciona igual, con la [`key`](multistep.html#step_key) del paso en lugar de `extra_vars_key`.

---

## Véase también

Páginas relacionadas y entradas de las preguntas frecuentes:

- [Subform](subform.html): las páginas del asistente se generan a partir de subformularios
- [Formularios de workflow](workflow.html): el equivalente del asistente en la capa de ejecución
- [`__parent__` en subformularios](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): cómo hacer referencia a pasos anteriores del asistente desde un paso posterior

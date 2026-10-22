---
layout: default
title: 工作流表单
parent: 表单
nav_order: 6
translated_from: 84ff9fbe71945ce4437cf82034f80a6bfa8b3691
---

# 工作流表单
{: .no_toc }

运行设计器中某个工作流的表单
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign workflow_choice = type_prop.choices | where: "name", "workflow" | first %}

{{ workflow_choice.description | markdownify }}

{% if workflow_choice.examples.size > 0 %}
{% for e in workflow_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## 属性

`type: workflow` 特有的属性，是对[通用表单属性](common.html)的补充。
[工作流](../workflows/)一节介绍工作流文件本身。

{% assign workflow_props = form_object.items | where_exp: "p", "p.with_types contains 'workflow'" %}
{% assign workflow_groups = workflow_props | map: "group" | uniq | sort_natural %}
{% for group in workflow_groups %}
{% assign group_props = workflow_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="workflow_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / 必填</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{ var.version }} 中添加</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>{{ var.description | markdownify }}</p>
        {% if var.choices.size > 0 %}
        <div>
          <strong>选项：</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }}（默认）</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>默认值：</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>示例：</strong></p>
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% endfor %}

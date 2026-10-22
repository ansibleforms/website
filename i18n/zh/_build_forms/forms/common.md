---
layout: default
title: 通用属性
parent: 表单
nav_order: 1
translated_from: ce05875209a1cab9ae70d0168723f3aa615e6635
---

# 通用表单属性
{: .no_toc }

所有表单类型共有的属性
{: .fs-6 .fw-300 }

---

这些属性适用于**所有表单类型**： `ansible` 、 `awx` 、 `aap` 、 `ascender` 、 `semaphore` 、 `rundeck` 、 `jenkins` 、
`workflow` 、 `multistep` （已弃用）和 `subform` 。

其他所有属性都是特定于类型的，记录在相应表单类型的页面中。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign common_props = form_object.items | where_exp: "p", "p.with_types == nil" %}

{{ form_object.description | markdownify }}

---

## 属性

所有表单类型共有的属性：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in common_props %}
    <tr>
      <td>
        <span id="common_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / 必填</span>{% endif %}
        {% if var.unique == true %}<span class="af-unique"> / 唯一</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{ var.version }} 中添加</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.docsObjectLink %}
          {% assign link_start = var.docsObjectLink | slice: 0 %}
          <a href="{% if link_start == '/' %}{{ var.docsObjectLink | relative_url }}{% else %}{{ var.docsObjectLink }}{% endif %}">🔗 
          {% endif %}
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
          {% if var.docsObjectLink %}
          </a>
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
          <strong>默认值：</strong><br>
          <span>{{ var.default }}</span>
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>示例：</strong></p>
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
  </tbody>
</table>

---
layout: default
title: 向导
parent: 表单
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# 向导
{: .no_toc }

用“返回”和“下一步”把表单输入拆分到多个页面
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## 什么是向导？

**向导**把单个表单变成一系列页面。每个页面都由一个 [`subform`](subform.html) 渲染，用户通过**返回**和**下一步**按钮浏览。校验按页面执行：在当前步骤有效之前，用户无法继续前进，除非该步骤标记为 `optional` 。

每个向导的末尾都会自动追加一个只读的**审阅页面**。它列出每个步骤及其收集到的值，方便用户在提交前确认。审阅页面**不**在 YAML 中声明；其标题取自当前使用的语言。

提交时，**所有步骤收集到的值会合并成一份 extravars**，发送给底层的 playbook、模板或工作流，效果与用户填写了一个大表单完全相同。

带有 `wizard` 的表单不需要自己的 `fields` ，但不能设置 `enableForChat` ，而且 `subform` 本身不能有 `wizard` 。[运行验证](../launch-validation/rolling-it-out.html#wizard-forms)会逐个步骤检查向导的运行。

{: .note }
> 关于 `wizard` 与工作流有何不同，以及二者如何结合，请参阅常见问题条目[向导和工作流有什么区别？](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow)。

---

## 表单级属性

向导通过一个表单级属性启用：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">在版本 {{ wizard_prop.version }} 中添加</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**示例：**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## 向导步骤属性

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
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
        {% if var.required==true %}<span class="af-required"> / 必填</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / 唯一</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{var.version}} 中添加</span>{% endif %}
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
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">新增</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
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
    {% endfor %}
    {% if wizard_object.examples %}
    <tr>
      <th id="wizard_examples" colspan="2">
        示例
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

## 将向导与工作流结合

向导可以叠加在[工作流](workflow.html)表单之上。当每个向导步骤的 `defaultModel` 与对应工作流节点的 [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) 一致时，每个 playbook 或模板只会收到来自其对应向导页面的值。

常见问题中有一个完整示例，以及合并后 extravars 的结构：[向导和工作流有什么区别？](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow)（ *组合使用（在工作流之上叠加向导）* 一节）。

在已弃用的 [`multistep`](multistep.html) 表单上使用向导也是同样的方式，只是用步骤的 [`key`](multistep.html#step_key) 代替 `extra_vars_key` 。

---

## 另请参阅

相关页面和常见问题条目：

- [子表单](subform.html)：向导页面由子表单渲染
- [工作流表单](workflow.html)：在执行层面与向导相对应的功能
- [子表单中的 `__parent__`](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)：如何在后面的步骤中引用前面的向导步骤

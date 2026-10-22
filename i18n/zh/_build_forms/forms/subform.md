---
layout: default
title: 子表单
parent: 表单
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# 子表单
{: .no_toc }

可复用的表单片段，用于 list 字段、yaml 字段和向导页面
{: .fs-6 .fw-300 }

---

子表单是一个可复用的表单片段。它不会出现在磁贴视图中，也不能直接提交。它由以下方式引用：

- [`list`](../formfields/list.html) 字段：为每一行打开子表单作为下钻编辑器
- 带有 `subform` 属性的 [`yaml`](../formfields/yaml.html) 字段：为单个对象打开子表单作为下钻编辑器
- [`wizard`](wizard.html) 步骤：把子表单渲染为向导的一个页面

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign subform_choice = type_prop.choices | where: "name", "subform" | first %}

{{ subform_choice.description | markdownify }}

{% if subform_choice.examples.size > 0 %}
{% for e in subform_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## 属性

子表单**没有特定于类型的属性**。它们只使用[通用表单属性](common.html)： `name` 、 `description` 、 `help` 、 `type` 和 `fields` 。

当子表单用作向导页面时，它的 `description` 和 `help` 为该步骤的 `title` 和 `help` 提供默认值。它还可以设置 `showHelp` ，在页面加载时展开该帮助。

执行相关的属性（ `playbook` 、 `template` 、 `roles` 、 `inventory` 等）不适用于子表单，因为子表单从不直接提交。


---
layout: default
title: 表单字段
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# 表单字段
{: .no_toc }

表单的输入控件
{: .fs-6 .fw-300 }

---

面向表单作者：表单可以包含的字段类型，以及每种类型支持的属性。

表单字段定义了表单的输入控件。每种字段类型都有自己的属性和行为，用于收集某一类数据。

根据要收集的数据选择合适的字段类型，从纯文本到结构化列表都有。

---

## 通用属性

所有表单字段都有两个基本属性：

- **name** （string，必填）：字段的唯一标识符
- **type** （string，必填）：字段类型，决定了下面哪个页面描述其可用属性

每种字段类型还会增加与其功能相关的属性。在导航侧栏或下表中选择一种字段类型，即可打开其完整的属性参考：

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">字段类型</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
{% for type in formfile.choices %}
    <tr>
      <td><strong><a href="{{ type.name }}.html">{{ type.name }}</a></strong></td>
      <!-- markdownify, not the raw value : a description carries markdown (`code`
           spans) AND html-looking text. The `html` type documents that `<script>` is
           stripped, and unfiltered that opened a real script element which swallowed
           every row after it - the page stopped at `html`, hiding 10 of the 14 types.
           Kramdown escapes it inside the code span. -->
      <td>{{ type.description | markdownify }}</td>
    </tr>
{% endfor %}
  </tbody>
</table>

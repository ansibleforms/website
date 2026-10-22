---
layout: default
title: 作业状态动作
parent: 表单
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# 作业状态动作
{: .no_toc }

在作业提交、成功、失败或结束时对表单执行操作
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

可用的钩子如下：

- `onSubmit` ：表单提交时触发
- `onSuccess` ：作业成功完成时触发
- `onFailure` ：作业失败时触发
- `onFinish` ：作业结束时触发，无论其状态如何
- `onAbort` ：作业被中止时触发

---

## 属性

作业状态动作的属性：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## 示例

作业状态动作示例（YAML）：

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}定义（YAML）：{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

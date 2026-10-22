---
layout: default
title: 审批点
parent: 表单
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# 审批点
{: .no_toc }

暂停作业，直到有人批准
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 工作原理

审批点会让作业在表单中它所在的位置暂停，直到审批人作出回应：

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## 批准自己的作业

从 7.3.0 起，运行作业的用户不能批准该作业，即使拥有该审批的某个角色也不行，因此需要第二个人；管理员始终可以批准，包括自己的作业。
运行者仍然可以拒绝（撤回）自己的作业。如果也允许运行者批准，请设置 `allowSelf: true` ，例如在测试表单中：

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## 属性

审批点的属性：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

审批点示例（YAML）：

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}定义（YAML）：{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

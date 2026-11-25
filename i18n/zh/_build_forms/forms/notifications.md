---
layout: default
title: 通知
parent: 表单
nav_order: 9
translated_from: cdd8855e144abc9154af9c3a32871667ed30fe5d
---

# 通知
{: .no_toc }

在作业结束或发生某些事情时发送邮件或通道消息
{: .fs-6 .fw-300 }

---

表单的 `notifications` 规定了谁会收到其作业的消息，以及何时收到：

- **谁**： `recipients` ，即邮件地址；以及 `channels` ，即
  [通知通道](../notification-channels.html)的名称（邮件、Slack、Microsoft Teams、Telegram、webhook）。两者
  至少需要其一。
- **何时**： `onStatus` ，在作业结束时（ `success` 、 `failed` 、 `aborted` 、 `warning` （即[需要关注](../jobs/statuses.html#a-job-that-needs-attention)的作业）或 `any` ）；以及 `onEvent` ，在
  作业发生某些事情时（ `launch` 、 `relaunch` 、 `delete` 、 `approve` 、 `reject` 或 `any` ）。

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-teams
  onStatus:
    - failed
  onEvent:
    - approve
    - reject
```

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign notifications_object = form_object.help | where: "name", "Notifications" | first %}

{{ notifications_object.description | markdownify }}

---

## 属性

`notifications` 对象的属性：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## 示例

通知示例（YAML）：

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}定义（YAML）：{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

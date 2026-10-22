---
layout: default
title: 通知
parent: フォーム
nav_order: 9
translated_from: 3c44a310353f7884a0d2d1e3a827f8a757f7d25d
---

# 通知
{: .no_toc }

ジョブが終了したとき、またはジョブに何かが起きたときに、メールやチャネルのメッセージを送信する
{: .fs-6 .fw-300 }

---

フォームの `notifications` では、ジョブについて誰に、いつ知らせるかを指定します。

- **誰に**: メールアドレスの `recipients` と、
  [通知チャネル](../notification-channels.html) (メール、Slack、Microsoft Teams、Telegram、Webhook) の名前の `channels` です。2 つのうち
  少なくとも一方が必要です。
- **いつ**: ジョブが終了したとき ( `success`、 `failed`、 `aborted`、 `warning`、 `any` ) の `onStatus` と、ジョブに
  何かが起きたとき ( `launch`、 `relaunch`、 `delete`、 `approve`、 `reject`、 `any` ) の `onEvent` です。

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

`notifications` オブジェクトの属性:

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in notifications_object.items %}
    <tr>
      <td>
        <span id="{{notifications_object.name}}_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / 必須</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / 一意</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">バージョン {{var.version}} で追加</span>{% endif %}
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
          <strong>選択肢:</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }} (既定)</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>既定値:</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## 例

通知の YAML での例です。

{% for example in notifications_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}YAML での定義です。{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

---
layout: default
title: 承認ポイント
parent: フォーム
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# 承認ポイント
{: .no_toc }

誰かが承認するまでジョブを一時停止する
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## しくみ

承認ポイントは、承認者が応答するまで、フォーム内のその位置でジョブを一時停止します。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## 自分のジョブを承認する

7.3.0 以降、ジョブを起動したユーザーは、承認のロールのいずれかを持っていてもそのジョブを承認できないため、2 人目の確認が必要になります。管理者は、自分のジョブも含めて常に承認できます。
起動したユーザーは、自分のジョブを却下 (取り下げ) することはできます。起動したユーザーにも承認を許可する場合は、テスト用のフォームなどで `allowSelf: true` を設定します。

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

承認ポイントの属性:

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## 例

承認ポイントの YAML での例です。

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}YAML での定義です。{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

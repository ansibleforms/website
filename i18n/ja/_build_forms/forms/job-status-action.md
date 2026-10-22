---
layout: default
title: ジョブステータスアクション
parent: フォーム
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# ジョブステータスアクション
{: .no_toc }

ジョブが送信、成功、失敗、終了したときにフォームに対して処理を行う
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

次のフックを使用できます。

- `onSubmit`: フォームが送信されたときに実行されます
- `onSuccess`: ジョブが正常に完了したときに実行されます
- `onFailure`: ジョブが失敗したときに実行されます
- `onFinish`: ステータスにかかわらず、ジョブが終了したときに実行されます
- `onAbort`: ジョブが中止されたときに実行されます

---

## 属性

ジョブステータスアクションの属性:

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

ジョブステータスアクションの YAML での例です。

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}YAML での定義です。{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}

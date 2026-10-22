---
layout: default
title: 共通プロパティ
parent: フォーム
nav_order: 1
translated_from: ce05875209a1cab9ae70d0168723f3aa615e6635
---

# フォームの共通プロパティ
{: .no_toc }

すべてのフォームの種類に共通するプロパティ
{: .fs-6 .fw-300 }

---

これらのプロパティは **すべてのフォームの種類** に適用されます: `ansible`、 `awx`、 `aap`、 `ascender`、 `semaphore`、 `rundeck`、 `jenkins`、
`workflow`、 `multistep` (非推奨)、 `subform` です。

それ以外のプロパティは種類ごとに固有のもので、それぞれのフォームの種類のページで説明しています。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign common_props = form_object.items | where_exp: "p", "p.with_types == nil" %}

{{ form_object.description | markdownify }}

---

## プロパティ

すべてのフォームの種類に共通するプロパティ:

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in common_props %}
    <tr>
      <td>
        <span id="common_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / 必須</span>{% endif %}
        {% if var.unique == true %}<span class="af-unique"> / 一意</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">バージョン {{ var.version }} で追加</span>{% endif %}
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
        {% if var.examples %}
        <p><strong>例:</strong></p>
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

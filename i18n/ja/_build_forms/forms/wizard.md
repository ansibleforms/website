---
layout: default
title: ウィザード
parent: フォーム
nav_order: 7
translated_from: aec059391571165259ed43449b0450d0ef7f6cf2
---

# ウィザード
{: .no_toc }

フォームの入力を、戻るボタンと次へボタンで移動する複数のページに分ける
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign wizard_prop = form_object.items | where: "name", "wizard" | first %}
{% assign wizard_object = form_object.help | where: "name", "Wizard step" | first %}

---

## ウィザードとは

**ウィザード** は、1 つのフォームを一連のページに変えます。各ページは [`subform`](subform.html) から表示され、ユーザーは **戻る** ボタンと **次へ** ボタンで移動します。検証はページごとに行われ、ステップに `optional` が付いていない限り、現在のステップが有効になるまで先に進めません。

すべてのウィザードの最後には、読み取り専用の **確認ページ** が自動的に追加されます。各ステップと収集した値が一覧表示されるため、ユーザーは送信前に内容を確認できます。確認ページは YAML では宣言 **しません**。タイトルは現在のロケールから取得されます。

送信すると、 **すべてのステップで収集した値が 1 つの extravars のペイロードにまとめられ**、ユーザーが 1 つの大きなフォームに入力した場合とまったく同じように、基になる playbook、テンプレート、ワークフローに送信されます。

`wizard` を持つフォームには独自の `fields` は不要ですが、 `enableForChat` は設定できません。また、 `subform` 自体が `wizard` を持つことはできません。 [起動時の検証](../launch-validation/rolling-it-out.html#wizard-forms) は、ウィザードの起動をステップごとにチェックします。

{: .note }
> `wizard` とワークフローの違いと、両者の組み合わせ方については、FAQ の項目 [ウィザードとワークフローの違いは何ですか?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow) を参照してください。

---

## フォームレベルのプロパティ

ウィザードは、1 つのフォームレベルのプロパティで有効にします。

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ wizard_prop.name }}</strong><br>
        <span class="af-type">{{ wizard_prop.type }}</span>
        {% if wizard_prop.version %}<br><span class="af-version">バージョン {{ wizard_prop.version }} で追加</span>{% endif %}
      </td>
      <td>
        <p><strong>{{ wizard_prop.short }}</strong></p>
        {{ wizard_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% if wizard_prop.examples %}
**例:**
{% for e in wizard_prop.examples %}

*{{ forloop.index }}) {{ e.name }}*
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## ウィザードのステップのプロパティ

{{ wizard_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>説明</th>
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
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">追加</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
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
    {% endfor %}
    {% if wizard_object.examples %}
    <tr>
      <th id="wizard_examples" colspan="2">
        例
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

## ウィザードとワークフローを組み合わせる

ウィザードは [ワークフロー](workflow.html) フォームの上に重ねられます。ウィザードの各ステップの `defaultModel` が、対応するワークフローノードの [`extra_vars_key`](../workflows/file.html#ansibleforms-own-keys) と一致する場合、各 playbook やテンプレートは、それぞれのウィザードのページの値だけを受け取ります。

FAQ には、具体的な例と、まとめられた extravars の構成が記載されています: [ウィザードとワークフローの違いは何ですか?](../faq.html#what-is-the-difference-between-a-wizard-and-a-workflow)（*組み合わせ（ワークフローの上にウィザード）* のセクション）。

非推奨の [`multistep`](multistep.html) フォーム上のウィザードも同じように動作し、 `extra_vars_key` の代わりにステップの [`key`](multistep.html#step_key) を使います。

---

## 関連項目

関連するページと FAQ の項目:

- [サブフォーム](subform.html): ウィザードのページはサブフォームから表示されます
- [ワークフローフォーム](workflow.html): 実行層でウィザードに対応するもの
- [サブフォームでの `__parent__`](../faq.html#how-do-i-access-parent-form-data-inside-a-subform): 後のステップから前のウィザードのステップを参照する方法

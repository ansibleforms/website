---
layout: default
title: サブフォーム
parent: フォーム
nav_order: 4
translated_from: 25524e14dc072b76c778d7f92adbfbc5f82d3519
---

# サブフォーム
{: .no_toc }

list フィールド、yaml フィールド、ウィザードのページで使う、再利用可能なフォームの断片
{: .fs-6 .fw-300 }

---

サブフォームは、再利用可能なフォームの断片です。タイル表示には表示されず、直接送信することもできません。代わりに、次のものから参照されます。

- [`list`](../formfields/list.html) フィールド: 各行のドリルダウンエディターとしてサブフォームを開きます
- `subform` プロパティを持つ [`yaml`](../formfields/yaml.html) フィールド: 1 つのオブジェクトのドリルダウンエディターとしてサブフォームを開きます
- [`wizard`](wizard.html) のステップ: サブフォームをウィザードの 1 ページとして表示します

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

## プロパティ

サブフォームには **種類に固有のプロパティはありません**。 [フォームの共通プロパティ](common.html) である `name`、 `description`、 `help`、 `type`、 `fields` だけを使います。

サブフォームをウィザードのページとして使う場合、その `description` と `help` がステップの `title` と `help` の既定値になります。 `showHelp` を設定して、ページの読み込み時にそのヘルプを展開することもできます。

実行に関するプロパティ ( `playbook`、 `template`、 `roles`、 `inventory` など) は、サブフォームには適用されません。サブフォームが直接送信されることはないためです。


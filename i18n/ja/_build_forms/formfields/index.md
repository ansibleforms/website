---
layout: default
title: フォームフィールド
nav_order: 2
has_children: true
has_toc: false
permalink: /formfields/
translated_from: f87478aaaa3db6bc7523c8f49e4aea097b90b003
---

# フォームフィールド
{: .no_toc }

フォームの入力コントロール
{: .fs-6 .fw-300 }

---

フォーム作成者向け: フォームに配置できるフィールドの種類と、それぞれがサポートするプロパティを説明します。

フォームフィールドは、フォームの入力コントロールを定義します。フィールドの種類ごとに、特定の種類のデータを収集するための独自のプロパティと動作があります。

単純なテキストから構造化されたリストまで、収集したいデータに合ったフィールドの種類を選んでください。

---

## 共通プロパティ

すべてのフォームフィールドには、次の 2 つの基本プロパティがあります。

- **name** (string、必須): フィールドの一意な識別子
- **type** (string、必須): フィールドの種類。使用できるプロパティを説明するページは、この値で決まります

各フィールドの種類には、その機能に固有のプロパティが追加されます。ナビゲーションのサイドバーまたは下の表でフィールドの種類を選ぶと、プロパティの完全なリファレンスが開きます。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign formfield = form_object.help | where: "name", "Formfield" | first %}
{% assign formfile = formfield.items | where: "name", "type" | first %}

<table>
  <thead>
    <tr>
      <th style="width: 25%;">フィールドの種類</th>
      <th>説明</th>
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

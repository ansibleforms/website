---
layout: default
title: セキュリティアドバイザリ
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# セキュリティアドバイザリ
{: .no_toc }

公開されたすべての脆弱性と、その深刻度および修正
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 公開済みのアドバイザリ

このサイトのビルドのたびに、 [リポジトリの Security タブ](https://github.com/ansibleforms/ansibleforms/security/advisories) から読み込んでいます。

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>アドバイザリ</th>
      <th>深刻度</th>
      <th>脆弱性の種類</th>
      <th>影響を受けるバージョン</th>
      <th>修正バージョン</th>
      <th>公開日</th>
    </tr>
  </thead>
  <tbody>
    {% for a in af_advisories %}
    <tr>
      <td>
        <strong>{{ a.summary | escape }}</strong><br>
        <a href="{{ a.html_url }}">{{ a.ghsa_id }}</a>{% if a.cve_id %}<br>{{ a.cve_id }}{% endif %}
      </td>
      <td>
        {{ a.severity | capitalize }}
        {%- assign af_cvss = a.cvss_severities.cvss_v3 | default: a.cvss -%}
        {%- if af_cvss.score %}<br>CVSS {{ af_cvss.score }}{% endif %}
      </td>
      <td>
        {%- for w in a.cwes %}<span title="{{ w.name | escape }}">{{ w.cwe_id }}</span>{% unless forloop.last %}<br>{% endunless %}{% endfor -%}
      </td>
      <td>{% for v in a.vulnerabilities %}<code>{{ v.vulnerable_version_range }}</code>{% unless forloop.last %}<br>{% endunless %}{% endfor %}</td>
      <td>{% for v in a.vulnerabilities %}{{ v.patched_versions | default: "-" }}{% unless forloop.last %}<br>{% endunless %}{% endfor %}</td>
      <td>{{ a.published_at | date: "%Y-%m-%d" }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% else %}
公開されたアドバイザリはありません。
{% endif %}

GitHub の各アドバイザリに、影響、条件、CVSS ベクトル、修正の詳細が記載されています。

---

## ご利用のバージョンへの影響

アドバイザリには、影響を受けるバージョンと、最初に修正されたバージョンが記載されています。修正はサポート対象のリリース
( [7.x と 6.5.x](development.html#supported-versions) ) で提供され、それより古いリリースにはパッチは適用されません。アップグレードが対策になります。

インスタンスのバージョン (ヘルプメニューの **バージョン情報** 、または `GET /api/v2/version` ) を **影響を受けるバージョン** と比較してください。

---

## 新しいアドバイザリの通知を受け取る

アドバイザリが公開されると、GitHub はリポジトリをウォッチしているユーザーに通知します。

* [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms) で **Watch > Custom > Security alerts** を選びます。
* [変更履歴](../changelog.html) には、すべてのセキュリティ修正が、それを含むリリースの下に記載されています。

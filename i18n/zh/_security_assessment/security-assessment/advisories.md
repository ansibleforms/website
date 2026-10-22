---
layout: default
title: 安全公告
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# 安全公告
{: .no_toc }

每个已公布的漏洞、其严重程度及修复
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 已公布的公告

每次构建本站时从[仓库的 Security 选项卡](https://github.com/ansibleforms/ansibleforms/security/advisories)读取：

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>公告</th>
      <th>严重程度</th>
      <th>弱点</th>
      <th>受影响版本</th>
      <th>修复版本</th>
      <th>公布日期</th>
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
尚未公布任何公告。
{% endif %}

GitHub 上的每条公告都给出了详细信息：影响、条件、CVSS 向量以及修复。

---

## 这对您的版本意味着什么

公告会列出受影响的版本以及第一个已修复的版本。修复随受支持的版本发布，
即 [7.x 和 6.5.x](development.html#supported-versions)，更早的版本不会打补丁：升级就是修复办法。

将实例的版本（帮助菜单中的**关于**，或 `GET /api/v2/version` ）与**受影响版本**进行比较。

---

## 获取新公告的通知

公告发布时，GitHub 会通知该仓库的关注者：

* 在 [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms) 上，选择 **Watch > Custom > Security alerts**。
* [更新日志](../changelog.html)会在包含修复的版本下列出每个安全修复。

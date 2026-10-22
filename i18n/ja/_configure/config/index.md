---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

すべてのフォームに共通のカテゴリ、ロール、定数
{: .fs-6 .fw-300 }

---

管理者向けです。すべてのフォームで共有するカテゴリ、ロール、定数を保持する config.yaml ファイルについて説明します。

AnsibleForms は config.yaml ファイルを使ってカテゴリ、ロール、定数を設定します。ファイルが用意されていない場合は、最小限の設定でファイルが生成されます。設定をデータベースにインポートすることもでき、その場合 config.yaml ファイルは不要になります。

---

## 概要

config.yaml ファイルには、AnsibleForms が使うカテゴリ、ロール、定数の設定が含まれます。

**動画** ： [最初のフォームを作成する](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

次の最小限の config.yaml を出発点にできます。必須の `Default` カテゴリと、必須の `admin` ロールと `default` ロールだけが含まれています。

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## 設定の読み込みの優先順位

AnsibleForms は次の順に config.yaml ファイルを読み込みます（最初に一致したものが使われます）。

1. **データベースから** ：データベースにインポートした設定。 `ENABLE_CONFIG_IN_DATABASE=1` の場合、またはこの
   変数が未設定で、データベースに保存された設定の取得元が `database` の場合に限ります（コピーが空ならファイルにフォールバックします）
2. **リポジトリから（use_for_config）** ：「設定に使用しますか?」スイッチが有効なリポジトリ（6.1.0 で追加）
3. **リポジトリから（use_for_forms）** ：「フォームに使用しますか?」スイッチが有効なリポジトリ（後方互換性のためのフォールバック）
4. **ローカルファイルから** ：ローカルの `config.yaml` ファイル（環境変数 CONFIG_PATH）

{: .warning }
> **注意：** 「設定に使用しますか?」は一つのリポジトリだけで有効にしてください。複数で有効になっている場合は警告がログに記録され、最初のものが使われます。

---

## このセクションの内容

ファイルには三つの最上位の属性があり、それぞれに専用のページがあります。

| ページ | 内容 |
|---|---|
| [カテゴリ](categories.html) | ダッシュボードのフォームを、アイコン付きのカテゴリのツリーにまとめます |
| [ロール](roles.html) | ユーザーとグループをロールに対応付け、各ロールにできることを設定します |
| [定数](constants.html) | すべてのフォームで再利用できる自由なオブジェクト |

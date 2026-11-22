---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

すべてのフォームに共通のカテゴリ、ロール、定数
{: .fs-6 .fw-300 }

---

管理者向けです。すべてのフォームで共有するカテゴリ、ロール、定数を保持する config.yaml ファイルについて説明します。

AnsibleForms は config.yaml ファイルを使ってカテゴリ、ロール、定数を設定します。ファイルが用意されていない場合は、最小限の設定でファイルが生成されます。設定をデータベースにインポートすることもでき、その場合 config.yaml ファイルは不要になります。また、三つのそれぞれを git リポジトリで管理することもできます。

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

7.8.0 以降、カテゴリ、ロール、定数はそれぞれ個別に、次のうちそれを持つ最初のソースから読み込まれます。

1. **リポジトリから** ：用途の種類 **ロール** 、 **カテゴリ** 、 **定数** を持つリポジトリの、 `controller_categories:` 、
   `controller_roles:` 、 `controller_constants:` を持つファイル（名前もフォルダーも任意です。
   [git での設定](../repositories/config-as-code.html#roles-categories-and-constants) を参照）
2. **リポジトリの config.yaml から** ：そのリポジトリの `config.yaml` にある通常のキー。7.8.0 で非推奨となり、8.0 では
   読み込まれなくなります。サーバーのログ、プルの出力、リポジトリのページにその旨が表示されます
3. **データベースから** ：データベースにインポートした設定。 `ENABLE_CONFIG_IN_DATABASE=1` の場合、またはこの
   変数が未設定で、データベースに保存された設定の取得元が `database` の場合に限ります（コピーが空ならファイルにフォールバックします）
4. **ローカルファイルから** ：ローカルの `config.yaml` ファイル（環境変数 CONFIG_PATH）

{: .warning }
> **注意：** **設定に使用しますか?** スイッチは 7.8.0 で廃止されました。アップグレードすると、それを持っていたリポジトリに **ロール** 、
> **カテゴリ** 、 **定数** が与えられます。設定シードや API の `use_for_config` は、この三つの非推奨の別名です。

---

## このセクションの内容

ファイルには三つの最上位の属性があり、それぞれに専用のページがあります。

| ページ | 内容 |
|---|---|
| [カテゴリ](categories.html) | ダッシュボードのフォームを、アイコン付きのカテゴリのツリーにまとめます |
| [ロール](roles.html) | ユーザーとグループをロールに対応付け、各ロールにできることを設定します |
| [定数](constants.html) | すべてのフォームで再利用できる自由なオブジェクト |

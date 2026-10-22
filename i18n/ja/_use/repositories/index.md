---
layout: default
title: Git リポジトリ
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Git リポジトリ
{: .no_toc }

フォーム、変数ファイル、設定、playbook を git で管理する
{: .fs-6 .fw-300 }

---

フォーム、設定、playbook を git で管理する管理者向け: リポジトリに置けるものと、どのソースが優先されるかを説明します。

---

## リポジトリの用途

リポジトリとは、AnsibleForms がクローンして最新の状態に保つ git リモートです。リポジトリごとに、何を保持しているかを示すスイッチがあります。

| スイッチ | AnsibleForms が読み取るもの | リポジトリ内のフォルダー |
|---|---|---|
| **設定に使用しますか?** | カテゴリ、ロール、定数を含む `config.yaml` | ルート |
| **フォームに使用しますか?** | フォームファイル (デザイナーもここに保存します) と、その変数ファイル | `forms` またはルート。変数ファイルは `vars` |
| **playbook に使用しますか?** | ジョブが実行する Ansible の playbook | `playbooks` またはルート |
| **ワークフローに使用しますか?** | [ワークフロー](../workflows/) ファイル (デザイナーもここに保存します) | 任意のフォルダー |
| **インベントリに使用しますか?** | リポジトリ名を名前とする 1 つのインベントリ。フォームは `inventory:` でこれを指定します | ルート: `inventory.yaml`、 `group_vars`、 `host_vars` |

サブフォルダーがない場合は、リポジトリのルートが使われます。1 つのリポジトリにすべてを入れることもできます。分ける場合、複数のリポジトリで有効にできるのは **フォームに使用しますか?**、
**ワークフローに使用しますか?**、 **インベントリに使用しますか?** だけです。ほかのスイッチは最初のリポジトリが使われ、
警告がログに記録されます。

各リポジトリは、 [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) の下にあるリポジトリ名のサブフォルダーにクローンされます。

### すべてを 1 つのリポジトリに

1 つのリポジトリに、フォーム、変数ファイル、設定、playbook を入れることができます。その場合はスイッチを有効にし、種類ごとにサブフォルダーを 1 つずつ設けます。

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### 用途ごとに 1 つのリポジトリ

リポジトリを分けると、チームがそれぞれの担当部分を管理できます。各リポジトリでスイッチを 1 つだけ有効にし、ファイルはルートに直接置きます。

| リポジトリ | スイッチ | ルートの内容 |
|---|---|---|
| `af-config` | **設定に使用しますか?** | `config.yaml` |
| `af-forms-network`、 `af-forms-storage` | **フォームに使用しますか?** | 各チームのフォームファイル。1 つの一覧にまとめられます |
| `af-playbooks` | **playbook に使用しますか?** | playbook とロール |

複数のリポジトリから取得できるのはフォームだけで、設定と playbook はそれぞれ 1 つのリポジトリから取得します。変数ファイルは、 `vars`
フォルダーを持つ最初のフォームリポジトリから取得します。

---

## リポジトリとローカルフォルダーの組み合わせ

リポジトリの内容は、対応するローカルフォルダーの代わりに使われます。次の表は、ファイルの種類ごとの読み取り元をまとめたものです。

| 内容 | 読み取り元 (最初に一致したものが優先) |
|---|---|
| 設定 | 1. 設定をデータベースに保存している場合はデータベース ( [`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE) ) <br> 2. **設定に使用** するリポジトリの `config.yaml` <br> 3. 設定用のリポジトリがない場合は、 **フォームに使用** するリポジトリの `config.yaml` <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| フォーム | **フォームに使用** するすべてのリポジトリと `FORMS_STAGING_PATH`。 [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) はそれらがない場合のみ |
| Playbook | **playbook に使用** するリポジトリ。ない場合は [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| 変数ファイル | `vars` フォルダーを持つ最初の **フォームに使用** するリポジトリのそのフォルダー。ない場合は [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| ワークフロー | **ワークフローに使用** するすべてのリポジトリと [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) の両方 |

複数のリポジトリのフォームは 1 つの一覧にまとめられます。2 つのリポジトリに同じ名前のフォームがある場合は、最初に読み込まれたものが
残り、警告 `skipping duplicate form <name>` がログに記録されます。そのため、フォーム名はリポジトリ間で重複しないようにしてください。

---

## トラブルシューティング

ほとんどの問題は **プル** 列と **前回のプルの出力を表示** (または **前回のプッシュの出力を表示** ) に現れ、そこには git 自体の
エラーメッセージが含まれています。

- [リポジトリのクローンまたはプルに失敗した](../troubleshooting.html#a-repository-clone-or-pull-failed): 認証、known
  hosts、ローカルの変更。
- [フォームリポジトリがまだクローンされていない](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): 最初のクローンが終わるまで、デザイナーは
  保存できません。
- `running` のまま止まったリポジトリは `failed` にリセットされます。再起動した場合は次回の起動時、git 操作を実行しているノードが
  2 分間応答しなくなった場合は 1 分以内、いずれの場合でも 2 時間後にリセットされます。もう一度 **プル** を実行してください。

---

## このセクションの内容

各トピックはそれぞれのページで説明しています。

| ページ | 内容 |
|---|---|
| [リポジトリの追加](adding.html) | リポジトリページ、リポジトリの各フィールド、設定シードでの宣言 |
| [認証](authentication.html) | トークンを使った HTTPS、生成された鍵を使った SSH、カスタム git コマンド |
| [変更のプル](pulling.html) | スケジュール、手動、API によるプルと、ローカルの変更 |
| [デザイナーとプッシュ](designer.html) | デザイナーでフォームを編集し、リポジトリにプッシュする |

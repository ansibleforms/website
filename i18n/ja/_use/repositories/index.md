---
layout: default
title: Git リポジトリ
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Git リポジトリ
{: .no_toc }

フォーム、playbook、設定、接続を git で管理する
{: .fs-6 .fw-300 }

---

フォーム、playbook、アプリの設定を git で管理する管理者向け: リポジトリに置けるものと、どのソースが優先されるかを説明します。

---

## リポジトリの用途

リポジトリとは、AnsibleForms がクローンして最新の状態に保つ git リモートです。その用途の種類が、アプリがそこから何を取り込むかを示します。

7.8.0 以降、リポジトリの **用途** ステップでは、用途の種類が 6 つの見出しの下に並びます: **デザイナー**、 **ジョブ**、 **システム**、
**外観**、 **アクセス**、 **接続** です。 **デザイナー** の種類は、アプリがそのまま読み取るファイルです。

| 用途の種類 | AnsibleForms が読み取るもの | リポジトリ内の場所 |
|---|---|---|
| **フォーム** | フォームファイル (デザイナーもここに保存します) と、その変数ファイル | `forms` またはルート。変数ファイルは `vars` |
| **Playbook** | ジョブが実行する Ansible の playbook | `playbooks` またはルート |
| **ワークフロー** | [ワークフロー](../workflows/) ファイル (デザイナーもここに保存します) | 任意のフォルダー |
| **インベントリ** | リポジトリ名を名前とする 1 つのインベントリ。フォームは `inventory:` でこれを指定します | ルート: `inventory.yaml`、 `group_vars`、 `host_vars` |
| **カテゴリ**、 **定数** | カテゴリと定数 (デザイナーもそのファイルに保存します) | `controller_categories:` または `controller_constants:` を持つファイル |

ほかの種類はすべて、アプリの設定、ユーザー、接続を YAML ファイルに保持し、双方向に読み書きします。対象はスケジュール、
全般の設定、外観のページ、ユーザー、グループ、ロール、サインイン、認証情報、ランナー、そのほかの接続です。
詳しくは [git での設定](config-as-code.html) で説明しています。

**フォーム**、 **Playbook**、 **ワークフロー**、 **インベントリ** は複数のリポジトリでチェックでき、ほかの種類はそれぞれ最大 1 つの
リポジトリでチェックできます。フォームは最初の **Playbook** リポジトリの playbook を実行しますが、 `playbookRepository` で
自分のリポジトリを指定した場合はそちらを使います。各リポジトリは、
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH) の下にあるリポジトリ名のサブフォルダーにクローンされます。

7.8.0 より前の **設定に使用しますか?** スイッチは、 **ロール**、 **カテゴリ**、 **定数** に置き換えられ、それぞれのキーを持つファイルから
読み取られます。リポジトリの `config.yaml` も非推奨として引き続き読み取られます。詳しくは
[ロール、カテゴリ、定数](config-as-code.html#roles-categories-and-constants) を参照してください。

### すべてを 1 つのリポジトリに

1 つのリポジトリに、フォーム、変数ファイル、設定、playbook を入れることができます。その場合は用途の種類にチェックを入れ、種類ごとにサブフォルダーを 1 つずつ設けます。

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### 用途ごとに 1 つのリポジトリ

リポジトリを分けると、チームがそれぞれの担当部分を管理できます。各リポジトリに独自の用途の種類を設定し、ファイルはルートに直接置きます。

| リポジトリ | 用途の種類 | ルートの内容 |
|---|---|---|
| `af-platform` | **ロール**、 **カテゴリ**、 **定数**、 **認証情報**、 **ランナー** | `roles.yaml`、 `categories.yaml`、 `constants.yaml`、 `connections.yaml` |
| `af-forms-network`、 `af-forms-storage` | **フォーム** | 各チームのフォームファイル。1 つの一覧にまとめられます |
| `af-playbooks` | **Playbook** | playbook とロール |

変数ファイルは、 `vars` フォルダーを持つ最初のフォームリポジトリから取得します。

---

## リポジトリとローカルフォルダーの組み合わせ

リポジトリの内容は、対応するローカルフォルダーの代わりに使われます。次の表は、ファイルの種類ごとの読み取り元をまとめたものです。

| 内容 | 読み取り元 (最初に一致したものが優先) |
|---|---|
| ロール、カテゴリ、定数 | キーごとに個別に: 1. その用途の種類を持つリポジトリで `controller_roles:`、 `controller_categories:`、 `controller_constants:` を持つファイル <br> 2. そのリポジトリの `config.yaml` (非推奨) <br> 3. 基本設定: 設定をデータベースに保存している場合はデータベース ( [`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE) )、それ以外は [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| フォーム | **フォーム** のすべてのリポジトリと `FORMS_STAGING_PATH`。 [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) はそれらがない場合のみ |
| Playbook | **Playbook** のリポジトリ。ない場合は [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| 変数ファイル | `vars` フォルダーを持つ最初の **フォーム** のリポジトリのそのフォルダー。ない場合は [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| ワークフロー | **ワークフロー** のすべてのリポジトリと [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) の両方 |

複数のリポジトリのフォームは、リポジトリが追加された順に読み取られます。2 つのリポジトリに同じ名前のフォームがある場合は、
先に追加されたリポジトリのものが使われ、警告に両方のコピーが示されます。そのため、フォーム名はリポジトリ間で重複しないようにしてください。

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
| [git での設定](config-as-code.html) | すべての設定を git リポジトリで管理し、双方向に読み書きする |

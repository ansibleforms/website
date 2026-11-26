---
layout: default
title: Ansible 標準のレイアウト
parent: Git リポジトリ
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Ansible 標準のレイアウトのリポジトリ
{: .no_toc }

AWX と同じく、フォームの playbook をリポジトリのルートから実行する
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ansible が文書化しているレイアウトのリポジトリに playbook を置いている管理者とフォーム作成者向けです (7.8.0 以降)。

---

## レイアウト

Ansible 標準のレイアウトでは、設定、インベントリ、playbook、ロールをリポジトリのルートに並べて置きます。

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

playbook は `playbooks/`、ロールは `roles/` にあるため、Ansible はルートの `ansible.cfg` を通じてロールを見つけます。
`ansible-playbook` がそのフォルダーで起動した場合にだけ、Ansible はこのファイルを読み込みます。

```ini
[defaults]
roles_path = ./roles
```

`ansible.cfg` 内の相対パスは、そのファイルがあるフォルダーから解決されるため、 `collections_path = ./collections` も同じように
機能します。AWX はプロジェクトの playbook をプロジェクトのルートから実行し、7.8.0 以降はフォームも同じことができます。

---

## フォームでリポジトリを指定する

`ansible` フォームは、 `playbookRepository` で playbook を実行するリポジトリを指定します。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

ジョブは、playbook がどのフォルダーにあっても、 `infra` のルートから実行されます。

| 対象 | 読み取り元 |
|---|---|
| `ansible.cfg` | リポジトリのルート。 `roles_path`、 `collections_path`、その他すべての設定が適用されます |
| `playbook` | ルート: `site.yml` ではなく `playbooks/site.yml` |
| 相対パスの `inventory` または `__inventory__` | ルート: `inventories/production/hosts.yaml` |
| `playbookSubPath` | 引き続き実行フォルダーを移動します。基準はルートになります |

名前で指定したインベントリ (`inventory: production`) は、これまでどおりデザイナーの
[インベントリ](../designer/) の 1 つです。リポジトリには **Playbook** の用途タイプが必要です。playbook に使用するリポジトリでない
名前を指定すると、ジョブは `playbookRepository '<name>' is not a repository used for playbooks` で失敗します。

[マルチステップフォーム](../forms/multistep.html) の `ansible` ステップは自分の `playbookRepository` を指定し、
[ワークフロー](../workflows/file.html#ansibleforms-own-keys) の playbook ノードは `playbook_repository` として指定します。

---

## フォームがあるリポジトリ

7.8.0 以降、playbook と同じリポジトリに置かれたフォームは、そのリポジトリの名前を繰り返さずに `__self__` で指定します。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` はフォームの読み込み元のリポジトリで、フォームが指定するほかのリポジトリと同じく **Playbook** の用途タイプが必要です。
ワークフローの playbook ノードでは、 `playbook_repository: __self__` はワークフローファイルがあるリポジトリです。

ローカルのフォームフォルダーにあるフォームはどのリポジトリにもないため、その `__self__` はどのリポジトリも指しません。
フォームにはそのフォームを名指しする読み込みエラー `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none` が出て、
起動は理由を示して拒否されます。ローカルのワークフローフォルダーのファイルにあるノードの `__self__` は、そのノードのジョブを失敗させます。

---

## 複数の playbook リポジトリ

7.8.0 以降、複数のリポジトリに **Playbook** の用途タイプを設定できます。以前は最初のリポジトリだけが使われ、警告が出ていました。

| フォーム | playbook の実行元 |
|---|---|
| `playbookRepository` なし | 追加された順で最初の playbook リポジトリ: その `playbooks` フォルダー、なければルート。7.8.0 より前とまったく同じです |
| `playbookRepository: <name>` あり | そのリポジトリのルート (最初のリポジトリも含む) |

したがって、最初のリポジトリを指定したフォームはそのルートから実行され、 `playbook` もルートから指定します
(`playbooks/site.yml`)。リポジトリを指定しないフォームは、これまでどおり実行されます。

---

## デザイナーでは

デザイナーは、フォームとワークフローのノードで、リポジトリとそれに対応する playbook を提示します。

| 場所 | 表示内容 |
|---|---|
| フォームの **ビジュアル** タブ | **Playbook** の上の **リポジトリ**。playbook リポジトリが複数ある場合、またはフォームがリポジトリを指定している場合に表示されます。最初の選択肢 **最初の playbook リポジトリ** はキーを削除します。2 番目の **このフォームのリポジトリ (name)** は `__self__` を書き込みます |
| **Playbook** | 選んだリポジトリの playbook (ルートからの名前)。 **最初の playbook リポジトリ** の場合は、最初のリポジトリの playbook を実行時と同じ名前で |
| ワークフローの playbook ノード | **実行のしかた** タブに同じ **リポジトリ** フィールド ( `__self__` には **このワークフローのリポジトリ (name)** )、 **実行するもの** にそのリポジトリの playbook |
| **Playbook** セクション | 最初のリポジトリの playbook (その `playbooks` フォルダー、なければルートから)、続いてほかの各リポジトリ全体を、その名前のフォルダーに |

[**すべての playbook を編集**](../designer/#limited-designers) ロールオプションは、playbook をリポジトリとパスで数えます。
`infra` の `playbooks/site.yml` を実行するフォームはそのファイルを使い、最初のリポジトリの `site.yml` ではありません。

---

## RTE ランナーでは

[RTE](../rte/) は、どちらの [ファイルモード](../rte/modes.html) でも、ジョブが指定したリポジトリを受け取ります。

- `RTE_FILES=transfer` (既定) では、アプリは最初のリポジトリの `playbooks` フォルダーではなく、フォームが指定したリポジトリ全体を
  パックして送ります。
- `RTE_FILES=local` では、RTE は `REPO_PATH` の下にある、そのリポジトリの自身のクローンから実行します。

リポジトリを指定したフォームを実行するには、RTE が 7.8.0 以降である必要があります。AWX、Semaphore、Rundeck、Jenkins の
ランナーは自身のテンプレートとジョブを実行します。 `playbookRepository` はそれらのフォームのキーではなく、そのようなランナー上の
ワークフローノードにもありません。

---

## 例: すべての環境に 1 つのフォーム

次のフォームは、ユーザーが選んだ環境のインベントリに対して `infra` の `playbooks/site.yml` を実行します。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

`__inventory__` フィールドは、 **production** の場合にインベントリ `inventories/production/hosts.yaml` を返し、これは `infra` の
ルートから、横にある `group_vars` とともに読み込まれます。 `site.yml` のロールは、 `ansible.cfg` の `roles_path` を通じて `roles/` から読み込まれます。

---

## 7.8.0 より前の同じ例

7.8.0 より前は、フォームは唯一の playbook リポジトリの `playbooks` フォルダーから `playbookSubPath: ../` で出ることしかできませんでした。

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

これもルートから実行されますが、次の制限があり、 `playbookRepository` はそれらを取り除きます。

- 届くのは playbook に使用する最初のリポジトリだけなので、Ansible のレイアウトはそのリポジトリでなければなりませんでした。
- デザイナーの playbook 一覧は `playbooks` フォルダーからの `site.yml` を表示するため、 `playbooks/site.yml` は手で入力していました。
- `RTE_FILES=transfer` (既定) では、RTE は `playbooks` フォルダーだけを受け取るため、 `../` は `ansible.cfg`、ロール、
  インベントリに届きませんでした。 `RTE_FILES=local` でしか機能しませんでした。

そのようなフォームを 7.8.0 に移行するには、 `playbookSubPath: ../` を `playbookRepository: <name>` に置き換えます。
`playbook` と `__inventory__` はそのままです。

---
layout: default
title: ワークフローファイル
parent: ワークフロー
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# ワークフローファイル
{: .no_toc }

ワークフローの構文、ノードの種類、各ノードの実行設定
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ワークフローファイルの置き場所

ワークフローファイルは、ローカルのワークフローフォルダーと、ワークフローに使用するすべてのリポジトリにある YAML ファイルです。

- **ローカルフォルダー** は [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) で、既定では永続フォルダー配下の
  `workflows` です。
- **ワークフローに使用しますか?** がオンの **リポジトリ** は全体が読み込まれるため、ワークフローファイルはどのフォルダーに置いてもかまいません。
  デザイナーはファイルをリポジトリに保存し、 **プッシュ** でリモートに送信します。

`workflow_job_templates` を含む YAML ファイルは、6 階層の深さまですべて読み込まれ、1 つのファイルに複数の
ワークフローを含めることができます。フォームはワークフローを `name` で指定するため、名前は一意にしてください。2 つのワークフローが同じ名前を持つ場合、
それを実行するジョブは失敗し、どちらかの名前を変更するよう表示されます。

---

## 構文

ワークフローファイルは AWX のエクスポートの構文で記述し、ノードは `related.workflow_nodes` の下に置きます。

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

`awx.awx` コレクションの形式も読み込めます。ワークフローの直下に `workflow_nodes` を置き、名前をマップ ( `inventory: {name: staging}` ) ではなく
単純な文字列 ( `inventory: staging` ) で記述する形式です。

### ワークフロー

ワークフローの項目には、ノードとは別に、いくつかの独自のキーがあります。

| キー | 内容 |
|---|---|
| `name` | ワークフローの名前。フォームの `workflow:` で指定します |
| `description` | ワークフローの用途。デザイナーに表示されます |
| `extra_vars` | すべてのノードが受け取る変数。フォームの値が優先されます |
| `related.workflow_nodes` | ノード |

### ノード

各ノードには、識別子、実行するもの、リンクがあります。

| キー | 内容 |
|---|---|
| `identifier` | ノードの ID。英字、数字、ドット、ハイフン、コロン、アンダースコアが使え、ワークフロー内で一意です |
| `unified_job_template.type` | ノードが実行するもの。 [ノードの種類](#node-types) を参照してください |
| `unified_job_template.name` | 実行する playbook、ワークフロー、承認、リポジトリ |
| `related.success_nodes` | このノードが成功したときに実行されるノード |
| `related.failure_nodes` | このノードが失敗したときに実行されるノード |
| `related.always_nodes` | このノードが終了したときに、結果にかかわらず実行されるノード |
| `all_parents_must_converge` | `true`: ノードは、1 つだけでなく、そこに入るすべてのリンクが発火するのを待ちます |

リンクは先に進む方向でなければなりません。リンクがループするワークフローは実行されません。

---

## ノードの種類

ノードは次の 4 種類のいずれかを実行します。名前は AWX での呼び名と同じです。

| 種類 | ノードが実行するもの |
|---|---|
| `job_template` | デザイナーの playbook の 1 つを、RTE 上の個別のジョブとして実行します。 `runner:` がある場合は、そのランナーのテンプレートまたはジョブです |
| `workflow_job_template` | 別のワークフローを、子のワークフロージョブとして実行します。ワークフローは 5 階層までネストできます |
| `workflow_approval_template` | 承認です。誰かが承認または却下するまで、ワークフロージョブは待機します |
| `project` | 指定したリポジトリのプルです (AWX のプロジェクトの更新) |

承認ノードの `unified_job_template.timeout` は秒単位です。応答がないままその時間が過ぎると、ノードは失敗します。 `0` またはタイムアウトなしの場合は、
どれだけ時間がかかっても応答を待ちます。承認が却下されるとノードは失敗し、ワークフローはそのリンクに沿って
続行します。

---

## 実行設定

`job_template` ノードは、AWX のノードと同じ設定をノード自体に持ちます。

| キー | 内容 |
|---|---|
| `inventory` | playbook を実行する対象のインベントリ。フォームの `inventory:` と同じく名前で指定します |
| `related.credentials` | 認証情報。それぞれ独自の名前で playbook に渡され、最初の *SSH* の認証情報は ansible が接続に使うログインにもなります。Vault の認証情報は Vault を開くだけです |
| `limit` | これらのホストでのみ実行します ( `--limit` ) |
| `job_tags` | これらのタグを持つタスクだけを実行します ( `--tags` ) |
| `skip_tags` | これらのタグを持つタスクをスキップします ( `--skip-tags` ) |
| `verbosity` | `0` から `5`: `-v` の数 |
| `diff_mode` | `true`: 変更内容を表示します ( `--diff` ) |
| `job_type` | `check`: ドライラン ( `--check` )。 `run` または指定なし: 実際の実行 |
| `extra_data` | このノードが受け取る変数。ワークフローの `extra_vars` とフォームの値より優先度は低くなります |

ノードのジョブは、フォームの値を extra vars として受け取ります。AWX のサーベイの回答と同じように、フォームの値はワークフローの `extra_vars` より優先され、
ワークフローの `extra_vars` はノードの `extra_data` より優先されます。

---

## AnsibleForms 独自のキー

ノードの 3 つのキーは AnsibleForms 独自のもので、AWX はこれらを無視します。これにより、ワークフローでマルチステップフォームと同じことができます。

| キー | 内容 |
|---|---|
| `runner` | `job_template` ノードで、デザイナーの playbook の代わりに、そのランナーのテンプレートまたはジョブを実行します: AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins。RTE ランナーの場合は、ノードの playbook をそこで実行します。1 つのワークフローでこれらを混在させられます。 |
| `if_extra_var` | マルチステップのステップの `ifExtraVar` と同じく、この extra var が `true` の場合にだけノードを実行します。満たされない場合、ノードはスキップされ、その後に続くものは成功の後と同じように実行されます。常に実行される承認ノードには使えません。 |
| `extra_vars_key` | マルチステップのステップの `key` と同じく、ノードは extra vars のこのキーだけを、ユーザー情報をコピーした状態で受け取ります |

テンプレートのランナーでは、 `unified_job_template.name` が実行するテンプレートまたはジョブで、ノードの `limit`、 `job_tags`、チェック
モード、差分モードは、そのランナーの種類のフォームと同じように渡されます。 `verbosity` が `0` より大きい場合はフォームの
`verbose` がオンになり、 `skip_tags` は渡されません。ノードのインベントリを受け取るのは AWX ランナー (AWX、AAP、Ascender) だけで、
認証情報も AWX の認証情報として受け取ります。Semaphore、Rundeck、Jenkins は、認証情報をフォームの `credentials` として受け取ります。

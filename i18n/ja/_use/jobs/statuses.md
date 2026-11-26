---
layout: default
title: ステータスと種類
parent: ジョブ
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
---

# ステータスと種類
{: .no_toc }

ジョブがとりうるすべてのステータスと、ジョブの種類
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ジョブのステータス

AnsibleForms はジョブに次のステータスを設定します。一覧では、各ステータスが色付きのラベルで表示されます。

| ステータス | 意味 | できること |
|---|---|---|
| `running` | ジョブが実行中、または承認されたジョブが再開した | 出力を追跡する、中止する |
| `approve` | ジョブが実行前 (またはマルチステップのステップの実行前) に [承認ポイント](../forms/approval.html) で待機している | 自分のロールのいずれかが承認者であれば、承認または却下する |
| `success` | playbook、テンプレート、またはすべてのステップがエラーなく終了した | 出力を表示する、再起動する、削除する |
| `failed` | ジョブがエラーで終了した、または起動自体に失敗した | 出力を表示して原因を確認する、再起動する、削除する |
| `warning` | playbook は終了したが [対応が必要](#a-job-that-needs-attention) で、誰かがフォローアップする必要がある。または、マルチステップは終了したが、 `continue` が設定されたステップが失敗した | ジョブのページで理由を読む、フォローアップする、再起動する、削除する |
| `aborted` | AnsibleForms からジョブが中止された、または AWX / AAP のジョブがキャンセルされた | 出力を表示する、再起動する、削除する |
| `rejected` | 承認者がジョブを却下したため、一度も実行されなかった | 出力を表示する、再起動する、削除する |
| `abandoned` | AnsibleForms がジョブの追跡を停止した ( [放棄されたジョブ](cleanup.html#abandoned-jobs) を参照) | 管理対象ホストを確認する、再起動する、削除する |

`running` は青、 `success` は緑で **成功** と表示され、 `failed` は赤です。 `approve` はオレンジで **承認待ち** と表示されるため、
人の対応を待っているジョブは停止したジョブと区別できます。 `warning` は **要対応** と表示され、 `aborted`、 `rejected` と同じく琥珀色です。 `abandoned` は
グレーです。誰かが停止したのではなく、実行していたものがなくなったことを示します。

---

## 対応が必要なジョブ

7.8.0 から、設計どおりに終了したもののオペレーターに作業を残す playbook (別の場所での承認、手動の手順、部分的な適用など) は、
壊れた自動化に見える `failed` や、残りの作業を隠してしまう `success` の代わりに、メッセージ付きの **要対応** (`warning`) として
ジョブを終了できます。playbook は次の 2 つのいずれかの方法でそれを伝えます。

* RTE では、playbook の隣に置く **ステータスファイル** `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (または `.yaml`)。
  RTE は playbook の終了時にこれを読み取り、その後削除します
* RTE と AWX、AAP、Ascender では、キー `af_job_status` を指定した **`set_stats`**

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms は extravars で `__jobid__` を渡すため、playbook はファイルのパスを組み立てられます。playbook が両方を行った場合は
ファイルが優先されます。

* **成功した** playbook だけが要対応で終了できます。失敗したジョブは `failed` のまま、中止したジョブは `aborted` のままで、
  ファイルの内容は関係ありません
* 有効でないファイル (メッセージがない、別のステータス、壊れた YAML) は無視されます。ジョブは成功のままで、その出力の
  `[WARNING]` 行に理由が示されます
* メッセージは、ジョブのページの琥珀色のボックス (詳細はその下に YAML として折りたたまれます)、一覧のステータスのツールチップ、
  ジョブの出力の最終行に表示されます。ジョブメニューの **過去** の下の **要対応** に、これらのジョブが一覧表示されます
* `onStatus: [warning]` を指定した [通知](../forms/notifications.html) がこれらのジョブについて送信されます。メールとチャネルには
  メッセージが含まれ、webhook では [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html) として渡されます
* マルチステップでは、対応が必要なステップは合格として扱われ、次のステップが実行されます。その後、マルチステップ自体も要対応に
  なります。[ワークフロー](../workflows/) では、そのジョブは次のノードにとって成功として扱われます

Semaphore、Rundeck、Jenkins のジョブは要対応で終了できません。

---

## ジョブの種類

ジョブの種類は、ジョブを開始したフォームの `type` に従い、一覧とジョブのページに次のように表示されます。

| 表示される種類 | 実行されるもの |
|---|---|
| `ansible` | RTE で実行される Ansible の playbook |
| `awx`、 `aap`、 `ascender` | AWX、AAP、Ascender のジョブテンプレートまたはワークフローテンプレート |
| `semaphore` | Semaphore UI のテンプレート |
| `rundeck`、 `jenkins` | Rundeck または Jenkins のジョブ |
| `workflow` | [ワークフロー](../workflows/)。playbook ノードはその下で個別のジョブとして実行されます |
| `multistep` | 非推奨です。 `workflow` を使ってください。一連のステップで、各ステップはメインジョブの下に個別のジョブとして記録されます |

テンプレートのジョブは `awx` ジョブとして (REST API でも) 保存され、フォームでの呼び方にかかわらず、実行されたランナーの種類で
表示されます。たとえば、AAP ランナーで実行される `awx` タイプのフォームは `aap` と表示されます。

フォーム側については、 [Ansible フォーム](../forms/ansible.html)、 [AWX フォーム](../forms/awx.html)、 [ワークフローフォーム](../forms/workflow.html)、
[マルチステップフォーム](../forms/multistep.html) を参照してください。

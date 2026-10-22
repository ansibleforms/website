---
layout: default
title: ランナーの種類
parent: ランナー
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# ランナーの種類
{: .no_toc }

ランナーになれる製品、そのアドレスとログイン
{: .fs-6 .fw-300 }

**種類** のステップには製品ごとに一つの選択肢があり、それぞれにヒントがあります。RTE のヒントには名前が *実行環境* と書かれています。AAP と
Ascender は、フレーバー（ `aap` または `ascender` ）を持つ種類 `awx` のランナーとして保存されます。構成シードでもこの形式を使います。

| 種類 | Uri の例 | プロジェクト | 認証 |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | RTE の `RTE_TOKEN` |
| AAP | `https://aap.example.com/api/controller/v2` | | API トークン、またはユーザーとパスワード |
| Ascender | `https://ascender.example.com/api/v2` | | API トークン、またはユーザーとパスワード |
| AWX | `https://awx.example.com/api/v2` | | API トークン、またはユーザーとパスワード |
| Jenkins | `https://jenkins.example.com` | ジョブがあるフォルダー（任意） | ユーザーとその API トークン |
| Rundeck | `https://rundeck.example.com` | プロジェクト名 | ユーザーの API トークン |
| Semaphore | `https://semaphore.example.com` | プロジェクト ID。 `/project/<id>` の数字 | ユーザーの API トークン |

AWX、AAP、Ascender のアドレスには API パスを含めます。 `/api/v2` 、AAP 2.5 以降では `/api/controller/v2` です。
RTE は `AF_ROLE=rte` で起動した AnsibleForms のイメージで、その実行方法は
[ランタイム環境](../rte/) で説明しています。

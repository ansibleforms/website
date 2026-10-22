---
layout: default
title: ジョブ
parent: REST API
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# ジョブ
{: .no_toc }

フォームの起動、ジョブの追跡、中止、再起動、承認
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

ジョブはフォームの 1 回の実行です。フォームの名前と値を指定して起動し、その ID で追跡します。

---

## フォームを起動する

フォーム名とその値を `POST /api/v2/job` に送ります。

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

リクエストには次のプロパティを指定します。

| プロパティ | 意味 |
|---|---|
| `formName` | 起動するフォームの名前。必須です。 |
| `extravars` | ジョブの追加変数。別名として `payload` も受け付けます。 |
| `rawFormData` | ブラウザーが保持しているとおりの、フォームのフィールドの値。 [起動時の検証](../launch-validation/) はこれをチェックし、そこから extravars を組み立てます。 |
| `credentials` | ジョブに渡す認証情報。名前で指定します。 |
| `files` | フォームのファイルフィールドのアップロード（ [ファイルのアップロード](../launch-validation/file-uploads.html) を参照）。 |

レスポンスには新しいジョブの ID が含まれます。

```json
{ "id": 42 }
```

ジョブを詳細モードで実行するには、extravars に `"__verbose__": true` を追加します。これにはロールのオプション `allowVerboseMode` が必要で、
ない場合は起動が `403` を返します。

---

## ファイルをアップロードする

ファイルフィールドを持つフォームでは、先にファイルをアップロードする必要があります。マルチパートのパート `file` として `POST /api/v2/job/upload` に送ります。

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

応答には保存されたアップロードの内容が記述されています。

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

これを変更せずに、起動の `files` にファイルフィールドの名前で渡します。 `"files": { "firmware": { ... } }` のようにします。サーバーは
それを自分のディスクと照合してチェックします（ [ファイルのアップロード](../launch-validation/file-uploads.html) を参照）。

---

## ジョブを追跡する

ID でジョブを読み取ります。

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

ジョブには `status` 、 `extravars` （同じオブジェクトが `payload` としても入ります）、 `subjobs` 、 `output` が含まれます。
出力はジョブページの色付きの HTML です。スクリプトやログに向いたプレーンテキストにするには `?text=true` を追加します。

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

`status` は、実行中は `running` 、承認待ちの間は `approve` です。ジョブは次のいずれかで終了します。

| ステータス | 意味 |
|---|---|
| `success` | ジョブがエラーなしで終了しました |
| `failed` | ジョブが失敗しました |
| `warning` | マルチステップのジョブは終了しましたが、途中で `continue` が設定されたステップが失敗しました |
| `aborted` | ジョブが中止されました |
| `rejected` | 承認が拒否されたため、それを待っていたものは実行されませんでした |
| `abandoned` | ジョブを追跡していたプロセスが停止し（再起動、コンテナーの置き換え）、ジョブが放棄されました |

放棄されたときにランナー上で実行中だったジョブは、そのランナーが最後まで実行すれば、実際の結果で終了することがあります。

---

## ジョブを探す

`GET /api/v2/job` は、新しいジョブから順に `{ "count": ..., "records": [ ... ] }` として一覧を返します。次のクエリパラメーターで絞り込めます。

| パラメーター | 意味 |
|---|---|
| `records` | 返すジョブの最大数。既定は [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) （1000）で、 `JOBS_LIST_SIZE` がそれより大きくない限り最大は 5000 です。 |
| `user`, `user_type` | このユーザーのジョブだけ。 `user_type` は省略すると `local` です（それ以外は `ldap` 、 `azuread` 、 `oidc` ）。 |
| `runner` | このランナーで実行されたジョブだけ |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

ユーザーに見えるのは、自分のジョブと、自分のロールのいずれかで承認できる承認待ちのジョブです。管理者、または
`showAllJobLogs` か `manageAllJobs` のオプションを持つロールには、すべてのジョブが見えます。レコードにはジョブの概要（ `id` 、 `form` 、 `status` 、 `start` 、 `end` 、 `user` 、 `runner` など）が含まれます。
extravars と出力を見るには、ジョブ自体を読み取ってください。

`GET /api/v2/job/approvals` は数値を返します。ユーザーが承認できる、承認待ちのジョブの数です。

---

## ジョブの詳細

次のエンドポイントで、1 つのジョブについてさらに詳しく読み取れます。

| 呼び出し | 返すもの |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | ジョブを起動したときのフィールドの値。フォームが保持していたとおりのものです。再起動と同じ権限が必要です。自分のジョブ（管理者や `manageAllJobs` を持つロールならすべてのジョブ）であること、再起動を許可するフォームであること、ロールのオプション `allowJobRelaunch` があることです。 |
| `GET /api/v2/job/{id}/events` | プレイブックのジョブの構造化されたイベント（7.3.0 以降、7.3.0 以降の RTE 上のプレイブックの場合）。各プレイ、タスク、ホストの結果、まとめを、 `order` 、 `type` 、 `play` 、 `task` 、 `host` 、 `duration` 、 `time` とともに返します |
| `GET /api/v2/job/{id}/events/{order}` | それらのイベントの 1 つを、 **タスクの結果** ダイアログと同じく `result` 全体とともに返します。 `order` が整数でない場合は `400` 、そのイベントがジョブにない場合は `404` です |
| `GET /api/v2/job/{id}/node/{nodeId}` | ワークフローのジョブの 1 つのノード。 `{ "node", "job", "extravars", "artifacts" }` を返します。 `job` はノード自身のジョブの ID で、ノードが実行されなかった場合は `null` です。 |

---

## その他の操作

次のエンドポイントは既存のジョブに対して操作します。

| 呼び出し | 操作 |
|---|---|
| `POST /api/v2/job/{id}/abort` | 実行中のジョブを中止します |
| `POST /api/v2/job/{id}/relaunch` | ジョブを、実行したとおりに、または変更を加えて再起動します（ [再起動](../launch-validation/relaunching.html) を参照） |
| `POST /api/v2/job/{id}/approve` | 承認待ちのジョブを承認します。自分のジョブは、その承認で `allowSelf: true` が設定されているか管理者でない限り `403` を返します |
| `POST /api/v2/job/{id}/reject` | 承認待ちのジョブを拒否します |
| `GET /api/v2/job/{id}/download` | ジョブの出力をダウンロードします |
| `DELETE /api/v2/job/{id}` | ジョブを削除します |

中止、承認、拒否、削除はメッセージを返し、再起動はさらに新しいジョブの ID も返します。

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

再起動に `?verbose=true` を追加すると、ロールのオプション `allowVerboseMode` がある場合、新しいジョブを詳細モードで実行します。操作に対して
ジョブの状態が正しくない場合、たとえばすでに終了したジョブを中止しようとした場合は、 `409` が返されます。

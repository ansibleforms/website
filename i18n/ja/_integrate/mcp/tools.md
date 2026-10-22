---
layout: default
title: ツール
parent: MCP サーバー
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# ツール
{: .no_toc }

エージェントがフォームの入力、承認、再起動に使うツール
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

MCP サーバーは最大 15 個のツールを提供します。6 個はすべてのユーザーに提供され、残りはユーザーのロールのオプションに従います。そのため、
オプションを持たないユーザーには、そのツールはまったく提供されません。

| ツール | 内容 | 提供される条件 |
|---|---|---|
| `list_forms` | ユーザーが使えるフォーム。名前、説明、カテゴリ、そして `enableForChat` （チャットアシスタントがそのフォームを扱うかどうか）。 | 常に |
| `get_form` | 1 つのフォームの完全な定義。各フィールドには `dynamic` （式やクエリから評価されるか）と `dependsOn` （読み取るフィールド）も付きます。 | 常に |
| `resolve_field` | ここまでに入力された値でフォームを評価します。下記を参照してください。 | 常に |
| `launch_job` | 指定した値で、ブラウザーからの送信とまったく同じようにフォームを起動します。ジョブ ID を返します。 | 常に |
| `relaunch_job` | 一部のフィールドを変更してジョブをもう一度起動します。下記を参照してください。 | 常に |
| `get_job` | ジョブのステータスと出力（ `tail` で出力を最後の数行に制限できます）。 | 常に |
| `plan_job` | フォームを後で 1 回、ユーザーとして実行します。フォームの **後で実行 (1 回限り)** と同じです。 | `allowPlannedJobs` |
| `create_schedule` | **スケジュール** ページと同じく、繰り返し（ `cron` ）または 1 回限り（ `run_at` ）のスケジュールを作成します。 | `allowScheduledJobs` |
| `list_schedules` | ユーザーが見られるスケジュール。 `allowScheduledJobs` があればすべて、なければ自分が計画した実行です。 | `allowPlannedJobs` または `allowScheduledJobs` |
| `get_schedule` | 1 つのスケジュールを、その追加変数（シークレットらしきものはマスク）と最後の実行の出力とともに返します。 | `allowPlannedJobs` または `allowScheduledJobs` |
| `delete_schedule` | ユーザーが見られる計画済みの実行を取り消すか、スケジュールを削除します。 | `allowPlannedJobs` または `allowScheduledJobs` |
| `list_stored_jobs` | ユーザーが見られる [保存済みジョブ](../jobs/stored-jobs.html) 。値は含みません。 | `allowStoredJobs` |
| `get_stored_job` | 1 つの保存済みジョブをその値とともに返します。 `id` 、またはユーザー自身のものの中から `form` と `name` で指定します。 | `allowStoredJobs` |
| `store_job` | フォームの **データを保存** と同じく、フォームの値を名前を付けて保存します。 | `allowStoredJobs` |
| `delete_stored_job` | ユーザーが見られる保存済みジョブを削除します。 | `allowStoredJobs` |

`launch_job` 、 `relaunch_job` 、 `plan_job` は、 `verbose: true` を指定するとジョブを詳細モードで実行します。これにはロールのオプション
`allowVerboseMode` が必要です。 [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) を指定すると、起動、計画、
変更を行うツール（ `launch_job` 、 `relaunch_job` 、 `plan_job` 、 `create_schedule` 、 `delete_schedule` 、 `store_job` 、 `delete_stored_job` ）は
提供されません。

任意の式、クエリ、プレイブック、extravars を実行するツールはありません。式と
クエリは、常にフォームが定義するとおりにだけ実行されます。

[チャットアシスタント](../chat) もこれらのツールを使います。ただし `launch_job` の代わりに **起動** ボタンを使います。

---

## フォームを入力する

フォーム名とここまでに得た値を指定して `resolve_field` を呼び出し、回答が得られるたびにもう一度呼び出します。フィールドを
依存関係の順に処理し、それぞれについて次のことを報告します。

- `status` : `resolved` 、 `waiting` （ `waitingFor` 付き）、 `hidden` 、または `error` （フィールドは既定値に戻ります）
- `value` 、 `default` 、そして選択式のフィールドでは `options` （最大 `maxOptions` 個、既定は 200）
- `needsInput` : 値のない必須フィールド、またはまだ `__auto__` のままの選択肢
- `validationErrors` : 値が違反しているルール。ブラウザーのメッセージ付きで `[{type, description}]` として返します

フォーム全体については、 `missing` と `invalid` にまだ修正が必要なものが列挙されます。 `complete` が true になるまで、 `launch_job` は起動を拒否します。

検証はブラウザー自身のコードで、 [起動時の検証](../launch-validation) と共有されています。非表示のフィールドは
検証されず、空の任意フィールドは有効です。

---

## スケジュールと計画済みの実行

`plan_job` は `launch_job` と同じ `form` 、 `values` 、 `expectedPayloadHash` に加えて、実行の `name` と `run_at` を受け取ります。 `run_at` は
オフセットまたは `Z` 付きの ISO 8601 の時刻（ `2026-10-15T22:00:00+02:00` ）です。タイムゾーンのない時刻は拒否されます。値はこの時点で解決・
検証され、ブラウザーでの [計画済みの実行](../jobs/schedules.html#planned-runs) と同じく、実行時にもう一度チェックされます。
応答では、実行時刻を UTC とアプリの時計の両方で示します。

`create_schedule` は `form` 、 `name` 、 `cron` （ `0 22 * * 1-5` のような 5 つのフィールド）または `run_at` のどちらか、そしてジョブが受け取る
`extraVars` を受け取ります。このようなスケジュールは、フォームの検証なしで `Schedule Service` として実行されます。フォームをユーザーとして 1 回実行するには、
`plan_job` を使ってください。スケジュール名は一意です。

---

## 保存済みジョブ

保存済みジョブは、フォームの値を名前を付けて保存したものです。ツールはブラウザーと同じ保存済みジョブを扱います。

`list_stored_jobs` は、ユーザー自身の保存済みジョブを、 `showSettings` を持つユーザーにはすべての人の保存済みジョブを、名前、説明、
フォーム、作成日時、有効期限とともに一覧表示します。 `usable` と表示されたもの（ユーザー自身のもので、起動できるフォームのもの）は、
`storedJob` （ `{ "id": 7 }` 、またはそのフォームのユーザー自身のものの中から `{ "name": "..." }` ）として `resolve_field` 、 `launch_job` 、 `plan_job` に渡せます。
その値が出発点になり、 `values` がその上に重ねられます。パスワードフィールドは保存されないため、 `values` で指定してください。
保存済みジョブからの `launch_job` と `plan_job` には、 `resolve_field` がそれに対して返した `expectedPayloadHash` が必要です。また、
`resolve_field` は `storedJob` と `subform` を一緒に指定すると拒否します。

`store_job` は `form` 、そのフォームのユーザーの保存済みジョブの中で一意な `name` 、 `values` 、そして省略可能な
`description` と `expires_at` （オフセットまたは `Z` 付きの ISO 8601）を受け取ります。応答では、どのパスワードフィールドが除外されたかを示します。

---

## 値を渡す

`field` を渡すと、そのフィールドとそれが依存するものだけを解決します。リストの行やウィザードのステップには、 `subform` （と、
省略可能な親フォームの値 `parent` ）を渡します。

値はブラウザーが保持しているとおりに送ります。選択式のフィールドは、部分的なレコードや `valueColumn` の値
（ `"vol1"` ）も受け付け、 `multiple` の場合は配列も受け付けます。計算されるフィールドは、 `editable` でない限り送られた値を無視します。

---

## 正確なペイロードを承認する

フォームが完成すると、 `resolve_field` は `launch_job` が送信する内容も返します。

- `modeledExtravars` : `model` 、 `valueColumn` 、 `output` を適用した後の extravars。
  パスワードフィールドはマスクされます
- `credentials` : ジョブが使う AnsibleForms の認証情報（シークレットではなく名前）
- `payloadHash` : フォーム名、実際の extravars、認証情報の SHA-256 ハッシュ

`modeledExtravars` をオペレーターに示し、承認された `payloadHash` を
`expectedPayloadHash` として `launch_job` に渡します。起動ではフォームをもう一度解決し、
ペイロードが異なる場合、たとえばクエリの答えが変わった場合などは拒否します。
`ansibleforms_user` 、 `__jobid__` 、 `__verbose__` は起動時に追加されるもので、ハッシュには含まれません。

`launch_job` がチェックするのはペイロードだけです。ペイロードが変わらないフォームの編集では、起動は拒否されません。
`resolve_field` のすべての応答には、フォーム定義の SHA-256 ハッシュである `formFingerprint` も含まれています。フォームが少しでも
編集されたら起動を拒否したい場合は、チャットアシスタントの **起動** ボタンと同じように、 `launch_job` を呼び出す前に自分で比較してください。

---

## 変更を加えて再起動する

`relaunch_job` はジョブの `id` と `values` を受け取ります。 `values` には変更するフィールドだけを生の値で指定します。
`values` はジョブが最初に起動されたときの値の上に重ねられ、その結果は `launch_job` とまったく同じように、
リストの行も含めて解決・検証され、あなたによる新しいジョブとして起動されます（ `ansibleforms_user` は元の送信者ではなくあなたです）。
元のジョブのファイルのアップロードは再利用されます。

`values` がない場合は **実行したとおりの** 再起動です。保存された extravars がサーバーで
再生され、パスワードも含まれます（プレビューではマスクされます）。ただし、フォームが起動時の検証の
`enforce` の対象である場合、再起動は変更を加えた再起動と同じチェックを通ります。

**パスワードはフィールドの値と一緒に保存されることはありません。** そのため、チェックを通る再起動は、
フォームの最上位またはリストの行にパスワードフィールドが表示される場合に拒否されます
（ `unsupported` 、 `passwordFields` 付き）。依存関係によって非表示になっているパスワードフィールドは、
再起動を妨げません。 [起動時の検証](../launch-validation) を参照してください。

まず `preview: true` で呼び出してください。起動せずに `modeledExtravars` （パスワードはマスク）、
`credentials` 、 `payloadHash` を返します。ユーザーにそれを確認してから、
`expectedPayloadHash` を指定してもう一度呼び出します。ブラウザーでの再起動と同じ権限が
必要です。フォームが再起動を許可しており、ロールに `allowJobRelaunch` オプションがあることです。
保存されたフォームデータのないジョブ（再起動の機能ができる前に起動されたもの）とウィザードフォームは、変更を加えて
再起動できません。

REST API でも、本文 `{ "values": { ... } }` を付けた `POST /api/v2/job/{id}/relaunch` で同じことができます。
本文がない場合は、ジョブを実行したとおりに再生します。

---

## エラー

拒否された呼び出しはツールのエラーになり、その構造化コンテンツに `code` と詳細が含まれます。

| コード | 発生する場合 |
|---|---|
| `form_incomplete` | 完成していないフォームに対する `launch_job` または `relaunch_job` 。 `missing` 、 `invalid` 、 `waiting` 、 `validationErrors` 、 `rowErrors` 付き |
| `payload_mismatch` | ペイロードが `expectedPayloadHash` と異なる。両方のハッシュ付き |
| `access_denied` | ユーザーのロールにフォーム、ジョブ、スケジュール、保存済みジョブ、または詳細モードの権限がない。あるいはサーバーが読み取り専用 |
| `not_found` | そのフォーム、サブフォーム、ジョブが存在しない |
| `unsupported` | ウィザードフォーム、単独のサブフォーム、ファイルフィールド、または表示されるパスワードフィールドが必要になる `relaunch_job` |
| `no_form_data` | スケジュールが起動したジョブなど、フォームの値を保存していないジョブに対する変更付きの `relaunch_job` 。代わりに変更なしで再起動してください |
| `invalid_request` | サーバーが形式不正として拒否するリクエスト |
| `internal_error` | その他すべて |

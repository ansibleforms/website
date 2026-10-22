---
layout: default
title: バックアップ
parent: 本番環境での運用
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# バックアップ
{: .no_toc }

夜間バックアップ、その内容、リストア、ほかに保持すべきもの
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 夜間バックアップ

AnsibleForms は毎晩午前 0 時に、 [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) のタイムゾーン（既定は UTC）で
自分自身をバックアップします。次の設定で制御します。

| 変数 | 既定値 | 意味 |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | バックアップの書き込み先。バックアップごとにタイムスタンプ付きのフォルダーが一つ作られます |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | 保持する夜間バックアップの数。 `0` ですべて保持します |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | データベースをダンプするコマンド |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | リストア時にダンプを再生するコマンド |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | ダンプとリストアを実行できる時間 |

ロールオプション `allowBackupOps` を持つユーザーは、 **バックアップ** ページでいつでもバックアップを取ることもできます。保持期間によって削除されるのは
夜間バックアップだけで、数に含まれるのは使用可能なダンプを持つバックアップだけです。そのため、何晩も続けて失敗しても、
最後の正常なバックアップが押し出されることはありません。

アップグレードでデータベースが変更される前に、ワーカーはまず通常のバックアップを、リリースごとに一度、 *Before the upgrade to
&lt;version&gt;* という名前で取ります。これは **バックアップ** ページに表示され、夜間バックアップの保持期間で削除されることはありません。失敗した場合（ダンプツールがない、
`BACKUP_PATH` に書き込めないなど）、アップグレードは理由を示して停止するため、アップグレードが中途半端なデータベースでアプリが起動することはありません。
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` にすると、バックアップなしでアップグレードします。

コマンドは、最初の単語がローカルに存在すれば、 `docker exec <container> mysqldump` のようなラッパーでもかまいません。7.3.0 からは
シェルなしで実行されます。引用符とコマンドの環境の `$NAME` は使えますが、 `;` 、 `|` 、 `&&` 、 `>` 、 `<` は拒否されます。

---

## データベースの権限

ダンプは [`DB_USER`](../customization/server.html#env_DB_USER) として実行され、アプリケーション自体が必要とする以上の権限は不要です。

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

ダンプは `--no-tablespaces` で取られるため、サーバー全体の `PROCESS` 権限は不要です。また、実行中のプロセスを表すテーブル
（ `nodes` 、 `cache_epochs` 、 `designer_lock` 、 `runner_leases` ）はスキップされます。リストアは同じユーザーで再生されます。
ユーザーが `root` のようにすべてのデータベースに対する権限を持っている場合、 **ステータス** ページの **データベースユーザー** チェックに警告が表示されます。

---

## バックアップの内容

各バックアップは `BACKUP_PATH` の下のフォルダーで、UTC のタイムスタンプ（ `YYYYMMDDHHmmss` ）にちなんだ名前が付き、次のものを含みます。

| ファイル | 内容 |
|------|---------|
| `ansibleforms.sql` | `AnsibleForms` データベースのダンプ。ユーザー、グループ、認証情報、ジョブ、設定、監査証跡 |
| `config.yaml` | [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) にあるファイル |
| `forms/` | [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) にあるフォルダー |
| `managed.env` | 設定ページが書き込む環境ファイル。 `ENCRYPTION_SECRET` 、 `ENCRYPTION_SECRET_PREVIOUS` 、 `ACCESS_TOKEN_SECRET` は含みません |
| `meta.yaml` | バックアップの説明 |

ダンプに失敗したバックアップは再び削除され、エラーとしてログに記録されます。 **ステータス** ページは、バックアップがないとき、
最新のものが 2 日より古いとき、または使用可能なダンプがないときに警告し、ダンプツールが存在するかも確認します。

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) は、代わりにデザイナーの復元ポイントを保持します（既定は 60 日）。

---

## バックアップのリストア

[**バックアップ** ページ](../gui/administration.html#restore) から、 **復元する前に新しいバックアップを作成する** をオンにしてリストアします。リストアでは次のことが行われます。

* `ansibleforms.sql` を再生し、データベース全体を置き換えます。7.3.0 からは、古いリリースのバックアップはその後、新しいリリースの
  起動時と同じように再びアップグレードされ、失敗したパッチは報告されます
* `config.yaml` を書き戻し、 `forms/` フォルダーをバックアップのものに置き換えます。7.3.0 からは、バックアップにないフォームは
  残さずに削除され、フォルダーのリンクとモードは維持され、コピーに失敗するとフォルダーはロールバックされます
* `managed.env` は **リストアしません** 。バックアップ元のホストを表すものだからです。 **環境を復元**
  ボタンを押すと要求に応じて戻し、現在のファイルを `.env.bak` として残します。再起動が必要です。

使用可能なダンプのないバックアップは拒否されます。リストアが中断された場合は、原因を修正してから再度リストアしてください。

新しいホストでは、リストアの前に同じ `ENCRYPTION_SECRET` を設定してください。そうしないと、保存されている認証情報を復号できません。

---

## ほかにバックアップすべきもの

夜間バックアップはデータベース、設定、フォームを対象とし、永続フォルダーのそれ以外のものは含みません。

* **`ENCRYPTION_SECRET` と `ACCESS_TOKEN_SECRET`** ：設計上、バックアップには決して含まれません。シークレットマネージャーに保管してください。
  暗号化シークレットがなければ、データベースのダンプは認証情報の役に立ちません。
* **バックアップ自体** ：インスタンスと同じボリュームにあります。 `BACKUP_PATH` を別のホストにコピーしてください。
* **永続フォルダーの残り** ：プレイブック、アップロード、変数ファイル、クローンしたリポジトリ、証明書、ログ。
  docker-compose プロジェクトでは、 `data/` フォルダー全体をバックアップしてください。ここには SSH キー、カスタム
  関数、Ansible のロールとコレクションも含まれます。

git から来るコンテンツ（リポジトリ、リポジトリ内のフォーム）は再びクローンできるので、そのバックアップの重要性は低くなります。

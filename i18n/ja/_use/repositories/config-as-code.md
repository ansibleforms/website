---
layout: default
title: git での設定
parent: Git リポジトリ
nav_order: 5
translated_from: 80e30306a069294520da314840328f669e2a2019
---

# git での設定
{: .no_toc }

すべての設定を git リポジトリで管理し、双方向に読み書きする
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

7.8.0 以降、AnsibleForms の設定、ユーザー、接続を git でレビューし、バージョン管理したい管理者向けです。

---

## 用途の種類

リポジトリの **用途** ステップ (ウィザード内とリポジトリのページの **用途** タブ) で、アプリがそこから何を取り込むかを指定します。

種類は 6 つの見出しの下にまとめられ、各見出しには含まれる種類の数が付きます (例: **デザイナー (6)** )。種類ごとに
チェックボックスと、そのためにリポジトリが何を保持するかを示す短い説明があります。見出しのチェックボックスは、その見出しの
チェックできるすべての種類をまとめてオンまたはオフにします。

| 見出し | 用途の種類 (フラグ) |
|---|---|
| **デザイナー** | **カテゴリ** ( `use_for_categories` )、 **定数** ( `use_for_constants` )、 **フォーム** ( `use_for_forms` )、 **インベントリ** ( `use_for_inventories` )、 **Playbook** ( `use_for_playbooks` )、 **ワークフロー** ( `use_for_workflows` ) |
| **ジョブ** | **スケジュール** ( `use_for_schedules` ) |
| **システム** | **全般** ( `use_for_general` ) |
| **外観** | **既定値** ( `use_for_defaults` )、 **ロゴ** ( `use_for_logo` )、 **アイコン** ( `use_for_icon` )、 **名前** ( `use_for_name` )、 **リンク** ( `use_for_links` )、 **ラベル** ( `use_for_labels` )、 **お知らせ** ( `use_for_announcements` ) |
| **アクセス** | **免責事項** ( `use_for_disclaimer` )、 **ユーザー** ( `use_for_users` )、 **グループ** ( `use_for_groups` )、 **ロール** ( `use_for_roles` )、 **LDAP** ( `use_for_ldap` )、 **SSO** ( `use_for_sso` ) |
| **接続** | **リポジトリ** ( `use_for_repositories` )、 **認証情報** ( `use_for_credentials` )、 **シークレットストア** ( `use_for_secret_stores` )、 **データベース** ( `use_for_databases` )、 **ランナー** ( `use_for_runners` )、 **SSH** ( `use_for_ssh` )、 **通知** ( `use_for_notifications` )、 **チャットアシスタント** ( `use_for_chat_assistant` )、 **MCP** ( `use_for_mcp` )、 **Syslog** ( `use_for_syslog` ) |

**フォーム**、 **インベントリ**、 **Playbook**、 **ワークフロー** は複数のリポジトリでチェックできます。フォームは最初の **Playbook**
リポジトリの playbook を実行しますが、 `playbookRepository` で自分のリポジトリを指定した場合はそちらを使います。ほかの種類はすべて
最大 1 つのリポジトリにしか属さず、2 つ目は API でも設定シードでも拒否されます。別のリポジトリが保持している種類は、
チェック済みのグレーで無効として表示され、ツールチップにそのリポジトリの名前が示されます: `リポジトリ「platform」で管理済み`。

用途の種類のオンとオフを切り替えられるのは、 **URI** や **ブランチ** と同じく管理者だけです。詳しくは
[リポジトリを変更できるユーザー](adding.html#who-may-change-a-repository) を参照してください。

---

## リポジトリでの保存場所

リポジトリは種類を、任意の名前で任意のフォルダーにある YAML ファイルに保持します。ファイルの最上位のキーが、どの種類かを示します。

そのキーは常に `controller_` と種類のキーを続けたものです: `controller_credentials:`、 `controller_roles:`、 `controller_defaults:`。
リポジトリ内のすべての `.yaml` または `.yml` ファイルが、階層の深さに関係なく調べられます (隠しファイルと隠しフォルダーは除きます)。
1 つのファイルに複数の種類を入れることも、1 つの種類を多くのファイルに分けることもできます。

| キー | 内容 |
|---|---|
| `controller_general:`、 `controller_mcp:`、 `controller_ssh:`、 `controller_chat_assistant:`、 `controller_defaults:`、 `controller_logo:`、 `controller_icon:`、 `controller_name:`、 `controller_links:` | 1 つのマップ。アプリに 1 つしかないもの用で、これを持つファイルは最大 1 つです |
| `controller_users:` | ユーザーの一覧。各ユーザーは `type` (省略時はローカル) と `username` で識別されます |
| `controller_disclaimer:` | バージョンの一覧。各バージョンは `version` で識別されます |
| `controller_roles:`、 `controller_categories:`、 `controller_constants:` | ロール、カテゴリ、定数。いつもの形式です |
| そのほかの `controller_` キー | 項目の一覧。各項目は `name` で識別されます |

オブジェクトは種類の中で名前によって識別され、ファイルによって識別されることはありません。別のファイルに移した項目も同じオブジェクトのままです。
通常のキー ( `credentials:`、Galaxy の requirements ファイルの `roles:`、変数ファイルの `labels:` ) はどの種類のものでもなく、
アプリはそれを読むことも書くこともありません。フォームが種類のファイルになることはなく、リポジトリが使われていない種類のキーは
そのまま残され、プルの出力にヒントが表示されます。

### ロール、カテゴリ、定数

この 3 つは `config.yaml` の形式を保ったまま、それぞれ独自のキーの下で、独自の用途の種類 (それぞれ 1 つのリポジトリ) になります。

それぞれ、リポジトリ内でそのキーを最上位に持つファイルから読み取られます。名前もフォルダーも任意で、1 つのファイルに
3 つすべてを入れることもできます。それを持つファイルがない場合は、リポジトリの `config.yaml` の通常のキー `roles:`、
`categories:`、 `constants:` が引き続き読み取られます。これは 7.8.0 で非推奨となり、8.0 では読み取られなくなります。
サーバーのログ、プルの出力、リポジトリのページにその旨が表示されます。各キーはそれぞれ専用のファイルに移してください
(たとえば `controller_roles:` を持つ `roles.yaml` )。

どのリポジトリも保持していないキーは、これまでどおり基本設定から取得されます: データベース内のコピー、または
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) にあるファイルです。以前の **設定に使用しますか?** スイッチは
廃止されました。アップグレードしたインスタンスでは、それを持っていたリポジトリに **ロール**、 **カテゴリ**、 **定数** が与えられます。
設定シード、リポジトリの `controller_repositories:` の項目、API では、 `use_for_config` が 3 つの非推奨の別名として警告付きで引き続き使えます。

---

## 双方向: git とアプリ

ある種類に使われるリポジトリは、両方向でアプリと同期されます。実際に動作するのは、引き続きアプリのデータベースです。

| 方向 | 動作 |
|---|---|
| git からアプリへ | リポジトリのプル、クローン、リセットのたびと、サーバーの起動時に、ファイルが読み込まれます。新しい名前はオブジェクトを作成し、変更された項目はそれを変更し、削除された項目はそれを削除します |
| アプリから git へ | アプリでの保存は、その項目のファイルに書き戻されます。変更したフィールドだけが書かれ、ファイルのコメント、ほかのキー、ほかの項目は残ります。新しいオブジェクトは、その種類のキーを持つ最初のファイルの末尾に追加され、なければルートの `<key>.yaml` ( `credentials.yaml` ) が作成されてそこに入ります。削除はその項目を取り除きます。いずれもリポジトリの **プッシュ** を待ちます |

有効でない項目はそれだけが拒否され、その場所と理由が示されます。その名前のオブジェクトは元のまま残ります。まだ存在しない
オブジェクトを指定する項目 (ランナーとその認証情報など) は待機し、その種類の次回のプルで再び読み込まれます。git での名前の変更は、
ファイルから 1 つの名前が消え、同じファイルに 1 つの新しい名前が現れ、ほかに変更がない場合に追従されます。

### 用途のオンとオフ

種類をオンまたはオフにしてリポジトリを保存すると、先にどうするかを確認し、その変更で何が起きるかを示します。

| 変更 | 確認 | 動作 |
|---|---|---|
| オン | **認証情報 をオンにする**: `platform を 認証情報 に使用しますか？` | リポジトリがプルされ、項目が読み込まれます。両方にある名前では git が優先されます。アプリのほかのオブジェクトはシークレットを除いてリポジトリに書き込まれ、 **プッシュ** を待ちます |
| オフ | **認証情報 をオフにする**: `platform を 認証情報 に使用するのをやめますか？` | リポジトリがもう一度プルされたあと、オブジェクトのリンクが解除されます。オブジェクトはそのままアプリに残り、git のファイルもそのまま残ります |
| 複数 | **用途を変更**: `platform の用途を変更しますか？` | 種類ごとのセクションを持つ 1 つの確認で、 **用途を保存** で確定します |

確認には、アプリに残るものも一覧表示されます: 設定シードのオブジェクト、RTE が自分で登録したランナー、承認待ちのものです。
そのあと、種類ごとに何が取り込まれたかがメッセージで示されます。例:
`認証情報：2 件をファイルから読み込み、3 件をリポジトリに書き込み（Push 待ち）、1 件を git で置き換え、0 件をこのアプリに残しました。`

### プルの出力の内容

リポジトリの **前回のプルの出力を表示** には、git 自体の出力のあとに種類ごとに 1 行が表示されます。

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

リポジトリで管理されているオブジェクトのページには **リポジトリ: platform** (そのリポジトリの名前) が表示され、ツールチップに項目のファイルが示されます。
保存するとそのファイルに書き込まれ、リポジトリの **プッシュ** で git に送られます。

---

## シークレット

git が平文のシークレットを保持することはありません。項目のシークレットのフィールドは、環境から解決される `${ENV}` 参照だけです。

パスワード、トークン、クライアントシークレット、鍵は、 [設定シード](../seed/) と同じく `${SEED_RTE_TOKEN}` のように書きます。
平文のシークレットを持つ項目や、設定されていない変数を指定する項目は拒否され、プルの出力に名前が示されます。サーバー自体の変数
( `DB_*`、 `ACCESS_TOKEN_*`、 `ENCRYPTION_*`、 `ADMIN_*` …) を指定する項目も同様です。項目で省略したシークレットはアプリの
データベースにあるものが保持され、アプリは自分のオブジェクトをシークレットなしで git に書き込みます。

項目が `${ENV}` 参照で指定しているオブジェクトのシークレットをアプリで入力すると、拒否されます。変数を変更するか、
git の項目を変更してください。

---

## デザイナーとこれらのファイル

デザイナーは用途の種類が所有するファイルには触れません。そのため、フォームの編集で設定が変わることはありません。

デザイナーは、リポジトリが保持する種類のキーを持つファイルや、そのようなファイルが指定する画像を、一覧表示、読み取り、書き込み、
削除のいずれも行いません。また、内容が種類のキーを持つことになるファイルの書き込みを拒否し、フォームの読み込みでもそのようなファイルをフォームとして読み取りません。

---

## すべての種類とその例

各種類の項目は設定シードの形式なので、シードの項目とリポジトリの項目は相互に置き換えられます。

以下のファイル名は例です。名前もフォルダーも任意です。

### カテゴリ、定数、ロール

カテゴリとロールは一覧、定数は 1 つのマップで、それぞれ独自のキーの下に置きます。

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

各ロールは個別に検証されます。有効でないロールはそれだけが拒否され、ほかのロールは使われます。ロールは複数のファイルに分けることができ、
ファイルの順に使われます。 [ロール](../config/roles.html) を参照してください。

### スケジュール

スケジュールは `controller_schedules:` の一覧です。各項目は実行するフォームを指定し、 `cron`、 `rrule`、 `one_time_run` の
いずれか 1 つだけでタイミングを決めます。

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

ユーザーが計画した「後で実行」のジョブはアプリに残ります。タイミングと入力については [スケジュール](../jobs/schedules.html) を参照してください。

### 全般

**全般** の設定は 1 つのマップで、環境変数名を小文字にしたキーで指定します。

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

全般のページで変更できる変数だけが取り込まれます。大文字のキーや、実際の環境で設定されている変数は拒否されます。
名前が `_PASSWORD`、 `_SECRET`、 `_TOKEN` で終わる変数は `${ENV}` 参照だけです。

### 既定値、ロゴ、アイコン、名前、リンク

外観のページはそれぞれ 1 つのマップで、そのページが保存する内容を持ちます。

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

ロゴとアイコンはリポジトリ内の画像で、それを指定するファイルからの相対パスで指定します。設定シードが宣言しているフィールドは
シードのものが使われます。

### ラベルとお知らせ

ラベルとお知らせは項目の一覧で、各項目は名前で識別されます。

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

終了日時がすでに過ぎたお知らせはインポートされず、プルの出力の `Not imported` 行に示されます。

### 免責事項

免責事項はバージョンの一覧で、各バージョンは `version` で識別され、有効にできるのは最大 1 つです。

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

git で変更されたテキストはそのバージョンを修正します。 `ask_again: true` は、それに同意した全員に再度同意を求めます。誰が何に同意したかが git に入ることはありません。

### ユーザーとグループ

グループの項目にはそのローカルのメンバーを列挙します。ユーザーの項目にはグループについて何も書きません。

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

ローカルユーザーの `password` は `${ENV}` 参照だけで、読み込み時にハッシュ化されます。ディレクトリのユーザー ( `ldap`、 `entraid`、
`oidc` ) は `description` と `blocked` だけを指定します。組み込みの admin が git から読み込まれたり git に書き込まれたりすることはありません。

### LDAP と SSO

LDAP ディレクトリと SSO プロバイダーは一覧で、各項目はサインインに使う認証情報を指定します。

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

`main` という名前の項目はメインのディレクトリで、名前の変更も削除もできません。 `position` は検索の順序を保ちます。

### リポジトリ

リポジトリは、設定シードの `repositories:` の項目の形式で、ほかのリポジトリを保持できます。

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

それらを保持するリポジトリ自体が自分のファイルに入ることはなく、項目で `use_for_repositories` を設定することはできません。
`uri` に含まれるユーザーやトークンは拒否されるので、代わりに認証情報を指定してください。削除された項目はそのリポジトリを削除します
(まだプッシュしていない変更がある場合を除きます)。

### 認証情報、シークレットストア、データベース

最初に認証情報が読み込まれ、次にそれを指定するものすべてが読み込まれます。

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

まだ何かが使っている認証情報の項目を削除すると拒否され、プルの出力にそのことが示されます。

### ランナー

ランナーはランナーの種類の認証情報を指定し、それがない間は待機します。

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

RTE が自分で登録したランナーや、承認待ちのランナーはアプリに残ります。

### SSH

アプリの SSH 鍵と信頼するホストは 1 つのマップで、リポジトリの直後、それらがクローンされる前に読み込まれます。

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` は `${ENV}` 参照だけで、git に書き込まれることはありません。省略すると、アプリは自分の鍵を保持します。
`known_hosts` はサーバーごとに 1 行の known_hosts 行を持ち、空の一覧にするとすべて消去されます。

### 通知と Syslog

通知チャネルと Syslog サーバーは項目の一覧です。

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### チャットアシスタントと MCP

チャットアシスタントと MCP の設定は、それぞれ 1 つのマップです。

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` と MCP のキーは、環境変数名を小文字にしたものです。実際の環境で設定されている変数が書き込まれることはなく、
それを指定するマップは拒否されます。 `api_key` は `${ENV}` 参照だけか、省略します。

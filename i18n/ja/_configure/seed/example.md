---
layout: default
title: 例
parent: 構成シード
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# 例
{: .no_toc }

セクションごとに説明する、完全なシードファイル
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ファイル

次のシードファイルは、非推奨の `awx` 以外のすべてのセクションを宣言しています。シークレットは `${SEED_AWX_TOKEN}` のような
環境変数から取得し、セクションには 7.8.0 の名前を使っています（ [名前が変わったセクション](./#renamed-sections) を参照）。

```yaml
version: 1

runners:
  items:
    - name: rte01
      type: rte                  # rte, awx, semaphore, rundeck or jenkins
      rte_mode: inbound          # an RTE's RTE_MODE: outbound, inbound or database (deprecated, the default)
      credential: rte01          # a credential of the credentials section, of the runner's type
      is_default: true           # playbook forms that name no runner run here
    - name: tower
      type: awx
      credential: tower
      is_default: true           # one default per type
      enabled: true              # false: no job goes to it; left as it is when not declared

secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login    # a vault credential of the credentials section: the store's address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault     # how the secret store vault logs in, and where
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}   # the Vault token
    - name: rte01
      credential_type: rte       # an RTE's token, and its address unless it is outbound
      url: http://rte01.example.com:8000
      password: ${SEED_RTE_TOKEN}   # the RTE_TOKEN of that RTE
    - name: tower
      credential_type: awx       # also aap, ascender, semaphore, rundeck, jenkins
      url: https://tower.example.com
      password: ${SEED_AWX_TOKEN}
    - name: production-db
      user: svc_forms
      password: ${SEED_DB_PW}
      host: db.example.com
      port: 3306
      db_type: mysql
      credential_type: database
    - name: ontap-rest
      credential_type: userpass   # a user and password for a REST API, the default
      user: svc_forms
      password: ${SEED_ONTAP_PW}
    - name: smtp-login
      credential_type: smtp      # a mail server and its login: host is required
      host: smtp.example.com
      port: 587
      secure: false              # true: Use TLS to the mail server
      user: svc_forms            # leave user and password out for a relay
      password: ${SEED_SMTP_PW}
    - name: m365-mail
      credential_type: entraid   # an app registration, to send through Microsoft 365 (from 7.6.0)
      tenant_id: ${SEED_M365_TENANT}
      user: ${SEED_M365_CLIENT_ID}    # the client ID
      password: ${SEED_M365_SECRET}   # the client secret ; or client_cert and client_key

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

sso:                             # oauth2 before 7.8.0
  items:
    - name: corp
      provider: entraid          # entraid (Microsoft Entra ID, azuread before 7.8.0) or oidc
      tenant_id: ${SEED_ENTRA_TENANT}
      client_id: ${SEED_ENTRA_CLIENT_ID}
      client_secret: ${SEED_ENTRA_SECRET}   # or credential: an entraid credential
      enable: true

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_roles: true        # since 7.8.0, with use_for_categories and use_for_constants
      use_for_categories: true   # instead of use_for_config
      use_for_constants: true
      rebase_on_start: true

syslog:                          # syslog_servers before 7.8.0
  items:
    - name: siem
      host: siem.example.com
      port: 6514
      protocol: tls4             # udp4 (default), udp6, tcp4, tcp6, tls4, tls6, unix, unix-connect
      type: "5424"               # BSD (default) or 5424
      receives: audit            # log, audit or both (default)
      enabled: true
    - name: syslog
      host: syslog.example.com
      level: notice              # the lowest level of the server log it gets (info by default)
      receives: log

notifications:                   # notification_channels before 7.8.0
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: relay
      type: mail                 # no credential (from 7.6.0): its own server, sent without a login
      server: relay.example.com
      port: 25
      secure: false
      from_address: ansibleforms@example.com
    - name: m365
      type: mail
      credential: m365-mail      # an entraid credential: mail through Microsoft 365
      send_through: graph        # graph (the default) or smtp
      from_address: noreply@example.com
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap is a single-row section, so EVERY field must be declared : see "Single-row
# sections are all or nothing" on Managed objects. Empty is a perfectly good value.
ldap:
  server: ldap.example.com
  port: 389
  ignore_certs: false
  enable_tls: false
  cert: ""
  ca_bundle: ""
  bind_user_dn: cn=bind,dc=example,dc=com
  bind_user_pw: ${SEED_LDAP_PW}
  search_base: dc=example,dc=com
  username_attribute: uid
  groups_attribute: memberOf
  enable: true
  groups_search_base: ""
  group_class: ""
  group_member_attribute: ""
  group_member_user_attribute: ""
  mail_attribute: mail
  groupfilter: ""            # optional

settings:
  url: https://forms.example.com   # the only key it needs from 7.6.0

chat_assistant:              # the chat assistant's model provider ; chat before 7.8.0
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}   # or "" with credential: an api credential (since 7.8.0)
  base_url: ""               # empty for the provider default ; azure and custom need one
  model: claude-opus-5-5
  max_turns: 20
  max_tool_rounds: 6
  timeout_seconds: 60
  allow_job_status: true
  # optional - for a proxy or a vendor with its own ways
  auth_type: ""              # "" (provider default) | bearer | api-key | x-api-key | none
  api_version: ""            # e.g. 2024-10-21 for Azure OpenAI
  request_user: ""           # sent as user, e.g. for a proxy that requires one
  ignore_certs: false        # true skips the certificate check (a self-signed proxy) - insecure
  extra_headers:             # a mapping of extra request headers
    X-Org: ops

# since 7.8.0 : made or changed at each apply, never deleted
groups:
  items:
    - name: operators
      description: Run the day-to-day forms
      users:                 # its members : usernames of local users
        - alice

users:
  items:
    - username: alice        # a local user (type: local, the default)
      email: alice@example.com
      password: ${SEED_ALICE_PW}
    - username: jdoe
      type: ldap             # ldap, entraid or oidc : only description and blocked
      blocked: true
      description: Left on 2026-10-31

# since 7.8.0 : each declared field read only on its Settings page
defaults:
  default_theme: dark        # system, light or dark
  default_language: fr
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_forms_view: tiles

logo:
  logo: images/logo.png      # relative to the seed file ; "" restores the bundled one

icon:
  icon: images/icon.svg

name:
  app_name: ACME Automation

links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true

mcp:                         # environment variable names in lower case
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false

# since 7.8.0 : made or changed at each apply, never read only
announcements:
  items:
    - name: Maintenance
      message: The app is down on Sunday from 8 to 10.
      level: warning           # info, warning or danger
      start_at: 2030-01-06T08:00:00Z
      end_at: 2030-01-06T10:00:00Z

disclaimer:
  items:
    - version: 2
      title: Terms of use
      text: Use this tool for your own team's systems only.
      checkbox_label: I agree
      enabled: true          # the version in force, one at most
      ask_again: true        # a changed text asks everyone who accepted it again

ssh:
  private_key: ${SEED_SSH_PRIVATE_KEY}
  known_hosts:               # one known_hosts line each ; [] clears them
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

以下のセクションでは、コメントだけでは足りない部分を説明します。

---

## ランナー

7.3.0 からは、ランナーはその種類の認証情報でサインインし、その認証情報が `url` にサーバーのアドレスを保持します。独自の `token` 、
または `username` と `password` を持つランナーも引き続き動作します。シードは警告をログに記録し、それらをランナーにちなんだ名前のそうした認証情報に変換します。
`api` または `userpass` の認証情報を指定しているランナーも、警告付きで引き続き動作します。その認証情報にはランナーの種類を与えてください。
どちらも 7.3.0 から非推奨で、8.0.0 で削除されます。 `rte_mode` のない RTE ランナーは、非推奨のデータベースモードです（
[モード](../rte/modes.html) を参照）。 `enabled: false` のランナーは、その種類の既定であってもジョブを受け取りません（
[既定と有効](../runners/list.html#default-and-enabled) を参照）。 `enabled` がない場合、シードはそのままにします。

ランナーの項目は、 `name` 、 `type` 、 `description` 、 `credential` 、 `is_default` 、 `enabled` のほかに、次のキーを受け付けます。

| キー | 設定するもの |
|---|---|
| `rte_mode` | RTE のモード： `outbound` 、 `inbound` 、 `database` （非推奨、既定） |
| `rte_max_jobs` | ソケットモードの RTE の **最大同時ジョブ数** 。 `0` から `10000` （ `0` ：無制限） |
| `rte_cache_mb` | その **ジョブファイルのキャッシュ** （MB）。 `0` から `1048576` （ `0` では何も保持しません） |
| `rte_files` | その **ジョブファイル** ： `transfer` または `local` |
| `rte_drain_seconds` | その **停止時の待機時間** （秒）。 `0` から `86400` |
| `flavour` | AAP または Ascender である `awx` ランナー： `aap` または `ascender` 。AWX ではなし |
| `project` | Semaphore ランナーのプロジェクト ID、Rundeck ランナーのプロジェクト名、Jenkins ランナーのフォルダー |
| `uri` 、 `ignore_certs` 、 `ca_bundle` | 7.3.0 より前の、ランナー自身のアドレスと TLS。その認証情報が `url` を持たない間だけ使われます |

四つの `rte_*` 設定は、ランナーのページの RTE タブにある設定です（ [RTE の設定](../runners/runner-page.html#an-rtes-settings) を参照）。
RTE で設定された同じ変数より優先され、データベースモードの RTE はこれらを無視します。範囲外の値はシードの
検証で失敗します。

データベースモードの RTE は、シードが適用される前に自分自身を登録することがあります。シードで宣言した RTE ランナーの `uri` が、そうした RTE が
登録したアドレスである場合、そのランナーはその行を **引き継ぎます** 。宣言した名前とフィールドを取り込み、RTE が応答しなくなっても
ワーカーはそれを削除しなくなります。同じ RTE に対して 2 つ目のランナーが作られることはありません。

7.5.0 からは、 `databases` セクションでフォームが照会する [データベース](../databases.html) を宣言します。項目には `name` 、種類がデータベースの
`credential` 、任意の `description` があります。シードは認証情報の後にそれを適用し、ほかの種類の認証情報は拒否します。

---

## SSO

`sso` セクション（7.8.0 より前は `oauth2` ）は [SSO プロバイダー](../authentication/) を、そのクライアントとともに宣言します。クライアントは
`client_id` と `client_secret` 、または認証情報セクションの `credential` です。

7.8.0 からは、Microsoft Entra ID はリポジトリでの書き方と同じく `provider: entraid` です。以前の名前である `provider: azuread` も引き続き
同じように読み込まれますが、7.8.0 から非推奨で、8 で削除され、サーバーログに警告が出ます。もう一つのプロバイダーは `oidc` で、
各種類で `enable: true` にできるプロバイダーは一つだけです。

---

## リポジトリ

リポジトリの項目には、 `name` 、 `uri` 、任意の `branch` （省略するとリモートの既定のブランチ）、 `credential` 、 `rebase_on_start` 、
プルのスケジュール `cron` 、そして用途の種類ごとに一つの `use_for_*` フラグがあります。フラグは、アプリがそこから読み込むものです。

7.8.0 からは、すべての用途の種類にフラグがあります。 `use_for_forms` 、 `use_for_playbooks` 、 `use_for_workflows` 、 `use_for_inventories` は
以前からあり、ほかは新しいものです。

| カテゴリ | フラグ |
|---|---|
| デザイナー | `use_for_categories` 、 `use_for_constants` 、 `use_for_forms` 、 `use_for_inventories` 、 `use_for_playbooks` 、 `use_for_workflows` |
| ジョブ | `use_for_schedules` |
| システム | `use_for_general` |
| 外観 | `use_for_defaults` 、 `use_for_logo` 、 `use_for_icon` 、 `use_for_name` 、 `use_for_links` 、 `use_for_labels` 、 `use_for_announcements` |
| アクセス | `use_for_disclaimer` 、 `use_for_users` 、 `use_for_groups` 、 `use_for_roles` 、 `use_for_ldap` 、 `use_for_sso` |
| 接続 | `use_for_repositories` 、 `use_for_credentials` 、 `use_for_secret_stores` 、 `use_for_databases` 、 `use_for_runners` 、 `use_for_ssh` 、 `use_for_notifications` 、 `use_for_chat_assistant` 、 `use_for_mcp` 、 `use_for_syslog` |

フォーム、ワークフロー、インベントリは複数のリポジトリが保持できます。それ以外の種類はそれぞれ最大一つのリポジトリが保持します。
それらのフラグの同じものを二つのリポジトリに設定したシードは拒否されます。各種類が git に何を保持するかは
[Git リポジトリ](../repositories/) で説明しています。

`use_for_config` は 7.8.0 から非推奨で、8 で削除されます。引き続き `use_for_roles` 、 `use_for_categories` 、 `use_for_constants` として
読み込まれ、サーバーログに警告が出ます。複数のリポジトリがこれを宣言した場合、その三つをすでに保持しているリポジトリ（なければファイル内の
最初のもの）がそれらを保ち、ほかのリポジトリは何も得ません。代わりに三つのフラグを宣言してください。

---

## メール

メールは `notifications:` のメールチャネルを通じて送られます（ [メール](../notification-channels/mail.html) を参照）。 `settings:` の下の
キー `mail_server` 、 `mail_port` 、 `mail_secure` 、 `mail_username` 、 `mail_password` 、 `mail_from` は 7.6.0 から非推奨で、8.0.0 で
削除されます。これらは引き続き動作し、警告を一度ログに記録します。シードはこれらを `default` という名前のメールチャネルにし、 `mail_username` が
ある場合は smtp 認証情報 `mail-login` を、リレーの場合は独自のサーバーを持たせます。代わりに、上のファイルの `mail` と `smtp-login` のように、
メールチャネルとその認証情報を自分で宣言してください。

---

## チャットアシスタント

`chat_assistant` セクション（7.8.0 より前は `chat` ）は、チャットアシスタントのモデルプロバイダーを設定します。 `provider` は次のいずれかです。

* `anthropic`
* `openai`
* `azure`
* `gemini`
* `grok`
* `mistral`
* `deepseek`
* `groq`
* `openrouter`
* `ollama`
* `custom` ：OpenAI 互換のその他のエンドポイント

`ldap` と同じく、 `chat_assistant` セクションは単一行なので、任意のものを除くすべてのフィールドが必須です。省略した任意の
フィールドは変更されません。

7.8.0 からは `credential` も受け付けます。これは認証情報セクションの api 認証情報で、そのパスワードが `api_key` の代わりのキーになります
（その場合は `api_key: ""` と宣言します）。チャットアシスタントには `ENABLE_CHAT=1` も必要ですが、シードはこれを設定しません。
[チャットアシスタント](../chat/) のページを参照してください。

---

## ユーザーとグループ

7.8.0 からは、 `groups` と `users` セクションでローカルのグループとユーザーを宣言します。これらは適用のたびに作成または変更され、削除されることはなく、
アプリで編集可能なままです（ [ユーザーとグループ](../users-and-groups.html) を参照）。

グループの項目には、 `name` 、任意の `description` 、そして `users` にそのメンバー（ローカルユーザーのユーザー名）があります。ユーザーの項目は
そのグループについて何も述べないので、グループはそのメンバーを一か所で一覧にします。シードはグループをユーザーより先に適用します。

ユーザーの項目には `username` と `type` があります。

| 種類 | その項目が与えるもの |
|---|---|
| `local` （既定） | `email` 、 `description` 、 `blocked` 、そしてシードのすべてのシークレットと同じく `${ENV}` 参照としての `password` |
| `ldap` 、 `entraid` 、 `oidc` | `description` と `blocked` のみ。ほかはサインインのたびにそのディレクトリから取得されます |

新しいローカルユーザーは、それを一覧にしているシードのグループに入るので、少なくとも一つのグループを与えてください。 `password` がない場合、
管理者がアプリでパスワードを設定するまでサインインできません。ディレクトリのユーザーは初めてサインインする前に作成されるので、
退職者はサインインを試みる前にブロックされます。組み込みの管理者は宣言しません。それは戻るための手段として残ります。

---

## 外観、MCP、SSH

7.8.0 からは、シードはアプリに一つだけある設定も宣言します。各セクションは、git リポジトリでの同じページの形式です。

| セクション | ページ | キー |
|---|---|---|
| `defaults` | **設定 > 外観 > 既定値** | `default_theme` 、 `default_theme_color` 、 `default_forms_view` 、 `default_timezone` 、 `default_date_format` 、 `default_language` |
| `logo` 、 `icon` | **ロゴ** と **アイコン** | `logo` または `icon` ：シードファイルからの相対パスで示す画像ファイル。 `""` で同梱のものに戻ります |
| `name` | **名前** | `app_name` |
| `links` | **リンク** | `header_links` （それぞれ `id` 、 `label` 、 `url` 、 `icon` 、 `newTab` 、 `parent` ）と `show_designer` |
| `mcp` | **設定 > 接続 > MCP** | `enable_mcp` 、 `mcp_read_only` 、 `mcp_chat_forms_only` |
| `ssh` | **設定 > 接続 > SSH** | `private_key` と `known_hosts` |
| `announcements` | **設定 > 外観 > お知らせ** | `name` 、 `message` 、 `level` 、 `enabled` 、 `start_at` 、 `end_at` を持つ項目 |
| `disclaimer` | **設定 > アクセス > 免責事項** | `version` 、 `title` 、 `text` 、 `checkbox_label` 、 `enabled` 、 `ask_again` を持つ項目 |

どのキーも任意です。セクションが省いたものは、アプリにあるとおりのまま残ります。ロゴとアイコンはアップロードと同じように確認されます
（画像であること、ロゴは最大 900 KB、アイコンは最大 256 KB）。

`mcp` のキーは、 [MCP サーバー](../mcp/) の環境変数を小文字にしたものです。実際の環境で設定されている変数は環境の値を保ちます。
サーバーログにそう記録され、起動は続行されます。

`ssh` は、 `${ENV}` 参照としてのアプリの秘密鍵（公開鍵はそこから作られます）と、アプリが信頼するサーバーを保持します。サーバーは
known_hosts の行（ホスト、鍵の種類、鍵）で一つずつ示します。起動のたびに適用されます。

`end_at` が過ぎたお知らせは除外されます。免責事項の `version` は数値で、 `enabled` にできるのは最大一つです。テキストを変更すると
そのバージョンの修正になり、 `ask_again: true` では、それに同意した全員にもう一度確認します。

シードがこれらをどこまで所有するかは [管理対象オブジェクト](managed-objects.html#settings-the-seed-declares) にあります。

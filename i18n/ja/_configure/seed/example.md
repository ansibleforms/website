---
layout: default
title: 例
parent: 構成シード
nav_order: 1
translated_from: cf1f2b0122ca5cd2dfcc411e4ed20fb683b079bf
---

# 例
{: .no_toc }

セクションごとに説明する、完全なシードファイル
{: .fs-6 .fw-300 }

---

次のシードファイルは、 `oauth2` と非推奨の `awx` 以外のすべてのセクションを宣言しています。シークレットは `${SEED_AWX_TOKEN}` のような
環境変数から取得します。

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

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true

syslog_servers:
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

notification_channels:
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap and settings are single-row sections, so EVERY field must be declared - see
# "Single-row sections are all or nothing" below. Empty is a perfectly good value.
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
  groupfilter: ""            # optional, see below

settings:
  mail_server: smtp.example.com
  mail_port: 587
  mail_secure: false
  mail_username: ""
  mail_password: ""
  mail_from: ansibleforms@example.com
  url: https://forms.example.com

chat:                        # the chat assistant's model provider (6.5)
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}
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
```

`provider` は次のいずれかです。

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

`ldap` と同じく、 `chat` セクションは単一行なので、任意のものを除くすべてのフィールドが必須です。省略した任意の
フィールドは変更されません。

チャットアシスタントには `ENABLE_CHAT=1` も必要です。 [チャットアシスタント](../chat) のページを参照してください。

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

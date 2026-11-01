---
layout: default
title: 環境変数
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# 環境変数
{: .no_toc }

環境変数で AnsibleForms を設定します
{: .fs-6 .fw-300 }

---

AnsibleForms をデプロイする管理者向けです。サーバーが読み込む環境変数を、トピックごとにまとめて説明します。

AnsibleForms は、Docker Compose、Kubernetes、ソースのいずれで実行する場合も、環境変数で調整します。

---

## 値の取得元

サーバーは各変数を、次の取得元のうちその変数を設定している最初のものから読み込みます。そのため、リストの上にある値が常に優先されます。

1. **プロセスの環境** ：docker-compose の `environment:` と `env_file:` （プロジェクトの `.env` はこの方法で渡されます）、
   Kubernetes の `env` と `envFrom` 、または `node` を起動するシェル。
2. **`persistent/.env`** 。設定ページが書き込むファイルです（docker-compose プロジェクトでは `data/.env` 、
   `MANAGED_ENV_PATH` で別のパスにもできます）。本番環境でも起動のたびに読み込まれ、すでに設定されている変数を上書きすることはありません。
3. **`server/.env.<NODE_ENV>`** 。たとえば `.env.development` です。 `NODE_ENV` が `production` でない場合（または
   `FORCE_DOTENV=1` の場合）にだけ読み込まれます。実際には、開発モードで [ソースから](../installation/from-source.html) 実行する場合です。
4. **組み込みの既定値** 。各グループの表に記載されています。

**設定 > 全般** の設定ページには現在有効な値が表示され、変更は `persistent/.env` に保存されます。多くの変数は
保存するとすぐに反映されます。ほかの変数は保存されますが再起動が必要で、保存後にページに一覧が表示されます。プロセスの環境で
設定された変数はそこでは変更できず、ページには *環境で設定されているため、ここでは変更できません。* と表示されます。
`ENCRYPTION_SECRET` や `ACCESS_TOKEN_SECRET` など、ページから決して変更できない変数もいくつかあります。

`AF_ROLE` 、 `RTE_MODE` 、 `APP_URL` 、 `RTE_MAX_JOBS` など、RTE が読み込む変数は設定ページにはまったくありません。
アプリはそれらを使わないので、RTE を実行する環境で設定してください。アプリ自身が読み込む `RTE_*` 変数、
`RTE_QUEUE_MINUTES` と `RTE_FILES_MAX_MB` は例外で、ページに残っています。RTE の四つの変数 `RTE_MAX_JOBS` 、
`RTE_CACHE_MB` 、 `RTE_FILES` 、 `RTE_DRAIN_SECONDS` は、代わりに RTE ごとにランナーのページで設定することもでき、そこでの値が
変数より優先されます（ [RTE の設定](../runners/runner-page.html#an-rtes-settings) を参照）。

[`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` の場合、ページには値が表示されるだけで、保存は拒否されます。
[編集と監査](../seed/environment-and-audit.html) で説明しているように、環境をマニフェストで宣言している場合に使います。

[構成シード](../seed/) は環境変数を設定しません。データベースに保存されるオブジェクトを宣言し、その中の
`${ENV_VAR}` 参照は実行中のサーバーの環境から解決されます。

環境からだけ読み込まれ、表には載っていない変数もいくつかあります。上で説明した `MANAGED_ENV_PATH` と `FORCE_DOTENV` 、
そしてシステムのプロキシ変数 `HTTPS_PROXY` と `NO_PROXY` （小文字も読み込まれます）です。アウトバウンドの RTE は `HTTPS_PROXY` を
経由してアプリに接続し、インバウンドの RTE は登録の呼び出しをそれ経由で送ります。ただし、アプリのホストが `NO_PROXY` （ホスト名、
`.domain` サフィックス、またはすべてのホストを表す `*` ）に含まれる場合は除きます。

<span class="af-badge af-badge-secret">シークレット</span> の付いた変数は、パスワード、トークン、キーを保持します。Kubernetes の Secret や
コミットしない `.env` ファイルなどに置き、バージョン管理に含めないでください。

---

## このセクションの内容

変数はトピックごとにグループ化され、グループごとに一つのページがあります。

| ページ | 内容 |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## その他の変数

次の変数は、まだどのグループにも割り当てられていません。

{{ other }}
{% endif %}

---
layout: default
title: リバースプロキシ
parent: 本番環境での運用
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# リバースプロキシ
{: .no_toc }

Nginx、Traefik、Apache の背後で、ルートまたはサブパスの下に AnsibleForms を公開します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 使う場面

AnsibleForms はインターフェース、REST API、Swagger を一つのポートで提供します。その前にリバースプロキシを置くと、次のことができます。

* 既存のツール（ACME、社内 CA）で管理する証明書を使って、ポート 443 で提供する
* AnsibleForms をサブパスの下で公開して、一つのホスト名をほかのアプリケーションと共有する
* アプリケーションのポートとデータベースを公開ネットワークから切り離す

プロキシは必須ではありません。アプリケーション自身で HTTPS を提供することもできます。 [HTTPS](../security/https.html) を参照してください。

---

## 重要な設定

プロキシの背後での AnsibleForms の動作に影響する設定は、ごくわずかです。

| 設定 | プロキシの背後では |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | プロキシの転送先ポート。既定は `8000` です。docker-compose プロジェクトでは `443` に設定されています。 |
| [`HTTPS`](../customization/server.html#env_HTTPS) | プロキシが TLS を終端し、プライベートネットワーク経由でアプリケーションに接続する場合は `0` 、その区間も暗号化する場合は `1` 。 |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | サブパス。たとえば `/ansibleforms` 。アプリケーションが独自のホスト名を持つ場合は `/` のままにします。 |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | `X-Forwarded-For` でクライアントのアドレスを報告できるプロキシ。通常は `1` 。 [クライアントのアドレス](#client-addresses) を参照。 |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | アプリケーションが受け付ける最大の JSON リクエスト。既定は 50 MB です。プロキシは少なくともこれを許可する必要があります。 |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | フォームのアップロードフィールドが受け付ける最大のファイル。既定は 10 GB です。プロキシもこれを許可する必要があり、そうでないとそこでアップロードが失敗します。 |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | アプリケーションが受け付けるリクエストヘッダー全体の最大サイズ。既定は 16 KB で、7.1.0 からです。 [リクエストヘッダーのサイズ](#request-header-size) を参照。 |
| **公開ルート URL** | **システム > 全般** の **サーバー** タブにあります。ユーザーがアクセスするアドレスで、サブパスも含みます。通知メール、チャネルのメッセージ、承認依頼のリンクの組み立てに使われます。 |

Entra ID または OIDC では、公開アドレスをリダイレクト URI として登録します。 `BASE_URL` のサブパスを設定している場合はそれも含めます。

---

## サブパスの下での提供

`BASE_URL` はアプリケーション全体をサブパスの下にマウントします。プロキシはパスを **変更せずに** 転送する必要があります。
`BASE_URL=/ansibleforms` の場合：

* インターフェース、 `/api/v2/...` 、Swagger インターフェースはすべて `/ansibleforms/` の下で提供されます
* インターフェースの `<base href>` は起動時に書き換えられるので、アセットと API の呼び出しはサブパスの下で解決されます
* `/` または `/ansibleforms` （末尾のスラッシュなし）へのリクエストは `/ansibleforms/` にリダイレクトされます

プレフィックスは残してください。アプリケーションはそれを前提としているので、Traefik では `StripPrefix` を使わず、Nginx では `proxy_pass` に URI を付けません。

**ステータス** ページには、現在有効なベース URL が表示されます。

---

## タイムアウト、アップロード、ライブ出力

ジョブページとジョブのカウンターは、ブラウザーごとに開いたままになる一本の長寿命の server-sent events ストリーム
[`/api/v2/events`](../api/events.html) で変更を知ります。このストリームはプロキシのバッファリングを無効にするヘッダー
（ `X-Accel-Buffering: no` ）と、15 秒ごとのキープアライブ行を送るので、一般的な 60 秒の読み取りタイムアウトでも開いたままになります。
それでもプロキシが閉じた場合は、ブラウザーが自動的に再接続します。起動直後にフォームの下に表示される出力は、
代わりに 2 秒ごとに読み込まれます。ジョブの起動はジョブが作成されるとすぐに戻るので、長いプレイブックでも
リクエストが開いたままになることはありません。

時間がかかることがあるリクエストは次のとおりです。

* **バックアップ** ページからの **バックアップとリストア** 。ダンプまたはリストアのコマンドが終わるまで、最大
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) （既定は 3600）待ちます
* ファイルフィールドを通じた **大きなアップロード** 。ファイル全体を一つのリクエストでストリーミングします
* [チャットアシスタント](../chat/) が有効な場合の **チャットメッセージ** 。モデルプロバイダーの応答を待ちます

プロキシは 60 秒でタイムアウトし、リクエストの本文に上限を設けることがよくあります（Nginx の既定は 1 MB）。下の例のように、
AnsibleForms のルートでは両方を引き上げてください。

---

## ランナーの WebSocket

7.3.0 からは、 [アウトバウンドのランナー](../rte/modes.html#outbound) がアプリケーションに接続し、
`<BASE_URL>/api/v2/rte/socket` で WebSocket を一つ開いたままにします。プロキシはアップグレードを通す必要があり、そうでないとランナーは接続できず、接続を試し続けます。

| プロキシ | WebSocket に必要なもの |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` と、Nginx が既定では転送しない `Upgrade` ヘッダーと `Connection` ヘッダー |
| Traefik | 何も不要。WebSocket はそのまま通過します |
| Apache | `ProxyPass` 行の `upgrade=websocket` （2.4.47 以降）、それより前は `mod_proxy_wstunnel` |

両端が 20 秒ごとに ping を送るので、一般的な 60 秒の読み取りタイムアウトでもアイドル状態のソケットは開いたままになります。

---

## リクエストヘッダーのサイズ

すべてのリクエストは、Cookie やプロキシが追加するヘッダーと並んで、 `Authorization` ヘッダーにサインイントークンを含みます。
プロキシとアプリケーションの両方がリクエストヘッダーのサイズに上限を設けており、上限を超えるリクエストは
AnsibleForms に届く前に拒否されるため、サーバーログには何も残りません。既定値は次のとおりです。

| コンポーネント | 上限 | 既定値 | 拒否時の応答 |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) 、すべてのヘッダーの合計 | 16384 バイト | 431 |
| Nginx | `large_client_header_buffers` 、ヘッダーフィールドごと | `4 8k` ：フィールドごとに 8 KB | 400 |
| Traefik | エントリポイントの `http.maxHeaderBytes` 、すべてのヘッダーの合計 | 1 MB | 431 |
| HAProxy | `global` セクションの `tune.bufsize` 、ヘッダーブロック全体から `tune.maxrewrite` の予約分（1024 バイト）を引いたもの | 16384 バイト：ヘッダーは 15360 バイト | 400 |
| Apache | `LimitRequestFieldSize` 、ヘッダーフィールドごと | 8190 バイト | 400 |

7.0.3 までは、サインイントークンにシングルサインオンユーザーのすべてのグループが含まれており、これらの上限を超えることがありました。
[シングルサインオン後にフォームとジョブが空になる](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431) を参照してください。
7.1.0 からはトークンは小さいままなので、既定値で十分です。同じドメインのほかのアプリケーションの Cookie や、前段のシングルサインオンゲートウェイなど、
ほかの理由でヘッダーが大きくなる場合は、上限をまとめて引き上げてください。

* AnsibleForms： `MAX_HTTP_HEADER_SIZE=65536` 、7.1.0 より前は `NODE_OPTIONS=--max-http-header-size=65536` 。どちらも
  起動時に読み込まれるので、変更後はアプリケーションを再起動してください
* Nginx： `http` または `server` ブロックに `large_client_header_buffers 4 32k;`
* HAProxy： `global` セクションに `tune.bufsize 65536` 。すべてのストリームがそのサイズのバッファーを持つため、HAProxy は
  グローバルの `maxconn` を同じ比率で下げるよう勧めています。HTTP/2 には少なくとも既定の 16384 が必要です
* Apache：サーバー設定またはバーチャルホストに `LimitRequestFieldSize 32768`

---

## クライアントのアドレス

プロキシの背後では、すべての接続がプロキシから来ます。 [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) がないと、
監査証跡にはすべての操作でプロキシのアドレスが記録され、アドレスごとの
[サインインの制限](../security/hardening.html#sign-in-limits-and-passwords) ではすべてのクライアントが一つのアドレスとして数えられます。
`TRUST_PROXY` は、 `X-Forwarded-For` でクライアントを報告するとき、アプリケーションがどのプロキシを信頼してよいかを指定します。

| 値 | クライアントのアドレス |
|-------|----------------|
| `0` （既定） | 接続のアドレス。 `X-Forwarded-For` は無視されます。空、 `false` 、 `off` 、 `no` も同じ意味です。 |
| 数値。例： `1` | アプリケーションの前にあるその数のプロキシを信頼します。リバースプロキシが一つなら `1` 、イングレスの前にロードバランサーがあれば `2` 。 |
| リスト。例： `10.0.0.5,172.16.0.0/12` | これらのアドレスと CIDR 範囲にあるプロキシを信頼します。プリセット `loopback` 、 `linklocal` 、 `uniquelocal` も使えます。 |
| `true` | すべてのホップを信頼します。 `X-Forwarded-For` の左端のアドレスが使われます。 |

アプリケーションは `X-Forwarded-For` を右から辿り、信頼するプロキシを飛ばして、それ以外の最初のアドレスを
採用します。プロキシの正確な数、またはそのアドレスを使ってください。

* `X-Forwarded-For` は、どのクライアントでも送れるただのリクエストヘッダーです。数値が大きすぎる場合や `true` の場合、
  監査証跡に記録されるアドレスをクライアントが選べてしまいます。 `true` が安全なのは、アプリケーションにプロキシ経由でしか
  到達できない場合だけで、これを設定するとサーバーは起動時に `[SECURITY]` の警告をログに記録します。
* プロキシは、接続を受けたアドレスを追加する必要があります。下の例ではそうしています
  （Nginx では `$proxy_add_x_forwarded_for` 。Traefik と Apache の `mod_proxy` は既定で追加します）。
* 無効な値は設定ページで拒否されます。環境で設定した場合は起動時にエラーとしてログに記録され、
  どのプロキシも信頼されません。設定ページで保存した変更は再起動なしで反映されます。

---

## 例

各例では、AnsibleForms を `https://forms.example.com/ansibleforms/` で公開し、TLS はプロキシで終端し、
アプリケーションは `HTTPS=0` 、 `PORT=8000` 、 `BASE_URL=/ansibleforms` 、 `TRUST_PROXY=1` で実行します。

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` には URI を付けないので、Nginx はパスを受け取ったまま、プレフィックスも含めて転送します。 `map` ブロックは
`http` コンテキストに置き（ `conf.d/` の下のファイルはそこにインクルードされます）、ランナーの WebSocket アップグレードを通します。

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

サブパスを使わない場合は、 `location /` を使い、 `BASE_URL` は未設定のままにします。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

docker-compose プロジェクトの `app` サービスに付けるラベルで、Traefik は同じ Docker ネットワーク上にあります。サービスは
独自のポートを公開せず、Traefik はネットワーク経由でそこに到達します。

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

`StripPrefix` ミドルウェアは意図的に使っていません。Traefik は `X-Forwarded-*` ヘッダーを自分で設定し、本文のサイズに上限を
設けませんが、バックアップやアップロードがエントリポイントの読み取りタイムアウトより長くかかる場合は、その `respondingTimeouts` を確認してください。
サブパスを使わない場合は、ルールの `Host(...)` の部分だけを残します。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

`mod_proxy` 、 `mod_proxy_http` 、 `mod_headers` 、 `mod_ssl` と、ランナーの `upgrade=websocket` のために Apache 2.4.47 以降が必要です。
`ProxyPass` の両側にプレフィックスを付けます。

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

サブパスを使わない場合は、 `/` を `http://10.0.0.20:8000/` にプロキシし、 `BASE_URL` は未設定のままにします。

</div>
</div>

プロキシとアプリケーションの間の区間も暗号化するには、アプリケーションを `HTTPS=1` で実行し、プロキシを
`https://` に向け、プロキシが信頼する証明書をアプリケーションに与えます。 [HTTPS](../security/https.html) を参照してください。

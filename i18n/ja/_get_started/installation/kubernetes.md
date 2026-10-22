---
layout: default
title: Kubernetes
parent: インストール
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Helm チャートで AnsibleForms とその MySQL データベースをインストールします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Helm チャートは、AnsibleForms を MySQL とプレイブックを実行する RTE と一緒にデプロイします（ [values リファレンス](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md) を参照）。
[インストーラー](installer.html) もいくつかの質問に答えるだけでこのチャートをインストールでき、インストーラーがインストールしていないリリースもアップグレードできます。同じ
チャートで、別の場所で動いている AnsibleForms 用のランナーだけをインストールすることもできます（ [Kubernetes 上のランナー](#a-runner-on-kubernetes) を参照）。

---

## 前提条件

始める前に、次のものが必要です。

* **Kubernetes クラスター** : `kubectl` から接続できるように設定されていること
* **Helm 3** : チャートのインストールとアップグレードに使います
* **ストレージ** : 動的プロビジョニング用の StorageClass、または事前に作成した PersistentVolume
* **Ingress コントローラー** : Ingress で AnsibleForms を公開する場合のみ

---

## 1. チャートの values を取得する

チャートリポジトリまたは OCI レジストリから、チャートの既定の values を自分用のファイルに取得します。

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">チャートリポジトリ</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">OCI レジストリ</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

リポジトリを追加する必要はありません。チャートは GitHub Container Registry から取得されます。

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. ストレージを設定する

AnsibleForms と MySQL はどちらも永続ボリュームにデータを保存します。それぞれの StorageClass とサイズを設定します。

```yaml
storages:
  server:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
  mysql:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
```

`className` を空にすると、クラスターの既定の StorageClass を使います。アクセスモードの既定は `ReadWriteMany` ですが、多くのストレージ
クラスはこれに対応していません。レプリカが 1 つなら `ReadWriteOnce` で問題ありません。事前に作成した PersistentVolume を使う場合は、チャートの
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) を参照してください。

---

## 3. 認証情報を設定する

AnsibleForms には、管理者アカウント、データベースのパスワード、そして AnsibleForms に保存される認証情報を暗号化する鍵
`ENCRYPTION_SECRET` が必要です。後でこの鍵を変更するには、1 回の起動の間だけ [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
に古い鍵を設定します。保存されているすべてのシークレットが新しい鍵で再暗号化されます。これらは次の 3 つの方法のいずれかで指定します。

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">values ファイルで指定</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">チャートが生成</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">既存の Secret</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

`my_values.yaml` に設定します。チャートはこれを `<release>-secrets` という名前の Secret に保存します。

```yaml
applications:
  server:
    env:
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: a-strong-password
      ENCRYPTION_SECRET: a-random-string-of-32-characters
  mysql:
    password: a-strong-database-password
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="generate" markdown="1" hidden>

指定しなかったものを、初回インストール時にチャートに生成させます。以降のアップグレードでも同じ値が
保持されます。

```bash
--set secrets.generate=true
```

これは、クラスターにアクセスせずにチャートをレンダリングする Argo CD や Flux では機能しません。生成された Secret は
`helm uninstall` の後も残ります。 `ENCRYPTION_SECRET` は復元できないため、バックアップしておいてください。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

External Secrets、Sealed Secrets、SOPS などで自分が管理する Secret をチャートに指定します。この場合、チャートは
Secret を作成しません。

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

Secret には `DB_USER` 、 `DB_PASSWORD` 、 `ENCRYPTION_SECRET` 、 `ADMIN_USERNAME` 、 `ADMIN_PASSWORD` が含まれている必要があります。

</div>
</div>

---

## 4. RTE イメージを選ぶ

AnsibleForms 7 は自分ではプレイブックを実行せず、RTE（ランタイム環境）が実行します。チャートは RTE をサーバー Pod の
2 つ目のコンテナーとして同じボリューム上で動かし、既定のランナー `rte` として登録するため、プレイブックのフォームは設定なしで動作します。7.3.0 以降、
アプリは `127.0.0.1` の RTE に接続して 1 本の WebSocket を開いたままにします（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）。RTE は
データベースの設定も暗号化キーも受け取りません。チャートの設定シードは、トークンとそのアドレスを持つ RTE の認証情報と、それでサインインする
モード inbound のランナーを宣言しています。

既定のイメージ `ghcr.io/ansibleforms/ansibleforms-rte-full` には、ansible とそのコレクション、そして 6.5 のイメージにあった Python ライブラリが含まれています。
これより多く、または少なくしたい場合は、3 つの RTE レイヤー（ `ansibleforms-rte-base` 、 `-rte-core` 、 `-rte-full` 。
[RTE イメージ](../rte/images.html) を参照）のいずれかをベースに独自のイメージをビルドし、チャートでそれを指定します。

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

アプリと RTE の間のトークンと、セッションに署名する鍵は、初回インストール時に
`<release>-keys` Secret に生成され、アップグレードのたびに保持されます。独自の設定シードを使う場合は、その認証情報とランナーをシードに追加してください。方法はインストール後に Helm が表示するノートに記載されています
（チャートの [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) を参照）。

---

## 5. チャートをインストールする

自分の values を使って、専用の Namespace にチャートをインストールします。

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

OCI レジストリを使う場合は、チャートとして `oci://ghcr.io/ansibleforms/charts/ansibleforms` を指定します。無人で実行するものでは、
`--version` でチャートのバージョンを固定し、新しいリリースが勝手にインストールされないようにしてください。

---

## 6. インストールを確認する

チャートには、Web サーバーとデータベース接続の両方を確認するテストが含まれています。

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

AnsibleForms が応答し、データベースが接続を受け付ければ、テストは `OK` で終わります。

---

## 7. AnsibleForms を開く

AnsibleForms へのアクセス方法は、サーバーの公開方法によって異なります。

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">ポートフォワード</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

既定の `ClusterIP` サービスで Ingress がない場合、クラスターの外には何も公開されません。ローカルのポートをフォワードして
確認します。

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

その後 `http://127.0.0.1:8080/` を開きます。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

`services.server.type: LoadBalancer` を設定し（必要に応じて `services.server.loadbalancer.ip` に固定アドレスを指定）、
サービスにアドレスが割り当てられるまで待ちます。

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Ingress を有効にし、Ingress コントローラーにルーティングされるホスト名を設定します。

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

Ingress の背後での TLS については、サーバーで HTTPS を使う場合に必要なバックエンドの設定も含め、チャートの [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) で
説明しています。

</div>
</div>

---

## 8. サインインする

管理者ユーザー（既定は `admin` ）としてサインインします。Secret からパスワードを読み取るには次のようにします。

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

`secrets.existingSecret` を使っている場合は、代わりに自分の Secret から読み取ります。

---

## Kubernetes 上のランナー

`runner.enabled` を指定すると、チャートは RTE だけをインストールします。別の Namespace、別のクラスター、または VM など、別の場所にインストールされた
AnsibleForms 用のランナーです。ランナーはアプリに接続して 1 本の WebSocket を開いたままにするため（ `RTE_MODE=outbound` 、 [モード](../rte/modes.html) を参照）、
データベースも暗号化キーもインバウンドのポートも必要ありません。アプリ、MySQL、Service、Ingress はレンダリングされません。

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| 値 | 内容 |
|---|---|
| `runner.enabled` | ランナーだけをインストールします。アプリ、MySQL、Service、Ingress はありません |
| `runner.appUrl` | 利用者が開くアプリのアドレス。 `BASE_URL` があればそれも含めます。必須です |
| `runner.name` | 参加するときのランナー名（ `RTE_NAME` ）。空の場合はリリース名 |
| `runner.joinToken` | アプリで作成した [参加トークン](../runners/registration.html#join-tokens) 。初回起動時に読み取られ、ランナーをすぐに承認します |
| `runner.appTlsVerify` | `false` にするとアプリの自己署名証明書を受け入れます（ `APP_TLS_VERIFY=0` ）。信頼できる 1 つのネットワーク内でのみ使ってください |

参加トークンがない場合、ランナーは参加を求め、管理者が **接続 > ランナー** で承認するまで待ちます。承認されると、
`<release>-keys` Secret に保存された自分の `RTE_TOKEN` でサインインします。この Secret はリリースと一緒に保持してください。
ランナーの役割と Kubernetes を選んだ場合、 [インストーラー](installer.html#kubernetes) もこのランナーモードをインストールします。

---

## 次のステップ

設定のその他の部分は、チャートの [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) で説明しています。

* **独自のデータベース** : `mysql.enabled: false` を設定し、AnsibleForms を既存の MySQL サーバーに向けます
* **ConfigMap からのフォーム** : `config.yaml` とフォームファイルを ConfigMap で提供します
* **Ingress の背後での HTTPS** 、リソース、ノードの配置、プライベートレジストリ
* **RTE** : そのトークン、独自の RTE イメージ、または RTE をまったく使わない構成

新しいリリースに移行するには、 [Kubernetes でのアップグレード](../upgrading/kubernetes.html) を参照してください。

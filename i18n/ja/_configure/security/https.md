---
layout: default
title: HTTPS
parent: セキュリティ
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

アプリケーション自身から HTTPS を提供し、サンプル証明書を置き換えます
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## TLS を終端する場所

TLS は三つの場所のいずれかで終端でき、このページの設定が関係するのは最初のものだけです。

* **AnsibleForms で** 、 `HTTPS=1` ：下のファイルを使って [`PORT`](../customization/server.html#env_PORT) で HTTPS を提供します。docker-compose が 443 で行っている方法です。
* **リバースプロキシで** 、その背後では `HTTPS=0` ： [リバースプロキシ](../production/reverse-proxy.html) を参照してください。
* **Kubernetes のイングレスで** ： [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) の Ingress タブと、チャートの README を参照してください。

最初のものをほかの二つと組み合わせて、プロキシとアプリケーションの間の区間も暗号化できます。

---

## 設定

アプリケーションの HTTPS は三つの変数で制御します。

| 変数 | 既定値 | 意味 |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` で HTTPS を、 `0` でプレーンな HTTP を提供します |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | 秘密鍵（PEM） |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | サーバー証明書（PEM） |

コンテナーイメージでは永続フォルダーは `/app/dist/persistent` なので、既定のファイルは
`/app/dist/persistent/certificates/key.pem` と `cert.pem` です。docker-compose プロジェクトでは、ホストの `data/certificates/` です。

---

## サンプル証明書

`HTTPS=1` で、起動時にいずれかのファイルがない場合、AnsibleForms は `httpsKey or httpsCert not found, copying from
templates` とログに記録し、イメージからサンプルのキーと証明書を設定されたパスにコピーします。そのコピーに失敗すると、
アプリケーションは停止します。

この証明書は `CN=ansibleforms` の自己署名証明書で、 **すべてのインストールで同じ** です。その秘密鍵は公開されているイメージに
含まれています。最初に試すには問題ありませんが、ブラウザーは警告を表示し、誰でもそれで保護された通信を復号できます。
インスタンスが実際の認証情報を保持する前に置き換えてください。

---

## 証明書の置き換え

ユーザーが入力するホスト名向けに、自社の CA または ACME クライアントが発行した PEM 形式の証明書を使います。
証明書ファイルにはフルチェーンを含めることができます。サーバー証明書を先に、その後に中間証明書を置きます。

1. ファイルを永続フォルダー、またはアプリケーションが読めるどこかにコピーします。

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. ほかの場所に置いた場合は、 `HTTPS_KEY` と `HTTPS_CERT` に **コンテナー内の** パスを設定します。

3. アプリケーションを再起動します。両方のファイルは起動時に読み込まれます。

手早く独自の自己署名証明書を作るには（テスト用のインスタンス、またはプロキシの背後の区間向け）、 `openssl` を使います。

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## 再起動なしの更新

設定ページで `HTTPS_KEY` または `HTTPS_CERT` を変更すると、実行中のサーバーでキーと証明書が再読み込みされます。
新しい接続には新しい証明書が使われ、開いている接続は古いもののままです。新しいファイルを読めないか、有効な組み合わせに
ならない場合は、現在の証明書がそのまま使われ、警告がログに記録されます。

これが機能するのは、設定ページが環境に書き込める（ [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
が `1` ）場合で、かつ変数が実際の環境で設定されていない場合だけです。更新で同じパスのファイルを置き換える場合は、
アプリケーションを再起動してください。

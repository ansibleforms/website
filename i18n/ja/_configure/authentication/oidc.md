---
layout: default
title: OIDC
parent: 認証
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Keycloak などの OpenID Connect プロバイダーによるシングルサインオン。ロールはグループクレームから決まります
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 仕組み

OIDC プロバイダーが有効な場合、ログインページの **サインイン** の下に OpenID のボタンが表示されます。ログインは次のように進みます。

1. ボタンを押すとブラウザーは `/api/v2/auth/oidc` に送られ、そこからプロバイダーにリダイレクトされます（PKCE を使った
   認可コードフロー）。
2. ユーザーがプロバイダーでサインインすると、 **リダイレクト URL** に戻されます。
3. サーバーはコードをトークンと交換し、ID トークンのクレームを読み込みます。
4. ユーザー名は `preferred_username` クレームで、 `groups` クレームの値のうち **グループフィルター** を
   通過したものがそれぞれ `oidc/<value>` グループになります。

AnsibleForms はスコープ `openid profile email` を要求します。スコープは設定できません。AnsibleForms からサインアウトすると、
プロバイダーが公開している場合は、ブラウザーがプロバイダーのセッション終了エンドポイントにも送られます。

{: .note }
> OIDC は Keycloak でテストされています。ほかのプロバイダーも、以下の要件を満たせば動作します。

---

## プロバイダーの要件

プロバイダーは OpenID Connect ディスカバリーと、AnsibleForms 用のコンフィデンシャルクライアントを提供する必要があります。

- **ディスカバリー** ：AnsibleForms は `<issuer>/.well-known/openid-configuration` を読み込むので、発行者には
  AnsibleForms サーバーから HTTPS で到達できる必要があります。
- 認可コードフロー、クライアント ID、クライアントシークレットを持つ **コンフィデンシャルクライアント** 。
- **リダイレクト URI** `https://af.example.com/api/v2/auth/oidc/callback` 。つまり、ユーザーが AnsibleForms にアクセスするアドレスの
  後に `/api/v2/auth/oidc/callback` を付けたものです。 [`BASE_URL`](../customization/server.html#env_BASE_URL) が
  `/forms` の場合は `https://af.example.com/forms/api/v2/auth/oidc/callback` になります。
- グループ名のリストを保持する **ID トークンの `groups` クレーム** 。これがないと、ユーザーには OIDC グループが付与されません。
- ユーザー名になる **`preferred_username` クレーム** 。

---

## Keycloak の例

この例では、 `https://keycloak.example.com` 上のレルム `example` を使います。発行者は
`https://keycloak.example.com/realms/example` になります。そのレルムで次の操作を行います。

1. **Clients** で、クライアント ID `ansibleforms` の OpenID Connect クライアントを作成します。 **Client authentication** をオンにし、
   **Standard flow** はそのままにして、 **Valid redirect URIs** を `https://af.example.com/api/v2/auth/oidc/callback` に設定します。
2. クライアントの **Credentials** タブで **Client secret** をコピーします。
3. **Client scopes** タブで `ansibleforms-dedicated` を開き、 **By configuration > Group Membership** のマッパーを追加します。
   **Token Claim Name** は `groups` 、 **Full group path** はオフ、 **Add to ID token** はオンにします。

**Full group path** がオンの場合、クレームには `/af-admins` のようなパスが入るので、ロールでは `oidc//af-admins` と指定する必要があります。

---

## プロバイダーの追加

**アクセス > SSO** でプロバイダーを追加します。ウィザードが 4 つのステップでフィールドを尋ね、 **種類** のステップでは **Open ID** を選びます。

| ステップ | フィールド | 意味 |
|---|---|---|
| 詳細 | 名前、説明 | プロバイダーの一意の名前と、任意の説明 |
| 種類 | プロバイダー | **Open ID** 。作成時に設定し、変更できません |
| 認証情報 | 認証情報 | [接続 > 認証情報](../credentials.html) の **Open ID** 認証情報。下記を参照 |
| グループ | グループフィルター | 正規表現。 `groups` クレームの値のうち一致するものだけが残ります。空の場合はすべてのグループが残ります |

認証情報はクライアントを保持するので、追加、変更できるのは管理者だけです。

| フィールド | 意味 |
|---|---|
| 発行者 (Issuer) | 必須。発行者の URL。例： `https://keycloak.example.com/realms/example` |
| クライアント ID | プロバイダーでのクライアント ID。例： `ansibleforms` |
| クライアントシークレット | クライアントシークレット。暗号化して保存するか、 [シークレットストア](../secret-stores/) から読み込みます |
| リダイレクト URI | 登録したとおりの値。例： `https://af.example.com/api/v2/auth/oidc/callback` 。空の場合はアプリの URL とコールバックのパス |

7.2.0 までは、発行者、クライアント ID、シークレット、リダイレクト URL はプロバイダーのフィールドでした。7.3.0 へのアップグレードでこれらは
`<provider>-sso` という名前の認証情報に移されます。 [認証情報内のアドレス](../credentials/types.html#addresses-in-credentials) を参照してください。
新しいプロバイダーには必ず認証情報を選んでください。サーバーは 7.3.0 より前の、独自のクライアント ID とシークレットを持つプロバイダーも
引き続き受け付け、認証情報が選ばれるまではそれらでサインインします。

同時に有効にできる OIDC プロバイダーは一つだけで、OpenID のボタンはそのプロバイダーでサインインします。別のプロバイダーの行メニューの **有効にする** 、
またはその **有効** スイッチを使うと、同じ種類のほかのプロバイダーはオフになります。リストの **有効** 列で、どれが使われているかがわかります。
プロバイダーはログインページをスキップすることもできます。 [シングルサインオンの切り替え](./#switching-single-sign-on) を参照してください。

プロバイダーを保存するとすぐに反映されます。発行者に到達できない場合、サーバーは
`Failed to initialize OIDC strategy` をログに記録し、プロバイダーを再度保存するかサーバーを再起動するまで OIDC ログインは失敗します。

---

## ロールへの対応付け

config.yaml では、OIDC のグループは `oidc/<group>` 、ユーザーは `oidc/<preferred_username>` と書きます。

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

値は大文字と小文字も含めて完全一致で照合されます。ロールオプションについては [ロール](../config/roles.html) を参照してください。

---

## 制限事項

OIDC のユーザーはプロバイダーでサインインするため、ローカルアカウントや LDAP アカウントとはいくつかの点で動作が異なります。

- AnsibleForms にはパスワードがないので、そこでパスワードを変更することはできません。7.2.0 からは [API トークン](../profile/api-token.html)
  がセッションから作成されます。
- `groups` クレームは短く保ってください。プロバイダー側で専用のクライアントスコープやグループ構成を使うなどして AnsibleForms に関係のあるグループだけを送るか、
  **グループフィルター** で絞り込みます。7.1.0 からは AnsibleForms のサインイン
  トークンにグループが含まれなくなりました。それ以前は、100 以上のグループに所属するユーザーはフォームを表示できないことがありました。
  [シングルサインオン後にフォームとジョブが空になる](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431) を参照してください。

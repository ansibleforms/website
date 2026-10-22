---
layout: default
title: Entra ID
parent: 認証
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Microsoft Entra ID（Azure AD）によるシングルサインオン。ロールはユーザーの Entra ID グループから決まります
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 仕組み

Entra ID プロバイダーが有効な場合、ログインページの **サインイン** の下に Entra ID のボタンが表示されます。ログインは次のように進みます。

1. ボタンを押すとブラウザーは `/api/v2/auth/entraid` に送られ、そこから Microsoft にリダイレクトされます。
2. ユーザーが Microsoft でサインインすると、認可コードとともに **リダイレクト URL** に戻されます。サーバーは
   そのコードを Microsoft と交換して、ID トークンと Microsoft Graph 用のアクセストークンを受け取ります。
3. サーバーは Microsoft Graph（ `/v1.0/me/transitiveMemberOf` ）からユーザーのグループを読み込むので、入れ子のグループも含まれます。
4. グループは表示名に対して **グループフィルター** で絞り込まれ、残った各グループは
   `azuread/<object id>` と `azuread/<display name>` の 2 通りで保存されます。

ユーザー名はトークンの `upn` クレームで、たとえば `jdoe@example.com` です。トークンに `upn` がない場合は `preferred_username` クレームが
使われます。職場のアカウントではどちらも同じ値です。

---

## アプリケーションの登録

AnsibleForms には、Entra 管理センターの **App registrations > New registration** で作成するアプリの登録が必要です。

1. 名前を付け、サポートされるアカウントの種類として **Accounts in this organizational directory only** を選び、種類 **Web** の
   リダイレクト URI `https://af.example.com/api/v2/auth/entraid/callback` を追加します。
2. **Certificates & secrets** でクライアントシークレットを作成し、その値をコピーします。値は一度しか表示されません。
3. **API permissions** で、Microsoft Graph の **委任された** アクセス許可 `User.Read` と `GroupMember.Read.All` を追加し、
   管理者の同意を与えます。
4. **Overview** ページで、 **Application (client) ID** と **Directory (tenant) ID** を控えます。

リダイレクト URI は、ユーザーが AnsibleForms にアクセスするアドレスの後に `/api/v2/auth/entraid/callback` を付けたものです。
[`BASE_URL`](../customization/server.html#env_BASE_URL) が `/forms` の場合は
`https://af.example.com/forms/api/v2/auth/entraid/callback` になります。プロバイダーの認証情報の **リダイレクト URI** と
完全に一致する必要があります。

7.2.0 までのパスは `/api/v2/auth/azureadoauth2/callback` でした。7.3.0 からもこのパスは使えるので、既存の登録を変更する必要は
ありません。 **リダイレクト URI** が空の認証情報は新しいパスを使うので、その場合は新しいパスを登録に追加してください。

AnsibleForms はグループを Graph から読み込み、トークンのグループクレームは使わないので、登録でグループクレームを
設定する必要はありません。

---

## プロバイダーの追加

**アクセス > SSO** でプロバイダーを追加します。ウィザードが 4 つのステップでフィールドを尋ね、 **種類** のステップでは **Microsoft Entra ID** を選びます。

| ステップ | フィールド | 意味 |
|---|---|---|
| 詳細 | 名前、説明 | プロバイダーの一意の名前と、任意の説明 |
| 種類 | プロバイダー | **Microsoft Entra ID** 。作成時に設定し、変更できません |
| 認証情報 | 認証情報 | [接続 > 認証情報](../credentials.html) の **Microsoft Entra ID** 認証情報。下記を参照 |
| グループ | グループフィルター | 正規表現。表示名が一致するグループだけが残ります。空の場合はすべてのグループが残ります |

認証情報はアプリの登録を保持するので、追加、変更できるのは管理者だけです。

| フィールド | 意味 |
|---|---|
| テナント ID | 必須。Directory (tenant) ID（GUID）、またはテナントのドメインの一つ。そのテナントのユーザーだけがサインインできます |
| クライアント ID | Application (client) ID |
| クライアントシークレット | クライアントシークレットの値。暗号化して保存するか、 [シークレットストア](../secret-stores/) から読み込みます |
| リダイレクト URI | 登録したとおりの値。例： `https://af.example.com/api/v2/auth/entraid/callback` 。空の場合はアプリの URL とコールバックのパス |

テナント ID が空の認証情報は、保存時に拒否されます。マルチテナントのエンドポイント `common` 、 `organizations` 、
`consumers` は、その認証情報を指定したプロバイダーの保存時に拒否されます。任意の Microsoft テナントのユーザーがサインインできてしまうためです。サインイン時には、
トークンが設定されたテナントから来ていることもサーバーが確認します。以前にテナント ID なしで保存されたプロバイダーでは
誰もサインインできません。テナント ID を入力するまで、サーバーは
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)` をログに記録します。

7.2.0 までは、テナント、クライアント ID、シークレット、リダイレクト URL はプロバイダーのフィールドでした。7.3.0 へのアップグレードでこれらは
`<provider>-sso` という名前の認証情報に移されます。 [認証情報内のアドレス](../credentials/types.html#addresses-in-credentials) を参照してください。
新しいプロバイダーには必ず認証情報を選んでください。サーバーは 7.3.0 より前の、独自のクライアント ID とシークレットを持つプロバイダーも
引き続き受け付け、認証情報が選ばれるまではそれらでサインインします。

同時に有効にできる Entra ID プロバイダーは一つだけで、Entra ID のボタンはそのプロバイダーでサインインします。別のプロバイダーの行メニューの **有効にする** 、
またはその **有効** スイッチを使うと、同じ種類のほかのプロバイダーはオフになります。リストの **有効** 列で、どれが使われているかがわかります。プロバイダーは
ログインページをスキップすることもできます。 [シングルサインオンの切り替え](./#switching-single-sign-on) を参照してください。保存するとすぐに、再起動なしで反映されます。

---

## ロールへの対応付け

config.yaml では、Entra ID のグループは `entraid/<object id>` または `entraid/<display name>` 、ユーザーは `entraid/<upn>` と書きます。
オブジェクト ID はテナント内で一意なので、より安全な選択です。表示名のほうが読みやすくはあります。

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

7.2.0 までのプレフィックスは `azuread/` でした。7.3.0 からもロールでは同じメンバーに一致しますが、8.0 で削除されます。
ロールエディターは `entraid/` と書き込みます。 `entraid/` を受け付けるのはロールだけです。ユーザーのグループは `azuread/<object id>` と
`azuread/<display name>` として保存され、プロフィールページと extravar `ansibleforms_user` にもそのように表示されます。 `^AF-` のような **グループフィルター** を使うと、ロールで使うグループだけが残ります。 [ロール](../config/roles.html) を参照してください。7.1.0 からは
サインイントークンにグループが含まれなくなったため、グループが増えてもトークンのサイズは大きくなりません。それでも、多くのグループに
所属するユーザーにはフィルターが重要です。サインインのたびにロールと照合されるグループが少なくなり、ユーザーの
[ディレクトリレコード](../users-and-groups/directory.html) には意味のあるグループだけが表示されます。7.1.0 より前は、
100 以上のグループに所属するユーザーがフォームを表示するにはフィルターが必要です。
[シングルサインオン後にフォームとジョブが空になる](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431) を参照してください。

---

## Microsoft Graph のエンドポイント

サーバーは既定で `https://login.microsoftonline.com` でユーザーをサインインさせ、 `https://graph.microsoft.com` の Microsoft Graph を呼び出します。

| 変数 | 変わるもの |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | サインインの機関。 `https://login.microsoftonline.us` のような国内クラウド向け |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | グループを読み込む Graph のエンドポイント。例： `https://graph.microsoft.us` |

どちらも末尾にスラッシュのないベース URI を指定し、7.3.0 で追加されました。これらが設定されていない場合は `AZURE_AUTHORITY_URI` と `AZURE_GRAPH_URI` が
ログに警告を出しつつ引き続き読み込まれますが、8.0 で削除されます。サーバーは Graph に到達できる必要があります。グループを読み込めないとログインは失敗します。

---

## 制限事項

Entra ID のユーザーは Microsoft でサインインするため、ローカルアカウントや LDAP アカウントとはいくつかの点で動作が異なります。

- AnsibleForms にはパスワードがないので、そこでパスワードを変更することはできません。 [API トークン](../profile/api-token.html) はセッションから作成されます。
- Entra ID では表示名は一意ではありません。同じ名前の二つのグループは同じロールに対応付けられます。そのグループだけに一致させるには、
  ロールでオブジェクト ID を使って `entraid/<object id>` と指定してください。

---
layout: default
title: 仕組み
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# 仕組み
{: .no_toc }

インストールの構成要素、起動時に起きること、データの保存場所
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## アーキテクチャ

AnsibleForms は、MySQL データベースを使って Web アプリケーションと REST API を提供する Node.js サーバーです。フォームは
YAML ファイルから読み取り、自分では何も実行しません。各ジョブを [ランナー](runners.html) に渡します。プレイブックは RTE
（ランタイム環境）コンテナーのいずれかに渡されて `ansible-playbook` が実行され、テンプレートやジョブは AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins に渡されます。

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">AnsibleForms のアーキテクチャ</title>
<desc id="afd-desc">ブラウザーと任意の MCP クライアントが AnsibleForms サーバーと通信します。サーバーはデータを MySQL と永続フォルダーに保存し、データソース、シークレットストア、Git リポジトリ、ログインプロバイダー、通知チャネル、Syslog サーバー、任意のモデルプロバイダーに接続します。そのランナーは、各プレイブックを 1 つ以上ある RTE コンテナーのいずれかにそれぞれ 1 本の WebSocket で渡し、RTE は ansible-playbook を実行して出力をサーバーに返します。各テンプレートやジョブは AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins に渡します。</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="99" text-anchor="middle">ブラウザー</text>
<text class="afd-s" x="105" y="118" text-anchor="middle">フォーム、デザイナー、ジョブ、チャット</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">MCP クライアント</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">任意</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">AnsibleForms サーバー</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Web アプリと REST API</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">フォームエンジン、式</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">ワークフロー、スケジュール</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">MCP サーバー（任意）</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">ランナー</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">各ジョブをそのランナーに渡す</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">データソース</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">データベース、REST API、ファイル</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">シークレットストア</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Git リポジトリ</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">フォーム、プレイブック、設定</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">ログインプロバイダー</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">通知チャネル</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">メール、Slack、Teams、Webhook</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Syslog サーバー</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">ログ、監査証跡</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">モデルプロバイダー</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">任意、チャットアシスタント</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">永続フォルダー</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">設定、フォーム、プレイブック</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="445" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="463" text-anchor="middle">ジョブ、ユーザー、認証情報</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">RTE コンテナー</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">ansible-playbook を実行</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">プレイブック、</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">テンプレート、ジョブ</text>
</svg>
</div>

図の各コンポーネントには、それぞれ次の役割があります。

| コンポーネント | 役割 |
|---|---|
| **ブラウザー** | Vue の Web アプリケーション。フォーム、 [デザイナー](gui/designer-and-git.html) 、ジョブ履歴、設定 |
| **AnsibleForms サーバー** | フォームを評価し、ジョブを記録し、ワークフローとスケジュールを実行し、各ジョブをそのランナーに渡して追跡し、 [REST API](api/) を提供します |
| **ランナー** | ジョブの実行場所で、 **接続 > ランナー** で追加します。フォームは `runner: <name>` で 1 つを指定するか、その種類の既定のランナーを使います（ [ランナー](runners.html) を参照） |
| **RTE コンテナー** | 1 つ以上のランタイム環境コンテナーで、 `AF_ROLE=rte` で起動した同じサーバーです。それぞれが [ansible フォーム](forms/ansible.html) のために、イメージの python ライブラリとコレクションを使って `ansible-playbook` を実行し、出力と最終的なステータスを 1 本の WebSocket でサーバーに返します。データベースの認証情報は持ちません（ [RTE の動作](rte/#how-the-rte-runs) を参照） |
| **AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins** | テンプレートとジョブ用のランナーです。 [AWX フォーム](forms/awx.html) はジョブテンプレートまたはワークフローテンプレートを起動し、 [Semaphore](forms/semaphore.html) 、 [Rundeck](forms/rundeck.html) 、 [Jenkins](forms/jenkins.html) のフォームはそれぞれのジョブを起動して、サーバーがその出力を追跡します |
| **MySQL / MariaDB** | ジョブとその出力、ユーザー、認証情報、接続を保持します。読み書きするのはサーバーだけです |
| **永続フォルダー** | `config.yaml` 、フォームファイル、プレイブック、ログ、バックアップを保持します |
| **データソース** | フィールドを埋めます。 [データベースのクエリ](formfields/enum.html) 、 [REST API](expressions/rest-apis.html) 、ファイル、 [その他の関数](expressions/remote.html) です |
| **シークレットストア** | 使用時に認証情報のユーザーとパスワードを提供します。 [シークレットストア](secret-stores/) を参照してください |
| **Git リポジトリ** | フォーム、プレイブック、 `config.yaml` をバージョン管理します |
| **ログインプロバイダー** | ローカルユーザーに加えて、 [LDAP、Entra ID、OIDC](authentication/) でユーザーをサインインさせます |
| **通知チャネル** | [通知](forms/notifications.html) と承認依頼を運びます。 [メール、Slack、Microsoft Teams、Telegram、Webhook](notification-channels.html) です |
| **Syslog サーバー** | ログと監査証跡を書き込まれるそばから受け取ります。 [Syslog](production/logs.html#syslog) を参照してください |
| **MCP クライアント、チャット** | 任意で、どちらも既定ではオフです。 [MCP サーバー](mcp/) と [チャットアシスタント](chat/) で、チャットアシスタントにはモデルプロバイダーが必要です |

既定では、1 つのコンテナーがサーバー、Web アプリ、バックグラウンド処理をまとめて実行し、その隣で 1 つの RTE が動きます。ロードバランサーの背後に複数のアプリノードを置く構成、
バックグラウンド処理を実行するワーカー、RTE の追加については、 [スケーリング](production/scaling.html) を参照してください。

### 使用している技術

サーバーと Web インターフェースは、次のコンポーネントで構築されています。

| 部分 | 技術 |
|---|---|
| **サーバー** | Node.js と Express |
| **データベース** | MySQL または MariaDB |
| **Web インターフェース** | Vue 3、Bootstrap 5、Font Awesome |

---

## フォームを起動すると何が起きるか

起動は、ブラウザーからでも [REST API](api/jobs.html) からでも、同じステップを通ります。

1. **読み込み** : サーバーはユーザーの [ロール](config/roles.html) が許可するフォームだけを送り、サーバー側の式を評価します
2. **送信** : ブラウザーはフィールドの値を extravars に変換し、 `POST /api/v2/job` に送ります
3. **チェック** : サーバーはユーザーのロールでフォームを読み込み直し、 [起動時の検証](launch-validation/) が有効なら値をチェックします
4. **記録** : ジョブがステータス `running` で保存され、その ID が `__jobid__` として extravars に追加されます
5. **承認** : [`approval`](forms/approval.html) ポイントを持つフォームは、承認者がジョブを受け入れるまで待ちます
6. **認証情報** : プレイブックの場合、アプリ（RTE ではありません）がフォームの認証情報をデータベースまたは [シークレットストア](secret-stores/) から読み取ります
7. **実行** : ジョブはそのランナー、つまりフォームが `runner:` で指定したもの、またはその種類の既定のランナーに渡されます。プレイブックの場合、アプリは
   その RTE 用に封をした認証情報とともに、RTE の WebSocket 経由でジョブを送り、RTE が `ansible-playbook` を実行します（ [RTE の動作](rte/#how-the-rte-runs) を参照）。
   テンプレートやジョブは AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins が実行します。 [ワークフロー](workflows/) はそのノードを、それぞれ
   専用のランナー上の個別のジョブとして実行します
8. **追跡** : サーバーは届いた出力をデータベースに保存します。プレイブックの場合は RTE がソケット経由で送り、それ以外は
   ほかのランナーから読み取ります。フォームのページは 2 秒ごとにジョブを読み直し、「ジョブ」ページはサーバーが
   変更を通知するたびにライブで追従します
9. **終了** : ジョブは最終的なステータスになり、フォームが求めていれば、その [`notifications`](forms/notifications.html) がメールと
   [通知チャネル](notification-channels.html) に送られます

---

## 保存場所

AnsibleForms は状態を 2 か所に保存します。MySQL データベースと永続フォルダーです。両方をバックアップしてください。

### データベース
{: .no_toc }

データベース `AnsibleForms` は初回起動時に作成され（ `ALLOW_SCHEMA_CREATION` が `0` の場合を除く）、次のものを保持します。

* ジョブ、その extravars と出力、スケジュール、保存済みジョブ
* ローカルユーザー、グループ、API トークン
* `ENCRYPTION_SECRET` で暗号化された認証情報と、シークレットストアの接続
* ランナー、通知チャネル（メールを含む）、Syslog サーバー、そして LDAP、SSO、リポジトリ、チャットアシスタントの設定
* 監査ログ

### 永続フォルダー
{: .no_toc }

イメージでは `/app/dist/persistent` 、ソースからの場合は `server/persistent` です。各パスには専用の [変数](customization/paths.html) があります。

| 既定のパス | 変数 | 内容 |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | カテゴリ、ロール、定数 |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | フォームファイル（ `.yaml` または `.yml` ）。必要ならサブフォルダーに分けられます |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | `ansible` フォームのプレイブックと、その作業ディレクトリ |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Git リポジトリのクローン |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | デザイナーが保存の前に作成するコピー |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | データベースのバックアップ |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | `file` フィールドでアップロードされたファイル |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` と `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | `HTTPS` が `1` の場合の証明書と鍵 |
| `.env` | | 設定ページから保存された環境変数（ `ALLOW_ENV_EDIT` が `0` の場合を除く） |

生成された SSH キーは [`HOME_PATH`](customization/paths.html#env_HOME_PATH) にあり、既定では永続フォルダーの外です。

---
layout: default
title: RTE
nav_order: 10
has_children: true
has_toc: false
permalink: /rte/
translated_from: 2c3f3f81ad8faaf18eac56f18782ef5f78111b04
---

# ランタイム環境（RTE）
{: .no_toc }

RTE とは何か、プレイブックをどのように実行するか、何に触れてよいか
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

管理者向けです。RTE を実行する前、サイズを決める前、別のネットワークに移す前に、RTE を理解しておいてください。

| ページ | 内容 |
|---|---|
| [イメージ](images.html) | 三つの RTE イメージと、プレイブックが使うコレクションを含む独自イメージのビルド |
| [モード](modes.html) | アウトバウンド、インバウンド、データベース：誰が接続を開くか、スプール、ジョブのファイル |
| [RTE の実行](run.html) | 各モードの設定と、それぞれの `docker run` の例 |
| [複数の RTE](several.html) | 容量、一つのアドレスの背後のレプリカ、RTE が停止または異常終了したときに起きること |
| [別のデータセンター](another-datacenter.html) | 手順書：何もないホストから最初のジョブまで、2 つ目のデータセンターに RTE を追加します |

---

## RTE とは

AnsibleForms 7 は、アプリのコンテナーではプレイブックを実行しません。 `ansible` フォームのジョブは、種類が `rte` の
[ランナー](../runners.html) 、つまりランタイム環境に渡されます。これは `AF_ROLE=rte` で起動した AnsibleForms サーバーで、python と ansible を
備え、Web インターフェースはありません。アプリとは一本の WebSocket で通信し、データベースの認証情報は持ちません
（ [`RTE_MODE`](../customization/server.html#env_RTE_MODE) が `outbound` または `inbound` 。 [モード](modes.html) を参照）。アプリがジョブを送り、
RTE が `ansible-playbook` を実行し、送り返された出力と最終ステータスをアプリが保存し、ブラウザーはそれを読み込みます。

アプリはジョブの認証情報を解決し、その RTE とそのジョブだけが開けるように封をして RTE に渡します。RTE は認証情報のテーブルも
シークレットストアも読まず、プレイブックは AnsibleForms 自身の環境変数（ `ENCRYPTION_SECRET` 、 `DB_*` 、 `RTE_TOKEN` など）を
引き継ぎません。そうした値は extravar または認証情報として渡してください。データベースを自分で読み書きしていた 7.0 から 7.2 の RTE は、
7.x では非推奨のデータベースモードとして引き続き動作します（ [データベースモード](#database-mode-deprecated) を参照）。

---

## RTE の動作

RTE は、アプリの隣または別のネットワークで自分で実行するコンテナーです。AnsibleForms が作成することはありません。ここでは、
どこで動作するか、アプリと何を共有するか、そしてフォームが起動されてからプレイブックのプロセスがなくなるまでに
その中で何が起きるかを順に説明します。

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">RTE がプレイブックを実行する仕組み</title>
<desc id="afr-desc">運用者が管理するコンテナーホストまたは Kubernetes クラスター上で、アプリのコンテナーと一つ以上の RTE コンテナーが、それぞれの間に一本の WebSocket を持ちます。ソケットはアプリ（インバウンド）または RTE（アウトバウンド）が開きます。データベースと通信するのはアプリだけです。1：ブラウザーがアプリでフォームを起動します。2：アプリはジョブをデータベースに保存し、ランナーを選び、そのランナー向けにジョブのシークレットを封印します。3：アプリがソケットでジョブを送ります。4：RTE がジョブを受け取り、ジョブのファイルをキャッシュまたはアプリから取得します。5：RTE が ansible-playbook を子プロセスとして、ジョブごとに一つ、RTE_MAX_JOBS まで起動します。6：プレイブックが管理対象のホストに接続します。7：RTE が出力、イベント、終了をスプールに書き込み、ソケットで送ります。アプリはそれらをデータベースに保存して確認応答します。8：ブラウザーはアプリを通じてジョブを追跡します。アプリのボリュームが RTE にマウントされるのは RTE_FILES=local の場合だけです。</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">コンテナーホストまたは Kubernetes クラスター</text>
<text class="afr-s" x="181" y="61">管理は利用者。アウトバウンドの RTE は別のネットワークでも可</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">ブラウザー</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">フォーム、ジョブページ</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">アプリのコンテナー</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">Web アプリ、API、ワーカー</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">ランナー</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">シークレットを封印</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">RTE ハブ</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">保存して確認応答</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE コンテナー</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">ジョブのファイル</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">ハッシュでキャッシュ</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">最大 RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">スプール</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">確認応答まで保持</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">一本の</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">管理対象のホスト</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">アプリのボリューム</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">プレイブック、インベントリ</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">RTE_FILES=local のみ</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">アプリ専用</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

図は、どちらの側が開いたかにかかわらず、RTE ごとに一つのソケットを示しています。インバウンドの RTE にはアプリが接続し、アウトバウンドの RTE はアプリに接続します（
[モード](modes.html) を参照）。開いた後は同じメッセージが双方向に流れ、データベースを読み書きするのはアプリだけです。

**誰が起動するか。** RTE は長時間動作するコンテナーで、ほかのコンテナーを実行しているものが起動します。ジョブを待ち、
ジョブの合間も動作し続けます。

| AnsibleForms の実行方法 | RTE を起動するもの |
|---|---|
| `docker run` または `podman run` | 自分で起動します。 [RTE の実行](run.html) にあるようなコマンドを、アプリに到達できる、またはアプリから到達できる任意のホストで実行します |
| [Docker Compose](../installation/docker-compose.html) | `docker-compose.yml` の `rte` サービス。 `app` と `mysqldb` の隣にあります。構成シードで、インバウンドの既定のランナー `rte` として `http://rte:8000` に宣言されています |
| [Helm チャート](../installation/kubernetes.html) | Kubernetes。アプリの Pod 内の `rte` という 2 つ目のコンテナー（ `containers.rte` ）として起動します。アプリは `127.0.0.1` でインバウンドとして接続し、チャートのシードで既定のランナーとして宣言されています |
| [インストーラー](../installation/installer.html) | 上記の Docker Compose または Helm チャート、あるいは [コンテナーを使わない](../installation/native.html) systemd サービス。独自のランナーで、参加を申請して管理者の承認を待ちます |

コンテナーエンジンは利用者のものです。ホスト上の Docker や Podman、または Kubernetes クラスターのコンテナーランタイムで、インストールと更新は
利用者が行います。AnsibleForms がそれと通信することはありません。アプリも RTE も Docker や Podman を呼び出さず、そのソケットをマウントせず、
コンテナーを起動しません。アプリはソケットを通じて RTE と通信するだけです。

**中身。** プレイブックの実行に必要なものだけを備えた、一つのコンテナーです。

* **サーバー** ：アプリと同じ Node.js サーバーで、 `tini` の下で `AF_ROLE=rte` （イメージで設定）で起動します
* **省かれているもの** ：Web インターフェース、ログイン、スケジューラー、ワーカー、すべてのデータベースモジュール。このロールでは読み込まれません
* **待ち受けるもの** ：その `PORT` （ `8000` ）。プローブ用の `/live` と `/ready` 、Prometheus 用の `/metrics` 、そしてインバウンドの場合は
  アプリが接続するソケット `/rte/v1/socket` 。アウトバウンドの RTE はアプリからの接続を受けません
* **Python と ansible** ：選んだイメージのレイヤーが提供します（ [RTE イメージ](images.html) を参照）
* **ユーザー** ：サーバーとすべてのプレイブックは `node` （uid 1000）で実行され、root では実行されません

**アプリと共有するもの。** トークンと、 `RTE_FILES=local` の場合はアプリのファイルです。既定の `RTE_FILES=transfer` では、
プレイブックとインベントリは各ジョブとともに届き、RTE に共有ディスクは不要です。

| アプリと共有するもの | RTE での使い方 |
|---|---|
| `RTE_TOKEN` | アプリに接続するとき（アウトバウンド）に提示するか、アプリが接続してきたとき（インバウンド）に確認します。アプリはランナーの RTE 認証情報に同じ値を保持し、ジョブのシークレットはそれで封印されます |
| 永続ボリューム `/app/dist/persistent` 。 `RTE_FILES=local` の場合のみ | プレイブックのフォルダー（ [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) ）、またはワーカーが [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) の下にクローンしたプレイブックのリポジトリ、インベントリ（ [`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) とインベントリのリポジトリ）、アップロード。RTE はジョブの extravars ファイルをプレイブックのフォルダーに書き込むので、読み書き可能でマウントしてください |
| ssh フォルダー `/home/node/.ssh` | プレイブックの ssh 接続が使う秘密鍵と `known_hosts` 。設定ページで管理しているアプリのものをマウントするか、RTE に独自のものを与えます |

RTE は何もクローンしません。リポジトリはジョブのファイルとして、またはアプリと共有するボリューム上で RTE に届きます。コレクション、ロール、
`ansible.cfg` は、イメージから、 `/etc/ansible/collections` 、 `/etc/ansible/roles` 、 `/etc/ansible/ansible.cfg` にマウントした場合はそれらのフォルダーから
（Docker Compose プロジェクトはそうしています）、またはプレイブックの隣にある `ansible.cfg` から取得されます。

**ジョブのライフサイクル。** 以下の番号は、ブラウザーまたは API から起動したプレイブックフォームについての、図の番号です。

1. **起動** ：アプリはフォームとその値を確認し、extravars を組み立て、ステータス `running` でジョブを保存します。
   [承認](../forms/approval.html) のあるフォームは、承認者が承認するまでここで止まり、それまでどの RTE にも届きません
2. **ランナーの選択** ：アプリは、フォームが `runner: <name>` で指定した RTE、なければ種類が RTE の既定のランナーを選び、その
   名前をジョブに保存します。データベースまたは [シークレットストア](../secret-stores/) からジョブの認証情報、ansible のログイン、
   vault パスワードを解決し、そのランナーのトークンとジョブ ID から導出したキーで AES-256-GCM により封印します
3. **引き渡し** ：RTE のソケットを持つアプリノードが、ジョブを RTE に送ります。extravars、フォームのオプション、封印されたシークレット、
   ジョブのファイルのハッシュです。どのアプリノードでもジョブを起動でき、ソケットを持つノードが 2 秒以内に送ります。RTE が満杯か
   接続していない場合、ジョブは最大 [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) まで待機します
4. **受け取り** ：RTE は `claimed` と答えるか、満杯、停止中、シークレットを開けない、またはジョブが自分とは異なる
   [契約](images.html#the-contract) で届いた場合は `refused` と答えます。 `RTE_FILES=transfer` では、プレイブックとインベントリをハッシュで
   キャッシュから取り出し、持っていないハッシュはアプリに要求し、ジョブ専用のフォルダーに展開します
5. **開始** ：プレイブックのフォルダー（存在する必要があるフォームの `playbookSubPath` を加えたもの）に二つのファイルを書き込みます。フォームの値と
   認証情報を含む `extravars_<id>.json` と、ansible のログインを含む隠しファイルです。その後、 `ansible-playbook` を自分の子プロセスとして、
   シェルを使わず、独自のプロセスグループで起動します。それらのファイルを `-e @` で、インベントリごとに `-i` を一つ渡し、フォームのタグ、limit、check、
   diff、詳細度も渡します。vault パスワードは stdin で渡され、ファイルやコマンドラインには決して置かれません。プロセスは
   フィルターされた環境で `node` として実行されます（下記を参照）
6. **実行** ：プレイブックは RTE のコンテナーから管理対象のホストに接続します。 `/home/node/.ssh` のキーと `known_hosts` を使った ssh、
   パスワードログインの場合は `sshpass` 、またはモジュールが呼び出す API 経由です。到達できる必要があるのはアプリではなく RTE です
7. **出力と終了** ：RTE は stdout と stderr を 0.5 秒ごとまたは 64 KB ごとにまとめ、認証情報をマスクし、各バッチに番号を付けます。
   送信する前に、各項目をディスク上のジョブのスプールに書き込みます。出力、イベント、
   `.joblogs/job_log_<id>.log` のジョブログ（2 秒ごと）、開始、そして最終ステータス（ `success` 、 `failed` 、 `aborted` ）を伴う終了です。アプリは
   各項目を一度だけ保存して確認応答し、終了が保存されると RTE はスプールを破棄します。一つのストリームで
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) バイト（既定は 50 MB）を超えるとそれ以上は送らず、
   プレイブックは続行します。その後、アプリはフォームの [通知](../forms/notifications.html) を送ります
8. **追跡** ：ブラウザーが RTE と通信することはありません。フォームのページは 2 秒ごとにアプリを通じてジョブを読み直し、ジョブページは
   アプリが各項目を保存するたびにライブで追跡します

**ソケットが切断された場合。** プレイブックは続行します。RTE が再接続する（アウトバウンド）か、アプリノードが再び接続し（インバウンド）、
アプリがまだ確認応答していないものを再送します。アプリはすでに保存したものを飛ばすので、行が失われたり二重に保存されたりすることはありません。これが成り立つのは、
2 分以内にソケットが戻る場合です。アプリはソケットが開いている間だけ RTE のハートビートを書き込み、そのハートビートが 2 分経過すると、
プレイブックがまだ動作していても、ワーカーはその RTE の実行中のジョブを放棄されたものとして終了します。再起動した RTE が保持していたものを送れるよう、
スプール（ [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) ）はボリューム上に置いてください。RTE の再起動時に
実行中だったプレイブックは続行できません。RTE がそれを持たずに戻ってくると、アプリはそのジョブを放棄されたものとして終了します。

**中止。** 中止するとジョブの中止フラグが設定され、RTE のソケットを持つアプリノードが 2 秒以内に `cancel` を送ります。RTE は
プレイブックのプロセスグループに `SIGTERM` を送るので、 `ansible-playbook` とそれが起動したすべてのフォークが一緒に停止し、ジョブは
`aborted` で終了します。ジョブより先に届いた cancel は 1 分間保持され、そのジョブは中止された状態で開始されます。

**後片付け。** プロセスが終了するとすぐに、結果にかかわらず、RTE は二つの extravars ファイル（ `keepExtravars` のあるフォームは
表示されるほうを残しますが、隠しファイルは決して残しません）、 `/tmp` のアーティファクトファイル、ジョブログのファイル、ジョブ専用のファイルのフォルダーを削除します。
終了は一度だけ保存されます。RTE がすでに終了したジョブをアプリが失敗にするなど、二度目の書き込みは何も変えません。

**ジョブごとに一つのプロセスであり、ジョブごとに一つのコンテナーではありません。** AWX と AAP は、ジョブごとに実行環境のイメージから新しい Pod またはコンテナーを
起動します。AnsibleForms は何も起動しません。RTE のコンテナーはすでに動作しており、各ジョブはその中の子プロセスです。ジョブは
イメージのプルも Pod のスケジューリングもなしに始まり、AnsibleForms にはコンテナーエンジンやクラスターに対する権限は不要です。その代わり、
一つの RTE で動作するプレイブックは、その CPU、メモリ、 `/tmp` 、ホームフォルダー、python を共有します。フォークを含めた
`RTE_MAX_JOBS` 個のプレイブックに十分なリソースをコンテナーに与えてください。プレイブックが使えるものを変えるには、ジョブではなくイメージを変更します。

---

## セキュリティの境界

RTE はフォームの作成者が書いたコードを実行するので、保持するものをできるだけ少なくするように作られています。

* **トークンだけ** ：RTE はデータベースの認証情報も `ENCRYPTION_SECRET` も持ちません。トークン付きのアプリのソケット以外からの呼び出しは受けず、
  ユーザーもログインも Web ページもありません。ソケットを通じてできるのは、アプリが送ったジョブを実行し、それについて報告し、そのファイルを
  要求することだけです。ジョブを作成したり、別のジョブを読んだり、認証情報を渡したりすることはできません
* **封印されたシークレット** ：ジョブを実行するために、RTE は認証情報のテーブルもシークレットストアも読みません。実行するジョブのシークレットを、
  自分のトークンとそのジョブ ID だけで開けるように封印された状態で受け取るので、別の RTE や別のジョブ向けのバンドルは開けず、1 バイトでも変更されたものは
  拒否されます
* **検証された接続** ：アウトバウンドでは、RTE がアプリの証明書を検証します。HTTPS のインバウンドでは、アプリは RTE の参加時にその証明書を固定し、
  その証明書を提示した場合にだけ接続します（ [モード](modes.html#inbound) を参照）。プレーンな HTTP のインバウンドの RTE は、
  Docker Compose プロジェクトのようなプライベートネットワークに置くものです
* **環境を引き継がない** ： `ansible-playbook` は、AnsibleForms 自身が読み込むすべての変数（ `ENCRYPTION_SECRET` 、 `DB_PASSWORD` 、 `RTE_TOKEN` 、
  `VAULT_TOKEN` 、 `ACCESS_TOKEN_SECRET` 、 `MYSQL_*` など）を除いた RTE の環境を受け取るので、
  `lookup('env', ...)` でもそれらには届きません。プレイブック向けに設定したもの（ `PATH` 、プロキシ、 `ANSIBLE_*` ）はそのまま渡されます
* **ユーザーからのテンプレートなし** ： {% raw %}`{{` 、 `{%` 、 `{#` を含むフォームの値は、unsafe な文字列としてプレイブックに届き{% endraw %}、
  フォームが `allowJinjaInExtravars` を設定しない限り ansible がテンプレートとして処理することはありません。また、コマンドラインをシェルが実行することもありません
* **root ではない** ：RTE とそのプレイブックは `node` （uid 1000）で実行されるので、プレイブックにできるのは、そのファイルや ssh キーを読むなど、
  コンテナー内でそのユーザーにできることだけです

そのコンテナー、イメージ、環境は、アプリのものと同じように慎重に扱ってください。

---

## データベースモード（非推奨）

`RTE_MODE` のない 7.0 から 7.2 の RTE は 7.x の間ずっと動作し、8.0.0 で削除されます。上の手順とは四つの点で異なります。

* **データベースを持つ** ：その `DB_*` 設定と、自分自身を登録する場合は `ENCRYPTION_SECRET`
  （ [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) ）
* **引き渡しが HTTP の呼び出し** ：アプリがトークンと封印されたシークレットを付けて `POST <address>/rte/v1/jobs` を呼び出し、RTE は
  データベースのジョブに自分の名前を書き込んで受け取ります（手順 3 と 4）
* **出力を自分で書き込む** ：データベースに、バッチで、スプールなしで書き込みます（手順 7）。中止は、2 秒ごとに読み込むジョブの中止フラグと、
  `/cancel` の呼び出しで届きます
* **ファイルをアプリのボリュームから読む** ： `RTE_FILES=local` の場合と同じく、アプリと同じディスクが必要です

そのランナーのページには [RTE の設定](../runners/runner-page.html#an-rtes-settings) は一つもありません。自分の変数を読み込むためです。ソケットモードに
移すには、 [モード](modes.html#database-deprecated) を参照してください。

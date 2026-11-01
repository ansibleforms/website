---
layout: default
title: FAQ
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# よくある質問
{: .no_toc }

AnsibleForms についてよくある質問と回答
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## はじめに

### デプロイの構成：1 つのコンテナーか、複数のノードか

既定では、1 つの AnsibleForms コンテナーが Web アプリケーションとバックグラウンド処理を 1 つのプロセスで実行し、その隣で
プレイブックを実行する RTE コンテナーが動きます。再起動ポリシー（たとえば Docker の `restart: unless-stopped` ）を付けて実行し、データベースと
永続ボリュームの両方をバックアップしてください。

ロードバランサーの背後で複数のレプリカを動かすには、 `AF_ROLE` でプロセスを分割します。

- `app` ノードは Web インターフェースと API を提供します。いくつでも動かせますが、それぞれに同じ `ACCESS_TOKEN_SECRET` が必要です
- `worker` はバックグラウンド処理を実行します。スキーマとそのアップグレード、設定シード、スケジュール、夜間のバックアップ、リポジトリの
  同期、クリーンアップです。データベースのロックを保持して同時に動くワーカーは 1 つだけで、2 つ目は待機し、1 つ目が停止すると引き継ぎます
- `rte` コンテナーはプレイブックを実行します。より多くのプレイブックを同時に実行するには、これを増やします

アプリノードとワーカーは、データベース、永続ボリューム、 `ENCRYPTION_SECRET` を共有します。ソケットモード（アウトバウンドまたは
インバウンド、 [モード](rte/modes.html) を参照）の RTE には、データベースも `ENCRYPTION_SECRET` も必要ありません。チャットアシスタントにはスティッキーセッションが必要で、
各ノードはそれぞれのログを持ちます。 [スケーリング](production/scaling.html) と
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale) の構成を参照してください。

### 複数のリポジトリでのフォーム管理

**フォームに使用しますか?** を有効にしたすべての Git リポジトリのフォームは、自動的にマージされます。フォーム名が重複した場合は最初のものが
優先され、警告がログに出力されます。 `config.yaml` は 1 つのリポジトリにだけ置いてください。 [Git リポジトリ](repositories/) を参照してください。

### リポジトリについて

AnsibleForms は、リポジトリのパス（ `REPO_PATH` ）の下に Git リポジトリをクローンして pull し、それらは **設定 > リポジトリ** で管理します。
各リポジトリのスイッチで、そのリポジトリが何を持つか（設定、フォーム、プレイブック、vars ファイル）を設定します。 [Git リポジトリ](repositories/) を参照してください。

### フォームファイルの VS Code での検証

フォームの YAML ファイルにスキーマのヘッダーを追加すると、VS Code でリアルタイムの検証と自動補完が使えます。

[YAML 拡張機能](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) をインストールし、フォームファイルの **1 行目** に次のコメントを追加します。

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

これは、フォームが 1 つのファイル（YAML の辞書）と複数のフォームを含むファイル（YAML のリスト）の両方で使えます。

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
- name: My Form
  type: ansible
  playbook: site.yml
  roles: [default]
  fields:
    - name: env
      type: enum
      values: [dev, staging, prod]
```

入力しながら、VS Code が不明なプロパティ、欠けている必須フィールド、正しくない型を強調表示します。

---

## ジョブの管理

### 入力済みのデータでジョブを再起動する

再起動ボタンは、以前のジョブの値を入力した状態でフォームを開きます。パスワードフィールドは決して保存されません。
これにはロールのオプション `allowJobRelaunch` が必要で、フォームでは `allowRelaunch: false` で無効にできます。 [ジョブを再起動する](jobs/actions.html#relaunch-a-job) を参照してください。

### ジョブのログファイル

ジョブ専用のログファイルで進捗を追跡します（v6.1.2）。

AnsibleForms は、Ansible の出力と並べて **ジョブ専用のログファイル** を表示できます。これにより、実行中に目に見える出力を出さない、長時間かかるカスタムモジュールの進捗を追跡できます。

{: .note }
> この機能は、RTE で実行されるプレイブックでのみ動作します。AWX、AAP、Ascender、Semaphore、Rundeck、
> Jenkins 上のテンプレートやジョブにはログファイルがありません。

**仕組み:**
- ジョブの実行中、RTE はプレイブックのフォルダー内の決まったパスにあるログファイルを監視します
- 2 秒ごとに、ファイルが変わっていれば RTE がその内容をジョブにコピーし、プレイブックの終了時にももう一度コピーします
- ログファイルはジョブの出力の **ログファイル** セクションに、出力と同じように行番号付きで表示されます。ログの行のタイムスタンプとレベル（ERROR、WARNING、INFO、DEBUG）は出力と同様に読み取られて色付けされ、ANSI カラーにも対応しています

**ログファイルのパスの規則:**

ログファイルは次のパスに書き込む必要があります。

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms は `__jobid__` を自動的に渡す** ため、追加の設定なしでプレイブック内でパスを組み立てられます。

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

この変数を、ファイルに進捗を書き込むべきロールやカスタムモジュールに渡します。

**プレイブックやモジュールの開発者の責任:**
- 処理の開始時にログファイル（とその `.joblogs/` ディレクトリ）を **作成** します
- 処理が進むにつれて、意味のある進捗メッセージを **書き込み** ます

RTE は、プレイブックが終了して最後の内容がジョブに保存されると、ファイルを削除します。

**ANSI カラーコードに対応しています。**  
ログメッセージ内の標準の ANSI エスケープコード（たとえば緑の `\033[92m` 、赤の `\033[91m` ）は UI で色として表示されるため、成功、警告、エラーの状態をひと目で見分けられます。

**典型的な使い方:**  
API 呼び出しやデータ操作を長く続けて実行するカスタムの Python Ansible モジュール（たとえば SnapMirror の DR ワークフロー）は、ステップごとに 1 行をログファイルに追記できます。AnsibleForms でジョブを見ているオペレーターには、ジョブのページがジョブを追跡するにつれて、ログファイルのセクションに進捗がライブで表示されます。

### Jobid

現在のジョブ ID を渡します。

AnsibleForms は、現在のジョブ ID を extravars の `__jobid__` として自動的に送ります。設定は必要ありません。

### ユーザー情報

現在のユーザーを渡します。

AnsibleForms は、ユーザーの情報を extravars の `ansibleforms_user` として自動的に送ります。設定は必要ありません。

送る量は選べます。 `EXTRAVARS_USER_FIELDS` には最上位のキーのカンマ区切りのリスト（ `username,email,type` ）、
または何も送らない場合は `none` を指定します。フォームでは独自の `userExtravars` プロパティでこれを上書きできます。
既定はこれまでどおりオブジェクト全体です。以下で説明するフォーム側の `__user__` はログインのトークンから来るもので、影響を受けることはありません。

### フォームでのユーザー情報

フォームで現在のユーザーの情報にアクセスします（v4.0.2）。

フィールド `__user__` はフォームに自動的に追加され、式から参照できます。

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## フォームフィールド

### 連動するドロップダウン

連動するドロップダウンを作ります。

`enum` フィールド（ドロップダウンボックス）の `query` または `expression` プロパティには、 `$(another_field)` や `$(another_field[0].name)` の形式でプレースホルダーを含められます。  
参照先のフィールドが変わるとすぐに参照元のフィールドが再評価され、動的に連動するドロップダウンボックスになります。  
クライアントの Web アプリケーションは 100 ms ごとにフィールドを再評価します。現在のプロセッサーと Chromium エンジンなら、これで途切れのない操作感になります。

{: .note }
> ほかの enum フィールドを参照すると、ドロップダウンの一覧全体では **なく** 、選択された値が返されます。 `placeholderColumn` プロパティか、 `$(city.name)` のようなドット記法を使ってください。  
> **v4.0.20 の新機能**: placeholderColumn を "*" に設定すると、1 つの列ではなくレコード全体が出力されます。

例では `CONN1` を照会します。これは接続 > データベース の [データベース](databases.html) （7.5.0 から）、または種類がデータベースの認証情報です。

```yaml
- type: enum
  dbConfig: CONN1
  query: select name from cmdb.city
  name: city_name
  label: Select a city
  default: Amsterdam
  required: true
  model: cmdb.city
  group: CMDB
- type: enum
  dbConfig: CONN1
  query: select datacenter.name from cmdb.datacenter,cmdb.city where datacenter.city_id=city.id
    and city.name='$(city_name)'
  name: datacenter_name
  label: Select a datacenter
  default: __auto__    # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB      

# or use the placeholderColumn property

- type: enum
  dbConfig: CONN1
  query: select id,name,description from cmdb.city
  name: city
  label: Select a city
  default: Amsterdam         # evaluated against valueColumn
  required: true
  model: cmdb.city
  group: CMDB
  valueColumn: name          # we choose the name column as value for placeholders
  placeholderColumn: id      # we can reference the id by using $(city)
  previewColumn: description # when you select a value, the dropdown will show description
  columns:                   # we hide id
  - name
  - description
- type: enum
  dbConfig: CONN1
  query: select name, capacity_pct from cmdb.datacenter where datacenter.city_id=$(city)
# this cascaded dropdown will react using "id" as placeholder
# or "query":"select name from cmdb.datacenter where datacenter.city_id=$(city.id)",  
# or reference the column in the placeholder                            
  name: datacenter_name
  label: Select a datacenter
  default: __auto__         # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  pctColumns:
  - capacity_pct
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB
```

### フィールドのプレースホルダー

ほかのフィールドの値を参照します。

プレースホルダーは、フォーム内のほかのフィールドへの参照です。  
プレースホルダーの形式は常に `$(reference)` で、式とクエリのどちらにもプレースホルダーを含められます。  
単純なフィールド（text、number、password）を指すプレースホルダーは、そのフィールドの値を持ちます。  
オブジェクトベースの enum フィールドを指すプレースホルダーでは、 `placeholderColumn` プロパティか、 `$(city.name)` のようなドット記法を使う必要があります。  
expression フィールドを指すプレースホルダーはオブジェクト全体を返します。または `$(myarray[0].name)` のような、JavaScript に似た高度な参照も使えます。

{: .important }
> プレースホルダーは、式が評価される **前** に置き換えられます。結果を文字列として扱いたい場合は、引用符で囲む必要があります。  
> **v4.0.20 の新機能**: placeholderColumn を "*" に設定すると、1 つの列ではなくレコード全体が出力されます。

```yaml
- name: field1
  type: expression
  expression: "[{name: 'foo'},{name: 'bar'},{name: 'ansible'}]"
  runLocal: true
- name: field2
  type: expression
  expression: "'$(field1[0].name)'"  # result : 'foo' (note the wrapping quotes)
  runLocal: true
- name: field3
  type: expression
  expression: "$(field1)[0].name"  # result : {name: 'foo'}.name => 'foo'  
  runLocal: true    
- name: field4
  type: expression
  expression: "$(field1).slice(-1)[0].name"  # result : {name: 'ansible'}.name => 'ansible' 
  runLocal: true
- name: field5
  type: enum
  expression: $(field1).filter(x => x.name.includes('a'))   # result : [{name: 'bar'},{name: 'ansible'}]
  runLocal: true
  default: __auto__                                         # result: bar
- name: field6
  type: expression
  expression: "'$(field5)'"   # result : the selected item from field5 (default=bar)
  runLocal: true        
```

### フィールドを非表示にする

フィールドを非表示にします。

フィールドのプロパティ `hide` でフィールドを非表示にするか、フィールドのプロパティ `dependencies` と `dependencyFn` で動的に表示・非表示を切り替えます。

### フィールドをグループにまとめる

フィールドを 1 つのブロックにまとめます。

フィールドのプロパティ `group` を使います。同じグループ名を持つフィールドは 1 つのブロックにまとめられます。

### フィールドの検証

フィールドを検証します。

`regex` 、 `minValue` 、 `notIn` などの検証用のフィールドプロパティを使います。

### enum の既定値

enum の既定値です。

フィールドのプロパティ `default` で既定値を設定します。 `enum` フィールドでは、 `__auto__` などの値を使って最初の項目を自動的に選択できます。

式に基づく動的な既定値にするには、次の例のように、既定の項目をリストの先頭に移動します。

```yaml
# using client javascript manipulation

- type: expression
  expression: "[{name:'bert'},{name:'ernie'},{name:'pino'}]"
  name: dropdownsource
  label: Dropdown source
  runLocal: true
- type: expression
  expression: "'pino'"
  name: dropdownsourceDefault
  label: Default source
  runLocal: true
- type: enum
  expression: "[...[{name:'$(dropdownsourceDefault)'}],...$(dropdownsource).filter(x => x.name!=='$(dropdownsourceDefault)')]"
  name: dropdownwithdefault
  label: Example with expression default by moving it to top
  runLocal: true
  default: __auto__     

# explained : 
# we take our default and merge it with the source where we filter out the default (to avoid doubles)    
# the default is thus shifted to the first element, which we can now select with the default `__auto__`
```

### 式による既定値

式による既定値です。

text、number、date のフィールドでは、 `default` プロパティで静的な既定値を設定します。

既定値を式に基づく動的なものにするには、次の 2 つのプロパティのどちらかを使います。
* `editable` : editable プロパティを使って、expression フィールドを編集可能にします
* `evalDefault` : evalDefault プロパティを使って、既定値を式として評価します

```yaml
# using editable
- type: expression
  expression: "'$(some_other_field)'.toLowerCase()"
  name: field1
  runLocal: true
  editable: true # this will add an edit-button so you manually overwrite the expression value

# using evalDefault
- type: text
  name: field1
  default: "'$(some_other_field)'.toLowerCase()"
  evalDefault: true # it will treat the default as if it was an expression.
  # note : when `some_other_field` changes, the default will be re-evaluated
  # note2 : works for other fields too.

# more complex evalDefault example
- name: checkbox
  type: checkbox
- name: textfield1
  type: text
  line: line2
  default: ping
- name: textfield2
  type: text
  line: line2
  default: pong
- name: checkbox3
  type: checkbox
  line: line3
  label: This checkbox will default check if checkbox or textfield1==textfield2
  default: |
    (
      (c=false,t1="",t2="") => { return c || (t1==t2) }
    )( $(checkbox) , "$(textfield1)" , "$(textfield2)" )
    
  evalDefault: true
```

---

## ウィザードとワークフロー

### ウィザードとワークフローの違いは何ですか?

**ウィザード** と **ワークフロー** はどちらもステップで構成されますが、異なる層で動作し、組み合わせることができます。

| | [`workflow`](forms/workflow.html) （ワークフロー） | [`wizard`](forms/wizard.html) |
|---|---|---|
| **層** | 実行 | フォーム / UI |
| **分割するもの** | ジョブを、順に、または並行して実行されるノードに分けます | 1 つのフォームの入力を複数のページに分けます |
| **結果** | ノードごとのジョブ（それぞれ独自のプレイブックやテンプレート）を持つ 1 つのワークフロージョブ | 最後に 1 つのジョブが実行されます |
| **フォームの `type`** | `workflow` である必要があります | `subform` 以外のすべての種類のフォームで使えます |
| **定義するもの** | デザイナーの [ワークフローファイル](workflows/file.html) （ `workflow:` ） | [サブフォーム](forms/subform.html) の参照のリスト（ `wizard:` ） |
| **使う場面** | 「A を実行し、次に B、次に C を別々のジョブとして実行したい」 | 「フォームのフィールドが多すぎて 1 ページに収まらない」 |

**要点:** ワークフローは *何をどの順で実行するか* に関するもので、 `wizard` は *ユーザーがフォームをどう入力するか* に関するものです。

{: .note }
> `steps` を持つフォームの種類 `multistep` は、7 より前に実行の部分を担っていました。7 以降は非推奨で、
> 8 で削除されます。ワークフローは multistep ができることをすべて行えます。 [マルチステップフォーム](forms/multistep.html) を参照してください。

#### ワークフローのみ
{: .no_toc }

`type: workflow` のフォームは、デザイナーのワークフローの 1 つを実行します。ユーザーは 1 ページのフィールドを入力して「送信」を押し、
ワークフローは各ノードを、フォームの値を追加変数として実行します。

```yaml
- name: Provision host
  type: workflow
  workflow: provision-host
  roles:
    - default
  fields:
    - name: hostname
      type: text
```

#### ウィザードのみ
{: .no_toc }

フォームの `wizard:` ブロックは、入力の収集を複数のページに分けます。最後に実行されるジョブは **1 つ** だけです。すべてのページからマージされた extravars が、1 つのプレイブック、テンプレート、またはワークフローに送られます。

```yaml
- name: Provision host
  type: ansible
  roles:
    - default
  playbook: provision.yml
  wizard:
    - subform: basics
      title: Basics
    - subform: network
      title: Network
      defaultModel: net

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: ipv4
      type: text
```

読み取り専用の確認ページが、ウィザードの最後のページとして自動的に追加されます。YAML で宣言する必要はありません。

#### 組み合わせ（ワークフローの上にウィザード）
{: .no_toc }

ウィザードは、ワークフローのフォームの上に重ねることができます。ユーザーがウィザードのページを入力して「送信」を押すと、 **その後で**
ワークフローが開始されます。ウィザードのステップの `defaultModel` をノードの
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) と一致させると、 **ウィザードの 1 ページを 1 つのノードに** 振り分けられます。

```yaml
- name: Provision and verify host
  type: workflow
  workflow: provision-host
  roles:
    - default
  wizard:
    - subform: basics
      title: Basics
      defaultModel: basics            # wraps basics fields under `basics`
    - subform: network
      title: Network
      defaultModel: network           # wraps network fields under `network`
```

そして、デザイナーのワークフローファイルにあるワークフロー `provision-host` です。

```yaml
workflow_job_templates:
  - name: provision-host
    related:
      workflow_nodes:
        - identifier: create
          unified_job_template:
            name: create_host.yml
            type: job_template
          extra_vars_key: basics      # only sees the basics page payload
          related:
            success_nodes:
              - identifier: network
        - identifier: network
          unified_job_template:
            name: configure_network.yml
            type: job_template
          extra_vars_key: network     # only sees the network page payload
```

`extra_vars_key` は 1 階層だけの参照なので、一致させたい場合は `defaultModel` にフラットな名前を使ってください（たとえば `defaultModel: input.basics` ではなく `defaultModel: basics` ）。

プロパティの完全なリファレンスは [ウィザードのページ](forms/wizard.html) を参照してください。

### ウィザードのステップを条件によって表示したりスキップしたりするには?

ステップを完全に **非表示** にするには `when:` を、表示されているステップをユーザーが **スキップ** できるようにするには `optional: true` を使います。この 2 つは独立しており、一般に組み合わせるべきではありません。

#### `when:` : 条件付きの表示
{: .no_toc }

式が偽の値に評価されると、ステップは非表示になります。ユーザーにはまったく表示されず、その値も収集されません。式では `__parent__.<stepname>.<field>` で前のステップを読み取れます。

```yaml
wizard:
  - subform: basics             # has a `kind` enum field with values vm/bare-metal/container
    title: Basics
  - subform: virtualization
    title: Virtualization
    when: $(__parent__.basics.kind) === 'vm'
  - subform: hardware
    title: Hardware
    when: $(__parent__.basics.kind) === 'bare-metal'
```

選ばれた `kind` に一致するページだけが表示されます。非表示のステップより後のステップは、自動的に番号が振り直されます。

#### `optional: true` : 表示されているステップのスキップを許可する
{: .no_toc }

ステップはステッパーに **常に表示** されますが、ユーザーは入力せずに **次へ** を押せます。また、そのページを開かなかった場合や完了しなかった場合でも **送信** できます。

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

ユーザーは「詳細」ページを開いて空のままにし、「次へ」を押して確認ページに直接進めます。

{: .note }
> `when:` は *表示* を制御し、 `optional:` は *ページを完了しなければならないかどうか* を制御します。組み合わせないでください。ページを消すには `when:` を、表示したままスキップできるようにするには `optional:` を使います。

### 前のウィザードステップの値を参照するには?

後のステップのどのフィールドでも、 `$(__parent__.<stepname>.<field>)` を使います。

ウィザードのステップの `name` （既定ではその `subform` の名前）が名前空間になり、その値は後のステップにその下で公開されます。

```yaml
- name: Provision host
  type: ansible
  playbook: provision.yml
  roles:
    - default
  wizard:
    - subform: basics          # step name defaults to "basics"
      title: Basics
    - subform: network
      title: Network

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: fqdn
      type: text
      # Re-evaluated when basics.hostname changes
      default: $(__parent__.basics.hostname).local
```

これは `list` と `yaml` のサブフォームが使うのと同じ `__parent__` の仕組みです。 [サブフォームの中で親フォームのデータにアクセスするには?](#how-do-i-access-parent-form-data-inside-a-subform) を参照してください。

---

## セキュリティと認証情報

### 認証情報

認証情報を渡します。

認証情報はいくつかの方法で渡せます。
* フィールドのプロパティ `asCredential` を使う  
* フォームのプロパティ `credentials` （キーと値のペア）を使う
* `__credentials__` という extravar を使う

```yaml
# assume you have 2 credentials created in Ansible Forms
# 1: vcenter
# 2: ad

# you want them exposed to the playbook as
# 1: vc_cred
# 2: ad_cred

# Method 1 : using asCredential field-property
fields:
- name: vc_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'vcenter'"
- name: ad_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'ad'"

# Method 2 : using credentials form-property   
name: myplaybook
type: ansible
playbook: myplaybook.yaml
roles:
  - default
credentials:
  vc_cred: vcenter
  ad_cred: ad
  veeam_cred : veeam_prod,veeam_dev # will first try veeam_prod, then as fallback veeam_dev

# Method 3 : using __credentials__ extravar
fields:
- name: __credentials__
  type: expression
  runLocal: true
  expression: "{vc_cred: 'vcenter',ad_cred: 'ad',veeam_cred:'$(veeam_server)'}"
  # note : in the expression you can use placeholders to make them dynamic
```

### 管理者パスワードを紛失した場合

ローカルの `admin` アカウントのパスワードを紛失し、ほかに管理者ユーザーがいない場合は、復旧オプション `REINIT_ADMIN` を使います。 **これは実行時に認証を迂回するものではありません。** 起動時にローカルの管理者アカウントを一度だけ強制的にリセットするもので、その後は通常の認証が行われます。

**仕組み**

起動時に `REINIT_ADMIN=1` が設定されていると、AnsibleForms は次のことを行います。

1. `admins` グループが存在することを確認します（なければ作成します）。
2. ローカルの管理者ユーザーを探します（既定のユーザー名は `admin` で、 `ADMIN_USERNAME` で変更できます）。
3. 存在する場合は、パスワードを `ADMIN_PASSWORD` の値にリセットし、 `admins` グループに再び所属させます。
4. 存在しない場合は、新規インストールと同じように作成します。
5. ログで目立つように、この操作を記録します。

**手順**

1. AnsibleForms を停止します。
2. 環境変数を設定します（強力なパスワードを使ってください）。
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   Docker Compose では、AnsibleForms サービスの `environment:` ブロックに追加します。
3. AnsibleForms を起動し、ログに次のような行が出るのを確認します。
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. `admin` / `YourNewStrongPasswordHere` でログインします。
5. 以降の再起動で管理者のパスワードが再びリセットされないよう、 **`REINIT_ADMIN` を削除する（または `0` に戻す）** して、再起動します。

**注意事項**

- LDAP が唯一のログイン方法として設定されていてそれが失敗したために締め出された場合でも、復旧したローカルの `admin` アカウントは常にローカルのデータベース認証にフォールバックするため、ログインして LDAP を修正できます。
- 以前の環境変数 `ENABLE_BYPASS` は削除されました。これは任意のパスワードで admin としてログインできるもので、有効のままにしておくのは危険でした。 `REINIT_ADMIN` はパスワードをリセットするだけで、その後は通常の認証が適用されます。
- `REINIT_ADMIN` は既存のセッションやトークンを無効にしません。変わるのはパスワードのハッシュとグループの所属だけです。

### REST ヘルパーの接続先の制限（許可リストと拒否リスト）

`fn.fnRestBasic` 、 `fn.fnRestAdvanced` 、 `fn.fnRestJwt` 、 `fn.fnRestJwtSecure` のヘルパーは、フォームの `expression` プロパティから呼び出して HTTP でデータを取得できます。既定では、式の作成者は AnsibleForms のホストから到達できる **どの** URL でも対象にできるため、機密性の高いネットワークでは制限したい場合があります。

2 つの環境変数で、許可リストと拒否リストを指定できます。

| 変数 | 動作 |
|---|---|
| `REST_ALLOWED_HOSTS` | カンマ区切りのホスト名または CIDR。設定すると、これらの接続先 **だけ** が許可されます。 |
| `REST_DENIED_HOSTS` | カンマ区切りのホスト名または CIDR。常にブロックされます。許可リストより優先されます。 |

ホスト名は URL のホストと大文字小文字を区別せずに照合されます。CIDR は、そのホストが解決されるすべての IP と照合されるため、 `10.0.0.0/8` はプライベートの範囲に解決されるあらゆる DNS 名をブロックします。

**例:**

1 行目は 2 つのホストだけを許可し、2 行目は特定の接続先をブロックします。

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **このガードが保護するのは AnsibleForms の Node.js プロセスだけです。** プレイブックが実行されると、Ansible 自体は AnsibleForms の制御の外で、ホストから何にでも到達できます。これらのリストは、フォームの作成者が式をメタデータサービスや内部の UI へのプロキシにしてしまうのを防ぐために使い、ネットワークのファイアウォールとして頼らないでください。

7.3.0 以降、REST ヘルパーはほかのすべての接続と同じくエンドポイントの TLS 証明書をチェックし、
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) （既定は `60` ）を過ぎると諦めます。プライベート CA は
`NODE_EXTRA_CA_CERTS` で信頼させるか、自己署名証明書のエンドポイントに対してだけ [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) を `1` に設定してください。

### HashiCorp Vault との連携

認証情報は、 **シークレットストア** として設定した HashiCorp Vault からユーザーとパスワードを読み取れます。
[シークレットストア](secret-stores) を参照してください。以前のバージョンの `VAULT_*` 環境変数は、
7.x の初回起動時にストア `vault` として一度だけインポートされます。

1 つのプレイブックの中だけで使うシークレットには、 `community.hashi_vault` の
lookup プラグインも使えます。これは Vault から直接読み取り、AnsibleForms を経由しません。

---

## 連携

### AWX/Tower/AAP を照会する

AWX または Ansible Automation Platform の情報を照会します。

AWX や Tower のデータでドロップダウンボックスを埋めるには、 `fn.fnRestBasic` または `fn.fnRestJwtSecure` を使います。7.3.0 以降、これらのヘルパーは
AWX のアドレスの証明書をチェックします。自己署名証明書の場合は、 `NODE_EXTRA_CA_CERTS` でその CA を信頼させるか、
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) を `1` に設定してください。

```yaml
name: Query awx
type: awx
runner: myAwxConfigName # a runner of type awx
template: my_template # will be overwritten by the field __template__
description: ""
awxCredentials:
  - vmware
executionEnvironment: my_execution_environment
roles:
  - default
categories: []
inventory: my_inventory # will be overwritten by the field __inventory__
tileClass: bg-info-subtle
icon: bullseye
fields:
  # make sure you add credentials called "awx_rest" where the password holds the token
  # if you like basic authentication, switch the expressions below to fn.fnRestBasic instead

  - name: organization
    label: Organization
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/organizations','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: id # => we want the organisation field to hold the id !!
  - name: __template__  # use this special name to override the template from the form
    label: Template
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/job_templates?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name
  - name: __inventory__  # use this special name to override the inventory from the form
    label: Inventory
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/inventories?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name    
  - name: __awxCredentials__  # use this special name to override the credentials from the form
    label: Credentials
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/credentials?organization=$(organization)','','awx_rest','[.results[]]')"
    multiple: true
    default: __auto__
    columns:
      - name
    valueColumn: name     
  - name: __executionEnvironment__  # use this special name to override the executionEnvironment from the form
    label: Execution environment
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/execution_environments?organization=$(organization)','','awx_rest','[.results[]]')"
    default: __auto__
    columns:
      - name
    valueColumn: name           
```

---

## カスタマイズ

### カスタマイズ

AnsibleForms をカスタマイズします。

AnsibleForms は Web アプリケーションです。Node.js でネイティブに実行している場合は、そのファイルを置き換えたり変更したりできます。  
ただし推奨されるのは、Docker イメージとして実行し、ボリュームやファイルのマッピングを追加する方法です。Docker Compose プロジェクトでは、データベース、プレイブック、ログ、証明書、SSH キーを永続化するためのディレクトリがすでにマッピングされており、さらにマッピングを追加できます。独自のロゴは設定の **ロゴ** ページでアップロードします。  
`custom.js` ファイルには、式で使う独自の JavaScript 関数を記述します。組み込みの関数は接頭辞 `fn.` を使い（たとえば fn.fnRestBasic）、カスタム関数は接頭辞 `fnc.` を使います。  
同じように、 `jq.custom.definitions` ファイルに独自の jq の定義を追加できます。

```yaml
volumes:
  # Mount application folder to host folder (to maintain persistency)
  - ./data:/app/dist/persistent
  # Map custom functions for js expressions and jq
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
  # Map custom sshkey to local node .ssh location
  - ./data/ssh:$HOME_DIR/.ssh
  - ./data/git/.gitconfig:$HOME_DIR/.gitconfig
```

### YTT を有効にする

ytt を有効にします。

ytt を使うには、 `USE_YTT=1` を設定します。  
ytt について詳しくは https://carvel.dev/ytt/ を参照してください。

{: .important }  
> この機能は十分にテストされておらず、機能強化として追加されて以来、フィードバックも寄せられていません。  
> ytt を使う場合は、デザイナーを無効にする必要があります。デザイナーは YAML ファイルを中間の JSON に変換し、ytt の構文（YAML のコメントで構成されています）を落としてしまいます。

ルートディレクトリに `lib` ディレクトリが存在する必要があり、これは ytt の呼び出しに自動的に含まれます。
データは、接頭辞付きの環境変数を設定することでグローバルに提供できます。  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

または、ライブラリのデータファイルを提供します。

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**ライブラリ `demo` が ytt のコンテキストに存在する必要があります（lib/_ytt_lib/demo/values.yml）**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

読み込んだデータは次のように使えます。

```yaml
# config.yaml
#@ load("@ytt:data", "data")
#@ load("@ytt:library", "library")
#@ demo = library.get("demo")
---
categories:
  - name: Default
    icon: bars
roles:
  - name: admin
    groups:
      - local/admins
constants:
  data_values: #@ data.values
  demo: #@ demo.data_values()
```

---

## アクセス制御

### ユーザーにできることを制限するには（ロールのオプション）?

ロールが見られるフォームを制限するだけでなく、ロールの `options` で、そのメンバーに対して UI の機能をオンまたはオフにできます。
すべてのオプション、その既定値、ロールをまたいだオプションの組み合わせ方については、 [ロールのオプション](config/roles.html#role-options) を参照してください。

### プレイブックやフォームで独自の RBAC ロジックを実装するには?

ユーザーの ID は、実行のたびにフロントエンドとバックエンドの両方で利用できます。

フォームが送信されるたびに、AnsibleForms は現在のユーザーの完全な ID を、Ansible に送る extravars に自動的に入れます。

```yaml
ansibleforms_user:
  username: jane.doe
  groups:
    - local/admins
    - ldap/network-team
  roles:
    - admin
    - operators
  options:
    showLogs: true
    allowJobRelaunch: true
    # ...all resolved role options
```

そのため、プレイブックや任意のカスタム Ansible モジュールは、 `ansibleforms_user` を直接使って細かな判断ができます。たとえば、本番のインベントリの変更を特定のグループだけに許可したり、送信者のユーザー名で監査証跡を書き込んだりできます。

**フロントエンド** では、同じオブジェクトを特別なフィールド `__user__` で利用できます。

```yaml
fields:
  - name: is_admin
    type: expression
    runLocal: true
    hide: true
    expression: "$(__user__.roles).includes('admin')"

  - name: target_env
    type: enum
    # hide the production option for non-admins by cross-referencing __user__
    expression: |
      $(__user__.roles).includes('admin')
        ? ['dev','staging','production']
        : ['dev','staging']
    runLocal: true
    default: __auto__
```

**典型的なパターン:**

ユーザーの ID を使うと、次のようなパターンを実現できます。

- **RBAC の設定ファイルやデータベースとの照合** : グループと許可されたリソースを対応付ける YAML や JSON のファイルを（ `fn.fnReadYamlFile` や式で）読み込み、 `$(__user__.groups)` で絞り込みます
- **監査証跡** : `ansibleforms_user.username` を追加変数として渡し、誰がジョブを実行したかを記録します
- **動的なフィールドの値** : ユーザーのグループやロールに応じて、異なる enum の選択肢を示したり、フィールドに値を入れたり、セクションを非表示にしたりします
- **プレイブック側での認可** : フォームの `roles` リストとは独立した多層防御のチェックとして、プレイブックが処理を進める前に `ansibleforms_user.groups` に必要なグループが含まれていることを確認します

{: .note }
> 上のオブジェクトは既定で送られるものです。インスタンスで `EXTRAVARS_USER_FIELDS` が設定されている場合、
> またはフォームで `userExtravars` が設定されている場合は、そこで指定したキーだけが送られます。そのため、
> `ansibleforms_user.groups` を確認するプレイブックでは、 `groups` がその中に含まれている必要があります。フロントエンドの
> `__user__` フィールドはログインのトークンから来るもので、どちらの設定によっても削られることはありません。

---

## ジョブのスケジュール

### フォームを自動的に実行するようにスケジュールするには?

**送信** の横のドロップダウンを開き、 **スケジュール (定期実行)** または **後で実行 (1 回限り)** を選びます。これにはロールの
オプション `allowScheduledJobs` （管理者レベル）と `allowPlannedJobs` が必要です。 [スケジュール](jobs/schedules.html) を参照してください。

### どのような cron 式を使えますか?

定期的なスケジュールには、標準の 5 フィールドの cron 式（分、時、日、月、曜日）を指定します。

| 式 | 実行タイミング |
|---|---|
| `*/15 * * * *` | 15 分ごと |
| `0 * * * *` | 毎時 0 分 |
| `0 */6 * * *` | 6 時間ごと。00:00、06:00、12:00、18:00 |
| `0 2 * * *` | 毎日 02:00 |
| `30 7 * * 1-5` | 月曜日から金曜日の 07:30 |
| `0 8 * * MON` | 毎週月曜日の 08:00（曜日と月の名前も使えます） |
| `0 0 1 * *` | 毎月 1 日の 0 時 |
| `0 22 L * *` | 毎月最終日の 22:00 |
| `0 6 * * 1#1` | 毎月第 1 月曜日の 06:00 |
| `*/30 * * * * *` | 30 秒ごと（先頭に任意の 6 番目のフィールドを置くと秒になります） |

日と曜日の両方を指定した場合、スケジュールはどちらかが一致したときに実行されます。 `0 0 13 * 5` は
13 日と毎週金曜日に実行されます。実行できない式や、決して起こりえない式（ `0 0 30 2 *` ）は、サーバーが拒否します。

**スケジュール** ページでは、cron エディターが式の内容を説明し、次回以降の実行をプレビューします。 `@daily` のような
ニックネーム、 `?` のワイルドカード、 `W` （最も近い平日）の修飾子は受け付けないため、表にある形式を使ってください。

{: .note }
> **タイムゾーン** cron のスケジュールは、プロフィールやブラウザーのタイムゾーンではなく、 [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> （既定は `UTC` ）で設定したサーバーのタイムゾーンで実行されます。 `LOG_TZ=Europe/Madrid` で `0 2 * * *` は、夏時間に従って、1 年を通してマドリード時間の 02:00 に
> 実行されます。cron エディターは、次回以降の実行を同じタイムゾーンでプレビューします。リポジトリの
> pull のスケジュールも同じタイムゾーンを使います。

---

## フォームデータの保存と読み込み

### ジョブを実行せずにフォームのデータを保存して読み込み直すには?

**送信** の横のドロップダウンで **データを保存** を選んでフィールドの値を保存し、後で **保存済みデータから読み込む** で元に戻します。
パスワードフィールドは決して保存されません。これにはロールのオプション `allowStoredJobs` が必要です。 [保存済みジョブ](jobs/stored-jobs.html) を参照してください。

---

## ネストしたフォームと構造化されたフィールド

### フォームで構造化されたデータや繰り返しのデータを集めるには?

サブフォームと組み合わせた `list` と `yaml` のフィールドを使います（6.2.0 以降）。

サーバーの一覧、ネットワークインターフェースの組、1 つのネストしたオブジェクトなど、複雑な構造化データを集めるには、 `list` または `yaml` のフィールドの種類を `subform` と一緒に使います。

**サブフォーム** は再利用可能なフォームの断片で（ `type: subform` で定義します）、単独のタイルとして表示されることはありません。ほかのフォームのフィールドから参照されるためだけに存在します。完全なリファレンスは [サブフォームのドキュメント](forms/subform.html) を参照してください。

**構造化された行のリストを集める: `list` フィールド:**

`list` フィールドは、参照するサブフォームを行ごとに 1 回開きます。

```yaml
- name: Server
  type: subform
  fields:
    - name: hostname
      type: text
      required: true
    - name: ip
      type: text
      regex:
        expression: ^\d+\.\d+\.\d+\.\d+$
        description: Must be an IPv4 address

- name: Deploy to servers
  type: ansible
  roles:
    - default
  playbook: deploy.yml
  fields:
    - name: servers
      type: list
      subform: Server   # opens Server subform in a drilldown editor per row
```

Ansible に送られる extravar `servers` は、オブジェクトの配列です: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**1 つの構造化オブジェクトを編集する: `yaml` フィールド:**

`yaml` フィールドには 3 つのモードがあります。

| モード | 指定方法 | 動作 |
|---|---|---|
| **エディター** | 既定 | YAML の構文を強調表示する完全なエディターを表示し、ユーザーが直接入力できます |
| **読み取り専用** | `readonly: true` | YAML の値を整形された読み取り専用のテキストとして表示し、編集はできません |
| **サブフォーム** | `subform: MySubform` | 生のエディターを隠し、クリックするとサブフォームをドリルダウンのエディターとして開きます |

```yaml
fields:
  # editor mode (default)
  - name: raw_config
    type: yaml

  # readonly mode
  - name: generated_config
    type: yaml
    readonly: true

  # subform mode
  - name: network_config
    type: yaml
    subform: NetworkConfig   # opens NetworkConfig subform as a drilldown editor
```

**アップロードとダウンロード: `list` と `yaml` のフィールド:**

どちらのフィールドの種類も、2 つの任意のプロパティで、クライアント側でのファイルのやり取りに対応しています。

```yaml
fields:
  - name: servers
    type: list
    subform: Server
    showLoadButton: true      # shows an Upload button: imports content from a local file
    showDownloadButton: true  # shows a Download button: exports current content to a file

  - name: config
    type: yaml
    showLoadButton: true
    showDownloadButton: true
```

{: .note }
> `list` フィールドとフォームの種類 `subform` は、7.0.0 で削除された `table` フィールドと `tableFields` を置き換えたものです。

### サブフォームの中で親フォームのデータにアクセスするには?

サブフォームの中から、 `__parent__` で親のフィールドの値を参照します（v6.3.0 以降）。

サブフォームが開かれると、 **`list`** フィールド（各行のエディター）からでも、サブフォームモードの **`yaml`** フィールドからでも、AnsibleForms は `__parent__` という特別な読み取り専用のフィールドをサブフォームに自動的に入れます。これには、定数と vars を含め、 **サブフォームが開かれた時点での親フォームのすべてのフィールドの値** のスナップショットが含まれます。

これにより、サブフォームのフィールドは、追加の設定なしで親のデータを参照する式を使えます。

#### `__parent__` には何が入っていますか?
{: .no_toc }

`__parent__` は、親フォームのフィールド名をキーとするプレーンなオブジェクトです。

```yaml
__parent__:
  environment: production          # a regular field
  region: eu-west-1
  max_nodes: 10
  owner: jane.doe                  # a constant
  default_image: ubuntu-22.04      # from varsFiles
  __user__:                        # system fields are also included
    username: jane.doe
    roles: [admin]
```

{: .note }
> `__parent__` は **Ansible には送られません** 。 `__user__` と同じく、extravars から取り除かれます。これは純粋に、サブフォーム内の式のためのフロントエンドのヘルパーです。

#### サブフォームの式で親の値にアクセスする
{: .no_toc }

標準の `$(...)` の式の構文で、親の値を参照します。

```yaml
- name: NodeConfig
  type: subform
  fields:
    - name: node_name
      type: text
      label: Node name
      required: true

    - name: image
      type: enum
      label: Image
      # default to the parent form's chosen image
      expression: "'$(__parent__.default_image)'"
      runLocal: true

    - name: is_production
      type: expression
      hide: true
      runLocal: true
      expression: "'$(__parent__.environment)' === 'production'"

    - name: node_type
      type: enum
      # only offer gpu nodes in production
      expression: |
        '$(__parent__.environment)' === 'production'
          ? ['standard', 'high-memory', 'gpu']
          : ['standard', 'high-memory']
      runLocal: true
      default: __auto__

- name: Deploy cluster
  type: ansible
  roles:
    - default
  playbook: deploy_cluster.yml
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]

    - name: default_image
      type: text
      default: ubuntu-22.04

    - name: nodes
      type: list
      subform: NodeConfig
      columns: [node_name, node_type]
```

#### ネストしたサブフォーム
{: .no_toc }

`__parent__` は常に **直接の親** フォームを指します。親フォームから開かれたサブフォームの中に `list` をネストした場合、内側のサブフォームの `__parent__` には中間のサブフォームのデータが入ります。さらに上の階層に届くには、中間のサブフォームも自分の `__parent__` を引き継いでいれば、 `$(__parent__.__parent__.someField)` のように参照をつなげます。

### `table` / `tableFields` から `list` / `subform` に移行するには?

`table` フィールドと `tableFields` プロパティは 6.2.0 で非推奨になり、7.0.0 で削除されました。これらをまだ使っているフォームは検証に失敗します。移行するには次のようにします。

1. `tableFields` の列を、通常の `formfields` を持つ新しい `type: subform` のフォームに取り出します
2. `table` フィールドを、 `subform: MySubformName` でそのサブフォームを参照する `list` フィールドに置き換えます

**変更前:**
```yaml
- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: table
      tableFields:
        - name: username
          type: text
        - name: email
          type: text
```

**変更後:**
```yaml
- name: User
  type: subform
  fields:
    - name: username
      type: text
    - name: email
      type: text

- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: list
      subform: User
```

#### `tableFields` の `from` を `__parent__` の式に移行する
{: .no_toc }

`tableFields` の enum 列の `from` プロパティは、親フォームのほかのフィールドからドロップダウンの選択肢を埋めていました。 `subform` では、同じ値を `__parent__` で読み取る `expression` に置き換えます。

**変更前: `from` を持つ `tableFields`:**

```yaml
- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: table
      tableFields:
        - name: department
          type: enum
          from: available_departments   # pulls choices from the parent field above
        - name: firstname
          type: text
```

**変更後: `__parent__` の式を持つサブフォーム:**

```yaml
- name: Member
  type: subform
  fields:
    - name: department
      type: enum
      # replaces "from: available_departments"
      expression: "$(__parent__.available_departments)"
      runLocal: true

    - name: firstname
      type: text

- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: list
      subform: Member
```

{: .note }
> `$(__parent__.available_departments)` はそのフィールドの **現在の値** を返すため、そのフィールド自体が動的な expression フィールドであっても、サブフォームには常に親で最後に評価された結果が見えます。

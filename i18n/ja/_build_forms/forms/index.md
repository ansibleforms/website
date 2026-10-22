---
layout: default
title: フォーム
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# フォーム
{: .no_toc }

ユーザーが入力するフォームを定義する
{: .fs-6 .fw-300 }

---

フォーム作成者向け: フォームを YAML で書く方法、フォームの読み込み元、各フォームの種類のプロパティを説明します。

フォームは AnsibleForms の中核です。各フォームはユーザーの入力を収集する Web インターフェイスで、そのデータを使って
Ansible の playbook、AWX、AAP、Ascender のテンプレート、Semaphore のテンプレート、Rundeck や Jenkins のジョブ、または
[ワークフロー](../workflows/) を実行します。

フォームは、フォームフォルダー内の YAML ファイルで定義します。各 YAML ファイルには 1 つのフォームまたはフォームのリストを含め、サブフォルダーを使って整理できます。

**動画**: [最初のフォームを作成する](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## フォームの構造を理解する

AnsibleForms のフォームはすべて、一連のプロパティで構成されます。 **[共通プロパティ](common.html)** には、すべてのフォームの種類に適用されるプロパティが一覧表示されており、種類ごとのページではそれ以外のプロパティを説明しています。

---

## フォームの読み込み方

AnsibleForms は次の場所からフォームを読み込みます。

1. **リポジトリから** : 「フォームに使用」スイッチが有効なすべてのリポジトリ (複数のリポジトリに対応)
   - 有効なすべてのリポジトリのフォームは自動的にまとめられます。
   - 各リポジトリでは、まず `forms/` サブフォルダーがあるかどうかを確認します。
   - `forms/` サブフォルダーがない場合は、リポジトリのルートが使われます。
   - デザイナーで作成してまだプッシュしていないフォームは、ステージングフォルダー
     ( [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) ) に置かれ、一緒に読み込まれます。

2. **ローカルフォルダーから** : ローカルの `forms/` フォルダー
   ( [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) )。「フォームに使用」が有効なリポジトリがない場合

{: .warning }
> **注:** 複数のリポジトリで「フォームに使用」を有効にすると、それらのフォームはすべてまとめられます。競合を避けるため、フォーム名はリポジトリ間で一意にする必要があります。

---

## フォームの実行場所

フォームの種類によって、ジョブが実行される [ランナー](../runners.html) の種類が決まります。 `ansible` は RTE、 `awx`、
`aap`、 `ascender` は AWX ランナー、 `semaphore`、 `rundeck`、 `jenkins` はそれぞれ同じ種類のランナーです。

- フォームの `runner: <name>` で、その種類のランナーを名前で選びます。指定がない場合、ジョブはその種類のデフォルトのランナーで実行されます。
- **接続 > ランナー** で無効にされたランナーでは、フォームで指定した場合でもデフォルトの場合でも、ジョブは失敗します。ジョブが
  別のランナーにフォールバックすることはありません。
- ユーザーのロールのいずれかが `config.yaml` で `runners` を列挙している場合、ジョブはそのようなロールが列挙したランナーでしか実行できず、それ以外は
  拒否されます。このリストを持たないロールは制限せず、管理者が制限されることはありません。

---

## このセクションの内容

次のページでフォームのプロパティを詳しく説明しています。

| ページ | 内容 |
|---|---|
| [共通プロパティ](common.html) | すべてのフォームの種類に適用されるプロパティ ( `name`、 `description`、 `help`、 `type`、 `fields` ) |
| [Ansible フォーム](ansible.html) | `type: ansible` に固有のプロパティ |
| [AWX フォーム](awx.html) | `type: awx` に固有のプロパティ |
| [Semaphore フォーム](semaphore.html) | Semaphore のテンプレートを実行する `type: semaphore` に固有のプロパティ |
| [Rundeck フォーム](rundeck.html) | Rundeck のジョブを実行する `type: rundeck` に固有のプロパティ |
| [Jenkins フォーム](jenkins.html) | Jenkins のジョブをビルドする `type: jenkins` に固有のプロパティ |
| [マルチステップフォーム](multistep.html) | `type: multistep` に固有のプロパティ。非推奨で、 `workflow` に置き換えられています |
| [ワークフローフォーム](workflow.html) | [ワークフロー](../workflows/) を実行する `type: workflow` に固有のプロパティ |
| [ウィザード](wizard.html) | フォームの入力を複数のページに分ける (実行可能などのフォームの種類にも重ねて使えます) |
| [サブフォーム](subform.html) | サブフォームは共通プロパティだけを使います |
| [承認ポイント](approval.html) | 承認されるまでジョブを一時停止する ( `approval` ) |
| [通知](notifications.html) | ジョブのステータスやイベントに応じてメールやチャネルのメッセージを送信する ( `notifications` ) |
| [ジョブステータスアクション](job-status-action.html) | ジョブのステータスが変わったときにフォームに対して処理を行う ( `onSubmit`、 `onSuccess` など) |

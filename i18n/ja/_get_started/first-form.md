---
layout: default
title: 最初のフォーム
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# 最初のフォーム
{: .no_toc }

プレイブックを書き、デザイナーでそのフォームを作り、起動してジョブを確認します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

このチュートリアルは新規インストールした状態から始めます。 [インストール](installation/) を参照してください。所要時間は 15 分ほどです。

---

## 1. ログインする

ブラウザーで AnsibleForms を開き、管理者としてログインします。

既定のアカウントは `admin` / `AnsibleForms!123` （または [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME) に設定した値）です。 **フォーム** ページが開きます。

![サンプルフォームが表示された「フォーム」ページ](assets/screenshots/dashboard.jpg)

---

## 2. プレイブックを書く

`ansible` フォームは playbooks フォルダーにあるプレイブックを実行するので、先にプレイブックを用意します。次の内容を `hello.yaml` として保存します。

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

このプレイブックは 4 つの変数を読み取ります。次に作るフォームが、フィールドごとに 1 つずつ extravars として送ります。

ファイルは永続フォルダー（ [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) ）の `playbooks` フォルダーに置きます。
フォルダーがまだない場合は作成してください。

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">ソースから</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

`/app/dist/persistent` にマウントしたフォルダーです。インストールの例では `/srv/apps/ansibleforms/persistent` です。

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

docker-compose プロジェクトの `data/playbooks` フォルダーです。

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

AnsibleForms の Pod の `/app/dist/persistent` にマウントされた永続ボリュームです。Pod の名前を調べてから、ファイルをコピーします。

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

サーバーの `persistent/playbooks` フォルダーです。インストールの例では `/srv/apps/ansibleforms/server` にあります。

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Git リポジトリで **playbook に使用しますか?** をオンにしている場合、プレイブックはそのリポジトリから実行されます。
> その場合は `hello.yaml` をそのリポジトリにコミットしてください。 [デザイナーと Git](gui/designer-and-git.html) を参照してください。

---

## 3. フォームを作成する

フォームは forms フォルダーにある YAML ファイルです。デザイナーはブラウザー上でこれを編集し、保存する前にチェックします。

1. 上部メニューの **デザイナー** をクリックし、左メニューの **フォーム** をクリックします。
2. 右上のスイッチ（ **デザイナーを開始** ）をクリックします。設定がロックされ、ほかの人が同時に編集できなくなります。
   表示は **自分がロック中** に変わります。
3. ツールバーの最初のボタン **新しいファイル** をクリックし、ファイル名 `hello-world.yaml` を入力します。デザイナーは
   `New Form` という名前のフォームをそこに追加します。
4. エディターの YAML を次のフォームに置き換えます。

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. **検証** （チェックマーク）をクリックし、次に **保存** をクリックします。保存すると `hello-world.yaml` が forms フォルダーに書き込まれます。
6. もう一度スイッチをクリックしてロックを解除します。

![フォームを編集中のデザイナー](assets/screenshots/designer.jpg)

このフォームでは 4 種類のフィールドを使っています。

| フィールド | 種類 | 内容 |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | 必須のテキストボックス |
| `target_env` | [`enum`](formfields/enum.html) | `values` の固定リストから選ぶドロップダウン |
| `vm_size` | [`enum`](formfields/enum.html) | ローカルの [式](expressions/local.html) で値を埋めるドロップダウン。 `__auto__` は最初の項目を選択します |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | チェックボックス。 `true` または `false` として送られます |

`vm_size` は `size` と `cpus` の 2 列を表示し、最初の列である `size` を送ります。別の列を送るには `valueColumn` を指定します。

`roles: [default]` でログインしたすべてのユーザーがこのフォームを実行できるようになり、 `categories: [Default]` で既定の
`config.yaml` が定義しているカテゴリにフォームが入ります。

{: .note }
> `hello-world.yaml` を [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) にコピーし、 [VS Code で検証する](faq.html#vs-code-validation-for-form-files) こともできます。

---

## 4. 起動する

**フォーム** ページからフォームを開きます。上部メニューの **フォーム** をクリックし、 **Default** カテゴリの **Hello world** を選びます。

名前を入力し、必要ならほかのフィールドも変更します。 **Extravars を表示** をクリックするとプレイブックが受け取る内容を確認できます。
最後に **送信** をクリックします。

![フォーム](assets/screenshots/form.jpg)

---

## 5. 出力を確認する

ジョブはすぐに開始され、実行中の出力がフォームの下に表示されます。最後に **完了** のバーが表示されます。

![ジョブの出力](assets/screenshots/run.jpg)

debug タスクが入力した値を表示します。たとえば `Hello Alice: a small machine in development (dry run: True)` です。

インベントリがない場合、暗黙の localhost に関する警告が出ますが、これは想定どおりです。実際のフォームでは [`inventory`](forms/ansible.html) を設定します。

---

## 6. ジョブ履歴で見つける

起動はすべてジョブとして記録されます。上部メニューの **ジョブ** をクリックすると、 **すべてのジョブ** の先頭に新しいジョブがあります。

ジョブをクリックすると出力をもう一度確認でき、 **Extravars を表示** で送られた内容を確認できます。各ジョブの前にあるアイコンで、
ジョブを再起動または削除できます。

![ジョブ履歴](assets/screenshots/job-output.jpg)

---

## 次のステップ

リファレンスページを参考に、このフォームを発展させてください。

* **[フォーム](forms/)** : フォームのすべてのプロパティ、ランナー上のテンプレート、ワークフローフォーム、承認ポイント、通知
* **[フォームフィールド](formfields/)** : すべてのフィールドの種類と、検証、依存関係、レイアウト
* **[式](expressions/)** : REST API、データベース、ファイルからフィールドを埋める
* **[ロール](config/roles.html)** と `config.yaml` の **[カテゴリ](config/categories.html)** : 誰がどのフォームを見られるかを決める
* **[仕組み](how-it-works.html)** : 起動の裏側で何が起きるか、そしてすべてがどこに保存されるか

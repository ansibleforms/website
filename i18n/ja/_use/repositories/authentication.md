---
layout: default
title: 認証
parent: Git リポジトリ
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# 認証
{: .no_toc }

トークンを使った HTTPS、生成された鍵を使った SSH、カスタム git コマンド
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 認証

AnsibleForms の認証方法は、 **URI** の形式によって決まります。

### トークンを使った HTTPS

プライベートな HTTPS リモートの場合は、ユーザーが git ユーザーで、パスワードが個人用アクセストークン (またはパスワード) である
**認証情報** を選びます。

7.3.0 以降、git は `GIT_ASKPASS` を通じてサインインします。ユーザーとトークンはサーバーと通信する各 git コマンドに渡され、URL に
含まれることはありません。そのため、クローンの `.git/config` には残らず、トークンを変更すると次回のプルまたはプッシュから新しいトークンが使われます。トークンには、
プルには読み取り権限、プッシュには書き込み権限が必要です。公開リモートには認証情報は不要です。

7.2.0 までは、両方が `https://<user>:<token>@git.example.com/team/forms.git` のように URL に埋め込まれていました。その当時に作成したクローンは、
次回のプルまたはプッシュでリモートがリポジトリ自身の **URI** に戻されるまで、その URL を保持します。

### 生成された鍵を使った SSH

SSH リモートの場合、AnsibleForms は初回起動時に生成する独自の鍵ペアで認証します。

1. **設定 > 接続 > SSH** の **キー** タブを開き、 **公開鍵** をコピーします。
2. git サーバーで、リポジトリのデプロイキーとして (プッシュする場合は書き込み権限付きで)、またはアクセス権を持つユーザーに追加します。
3. `git@git.example.com:team/forms.git` のような SSH の **URI** でリポジトリを追加し、認証情報は選びません。

鍵ペアは [`HOME_PATH`](../customization/paths.html#env_HOME_PATH) 配下の `.ssh/id_rsa` に置かれます。このフォルダーは
永続ストレージに置いてください。そうしないと、コンテナーを再作成したときに鍵が変わってしまいます。

`user@host:path` 形式の URI でクローンする場合、AnsibleForms はまずそのホストに対して `ssh-keyscan` を実行し、ホストの鍵を
既知のホストに追加します。それ以外のリモートでは、最初のクローンの前に **設定 > 接続 > SSH** の **既知のホスト** タブでホストを
追加してください。

### カスタム git コマンド

クローン、プル、プッシュのコマンドは、git のオプションを追加するなどの目的で、3 つの設定によって置き換えられます。

| 設定 | 既定値 | AnsibleForms が追加するもの |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`、 `--verbose`、URI、名前 |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

7.3.0 以降、これらのコマンドはシェルを介さずに実行されます。引用符は使えますが、 `;`、 `|`、 `&&`、 `>` などのシェル演算子は拒否されます。

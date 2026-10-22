---
layout: default
title: アップグレード
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# アップグレード
{: .no_toc }

AnsibleForms を新しいリリースに移行します
{: .fs-6 .fw-300 }

---

稼働中のインスタンスの管理者向けです。インストールしたときと同じ方法で、新しいリリースに移行します。

---

## このセクションの内容

アップグレードの手順は、AnsibleForms をどの方法でインストールしたかによって異なります。それぞれの方法を個別のページで説明しています。

| ページ | 内容 |
|---|---|
| [v7 へのアップグレード](../upgrade-7.html) | 7 に移行する前に、6.5 のうちに変更しておくこと |
| [インストーラーで](../installation/installer.html#upgrade) | インストーラーで作成したインストールに対する `ansibleforms-installer upgrade` 。バックアップ、リリースノート、ロールバック |
| [Docker](docker.html) | 新しいイメージを pull し、同じ設定でコンテナーを作り直します |
| [Docker Compose](docker-compose.html) | 新しいイメージを pull し、docker-compose プロジェクトを再起動します |
| [ソースから](from-source.html) | 新しいコードを pull し、再ビルドしてアプリケーションを再起動します |
| [Kubernetes](kubernetes.html) | チャートリポジトリを更新し、自分の values で `helm upgrade` を実行します |

{: .note }
> **まずバックアップ** アップグレードの前にバックアップを取ってください（ **設定 → バックアップ** ）。データベースのスキーマは新しいリリースの初回
> 起動時にアップグレードされるため、問題が起きたときにはバックアップがロールバックの起点になります。7.3.0 以降は、古いリリースからアップグレードする前に
> ワーカー自身もリリース名を付けたバックアップを取ります。ただし
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) が `0` の場合は取りません。

受け取るリリースは、実行しているイメージのタグによって決まります。 `latest` は最新のメジャーバージョンを追いかけ、 `7` のようなタグは
そのメジャーバージョンに留まります。すべてのタグは [イメージタグ](../installation/#image-tags) に記載されています。

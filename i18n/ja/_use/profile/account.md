---
layout: default
title: アカウント
parent: プロフィール
nav_order: 1
translated_from: 35964a289ed9b27e456ace0ed3fb2f930c55f533
---

# アカウント
{: .no_toc }

どのユーザーとしてサインインしているか
{: .fs-6 .fw-300 }

---

アカウントビューには、どのユーザーとしてサインインしているかと、アクセス権を決めている要素が表示されます。

- **ユーザー名** と **ログインの種類**: ローカルアカウント、LDAP、Microsoft Entra ID、OpenID Connect のいずれかです。
- **グループ**: ログインに付随するグループです。たとえば `local/admins` や `ldap/Domain Admins` などです。
- **ロール**: `config.yaml` のロールのうち、これらのグループとユーザーに一致するものです。ロールによって、
  表示されるフォームと使用できるオプションが決まります。

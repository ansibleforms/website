---
layout: default
title: 有効にする
parent: 起動時の検証
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# 有効にする
{: .no_toc }

インスタンス全体、または 1 つのフォームに対して
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

起動時の検証には 2 つの設定があります。 **2 つのうち、より厳しい方が適用されます。**

---

## インスタンス全体: `LAUNCH_VALIDATION`

環境変数 [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) は、すべてのフォームに適用されます。

- `off`: サーバー側でのチェックは行われません。ジョブは、ブラウザーまたは呼び出し元が送信した extravars で実行されます。
- `log`: すべての起動がチェックされます。拒否されるはずのものは警告としてログに
  書き込まれますが、起動はこれまでどおり実行されます。
- `enforce` (既定): 無効な起動は拒否され、有効な起動はサーバーが作成した extravars で
  実行されます。

空の値や不明な値も `enforce` とみなされます。変更は再起動なしで反映されます。

{: .warning }
> **アップグレードで動作が変わります。** `LAUNCH_VALIDATION` を設定していないインスタンスでは、アップグレード後、
> すべての起動が強制的に検証されます。 `rawFormData` なしで、またはフォームのルールに反する値で `POST /api/v2/job` を呼び出すスクリプトは、
> `422` で拒否されます。何が拒否されるかを確認するには、アップグレード前に
> `LAUNCH_VALIDATION=log` を設定してください。以前の動作を維持するには `off` を設定します ( [展開する](rolling-it-out.html) を参照)。

---

## 1 つのフォーム: `launchValidation`

フォームは独自のレベルを設定できます。

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

この設定は、 `off` または `log` で運用しているインスタンスで、REST で起動されることがわかっているフォームに使います。
そのフォームは強制的に検証され、インスタンスのそれ以外の部分はそうなりません。デザイナーのフォーム設定でも
設定できます。

**フォームはインスタンスより厳しくできますが、緩くはできません。** `LAUNCH_VALIDATION` が
`enforce` の場合、フォームの `launchValidation: off` は効果がありません。フォームが運用者の判断を
上書きすることはできません。

ウィザードフォームもこの設定を使います。ウィザードの起動はステップごとにチェックされ、各ステップはそれ自身の
サブフォームに照らしてチェックされます ( [ウィザードフォーム](rolling-it-out.html#wizard-forms) を参照)。

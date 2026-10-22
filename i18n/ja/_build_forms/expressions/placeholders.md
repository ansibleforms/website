---
layout: default
title: プレースホルダー
parent: 式
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# プレースホルダー
{: .no_toc }

`$(...)` でほかのフィールド、定数、現在のユーザーを参照する
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## プレースホルダーとは

プレースホルダーは `$(reference)` の形式で書く参照です。それを含むテキストが使われる前に、値に置き換えられます。

プレースホルダーは、フィールドの `expression`、 `query`、 `default` ( `evalDefault` で評価される場合) と、 `label`、
`help`、 `placeholder` で使えます。プレースホルダーを含むフィールドは、そこで指定したフィールドに依存します。そのフィールドに
値が入るまで待ち、その値が変わるたびに再評価されます。連動するドロップダウンはこのしくみで作ります。

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## プレースホルダーで参照できるもの

プレースホルダーは、フォームのフィールド、またはすべてのフォームにある次のいずれかを指定します。

| 参照 | 内容 |
|---|---|
| `$(field)` | フォームのほかのフィールドの値 |
| `$(name)`、定数 | `config.yaml` の [定数](../config/constants.html)、またはフォームの `varsFiles` の値 |
| `$(__user__)` | サインインしているユーザー: `username`、 `type`、 `groups`、 `roles` |
| `$(__parent__.field)` | [サブフォーム](../forms/subform.html) (list の行、ウィザードのステップ) で、親フォームの値 |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## 値の一部を参照する

パスが英字、数字、 `_`、 `-`、 `.`、 `[n]` だけで構成されていれば、ドット記法とインデックス記法で値の一部を読み取れます。

| プレースホルダー | 対象 | 得られるもの |
|---|---|---|
| `$(field)` | text、number、password フィールド | 値 |
| `$(field)` | レコードの enum | 選択したレコードの `placeholderColumn`、それがなければ最初の列 |
| `$(field.col)` | レコードの enum | 選択したレコードのその列 |
| `$(field)` | `multiple: true` の enum | 選択したすべてのレコードの選択された列を配列で |
| `$(field)` | expression、list、定数 | 値全体 (list の場合はその行) |
| `$(field.a.b)`、 `$(f[0].x)` | expression、list、定数 | オブジェクトまたは配列のその部分 |

enum に `placeholderColumn: "*"` を設定すると、 `$(field)` は 1 つの列ではなく、選択したレコード全体を返します。

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## 値の埋め込み方

値がテキストにどのように埋め込まれるかは、プレースホルダーの位置によって決まります。

| 位置 | 例 | 結果 |
|---|---|---|
| 式の中、引用符の外 | `$(count) + 1` | JavaScript のリテラル。数値は数値のまま、テキストは引用符付きの文字列、オブジェクトや配列はリテラルになります |
| 式の中、引用符で囲まれた文字列全体 | `fn.fnLs('$(dir)')` | 引用符を含めて同じリテラルになるため、引用符を含む値でも文字列から抜け出せません |
| 式の中、より長い文字列の内部 | `'$(dir)/vars'` | その文字列用にエスケープされたテキスト |
| クエリ、ラベル、ヘルプテキスト | `where city='$(city)'` | テキスト |

プレースホルダーをまだすべて解決できないフィールドは評価されません。 `ignoreIncomplete: true` の場合は、代わりに不足している値が
`undefined` として埋め込まれます。

### 値に含まれるバッククォートと `${`

7.3.0 以降、サーバーがフィールドの値を式に埋め込むとき (リモート式、起動時の検証、MCP、チャット)、その値がコードとして実行されることはありません。
値に含まれるバッククォートや `${` は Unicode エスケープ ( `\u0060`、 `\u0024{` ) として書き込まれるため、
テンプレートリテラルの中でもテキストのままです。サーバー側の式はテンプレートリテラル自体を拒否します。テンプレートリテラルには `runLocal` を使ってください。

ブラウザーで評価される `runLocal` の式は、このエスケープを行わずに上の表のとおりに値を埋め込みます。そのため、そこでは
テンプレートリテラルの中にプレースホルダーを置かないでください。

---

## 関連項目

関連するページと FAQ の項目:

- [ローカル式](local.html) と [リモート式](remote.html): ほとんどのプレースホルダーが使われる場所
- [FAQ: 連動するドロップダウン](../faq.html#cascaded-dropdowns) と [フィールドのプレースホルダー](../faq.html#field-placeholders): その他の例
- [FAQ: サブフォームの中で親フォームのデータにアクセスするには?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)

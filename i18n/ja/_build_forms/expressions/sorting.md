---
layout: default
title: 並べ替え
parent: 式
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# 並べ替え
{: .no_toc }

並べ替えオブジェクトで配列を並べ替える
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 配列を並べ替える

式、REST API、データベースから得た配列を、並べ替えオブジェクトで並べ替えます。

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## 並べ替えオブジェクト

REST 関数 ( `fn.fnRestBasic`、 `fn.fnRestAdvanced`、 `fn.fnRestJwt`、 `fn.fnRestJwtSecure` ) は、この並べ替えオブジェクトを
引数として受け取ります。 `fn.fnJq` やファイルの読み取りなど、それ以外の結果は `fn.fnSort` で囲んでください。

```javascript
// The sorting object can have multiple forms, for example :

'name' // will sort ascending on property name
['name','email'] // will first sort on name, then on email
{name:{direction:'desc'}} // will sort on name descending
{name:{ignoreCase:true}} // will sort on name ascending, ignoring case
['name',{email:{ignoreCase:true,direction:'asc'}}] // will sort on name first, then on email, ignoring case
{'':{}} // a special case for sorting a flat array which has no headername (properties)
{'':{direction:'desc'}} // sort a flat array descending
```

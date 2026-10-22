---
layout: default
title: 排序
parent: 表达式
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# 排序
{: .no_toc }

用排序对象对数组排序
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 对数组排序

用排序对象对来自表达式、REST API 或数据库的数组进行排序：

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## 排序对象

REST 函数（ `fn.fnRestBasic` 、 `fn.fnRestAdvanced` 、 `fn.fnRestJwt` 、 `fn.fnRestJwtSecure` ）接受这个排序对象
作为参数。对于其他任何结果，例如 `fn.fnJq` 或读取文件的结果，请用 `fn.fnSort` 包裹。

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

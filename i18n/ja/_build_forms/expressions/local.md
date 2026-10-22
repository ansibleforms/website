---
layout: default
title: ローカル式
parent: 式
nav_order: 1
translated_from: 77a88157a129701065cf770bf1005b4391140aa1
---

# ローカル式
{: .no_toc }

ブラウザーのサンドボックスで実行される JavaScript
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

次の例は、フィールドのプロパティ `runLocal: true` で実行されます。  
ブラウザーのサンドボックスで実行され、完全な JavaScript エンジンを利用できます。

{: .note }
> **ヒント**: 種類 `local` は `type: expression, runLocal: true, hide: true, output: false` の別名として使えます  
> **ヒント**: 種類 `local_out` は `type: expression, runLocal: true, hide: true` の別名として使えます  

---

## 命名規則

文字列操作を使って命名規則を適用します。

```javascript
'$(field1) $(field2)'.replace('-','_').toUpperCase()
```

---

## 計算

数学関数を使って計算します。

```javascript
Math.round($(field1)*$(field2)*Math.PI)   // Math.round and Math.PI are native javascript
```

---

## 変換

バイトをギガバイトに変換します。

```javascript
($(size_bytes)/1024/1024/1024).toFixed(2)  // toFixed is native javascript method
```

---

## オブジェクトの配列を HTML の表に変換する

オブジェクトの配列 (たとえばほかのフィールドの値) を、 `html` フィールド用の HTML の表に変換します。

```javascript
fnToTable($(my_array_field),{
  tableClass: '',
  escapeHtml: true,
  emptyCell: '',
  includeHeader: true
})

// output : an html-table representation of the array of objects taken from another field called "my_array_field"
// tip : add tableClass: 'table table-striped table-bordered' for bootstrap styling
```

---

## 連番付きの名前を取得する

自動採番では、番号付きの文字列の配列から次の名前を求める必要がある場合があります。  
この関数は、サーバー側の式としても ( `fn.` を付けて) 使用できます。

```javascript
fnGetNumberedName(['server001','server002','server005'],'server###','server001',false)
// result : "server006"

fnGetNumberedName(['server001','server002','server005'],'server###','server001',true)
// result : "server003"

fnGetNumberedName($(fieldlist),'server###','server001',true)
// use another expression field as input for the array

// fnGetNumberedName(array,pattern,default,fillgaps)
// This function searches for a numbered pattern in a list of string, 
// increases the highest number and returns a name like the pattern
// - array : an array object, you can use a placeholder to an expression where you know it's an array
// - pattern : a string that hold the # as a digit
// - default : if no value is found, return this default
// - fillgaps : a boolean to indicate it can fill gaps in the numbers, 1,2,3,6 => 4
```

最初の引数が配列でない場合、ローカルの関数は既定値を返します。サーバーの関数 `fn.fnGetNumberedName` の場合は、
代わりにエラーで失敗します。

---

## オブジェクトの配列の操作

オブジェクトの配列は、絞り込み、変更、並べ替えが必要になることがよくあります。  
AnsibleForms には、このコードを簡潔に保つためのカスタムヘルパーがあります。

```javascript
/* 
  fnArray.from($(your_array_field))                               // custom helper library
      .filterBy({property1:'value1',property2:'value2', ...})     // filters by property value (a string, * wildcards allowed)
      .regexBy({property1:'regex1',property2:'regex2', ...})      // filters the array by property matched against regex
      .distinctBy('property1','property2', ...)                   // will make the array entries unique by property
      .selectAttr({prop1:'property1',prop2:'property2'})          // only selects a certain property, and you can relabel them
      .sortBy('property1','-property2', ...)                      // will order the array.  To have descending add a "-" (minus) before the property

  mylist:
  [
    {
      name:'Spiderman',
      has_ability: true,
      ability: 'Can do whatever a spider can'
    },
    {
      name:'Superman',
      has_ability: true,
      ability: 'Superstrong,Flying,Laserbeams'
    },     
    {
      name:'FamilyGuy',
      has_ability: false
    },    
    {
      name:'Wolverine',
      has_ability: true,
      ability: 'Enhanced healing'
    }                                                  
  ]
*/

fnArray.from($(mylist))         // take data from another field 'mylist'
.regexBy({name:'.*man$'})       // name must end with 'man'
.filterBy({has_ability:'true'}) // must have abilities (a string: 'true', not true)
.selectAttr({name:'name',ability:'ability'})   // only take properties name and ability
.sortBy('-name')                // sort by name descending

/*
  result : 
  [
    {name:'Superman',ability:'Superstrong,Flying,Laserbeams'},
    {name:'Spiderman',ability:'Can do whatever a spider can'}
  ]
*/
```

---

## 素の JavaScript によるオブジェクトの配列の操作

`map`、 `forEach`、 `find`、 `filter`、 `reduce` など、JavaScript の標準の配列メソッドはすべて、データの絞り込みや変更に引き続き使用できます。

```javascript
// source : https://medium.com/@jeff_long/understanding-foreach-map-filter-and-find-in-javascript-f91da93b9f2c

mylist=
  [
    {
      name:'Bob',
      age: 5
    },
    {
      name:'Tom',
      age: 10
    },     
    {
      name:'Paul',
      age: 30
    },    
    {
      name:'Tom',
      age: 40
    }                                                  
  ]

// simple filter
$(mylist).filter((x) => x.age<=20) // filter age<=20
/* result:
[
  {name:'Bob',age:5},
  {name:'Tom',age:10}
]
*/

// filter and addition
$(mylist)
  .filter((x) => x.age<=20)   // filter age<=20
  .map((x) => { return {...x,diff:20-x.age} }) // add new property diff
/* result:
[
  {name:'Bob',age:5,diff:15},
  {name:'Tom',age:10,diff:10}
] 
*/

// find
$(mylist).find((x) => x.name=='Tom').age  // find age of first Tom
// result: 10

// make sum with reduce
$(mylist).reduce((sum,x) => sum+x.age,0) // calculate sum of ages
// result: 85

// make temp function
((arr,min)=>{
  return arr
    .filter(x => x.age>=min)  // filter
    .map(x => {
      var preview=`${x.name} (${x.age})`; // make preview string
      return {...x,preview:preview} })    // add new preview property
})($(mylist),20)                          // feed function with mylist and 20       
/* result:
[
  {name:'Paul',age:30,preview:'Paul (30)'},
  {name:'Tom',age:40,preview:'Tom (40)'}
] 
*/
```

---

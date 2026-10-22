---
layout: default
title: Wyrażenia lokalne
parent: Wyrażenia
nav_order: 1
translated_from: 77a88157a129701065cf770bf1005b4391140aa1
---

# Wyrażenia lokalne
{: .no_toc }

JavaScript wykonywany w piaskownicy przeglądarki
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Poniższe przykłady działają z właściwością pola `runLocal: true`.  
Wykonują się w piaskownicy przeglądarki i mogą korzystać z pełnego silnika JavaScript.

{: .note }
> **Wskazówka**: typu `local` używaj jako aliasu dla `type: expression, runLocal: true, hide: true, output: false`  
> **Wskazówka**: typu `local_out` używaj jako aliasu dla `type: expression, runLocal: true, hide: true`  

---

## Konwencja nazewnictwa

Stosuj konwencje nazewnictwa za pomocą operacji na ciągach znaków.

```javascript
'$(field1) $(field2)'.replace('-','_').toUpperCase()
```

---

## Obliczenia

Wykonuj obliczenia za pomocą matematyki.

```javascript
Math.round($(field1)*$(field2)*Math.PI)   // Math.round and Math.PI are native javascript
```

---

## Konwersje

Zamiana bajtów na gigabajty.

```javascript
($(size_bytes)/1024/1024/1024).toFixed(2)  // toFixed is native javascript method
```

---

## Zamiana tablicy obiektów na tabelę HTML

Zamień tablicę obiektów, na przykład z innego pola, na tabelę HTML dla pola `html`:

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

## Nazwa z kolejnym numerem

Przy automatycznej numeracji może być potrzebne znalezienie następnej nazwy w tablicy numerowanych ciągów.  
Ta funkcja jest dostępna także jako wyrażenie po stronie serwera (z prefiksem `fn.`).

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

Gdy pierwszy argument nie jest tablicą, funkcja lokalna zwraca wartość domyślną. Funkcja serwerowa `fn.fnGetNumberedName`
w takim przypadku kończy się błędem.

---

## Operacje na tablicach obiektów

Tablice obiektów często trzeba filtrować, modyfikować i sortować.  
AnsibleForms zawiera własną funkcję pomocniczą, dzięki której ten kod pozostaje zwięzły.

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

## Operacje na tablicach obiektów w czystym JavaScripcie

Do filtrowania i modyfikowania danych nadal dostępne są wszystkie standardowe metody tablic JavaScript, takie jak `map`, `forEach`, `find`, `filter` i `reduce`.

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

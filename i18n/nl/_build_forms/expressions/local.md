---
layout: default
title: Lokale expressies
parent: Expressies
nav_order: 1
translated_from: 77a88157a129701065cf770bf1005b4391140aa1
---

# Lokale expressies
{: .no_toc }

JavaScript dat in de sandbox van de browser draait
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

De volgende voorbeelden draaien met de veldeigenschap `runLocal: true`.  
Ze worden uitgevoerd in de sandbox van de browser en kunnen de volledige JavaScript-engine benutten.

{: .note }
> **Tip**: gebruik het type `local` als alias voor `type: expression, runLocal: true, hide: true, output: false`  
> **Tip**: gebruik het type `local_out` als alias voor `type: expression, runLocal: true, hide: true`  

---

## Naamgevingsconventie

Gebruik stringbewerkingen om naamgevingsconventies toe te passen.

```javascript
'$(field1) $(field2)'.replace('-','_').toUpperCase()
```

---

## Berekening

Gebruik wiskunde om berekeningen te maken.

```javascript
Math.round($(field1)*$(field2)*Math.PI)   // Math.round and Math.PI are native javascript
```

---

## Conversies

Reken bytes om naar gigabytes.

```javascript
($(size_bytes)/1024/1024/1024).toFixed(2)  // toFixed is native javascript method
```

---

## Een array van objecten omzetten naar een HTML-tabel

Zet een array van objecten, bijvoorbeeld uit een ander veld, om naar een HTML-tabel voor een `html`-veld:

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

## Een naam met oplopende nummering ophalen

Bij automatische nummering moet je soms de volgende naam vinden in een array van genummerde strings.  
Deze functie is ook beschikbaar als expressie aan de serverkant (met het voorvoegsel `fn.`).

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

Is het eerste argument geen array, dan geeft de lokale functie de standaardwaarde terug. De serverfunctie `fn.fnGetNumberedName`
mislukt in dat geval met een fout.

---

## Arrays van objecten bewerken

Arrays van objecten moeten vaak worden gefilterd, aangepast en gesorteerd.  
AnsibleForms heeft een eigen hulpfunctie die deze code beknopt houdt.

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

## Arrays van objecten bewerken met gewoon JavaScript

Alle standaard arraymethoden van JavaScript blijven beschikbaar om je gegevens te filteren en aan te passen, zoals `map`, `forEach`, `find`, `filter` en `reduce`.

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

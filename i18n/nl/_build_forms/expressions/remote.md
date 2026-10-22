---
layout: default
title: Remote expressies
parent: Expressies
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Remote expressies
{: .no_toc }

Functies aan de serverkant voor datums, netwerken, bestanden, SSH en genummerde namen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

De volgende voorbeelden draaien met de veldeigenschap `runLocal: false` (standaard).  
Ze worden aan de serverkant geëvalueerd.

Omdat het evalueren van code op de server een beveiligingsrisico is, wordt de expressie opgeschoond en beperkt tot de functies die
met AnsibleForms worden meegeleverd en de [functies die je zelf toevoegt](#your-own-functions).  
Expressies aan de serverkant zijn bedoeld om informatie op te halen uit gegevensbronnen zoals bestanden, REST API's en SSH-commando's.

{: .important }
De ingebouwde functies aan de serverkant hebben het voorvoegsel `fn.` (bijvoorbeeld `fn.fnRestBasic`), je eigen functies `fnc.`.

---

## Datum en tijd bewerken

Werk met datums en tijden via [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## CIDR-informatie van een IP-adres ophalen

Haal het subnet van een IP-adres en netmasker op, en controleer welke adressen erbij horen:

```javascript
fn.fnCidr('172.16.0.1','255.255.0.0')

// fn.fnCidr(ip,netmask)
// - ip : an ip address
// - netmask : a netmask
//  
// it will return the Cidr subnet information as well as expose a `contains` method to check whether an ip is part of this subnet.
// {
//   "networkAddress":"172.16.0.0",
//   "firstAddress":"172.16.0.1",
//   "lastAddress":"172.16.255.254",
//   "broadcastAddress":"172.16.255.255",
//   "subnetMask":"255.255.0.0",
//   "subnetMaskLength":16,
//   "numHosts":65534,
//   "length":65536,
//   "contains":(ip)=>{return ...}
// }
```

---

## SSH-uitvoer ophalen

Voer via SSH een commando uit op een remote host en gebruik de uitvoer:

```javascript
fn.fnSsh('root','172.16.0.1','ls -la')

// fn.fnSsh(user,host,command,jq-expression,timeoutSeconds)
// - user : the ssh user
// - host : the host
// - command : the command to trigger by ssh, as the remote host's shell reads it
// - jq-expression : an optional jq-expression (https://jqplay.org), applied to the output lines
// - timeoutSeconds : an optional time limit, 60 seconds by default; running out of time is an error
//
// it returns the output lines (stdout and stderr) and a last line exit(<code>) with the exit code.
// ssh itself is started without a local shell, so the user and host can never become a second local command.
//
// You must use 'known_hosts' and 'public-key' to setup non-interactive password-less authentication.
// In the settings you can find the public-key and add your target-host to known_hosts
```

---

## Bestanden in een map opsommen

Som de bestanden van een map op de AnsibleForms-server op, desgewenst recursief en gefilterd:

```javascript
fn.fnLs('/tmp',{ recursive: true, regex: '.*\\.log$', metadata: true })

// fn.fnLs(path,options)
// - path : path to directory
// - options : recursive:boolean, regex:string ,metadata:boolean
//   - recursive : whether to list files recursively
//   - regex : a regular expression, matched against the path relative to the listed directory
//   - metadata : whether to return objects with file metadata (path, name, type, size, created, modified, ...)
//
// directories are always listed too, with a trailing / (such as 'logs/'), and the regex sees that slash as well
```

---

## Een HTML-pagina parsen

Haal een HTML-pagina op en haal de delen eruit die overeenkomen met een reguliere expressie:

```javascript
fn.fnParseHtmlWithRegex('https://ansibleguy.com','<h2.*?>(.*?)</h2>','g')

// fn.fnParseHtmlWithRegex(url,regex,flags,credential)
// - url : url to html page
// - regex : a regular expression, groups ( ) are optional
// - flags : regex flags (such as g,i,m), defaults to 'g'; without g only the first match is returned
// - credential : an optional credential name, used for basic authentication
//                (a credential without both a user and a password is ignored, the page is fetched without authentication)
//
// it will grab the html source and return an array with one object per match, at most 10000 :
// { fullMatch, groups (the numbered group matches), namedGroups }
```

De pagina wordt opgehaald onder [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) en
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), net als bij de REST-functies. Anders dan die negeert ze
`REST_IGNORE_CERTS` en `REST_TIMEOUT_SECONDS`: ze controleert altijd het certificaat en wacht hooguit 30 seconden.

---

## DNS-informatie ophalen

Los een DNS-record van een domein op:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Een JSON-bestand lezen

Lees een JSON-bestand op de server, desgewenst gefilterd met jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Een YAML-bestand lezen

Lees een YAML-bestand op de server, desgewenst gefilterd met jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Een naam met oplopende nummering ophalen

In een array van strings met oplopende nummers (server001, server002, ...) moet je soms de volgende vrije naam vinden.  
Deze functie is ook beschikbaar als lokale expressie (zonder het voorvoegsel `fn.`).

```javascript
fn.fnGetNumberedName(['server001','server002','server005'],'server###','server001',false)
// result : "server006"

fn.fnGetNumberedName(['server001','server002','server005'],'server###','server001',true)
// result : "server003"

fn.fnGetNumberedName($(fieldlist),'server###','server001',true)
// use another expression field as input for the array

// fn.fnGetNumberedName(array,pattern,default,fillgaps)
// This function searches for a numbered pattern in a list of string, 
// increases the highest number and returns a name like the pattern
// - array : an array object, you can use a placeholder to an expression where you know it's an array
// - pattern : a string that hold the # as a digit
// - default : if no value is found, return this default
// - fillgaps : a boolean to indicate it can fill gaps in the numbers, 1,2,3,6 => 4
```

Op de server mislukt `fn.fnGetNumberedName` met een fout wanneer het eerste argument geen array is. De lokale expressie
(zonder `fn.`) geeft in dat geval de standaardwaarde terug.

---

## Je eigen functies

Voeg eigen JavaScript-functies toe aan `custom.js`, en roep ze in een serverexpressie aan met het voorvoegsel `fnc.`.

Het bestand exporteert een object met functies. Het bestand dat met de image wordt meegeleverd, bevat twee voorbeelden:

```javascript
import logger from "../lib/logger.js";

const fnSum = function(a,b) {
  logger.debug("[fnSum] sum is happening")
  return a+b
};
const fnMultiply = function(a,b) {
  logger.debug("[fnMultiply] multiply is happening")
  return a*b
};

export default {
  fnSum,
  fnMultiply
};
```

```yaml
- name: total
  type: expression
  expression: fnc.fnSum($(disk_count), 10)
```

Op dezelfde manier bevat `jq.custom.definitions` je eigen jq-definities. Die worden vóór elke jq-query gezet die de
server uitvoert, zodat de [jq-query's](jq.html) van elke functie ze kunnen gebruiken.

Koppel in een container beide bestanden over die in de image heen, en herstart; ze worden gelezen wanneer de server start:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Een eigen functie draait binnen het serverproces, met de rechten daarvan, telkens als een expressie haar aanroept. De
> [sanitizer](index.html#security-concerns) controleert dat de expressie alleen `fn.`- en `fnc.`-functies aanroept; wat een
> functie met haar argumenten doet, is jouw verantwoordelijkheid.

---
layout: default
title: Remote-Ausdrücke
parent: Ausdrücke
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Remote-Ausdrücke
{: .no_toc }

Serverseitige Funktionen für Datumswerte, Netzwerke, Dateien, SSH und nummerierte Namen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Die folgenden Beispiele laufen mit der Feldeigenschaft `runLocal: false` (Standard).  
Sie werden auf der Serverseite ausgewertet.

Da das Auswerten von Code auf dem Server ein Sicherheitsrisiko ist, wird der Ausdruck bereinigt und auf die Funktionen beschränkt, die
AnsibleForms mitbringt, sowie auf die [Funktionen, die Sie selbst hinzufügen](#your-own-functions).  
Serverseitige Ausdrücke sind dafür gedacht, Informationen aus Datenquellen wie Dateien, REST-APIs und SSH-Befehlen abzurufen.

{: .important }
Die integrierten serverseitigen Funktionen haben das Präfix `fn.` (zum Beispiel `fn.fnRestBasic`), Ihre eigenen das Präfix `fnc.`.

---

## Datum und Uhrzeit bearbeiten

Arbeiten Sie mit Datum und Uhrzeit über [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## CIDR-Informationen zu einer IP abrufen

Ermitteln Sie das Subnetz einer IP-Adresse und Netzmaske, und prüfen Sie, welche Adressen dazugehören:

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

## SSH-Ausgabe abrufen

Führen Sie einen Befehl per SSH auf einem entfernten Host aus und verwenden Sie seine Ausgabe:

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

## Dateien in einem Verzeichnis auflisten

Listen Sie die Dateien eines Verzeichnisses auf dem AnsibleForms-Server auf, optional rekursiv und gefiltert:

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

## HTML-Seite parsen

Rufen Sie eine HTML-Seite ab und extrahieren Sie die Teile, die auf einen regulären Ausdruck passen:

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

Die Seite wird unter [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) und
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) abgerufen, wie bei den REST-Funktionen. Anders als diese ignoriert sie
`REST_IGNORE_CERTS` und `REST_TIMEOUT_SECONDS`: Sie prüft immer das Zertifikat und wartet höchstens 30 Sekunden.

---

## DNS-Informationen abrufen

Lösen Sie einen DNS-Eintrag einer Domain auf:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## JSON-Datei lesen

Lesen Sie eine JSON-Datei auf dem Server, optional mit jq gefiltert:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## YAML-Datei lesen

Lesen Sie eine YAML-Datei auf dem Server, optional mit jq gefiltert:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Einen Namen mit fortlaufender Nummerierung ermitteln

In einem Array von Zeichenketten mit fortlaufenden Nummern (server001, server002, ...) müssen Sie eventuell den nächsten freien Namen finden.  
Diese Funktion gibt es auch als lokalen Ausdruck (ohne das Präfix `fn.`).

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

Auf dem Server schlägt `fn.fnGetNumberedName` mit einem Fehler fehl, wenn das erste Argument kein Array ist. Der lokale Ausdruck
(ohne `fn.`) gibt stattdessen den Standardwert zurück.

---

## Eigene Funktionen

Fügen Sie eigene JavaScript-Funktionen in `custom.js` hinzu und rufen Sie sie in einem Serverausdruck mit dem Präfix `fnc.` auf.

Die Datei exportiert ein Objekt mit Funktionen. Die im Image mitgelieferte Datei enthält zwei Beispiele:

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

Auf die gleiche Weise enthält `jq.custom.definitions` eigene jq-Definitionen. Sie werden jeder jq-Abfrage vorangestellt, die der
Server ausführt, sodass die [jq-Abfragen](jq.html) aller Funktionen sie verwenden können.

In einem Container mappen Sie beide Dateien über die im Image und starten neu; sie werden beim Start des Servers gelesen:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Eine eigene Funktion läuft im Serverprozess, mit dessen Rechten, jedes Mal wenn ein Ausdruck sie aufruft. Der
> [Sanitizer](index.html#security-concerns) prüft, dass der Ausdruck nur `fn.`- und `fnc.`-Funktionen aufruft; was eine
> Funktion mit ihren Argumenten macht, liegt bei Ihnen.

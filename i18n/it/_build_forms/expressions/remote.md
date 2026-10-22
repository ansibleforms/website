---
layout: default
title: Espressioni remote
parent: Espressioni
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Espressioni remote
{: .no_toc }

Funzioni lato server per date, reti, file, SSH e nomi numerati
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Gli esempi seguenti girano con la proprietà del campo `runLocal: false` (predefinita).  
Vengono valutati lato server.

Poiché valutare codice sul server è un rischio per la sicurezza, l'espressione viene sanitizzata e limitata alle funzioni fornite
con AnsibleForms e alle [funzioni che aggiungi tu](#your-own-functions).  
Le espressioni lato server servono a recuperare informazioni da sorgenti di dati come file, API REST e comandi SSH.

{: .important }
Le funzioni lato server integrate hanno il prefisso `fn.` (per esempio `fn.fnRestBasic`), le tue il prefisso `fnc.`.

---

## Manipolare data e ora

Lavora con date e orari tramite [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Ottenere informazioni CIDR da un IP

Ottieni la subnet di un indirizzo IP e di una netmask, e verifica quali indirizzi ne fanno parte:

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

## Ottenere l'output SSH

Esegui un comando su un host remoto via SSH e usane l'output:

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

## Elencare i file di una directory

Elenca i file di una directory sul server AnsibleForms, facoltativamente in modo ricorsivo e filtrato:

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

## Analizzare una pagina HTML

Scarica una pagina HTML ed estrai le parti che corrispondono a un'espressione regolare:

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

La pagina viene scaricata rispettando [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) e
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), come le funzioni REST. A differenza di queste, ignora
`REST_IGNORE_CERTS` e `REST_TIMEOUT_SECONDS`: verifica sempre il certificato e attende al massimo 30 secondi.

---

## Ottenere informazioni DNS

Risolvi un record DNS di un dominio:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Leggere un file JSON

Leggi un file JSON sul server, facoltativamente filtrato con jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Leggere un file YAML

Leggi un file YAML sul server, facoltativamente filtrato con jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Ottenere un nome con numerazione incrementale

In un array di stringhe con numeri incrementali (server001, server002, ...), potresti dover trovare il prossimo nome disponibile.  
Questa funzione è disponibile anche come espressione locale (senza il prefisso `fn.`).

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

Sul server, `fn.fnGetNumberedName` fallisce con un errore quando il primo argomento non è un array. L'espressione locale
(senza `fn.`) restituisce invece il valore predefinito.

---

## Le tue funzioni

Aggiungi funzioni JavaScript tue in `custom.js`, e chiamale in un'espressione lato server con il prefisso `fnc.`.

Il file esporta un oggetto di funzioni. Quello incluso nell'immagine contiene due esempi:

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

Allo stesso modo, `jq.custom.definitions` contiene definizioni jq tue. Vengono anteposte a ogni query jq eseguita dal
server, così le [query jq](jq.html) di ogni funzione possono usarle.

In un container, monta entrambi i file sopra quelli dell'immagine e riavvia; vengono letti all'avvio del server:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Una funzione personalizzata gira dentro il processo del server, con i suoi permessi, ogni volta che un'espressione la chiama. Il
> [sanitizzatore](index.html#security-concerns) verifica che l'espressione chiami solo funzioni `fn.` e `fnc.`; cosa una
> funzione fa con i suoi argomenti dipende da te.

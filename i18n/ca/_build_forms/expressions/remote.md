---
layout: default
title: Expressions remotes
parent: Expressions
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Expressions remotes
{: .no_toc }

Funcions del costat del servidor per a dates, xarxes, fitxers, SSH i noms numerats
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Els exemples següents s'executen amb la propietat del camp `runLocal: false` (per defecte).  
S'avaluen al costat del servidor.

Com que avaluar codi al servidor és un risc de seguretat, l'expressió se saneja i es limita a les funcions que
porta AnsibleForms i a les [funcions que hi afegeixis tu](#your-own-functions).  
Les expressions del costat del servidor estan pensades per obtenir informació de fonts de dades com ara fitxers, API REST i ordres SSH.

{: .important }
Les funcions integrades del costat del servidor porten el prefix `fn.` (per exemple, `fn.fnRestBasic`), i les teves, el prefix `fnc.`.

---

## Manipular la data i l'hora

Treballa amb dates i hores mitjançant [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Obtenir la informació CIDR d'una IP

Obtén la subxarxa d'una adreça IP i d'una màscara de xarxa, i comprova quines adreces en formen part:

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

## Obtenir la sortida d'SSH

Executa una ordre en un amfitrió remot per SSH i fes servir la seva sortida:

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

## Llistar els fitxers d'un directori

Llista els fitxers d'un directori del servidor d'AnsibleForms, opcionalment de manera recursiva i filtrats:

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

## Analitzar una pàgina HTML

Obtén una pàgina HTML i extreu-ne les parts que coincideixen amb una expressió regular:

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

La pàgina s'obté sota [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) i
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), com les funcions REST. A diferència d'aquestes, ignora
`REST_IGNORE_CERTS` i `REST_TIMEOUT_SECONDS`: sempre comprova el certificat i espera com a màxim 30 segons.

---

## Obtenir informació DNS

Resol un registre DNS d'un domini:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Llegir un fitxer JSON

Llegeix un fitxer JSON del servidor, opcionalment filtrat amb jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Llegir un fitxer YAML

Llegeix un fitxer YAML del servidor, opcionalment filtrat amb jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Obtenir un nom amb numeració incremental

En una matriu de cadenes amb números incrementals (server001, server002, ...), potser necessites trobar el següent nom disponible.  
Aquesta funció també està disponible com a expressió local (sense el prefix `fn.`).

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

Al servidor, `fn.fnGetNumberedName` falla amb un error quan el primer argument no és una matriu. L'expressió local
(sense `fn.`) retorna el valor per defecte.

---

## Les teves pròpies funcions

Afegeix funcions JavaScript pròpies a `custom.js` i crida-les en una expressió de servidor amb el prefix `fnc.`.

El fitxer exporta un objecte de funcions. El que porta la imatge conté dos exemples:

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

De la mateixa manera, `jq.custom.definitions` conté definicions jq pròpies. S'afegeixen al davant de cada consulta jq que
executa el servidor, de manera que les [consultes jq](jq.html) de qualsevol funció les poden fer servir.

En un contenidor, munta tots dos fitxers per sobre dels de la imatge i reinicia; es llegeixen quan s'inicia el servidor:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Una funció personalitzada s'executa dins del procés del servidor, amb els seus permisos, cada vegada que una expressió la crida. El
> [sanejador](index.html#security-concerns) comprova que l'expressió només cridi funcions `fn.` i `fnc.`; el que una
> funció fa amb els seus arguments és cosa teva.

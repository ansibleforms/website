---
layout: default
title: Wyrażenia zdalne
parent: Wyrażenia
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Wyrażenia zdalne
{: .no_toc }

Funkcje po stronie serwera do dat, sieci, plików, SSH i numerowanych nazw
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Poniższe przykłady działają z właściwością pola `runLocal: false` (domyślnie).  
Są obliczane po stronie serwera.

Ponieważ wykonywanie kodu na serwerze stanowi zagrożenie bezpieczeństwa, wyrażenie jest oczyszczane i ograniczone do funkcji
dostarczanych z AnsibleForms oraz [funkcji dodanych przez ciebie](#your-own-functions).  
Wyrażenia po stronie serwera służą do pobierania informacji ze źródeł danych, takich jak pliki, REST API i polecenia SSH.

{: .important }
Wbudowane funkcje po stronie serwera mają prefiks `fn.` (na przykład `fn.fnRestBasic`), a twoje własne prefiks `fnc.`.

---

## Operacje na dacie i czasie

Pracuj z datami i godzinami za pomocą [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Informacje CIDR dla adresu IP

Pobierz podsieć dla adresu IP i maski sieci oraz sprawdź, które adresy do niej należą:

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

## Wynik polecenia SSH

Uruchom polecenie na zdalnym hoście przez SSH i użyj jego wyniku:

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

## Lista plików w katalogu

Wyświetl pliki katalogu na serwerze AnsibleForms, opcjonalnie rekurencyjnie i z filtrem:

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

## Parsowanie strony HTML

Pobierz stronę HTML i wyodrębnij fragmenty pasujące do wyrażenia regularnego:

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

Strona jest pobierana z uwzględnieniem [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) i
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), tak jak w funkcjach REST. W odróżnieniu od nich ignoruje
`REST_IGNORE_CERTS` i `REST_TIMEOUT_SECONDS`: zawsze sprawdza certyfikat i czeka najwyżej 30 sekund.

---

## Informacje DNS

Rozwiąż rekord DNS domeny:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Odczyt pliku JSON

Odczytaj plik JSON na serwerze, opcjonalnie z filtrem jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Odczyt pliku YAML

Odczytaj plik YAML na serwerze, opcjonalnie z filtrem jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Nazwa z kolejnym numerem

W tablicy ciągów z kolejnymi numerami (server001, server002, ...) może być potrzebne znalezienie następnej wolnej nazwy.  
Ta funkcja jest dostępna także jako wyrażenie lokalne (bez prefiksu `fn.`).

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

Na serwerze `fn.fnGetNumberedName` kończy się błędem, gdy pierwszy argument nie jest tablicą. Wyrażenie lokalne
(bez `fn.`) zwraca wtedy wartość domyślną.

---

## Własne funkcje

Dodaj własne funkcje JavaScript do `custom.js` i wywołuj je w wyrażeniu serwerowym z prefiksem `fnc.`.

Plik eksportuje obiekt z funkcjami. Plik dostarczany z obrazem zawiera dwa przykłady:

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

W ten sam sposób `jq.custom.definitions` zawiera twoje własne definicje jq. Są one dodawane na początku każdego zapytania jq,
które uruchamia serwer, więc [zapytania jq](jq.html) każdej funkcji mogą z nich korzystać.

W kontenerze zamapuj oba pliki w miejsce tych z obrazu i uruchom go ponownie; są odczytywane przy starcie serwera:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Własna funkcja działa wewnątrz procesu serwera, z jego uprawnieniami, za każdym razem, gdy wywoła ją wyrażenie.
> [Sanitizer](index.html#security-concerns) sprawdza, czy wyrażenie wywołuje tylko funkcje `fn.` i `fnc.`; to, co
> funkcja robi ze swoimi argumentami, zależy od ciebie.

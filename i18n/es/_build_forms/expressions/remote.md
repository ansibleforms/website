---
layout: default
title: Expresiones remotas
parent: Expresiones
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Expresiones remotas
{: .no_toc }

Funciones del lado del servidor para fechas, redes, archivos, SSH y nombres numerados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Los siguientes ejemplos se ejecutan con la propiedad de campo `runLocal: false` (por defecto).  
Se evalúan en el lado del servidor.

Como evaluar código en el servidor es un riesgo de seguridad, la expresión se sanea y se limita a las funciones que
incluye AnsibleForms y a las [funciones que añadas tú](#your-own-functions).  
Las expresiones del lado del servidor sirven para obtener información de fuentes de datos como archivos, APIs REST y comandos SSH.

{: .important }
Las funciones integradas del lado del servidor llevan el prefijo `fn.` (por ejemplo, `fn.fnRestBasic`); las tuyas, `fnc.`.

---

## Manipular fechas y horas

Trabaja con fechas y horas mediante [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Obtener información CIDR de una IP

Obtén la subred de una dirección IP y una máscara de red, y comprueba qué direcciones pertenecen a ella:

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

## Obtener la salida de SSH

Ejecuta un comando en un host remoto por SSH y usa su salida:

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

## Listar los archivos de un directorio

Lista los archivos de un directorio del servidor de AnsibleForms, opcionalmente de forma recursiva y filtrada:

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

## Analizar una página HTML

Obtén una página HTML y extrae las partes que coinciden con una expresión regular:

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

La página se obtiene sujeta a [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) y
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), como las funciones REST. A diferencia de ellas, ignora
`REST_IGNORE_CERTS` y `REST_TIMEOUT_SECONDS`: siempre comprueba el certificado y espera como máximo 30 segundos.

---

## Obtener información DNS

Resuelve un registro DNS de un dominio:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Leer un archivo JSON

Lee un archivo JSON del servidor, opcionalmente filtrado con jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Leer un archivo YAML

Lee un archivo YAML del servidor, opcionalmente filtrado con jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Obtener un nombre con numeración incremental

En un array de cadenas con números incrementales (server001, server002, ...), puede que necesites encontrar el siguiente nombre disponible.  
Esta función también está disponible como expresión local (sin el prefijo `fn.`).

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

En el servidor, `fn.fnGetNumberedName` falla con un error cuando el primer argumento no es un array. La expresión local
(sin `fn.`) devuelve en cambio el valor por defecto.

---

## Tus propias funciones

Añade funciones JavaScript propias a `custom.js` y llámalas en una expresión del servidor con el prefijo `fnc.`.

El archivo exporta un objeto de funciones. El que incluye la imagen contiene dos ejemplos:

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

Del mismo modo, `jq.custom.definitions` contiene definiciones jq propias. Se anteponen a cada consulta jq que ejecuta el
servidor, de modo que las [consultas jq](jq.html) de todas las funciones pueden usarlas.

En un contenedor, monta ambos archivos sobre los de la imagen y reinicia; se leen al arrancar el servidor:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Una función personalizada se ejecuta dentro del proceso del servidor, con sus permisos, cada vez que una expresión la llama. El
> [saneador](index.html#security-concerns) comprueba que la expresión solo llama a funciones `fn.` y `fnc.`; lo que una
> función haga con sus argumentos es cosa tuya.

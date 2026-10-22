---
layout: default
title: Expressões remotas
parent: Expressões
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Expressões remotas
{: .no_toc }

Funções do lado do servidor para datas, redes, ficheiros, SSH e nomes numerados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Os exemplos seguintes são executados com a propriedade do campo `runLocal: false` (predefinição).  
São avaliados no lado do servidor.

Como avaliar código no servidor é um risco de segurança, a expressão é sanitizada e limitada às funções que
vêm com o AnsibleForms e às [funções que acrescentar](#your-own-functions).  
As expressões do lado do servidor destinam-se a obter informação de fontes de dados como ficheiros, APIs REST e comandos SSH.

{: .important }
As funções incorporadas do lado do servidor têm o prefixo `fn.` (por exemplo, `fn.fnRestBasic`), as suas têm o prefixo `fnc.`.

---

## Manipular data e hora

Trabalhe com datas e horas através do [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Obter informação CIDR a partir de um IP

Obtenha a sub-rede de um endereço IP e máscara de rede, e verifique que endereços lhe pertencem:

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

## Obter o resultado de SSH

Execute um comando num host remoto por SSH e use o seu resultado:

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

## Listar os ficheiros de um diretório

Liste os ficheiros de um diretório no servidor do AnsibleForms, opcionalmente de forma recursiva e filtrada:

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

## Analisar uma página HTML

Obtenha uma página HTML e extraia as partes que correspondem a uma expressão regular:

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

A página é obtida sob [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) e
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), tal como as funções REST. Ao contrário delas, ignora
`REST_IGNORE_CERTS` e `REST_TIMEOUT_SECONDS`: verifica sempre o certificado e espera no máximo 30 segundos.

---

## Obter informação DNS

Resolva um registo DNS de um domínio:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Ler um ficheiro JSON

Leia um ficheiro JSON no servidor, opcionalmente filtrado com jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Ler um ficheiro YAML

Leia um ficheiro YAML no servidor, opcionalmente filtrado com jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Obter um nome com numeração incremental

Num array de strings com números incrementais (server001, server002, ...), pode ser necessário encontrar o nome seguinte disponível.  
Esta função também está disponível como expressão local (sem o prefixo `fn.`).

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

No servidor, `fn.fnGetNumberedName` falha com um erro quando o primeiro argumento não é um array. A expressão local
(sem `fn.`), pelo contrário, devolve o valor predefinido.

---

## As suas próprias funções

Acrescente as suas próprias funções JavaScript ao `custom.js` e chame-as numa expressão do servidor com o prefixo `fnc.`.

O ficheiro exporta um objeto de funções. O que vem com a imagem contém dois exemplos:

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

Da mesma forma, `jq.custom.definitions` contém as suas próprias definições jq. São colocadas antes de cada consulta jq que o
servidor executa, pelo que as [consultas jq](jq.html) de todas as funções as podem usar.

Num contentor, mapeie ambos os ficheiros por cima dos da imagem e reinicie; são lidos quando o servidor arranca:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Uma função personalizada é executada dentro do processo do servidor, com os seus privilégios, sempre que uma expressão a chama. O
> [sanitizador](index.html#security-concerns) verifica que a expressão só chama funções `fn.` e `fnc.`; o que uma
> função faz com os seus argumentos é da sua responsabilidade.

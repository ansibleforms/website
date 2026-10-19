---
layout: default
title: Remote expressions
parent: Expressions
nav_order: 2
---

# Remote expressions
{: .no_toc }

Server-side functions for dates, networks, files, SSH and numbered names
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The following examples run with the field property `runLocal: false` (default).  
They are evaluated on the server side.

Because evaluating code on the server is a security risk, the expression is sanitized and limited to the functions that
come with AnsibleForms and the [functions you add yourself](#your-own-functions).  
Server-side expressions are meant to retrieve information from data sources such as files, REST APIs and SSH commands.

{: .important }
The built-in server-side functions are prefixed with `fn.` (for example, `fn.fnRestBasic`), your own with `fnc.`.

---

## Manipulate Date and Time

Work with dates and times through [Day.js](https://day.js.org):

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Get CIDR Info from IP

Get the subnet of an IP address and netmask, and check which addresses belong to it:

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

## Get SSH Output

Run a command on a remote host over SSH and use its output:

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

## List Files in a Directory

List the files of a directory on the AnsibleForms server, optionally recursively and filtered:

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

## Parse HTML Page

Fetch an HTML page and extract the parts that match a regular expression:

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

The page is fetched under [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) and
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), like the REST functions. Unlike them, it ignores
`REST_IGNORE_CERTS` and `REST_TIMEOUT_SECONDS`: it always checks the certificate and waits at most 30 seconds.

---

## Get DNS Info

Resolve a DNS record of a domain:

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Read JSON File

Read a JSON file on the server, optionally filtered with jq:

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Read YAML File

Read a YAML file on the server, optionally filtered with jq:

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Get a Name with Incremental Numbering

In an array of strings with incremental numbers (server001, server002, ...), you may need to find the next available name.  
This function is also available as a local expression (without the `fn.` prefix).

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

On the server, `fn.fnGetNumberedName` fails with an error when the first argument is not an array. The local expression
(without `fn.`) returns the default instead.

---

## Your own functions

Add JavaScript functions of your own to `custom.js`, and call them in a server expression with the prefix `fnc.`.

The file exports an object of functions. The one the image ships with holds two examples:

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

In the same way, `jq.custom.definitions` holds jq definitions of your own. They are put in front of every jq query the
server runs, so the [jq queries](jq.html) of every function can use them.

In a container, map both files over the ones in the image, and restart; they are read when the server starts:

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> A custom function runs inside the server process, with its rights, each time an expression calls it. The
> [sanitizer](index.html#security-concerns) checks that the expression only calls `fn.` and `fnc.` functions; what a
> function does with its arguments is up to you.

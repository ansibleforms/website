---
layout: default
title: Expressions distantes
parent: Expressions
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# Expressions distantes
{: .no_toc }

Fonctions côté serveur pour les dates, réseaux, fichiers, SSH et noms numérotés
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Les exemples suivants s'exécutent avec la propriété de champ `runLocal: false` (par défaut).  
Ils sont évalués côté serveur.

Comme évaluer du code sur le serveur présente un risque de sécurité, l'expression est filtrée et limitée aux fonctions
fournies avec AnsibleForms et aux [fonctions que vous ajoutez vous-même](#your-own-functions).  
Les expressions côté serveur servent à récupérer des informations depuis des sources de données comme des fichiers, des API REST et des commandes SSH.

{: .important }
Les fonctions côté serveur intégrées sont préfixées par `fn.` (par exemple `fn.fnRestBasic`), les vôtres par `fnc.`.

---

## Manipuler la date et l'heure

Travaillez avec les dates et les heures grâce à [Day.js](https://day.js.org) :

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## Obtenir les informations CIDR d'une IP

Obtenez le sous-réseau d'une adresse IP et d'un masque, et vérifiez quelles adresses en font partie :

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

## Obtenir la sortie SSH

Exécutez une commande sur un hôte distant via SSH et utilisez sa sortie :

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

## Lister les fichiers d'un répertoire

Listez les fichiers d'un répertoire sur le serveur AnsibleForms, éventuellement de façon récursive et filtrée :

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

## Analyser une page HTML

Récupérez une page HTML et extrayez les parties qui correspondent à une expression régulière :

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

La page est récupérée sous [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) et
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS), comme les fonctions REST. Contrairement à elles, elle ignore
`REST_IGNORE_CERTS` et `REST_TIMEOUT_SECONDS` : elle vérifie toujours le certificat et attend au maximum 30 secondes.

---

## Obtenir des informations DNS

Résolvez un enregistrement DNS d'un domaine :

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## Lire un fichier JSON

Lisez un fichier JSON sur le serveur, éventuellement filtré avec jq :

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Lire un fichier YAML

Lisez un fichier YAML sur le serveur, éventuellement filtré avec jq :

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## Obtenir un nom avec une numérotation incrémentale

Dans un tableau de chaînes à numéros incrémentaux (server001, server002, ...), vous aurez peut-être besoin de trouver le prochain nom disponible.  
Cette fonction est aussi disponible comme expression locale (sans le préfixe `fn.`).

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

Sur le serveur, `fn.fnGetNumberedName` échoue avec une erreur quand le premier argument n'est pas un tableau. L'expression locale
(sans `fn.`) renvoie plutôt la valeur par défaut.

---

## Vos propres fonctions

Ajoutez vos propres fonctions JavaScript à `custom.js`, et appelez-les dans une expression serveur avec le préfixe `fnc.`.

Le fichier exporte un objet de fonctions. Celui fourni avec l'image contient deux exemples :

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

De la même façon, `jq.custom.definitions` contient vos propres définitions jq. Elles sont placées devant chaque requête jq que le
serveur exécute, de sorte que les [requêtes jq](jq.html) de toutes les fonctions peuvent les utiliser.

Dans un conteneur, montez les deux fichiers par-dessus ceux de l'image, puis redémarrez ; ils sont lus au démarrage du serveur :

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> Une fonction personnalisée s'exécute dans le processus du serveur, avec ses droits, chaque fois qu'une expression l'appelle. Le
> [filtre](index.html#security-concerns) vérifie que l'expression n'appelle que des fonctions `fn.` et `fnc.` ; ce qu'une
> fonction fait de ses arguments dépend de vous.

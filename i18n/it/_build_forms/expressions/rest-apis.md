---
layout: default
title: API REST
parent: Espressioni
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# API REST
{: .no_toc }

Chiamare API REST con autenticazione basic, a token o personalizzata
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## API REST con autenticazione basic

Chiama un'API REST con l'utente e la password di una credenziale salvata:

```javascript
fn.fnRestBasic(
  'get',
  'https://resturl/api/',
  '',
  'name_of_credential_in_database',
  '[.records[] | {name:.name, email:.email, spouse:.relations.spouse}]',
  'name',
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted and transformed by javascript.

// fn.fnRestBasic(method,url,body,credentialname,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - credential-name : it will lookup the credentials as you have saved in the gui
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort object : a sort object to order the result
// - hasBigInt : a boolean indicating if it should convert Int64 to string
```

---

## API REST con autenticazione a token

Chiama un'API REST con un bearer token scritto nell'espressione:

```javascript
fn.fnRestJwt(
  'get',
  'https://resturl/api/',
  '',
  'your_jwt_token_in_text',
  '[.records[] | {name:.name, age:.age}]',
  ['age','name'],
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted, first by age, then by name

// fn.fnRestJwt(method,url,body,token,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - token : it will be add as a Bearer Authorization header
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sort object to sort the result
// - hasBigInt : a boolean indicating if it should convert Int64 to string
// - tokenPrefix : a prefix, defaults to 'Bearer' (v5.0.0)
```

---

## API REST con autenticazione a token protetta

Chiama un'API REST con un bearer token preso da una credenziale salvata, così non compare mai nel modulo:

```javascript
fn.fnRestJwtSecure(
  'get',
  'https://resturl/api/',
  '',
  'name_of_credential_in_database',
  '[.records[] | {name:.name, age:.age}]',
  ['age','name'],
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted, first by age, then by name

// fn.fnRestJwtSecure(method,url,body,token,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - credential_name : Encrypted credential will be looked up.  The password will be the token.
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sort object to sort the result   
// - hasBigInt : a boolean indicating if it should convert Int64 to string 
// - tokenPrefix : a prefix, defaults to 'Bearer' (v5.0.0)
```

---

## API REST con header personalizzati

Chiama un'API REST con header tuoi, per qualsiasi altro tipo di autenticazione:

```javascript
fn.fnRestAdvanced(
  'get',
  'https://resturl/api/',
  '',
  {'a_custom_http_header':'your_value','Authorization':'basic base64(my_rest_credential)'},
  '.records[].name',
  {name:{ignoreCase:true,direction:'desc'}},
  false,
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted descending by name

// fn.fnRestAdvanced(method,url,body,{myheader:'value'},jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - headers: an object of headers
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sorting object to order the results
// - hasBigInt : a boolean indicating if it should convert Int64 to string
// - raw : return data and response_headers  
  
// 3 function-placeholders are allowed in the headers:
// - base64(credential_name) : will create a base64 encoded "username:password".  prefix with "basic" if required
// - username(credential_name) : will add the username of the credential
// - password(credential_name) : will add the password of the credential
```

---

## Certificati e timeout

Dalla 7.3.0 ogni funzione helper REST (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) verifica il certificato
TLS dell'endpoint e smette di attendere dopo un tempo prestabilito:

| Impostazione | Cosa cambia |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` salta la verifica del certificato. Fino alla 7.2.0 non veniva mai verificato; lascialo a `0` e affidati invece a una CA privata con `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Quanto attende una chiamata per una risposta, 60 secondi per impostazione predefinita; un endpoint che non risponde mai fa allora fallire il campo invece di tenerlo bloccato |

Dalla 7.3.0 un campo il cui endpoint ha un certificato autofirmato fallisce con un errore di certificato finché non si imposta una delle due.
[Chiamate REST e jq](../customization/security.html#rest-calls-and-jq) le descrive entrambe, e spiega come considerare attendibile una CA privata per tutte le chiamate REST in una volta.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) non è un helper REST: ignora entrambe le impostazioni, verifica sempre il
certificato e attende al massimo 30 secondi.

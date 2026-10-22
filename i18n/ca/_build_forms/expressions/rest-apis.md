---
layout: default
title: API REST
parent: Expressions
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# API REST
{: .no_toc }

Crida API REST amb autenticació bàsica, per token o personalitzada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## API REST amb autenticació bàsica

Crida una API REST amb l'usuari i la contrasenya d'una credencial desada:

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

## API REST amb autenticació per token

Crida una API REST amb un token bearer escrit a l'expressió:

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

## API REST amb autenticació per token segura

Crida una API REST amb un token bearer tret d'una credencial desada, de manera que no apareix mai al formulari:

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

## API REST amb capçaleres personalitzades

Crida una API REST amb capçaleres pròpies, per a qualsevol altre tipus d'autenticació:

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

## Certificats i temps límit

A partir de la 7.3.0, totes les funcions auxiliars REST (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) comproven el certificat
TLS del punt final i deixen d'esperar passat un temps determinat:

| Opció | Què canvia |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` omet la comprovació del certificat. Fins a la 7.2.0 no es comprovava mai; deixa-ho a `0` i, en lloc d'això, confia en una CA privada amb `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Quant de temps espera una crida una resposta, 60 segons per defecte; així, un punt final que no respon mai fa fallar el camp en lloc de deixar-lo bloquejat |

A partir de la 7.3.0, un camp el punt final del qual té un certificat autosignat falla amb un error de certificat fins que es defineix una de les dues opcions.
[Crides REST i jq](../customization/security.html#rest-calls-and-jq) descriu totes dues, i com confiar en una CA privada per a totes les crides REST alhora.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) no és una funció auxiliar REST: ignora totes dues opcions, sempre comprova el
certificat i espera com a màxim 30 segons.

---
layout: default
title: REST API
parent: Wyrażenia
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# REST API
{: .no_toc }

Wywoływanie REST API z uwierzytelnianiem basic, tokenem lub własnym
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## REST API z uwierzytelnianiem basic

Wywołaj REST API z użytkownikiem i hasłem zapisanego poświadczenia:

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

## REST API z uwierzytelnianiem tokenem

Wywołaj REST API z tokenem bearer zapisanym w wyrażeniu:

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

## REST API z zabezpieczonym uwierzytelnianiem tokenem

Wywołaj REST API z tokenem bearer pobranym z zapisanego poświadczenia, dzięki czemu nigdy nie pojawia się on w formularzu:

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

## REST API z własnymi nagłówkami

Wywołaj REST API z własnymi nagłówkami, dla każdego innego rodzaju uwierzytelniania:

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

## Certyfikaty i limity czasu

Od wersji 7.3.0 każda pomocnicza funkcja REST (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) sprawdza certyfikat
TLS punktu końcowego i przestaje czekać po określonym czasie:

| Ustawienie | Co zmienia |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` pomija sprawdzanie certyfikatu. Do wersji 7.2.0 nigdy nie był sprawdzany; zostaw `0` i zamiast tego zaufaj prywatnemu CA przez `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Jak długo wywołanie czeka na odpowiedź, domyślnie 60 sekund; punkt końcowy, który nigdy nie odpowiada, powoduje wtedy błąd pola zamiast jego zawieszenia |

Od wersji 7.3.0 pole, którego punkt końcowy ma certyfikat samopodpisany, kończy się błędem certyfikatu, dopóki nie ustawisz jednego z tych dwóch ustawień.
[Wywołania REST i jq](../customization/security.html#rest-calls-and-jq) opisuje oba oraz to, jak jednocześnie zaufać prywatnemu CA dla wszystkich wywołań REST.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) nie jest pomocniczą funkcją REST: ignoruje oba ustawienia, zawsze sprawdza
certyfikat i czeka najwyżej 30 sekund.

---
layout: default
title: REST-APIs
parent: Ausdrücke
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# REST-APIs
{: .no_toc }

REST-APIs mit Basic-, Token- oder eigener Authentifizierung aufrufen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## REST-API mit Basic-Authentifizierung

Rufen Sie eine REST-API mit Benutzer und Passwort gespeicherter Anmeldedaten auf:

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

## REST-API mit Token-Authentifizierung

Rufen Sie eine REST-API mit einem Bearer-Token auf, das im Ausdruck steht:

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

## REST-API mit gesicherter Token-Authentifizierung

Rufen Sie eine REST-API mit einem Bearer-Token aus gespeicherten Anmeldedaten auf, sodass es nie im Formular erscheint:

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

## REST-API mit eigenen Headern

Rufen Sie eine REST-API mit eigenen Headern auf, für jede andere Art der Authentifizierung:

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

## Zertifikate und Timeouts

Ab 7.3.0 prüft jede REST-Hilfsfunktion (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) das TLS-Zertifikat
des Endpunkts und hört nach einer festgelegten Zeit auf zu warten:

| Einstellung | Was sie ändert |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` überspringt die Zertifikatsprüfung. Bis 7.2.0 wurde nie geprüft; lassen Sie den Wert auf `0` und vertrauen Sie stattdessen einer privaten CA mit `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Wie lange ein Aufruf auf eine Antwort wartet, standardmäßig 60 Sekunden; ein Endpunkt, der nie antwortet, lässt das Feld dann fehlschlagen, statt es zu blockieren |

Ab 7.3.0 schlägt ein Feld, dessen Endpunkt ein selbstsigniertes Zertifikat hat, mit einem Zertifikatsfehler fehl, bis eine der beiden Einstellungen gesetzt ist.
[REST-Aufrufe und jq](../customization/security.html#rest-calls-and-jq) beschreibt beide und wie Sie einer privaten CA für alle REST-Aufrufe auf einmal vertrauen.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) ist keine REST-Hilfsfunktion: Sie ignoriert beide Einstellungen, prüft immer das
Zertifikat und wartet höchstens 30 Sekunden.

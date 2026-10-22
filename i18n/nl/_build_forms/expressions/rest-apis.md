---
layout: default
title: REST API's
parent: Expressies
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# REST API's
{: .no_toc }

REST API's aanroepen met basic-, token- of eigen authenticatie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## REST API met basic-authenticatie

Roep een REST API aan met de gebruiker en het wachtwoord van opgeslagen inloggegevens:

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

## REST API met tokenauthenticatie

Roep een REST API aan met een bearer-token dat in de expressie staat:

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

## REST API met beveiligde tokenauthenticatie

Roep een REST API aan met een bearer-token uit opgeslagen inloggegevens, zodat het nooit in het formulier verschijnt:

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

## REST API met eigen headers

Roep een REST API aan met je eigen headers, voor elke andere vorm van authenticatie:

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

## Certificaten en time-outs

Vanaf 7.3.0 controleert elke REST-hulpfunctie (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) het TLS-certificaat
van het endpoint en stopt ze na een ingestelde tijd met wachten:

| Instelling | Wat het verandert |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` slaat de certificaatcontrole over. Tot en met 7.2.0 werd het nooit gecontroleerd; laat het op `0` staan en vertrouw in plaats daarvan een eigen CA met `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Hoe lang een aanroep op een antwoord wacht, standaard 60 seconden; een endpoint dat nooit antwoordt, laat het veld dan mislukken in plaats van het vast te houden |

Vanaf 7.3.0 mislukt een veld waarvan het endpoint een zelfondertekend certificaat heeft met een certificaatfout, tot een van de twee is ingesteld.
[REST-aanroepen en jq](../customization/security.html#rest-calls-and-jq) beschrijft beide, en hoe je een eigen CA in één keer voor elke REST-aanroep vertrouwt.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) is geen REST-hulpfunctie: ze negeert beide instellingen, controleert altijd het
certificaat en wacht hooguit 30 seconden.

---
layout: default
title: APIs REST
parent: Expressões
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# APIs REST
{: .no_toc }

Chamar APIs REST com autenticação básica, por token ou personalizada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## API REST com autenticação básica

Chame uma API REST com o utilizador e a palavra-passe de uma credencial guardada:

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

## API REST com autenticação por token

Chame uma API REST com um bearer token escrito na expressão:

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

## API REST com autenticação por token protegido

Chame uma API REST com um bearer token obtido de uma credencial guardada, para que nunca apareça no formulário:

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

## API REST com cabeçalhos personalizados

Chame uma API REST com os seus próprios cabeçalhos, para qualquer outro tipo de autenticação:

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

## Certificados e tempos limite

A partir da 7.3.0, todas as funções auxiliares REST (`fnRestBasic`, `fnRestAdvanced`, `fnRestJwt`, `fnRestJwtSecure`) verificam o certificado TLS
do endpoint e deixam de esperar ao fim de um tempo definido:

| Definição | O que altera |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` salta a verificação do certificado. Até à 7.2.0 nunca era verificado; mantenha-o a `0` e, em vez disso, confie numa CA privada com `NODE_EXTRA_CA_CERTS` |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | Quanto tempo uma chamada espera por uma resposta, 60 segundos por predefinição; um endpoint que nunca responde faz então falhar o campo em vez de o reter |

A partir da 7.3.0, um campo cujo endpoint tenha um certificado autoassinado falha com um erro de certificado até que uma das duas esteja definida.
[Chamadas REST e jq](../customization/security.html#rest-calls-and-jq) descreve ambas, e como confiar numa CA privada para todas as chamadas REST de uma só vez.
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) não é uma função auxiliar REST: ignora ambas as definições, verifica sempre o
certificado e espera no máximo 30 segundos.

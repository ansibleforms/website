---
layout: default
title: Credenciais
parent: Expressões
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Credenciais
{: .no_toc }

Ler uma credencial guardada numa expressão
{: .fs-6 .fw-300 }

---

Leia uma credencial guardada pelo nome ou por expressão regular, com uma alternativa:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Primeiro tenta-se o nome exato. Quando nenhuma credencial tem esse nome, o nome é usado como expressão regular e, a seguir, tenta-se a alternativa.

#### Limitado por função

Quando uma das funções do utilizador enumera `credentials` no `config.yaml`, `fn.fnCredentials` só devolve uma credencial que essa função
permita: os padrões da função são comparados com o nome da credencial encontrada (pelo nome, por expressão regular ou pela alternativa),
e qualquer outra é recusada. As funções sem essa lista não a limitam, e um administrador nunca é limitado.

#### Credenciais de um cofre de segredos

Uma credencial que indica um [cofre de segredos](../secret-stores) obtém o seu `user` e a sua `password`
desse cofre em tempo de execução. `fn.fnCredentials('myapp')` continua a funcionar sem alterações.

Também é possível ler um segredo sem uma linha de credencial, em qualquer sítio onde se aceite um nome de credencial
(incluindo `fnRestBasic`, `fnRestJwtSecure` e as substituições de cabeçalhos de `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

As chaves do segredo são mapeadas como se descreve em [Nomes das chaves](../secret-stores#key-names).
Um segredo com outra forma é remodelado com uma expressão `jq` como terceiro argumento:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```

---
layout: default
title: Cofres de segredos
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: c7e5d9fb5e640896bd51e3fa20d76be092857ce2
---

# Cofres de segredos
{: .no_toc }

Leia as credenciais de um gestor de segredos em vez de as guardar no AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: ligue um gestor de segredos, e deixe as credenciais ler dele o seu utilizador e a sua palavra-passe.

---

## Como funciona

Um **cofre de segredos** é uma ligação a um gestor de segredos, adicionada em
**Ligações > Cofres de segredos**. Uma **credencial** pode então nomear um cofre e um sítio dentro dele
(a *referência do segredo*). Quando um formulário, um playbook ou uma expressão usa essa credencial:

- o **utilizador** e a **palavra-passe** são lidos do cofre, sempre (dentro do tempo de cache do cofre);
- o **host**, a **porta** e a **base de dados** continuam a ser os da linha da credencial. Quando a linha deixa
  um deles vazio e o segredo o contém, é usado o valor do segredo.

Os formulários continuam a referir-se à credencial pelo nome, por isso mover uma palavra-passe para um cofre não altera
nada nos seus formulários.

| Tipo de cofre | Estado |
|---|---|
| HashiCorp Vault (KV v1 e v2, autenticação por token) | disponível |
| Credenciais dinâmicas do HashiCorp Vault (`<mount>/creds/<role>`) | experimental |
| CyberArk Central Credential Provider (CCP) | experimental |

---

## Adicionar um cofre

A partir da 7.3.0, só um admin pode adicionar, alterar ou eliminar um cofre, já que o seu token ou a sua chave são enviados para o seu endereço. Todos os cofres têm estes campos:

| Campo | Significado |
|---|---|
| Nome | Como as credenciais se referem ao cofre. |
| Tipo | O gestor de segredos. |
| Credencial | Como e onde o cofre inicia sessão: uma credencial de [Ligações > Credenciais](../credentials.html), no passo **Credenciais**, do tipo **HashiCorp Vault** (o seu token e endereço) ou **CyberArk**. Contém o URL base, ex. `https://vault.example.com:8200`, e as definições de TLS: ignorar a verificação do certificado, ou um CA bundle em PEM para uma CA privada. Ela própria não pode ler de um cofre de segredos. |
| Cache (segundos) | Durante quanto tempo um segredo lido é reutilizado. `0` lê-o em cada utilização. Predefinição 60. |
| Opções extra (JSON) | Opções específicas do tipo, como objeto JSON. |

Até à 7.2.0, o endereço, o token e as definições de TLS eram campos do cofre. A atualização para a 7.3.0 move-os para a sua
credencial, chamada `<store>-token` (ou `<store>-appid` para CyberArk), consulte [Endereços nas credenciais](../credentials/types.html#addresses-in-credentials).

**Testar ligação** verifica o acesso sem ler nenhum segredo. A página **Estado** verifica todos os cofres, e avisa 7 dias
antes de um token do Vault expirar.

Cada gestor de segredos tem uma página própria:

| Página | O que abrange |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 e v2 com autenticação por token, e credenciais dinâmicas de base de dados |
| [CyberArk](cyberark.html) | O Central Credential Provider (CCP) do Application Access Manager da CyberArk |

---

## Usar um cofre

### Numa credencial

Em **Ligações > Credenciais**, no passo **Armazenamento** da credencial, escolha **Cofre de segredos**, depois escolha o
**Cofre de segredos** e preencha a **Referência**. O utilizador e a palavra-passe passam então a ser lidos do cofre, não escritos.

### Diretamente, sem linha de credencial

Em qualquer sítio onde é aceite um nome de credencial, pode em vez disso referir-se diretamente a um cofre (`fnCredentials`, `fnRestBasic`,
as `credentials:` de um formulário, o `dbConfig` de uma consulta).

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

A partir da 7.5.0, um `dbConfig` nomeia primeiro uma [base de dados](../databases.html); uma referência como esta não é uma base de dados, por isso
continua a ser lida do cofre. Uma base de dados também pode ler o seu acesso de um cofre, através de uma credencial do tipo base de dados que use um.

Sem linha de credencial, um segredo de base de dados precisa de pelo menos um `db_type` e um host, por exemplo:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Sem `db_type`, o segredo é uma credencial simples (utilizador, palavra-passe e quaisquer outras chaves), e uma consulta sobre ele assume `mysql`.

### Nomes das chaves

Um segredo é mapeado para uma credencial com estes aliases. As outras chaves passam tal como estão.

| Campo da credencial | Chaves aceites no segredo |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | o mesmo nome (só segredos diretos) |

Para uma linha de credencial, o host, a porta e o nome da base de dados do segredo só são usados onde a
linha os deixa vazios.

Um segredo com uma estrutura diferente pode ser remodelado com uma expressão `jq`, passada como terceiro argumento de
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## No config seed

Os cofres também podem ser declarados no config seed, como os outros objetos de administração:

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

O cofre inicia sessão com a sua credencial: uma `vault` contém o endereço do Vault em `url` e o token como palavra-passe, uma `cyberark`
o AppID e o endereço do CCP. Sem credencial, são usados o `url` e o `token` próprios do cofre.
Para mais detalhes, consulte [Config seed](../seed).

---

## Atualizar a partir das variáveis VAULT_*

Antes da 7, o único cofre era um HashiCorp Vault configurado com variáveis de ambiente
`VAULT_*`, e uma credencial apontava para ele com **Vault path**.

- **As variáveis são importadas uma vez** como um cofre chamado `vault`; remova-as depois.
- **As credenciais com um `vault_path`** passam a usar esse cofre; `vault_path` desaparece na 8.

---
layout: default
title: CyberArk
parent: Cofres de segredos
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Leia as credenciais do CyberArk Central Credential Provider (CCP)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimental.** Ainda não foi testado contra uma instalação real da CyberArk; por favor, partilhe o que descobrir.

O CCP é a interface REST do Application Access Manager da CyberArk.

---

## Campos do cofre

Além dos [campos que todos os cofres têm](./#adding-a-store), um cofre CyberArk tem estes campos:

| Campo | Significado |
|---|---|
| Credencial | Uma credencial **CyberArk** de [Ligações > Credenciais](../credentials.html): o URL base do CCP, ex. `https://ccp.example.com` (é acrescentado `/AIMWebService/api/Accounts`), as suas definições de TLS, o seu AppID (a aplicação definida para o AnsibleForms na CyberArk), e um certificado e uma chave de cliente em PEM, só quando o AppID os exige. |

---

## Referência do segredo

A referência do segredo identifica a conta como pares chave-valor separados por `;`:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Chaves permitidas: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` passa o resto da referência como uma consulta nativa do CCP, com `QueryFormat=Exact`
  a menos que defina outra coisa.
- Um `AppID` na referência é ignorado: é sempre usado o AppID do cofre.
- A palavra-passe da conta (`Content`) torna-se a palavra-passe; `UserName`, `Address`, `Port` e
  `Database` preenchem o utilizador, o host, a porta e o nome da base de dados.

---

## Opções extra

As opções extra do cofre definem-se como um objeto JSON:

| Chave | Significado |
|---|---|
| `reason` | Enviada como `Reason` quando a referência não tem nenhuma, para a auditoria da CyberArk. |
| `check_ref` | Uma referência que **Testar ligação** lê de facto. Sem ela, o teste só verifica que o CCP responde e aceita o AppID. |
| `timeout_ms` | Tempo limite do pedido, predefinição 10000. |

Por exemplo, para enviar um motivo e deixar **Testar ligação** ler uma conta de teste:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```

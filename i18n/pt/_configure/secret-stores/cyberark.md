---
layout: default
title: CyberArk
parent: Cofres de segredos
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Ler credenciais através do CCP do CyberArk, escrevê-las através do seu PVWA
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

## Escrever credenciais

Desde 7.6.0, o utilizador e a palavra-passe de uma credencial podem ser escritos no CyberArk ao **Guardar** (ver [Escrever credenciais](./#writing-credentials)).
O CCP só lê, por isso o AnsibleForms escreve através da API REST do PVWA, com uma credencial própria.

Ligue **Permitir escrita** nas **Opções** do cofre e preencha:

| Campo | Significado |
|---|---|
| Permitir escrita | Permite que uma credencial escreva o seu utilizador e palavra-passe neste cofre ao **Guardar**. Desligado por omissão. |
| Cofres onde escrever | Os cofres onde se podem escrever credenciais, separados por vírgulas, p. ex. `Linux, DB`. Obrigatório com a escrita ligada. |
| Endereço do PVWA | O URL base do PVWA, p. ex. `https://pvwa.example.com`. Obrigatório. |
| Credencial do PVWA | Uma credencial própria do tipo **Utilizador e palavra-passe** ou **API**, nunca lida de um cofre de segredos, que pode adicionar contas a esses cofres e mudar as suas palavras-passe. Obrigatória. |
| Método de início de sessão | Como a credencial do PVWA inicia sessão: CyberArk (por omissão), LDAP, RADIUS ou Windows. |
| ID da plataforma | A plataforma das contas que adiciona, p. ex. `UnixSSH`. Necessário para adicionar uma conta nova. |

A referência indica a conta como na leitura, `Safe=Linux;Object=srv01-root`, com `Address=srv01.example.com` quando a sua plataforma precisa de um.

- Uma conta nova é adicionada ao cofre com a plataforma, o nome de utilizador e a palavra-passe.
- Uma conta existente só é alterada se **Substituir um segredo que já lá esteja** estiver marcado: primeiro o nome de utilizador, depois a palavra-passe.
- A sessão do PVWA é terminada após cada escrita. O início de sessão OAuth do Privilege Cloud não é suportado.

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

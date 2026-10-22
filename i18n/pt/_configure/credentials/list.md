---
layout: default
title: A página de credenciais
parent: Credenciais
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# A página de credenciais
{: .no_toc }

A lista de credenciais, e a caixa de diálogo que adiciona uma
{: .fs-6 .fw-300 }

A página em **Ligações > Credenciais** lista todas as credenciais com o seu **Nome**, **Tipo**, **Descrição** e **Usado por**, o
número de registos, formulários e workflows que a nomeiam (consulte [Credenciais em uso](../credentials.html#credentials-in-use)).

**Adicionar credencial** abre uma caixa de diálogo em passos:

| Passo | Campos |
|---|---|
| Credencial | Nome e descrição, ambos obrigatórios. |
| Tipo | Um de 18 tipos, ver abaixo. |
| Acesso | Com que e onde o tipo inicia sessão, ver abaixo. |
| Armazenamento | Onde ficam o utilizador e a palavra-passe: **Base de dados** (cifrados na base de dados do AnsibleForms) ou **Cofre de segredos**, com o cofre e a **Referência** nele. Não existe para CyberArk nem para HashiCorp Vault, com os quais um cofre de segredos inicia sessão. |

O passo **Tipo** lista os tipos pelo nome: AAP, API, Ascender, AWX, CyberArk, Base de dados, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, e Utilizador e palavra-passe (consulte [Tipos de credencial](types.html)).

O passo **Acesso** contém todos os campos do tipo, incluindo o endereço; não há um passo de ligação separado:

| Tipos | Campos do passo Acesso |
|---|---|
| Todos os tipos exceto CyberArk | A palavra-passe, ou o que a substitui: a palavra-passe de bind do LDAP, o client secret do Entra ID e do Open ID, o token do HashiCorp Vault, o token do RTE, o token de API do Semaphore, do Rundeck e do Jenkins, um token ou palavra-passe para AWX, AAP e Ascender |
| Todos os tipos exceto HashiCorp Vault, RTE, Semaphore e Rundeck | O utilizador: o AppID do CyberArk, o bind DN do LDAP, o client ID do Entra ID e do Open ID, opcional para AWX, AAP e Ascender |
| SSH, Base de dados | **Host** e **Porta**; para uma base de dados também o **Tipo de base de dados** e a **Base de dados** |
| SMTP | **Servidor de correio** (obrigatório), a sua **Porta** e **Usar TLS** |
| LDAP | Os **Servidores** do diretório (obrigatório), a sua **Porta** e **Ativar TLS**; com TLS, **Ignorar certificados**, o **CA bundle** e um **Certificado de cliente** |
| Microsoft Entra ID | **Tenant ID** (obrigatório) e **URI de redirecionamento** |
| Open ID | **Emissor** (obrigatório) e **URI de redirecionamento** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, o endereço em que inicia sessão, obrigatório, com **Ignorar a verificação do certificado** e o **CA bundle** |
| CyberArk | **Certificado de cliente** e **Chave de cliente** |

Uma linha abre a página própria da credencial. O seu menu oferece **Editar**, **Testar ligação** (só para credenciais de base de dados) e **Eliminar**. A
palavra-passe altera-se na página da credencial, no seu separador **Acesso**.

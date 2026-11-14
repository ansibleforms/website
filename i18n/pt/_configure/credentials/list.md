---
layout: default
title: A página de credenciais
parent: Credenciais
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
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
| Armazenamento | Onde o utilizador e a palavra-passe são guardados: **Base de dados** (cifrados na base de dados do AnsibleForms) ou **Cofre de segredos**. Em **Cofre de segredos**, **Apontar para uma chave** lê um segredo que já está no cofre, e **Escrever numa chave** escreve no cofre, ao **Guardar**, o utilizador e a palavra-passe escritos no passo **Acesso**. Depois escolha o cofre e preencha a **Referência**; o seu exemplo segue o cofre: um caminho do HashiCorp Vault ou uma conta do CyberArk. Não para CyberArk nem HashiCorp Vault, com os quais um cofre de segredos inicia sessão. |
| Acesso | Com que e onde o tipo inicia sessão, ver abaixo. |

O passo **Tipo** lista os tipos pelo nome: AAP, API, Ascender, AWX, CyberArk, Base de dados, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, e Utilizador e palavra-passe (consulte [Tipos de credencial](types.html)).

O passo **Acesso** contém todos os campos do tipo, incluindo o endereço; não há um passo de ligação separado. A partir da 7.6.0, alguns
tipos perguntam primeiro como iniciam sessão, e mostram só o que isso precisa (consulte [Como uma credencial inicia sessão](types.html#how-a-credential-signs-in)):

| Tipos | Campos do passo Acesso |
|---|---|
| Todos os tipos exceto CyberArk | A palavra-passe, ou o que a substitui: a **Palavra-passe** do LDAP (a sua palavra-passe de bind), o **Client secret** do Entra ID e do Open ID, o **Token** do HashiCorp Vault e do RTE, o **Token de API** do Semaphore, do Rundeck e do Jenkins, o **Token** ou a **Palavra-passe** de AWX, AAP, Ascender e Git. Nenhuma para uma chave privada SSH, um relay SMTP ou um certificado Entra ID |
| Todos os tipos exceto HashiCorp Vault, RTE, Semaphore e Rundeck | O utilizador: o AppID do CyberArk, o bind DN do LDAP, o client ID do Entra ID e do Open ID. Nenhum com **Token** (AWX, AAP, Ascender, Git) ou **Sem autenticação** (SMTP) |
| SSH, Base de dados | **Host** e **Porta**; para uma base de dados também o seu **Motor** e a **Base de dados** |
| SSH | A partir da 7.6.0, **Iniciar sessão com**: **Palavra-passe**, ou **Chave privada** com a **Chave privada** e a sua **Frase-passe** opcional |
| AWX, AAP, Ascender, Git | A partir da 7.6.0, **Iniciar sessão com**: **Token** (sem utilizador) ou **Palavra-passe** (um utilizador e a sua palavra-passe) |
| Utilizador e palavra-passe, API | A partir da 7.6.0, o interruptor **Adicionar um host e uma porta**, depois da palavra-passe, mostra um **Host** e uma **Porta** opcionais |
| SMTP | **Servidor de correio** (obrigatório), **Porta de correio** e **Usar TLS**; a partir da 7.6.0, **Iniciar sessão com**: **Sem autenticação** (um relay) ou **Autenticação** (um utilizador e a sua palavra-passe) |
| LDAP | Os **Servidores** do diretório (obrigatório), a sua **Porta** e **Ativar TLS**; com TLS, **Ignorar certificados**, o **CA bundle** e um **Certificado de cliente** |
| Microsoft Entra ID | **Tenant ID** (obrigatório) e **URI de redirecionamento**; a partir da 7.6.0, **Iniciar sessão com**: **Segredo** (o **Client secret**) ou **Certificado** (um **Certificado** e a sua chave privada, só email) |
| Open ID | **Emissor** (obrigatório) e **URI de redirecionamento** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, o endereço em que inicia sessão, obrigatório, com **Ignorar a verificação do certificado** e o **CA bundle** |
| CyberArk | **Certificado de cliente** e **Chave de cliente** |

Com **Apontar para uma chave**, o utilizador e a palavra-passe não são pedidos: o cofre dá-os. O passo **Acesso** mantém então só os campos de endereço do tipo (SSH, base de dados, servidores de correio e de diretório, o endereço de um servidor, o host e a porta opcionais de Utilizador e palavra-passe e de API a partir da 7.6.0), e um acesso Git não tem passo **Acesso**: é guardado a partir do passo **Armazenamento**.

Com **Escrever numa chave** (desde 7.6.0), o passo **Acesso** pede o utilizador e a palavra-passe, oferecendo só as escolhas de início de sessão com palavra-passe (consulte
[Como uma credencial inicia sessão](types.html#how-a-credential-signs-in)), e **Guardar** escreve-os no cofre na **Referência**; o AnsibleForms guarda apenas o cofre e a referência. Só são oferecidos os cofres que permitem escrita, e **Adicionar cofre de segredos** cria um com a escrita já ligada. Uma chave que já tem um segredo só é substituída se **Substituir um segredo que já lá esteja** estiver marcado, ver [Escrever credenciais](../secret-stores/#writing-credentials).

Uma linha abre a página própria da credencial. O seu menu oferece **Editar**, **Testar ligação** (só para credenciais de base de dados) e **Eliminar**. A
palavra-passe altera-se na página da credencial, no seu separador **Acesso**.

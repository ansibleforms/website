---
layout: default
title: A partir do código-fonte
parent: Atualizar
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# A partir do código-fonte
{: .no_toc }

Atualize uma instalação compilada a partir do código-fonte
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Uma instalação compilada a partir do código-fonte é atualizada fazendo checkout da nova versão, compilando-a novamente e reiniciando a
aplicação. As suas definições, formulários, playbooks, certificados e registos ficam guardados em `server/persistent`, que o Git e a
compilação não alteram.

---

## Antes de atualizar

Prepare a atualização para poder voltar atrás se algo correr mal:

* **Faça uma cópia de segurança** em **Definições → Cópias de segurança**. A nova versão atualiza o esquema da base de dados no primeiro arranque.
* **Leia o [registo de alterações](../changelog)** das versões entre a sua e a nova.
* **Vai passar para uma nova versão principal?** Siga primeiro [Atualizar para a v7](../upgrade-7.html).
* **Verifique a versão do Node.js** que a nova versão exige, no registo de alterações.

---

## 1. Obtenha a nova versão

Obtenha as tags das versões e faça checkout da versão que pretende. As tags das versões têm o número da versão, e `git tag` lista-as;
o ramo `main` pode conter alterações ainda não lançadas:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Compile novamente

Compile novamente nos mesmos três passos que na instalação. Primeiro compile o client:

```bash
cd client
npm ci
npm run build
```

Depois atualize as dependências do servidor:

```bash
cd ../server
npm ci --omit=dev
```

Por fim copie novamente o client compilado para a pasta `views` do servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Compare o `.env.example`, na raiz do repositório, com o seu `persistent/.env` para incluir as definições que a versão acrescente.

---

## 3. Reinicie

Reinicie a aplicação e o seu RTE para carregar o novo código. O esquema da base de dados é atualizado no primeiro arranque:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Se vem da 7.2, o RTE corria em modo base de dados, com as definições da base de dados e `RTE_URL`, descontinuado na 7.3.0 e removido na 8.0.0.
Inicie-o novamente em modo inbound e declare o seu runner com uma credencial de RTE no seed ou em **Ligações → Runners**, como mostra a
[instalação](../installation/from-source.html#run): `pm2 delete ansibleforms-rte`, e depois o seu comando `pm2 start`.

Se executa a aplicação sem PM2, pare o `npm run start` e volte a iniciá-lo.

---

## 4. Verifique a atualização

Acompanhe o registo da aplicação enquanto arranca:

```bash
pm2 logs ansibleforms
```

No AnsibleForms, **Ajuda → Acerca de** mostra a versão em execução, e **Definições → Estado** mostra a saúde da
base de dados, do esquema e dos outros sistemas de que o AnsibleForms depende.

---

## Reverter

Para voltar à versão que executava antes, a que **Ajuda → Acerca de** mostrava antes da atualização, faça checkout da sua tag com
`git checkout <version>`, e depois compile e reinicie como nos passos 2 e 3. Se essa versão não arrancar na base de dados atualizada, restaure a cópia de segurança que fez em
**Definições → Cópias de segurança**.

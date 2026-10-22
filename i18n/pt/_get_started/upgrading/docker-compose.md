---
layout: default
title: Docker Compose
parent: Atualizar
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Atualize uma instalação feita com o projeto docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

O projeto docker-compose executa três contentores: MySQL (`mysqldb`), AnsibleForms (`app`) e o RTE que executa os
playbooks (`rte`). O AnsibleForms e o RTE usam a tag de imagem `7`, que aponta sempre para a versão 7.x mais recente. Uma
atualização volta a obter as imagens e recria os contentores cuja imagem mudou. Tudo o que tem de persistir é guardado
na pasta `data` e é preservado.

---

## Antes de atualizar

Prepare a atualização para poder voltar atrás se algo correr mal:

* **Faça uma cópia de segurança** em **Definições → Cópias de segurança**. A nova versão atualiza o esquema da base de dados no primeiro arranque.
* **Leia o [registo de alterações](../changelog)** das versões entre a sua e a nova.
* **Vai passar para uma nova versão principal?** Siga primeiro [Atualizar para a v7](../upgrade-7.html).
* **Vem da 6.5?** O projeto 6.x, no seu ramo `v6`, não tem contentor `rte`. Atualize a sua cópia do projeto para
  o ramo `main`, mantendo as suas definições do `.env` e a sua pasta `data`, para que o `docker-compose.yml` tenha o serviço `rte`.
  Esse ficheiro de compose define `CONFIG_SEED_PATH`, e uma pasta `data` da 6.x não tem `seed.yaml`: copie `data/seed.yaml` do
  repositório e adicione `RTE_TOKEN` (com pelo menos 16 caracteres) ao seu `.env`, como o `.env` do repositório o tem. Sem eles a
  aplicação recusa-se a arrancar. As imagens da 7 correm com o uid 1000 em vez de root: dê a esse utilizador a pasta `data` uma vez, deixando os ficheiros
  do MySQL ao MySQL, com `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  A pasta `data/ssh` passa a ser montada em `/home/node/.ssh` em vez de `/root/.ssh`.
* **Vem da 7.2?** Atualize `docker-compose.yml` e `data/seed.yaml` em conjunto: consulte primeiro [Da 7.2 para a 7.3](#from-72-to-73).

---

## Da 7.2 para a 7.3

Até à 7.2.0 o serviço `rte` recebia as definições da base de dados e o seu runner, declarado em `data/seed.yaml`, corria em modo base de dados,
descontinuado na 7.3.0 e removido na 8.0.0. Desde a 7.3.0 a aplicação liga-se ao RTE em `http://rte:8000` e mantém um WebSocket aberto
(`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)), e o RTE não guarda definições da base de dados. Obtenha os dois ficheiros do ramo
`main` do repositório, mantendo o seu `.env`:

| Ficheiro | O que muda |
|---|---|
| `docker-compose.yml` | O serviço `rte` deixa de ler o `.env`: recebe `RTE_MODE=inbound`, `RTE_TOKEN` e `RTE_FILES=local`, e nenhum `DB_*` |
| `data/seed.yaml` | Uma credencial de RTE `rte`, com `url: http://rte:8000` e `password: ${RTE_TOKEN}`, e o runner `rte` com `rte_mode: inbound` e `credential: rte` |

Altere os dois. Só com o novo ficheiro de compose, o seed mantém o runner `rte` em modo base de dados: a aplicação chama o RTE como se fosse um da 7.2,
ao que o novo RTE não responde, e nenhum playbook é executado. Um seed que alterou por si precisa da mesma credencial e do mesmo `rte_mode`.

Um runner que o seed criou continua gerido, só de leitura em **Ligações → Runners**, mesmo depois de remover `CONFIG_SEED_PATH`: só um
seed aplicado liberta um runner que já não declara. Por isso mantenha o seed e defina aí o `rte_mode`, em vez de remover
`CONFIG_SEED_PATH` para alterar o runner à mão.

O [instalador](../installation/installer.html#upgrade) faz isto sozinho: a sua atualização substitui `docker-compose.yml`, e `data/seed.yaml`
quando é um fornecido pelo repositório, sem alterações. Um alterado à mão é mantido, e o novo é guardado ao lado.

---

## 1. Obtenha as novas imagens

Descarregue as imagens mais recentes das tags em `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Recrie os contentores

Inicie novamente o projeto; os contentores cuja imagem mudou são recriados:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Verifique a atualização

Acompanhe o registo do AnsibleForms enquanto arranca. O primeiro arranque de uma nova versão atualiza o esquema da base de dados, e o RTE
arranca assim que o AnsibleForms estiver saudável:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

No AnsibleForms, **Ajuda → Acerca de** mostra a versão em execução, e **Definições → Estado** mostra a saúde da
base de dados, do esquema e dos outros sistemas de que o AnsibleForms depende.

---

## Reverter

Para voltar à versão que executava antes, a que **Ajuda → Acerca de** mostrava antes da atualização, fixe a sua tag exata em
`docker-compose.yml` na imagem do AnsibleForms e na do RTE, em vez de `7`, e execute novamente o passo 2. Se essa versão
não arrancar na base de dados atualizada, restaure a cópia de segurança que fez em **Definições → Cópias de segurança**. Volte a colocar as tags em
`7` para voltar a receber atualizações.

**VÍDEO**: [Como atualizar o AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)

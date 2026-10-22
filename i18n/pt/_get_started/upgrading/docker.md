---
layout: default
title: Docker
parent: Atualizar
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Atualize um contentor autónomo, sem docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Uma instalação autónoma é atualizada substituindo os seus contentores: obtenha as novas imagens, remova os contentores antigos e
inicie novos com os mesmos comandos `run`. Desde a versão 7 existem dois: o AnsibleForms e o RTE que executa os
playbooks, sempre na mesma versão. Os seus ficheiros ficam guardados na pasta montada `/app/dist/persistent` e os seus dados no
MySQL, por isso ambos são preservados.

---

## Antes de atualizar

Prepare a atualização para poder voltar atrás se algo correr mal:

* **Faça uma cópia de segurança** em **Definições → Cópias de segurança**. A nova versão atualiza o esquema da base de dados no primeiro arranque.
* **Leia o [registo de alterações](../changelog)** das versões entre a sua e a nova.
* **Vai passar para uma nova versão principal?** Siga primeiro [Atualizar para a v7](../upgrade-7.html).
* **Vem da 6.5?** As imagens da 7 correm com o uid 1000 em vez de root: dê a esse utilizador as pastas que monta, uma vez, por
  exemplo `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Vem da 7.2?** O RTE recebe um ficheiro próprio e a aplicação liga-se a ele: consulte primeiro [Da 7.2 para a 7.3](#from-72-to-73).

---

## Da 7.2 para a 7.3

Até à 7.2.0 o RTE lia o ficheiro de ambiente da aplicação, com as definições da base de dados, e adicionava-se a si próprio como runner a partir de `RTE_URL`. Isso
é o modo base de dados, descontinuado na 7.3.0 e removido na 8.0.0. Desde a 7.3.0 a aplicação liga-se ao RTE e mantém um WebSocket aberto
(`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)), e o RTE não guarda definições da base de dados. Uma vez, antes do passo 2:

1. Crie `/srv/apps/ansibleforms/rte.env` como faz a [instalação](../installation/docker.html#prepare-the-folders), com
   `RTE_MODE=inbound`, o mesmo `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` e `HTTPS=0`. Sem `DB_*`, sem `ENCRYPTION_SECRET`, sem `RTE_URL`
2. Declare o runner nesse modo. Ou adicione o [config seed](../seed/) da instalação, `persistent/seed.yaml` com a credencial de RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) e o runner `rte` (`rte_mode: inbound`), e adicione
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` ao ficheiro de ambiente da aplicação. Ou, sem seed, abra o runner em
   **Ligações → Runners**, defina o seu **Modo** como **Entrada** e escolha uma credencial de RTE que contenha `http://rte:8000` e o token

Com o seed, o ficheiro de ambiente da aplicação também contém `RTE_TOKEN`, o mesmo token, já que o seed o lê daí.

---

## 1. Obtenha as novas imagens

Descarregue as imagens mais recentes do AnsibleForms e do RTE da tag que executa:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Substitua os contentores

Remova os contentores antigos e inicie novos com os comandos `run` da [instalação](../installation/docker.html). A aplicação
lê a ligação à base de dados do seu ficheiro de ambiente, com o utilizador de base de dados do AnsibleForms (não o root). O RTE lê o seu próprio
`rte.env`, sem as definições da base de dados, e a aplicação liga-se a ele através de uma rede que os dois contentores partilham:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Se vem da 6.5, ainda não existe contentor RTE: os comandos `stop` e `rm` só encontram a aplicação. Crie a rede partilhada
uma vez com `docker network create ansibleforms` (ou `podman network create ansibleforms`). Tal como faz a
[instalação](../installation/docker.html#prepare-the-folders), coloque a ligação à base de dados, o `ENCRYPTION_SECRET`, um `RTE_TOKEN`
com pelo menos 16 caracteres e `CONFIG_SEED_PATH` no ficheiro de ambiente da aplicação, e crie o `rte.env` e o config seed. Use as suas próprias
pastas onde a sua instalação 6.5 montava outras. O seed adiciona o RTE em **Ligações → Runners** como o runner predefinido `rte`;
consulte [Atualizar para a v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Verifique a atualização

Acompanhe o registo do AnsibleForms enquanto arranca. O primeiro arranque de uma nova versão atualiza o esquema da base de dados:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

O RTE escreve o seu próprio registo, que `docker logs rte` mostra. No AnsibleForms, **Ajuda → Acerca de** mostra a versão em execução, e **Definições → Estado** mostra a saúde da
base de dados, do esquema e dos outros sistemas de que o AnsibleForms depende.

---

## Reverter

Para voltar à versão que executava antes, a que **Ajuda → Acerca de** mostrava antes da atualização, execute novamente o passo 2 com
a sua tag exata em vez de `7`, na imagem do AnsibleForms e na do RTE. Se essa versão não arrancar na base de dados
atualizada, restaure a cópia de segurança que fez em **Definições → Cópias de segurança**.

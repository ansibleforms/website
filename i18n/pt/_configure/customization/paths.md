---
layout: default
title: Caminhos
parent: Variáveis de ambiente
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Caminhos
{: .no_toc }

Onde ficam a configuração, os formulários, os playbooks, os ficheiros carregados e as cópias de segurança
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para manter parte dos dados noutro volume, por exemplo as cópias de segurança e os ficheiros carregados num armazenamento maior ou mais barato.

---

## Exemplo

Cópias de segurança e ficheiros carregados num volume separado, o resto dos dados na pasta persistente habitual. No `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Um caminho novo aplica-se só a ficheiros novos: o que já está na pasta antiga não é movido, por isso copie-o você mesmo.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="paths" %}

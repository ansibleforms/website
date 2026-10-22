---
layout: default
title: 路径
parent: 环境变量
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# 路径
{: .no_toc }

配置、表单、playbook、上传文件和备份的存放位置
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以将部分数据保存在另一个卷上，例如将备份和上传文件放在更大或更便宜的存储上。

---

## 示例

备份和上传的文件放在单独的卷上，其余数据放在常用的持久化文件夹中。在 `docker-compose.yml` 中：

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

新路径只对新文件生效：旧文件夹中已有的内容不会被移动，请自行复制过去。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="paths" %}

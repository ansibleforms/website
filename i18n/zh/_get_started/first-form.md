---
layout: default
title: 您的第一个表单
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# 您的第一个表单
{: .no_toc }

编写一个 playbook，在设计器中为它创建表单，启动它并找到对应的作业
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

本教程从一个全新的安装开始，参见 [安装](installation/)。大约需要十五分钟。

---

## 1. 登录

在浏览器中打开 AnsibleForms，并以管理员身份登录。

默认账户为 `admin` / `AnsibleForms!123`（或您设置的 [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME) 值）；随后会打开 **表单** 页面：

![表单页面，带有示例表单](assets/screenshots/dashboard.jpg)

---

## 2. 编写 playbook

`ansible` 表单会运行 playbooks 文件夹中的某个 playbook，所以先写 playbook。将下面的内容保存为 `hello.yaml`：

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

这个 playbook 读取四个变量。接下来创建的表单会把它们作为 extravars 发送，每个字段一个。

把文件放到持久化文件夹（[`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)）的 `playbooks` 文件夹中；
如果该文件夹还不存在，请先创建：

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">从源码安装</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

即您挂载到 `/app/dist/persistent` 的文件夹，在安装示例中为 `/srv/apps/ansibleforms/persistent`：

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

即 docker-compose 项目的 `data/playbooks` 文件夹：

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

即持久卷，在 AnsibleForms pod 中挂载于 `/app/dist/persistent`。先查出 pod 的名称，再把文件复制进去：

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

即服务器的 `persistent/playbooks` 文件夹，在安装示例中为 `/srv/apps/ansibleforms/server`：

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> 当某个 git 仓库开启了 **用于 playbook？** 时，playbook 会改为从该仓库运行：
> 请把 `hello.yaml` 提交到那里。参见 [设计器和 git](gui/designer-and-git.html)。

---

## 3. 创建表单

表单是表单文件夹中的 YAML 文件。设计器在浏览器中编辑它们，并在保存前进行检查。

1. 点击顶部菜单中的 **设计器**，然后点击左侧菜单中的 **表单**。
2. 点击右上角的开关（**启动设计器**）。它会锁定配置，以免其他人同时编辑，
   随后开关显示 **由我锁定**。
3. 点击工具栏的第一个按钮 **新建文件**，输入文件名 `hello-world.yaml`。设计器会在其中添加一个
   名为 `New Form` 的表单。
4. 用下面这个表单替换编辑器中的 YAML：

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. 点击 **验证**（对勾图标），然后点击 **保存**。保存会把 `hello-world.yaml` 写入表单文件夹。
6. 再次点击开关以释放锁。

![设计器，正在编辑一个表单](assets/screenshots/designer.jpg)

这个表单使用了四种字段类型：

| 字段 | 类型 | 作用 |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | 必填的文本框 |
| `target_env` | [`enum`](formfields/enum.html) | 带有固定 `values` 列表的下拉框 |
| `vm_size` | [`enum`](formfields/enum.html) | 由本地 [表达式](expressions/local.html) 填充的下拉框；`__auto__` 会选中第一项 |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | 复选框，以 `true` 或 `false` 发送 |

`vm_size` 会显示 `size` 和 `cpus` 两列，并发送第一列 `size`；用 `valueColumn` 可以选择其他列。

`roles: [default]` 让每个已登录的用户都能运行此表单，`categories: [Default]` 则把它放进默认
`config.yaml` 所定义的类别中。

{: .note }
> 您也可以把 `hello-world.yaml` 复制到 [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH)，并 [在 VS Code 中验证它](faq.html#vs-code-validation-for-form-files)。

---

## 4. 启动表单

从 **表单** 页面打开表单：点击顶部菜单中的 **表单**，在 **Default** 类别中选择 **Hello world**。

填写您的名字，按需修改其他字段。点击 **显示 Extravars** 查看 playbook 将会
收到的内容，然后点击 **提交**：

![一个表单](assets/screenshots/form.jpg)

---

## 5. 查看输出

作业会立即启动，运行期间其输出显示在表单下方，最后以一条 **已完成** 栏结束：

![作业的输出](assets/screenshots/run.jpg)

debug 任务会打印您填写的值，例如 `Hello Alice: a small machine in development (dry run: True)`。

没有清单时出现隐式 localhost 警告是正常的；实际使用的表单会设置 [`inventory`](forms/ansible.html)。

---

## 6. 在作业历史中找到它

每次启动都会保存为一个作业。点击顶部菜单中的 **作业**：新作业位于 **所有作业** 的最上方。

点击该作业可再次查看其输出，点击 **显示 Extravars** 可查看发送了什么。每个作业前面的图标
用于重新运行或删除它：

![作业历史](assets/screenshots/job-output.jpg)

---

## 后续步骤

借助参考页面继续完善这个表单：

* **[表单](forms/)**：所有表单属性、运行器上的模板、工作流表单、审批点和通知
* **[表单字段](formfields/)**：所有字段类型，包括验证、依赖和布局
* **[表达式](expressions/)**：从 REST API、数据库和文件填充字段
* `config.yaml` 中的 **[角色](config/roles.html)** 和 **[类别](config/categories.html)**：决定谁能看到哪个表单
* **[工作原理](how-it-works.html)**：启动背后发生了什么，以及所有内容存储在哪里

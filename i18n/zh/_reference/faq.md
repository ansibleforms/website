---
layout: default
title: 常见问题
nav_order: 2
translated_from: 6616eaf626411a615cb68d8cc4f2a43401fe21d9
---

# 常见问题
{: .no_toc }

关于 AnsibleForms 的常见问题和解答
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 入门

### 部署拓扑：一个容器还是多个节点

默认情况下，一个 AnsibleForms 容器在一个进程中运行 Web 应用和后台任务，旁边是一个运行 playbook 的
RTE 容器。请为它设置重启策略（例如 Docker 中的 `restart: unless-stopped`），并同时备份数据库和
持久卷。

要在负载均衡器后面运行多个副本，请用 `AF_ROLE` 拆分进程：

- `app` 节点提供 Web 界面和 API：可以运行任意多个，每个都使用相同的 `ACCESS_TOKEN_SECRET`
- 一个 `worker` 运行后台任务：schema 及其升级、配置种子、调度、每晚备份、仓库
  同步和清理。同一时间只有一个 worker 在工作，它持有一个数据库锁；第二个 worker 会等待，并在第一个停止时接管
- `rte` 容器运行 playbook：运行更多 RTE 容器就能同时运行更多 playbook

应用节点和 worker 共享数据库、持久卷和 `ENCRYPTION_SECRET`。socket 模式（出站或
入站，参见 [模式](rte/modes.html)）的 RTE 既不需要数据库也不需要 `ENCRYPTION_SECRET`。聊天助手需要会话保持，
每个节点各自保存日志。参见 [扩展](production/scaling.html) 和
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale) 示例配置。

### 多仓库表单管理

所有启用了 **用于表单** 的 Git 仓库中的表单会自动合并；表单名称重复时，第一个
生效并记录一条警告。请只在一个仓库中保留 `config.yaml`。参见 [Git 仓库](repositories/)。

### 关于仓库

AnsibleForms 在仓库路径（`REPO_PATH`）下克隆和拉取 Git 仓库，在 **设置 > 仓库** 下管理。
每个仓库上的开关决定它包含什么：配置、表单、playbook 或变量文件。参见 [Git 仓库](repositories/)。

### VS Code 中表单文件的验证

在表单 YAML 文件中添加 schema 头，即可在 VS Code 中获得实时验证和自动补全。

安装 [YAML 扩展](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)，并把以下注释作为任意表单文件的 **第一行**：

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

这既适用于单表单文件（一个 YAML 字典），也适用于多表单文件（一个 YAML 列表）：

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
- name: My Form
  type: ansible
  playbook: site.yml
  roles: [default]
  fields:
    - name: env
      type: enum
      values: [dev, staging, prod]
```

VS Code 会在您输入时高亮显示未知属性、缺少的必填字段和错误的类型。

---

## 作业管理

### 用预填数据重新运行作业

重新运行按钮会打开预先填入先前作业值的表单；密码字段从不存储。
它需要角色选项 `allowJobRelaunch`，表单可以用 `allowRelaunch: false` 关闭它。参见 [重新运行作业](jobs/actions.html#relaunch-a-job)。

### 作业日志文件

通过作业专属的日志文件跟踪进度（v6.1.2）。

AnsibleForms 可以在 Ansible 输出旁边显示一个 **作业专属的日志文件**。这样您就可以跟踪长时间运行的自定义模块的进度，否则这些模块在执行期间不会产生任何可见的反馈。

{: .note }
> 此功能只适用于在 RTE 上运行的 playbook。AWX、AAP、Ascender、Semaphore、Rundeck 或
> Jenkins 上的模板和作业没有日志文件。

**工作原理：**
- 作业运行期间，RTE 会监视 playbook 文件夹内一个约定路径上的日志文件
- 每隔两秒，如果文件发生了变化，RTE 就把其内容复制到作业中，playbook 结束时再复制一次
- 日志文件显示在作业输出的 **日志文件** 部分，行号与输出的行号相同：日志行的时间戳和级别（ERROR、WARNING、INFO、DEBUG）会像输出一样被读取并着色，并支持 ANSI 颜色

**日志文件路径约定：**

日志文件必须写入以下路径：

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms 会自动传入 `__jobid__`**，因此您无需任何额外配置即可在 playbook 中拼出该路径：

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

把这个变量传给任何需要把进度写入该文件的角色或自定义模块。

**playbook / 模块开发人员的职责：**
- 在操作开始时 **创建** 日志文件（及其 `.joblogs/` 目录）
- 随着操作的进行 **写入** 有意义的进度消息

playbook 结束、最后的内容保存到作业后，RTE 会删除该文件。

**支持 ANSI 颜色编码。**  
日志消息中的标准 ANSI 转义码（例如绿色为 `\033[92m`，红色为 `\033[91m`）会在界面中渲染为颜色，因此成功、警告和错误状态一目了然。

**典型用例：**  
一个执行一长串 API 调用或数据操作的自定义 Python Ansible 模块（例如 SnapMirror DR 工作流）可以每一步向日志文件追加一行。在 AnsibleForms 中查看该作业的操作人员会在作业页面跟踪作业时，于日志文件部分看到实时进度。

### Jobid

传入当前作业 ID。

AnsibleForms 会自动在 extravars 中以 `__jobid__` 发送当前作业 ID；无需任何配置。

### Userinfo

传入当前用户。

AnsibleForms 会自动在 extravars 中以 `ansibleforms_user` 发送用户信息；无需任何配置。

您可以选择发送其中多少内容。`EXTRAVARS_USER_FIELDS` 接受以逗号分隔的顶层键列表
（`username,email,type`），或 `none` 表示什么都不发送；表单可以用自己的 `userExtravars` 属性覆盖它。
默认与以前一样发送整个对象。下面介绍的表单端 `__user__` 来自登录令牌，从不受影响。

### 表单中的 Userinfo

在表单中访问当前用户信息（v4.0.2）。

字段 `__user__` 会自动添加到表单中，并可在表达式中引用：

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## 表单字段

### 级联下拉框

制作级联下拉框。

`enum` 字段（下拉框）的 `query` 或 `expression` 属性中可以包含占位符，格式为 `$(another_field)` 或 `$(another_field[0].name)`。  
一旦被引用的字段发生变化，引用它的字段就会重新求值，从而形成动态的级联下拉框。  
客户端 Web 应用每 100 毫秒重新对字段求值一次；在当前的处理器和 Chromium 引擎上，体验非常流畅。

{: .note }
> 对另一个 enum 字段的引用返回的是所选的值，**而不是** 完整的下拉列表。请使用 `placeholderColumn` 属性或 `$(city.name)` 这样的点号写法。  
> **v4.0.20 新增**：把 placeholderColumn 设为 "*" 会输出整条记录，而不是单独一列。

```yaml
- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
  query: select name from cmdb.city
  name: city_name
  label: Select a city
  default: Amsterdam
  required: true
  model: cmdb.city
  group: CMDB
- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
  query: select datacenter.name from cmdb.datacenter,cmdb.city where datacenter.city_id=city.id
    and city.name='$(city_name)'
  name: datacenter_name
  label: Select a datacenter
  default: __auto__    # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB      

# or use the placeholderColumn property

- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
  query: select id,name,description from cmdb.city
  name: city
  label: Select a city
  default: Amsterdam         # evaluated against valueColumn
  required: true
  model: cmdb.city
  group: CMDB
  valueColumn: name          # we choose the name column as value for placeholders
  placeholderColumn: id      # we can reference the id by using $(city)
  previewColumn: description # when you select a value, the dropdown will show description
  columns:                   # we hide id
  - name
  - description
- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
  query: select name, capacity_pct from cmdb.datacenter where datacenter.city_id=$(city)
# this cascaded dropdown will react using "id" as placeholder
# or "query":"select name from cmdb.datacenter where datacenter.city_id=$(city.id)",  
# or reference the column in the placeholder                            
  name: datacenter_name
  label: Select a datacenter
  default: __auto__         # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  pctColumns:
  - capacity_pct
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB
```

### 字段占位符

引用另一个字段的值。

占位符是对表单中其他字段的引用。  
占位符的格式始终为 `$(reference)`，表达式和查询中都可以包含占位符。  
指向简单字段（text、number、password）的占位符保存的是该字段的值。  
指向基于对象的 enum 字段的占位符，必须使用 `placeholderColumn` 属性或 `$(city.name)` 这样的点号写法。  
指向 expression 字段的占位符会返回完整的对象，您也可以使用类似 JavaScript 的高级引用，例如 `$(myarray[0].name)`。

{: .important }
> 占位符在表达式求值 **之前** 被替换。如果您期望结果是字符串，必须用引号把它括起来。  
> **v4.0.20 新增**：把 placeholderColumn 设为 "*" 会输出整条记录，而不是单独一列。

```yaml
- name: field1
  type: expression
  expression: "[{name: 'foo'},{name: 'bar'},{name: 'ansible'}]"
  runLocal: true
- name: field2
  type: expression
  expression: "'$(field1[0].name)'"  # result : 'foo' (note the wrapping quotes)
  runLocal: true
- name: field3
  type: expression
  expression: "$(field1)[0].name"  # result : {name: 'foo'}.name => 'foo'  
  runLocal: true    
- name: field4
  type: expression
  expression: "$(field1).slice(-1)[0].name"  # result : {name: 'ansible'}.name => 'ansible' 
  runLocal: true
- name: field5
  type: enum
  expression: $(field1).filter(x => x.name.includes('a'))   # result : [{name: 'bar'},{name: 'ansible'}]
  runLocal: true
  default: __auto__                                         # result: bar
- name: field6
  type: expression
  expression: "'$(field5)'"   # result : the selected item from field5 (default=bar)
  runLocal: true        
```

### 隐藏字段

隐藏一个字段。

用字段属性 `hide` 隐藏字段，或者用字段属性 `dependencies` 和 `dependencyFn` 动态地显示和隐藏它。

### 字段分组

把字段归入一个块中。

使用字段属性 `group`。组名相同的字段会被归入同一个块。

### 字段验证

验证一个字段。

使用验证类的字段属性，例如 `regex`、`minValue` 和 `notIn`。

### Enum 的默认值

Enum 默认值。

字段属性 `default` 设置默认值，在 `enum` 字段上可以使用 `__auto__` 等值来自动选中第一项。

要根据表达式设置动态默认值，请把默认项移到列表的最前面，如下例所示。

```yaml
# using client javascript manipulation

- type: expression
  expression: "[{name:'bert'},{name:'ernie'},{name:'pino'}]"
  name: dropdownsource
  label: Dropdown source
  runLocal: true
- type: expression
  expression: "'pino'"
  name: dropdownsourceDefault
  label: Default source
  runLocal: true
- type: enum
  expression: "[...[{name:'$(dropdownsourceDefault)'}],...$(dropdownsource).filter(x => x.name!=='$(dropdownsourceDefault)')]"
  name: dropdownwithdefault
  label: Example with expression default by moving it to top
  runLocal: true
  default: __auto__     

# explained : 
# we take our default and merge it with the source where we filter out the default (to avoid doubles)    
# the default is thus shifted to the first element, which we can now select with the default `__auto__`
```

### 表达式默认值

表达式默认值。

对于 text、number 或 date 字段，`default` 属性设置静态默认值。

要让默认值基于表达式动态变化，请使用以下两个属性之一：
* `editable`：使用 editable 属性让 expression 字段可编辑
* `evalDefault`：使用 evalDefault 属性把默认值作为表达式求值

```yaml
# using editable
- type: expression
  expression: "'$(some_other_field)'.toLowerCase()"
  name: field1
  runLocal: true
  editable: true # this will add an edit-button so you manually overwrite the expression value

# using evalDefault
- type: text
  name: field1
  default: "'$(some_other_field)'.toLowerCase()"
  evalDefault: true # it will treat the default as if it was an expression.
  # note : when `some_other_field` changes, the default will be re-evaluated
  # note2 : works for other fields too.

# more complex evalDefault example
- name: checkbox
  type: checkbox
- name: textfield1
  type: text
  line: line2
  default: ping
- name: textfield2
  type: text
  line: line2
  default: pong
- name: checkbox3
  type: checkbox
  line: line3
  label: This checkbox will default check if checkbox or textfield1==textfield2
  default: |
    (
      (c=false,t1="",t2="") => { return c || (t1==t2) }
    )( $(checkbox) , "$(textfield1)" , "$(textfield2)" )
    
  evalDefault: true
```

---

## 向导和工作流

### 向导和工作流有什么区别？

**向导** 和 **工作流** 都是分步骤的，但它们作用于不同的层面，并且可以组合使用。

| | [`workflow`](forms/workflow.html)（工作流） | [`wizard`](forms/wizard.html) |
|---|---|---|
| **层面** | 执行 | 表单 / 界面 |
| **拆分的对象** | 把作业拆分为依次或并行运行的节点 | 把一个表单的输入拆分为多个页面 |
| **结果** | 1 个工作流作业，每个节点一个作业（各自有自己的 playbook 或模板） | 最后运行 1 个作业 |
| **表单 `type`** | 必须是 `workflow` | 适用于除 `subform` 之外的所有表单类型 |
| **定义方式** | 设计器中的 [工作流文件](workflows/file.html)（`workflow:`） | [子表单](forms/subform.html) 引用的列表（`wizard:`） |
| **适用场景** | “先做 A，再做 B，然后做 C，作为单独的作业” | “我的表单字段太多，一页放不下” |

**要点：** 工作流关注的是 *运行什么以及按什么顺序运行*；`wizard` 关注的是 *用户如何填写表单*。

{: .note }
> 7 之前，执行部分由 `multistep` 表单类型及其 `steps` 完成。它自 7 起已弃用，并将在
> 8 中移除：工作流可以做多步骤表单所做的一切，参见 [多步骤表单](forms/multistep.html)。

#### 仅工作流
{: .no_toc }

`type: workflow` 表单运行设计器中的某个工作流。用户填写单个页面的字段并点击提交，
工作流随后运行其节点，每个节点都以表单的值作为额外变量：

```yaml
- name: Provision host
  type: workflow
  workflow: provision-host
  roles:
    - default
  fields:
    - name: hostname
      type: text
```

#### 仅向导
{: .no_toc }

表单上的 `wizard:` 块把输入收集分散到多个页面上。最后只运行 **一个** 作业：所有页面合并后的 extravars 会发送给单个 playbook、模板或工作流。

```yaml
- name: Provision host
  type: ansible
  roles:
    - default
  playbook: provision.yml
  wizard:
    - subform: basics
      title: Basics
    - subform: network
      title: Network
      defaultModel: net

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: ipv4
      type: text
```

最后会自动追加一个只读的确认页面作为向导的最后一页；您无需在 YAML 中声明它。

#### 组合使用（在工作流之上叠加向导）
{: .no_toc }

向导可以叠加在工作流表单之上。用户填写向导页面并点击提交，**然后** 工作流才开始运行。
通过让向导步骤的 `defaultModel` 与节点的
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) 相匹配，您可以把 **一个向导页面路由到一个节点**：

```yaml
- name: Provision and verify host
  type: workflow
  workflow: provision-host
  roles:
    - default
  wizard:
    - subform: basics
      title: Basics
      defaultModel: basics            # wraps basics fields under `basics`
    - subform: network
      title: Network
      defaultModel: network           # wraps network fields under `network`
```

以及设计器中某个工作流文件里的工作流 `provision-host`：

```yaml
workflow_job_templates:
  - name: provision-host
    related:
      workflow_nodes:
        - identifier: create
          unified_job_template:
            name: create_host.yml
            type: job_template
          extra_vars_key: basics      # only sees the basics page payload
          related:
            success_nodes:
              - identifier: network
        - identifier: network
          unified_job_template:
            name: configure_network.yml
            type: job_template
          extra_vars_key: network     # only sees the network page payload
```

`extra_vars_key` 只做单层查找，因此如果希望二者匹配，请在 `defaultModel` 中使用扁平的名称（例如 `defaultModel: basics`，而不是 `defaultModel: input.basics`）。

完整的属性参考请参见 [向导页面](forms/wizard.html)。

### 如何有条件地显示或跳过向导步骤？

使用 `when:` 完全 **隐藏** 某个步骤，或使用 `optional: true` 让用户 **跳过** 某个可见的步骤。二者相互独立，一般不应组合使用。

#### `when:`：有条件的可见性
{: .no_toc }

当表达式求值为假值时，该步骤会被隐藏。用户永远看不到它，其值也不会被收集。表达式可以通过 `__parent__.<stepname>.<field>` 读取前面的步骤：

```yaml
wizard:
  - subform: basics             # has a `kind` enum field with values vm/bare-metal/container
    title: Basics
  - subform: virtualization
    title: Virtualization
    when: $(__parent__.basics.kind) === 'vm'
  - subform: hardware
    title: Hardware
    when: $(__parent__.basics.kind) === 'bare-metal'
```

只显示与所选 `kind` 匹配的页面。隐藏步骤之后的步骤会自动重新编号。

#### `optional: true`：允许跳过可见的步骤
{: .no_toc }

该步骤在步骤条中 **始终显示**，但用户可以不填写就点击 **下一步**，即使从未访问或完成该页面，也允许 **提交**：

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

用户可以打开 Advanced 页面，保持为空，点击下一步，直接进入确认页面。

{: .note }
> `when:` 控制 *可见性*；`optional:` 控制 *该页面是否必须完成*。不要组合使用它们：要让页面消失，请使用 `when:`；要让它保持可见但可以跳过，请使用 `optional:`。

### 如何引用前面向导步骤中的值？

在后面步骤的任意字段中使用 `$(__parent__.<stepname>.<field>)`。

向导步骤的 `name`（默认为其 `subform` 名称）就是其值暴露给后续步骤时所用的命名空间：

```yaml
- name: Provision host
  type: ansible
  playbook: provision.yml
  roles:
    - default
  wizard:
    - subform: basics          # step name defaults to "basics"
      title: Basics
    - subform: network
      title: Network

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: fqdn
      type: text
      # Re-evaluated when basics.hostname changes
      default: $(__parent__.basics.hostname).local
```

这与 `list` 和 `yaml` 子表单使用的 `__parent__` 机制相同；参见 [如何在子表单中访问父表单的数据？](#how-do-i-access-parent-form-data-inside-a-subform)。

---

## 安全和凭据

### 凭据

传递凭据。

凭据可以通过以下几种方式传递：
* 使用字段属性 `asCredential`  
* 使用 `credentials` 表单属性（键值对）
* 使用名为 `__credentials__` 的 extravar

```yaml
# assume you have 2 credentials created in Ansible Forms
# 1: vcenter
# 2: ad

# you want them exposed to the playbook as
# 1: vc_cred
# 2: ad_cred

# Method 1 : using asCredential field-property
fields:
- name: vc_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'vcenter'"
- name: ad_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'ad'"

# Method 2 : using credentials form-property   
name: myplaybook
type: ansible
playbook: myplaybook.yaml
roles:
  - default
credentials:
  vc_cred: vcenter
  ad_cred: ad
  veeam_cred : veeam_prod,veeam_dev # will first try veeam_prod, then as fallback veeam_dev

# Method 3 : using __credentials__ extravar
fields:
- name: __credentials__
  type: expression
  runLocal: true
  expression: "{vc_cred: 'vcenter',ad_cred: 'ad',veeam_cred:'$(veeam_server)'}"
  # note : in the expression you can use placeholders to make them dynamic
```

### 找回丢失的管理员密码

如果您丢失了本地 `admin` 账户的密码，并且没有其他管理员用户可用，请使用 `REINIT_ADMIN` 恢复选项。**这不是运行时的身份验证绕过**：它只会在启动时对本地管理员账户强制执行一次重置，之后照常进行身份验证。

**工作原理**

启动时设置了 `REINIT_ADMIN=1` 时，AnsibleForms 会：

1. 确保 `admins` 组存在（缺失时创建它）。
2. 查找本地管理员用户（默认用户名为 `admin`，可用 `ADMIN_USERNAME` 覆盖）。
3. 如果该用户存在，把其密码重置为 `ADMIN_PASSWORD` 的值，并把它重新加入 `admins` 组。
4. 如果不存在，则创建它（与全新安装时相同）。
5. 醒目地记录该操作，使其在日志中清晰可见。

**步骤**

1. 停止 AnsibleForms。
2. 设置环境变量（请使用强密码）：
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   在 Docker Compose 中，把它们添加到 AnsibleForms 服务的 `environment:` 块中。
3. 启动 AnsibleForms，并留意日志中类似下面的一行：
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. 用 `admin` / `YourNewStrongPasswordHere` 登录。
5. **取消设置 `REINIT_ADMIN`（或把它改回 `0`）** 并重启，以免以后的重启再次重置管理员密码。

**注意事项**

- 如果您被锁在外面是因为 LDAP 是唯一配置的登录方式而它失败了，恢复后的本地 `admin` 账户始终会回退到本地数据库身份验证，这足以登录并修复 LDAP。
- 以前的 `ENABLE_BYPASS` 环境变量已被移除。它允许用任意密码以 admin 身份登录，保持启用是不安全的。`REINIT_ADMIN` 只重置密码；之后照常进行身份验证。
- `REINIT_ADMIN` 不会使现有的会话和令牌失效；只有密码哈希和组成员关系会改变。

### 限制 REST 辅助函数的目标（允许/拒绝列表）

`fn.fnRestBasic`、`fn.fnRestAdvanced`、`fn.fnRestJwt` 和 `fn.fnRestJwtSecure` 辅助函数可以在表单的 `expression` 属性中调用，以通过 HTTP 获取数据。默认情况下，表达式的作者可以访问 AnsibleForms 主机能够到达的 **任何** URL，在敏感网络中您可能需要加以限制。

两个环境变量分别提供允许列表和拒绝列表：

| 变量 | 行为 |
|---|---|
| `REST_ALLOWED_HOSTS` | 以逗号分隔的主机名或 CIDR。设置后，**只** 允许这些目标。 |
| `REST_DENIED_HOSTS` | 以逗号分隔的主机名或 CIDR。始终阻止。优先于允许列表。 |

主机名与 URL 的主机进行不区分大小写的匹配。CIDR 与该主机解析出的每个 IP 进行匹配，因此 `10.0.0.0/8` 会阻止任何解析到该私有地址段的 DNS 名称。

**示例：**

第一行只允许两个主机；第二行阻止特定的目标：

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **此防护只保护 AnsibleForms 的 Node.js 进程。** playbook 一旦运行，Ansible 本身就可以从主机访问任何地方，不受 AnsibleForms 控制。请用这些列表防止表单作者把表达式变成访问元数据服务或内部界面的代理；不要把它们当作网络防火墙来依赖。

从 7.3.0 起，REST 辅助函数会像其他所有连接一样检查端点的 TLS 证书，并在
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS)（默认 `60`）后放弃。请用
`NODE_EXTRA_CA_CERTS` 信任私有 CA，或者只为使用自签名证书的端点把 [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) 设为 `1`。

### HashiCorp Vault 集成

凭据可以从配置为 **密钥库** 的 HashiCorp Vault 读取其用户名和密码。
参见 [密钥库](secret-stores)。早期版本的 `VAULT_*` 环境变量
会在 7.x 首次启动时导入一次，作为密钥库 `vault`。

对于只在某个 playbook 内部使用的密钥，您也可以使用 `community.hashi_vault`
lookup 插件，它直接从 Vault 读取，绕过 AnsibleForms。

---

## 集成

### 查询 AWX/Tower/AAP

从 AWX 或 Ansible Automation Platform 查询信息。

要用来自 AWX 或 Tower 的数据填充下拉框，请使用 `fn.fnRestBasic` 或 `fn.fnRestJwtSecure`。从 7.3.0 起，这些辅助函数会检查
AWX 地址的证书：如果是自签名证书，请用 `NODE_EXTRA_CA_CERTS` 信任其 CA，或者把
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) 设为 `1`。

```yaml
name: Query awx
type: awx
runner: myAwxConfigName # a runner of type awx
template: my_template # will be overwritten by the field __template__
description: ""
awxCredentials:
  - vmware
executionEnvironment: my_execution_environment
roles:
  - default
categories: []
inventory: my_inventory # will be overwritten by the field __inventory__
tileClass: bg-info-subtle
icon: bullseye
fields:
  # make sure you add credentials called "awx_rest" where the password holds the token
  # if you like basic authentication, switch the expressions below to fn.fnRestBasic instead

  - name: organization
    label: Organization
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/organizations','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: id # => we want the organisation field to hold the id !!
  - name: __template__  # use this special name to override the template from the form
    label: Template
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/job_templates?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name
  - name: __inventory__  # use this special name to override the inventory from the form
    label: Inventory
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/inventories?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name    
  - name: __awxCredentials__  # use this special name to override the credentials from the form
    label: Credentials
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/credentials?organization=$(organization)','','awx_rest','[.results[]]')"
    multiple: true
    default: __auto__
    columns:
      - name
    valueColumn: name     
  - name: __executionEnvironment__  # use this special name to override the executionEnvironment from the form
    label: Execution environment
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/execution_environments?organization=$(organization)','','awx_rest','[.results[]]')"
    default: __auto__
    columns:
      - name
    valueColumn: name           
```

---

## 自定义

### 自定义

自定义 AnsibleForms。

AnsibleForms 是一个 Web 应用。在 Node.js 中原生运行时，您可以替换或修改它的文件。  
不过，推荐的做法是以 Docker 镜像运行它，并添加卷或文件映射。Docker Compose 项目已经映射了一些目录，用于持久保存数据库、playbook、日志、证书和 SSH 密钥，您还可以添加更多映射。自定义徽标在 **徽标** 设置页面上传。  
`custom.js` 文件存放您自己的 JavaScript 函数，供表达式使用。内置函数使用前缀 `fn.`（例如 fn.fnRestBasic）；自定义函数使用前缀 `fnc.`。  
同样，您可以在 `jq.custom.definitions` 文件中添加您自己的 jq 定义。

```yaml
volumes:
  # Mount application folder to host folder (to maintain persistency)
  - ./data:/app/dist/persistent
  # Map custom functions for js expressions and jq
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
  # Map custom sshkey to local node .ssh location
  - ./data/ssh:$HOME_DIR/.ssh
  - ./data/git/.gitconfig:$HOME_DIR/.gitconfig
```

### 启用 YTT

启用 ytt。

要使用 ytt，请设置 `USE_YTT=1`。  
关于 ytt 的更多信息，请参见 https://carvel.dev/ytt/。

{: .important }  
> 此功能尚未经过广泛测试，自作为增强功能加入以来也没有收到任何反馈。  
> 使用 ytt 时，必须禁用设计器：设计器会把 YAML 文件转换为中间 JSON，从而丢掉 ytt 语法（它由 YAML 注释构成）。

根目录中必须存在一个 `lib` 目录；它会自动包含在 ytt 调用中。
可以通过设置带前缀的环境变量来全局提供数据：  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

或者提供库数据文件：

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**库 `demo` 必须存在于 ytt 上下文中（lib/_ytt_lib/demo/values.yml）**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

然后就可以使用加载的数据：

```yaml
# config.yaml
#@ load("@ytt:data", "data")
#@ load("@ytt:library", "library")
#@ demo = library.get("demo")
---
categories:
  - name: Default
    icon: bars
roles:
  - name: admin
    groups:
      - local/admins
constants:
  data_values: #@ data.values
  demo: #@ demo.data_values()
```

---

## 访问控制

### 如何限制用户能做的事（角色选项）？

除了限制角色可以看到哪些表单之外，角色的 `options` 还可以为其成员开启或关闭界面功能。
所有选项、其默认值以及选项在多个角色之间如何组合，请参见 [角色选项](config/roles.html#role-options)。

### 如何在 playbook 或表单中实现自定义 RBAC 逻辑？

每次执行时，前端和后端都可以获得用户身份。

每次提交表单时，AnsibleForms 都会自动把当前用户的完整身份注入发送给 Ansible 的 extravars 中：

```yaml
ansibleforms_user:
  username: jane.doe
  groups:
    - local/admins
    - ldap/network-team
  roles:
    - admin
    - operators
  options:
    showLogs: true
    allowJobRelaunch: true
    # ...all resolved role options
```

因此，您的 playbook 或任何自定义 Ansible 模块都可以直接使用 `ansibleforms_user` 做细粒度的决策，例如只允许某些组修改生产清单，或者用提交者的用户名写入审计记录。

在 **前端**，同一个对象可以通过特殊字段 `__user__` 获得：

```yaml
fields:
  - name: is_admin
    type: expression
    runLocal: true
    hide: true
    expression: "$(__user__.roles).includes('admin')"

  - name: target_env
    type: enum
    # hide the production option for non-admins by cross-referencing __user__
    expression: |
      $(__user__.roles).includes('admin')
        ? ['dev','staging','production']
        : ['dev','staging']
    runLocal: true
    default: __auto__
```

**典型模式：**

用户身份支持以下这些模式：

- **对照 RBAC 配置文件或数据库**：加载一个把组映射到允许资源的 YAML 或 JSON 文件（用 `fn.fnReadYamlFile` 或表达式），然后按 `$(__user__.groups)` 进行筛选
- **审计记录**：把 `ansibleforms_user.username` 作为额外变量传入，记录是谁触发了作业
- **动态字段值**：根据用户的组或角色，显示不同的 enum 选项、预填字段或隐藏某些部分
- **playbook 端授权**：在 playbook 继续执行之前，断言 `ansibleforms_user.groups` 包含所需的组，作为独立于表单 `roles` 列表的纵深防御检查

{: .note }
> 上面的对象是默认发送的内容。如果实例设置了 `EXTRAVARS_USER_FIELDS`，
> 或者表单设置了 `userExtravars`，则只发送其中指定的键，因此对
> `ansibleforms_user.groups` 进行断言的 playbook 要求 `groups` 在其中。前端的
> `__user__` 字段来自登录令牌，从不会被这两个设置裁剪。

---

## 作业调度

### 如何让表单自动按计划运行？

打开 **提交** 旁边的下拉菜单，选择 **调度（周期性）** 或 **稍后运行（一次性）**；它们分别需要角色
选项 `allowScheduledJobs`（管理员级别）和 `allowPlannedJobs`。参见 [调度](jobs/schedules.html)。

### 可以使用哪些 cron 表达式？

周期性调度接受标准的 5 字段 cron 表达式（分、时、日、月、星期）。

| 表达式 | 运行时间 |
|---|---|
| `*/15 * * * *` | 每 15 分钟 |
| `0 * * * *` | 每小时整点 |
| `0 */6 * * *` | 每 6 小时，在 00:00、06:00、12:00 和 18:00 |
| `0 2 * * *` | 每天 02:00 |
| `30 7 * * 1-5` | 周一至周五 07:30 |
| `0 8 * * MON` | 每周一 08:00（接受星期和月份的英文名称） |
| `0 0 1 * *` | 每月第一天的午夜 |
| `0 22 L * *` | 每月最后一天的 22:00 |
| `0 6 * * 1#1` | 每月第一个周一的 06:00 |
| `*/30 * * * * *` | 每 30 秒（前面可选的第六个字段是秒） |

当同时设置了日和星期时，只要其中任一匹配，调度就会运行：`0 0 13 * 5` 会在
每月 13 日以及每个周五运行。服务器会拒绝它无法运行的表达式，或者永远不会出现的表达式（`0 0 30 2 *`）。

在 **调度** 页面上，cron 编辑器会描述表达式并预览接下来的运行时间。它不接受 `@daily` 这样的
别名、`?` 通配符或 `W`（最近工作日）修饰符，因此请使用表中的这些写法。

{: .note }
> **时区** cron 调度按服务器的时区运行，该时区用 [`LOG_TZ`](customization/logging.html#env_LOG_TZ) 设置
> （默认 `UTC`），而不是您的个人资料或浏览器的时区。在 `LOG_TZ=Europe/Madrid` 时，`0 2 * * *` 全年都在马德里时间
> 02:00 运行，并跟随夏令时变化。cron 编辑器在同一时区中预览接下来的运行。仓库的
> 拉取调度也使用同一时区。

---

## 保存和加载表单数据

### 如何在不运行作业的情况下保存并重新加载表单数据？

在 **提交** 旁边的下拉菜单中选择 **保存** 来保存字段值，以后再用 **从已保存项加载** 恢复它们。
密码字段从不存储。这需要角色选项 `allowStoredJobs`。参见 [保存的作业](jobs/stored-jobs.html)。

---

## 嵌套表单和结构化字段

### 如何在表单中收集结构化或重复的数据？

使用带子表单的 `list` 和 `yaml` 字段（6.2.0+）。

要收集复杂的结构化数据，例如服务器列表、一组网络接口或单个嵌套对象，请把 `list` 或 `yaml` 字段类型与 `subform` 一起使用。

**子表单** 是一个可复用的表单片段（用 `type: subform` 定义），从不作为独立的磁贴显示。它只为了被其他表单中的字段引用而存在。完整参考请参见 [子表单文档](forms/subform.html)。

**收集结构化行的列表：`list` 字段：**

`list` 字段为每一行打开一次所引用的子表单：

```yaml
- name: Server
  type: subform
  fields:
    - name: hostname
      type: text
      required: true
    - name: ip
      type: text
      regex:
        expression: ^\d+\.\d+\.\d+\.\d+$
        description: Must be an IPv4 address

- name: Deploy to servers
  type: ansible
  roles:
    - default
  playbook: deploy.yml
  fields:
    - name: servers
      type: list
      subform: Server   # opens Server subform in a drilldown editor per row
```

发送给 Ansible 的 `servers` extravar 是一个对象数组：`[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**编辑单个结构化对象：`yaml` 字段：**

`yaml` 字段有三种模式：

| 模式 | 方式 | 行为 |
|---|---|---|
| **编辑器** | 默认 | 显示完整的带 YAML 语法高亮的编辑器，用户可以直接输入 |
| **只读** | `readonly: true` | 把 YAML 值渲染为格式化的只读文本，不能编辑 |
| **子表单** | `subform: MySubform` | 隐藏原始编辑器；点击时以下钻编辑器的形式打开子表单 |

```yaml
fields:
  # editor mode (default)
  - name: raw_config
    type: yaml

  # readonly mode
  - name: generated_config
    type: yaml
    readonly: true

  # subform mode
  - name: network_config
    type: yaml
    subform: NetworkConfig   # opens NetworkConfig subform as a drilldown editor
```

**上传和下载：`list` 和 `yaml` 字段：**

两种字段类型都通过两个可选属性支持客户端的文件传输：

```yaml
fields:
  - name: servers
    type: list
    subform: Server
    showLoadButton: true      # shows an Upload button: imports content from a local file
    showDownloadButton: true  # shows a Download button: exports current content to a file

  - name: config
    type: yaml
    showLoadButton: true
    showDownloadButton: true
```

{: .note }
> `list` 字段和 `subform` 表单类型取代了 `table` 字段和 `tableFields`，后两者已在 7.0.0 中移除。

### 如何在子表单中访问父表单的数据？

在子表单中通过 `__parent__` 引用父表单字段的值（v6.3.0+）。

子表单打开时，无论是从 **`list`** 字段（每个行编辑器）还是从子表单模式的 **`yaml`** 字段打开，AnsibleForms 都会自动向子表单注入一个名为 `__parent__` 的特殊只读字段。它包含 **子表单打开时父表单中所有字段值** 的快照，包括常量和变量。

这样，子表单字段无需任何额外配置，就能使用引用父表单数据的表达式。

#### `__parent__` 中有什么？
{: .no_toc }

`__parent__` 是一个普通对象，其键为父表单的字段名：

```yaml
__parent__:
  environment: production          # a regular field
  region: eu-west-1
  max_nodes: 10
  owner: jane.doe                  # a constant
  default_image: ubuntu-22.04      # from varsFiles
  __user__:                        # system fields are also included
    username: jane.doe
    roles: [admin]
```

{: .note }
> `__parent__` **不会发送给 Ansible**；与 `__user__` 一样，它会从 extravars 中剔除。它纯粹是供子表单内部表达式使用的前端辅助字段。

#### 在子表单表达式中访问父表单的值
{: .no_toc }

用标准的 `$(...)` 表达式语法引用父表单的值：

```yaml
- name: NodeConfig
  type: subform
  fields:
    - name: node_name
      type: text
      label: Node name
      required: true

    - name: image
      type: enum
      label: Image
      # default to the parent form's chosen image
      expression: "'$(__parent__.default_image)'"
      runLocal: true

    - name: is_production
      type: expression
      hide: true
      runLocal: true
      expression: "'$(__parent__.environment)' === 'production'"

    - name: node_type
      type: enum
      # only offer gpu nodes in production
      expression: |
        '$(__parent__.environment)' === 'production'
          ? ['standard', 'high-memory', 'gpu']
          : ['standard', 'high-memory']
      runLocal: true
      default: __auto__

- name: Deploy cluster
  type: ansible
  roles:
    - default
  playbook: deploy_cluster.yml
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]

    - name: default_image
      type: text
      default: ubuntu-22.04

    - name: nodes
      type: list
      subform: NodeConfig
      columns: [node_name, node_type]
```

#### 嵌套子表单
{: .no_toc }

`__parent__` 始终指向 **直接父级** 表单。如果您在一个本身从父表单打开的子表单中嵌套了一个 `list`，内层子表单的 `__parent__` 保存的是中间那个子表单的数据。要访问更上层，如果中间的子表单也传递了它自己的 `__parent__`，可以链式引用，例如 `$(__parent__.__parent__.someField)`。

### 如何从 `table` / `tableFields` 迁移到 `list` / `subform`？

`table` 字段和 `tableFields` 属性在 6.2.0 中弃用，并在 7.0.0 中移除，仍在使用它们的表单会验证失败。迁移方法：

1. 把 `tableFields` 中的列提取到一个新的 `type: subform` 表单中，使用常规的 `formfields`
2. 把 `table` 字段替换为一个通过 `subform: MySubformName` 引用该子表单的 `list` 字段

**之前：**
```yaml
- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: table
      tableFields:
        - name: username
          type: text
        - name: email
          type: text
```

**之后：**
```yaml
- name: User
  type: subform
  fields:
    - name: username
      type: text
    - name: email
      type: text

- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: list
      subform: User
```

#### 把 `tableFields` 中的 `from` 迁移为 `__parent__` 表达式
{: .no_toc }

`tableFields` 中 enum 列的 `from` 属性会从父表单的另一个字段填充下拉选项。在 `subform` 中，它被一个通过 `__parent__` 读取同一个值的 `expression` 所取代。

**之前：带 `from` 的 `tableFields`：**

```yaml
- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: table
      tableFields:
        - name: department
          type: enum
          from: available_departments   # pulls choices from the parent field above
        - name: firstname
          type: text
```

**之后：带 `__parent__` 表达式的子表单：**

```yaml
- name: Member
  type: subform
  fields:
    - name: department
      type: enum
      # replaces "from: available_departments"
      expression: "$(__parent__.available_departments)"
      runLocal: true

    - name: firstname
      type: text

- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: list
      subform: Member
```

{: .note }
> `$(__parent__.available_departments)` 返回该字段的 **当前值**，因此如果该字段本身是一个动态的 expression 字段，子表单看到的始终是父表单中最新的求值结果。

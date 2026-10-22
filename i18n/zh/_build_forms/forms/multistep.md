---
layout: default
title: 多步骤表单
parent: 表单
nav_order: 5
translated_from: b509f2f7365a2066cabfe1061fdb48c12c33ccbd
---

# 多步骤表单
{: .no_toc }

在一个表单中按顺序运行多个 playbook 或模板
{: .fs-6 .fw-300 }

---

{: .warning }
> `multistep` 自 7 起已弃用，并将在 8 中移除：请改用[工作流](workflow.html)。multistep 能做的事，工作流
> 都能做，而且还支持条件、每个节点各自的值、审批节点以及并行运行的分支。

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign multistep_choice = type_prop.choices | where: "name", "multistep" | first %}
{% assign step_object = form_object.help | where: "name", "Step" | first %}
{% assign steps_prop = form_object.items | where: "name", "steps" | first %}

{{ multistep_choice.description | markdownify }}

{% if multistep_choice.examples.size > 0 %}
{% for e in multistep_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## 表单级属性

多步骤表单在一个表单级属性中定义其所有步骤：

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>{{ steps_prop.name }}</strong><br>
        <span class="af-type">{{ steps_prop.type }}</span><span class="af-required"> / 必填</span>
      </td>
      <td>
        <p><strong>{{ steps_prop.short }}</strong></p>
        {{ steps_prop.description | markdownify }}
      </td>
    </tr>
  </tbody>
</table>

{% assign multistep_props = form_object.items | where_exp: "p", "p.with_types contains 'multistep'" %}

除 `steps` 之外，多步骤表单还接受以下表单级属性，它们记录在 [Ansible 表单](ansible.html)页面中：
{% for p in multistep_props %}{% if p.name != "steps" %}[`{{ p.name }}`](ansible.html#ansible_{{ p.name }}){% if p.required == true %}（必填）{% endif %}{% unless forloop.last %}, {% endunless %}{% endif %}{% endfor %}.

---

## 步骤属性

{{ step_object.description | markdownify }}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% assign groups = step_object.items | map: "group" | uniq | sort_natural %}
    {% for group in groups %}
    {% assign group_properties = step_object.items  | where: "group",group %}
    {% if group %}
    <tr>
      <th id="step_{{ group }}_group" colspan="2" class="af-group-header">
        {{ group }}
      </th>
    </tr>
    {% endif %}
    {% for var in group_properties %}
    <tr>
      <td>
        <span id="step_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / 必填</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / 唯一</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{var.version}} 中添加</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{var.short}}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>
          {{ var.description | markdownify }}
        </p>
        {% if var.choices.size > 0 %}
        <div>
          <strong>选项：</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }}（默认）</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}               
        <div>
          <strong>默认值：</strong><br>
          <span>{{ var.default }}</span>
        </div>   
        {% endif %}   
        {% if var.with_types!=nil %}
        <div>
          <strong class="af-with-types">仅适用于以下类型：</strong><br>
          <span>{{ var.with_types }}</span>
          <br><br>
        </div>
        {% endif %}                          
        {% for c in var.changelog %}
        <div class="af-changelog">
          {% if c.type == "added" %}
          <div class="af-changelog-header">
            <span class="af-badge af-badge-added">新增</span>
            <span class="af-badge af-badge-version">{{ c.version }}</span>
          </div>
          {% endif %}
          <p>
            {{ c.description | markdownify }}
          </p>
        </div>
        {% endfor %}
        {% if var.examples %}
        <p><strong>示例：</strong></p>
        {% endif %}
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
      </td>
    </tr>
    {% endfor %}
    {% endfor %}
    {% if step_object.examples %}          
    <tr>
      <th id="step_examples" colspan="2">
        示例
      </th>
    </tr>
    <tr>
      <td colspan="2">
        {% for e in step_object.examples %}
        <div>
          <p id="step_examples_{{ forloop.index }}"><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}            
      </td>
    </tr>      
    {% endif %}
  </tbody>
</table>

---

## 示例

多步骤表单按顺序运行多个作业，每个步骤运行自己的 playbook 或 AWX 模板。所有步骤共享表单的字段：默认情况下，每个步骤都会收到完整的 extravars，而步骤的 `key` 会把它限制为其中的那一部分。

### 创建并配置服务器

每个步骤收到 extravars 中属于自己的部分：一个 AWX 步骤创建服务器，一个 Ansible 步骤配置其网络，最后一个步骤总是发送报告：

```yaml
name: Server Provisioning
type: multistep
roles:
  - default
categories:
  - Setup
steps:
  - name: Create server
    type: awx
    template: Create VM
    key: server              # receives only the `server` part of the extravars
  - name: Configure network
    type: ansible
    playbook: configure_network.yml
    key: network             # receives only the `network` part of the extravars
  - name: Send report
    type: ansible
    playbook: email.yml
    always: true             # runs even when an earlier step failed
fields:
  - name: server_name
    type: text
    model: server.name
  - name: environment
    type: enum
    values:
      - dev
      - prod
    model: server.environment
  - name: ip_address
    type: text
    model: network.ip
  - name: gateway
    type: text
    model: network.gateway
```

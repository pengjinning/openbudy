"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
const util = require("util");
const fs = require("fs");
const fs$1 = require("fs/promises");
const os = require("os");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
function buildSystemPrompt(mode, workspacePath) {
  const base = [
    "你是 WorkBuddy Agent，一个运行在用户本地工作区的智能助手。",
    `当前工作区路径：${workspacePath}`,
    "请使用中文回答用户问题。",
    "",
    "可用工具：",
    "- shell_execute: 执行 shell 命令",
    "- file_read: 读取文件内容",
    "- file_write: 写入文件",
    "- web_search: 搜索网络",
    "- web_fetch: 抓取网页",
    "",
    "约束：",
    "- 文件操作只能在当前工作区内进行",
    "- 工作区外的访问会被沙箱拦截",
    "- 不要假设文件存在，必要时先 file_read 或 shell_execute ls 确认"
  ];
  switch (mode) {
    case "ask":
      return [
        ...base,
        "",
        "## 模式：ASK（仅问答）",
        "当前模式下你只能回答问题，不允许调用任何工具。",
        "请基于你已有的知识直接给出回答。如果需要文件或网络信息，告诉用户切换到 craft 模式或自行提供。"
      ].join("\n");
    case "craft":
      return [
        ...base,
        "",
        "## 模式：CRAFT（直接执行）",
        "你可以直接调用工具完成任务，无需事先确认。",
        "建议流程：",
        "1. 理解用户目标",
        "2. 调用必要的工具收集信息或执行操作",
        "3. 在每一步关键操作后简短说明你做了什么",
        "4. 任务完成后给出总结",
        "",
        "注意：",
        "- 危险命令（删除、格式化等）执行前先用文字提示用户",
        "- 涉及多文件修改时，先简述计划再开始"
      ].join("\n");
    case "plan":
      return [
        ...base,
        "",
        "## 模式：PLAN（先规划后执行）",
        "执行流程严格分两步：",
        "",
        "### 第一步：规划",
        "不要调用任何工具。先用文字输出一个清晰的执行计划，包含：",
        "- 概述要做什么",
        "- 分步骤列出每一步将调用哪个工具、传什么参数",
        "- 预期的产出",
        "计划写完后停下，输出「等待用户确认后再执行」并结束本轮。",
        "",
        "### 第二步：执行",
        "只有当用户在下一条消息中明确同意（如「确认」「执行」）后，你才允许调用工具执行计划。",
        "执行过程中保持简洁，完成后给出总结。"
      ].join("\n");
    default:
      return base.join("\n");
  }
}
async function* chatStream(messages, modelConfig, tools, signal) {
  var _a, _b;
  const body = {
    model: modelConfig.id,
    messages,
    stream: true,
    max_tokens: modelConfig.maxOutputTokens
  };
  if (tools && tools.length > 0 && modelConfig.supportsToolCalling) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  const response = await fetch(modelConfig.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modelConfig.apiKey}`
    },
    body: JSON.stringify(body),
    signal
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `LLM 请求失败: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ""}`
    );
  }
  if (!response.body) {
    throw new Error("LLM 响应无可读流");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  const toolCallBuffer = /* @__PURE__ */ new Map();
  try {
    while (true) {
      if (signal == null ? void 0 : signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          yield { type: "done", finishReason: "stop" };
          return;
        }
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }
        const choices = json.choices;
        const choice = choices == null ? void 0 : choices[0];
        if (!choice) continue;
        const delta = choice.delta;
        const finishReason = choice.finish_reason;
        if (delta == null ? void 0 : delta.content) {
          yield { type: "text", content: delta.content };
        }
        if (delta == null ? void 0 : delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCallBuffer.get(tc.index) ?? {
              id: "",
              name: "",
              arguments: ""
            };
            if (tc.id) existing.id = tc.id;
            if ((_a = tc.function) == null ? void 0 : _a.name) existing.name = tc.function.name;
            if ((_b = tc.function) == null ? void 0 : _b.arguments) {
              existing.arguments += tc.function.arguments;
            }
            toolCallBuffer.set(tc.index, existing);
          }
        }
        if (finishReason === "tool_calls") {
          const sorted = Array.from(toolCallBuffer.entries()).sort(
            (a, b) => a[0] - b[0]
          );
          for (const [, tc] of sorted) {
            if (tc.id && tc.name) {
              yield {
                type: "tool_call",
                toolCall: {
                  id: tc.id,
                  name: tc.name,
                  arguments: tc.arguments
                }
              };
            }
          }
          toolCallBuffer.clear();
          yield { type: "done", finishReason: "tool_calls" };
          return;
        }
        if (finishReason === "stop") {
          yield { type: "done", finishReason: "stop" };
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
const MAX_FILE_SIZE = 10 * 1024 * 1024;
function validatePath(workspacePath, targetPath) {
  if (!workspacePath || !targetPath) return false;
  const resolvedWorkspace = path.resolve(workspacePath);
  const resolvedTarget = path.resolve(targetPath);
  if (resolvedTarget === resolvedWorkspace) return true;
  const prefix = resolvedWorkspace + path.sep;
  return resolvedTarget.startsWith(prefix);
}
const DANGEROUS_PATTERNS = [
  { pattern: /\brm\s+-rf\s+\/(\s|$)/, reason: "禁止删除根目录" },
  { pattern: /\brm\s+-rf\s+~(\s|$)/, reason: "禁止删除用户主目录" },
  { pattern: /\brm\s+-rf\s+\*(\s|$)/, reason: "禁止通配删除目录内容" },
  { pattern: /\bmkfs\b/, reason: "禁止格式化磁盘" },
  { pattern: /\bdd\s+if=/, reason: "禁止使用 dd 写入块设备" },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: "禁止直接写入块设备" },
  { pattern: /\bshutdown\b/, reason: "禁止关机命令" },
  { pattern: /\breboot\b/, reason: "禁止重启命令" },
  { pattern: /\bhalt\b/, reason: "禁止 halt 命令" },
  { pattern: /:\(\)\s*\{\s*:\|:&\s*\};:/, reason: "禁止 fork 炸弹" },
  {
    pattern: /\bchmod\s+-R\s+[0-7]+\s+\/(\s|$)/,
    reason: "禁止递归修改根目录权限"
  },
  { pattern: /\bcurl\s+.*\|\s*sh\b/, reason: "禁止管道执行远程脚本" },
  { pattern: /\bwget\s+.*\|\s*sh\b/, reason: "禁止管道执行远程脚本" }
];
function validateCommand(command) {
  if (!command || typeof command !== "string") {
    return { safe: false, reason: "命令为空" };
  }
  const cmd = command.trim();
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(cmd)) {
      return { safe: false, reason };
    }
  }
  return { safe: true };
}
const sandbox = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MAX_FILE_SIZE,
  validateCommand,
  validatePath
}, Symbol.toStringTag, { value: "Module" }));
const execAsync = util.promisify(child_process.exec);
const shellExecuteDefinition = {
  type: "function",
  function: {
    name: "shell_execute",
    description: "在当前工作区内执行 shell 命令。可执行命令如 ls、git、npm 等。输出 stdout 与 stderr。",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "要执行的 shell 命令"
        }
      },
      required: ["command"]
    }
  }
};
const shellExecuteHandler = async (args, context) => {
  const command = String(args.command ?? "").trim();
  if (!command) {
    return "错误：未提供命令";
  }
  const check = validateCommand(command);
  if (!check.safe) {
    return `错误：命令被拒绝。${check.reason ?? ""}`;
  }
  if (!validatePath(context.workspacePath, context.workspacePath)) {
    return "错误：工作区路径无效";
  }
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: context.workspacePath,
      timeout: 3e4,
      maxBuffer: 5 * 1024 * 1024,
      // 5MB 输出上限
      signal: context.signal
    });
    const out = stdout.toString().trim();
    const err = stderr.toString().trim();
    if (out && err) return `${out}

[stderr]
${err}`;
    return out || err || "命令执行完成（无输出）";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const anyErr = err;
    const stderr = anyErr.stderr ? anyErr.stderr.toString() : "";
    const stdout = anyErr.stdout ? anyErr.stdout.toString() : "";
    return [
      `命令执行失败：${msg}`,
      stdout ? `
[stdout]
${stdout}` : "",
      stderr ? `
[stderr]
${stderr}` : ""
    ].join("");
  }
};
const fileReadDefinition = {
  type: "function",
  function: {
    name: "file_read",
    description: "读取工作区内某个文件的内容，返回字符串。",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "相对于工作区的文件路径"
        }
      },
      required: ["path"]
    }
  }
};
const fileReadHandler = async (args, context) => {
  const relPath = String(args.path ?? "").trim();
  if (!relPath) {
    return "错误：未提供文件路径";
  }
  const fullPath = path.resolve(context.workspacePath, relPath);
  if (!validatePath(context.workspacePath, fullPath)) {
    return `错误：路径越界，禁止访问工作区外文件：${relPath}`;
  }
  try {
    const stat = await fs.promises.stat(fullPath);
    if (!stat.isFile()) {
      return `错误：路径不是文件：${relPath}`;
    }
    if (stat.size > MAX_FILE_SIZE) {
      return `错误：文件过大（${stat.size} bytes），超过 ${MAX_FILE_SIZE} bytes 限制`;
    }
    const content = await fs.promises.readFile(fullPath, "utf-8");
    return content;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `读取文件失败：${msg}`;
  }
};
const fileWriteDefinition = {
  type: "function",
  function: {
    name: "file_write",
    description: "写入内容到工作区内某个文件，自动创建所需目录。若文件已存在则覆盖。",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "相对于工作区的文件路径"
        },
        content: {
          type: "string",
          description: "要写入的文本内容"
        }
      },
      required: ["path", "content"]
    }
  }
};
const fileWriteHandler = async (args, context) => {
  const relPath = String(args.path ?? "").trim();
  const content = String(args.content ?? "");
  if (!relPath) {
    return "错误：未提供文件路径";
  }
  const fullPath = path.resolve(context.workspacePath, relPath);
  if (!validatePath(context.workspacePath, fullPath)) {
    return `错误：路径越界，禁止写入工作区外文件：${relPath}`;
  }
  const byteLength = Buffer.byteLength(content, "utf-8");
  if (byteLength > MAX_FILE_SIZE) {
    return `错误：内容过大（${byteLength} bytes），超过 ${MAX_FILE_SIZE} bytes 限制`;
  }
  try {
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(fullPath, content, "utf-8");
    return `已写入文件：${relPath}（${byteLength} bytes）`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `写入文件失败：${msg}`;
  }
};
const webSearchDefinition = {
  type: "function",
  function: {
    name: "web_search",
    description: "搜索网络内容，返回相关结果（标题、摘要、链接）。MVP 版本为模拟实现。",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索关键词"
        }
      },
      required: ["query"]
    }
  }
};
function generateMockResults(query) {
  const q = query.trim();
  const encoded = encodeURIComponent(q);
  return [
    {
      title: `${q} - 官方文档`,
      snippet: `这是关于「${q}」的官方文档摘要，包含核心概念、用法示例与最佳实践。`,
      url: `https://example.com/docs/${encoded}`
    },
    {
      title: `${q} 入门教程 | 社区博客`,
      snippet: `一篇关于「${q}」的入门教程，介绍基础原理和常见应用场景。`,
      url: `https://example.com/blog/${encoded}`
    },
    {
      title: `${q} - 维基百科`,
      snippet: `「${q}」的百科条目，涵盖背景、历史发展与参考资料。`,
      url: `https://example.com/wiki/${encoded}`
    },
    {
      title: `${q} GitHub 仓库`,
      snippet: `与「${q}」相关的开源项目，包含 README、issue 和示例代码。`,
      url: `https://github.com/example/${encoded}`
    },
    {
      title: `${q} 问答 - Stack Overflow`,
      snippet: `关于「${q}」的高赞问答，包含开发者讨论与解决方案。`,
      url: `https://stackoverflow.com/questions/tagged/${encoded}`
    }
  ];
}
const webSearchHandler = async (args, _context) => {
  const query = String(args.query ?? "").trim();
  if (!query) {
    return "错误：未提供搜索关键词";
  }
  const results = generateMockResults(query);
  const lines = [`模拟搜索关键词: ${query}`, `共 ${results.length} 条结果：`, ""];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    lines.push(
      `${i + 1}. ${r.title}`,
      `   摘要: ${r.snippet}`,
      `   URL: ${r.url}`,
      ""
    );
  }
  return lines.join("\n");
};
const webFetchDefinition = {
  type: "function",
  function: {
    name: "web_fetch",
    description: "抓取指定 URL 的网页内容，提取纯文本（去除 HTML 标签），限制 500KB。",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要抓取的 URL（http 或 https）"
        }
      },
      required: ["url"]
    }
  }
};
const MAX_FETCH_BYTES = 500 * 1024;
function stripHtml(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
const webFetchHandler = async (args, context) => {
  const url = String(args.url ?? "").trim();
  if (!url) {
    return "错误：未提供 URL";
  }
  if (!/^https?:\/\//i.test(url)) {
    return "错误：URL 必须以 http:// 或 https:// 开头";
  }
  try {
    const response = await fetch(url, {
      signal: context.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WorkBuddyAgent/1.0; +https://example.com)"
      }
    });
    if (!response.ok) {
      return `抓取失败：${response.status} ${response.statusText}`;
    }
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    const truncated = text.length > MAX_FETCH_BYTES;
    const slice = truncated ? text.slice(0, MAX_FETCH_BYTES) : text;
    const content = /html/i.test(contentType) || /<html|<!doctype html/i.test(slice) ? stripHtml(slice) : slice;
    const note = truncated ? `

[内容已截断，仅显示前 ${MAX_FETCH_BYTES} bytes]` : "";
    return content || "抓取到空内容";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return "抓取已取消";
    }
    const msg = err instanceof Error ? err.message : String(err);
    return `抓取 URL 失败：${msg}`;
  }
};
class ToolRegistry {
  constructor() {
    __publicField(this, "tools", /* @__PURE__ */ new Map());
    this.registerBuiltins();
  }
  /**
   * 注册内置的 5 个工具
   */
  registerBuiltins() {
    this.register("shell_execute", shellExecuteDefinition, shellExecuteHandler);
    this.register("file_read", fileReadDefinition, fileReadHandler);
    this.register("file_write", fileWriteDefinition, fileWriteHandler);
    this.register("web_search", webSearchDefinition, webSearchHandler);
    this.register("web_fetch", webFetchDefinition, webFetchHandler);
  }
  /**
   * 注册一个工具
   */
  register(name, definition, handler) {
    this.tools.set(name, { definition, handler });
  }
  /**
   * 取消注册
   */
  unregister(name) {
    this.tools.delete(name);
  }
  /**
   * 获取所有工具定义（供 LLM 调用使用）
   */
  getToolDefinitions() {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }
  /**
   * 检查工具是否已注册
   */
  has(name) {
    return this.tools.has(name);
  }
  /**
   * 执行指定工具
   */
  async execute(name, args, context) {
    const tool = this.tools.get(name);
    if (!tool) {
      return `错误：未注册的工具：${name}`;
    }
    try {
      const execContext = {
        ...context,
        signal: context.signal ?? void 0
      };
      return await tool.handler(args, execContext);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return `工具执行已取消：${name}`;
      }
      const msg = err instanceof Error ? err.message : String(err);
      return `工具执行异常：${name} - ${msg}`;
    }
  }
}
const toolRegistry = new ToolRegistry();
async function executeTools(toolCalls, context) {
  var _a, _b, _c;
  const results = [];
  for (const call of toolCalls) {
    if ((_a = context.signal) == null ? void 0 : _a.aborted) {
      results.push({
        toolCallId: call.id,
        name: call.name,
        output: "任务已取消，工具未执行",
        isError: true
      });
      continue;
    }
    if (call.name === "shell_execute") {
      const cmd = String(((_b = call.arguments) == null ? void 0 : _b.command) ?? "");
      const check = validateCommand(cmd);
      if (!check.safe) {
        results.push({
          toolCallId: call.id,
          name: call.name,
          output: `命令被沙箱拒绝：${check.reason ?? "未知原因"}`,
          isError: true
        });
        continue;
      }
    }
    if (call.name === "file_read" || call.name === "file_write") {
      const relPath = String(((_c = call.arguments) == null ? void 0 : _c.path) ?? "");
      if (relPath) {
        const fullPath = path.resolve(context.workspacePath, relPath);
        const { validatePath: validatePath2 } = await Promise.resolve().then(() => sandbox);
        if (!validatePath2(context.workspacePath, fullPath)) {
          results.push({
            toolCallId: call.id,
            name: call.name,
            output: `路径越界，禁止访问工作区外文件：${relPath}`,
            isError: true
          });
          continue;
        }
      }
    }
    const output = await toolRegistry.execute(call.name, call.arguments, context);
    const isError = output.startsWith("错误") || output.startsWith("命令被沙箱拒绝");
    results.push({
      toolCallId: call.id,
      name: call.name,
      output,
      isError
    });
  }
  return results;
}
const MAX_ITERATIONS = 30;
const TIMEOUT_MS = 6e5;
function createTimer(timeoutMs) {
  const start2 = Date.now();
  return {
    expired: () => Date.now() - start2 >= timeoutMs,
    remaining: () => Math.max(0, timeoutMs - (Date.now() - start2))
  };
}
function emit(taskId, type, data) {
  return { type, taskId, data, timestamp: Date.now() };
}
function historyToLLMMessages(history) {
  const messages = [];
  for (const h of history) {
    if (h.role === "user" || h.role === "assistant") {
      const msg = { role: h.role, content: h.content };
      if (h.role === "assistant" && h.toolCalls && h.toolCalls.length > 0) {
        msg.tool_calls = h.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function",
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments)
          }
        }));
      }
      messages.push(msg);
    }
    if (h.toolResults && h.toolResults.length > 0) {
      for (const tr of h.toolResults) {
        messages.push({
          role: "tool",
          content: tr.output,
          tool_call_id: tr.toolCallId
        });
      }
    }
  }
  return messages;
}
async function start(params, onEvent) {
  const {
    taskId,
    userMessage,
    mode,
    modelConfig,
    workspacePath,
    historyMessages,
    signal
  } = params;
  const timer = createTimer(TIMEOUT_MS);
  const systemPrompt = buildSystemPrompt(mode, workspacePath);
  const messages = [
    { role: "system", content: systemPrompt },
    ...historyToLLMMessages(historyMessages),
    { role: "user", content: userMessage }
  ];
  const tools = mode === "ask" ? void 0 : toolRegistry.getToolDefinitions();
  onEvent(
    emit(taskId, "status_change", {
      status: "running",
      message: `任务开始（模式：${mode}）`
    })
  );
  let iteration = 0;
  while (iteration < MAX_ITERATIONS) {
    if (signal == null ? void 0 : signal.aborted) {
      onEvent(
        emit(taskId, "error", { message: "任务已被用户取消" })
      );
      onEvent(
        emit(taskId, "status_change", { status: "stopped", message: "已取消" })
      );
      return;
    }
    if (timer.expired()) {
      onEvent(
        emit(taskId, "error", {
          message: `任务超时（${TIMEOUT_MS / 1e3}s）`
        })
      );
      onEvent(
        emit(taskId, "status_change", { status: "failed", message: "超时" })
      );
      return;
    }
    iteration += 1;
    onEvent(emit(taskId, "thinking", { iteration }));
    let assistantText = "";
    let assistantToolCalls = [];
    let finishReason;
    try {
      for await (const chunk of chatStream(messages, modelConfig, tools, signal)) {
        if (chunk.type === "text" && chunk.content) {
          assistantText += chunk.content;
          onEvent(
            emit(taskId, "text_delta", {
              content: chunk.content,
              messageId: `msg-${taskId}-${iteration}`
            })
          );
        } else if (chunk.type === "tool_call" && chunk.toolCall) {
          assistantToolCalls.push(chunk.toolCall);
          let parsedArgs = {};
          try {
            parsedArgs = chunk.toolCall.arguments ? JSON.parse(chunk.toolCall.arguments) : {};
          } catch {
            parsedArgs = { _raw: chunk.toolCall.arguments };
          }
          onEvent(
            emit(taskId, "tool_call", {
              toolCallId: chunk.toolCall.id,
              toolName: chunk.toolCall.name,
              arguments: parsedArgs
            })
          );
        } else if (chunk.type === "done") {
          finishReason = chunk.finishReason;
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        onEvent(emit(taskId, "error", { message: "任务已被用户取消" }));
        onEvent(
          emit(taskId, "status_change", { status: "stopped", message: "已取消" })
        );
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      onEvent(emit(taskId, "error", { message: `LLM 调用失败：${msg}` }));
      onEvent(
        emit(taskId, "status_change", { status: "failed", message: msg })
      );
      return;
    }
    if (assistantToolCalls.length === 0 || finishReason === "stop") {
      if (assistantText) {
        messages.push({ role: "assistant", content: assistantText });
      }
      onEvent(
        emit(taskId, "step_complete", {
          iteration,
          text: assistantText,
          toolCalls: []
        })
      );
      onEvent(emit(taskId, "task_complete", { finalText: assistantText }));
      onEvent(
        emit(taskId, "status_change", { status: "completed", message: "已完成" })
      );
      return;
    }
    messages.push({
      role: "assistant",
      content: assistantText,
      tool_calls: assistantToolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.arguments }
      }))
    });
    const toolCalls = assistantToolCalls.map((tc) => {
      let parsedArgs = {};
      try {
        parsedArgs = tc.arguments ? JSON.parse(tc.arguments) : {};
      } catch {
        parsedArgs = { _raw: tc.arguments };
      }
      return { id: tc.id, name: tc.name, arguments: parsedArgs };
    });
    const toolResults = await executeTools(toolCalls, {
      workspacePath,
      taskId,
      signal
    });
    for (const tr of toolResults) {
      onEvent(
        emit(taskId, "tool_result", {
          toolCallId: tr.toolCallId,
          toolName: tr.name,
          output: tr.output,
          isError: tr.isError ?? false
        })
      );
    }
    for (const tr of toolResults) {
      messages.push({
        role: "tool",
        content: tr.output,
        tool_call_id: tr.toolCallId
      });
    }
    onEvent(
      emit(taskId, "step_complete", {
        iteration,
        text: assistantText,
        toolCalls
      })
    );
  }
  onEvent(
    emit(taskId, "error", {
      message: `任务超过最大迭代次数 ${MAX_ITERATIONS}，已停止`
    })
  );
  onEvent(
    emit(taskId, "status_change", {
      status: "failed",
      message: "达到最大迭代次数"
    })
  );
}
const deepseekConfig = {
  id: "deepseek-chat",
  name: "DeepSeek V3",
  provider: "DeepSeek",
  baseUrl: "https://api.deepseek.com/v1/chat/completions",
  apiKey: "",
  maxInputTokens: 128e3,
  maxOutputTokens: 8192,
  supportsToolCalling: true
};
class ModelRegistry {
  constructor() {
    __publicField(this, "models", /* @__PURE__ */ new Map());
    this.models.set(deepseekConfig.id, deepseekConfig);
  }
  /**
   * 根据 id 获取模型配置
   */
  getModel(id) {
    return this.models.get(id);
  }
  /**
   * 列出所有已注册模型
   */
  listModels() {
    return Array.from(this.models.values());
  }
  /**
   * 获取默认模型（当前为 DeepSeek）
   */
  getDefaultModel() {
    return deepseekConfig;
  }
  /**
   * 添加新模型（若 id 已存在则覆盖）
   */
  addModel(model) {
    this.models.set(model.id, model);
  }
  /**
   * 移除模型
   */
  removeModel(id) {
    this.models.delete(id);
  }
}
const modelRegistry = new ModelRegistry();
const abortControllers = /* @__PURE__ */ new Map();
function getMainWindow() {
  const windows = electron.BrowserWindow.getAllWindows();
  return windows[0] || null;
}
function sendAgentEvent(event) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send("agent:event", event);
  }
}
function registerAgentIpc() {
  electron.ipcMain.handle("agent:execute", async (_event, params) => {
    const { taskId, userMessage, mode, modelId, workspacePath, historyMessages } = params;
    const modelConfig = modelRegistry.getModel(modelId);
    if (!modelConfig) {
      return { success: false, error: `Model ${modelId} not found` };
    }
    const abortController = new AbortController();
    abortControllers.set(taskId, abortController);
    try {
      await start(
        {
          taskId,
          userMessage,
          mode,
          modelConfig,
          workspacePath,
          historyMessages,
          signal: abortController.signal
        },
        sendAgentEvent
      );
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      sendAgentEvent({
        type: "error",
        taskId,
        data: { message: errorMsg },
        timestamp: Date.now()
      });
      return { success: false, error: errorMsg };
    } finally {
      abortControllers.delete(taskId);
    }
  });
  electron.ipcMain.on("agent:stop", (taskId) => {
    const controller = abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      abortControllers.delete(taskId);
    }
  });
}
const WORKSPACE_ROOT = path__namespace.join(os__namespace.homedir(), "workbuddy-workspace");
function registerFileIpc() {
  electron.ipcMain.handle("file:read", async (_event, filePath) => {
    try {
      return await fs__namespace.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  electron.ipcMain.handle("file:write", async (_event, filePath, content) => {
    try {
      const dir = path__namespace.dirname(filePath);
      await fs__namespace.mkdir(dir, { recursive: true });
      await fs__namespace.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  electron.ipcMain.handle("file:list", async (_event, dirPath) => {
    try {
      const entries = await fs__namespace.readdir(dirPath, { withFileTypes: true });
      const result = [];
      for (const entry of entries) {
        const fullPath = path__namespace.join(dirPath, entry.name);
        let size = 0;
        if (!entry.isDirectory()) {
          try {
            const stat = await fs__namespace.stat(fullPath);
            size = stat.size;
          } catch {
          }
        }
        result.push({
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size
        });
      }
      return result.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  electron.ipcMain.handle("file:delete", async (_event, filePath) => {
    try {
      await fs__namespace.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  electron.ipcMain.handle("file:mkdir", async (_event, dirPath) => {
    try {
      await fs__namespace.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  electron.ipcMain.handle("file:getWorkspacePath", async (_event, taskId) => {
    const taskWorkspace = path__namespace.join(WORKSPACE_ROOT, taskId);
    try {
      await fs__namespace.mkdir(taskWorkspace, { recursive: true });
    } catch {
    }
    return taskWorkspace;
  });
  electron.ipcMain.handle("file:selectDirectory", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });
}
const CONFIG_DIR = path__namespace.join(os__namespace.homedir(), ".workbuddy-clone");
const CONFIG_FILE = path__namespace.join(CONFIG_DIR, "config.json");
async function ensureConfigDir() {
  try {
    await fs__namespace.mkdir(CONFIG_DIR, { recursive: true });
  } catch {
  }
}
async function readConfig() {
  try {
    const content = await fs__namespace.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}
async function writeConfig(config) {
  await ensureConfigDir();
  await fs__namespace.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
function registerStorageIpc() {
  electron.ipcMain.handle("storage:get", async (_event, key) => {
    const config = await readConfig();
    return config[key] ?? null;
  });
  electron.ipcMain.handle("storage:set", async (_event, key, value) => {
    const config = await readConfig();
    config[key] = value;
    await writeConfig(config);
  });
  electron.ipcMain.handle("storage:delete", async (_event, key) => {
    const config = await readConfig();
    delete config[key];
    await writeConfig(config);
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    title: "WorkBuddy Clone",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    frame: true,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#ffffff"
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  registerAgentIpc();
  registerFileIpc();
  registerStorageIpc();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

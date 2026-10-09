"use strict";
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _a2, _b, _c, _d, _e, _f, _g, _startedAt, _startedAtMonotonic, _AssistantMessageEventStream_instances, time_fn;
const electron = require("electron");
const path$1 = require("path");
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
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path$1);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
function buildAgentSystemPrompt(workspacePath) {
  return [
    "你是 OpenBudy Agent，一个运行在用户本地工作区的智能助手。",
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
    "## 工作方式（自主决策）",
    "根据用户消息自行判断该怎么做：",
    "",
    "### 知识问答 / 解释 / 建议",
    "如果你已有的知识足以回答（概念解释、代码写法、方案建议等），直接给出回答，不要调用任何工具。",
    "",
    "### 需要信息的任务",
    "如果回答依赖工作区文件或网络信息（读代码、查资料、分析现状），先调用工具收集，再基于结果回答。工具调用保持克制：只调用确实需要的。",
    "",
    "### 需要执行的任务",
    "如果用户要求创建、修改、运行什么（写文件、跑命令、生成项目），自主完成：",
    "1. 涉及 3 个以上文件或步骤较多时，先用 2-3 句话简述你要做什么，然后直接开始，无需等待确认",
    "2. 每步关键操作后用一句话说明做了什么",
    "3. 完成后给出简短总结（改了什么 / 产出在哪）",
    "",
    "### 危险操作",
    "删除文件、覆盖已有内容、安装系统级软件等不可逆操作：先说明影响，得到用户同意后再执行。",
    "",
    "约束：",
    "- 文件操作只能在当前工作区内进行，工作区外的访问会被沙箱拦截",
    "- 不要假设文件存在，必要时先 file_read 或 shell_execute ls 确认"
  ].join("\n");
}
function __classPrivateFieldSet(receiver, state2, value, kind, f) {
  if (typeof state2 === "function" ? receiver !== state2 || true : !state2.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state2.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state2, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state2 === "function" ? receiver !== state2 || !f : !state2.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state2.get(receiver);
}
let uuid4 = function() {
  const { crypto: crypto2 } = globalThis;
  if (crypto2 == null ? void 0 : crypto2.randomUUID) {
    uuid4 = crypto2.randomUUID.bind(crypto2);
    return crypto2.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto2 ? () => crypto2.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
};
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
const castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const hasCause = "cause" in err;
        const error = new Error(err.message, hasCause ? { cause: err.cause } : {});
        if (err.stack)
          error.stack = err.stack;
        if (hasCause && !Object.prototype.hasOwnProperty.call(error, "cause"))
          error.cause = err.cause;
        if (err.name)
          error.name = err.name;
        return error;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};
class OpenAIError extends Error {
}
class APIError extends OpenAIError {
  constructor(status, error, message, headers) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.requestID = headers == null ? void 0 : headers.get("x-request-id");
    this.error = error;
    const data = error;
    this.code = data == null ? void 0 : data["code"];
    this.param = data == null ? void 0 : data["param"];
    this.type = data == null ? void 0 : data["type"];
  }
  static makeMessage(status, error, message) {
    const msg = (error == null ? void 0 : error.message) ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse == null ? void 0 : errorResponse["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new APIError(status, error, message, headers);
  }
}
class APIUserAbortError extends APIError {
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
}
class APIConnectionError extends APIError {
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
}
class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}
class LengthFinishReasonError extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
}
class ContentFilterFinishReasonError extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
}
class InvalidWebhookSignatureError extends Error {
  constructor(message) {
    super(message);
  }
}
class OAuthError extends APIError {
  constructor(status, error, headers) {
    let finalMessage = "OAuth2 authentication error";
    let error_code = void 0;
    if (error && typeof error === "object") {
      const errorData = error;
      error_code = errorData["error"];
      const description = errorData["error_description"];
      if (description && typeof description === "string") {
        finalMessage = description;
      } else if (error_code) {
        finalMessage = error_code;
      }
    }
    super(status, error, finalMessage, headers);
    this.error_code = error_code;
  }
}
class SubjectTokenProviderError extends OpenAIError {
  constructor(message, provider, cause) {
    super(message);
    this.provider = provider;
    this.cause = cause;
  }
}
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
let isArray = (val) => (isArray = Array.isArray, isArray(val));
let isReadonlyArray = isArray;
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
const validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
};
const safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
};
const sleep = (ms, ...signals) => new Promise((resolve, reject) => {
  const activeSignals = [...new Set(signals.filter((signal) => signal != null))];
  let timeout;
  let settled = false;
  const cleanup = () => {
    for (const signal of activeSignals) {
      try {
        signal.removeEventListener("abort", abort);
      } catch {
      }
    }
  };
  const settle = (callback) => {
    if (settled) {
      return;
    }
    settled = true;
    if (timeout !== void 0) {
      clearTimeout(timeout);
      timeout = void 0;
    }
    cleanup();
    callback();
  };
  const abort = () => {
    settle(() => reject());
  };
  if (activeSignals.some((signal) => signal.aborted)) {
    abort();
    return;
  }
  timeout = setTimeout(() => {
    settle(resolve);
  }, ms);
  for (const signal of activeSignals) {
    if (settled) {
      break;
    }
    try {
      signal.addEventListener("abort", abort, { once: true });
    } catch (error) {
      settle(() => reject(error));
    }
  }
  if (activeSignals.some((signal) => signal.aborted)) {
    abort();
  }
});
const weakGlobals = globalThis;
const finalizer = (
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Weak references and finalizers are optional host capabilities, so probe them before constructing either.
  typeof weakGlobals.FinalizationRegistry === "function" ? new weakGlobals.FinalizationRegistry((cleanup) => {
    try {
      cleanup();
    } catch {
    }
  }) : void 0
);
const callbackOwners = /* @__PURE__ */ new WeakMap();
const subscriptions = /* @__PURE__ */ new WeakMap();
function subscribeWeakly(signal, reference, registry) {
  let subscription = subscriptions.get(signal);
  if (!subscription) {
    const callbacks = /* @__PURE__ */ new Set();
    const abort = () => {
      var _a3;
      subscriptions.delete(signal);
      for (const callback of callbacks) {
        registry.unregister(callback);
        (_a3 = callback.deref()) == null ? void 0 : _a3();
      }
      callbacks.clear();
    };
    subscription = { callbacks, abort };
    signal.addEventListener("abort", abort, { once: true });
    subscriptions.set(signal, subscription);
  }
  const owner = subscription;
  owner.callbacks.add(reference);
  return () => {
    owner.callbacks.delete(reference);
    registry.unregister(reference);
    if (owner.callbacks.size === 0) {
      if (subscriptions.get(signal) === owner) {
        subscriptions.delete(signal);
      }
      signal.removeEventListener("abort", owner.abort);
    }
  };
}
function releaseOnAbort(signal, callbacks, abort) {
  signal.addEventListener("abort", () => {
    var _a3;
    return (_a3 = callbacks.deref()) == null ? void 0 : _a3.delete(abort);
  }, { once: true });
}
function retainRequestAbortCallback(owner, abort, requestSignal) {
  if (typeof weakGlobals.WeakRef === "function" && finalizer && !requestSignal.aborted) {
    let callbacks = callbackOwners.get(owner);
    if (!callbacks) {
      callbacks = /* @__PURE__ */ new Set();
      callbackOwners.set(owner, callbacks);
    }
    callbacks.add(abort);
    releaseOnAbort(requestSignal, new weakGlobals.WeakRef(callbacks), abort);
  }
}
function addRequestAbortListener(signal, abort, requestSignal) {
  if (signal.aborted) {
    abort();
    return () => {
    };
  }
  if (typeof weakGlobals.WeakRef !== "function" || !finalizer) {
    signal.addEventListener("abort", abort, { once: true });
    return () => signal.removeEventListener("abort", abort);
  }
  const reference = new weakGlobals.WeakRef(abort);
  const cleanup = subscribeWeakly(signal, reference, finalizer);
  finalizer.register(abort, cleanup, reference);
  retainRequestAbortCallback(requestSignal, abort, requestSignal);
  return cleanup;
}
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream2 = globalThis.ReadableStream;
  if (typeof ReadableStream2 === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream2(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      var _a3;
      await ((_a3 = iter.return) == null ? void 0 : _a3.call(iter));
    }
  });
}
function ReadableStreamToAsyncIterable(stream2) {
  if (stream2[Symbol.asyncIterator])
    return stream2;
  const reader = stream2.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result == null ? void 0 : result.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function CancelReadableStream(stream2) {
  var _a3, _b2;
  if (stream2 === null || typeof stream2 !== "object")
    return;
  if (stream2[Symbol.asyncIterator]) {
    await ((_b2 = (_a3 = stream2[Symbol.asyncIterator]()).return) == null ? void 0 : _b2.call(_a3));
    return;
  }
  const reader = stream2.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
let encodeUTF8_;
function encodeUTF8(str) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
var _LineDecoder_instances, _LineDecoder_buffer, _LineDecoder_start, _LineDecoder_end, _LineDecoder_searchIndex, _LineDecoder_skipLeadingLF, _LineDecoder_append;
const MAX_RETAINED_BUFFER_BYTES = 64 * 1024;
class LineDecoder {
  /** Creates a decoder with no buffered bytes or pending newline continuation. */
  constructor() {
    _LineDecoder_instances.add(this);
    _LineDecoder_buffer.set(this, void 0);
    _LineDecoder_start.set(this, void 0);
    _LineDecoder_end.set(this, void 0);
    _LineDecoder_searchIndex.set(this, void 0);
    _LineDecoder_skipLeadingLF.set(this, void 0);
    __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array());
    __classPrivateFieldSet(this, _LineDecoder_start, 0);
    __classPrivateFieldSet(this, _LineDecoder_end, 0);
    __classPrivateFieldSet(this, _LineDecoder_searchIndex, 0);
    __classPrivateFieldSet(this, _LineDecoder_skipLeadingLF, false);
  }
  /**
   * Appends a text or UTF-8 byte chunk and returns every newly completed line.
   *
   * Incomplete lines remain buffered for the next call. A trailing `\r`
   * completes its line immediately, and a following `\n` is consumed as its
   * continuation. `null` and `undefined` are ignored and do not flush buffered
   * content.
   */
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    let binaryChunk;
    if (chunk instanceof ArrayBuffer) {
      binaryChunk = new Uint8Array(chunk);
    } else if (typeof chunk === "string") {
      binaryChunk = encodeUTF8(chunk);
    } else {
      binaryChunk = chunk;
    }
    if (binaryChunk.length === 0) {
      return [];
    }
    if (__classPrivateFieldGet(this, _LineDecoder_skipLeadingLF, "f")) {
      __classPrivateFieldSet(this, _LineDecoder_skipLeadingLF, false);
      if (binaryChunk[0] === 10) {
        binaryChunk = binaryChunk.subarray(1);
      }
      if (binaryChunk.length === 0) {
        return [];
      }
    }
    __classPrivateFieldGet(this, _LineDecoder_instances, "m", _LineDecoder_append).call(this, binaryChunk);
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_searchIndex, "f"), __classPrivateFieldGet(this, _LineDecoder_end, "f"))) != null) {
      const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_start, "f"), patternIndex.preceding));
      lines.push(line);
      __classPrivateFieldSet(this, _LineDecoder_start, patternIndex.index);
      if (patternIndex.carriage) {
        if (__classPrivateFieldGet(this, _LineDecoder_start, "f") < __classPrivateFieldGet(this, _LineDecoder_end, "f") && __classPrivateFieldGet(this, _LineDecoder_buffer, "f")[__classPrivateFieldGet(this, _LineDecoder_start, "f")] === 10) {
          __classPrivateFieldSet(this, _LineDecoder_start, __classPrivateFieldGet(this, _LineDecoder_start, "f") + 1);
        } else if (__classPrivateFieldGet(this, _LineDecoder_start, "f") === __classPrivateFieldGet(this, _LineDecoder_end, "f")) {
          __classPrivateFieldSet(this, _LineDecoder_skipLeadingLF, true);
        }
      }
      __classPrivateFieldSet(this, _LineDecoder_searchIndex, __classPrivateFieldGet(this, _LineDecoder_start, "f"));
    }
    __classPrivateFieldSet(this, _LineDecoder_searchIndex, __classPrivateFieldGet(this, _LineDecoder_end, "f"));
    if (__classPrivateFieldGet(this, _LineDecoder_start, "f") === __classPrivateFieldGet(this, _LineDecoder_end, "f")) {
      __classPrivateFieldSet(this, _LineDecoder_start, 0);
      __classPrivateFieldSet(this, _LineDecoder_end, 0);
      __classPrivateFieldSet(this, _LineDecoder_searchIndex, 0);
      if (__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length > MAX_RETAINED_BUFFER_BYTES) {
        __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array());
      }
    } else if (lines.length > 0 && __classPrivateFieldGet(this, _LineDecoder_buffer, "f").length > MAX_RETAINED_BUFFER_BYTES) {
      const length = __classPrivateFieldGet(this, _LineDecoder_end, "f") - __classPrivateFieldGet(this, _LineDecoder_start, "f");
      if (length <= MAX_RETAINED_BUFFER_BYTES || __classPrivateFieldGet(this, _LineDecoder_buffer, "f").length > length * 4) {
        const capacity = length <= MAX_RETAINED_BUFFER_BYTES ? Math.min(Math.max(length * 2, 256), MAX_RETAINED_BUFFER_BYTES) : length * 2;
        const buffer = new Uint8Array(capacity);
        buffer.set(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_start, "f"), __classPrivateFieldGet(this, _LineDecoder_end, "f")));
        __classPrivateFieldSet(this, _LineDecoder_buffer, buffer);
        __classPrivateFieldSet(this, _LineDecoder_start, 0);
        __classPrivateFieldSet(this, _LineDecoder_end, length);
        __classPrivateFieldSet(this, _LineDecoder_searchIndex, length);
      }
    }
    return lines;
  }
  /** Emits the remaining unterminated line, or returns an empty array when idle. */
  flush() {
    __classPrivateFieldSet(this, _LineDecoder_skipLeadingLF, false);
    if (__classPrivateFieldGet(this, _LineDecoder_start, "f") === __classPrivateFieldGet(this, _LineDecoder_end, "f")) {
      return [];
    }
    return this.decode("\n");
  }
}
_LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_start = /* @__PURE__ */ new WeakMap(), _LineDecoder_end = /* @__PURE__ */ new WeakMap(), _LineDecoder_searchIndex = /* @__PURE__ */ new WeakMap(), _LineDecoder_skipLeadingLF = /* @__PURE__ */ new WeakMap(), _LineDecoder_instances = /* @__PURE__ */ new WeakSet(), _LineDecoder_append = function _LineDecoder_append2(chunk) {
  if (__classPrivateFieldGet(this, _LineDecoder_end, "f") + chunk.length > __classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
    const length = __classPrivateFieldGet(this, _LineDecoder_end, "f") - __classPrivateFieldGet(this, _LineDecoder_start, "f");
    if (__classPrivateFieldGet(this, _LineDecoder_start, "f") >= __classPrivateFieldGet(this, _LineDecoder_buffer, "f").length / 2 && length + chunk.length <= __classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
      __classPrivateFieldGet(this, _LineDecoder_buffer, "f").copyWithin(0, __classPrivateFieldGet(this, _LineDecoder_start, "f"), __classPrivateFieldGet(this, _LineDecoder_end, "f"));
    } else {
      const capacity = Math.max(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length * 2, length + chunk.length, 256);
      const buffer = new Uint8Array(capacity);
      buffer.set(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_start, "f"), __classPrivateFieldGet(this, _LineDecoder_end, "f")));
      __classPrivateFieldSet(this, _LineDecoder_buffer, buffer);
    }
    __classPrivateFieldSet(this, _LineDecoder_searchIndex, __classPrivateFieldGet(this, _LineDecoder_searchIndex, "f") - __classPrivateFieldGet(this, _LineDecoder_start, "f"));
    __classPrivateFieldSet(this, _LineDecoder_end, length);
    __classPrivateFieldSet(this, _LineDecoder_start, 0);
  }
  __classPrivateFieldGet(this, _LineDecoder_buffer, "f").set(chunk, __classPrivateFieldGet(this, _LineDecoder_end, "f"));
  __classPrivateFieldSet(this, _LineDecoder_end, __classPrivateFieldGet(this, _LineDecoder_end, "f") + chunk.length);
};
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, start2, end) {
  const newline = 10;
  const carriage = 13;
  for (let i = start2; i < end; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  for (let i = 0; i < buffer.length - 1; i++) {
    const firstEndingLength = lineEndingLength(buffer, i);
    if (firstEndingLength > 0) {
      const secondEndingIndex = i + firstEndingLength;
      const secondEndingLength = lineEndingLength(buffer, secondEndingIndex);
      if (secondEndingLength > 0) {
        return secondEndingIndex + secondEndingLength;
      }
    }
  }
  return -1;
}
function lineEndingLength(buffer, index) {
  const newline = 10;
  const carriage = 13;
  if (buffer[index] === newline) {
    return 1;
  }
  if (buffer[index] === carriage) {
    return buffer[index + 1] === newline ? 2 : 1;
  }
  return 0;
}
const levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
const parseLogLevel = (maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
};
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
const noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
const sensitiveQueryNames = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "refreshtoken",
  "sessiontoken",
  "sessionid",
  "idtoken",
  "authtoken",
  "authorization",
  "token",
  "password",
  "clientsecret",
  "signingsecret",
  "xamzsecuritytoken",
  "xamzsignature",
  "xamzcredential"
]);
function isSensitiveQueryParameter(name) {
  const normalized = name.toLowerCase().replace(/[-_]/gu, "");
  return sensitiveQueryNames.has(normalized) || sensitiveQueryNames.has(normalized.replace(/^x/u, ""));
}
const sensitiveHeaderNames = /* @__PURE__ */ new Set([
  "authorization",
  "proxy-authorization",
  "api-key",
  "x-api-key",
  "x-amz-security-token",
  "cookie",
  "set-cookie",
  "x-session-token",
  "x-session-id",
  "x-auth-token",
  "x-id-token"
]);
function isSensitiveHeader(name) {
  return sensitiveHeaderNames.has(name.toLowerCase().replace(/_/gu, "-")) || isSensitiveQueryParameter(name);
}
function redactURL(value) {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.hash = "";
  for (const name of url.searchParams.keys()) {
    if (isSensitiveQueryParameter(name)) {
      url.searchParams.set(name, "***");
    }
  }
  return url.href;
}
const formatRequestDetails = (details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
    if (details.options.path) {
      const path2 = details.options.path;
      const redacted = new URL(redactURL(new URL(path2, "https://redacted.invalid").href));
      details.options.path = redacted.origin === "https://redacted.invalid" ? `${path2.startsWith("/") ? "/" : ""}${redacted.pathname.slice(1)}${redacted.search}` : redacted.href;
    }
    if (details.options.query) {
      details.options.query = Object.fromEntries(Object.entries(details.options.query).map(([name, value]) => [
        name,
        isSensitiveQueryParameter(name) ? "***" : value
      ]));
    }
  }
  if (details.url) {
    details.url = redactURL(details.url);
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [name, isSensitiveHeader(name) ? "***" : value]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
};
var _Stream_instances, _Stream_client, _Stream_isTeeBranch, _Stream_cancelIterator;
function isTransportAbortError(error) {
  return !(error instanceof APIError) && isAbortError(error);
}
function createStreamTeeQueue() {
  let entries = [];
  let head = 0;
  let canceled = false;
  return {
    get length() {
      return entries.length - head;
    },
    get canceled() {
      return canceled;
    },
    enqueue(value) {
      if (!canceled) {
        entries.push(value);
      }
    },
    dequeue() {
      if (head === entries.length) {
        return void 0;
      }
      const value = entries[head];
      entries[head] = void 0;
      head += 1;
      if (head === entries.length) {
        entries = [];
        head = 0;
      } else if (head >= 1024 && head * 2 >= entries.length) {
        entries = entries.slice(head);
        head = 0;
      }
      return value;
    },
    cancel() {
      canceled = true;
      entries.length = 0;
      head = 0;
    }
  };
}
class Stream {
  /** Wraps an asynchronous event iterator and the controller that owns its request. */
  constructor(iterator, controller, client) {
    _Stream_instances.add(this);
    _Stream_client.set(this, void 0);
    _Stream_isTeeBranch.set(this, false);
    this.iterator = iterator;
    this.controller = controller;
    __classPrivateFieldSet(this, _Stream_client, client);
  }
  /**
   * Decodes an SSE response into parsed JSON events.
   *
   * The resulting stream can be consumed only once, ignores events after `[DONE]`, and
   * surfaces API error payloads as `APIError` instances. When
   * `synthesizeEventData` is enabled, each item also includes its SSE event name.
   */
  static fromSSEResponse(response, controller, client, synthesizeEventData) {
    let consumed = false;
    const logger = client ? loggerFor(client) : console;
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      let receivedCompletionSentinel = false;
      const messages = _iterSSEMessages(response, controller);
      const closeMessages = messages.return.bind(messages);
      messages.return = (value) => {
        if (!receivedCompletionSentinel) {
          controller.abort();
        }
        return closeMessages(value);
      };
      try {
        for await (const sse of messages) {
          if (sse.data === "[DONE]") {
            receivedCompletionSentinel = true;
            break;
          }
          if (sse.event === null || !sse.event.startsWith("thread.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch {
              logger.error(`Could not parse message into JSON:`);
              logger.error(`From chunk:`);
              throw new SyntaxError("Error reading response: malformed server-sent event JSON.");
            }
            if (sse.event === "error") {
              throw new APIError(void 0, (data == null ? void 0 : data.error) ?? data, void 0, response.headers);
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, response.headers);
            }
            yield synthesizeEventData ? { event: sse.event, data } : data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch {
              logger.error(`Could not parse message into JSON:`);
              logger.error(`From chunk:`);
              throw new SyntaxError("Error reading response: malformed server-sent event JSON.");
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e) {
        if (receivedCompletionSentinel || isTransportAbortError(e) || controller.signal.aborted && e === controller.signal.reason) {
          return;
        }
        throw e;
      } finally {
        if (!done) {
          controller.abort();
        }
      }
    }
    return new Stream(iterator, controller, client);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller, client) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const reader = readableStream.getReader();
      let closed = false;
      let cancelPromise;
      const cancel = () => {
        cancelPromise ?? (cancelPromise = reader.cancel());
        cancelPromise.catch(() => void 0);
      };
      controller.signal.addEventListener("abort", cancel, { once: true });
      try {
        if (controller.signal.aborted) {
          cancel();
          return;
        }
        while (true) {
          const { value: chunk, done } = await reader.read();
          if (done) {
            closed = true;
            break;
          }
          if (controller.signal.aborted) {
            return;
          }
          for (const line of lineDecoder.decode(chunk)) {
            if (controller.signal.aborted) {
              return;
            }
            yield line;
          }
        }
        if (controller.signal.aborted) {
          return;
        }
        for (const line of lineDecoder.flush()) {
          if (controller.signal.aborted) {
            return;
          }
          yield line;
        }
      } finally {
        controller.signal.removeEventListener("abort", cancel);
        if (!closed) {
          cancel();
        }
        reader.releaseLock();
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (line) {
            let data;
            try {
              data = JSON.parse(line);
            } catch (error) {
              if (error instanceof SyntaxError) {
                throw new SyntaxError("Error reading response: malformed newline-delimited JSON.");
              }
              throw error;
            }
            yield data;
          }
        }
        done = true;
      } catch (e) {
        if (controller.signal.aborted || isAbortError(e)) {
          return;
        }
        throw e;
      } finally {
        if (!done) {
          controller.abort();
        }
      }
    }
    return new Stream(iterator, controller, client);
  }
  /** Starts consuming this stream; attempting to consume it again throws. */
  [(_Stream_client = /* @__PURE__ */ new WeakMap(), _Stream_isTeeBranch = /* @__PURE__ */ new WeakMap(), _Stream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   * Closing a branch discards its buffered events without stopping its sibling.
   * Future reads on that branch finish immediately; previously issued `next()`
   * promises remain shared with its sibling and may still resolve with events.
   * Closing both branches invokes the source iterator's `return()` when available.
   * For {@link Stream.fromReadableStream}, closing both branches before iteration
   * starts does not cancel the supplied readable; cancel that readable directly.
   */
  tee() {
    const { controller } = this;
    const left = createStreamTeeQueue();
    const right = createStreamTeeQueue();
    const iterator = this.iterator();
    const teeIterator = (queue) => ({
      next: () => {
        if (queue.canceled) {
          return Promise.resolve({ value: void 0, done: true });
        }
        if (queue.length === 0) {
          const result = iterator.next();
          left.enqueue(result);
          right.enqueue(result);
        }
        return queue.dequeue();
      },
      return: async () => {
        if (!queue.canceled) {
          queue.cancel();
          if (left.canceled && right.canceled) {
            await __classPrivateFieldGet(this, _Stream_instances, "m", _Stream_cancelIterator).call(this, iterator, controller);
          }
        }
        return { value: void 0, done: true };
      }
    });
    const branch = (queue) => {
      const stream2 = new Stream(() => teeIterator(queue), controller, __classPrivateFieldGet(this, _Stream_client, "f"));
      __classPrivateFieldSet(stream2, _Stream_isTeeBranch, true);
      return stream2;
    };
    return [branch(left), branch(right)];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   * Canceling a response-backed readable aborts its request. Canceling a tee
   * branch discards its buffered events and leaves sibling consumers running.
   * Read or serialization failures also release the iterator without replacing the original error.
   */
  toReadableStream() {
    const { controller } = this;
    let iter;
    let cancellation;
    const cancel = () => cancellation ?? (cancellation = __classPrivateFieldGet(this, _Stream_instances, "m", _Stream_cancelIterator).call(this, iter, controller));
    return makeReadableStream({
      start: async () => {
        iter = this[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done) {
            return ctrl.close();
          }
          const bytes = encodeUTF8(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
          void cancel().catch(() => void 0);
        }
      },
      cancel
    });
  }
}
_Stream_cancelIterator = async function _Stream_cancelIterator2(iterator, controller) {
  const returnMethod = iterator.return;
  if (returnMethod) {
    if (!__classPrivateFieldGet(this, _Stream_isTeeBranch, "f")) {
      controller.abort();
    }
    await Reflect.apply(returnMethod, iterator, []);
  }
};
function createAbortableSSESource(body, signal) {
  const reader = typeof body.getReader === "function" ? body.getReader() : void 0;
  const source = reader ? {
    next: () => reader.read(),
    return: () => reader.cancel()
  } : ReadableStreamToAsyncIterable(body)[Symbol.asyncIterator]();
  const ended = { value: void 0, done: true };
  let closed = false;
  let canceled = false;
  let cancellation;
  let interrupt;
  const waitForAbort = () => (
    // oxlint-disable-next-line promise/avoid-new -- AbortSignal callbacks need a portable Promise bridge.
    new Promise((resolve) => {
      interrupt = resolve;
    })
  );
  const cancel = () => {
    var _a3;
    if (canceled || closed) {
      return cancellation;
    }
    canceled = true;
    try {
      cancellation = Promise.resolve((_a3 = source.return) == null ? void 0 : _a3.call(source));
    } catch (error) {
      cancellation = Promise.reject(error);
    }
    cancellation.catch(() => void 0);
    return cancellation;
  };
  const abort = () => {
    queueMicrotask(() => {
      interrupt == null ? void 0 : interrupt();
      cancel();
    });
  };
  const iterator = {
    async next() {
      if (signal.aborted) {
        return ended;
      }
      const aborted = waitForAbort().then(() => ended);
      try {
        const result = await Promise.race([source.next(), aborted]);
        if (signal.aborted) {
          return ended;
        }
        if (result.done) {
          closed = true;
          return ended;
        }
        return { value: result.value, done: false };
      } catch (error) {
        if (signal.aborted && (isAbortError(error) || error === signal.reason)) {
          return ended;
        }
        throw error;
      } finally {
        interrupt = void 0;
      }
    },
    async return() {
      const pending = cancel();
      if (pending && !signal.aborted) {
        const aborted = waitForAbort();
        try {
          if (!signal.aborted) {
            await Promise.race([pending, aborted]);
          }
        } finally {
          interrupt = void 0;
        }
      }
      return ended;
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
  return {
    iterator,
    start() {
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) {
        abort();
      }
    },
    async cleanup(failed) {
      let cleanupError;
      try {
        signal.removeEventListener("abort", abort);
      } catch (error) {
        cleanupError = error;
      }
      if (!closed) {
        const pending = cancel();
        if (pending && !failed && !signal.aborted) {
          try {
            await pending;
          } catch (error) {
            cleanupError ?? (cleanupError = error);
          }
        }
      }
      if (reader) {
        try {
          reader.releaseLock();
        } catch (error) {
          cleanupError ?? (cleanupError = error);
        }
      }
      if (cleanupError !== void 0 && !failed && !signal.aborted) {
        throw cleanupError;
      }
    }
  };
}
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (globalThis.navigator !== void 0 && globalThis.navigator.product === "ReactNative") {
      throw new OpenAIError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const { signal } = controller;
  const source = createAbortableSSESource(response.body, signal);
  let failed = false;
  try {
    source.start();
    for await (const sseChunk of iterSSEChunks(source.iterator)) {
      if (signal.aborted) {
        return;
      }
      for (const line of lineDecoder.decode(sseChunk)) {
        if (signal.aborted) {
          return;
        }
        const sse = sseDecoder.decode(line);
        if (sse) {
          yield sse;
        }
      }
    }
    if (signal.aborted) {
      return;
    }
    for (const line of lineDecoder.flush()) {
      if (signal.aborted) {
        return;
      }
      const sse = sseDecoder.decode(line);
      if (sse) {
        yield sse;
      }
    }
    if (signal.aborted) {
      return;
    }
    const pending = sseDecoder.flush();
    if (pending) {
      yield pending;
    }
  } catch (error) {
    failed = true;
    if (!signal.aborted || !isAbortError(error) && error !== signal.reason) {
      throw error;
    }
  } finally {
    await source.cleanup(failed);
  }
}
const DOUBLE_NEWLINE_DELIMITER_MAX_OVERLAP_BYTES = 3;
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  let dataStart = 0;
  let dataEnd = 0;
  let searchStartIndex = 0;
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    let binaryChunk;
    if (chunk instanceof ArrayBuffer) {
      binaryChunk = new Uint8Array(chunk);
    } else if (typeof chunk === "string") {
      binaryChunk = encodeUTF8(chunk);
    } else {
      binaryChunk = chunk;
    }
    if (dataEnd + binaryChunk.length > data.length) {
      const bufferedLength = dataEnd - dataStart;
      if (dataStart >= data.length / 2 && bufferedLength + binaryChunk.length <= data.length) {
        data.copyWithin(0, dataStart, dataEnd);
      } else {
        const newData = new Uint8Array(Math.max(data.length * 2, bufferedLength + binaryChunk.length));
        newData.set(data.subarray(dataStart, dataEnd));
        data = newData;
      }
      searchStartIndex -= dataStart;
      dataStart = 0;
      dataEnd = bufferedLength;
    }
    data.set(binaryChunk, dataEnd);
    dataEnd += binaryChunk.length;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data.subarray(searchStartIndex, dataEnd))) !== -1) {
      patternIndex += searchStartIndex;
      yield data.slice(dataStart, patternIndex);
      dataStart = patternIndex;
      searchStartIndex = dataStart;
    }
    searchStartIndex = Math.max(dataStart, dataEnd - DOUBLE_NEWLINE_DELIMITER_MAX_OVERLAP_BYTES);
  }
  if (dataEnd > dataStart) {
    yield data.slice(dataStart, dataEnd);
  }
}
class SSEDecoder {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.slice(0, -1);
    }
    if (!line) {
      if (!this.event && !this.data.length) {
        return null;
      }
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    const [fieldname, , initialValue] = partition(line, ":");
    let value = initialValue;
    if (value.startsWith(" ")) {
      value = value.slice(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
  /**
   * Emits a pending event at EOF when the stream omitted the trailing blank
   * line. Returns `null` when no event is in progress so a record that already
   * ended with a blank line is not delivered twice.
   */
  flush() {
    return this.decode("");
  }
}
function partition(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.slice(0, index), delimiter, str.slice(index + delimiter.length)];
  }
  return [str, "", ""];
}
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  let jsonBodyLength;
  const body = await (async () => {
    var _a3;
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller, client, props.options.__synthesizeEventData);
      }
      return Stream.fromSSEResponse(response, props.controller, client, props.options.__synthesizeEventData);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = (_a3 = contentType == null ? void 0 : contentType.split(";")[0]) == null ? void 0 : _a3.trim().toLowerCase();
    const isJSON = (mediaType == null ? void 0 : mediaType.includes("application/json")) || (mediaType == null ? void 0 : mediaType.endsWith("+json"));
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const bodyText = await response.text();
      if (!bodyText) {
        return void 0;
      }
      const json = JSON.parse(bodyText);
      jsonBodyLength = bodyText.length;
      return addRequestID(json, response);
    }
    const text = await response.text();
    return text;
  })().catch((error) => {
    throw asAbortError(error, props.controller.signal);
  });
  if (client.logLevel === "debug") {
    loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      body: jsonBodyLength === void 0 ? body : { type: "json", length: jsonBodyLength },
      durationMs: Date.now() - startTime
    }));
  }
  return body;
}
function asAbortError(error, signal) {
  if (!signal.aborted || error !== signal.reason || isAbortError(error)) {
    return error;
  }
  const message = "This operation was aborted";
  const DOMExceptionConstructor = globalThis.DOMException;
  return typeof DOMExceptionConstructor === "function" ? new DOMExceptionConstructor(message, "AbortError") : Object.assign(new Error(message), { name: "AbortError" });
}
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
const VERSION = "7.19.0";
const isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
};
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
const getPlatformProperties = () => {
  var _a3, _b2;
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : ((_a3 = Deno.version) == null ? void 0 : _a3.deno) ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": ((_b2 = globalThis.process) == null ? void 0 : _b2.version) ?? "unknown"
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /\bEdg(?:e|A|iOS)?\b(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
const normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
const normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
let _platformHeaders;
const getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
const jsonRequestBodyObservers = /* @__PURE__ */ new WeakMap();
function observeJSONRequestBody(body, observer) {
  let observers = jsonRequestBodyObservers.get(body);
  if (!observers) {
    observers = /* @__PURE__ */ new Set();
    jsonRequestBodyObservers.set(body, observers);
  }
  observers.add(observer);
  return () => {
    const active = jsonRequestBodyObservers.get(body);
    if (!active) {
      return;
    }
    active.delete(observer);
    if (active.size === 0) {
      jsonRequestBodyObservers.delete(body);
    }
  };
}
const FallbackEncoder = ({ headers, body }) => {
  const observers = typeof body === "object" && body !== null ? jsonRequestBodyObservers.get(body) : void 0;
  let encoded;
  if (!observers || observers.size === 0) {
    encoded = JSON.stringify(body);
  } else {
    const active = [...observers];
    encoded = JSON.stringify(body, function(key, value) {
      let observed = value;
      for (const observer of active) {
        const replacement = observer.value(this, key, observed);
        if (replacement !== void 0) {
          observed = replacement;
        }
      }
      return observed;
    });
    for (const observer of active) {
      observer.complete();
    }
  }
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: encoded
  };
};
const default_format = "RFC3986";
const default_formatter = String;
const formatters = {
  RFC1738: (v) => String(v).replace(/%20/g, "+"),
  RFC3986: default_formatter
};
const RFC1738 = "RFC1738";
let cachedHas;
const has = (obj, key) => {
  const resolvedHas = cachedHas ?? Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty);
  cachedHas = resolvedHas;
  return resolvedHas(obj, key);
};
const hex_table = /* @__PURE__ */ (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
const limit = 1024;
const encode = (str, _defaultEncoder, charset, _kind, format) => {
  if (str.length === 0) {
    return str;
  }
  let string = str;
  if (typeof str === "symbol") {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== "string") {
    string = String(str);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, ($0) => "%26%23" + Number.parseInt($0.slice(2), 16) + "%3B");
  }
  let out = "";
  for (let j = 0; j < string.length; ) {
    let segmentEnd = Math.min((Math.floor(j / limit) + 1) * limit, string.length);
    if (segmentEnd < string.length && string.codePointAt(segmentEnd - 1) > 65535) {
      segmentEnd += 1;
    }
    const segment = string.length >= limit ? string.slice(j, segmentEnd) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || // -
      c === 46 || // .
      c === 95 || // _
      c === 126 || // ~
      c >= 48 && c <= 57 || // 0-9
      c >= 65 && c <= 90 || // a-z
      c >= 97 && c <= 122 || // A-Z
      format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
    j = segmentEnd;
  }
  return out;
};
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (isArray(val)) {
    const mapped = [];
    for (const item of val) {
      mapped.push(fn(item));
    }
    return mapped;
  }
  return fn(val);
}
const array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
const push_to_array = function push_to_array2(arr, value_or_array) {
  Array.prototype.push.apply(arr, isArray(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: default_formatter,
  /** @deprecated */
  indices: false,
  serializeDate(date) {
    return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (pos !== void 0) {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (tmp_sc.get(sentinel) === void 0) {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate == null ? void 0 : serializeDate(obj);
  } else if (generateArrayPrefix === "comma" && isArray(obj)) {
    obj = maybe_map(obj, (value) => {
      if (value instanceof Date) {
        return serializeDate == null ? void 0 : serializeDate(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      );
      return [
        (formatter == null ? void 0 : formatter(key_value)) + "=" + // @ts-expect-error
        (formatter == null ? void 0 : formatter(encoder(obj, defaults.encoder, charset, "value", format)))
      ];
    }
    return [(formatter == null ? void 0 : formatter(prefix)) + "=" + (formatter == null ? void 0 : formatter(String(obj)))];
  }
  const values2 = [];
  if (obj === void 0) {
    return values2;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && isArray(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    if (sort) {
      keys.sort(sort);
    }
    obj_keys = keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (const key of obj_keys) {
    const value = (
      // @ts-ignore
      typeof key === "object" && key.value !== void 0 ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    let key_prefix;
    if (isArray(obj)) {
      key_prefix = typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix;
    } else {
      key_prefix = adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    }
    sideChannel.set(object, step);
    const valueSideChannel = new WeakMap([[sentinel, sideChannel]]);
    push_to_array(values2, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values2;
}
function normalize_stringify_options(opts = defaults) {
  if (opts.allowEmptyArrays !== void 0 && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (opts.encodeDotInKeys !== void 0 && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && opts.encoder !== void 0 && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (opts.charset !== void 0 && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (opts.format !== void 0) {
    if (!has(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || isArray(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  let allowDots;
  if (opts.allowDots === void 0) {
    allowDots = !!opts.encodeDotInKeys === true ? true : defaults.allowDots;
  } else {
    allowDots = !!opts.allowDots;
  }
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: opts.delimiter === void 0 ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options2 = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options2.filter === "function") {
    filter = options2.filter;
    obj = filter("", obj);
  } else if (isArray(options2.filter)) {
    filter = options2.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options2.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options2.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options2.sort) {
    obj_keys.sort(options2.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (const key of obj_keys) {
    if (options2.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options2.allowEmptyArrays,
      options2.strictNullHandling,
      options2.skipNulls,
      options2.encodeDotInKeys,
      options2.encode ? options2.encoder : null,
      options2.filter,
      options2.sort,
      options2.allowDots,
      options2.serializeDate,
      options2.format,
      options2.formatter,
      options2.encodeValuesOnly,
      options2.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options2.delimiter);
  let prefix = options2.addQueryPrefix === true ? "?" : "";
  if (options2.charsetSentinel) {
    prefix += options2.charset === "iso-8859-1" ? (
      // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
      "utf8=%26%2310003%3B&"
    ) : (
      // encodeURIComponent('✓')
      "utf8=%E2%9C%93&"
    );
  }
  return joined.length > 0 ? prefix + joined : "";
}
function stringifyQuery(query) {
  return stringify(query, { arrayFormat: "brackets" });
}
const endpoints = /* @__PURE__ */ new Map([
  ["global", "https://api.openai.com/v1"],
  ["us", "https://us.api.openai.com/v1"],
  ["eu", "https://eu.api.openai.com/v1"],
  ["ae", "https://ae.api.openai.com/v1"]
]);
function resolveDataResidency(options2) {
  if (options2.dataResidency === null || options2.dataResidency === void 0) {
    return void 0;
  }
  if (hasOwn(options2, "baseURL")) {
    throw new OpenAIError("The `dataResidency` and `baseURL` options are mutually exclusive.");
  }
  const endpoint = endpoints.get(options2.dataResidency);
  if (endpoint === void 0) {
    throw new OpenAIError("Invalid `dataResidency`; expected one of: global, us, eu, ae.");
  }
  return endpoint;
}
var _APIPromise_client;
class APIPromise extends Promise {
  constructor(client, responsePromise, parseResponse2 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse2;
    _APIPromise_client.set(this, void 0);
    __classPrivateFieldSet(this, _APIPromise_client, client);
  }
  _thenUnwrap(transform) {
    return new APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
}
_APIPromise_client = /* @__PURE__ */ new WeakMap();
var _AbstractPage_client;
class AbstractPage {
  constructor(client, response, body, options2) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet(this, _AbstractPage_client, client);
    this.options = options2;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageRequestOptions() != null;
  }
  async getNextPage() {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
}
class PagePromise extends APIPromise {
  constructor(client, request, Page2) {
    super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
}
class Page extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}
class CursorPage extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    var _a3;
    const data = this.getPaginatedItems();
    const id = (_a3 = data[data.length - 1]) == null ? void 0 : _a3.id;
    if (!id) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: id
      }
    };
  }
}
class ConversationCursorPage extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
    this.last_id = body.last_id || "";
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    const cursor = this.last_id;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: cursor
      }
    };
  }
}
class NextCursorPage extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
    this.next = body.next || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return this.nextPageRequestOptions() != null;
  }
  nextPageRequestOptions() {
    const cursor = this.next;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: cursor
      }
    };
  }
}
class TokenPage extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
    this.next = body.next || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return this.nextPageRequestOptions() != null;
  }
  nextPageRequestOptions() {
    const cursor = this.next;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        page: cursor
      }
    };
  }
}
const SUBJECT_TOKEN_TYPES = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
};
const TOKEN_EXCHANGE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:token-exchange";
const MAX_REFRESH_BUFFER_FRACTION = 0.5;
function calculateExpiresAt(expiresIn, exchangeStartedAt) {
  if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new OpenAIError("Token exchange response has invalid 'expires_in' field");
  }
  const now = Date.now();
  const fullLifetimeDeadline = now + expiresIn * 1e3;
  if (!Number.isSafeInteger(fullLifetimeDeadline) || fullLifetimeDeadline <= now) {
    throw new OpenAIError("Token exchange response has invalid 'expires_in' field");
  }
  const expiresAt = fullLifetimeDeadline - (performance.now() - exchangeStartedAt);
  if (expiresAt <= now) {
    throw new OpenAIError("Workload identity token expired before its exchange completed.");
  }
  return expiresAt;
}
function calculateRefreshAt(expiresAt, lifetimeSeconds, refreshBufferSeconds) {
  const configuredBufferMs = (refreshBufferSeconds ?? 1200) * 1e3;
  const effectiveBufferMs = Math.min(configuredBufferMs, lifetimeSeconds * 1e3 * MAX_REFRESH_BUFFER_FRACTION);
  return expiresAt - effectiveBufferMs;
}
const NATIVE_RESPONSE_PROTOTYPE = Response.prototype;
const READ_NATIVE_RESPONSE_BODY = NATIVE_RESPONSE_PROTOTYPE.arrayBuffer;
function isResponsePrototype(response, prototype) {
  var _a3, _b2, _c2, _d2, _e2, _f2;
  const constructor = (_a3 = Object.getOwnPropertyDescriptor(prototype, "constructor")) == null ? void 0 : _a3.value;
  if (prototype === response || typeof constructor !== "function" || ((_b2 = Object.getOwnPropertyDescriptor(constructor, "name")) == null ? void 0 : _b2.value) !== "Response" || ((_c2 = Object.getOwnPropertyDescriptor(constructor, "prototype")) == null ? void 0 : _c2.value) !== prototype) {
    return false;
  }
  const tag = Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag);
  return ((tag == null ? void 0 : tag.value) === "Response" || typeof (tag == null ? void 0 : tag.get) === "function") && typeof ((_d2 = Object.getOwnPropertyDescriptor(prototype, "headers")) == null ? void 0 : _d2.get) === "function" && typeof ((_e2 = Object.getOwnPropertyDescriptor(prototype, "ok")) == null ? void 0 : _e2.get) === "function" && typeof ((_f2 = Object.getOwnPropertyDescriptor(prototype, "status")) == null ? void 0 : _f2.get) === "function";
}
function isResponseBodyPrototype(prototype, responsePrototype) {
  var _a3, _b2, _c2;
  if (prototype === responsePrototype) {
    return true;
  }
  const constructor = (_a3 = Object.getOwnPropertyDescriptor(prototype, "constructor")) == null ? void 0 : _a3.value;
  return responsePrototype !== null && Object.getPrototypeOf(responsePrototype) === prototype && typeof constructor === "function" && ((_b2 = Object.getOwnPropertyDescriptor(constructor, "name")) == null ? void 0 : _b2.value) === "Body" && ((_c2 = Object.getOwnPropertyDescriptor(constructor, "prototype")) == null ? void 0 : _c2.value) === prototype;
}
function decodeNativeResponseBody(body) {
  var _a3;
  const scope = globalThis;
  return new TextDecoder("utf-8", { ignoreBOM: typeof ((_a3 = scope.Bun) == null ? void 0 : _a3.version) === "string" }).decode(body);
}
async function parseOAuthTokenResponse(response) {
  var _a3;
  let readText;
  let responsePrototype = null;
  for (let depth = 0, prototype = response; prototype !== null && depth < 16; prototype = Object.getPrototypeOf(prototype), depth += 1) {
    if (prototype === NATIVE_RESPONSE_PROTOTYPE) {
      break;
    }
    if (isResponsePrototype(response, prototype)) {
      responsePrototype = prototype;
    }
    const parser = Object.getOwnPropertyDescriptor(prototype, "json");
    if (!parser) {
      continue;
    }
    if (typeof parser.value !== "function") {
      break;
    }
    const bodyReader = (_a3 = Object.getOwnPropertyDescriptor(prototype, "text")) == null ? void 0 : _a3.value;
    if (typeof bodyReader === "function" && isResponseBodyPrototype(prototype, responsePrototype)) {
      readText = bodyReader;
      break;
    }
    return parser.value.call(response);
  }
  const body = readText === void 0 ? decodeNativeResponseBody(await READ_NATIVE_RESPONSE_BODY.call(response)) : await readText.call(response);
  try {
    return JSON.parse(body);
  } catch {
    throw new SyntaxError("Token exchange response contains invalid JSON");
  }
}
function isUnsafeAccessToken(accessToken) {
  var _a3;
  const scope = globalThis;
  if (typeof ((_a3 = scope.Bun) == null ? void 0 : _a3.version) === "string") {
    return /[^\t\u0020-\u007E]|^[\t ]|[\t ]$/u.test(accessToken);
  }
  return /[^\t\u0020-\u007E\u0080-\u00FF]|^[\t ]|[\t ]$/u.test(accessToken);
}
class WorkloadIdentityAuth {
  /**
   * Creates a workload-identity token cache and OAuth token-exchange client.
   *
   * @param config External identity provider, OpenAI service account, and refresh settings.
   * @param fetch Optional fetch implementation for calls to the OpenAI token endpoint.
   */
  constructor(config, fetch2) {
    this.cachedToken = null;
    this.refreshPromise = null;
    this.tokenGeneration = 0;
    this.tokenExchangeUrl = "https://auth.openai.com/oauth/token";
    const { identityProviderId, serviceAccountId, clientId, refreshBufferSeconds, provider } = config;
    this.config = {
      identityProviderId,
      serviceAccountId,
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...clientId === void 0 ? {} : { clientId },
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...refreshBufferSeconds === void 0 ? {} : { refreshBufferSeconds },
      provider: {
        tokenType: provider.tokenType,
        getToken: provider.getToken.bind(provider)
      }
    };
    this.fetch = fetch2 ?? getDefaultFetch();
  }
  /**
   * Returns a valid OpenAI access token, exchanging or refreshing credentials as needed.
   *
   * Cached tokens nearing expiration are returned immediately while a background
   * refresh runs. Concurrent callers share the same in-flight token exchange.
   *
   * @throws {OAuthError} When the token endpoint rejects the subject token or identity.
   * @throws {APIError} When another unsuccessful HTTP response prevents token exchange.
   * @throws {OpenAIError} When a successful exchange has an invalid access token or expiration.
   */
  async getToken() {
    if (!this.cachedToken || WorkloadIdentityAuth.isTokenExpired(this.cachedToken)) {
      if (this.refreshPromise) {
        return await this.refreshPromise;
      }
      const refreshPromise = this.refreshToken(this.tokenGeneration);
      this.refreshPromise = refreshPromise;
      try {
        return await refreshPromise;
      } finally {
        if (this.refreshPromise === refreshPromise) {
          this.refreshPromise = null;
        }
      }
    }
    if (WorkloadIdentityAuth.needsRefresh(this.cachedToken) && !this.refreshPromise) {
      const refreshPromise = this.refreshToken(this.tokenGeneration).finally(() => {
        if (this.refreshPromise === refreshPromise) {
          this.refreshPromise = null;
        }
      });
      this.refreshPromise = refreshPromise;
      void refreshPromise.catch(() => null);
    }
    return this.cachedToken.token;
  }
  async refreshToken(generation) {
    const subjectToken = await this.config.provider.getToken();
    const body = {
      grant_type: TOKEN_EXCHANGE_GRANT_TYPE,
      subject_token: subjectToken,
      subject_token_type: SUBJECT_TOKEN_TYPES[this.config.provider.tokenType],
      identity_provider_id: this.config.identityProviderId,
      service_account_id: this.config.serviceAccountId
    };
    if (this.config.clientId) {
      body["client_id"] = this.config.clientId;
    }
    const exchangeStartedAt = performance.now();
    const response = await this.fetch(this.tokenExchangeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      redirect: "manual"
    });
    if (!response.ok) {
      const errorText = await response.text();
      let body2 = void 0;
      try {
        body2 = JSON.parse(errorText);
      } catch {
      }
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new OAuthError(response.status, body2, response.headers);
      }
      throw APIError.generate(response.status, body2, `Token exchange failed with status ${response.status}`, response.headers);
    }
    const tokenResponse = await parseOAuthTokenResponse(response);
    const accessToken = typeof tokenResponse === "object" && tokenResponse !== null && "access_token" in tokenResponse ? tokenResponse.access_token : void 0;
    if (typeof accessToken !== "string" || accessToken.trim().length === 0 || isUnsafeAccessToken(accessToken)) {
      throw new OpenAIError("Token exchange response missing 'access_token' field");
    }
    const expiresIn = tokenResponse.expires_in ?? 3600;
    const expiresAt = calculateExpiresAt(expiresIn, exchangeStartedAt);
    if (this.tokenGeneration === generation) {
      this.cachedToken = {
        token: accessToken,
        expiresAt,
        refreshAt: calculateRefreshAt(expiresAt, expiresIn, this.config.refreshBufferSeconds)
      };
    }
    return accessToken;
  }
  static isTokenExpired(cachedToken) {
    return Date.now() >= cachedToken.expiresAt;
  }
  static needsRefresh(cachedToken) {
    return Date.now() >= cachedToken.refreshAt;
  }
  /** Discards the cached access token so the next request performs a fresh exchange. */
  invalidateToken() {
    this.tokenGeneration += 1;
    this.cachedToken = null;
    this.refreshPromise = null;
  }
}
const X509_API_BASE_URL = "https://mtls.api.openai.com/v1";
function assertX509APIOrigin(value) {
  let target;
  try {
    target = new URL(value);
  } catch {
    throw new OpenAIError("X.509 workload identity requires the approved global mTLS API origin.");
  }
  if (target.origin !== "https://mtls.api.openai.com" || target.username || target.password) {
    throw new OpenAIError("X.509 workload identity requires the approved global mTLS API origin.");
  }
  for (const name of target.searchParams.keys()) {
    if (isSensitiveQueryParameter(name)) {
      throw new OpenAIError("X.509 workload identity cannot send conflicting query authentication credentials.");
    }
  }
  return target;
}
const brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
const httpTokenHeaderName = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values: values2, nulls } = headers;
    yield* values2.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  const iterator = Symbol.iterator in headers ? headers[Symbol.iterator] : void 0;
  if (typeof iterator === "function") {
    iter = { [Symbol.iterator]: () => iterator.call(headers) };
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values2 = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values2) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
const buildHeaders = (newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      if (!httpTokenHeaderName.test(name)) {
        throw new TypeError(`Header name must be a valid HTTP token ["${name}"]`);
      }
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(lowerName);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(lowerName);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(lowerName, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};
const registeredX509Transports = /* @__PURE__ */ new WeakMap();
const transientX509ConnectionErrors = /* @__PURE__ */ new WeakSet();
const retryableX509IssuerErrors = /* @__PURE__ */ new WeakSet();
const approvedX509Clients = /* @__PURE__ */ new WeakSet();
const approvedX509OAuthErrors = /* @__PURE__ */ new WeakMap();
const approvedX509Credentials = /* @__PURE__ */ new WeakMap();
const findRegisteredX509Transport$1 = WeakMap.prototype.get.bind(registeredX509Transports);
WeakMap.prototype.set.bind(registeredX509Transports);
WeakSet.prototype.add.bind(transientX509ConnectionErrors);
const isTransientX509ConnectionError$1 = WeakSet.prototype.has.bind(transientX509ConnectionErrors);
WeakSet.prototype.add.bind(retryableX509IssuerErrors);
const isRetryableX509IssuerError$1 = WeakSet.prototype.has.bind(retryableX509IssuerErrors);
const markApprovedX509Client$1 = WeakSet.prototype.add.bind(approvedX509Clients);
WeakSet.prototype.has.bind(approvedX509Clients);
WeakMap.prototype.set.bind(approvedX509OAuthErrors);
const findX509OAuthError$1 = WeakMap.prototype.get.bind(approvedX509OAuthErrors);
WeakMap.prototype.set.bind(approvedX509Credentials);
const findX509Credential$1 = WeakMap.prototype.get.bind(approvedX509Credentials);
const browserState = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  findRegisteredX509Transport: findRegisteredX509Transport$1,
  findX509Credential: findX509Credential$1,
  findX509OAuthError: findX509OAuthError$1,
  isRetryableX509IssuerError: isRetryableX509IssuerError$1,
  isTransientX509ConnectionError: isTransientX509ConnectionError$1,
  markApprovedX509Client: markApprovedX509Client$1
}, Symbol.toStringTag, { value: "Module" }));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var x509TransportState = { exports: {} };
(function(module2, exports) {
  if (module2 !== globalThis.module && true && module2.exports === exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findX509Credential = exports.rememberX509Credential = exports.findX509OAuthError = exports.rememberX509OAuthError = exports.isApprovedX509Client = exports.markApprovedX509Client = exports.isRetryableX509IssuerError = exports.markRetryableX509IssuerError = exports.isTransientX509ConnectionError = exports.markTransientX509ConnectionError = exports.rememberRegisteredX509Transport = exports.findRegisteredX509Transport = void 0;
    const registeredX509Transports2 = /* @__PURE__ */ new WeakMap();
    const transientX509ConnectionErrors2 = /* @__PURE__ */ new WeakSet();
    const retryableX509IssuerErrors2 = /* @__PURE__ */ new WeakSet();
    const approvedX509Clients2 = /* @__PURE__ */ new WeakSet();
    const approvedX509OAuthErrors2 = /* @__PURE__ */ new WeakMap();
    const approvedX509Credentials2 = /* @__PURE__ */ new WeakMap();
    exports.findRegisteredX509Transport = WeakMap.prototype.get.bind(registeredX509Transports2);
    exports.rememberRegisteredX509Transport = WeakMap.prototype.set.bind(registeredX509Transports2);
    exports.markTransientX509ConnectionError = WeakSet.prototype.add.bind(transientX509ConnectionErrors2);
    exports.isTransientX509ConnectionError = WeakSet.prototype.has.bind(transientX509ConnectionErrors2);
    exports.markRetryableX509IssuerError = WeakSet.prototype.add.bind(retryableX509IssuerErrors2);
    exports.isRetryableX509IssuerError = WeakSet.prototype.has.bind(retryableX509IssuerErrors2);
    exports.markApprovedX509Client = WeakSet.prototype.add.bind(approvedX509Clients2);
    exports.isApprovedX509Client = WeakSet.prototype.has.bind(approvedX509Clients2);
    exports.rememberX509OAuthError = WeakMap.prototype.set.bind(approvedX509OAuthErrors2);
    exports.findX509OAuthError = WeakMap.prototype.get.bind(approvedX509OAuthErrors2);
    exports.rememberX509Credential = WeakMap.prototype.set.bind(approvedX509Credentials2);
    exports.findX509Credential = WeakMap.prototype.get.bind(approvedX509Credentials2);
  }
})(x509TransportState, x509TransportState.exports);
var x509TransportStateExports = x509TransportState.exports;
const nodeState = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null
}, [x509TransportStateExports]);
const state = typeof x509TransportStateExports.findRegisteredX509Transport === "function" ? nodeState : browserState;
const {
  findRegisteredX509Transport,
  isTransientX509ConnectionError,
  isRetryableX509IssuerError,
  markApprovedX509Client,
  findX509OAuthError,
  findX509Credential
} = state;
function resolveX509Transport(value) {
  if (!value || typeof value !== "object") {
    throw new OpenAIError("X.509 workload identity requires an approved X.509 transport capability.");
  }
  const registered = findRegisteredX509Transport(value);
  if (!registered) {
    throw new OpenAIError("X.509 workload identity requires an approved X.509 transport capability.");
  }
  return registered;
}
var _X509WorkloadIdentityAuth_instances, _a$2, _X509WorkloadIdentityAuth_identityProviderId, _X509WorkloadIdentityAuth_serviceAccountId, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, _X509WorkloadIdentityAuth_organization, _X509WorkloadIdentityAuth_project, _X509WorkloadIdentityAuth_transport, _X509WorkloadIdentityAuth_refreshBufferMs, _X509WorkloadIdentityAuth_cachedToken, _X509WorkloadIdentityAuth_refresh, _X509WorkloadIdentityAuth_tokenGeneration, _X509WorkloadIdentityAuth_cancelRequestBody, _X509WorkloadIdentityAuth_assignToken, _X509WorkloadIdentityAuth_recoverRefreshFailure, _X509WorkloadIdentityAuth_fallbackToken, _X509WorkloadIdentityAuth_retireRefresh, _X509WorkloadIdentityAuth_beginRefresh, _X509WorkloadIdentityAuth_refreshToken, _X509WorkloadIdentityAuth_preflight, _X509WorkloadIdentityAuth_scope, _X509WorkloadIdentityAuth_assertTenantHeaders;
const FORBIDDEN_TRANSPORT_OPTIONS = ["dispatcher", "agent", "client", "tls", "proxy"];
const headerValue = (headers, name) => Headers.prototype.get.call(headers, name);
const DEFAULT_REFRESH_BUFFER_MS = 20 * 60 * 1e3;
const FAILED_REFRESH_COOLDOWN_MS = 1e3;
const userAbortError = (signal) => {
  const error = new APIUserAbortError();
  Object.defineProperty(error, "cause", { value: signal.reason, writable: true, configurable: true });
  return error;
};
function assertSafeHeaders(headers) {
  for (const name of Headers.prototype.keys.call(headers)) {
    const canonical = name.toLowerCase().split("_").join("-");
    if (canonical !== "authorization" && isSensitiveHeader(canonical) || canonical === "host") {
      throw new OpenAIError("X.509 workload identity cannot send conflicting authentication credentials.");
    }
  }
}
function exchangeDeadline(timeout, callerSignal) {
  const deadline = new AbortController();
  const timer = timeout === void 0 ? void 0 : setTimeout(() => deadline.abort(new APIConnectionTimeoutError()), timeout);
  const timerHandle = timer;
  if (typeof timerHandle === "object" && timerHandle !== null && "unref" in timerHandle && typeof timerHandle.unref === "function") {
    timerHandle.unref();
  }
  const cancel = () => deadline.abort(callerSignal == null ? void 0 : callerSignal.reason);
  callerSignal == null ? void 0 : callerSignal.addEventListener("abort", cancel, { once: true });
  if (callerSignal == null ? void 0 : callerSignal.aborted) {
    cancel();
  }
  return {
    signal: deadline.signal,
    dispose: () => {
      callerSignal == null ? void 0 : callerSignal.removeEventListener("abort", cancel);
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
}
function waitForRefresh(attempt, signal) {
  let abort;
  const canceled = new Promise((_resolve, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
    }
  });
  return {
    result: Promise.race([attempt.promise, canceled]),
    dispose: () => {
      if (abort) {
        signal.removeEventListener("abort", abort);
      }
    }
  };
}
function isX509WorkloadIdentity(identity) {
  if (!identity || typeof identity !== "object") {
    return false;
  }
  let providerOwner = identity;
  while (providerOwner !== null && providerOwner !== Object.prototype) {
    const provider = Object.getOwnPropertyDescriptor(providerOwner, "provider");
    if (provider) {
      if (!("value" in provider) || provider.value !== void 0) {
        return false;
      }
      break;
    }
    providerOwner = Object.getPrototypeOf(providerOwner);
  }
  let current = identity;
  while (current !== null && current !== Object.prototype) {
    const discriminator = Object.getOwnPropertyDescriptor(current, "type");
    if (discriminator) {
      if (!("value" in discriminator)) {
        throw new OpenAIError("X.509 workload identity type must be a plain data property.");
      }
      return discriminator.value === "x509";
    }
    current = Object.getPrototypeOf(current);
  }
  return false;
}
function assertX509FetchOptions(options2) {
  var _a3;
  if (!options2) {
    return;
  }
  for (const name of FORBIDDEN_TRANSPORT_OPTIONS) {
    if (hasOwn(options2, name)) {
      throw new OpenAIError("X.509 workload identity cannot override its approved transport capability.");
    }
  }
  const redirect = (_a3 = Object.getOwnPropertyDescriptor(options2, "redirect")) == null ? void 0 : _a3.value;
  if (redirect !== void 0 && redirect !== "manual") {
    throw new OpenAIError("X.509 workload identity requests require manual redirects.");
  }
}
function assertX509RequestOptions(options2) {
  assertX509FetchOptions(options2);
  if (options2 && ["body", "headers", "method", "signal"].some((name) => hasOwn(options2, name))) {
    throw new OpenAIError("X.509 workload identity cannot override its request body, headers, method, or signal through fetch options.");
  }
}
function snapshotX509RequestOptions(options2) {
  assertX509RequestOptions(options2);
  const snapshot = { ...options2 };
  assertX509RequestOptions(snapshot);
  return snapshot;
}
class X509WorkloadIdentityAuth {
  /** Captures one registered, immutable certificate identity and its enrolled selectors. */
  constructor(identity, transport, organization, project) {
    _X509WorkloadIdentityAuth_instances.add(this);
    _X509WorkloadIdentityAuth_identityProviderId.set(this, void 0);
    _X509WorkloadIdentityAuth_serviceAccountId.set(this, void 0);
    _X509WorkloadIdentityAuth_configuredRefreshBufferMs.set(this, void 0);
    _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds.set(this, void 0);
    _X509WorkloadIdentityAuth_organization.set(this, void 0);
    _X509WorkloadIdentityAuth_project.set(this, void 0);
    _X509WorkloadIdentityAuth_transport.set(this, void 0);
    _X509WorkloadIdentityAuth_refreshBufferMs.set(this, void 0);
    _X509WorkloadIdentityAuth_cachedToken.set(this, void 0);
    _X509WorkloadIdentityAuth_refresh.set(this, void 0);
    _X509WorkloadIdentityAuth_tokenGeneration.set(this, 0);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_transport, resolveX509Transport(transport));
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_identityProviderId, identity.identityProviderId);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_serviceAccountId, identity.serviceAccountId);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, identity.refreshBufferMs);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, identity.refreshBufferSeconds);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_organization, organization);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_project, project);
    if (__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") !== void 0 && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") !== void 0) {
      throw new OpenAIError("X.509 workload identity cannot combine refreshBufferSeconds and refreshBufferMs.");
    }
    if (__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") !== void 0 && (!Number.isSafeInteger(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f")) || __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") < 0)) {
      throw new OpenAIError("X.509 workload identity requires a nonnegative integer refreshBufferMs.");
    }
    if (__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") !== void 0 && (!Number.isSafeInteger(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f")) || __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") < 0 || !Number.isSafeInteger(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") * 1e3))) {
      throw new OpenAIError("X.509 workload identity requires a nonnegative integer refreshBufferSeconds.");
    }
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_refreshBufferMs, __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") === void 0 ? __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") ?? DEFAULT_REFRESH_BUFFER_MS : __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") * 1e3);
  }
  /** Reconstructs the immutable selectors captured before caller-owned identity mutation. */
  identitySnapshot() {
    return {
      type: "x509",
      identityProviderId: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_identityProviderId, "f"),
      serviceAccountId: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_serviceAccountId, "f"),
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") === void 0 ? {} : { refreshBufferMs: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferMs, "f") },
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") === void 0 ? {} : { refreshBufferSeconds: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds, "f") }
    };
  }
  /** Preserves explicitly headerless requests without presenting a certificate to the issuer. */
  static shouldAuthenticate(options2, defaultHeaders, requestHeaders = options2.headers) {
    return !buildHeaders([defaultHeaders, requestHeaders]).nulls.has("authorization");
  }
  /** Snapshots each caller-owned header layer once while preserving nulls and precedence. */
  snapshotHeaders(defaultHeaders, requestHeaders) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    scope.defaultHeaders ?? (scope.defaultHeaders = buildHeaders([defaultHeaders]));
    scope.requestHeaders ?? (scope.requestHeaders = buildHeaders([requestHeaders]));
    return this.headerSnapshots();
  }
  /** Returns the already rendered caller headers without touching mutable inputs again. */
  headerSnapshots() {
    const { defaultHeaders, requestHeaders } = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (!defaultHeaders || !requestHeaders) {
      throw new OpenAIError("X.509 workload identity requires snapshotted request headers.");
    }
    return { defaultHeaders, requestHeaders };
  }
  /** Captures enrolled public tenant selectors once before certificate presentation. */
  snapshotTenant(organization, project) {
    if (organization !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_organization, "f") || project !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_project, "f")) {
      throw new OpenAIError("X.509 workload identity cannot override its enrolled organization or project.");
    }
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    scope.tenant = { organization, project };
    return scope.tenant;
  }
  /** Returns the tenant selectors already approved for this logical request. */
  tenantSnapshot() {
    const { tenant } = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (!tenant) {
      throw new OpenAIError("X.509 workload identity requires snapshotted tenant selectors.");
    }
    return tenant;
  }
  /** Validates and retains the exact destination that authenticated dispatch will use. */
  snapshotAPIURL(value) {
    assertX509APIOrigin(value);
    __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).apiURL = value;
  }
  /** Reads the already-approved destination without rerendering caller-owned request options. */
  requestAPIURL() {
    const { apiURL } = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (apiURL === void 0) {
      throw new OpenAIError("X.509 workload identity requires a snapshotted API destination.");
    }
    return apiURL;
  }
  /** Captures the exact caller settings approved for authenticated dispatch. */
  snapshotRequest(signal, timeout, fetchOptions) {
    var _b2;
    (_b2 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this)).request ?? (_b2.request = { signal, timeout, fetchOptions });
  }
  /** Returns immutable request settings without invoking caller-owned accessors again. */
  requestSnapshot() {
    const { request } = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (!request) {
      throw new OpenAIError("X.509 workload identity requires snapshotted request settings.");
    }
    return request;
  }
  /** Suspends an already-running network budget during retry-local asynchronous preparation. */
  beginRequestPreparation() {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (scope.deadlineArmed && scope.preparationStartedAt === void 0) {
      scope.preparationStartedAt = performance.now();
      scope.preparationWallStartedAt = Date.now();
    }
  }
  /** Begins local request construction without charging protected hook latency to the network. */
  beginRequestPlanning() {
    __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).phase = "planning";
  }
  /** Arms one absolute network deadline only after all local request preparation completes. */
  beginRequestNetwork() {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (!scope.deadlineArmed) {
      scope.wallStartedAt = Date.now();
      scope.monotonicStartedAt = performance.now();
      scope.deadlineArmed = true;
    } else if (scope.preparationStartedAt !== void 0) {
      scope.monotonicStartedAt += performance.now() - scope.preparationStartedAt;
      scope.wallStartedAt += Date.now() - (scope.preparationWallStartedAt ?? Date.now());
      delete scope.preparationStartedAt;
      delete scope.preparationWallStartedAt;
    }
  }
  /** Keeps certificate authentication outside overridable request construction. */
  isPlanningRequest() {
    return __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).phase === "planning";
  }
  /** Approves the final overridden destination and transport before minting a bearer. */
  authorizePlannedRequest(url, request, timeout, allowHookSignal = false) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    const headers = Object.getOwnPropertyDescriptor(request, "headers");
    const body = Object.getOwnPropertyDescriptor(request, "body");
    const signal = Object.getOwnPropertyDescriptor(request, "signal");
    const redirect = Object.getOwnPropertyDescriptor(request, "redirect");
    if (scope.phase !== "planning" || !headers || !(headers.value instanceof Headers) || !body && "body" in request || [body, signal, redirect].some((descriptor) => descriptor && !("value" in descriptor))) {
      throw new OpenAIError("X.509 workload identity requires an approved final request.");
    }
    this.snapshotAPIURL(url);
    assertX509FetchOptions(request);
    try {
      assertSafeHeaders(headers.value);
    } catch {
      throw new OpenAIError("X.509 workload identity cannot use caller-supplied authentication credentials.");
    }
    if (headerValue(headers.value, "Authorization") !== null) {
      throw new OpenAIError("X.509 workload identity cannot use caller-supplied authorization credentials.");
    }
    __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_assertTenantHeaders).call(this, headers.value);
    if (!allowHookSignal && ((signal == null ? void 0 : signal.value) ?? void 0) !== (this.requestSnapshot().signal ?? void 0)) {
      throw new OpenAIError("X.509 workload identity must preserve its approved request signal.");
    }
    const approved = this.requestSnapshot();
    scope.request = { ...approved, timeout: Math.min(approved.timeout, timeout) };
    scope.phase = "authorizing";
  }
  /** Owns only SDK-created iterator adapters until authenticated dispatch takes responsibility. */
  ownRequestBody(body, source) {
    if (body instanceof ReadableStream && body !== source) {
      __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).materializedBody = body;
    }
  }
  /** Recognizes every one-shot upload before issuer authentication or request replay. */
  static isStreamingRequestBody(body) {
    return globalThis.ReadableStream !== void 0 && body instanceof globalThis.ReadableStream || typeof body === "object" && body !== null && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function");
  }
  /** Retires abandoned upload adapters without masking or blocking their authentication failure. */
  retireRequestBody() {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    const body = scope.materializedBody;
    delete scope.materializedBody;
    if (body) {
      void __classPrivateFieldGet(_a$2, _a$2, "m", _X509WorkloadIdentityAuth_cancelRequestBody).call(_a$2, body);
    }
  }
  /** Transfers the dispatched upload while retiring any SDK-owned body replaced by a hook. */
  releaseRequestBody(body) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    if (scope.materializedBody === body) {
      delete scope.materializedBody;
    } else {
      this.retireRequestBody();
    }
  }
  /** Retains caller-only cancellation separately from SDK-created deadline controllers. */
  setEffectiveSignal(signal) {
    if (signal) {
      __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).effectiveSignal = signal;
    } else {
      delete __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this).effectiveSignal;
    }
  }
  /** Uses protected-hook cancellation when an authenticated attempt enters retry backoff. */
  effectiveSignal() {
    var _a3;
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    return scope.effectiveSignal ?? ((_a3 = scope.request) == null ? void 0 : _a3.signal);
  }
  /** Establishes an independent scope even when concurrent requests share caller options. */
  // oxlint-disable-next-line anti-slop/no-object-parameters -- Logical request owners are opaque identity tokens; their properties are never read.
  runRequest(operation, requestOwner) {
    return __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").run(async () => {
      const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
      if (!scope) {
        throw new OpenAIError("X.509 workload identity requires an active certificate request scope.");
      }
      scope.owner = this;
      scope.requestOwner = requestOwner;
      try {
        return await operation();
      } finally {
        this.retireRequestBody();
        this.releaseRequestCredentials();
        delete scope.requestOwner;
        delete scope.owner;
      }
    });
  }
  /** Reports whether a public request-building call already belongs to an active logical operation. */
  // oxlint-disable-next-line anti-slop/no-object-parameters -- Request scope membership compares the opaque caller token by identity only.
  inRequest(requestOwner) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
    return (scope == null ? void 0 : scope.owner) === this && scope.requestOwner === requestOwner && scope.phase !== "authorizing";
  }
  /** Shares a cache only when the complete, privately snapshotted credential identity matches. */
  matches(other) {
    return __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_transport, "f") && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_identityProviderId, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_identityProviderId, "f") && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_serviceAccountId, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_serviceAccountId, "f") && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_organization, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_organization, "f") && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_project, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_project, "f") && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refreshBufferMs, "f") === __classPrivateFieldGet(other, _X509WorkloadIdentityAuth_refreshBufferMs, "f");
  }
  /** Binds deferred response parsing to the original logical request and its unchanged deadline. */
  continuation() {
    const { wallStartedAt, monotonicStartedAt, deadlineArmed, request, requestOwner, effectiveSignal } = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    const scope = {
      wallStartedAt,
      monotonicStartedAt,
      owner: this,
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...deadlineArmed ? { deadlineArmed } : {},
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...request ? { request } : {},
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...effectiveSignal ? { effectiveSignal } : {},
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...requestOwner ? { requestOwner } : {}
    };
    return (operation) => __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").resume(scope, async () => {
      try {
        return await operation();
      } finally {
        this.releaseRequestCredentials();
        delete scope.requestOwner;
        delete scope.owner;
      }
    });
  }
  /** Removes dispatched bearer material before settled request promises can retain their scope. */
  releaseRequestCredentials() {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    delete scope.request;
    delete scope.phase;
    delete scope.deadlineArmed;
    delete scope.preparationStartedAt;
    delete scope.preparationWallStartedAt;
    delete scope.effectiveSignal;
    delete scope.materializedBody;
    delete scope.apiURL;
    delete scope.tenant;
    delete scope.token;
    delete scope.defaultHeaders;
    delete scope.requestHeaders;
    delete scope.tokenGeneration;
    delete scope.headers;
    delete scope.authorization;
  }
  /** Returns the original authentication start so response consumption shares its request deadline. */
  requestStartedAt(_options) {
    var _a3;
    return (_a3 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current()) == null ? void 0 : _a3.wallStartedAt;
  }
  /** Distinguishes issued workload credentials from independent admin or headerless requests. */
  usedWorkloadToken(_options) {
    var _a3;
    return ((_a3 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current()) == null ? void 0 : _a3.token) !== void 0;
  }
  /** Returns the budget left after certificate authentication without starting another timeout. */
  remainingTimeout(_options, timeout) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
    if (scope === void 0) {
      return timeout;
    }
    const remaining = timeout - (performance.now() - scope.monotonicStartedAt);
    if (remaining <= 0) {
      throw new APIConnectionTimeoutError();
    }
    return remaining;
  }
  /** Cancels active retry timers promptly without changing public caller-abort semantics. */
  async waitForRetry(duration, signal) {
    try {
      await __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").sleep(duration, signal);
    } catch (error) {
      if (signal == null ? void 0 : signal.aborted) {
        throw userAbortError(signal);
      }
      throw error;
    }
  }
  /** Trusts only issuer or connection failures privately branded by the approved transport. */
  static isRetryableFailure(error) {
    return typeof error === "object" && error !== null && (isTransientX509ConnectionError(error) || isRetryableX509IssuerError(error));
  }
  /** Reads safe retry hints only from a privately branded, sanitized issuer response. */
  static retryHeaders(error) {
    var _a3;
    if (!error || typeof error !== "object" || !isRetryableX509IssuerError(error)) {
      return void 0;
    }
    const headers = (_a3 = Object.getOwnPropertyDescriptor(error, "headers")) == null ? void 0 : _a3.value;
    return headers instanceof Headers ? headers : void 0;
  }
  /** Exchanges the exact certificate capability selected for the matching API dispatch. */
  async getToken(options2, context) {
    const callerSignal = context ? context.signal : options2 == null ? void 0 : options2.signal;
    if (callerSignal == null ? void 0 : callerSignal.aborted) {
      throw userAbortError(callerSignal);
    }
    if (options2) {
      assertX509RequestOptions(context ? context.fetchOptions : options2.fetchOptions);
    }
    __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_preflight).call(this, context);
    const scope = options2 ? __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this) : void 0;
    const cached = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_cachedToken, "f");
    if (cached && performance.now() < cached.refreshAt && Date.now() < cached.wallRefreshAt) {
      return __classPrivateFieldGet(_a$2, _a$2, "m", _X509WorkloadIdentityAuth_assignToken).call(_a$2, scope, cached);
    }
    const remaining = context && options2 ? this.remainingTimeout(options2, context.timeout) : context == null ? void 0 : context.timeout;
    const { signal, dispose } = exchangeDeadline(remaining, callerSignal);
    if (callerSignal == null ? void 0 : callerSignal.aborted) {
      dispose();
      throw userAbortError(callerSignal);
    }
    const attempt = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f") ?? __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_beginRefresh).call(this);
    attempt.waiters += 1;
    const waiter = waitForRefresh(attempt, signal);
    try {
      const exchanged = await waiter.result;
      const refreshed = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_cachedToken, "f");
      if (!refreshed || refreshed.accessToken !== exchanged.accessToken) {
        throw new APIUserAbortError();
      }
      return __classPrivateFieldGet(_a$2, _a$2, "m", _X509WorkloadIdentityAuth_assignToken).call(_a$2, scope, refreshed);
    } catch (error) {
      return await __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_recoverRefreshFailure).call(this, error, attempt, cached, scope, options2, context);
    } finally {
      waiter.dispose();
      dispose();
      attempt.waiters -= 1;
      __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_retireRefresh).call(this, attempt);
    }
  }
  /** Invalidates only the workload-token generation actually rejected by the current request. */
  invalidateToken() {
    var _a3;
    const rejected = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
    if (!(rejected == null ? void 0 : rejected.token) || ((_a3 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_cachedToken, "f")) == null ? void 0 : _a3.accessToken) !== rejected.token || __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_cachedToken, "f").generation !== rejected.tokenGeneration) {
      return;
    }
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_tokenGeneration, __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f") + 1);
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_cachedToken, void 0);
    const refresh = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f");
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_refresh, void 0);
    refresh == null ? void 0 : refresh.controller.abort(new APIUserAbortError());
  }
  /** Binds the minted credential to the original headers before protected request hooks run. */
  bindRequest(options2, request, adminAPIKey) {
    if (!(request.headers instanceof Headers)) {
      throw new OpenAIError("X.509 workload identity requires the original workload authorization headers.");
    }
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    const { token } = scope;
    const security = options2.__security ?? {};
    let approvedAuthorization = token ? `Bearer ${token}` : null;
    if (!token && security.adminAPIKeyAuth && adminAPIKey !== null && headerValue(request.headers, "Authorization") !== null) {
      approvedAuthorization = new Headers({ Authorization: `Bearer ${adminAPIKey}` }).get("Authorization");
    }
    scope.headers = request.headers;
    scope.authorization = approvedAuthorization;
    this.assertRequest(request);
  }
  /** Rebinds an equivalent protected-hook container without relaxing final dispatch identity checks. */
  adoptRequestHeaders(request) {
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_scope).call(this);
    const original = scope.headers;
    if (!(original instanceof Headers) || !(request.headers instanceof Headers)) {
      throw new OpenAIError("X.509 workload identity must preserve its issued workload authorization.");
    }
    scope.headers = request.headers;
    try {
      this.assertRequest(request);
    } catch (error) {
      scope.headers = original;
      throw error;
    }
  }
  /** Rejects request hooks that replace the selected bearer or its approved header identity. */
  assertRequest(request) {
    const { headers } = request;
    if (!(headers instanceof Headers)) {
      throw new OpenAIError("X.509 workload identity must preserve its issued workload authorization.");
    }
    const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
    if (!scope || scope.headers !== headers || scope.authorization === void 0 || headerValue(headers, "Authorization") !== scope.authorization) {
      throw new OpenAIError("X.509 workload identity must preserve its issued workload authorization.");
    }
    __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_assertTenantHeaders).call(this, headers);
    assertSafeHeaders(headers);
  }
  /** Returns a guarded final dispatcher while preserving all existing request hook object identities. */
  fetch() {
    return async (input, init = {}) => {
      const target = assertX509APIOrigin(typeof input === "string" || input instanceof URL ? input : input.url);
      assertX509FetchOptions(init);
      this.assertRequest(init);
      const approved = init.headers;
      if (!(approved instanceof Headers)) {
        throw new OpenAIError("X.509 workload identity must preserve its issued workload authorization.");
      }
      const headers = new Headers([...Headers.prototype.entries.call(approved)]);
      assertSafeHeaders(headers);
      init.headers = headers;
      init.redirect = "manual";
      return await __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").dispatch(target, init);
    };
  }
}
_a$2 = X509WorkloadIdentityAuth, _X509WorkloadIdentityAuth_identityProviderId = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_serviceAccountId = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_configuredRefreshBufferMs = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_configuredRefreshBufferSeconds = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_organization = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_project = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_transport = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_refreshBufferMs = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_cachedToken = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_refresh = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_tokenGeneration = /* @__PURE__ */ new WeakMap(), _X509WorkloadIdentityAuth_instances = /* @__PURE__ */ new WeakSet(), _X509WorkloadIdentityAuth_cancelRequestBody = async function _X509WorkloadIdentityAuth_cancelRequestBody2(body) {
  try {
    await CancelReadableStream(body);
  } catch {
  }
}, _X509WorkloadIdentityAuth_assignToken = function _X509WorkloadIdentityAuth_assignToken2(scope, token) {
  if (scope) {
    scope.token = token.accessToken;
    scope.tokenGeneration = token.generation;
  }
  return token.accessToken;
}, _X509WorkloadIdentityAuth_recoverRefreshFailure = async function _X509WorkloadIdentityAuth_recoverRefreshFailure2(error, attempt, cached, scope, options2, context) {
  const callerSignal = context ? context.signal : options2 == null ? void 0 : options2.signal;
  if (callerSignal == null ? void 0 : callerSignal.aborted) {
    throw userAbortError(callerSignal);
  }
  if (attempt.controller.signal.aborted && attempt.generation !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f")) {
    return await this.getToken(options2, context);
  }
  const fallback = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_fallbackToken).call(this, error, cached, scope);
  if (fallback !== void 0) {
    return fallback;
  }
  if (error && typeof error === "object" && !(error instanceof OAuthError)) {
    const oauth = findX509OAuthError(error);
    if (oauth) {
      throw new OAuthError(oauth.status, oauth.error, oauth.headers);
    }
  }
  throw error;
}, _X509WorkloadIdentityAuth_fallbackToken = function _X509WorkloadIdentityAuth_fallbackToken2(error, cached, scope) {
  if (!cached || cached !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_cachedToken, "f") || performance.now() >= cached.expiresAt || Date.now() >= cached.wallExpiresAt || !_a$2.isRetryableFailure(error)) {
    return void 0;
  }
  const headers = _a$2.retryHeaders(error);
  const milliseconds = headers == null ? void 0 : headers.get("retry-after-ms");
  let requested = milliseconds ? Number(milliseconds) : void 0;
  const retryAfter = headers == null ? void 0 : headers.get("retry-after");
  if (retryAfter && (requested === void 0 || Number.isNaN(requested))) {
    const seconds = Number(retryAfter);
    requested = Number.isNaN(seconds) ? Date.parse(retryAfter) - Date.now() : seconds * 1e3;
  }
  const cooldown = requested !== void 0 && Number.isFinite(requested) && requested >= 0 && requested <= 6e4 ? Math.max(FAILED_REFRESH_COOLDOWN_MS, requested) : FAILED_REFRESH_COOLDOWN_MS;
  cached.refreshAt = Math.min(cached.expiresAt, performance.now() + cooldown);
  cached.wallRefreshAt = Math.min(cached.wallExpiresAt, Date.now() + cooldown);
  return __classPrivateFieldGet(_a$2, _a$2, "m", _X509WorkloadIdentityAuth_assignToken).call(_a$2, scope, cached);
}, _X509WorkloadIdentityAuth_retireRefresh = function _X509WorkloadIdentityAuth_retireRefresh2(attempt) {
  if (attempt.waiters !== 0 || __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f") !== attempt) {
    return;
  }
  queueMicrotask(() => {
    if (attempt.waiters === 0 && __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f") === attempt) {
      __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_refresh, void 0);
      __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_tokenGeneration, __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f") + 1);
      attempt.controller.abort(new APIUserAbortError());
    }
  });
}, _X509WorkloadIdentityAuth_beginRefresh = function _X509WorkloadIdentityAuth_beginRefresh2() {
  const controller = new AbortController();
  const generation = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f");
  const attempt = {
    controller,
    generation,
    waiters: 0,
    promise: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_instances, "m", _X509WorkloadIdentityAuth_refreshToken).call(this, controller, generation)
  };
  __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_refresh, attempt);
  return attempt;
}, _X509WorkloadIdentityAuth_refreshToken = async function _X509WorkloadIdentityAuth_refreshToken2(controller, generation) {
  var _a3, _b2;
  const startedAt = performance.now();
  const wallStartedAt = Date.now();
  try {
    const token = await __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").exchange(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_identityProviderId, "f"), __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_serviceAccountId, "f"), controller.signal);
    const lifetime = token.expiresIn * 1e3;
    const expiresAt = startedAt + lifetime;
    const wallExpiresAt = wallStartedAt + lifetime;
    if (performance.now() >= expiresAt || Date.now() >= wallExpiresAt) {
      throw new OpenAIError("X.509 workload identity token expired before its exchange completed.");
    }
    if (__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f") !== generation || controller.signal.aborted || ((_a3 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f")) == null ? void 0 : _a3.controller) !== controller) {
      throw new APIUserAbortError();
    }
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_tokenGeneration, __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f") + 1, "f");
    __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_cachedToken, {
      accessToken: token.accessToken,
      generation: __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_tokenGeneration, "f"),
      expiresAt,
      refreshAt: expiresAt - Math.min(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refreshBufferMs, "f"), lifetime / 2),
      wallExpiresAt,
      wallRefreshAt: wallExpiresAt - Math.min(__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refreshBufferMs, "f"), lifetime / 2)
    }, "f");
    return token;
  } finally {
    if (((_b2 = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_refresh, "f")) == null ? void 0 : _b2.controller) === controller) {
      __classPrivateFieldSet(this, _X509WorkloadIdentityAuth_refresh, void 0);
    }
  }
}, _X509WorkloadIdentityAuth_preflight = function _X509WorkloadIdentityAuth_preflight2(context) {
  if (!context) {
    return;
  }
  if (context.organization !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_organization, "f") || context.project !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_project, "f")) {
    throw new OpenAIError("X.509 workload identity cannot override its enrolled organization or project.");
  }
  assertX509APIOrigin(context.apiURL);
  const supplied = buildHeaders([context.defaultHeaders, context.requestHeaders]);
  if (__classPrivateFieldGet(this, _X509WorkloadIdentityAuth_organization, "f") !== null && supplied.nulls.has("openai-organization") || __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_project, "f") !== null && supplied.nulls.has("openai-project")) {
    throw new OpenAIError("X.509 workload identity cannot omit its enrolled organization or project.");
  }
  for (const name of supplied.values.keys()) {
    const canonical = name.toLowerCase().split("_").join("-");
    if ((canonical === "openai-organization" || canonical === "openai-project") && (name !== canonical || headerValue(supplied.values, name) !== (canonical === "openai-organization" ? context.organization : context.project))) {
      throw new OpenAIError("X.509 workload identity cannot override its enrolled organization or project.");
    }
    if (isSensitiveHeader(canonical) || canonical === "host") {
      throw new OpenAIError("X.509 workload identity cannot use caller-supplied authentication credentials.");
    }
  }
}, _X509WorkloadIdentityAuth_scope = function _X509WorkloadIdentityAuth_scope2() {
  const scope = __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_transport, "f").current();
  if (!scope || scope.owner !== this) {
    throw new OpenAIError("X.509 workload identity requires an active certificate request scope.");
  }
  return scope;
}, _X509WorkloadIdentityAuth_assertTenantHeaders = function _X509WorkloadIdentityAuth_assertTenantHeaders2(headers) {
  if (headerValue(headers, "OpenAI-Organization") !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_organization, "f") || headerValue(headers, "OpenAI-Project") !== __classPrivateFieldGet(this, _X509WorkloadIdentityAuth_project, "f")) {
    throw new OpenAIError("X.509 workload identity cannot override its enrolled organization or project.");
  }
  for (const name of Headers.prototype.keys.call(headers)) {
    const canonical = name.toLowerCase().split("_").join("-");
    if ((canonical === "openai-organization" || canonical === "openai-project") && name !== canonical) {
      throw new OpenAIError("X.509 workload identity cannot override its enrolled organization or project.");
    }
  }
};
function normalizeX509CredentialOptions(options2) {
  const { credential } = options2;
  if (credential === void 0) {
    return { credential, options: options2 };
  }
  const registered = findX509Credential(credential);
  if (!registered) {
    throw new OpenAIError("An X.509 credential must be created by the SDK authentication helper.");
  }
  const conflicting = ["apiKey", "adminAPIKey", "workloadIdentity", "x509Transport"].filter((name) => {
    const value = options2[name];
    return value !== null && value !== void 0;
  });
  if (conflicting.length > 0) {
    throw new OpenAIError(`The \`credential\` option cannot be combined with ${conflicting.map((name) => `\`${name}\``).join(", ")}.`);
  }
  return {
    credential,
    options: {
      ...options2,
      apiKey: null,
      adminAPIKey: null,
      baseURL: options2.baseURL ?? null,
      organization: options2.organization ?? null,
      project: options2.project ?? null,
      workloadIdentity: registered.identity,
      x509Transport: registered.transport
    }
  };
}
function overridesOrdinaryAuthentication({ apiKey, adminAPIKey }) {
  return apiKey !== null && apiKey !== void 0 || adminAPIKey !== null && adminAPIKey !== void 0;
}
function prepareProviderClone(inherited, overrides) {
  const inheritedProvider = inherited.provider;
  const replacingProvider = overrides.credential ?? overrides.workloadIdentity;
  const provider = overrides.provider ?? (replacingProvider ? void 0 : inheritedProvider);
  if (provider !== inheritedProvider) {
    delete inherited.baseURL;
    delete inherited.organization;
    delete inherited.project;
    delete inherited.defaultHeaders;
    delete inherited.defaultQuery;
    delete inherited.fetchOptions;
    delete inherited.fetch;
  }
  if (provider) {
    delete inherited.apiKey;
    delete inherited.adminAPIKey;
    delete inherited.credential;
    delete inherited.workloadIdentity;
    delete inherited.x509Transport;
    delete inherited.baseURL;
  }
  return provider;
}
function prepareX509ClientClone(inherited, overrides, credential, currentlyX509) {
  const nextIdentity = hasOwn(overrides, "workloadIdentity") ? overrides.workloadIdentity : inherited.workloadIdentity;
  const dropping = credential !== void 0 && (overridesOrdinaryAuthentication(overrides) && overrides.workloadIdentity === void 0 || overrides.provider !== void 0);
  if (credential !== void 0 && hasOwn(overrides, "workloadIdentity")) {
    delete inherited.x509Transport;
  }
  const inheritedCredential = credential !== void 0 && !dropping && overrides.credential === void 0 && !hasOwn(overrides, "workloadIdentity") && !hasOwn(overrides, "x509Transport") ? credential : void 0;
  const nextCredential = overrides.credential === void 0 ? inheritedCredential : overrides.credential;
  const nextX509 = nextCredential !== void 0 || !dropping && isX509WorkloadIdentity(nextIdentity);
  if (currentlyX509 !== nextX509) {
    delete inherited.fetch;
    delete inherited.baseURL;
    delete inherited.organization;
    delete inherited.project;
    delete inherited.defaultHeaders;
    delete inherited.defaultQuery;
    delete inherited.fetchOptions;
    if (nextX509) {
      inherited.apiKey = null;
    } else {
      delete inherited.x509Transport;
      if (dropping) {
        delete inherited.workloadIdentity;
      }
    }
  }
  if (nextCredential !== void 0) {
    delete inherited.apiKey;
    delete inherited.adminAPIKey;
    delete inherited.workloadIdentity;
    delete inherited.x509Transport;
    inherited.credential = nextCredential;
    if (overrides.credential !== void 0) {
      delete inherited.organization;
      delete inherited.project;
      delete inherited.defaultHeaders;
      delete inherited.defaultQuery;
      delete inherited.fetchOptions;
    }
  }
  return { credential: nextCredential, provider: prepareProviderClone(inherited, overrides) };
}
const brand_privateStreamingFile = /* @__PURE__ */ Symbol("brand.privateStreamingFile");
function toStreamingFile(data, name, options2) {
  if (typeof name !== "string" || !name) {
    throw new TypeError("toStreamingFile requires a non-empty file name");
  }
  const type = options2 == null ? void 0 : options2.type;
  if (type) {
    validateStreamingFileType(type);
  }
  return {
    [brand_privateStreamingFile]: true,
    data,
    name,
    ...type ? { type } : {}
  };
}
const checkFileSupport = () => {
  var _a3;
  if (typeof File === "undefined") {
    const { process: process2 } = globalThis;
    const isOldNode = typeof ((_a3 = process2 == null ? void 0 : process2.versions) == null ? void 0 : _a3.node) === "string" && Number.parseInt(process2.versions.node.split("."), 10) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to a supported Node.js LTS release, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function makeFile(fileBits, fileName, options2) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options2);
}
function getName(value, options2) {
  if (typeof value !== "object" || value === null) {
    return void 0;
  }
  const name = "name" in value ? value.name : void 0;
  const explicitName = name && String(name) || "filename" in value && value.filename && String(value.filename);
  if (explicitName) {
    return (options2 == null ? void 0 : options2.stripFilename) === false ? normalizeFilenamePath(explicitName) : basename(explicitName);
  }
  const url = "url" in value && value.url && String(value.url);
  if (url) {
    try {
      return basename(new URL(url).pathname);
    } catch {
      return basename(url);
    }
  }
  const path2 = "path" in value && value.path && String(value.path);
  return path2 ? basename(path2) : void 0;
}
function basename(value) {
  return value.split(/[\\/]/).pop() || void 0;
}
function normalizeFilenamePath(value) {
  const normalized = value.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized) || normalized.split("/").includes("..")) {
    throw new TypeError("Upload file name must be a safe relative path without parent directory segments");
  }
  return normalized;
}
const arrayBufferByteLengthGetter$1 = (_a2 = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")) == null ? void 0 : _a2.get;
function isArrayBuffer(value) {
  try {
    return (arrayBufferByteLengthGetter$1 == null ? void 0 : arrayBufferByteLengthGetter$1.call(value)) !== void 0;
  } catch {
    return false;
  }
}
const isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
const maybeMultipartFormRequestOptions = async (opts, fetch2, formOptions) => {
  if (!hasUploadableValue(opts.body)) {
    return opts;
  }
  if (hasStreamingUploadableValue(opts.body)) {
    return createStreamingFormRequestOptions(opts, formOptions);
  }
  return { ...opts, body: await createForm(opts.body, fetch2, formOptions) };
};
const multipartFormRequestOptions = async (opts, fetch2, formOptions) => {
  if (hasStreamingUploadableValue(opts.body)) {
    return createStreamingFormRequestOptions(opts, formOptions);
  }
  return { ...opts, body: await createForm(opts.body, fetch2, formOptions) };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached) {
    return cached;
  }
  const promise = (async () => {
    try {
      let FetchResponse;
      if ("Response" in fetch2) {
        FetchResponse = fetch2.Response;
      } else {
        const response = await fetch2("data:,");
        await response.arrayBuffer();
        FetchResponse = response.constructor;
      }
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
const createForm = async (body, fetch2, options2 = {}) => {
  if (!await supportsFormData(fetch2)) {
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, options2)));
  return form;
};
const isBlob = (value) => value instanceof Blob;
const isReadableStream = (value) => typeof value === "object" && value !== null && "getReader" in value && typeof value.getReader === "function";
const isStreamingFile = (value) => typeof value === "object" && value !== null && brand_privateStreamingFile in value;
const isUploadable = (value) => typeof value === "object" && value !== null && (value instanceof Response || isAsyncIterable(value) || isReadableStream(value) || isStreamingFile(value) || isBlob(value));
const hasStreamingUploadableValue = (value) => {
  if (isStreamingFile(value) || isAsyncIterable(value) || isReadableStream(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(hasStreamingUploadableValue);
  }
  if (value && typeof value === "object" && !isBlob(value) && !(value instanceof Response)) {
    for (const k of Object.keys(value)) {
      if (hasStreamingUploadableValue(value[k])) {
        return true;
      }
    }
  }
  return false;
};
const hasUploadableValue = (value) => {
  if (isUploadable(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(hasUploadableValue);
  }
  if (value && typeof value === "object") {
    for (const k of Object.keys(value)) {
      if (hasUploadableValue(value[k])) {
        return true;
      }
    }
  }
  return false;
};
const snapshotPreservedUploadEntries = (entries, filenames) => {
  const snapshot = [];
  for (const entry of entries) {
    if (isUploadable(entry.value) && !filenames.has(entry.value)) {
      filenames.set(entry.value, getStreamingFileName(entry.value, { stripFilenames: false }));
    }
    snapshot.push(entry);
  }
  return snapshot;
};
const createStreamingFormRequestOptions = (opts, options2 = {}) => {
  const entries = iterateFormEntries(opts.body);
  const preservedFilenames = options2.stripFilenames === false ? /* @__PURE__ */ new WeakMap() : void 0;
  const multipartEntries = preservedFilenames ? snapshotPreservedUploadEntries(entries, preservedFilenames) : entries;
  const boundary = `openai-${Math.random().toString(36).slice(2)}`;
  const body = ReadableStreamFrom(iterateMultipartBody(multipartEntries, boundary, options2, preservedFilenames));
  return {
    ...opts,
    body,
    headers: buildHeaders([{ "content-type": `multipart/form-data; boundary=${boundary}` }, opts.headers])
  };
};
async function* iterateMultipartBody(entries, boundary, options2, preservedFilenames) {
  for await (const { key, value } of entries) {
    if (isUploadable(value)) {
      const filename = (preservedFilenames == null ? void 0 : preservedFilenames.get(value)) ?? getStreamingFileName(value, options2);
      const type = getStreamingFileType(value);
      yield encodeUTF8(`--${boundary}\r
`);
      yield encodeUTF8(`Content-Disposition: form-data; name="${escapeHeaderValue(key)}"; filename="${escapeHeaderValue(filename)}"\r
Content-Type: ${type}\r
\r
`);
      yield* iterateBytes(getStreamingFileData(value));
    } else {
      yield encodeUTF8(`--${boundary}\r
`);
      yield encodeUTF8(`Content-Disposition: form-data; name="${escapeHeaderValue(key)}"\r
\r
${String(value)}`);
    }
    yield encodeUTF8("\r\n");
  }
  yield encodeUTF8(`--${boundary}--\r
`);
}
function* iterateFormEntries(body) {
  if (!body || typeof body !== "object") {
    return;
  }
  for (const [key, value] of Object.entries(body)) {
    yield* iterateFormValue(key, value);
  }
}
function* iterateFormValue(key, value) {
  if (value === void 0) {
    return;
  }
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || isUploadable(value)) {
    yield { key, value };
  } else if (Array.isArray(value)) {
    for (const entry of value) {
      yield* iterateFormValue(key + "[]", entry);
    }
  } else if (typeof value === "object") {
    for (const [name, prop] of Object.entries(value)) {
      yield* iterateFormValue(`${key}[${name}]`, prop);
    }
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
}
function getStreamingFileName(value, options2) {
  if (isStreamingFile(value)) {
    const { name } = value;
    if (typeof name !== "string" || !name) {
      throw new TypeError("Streaming upload file name must be a non-empty string");
    }
    return options2.stripFilenames === false ? normalizeFilenamePath(name) : basename(name) ?? "unknown_file";
  }
  return getName(value, { stripFilename: options2.stripFilenames }) ?? "unknown_file";
}
function getStreamingFileType(value) {
  let type;
  if (isStreamingFile(value) || isBlob(value)) {
    ({ type } = value);
  } else if (value instanceof Response) {
    type = value.headers.get("content-type") ?? void 0;
  }
  return validateStreamingFileType(type || "application/octet-stream");
}
function validateStreamingFileType(type) {
  if (typeof type !== "string") {
    throw new TypeError("Streaming upload content type must be a string");
  }
  for (let index = 0; index < type.length; index += 1) {
    const character = type.codePointAt(index) ?? 0;
    if (character <= 31 || character === 127) {
      throw new TypeError("Streaming upload content type must not contain control characters");
    }
  }
  return type;
}
function getStreamingFileData(value) {
  if (isStreamingFile(value)) {
    return value.data;
  }
  return value;
}
async function* iterateBytes(value) {
  if (typeof value === "string") {
    yield encodeUTF8(value);
  } else if (ArrayBuffer.isView(value)) {
    yield new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  } else if (isArrayBuffer(value)) {
    yield new Uint8Array(value);
  } else if (value instanceof Response) {
    yield* iterateBytes(value.body || await value.blob());
  } else if (value instanceof Blob) {
    if (typeof value.stream === "function") {
      yield* iterateBytes(value.stream());
    } else {
      yield new Uint8Array(await value.arrayBuffer());
    }
  } else if (isReadableStream(value)) {
    for await (const chunk of ReadableStreamToAsyncIterable(value)) {
      yield* iterateBytes(chunk);
    }
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      yield* iterateBytes(chunk);
    }
  } else {
    throw new TypeError(`Invalid streaming file chunk: ${String(value)}`);
  }
}
function escapeHeaderValue(value) {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || codePoint === 127 || character === '"' || character === "\\" ? encodeURIComponent(character) : character;
  }).join("");
}
const addFormValue = async (form, key, value, options2) => {
  if (value === void 0) {
    return;
  }
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    const blob = await value.blob();
    form.append(key, makeFile([blob], getName(value, { stripFilename: options2.stripFilenames }), { type: blob.type }));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, { stripFilename: options2.stripFilenames })));
  } else if (isBlob(value)) {
    const filename = getName(value, { stripFilename: options2.stripFilenames });
    if (filename === void 0) {
      form.append(key, value);
    } else {
      form.append(key, value, filename);
    }
  } else if (Array.isArray(value)) {
    const entries = await Promise.all(value.map(async (entry) => {
      const entryForm = new FormData();
      await addFormValue(entryForm, key + "[]", entry, options2);
      return entryForm;
    }));
    for (const entryForm of entries) {
      if (!entryForm) {
        continue;
      }
      for (const [entryKey, entryValue] of entryForm.entries()) {
        form.append(entryKey, entryValue);
      }
    }
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, options2)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};
const isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
const isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
const isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
const hasFilePropertyOverrides = (value, options2) => (options2 == null ? void 0 : options2.type) != null && options2.type !== value.type || (options2 == null ? void 0 : options2.lastModified) != null && options2.lastModified !== value.lastModified || (options2 == null ? void 0 : options2.endings) != null;
const canReuseNativeFile = (value, name, options2) => (name == null || name === value.name) && !hasFilePropertyOverrides(value, options2);
async function toFile(value, name, options2) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    const fileOptions = {
      ...options2,
      type: (options2 == null ? void 0 : options2.type) ?? value.type,
      lastModified: (options2 == null ? void 0 : options2.lastModified) ?? value.lastModified
    };
    if (value instanceof File) {
      if (canReuseNativeFile(value, name, options2)) {
        return value;
      }
      return makeFile([value], name ?? value.name, fileOptions);
    }
    return makeFile([await value.arrayBuffer()], name ?? value.name, fileOptions);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name ?? (name = getName(value));
    const responseOptions = (options2 == null ? void 0 : options2.type) === void 0 && blob.type ? { ...options2, type: blob.type } : options2;
    return makeFile(await getBytes(blob), name, responseOptions);
  }
  const parts = await getBytes(value);
  name ?? (name = getName(value));
  if ((options2 == null ? void 0 : options2.type) === void 0) {
    const typedPart = parts.find((part) => typeof part === "object" && "type" in part && !!part.type);
    if (typedPart) {
      options2 = { ...options2, type: typedPart.type };
    }
  }
  return makeFile(parts, name, options2);
}
async function getBytes(value) {
  var _a3;
  const parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  isArrayBuffer(value)) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : new Blob([await value.arrayBuffer()], { type: value.type }));
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = (_a3 = value == null ? void 0 : value.constructor) == null ? void 0 : _a3.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null) {
    return "";
  }
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
class APIResource {
  constructor(client) {
    this._client = client;
  }
}
function encodeURIPath(str) {
  return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path2(statics, ...params) {
  var _a3;
  if (statics.length === 1) {
    return statics[0];
  }
  let postPath = false;
  const invalidSegments = [];
  let path3 = "";
  for (let index = 0; index < statics.length; index += 1) {
    if (index in statics) {
      const currentValue = statics[index];
      if (/[?#]/.test(currentValue)) {
        postPath = true;
      }
      const value = params[index];
      let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
      if (index !== params.length && (value == null || // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Path parameters may arrive from JavaScript callers and require runtime validation before URL encoding.
      typeof value === "object" && // handle values from other realms
      value.toString === ((_a3 = Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)) == null ? void 0 : _a3.toString))) {
        encoded = value + "";
        invalidSegments.push({
          start: path3.length + currentValue.length,
          length: encoded.length,
          error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
        });
      }
      path3 += currentValue + (index === params.length ? "" : encoded);
    }
  }
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = new RegExp("(?<=^|\\/)(?:\\.|%2e){1,2}(?=\\/|$)", "gi");
  let match;
  while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match.index,
      length: match[0].length,
      error: `Value "${match[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    let underline = "";
    for (const segment of invalidSegments) {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      underline += spaces + arrows;
    }
    throw new OpenAIError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
};
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
let Messages$1 = class Messages extends APIResource {
  /**
   * Get the messages in a stored chat completion. Only Chat Completions that have
   * been created with the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
   *   'completion_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(completionID, query = {}, options2) {
    return this._client.getAPIList(path`/chat/completions/${completionID}/messages`, CursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
};
function isChatCompletionFunctionTool(tool) {
  return tool !== void 0 && "function" in tool && tool.function !== void 0;
}
function isAutoParsableResponseFormat(response_format) {
  return (response_format == null ? void 0 : response_format["$brand"]) === "auto-parseable-response-format";
}
function isParseableResponseFormat(format) {
  return isAutoParsableResponseFormat(format) || (format == null ? void 0 : format.type) === "json_schema";
}
function parseResponseFormatContent(format, content) {
  if (!isParseableResponseFormat(format)) {
    return null;
  }
  if (typeof format === "object" && format !== null && "$parseRaw" in format && typeof format.$parseRaw === "function") {
    return format.$parseRaw(content);
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SyntaxError("Error reading response: invalid structured output JSON.");
    }
    throw error;
  }
}
function isAutoParsableTool$1(tool) {
  return (tool == null ? void 0 : tool["$brand"]) === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput$1(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : void 0
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    var _a3, _b2;
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: ((_a3 = choice.message.tool_calls) == null ? void 0 : _a3.map((toolCall) => parseToolCall$1(params, toolCall))) ?? void 0
        } : void 0,
        parsed: choice.message.content !== null && choice.message.content !== void 0 && !choice.message.refusal && (choice.message.content !== "" || !((_b2 = choice.message.tool_calls) == null ? void 0 : _b2.length) && !choice.message.function_call) ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  return parseResponseFormatContent(params.response_format, content);
}
function parseToolCall$1(params, toolCall) {
  var _a3;
  if (toolCall.type === "custom") {
    return toolCall;
  }
  if (toolCall.type !== "function") {
    const unsupportedType = toolCall.type;
    throw new OpenAIError(`Currently only \`function\` and \`custom\` tool calls are supported; Received \`${unsupportedType}\``);
  }
  const inputTool = (_a3 = params.tools) == null ? void 0 : _a3.find((inputTool2) => {
    var _a4;
    return isChatCompletionFunctionTool(inputTool2) && ((_a4 = inputTool2.function) == null ? void 0 : _a4.name) === toolCall.function.name;
  });
  let parsedArguments = null;
  if (isAutoParsableTool$1(inputTool)) {
    parsedArguments = inputTool.$parseRaw(toolCall.function.arguments);
  } else if (inputTool == null ? void 0 : inputTool.function.strict) {
    parsedArguments = parseResponseFormatContent({ type: "json_schema", $parseRaw: void 0 }, toolCall.function.arguments);
  }
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: parsedArguments
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  var _a3;
  if (!params || !("tools" in params) || !params.tools || toolCall.type !== "function") {
    return false;
  }
  const inputTool = (_a3 = params.tools) == null ? void 0 : _a3.find((inputTool2) => {
    var _a4, _b2;
    return isChatCompletionFunctionTool(inputTool2) && ((_a4 = inputTool2.function) == null ? void 0 : _a4.name) === ((_b2 = toolCall.function) == null ? void 0 : _b2.name);
  });
  return isChatCompletionFunctionTool(inputTool) && (isAutoParsableTool$1(inputTool) || (inputTool == null ? void 0 : inputTool.function.strict) || false);
}
function hasAutoParseableInput$1(params) {
  var _a3;
  if (isParseableResponseFormat(params.response_format)) {
    return true;
  }
  return ((_a3 = params.tools) == null ? void 0 : _a3.some((t) => isAutoParsableTool$1(t) || t.type === "function" && t.function.strict === true)) ?? false;
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type === "custom") {
      continue;
    }
    if (tool.type !== "function") {
      const unsupportedType = tool.type;
      throw new OpenAIError(`Currently only \`function\` and \`custom\` tool types are supported; Received \`${unsupportedType}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
const isAssistantMessage = (message) => (message == null ? void 0 : message.role) === "assistant";
const isToolMessage = (message) => (message == null ? void 0 : message.role) === "tool";
var _EventStream_instances, _EventStream_connectedPromise, _EventStream_resolveConnectedPromise, _EventStream_rejectConnectedPromise, _EventStream_endPromise, _EventStream_resolveEndPromise, _EventStream_rejectEndPromise, _EventStream_listeners, _EventStream_abortListeners, _EventStream_emittedListenerRegistrations, _EventStream_pendingListenerCleanup, _EventStream_pendingBufferedEventChecks, _EventStream_listenerDispatchDepth, _EventStream_ended, _EventStream_errored, _EventStream_aborted, _EventStream_catchingPromiseCreated, _EventStream_terminalFailure, _EventStream_abortFromSignal, _EventStream_removeAbortListeners, _EventStream_onceForEmitted, _EventStream_removeEmittedListener, _EventStream_cleanupEmittedListeners, _EventStream_handleError, _EventStream_settleTerminalEvent;
const MAX_BUFFERED_ITERATOR_EVENTS = 4096;
const MAX_BUFFERED_ITERATOR_BYTES = 8 * 1024 * 1024;
const MAX_INSPECTABLE_TYPED_ARRAY_ELEMENTS = 4096;
const MAX_BUFFERED_EVENT_DEPTH = 256;
const bufferedJSONStringify = JSON.stringify;
const bufferedJSONParse = JSON.parse;
const sdkOwnedBufferedEventArguments = /* @__PURE__ */ new WeakSet();
const typedArrayBufferGetter = (_b = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), "buffer")) == null ? void 0 : _b.get;
const typedArrayLengthGetter = (_c = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), "length")) == null ? void 0 : _c.get;
const dataViewBufferGetter = (_d = Object.getOwnPropertyDescriptor(DataView.prototype, "buffer")) == null ? void 0 : _d.get;
const symbolDescriptionGetter = (_e = Object.getOwnPropertyDescriptor(Symbol.prototype, "description")) == null ? void 0 : _e.get;
const dateTimestampGetter = Date.prototype.getTime;
const arrayBufferByteLengthGetter = (_f = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")) == null ? void 0 : _f.get;
const sharedArrayBufferByteLengthGetter = typeof SharedArrayBuffer === "function" ? (_g = Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength")) == null ? void 0 : _g.get : void 0;
const errorStackDescriptor = Object.getOwnPropertyDescriptor(new Error("native stack descriptor"), "stack");
const functionToString = Function.prototype.toString;
const objectToString = Object.prototype.toString;
const errorBrandDescriptor = Object.getOwnPropertyDescriptor(Error, "isError");
const nativeErrorBrand = errorBrandDescriptor && "value" in errorBrandDescriptor && typeof errorBrandDescriptor.value === "function" ? errorBrandDescriptor.value : void 0;
const nativeErrorConstructorSource = functionToString.call(Error);
const nativeDateConstructorSource = functionToString.call(Date);
const nativeFunctionConstructorSource = functionToString.call(Function);
const trustedIntrinsicPrototypes = /* @__PURE__ */ new Set([
  APIConnectionError.prototype,
  APIConnectionTimeoutError.prototype,
  APIError.prototype,
  OpenAIError.prototype,
  APIUserAbortError.prototype,
  AuthenticationError.prototype,
  BadRequestError.prototype,
  ConflictError.prototype,
  ContentFilterFinishReasonError.prototype,
  InternalServerError.prototype,
  InvalidWebhookSignatureError.prototype,
  LengthFinishReasonError.prototype,
  NotFoundError.prototype,
  OAuthError.prototype,
  PermissionDeniedError.prototype,
  RateLimitError.prototype,
  SubjectTokenProviderError.prototype,
  UnprocessableEntityError.prototype
]);
const trustedNativeConstructorSources = /* @__PURE__ */ new Set();
const canonicalIntrinsicDescriptors = /* @__PURE__ */ new Map();
const foreignErrorStackDescriptors = /* @__PURE__ */ new WeakMap();
function captureNativeProxyDetector() {
  if (typeof process === "undefined") {
    return void 0;
  }
  try {
    const loader = Object.getOwnPropertyDescriptor(process, "getBuiltinModule");
    if (!loader || !("value" in loader) || typeof loader.value !== "function") {
      return void 0;
    }
    const util2 = Reflect.apply(loader.value, process, ["node:util"]);
    if (typeof util2 !== "object" || util2 === null) {
      return void 0;
    }
    const types = Object.getOwnPropertyDescriptor(util2, "types");
    if (!types || !("value" in types) || typeof types.value !== "object" || types.value === null) {
      return void 0;
    }
    const detector = Object.getOwnPropertyDescriptor(types.value, "isProxy");
    if (!detector || !("value" in detector) || typeof detector.value !== "function") {
      return void 0;
    }
    return detector.value;
  } catch {
    return void 0;
  }
}
const nativeProxyDetector = captureNativeProxyDetector();
function rememberTrustedIntrinsic(constructor) {
  if (typeof constructor !== "function") {
    return;
  }
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(constructor, "prototype");
  if (!prototypeDescriptor || !("value" in prototypeDescriptor) || typeof prototypeDescriptor.value !== "object" && typeof prototypeDescriptor.value !== "function") {
    return;
  }
  trustedIntrinsicPrototypes.add(prototypeDescriptor.value);
  const source = functionToString.call(constructor);
  if (/^function [A-Za-z_$][\w$]*\(\) \{ \[native code\] \}$/u.test(source) && prototypeDescriptor.configurable === false && prototypeDescriptor.writable === false) {
    trustedNativeConstructorSources.add(source);
    const descriptors = /* @__PURE__ */ new Map();
    for (const key of Reflect.ownKeys(prototypeDescriptor.value)) {
      const descriptor = Object.getOwnPropertyDescriptor(prototypeDescriptor.value, key);
      if (descriptor) {
        descriptors.set(key, descriptor);
      }
    }
    canonicalIntrinsicDescriptors.set(source, descriptors);
  }
}
for (const constructor of [
  Object,
  Function,
  Array,
  Date,
  Map,
  Set,
  ArrayBuffer,
  DataView,
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Float32Array,
  Float64Array
]) {
  rememberTrustedIntrinsic(constructor);
}
for (const name of [
  "SharedArrayBuffer",
  "AggregateError",
  "Float16Array",
  "BigInt64Array",
  "BigUint64Array",
  "Blob",
  "File",
  "Headers"
]) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  if (descriptor && "value" in descriptor) {
    rememberTrustedIntrinsic(descriptor.value);
  }
}
const typedArrayConstructorDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), "constructor");
if (typedArrayConstructorDescriptor && "value" in typedArrayConstructorDescriptor) {
  rememberTrustedIntrinsic(typedArrayConstructorDescriptor.value);
}
if (typeof Buffer === "function") {
  rememberTrustedIntrinsic(Buffer);
}
const blobInternalHandlePrototype = (() => {
  if (typeof Blob !== "function") {
    return void 0;
  }
  try {
    const blob = new Blob([]);
    for (const key of Object.getOwnPropertySymbols(blob)) {
      const descriptor = Object.getOwnPropertyDescriptor(blob, key);
      if (descriptor && "value" in descriptor && typeof descriptor.value === "object" && descriptor.value) {
        return Object.getPrototypeOf(descriptor.value);
      }
    }
  } catch {
    return void 0;
  }
  return void 0;
})();
const mapEntries = Map.prototype.entries;
const setValues = Set.prototype.values;
const headersEntriesDescriptor = typeof Headers === "function" ? Object.getOwnPropertyDescriptor(Headers.prototype, "entries") : void 0;
const headersEntries = headersEntriesDescriptor && "value" in headersEntriesDescriptor && typeof headersEntriesDescriptor.value === "function" ? headersEntriesDescriptor.value : void 0;
const retainedStorageBrands = /* @__PURE__ */ new Set([
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Blob",
  "File",
  "Map",
  "Date",
  "Set",
  "Headers"
]);
function getTrustedForeignIntrinsic(prototype) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "constructor");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "function") {
    return void 0;
  }
  const constructor = descriptor.value;
  const source = functionToString.call(constructor);
  const descriptors = canonicalIntrinsicDescriptors.get(source);
  if (!trustedNativeConstructorSources.has(source) || !descriptors) {
    return void 0;
  }
  const constructorPrototype = Object.getOwnPropertyDescriptor(constructor, "prototype");
  if (!constructorPrototype || !("value" in constructorPrototype) || constructorPrototype.value !== prototype || constructorPrototype.configurable !== false || constructorPrototype.writable !== false) {
    return void 0;
  }
  return { constructor, descriptors, functionPrototype: Object.getPrototypeOf(constructor) };
}
function isTrustedIntrinsicPrototype(prototype) {
  return trustedIntrinsicPrototypes.has(prototype) || getTrustedForeignIntrinsic(prototype) !== void 0;
}
function isCanonicalIntrinsicFunction(value, canonical, functionPrototype) {
  if (canonical === void 0) {
    return value === void 0;
  }
  if (typeof value !== "function" || typeof canonical !== "function") {
    return false;
  }
  const source = functionToString.call(canonical);
  if (functionToString.call(value) !== source) {
    return false;
  }
  const actualFunctionPrototype = Object.getPrototypeOf(value);
  if (actualFunctionPrototype === functionPrototype) {
    return true;
  }
  if (!/^function [A-Za-z_$][\w$]*\(\) \{ \[native code\] \}$/u.test(source)) {
    return false;
  }
  const intrinsic = getTrustedForeignIntrinsic(actualFunctionPrototype);
  return intrinsic !== void 0 && functionToString.call(intrinsic.constructor) === nativeFunctionConstructorSource;
}
function isCanonicalIntrinsicDescriptor(descriptor, canonical, functionPrototype) {
  if (!canonical || descriptor.configurable !== canonical.configurable || descriptor.enumerable !== canonical.enumerable || "value" in descriptor !== "value" in canonical) {
    return false;
  }
  if ("value" in descriptor && "value" in canonical) {
    if (descriptor.writable !== canonical.writable) {
      return false;
    }
    if (typeof canonical.value === "function") {
      return isCanonicalIntrinsicFunction(descriptor.value, canonical.value, functionPrototype);
    }
    if (canonical.value !== null && typeof canonical.value === "object") {
      return false;
    }
    return Object.is(descriptor.value, canonical.value);
  }
  return isCanonicalIntrinsicFunction(descriptor.get, canonical.get, functionPrototype) && isCanonicalIntrinsicFunction(descriptor.set, canonical.set, functionPrototype);
}
function hasNativeErrorBrand(current) {
  if (nativeErrorBrand) {
    return nativeErrorBrand.call(Error, current);
  }
  let prototype = current;
  for (let depth = 0; prototype !== null && depth < MAX_BUFFERED_EVENT_DEPTH; depth += 1) {
    if (Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag)) {
      return false;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return prototype === null && objectToString.call(current) === "[object Error]";
}
function getVerifiedForeignErrorConstructor(current, stackDescriptor) {
  if (typeof stackDescriptor.get !== "function" || typeof stackDescriptor.set !== "function") {
    return void 0;
  }
  let prototype = Object.getPrototypeOf(current);
  for (let depth = 0; prototype !== null && depth < MAX_BUFFERED_EVENT_DEPTH; depth += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "constructor");
    if (descriptor && "value" in descriptor && typeof descriptor.value === "function") {
      const constructor = descriptor.value;
      if (functionToString.call(constructor) === nativeErrorConstructorSource && isTrustedIntrinsicPrototype(prototype)) {
        const functionPrototype = Object.getPrototypeOf(constructor);
        if (Object.getPrototypeOf(stackDescriptor.get) === functionPrototype && Object.getPrototypeOf(stackDescriptor.set) === functionPrototype) {
          return { constructor, prototype };
        }
        return void 0;
      }
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return void 0;
}
function isTrustedNativeErrorStack(current, descriptor) {
  if (!hasNativeErrorBrand(current)) {
    return false;
  }
  if (errorStackDescriptor && !("value" in errorStackDescriptor) && typeof errorStackDescriptor.get === "function" && Object.prototype.isPrototypeOf.call(Error.prototype, current) && descriptor.get === errorStackDescriptor.get && descriptor.set === errorStackDescriptor.set) {
    return true;
  }
  const verified = getVerifiedForeignErrorConstructor(current, descriptor);
  if (!verified) {
    return false;
  }
  let canonicalDescriptor = foreignErrorStackDescriptors.get(verified.prototype);
  if (!canonicalDescriptor) {
    const canonical = Reflect.construct(verified.constructor, []);
    if (typeof canonical !== "object" || canonical === null || !hasNativeErrorBrand(canonical) || Object.getPrototypeOf(canonical) !== verified.prototype) {
      return false;
    }
    canonicalDescriptor = Object.getOwnPropertyDescriptor(canonical, "stack");
    if (!canonicalDescriptor || "value" in canonicalDescriptor || typeof canonicalDescriptor.get !== "function" || typeof canonicalDescriptor.set !== "function") {
      return false;
    }
    foreignErrorStackDescriptors.set(verified.prototype, canonicalDescriptor);
  }
  return descriptor.get === canonicalDescriptor.get && descriptor.set === canonicalDescriptor.set;
}
function createEventQueue() {
  let entries = [];
  let head = 0;
  return {
    get length() {
      return entries.length - head;
    },
    enqueue(value) {
      entries.push(value);
    },
    dequeue() {
      if (head === entries.length) {
        return void 0;
      }
      const value = entries[head];
      entries[head] = void 0;
      head += 1;
      if (head === entries.length) {
        entries = [];
        head = 0;
      } else if (head >= 1024 && head * 2 >= entries.length) {
        entries = entries.slice(head);
        head = 0;
      }
      return value;
    },
    clear() {
      entries = [];
      head = 0;
    }
  };
}
function getRetainedStorageBrand(current) {
  let prototype = Object.getPrototypeOf(current);
  for (let depth = 0; prototype !== null && depth < MAX_BUFFERED_EVENT_DEPTH; depth += 1) {
    if (prototype === Date.prototype) {
      return "Date";
    }
    if (!trustedIntrinsicPrototypes.has(prototype)) {
      const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor");
      if (constructor && "value" in constructor && typeof constructor.value === "function" && functionToString.call(constructor.value) === nativeDateConstructorSource && getTrustedForeignIntrinsic(prototype)) {
        return "Date";
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag);
    if (descriptor && "value" in descriptor && typeof descriptor.value === "string" && retainedStorageBrands.has(descriptor.value)) {
      return descriptor.value;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return void 0;
}
function estimateRetainedBufferBytes(current, visit, depth) {
  if (ArrayBuffer.isView(current)) {
    let buffer;
    let kind2 = "typed-array";
    try {
      buffer = typedArrayBufferGetter == null ? void 0 : typedArrayBufferGetter.call(current);
    } catch {
      kind2 = "data-view";
      buffer = dataViewBufferGetter == null ? void 0 : dataViewBufferGetter.call(current);
    }
    if (typeof buffer !== "object" || buffer === null) {
      return { bytes: Number.POSITIVE_INFINITY, kind: kind2 };
    }
    visit(buffer, depth + 1);
    return { bytes: 0, kind: kind2 };
  }
  const brand = getRetainedStorageBrand(current);
  if (!brand) {
    return void 0;
  }
  let getter;
  const kind = "buffer";
  switch (brand) {
    case "ArrayBuffer": {
      getter = arrayBufferByteLengthGetter;
      break;
    }
    case "SharedArrayBuffer": {
      getter = sharedArrayBufferByteLengthGetter;
      break;
    }
    case "Blob":
    case "File": {
      return { bytes: Number.POSITIVE_INFINITY, kind: "blob" };
    }
    case "Map": {
      return { bytes: 0, kind: "map" };
    }
    case "Date": {
      Reflect.apply(dateTimestampGetter, current, []);
      return { bytes: 8, kind: "date" };
    }
    case "Set": {
      return { bytes: 0, kind: "set" };
    }
    case "Headers": {
      return { bytes: 0, kind: "headers" };
    }
    default: {
      return void 0;
    }
  }
  const bytes = getter == null ? void 0 : getter.call(current);
  return {
    bytes: typeof bytes === "number" && Number.isSafeInteger(bytes) && bytes >= 0 ? bytes : Number.POSITIVE_INFINITY,
    kind
  };
}
function visitHiddenEventValues(current, kind, visit) {
  if (kind === "map") {
    for (const [key, entry] of mapEntries.call(current)) {
      if (!visit(key, 8) || !visit(entry, 8)) {
        return false;
      }
    }
  }
  if (kind === "set") {
    for (const entry of setValues.call(current)) {
      if (!visit(entry, 8)) {
        return false;
      }
    }
  }
  if (kind === "headers") {
    if (!headersEntries) {
      return false;
    }
    for (const [name, value] of headersEntries.call(current)) {
      if (!visit(name, 8) || !visit(value, 8)) {
        return false;
      }
    }
  }
  return true;
}
function getInspectableEventKeys(current, kind, availableBytes) {
  if (Array.isArray(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, "length");
    const length2 = descriptor && "value" in descriptor ? descriptor.value : void 0;
    if (typeof length2 !== "number" || !Number.isSafeInteger(length2) || length2 < 0 || length2 > Math.floor(availableBytes / 16)) {
      return void 0;
    }
  }
  if (kind !== "typed-array") {
    return Reflect.ownKeys(current);
  }
  const length = typedArrayLengthGetter == null ? void 0 : typedArrayLengthGetter.call(current);
  if (typeof length !== "number" || !Number.isSafeInteger(length) || length < 0 || length > MAX_INSPECTABLE_TYPED_ARRAY_ELEMENTS) {
    return void 0;
  }
  return Reflect.ownKeys(current).filter((key) => {
    if (typeof key !== "string") {
      return true;
    }
    const index = Number(key);
    return !Number.isInteger(index) || index < 0 || index >= length || String(index) !== key;
  });
}
function visitInspectableEventProperties(current, kind, depth, availableBytes, charge, visit) {
  const keys = getInspectableEventKeys(current, kind, availableBytes());
  if (keys === void 0) {
    return false;
  }
  for (const key of keys) {
    if (!charge(typeof key === "string" ? key.length * 2 + 8 : 8)) {
      return false;
    }
    if (typeof key === "symbol") {
      visit(key, depth + 1);
    }
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (!descriptor) {
      return false;
    }
    if (!("value" in descriptor)) {
      if (key === "stack" && isTrustedNativeErrorStack(current, descriptor)) {
        continue;
      }
      return false;
    }
    visit(descriptor.value, depth + 1, kind === "blob");
  }
  return true;
}
function visitRetainedEventPrototypes(current, depth, isBlobInternalHandle, visited, availableBytes, charge, visit, retainPrototype) {
  let prototype = Object.getPrototypeOf(current);
  for (let prototypeDepth = depth + 1; prototype !== null; prototypeDepth += 1) {
    if (prototypeDepth >= MAX_BUFFERED_EVENT_DEPTH) {
      return false;
    }
    if (trustedIntrinsicPrototypes.has(prototype) || isBlobInternalHandle && prototype === blobInternalHandlePrototype) {
      return true;
    }
    if (visited.has(prototype)) {
      visit(prototype, prototypeDepth);
      return availableBytes() >= 0;
    }
    visited.add(prototype);
    const retainedPrototype = prototype;
    const retained = retainPrototype(retainedPrototype, () => {
      if (!charge(16)) {
        return false;
      }
      const intrinsic = getTrustedForeignIntrinsic(retainedPrototype);
      if (!intrinsic) {
        return visitInspectableEventProperties(retainedPrototype, void 0, prototypeDepth, availableBytes, charge, visit);
      }
      for (const key of Reflect.ownKeys(retainedPrototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(retainedPrototype, key);
        if (!descriptor) {
          return false;
        }
        if (isCanonicalIntrinsicDescriptor(descriptor, intrinsic.descriptors.get(key), intrinsic.functionPrototype)) {
          continue;
        }
        if (!charge(typeof key === "string" ? key.length * 2 + 8 : 8) || !("value" in descriptor)) {
          return false;
        }
        if (typeof key === "symbol") {
          visit(key, prototypeDepth + 1);
        }
        visit(descriptor.value, prototypeDepth + 1);
      }
      return availableBytes() >= 0;
    });
    if (!retained) {
      return false;
    }
    prototype = Object.getPrototypeOf(retainedPrototype);
  }
  return true;
}
const BUFFERED_LEDGER_ENTRY_BYTES = 32;
const BUFFERED_LEDGER_NODE_BYTES = 32;
const BUFFERED_LEDGER_EDGE_BYTES = 8;
const BUFFERED_LEDGER_OWNER_BYTES = 16;
const MAX_BUFFERED_LEDGER_RECONCILIATION_WORK = 128 * 1024;
function inspectBufferedEventGraph(value, remainingBytes) {
  let bytes = 0;
  let scalarBytes = 0;
  const visited = /* @__PURE__ */ new WeakSet();
  const visitedSymbols = /* @__PURE__ */ new Set();
  const roots = /* @__PURE__ */ new Set();
  const nodes = /* @__PURE__ */ new Map();
  let activeNode;
  const availableBytes = () => remainingBytes - bytes;
  const charge = (amount) => {
    if (!Number.isSafeInteger(amount) || amount < 0) {
      bytes = remainingBytes + 1;
      return false;
    }
    bytes += amount;
    if (activeNode) {
      activeNode.bytes += amount;
    } else {
      scalarBytes += amount;
    }
    return bytes <= remainingBytes;
  };
  const addIdentity = (identity) => {
    if (activeNode) {
      activeNode.edges.add(identity);
    } else {
      roots.add(identity);
    }
  };
  const retainIdentity = (identity, inspect) => {
    addIdentity(identity);
    const node = { bytes: 0, edges: /* @__PURE__ */ new Set() };
    nodes.set(identity, node);
    const previous = activeNode;
    activeNode = node;
    try {
      return inspect();
    } finally {
      activeNode = previous;
    }
  };
  const visitSymbol = (current) => {
    if (visitedSymbols.has(current)) {
      addIdentity(current);
      charge(8);
      return;
    }
    visitedSymbols.add(current);
    if (!retainIdentity(current, () => {
      if (!symbolDescriptionGetter) {
        return false;
      }
      const description = Reflect.apply(symbolDescriptionGetter, current, []);
      return charge(8 + ((description == null ? void 0 : description.length) ?? 0) * 2);
    })) {
      bytes = remainingBytes + 1;
    }
  };
  const visit = (current, depth, isBlobInternalHandle = false) => {
    if (bytes > remainingBytes) {
      return;
    }
    if (typeof current === "string") {
      charge(current.length * 2);
      return;
    }
    if (typeof current === "symbol") {
      visitSymbol(current);
      return;
    }
    if (typeof current === "function") {
      bytes = remainingBytes + 1;
      return;
    }
    if (current === null || typeof current !== "object") {
      charge(8);
      return;
    }
    if (nativeProxyDetector == null ? void 0 : nativeProxyDetector(current)) {
      bytes = remainingBytes + 1;
      return;
    }
    if (depth >= MAX_BUFFERED_EVENT_DEPTH) {
      bytes = remainingBytes + 1;
      return;
    }
    if (visited.has(current)) {
      addIdentity(current);
      charge(8);
      return;
    }
    visited.add(current);
    if (!retainIdentity(current, () => {
      if (!charge(16)) {
        return false;
      }
      const retainedStorage = estimateRetainedBufferBytes(current, visit, depth);
      if (!visitRetainedEventPrototypes(current, depth, isBlobInternalHandle, visited, availableBytes, charge, visit, retainIdentity)) {
        return false;
      }
      if (retainedStorage !== void 0 && !charge(retainedStorage.bytes)) {
        return false;
      }
      if (!visitHiddenEventValues(current, retainedStorage == null ? void 0 : retainedStorage.kind, (hiddenValue, overhead) => {
        if (!charge(overhead)) {
          return false;
        }
        visit(hiddenValue, depth + 1);
        return bytes <= remainingBytes;
      })) {
        return false;
      }
      return visitInspectableEventProperties(current, retainedStorage == null ? void 0 : retainedStorage.kind, depth, availableBytes, charge, visit);
    })) {
      bytes = remainingBytes + 1;
    }
  };
  try {
    visit(value, 0);
  } catch {
    return void 0;
  }
  return bytes <= remainingBytes ? { scalarBytes, roots, nodes } : void 0;
}
function areBufferedRetainedEdgesEqual(first, second) {
  if (first.size !== second.size) {
    return false;
  }
  for (const identity of first) {
    if (!second.has(identity)) {
      return false;
    }
  }
  return true;
}
function getBufferedLedgerNodeBytes(node, owners) {
  return node.bytes + BUFFERED_LEDGER_NODE_BYTES + node.edges.size * BUFFERED_LEDGER_EDGE_BYTES + owners * BUFFERED_LEDGER_OWNER_BYTES;
}
function getBufferedLedgerEntryBytes(entry) {
  return BUFFERED_LEDGER_ENTRY_BYTES + entry.scalarBytes + entry.roots.size * BUFFERED_LEDGER_EDGE_BYTES;
}
function collectBufferedLedgerIdentities(roots, candidate, records, work) {
  const identities = /* @__PURE__ */ new Set();
  const pending = [...roots];
  while (pending.length) {
    work.remaining -= 1;
    if (work.remaining < 0) {
      return void 0;
    }
    const identity = pending.pop();
    if (identities.has(identity)) {
      continue;
    }
    const node = candidate.get(identity) ?? records.get(identity);
    if (!node) {
      return void 0;
    }
    identities.add(identity);
    for (const edge of node.edges) {
      pending.push(edge);
    }
  }
  return identities;
}
function getBufferedLedgerChange(identity, graph, records, changes, node) {
  const existing = changes.get(identity);
  if (existing) {
    if (node) {
      existing.node = node;
    }
    return existing;
  }
  const current = node ?? graph.nodes.get(identity) ?? records.get(identity);
  if (!current) {
    return void 0;
  }
  const update = { node: current, ownerDelta: 0 };
  changes.set(identity, update);
  return update;
}
function findBufferedLedgerAffectedOwners(entry, graph, records, changes, work) {
  const affected = /* @__PURE__ */ new Set([entry]);
  for (const [identity, node] of graph.nodes) {
    work.remaining -= 1;
    if (work.remaining < 0) {
      return void 0;
    }
    const previous = records.get(identity);
    if (!previous) {
      continue;
    }
    const changedEdges = !areBufferedRetainedEdgesEqual(previous.edges, node.edges);
    if (previous.bytes !== node.bytes || changedEdges) {
      getBufferedLedgerChange(identity, graph, records, changes, node);
    }
    if (!changedEdges) {
      continue;
    }
    for (const owner of previous.owners) {
      work.remaining -= 1;
      if (work.remaining < 0) {
        return void 0;
      }
      affected.add(owner);
    }
  }
  return affected;
}
function updateBufferedLedgerMembershipChanges(owner, next, graph, records, changes, work) {
  for (const identity of owner.identities) {
    work.remaining -= 1;
    if (work.remaining < 0) {
      return false;
    }
    if (!next.has(identity)) {
      const update = getBufferedLedgerChange(identity, graph, records, changes);
      if (!update) {
        return false;
      }
      update.ownerDelta -= 1;
    }
  }
  for (const identity of next) {
    work.remaining -= 1;
    if (work.remaining < 0) {
      return false;
    }
    if (!owner.identities.has(identity)) {
      const update = getBufferedLedgerChange(identity, graph, records, changes);
      if (!update) {
        return false;
      }
      update.ownerDelta += 1;
    }
  }
  return true;
}
function collectBufferedLedgerMemberships(entry, graph, affected, records, changes, work) {
  const memberships = /* @__PURE__ */ new Map();
  for (const owner of affected) {
    const roots = owner === entry ? graph.roots : owner.roots;
    const next = collectBufferedLedgerIdentities(roots, graph.nodes, records, work);
    if (!next || !updateBufferedLedgerMembershipChanges(owner, next, graph, records, changes, work)) {
      return void 0;
    }
    memberships.set(owner, next);
  }
  return memberships;
}
function projectBufferedLedgerBytes(currentBytes, entry, graph, isNew, changes, records) {
  let projected = currentBytes - (isNew ? 0 : getBufferedLedgerEntryBytes(entry)) + getBufferedLedgerEntryBytes(graph);
  for (const [identity, update] of changes) {
    const previous = records.get(identity);
    const owners = ((previous == null ? void 0 : previous.owners.size) ?? 0) + update.ownerDelta;
    if (owners < 0) {
      return void 0;
    }
    if (previous) {
      projected -= getBufferedLedgerNodeBytes(previous, previous.owners.size);
    }
    if (owners) {
      projected += getBufferedLedgerNodeBytes(update.node, owners);
    }
  }
  return Number.isSafeInteger(projected) && projected >= 0 && projected <= MAX_BUFFERED_ITERATOR_BYTES ? projected : void 0;
}
function applyBufferedLedgerChanges(records, changes, memberships) {
  var _a3, _b2;
  for (const [identity, update] of changes) {
    const previous = records.get(identity);
    const owners = ((previous == null ? void 0 : previous.owners.size) ?? 0) + update.ownerDelta;
    if (!owners) {
      continue;
    }
    if (previous) {
      previous.bytes = update.node.bytes;
      previous.edges = update.node.edges;
    } else {
      records.set(identity, {
        bytes: update.node.bytes,
        edges: update.node.edges,
        owners: /* @__PURE__ */ new Set()
      });
    }
  }
  for (const [owner, next] of memberships) {
    for (const identity of owner.identities) {
      if (!next.has(identity)) {
        (_a3 = records.get(identity)) == null ? void 0 : _a3.owners.delete(owner);
      }
    }
    for (const identity of next) {
      if (!owner.identities.has(identity)) {
        records.get(identity).owners.add(owner);
      }
    }
    owner.identities = next;
  }
  for (const identity of changes.keys()) {
    if (((_b2 = records.get(identity)) == null ? void 0 : _b2.owners.size) === 0) {
      records.delete(identity);
    }
  }
}
function createBufferedEventLedger() {
  const records = /* @__PURE__ */ new Map();
  let bytes = 0;
  const reconcile = (entry, graph, isNew) => {
    const work = { remaining: MAX_BUFFERED_LEDGER_RECONCILIATION_WORK };
    const changes = /* @__PURE__ */ new Map();
    const affected = findBufferedLedgerAffectedOwners(entry, graph, records, changes, work);
    if (!affected) {
      return false;
    }
    const memberships = collectBufferedLedgerMemberships(entry, graph, affected, records, changes, work);
    if (!memberships) {
      return false;
    }
    const projectedBytes = projectBufferedLedgerBytes(bytes, entry, graph, isNew, changes, records);
    if (projectedBytes === void 0) {
      return false;
    }
    applyBufferedLedgerChanges(records, changes, memberships);
    entry.scalarBytes = graph.scalarBytes;
    entry.roots = graph.roots;
    bytes = projectedBytes;
    return true;
  };
  const release = (entry) => {
    bytes -= getBufferedLedgerEntryBytes(entry);
    for (const identity of entry.identities) {
      const record = records.get(identity);
      if (!(record == null ? void 0 : record.owners.delete(entry))) {
        continue;
      }
      bytes -= BUFFERED_LEDGER_OWNER_BYTES;
      if (record.owners.size === 0) {
        bytes -= getBufferedLedgerNodeBytes(record, 0);
        records.delete(identity);
      }
    }
    entry.identities.clear();
  };
  return {
    retain(graph) {
      const entry = { scalarBytes: 0, roots: /* @__PURE__ */ new Set(), identities: /* @__PURE__ */ new Set() };
      return reconcile(entry, graph, true) ? entry : void 0;
    },
    refresh(entry, graph) {
      return reconcile(entry, graph, false);
    },
    release,
    clear() {
      records.clear();
      bytes = 0;
    }
  };
}
let EventStream$1 = class EventStream {
  /** Creates an unstarted stream with independent connection and completion lifecycle promises. */
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => void 0);
    _EventStream_rejectConnectedPromise.set(this, () => void 0);
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => void 0);
    _EventStream_rejectEndPromise.set(this, () => void 0);
    _EventStream_listeners.set(this, /* @__PURE__ */ Object.create(null));
    _EventStream_abortListeners.set(this, []);
    _EventStream_emittedListenerRegistrations.set(this, /* @__PURE__ */ new WeakMap());
    _EventStream_pendingListenerCleanup.set(this, /* @__PURE__ */ new Set());
    _EventStream_pendingBufferedEventChecks.set(this, /* @__PURE__ */ new Set());
    _EventStream_listenerDispatchDepth.set(this, 0);
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    _EventStream_terminalFailure.set(this, void 0);
    __classPrivateFieldSet(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectConnectedPromise, reject, "f");
    }));
    __classPrivateFieldSet(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectEndPromise, reject, "f");
    }));
    __classPrivateFieldGet(this, _EventStream_connectedPromise, "f").catch(() => void 0);
    __classPrivateFieldGet(this, _EventStream_endPromise, "f").catch(() => void 0);
  }
  _run(executor) {
    setTimeout(() => {
      let failed = false;
      Promise.resolve().then(executor).catch((error) => {
        failed = true;
        __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).call(this, error);
      }).then(() => {
        if (failed) {
          return;
        }
        try {
          this._emitFinal();
        } catch (error) {
          __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).call(this, error);
          return;
        }
        this._emit("end");
      });
    }, 0);
  }
  _connected() {
    if (this.ended) {
      return;
    }
    __classPrivateFieldGet(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  /** Whether the stream has finished successfully, failed, or been aborted. */
  get ended() {
    return __classPrivateFieldGet(this, _EventStream_ended, "f");
  }
  /** Whether an error or user cancellation has been observed. */
  get errored() {
    return __classPrivateFieldGet(this, _EventStream_errored, "f");
  }
  /** Whether the stream ended because its request was cancelled. */
  get aborted() {
    return __classPrivateFieldGet(this, _EventStream_aborted, "f");
  }
  /**
   * Cancels the underlying request; {@link done} and {@link events} observe cancellation.
   * Promises returned by {@link emitted} for other events may remain pending.
   */
  abort() {
    this.controller.abort();
  }
  /** Creates a user-abort error retaining this runner's cancellation reason. */
  _userAbortError() {
    const error = new APIUserAbortError();
    Object.defineProperty(error, "cause", {
      value: this.controller.signal.reason,
      writable: true,
      configurable: true
    });
    return error;
  }
  _listenForAbort(signal) {
    if (!signal || this.ended) {
      return;
    }
    if (signal.aborted) {
      __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_abortFromSignal).call(this, signal);
      return;
    }
    if (__classPrivateFieldGet(this, _EventStream_abortListeners, "f").some((registration) => registration.signal === signal)) {
      return;
    }
    const listener = () => __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_abortFromSignal).call(this, signal);
    signal.addEventListener("abort", listener, { once: true });
    __classPrivateFieldGet(this, _EventStream_abortListeners, "f").push({ signal, listener });
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns This stream, so that listener registration calls can be chained.
   */
  on(event, listener) {
    var _a3;
    const listeners = (_a3 = __classPrivateFieldGet(this, _EventStream_listeners, "f"))[event] || (_a3[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns This stream, so that listener registration calls can be chained.
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    if (!listeners) {
      return this;
    }
    const emittedRegistration = __classPrivateFieldGet(this, _EventStream_emittedListenerRegistrations, "f").get(listener);
    if ((emittedRegistration == null ? void 0 : emittedRegistration.event) === event && !emittedRegistration.registration.removed && !emittedRegistration.registration.detached) {
      __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_removeEmittedListener).call(this, event, emittedRegistration.registration);
      return this;
    }
    const index = listeners.findIndex((l) => !l.removed && l.listener === listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns This stream, so that listener registration calls can be chained.
   */
  once(event, listener) {
    var _a3;
    const listeners = (_a3 = __classPrivateFieldGet(this, _EventStream_listeners, "f"))[event] || (_a3[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * Events without arguments resolve to `undefined`, single-argument events resolve
   * to that argument, and events with multiple arguments resolve to an argument tuple.
   *
   * @returns A promise for the next event, or a rejection if an error occurs first.
   * Requesting the `error` event resolves with the emitted error instead.
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true);
      const onError = (error) => {
        this.off(event, onEvent);
        reject(error);
      };
      const onEvent = (...values2) => {
        if (event !== "error") {
          this.off("error", onError);
        }
        resolve(values2.length > 1 ? values2 : values2[0]);
      };
      if (event !== "error") {
        __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_onceForEmitted).call(this, "error", onError);
      }
      __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_onceForEmitted).call(this, event, onEvent);
    });
  }
  /**
   * Returns an async iterator that yields every time the event is triggered.
   * The iterator ends when the stream ends and rejects if the stream errors
   * or is aborted. If you request the 'error' or 'abort' event, the iterator
   * yields that event instead of rejecting.
   *
   * Example:
   *
   *   for await (const [message] of stream.events('message')) {
   *     await processMessage(message);
   *   }
   */
  events(event) {
    return this._createIterator((push) => {
      const onEvent = (...args) => {
        sdkOwnedBufferedEventArguments.add(args);
        try {
          push(args);
        } finally {
          sdkOwnedBufferedEventArguments.delete(args);
        }
      };
      this.on(event, onEvent);
      return () => this.off(event, onEvent);
    }, {
      // When iterating the 'error' or 'abort' event itself, yield it as a
      // value instead of rejecting the iterator.
      rejectOnError: event !== "error",
      rejectOnAbort: event !== "abort"
    });
  }
  /**
   * Shared buffered async-iterator adapter over this stream's events.
   *
   * `attach` registers the producer listener(s) with the given `push` and
   * returns a cleanup function that removes them. Termination is handled
   * here: the iterator ends when the stream ends, listeners are removed on
   * end/return, and a terminal error is retained until buffered values have
   * drained so it is surfaced even when no reader was waiting when it fired.
   * Detached consumers have bounded event and byte queues; exceeding either
   * limit fails the stream and aborts its underlying request. Detached queues
   * also reject accessor-backed payloads because getter closures cannot be
   * safely sized without executing untrusted code.
   */
  _createIterator(attach, { rejectOnError = true, rejectOnAbort = true, onReturn } = {}) {
    const pushQueue = createEventQueue();
    const bufferedEventSizes = createEventQueue();
    const readQueue = createEventQueue();
    const bufferedLedger = createBufferedEventLedger();
    let ended = this.ended;
    let failure;
    let failureDelivered = false;
    let detach = () => void 0;
    const doneResult = () => ({ value: void 0, done: true });
    const finishReaders = () => {
      while (readQueue.length) {
        readQueue.dequeue().resolve(doneResult());
      }
    };
    const rejectReader = () => {
      if (!failure || failureDelivered || !readQueue.length) {
        return;
      }
      failureDelivered = true;
      readQueue.dequeue().reject(failure);
    };
    const cleanup = () => {
      detach();
      this.off("end", onEnd);
      if (rejectOnError) {
        this.off("error", onFailure);
      }
      if (rejectOnAbort) {
        this.off("abort", onFailure);
      }
    };
    const deactivateBufferedEvent = (entry) => {
      entry.active = false;
      if (entry.check) {
        __classPrivateFieldGet(this, _EventStream_pendingBufferedEventChecks, "f").delete(entry.check);
        entry.check = void 0;
      }
    };
    const failBufferedEvents = (discardRetained = false) => {
      if (discardRetained) {
        while (bufferedEventSizes.length) {
          deactivateBufferedEvent(bufferedEventSizes.dequeue());
        }
        pushQueue.clear();
        bufferedLedger.clear();
      }
      const error = new OpenAIError(`Event stream iterator buffer limit exceeded (${MAX_BUFFERED_ITERATOR_EVENTS} events or ${MAX_BUFFERED_ITERATOR_BYTES} bytes); consume events as they arrive.`);
      try {
        __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).call(this, error);
      } finally {
        this.controller.abort();
      }
      return error;
    };
    const revalidateBufferedEvent = (value, entry) => {
      if (!entry.active || __classPrivateFieldGet(this, _EventStream_ended, "f")) {
        return;
      }
      const graph = inspectBufferedEventGraph(value, MAX_BUFFERED_ITERATOR_BYTES);
      if (!graph || !bufferedLedger.refresh(entry.retention, graph)) {
        failBufferedEvents(true);
      }
    };
    const push = (value) => {
      if (ended) {
        return;
      }
      const reader = readQueue.dequeue();
      if (reader) {
        reader.resolve({ value, done: false });
      } else {
        if (pushQueue.length >= MAX_BUFFERED_ITERATOR_EVENTS) {
          failBufferedEvents();
          return;
        }
        const graph = inspectBufferedEventGraph(value, MAX_BUFFERED_ITERATOR_BYTES);
        const retention = graph && bufferedLedger.retain(graph);
        if (!retention) {
          failBufferedEvents();
          return;
        }
        if (typeof value === "object" && value !== null && sdkOwnedBufferedEventArguments.has(value)) {
          const argumentsTuple = value;
          for (let index = 0; index < argumentsTuple.length; index += 1) {
            const argument = argumentsTuple[index];
            if (typeof argument === "string") {
              argumentsTuple[index] = bufferedJSONParse(bufferedJSONStringify(argument));
            }
          }
        }
        const entry = { retention, active: true, check: void 0 };
        pushQueue.enqueue(value);
        bufferedEventSizes.enqueue(entry);
        const check = () => {
          entry.check = void 0;
          revalidateBufferedEvent(value, entry);
        };
        entry.check = check;
        __classPrivateFieldGet(this, _EventStream_pendingBufferedEventChecks, "f").add(check);
      }
    };
    const onFailure = (error) => {
      failure = error;
      if (!pushQueue.length) {
        rejectReader();
      }
    };
    const adoptTerminalFailure = () => {
      if (failure) {
        return;
      }
      const terminal = __classPrivateFieldGet(this, _EventStream_terminalFailure, "f");
      if (!terminal) {
        return;
      }
      if (terminal.kind === "error" ? rejectOnError : rejectOnAbort) {
        failure = terminal.error;
      }
    };
    const onEnd = () => {
      ended = true;
      adoptTerminalFailure();
      cleanup();
      if (!pushQueue.length) {
        rejectReader();
        finishReaders();
      }
    };
    if (!ended) {
      detach = attach(push);
      this.on("end", onEnd);
      if (rejectOnError) {
        this.on("error", onFailure);
      }
      if (rejectOnAbort) {
        this.on("abort", onFailure);
      }
    }
    return {
      next: () => {
        if (pushQueue.length) {
          const value = pushQueue.dequeue();
          const entry = bufferedEventSizes.dequeue();
          deactivateBufferedEvent(entry);
          const graph = inspectBufferedEventGraph(value, MAX_BUFFERED_ITERATOR_BYTES);
          if (!graph || !bufferedLedger.refresh(entry.retention, graph)) {
            const error = failBufferedEvents(true);
            failureDelivered = true;
            return Promise.reject(error);
          }
          bufferedLedger.release(entry.retention);
          return Promise.resolve({ value, done: false });
        }
        if (ended || this.ended) {
          adoptTerminalFailure();
        }
        if (failure && !failureDelivered) {
          failureDelivered = true;
          return Promise.reject(failure);
        }
        if (ended) {
          return Promise.resolve(doneResult());
        }
        return new Promise((resolve, reject) => {
          readQueue.enqueue({ resolve, reject });
        });
      },
      return: () => {
        ended = true;
        failureDelivered = true;
        while (bufferedEventSizes.length) {
          deactivateBufferedEvent(bufferedEventSizes.dequeue());
        }
        pushQueue.clear();
        bufferedLedger.clear();
        cleanup();
        finishReaders();
        if (onReturn) {
          void this.done().catch(() => void 0);
          onReturn();
        }
        return Promise.resolve(doneResult());
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
  /** Resolves when the stream ends successfully or rejects when it fails or is aborted. */
  async done() {
    __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true);
    await __classPrivateFieldGet(this, _EventStream_endPromise, "f");
  }
  /** Returns whether an event currently has one or more registered listeners. */
  _hasListeners(event) {
    var _a3;
    return Boolean((_a3 = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event]) == null ? void 0 : _a3.some((listener) => !listener.removed));
  }
  /** Dispatches a stream event and performs the associated lifecycle transitions. */
  _emit(event, ...args) {
    if (__classPrivateFieldGet(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_removeAbortListeners).call(this);
      __classPrivateFieldSet(this, _EventStream_ended, true);
      __classPrivateFieldGet(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    let dispatchError;
    let dispatchThrew = false;
    try {
      if (listeners) {
        __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = listeners.filter((listener) => {
          if (listener.once) {
            listener.detached = true;
          }
          return !listener.once && !listener.removed;
        });
        __classPrivateFieldSet(this, _EventStream_listenerDispatchDepth, __classPrivateFieldGet(this, _EventStream_listenerDispatchDepth, "f") + 1, "f");
        try {
          for (const registration of listeners) {
            if (!registration.removed) {
              const { listener } = registration;
              listener(...args);
            }
          }
        } finally {
          __classPrivateFieldSet(this, _EventStream_listenerDispatchDepth, __classPrivateFieldGet(this, _EventStream_listenerDispatchDepth, "f") - 1, "f");
          if (__classPrivateFieldGet(this, _EventStream_listenerDispatchDepth, "f") === 0) {
            __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_cleanupEmittedListeners).call(this);
            for (const check of __classPrivateFieldGet(this, _EventStream_pendingBufferedEventChecks, "f")) {
              __classPrivateFieldGet(this, _EventStream_pendingBufferedEventChecks, "f").delete(check);
              if (!__classPrivateFieldGet(this, _EventStream_ended, "f")) {
                check();
              }
            }
          }
        }
      }
    } catch (error) {
      dispatchError = error;
      dispatchThrew = true;
    }
    try {
      __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_settleTerminalEvent).call(this, event, args, Boolean(listeners == null ? void 0 : listeners.length));
    } catch (error) {
      if (!dispatchThrew) {
        dispatchError = error;
        dispatchThrew = true;
      }
    }
    if (dispatchThrew) {
      throw dispatchError;
    }
  }
  // oxlint-disable-next-line class-methods-use-this -- Subclasses override this instance hook.
  _emitFinal() {
  }
};
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_abortListeners = /* @__PURE__ */ new WeakMap(), _EventStream_emittedListenerRegistrations = /* @__PURE__ */ new WeakMap(), _EventStream_pendingListenerCleanup = /* @__PURE__ */ new WeakMap(), _EventStream_pendingBufferedEventChecks = /* @__PURE__ */ new WeakMap(), _EventStream_listenerDispatchDepth = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_terminalFailure = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_abortFromSignal = function _EventStream_abortFromSignal2(signal) {
  try {
    this.controller.abort(signal.reason);
  } catch {
    this.controller.abort();
  }
}, _EventStream_removeAbortListeners = function _EventStream_removeAbortListeners2() {
  for (const { signal, listener } of __classPrivateFieldGet(this, _EventStream_abortListeners, "f").splice(0)) {
    signal.removeEventListener("abort", listener);
  }
}, _EventStream_onceForEmitted = function _EventStream_onceForEmitted2(event, listener) {
  const previousListeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
  const previousLength = (previousListeners == null ? void 0 : previousListeners.length) ?? 0;
  this.once(event, listener);
  const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
  const [registration] = (listeners == null ? void 0 : listeners.slice(-1)) ?? [];
  if ((previousListeners === void 0 || listeners === previousListeners) && (listeners == null ? void 0 : listeners.length) === previousLength + 1 && (registration == null ? void 0 : registration.listener) === listener && registration.once) {
    __classPrivateFieldGet(this, _EventStream_emittedListenerRegistrations, "f").set(listener, { event, registration });
  }
}, _EventStream_removeEmittedListener = function _EventStream_removeEmittedListener2(event, registration) {
  if (registration.removed) {
    return;
  }
  registration.removed = true;
  __classPrivateFieldGet(this, _EventStream_emittedListenerRegistrations, "f").delete(registration.listener);
  __classPrivateFieldGet(this, _EventStream_pendingListenerCleanup, "f").add(event);
  if (__classPrivateFieldGet(this, _EventStream_listenerDispatchDepth, "f") === 0) {
    __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_cleanupEmittedListeners).call(this);
  }
}, _EventStream_cleanupEmittedListeners = function _EventStream_cleanupEmittedListeners2() {
  for (const event of __classPrivateFieldGet(this, _EventStream_pendingListenerCleanup, "f")) {
    const eventType = event;
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[eventType];
    if (listeners) {
      __classPrivateFieldGet(this, _EventStream_listeners, "f")[eventType] = listeners.filter((listener) => !listener.removed);
    }
  }
  __classPrivateFieldGet(this, _EventStream_pendingListenerCleanup, "f").clear();
}, _EventStream_handleError = function _EventStream_handleError2(error) {
  __classPrivateFieldSet(this, _EventStream_errored, true);
  if (error instanceof Error && error.name === "AbortError") {
    error = this._userAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet(this, _EventStream_aborted, true);
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
}, _EventStream_settleTerminalEvent = function _EventStream_settleTerminalEvent2(event, args, hasListeners) {
  if (event === "abort") {
    const error = args[0];
    __classPrivateFieldSet(this, _EventStream_terminalFailure, __classPrivateFieldGet(this, _EventStream_terminalFailure, "f") ?? { kind: "abort", error });
    if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !hasListeners) {
      Promise.reject(error);
    }
    __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
    __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
    this._emit("end");
    return;
  }
  if (event === "error") {
    const error = args[0];
    __classPrivateFieldSet(this, _EventStream_terminalFailure, __classPrivateFieldGet(this, _EventStream_terminalFailure, "f") ?? { kind: "error", error });
    if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !hasListeners) {
      Promise.reject(error);
    }
    __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
    __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
    this._emit("end");
  }
};
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}
var _AbstractChatCompletionRunner_instances, _a$1, _AbstractChatCompletionRunner_completionArrivedBeforeAbort, _AbstractChatCompletionRunner_afterCompletionInvoked, _AbstractChatCompletionRunner_getFinalContent, _AbstractChatCompletionRunner_getFinalMessage, _AbstractChatCompletionRunner_getFinalFunctionToolCall, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult, _AbstractChatCompletionRunner_calculateTotalUsage, _AbstractChatCompletionRunner_throwIfAborted, _AbstractChatCompletionRunner_validateParams, _AbstractChatCompletionRunner_stringifyFunctionCallResult;
const DEFAULT_MAX_CHAT_COMPLETIONS = 10;
function normalizeToolCallIds(chatCompletion) {
  for (const choice of chatCompletion.choices) {
    for (const toolCall of choice.message.tool_calls ?? []) {
      if (!toolCall.id) {
        toolCall.id = `call_${uuid4()}`;
      }
    }
  }
}
function toRequestMessage(message) {
  if (!isAssistantMessage(message)) {
    return message;
  }
  const requestMessage = { role: "assistant" };
  if (message.audio != null) {
    requestMessage.audio = { id: message.audio.id };
  }
  if (message.content !== void 0) {
    requestMessage.content = message.content;
  }
  if (message.function_call != null) {
    requestMessage.function_call = message.function_call;
  }
  if (message.name !== void 0) {
    requestMessage.name = message.name;
  }
  if (message.refusal != null) {
    requestMessage.refusal = message.refusal;
  }
  if (message.tool_calls !== void 0) {
    requestMessage.tool_calls = message.tool_calls.map((toolCall) => {
      if (toolCall.type === "custom") {
        return {
          id: toolCall.id,
          type: toolCall.type,
          custom: {
            input: toolCall.custom.input,
            name: toolCall.custom.name
          }
        };
      }
      return {
        id: toolCall.id,
        type: toolCall.type,
        function: {
          arguments: toolCall.function.arguments,
          name: toolCall.function.name
        }
      };
    });
  }
  return requestMessage;
}
class AbstractChatCompletionRunner extends EventStream$1 {
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    _AbstractChatCompletionRunner_completionArrivedBeforeAbort.set(this, false);
    _AbstractChatCompletionRunner_afterCompletionInvoked.set(this, false);
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    var _a3;
    __classPrivateFieldSet(this, _AbstractChatCompletionRunner_completionArrivedBeforeAbort, !this.controller.signal.aborted);
    normalizeToolCallIds(chatCompletion);
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = (_a3 = chatCompletion.choices[0]) == null ? void 0 : _a3.message;
    if (message) {
      this._addMessage(message);
    }
    return chatCompletion;
  }
  _addMessage(message, emit2 = true, normalizeContent = true) {
    if (normalizeContent && !("content" in message)) {
      message.content = null;
    }
    this.messages.push(message);
    if (emit2) {
      this._emit("message", message);
      if (isToolMessage(message) && message.content) {
        this._emit("functionToolCallResult", message.content);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionToolCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion) {
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    }
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * Waits for completion and returns the last function-tool call, or `undefined`
   * when no assistant message contains a function-tool call.
   */
  async finalFunctionToolCall() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
  }
  /** Waits for completion and returns the last matching function-tool result, if any. */
  async finalFunctionToolCallResult() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
  }
  /** Waits for completion and sums token usage across every chat completion in the run. */
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  /** Returns a copy of the chat completions received so far, in request order. */
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    if (__classPrivateFieldGet(this, _AbstractChatCompletionRunner_afterCompletionInvoked, "f")) {
      __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_throwIfAborted).call(this);
    }
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion) {
      this._emit("finalChatCompletion", completion);
    }
    const finalMessage = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage) {
      this._emit("finalMessage", finalMessage);
    }
    const finalContent = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent) {
      this._emit("finalContent", finalContent);
    }
    const finalFunctionCall = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
    if (finalFunctionCall) {
      this._emit("finalFunctionToolCall", finalFunctionCall);
    }
    const finalFunctionCallResult = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
    if (finalFunctionCallResult != null) {
      this._emit("finalFunctionToolCallResult", finalFunctionCallResult);
    }
    if (this._chatCompletions.some((c) => c.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options2) {
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    __classPrivateFieldGet(_a$1, _a$1, "m", _AbstractChatCompletionRunner_validateParams).call(_a$1, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options2, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options2) {
    for (const message of params.messages) {
      this._addMessage(message, false, false);
    }
    return await this._createChatCompletion(client, params, options2);
  }
  async _runTools(client, params, runner, options2) {
    var _a3, _b2, _c2;
    const role = "tool";
    const { tool_choice = "auto", stream: stream2, toolContext: inputToolContext, ...restParams } = params;
    const toolContext = inputToolContext;
    const singleFunctionToCall = (
      // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Chat history and tool-choice inputs can contain runtime variants that select different runner behavior.
      typeof tool_choice !== "string" && tool_choice.type === "function" && ((_a3 = tool_choice == null ? void 0 : tool_choice.function) == null ? void 0 : _a3.name)
    );
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS, afterCompletion } = options2 || {};
    const runAfterCompletion = async (completion) => {
      if (afterCompletion == null) {
        return;
      }
      __classPrivateFieldSet(this, _AbstractChatCompletionRunner_afterCompletionInvoked, true);
      await afterCompletion(completion, runner);
      __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_throwIfAborted).call(this);
    };
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool$1(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = /* @__PURE__ */ Object.create(null);
    for (const f of inputTools) {
      if (f.type === "function") {
        functionsByName[f.function.name || f.function.function.name] = f.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
      type: "function",
      function: {
        name: t.function.name || t.function.function.name,
        // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- Tool parameter schemas use the published open JSON Schema dictionary contract, including arbitrary extensions.
        parameters: t.function.parameters,
        description: t.function.description,
        strict: t.function.strict
      }
    } : (
      // oxlint-disable-next-line anti-slop/no-chained-type-assertions -- Preserve the existing non-function tool pass-through; runnable and wire schema interfaces have incompatible index signatures.
      t
    )) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false, false);
    }
    let allowBufferedToolCall = false;
    const runToolCall = async (toolCall) => {
      const bufferedToolCall = allowBufferedToolCall;
      allowBufferedToolCall = false;
      if (toolCall.type !== "function") {
        return { message: void 0, functionCalled: false };
      }
      const tool_call_id = toolCall.id;
      const { name, arguments: args } = toolCall.function;
      const fn = functionsByName[name];
      if (!fn) {
        const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
        return { message: { role, tool_call_id, content: content2 }, functionCalled: false };
      }
      if (singleFunctionToCall && singleFunctionToCall !== name) {
        const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
        return { message: { role, tool_call_id, content: content2 }, functionCalled: false };
      }
      let rawContent;
      if (isRunnableFunctionWithParse(fn)) {
        let parsed;
        try {
          parsed = await fn.parse(args);
        } catch (error) {
          if (this.controller.signal.aborted) {
            throw this._userAbortError();
          }
          const content2 = error instanceof Error ? error.message : String(error);
          return { message: { role, tool_call_id, content: content2 }, functionCalled: false };
        }
        if (this.controller.signal.aborted) {
          throw this._userAbortError();
        }
        try {
          rawContent = await fn.function(parsed, runner, toolContext);
        } catch (error) {
          if (this.controller.signal.aborted && Object.is(error, this.controller.signal.reason)) {
            throw this._userAbortError();
          }
          throw error;
        }
      } else {
        if (this.controller.signal.aborted && !bufferedToolCall) {
          throw this._userAbortError();
        }
        try {
          rawContent = await fn.function(args, runner, toolContext);
        } catch (error) {
          if (this.controller.signal.aborted && Object.is(error, this.controller.signal.reason)) {
            throw this._userAbortError();
          }
          throw error;
        }
      }
      const content = __classPrivateFieldGet(_a$1, _a$1, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(_a$1, rawContent);
      return { message: { role, tool_call_id, content }, functionCalled: true };
    };
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: this.messages.map(toRequestMessage)
      }, options2);
      allowBufferedToolCall = this.controller.signal.aborted && __classPrivateFieldGet(this, _AbstractChatCompletionRunner_completionArrivedBeforeAbort, "f");
      const message = (_b2 = chatCompletion.choices[0]) == null ? void 0 : _b2.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!((_c2 = message.tool_calls) == null ? void 0 : _c2.length)) {
        await runAfterCompletion(chatCompletion);
        return;
      }
      if (singleFunctionToCall || params.parallel_tool_calls === false) {
        for (const toolCall of message.tool_calls) {
          const result = await runToolCall(toolCall);
          if (result.message) {
            this._addMessage(result.message);
          }
          if (this.controller.signal.aborted) {
            throw this._userAbortError();
          }
          if (singleFunctionToCall && result.functionCalled) {
            await runAfterCompletion(chatCompletion);
            return;
          }
        }
      } else {
        const results = await Promise.allSettled(message.tool_calls.map(runToolCall));
        if (!this.controller.signal.aborted) {
          for (const result of results) {
            if (result.status === "rejected") {
              throw result.reason;
            }
          }
        }
        for (const result of results) {
          if (result.status === "fulfilled" && result.value.message) {
            this._addMessage(result.value.message);
          }
        }
        if (this.controller.signal.aborted) {
          throw this._userAbortError();
        }
      }
      await runAfterCompletion(chatCompletion);
    }
  }
}
_a$1 = AbstractChatCompletionRunner, _AbstractChatCompletionRunner_completionArrivedBeforeAbort = /* @__PURE__ */ new WeakMap(), _AbstractChatCompletionRunner_afterCompletionInvoked = /* @__PURE__ */ new WeakMap(), _AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const ret = {
        ...message,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, _AbstractChatCompletionRunner_getFinalFunctionToolCall = function _AbstractChatCompletionRunner_getFinalFunctionToolCall2() {
  var _a3;
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && ((_a3 = message == null ? void 0 : message.tool_calls) == null ? void 0 : _a3.length)) {
      for (let j = message.tool_calls.length - 1; j >= 0; j--) {
        const toolCall = message.tool_calls[j];
        if ((toolCall == null ? void 0 : toolCall.type) === "function") {
          return toolCall.function;
        }
      }
    }
  }
  return void 0;
}, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult = function _AbstractChatCompletionRunner_getFinalFunctionToolCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isToolMessage(message) && message.content != null && // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Chat history and tool-choice inputs can contain runtime variants that select different runner behavior.
    typeof message.content === "string" && this.messages.some((x) => {
      var _a3;
      return x.role === "assistant" && ((_a3 = x.tool_calls) == null ? void 0 : _a3.some((y) => y.type === "function" && y.id === message.tool_call_id));
    })) {
      return message.content;
    }
  }
  return void 0;
}, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, _AbstractChatCompletionRunner_throwIfAborted = function _AbstractChatCompletionRunner_throwIfAborted2() {
  if (this.controller.signal.aborted) {
    throw this._userAbortError();
  }
}, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  if (typeof rawContent === "string") {
    return rawContent;
  }
  if (rawContent === void 0) {
    return "undefined";
  }
  return JSON.stringify(rawContent);
};
class ChatCompletionRunner extends AbstractChatCompletionRunner {
  /** Starts a non-streaming tool loop and returns its event-driven conversation runner. */
  static runTools(client, params, options2) {
    const runner = new ChatCompletionRunner();
    const opts = {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "runTools" }
    };
    runner._run(() => runner._runTools(client, params, runner, opts));
    return runner;
  }
  /**
   * Appends a conversation message and emits text content for assistant replies.
   * @param normalizeContent Defaults to true; initial history passes false to preserve caller-owned messages.
   */
  _addMessage(message, emit2 = true, normalizeContent = true) {
    super._addMessage(message, emit2, normalizeContent);
    if (emit2 && isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
}
const STR = 1;
const NUM = 2;
const ARR = 4;
const OBJ = 8;
const NULL = 16;
const BOOL = 32;
const NAN = 64;
const INFINITY = 128;
const MINUS_INFINITY = 256;
const INF = INFINITY | MINUS_INFINITY;
const SPECIAL = NULL | BOOL | INF | NAN;
const ATOM = STR | NUM | SPECIAL;
const COLLECTION = ARR | OBJ;
const ALL = ATOM | COLLECTION;
const Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
class PartialJSON extends Error {
}
class MalformedJSON extends Error {
}
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
const _parseJSON = (jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = (msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };
  const throwMalformedError = (msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };
  const parseAny = () => {
    skipBlank();
    if (index >= length) {
      markPartialJSON("Unexpected end of input");
    }
    if (jsonString[index] === '"') {
      return parseStr();
    }
    if (jsonString[index] === "{") {
      return parseObj();
    }
    if (jsonString[index] === "[") {
      return parseArr();
    }
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && length - index > 1 && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return Number.NaN;
    }
    return parseNum();
  };
  const parseStr = () => {
    const start2 = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) === '"') {
      try {
        return JSON.parse(jsonString.substring(start2, ++index - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start2, index - Number(escape2)) + '"');
      } catch {
        return JSON.parse(jsonString.substring(start2, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  };
  const parseObj = () => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow) {
          return obj;
        }
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow) {
            return obj;
          }
          throw e;
        }
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch {
      if (Allow.OBJ & allow) {
        return obj;
      }
      markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  };
  const parseArr = () => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  };
  const parseNum = () => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow) {
        markPartialJSON("Not sure what '-' is");
      }
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if (jsonString[jsonString.length - 1] === ".") {
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            }
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch {
          }
        }
        throwMalformedError(String(e));
      }
    }
    const start2 = index;
    if (jsonString[index] === "-") {
      index++;
    }
    while (jsonString[index] && !",]}".includes(jsonString[index])) {
      index++;
    }
    if (index === length && !(Allow.NUM & allow)) {
      markPartialJSON("Unterminated number literal");
    }
    const number = jsonString.substring(start2, index);
    try {
      return JSON.parse(number);
    } catch {
      if (number === "-" && Allow.NUM & allow) {
        markPartialJSON("Not sure what '-' is");
      }
      try {
        return JSON.parse(number.substring(0, number.lastIndexOf("e")));
      } catch (e) {
        throwMalformedError(String(e));
      }
    }
  };
  const skipBlank = () => {
    while (index < length && " \n\r	".includes(jsonString[index])) {
      index++;
    }
  };
  return parseAny();
};
const partialParse = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);
var _ChatCompletionStream_instances, _ChatCompletionStream_params, _ChatCompletionStream_rejectsUnfinishedTurns, _ChatCompletionStream_audioDoneChoiceIndexes, _ChatCompletionStream_choiceEventStates, _ChatCompletionStream_currentChatCompletionSnapshot, _ChatCompletionStream_hasAutoParseableTool, _ChatCompletionStream_partialJSONParseBudget, _ChatCompletionStream_beginRequest, _ChatCompletionStream_getChoiceEventState, _ChatCompletionStream_addChunk, _ChatCompletionStream_emitToolCallDoneEvent, _ChatCompletionStream_emitContentDoneEvents, _ChatCompletionStream_validateStructuredSnapshots, _ChatCompletionStream_endRequest, _ChatCompletionStream_accumulateChatCompletion;
function parseStructuredStreamingJSON(content) {
  try {
    return partialParse(content);
  } catch (error) {
    if (error instanceof MalformedJSON || error instanceof SyntaxError) {
      return parseResponseFormatContent({ type: "json_schema", $parseRaw: void 0 }, content);
    }
    throw error;
  }
}
const CHAT_COMPLETION_READABLE_STREAM_MESSAGE_PREFIX = "chat.completion.chunk.message:";
function makeChatCompletionReadableStreamMessageChunk(chunk, message, toolCallIds) {
  const payload = {
    type: "message",
    message,
    // Spread creates an own data property without invoking inherited setters or changing the object prototype.
    ...toolCallIds ? { tool_call_ids: toolCallIds } : {}
  };
  return {
    id: chunk.id,
    choices: [],
    created: chunk.created,
    model: chunk.model,
    object: `${CHAT_COMPLETION_READABLE_STREAM_MESSAGE_PREFIX}${JSON.stringify(payload)}`
  };
}
function isChatCompletionReadableStreamMessage(item) {
  return "type" in item && item.type === "message" && "message" in item || "object" in item && typeof item.object === "string" && item.object.startsWith(CHAT_COMPLETION_READABLE_STREAM_MESSAGE_PREFIX);
}
function getChatCompletionReadableStreamMessage(item) {
  if ("type" in item) {
    return item;
  }
  return JSON.parse(item.object.slice(CHAT_COMPLETION_READABLE_STREAM_MESSAGE_PREFIX.length));
}
const MAX_STREAM_CHOICES = 128;
const MAX_STREAM_TOOL_CALLS = 128;
const MAX_PARTIAL_JSON_BYTES = 16 * 1024 * 1024;
const MAX_PARTIAL_JSON_FRAGMENTS = 65536;
const MAX_PARTIAL_JSON_DEPTH = 128;
const MAX_PARTIAL_JSON_PARSE_WORK = 64 * 1024 * 1024;
const EAGER_PARTIAL_JSON_BYTES = 1024;
function createPartialJSONParseState() {
  return {
    bytes: 0,
    depth: 0,
    fragments: 0,
    work: 0,
    escaped: false,
    has_non_whitespace: false,
    in_string: false,
    last_parsed_bytes: 0,
    pending_high_surrogate: false
  };
}
function recordPartialJSONFragment(state2, budget, fragment, validationWorkBudget) {
  if (budget.fragments >= MAX_PARTIAL_JSON_FRAGMENTS) {
    throw new OpenAIError("Chat completion stream exceeded its structured JSON fragment limit");
  }
  let bytes = 0;
  let { depth, escaped, has_non_whitespace: hasNonWhitespace, in_string: inString } = state2;
  let completed = false;
  let firstCharacter = true;
  for (const character of fragment) {
    const previousBytes = bytes;
    const codePoint = character.codePointAt(0);
    if (firstCharacter && state2.pending_high_surrogate && codePoint >= 56320 && codePoint <= 57343) {
      bytes += 1;
    } else if (codePoint <= 127) {
      bytes += 1;
    } else if (codePoint <= 2047) {
      bytes += 2;
    } else if (codePoint <= 65535) {
      bytes += 3;
    } else {
      bytes += 4;
    }
    firstCharacter = false;
    if (budget.bytes + bytes > MAX_PARTIAL_JSON_BYTES) {
      throw new OpenAIError("Chat completion stream exceeded its structured JSON byte limit");
    }
    if (validationWorkBudget && validationWorkBudget.work + bytes > MAX_PARTIAL_JSON_PARSE_WORK) {
      validationWorkBudget.work += previousBytes;
      throw new OpenAIError("Chat completion stream exceeded its structured JSON parse-work limit");
    }
    if (character !== " " && character !== "\n" && character !== "\r" && character !== "	") {
      hasNonWhitespace = true;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
        completed || (completed = depth === 0);
      }
      continue;
    }
    if (character === '"') {
      inString = true;
    } else if (character === "{" || character === "[") {
      depth += 1;
      if (depth > MAX_PARTIAL_JSON_DEPTH) {
        throw new OpenAIError("Chat completion stream exceeded its structured JSON nesting depth limit");
      }
    } else if ((character === "}" || character === "]") && depth > 0) {
      depth -= 1;
      completed || (completed = depth === 0);
    }
  }
  state2.bytes += bytes;
  state2.fragments += 1;
  state2.depth = depth;
  state2.escaped = escaped;
  state2.has_non_whitespace = hasNonWhitespace;
  state2.in_string = inString;
  if (fragment.length > 0) {
    const finalCodeUnit = fragment.codePointAt(fragment.length - 1) ?? 0;
    state2.pending_high_surrogate = finalCodeUnit >= 55296 && finalCodeUnit <= 56319;
  }
  budget.bytes += bytes;
  budget.fragments += 1;
  if (validationWorkBudget) {
    validationWorkBudget.work += bytes;
  }
  if (!hasNonWhitespace || bytes === 0) {
    return false;
  }
  const minimumGrowth = Math.max(EAGER_PARTIAL_JSON_BYTES, Math.floor(state2.last_parsed_bytes / 2));
  if (state2.bytes > EAGER_PARTIAL_JSON_BYTES && !completed && state2.bytes - state2.last_parsed_bytes < minimumGrowth) {
    return false;
  }
  return true;
}
function reservePartialJSONParse(state2, budget) {
  if (budget.work + state2.bytes > MAX_PARTIAL_JSON_PARSE_WORK) {
    return false;
  }
  budget.work += state2.bytes;
  state2.work += state2.bytes;
  state2.last_parsed_bytes = state2.bytes;
  return true;
}
function captureStructuredJSONSnapshot(snapshot, property) {
  const descriptor = Object.getOwnPropertyDescriptor(snapshot, property);
  if (!descriptor) {
    let prototype = Object.getPrototypeOf(snapshot);
    for (let depth = 0; prototype !== null; depth += 1) {
      if (depth >= MAX_PARTIAL_JSON_DEPTH || Object.getOwnPropertyDescriptor(prototype, property)) {
        throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return void 0;
  }
  if (!("value" in descriptor) || typeof descriptor.value !== "string" && descriptor.value !== null && descriptor.value !== void 0) {
    throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
  }
  return descriptor.value;
}
function captureStructuredMessageSnapshot(choice) {
  const descriptor = Object.getOwnPropertyDescriptor(choice, "message");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "object" || descriptor.value === null) {
    throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
  }
  return descriptor.value;
}
function captureSnapshotArray(snapshot, property, maximum, kind) {
  const descriptor = Object.getOwnPropertyDescriptor(snapshot, property);
  if (!descriptor) {
    let prototype = Object.getPrototypeOf(snapshot);
    for (let depth = 0; prototype !== null; depth += 1) {
      if (depth >= MAX_PARTIAL_JSON_DEPTH || Object.getOwnPropertyDescriptor(prototype, property)) {
        throw new OpenAIError(`Chat completion stream contains an unsafe snapshot ${kind} collection`);
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return void 0;
  }
  if (!("value" in descriptor) || !Array.isArray(descriptor.value)) {
    throw new OpenAIError(`Chat completion stream contains an unsafe snapshot ${kind} collection`);
  }
  const length = Object.getOwnPropertyDescriptor(descriptor.value, "length");
  if (!length || !("value" in length) || !Number.isSafeInteger(length.value) || length.value > maximum) {
    throw new OpenAIError(`Chat completion stream exceeded its snapshot ${kind} limit`);
  }
  return descriptor.value;
}
function captureSnapshotArrayItem(array, index) {
  const descriptor = Object.getOwnPropertyDescriptor(array, index);
  if (!descriptor) {
    return void 0;
  }
  if (!("value" in descriptor)) {
    throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
  }
  return descriptor.value;
}
function mapCapturedSnapshotArray(array, maximum, kind, map) {
  const descriptor = Object.getOwnPropertyDescriptor(array, "length");
  const length = descriptor && "value" in descriptor ? descriptor.value : void 0;
  if (typeof length !== "number" || !Number.isSafeInteger(length) || length < 0 || length > maximum) {
    throw new OpenAIError(`Chat completion stream exceeded its snapshot ${kind} limit`);
  }
  const mapped = [];
  mapped.length = length;
  for (let index = 0; index < length; index += 1) {
    const item = Object.getOwnPropertyDescriptor(array, index);
    if (!item) {
      continue;
    }
    if (!("value" in item)) {
      throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
    }
    mapped[index] = map(item.value, index);
  }
  return mapped;
}
function validateStructuredJSONSnapshot(value, budget, validationWorkBudget) {
  const state2 = createPartialJSONParseState();
  const parseBudget = budget ?? { bytes: 0, fragments: 0, work: 0 };
  recordPartialJSONFragment(state2, parseBudget, value, validationWorkBudget);
  if (!reservePartialJSONParse(state2, parseBudget)) {
    throw new OpenAIError("Chat completion stream exceeded its structured JSON parse-work limit");
  }
  return value;
}
function ownFunctionToolIdentity(toolCall) {
  const type = Object.getOwnPropertyDescriptor(toolCall, "type");
  const fn = Object.getOwnPropertyDescriptor(toolCall, "function");
  if (!type || !("value" in type) || type.value !== "function" || !fn || !("value" in fn)) {
    return void 0;
  }
  if (typeof fn.value !== "object" || fn.value === null) {
    return void 0;
  }
  const name = Object.getOwnPropertyDescriptor(fn.value, "name");
  if (!name || !("value" in name) || typeof name.value !== "string" || name.value.length === 0) {
    return void 0;
  }
  return { type: "function", name: name.value };
}
function assertBoundToolCallIdentity(toolCall, identity) {
  const current = ownFunctionToolIdentity(toolCall);
  if (!current || current.name !== identity.name || current.type !== identity.type) {
    throw new OpenAIError("Chat completion stream contains a changed tool call identity");
  }
}
function assignOwnProperties(target, source) {
  if (Object.prototype.propertyIsEnumerable.call(source, "__proto__") && !hasOwn(target, "__proto__")) {
    Object.defineProperty(target, "__proto__", {
      value: void 0,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  return Object.assign(target, source);
}
function cloneParserConfigObject(value, stableFields = []) {
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const field of stableFields) {
    const descriptor = descriptors[field];
    if (!descriptor && !(field in value)) {
      continue;
    }
    descriptors[field] = {
      // oxlint-disable-next-line anti-slop/no-reflect-get -- Generic config cloning must resolve inherited/accessor keys outside the declared config shape.
      value: descriptor && "value" in descriptor ? descriptor.value : Reflect.get(value, field, value),
      enumerable: (descriptor == null ? void 0 : descriptor.enumerable) ?? false,
      configurable: (descriptor == null ? void 0 : descriptor.configurable) ?? true,
      writable: descriptor && "writable" in descriptor ? descriptor.writable : false
    };
  }
  return Object.create(Object.getPrototypeOf(value), descriptors);
}
function snapshotChatCompletionParserParams(params) {
  const snapshot = cloneParserConfigObject(params);
  if (params.tools) {
    const stableTools = [];
    const lengthDescriptor = Object.getOwnPropertyDescriptor(params.tools, "length");
    const length = lengthDescriptor && "value" in lengthDescriptor ? lengthDescriptor.value : void 0;
    const toolCount = typeof length === "number" && Number.isSafeInteger(length) && length >= 0 ? Math.min(length, MAX_STREAM_TOOL_CALLS) : 0;
    for (let index = 0; index < toolCount; index += 1) {
      const item = Object.getOwnPropertyDescriptor(params.tools, String(index));
      if (!item || !("value" in item)) {
        stableTools.length = index + 1;
        continue;
      }
      const tool = item.value;
      const stableTool = cloneParserConfigObject(tool, [
        "type",
        "$brand",
        "$parseRaw",
        "$callback",
        "function"
      ]);
      const descriptors = Object.getOwnPropertyDescriptors(stableTool);
      if (isChatCompletionFunctionTool(stableTool)) {
        const descriptor = descriptors.function;
        descriptors.function = {
          ...descriptor && "value" in descriptor ? descriptor : { configurable: true, enumerable: true, writable: true },
          value: cloneParserConfigObject(stableTool.function, ["name", "strict"])
        };
      }
      stableTools[index] = Object.create(Object.getPrototypeOf(tool), descriptors);
    }
    snapshot.tools = stableTools;
  }
  if (params.response_format) {
    snapshot.response_format = cloneParserConfigObject(params.response_format, [
      "type",
      "$brand",
      "$parseRaw"
    ]);
  }
  return snapshot;
}
const MAX_SERIALIZED_PARSER_SCHEMA_NODES = 4096;
const stringifyParserSchemaValue = JSON.stringify;
const MAX_SERIALIZED_PARSER_SCHEMA_BYTES = 1024 * 1024;
const MAX_SERIALIZED_PARSER_SCHEMA_DEPTH = 64;
const OMITTED_SERIALIZED_PARSER_VALUE = Symbol("omitted serialized parser value");
const UNSAFE_SERIALIZED_PARSER_VALUE = Symbol("unsafe serialized parser value");
function canonicalSerializedParserSchema(value, budget) {
  const ancestors = /* @__PURE__ */ new WeakSet();
  const charge = (bytes) => {
    if (!Number.isSafeInteger(bytes) || bytes < 0 || budget.bytes + bytes > MAX_SERIALIZED_PARSER_SCHEMA_BYTES) {
      return false;
    }
    budget.bytes += bytes;
    return true;
  };
  const visit = (current, depth) => {
    if (depth > MAX_SERIALIZED_PARSER_SCHEMA_DEPTH || budget.nodes >= MAX_SERIALIZED_PARSER_SCHEMA_NODES) {
      return UNSAFE_SERIALIZED_PARSER_VALUE;
    }
    budget.nodes += 1;
    if (current === void 0 || typeof current === "function" || typeof current === "symbol") {
      return OMITTED_SERIALIZED_PARSER_VALUE;
    }
    if (typeof current === "bigint") {
      return UNSAFE_SERIALIZED_PARSER_VALUE;
    }
    if (current === null || typeof current === "boolean" || typeof current === "number") {
      const serialized = stringifyParserSchemaValue(current);
      return typeof serialized === "string" && charge(serialized.length) ? serialized : UNSAFE_SERIALIZED_PARSER_VALUE;
    }
    if (typeof current === "string") {
      if (!charge(current.length * 6 + 2)) {
        return UNSAFE_SERIALIZED_PARSER_VALUE;
      }
      return stringifyParserSchemaValue(current);
    }
    if (typeof current !== "object" || ancestors.has(current)) {
      return UNSAFE_SERIALIZED_PARSER_VALUE;
    }
    const array = Array.isArray(current);
    const prototype = Object.getPrototypeOf(current);
    if (array && prototype !== Array.prototype || !array && prototype !== null && prototype !== Object.prototype) {
      return UNSAFE_SERIALIZED_PARSER_VALUE;
    }
    for (let owner = current; owner !== null; owner = Object.getPrototypeOf(owner)) {
      const serializer = Object.getOwnPropertyDescriptor(owner, "toJSON");
      if (!serializer) {
        continue;
      }
      if (!("value" in serializer) || typeof serializer.value === "function") {
        return UNSAFE_SERIALIZED_PARSER_VALUE;
      }
      break;
    }
    ancestors.add(current);
    try {
      if (!charge(2)) {
        return UNSAFE_SERIALIZED_PARSER_VALUE;
      }
      if (array) {
        const lengthDescriptor = Object.getOwnPropertyDescriptor(current, "length");
        const length = lengthDescriptor && "value" in lengthDescriptor ? lengthDescriptor.value : void 0;
        if (typeof length !== "number" || !Number.isSafeInteger(length) || length < 0 || length > MAX_SERIALIZED_PARSER_SCHEMA_NODES - budget.nodes) {
          return UNSAFE_SERIALIZED_PARSER_VALUE;
        }
        const items = [];
        for (let index = 0; index < length; index += 1) {
          const key = String(index);
          const descriptor = Object.getOwnPropertyDescriptor(current, key);
          if (!descriptor) {
            if (Object.getOwnPropertyDescriptor(Array.prototype, key) || Object.getOwnPropertyDescriptor(Object.prototype, key)) {
              return UNSAFE_SERIALIZED_PARSER_VALUE;
            }
            budget.nodes += 1;
            if (!charge(4)) {
              return UNSAFE_SERIALIZED_PARSER_VALUE;
            }
            items.push("null");
            continue;
          }
          if (!("value" in descriptor)) {
            return UNSAFE_SERIALIZED_PARSER_VALUE;
          }
          const item = visit(descriptor.value, depth + 1);
          if (item === UNSAFE_SERIALIZED_PARSER_VALUE) {
            return item;
          }
          items.push(item === OMITTED_SERIALIZED_PARSER_VALUE ? "null" : item);
        }
        return `[${items.join(",")}]`;
      }
      const keys = Reflect.ownKeys(current);
      if (keys.length > MAX_SERIALIZED_PARSER_SCHEMA_NODES - budget.nodes) {
        return UNSAFE_SERIALIZED_PARSER_VALUE;
      }
      const entries = [];
      for (const key of keys) {
        if (typeof key !== "string") {
          continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor) {
          return UNSAFE_SERIALIZED_PARSER_VALUE;
        }
        if (!descriptor.enumerable) {
          continue;
        }
        if (!("value" in descriptor)) {
          return UNSAFE_SERIALIZED_PARSER_VALUE;
        }
        entries.push([key, descriptor.value]);
      }
      entries.sort(([left], [right]) => {
        if (left === right) {
          return 0;
        }
        return left < right ? -1 : 1;
      });
      const fields = [];
      for (const [key, entry] of entries) {
        const normalized = visit(entry, depth + 1);
        if (normalized === UNSAFE_SERIALIZED_PARSER_VALUE) {
          return normalized;
        }
        if (normalized === OMITTED_SERIALIZED_PARSER_VALUE) {
          continue;
        }
        if (!charge(key.length * 6 + 3)) {
          return UNSAFE_SERIALIZED_PARSER_VALUE;
        }
        fields.push(`${stringifyParserSchemaValue(key)}:${normalized}`);
      }
      return `{${fields.join(",")}}`;
    } finally {
      ancestors.delete(current);
    }
  };
  try {
    const normalized = visit(value, 0);
    return typeof normalized === "string" ? normalized : void 0;
  } catch {
    return void 0;
  }
}
function rememberSerializedParserSchema(signatures, source, holder, key) {
  const parser = Object.getOwnPropertyDescriptor(source, "$parseRaw");
  const schema = Object.getOwnPropertyDescriptor(holder, key);
  if (!parser || !("value" in parser) || typeof parser.value !== "function" || !schema || !("value" in schema)) {
    return;
  }
  const normalized = canonicalSerializedParserSchema(schema.value, { nodes: 0, bytes: 0 });
  if (normalized !== void 0) {
    signatures.set(source, normalized);
  }
}
function hasMatchingSerializedParserSchema(signatures, source, holder, key, value) {
  const expected = source && signatures.get(source);
  const descriptor = Object.getOwnPropertyDescriptor(holder, key);
  return expected !== void 0 && descriptor !== void 0 && "value" in descriptor && canonicalSerializedParserSchema(value, { nodes: 0, bytes: 0 }) === expected;
}
function serializedParserDescriptor(descriptor, value) {
  return descriptor && "value" in descriptor ? { ...descriptor, value } : { configurable: true, enumerable: true, writable: true, value };
}
function shadowSerializedParserMetadata(descriptors, source, fields) {
  for (const field of fields) {
    const descriptor = descriptors[field];
    if (!descriptor && !(field in source)) {
      continue;
    }
    descriptors[field] = descriptor && "value" in descriptor ? { ...descriptor, value: void 0 } : {
      configurable: (descriptor == null ? void 0 : descriptor.configurable) ?? true,
      enumerable: (descriptor == null ? void 0 : descriptor.enumerable) ?? false,
      writable: false,
      value: void 0
    };
  }
}
function snapshotSerializedParserTool(serialized) {
  const source = serialized.source ?? {
    type: serialized.type,
    ...serialized.type === "function" ? { function: {} } : {}
  };
  const descriptors = Object.getOwnPropertyDescriptors(source);
  descriptors.type = serializedParserDescriptor(descriptors.type, serialized.type);
  if (serialized.type !== "function" || !serialized.function) {
    if (descriptors.function) {
      descriptors.function = serializedParserDescriptor(descriptors.function, void 0);
    }
    shadowSerializedParserMetadata(descriptors, source, ["$brand", "$parseRaw", "$callback"]);
    return Object.create(Object.getPrototypeOf(source), descriptors);
  }
  const descriptor = descriptors.function;
  const original = descriptor && "value" in descriptor && typeof descriptor.value === "object" && descriptor.value !== null ? descriptor.value : {};
  const functionDescriptors = Object.getOwnPropertyDescriptors(original);
  functionDescriptors["name"] = serializedParserDescriptor(functionDescriptors["name"], serialized.function.name);
  functionDescriptors["strict"] = serializedParserDescriptor(functionDescriptors["strict"], serialized.function.strict);
  descriptors.function = serializedParserDescriptor(descriptor, Object.create(Object.getPrototypeOf(original), functionDescriptors));
  if (!serialized.function.schemaMatches) {
    shadowSerializedParserMetadata(descriptors, source, ["$brand", "$parseRaw", "$callback"]);
  }
  return Object.create(Object.getPrototypeOf(source), descriptors);
}
function snapshotSerializedResponseFormat(serialized) {
  const source = serialized.source ?? { type: serialized.type };
  const descriptors = Object.getOwnPropertyDescriptors(source);
  descriptors.type = serializedParserDescriptor(descriptors.type, serialized.type);
  if (serialized.type !== "json_schema" || !serialized.source || !serialized.schemaMatches) {
    shadowSerializedParserMetadata(descriptors, source, ["$brand", "$parseRaw"]);
  }
  return Object.create(Object.getPrototypeOf(source), descriptors);
}
function ownSerializedParserObject(holder, key) {
  const descriptor = Object.getOwnPropertyDescriptor(holder, key);
  if (!descriptor || !("value" in descriptor)) {
    return void 0;
  }
  const { value } = descriptor;
  return typeof value === "object" && value !== null ? value : void 0;
}
function observeSerializedChatCompletionParserParams(body, initial, update) {
  var _a3;
  const originalToolOwners = /* @__PURE__ */ new WeakMap();
  const originalSchemaSignatures = /* @__PURE__ */ new WeakMap();
  if (body.tools) {
    for (let index = 0; index < body.tools.length && index < MAX_STREAM_TOOL_CALLS; index += 1) {
      const owner = ownSerializedParserObject(body.tools, String(index));
      const source = (_a3 = initial.tools) == null ? void 0 : _a3[index];
      if (owner && source) {
        originalToolOwners.set(owner, source);
        const originalFunction = ownSerializedParserObject(source, "function");
        if (originalFunction) {
          rememberSerializedParserSchema(originalSchemaSignatures, source, originalFunction, "parameters");
        }
      }
    }
  }
  if (initial.response_format) {
    rememberSerializedParserSchema(originalSchemaSignatures, initial.response_format, initial.response_format, "json_schema");
  }
  let root;
  let tools;
  let responseFormat;
  let responseFrame;
  let frames = [];
  let toolFrames = /* @__PURE__ */ new WeakMap();
  let actualToolOwners = /* @__PURE__ */ new Map();
  let functionFrames = /* @__PURE__ */ new WeakMap();
  return observeJSONRequestBody(body, {
    value(holder, key, value) {
      if (!root && key === "" && typeof value === "object" && value !== null) {
        root = value;
        tools = void 0;
        responseFormat = void 0;
        responseFrame = void 0;
        frames = [];
        toolFrames = /* @__PURE__ */ new WeakMap();
        actualToolOwners = /* @__PURE__ */ new Map();
        functionFrames = /* @__PURE__ */ new WeakMap();
        return;
      }
      if (holder === root && key === "response_format") {
        if (typeof value === "object" && value !== null) {
          responseFormat = value;
          const owner = ownSerializedParserObject(holder, key);
          responseFrame = {
            source: owner === body.response_format ? initial.response_format : void 0,
            schemaMatches: false
          };
        }
        return;
      }
      if (holder === root && key === "tools") {
        if (Array.isArray(value)) {
          tools = new Proxy(value, {
            get(target, property) {
              const actual = Reflect.get(target, property, target);
              if (typeof property === "string") {
                const index = Number(property);
                if (Number.isSafeInteger(index) && index >= 0 && index < MAX_STREAM_TOOL_CALLS && String(index) === property) {
                  actualToolOwners.set(index, typeof actual === "object" && actual !== null ? actual : void 0);
                }
              }
              return actual;
            }
          });
          return tools;
        }
        return;
      }
      if (holder === tools) {
        const index = Number(key);
        if (!Number.isSafeInteger(index) || index < 0 || index >= MAX_STREAM_TOOL_CALLS || typeof value !== "object" || value === null) {
          return;
        }
        const owner = actualToolOwners.get(index);
        const source = owner ? originalToolOwners.get(owner) : void 0;
        const frame = { source };
        frames[index] = frame;
        toolFrames.set(value, frame);
        return;
      }
      const tool = toolFrames.get(holder);
      if (tool) {
        if (key === "type" && typeof value === "string") {
          tool.type = value;
        } else if (key === "function" && typeof value === "object" && value !== null) {
          const fn2 = { source: tool.source, schemaMatches: false };
          tool.function = fn2;
          functionFrames.set(value, fn2);
        }
        return;
      }
      if (holder === responseFormat && responseFrame) {
        if (key === "type" && typeof value === "string") {
          responseFrame.type = value;
        } else if (key === "json_schema") {
          responseFrame.schemaMatches = hasMatchingSerializedParserSchema(originalSchemaSignatures, responseFrame.source, holder, key, value);
        }
        return;
      }
      const fn = functionFrames.get(holder);
      if (fn) {
        if (key === "name" && typeof value === "string") {
          fn.name = value;
        } else if (key === "strict" && typeof value === "boolean") {
          fn.strict = value;
        } else if (key === "parameters") {
          fn.schemaMatches = hasMatchingSerializedParserSchema(originalSchemaSignatures, fn.source, holder, key, value);
        }
      }
      return void 0;
    },
    complete() {
      if (!root) {
        return;
      }
      const snapshot = cloneParserConfigObject(initial);
      if (tools) {
        const serializedTools = [];
        for (let index = 0; index < frames.length; index += 1) {
          const frame = frames[index];
          if (frame) {
            serializedTools[index] = snapshotSerializedParserTool(frame);
          }
        }
        snapshot.tools = serializedTools;
      } else {
        delete snapshot.tools;
      }
      if (responseFrame) {
        snapshot.response_format = snapshotSerializedResponseFormat(responseFrame);
      } else {
        delete snapshot.response_format;
      }
      update(snapshot);
      root = void 0;
      tools = void 0;
      responseFormat = void 0;
      responseFrame = void 0;
      frames = [];
      toolFrames = /* @__PURE__ */ new WeakMap();
      actualToolOwners = /* @__PURE__ */ new Map();
      functionFrames = /* @__PURE__ */ new WeakMap();
    }
  });
}
class ChatCompletionStream extends AbstractChatCompletionRunner {
  /** Creates an unstarted stream, retaining request parameters for structured-output parsing. */
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_rejectsUnfinishedTurns.set(this, false);
    _ChatCompletionStream_audioDoneChoiceIndexes.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    _ChatCompletionStream_hasAutoParseableTool.set(this, void 0);
    _ChatCompletionStream_partialJSONParseBudget.set(this, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_params, params);
    __classPrivateFieldSet(this, _ChatCompletionStream_audioDoneChoiceIndexes, /* @__PURE__ */ new Set());
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, []);
    __classPrivateFieldSet(this, _ChatCompletionStream_hasAutoParseableTool, false);
    const tools = params == null ? void 0 : params.tools;
    const lengthDescriptor = tools && Object.getOwnPropertyDescriptor(tools, "length");
    const length = lengthDescriptor && "value" in lengthDescriptor ? lengthDescriptor.value : void 0;
    if (tools && typeof length === "number" && Number.isSafeInteger(length) && length >= 0) {
      for (let index = 0; index < Math.min(length, MAX_STREAM_TOOL_CALLS); index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(tools, String(index));
        if (!descriptor || !("value" in descriptor)) {
          continue;
        }
        const tool = descriptor.value;
        if (isChatCompletionFunctionTool(tool) && (isAutoParsableTool$1(tool) || tool.function.strict === true)) {
          __classPrivateFieldSet(this, _ChatCompletionStream_hasAutoParseableTool, true);
          break;
        }
      }
    }
    __classPrivateFieldSet(this, _ChatCompletionStream_partialJSONParseBudget, { bytes: 0, fragments: 0, work: 0 });
  }
  /** The latest accumulated completion, or `undefined` before a chunk arrives or after finalization. */
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Original input messages are not included in the serialized stream. Tool-result
   * messages explicitly serialized by a streaming tool runner are replayed.
   */
  static fromReadableStream(stream2) {
    const runner = new ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream2));
    return runner;
  }
  /** Starts a streaming chat completion request and returns its event-driven helper. */
  static createChatCompletion(client, params, options2) {
    const runner = new ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options2, __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "stream" } }));
    return runner;
  }
  /** Rejects unfinished turns before tool callbacks while preserving ordinary stream and replay behavior. */
  _runTools(client, params, runner, options2) {
    __classPrivateFieldSet(this, _ChatCompletionStream_rejectsUnfinishedTurns, true);
    return super._runTools(client, params, runner, options2);
  }
  async _createChatCompletion(client, params, options2) {
    var _a3, _b2;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    const requestParams = { ...params, stream: true };
    __classPrivateFieldSet(this, _ChatCompletionStream_params, requestParams);
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const parserParams = snapshotChatCompletionParserParams(requestParams);
    __classPrivateFieldSet(this, _ChatCompletionStream_params, parserParams);
    __classPrivateFieldSet(this, _ChatCompletionStream_hasAutoParseableTool, ((_a3 = parserParams.tools) == null ? void 0 : _a3.some((tool) => isChatCompletionFunctionTool(tool) && (isAutoParsableTool$1(tool) || tool.function.strict === true))) ?? false);
    const stopObserving = requestParams.tools || requestParams.response_format ? observeSerializedChatCompletionParserParams(requestParams, parserParams, (serialized) => {
      var _a4;
      __classPrivateFieldSet(this, _ChatCompletionStream_params, serialized);
      __classPrivateFieldSet(this, _ChatCompletionStream_hasAutoParseableTool, ((_a4 = serialized.tools) == null ? void 0 : _a4.some((tool) => isChatCompletionFunctionTool(tool) && (isAutoParsableTool$1(tool) || tool.function.strict === true))) ?? false);
    }) : void 0;
    const stream2 = await client.chat.completions.create(requestParams, {
      ...options2,
      signal: this.controller.signal
    }).finally(stopObserving);
    this._connected();
    for await (const chunk of stream2) {
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if ((_b2 = stream2.controller.signal) == null ? void 0 : _b2.aborted) {
      throw this._userAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options2) {
    var _a3, _b2, _c2;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream2 = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const item of stream2) {
      if ("error" in item && hasOwn(item, "error") && typeof item.error === "object" && item.error !== null) {
        throw new APIError(void 0, item.error, void 0, void 0);
      }
      if (isChatCompletionReadableStreamMessage(item)) {
        const message = getChatCompletionReadableStreamMessage(item);
        if (__classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f")) {
          const toolCalls = (_a3 = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f").choices[0]) == null ? void 0 : _a3.message.tool_calls;
          for (const [index, id] of ((_b2 = message.tool_call_ids) == null ? void 0 : _b2.entries()) ?? []) {
            const toolCall = toolCalls == null ? void 0 : toolCalls[index];
            if (toolCall && id) {
              toolCall.id = id;
            }
          }
          this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
          chatId = void 0;
        }
        this._addMessage(message.message);
        continue;
      }
      const chunk = item;
      if (chatId && chunk.id && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      if (chunk.id) {
        chatId = chunk.id;
      }
    }
    if ((_c2 = stream2.controller.signal) == null ? void 0 : _c2.aborted) {
      throw this._userAbortError();
    }
    if (__classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f")) {
      return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
    }
    const lastChatCompletion = this._chatCompletions[this._chatCompletions.length - 1];
    if (lastChatCompletion) {
      return lastChatCompletion;
    }
    throw new OpenAIError(`request ended without sending any chunks`);
  }
  /** Iterates over raw API chunks; stopping iteration early aborts the underlying request. */
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_rejectsUnfinishedTurns = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_audioDoneChoiceIndexes = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_hasAutoParseableTool = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_partialJSONParseBudget = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
    if (this.ended) {
      return;
    }
    __classPrivateFieldSet(this, _ChatCompletionStream_audioDoneChoiceIndexes, /* @__PURE__ */ new Set());
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_partialJSONParseBudget, { bytes: 0, fragments: 0, work: 0 });
  }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state2 = __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state2) {
      return state2;
    }
    state2 = {
      content_done: false,
      content_parse_state: void 0,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null,
      tool_call_parse_states: /* @__PURE__ */ new Map(),
      tool_call_identities: /* @__PURE__ */ new Map()
    };
    __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state2;
    return state2;
  }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h;
    if (this.ended) {
      return;
    }
    const capturedChoiceFrames = /* @__PURE__ */ new WeakMap();
    const completion = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk, capturedChoiceFrames);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const capturedChoice = capturedChoiceFrames.get(choice);
      const choiceSnapshot = completion.choices[(capturedChoice == null ? void 0 : capturedChoice.index) ?? choice.index];
      const capturedToolCalls = (capturedChoice == null ? void 0 : capturedChoice.tool_calls) ?? [];
      const { delta } = choice;
      const structuredResponse = isParseableResponseFormat((_a3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _a3.response_format);
      const boundedSnapshot = structuredResponse || __classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f");
      const messageSnapshot = boundedSnapshot ? captureStructuredMessageSnapshot(choiceSnapshot) : choiceSnapshot.message;
      const refusal = boundedSnapshot ? captureStructuredJSONSnapshot(messageSnapshot, "refusal") : messageSnapshot.refusal;
      const parseableContent = !refusal && structuredResponse;
      const messageContent = parseableContent ? captureStructuredJSONSnapshot(messageSnapshot, "content") : messageSnapshot.content;
      if ((delta == null ? void 0 : delta.content) != null && messageSnapshot.role === "assistant" && messageContent) {
        this._emit("content", delta.content, messageContent);
        this._emit("content.delta", {
          delta: delta.content,
          snapshot: messageContent,
          parsed: messageSnapshot.parsed
        });
      }
      if ((delta == null ? void 0 : delta.refusal) != null && messageSnapshot.role === "assistant" && refusal) {
        this._emit("refusal.delta", {
          delta: delta.refusal,
          snapshot: refusal
        });
      }
      if (((_b2 = choice.logprobs) == null ? void 0 : _b2.content) != null && messageSnapshot.role === "assistant") {
        this._emit("logprobs.content.delta", {
          content: (_c2 = choice.logprobs) == null ? void 0 : _c2.content,
          snapshot: ((_d2 = choiceSnapshot.logprobs) == null ? void 0 : _d2.content) ?? []
        });
      }
      if (((_e2 = choice.logprobs) == null ? void 0 : _e2.refusal) != null && messageSnapshot.role === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: (_f2 = choice.logprobs) == null ? void 0 : _f2.refusal,
          snapshot: ((_g2 = choiceSnapshot.logprobs) == null ? void 0 : _g2.refusal) ?? []
        });
      }
      const state2 = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state2.current_tool_call_index != null) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state2.current_tool_call_index);
        }
      }
      for (const toolCall of capturedToolCalls) {
        if (state2.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state2.current_tool_call_index != null) {
            __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state2.current_tool_call_index);
          }
        }
        state2.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of capturedToolCalls) {
        const toolCallSnapshot = (_h = messageSnapshot.tool_calls) == null ? void 0 : _h[toolCallDelta.index];
        if (!(toolCallSnapshot == null ? void 0 : toolCallSnapshot.type)) {
          continue;
        }
        if (toolCallSnapshot.type === "function") {
          const boundIdentity = state2.tool_call_identities.get(toolCallDelta.index);
          let argumentsSnapshot;
          if (boundIdentity == null ? void 0 : boundIdentity.parseable) {
            const capturedArguments = captureStructuredJSONSnapshot(toolCallSnapshot.function, "arguments");
            if (typeof capturedArguments !== "string") {
              throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
            }
            argumentsSnapshot = capturedArguments;
          } else {
            argumentsSnapshot = toolCallSnapshot.function.arguments;
          }
          this._emit("tool_calls.function.arguments.delta", {
            name: toolCallSnapshot.function.name,
            index: toolCallDelta.index,
            arguments: argumentsSnapshot,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: toolCallDelta.arguments_delta
          });
        } else if (toolCallSnapshot.type !== "custom") ;
      }
    }
  }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    var _a3, _b2, _c2;
    const state2 = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state2.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const messageSnapshot = __classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f") ? captureStructuredMessageSnapshot(choiceSnapshot) : choiceSnapshot.message;
    const toolCallSnapshot = (_a3 = messageSnapshot.tool_calls) == null ? void 0 : _a3[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    const boundIdentity = state2.tool_call_identities.get(toolCallIndex);
    if (boundIdentity) {
      assertBoundToolCallIdentity(toolCallSnapshot, boundIdentity);
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = (_c2 = (_b2 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _b2.tools) == null ? void 0 : _c2.find((tool) => isChatCompletionFunctionTool(tool) && tool.function.name === toolCallSnapshot.function.name);
      let parsedArguments = null;
      const parseable = isAutoParsableTool$1(inputTool) || (inputTool == null ? void 0 : inputTool.function.strict) === true;
      let argumentsSnapshot;
      if (parseable) {
        if (__classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f")) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_validateStructuredSnapshots).call(this, __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f"));
        }
        const capturedArguments = captureStructuredJSONSnapshot(toolCallSnapshot.function, "arguments");
        if (typeof capturedArguments !== "string") {
          throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
        }
        argumentsSnapshot = capturedArguments;
      } else {
        argumentsSnapshot = toolCallSnapshot.function.arguments;
      }
      if (isAutoParsableTool$1(inputTool)) {
        parsedArguments = inputTool.$parseRaw(validateStructuredJSONSnapshot(argumentsSnapshot));
      } else if (inputTool == null ? void 0 : inputTool.function.strict) {
        parsedArguments = parseResponseFormatContent({ type: "json_schema", $parseRaw: void 0 }, validateStructuredJSONSnapshot(argumentsSnapshot));
      }
      if (choiceSnapshot.finish_reason) {
        state2.done_tool_calls.add(toolCallIndex);
      }
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: argumentsSnapshot,
        parsed_arguments: parsedArguments
      });
    } else if (toolCallSnapshot.type !== "custom") ;
  }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    var _a3, _b2, _c2, _d2, _e2;
    const state2 = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    const structuredResponse = isParseableResponseFormat((_a3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _a3.response_format);
    const boundedSnapshot = structuredResponse || __classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f");
    const messageSnapshot = boundedSnapshot ? captureStructuredMessageSnapshot(choiceSnapshot) : choiceSnapshot.message;
    const refusal = boundedSnapshot ? captureStructuredJSONSnapshot(messageSnapshot, "refusal") : messageSnapshot.refusal;
    const parseableContent = !refusal && structuredResponse;
    const content = parseableContent ? captureStructuredJSONSnapshot(messageSnapshot, "content") : messageSnapshot.content;
    if (content != null && (content !== "" || !refusal && !((_b2 = messageSnapshot.tool_calls) == null ? void 0 : _b2.length) && !messageSnapshot.function_call) && !state2.content_done) {
      if (parseableContent && __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f")) {
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_validateStructuredSnapshots).call(this, __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f"));
      }
      state2.content_done = true;
      this._emit("content.done", {
        content,
        parsed: refusal ? null : parseResponseFormatContent((_c2 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _c2.response_format, parseableContent ? validateStructuredJSONSnapshot(content) : content)
      });
    }
    if (refusal && !state2.refusal_done) {
      state2.refusal_done = true;
      this._emit("refusal.done", { refusal });
    }
    if (((_d2 = choiceSnapshot.logprobs) == null ? void 0 : _d2.content) && !state2.logprobs_content_done) {
      state2.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (((_e2 = choiceSnapshot.logprobs) == null ? void 0 : _e2.refusal) && !state2.logprobs_refusal_done) {
      state2.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, _ChatCompletionStream_validateStructuredSnapshots = function _ChatCompletionStream_validateStructuredSnapshots2(snapshot) {
    var _a3;
    const finalJSONBudget = { bytes: 0, fragments: 0, work: 0 };
    const parseableContent = isParseableResponseFormat((_a3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _a3.response_format);
    const validatedMessages = /* @__PURE__ */ new WeakMap();
    const choices = captureSnapshotArray(snapshot, "choices", MAX_STREAM_CHOICES, "choice");
    if (!choices) {
      throw new OpenAIError("Chat completion stream contains an unsafe snapshot choice collection");
    }
    for (let choiceIndex = 0; choiceIndex < choices.length; choiceIndex += 1) {
      const choice = captureSnapshotArrayItem(choices, choiceIndex);
      if (!choice) {
        continue;
      }
      const message = captureStructuredMessageSnapshot(choice);
      const refusal = captureStructuredJSONSnapshot(message, "refusal");
      const content = captureStructuredJSONSnapshot(message, "content");
      const validatedTools = /* @__PURE__ */ new Map();
      const toolCalls = captureSnapshotArray(message, "tool_calls", MAX_STREAM_TOOL_CALLS, "tool-call");
      validatedMessages.set(choice, Object.freeze({
        message,
        content,
        refusal,
        toolCallCollection: toolCalls,
        toolCalls: validatedTools
      }));
      const state2 = __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
      if (parseableContent && !refusal && typeof content === "string") {
        validateStructuredJSONSnapshot(content, finalJSONBudget, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"));
      }
      for (const [index, identity] of (state2 == null ? void 0 : state2.tool_call_identities) ?? []) {
        const toolCall = toolCalls && captureSnapshotArrayItem(toolCalls, index);
        if (!toolCall) {
          throw new OpenAIError("Chat completion stream contains a changed tool call identity");
        }
        assertBoundToolCallIdentity(toolCall, identity);
      }
      if (!__classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f")) {
        continue;
      }
      for (let toolCallIndex = 0; toolCallIndex < ((toolCalls == null ? void 0 : toolCalls.length) ?? 0); toolCallIndex += 1) {
        const toolCall = captureSnapshotArrayItem(toolCalls, toolCallIndex);
        if (!toolCall) {
          continue;
        }
        const identity = ownFunctionToolIdentity(toolCall);
        if (!identity) {
          const type = Object.getOwnPropertyDescriptor(toolCall, "type");
          if (type && !("value" in type)) {
            throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
          }
          if ((type == null ? void 0 : type.value) !== "function") {
            continue;
          }
          const fn2 = Object.getOwnPropertyDescriptor(toolCall, "function");
          if (fn2 && !("value" in fn2)) {
            throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
          }
          if (fn2 && typeof fn2.value === "object" && fn2.value !== null) {
            const name = Object.getOwnPropertyDescriptor(fn2.value, "name");
            if (name && !("value" in name)) {
              throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
            }
          }
          continue;
        }
        if (!shouldParseToolCall(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), {
          type: identity.type,
          function: { name: identity.name }
        })) {
          continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(toolCall, "function");
        if (!descriptor || !("value" in descriptor)) {
          throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
        }
        const fn = descriptor.value;
        const argumentsSnapshot = captureStructuredJSONSnapshot(fn, "arguments");
        if (typeof argumentsSnapshot !== "string") {
          throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
        }
        validateStructuredJSONSnapshot(argumentsSnapshot, finalJSONBudget, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"));
        validatedTools.set(toolCallIndex, Object.freeze({
          tool: toolCall,
          function: fn,
          type: identity.type,
          name: identity.name,
          arguments: argumentsSnapshot
        }));
      }
    }
    return validatedMessages;
  }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    const validatedMessages = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_validateStructuredSnapshots).call(this, snapshot);
    const audioDoneChoiceIndexes = __classPrivateFieldGet(this, _ChatCompletionStream_audioDoneChoiceIndexes, "f");
    __classPrivateFieldSet(this, _ChatCompletionStream_audioDoneChoiceIndexes, /* @__PURE__ */ new Set());
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, []);
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), audioDoneChoiceIndexes, validatedMessages);
  }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk, capturedChoiceFrames) {
    var _a4, _b3, _c3, _d3, _e3;
    var _a3, _b2, _c2, _d2, _e2;
    let snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, obfuscation: _obfuscation, ...rest } = chunk;
    if (!snapshot) {
      const newSnapshot = {
        ...rest,
        choices: []
      };
      __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, newSnapshot);
      snapshot = newSnapshot;
    } else if (chunk.id) {
      assignOwnProperties(snapshot, rest);
    }
    const requestedChoiceCount = (_a4 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _a4.n;
    const maxChoices = typeof requestedChoiceCount === "number" && Number.isSafeInteger(requestedChoiceCount) && requestedChoiceCount > 0 ? Math.min(requestedChoiceCount, MAX_STREAM_CHOICES) : MAX_STREAM_CHOICES;
    for (const chunkChoice of chunk.choices) {
      const { delta, finish_reason, index, logprobs = null, ...other } = chunkChoice;
      const capturedToolCalls = [];
      capturedChoiceFrames.set(chunkChoice, Object.freeze({ index, tool_calls: capturedToolCalls }));
      if (!Number.isSafeInteger(index) || index < 0 || index >= maxChoices) {
        throw new OpenAIError(`Chat completion stream contains an invalid choice index: ${index}`);
      }
      let choice = snapshot.choices[index];
      if (!choice) {
        const newChoice = { finish_reason, index, message: {}, logprobs: null, ...other };
        snapshot.choices[index] = newChoice;
        choice = newChoice;
      }
      if (isParseableResponseFormat((_b3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _b3.response_format) || __classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f")) {
        captureStructuredJSONSnapshot(captureStructuredMessageSnapshot(choice), "refusal");
      }
      if (logprobs) {
        if (choice.logprobs) {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          assignOwnProperties(choice.logprobs, rest3);
          if (content2) {
            (_a3 = choice.logprobs).content ?? (_a3.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b2 = choice.logprobs).refusal ?? (_b2.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        } else {
          choice.logprobs = { ...logprobs };
          if (logprobs.content) {
            choice.logprobs.content = [...logprobs.content];
          }
          if (logprobs.refusal) {
            choice.logprobs.refusal = [...logprobs.refusal];
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet(this, _ChatCompletionStream_params, "f") && (__classPrivateFieldGet(this, _ChatCompletionStream_rejectsUnfinishedTurns, "f") || hasAutoParseableInput$1(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f")))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      assignOwnProperties(choice, other);
      if (!delta) {
        Object.freeze(capturedToolCalls);
        continue;
      }
      __classPrivateFieldGet(this, _ChatCompletionStream_audioDoneChoiceIndexes, "f").delete(index);
      const { audio, content, refusal, function_call, role, ...capturedDeltaFields } = delta;
      const { tool_calls: capturedToolCallDelta, ...rest2 } = capturedDeltaFields;
      const tool_calls = hasOwn(capturedDeltaFields, "tool_calls") ? capturedToolCallDelta : delta.tool_calls;
      assignOwnProperties(choice.message, rest2);
      if ((audio == null ? void 0 : audio.expires_at) != null && audio.id == null && audio.data == null && audio.transcript == null && content == null && refusal == null && function_call == null && role == null && tool_calls == null && Object.keys(rest2).length === 0) {
        __classPrivateFieldGet(this, _ChatCompletionStream_audioDoneChoiceIndexes, "f").add(index);
      }
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role) {
        choice.message.role = role;
      }
      if (audio) {
        const audioSnapshot = (_c2 = choice.message).audio ?? (_c2.audio = {});
        if (audio.id != null) {
          audioSnapshot.id = audio.id;
        }
        if (audio.data != null) {
          audioSnapshot.data = (audioSnapshot.data ?? "") + audio.data;
        }
        if (audio.transcript != null) {
          audioSnapshot.transcript = (audioSnapshot.transcript ?? "") + audio.transcript;
        }
        if (audio.expires_at != null) {
          audioSnapshot.expires_at = audio.expires_at;
        }
      }
      if (function_call) {
        if (choice.message.function_call) {
          if (function_call.name) {
            choice.message.function_call.name = function_call.name;
          }
          if (function_call.arguments) {
            (_d2 = choice.message.function_call).arguments ?? (_d2.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        } else {
          choice.message.function_call = function_call;
        }
      }
      if (content != null) {
        if (!choice.message.refusal && isParseableResponseFormat((_c3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _c3.response_format)) {
          const eventState = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choice);
          const parseState = eventState.content_parse_state ?? (eventState.content_parse_state = createPartialJSONParseState());
          const shouldParse = recordPartialJSONFragment(parseState, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"), content);
          choice.message.content = (captureStructuredJSONSnapshot(choice.message, "content") || "") + content;
          if (!parseState.has_non_whitespace) {
            choice.message.parsed = null;
          } else if (shouldParse && reservePartialJSONParse(parseState, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"))) {
            __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_validateStructuredSnapshots).call(this, snapshot);
            choice.message.parsed = parseStructuredStreamingJSON(validateStructuredJSONSnapshot(choice.message.content));
          } else if (content.length > 0) {
            choice.message.parsed = null;
          }
        } else {
          choice.message.content = (choice.message.content || "") + content;
        }
      }
      if (tool_calls) {
        const toolCallSnapshots = (_e2 = choice.message).tool_calls ?? (_e2.tool_calls = []);
        for (const toolCallDelta of tool_calls) {
          const { index: index2, id, type, function: fn, custom, ...rest3 } = toolCallDelta;
          if (!Number.isSafeInteger(index2) || index2 < 0 || index2 >= MAX_STREAM_TOOL_CALLS) {
            throw new OpenAIError(`Chat completion stream contains an invalid tool call index: ${index2}`);
          }
          let argumentsDelta = "";
          const tool_call = toolCallSnapshots[index2] ?? (toolCallSnapshots[index2] = {});
          const functionName = fn == null ? void 0 : fn.name;
          const eventState = __classPrivateFieldGet(this, _ChatCompletionStream_hasAutoParseableTool, "f") ? __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choice) : void 0;
          let boundIdentity = eventState == null ? void 0 : eventState.tool_call_identities.get(index2);
          if (boundIdentity) {
            assertBoundToolCallIdentity(tool_call, boundIdentity);
            if (type !== void 0 && type !== boundIdentity.type || functionName !== void 0 && functionName !== boundIdentity.name) {
              throw new OpenAIError("Chat completion stream contains a changed tool call identity");
            }
          }
          assignOwnProperties(tool_call, rest3);
          if (id) {
            tool_call.id = id;
          }
          if (type) {
            tool_call.type = type;
          }
          if (custom) {
            const customSnapshot = tool_call.custom ?? (tool_call.custom = { name: custom.name ?? "", input: "" });
            if (custom.name) {
              customSnapshot.name = custom.name;
            }
            if (custom.input) {
              customSnapshot.input += custom.input;
            }
          }
          if (fn) {
            const functionSnapshot = tool_call.function ?? (tool_call.function = { name: functionName ?? "", arguments: "" });
            if (functionName) {
              functionSnapshot.name = functionName;
            }
            if (eventState && !boundIdentity) {
              const identity = ownFunctionToolIdentity(tool_call);
              const configuredTool = identity && ((_e3 = (_d3 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _d3.tools) == null ? void 0 : _e3.find((tool) => isChatCompletionFunctionTool(tool) && tool.function.name === identity.name));
              if (identity) {
                boundIdentity = {
                  ...identity,
                  parseable: configuredTool !== void 0 && shouldParseToolCall(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), {
                    type: identity.type,
                    function: { name: identity.name }
                  })
                };
                eventState.tool_call_identities.set(index2, boundIdentity);
                if (!boundIdentity.parseable) {
                  const provisionalState = eventState.tool_call_parse_states.get(index2);
                  if (provisionalState) {
                    __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f").bytes -= provisionalState.bytes;
                    __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f").fragments -= provisionalState.fragments;
                    __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f").work -= provisionalState.work;
                    eventState.tool_call_parse_states.delete(index2);
                  }
                }
              }
            }
            const argumentFragment = fn.arguments;
            if (argumentFragment != null) {
              argumentsDelta = argumentFragment;
              if (eventState && (boundIdentity == null ? void 0 : boundIdentity.parseable) !== false) {
                let parseState = eventState.tool_call_parse_states.get(index2);
                if (!parseState) {
                  parseState = createPartialJSONParseState();
                  eventState.tool_call_parse_states.set(index2, parseState);
                }
                const shouldParse = recordPartialJSONFragment(parseState, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"), argumentFragment);
                const previousArguments = captureStructuredJSONSnapshot(functionSnapshot, "arguments");
                if (typeof previousArguments !== "string") {
                  throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
                }
                functionSnapshot.arguments = previousArguments + argumentFragment;
                if (shouldParse && (boundIdentity == null ? void 0 : boundIdentity.parseable) === true && reservePartialJSONParse(parseState, __classPrivateFieldGet(this, _ChatCompletionStream_partialJSONParseBudget, "f"))) {
                  __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_validateStructuredSnapshots).call(this, snapshot);
                  functionSnapshot.parsed_arguments = parseStructuredStreamingJSON(validateStructuredJSONSnapshot(functionSnapshot.arguments));
                } else if (argumentFragment.length > 0 && hasOwn(functionSnapshot, "parsed_arguments")) {
                  functionSnapshot.parsed_arguments = void 0;
                }
              } else {
                functionSnapshot.arguments += argumentFragment;
              }
            }
          }
          capturedToolCalls.push(Object.freeze({ index: index2, arguments_delta: argumentsDelta }));
        }
      }
      Object.freeze(capturedToolCalls);
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    return this._createIterator((push) => {
      const onChunk = (chunk) => push(chunk);
      this.on("chunk", onChunk);
      return () => this.off("chunk", onChunk);
    }, { onReturn: () => this.abort() });
  }
  /** Serializes raw completion chunks into a readable stream for transfer to another runtime. */
  toReadableStream() {
    const stream2 = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream2.toReadableStream();
  }
}
function finalizeChatCompletion(snapshot, params, audioDoneChoiceIndexes, validatedMessages) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: mapCapturedSnapshotArray(choices, MAX_STREAM_CHOICES, "choice", (choice) => {
      const validated = validatedMessages.get(choice);
      if (!validated) {
        throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
      }
      const stableChoice = new Proxy(choice, {
        get(target, property, receiver) {
          return property === "message" ? validated.message : Reflect.get(target, property, receiver);
        }
      });
      const { message: sourceMessage, finish_reason, index, logprobs, ...choiceRest } = stableChoice;
      const message = new Proxy(sourceMessage, {
        get(target, property, receiver) {
          if (property === "content") {
            return validated.content;
          }
          if (property === "refusal") {
            return validated.refusal;
          }
          if (property === "tool_calls") {
            return validated.toolCallCollection;
          }
          return Reflect.get(target, property, receiver);
        }
      });
      const { content = null, function_call, tool_calls, audio, ...messageRest } = message;
      const finishReason = finish_reason ?? (audioDoneChoiceIndexes.has(index) && isCompleteAudio(audio) ? "stop" : null);
      if (!finishReason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const audioResponse = audio ? { audio } : {};
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            ...audioResponse,
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason: finishReason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason: finishReason,
          logprobs,
          message: {
            ...messageRest,
            ...audioResponse,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: mapCapturedSnapshotArray(tool_calls, MAX_STREAM_TOOL_CALLS, "tool-call", (tool_call, i) => {
              const captured = validated.toolCalls.get(i);
              if (!captured) {
                const identity = ownFunctionToolIdentity(tool_call);
                if (identity && shouldParseToolCall(params, {
                  type: identity.type,
                  function: { name: identity.name }
                })) {
                  throw new OpenAIError("Chat completion stream contains an unsafe structured JSON snapshot");
                }
              }
              if (captured && captured.tool !== tool_call) {
                throw new OpenAIError("Chat completion stream contains a changed tool call identity");
              }
              const stableFunction = captured && new Proxy(captured.function, {
                get(target, property, receiver) {
                  if (property === "arguments") {
                    return captured.arguments;
                  }
                  if (property === "name") {
                    return captured.name;
                  }
                  return Reflect.get(target, property, receiver);
                }
              });
              const stableTool = captured && stableFunction ? new Proxy(tool_call, {
                get(target, property, receiver) {
                  if (property === "type") {
                    return captured.type;
                  }
                  if (property === "function") {
                    return stableFunction;
                  }
                  return Reflect.get(target, property, receiver);
                }
              }) : tool_call;
              if (stableTool.type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type`);
              }
              if (stableTool.type === "custom") {
                const { custom, type: type2, id: id3, ...toolRest2 } = stableTool;
                const { input = "", name: name2, ...customRest } = custom || {};
                if (name2 == null) {
                  throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].custom.name`);
                }
                return {
                  ...toolRest2,
                  id: id3 || `call_${uuid4()}`,
                  type: type2,
                  custom: { ...customRest, name: name2, input }
                };
              }
              const { function: fn, type, id: id2, ...toolRest } = stableTool;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments`);
              }
              return {
                ...toolRest,
                id: id2 || `call_${uuid4()}`,
                type,
                function: { ...fnRest, name, arguments: args }
              };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, ...audioResponse, content, role, refusal: message.refusal ?? null },
        finish_reason: finishReason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    // Spread creates an own data property without invoking inherited setters or changing the object prototype.
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function isCompleteAudio(audio) {
  return (audio == null ? void 0 : audio.id) != null && audio.data != null && audio.transcript != null && audio.expires_at != null;
}
class ChatCompletionStreamingRunner extends ChatCompletionStream {
  /** Restores a serialized tool run, including intermediate completions and tool-result messages. */
  static fromReadableStream(stream2) {
    const runner = new ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream2));
    return runner;
  }
  /** Serializes completion chunks and tool-result messages for replay in another runtime. */
  toReadableStream() {
    let lastChunk;
    let toolCallIds;
    const iterator = this._createIterator((push) => {
      const onChunk = (chunk) => {
        lastChunk = chunk;
        push(chunk);
      };
      const onMessage = (message) => {
        var _a3;
        if (isAssistantMessage(message)) {
          toolCallIds = (_a3 = message.tool_calls) == null ? void 0 : _a3.map((toolCall) => toolCall.id);
          return;
        }
        if (isToolMessage(message)) {
          if (!lastChunk) {
            throw new OpenAIError("cannot serialize a tool message before receiving any chunks");
          }
          push(makeChatCompletionReadableStreamMessageChunk(lastChunk, message, toolCallIds));
          toolCallIds = void 0;
        }
      };
      this.on("chunk", onChunk);
      this.on("message", onMessage);
      return () => {
        this.off("chunk", onChunk);
        this.off("message", onMessage);
      };
    }, { onReturn: () => this.abort() });
    const stream2 = new Stream(() => iterator, this.controller);
    return stream2.toReadableStream();
  }
  /** Starts a streaming tool loop and returns its event-driven conversation runner. */
  static runTools(client, params, options2) {
    const runner = new ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "runTools" }
    };
    runner._run(() => runner._runTools(client, params, runner, opts));
    return runner;
  }
}
let Completions$1 = class Completions extends APIResource {
  constructor() {
    super(...arguments);
    this.messages = new Messages$1(this._client);
  }
  create(body, options2) {
    return this._client.post("/chat/completions", {
      body,
      ...options2,
      stream: body.stream ?? false,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(completionID, options2) {
    return this._client.get(path`/chat/completions/${completionID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(completionID, body, options2) {
    return this._client.post(path`/chat/completions/${completionID}`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List stored Chat Completions. Only Chat Completions that have been stored with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletion of client.chat.completions.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/chat/completions", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.delete('completion_id');
   * ```
   */
  delete(completionID, options2) {
    return this._client.delete(path`/chat/completions/${completionID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  parse(body, options2) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "chat.completions.parse" }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runTools(body, options2) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options2);
    }
    return ChatCompletionRunner.runTools(this._client, body, options2);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options2) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options2);
  }
};
Completions$1.Messages = Messages$1;
class Chat extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions$1(this._client);
  }
}
Chat.Completions = Completions$1;
class AdminAPIKeys extends APIResource {
  /**
   * Create an organization admin API key
   *
   * @example
   * ```ts
   * const adminAPIKey =
   *   await client.admin.organization.adminAPIKeys.create({
   *     name: 'New Admin Key',
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/admin_api_keys", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieve a single organization API key
   *
   * @example
   * ```ts
   * const adminAPIKey =
   *   await client.admin.organization.adminAPIKeys.retrieve(
   *     'key_id',
   *   );
   * ```
   */
  retrieve(keyID, options2) {
    return this._client.get(path`/organization/admin_api_keys/${keyID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * List organization API keys
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const adminAPIKey of client.admin.organization.adminAPIKeys.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/admin_api_keys", CursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Delete an organization admin API key
   *
   * @example
   * ```ts
   * const adminAPIKey =
   *   await client.admin.organization.adminAPIKeys.delete(
   *     'key_id',
   *   );
   * ```
   */
  delete(keyID, options2) {
    return this._client.delete(path`/organization/admin_api_keys/${keyID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class AuditLogs extends APIResource {
  /**
   * List user actions and configuration changes within this organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const auditLogListResponse of client.admin.organization.auditLogs.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/audit_logs", ConversationCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
let Certificates$1 = class Certificates extends APIResource {
  /**
   * Upload a certificate to the organization. This does **not** automatically
   * activate the certificate.
   *
   * Organizations can upload up to 50 certificates.
   *
   * @example
   * ```ts
   * const certificate =
   *   await client.admin.organization.certificates.create({
   *     certificate: 'certificate',
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/certificates", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get a certificate that has been uploaded to the organization.
   *
   * You can get a certificate regardless of whether it is active or not.
   *
   * @example
   * ```ts
   * const certificate =
   *   await client.admin.organization.certificates.retrieve(
   *     'certificate_id',
   *   );
   * ```
   */
  retrieve(certificateID, query = {}, options2) {
    return this._client.get(path`/organization/certificates/${certificateID}`, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Modify a certificate. Note that only the name can be modified.
   *
   * @example
   * ```ts
   * const certificate =
   *   await client.admin.organization.certificates.update(
   *     'certificate_id',
   *   );
   * ```
   */
  update(certificateID, body, options2) {
    return this._client.post(path`/organization/certificates/${certificateID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * List uploaded certificates for this organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateListResponse of client.admin.organization.certificates.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/certificates", ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Delete a certificate from the organization.
   *
   * The certificate must be inactive for the organization and all projects.
   *
   * @example
   * ```ts
   * const certificate =
   *   await client.admin.organization.certificates.delete(
   *     'certificate_id',
   *   );
   * ```
   */
  delete(certificateID, options2) {
    return this._client.delete(path`/organization/certificates/${certificateID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Activate certificates at the organization level.
   *
   * You can atomically and idempotently activate up to 10 certificates at a time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateActivateResponse of client.admin.organization.certificates.activate(
   *   { certificate_ids: ['cert_abc'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  activate(body, options2) {
    return this._client.getAPIList("/organization/certificates/activate", Page, {
      body,
      method: "post",
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deactivate certificates at the organization level.
   *
   * You can atomically and idempotently deactivate up to 10 certificates at a time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateDeactivateResponse of client.admin.organization.certificates.deactivate(
   *   { certificate_ids: ['cert_abc'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  deactivate(body, options2) {
    return this._client.getAPIList("/organization/certificates/deactivate", Page, { body, method: "post", ...options2, __security: { adminAPIKeyAuth: true } });
  }
};
let DataRetention$1 = class DataRetention extends APIResource {
  /**
   * Retrieves organization data retention controls.
   *
   * @example
   * ```ts
   * const organizationDataRetention =
   *   await client.admin.organization.dataRetention.retrieve();
   * ```
   */
  retrieve(options2) {
    return this._client.get("/organization/data_retention", {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates organization data retention controls.
   *
   * @example
   * ```ts
   * const organizationDataRetention =
   *   await client.admin.organization.dataRetention.update({
   *     retention_type: 'zero_data_retention',
   *   });
   * ```
   */
  update(body, options2) {
    return this._client.post("/organization/data_retention", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
class Invites extends APIResource {
  /**
   * Create an invite for a user to the organization. The invite must be accepted by
   * the user before they have access to the organization.
   *
   * @example
   * ```ts
   * const invite =
   *   await client.admin.organization.invites.create({
   *     email: 'email',
   *     role: 'reader',
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/invites", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves an invite.
   *
   * @example
   * ```ts
   * const invite =
   *   await client.admin.organization.invites.retrieve(
   *     'invite_id',
   *   );
   * ```
   */
  retrieve(inviteID, options2) {
    return this._client.get(path`/organization/invites/${inviteID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Returns a list of invites in the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const invite of client.admin.organization.invites.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/invites", ConversationCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Delete an invite. If the invite has already been accepted, it cannot be deleted.
   *
   * @example
   * ```ts
   * const invite =
   *   await client.admin.organization.invites.delete(
   *     'invite_id',
   *   );
   * ```
   */
  delete(inviteID, options2) {
    return this._client.delete(path`/organization/invites/${inviteID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
let Roles$5 = class Roles extends APIResource {
  /**
   * Creates a custom role for the organization.
   *
   * @example
   * ```ts
   * const role = await client.admin.organization.roles.create({
   *   permissions: ['string'],
   *   role_name: 'role_name',
   * });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/roles", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves an organization role.
   *
   * @example
   * ```ts
   * const role = await client.admin.organization.roles.retrieve(
   *   'role_id',
   * );
   * ```
   */
  retrieve(roleID, options2) {
    return this._client.get(path`/organization/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates an existing organization role.
   *
   * @example
   * ```ts
   * const role = await client.admin.organization.roles.update(
   *   'role_id',
   * );
   * ```
   */
  update(roleID, body, options2) {
    return this._client.post(path`/organization/roles/${roleID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the roles configured for the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const role of client.admin.organization.roles.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/roles", NextCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deletes a custom role from the organization.
   *
   * @example
   * ```ts
   * const role = await client.admin.organization.roles.delete(
   *   'role_id',
   * );
   * ```
   */
  delete(roleID, options2) {
    return this._client.delete(path`/organization/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
let SpendAlerts$1 = class SpendAlerts extends APIResource {
  /**
   * Creates an organization spend alert.
   *
   * @example
   * ```ts
   * const organizationSpendAlert =
   *   await client.admin.organization.spendAlerts.create({
   *     currency: 'USD',
   *     interval: 'month',
   *     notification_channel: {
   *       recipients: ['string'],
   *       type: 'email',
   *     },
   *     threshold_amount: 0,
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/spend_alerts", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves an organization spend alert.
   *
   * @example
   * ```ts
   * const organizationSpendAlert =
   *   await client.admin.organization.spendAlerts.retrieve(
   *     'alert_id',
   *   );
   * ```
   */
  retrieve(alertID, options2) {
    return this._client.get(path`/organization/spend_alerts/${alertID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates an organization spend alert.
   *
   * @example
   * ```ts
   * const organizationSpendAlert =
   *   await client.admin.organization.spendAlerts.update(
   *     'alert_id',
   *     {
   *       currency: 'USD',
   *       interval: 'month',
   *       notification_channel: {
   *         recipients: ['string'],
   *         type: 'email',
   *       },
   *       threshold_amount: 0,
   *     },
   *   );
   * ```
   */
  update(alertID, body, options2) {
    return this._client.post(path`/organization/spend_alerts/${alertID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists organization spend alerts.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const organizationSpendAlert of client.admin.organization.spendAlerts.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/spend_alerts", ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deletes an organization spend alert.
   *
   * @example
   * ```ts
   * const organizationSpendAlertDeleted =
   *   await client.admin.organization.spendAlerts.delete(
   *     'alert_id',
   *   );
   * ```
   */
  delete(alertID, options2) {
    return this._client.delete(path`/organization/spend_alerts/${alertID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
let SpendLimit$1 = class SpendLimit extends APIResource {
  /**
   * Get the organization's hard spend limit.
   *
   * @example
   * ```ts
   * const organizationSpendLimit =
   *   await client.admin.organization.spendLimit.retrieve();
   * ```
   */
  retrieve(options2) {
    return this._client.get("/organization/spend_limit", {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Create or replace the organization's hard spend limit.
   *
   * @example
   * ```ts
   * const organizationSpendLimit =
   *   await client.admin.organization.spendLimit.update({
   *     currency: 'USD',
   *     interval: 'month',
   *     threshold_amount: 1,
   *   });
   * ```
   */
  update(body, options2) {
    return this._client.post("/organization/spend_limit", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Delete the organization's hard spend limit.
   *
   * @example
   * ```ts
   * const organizationSpendLimitDeleted =
   *   await client.admin.organization.spendLimit.delete();
   * ```
   */
  delete(options2) {
    return this._client.delete("/organization/spend_limit", {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
class Usage extends APIResource {
  /**
   * Get audio speeches usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.audioSpeeches({
   *     start_time: 0,
   *   });
   * ```
   */
  audioSpeeches(query, options2) {
    return this._client.get("/organization/usage/audio_speeches", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get audio transcriptions usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.audioTranscriptions(
   *     { start_time: 0 },
   *   );
   * ```
   */
  audioTranscriptions(query, options2) {
    return this._client.get("/organization/usage/audio_transcriptions", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get code interpreter sessions usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.codeInterpreterSessions(
   *     { start_time: 0 },
   *   );
   * ```
   */
  codeInterpreterSessions(query, options2) {
    return this._client.get("/organization/usage/code_interpreter_sessions", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get completions usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.completions({
   *     start_time: 0,
   *   });
   * ```
   */
  completions(query, options2) {
    return this._client.get("/organization/usage/completions", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get costs details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.costs({
   *     start_time: 0,
   *   });
   * ```
   */
  costs(query, options2) {
    return this._client.get("/organization/costs", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get embeddings usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.embeddings({
   *     start_time: 0,
   *   });
   * ```
   */
  embeddings(query, options2) {
    return this._client.get("/organization/usage/embeddings", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get file search calls usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.fileSearchCalls({
   *     start_time: 0,
   *   });
   * ```
   */
  fileSearchCalls(query, options2) {
    return this._client.get("/organization/usage/file_search_calls", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get images usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.images({
   *     start_time: 0,
   *   });
   * ```
   */
  images(query, options2) {
    return this._client.get("/organization/usage/images", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get moderations usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.moderations({
   *     start_time: 0,
   *   });
   * ```
   */
  moderations(query, options2) {
    return this._client.get("/organization/usage/moderations", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get vector stores usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.vectorStores({
   *     start_time: 0,
   *   });
   * ```
   */
  vectorStores(query, options2) {
    return this._client.get("/organization/usage/vector_stores", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Get web search calls usage details for the organization.
   *
   * @example
   * ```ts
   * const response =
   *   await client.admin.organization.usage.webSearchCalls({
   *     start_time: 0,
   *   });
   * ```
   */
  webSearchCalls(query, options2) {
    return this._client.get("/organization/usage/web_search_calls", {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
let Roles$4 = class Roles2 extends APIResource {
  /**
   * Assigns an organization role to a group within the organization.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.groups.roles.create(
   *     'group_id',
   *     { role_id: 'role_id' },
   *   );
   * ```
   */
  create(groupID, body, options2) {
    return this._client.post(path`/organization/groups/${groupID}/roles`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves an organization role assigned to a group.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.groups.roles.retrieve(
   *     'role_id',
   *     { group_id: 'group_id' },
   *   );
   * ```
   */
  retrieve(roleID, params, options2) {
    const { group_id } = params;
    return this._client.get(path`/organization/groups/${group_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the organization roles assigned to a group within the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const roleListResponse of client.admin.organization.groups.roles.list(
   *   'group_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(groupID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/groups/${groupID}/roles`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Unassigns an organization role from a group within the organization.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.groups.roles.delete(
   *     'role_id',
   *     { group_id: 'group_id' },
   *   );
   * ```
   */
  delete(roleID, params, options2) {
    const { group_id } = params;
    return this._client.delete(path`/organization/groups/${group_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
let Users$2 = class Users extends APIResource {
  /**
   * Adds a user to a group.
   *
   * @example
   * ```ts
   * const user =
   *   await client.admin.organization.groups.users.create(
   *     'group_id',
   *     { user_id: 'user_id' },
   *   );
   * ```
   */
  create(groupID, body, options2) {
    return this._client.post(path`/organization/groups/${groupID}/users`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a user in a group.
   *
   * @example
   * ```ts
   * const user =
   *   await client.admin.organization.groups.users.retrieve(
   *     'user_id',
   *     { group_id: 'group_id' },
   *   );
   * ```
   */
  retrieve(userID, params, options2) {
    const { group_id } = params;
    return this._client.get(path`/organization/groups/${group_id}/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the users assigned to a group.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const organizationGroupUser of client.admin.organization.groups.users.list(
   *   'group_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(groupID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/groups/${groupID}/users`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Removes a user from a group.
   *
   * @example
   * ```ts
   * const user =
   *   await client.admin.organization.groups.users.delete(
   *     'user_id',
   *     { group_id: 'group_id' },
   *   );
   * ```
   */
  delete(userID, params, options2) {
    const { group_id } = params;
    return this._client.delete(path`/organization/groups/${group_id}/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
let Groups$1 = class Groups extends APIResource {
  constructor() {
    super(...arguments);
    this.users = new Users$2(this._client);
    this.roles = new Roles$4(this._client);
  }
  /**
   * Creates a new group in the organization.
   *
   * @example
   * ```ts
   * const group = await client.admin.organization.groups.create(
   *   { name: 'x' },
   * );
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/groups", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a group.
   *
   * @example
   * ```ts
   * const group =
   *   await client.admin.organization.groups.retrieve(
   *     'group_id',
   *   );
   * ```
   */
  retrieve(groupID, options2) {
    return this._client.get(path`/organization/groups/${groupID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates a group's information.
   *
   * @example
   * ```ts
   * const group = await client.admin.organization.groups.update(
   *   'group_id',
   *   { name: 'x' },
   * );
   * ```
   */
  update(groupID, body, options2) {
    return this._client.post(path`/organization/groups/${groupID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists all groups in the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const group of client.admin.organization.groups.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/groups", NextCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deletes a group from the organization.
   *
   * @example
   * ```ts
   * const group = await client.admin.organization.groups.delete(
   *   'group_id',
   * );
   * ```
   */
  delete(groupID, options2) {
    return this._client.delete(path`/organization/groups/${groupID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
Groups$1.Users = Users$2;
Groups$1.Roles = Roles$4;
let APIKeys$1 = class APIKeys extends APIResource {
  /**
   * Retrieves an API key in the project.
   *
   * @example
   * ```ts
   * const projectAPIKey =
   *   await client.admin.organization.projects.apiKeys.retrieve(
   *     'api_key_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(apiKeyID, params, options2) {
    const { project_id } = params;
    return this._client.get(path`/organization/projects/${project_id}/api_keys/${apiKeyID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Returns a list of API keys in the project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectAPIKey of client.admin.organization.projects.apiKeys.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/api_keys`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deletes an API key from the project.
   *
   * Returns confirmation of the key deletion, or an error if the key belonged to a
   * service account.
   *
   * @example
   * ```ts
   * const apiKey =
   *   await client.admin.organization.projects.apiKeys.delete(
   *     'api_key_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(apiKeyID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/organization/projects/${project_id}/api_keys/${apiKeyID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
class Certificates2 extends APIResource {
  /**
   * List certificates for this project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateListResponse of client.admin.organization.projects.certificates.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/certificates`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Activate certificates at the project level.
   *
   * You can atomically and idempotently activate up to 10 certificates at a time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateActivateResponse of client.admin.organization.projects.certificates.activate(
   *   'project_id',
   *   { certificate_ids: ['cert_abc'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  activate(projectID, body, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/certificates/activate`, Page, { body, method: "post", ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deactivate certificates at the project level. You can atomically and
   * idempotently deactivate up to 10 certificates at a time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const certificateDeactivateResponse of client.admin.organization.projects.certificates.deactivate(
   *   'project_id',
   *   { certificate_ids: ['cert_abc'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  deactivate(projectID, body, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/certificates/deactivate`, Page, { body, method: "post", ...options2, __security: { adminAPIKeyAuth: true } });
  }
}
class DataRetention2 extends APIResource {
  /**
   * Retrieves project data retention controls.
   *
   * @example
   * ```ts
   * const projectDataRetention =
   *   await client.admin.organization.projects.dataRetention.retrieve(
   *     'project_id',
   *   );
   * ```
   */
  retrieve(projectID, options2) {
    return this._client.get(path`/organization/projects/${projectID}/data_retention`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates project data retention controls.
   *
   * @example
   * ```ts
   * const projectDataRetention =
   *   await client.admin.organization.projects.dataRetention.update(
   *     'project_id',
   *     { retention_type: 'organization_default' },
   *   );
   * ```
   */
  update(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/data_retention`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class HostedToolPermissions extends APIResource {
  /**
   * Returns hosted tool permissions for a project.
   *
   * @example
   * ```ts
   * const projectHostedToolPermissions =
   *   await client.admin.organization.projects.hostedToolPermissions.retrieve(
   *     'project_id',
   *   );
   * ```
   */
  retrieve(projectID, options2) {
    return this._client.get(path`/organization/projects/${projectID}/hosted_tool_permissions`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates hosted tool permissions for a project.
   *
   * @example
   * ```ts
   * const projectHostedToolPermissions =
   *   await client.admin.organization.projects.hostedToolPermissions.update(
   *     'project_id',
   *   );
   * ```
   */
  update(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/hosted_tool_permissions`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class ModelPermissions extends APIResource {
  /**
   * Returns model permissions for a project.
   *
   * @example
   * ```ts
   * const projectModelPermissions =
   *   await client.admin.organization.projects.modelPermissions.retrieve(
   *     'project_id',
   *   );
   * ```
   */
  retrieve(projectID, options2) {
    return this._client.get(path`/organization/projects/${projectID}/model_permissions`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates model permissions for a project.
   *
   * @example
   * ```ts
   * const projectModelPermissions =
   *   await client.admin.organization.projects.modelPermissions.update(
   *     'project_id',
   *     { mode: 'allow_list', model_ids: ['string'] },
   *   );
   * ```
   */
  update(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/model_permissions`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deletes model permissions for a project.
   *
   * @example
   * ```ts
   * const projectModelPermissionsDeleted =
   *   await client.admin.organization.projects.modelPermissions.delete(
   *     'project_id',
   *   );
   * ```
   */
  delete(projectID, options2) {
    return this._client.delete(path`/organization/projects/${projectID}/model_permissions`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class RateLimits extends APIResource {
  /**
   * Returns the rate limits per model for a project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectRateLimit of client.admin.organization.projects.rateLimits.listRateLimits(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  listRateLimits(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/rate_limits`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Updates a project rate limit.
   *
   * @example
   * ```ts
   * const projectRateLimit =
   *   await client.admin.organization.projects.rateLimits.updateRateLimit(
   *     'rate_limit_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  updateRateLimit(rateLimitID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/organization/projects/${project_id}/rate_limits/${rateLimitID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
let Roles$3 = class Roles3 extends APIResource {
  /**
   * Creates a custom role for a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.roles.create(
   *     'project_id',
   *     { permissions: ['string'], role_name: 'role_name' },
   *   );
   * ```
   */
  create(projectID, body, options2) {
    return this._client.post(path`/projects/${projectID}/roles`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project role.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.roles.retrieve(
   *     'role_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(roleID, params, options2) {
    const { project_id } = params;
    return this._client.get(path`/projects/${project_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates an existing project role.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.roles.update(
   *     'role_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  update(roleID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/projects/${project_id}/roles/${roleID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the roles configured for a project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const role of client.admin.organization.projects.roles.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/projects/${projectID}/roles`, NextCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deletes a custom role from a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.roles.delete(
   *     'role_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(roleID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/projects/${project_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
class SpendAlerts2 extends APIResource {
  /**
   * Creates a project spend alert.
   *
   * @example
   * ```ts
   * const projectSpendAlert =
   *   await client.admin.organization.projects.spendAlerts.create(
   *     'project_id',
   *     {
   *       currency: 'USD',
   *       interval: 'month',
   *       notification_channel: {
   *         recipients: ['string'],
   *         type: 'email',
   *       },
   *       threshold_amount: 0,
   *     },
   *   );
   * ```
   */
  create(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/spend_alerts`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project spend alert.
   *
   * @example
   * ```ts
   * const projectSpendAlert =
   *   await client.admin.organization.projects.spendAlerts.retrieve(
   *     'alert_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(alertID, params, options2) {
    const { project_id } = params;
    return this._client.get(path`/organization/projects/${project_id}/spend_alerts/${alertID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates a project spend alert.
   *
   * @example
   * ```ts
   * const projectSpendAlert =
   *   await client.admin.organization.projects.spendAlerts.update(
   *     'alert_id',
   *     {
   *       project_id: 'project_id',
   *       currency: 'USD',
   *       interval: 'month',
   *       notification_channel: {
   *         recipients: ['string'],
   *         type: 'email',
   *       },
   *       threshold_amount: 0,
   *     },
   *   );
   * ```
   */
  update(alertID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/organization/projects/${project_id}/spend_alerts/${alertID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists project spend alerts.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectSpendAlert of client.admin.organization.projects.spendAlerts.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/spend_alerts`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deletes a project spend alert.
   *
   * @example
   * ```ts
   * const projectSpendAlertDeleted =
   *   await client.admin.organization.projects.spendAlerts.delete(
   *     'alert_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(alertID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/organization/projects/${project_id}/spend_alerts/${alertID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class SpendLimit2 extends APIResource {
  /**
   * Get a project's hard spend limit.
   *
   * @example
   * ```ts
   * const projectSpendLimit =
   *   await client.admin.organization.projects.spendLimit.retrieve(
   *     'proj_123',
   *   );
   * ```
   */
  retrieve(projectID, options2) {
    return this._client.get(path`/organization/projects/${projectID}/spend_limit`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Create or replace a project's hard spend limit.
   *
   * @example
   * ```ts
   * const projectSpendLimit =
   *   await client.admin.organization.projects.spendLimit.update(
   *     'proj_123',
   *     {
   *       currency: 'USD',
   *       interval: 'month',
   *       threshold_amount: 1,
   *     },
   *   );
   * ```
   */
  update(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/spend_limit`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Delete a project's hard spend limit.
   *
   * @example
   * ```ts
   * const projectSpendLimitDeleted =
   *   await client.admin.organization.projects.spendLimit.delete(
   *     'proj_123',
   *   );
   * ```
   */
  delete(projectID, options2) {
    return this._client.delete(path`/organization/projects/${projectID}/spend_limit`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
let Roles$2 = class Roles4 extends APIResource {
  /**
   * Assigns a project role to a group within a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.groups.roles.create(
   *     'group_id',
   *     { project_id: 'project_id', role_id: 'role_id' },
   *   );
   * ```
   */
  create(groupID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/projects/${project_id}/groups/${groupID}/roles`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project role assigned to a group.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.groups.roles.retrieve(
   *     'role_id',
   *     { project_id: 'project_id', group_id: 'group_id' },
   *   );
   * ```
   */
  retrieve(roleID, params, options2) {
    const { project_id, group_id } = params;
    return this._client.get(path`/projects/${project_id}/groups/${group_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the project roles assigned to a group within a project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const roleListResponse of client.admin.organization.projects.groups.roles.list(
   *   'group_id',
   *   { project_id: 'project_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(groupID, params, options2) {
    const { project_id, ...query } = params;
    return this._client.getAPIList(path`/projects/${project_id}/groups/${groupID}/roles`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Unassigns a project role from a group within a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.groups.roles.delete(
   *     'role_id',
   *     { project_id: 'project_id', group_id: 'group_id' },
   *   );
   * ```
   */
  delete(roleID, params, options2) {
    const { project_id, group_id } = params;
    return this._client.delete(path`/projects/${project_id}/groups/${group_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
class Groups2 extends APIResource {
  constructor() {
    super(...arguments);
    this.roles = new Roles$2(this._client);
  }
  /**
   * Grants a group access to a project.
   *
   * @example
   * ```ts
   * const projectGroup =
   *   await client.admin.organization.projects.groups.create(
   *     'project_id',
   *     { group_id: 'group_id', role: 'role' },
   *   );
   * ```
   */
  create(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/groups`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project's group.
   *
   * @example
   * ```ts
   * const projectGroup =
   *   await client.admin.organization.projects.groups.retrieve(
   *     'group_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(groupID, params, options2) {
    const { project_id, ...query } = params;
    return this._client.get(path`/organization/projects/${project_id}/groups/${groupID}`, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the groups that have access to a project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectGroup of client.admin.organization.projects.groups.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/groups`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Revokes a group's access to a project.
   *
   * @example
   * ```ts
   * const group =
   *   await client.admin.organization.projects.groups.delete(
   *     'group_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(groupID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/organization/projects/${project_id}/groups/${groupID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
Groups2.Roles = Roles$2;
class APIKeys2 extends APIResource {
  /**
   * Creates an API key for a service account in the project.
   *
   * @example
   * ```ts
   * const apiKey =
   *   await client.admin.organization.projects.serviceAccounts.apiKeys.create(
   *     'service_account_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  create(serviceAccountID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/organization/projects/${project_id}/service_accounts/${serviceAccountID}/api_keys`, { body, ...options2, __security: { adminAPIKeyAuth: true } });
  }
}
class ServiceAccounts extends APIResource {
  constructor() {
    super(...arguments);
    this.apiKeys = new APIKeys2(this._client);
  }
  /**
   * Creates a new service account in the project. By default, this also returns an
   * unredacted API key for the service account.
   *
   * @example
   * ```ts
   * const serviceAccount =
   *   await client.admin.organization.projects.serviceAccounts.create(
   *     'project_id',
   *     { name: 'name' },
   *   );
   * ```
   */
  create(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/service_accounts`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a service account in the project.
   *
   * @example
   * ```ts
   * const projectServiceAccount =
   *   await client.admin.organization.projects.serviceAccounts.retrieve(
   *     'service_account_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(serviceAccountID, params, options2) {
    const { project_id } = params;
    return this._client.get(path`/organization/projects/${project_id}/service_accounts/${serviceAccountID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Updates a service account in the project.
   *
   * @example
   * ```ts
   * const projectServiceAccount =
   *   await client.admin.organization.projects.serviceAccounts.update(
   *     'service_account_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  update(serviceAccountID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/organization/projects/${project_id}/service_accounts/${serviceAccountID}`, { body, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Returns a list of service accounts in the project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectServiceAccount of client.admin.organization.projects.serviceAccounts.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/service_accounts`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deletes a service account from the project.
   *
   * Returns confirmation of service account deletion, or an error if the project is
   * archived (archived projects have no service accounts).
   *
   * @example
   * ```ts
   * const serviceAccount =
   *   await client.admin.organization.projects.serviceAccounts.delete(
   *     'service_account_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(serviceAccountID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/organization/projects/${project_id}/service_accounts/${serviceAccountID}`, { ...options2, __security: { adminAPIKeyAuth: true } });
  }
}
ServiceAccounts.APIKeys = APIKeys2;
let Roles$1 = class Roles5 extends APIResource {
  /**
   * Assigns a project role to a user within a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.users.roles.create(
   *     'user_id',
   *     { project_id: 'project_id', role_id: 'role_id' },
   *   );
   * ```
   */
  create(userID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/projects/${project_id}/users/${userID}/roles`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project role assigned to a user.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.users.roles.retrieve(
   *     'role_id',
   *     { project_id: 'project_id', user_id: 'user_id' },
   *   );
   * ```
   */
  retrieve(roleID, params, options2) {
    const { project_id, user_id } = params;
    return this._client.get(path`/projects/${project_id}/users/${user_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the project roles assigned to a user within a project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const roleListResponse of client.admin.organization.projects.users.roles.list(
   *   'user_id',
   *   { project_id: 'project_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(userID, params, options2) {
    const { project_id, ...query } = params;
    return this._client.getAPIList(path`/projects/${project_id}/users/${userID}/roles`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Unassigns a project role from a user within a project.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.projects.users.roles.delete(
   *     'role_id',
   *     { project_id: 'project_id', user_id: 'user_id' },
   *   );
   * ```
   */
  delete(roleID, params, options2) {
    const { project_id, user_id } = params;
    return this._client.delete(path`/projects/${project_id}/users/${user_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
let Users$1 = class Users2 extends APIResource {
  constructor() {
    super(...arguments);
    this.roles = new Roles$1(this._client);
  }
  /**
   * Adds a user to the project. Users must already be members of the organization to
   * be added to a project.
   *
   * @example
   * ```ts
   * const projectUser =
   *   await client.admin.organization.projects.users.create(
   *     'project_id',
   *     { role: 'role' },
   *   );
   * ```
   */
  create(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}/users`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a user in the project.
   *
   * @example
   * ```ts
   * const projectUser =
   *   await client.admin.organization.projects.users.retrieve(
   *     'user_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  retrieve(userID, params, options2) {
    const { project_id } = params;
    return this._client.get(path`/organization/projects/${project_id}/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Modifies a user's role in the project.
   *
   * @example
   * ```ts
   * const projectUser =
   *   await client.admin.organization.projects.users.update(
   *     'user_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  update(userID, params, options2) {
    const { project_id, ...body } = params;
    return this._client.post(path`/organization/projects/${project_id}/users/${userID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Returns a list of users in the project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const projectUser of client.admin.organization.projects.users.list(
   *   'project_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(projectID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/projects/${projectID}/users`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Deletes a user from the project.
   *
   * Returns confirmation of project user deletion, or an error if the project is
   * archived (archived projects have no users).
   *
   * @example
   * ```ts
   * const user =
   *   await client.admin.organization.projects.users.delete(
   *     'user_id',
   *     { project_id: 'project_id' },
   *   );
   * ```
   */
  delete(userID, params, options2) {
    const { project_id } = params;
    return this._client.delete(path`/organization/projects/${project_id}/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
};
Users$1.Roles = Roles$1;
class Projects extends APIResource {
  constructor() {
    super(...arguments);
    this.users = new Users$1(this._client);
    this.serviceAccounts = new ServiceAccounts(this._client);
    this.apiKeys = new APIKeys$1(this._client);
    this.rateLimits = new RateLimits(this._client);
    this.modelPermissions = new ModelPermissions(this._client);
    this.hostedToolPermissions = new HostedToolPermissions(this._client);
    this.groups = new Groups2(this._client);
    this.roles = new Roles$3(this._client);
    this.dataRetention = new DataRetention2(this._client);
    this.spendLimit = new SpendLimit2(this._client);
    this.spendAlerts = new SpendAlerts2(this._client);
    this.certificates = new Certificates2(this._client);
  }
  /**
   * Create a new project in the organization. Projects can be created and archived,
   * but cannot be deleted.
   *
   * @example
   * ```ts
   * const project =
   *   await client.admin.organization.projects.create({
   *     name: 'name',
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/organization/projects", {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves a project.
   *
   * @example
   * ```ts
   * const project =
   *   await client.admin.organization.projects.retrieve(
   *     'project_id',
   *   );
   * ```
   */
  retrieve(projectID, options2) {
    return this._client.get(path`/organization/projects/${projectID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Modifies a project in the organization.
   *
   * @example
   * ```ts
   * const project =
   *   await client.admin.organization.projects.update(
   *     'project_id',
   *   );
   * ```
   */
  update(projectID, body, options2) {
    return this._client.post(path`/organization/projects/${projectID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Returns a list of projects.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const project of client.admin.organization.projects.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/projects", ConversationCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Archives a project in the organization. Archived projects cannot be used or
   * updated.
   *
   * @example
   * ```ts
   * const project =
   *   await client.admin.organization.projects.archive(
   *     'project_id',
   *   );
   * ```
   */
  archive(projectID, options2) {
    return this._client.post(path`/organization/projects/${projectID}/archive`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
Projects.Users = Users$1;
Projects.ServiceAccounts = ServiceAccounts;
Projects.APIKeys = APIKeys$1;
Projects.RateLimits = RateLimits;
Projects.ModelPermissions = ModelPermissions;
Projects.HostedToolPermissions = HostedToolPermissions;
Projects.Groups = Groups2;
Projects.Roles = Roles$3;
Projects.DataRetention = DataRetention2;
Projects.SpendLimit = SpendLimit2;
Projects.SpendAlerts = SpendAlerts2;
Projects.Certificates = Certificates2;
class Roles6 extends APIResource {
  /**
   * Assigns an organization role to a user within the organization.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.users.roles.create(
   *     'user_id',
   *     { role_id: 'role_id' },
   *   );
   * ```
   */
  create(userID, body, options2) {
    return this._client.post(path`/organization/users/${userID}/roles`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Retrieves an organization role assigned to a user.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.users.roles.retrieve(
   *     'role_id',
   *     { user_id: 'user_id' },
   *   );
   * ```
   */
  retrieve(roleID, params, options2) {
    const { user_id } = params;
    return this._client.get(path`/organization/users/${user_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists the organization roles assigned to a user within the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const roleListResponse of client.admin.organization.users.roles.list(
   *   'user_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(userID, query = {}, options2) {
    return this._client.getAPIList(path`/organization/users/${userID}/roles`, NextCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * Unassigns an organization role from a user within the organization.
   *
   * @example
   * ```ts
   * const role =
   *   await client.admin.organization.users.roles.delete(
   *     'role_id',
   *     { user_id: 'user_id' },
   *   );
   * ```
   */
  delete(roleID, params, options2) {
    const { user_id } = params;
    return this._client.delete(path`/organization/users/${user_id}/roles/${roleID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
class Users3 extends APIResource {
  constructor() {
    super(...arguments);
    this.roles = new Roles6(this._client);
  }
  /**
   * Retrieves a user by their identifier.
   *
   * @example
   * ```ts
   * const organizationUser =
   *   await client.admin.organization.users.retrieve('user_id');
   * ```
   */
  retrieve(userID, options2) {
    return this._client.get(path`/organization/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Modifies a user's role in the organization.
   *
   * @example
   * ```ts
   * const organizationUser =
   *   await client.admin.organization.users.update('user_id');
   * ```
   */
  update(userID, body, options2) {
    return this._client.post(path`/organization/users/${userID}`, {
      body,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Lists all of the users in the organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const organizationUser of client.admin.organization.users.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/organization/users", ConversationCursorPage, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * Deletes a user from the organization.
   *
   * @example
   * ```ts
   * const user = await client.admin.organization.users.delete(
   *   'user_id',
   * );
   * ```
   */
  delete(userID, options2) {
    return this._client.delete(path`/organization/users/${userID}`, {
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
}
Users3.Roles = Roles6;
class Organization extends APIResource {
  constructor() {
    super(...arguments);
    this.auditLogs = new AuditLogs(this._client);
    this.adminAPIKeys = new AdminAPIKeys(this._client);
    this.usage = new Usage(this._client);
    this.invites = new Invites(this._client);
    this.users = new Users3(this._client);
    this.groups = new Groups$1(this._client);
    this.roles = new Roles$5(this._client);
    this.dataRetention = new DataRetention$1(this._client);
    this.spendLimit = new SpendLimit$1(this._client);
    this.spendAlerts = new SpendAlerts$1(this._client);
    this.certificates = new Certificates$1(this._client);
    this.projects = new Projects(this._client);
  }
}
Organization.AuditLogs = AuditLogs;
Organization.AdminAPIKeys = AdminAPIKeys;
Organization.Usage = Usage;
Organization.Invites = Invites;
Organization.Users = Users3;
Organization.Groups = Groups$1;
Organization.Roles = Roles$5;
Organization.DataRetention = DataRetention$1;
Organization.SpendLimit = SpendLimit$1;
Organization.SpendAlerts = SpendAlerts$1;
Organization.Certificates = Certificates$1;
Organization.Projects = Projects;
class Admin extends APIResource {
  constructor() {
    super(...arguments);
    this.organization = new Organization(this._client);
  }
}
Admin.Organization = Organization;
class Speech extends APIResource {
  /**
   * Generates audio from the input text.
   *
   * Returns the audio file content, or a stream of audio events.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'tts-1',
   *   voice: 'alloy',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(body, options2) {
    return this._client.post("/audio/speech", {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "application/octet-stream" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
}
class Transcriptions extends APIResource {
  create(body, options2) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options2,
      stream: body.stream ?? false,
      __metadata: { model: body.model },
      __security: { bearerAuth: true }
    }, this._client));
  }
}
class Translations extends APIResource {
  create(body, options2) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options2, __metadata: { model: body.model }, __security: { bearerAuth: true } }, this._client));
  }
}
class Audio extends APIResource {
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
}
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;
class Batches extends APIResource {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options2) {
    return this._client.post("/batches", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchID, options2) {
    return this._client.get(path`/batches/${batchID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * List your organization's batches.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/batches", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchID, options2) {
    return this._client.post(path`/batches/${batchID}/cancel`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
class Assistants extends APIResource {
  /**
   * Create an assistant with a model and instructions.
   *
   * @deprecated
   */
  create(body, options2) {
    return this._client.post("/assistants", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @deprecated
   */
  retrieve(assistantID, options2) {
    return this._client.get(path`/assistants/${assistantID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modifies an assistant.
   *
   * @deprecated
   */
  update(assistantID, body, options2) {
    return this._client.post(path`/assistants/${assistantID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of assistants.
   *
   * @deprecated
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/assistants", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete an assistant.
   *
   * @deprecated
   */
  delete(assistantID, options2) {
    return this._client.delete(path`/assistants/${assistantID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
let Sessions$3 = class Sessions extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(body, options2) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
class TranscriptionSessions extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(body, options2) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
let Realtime$1 = class Realtime extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions$3(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
};
Realtime$1.Sessions = Sessions$3;
Realtime$1.TranscriptionSessions = TranscriptionSessions;
let Files$3 = class Files extends APIResource {
  /**
   * Copies inline bytes or a Files API file into a connected execution environment.
   * See
   * [environment files](https://developers.openai.com/api/docs/guides/agents-api/environments/files).
   *
   * @example
   * ```ts
   * const environmentFile =
   *   await client.beta.agents.environments.files.create(
   *     'environment_id',
   *     {
   *       type: 'inline',
   *       path: '/workspace/example.txt',
   *       data: 'SGVsbG8K',
   *     },
   *   );
   * ```
   */
  create(environmentID, body, options2) {
    return this._client.post(path`/agents/environments/${environmentID}/files`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists live files on a connected execution environment with optional directory
   * filtering and opaque cursor pagination. See
   * [environment files](https://developers.openai.com/api/docs/guides/agents-api/environments/files).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const environmentFile of client.beta.agents.environments.files.list(
   *   'environment_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(environmentID, query = {}, options2) {
    return this._client.getAPIList(path`/agents/environments/${environmentID}/files`, TokenPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
class Templates extends APIResource {
  /**
   * Creates reusable environment configuration without returning confidential setup
   * commands or environment values. See
   * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
   *
   * @example
   * ```ts
   * const environmentTemplate =
   *   await client.beta.agents.environments.templates.create();
   * ```
   */
  create(body = {}, options2) {
    return this._client.post("/agents/environments/templates", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves reusable environment configuration without returning confidential
   * values. See
   * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
   *
   * @example
   * ```ts
   * const environmentTemplate =
   *   await client.beta.agents.environments.templates.retrieve(
   *     'environment_template_id',
   *   );
   * ```
   */
  retrieve(environmentTemplateID, options2) {
    return this._client.get(path`/agents/environments/templates/${environmentTemplateID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Updates reusable environment configuration without returning confidential
   * values. See
   * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
   *
   * @example
   * ```ts
   * const environmentTemplate =
   *   await client.beta.agents.environments.templates.update(
   *     'environment_template_id',
   *   );
   * ```
   */
  update(environmentTemplateID, body = {}, options2) {
    return this._client.post(path`/agents/environments/templates/${environmentTemplateID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists reusable environment templates without returning confidential values. See
   * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const environmentTemplate of client.beta.agents.environments.templates.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/agents/environments/templates", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes reusable environment configuration and all confidential template inputs.
   * See
   * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
   *
   * @example
   * ```ts
   * const environmentTemplateDeleted =
   *   await client.beta.agents.environments.templates.delete(
   *     'environment_template_id',
   *   );
   * ```
   */
  delete(environmentTemplateID, options2) {
    return this._client.delete(path`/agents/environments/templates/${environmentTemplateID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class Environments extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files$3(this._client);
    this.templates = new Templates(this._client);
  }
  /**
   * Retrieves an execution environment's connection status and safe installed
   * metadata. See
   * [environment lifecycle](https://developers.openai.com/api/docs/guides/agents-api/environments/lifecycle).
   *
   * @example
   * ```ts
   * const environmentInfo =
   *   await client.beta.agents.environments.retrieve(
   *     'environment_id',
   *   );
   * ```
   */
  retrieve(environmentID, options2) {
    return this._client.get(path`/agents/environments/${environmentID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Environments.Files = Files$3;
Environments.Templates = Templates;
var _TurnState_turnID, _TurnState_turnEnded, _TurnState_eventIDs, _TurnState_calls;
class TurnState {
  constructor() {
    _TurnState_turnID.set(this, void 0);
    _TurnState_turnEnded.set(this, false);
    _TurnState_eventIDs.set(this, /* @__PURE__ */ new Set());
    _TurnState_calls.set(this, /* @__PURE__ */ new Set());
  }
  /** Records a delivery unless its event ID is in the bounded recent window. */
  accept(event) {
    if (__classPrivateFieldGet(this, _TurnState_eventIDs, "f").has(event.event_id)) {
      return false;
    }
    if (__classPrivateFieldGet(this, _TurnState_eventIDs, "f").size === 1024) {
      const oldest = __classPrivateFieldGet(this, _TurnState_eventIDs, "f").values().next();
      if (!oldest.done) {
        __classPrivateFieldGet(this, _TurnState_eventIDs, "f").delete(oldest.value);
      }
    }
    __classPrivateFieldGet(this, _TurnState_eventIDs, "f").add(event.event_id);
    if (event.type === "agent.session.turn.created" && event.turn.subagent_id === null && __classPrivateFieldGet(this, _TurnState_turnID, "f") === void 0) {
      __classPrivateFieldSet(this, _TurnState_turnID, event.turn_id);
    }
    if ((event.type === "agent.session.turn.completed" || event.type === "agent.session.turn.failed" || event.type === "agent.session.turn.cancelled") && __classPrivateFieldGet(this, _TurnState_turnID, "f") !== void 0 && event.turn_id === __classPrivateFieldGet(this, _TurnState_turnID, "f")) {
      __classPrivateFieldSet(this, _TurnState_turnEnded, true);
    }
    return true;
  }
  /** Checks session termination after updating the selected turn state. */
  terminal(event) {
    return event.type === "agent.session.failed" || event.type === "agent.session.idle" && __classPrivateFieldGet(this, _TurnState_turnEnded, "f");
  }
  /** Returns each tool call once for the full invocation, including subagent turns. */
  call(event) {
    if (event.type !== "agent.session.turn.item.added" || event.item.type !== "function_call") {
      return;
    }
    const call = event.item;
    const key = JSON.stringify([call.turn_id, call.call_id]);
    if (__classPrivateFieldGet(this, _TurnState_calls, "f").has(key)) {
      return;
    }
    __classPrivateFieldGet(this, _TurnState_calls, "f").add(key);
    return call;
  }
}
_TurnState_turnID = /* @__PURE__ */ new WeakMap(), _TurnState_turnEnded = /* @__PURE__ */ new WeakMap(), _TurnState_eventIDs = /* @__PURE__ */ new WeakMap(), _TurnState_calls = /* @__PURE__ */ new WeakMap();
var _AgentSessionStream_instances, _AgentSessionStream_consumed, _AgentSessionStream_stream, _AgentSessionStream_response, _AgentSessionStream_reading, _AgentSessionStream_sessions, _AgentSessionStream_sessionID, _AgentSessionStream_input, _AgentSessionStream_handlers, _AgentSessionStream_inputKey, _AgentSessionStream_options, _AgentSessionStream_iterate, _AgentSessionStream_result, _AgentSessionStream_checkAbort, _AgentSessionStream_abortError, _AgentSessionStream_wait, _AgentSessionStream_submit;
function isInputContent(value) {
  if (!isObj(value)) {
    return false;
  }
  const content = value;
  let field;
  if (content["type"] === "input_text") {
    field = "text";
  } else if (content["type"] === "input_image") {
    field = "image_url";
  } else {
    return false;
  }
  return hasOwn(content, "type") && hasOwn(content, field) && typeof content[field] === "string";
}
function normalizedOutput(value) {
  if (value === null) {
    return null;
  }
  if (typeof value === "string" || Array.isArray(value) && value.every(isInputContent)) {
    return value;
  }
  throw new OpenAIError("Tool output must be text, content, a JSON object, or null");
}
function toolResult(call, value) {
  const output = isObj(value) ? JSON.stringify(value) : value;
  const serialized = JSON.stringify(output);
  if (serialized === void 0) {
    throw new OpenAIError("Tool output must be JSON serializable");
  }
  return {
    type: "agent.session.input.tool_result",
    turn_id: call.turn_id,
    call_id: call.call_id,
    success: true,
    output: normalizedOutput(typeof output === "string" ? output : JSON.parse(serialized))
  };
}
async function cancelBody(response) {
  var _a3;
  try {
    await ((_a3 = response == null ? void 0 : response.body) == null ? void 0 : _a3.cancel());
  } catch {
  }
}
class AgentSessionStream {
  /** Creates an unstarted helper. Prefer client.beta.agents.sessions.stream(). */
  constructor(sessions, sessionID, params, options2) {
    _AgentSessionStream_instances.add(this);
    this.controller = new AbortController();
    _AgentSessionStream_consumed.set(this, false);
    _AgentSessionStream_stream.set(this, void 0);
    _AgentSessionStream_response.set(this, void 0);
    _AgentSessionStream_reading.set(this, false);
    _AgentSessionStream_sessions.set(this, void 0);
    _AgentSessionStream_sessionID.set(this, void 0);
    _AgentSessionStream_input.set(this, void 0);
    _AgentSessionStream_handlers.set(this, void 0);
    _AgentSessionStream_inputKey.set(this, void 0);
    _AgentSessionStream_options.set(this, void 0);
    const input = typeof params.input === "string" ? [{ role: "user", content: [{ type: "input_text", text: params.input }] }] : params.input;
    if (params.input.length === 0) {
      throw new OpenAIError("input must not be empty");
    }
    __classPrivateFieldSet(this, _AgentSessionStream_sessions, sessions);
    __classPrivateFieldSet(this, _AgentSessionStream_sessionID, sessionID);
    __classPrivateFieldSet(this, _AgentSessionStream_input, { type: "agent.session.input.message", input });
    __classPrivateFieldSet(this, _AgentSessionStream_handlers, new Map(Object.entries(params.toolHandlers ?? {})));
    const headers = buildHeaders([options2 == null ? void 0 : options2.headers]);
    __classPrivateFieldSet(this, _AgentSessionStream_inputKey, headers.nulls.has("idempotency-key") ? void 0 : headers.values.get("idempotency-key") ?? params.idempotencyKey ?? (options2 == null ? void 0 : options2.idempotencyKey) ?? uuid4());
    headers.values.delete("idempotency-key");
    headers.nulls.delete("idempotency-key");
    const { idempotencyKey: _key, ...rest } = options2 ?? {};
    __classPrivateFieldSet(this, _AgentSessionStream_options, { ...rest, headers });
  }
  /** Closes local requests without cancelling the turn; an optional reason becomes the abort error's cause. */
  abort(reason) {
    var _a3;
    this.controller.abort(reason);
    (_a3 = __classPrivateFieldGet(this, _AgentSessionStream_stream, "f")) == null ? void 0 : _a3.controller.abort(this.controller.signal.reason);
    if (!__classPrivateFieldGet(this, _AgentSessionStream_reading, "f")) {
      void cancelBody(__classPrivateFieldGet(this, _AgentSessionStream_response, "f"));
    }
  }
  /** Starts iteration once; use for await to ensure early exits close the connection. */
  [(_AgentSessionStream_consumed = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_stream = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_response = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_reading = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_sessions = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_sessionID = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_input = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_handlers = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_inputKey = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_options = /* @__PURE__ */ new WeakMap(), _AgentSessionStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    if (__classPrivateFieldGet(this, _AgentSessionStream_consumed, "f")) {
      throw new OpenAIError("An AgentSessionStream can only be consumed once");
    }
    __classPrivateFieldSet(this, _AgentSessionStream_consumed, true);
    return __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_iterate).call(this);
  }
}
_AgentSessionStream_iterate = async function* _AgentSessionStream_iterate2() {
  const externalSignal = __classPrivateFieldGet(this, _AgentSessionStream_options, "f").signal;
  const abort = () => this.abort((externalSignal == null ? void 0 : externalSignal.aborted) ? externalSignal.reason : this.controller.signal.reason);
  externalSignal == null ? void 0 : externalSignal.addEventListener("abort", abort, { once: true });
  this.controller.signal.addEventListener("abort", abort, { once: true });
  const options2 = { ...__classPrivateFieldGet(this, _AgentSessionStream_options, "f"), signal: this.controller.signal };
  const state2 = new TurnState();
  try {
    if (externalSignal == null ? void 0 : externalSignal.aborted) {
      this.abort(externalSignal.reason);
    }
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    const session = await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").retrieve(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options2);
    if (session.status !== "idle") {
      throw new OpenAIError("sessions.stream requires an idle session; use sessions.events.stream for active sessions");
    }
    const subscription = await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.stream(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options2).withResponse();
    __classPrivateFieldSet(this, _AgentSessionStream_stream, subscription.data, "f");
    __classPrivateFieldSet(this, _AgentSessionStream_response, subscription.response, "f");
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.create(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), {
      events: [__classPrivateFieldGet(this, _AgentSessionStream_input, "f")],
      // Spread creates an own data property without invoking inherited setters or changing the object prototype.
      ...__classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") === void 0 ? {} : { "Idempotency-Key": __classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") }
    }, {
      ...options2,
      headers: buildHeaders([options2.headers, { "Idempotency-Key": __classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") ?? null }])
    });
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    __classPrivateFieldSet(this, _AgentSessionStream_reading, true, "f");
    for await (const event of __classPrivateFieldGet(this, _AgentSessionStream_stream, "f")) {
      __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
      if (!state2.accept(event)) {
        continue;
      }
      const terminal = state2.terminal(event);
      const pendingCall = state2.call(event);
      const handler = pendingCall && __classPrivateFieldGet(this, _AgentSessionStream_handlers, "f").get(pendingCall.name);
      const call = pendingCall && handler ? structuredClone(pendingCall) : void 0;
      if (terminal) {
        __classPrivateFieldGet(this, _AgentSessionStream_stream, "f").controller.abort();
      }
      yield event;
      if (terminal) {
        return;
      }
      __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
      if (!call || !handler) {
        continue;
      }
      const result = await __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_result).call(this, call, handler);
      __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
      await __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_submit).call(this, result, options2);
    }
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    throw new OpenAIError("Session event stream ended before the turn reached idle or failed");
  } finally {
    externalSignal == null ? void 0 : externalSignal.removeEventListener("abort", abort);
    this.controller.signal.removeEventListener("abort", abort);
    this.abort();
  }
}, _AgentSessionStream_result = async function _AgentSessionStream_result2(call, handler) {
  try {
    const args = typeof call.arguments === "string" ? JSON.parse(call.arguments) : call.arguments;
    if (!isObj(args)) {
      throw new OpenAIError("Function arguments must be a JSON object");
    }
    return toolResult(call, await __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_wait).call(this, () => handler(args)));
  } catch {
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    return {
      type: "agent.session.input.tool_result",
      turn_id: call.turn_id,
      call_id: call.call_id,
      success: false,
      error: "Tool handler failed."
    };
  }
}, _AgentSessionStream_checkAbort = function _AgentSessionStream_checkAbort2() {
  if (this.controller.signal.aborted) {
    throw __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_abortError).call(this);
  }
}, _AgentSessionStream_abortError = function _AgentSessionStream_abortError2() {
  const error = new APIUserAbortError();
  Object.defineProperty(error, "cause", {
    value: this.controller.signal.reason,
    writable: true,
    configurable: true
  });
  return error;
}, _AgentSessionStream_wait = async function _AgentSessionStream_wait2(action) {
  let onAbort;
  const aborted = new Promise((_resolve, reject) => {
    onAbort = () => reject(__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_abortError).call(this));
    this.controller.signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
    const invoke = async () => await action();
    return await Promise.race([invoke(), aborted]);
  } finally {
    if (onAbort) {
      this.controller.signal.removeEventListener("abort", onAbort);
    }
  }
}, _AgentSessionStream_submit = async function _AgentSessionStream_submit2(result, options2, key = uuid4(), attempt = 0) {
  __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
  try {
    await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.create(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), { events: [result], "Idempotency-Key": key }, options2);
  } catch (error) {
    const delay = [100, 300, 600][attempt];
    if (delay === void 0 || !(error instanceof BadRequestError) || error.code !== "invalid_request_error" || !error.error || !("message" in error.error) || error.error.message !== `Unknown pending tool call: ${result.call_id}`) {
      throw error;
    }
    let timer;
    try {
      await __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_wait).call(this, () => (
        // oxlint-disable-next-line promise/avoid-new -- Own the registration timer so cancellation clears it promptly.
        new Promise((resolve) => {
          timer = setTimeout(resolve, delay);
        })
      ));
    } finally {
      if (timer !== void 0) {
        clearTimeout(timer);
      }
    }
    await __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_submit2).call(this, result, options2, key, attempt + 1);
  }
};
class Artifacts extends APIResource {
  /**
   * Retrieves immutable metadata for one durable session artifact. See
   * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
   *
   * @example
   * ```ts
   * const sessionArtifact =
   *   await client.beta.agents.sessions.artifacts.retrieve(
   *     'artifact_id',
   *     { session_id: 'session_id' },
   *   );
   * ```
   */
  retrieve(artifactID, params, options2) {
    const { session_id } = params;
    return this._client.get(path`/agents/sessions/${session_id}/artifacts/${artifactID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists immutable artifacts published by completed hosted session turns. See
   * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const sessionArtifact of client.beta.agents.sessions.artifacts.list(
   *   'session_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, query = {}, options2) {
    return this._client.getAPIList(path`/agents/sessions/${sessionID}/artifacts`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes an immutable session artifact without deleting its live environment file
   * or original Files API object. See
   * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
   *
   * @example
   * ```ts
   * const sessionArtifactDeleted =
   *   await client.beta.agents.sessions.artifacts.delete(
   *     'artifact_id',
   *     { session_id: 'session_id' },
   *   );
   * ```
   */
  delete(artifactID, params, options2) {
    const { session_id } = params;
    return this._client.delete(path`/agents/sessions/${session_id}/artifacts/${artifactID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Downloads immutable session artifact bytes after the execution environment
   * expires. See
   * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
   *
   * @example
   * ```ts
   * const response =
   *   await client.beta.agents.sessions.artifacts.content(
   *     'artifact_id',
   *     { session_id: 'session_id' },
   *   );
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  content(artifactID, params, options2) {
    const { session_id } = params;
    return this._client.get(path`/agents/sessions/${session_id}/artifacts/${artifactID}/content`, {
      ...options2,
      headers: buildHeaders([
        { "OpenAI-Beta": "agents=v1", Accept: "application/octet-stream" },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
}
class Events extends APIResource {
  /**
   * Submits message, cancellation, or tool-result events to a managed agent session.
   * Cancellation can recover a still-open turn whose backend execution has ended by
   * marking it cancelled and abandoning unpublished outputs. Saved results,
   * published files, and existing terminal outcomes are preserved. HTTP 202 confirms
   * acceptance, not durable completion. See
   * [session events](https://developers.openai.com/api/docs/guides/agents-api/sessions/events).
   *
   * @example
   * ```ts
   * await client.beta.agents.sessions.events.create(
   *   'session_id',
   *   {
   *     events: [
   *       {
   *         input: [
   *           {
   *             content: [{ text: 'text', type: 'input_text' }],
   *             role: 'user',
   *           },
   *         ],
   *         type: 'agent.session.input.message',
   *       },
   *     ],
   *   },
   * );
   * ```
   */
  create(sessionID, params, options2) {
    const { "Idempotency-Key": idempotencyKey, ...body } = params;
    return this._client.post(path`/agents/sessions/${sessionID}/events`, {
      body,
      ...options2,
      headers: buildHeaders([
        {
          "OpenAI-Beta": "agents=v1",
          Accept: "*/*",
          ...idempotencyKey != null ? { "Idempotency-Key": idempotencyKey } : void 0
        },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Streams live events for an agent session. See
   * [session events](https://developers.openai.com/api/docs/guides/agents-api/sessions/events).
   *
   * @example
   * ```ts
   * const agentSessionEvent =
   *   await client.beta.agents.sessions.events.stream(
   *     'session_id',
   *   );
   * ```
   */
  stream(sessionID, options2) {
    return this._client.get(path`/agents/sessions/${sessionID}/events`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1", Accept: "text/event-stream" }, options2 == null ? void 0 : options2.headers]),
      stream: true,
      __security: { bearerAuth: true }
    });
  }
}
let Items$3 = class Items extends APIResource {
  /**
   * Lists items produced by the session's root agent, including its interactions
   * with subagents. Each subagent has its own item history. See
   * [inspecting agent output](https://developers.openai.com/api/docs/guides/agents-api/observability).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentSessionItem of client.beta.agents.sessions.items.list(
   *   'session_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, query = {}, options2) {
    return this._client.getAPIList(path`/agents/sessions/${sessionID}/items`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
let Turns$1 = class Turns extends APIResource {
  /**
   * Retrieves a turn's current status, timestamps, usage, and error. Returns 404 if
   * the turn does not belong to the session. See
   * [session turns](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage#inspect-session-turns).
   *
   * @example
   * ```ts
   * const turn =
   *   await client.beta.agents.sessions.turns.retrieve(
   *     'turn_id',
   *     { session_id: 'session_id' },
   *   );
   * ```
   */
  retrieve(turnID, params, options2) {
    const { session_id } = params;
    return this._client.get(path`/agents/sessions/${session_id}/turns/${turnID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists turns by creation time and turn ID. The after cursor is exclusive in the
   * selected order. See
   * [session turns](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage#inspect-session-turns).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const turn of client.beta.agents.sessions.turns.list(
   *   'session_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, query = {}, options2) {
    return this._client.getAPIList(path`/agents/sessions/${sessionID}/turns`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
let Items$2 = class Items2 extends APIResource {
  /**
   * Lists this subagent's own items across all of its turns. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentSessionItem of client.beta.agents.sessions.subagents.items.list(
   *   'subagent_id',
   *   { session_id: 'session_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(subagentID, params, options2) {
    const { session_id, ...query } = params;
    return this._client.getAPIList(path`/agents/sessions/${session_id}/subagents/${subagentID}/items`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
let Items$1 = class Items3 extends APIResource {
  /**
   * Lists items belonging to one turn of this subagent. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentSessionItem of client.beta.agents.sessions.subagents.turns.items.list(
   *   'turn_id',
   *   { session_id: 'session_id', subagent_id: 'subagent_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(turnID, params, options2) {
    const { session_id, subagent_id, ...query } = params;
    return this._client.getAPIList(path`/agents/sessions/${session_id}/subagents/${subagent_id}/turns/${turnID}/items`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
class Turns2 extends APIResource {
  constructor() {
    super(...arguments);
    this.items = new Items$1(this._client);
  }
  /**
   * Retrieves a turn belonging to this subagent. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * const turn =
   *   await client.beta.agents.sessions.subagents.turns.retrieve(
   *     'turn_id',
   *     {
   *       session_id: 'session_id',
   *       subagent_id: 'subagent_id',
   *     },
   *   );
   * ```
   */
  retrieve(turnID, params, options2) {
    const { session_id, subagent_id } = params;
    return this._client.get(path`/agents/sessions/${session_id}/subagents/${subagent_id}/turns/${turnID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists all turns of this subagent, including turns after a resume. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const turn of client.beta.agents.sessions.subagents.turns.list(
   *   'subagent_id',
   *   { session_id: 'session_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(subagentID, params, options2) {
    const { session_id, ...query } = params;
    return this._client.getAPIList(path`/agents/sessions/${session_id}/subagents/${subagentID}/turns`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Turns2.Items = Items$1;
class Subagents extends APIResource {
  constructor() {
    super(...arguments);
    this.items = new Items$2(this._client);
    this.turns = new Turns2(this._client);
  }
  /**
   * Retrieves a subagent belonging to this session. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * const subagent =
   *   await client.beta.agents.sessions.subagents.retrieve(
   *     'subagent_id',
   *     { session_id: 'session_id' },
   *   );
   * ```
   */
  retrieve(subagentID, params, options2) {
    const { session_id } = params;
    return this._client.get(path`/agents/sessions/${session_id}/subagents/${subagentID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists subagents in a session, including nested and closed subagents. See
   * [subagent workflows](https://developers.openai.com/api/docs/guides/agents-api/multi-agent).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const subagent of client.beta.agents.sessions.subagents.list(
   *   'session_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, query = {}, options2) {
    return this._client.getAPIList(path`/agents/sessions/${sessionID}/subagents`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Subagents.Items = Items$2;
Subagents.Turns = Turns2;
let Sessions$2 = class Sessions2 extends APIResource {
  constructor() {
    super(...arguments);
    this.subagents = new Subagents(this._client);
    this.artifacts = new Artifacts(this._client);
    this.items = new Items$3(this._client);
    this.events = new Events(this._client);
    this.turns = new Turns$1(this._client);
  }
  /** Stream one turn on an idle session with a single input writer. See AgentSessionStream for lifecycle and tool handling. */
  stream(sessionID, params, options2) {
    return new AgentSessionStream(this, sessionID, params, options2);
  }
  create(body, options2) {
    return this._client.post("/agents/sessions", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      stream: body.stream ?? false,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves the current state of a managed agent session. See
   * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
   *
   * @example
   * ```ts
   * const agentSession =
   *   await client.beta.agents.sessions.retrieve('session_id');
   * ```
   */
  retrieve(sessionID, options2) {
    return this._client.get(path`/agents/sessions/${sessionID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Updates session metadata, model, reasoning effort, or service tier. Model
   * settings apply to subsequent turns. Omitted fields are unchanged. See
   * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
   *
   * @example
   * ```ts
   * const agentSession =
   *   await client.beta.agents.sessions.update('session_id');
   * ```
   */
  update(sessionID, body = {}, options2) {
    return this._client.post(path`/agents/sessions/${sessionID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists managed agent sessions using ID-based pagination and the requested sort
   * order. See
   * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agentSession of client.beta.agents.sessions.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/agents/sessions", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Removes a managed agent session from the public API and returns a deletion
   * confirmation. If backend execution has ended, deletion can cancel a still-open
   * public turn and abandon unpublished outputs. Running execution must be cancelled
   * first. Physical cleanup may continue asynchronously. See
   * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
   *
   * @example
   * ```ts
   * const agentSessionDeleted =
   *   await client.beta.agents.sessions.delete('session_id');
   * ```
   */
  delete(sessionID, options2) {
    return this._client.delete(path`/agents/sessions/${sessionID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
Sessions$2.Subagents = Subagents;
Sessions$2.Artifacts = Artifacts;
Sessions$2.Items = Items$3;
Sessions$2.Events = Events;
Sessions$2.Turns = Turns$1;
class Credentials extends APIResource {
  /**
   * Creates a vault credential. Secret values are write-only and are never returned.
   * See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const credential =
   *   await client.beta.agents.vaults.credentials.create(
   *     'vault_id',
   *     {
   *       auth: {
   *         access_token: 'access_token',
   *         mcp_server_url: 'mcp_server_url',
   *         type: 'mcp_oauth',
   *       },
   *       name: 'x',
   *     },
   *   );
   * ```
   */
  create(vaultID, body, options2) {
    return this._client.post(path`/vaults/${vaultID}/credentials`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves vault credential metadata without returning secret values. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const credential =
   *   await client.beta.agents.vaults.credentials.retrieve(
   *     'credential_id',
   *     { vault_id: 'vault_id' },
   *   );
   * ```
   */
  retrieve(credentialID, params, options2) {
    const { vault_id } = params;
    return this._client.get(path`/vaults/${vault_id}/credentials/${credentialID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Rotates a vault credential's write-only secret and returns only credential
   * metadata. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const credential =
   *   await client.beta.agents.vaults.credentials.update(
   *     'credential_id',
   *     {
   *       vault_id: 'vault_id',
   *       auth: { type: 'mcp_oauth' },
   *     },
   *   );
   * ```
   */
  update(credentialID, params, options2) {
    const { vault_id, ...body } = params;
    return this._client.post(path`/vaults/${vault_id}/credentials/${credentialID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists a vault's credentials using ID-based pagination without returning secret
   * values. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const credential of client.beta.agents.vaults.credentials.list(
   *   'vault_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(vaultID, query = {}, options2) {
    return this._client.getAPIList(path`/vaults/${vaultID}/credentials`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a vault credential. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const credentialDeleted =
   *   await client.beta.agents.vaults.credentials.delete(
   *     'credential_id',
   *     { vault_id: 'vault_id' },
   *   );
   * ```
   */
  delete(credentialID, params, options2) {
    const { vault_id } = params;
    return this._client.delete(path`/vaults/${vault_id}/credentials/${credentialID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class Vaults extends APIResource {
  constructor() {
    super(...arguments);
    this.credentials = new Credentials(this._client);
  }
  /**
   * Creates a vault for the current project. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const vault = await client.beta.agents.vaults.create();
   * ```
   */
  create(body = {}, options2) {
    return this._client.post("/vaults", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a vault by its ID. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const vault = await client.beta.agents.vaults.retrieve(
   *   'vault_id',
   * );
   * ```
   */
  retrieve(vaultID, options2) {
    return this._client.get(path`/vaults/${vaultID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists vaults using ID-based pagination. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const vault of client.beta.agents.vaults.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/vaults", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a vault and all its credentials. See
   * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
   *
   * @example
   * ```ts
   * const vaultDeleted = await client.beta.agents.vaults.delete(
   *   'vault_id',
   * );
   * ```
   */
  delete(vaultID, options2) {
    return this._client.delete(path`/vaults/${vaultID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Vaults.Credentials = Credentials;
class Agents extends APIResource {
  constructor() {
    super(...arguments);
    this.environments = new Environments(this._client);
    this.vaults = new Vaults(this._client);
    this.sessions = new Sessions$2(this._client);
  }
  /**
   * Creates a reusable agent without storing credentials. See
   * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
   *
   * @example
   * ```ts
   * const agent = await client.beta.agents.create({
   *   model: 'model',
   * });
   * ```
   */
  create(body, options2) {
    return this._client.post("/agents", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a reusable agent by ID. See
   * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
   *
   * @example
   * ```ts
   * const agent = await client.beta.agents.retrieve('agent_id');
   * ```
   */
  retrieve(agentID, options2) {
    return this._client.get(path`/agents/${agentID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Updates a reusable agent. See
   * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
   *
   * @example
   * ```ts
   * const agent = await client.beta.agents.update('agent_id');
   * ```
   */
  update(agentID, body = {}, options2) {
    return this._client.post(path`/agents/${agentID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Lists reusable agents in the current project. See
   * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const agent of client.beta.agents.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/agents", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a reusable agent. See
   * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
   *
   * @example
   * ```ts
   * const agentDeleted = await client.beta.agents.delete(
   *   'agent_id',
   * );
   * ```
   */
  delete(agentID, options2) {
    return this._client.delete(path`/agents/${agentID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "agents=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Agents.Environments = Environments;
Agents.Vaults = Vaults;
Agents.Sessions = Sessions$2;
let Sessions$1 = class Sessions3 extends APIResource {
  /**
   * Create a ChatKit session.
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.create({
   *     user: 'x',
   *     workflow: { id: 'id' },
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/chatkit/sessions", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancel an active ChatKit session and return its most recent metadata.
   *
   * Cancelling prevents new requests from using the issued client secret.
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.cancel('cksess_123');
   * ```
   */
  cancel(sessionID, options2) {
    return this._client.post(path`/chatkit/sessions/${sessionID}/cancel`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
let Threads$1 = class Threads extends APIResource {
  /**
   * Retrieve a ChatKit thread by its identifier.
   *
   * @example
   * ```ts
   * const chatkitThread =
   *   await client.beta.chatkit.threads.retrieve('cthr_123');
   * ```
   */
  retrieve(threadID, options2) {
    return this._client.get(path`/chatkit/threads/${threadID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * List ChatKit threads with optional pagination and user filters.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatkitThread of client.beta.chatkit.threads.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/chatkit/threads", ConversationCursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a ChatKit thread along with its items and stored attachments.
   *
   * @example
   * ```ts
   * const thread = await client.beta.chatkit.threads.delete(
   *   'cthr_123',
   * );
   * ```
   */
  delete(threadID, options2) {
    return this._client.delete(path`/chatkit/threads/${threadID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * List items that belong to a ChatKit thread.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const thread of client.beta.chatkit.threads.listItems(
   *   'cthr_123',
   * )) {
   *   // ...
   * }
   * ```
   */
  listItems(threadID, query = {}, options2) {
    return this._client.getAPIList(path`/chatkit/threads/${threadID}/items`, ConversationCursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
class ChatKit extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions$1(this._client);
    this.threads = new Threads$1(this._client);
  }
}
ChatKit.Sessions = Sessions$1;
ChatKit.Threads = Threads$1;
let InputItems$1 = class InputItems extends APIResource {
  /**
   * Returns a list of input items for a given response.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaResponseItem of client.beta.responses.inputItems.list(
   *   'response_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(responseID, params = {}, options2) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/responses/${responseID}/input_items?beta=true`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
};
let InputTokens$1 = class InputTokens extends APIResource {
  /**
   * Returns input token counts of the request.
   *
   * Returns an object with `object` set to `response.input_tokens` and an
   * `input_tokens` count.
   *
   * @example
   * ```ts
   * const response =
   *   await client.beta.responses.inputTokens.count();
   * ```
   */
  count(params = {}, options2) {
    const { betas, ...body } = params ?? {};
    return this._client.post("/responses/input_tokens?beta=true", {
      body,
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
};
let Responses$1 = class Responses extends APIResource {
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems$1(this._client);
    this.inputTokens = new InputTokens$1(this._client);
  }
  create(params, options2) {
    const { betas, ...body } = params;
    return this._client.post("/responses?beta=true", {
      body,
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      stream: params.stream ?? false,
      __security: { bearerAuth: true }
    });
  }
  retrieve(responseID, params = {}, options2) {
    const { betas, ...query } = params ?? {};
    return this._client.get(path`/responses/${responseID}?beta=true`, {
      query,
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      stream: (params == null ? void 0 : params.stream) ?? false,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.beta.responses.delete(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  delete(responseID, params = {}, options2) {
    const { betas } = params ?? {};
    return this._client.delete(path`/responses/${responseID}?beta=true`, {
      ...options2,
      headers: buildHeaders([
        { Accept: "*/*", ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://developers.openai.com/api/docs/guides/background).
   *
   * @example
   * ```ts
   * const betaResponse = await client.beta.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseID, params = {}, options2) {
    const { betas } = params ?? {};
    return this._client.post(path`/responses/${responseID}/cancel?beta=true`, {
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Compact a conversation. Returns a compacted response object.
   *
   * Learn when and how to compact long-running conversations in the
   * [conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state#managing-the-context-window).
   * For ZDR-compatible compaction details, see
   * [Compaction (advanced)](https://developers.openai.com/api/docs/guides/conversation-state#compaction-advanced).
   *
   * @example
   * ```ts
   * const betaCompactedResponse =
   *   await client.beta.responses.compact({
   *     model: 'gpt-6-astra',
   *   });
   * ```
   */
  compact(params, options2) {
    const { betas, ...body } = params;
    return this._client.post("/responses/compact?beta=true", {
      body,
      ...options2,
      headers: buildHeaders([
        { ...(betas == null ? void 0 : betas.toString()) != null ? { "openai-beta": betas == null ? void 0 : betas.toString() } : void 0 },
        options2 == null ? void 0 : options2.headers
      ]),
      __security: { bearerAuth: true }
    });
  }
};
Responses$1.InputItems = InputItems$1;
Responses$1.InputTokens = InputTokens$1;
class Messages2 extends APIResource {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadID, body, options2) {
    return this._client.post(path`/threads/${threadID}/messages`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(messageID, params, options2) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(messageID, params, options2) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/messages/${messageID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of messages for a given thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options2) {
    return this._client.getAPIList(path`/threads/${threadID}/messages`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(messageID, params, options2) {
    const { thread_id } = params;
    return this._client.delete(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class Steps extends APIResource {
  /**
   * Retrieves a run step.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(stepID, params, options2) {
    const { thread_id, run_id, ...query } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${run_id}/steps/${stepID}`, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of run steps belonging to a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(runID, params, options2) {
    const { thread_id, ...query } = params;
    return this._client.getAPIList(path`/threads/${thread_id}/runs/${runID}/steps`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
const fromBase64 = (str) => {
  if (typeof globalThis.Buffer !== "undefined") {
    const buf = globalThis.Buffer.from(str, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  if (typeof atob !== "undefined") {
    const bstr = atob(str);
    const buf = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      buf[i] = bstr.charCodeAt(i);
    }
    return buf;
  }
  throw new OpenAIError("Cannot decode base64 string; Expected `Buffer` or `atob` to be defined");
};
const toFloat32Array = (base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    if (buf.length % Float32Array.BYTES_PER_ELEMENT !== 0) {
      throw new RangeError("Invalid base64-encoded float32 array: byte length must be a multiple of 4");
    }
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
};
const readEnv = (env) => {
  var _a3, _b2, _c2, _d2, _e2;
  try {
    if (typeof globalThis.process !== "undefined") {
      return ((_b2 = (_a3 = globalThis.process.env) == null ? void 0 : _a3[env]) == null ? void 0 : _b2.trim()) || void 0;
    }
    if (typeof globalThis.Deno !== "undefined") {
      return ((_e2 = (_d2 = (_c2 = globalThis.Deno.env) == null ? void 0 : _c2.get) == null ? void 0 : _d2.call(_c2, env)) == null ? void 0 : _e2.trim()) || void 0;
    }
  } catch {
    return void 0;
  }
  return void 0;
};
const MAX_ASSISTANT_STREAM_ARRAY_GROWTH = 1024;
const MAX_EXTERNALLY_MUTABLE_ASSISTANT_STREAM_ARRAY_LENGTH = 65536;
function getAssistantStreamDiagnosticProperty(property) {
  switch (property) {
    case "value":
    case "arguments":
    case "input":
    case "text":
    case "content":
    case "annotations":
    case "metadata":
    case "name":
    case "role":
    case "status":
    case "tool_calls":
    case "step_details": {
      return property;
    }
    default: {
      return "unknown";
    }
  }
}
const assistantStreamArrayStates = /* @__PURE__ */ new WeakMap();
const externallyMutableAssistantStreamValues = /* @__PURE__ */ new WeakSet();
function createAssistantStreamDeltaProjection(cacheArrays) {
  return { arrays: /* @__PURE__ */ new Map(), cacheArrays, records: /* @__PURE__ */ new WeakMap() };
}
function commitAssistantStreamArrayProjection(projection) {
  for (const [array, projected] of projection.arrays) {
    if (projected.cacheable && !externallyMutableAssistantStreamValues.has(array)) {
      assistantStreamArrayStates.set(array, {
        length: projected.length,
        ownEntryCount: projected.ownEntryCount
      });
    } else {
      assistantStreamArrayStates.delete(array);
    }
  }
}
function isPrimitiveAssistantStreamValue(value) {
  return typeof value === "string" || typeof value === "number";
}
function isPrimitiveAssistantStreamArrayDelta(accumulator, delta) {
  return delta.every(isPrimitiveAssistantStreamValue) && accumulator.every(isPrimitiveAssistantStreamValue);
}
function countOwnAssistantStreamArrayEntries(accumulator) {
  let count = 0;
  for (const key of Object.keys(accumulator)) {
    const index = Number(key);
    if (Number.isSafeInteger(index) && index >= 0 && index < accumulator.length && String(index) === key) {
      count += 1;
    }
  }
  return count;
}
function getAssistantStreamArrayOwnEntryCount(accumulator, enforceSparseHoleBudget, cachedState) {
  if (!enforceSparseHoleBudget) {
    return 0;
  }
  if ((cachedState == null ? void 0 : cachedState.length) === accumulator.length) {
    return cachedState.ownEntryCount;
  }
  return countOwnAssistantStreamArrayEntries(accumulator);
}
function getAssistantStreamDeltaIndex(deltaEntry, kind, baselineLength) {
  const { index } = deltaEntry;
  if (kind === "array" && (index === null || index === void 0)) {
    throw new Error("Expected array delta entry to have an `index` property");
  }
  if (kind === "array" && typeof index !== "number") {
    throw new TypeError("Expected array delta entry `index` property to be a number but got an invalid value");
  }
  if (!Number.isSafeInteger(index) || index < 0 || index >= baselineLength + MAX_ASSISTANT_STREAM_ARRAY_GROWTH || index >= MAX_EXTERNALLY_MUTABLE_ASSISTANT_STREAM_ARRAY_LENGTH) {
    const safeIndex = typeof index === "number" ? index : "unknown";
    throw new OpenAIError(`Assistant stream delta contains an invalid ${kind} index: ${safeIndex}`);
  }
  return index;
}
function assertValidAssistantStreamArrayDelta(accumulator, delta, kind, projection, validateRecord) {
  let projectedArray = projection.arrays.get(accumulator);
  if (!projectedArray) {
    const enforceSparseHoleBudget = projection.cacheArrays && !externallyMutableAssistantStreamValues.has(accumulator);
    const cachedState = enforceSparseHoleBudget ? assistantStreamArrayStates.get(accumulator) : void 0;
    projectedArray = {
      baselineLength: accumulator.length,
      cacheable: enforceSparseHoleBudget,
      enforceSparseHoleBudget,
      entries: /* @__PURE__ */ new Map(),
      length: accumulator.length,
      ownEntryCount: getAssistantStreamArrayOwnEntryCount(accumulator, enforceSparseHoleBudget, cachedState)
    };
    projection.arrays.set(accumulator, projectedArray);
  }
  for (const deltaEntry of delta) {
    if (!isObj(deltaEntry)) {
      throw new Error("Expected array delta entry to be an object but got an invalid value");
    }
    const validatedIndex = getAssistantStreamDeltaIndex(deltaEntry, kind, projectedArray.baselineLength);
    let accumulatedEntry;
    if (projectedArray.entries.has(validatedIndex)) {
      accumulatedEntry = projectedArray.entries.get(validatedIndex);
    } else if (hasOwn(accumulator, validatedIndex)) {
      accumulatedEntry = accumulator[validatedIndex];
      if (accumulatedEntry === null || accumulatedEntry === void 0) {
        projectedArray.entries.set(validatedIndex, deltaEntry);
      }
    } else {
      projectedArray.entries.set(validatedIndex, deltaEntry);
      projectedArray.ownEntryCount += 1;
    }
    const projectedLength = Math.max(projectedArray.length, validatedIndex + 1);
    if (projectedArray.enforceSparseHoleBudget && projectedLength - projectedArray.ownEntryCount > MAX_ASSISTANT_STREAM_ARRAY_GROWTH) {
      throw new OpenAIError(`Assistant stream delta contains an invalid ${kind} index: ${validatedIndex}`);
    }
    if (isObj(accumulatedEntry)) {
      validateRecord(accumulatedEntry, deltaEntry, projection);
    }
    projectedArray.length = projectedLength;
  }
}
function assertValidAssistantStreamDeltaIndices(accumulator, delta, projection) {
  let projectedValues = projection.records.get(accumulator);
  for (const [key, deltaValue] of Object.entries(delta)) {
    if (key === "index" || key === "type") {
      continue;
    }
    let accumulatedValue;
    if (projectedValues == null ? void 0 : projectedValues.has(key)) {
      accumulatedValue = projectedValues.get(key);
    } else if (hasOwn(accumulator, key)) {
      accumulatedValue = accumulator[key];
    }
    if (accumulatedValue === null || accumulatedValue === void 0) {
      if (!projectedValues) {
        projectedValues = /* @__PURE__ */ new Map();
        projection.records.set(accumulator, projectedValues);
      }
      projectedValues.set(key, deltaValue);
      continue;
    }
    if (isObj(accumulatedValue) && isObj(deltaValue)) {
      assertValidAssistantStreamDeltaIndices(accumulatedValue, deltaValue, projection);
    } else if (Array.isArray(accumulatedValue) && Array.isArray(deltaValue) && !isPrimitiveAssistantStreamArrayDelta(accumulatedValue, deltaValue)) {
      assertValidAssistantStreamArrayDelta(accumulatedValue, deltaValue, "array", projection, assertValidAssistantStreamDeltaIndices);
    }
  }
}
function isAssistantStreamValueExternallyMutable(value) {
  return (isObj(value) || Array.isArray(value)) && externallyMutableAssistantStreamValues.has(value);
}
function markAssistantStreamValueExternallyMutable(value) {
  if (!isObj(value) && !Array.isArray(value) || externallyMutableAssistantStreamValues.has(value)) {
    return;
  }
  externallyMutableAssistantStreamValues.add(value);
  if (Array.isArray(value)) {
    assistantStreamArrayStates.delete(value);
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && "value" in descriptor) {
      markAssistantStreamValueExternallyMutable(descriptor.value);
    }
  }
}
function defineAssistantStreamArrayEntry(accumulator, index, value) {
  if (externallyMutableAssistantStreamValues.has(accumulator)) {
    markAssistantStreamValueExternallyMutable(value);
  }
  Object.defineProperty(accumulator, index, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}
function getRequiredAssistantStreamArrayIndex(deltaEntry) {
  const { index } = deltaEntry;
  if (index === null || index === void 0) {
    throw new Error("Expected array delta entry to have an `index` property");
  }
  if (typeof index !== "number") {
    throw new TypeError("Expected array delta entry `index` property to be a number but got an invalid value");
  }
  return index;
}
function applyAssistantStreamArrayDelta(accumulator, delta, applyRecord) {
  if (isPrimitiveAssistantStreamArrayDelta(accumulator, delta)) {
    accumulator.push(...delta);
    assistantStreamArrayStates.delete(accumulator);
    return;
  }
  for (const deltaEntry of delta) {
    if (!isObj(deltaEntry)) {
      throw new Error("Expected array delta entry to be an object but got an invalid value");
    }
    const index = getRequiredAssistantStreamArrayIndex(deltaEntry);
    if (hasOwn(accumulator, index)) {
      const accumulatedEntry = accumulator[index];
      if (accumulatedEntry === null || accumulatedEntry === void 0) {
        if (externallyMutableAssistantStreamValues.has(accumulator)) {
          markAssistantStreamValueExternallyMutable(deltaEntry);
        }
        accumulator[index] = deltaEntry;
      } else {
        accumulator[index] = applyRecord(accumulatedEntry, deltaEntry);
      }
    } else {
      defineAssistantStreamArrayEntry(accumulator, index, deltaEntry);
    }
  }
}
function applyAssistantStreamDelta(accumulator, delta) {
  const externallyMutable = externallyMutableAssistantStreamValues.has(accumulator);
  for (const [key, deltaValue] of Object.entries(delta)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new OpenAIError(`Assistant stream delta contains an unsafe property: ${key}`);
    }
    if (!hasOwn(accumulator, key)) {
      if (externallyMutable) {
        markAssistantStreamValueExternallyMutable(deltaValue);
      }
      accumulator[key] = deltaValue;
      continue;
    }
    let accumulatedValue = accumulator[key];
    if (accumulatedValue === null || accumulatedValue === void 0) {
      if (externallyMutable) {
        markAssistantStreamValueExternallyMutable(deltaValue);
      }
      accumulator[key] = deltaValue;
      continue;
    }
    if (key === "index" || key === "type") {
      accumulator[key] = deltaValue;
      continue;
    }
    if (typeof accumulatedValue === "string" && typeof deltaValue === "string") {
      accumulatedValue += deltaValue;
    } else if (typeof accumulatedValue === "number" && typeof deltaValue === "number") {
      accumulatedValue += deltaValue;
    } else if (isObj(accumulatedValue) && isObj(deltaValue)) {
      accumulatedValue = applyAssistantStreamDelta(accumulatedValue, deltaValue);
    } else if (Array.isArray(accumulatedValue) && Array.isArray(deltaValue)) {
      applyAssistantStreamArrayDelta(accumulatedValue, deltaValue, applyAssistantStreamDelta);
      continue;
    } else {
      throw new TypeError(`Unhandled record type: ${getAssistantStreamDiagnosticProperty(key)}`);
    }
    accumulator[key] = accumulatedValue;
  }
  return accumulator;
}
function assertSafeAssistantStreamDelta(value) {
  if (!isObj(value) && !Array.isArray(value)) {
    return;
  }
  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new OpenAIError(`Assistant stream delta contains an unsafe property: ${key}`);
    }
    assertSafeAssistantStreamDelta(nestedValue);
  }
}
function accumulateAssistantStreamDelta(accumulator, delta, cacheArrays = false) {
  assertSafeAssistantStreamDelta(delta);
  const accumulatorRecord = accumulator;
  const deltaRecord = delta;
  const projection = createAssistantStreamDeltaProjection(cacheArrays && !isAssistantStreamValueExternallyMutable(accumulator));
  assertValidAssistantStreamDeltaIndices(accumulatorRecord, deltaRecord, projection);
  applyAssistantStreamDelta(accumulatorRecord, deltaRecord);
  commitAssistantStreamArrayProjection(projection);
  return accumulator;
}
function createAssistantStreamArrayDeltaCommit(accumulator, delta, kind, cacheArrays = true) {
  assertSafeAssistantStreamDelta(delta);
  const projection = createAssistantStreamDeltaProjection(cacheArrays && !isAssistantStreamValueExternallyMutable(accumulator));
  assertValidAssistantStreamArrayDelta(accumulator, delta, kind, projection, assertValidAssistantStreamDeltaIndices);
  return () => commitAssistantStreamArrayProjection(projection);
}
var _AssistantStream_instances, _AssistantStream_runStepSnapshots, _AssistantStream_runStepIDOwners, _AssistantStream_activeRunStepID, _AssistantStream_messageSnapshots, _AssistantStream_messageIDOwners, _AssistantStream_messageSnapshot, _AssistantStream_activeMessageID, _AssistantStream_finalRun, _AssistantStream_currentContentIndex, _AssistantStream_currentContent, _AssistantStream_currentToolCallIndex, _AssistantStream_currentToolCall, _AssistantStream_currentEvent, _AssistantStream_currentRunSnapshot, _AssistantStream_currentRunStepSnapshot, _AssistantStream_addEvent, _AssistantStream_endRequest, _AssistantStream_validateRunStepEvent, _AssistantStream_reserveRunStepAlias, _AssistantStream_validateMessageEvent, _AssistantStream_reserveMessageAlias, _AssistantStream_handleMessage, _AssistantStream_handleRunStep, _AssistantStream_emitExposed, _AssistantStream_handleEvent, _AssistantStream_accumulateRunStep, _AssistantStream_accumulateMessage, _AssistantStream_accumulateContent, _AssistantStream_handleRun;
function stabilizeAssistantStreamEvent(event) {
  const eventDescriptor = Object.getOwnPropertyDescriptor(event, "event");
  const dataDescriptor = Object.getOwnPropertyDescriptor(event, "data");
  const eventType = Reflect.get(event, "event", event);
  const data = Reflect.get(event, "data", event);
  let stableData = data;
  if (eventType === "thread.message.created" || eventType === "thread.message.in_progress" || eventType === "thread.message.delta" || eventType === "thread.message.completed" || eventType === "thread.message.incomplete" || eventType === "thread.run.step.created" || eventType === "thread.run.step.in_progress" || eventType === "thread.run.step.delta" || eventType === "thread.run.step.completed" || eventType === "thread.run.step.failed" || eventType === "thread.run.step.cancelled" || eventType === "thread.run.step.expired") {
    const messageID = Object.getOwnPropertyDescriptor(data, "id");
    if (messageID && "value" in messageID && // SAFETY: The own id descriptor was found above; keep its live read unknown while comparing it with the captured descriptor value.
    data.id !== messageID.value) {
      const canonicalID = messageID.value;
      stableData = new Proxy(data, {
        get(target, property) {
          return property === "id" ? canonicalID : Reflect.get(target, property, target);
        }
      });
    }
  }
  const stableEvent = Object.freeze({ event: eventType, data: stableData });
  const ordinaryEvent = eventDescriptor !== void 0 && "value" in eventDescriptor && eventDescriptor.value === eventType && dataDescriptor !== void 0 && "value" in dataDescriptor && dataDescriptor.value === data && stableData === data;
  return {
    event: stableEvent,
    exposedEvent: ordinaryEvent ? event : { event: eventType, data: stableData }
  };
}
class AssistantStream extends EventStream$1 {
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_runStepSnapshots.set(this, /* @__PURE__ */ Object.create(null));
    _AssistantStream_runStepIDOwners.set(this, /* @__PURE__ */ new Map());
    _AssistantStream_activeRunStepID.set(this, void 0);
    _AssistantStream_messageSnapshots.set(this, /* @__PURE__ */ Object.create(null));
    _AssistantStream_messageIDOwners.set(this, /* @__PURE__ */ new Map());
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_activeMessageID.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  /** Iterates over cloned raw assistant events; stopping early aborts the underlying request. */
  [(_AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepIDOwners = /* @__PURE__ */ new WeakMap(), _AssistantStream_activeRunStepID = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageIDOwners = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_activeMessageID = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    return this._createIterator((push) => {
      const onEvent = (event) => push(structuredClone(event));
      this.on("event", onEvent);
      return () => this.off("event", onEvent);
    }, { onReturn: () => this.abort() });
  }
  /** Restores an assistant stream from events serialized by `toReadableStream()`. */
  static fromReadableStream(stream2) {
    const runner = new AssistantStream();
    runner._run(() => runner._fromReadableStream(stream2));
    return runner;
  }
  async _fromReadableStream(readableStream, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    this._connected();
    const stream2 = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  /** Serializes assistant events into a readable stream for transfer to another runtime. */
  toReadableStream() {
    const stream2 = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream2.toReadableStream();
  }
  /** Submits tool outputs and starts streaming the continuation of an existing assistant run. */
  static createToolAssistantStream(runId, runs, params, options2) {
    const runner = new AssistantStream();
    runner._run(() => runner._runToolAssistantStream(runId, runs, params, {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, runId, params, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    const body = { ...params, stream: true };
    const stream2 = await run.submitToolOutputs(runId, body, {
      ...options2,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  /** Creates an assistant thread and starts streaming its newly created run. */
  static createThreadAssistantStream(params, thread, options2) {
    const runner = new AssistantStream();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "stream" }
    }));
    return runner;
  }
  /** Creates a run on an existing assistant thread and starts streaming its events. */
  static createAssistantStream(threadId, runs, params, options2) {
    const runner = new AssistantStream();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "stream" }
    }));
    return runner;
  }
  /** Returns the most recent raw event, or `undefined` before any event arrives. */
  currentEvent() {
    markAssistantStreamValueExternallyMutable(__classPrivateFieldGet(this, _AssistantStream_currentEvent, "f"));
    return __classPrivateFieldGet(this, _AssistantStream_currentEvent, "f");
  }
  /** Returns the latest run snapshot, or `undefined` before a run event arrives. */
  currentRun() {
    markAssistantStreamValueExternallyMutable(__classPrivateFieldGet(this, _AssistantStream_currentRunSnapshot, "f"));
    return __classPrivateFieldGet(this, _AssistantStream_currentRunSnapshot, "f");
  }
  /** Returns the message currently being accumulated, or `undefined` before message creation. */
  currentMessageSnapshot() {
    markAssistantStreamValueExternallyMutable(__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
    return __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f");
  }
  /** Returns the run step currently being accumulated, or `undefined` before a step begins. */
  currentRunStepSnapshot() {
    markAssistantStreamValueExternallyMutable(__classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f"));
    return __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  /** Waits for successful completion and returns the final snapshot of every observed run step. */
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"));
  }
  /**
   * Waits for successful completion and returns the final snapshot of every observed message.
   * Terminal message events replace accumulated snapshots without mutating earlier snapshots.
   */
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f"));
  }
  /** Waits for completion and returns the final run, or rejects if no terminal run was received. */
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f")) {
      throw new Error("Final run was not received.");
    }
    return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    const body = { ...params, stream: true };
    const stream2 = await thread.createAndRun(body, { ...options2, signal: this.controller.signal });
    this._connected();
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    const body = { ...params, stream: true };
    const stream2 = await run.create(threadId, body, { ...options2, signal: this.controller.signal });
    this._connected();
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  /**
   * Applies an assistant delta to its mutable snapshot, concatenating text and
   * merging nested objects and indexed array entries.
   */
  static accumulateDelta(acc, delta) {
    return accumulateAssistantStreamDelta(acc, delta);
  }
  _addRun(run) {
    __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "run", run);
    return run;
  }
  async _threadAssistantStream(params, thread, options2) {
    return await this._createThreadAssistantStream(thread, params, options2);
  }
  async _runAssistantStream(threadId, runs, params, options2) {
    return await this._createAssistantStream(runs, threadId, params, options2);
  }
  async _runToolAssistantStream(runId, runs, params, options2) {
    return await this._createToolAssistantStream(runs, runId, params, options2);
  }
}
_AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
  if (this.ended) {
    return;
  }
  const { event: stableEvent, exposedEvent } = stabilizeAssistantStreamEvent(event);
  let messageID;
  let messageData;
  let runStepID;
  let runStepData;
  switch (stableEvent.event) {
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete": {
      messageID = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_validateMessageEvent).call(this, stableEvent);
      messageData = stableEvent.data;
      break;
    }
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired": {
      runStepID = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_validateRunStepEvent).call(this, stableEvent);
      runStepData = stableEvent.data;
      break;
    }
  }
  __classPrivateFieldSet(this, _AssistantStream_currentEvent, exposedEvent);
  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, exposedEvent);
  if (messageID !== void 0 && messageData !== void 0) {
    __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveMessageAlias).call(this, messageData, messageID);
  }
  if (runStepID !== void 0 && runStepData !== void 0) {
    __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveRunStepAlias).call(this, runStepData, runStepID);
  }
  if (runStepID === void 0 && __classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f") !== void 0 && __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f")) {
    __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveRunStepAlias).call(this, __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f"), __classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f"));
  }
  switch (stableEvent.event) {
    case "thread.created": {
      break;
    }
    case "thread.run.created":
    case "thread.run.queued":
    case "thread.run.in_progress":
    case "thread.run.requires_action":
    case "thread.run.completed":
    case "thread.run.incomplete":
    case "thread.run.failed":
    case "thread.run.cancelling":
    case "thread.run.cancelled":
    case "thread.run.expired": {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, stableEvent);
      break;
    }
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired": {
      if (runStepID === void 0) {
        throw new OpenAIError("Received assistant run-step event without a canonical run-step ID");
      }
      const activeRunStep = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID];
      if (activeRunStep) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveRunStepAlias).call(this, activeRunStep, runStepID);
      }
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, stableEvent, runStepID);
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveRunStepAlias).call(this, stableEvent.data, runStepID);
      const retainedRunStep = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID];
      if (retainedRunStep) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveRunStepAlias).call(this, retainedRunStep, runStepID);
      }
      break;
    }
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete": {
      if (messageID !== void 0 && __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveMessageAlias).call(this, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"), messageID);
      }
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, stableEvent);
      if (messageID !== void 0) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveMessageAlias).call(this, stableEvent.data, messageID);
        const retainedMessage = __classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f")[messageID];
        if (retainedMessage) {
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_reserveMessageAlias).call(this, retainedMessage, messageID);
        }
      }
      break;
    }
    case "error": {
      throw new APIError(void 0, stableEvent.data, void 0, void 0);
    }
  }
}, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f")) {
    throw new Error("Final run has not been received");
  }
  return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
}, _AssistantStream_validateRunStepEvent = function _AssistantStream_validateRunStepEvent2(event) {
  const descriptor = Object.getOwnPropertyDescriptor(event.data, "id");
  const runStepID = descriptor && "value" in descriptor ? descriptor.value : void 0;
  if (typeof runStepID !== "string" || runStepID.length === 0) {
    throw new OpenAIError("Received assistant run-step event with an invalid run-step ID");
  }
  if (event.event === "thread.run.step.delta") {
    const delta = event.data.delta;
    if (delta && hasOwn(delta, "id")) {
      throw new OpenAIError("Run-step deltas must not contain an id field");
    }
  }
  if (event.event === "thread.run.step.created") {
    if (__classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f") !== void 0) {
      throw new OpenAIError(`Received run-step creation for "${runStepID}" before the active run step "${__classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f")}" reached a terminal state`);
    }
    if (hasOwn(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"), runStepID) || __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").has(runStepID)) {
      throw new OpenAIError(`Received run-step creation for run step "${runStepID}", which has already been created`);
    }
    __classPrivateFieldSet(this, _AssistantStream_activeRunStepID, runStepID);
    __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").set(runStepID, runStepID);
    return runStepID;
  }
  if (__classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f") !== void 0) {
    if (runStepID !== __classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f")) {
      throw new OpenAIError(`Received ${event.event} for run step "${runStepID}", which does not match the active run step "${__classPrivateFieldGet(this, _AssistantStream_activeRunStepID, "f")}"`);
    }
    return runStepID;
  }
  if (event.event === "thread.run.step.delta") {
    if (!hasOwn(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"), runStepID)) {
      throw new OpenAIError("Received a RunStepDelta before creation of a snapshot");
    }
    throw new OpenAIError(`Received run-step delta for "${runStepID}" with no active run step`);
  }
  if (hasOwn(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"), runStepID) || __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").has(runStepID)) {
    throw new OpenAIError(`Received run-step event for run step "${runStepID}", which has already been created`);
  }
  __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").set(runStepID, runStepID);
  if (event.event === "thread.run.step.in_progress") {
    __classPrivateFieldSet(this, _AssistantStream_activeRunStepID, runStepID);
  }
  return runStepID;
}, _AssistantStream_reserveRunStepAlias = function _AssistantStream_reserveRunStepAlias2(data, canonicalID) {
  const descriptor = Object.getOwnPropertyDescriptor(data, "id");
  const runStepID = descriptor && "value" in descriptor ? descriptor.value : void 0;
  if (typeof runStepID !== "string" || runStepID.length === 0) {
    throw new OpenAIError("Received assistant run-step event with an invalid run-step ID");
  }
  const owner = __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").get(runStepID);
  if (owner !== void 0 && owner !== canonicalID) {
    throw new OpenAIError(`Received run-step creation for run step "${runStepID}", which has already been created`);
  }
  __classPrivateFieldGet(this, _AssistantStream_runStepIDOwners, "f").set(runStepID, canonicalID);
}, _AssistantStream_validateMessageEvent = function _AssistantStream_validateMessageEvent2(event) {
  const descriptor = Object.getOwnPropertyDescriptor(event.data, "id");
  const messageID = descriptor && "value" in descriptor ? descriptor.value : void 0;
  if (typeof messageID !== "string" || messageID.length === 0) {
    throw new OpenAIError("Received assistant message event with an invalid message ID");
  }
  if (event.event === "thread.message.created") {
    if (__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
      throw new OpenAIError(`Received message creation for "${messageID}" before the active message "${__classPrivateFieldGet(this, _AssistantStream_activeMessageID, "f")}" reached a terminal state`);
    }
    if (hasOwn(__classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f"), messageID) || __classPrivateFieldGet(this, _AssistantStream_messageIDOwners, "f").has(messageID)) {
      throw new OpenAIError(`Received message creation for message "${messageID}", which has already been created`);
    }
    __classPrivateFieldSet(this, _AssistantStream_activeMessageID, messageID);
    __classPrivateFieldGet(this, _AssistantStream_messageIDOwners, "f").set(messageID, messageID);
    return messageID;
  }
  if (!__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
    if (event.event === "thread.message.delta") {
      throw new OpenAIError("Received a delta with no existing snapshot (there should be one from message creation)");
    }
    throw new OpenAIError("Received thread message event with no existing snapshot");
  }
  if (messageID !== __classPrivateFieldGet(this, _AssistantStream_activeMessageID, "f")) {
    throw new OpenAIError(`Received ${event.event} for message "${messageID}", which does not match the active message "${__classPrivateFieldGet(this, _AssistantStream_activeMessageID, "f")}"`);
  }
  return messageID;
}, _AssistantStream_reserveMessageAlias = function _AssistantStream_reserveMessageAlias2(data, canonicalID) {
  const descriptor = Object.getOwnPropertyDescriptor(data, "id");
  const messageID = descriptor && "value" in descriptor ? descriptor.value : void 0;
  if (typeof messageID !== "string" || messageID.length === 0) {
    throw new OpenAIError("Received assistant message event with an invalid message ID");
  }
  const owner = __classPrivateFieldGet(this, _AssistantStream_messageIDOwners, "f").get(messageID);
  if (owner !== void 0 && owner !== canonicalID) {
    throw new OpenAIError(`Received message creation for message "${messageID}", which has already been created`);
  }
  __classPrivateFieldGet(this, _AssistantStream_messageIDOwners, "f").set(messageID, canonicalID);
}, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, accumulatedMessage);
  if (!__classPrivateFieldGet(this, _AssistantStream_activeMessageID, "f")) {
    throw new OpenAIError("Received thread message event with no active message ID");
  }
  __classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f")[__classPrivateFieldGet(this, _AssistantStream_activeMessageID, "f")] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if ((snapshotContent == null ? void 0 : snapshotContent.type) === "text") {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created": {
      __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, void 0);
      __classPrivateFieldSet(this, _AssistantStream_currentContent, void 0);
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "messageCreated", event.data);
      break;
    }
    case "thread.message.in_progress": {
      break;
    }
    case "thread.message.delta": {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type === "text" && content.text) {
            const textDelta = content.text;
            const snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type === "text") {
              __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "textDelta", textDelta, snapshot.text);
            } else {
              throw new Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index !== __classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f").type) {
                case "text": {
                  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "textDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                }
                case "image_file": {
                  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "imageFileDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                }
              }
            }
            __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, content.index);
          }
          __classPrivateFieldSet(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index]);
        }
      }
      break;
    }
    case "thread.message.completed":
    case "thread.message.incomplete": {
      if (__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file": {
              __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "imageFileDone", currentContent.image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
            }
            case "text": {
              __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "textDone", currentContent.text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
            }
          }
        }
      }
      if (__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "messageDone", event.data);
      }
      __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, void 0);
      __classPrivateFieldSet(this, _AssistantStream_currentContent, void 0);
      __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, void 0);
      __classPrivateFieldSet(this, _AssistantStream_activeMessageID, void 0);
    }
  }
}, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event, runStepID) {
  const accumulatedRunStep = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event, runStepID);
  __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep);
  switch (event.event) {
    case "thread.run.step.created": {
      __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, void 0);
      __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0);
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "runStepCreated", event.data);
      break;
    }
    case "thread.run.step.delta": {
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type === "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type === "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index === __classPrivateFieldGet(this, _AssistantStream_currentToolCallIndex, "f")) {
            __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
              __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, toolCall.index);
            __classPrivateFieldSet(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
              __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "toolCallCreated", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
            }
          }
        }
      }
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    }
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired": {
      __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, void 0);
      __classPrivateFieldSet(this, _AssistantStream_activeRunStepID, void 0);
      const details = event.data.step_details;
      if (details.type === "tool_calls" && __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
      }
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "runStepDone", event.data, accumulatedRunStep);
      __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, void 0);
      __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0);
      break;
    }
  }
}, _AssistantStream_emitExposed = function _AssistantStream_emitExposed2(event, ...args) {
  if (this._hasListeners(event)) {
    for (const value of args) {
      markAssistantStreamValueExternallyMutable(value);
    }
  }
  this._emit(event, ...args);
}, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "event", event);
}, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event, runStepID) {
  switch (event.event) {
    case "thread.run.step.created": {
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID] = event.data;
      return event.data;
    }
    case "thread.run.step.delta": {
      const snapshot = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID];
      if (!snapshot) {
        throw new Error("Received a RunStepDelta before creation of a snapshot");
      }
      const delta = event.data.delta;
      if (delta) {
        if (hasOwn(delta, "id")) {
          throw new OpenAIError("Run-step deltas must not contain an id field");
        }
        const accumulated = accumulateAssistantStreamDelta(snapshot, delta, true);
        __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID] = accumulated;
      }
      return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID];
    }
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress": {
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID] = event.data;
      break;
    }
  }
  if (__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID]) {
    return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[runStepID];
  }
  throw new Error("No snapshot available");
}, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
  const newContent = [];
  switch (event.event) {
    case "thread.message.created": {
      return [event.data, newContent];
    }
    case "thread.message.delta": {
      if (!snapshot) {
        throw new Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      const data = event.data;
      if (data.delta.content) {
        assertSafeAssistantStreamDelta(data.delta);
        const cacheArrays = !isAssistantStreamValueExternallyMutable(snapshot);
        const commitProjection = createAssistantStreamArrayDeltaCommit(snapshot.content, data.delta.content, "content", cacheArrays);
        for (const contentElement of data.delta.content) {
          if (hasOwn(snapshot.content, contentElement.index)) {
            const currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent, cacheArrays);
          } else {
            defineAssistantStreamArrayEntry(snapshot.content, contentElement.index, contentElement);
            newContent.push(contentElement);
          }
        }
        commitProjection();
      }
      return [snapshot, newContent];
    }
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete": {
      if (snapshot) {
        return [event.event === "thread.message.in_progress" ? snapshot : event.data, newContent];
      }
      throw new Error("Received thread message event with no existing snapshot");
    }
  }
  throw new Error("Tried to accumulate a non-message event");
}, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent, cacheArrays) {
  return accumulateAssistantStreamDelta(currentContent, contentElement, cacheArrays);
}, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet(this, _AssistantStream_currentRunSnapshot, event.data);
  switch (event.event) {
    case "thread.run.created": {
      break;
    }
    case "thread.run.queued": {
      break;
    }
    case "thread.run.in_progress": {
      break;
    }
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete": {
      __classPrivateFieldSet(this, _AssistantStream_finalRun, event.data);
      if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
        __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_emitExposed).call(this, "toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
      }
      __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, void 0);
      __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0);
      break;
    }
  }
};
function sleepUntilAborted(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    let registered;
    let settled = false;
    const removeAbortListener = (listener) => {
      try {
        signal.removeEventListener("abort", listener);
      } catch {
      }
    };
    const cleanup = () => {
      if (timer !== void 0) {
        clearTimeout(timer);
        timer = void 0;
      }
      if (registered) {
        const listener = registered;
        registered = void 0;
        removeAbortListener(listener);
      }
    };
    const abort = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      try {
        const error = new APIUserAbortError();
        Object.defineProperty(error, "cause", {
          value: signal.reason,
          writable: true,
          configurable: true
        });
        reject(error);
      } catch (error) {
        reject(error);
      }
    };
    if (signal.aborted) {
      abort();
      return;
    }
    timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    }, milliseconds);
    registered = abort;
    try {
      signal.addEventListener("abort", abort, { once: true });
      if (settled) {
        removeAbortListener(abort);
      } else if (signal.aborted) {
        abort();
      }
    } catch (error) {
      if (settled) {
        removeAbortListener(abort);
      } else {
        settled = true;
        cleanup();
        reject(error);
      }
    }
  });
}
async function pollWithResponse(retrieve, intermediateStatuses, terminalStatuses, options2) {
  var _a3;
  const headers = buildHeaders([
    options2 == null ? void 0 : options2.headers,
    {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": ((_a3 = options2 == null ? void 0 : options2.pollIntervalMs) == null ? void 0 : _a3.toString()) ?? void 0
    }
  ]);
  while (true) {
    const { data, response } = await retrieve(headers).withResponse();
    const { status } = data;
    if (intermediateStatuses.includes(status)) {
      let sleepInterval = 5e3;
      const pollIntervalMs = options2 == null ? void 0 : options2.pollIntervalMs;
      if (pollIntervalMs || pollIntervalMs === 0) {
        sleepInterval = pollIntervalMs;
      } else {
        const headerInterval = response.headers.get("openai-poll-after-ms");
        if (headerInterval) {
          const headerIntervalMs = Number.parseInt(headerInterval);
          if (!Number.isNaN(headerIntervalMs)) {
            sleepInterval = headerIntervalMs;
          }
        }
      }
      const signal = options2 && Object.prototype.propertyIsEnumerable.call(options2, "signal") ? options2.signal : void 0;
      await (signal ? sleepUntilAborted(sleepInterval, signal) : sleep(sleepInterval));
    } else if (terminalStatuses.includes(status)) {
      return data;
    }
  }
}
function pollAssistantRun(resource, runID, params, options2) {
  return pollWithResponse((headers) => resource.retrieve(runID, params, {
    ...options2,
    headers: { ...options2 == null ? void 0 : options2.headers, ...headers }
  }), ["queued", "in_progress", "cancelling"], ["requires_action", "incomplete", "cancelled", "completed", "failed", "expired"], options2);
}
let Runs$1 = class Runs extends APIResource {
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadID, params, options2) {
    const { include, ...body } = params;
    return this._client.post(path`/threads/${threadID}/runs`, {
      query: { include },
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      stream: params.stream ?? false,
      __synthesizeEventData: true,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(runID, params, options2) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${runID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(runID, params, options2) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of runs belonging to a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options2) {
    return this._client.getAPIList(path`/threads/${threadID}/runs`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(runID, params, options2) {
    const { thread_id } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/cancel`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options2) {
    const run = await this.create(threadId, body, options2);
    return await this.poll(run.id, { thread_id: threadId }, options2);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options2) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options2);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(runId, params, options2) {
    return await pollAssistantRun(this, runId, params, options2);
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options2) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options2);
  }
  submitToolOutputs(runID, params, options2) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/submit_tool_outputs`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      stream: params.stream ?? false,
      __synthesizeEventData: true,
      __security: { bearerAuth: true }
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(runId, params, options2) {
    const run = await this.submitToolOutputs(runId, params, options2);
    return await this.poll(run.id, params, options2);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(runId, params, options2) {
    return AssistantStream.createToolAssistantStream(runId, this._client.beta.threads.runs, params, options2);
  }
};
Runs$1.Steps = Steps;
class Threads2 extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs$1(this._client);
    this.messages = new Messages2(this._client);
  }
  /**
   * Create a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(body = {}, options2) {
    return this._client.post("/threads", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadID, options2) {
    return this._client.get(path`/threads/${threadID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadID, body, options2) {
    return this._client.post(path`/threads/${threadID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(threadID, options2) {
    return this._client.delete(path`/threads/${threadID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  createAndRun(body, options2) {
    return this._client.post("/threads/runs", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      stream: body.stream ?? false,
      __synthesizeEventData: true,
      __security: { bearerAuth: true }
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options2) {
    const run = await this.createAndRun(body, options2);
    return await this.runs.poll(run.id, { thread_id: run.thread_id }, options2);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options2) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options2);
  }
}
Threads2.Runs = Runs$1;
Threads2.Messages = Messages2;
class Beta extends APIResource {
  constructor() {
    super(...arguments);
    this.realtime = new Realtime$1(this._client);
    this.agents = new Agents(this._client);
    this.responses = new Responses$1(this._client);
    this.chatkit = new ChatKit(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads2(this._client);
  }
}
Beta.Realtime = Realtime$1;
Beta.Agents = Agents;
Beta.Responses = Responses$1;
Beta.ChatKit = ChatKit;
Beta.Assistants = Assistants;
Beta.Threads = Threads2;
class Completions2 extends APIResource {
  create(body, options2) {
    return this._client.post("/completions", {
      body,
      ...options2,
      stream: body.stream ?? false,
      __security: { bearerAuth: true }
    });
  }
}
let Content$2 = class Content extends APIResource {
  /**
   * Retrieve Container File Content
   */
  retrieve(fileID, params, options2) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}/content`, {
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
};
let Files$2 = class Files2 extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content$2(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerID, body, options2) {
    return this._client.post(path`/containers/${containerID}/files`, maybeMultipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Retrieve Container File
   */
  retrieve(fileID, params, options2) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List Container files
   */
  list(containerID, query = {}, options2) {
    return this._client.getAPIList(path`/containers/${containerID}/files`, CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete Container File
   */
  delete(fileID, params, options2) {
    const { container_id } = params;
    return this._client.delete(path`/containers/${container_id}/files/${fileID}`, {
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
};
Files$2.Content = Content$2;
class Containers extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files$2(this._client);
  }
  /**
   * Create Container
   */
  create(body, options2) {
    return this._client.post("/containers", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerID, options2) {
    return this._client.get(path`/containers/${containerID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List Containers
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/containers", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete Container
   */
  delete(containerID, options2) {
    return this._client.delete(path`/containers/${containerID}`, {
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
Containers.Files = Files$2;
class ContentProvenanceChecks extends APIResource {
  /**
   * Check whether an image or audio file contains known OpenAI provenance signals.
   * [Learn more about content provenance](https://developers.openai.com/api/docs/guides/content-provenance).
   *
   * If `not_detected`, it means the tool did not find supported signals in the
   * uploaded file. The content could still have been generated by OpenAI if the
   * metadata was stripped or has evidence of tampering, the watermark was degraded,
   * it comes from a legacy generation model, or it was created before provenance
   * signals were available. Content could also still be AI-generated by another
   * company's model, which the tool currently does not detect.
   */
  create(body, options2) {
    return this._client.post("/content_provenance_checks", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
}
class Items4 extends APIResource {
  /**
   * Create items in a conversation with the given ID.
   */
  create(conversationID, params, options2) {
    const { include, ...body } = params;
    return this._client.post(path`/conversations/${conversationID}/items`, {
      query: { include },
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get a single item from a conversation with the given IDs.
   */
  retrieve(itemID, params, options2) {
    const { conversation_id, ...query } = params;
    return this._client.get(path`/conversations/${conversation_id}/items/${itemID}`, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List all items for a conversation with the given ID.
   */
  list(conversationID, query = {}, options2) {
    return this._client.getAPIList(path`/conversations/${conversationID}/items`, ConversationCursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Delete an item from a conversation with the given IDs.
   */
  delete(itemID, params, options2) {
    const { conversation_id } = params;
    return this._client.delete(path`/conversations/${conversation_id}/items/${itemID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
class Conversations extends APIResource {
  constructor() {
    super(...arguments);
    this.items = new Items4(this._client);
  }
  /**
   * Create a conversation.
   */
  create(body = {}, options2) {
    return this._client.post("/conversations", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Get a conversation
   */
  retrieve(conversationID, options2) {
    return this._client.get(path`/conversations/${conversationID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Update a conversation
   */
  update(conversationID, body, options2) {
    return this._client.post(path`/conversations/${conversationID}`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a conversation. Items in the conversation will not be deleted.
   */
  delete(conversationID, options2) {
    return this._client.delete(path`/conversations/${conversationID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
Conversations.Items = Items4;
function createEmbedding(client, body, options2) {
  const hasUserProvidedEncodingFormat = !!body.encoding_format;
  const encodingFormat = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
  if (hasUserProvidedEncodingFormat) {
    loggerFor(client).debug("embeddings/user defined encoding_format:", body.encoding_format);
  }
  const optimizedBody = { ...body, encoding_format: encodingFormat };
  const requestOptions = {
    body: optimizedBody,
    ...options2,
    __security: { bearerAuth: true }
  };
  const response = client.post("/embeddings", requestOptions);
  if (hasUserProvidedEncodingFormat) {
    return response;
  }
  loggerFor(client).debug("embeddings/decoding base64 embeddings from base64");
  return response._thenUnwrap((data) => {
    const embeddings = data == null ? void 0 : data.data;
    if (embeddings !== void 0) {
      if (!Array.isArray(embeddings)) {
        throw new TypeError("Expected embeddings response data to be an array");
      }
      const { length } = embeddings;
      for (let index = 0; index < length; index += 1) {
        if (index in embeddings) {
          const embeddingBase64Obj = embeddings[index];
          const { embedding } = embeddingBase64Obj;
          if (Array.isArray(embedding)) {
            continue;
          }
          embeddingBase64Obj.embedding = toFloat32Array(embedding);
        }
      }
    }
    return data;
  });
}
class Embeddings extends APIResource {
  create(body, options2) {
    return createEmbedding(this._client, body, options2);
  }
}
class OutputItems extends APIResource {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(outputItemID, params, options2) {
    const { eval_id, run_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${run_id}/output_items/${outputItemID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get a list of output items for an evaluation run.
   */
  list(runID, params, options2) {
    const { eval_id, ...query } = params;
    return this._client.getAPIList(path`/evals/${eval_id}/runs/${runID}/output_items`, CursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
}
class Runs2 extends APIResource {
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalID, body, options2) {
    return this._client.post(path`/evals/${evalID}/runs`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(runID, params, options2) {
    const { eval_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${runID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get a list of runs for an evaluation.
   */
  list(evalID, query = {}, options2) {
    return this._client.getAPIList(path`/evals/${evalID}/runs`, CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete an eval run.
   */
  delete(runID, params, options2) {
    const { eval_id } = params;
    return this._client.delete(path`/evals/${eval_id}/runs/${runID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(runID, params, options2) {
    const { eval_id } = params;
    return this._client.post(path`/evals/${eval_id}/runs/${runID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
Runs2.OutputItems = OutputItems;
class Evals extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://developers.openai.com/api/docs/guides/evals).
   */
  create(body, options2) {
    return this._client.post("/evals", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalID, options2) {
    return this._client.get(path`/evals/${evalID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalID, body, options2) {
    return this._client.post(path`/evals/${evalID}`, { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * List evaluations for a project.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/evals", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete an evaluation.
   */
  delete(evalID, options2) {
    return this._client.delete(path`/evals/${evalID}`, { ...options2, __security: { bearerAuth: true } });
  }
}
Evals.Runs = Runs2;
async function waitForFileProcessing(resource, id, pollInterval, maxWait) {
  const terminalStates = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
  const start2 = performance.now();
  let file = await resource.retrieve(id);
  while (!file.status || !terminalStates.has(file.status)) {
    await sleep(pollInterval);
    file = await resource.retrieve(id);
    if (performance.now() - start2 > maxWait) {
      throw new APIConnectionTimeoutError({
        message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
      });
    }
  }
  return file;
}
let Files$1 = class Files3 extends APIResource {
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and each project can store up to 2.5 TB of files in total. There
   * is no organization-wide storage limit. Uploads to this endpoint are rate-limited
   * to 1,000 requests per minute per authenticated user.
   *
   * - The Assistants API supports files up to 2 million tokens and of specific file
   *   types. See the
   *   [Assistants Tools guide](https://developers.openai.com/api/docs/guides/tools)
   *   for details.
   * - The Fine-tuning API only supports `.jsonl` files. The input also has certain
   *   required formats for fine-tuning
   *   [chat](https://developers.openai.com/api/docs/guides/supervised-fine-tuning#formatting-your-data)
   *   or
   *   [completions](https://developers.openai.com/api/docs/guides/supervised-fine-tuning#formatting-your-data)
   *   models.
   * - The Batch API only supports `.jsonl` files up to 200 MB in size. The input
   *   also has a specific required
   *   [format](https://developers.openai.com/api/docs/guides/batch#1-prepare-your-batch-file).
   * - For Retrieval or `file_search` ingestion, upload files here first. If you need
   *   to attach multiple uploaded files to the same vector store, use
   *   [`/vector_stores/{vector_store_id}/file_batches`](https://developers.openai.com/api/reference/resources/vector_stores/subresources/file_batches/methods/create)
   *   instead of attaching them one by one. Vector store attachment has separate
   *   limits from file upload, including 2,000 attached files per minute per
   *   organization.
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(body, options2) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileID, options2) {
    return this._client.get(path`/files/${fileID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Returns a list of files.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/files", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a file and remove it from all vector stores.
   */
  delete(fileID, options2) {
    return this._client.delete(path`/files/${fileID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Returns a response containing the contents of the specified file.
   */
  content(fileID, options2) {
    return this._client.get(path`/files/${fileID}/content`, {
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    return await waitForFileProcessing(this, id, pollInterval, maxWait);
  }
};
class Methods extends APIResource {
}
let Graders$1 = class Graders extends APIResource {
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   * });
   * ```
   */
  run(body, options2) {
    return this._client.post("/fine_tuning/alpha/graders/run", {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(body, options2) {
    return this._client.post("/fine_tuning/alpha/graders/validate", {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
};
class Alpha extends APIResource {
  constructor() {
    super(...arguments);
    this.graders = new Graders$1(this._client);
  }
}
Alpha.Graders = Graders$1;
class Permissions extends APIResource {
  /**
   * **NOTE:** Calling this endpoint requires an
   * [admin API key](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/admin_api_keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(fineTunedModelCheckpoint, body, options2) {
    return this._client.getAPIList(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, Page, { body, method: "post", ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * **NOTE:** This endpoint requires an
   * [admin API key](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/admin_api_keys).
   *
   * Organization owners can use this endpoint to view all permissions for a
   * fine-tuned model checkpoint.
   *
   * @deprecated Retrieve is deprecated. Please swap to the paginated list method instead.
   */
  retrieve(fineTunedModelCheckpoint, query = {}, options2) {
    return this._client.get(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options2,
      __security: { adminAPIKeyAuth: true }
    });
  }
  /**
   * **NOTE:** This endpoint requires an
   * [admin API key](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/admin_api_keys).
   *
   * Organization owners can use this endpoint to view all permissions for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionListResponse of client.fineTuning.checkpoints.permissions.list(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(fineTunedModelCheckpoint, query = {}, options2) {
    return this._client.getAPIList(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, ConversationCursorPage, { query, ...options2, __security: { adminAPIKeyAuth: true } });
  }
  /**
   * **NOTE:** This endpoint requires an
   * [admin API key](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/admin_api_keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.delete(
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *     {
   *       fine_tuned_model_checkpoint:
   *         'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     },
   *   );
   * ```
   */
  delete(permissionID, params, options2) {
    const { fine_tuned_model_checkpoint } = params;
    return this._client.delete(path`/fine_tuning/checkpoints/${fine_tuned_model_checkpoint}/permissions/${permissionID}`, { ...options2, __security: { adminAPIKeyAuth: true } });
  }
}
let Checkpoints$1 = class Checkpoints extends APIResource {
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints$1.Permissions = Permissions;
class Checkpoints2 extends APIResource {
  /**
   * List checkpoints for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(fineTuningJobID, query = {}, options2) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, CursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
}
class Jobs extends APIResource {
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(body, options2) {
    return this._client.post("/fine_tuning/jobs", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(fineTuningJobID, options2) {
    return this._client.get(path`/fine_tuning/jobs/${fineTuningJobID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List your organization's fine-tuning jobs
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJob of client.fineTuning.jobs.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/fine_tuning/jobs", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(fineTuningJobID, options2) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/cancel`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get status updates for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobEvent of client.fineTuning.jobs.listEvents(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  listEvents(fineTuningJobID, query = {}, options2) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/events`, CursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(fineTuningJobID, options2) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/pause`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(fineTuningJobID, options2) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/resume`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
Jobs.Checkpoints = Checkpoints2;
class FineTuning extends APIResource {
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints$1(this._client);
    this.alpha = new Alpha(this._client);
  }
}
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.Checkpoints = Checkpoints$1;
FineTuning.Alpha = Alpha;
class GraderModels extends APIResource {
}
class Graders2 extends APIResource {
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
}
Graders2.GraderModels = GraderModels;
class Images extends APIResource {
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(body, options2) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  edit(body, options2) {
    return this._client.post("/images/edits", multipartFormRequestOptions({
      body,
      ...options2,
      stream: body.stream ?? false,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, ...body.model == null ? {} : { model: body.model } },
      __security: { bearerAuth: true }
    }, this._client));
  }
  generate(body, options2) {
    return this._client.post("/images/generations", {
      body,
      ...options2,
      stream: body.stream ?? false,
      __security: { bearerAuth: true }
    });
  }
}
class Sessions4 extends APIResource {
  /**
   * Accept an incoming SIP call. Supply session with type live, the model, and
   * startup configuration. Before accepting calls, follow the
   * [Live prompting guide](https://developers.openai.com/api/docs/guides/live-prompting)
   * to write frontend conversation instructions and a separate backend prompt. SIP
   * media format is negotiated; omit audio.format.
   *
   * @example
   * ```ts
   * await client.live.sessions.accept('session_id', {
   *   session: { model: 'gpt-live-1', type: 'live' },
   * });
   * ```
   */
  accept(sessionID, body, options2) {
    return this._client.post(path`/live/sessions/${sessionID}/accept`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Get Live session content
   *
   * @example
   * ```ts
   * const response =
   *   await client.live.sessions.downloadRecording('live_SQ');
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  downloadRecording(sessionID, options2) {
    return this._client.get(path`/live/sessions/${sessionID}/content`, {
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
  /**
   * Fork a stored Live session onto a new WebRTC connection.
   *
   * @example
   * ```ts
   * const response = await client.live.sessions.fork(
   *   'session_id',
   *   { transport: { sdp: 'x', type: 'webrtc' } },
   * );
   * ```
   */
  fork(sessionID, body, options2) {
    return this._client.post(path`/live/sessions/${sessionID}/fork`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * End a SIP call identified by session_id.
   *
   * @example
   * ```ts
   * await client.live.sessions.hangup('session_id');
   * ```
   */
  hangup(sessionID, options2) {
    return this._client.post(path`/live/sessions/${sessionID}/hangup`, {
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Transfer a SIP call to another destination. Supply a nonblank target_uri for the
   * SIP Refer-To header.
   *
   * @example
   * ```ts
   * await client.live.sessions.refer('session_id', {
   *   target_uri: 'tel:+14155550123',
   * });
   * ```
   */
  refer(sessionID, body, options2) {
    return this._client.post(path`/live/sessions/${sessionID}/refer`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Reject an incoming SIP call. Send a required SIP rejection status_code between
   * 300 and 699.
   *
   * @example
   * ```ts
   * await client.live.sessions.reject('session_id', {
   *   status_code: 486,
   * });
   * ```
   */
  reject(sessionID, body, options2) {
    return this._client.post(path`/live/sessions/${sessionID}/reject`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class Forks extends APIResource {
}
class Sideband extends APIResource {
}
class Live extends APIResource {
  constructor() {
    super(...arguments);
    this.sideband = new Sideband(this._client);
    this.forks = new Forks(this._client);
    this.sessions = new Sessions4(this._client);
  }
  /**
   * Create a Live WebRTC session. Start with the
   * [Live prompting guide](https://developers.openai.com/api/docs/guides/live-prompting).
   *
   * @example
   * ```ts
   * const live = await client.live.create({
   *   session: { model: 'gpt-live-1' },
   *   transport: { sdp: 'x', type: 'webrtc' },
   * });
   * ```
   */
  create(body, options2) {
    return this._client.post("/live/sessions", { body, ...options2, __security: { bearerAuth: true } });
  }
}
Live.Sideband = Sideband;
Live.Forks = Forks;
Live.Sessions = Sessions4;
class Models extends APIResource {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options2) {
    return this._client.get(path`/models/${model}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options2) {
    return this._client.getAPIList("/models", Page, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  delete(model, options2) {
    return this._client.delete(path`/models/${model}`, { ...options2, __security: { bearerAuth: true } });
  }
}
class Moderations extends APIResource {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the
   * [moderation guide](https://developers.openai.com/api/docs/guides/moderation).
   */
  create(body, options2) {
    return this._client.post("/moderations", { body, ...options2, __security: { bearerAuth: true } });
  }
}
async function encodedMultipartFormRequestOptions(options2, client, encodings, rawBodyField = null) {
  if (options2.body === null || typeof options2.body !== "object" || Array.isArray(options2.body)) {
    throw new TypeError("Multipart request body must be an object");
  }
  const body = Object.fromEntries(Object.entries(options2.body).filter(([, value]) => value !== void 0));
  if (rawBodyField !== null && Object.keys(body).length === 1 && Object.prototype.hasOwnProperty.call(body, rawBodyField)) {
    const value = body[rawBodyField];
    if (typeof value !== "string")
      throw new TypeError("Raw multipart alternative must be a string");
    return {
      ...options2,
      body: value,
      headers: buildHeaders([options2.headers, { "content-type": encodings[rawBodyField].content_type }])
    };
  }
  const encoded = [];
  for (const [name, encoding] of Object.entries(encodings)) {
    if (!Object.prototype.hasOwnProperty.call(body, name))
      continue;
    const value = body[name];
    const data = encoding.json ? JSON.stringify(value) : value;
    if (typeof data !== "string")
      throw new TypeError(`Multipart field ${name} must encode as a string`);
    encoded.push([name, makeFile([data], "", { type: encoding.content_type })]);
    delete body[name];
  }
  const multipart = await multipartFormRequestOptions({ ...options2, body }, client);
  const form = multipart.body;
  if (!(form instanceof FormData)) {
    await form.cancel();
    throw new TypeError("Unexpected streaming upload in typed multipart request body");
  }
  for (const [name, part] of encoded)
    form.append(name, part, "");
  return {
    ...options2,
    body: form,
    headers: buildHeaders([options2.headers, { "content-type": null }])
  };
}
class Calls extends APIResource {
  /**
   * Create a new Realtime API call over WebRTC and receive the SDP answer needed to
   * complete the peer connection.
   *
   * @example
   * ```ts
   * await client.realtime.calls.create({
   *   sdp: 'sdp',
   * });
   * ```
   */
  create(body, options2) {
    return this._client.post("/realtime/calls", encodedMultipartFormRequestOptions({
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "application/sdp" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    }, this._client, {
      sdp: { content_type: "application/sdp", json: false },
      session: { content_type: "application/json", json: true }
    }, "sdp"));
  }
  /**
   * Accept an incoming SIP call and configure the realtime session that will handle
   * it.
   *
   * @example
   * ```ts
   * await client.realtime.calls.accept('call_id', {
   *   type: 'realtime',
   * });
   * ```
   */
  accept(callID, body, options2) {
    return this._client.post(path`/realtime/calls/${callID}/accept`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * End an active Realtime API call, whether it was initiated over SIP or WebRTC.
   *
   * @example
   * ```ts
   * await client.realtime.calls.hangup('call_id');
   * ```
   */
  hangup(callID, options2) {
    return this._client.post(path`/realtime/calls/${callID}/hangup`, {
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Transfer an active SIP call to a new destination using the SIP REFER verb.
   *
   * @example
   * ```ts
   * await client.realtime.calls.refer('call_id', {
   *   target_uri: 'tel:+14155550123',
   * });
   * ```
   */
  refer(callID, body, options2) {
    return this._client.post(path`/realtime/calls/${callID}/refer`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Decline an incoming SIP call by returning a SIP status code to the caller.
   *
   * @example
   * ```ts
   * await client.realtime.calls.reject('call_id');
   * ```
   */
  reject(callID, body = {}, options2) {
    return this._client.post(path`/realtime/calls/${callID}/reject`, {
      body,
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class ClientSecrets extends APIResource {
  /**
   * Create a Realtime client secret with an associated session configuration.
   *
   * Client secrets are short-lived tokens that can be passed to a client app, such
   * as a web frontend or mobile client, which grants access to the Realtime API
   * without leaking your main API key. You can configure a custom TTL for each
   * client secret.
   *
   * You can also attach session configuration options to the client secret, which
   * will be applied to any sessions created using that client secret, but these can
   * also be overridden by the client connection.
   *
   * [Learn more about authentication with client secrets over WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc).
   *
   * Returns the created client secret and the effective session object. The client
   * secret is a string that looks like `ek_1234`.
   *
   * @example
   * ```ts
   * const clientSecret =
   *   await client.realtime.clientSecrets.create();
   * ```
   */
  create(body, options2) {
    return this._client.post("/realtime/client_secrets", {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
class Realtime2 extends APIResource {
  constructor() {
    super(...arguments);
    this.clientSecrets = new ClientSecrets(this._client);
    this.calls = new Calls(this._client);
  }
}
Realtime2.ClientSecrets = ClientSecrets;
Realtime2.Calls = Calls;
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput(params)) {
    const parsed = {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        }
        return item;
      })
    };
    if (needsOutputText(response, parsed)) {
      addOutputText(parsed);
    }
    return parsed;
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const shouldParse = !response.status || response.status === "completed";
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return shouldParse ? parseToolCall(params, item) : { ...item, parsed_arguments: null };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: shouldParse ? parseTextFormat(params, content2.text) : null
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = { ...response, output };
  if (needsOutputText(response, parsed)) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  var _a3;
  return parseResponseFormatContent((_a3 = params.text) == null ? void 0 : _a3.format, content);
}
function hasAutoParseableInput(params) {
  var _a3;
  if (isParseableResponseFormat((_a3 = params.text) == null ? void 0 : _a3.format)) {
    return true;
  }
  return Array.isArray(params.tools) && params.tools.some((tool) => isAutoParsableTool(tool) || tool.type === "function" && tool.strict === true || tool.type === "namespace" && tool.tools.some((nested) => nested.type === "function" && (isAutoParsableTool(nested) || nested.strict === true)));
}
function isAutoParsableTool(tool) {
  return (tool == null ? void 0 : tool["$brand"]) === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name, namespace) {
  for (const tool of input_tools) {
    if (namespace == null) {
      if (tool.type === "function" && tool.name === name) {
        return tool;
      }
    } else if (tool.type === "namespace" && tool.name === namespace) {
      return tool.tools.find((nested) => nested.type === "function" && nested.name === name);
    }
  }
  return void 0;
}
function parseToolCall(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name, toolCall.namespace);
  let parsedArguments = null;
  if (isAutoParsableTool(inputTool)) {
    parsedArguments = inputTool.$parseRaw(toolCall.arguments);
  } else if (inputTool == null ? void 0 : inputTool.strict) {
    parsedArguments = parseResponseFormatContent({ type: "json_schema", $parseRaw: void 0 }, toolCall.arguments);
  }
  return {
    ...toolCall,
    parsed_arguments: parsedArguments
  };
}
function needsOutputText(response, target) {
  return !Object.getOwnPropertyDescriptor(response, "output_text") || target.output_text == null;
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
class OutputTextIndex {
  constructor() {
    this.capacity = 1;
    this.values = [0, 0];
    this.size = 0;
  }
  get length() {
    return this.size;
  }
  append(value) {
    if (this.size === this.capacity) {
      this.grow();
    }
    const index = this.size;
    this.size += 1;
    this.update(index, value);
  }
  update(index, value) {
    if (!Number.isSafeInteger(index) || index < 0 || index >= this.size) {
      throw new RangeError(`missing output at index ${index}`);
    }
    let node = this.capacity + index;
    const difference = value - (this.values[node] ?? 0);
    if (difference === 0) {
      return;
    }
    while (node >= 1) {
      this.values[node] = (this.values[node] ?? 0) + difference;
      node = Math.floor(node / 2);
    }
  }
  prefixSum(end) {
    if (!Number.isSafeInteger(end) || end < 0 || end > this.size) {
      throw new RangeError(`missing output at index ${end}`);
    }
    let start2 = this.capacity;
    let stop = this.capacity + end;
    let sum = 0;
    while (start2 < stop) {
      if (start2 % 2 === 1) {
        sum += this.values[start2] ?? 0;
        start2 += 1;
      }
      if (stop % 2 === 1) {
        stop -= 1;
        sum += this.values[stop] ?? 0;
      }
      start2 = Math.floor(start2 / 2);
      stop = Math.floor(stop / 2);
    }
    return sum;
  }
  grow() {
    const previousCapacity = this.capacity;
    this.capacity *= 2;
    const values2 = Array.from({ length: this.capacity * 2 }, () => 0);
    for (let index = 0; index < this.size; index += 1) {
      values2[this.capacity + index] = this.values[previousCapacity + index] ?? 0;
    }
    for (let index = this.capacity - 1; index > 0; index -= 1) {
      values2[index] = (values2[index * 2] ?? 0) + (values2[index * 2 + 1] ?? 0);
    }
    this.values = values2;
  }
}
function createCanonicalResponseContext() {
  return {
    canonicalSnapshot: void 0,
    outputTextLengths: /* @__PURE__ */ new WeakMap(),
    outputTextIndex: new OutputTextIndex()
  };
}
function getOutputText(context, output) {
  if (output.type !== "message") {
    return "";
  }
  let text = "";
  for (const content of output.content) {
    if (content.type === "output_text") {
      text += content.text;
    }
  }
  context.outputTextLengths.set(output, text.length);
  return text;
}
function ensureCanonicalOutputText(context, snapshot) {
  if (context.canonicalSnapshot === snapshot) {
    return;
  }
  const outputTextIndex = new OutputTextIndex();
  let text = "";
  for (const output of snapshot.output) {
    const outputText = getOutputText(context, output);
    text += outputText;
    outputTextIndex.append(outputText.length);
  }
  snapshot.output_text = text;
  context.outputTextIndex = outputTextIndex;
  context.canonicalSnapshot = snapshot;
}
function cloneResponse(context, response) {
  context.canonicalSnapshot = void 0;
  context.outputTextLengths = /* @__PURE__ */ new WeakMap();
  context.outputTextIndex = new OutputTextIndex();
  const snapshot = structuredClone(response);
  if (!Object.getOwnPropertyDescriptor(snapshot, "output_text") || snapshot.output_text === null || snapshot.output_text === void 0) {
    ensureCanonicalOutputText(context, snapshot);
  } else if (snapshot.output.length === 0 && snapshot.output_text === "") {
    context.canonicalSnapshot = snapshot;
  }
  return snapshot;
}
function updateCachedOutputTextLength(context, output, outputIndex, previousText, nextText) {
  const length = context.outputTextLengths.get(output);
  if (length !== void 0) {
    const nextLength = length - previousText.length + nextText.length;
    context.outputTextLengths.set(output, nextLength);
    context.outputTextIndex.update(outputIndex, nextLength);
  }
}
function replaceOutputTextSuffix(snapshot, previousText, nextText) {
  if (previousText.length === 0) {
    snapshot.output_text += nextText;
    return;
  }
  snapshot.output_text = snapshot.output_text.slice(0, snapshot.output_text.length - previousText.length) + nextText;
}
function getPrecedingContentTextLength(context, output, contentIndex, nextText) {
  if (contentIndex === void 0 || (output == null ? void 0 : output.type) !== "message") {
    return 0;
  }
  if (contentIndex < output.content.length - contentIndex - 1) {
    let precedingContentLength = 0;
    for (let index = 0; index < contentIndex; index += 1) {
      const precedingContent = output.content[index];
      if ((precedingContent == null ? void 0 : precedingContent.type) === "output_text") {
        precedingContentLength += precedingContent.text.length;
      }
    }
    return precedingContentLength;
  }
  let followingContentLength = 0;
  for (let index = contentIndex + 1; index < output.content.length; index += 1) {
    const followingContent = output.content[index];
    if ((followingContent == null ? void 0 : followingContent.type) === "output_text") {
      followingContentLength += followingContent.text.length;
    }
  }
  const outputTextLength = context.outputTextLengths.get(output) ?? getOutputText(context, output).length;
  return outputTextLength - followingContentLength - nextText.length;
}
function updateOutputText(context, snapshot, outputIndex, previousText, nextText, contentIndex) {
  if (previousText === nextText) {
    return;
  }
  const output = snapshot.output[outputIndex];
  if (outputIndex === snapshot.output.length - 1 && (contentIndex === void 0 || (output == null ? void 0 : output.type) === "message" && contentIndex === output.content.length - 1)) {
    replaceOutputTextSuffix(snapshot, previousText, nextText);
    return;
  }
  const precedingContentLength = getPrecedingContentTextLength(context, output, contentIndex, nextText);
  const offset = context.outputTextIndex.prefixSum(outputIndex) + precedingContentLength;
  if (offset + previousText.length === snapshot.output_text.length) {
    replaceOutputTextSuffix(snapshot, previousText, nextText);
    return;
  }
  snapshot.output_text = snapshot.output_text.slice(0, offset) + nextText + snapshot.output_text.slice(offset + previousText.length);
}
const responseOutputIdentityIndexes = /* @__PURE__ */ new WeakMap();
function validateArrayIndex(collection, index, kind, allowAppend = false) {
  if (!Array.isArray(collection) || !Number.isSafeInteger(index) || index < 0 || index > collection.length || (index === collection.length ? !allowAppend || index in collection : !hasOwn(collection, index))) {
    throw new OpenAIError(`missing ${kind} at index ${index}`);
  }
}
function validateArrayAppend(collection, index, kind) {
  if (index !== collection.length) {
    throw new OpenAIError(`missing ${kind} at index ${index}`);
  }
  validateArrayIndex(collection, index, kind, true);
}
function getOutput(snapshot, outputIndex) {
  validateArrayIndex(snapshot.output, outputIndex, "output");
  const output = snapshot.output[outputIndex];
  if (!output) {
    throw new OpenAIError(`missing output at index ${outputIndex}`);
  }
  return output;
}
function hasRoutedOutputCallIdentity(output) {
  return output.type === "function_call" || output.type === "custom_tool_call" || output.type === "shell_call" || output.type === "shell_call_output";
}
function getOutputItemIdentityKeys(output, eventType) {
  if (!hasOwn(output, "type") || typeof output.type !== "string") {
    throw new OpenAIError(`expected an own output item type for ${eventType}`);
  }
  const optionalPlatformID = output.type === "function_call" || output.type === "custom_tool_call";
  const identities = [];
  if (hasOwn(output, "id")) {
    if (typeof output.id !== "string" || output.id.length === 0) {
      throw new OpenAIError(`expected a non-empty output item id for ${eventType}`);
    }
    identities.push(`id:${output.id}`);
  } else if (!optionalPlatformID) {
    throw new OpenAIError(`expected a non-empty output item id for ${eventType}`);
  }
  if (hasRoutedOutputCallIdentity(output)) {
    if (!hasOwn(output, "call_id") || typeof output.call_id !== "string" || output.call_id.length === 0) {
      throw new OpenAIError(`expected a non-empty output item call_id for ${eventType}`);
    }
    identities.push(`call:${output.type}:${output.call_id}`);
  }
  return identities;
}
function assertOutputItemIdentitiesAvailable(identities, keys) {
  for (const key of keys) {
    if (identities.has(key)) {
      throw new OpenAIError(`duplicate output item identity '${key}'`);
    }
  }
}
function addOutputItemIdentities(identities, keys) {
  assertOutputItemIdentitiesAvailable(identities, keys);
  for (const key of keys) {
    identities.add(key);
  }
}
function createResponseOutputIdentityIndex(snapshot) {
  const identityIndex = {
    snapshot,
    output: snapshot.output,
    length: snapshot.output.length,
    identities: /* @__PURE__ */ new Set()
  };
  for (let index = 0; index < snapshot.output.length; index += 1) {
    const output = getOutput(snapshot, index);
    addOutputItemIdentities(identityIndex.identities, getOutputItemIdentityKeys(output, "response snapshot"));
  }
  return identityIndex;
}
function getResponseOutputIdentityIndex(context, snapshot) {
  const cached = responseOutputIdentityIndexes.get(context);
  if (cached && cached.snapshot === snapshot && cached.output === snapshot.output && cached.length === snapshot.output.length) {
    return cached;
  }
  const identityIndex = createResponseOutputIdentityIndex(snapshot);
  responseOutputIdentityIndexes.set(context, identityIndex);
  return identityIndex;
}
function cloneValidatedResponse(context, response) {
  const nextContext = createCanonicalResponseContext();
  const snapshot = cloneResponse(nextContext, response);
  const identityIndex = createResponseOutputIdentityIndex(snapshot);
  context.canonicalSnapshot = nextContext.canonicalSnapshot;
  context.outputTextLengths = nextContext.outputTextLengths;
  context.outputTextIndex = nextContext.outputTextIndex;
  responseOutputIdentityIndexes.set(context, identityIndex);
  return snapshot;
}
const expectedOutputItemTypes = {
  "response.output_text.delta": "message",
  "response.output_text.done": "message",
  "response.output_text.annotation.added": "message",
  "response.refusal.delta": "message",
  "response.refusal.done": "message",
  "response.function_call_arguments.delta": "function_call",
  "response.function_call_arguments.done": "function_call",
  "response.custom_tool_call_input.delta": "custom_tool_call",
  "response.custom_tool_call_input.done": "custom_tool_call",
  "response.mcp_call_arguments.delta": "mcp_call",
  "response.mcp_call_arguments.done": "mcp_call",
  "response.mcp_call.in_progress": "mcp_call",
  "response.mcp_call.completed": "mcp_call",
  "response.mcp_call.failed": "mcp_call",
  "response.shell_call_output_content.delta": "shell_call_output",
  "response.shell_call_output_content.done": "shell_call_output",
  "response.reasoning_text.delta": "reasoning",
  "response.reasoning_text.done": "reasoning",
  "response.reasoning_summary_part.added": "reasoning",
  "response.reasoning_summary_part.done": "reasoning",
  "response.reasoning_summary_text.delta": "reasoning",
  "response.reasoning_summary_text.done": "reasoning",
  "response.code_interpreter_call_code.delta": "code_interpreter_call",
  "response.code_interpreter_call_code.done": "code_interpreter_call",
  "response.code_interpreter_call.in_progress": "code_interpreter_call",
  "response.code_interpreter_call.interpreting": "code_interpreter_call",
  "response.code_interpreter_call.completed": "code_interpreter_call",
  "response.file_search_call.in_progress": "file_search_call",
  "response.file_search_call.searching": "file_search_call",
  "response.file_search_call.completed": "file_search_call",
  "response.web_search_call.in_progress": "web_search_call",
  "response.web_search_call.searching": "web_search_call",
  "response.web_search_call.completed": "web_search_call",
  "response.image_generation_call.in_progress": "image_generation_call",
  "response.image_generation_call.generating": "image_generation_call",
  "response.image_generation_call.completed": "image_generation_call",
  "response.image_generation_call.partial_image": "image_generation_call",
  "response.mcp_list_tools.in_progress": "mcp_list_tools",
  "response.mcp_list_tools.completed": "mcp_list_tools",
  "response.mcp_list_tools.failed": "mcp_list_tools",
  "response.compaction.compacting": "compaction"
};
function getExpectedOutputItemType(event) {
  if (event.type === "response.content_part.added" || event.type === "response.content_part.done") {
    return event.part.type === "reasoning_text" ? "reasoning" : "message";
  }
  return expectedOutputItemTypes[event.type];
}
function validateCompletedOutputItemIdentity(event, snapshot) {
  const output = getOutput(snapshot, event.output_index);
  const replacement = event.item;
  getOutputItemIdentityKeys(output, event.type);
  getOutputItemIdentityKeys(replacement, event.type);
  if (!hasOwn(replacement, "type") || output.type !== replacement.type) {
    throw new OpenAIError(`expected output item type '${output.type}', got '${replacement.type}'`);
  }
  const outputID = hasOwn(output, "id") ? output.id : void 0;
  const replacementID = hasOwn(replacement, "id") ? replacement.id : void 0;
  if (outputID !== replacementID) {
    throw new OpenAIError(`expected output item id '${outputID}', got '${replacementID}'`);
  }
  if (hasRoutedOutputCallIdentity(output) && hasRoutedOutputCallIdentity(replacement) && output.call_id !== replacement.call_id) {
    throw new OpenAIError(`expected output item call_id '${output.call_id}', got '${replacement.call_id}'`);
  }
}
function validateOutputItemIdentity(event, snapshot, rejectInvalidShellTargets) {
  if (event.type === "response.output_item.done") {
    validateCompletedOutputItemIdentity(event, snapshot);
    return;
  }
  if (rejectInvalidShellTargets && (event.type === "response.shell_call_command.added" || event.type === "response.shell_call_command.delta" || event.type === "response.shell_call_command.done")) {
    const output2 = getOutput(snapshot, event.output_index);
    if (!hasOwn(output2, "type") || output2.type !== "shell_call") {
      throw new OpenAIError(`expected output item type 'shell_call', got '${output2.type}'`);
    }
    return;
  }
  if (event.type !== "response.content_part.added" && event.type !== "response.content_part.done" && !hasOwn(expectedOutputItemTypes, event.type)) {
    return;
  }
  const itemEvent = event;
  if (!hasOwn(event, "item_id") || typeof itemEvent.item_id !== "string" || itemEvent.item_id.length === 0) {
    throw new OpenAIError(`expected a non-empty item_id for ${event.type}`);
  }
  const output = getOutput(snapshot, itemEvent.output_index);
  const outputID = hasOwn(output, "id") ? output.id : void 0;
  if (outputID !== itemEvent.item_id) {
    throw new OpenAIError(`expected item_id '${outputID}', got '${itemEvent.item_id}'`);
  }
  const expectedType = getExpectedOutputItemType(itemEvent);
  if (output.type !== expectedType) {
    throw new OpenAIError(`expected output item type '${expectedType}', got '${output.type}'`);
  }
}
function getContent(content, contentIndex) {
  validateArrayIndex(content, contentIndex, "content");
  const part = content[contentIndex];
  if (!part) {
    throw new OpenAIError(`missing content at index ${contentIndex}`);
  }
  return part;
}
function getShellOutputContent(snapshot, output, commandIndex) {
  const shellCall = snapshot.output.find((item) => item.type === "shell_call" && item.call_id === output.call_id);
  if (shellCall) {
    validateArrayIndex(shellCall.action.commands, commandIndex, "command");
  } else {
    validateArrayIndex(output.output, commandIndex, "content", true);
  }
  while (output.output.length <= commandIndex) {
    output.output.push({
      stdout: "",
      stderr: "",
      outcome: { type: "exit", exit_code: 0 }
    });
  }
  return getContent(output.output, commandIndex);
}
function createSupportedResponseEventTypes(eventTypes) {
  return new Set(eventTypes);
}
const supportedResponseEventTypes = createSupportedResponseEventTypes([
  "response.output_item.added",
  "response.output_item.done",
  "response.content_part.added",
  "response.content_part.done",
  "response.output_text.delta",
  "response.output_text.done",
  "response.output_text.annotation.added",
  "response.refusal.delta",
  "response.refusal.done",
  "response.function_call_arguments.delta",
  "response.function_call_arguments.done",
  "response.custom_tool_call_input.delta",
  "response.custom_tool_call_input.done",
  "response.mcp_call_arguments.delta",
  "response.mcp_call_arguments.done",
  "response.shell_call_command.added",
  "response.shell_call_command.done",
  "response.shell_call_command.delta",
  "response.shell_call_output_content.delta",
  "response.shell_call_output_content.done",
  "response.reasoning_text.delta",
  "response.reasoning_text.done",
  "response.reasoning_summary_part.added",
  "response.reasoning_summary_part.done",
  "response.reasoning_summary_text.delta",
  "response.reasoning_summary_text.done",
  "response.code_interpreter_call_code.delta",
  "response.code_interpreter_call_code.done",
  "response.code_interpreter_call.in_progress",
  "response.code_interpreter_call.interpreting",
  "response.code_interpreter_call.completed",
  "response.file_search_call.in_progress",
  "response.file_search_call.searching",
  "response.file_search_call.completed",
  "response.web_search_call.in_progress",
  "response.web_search_call.searching",
  "response.web_search_call.completed",
  "response.image_generation_call.in_progress",
  "response.image_generation_call.generating",
  "response.image_generation_call.completed",
  "response.mcp_call.in_progress",
  "response.mcp_call.completed",
  "response.mcp_call.failed",
  "response.created",
  "response.queued",
  "response.in_progress",
  "response.completed",
  "response.failed",
  "response.incomplete",
  "response.audio.delta",
  "response.audio.done",
  "response.audio.transcript.delta",
  "response.audio.transcript.done",
  "response.compaction.compacting",
  "response.image_generation_call.partial_image",
  "response.mcp_list_tools.in_progress",
  "response.mcp_list_tools.completed",
  "response.mcp_list_tools.failed",
  "keepalive",
  "error"
]);
function assertNever(_value) {
  throw new OpenAIError("Unhandled response stream event: unknown");
}
const responseEventRoutingFields = [
  "item_id",
  "output_index",
  "content_index",
  "annotation_index",
  "command_index",
  "summary_index"
];
function sanitizeResponseEvent(event) {
  let descriptor;
  try {
    descriptor = Object.getOwnPropertyDescriptor(event, "type");
  } catch {
    return assertNever();
  }
  const type = descriptor == null ? void 0 : descriptor.value;
  if (
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate untrusted streamed item identifiers and discriminators before mutating the response snapshot.
    typeof type !== "string" || !supportedResponseEventTypes.has(type)
  ) {
    return assertNever();
  }
  const stableValues = /* @__PURE__ */ new Map([["type", type]]);
  const itemScoped = type === "response.output_item.added" || type === "response.output_item.done" || type === "response.content_part.added" || type === "response.content_part.done" || type === "response.shell_call_command.added" || type === "response.shell_call_command.delta" || type === "response.shell_call_command.done" || hasOwn(expectedOutputItemTypes, type);
  if (itemScoped) {
    try {
      for (const field of responseEventRoutingFields) {
        const routingDescriptor = Object.getOwnPropertyDescriptor(event, field);
        stableValues.set(field, routingDescriptor ? event[field] : void 0);
      }
      if (type === "response.output_item.done") {
        stableValues.set("item", structuredClone(event.item));
      } else if (type === "response.content_part.added" || type === "response.content_part.done") {
        stableValues.set("part", structuredClone(event.part));
      }
    } catch {
      return assertNever();
    }
  }
  return new Proxy(event, {
    get(target, property) {
      return stableValues.has(property) ? stableValues.get(property) : Reflect.get(target, property, target);
    }
  });
}
function accumulateOutputItemEvent(event, snapshot, context) {
  switch (event.type) {
    case "response.output_item.added": {
      validateArrayAppend(snapshot.output, event.output_index, "output");
      const identityIndex = getResponseOutputIdentityIndex(context, snapshot);
      const output = structuredClone(event.item);
      const identities = getOutputItemIdentityKeys(output, event.type);
      assertOutputItemIdentitiesAvailable(identityIndex.identities, identities);
      if (output.type === "message") {
        ensureCanonicalOutputText(context, snapshot);
      }
      snapshot.output.push(output);
      addOutputItemIdentities(identityIndex.identities, identities);
      identityIndex.length = snapshot.output.length;
      const text = getOutputText(context, output);
      if (context.canonicalSnapshot === snapshot) {
        context.outputTextIndex.append(text.length);
      }
      if (text) {
        snapshot.output_text += text;
      }
      return true;
    }
    case "response.output_item.done": {
      const output = getOutput(snapshot, event.output_index);
      const previousText = getOutputText(context, output);
      const replacement = event.item;
      if (output.type === "message" || replacement.type === "message") {
        ensureCanonicalOutputText(context, snapshot);
      }
      snapshot.output[event.output_index] = replacement;
      const nextText = getOutputText(context, replacement);
      if (context.canonicalSnapshot === snapshot) {
        context.outputTextIndex.update(event.output_index, nextText.length);
      }
      updateOutputText(context, snapshot, event.output_index, previousText, nextText);
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateContentPartAddedEvent(event, snapshot, context) {
  switch (event.type) {
    case "response.content_part.added": {
      const output = getOutput(snapshot, event.output_index);
      const { type } = output;
      const { part } = event;
      if (type === "message" && part.type !== "reasoning_text") {
        validateArrayAppend(output.content, event.content_index, "content");
        const content = part;
        if (content.type === "output_text") {
          ensureCanonicalOutputText(context, snapshot);
        }
        output.content.push(content);
        if (content.type === "output_text") {
          updateCachedOutputTextLength(context, output, event.output_index, "", content.text);
          updateOutputText(context, snapshot, event.output_index, "", content.text, event.content_index);
        }
      } else if (type === "reasoning" && part.type === "reasoning_text") {
        const content = output.content ?? [];
        validateArrayAppend(content, event.content_index, "content");
        if (!output.content) {
          output.content = content;
        }
        content.push(part);
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateContentPartDoneEvent(event, snapshot, context) {
  switch (event.type) {
    case "response.content_part.done": {
      const output = getOutput(snapshot, event.output_index);
      const { part } = event;
      if (output.type === "message" && part.type !== "reasoning_text") {
        const content = getContent(output.content, event.content_index);
        const previousText = content.type === "output_text" ? content.text : "";
        const replacement = part;
        if (content.type === "output_text" || replacement.type === "output_text") {
          ensureCanonicalOutputText(context, snapshot);
        }
        output.content[event.content_index] = replacement;
        const nextText = replacement.type === "output_text" ? replacement.text : "";
        updateCachedOutputTextLength(context, output, event.output_index, previousText, nextText);
        updateOutputText(context, snapshot, event.output_index, previousText, nextText, event.content_index);
      } else if (output.type === "reasoning" && part.type === "reasoning_text") {
        const { content } = output;
        if (!content) {
          throw new OpenAIError(`missing content at index ${event.content_index}`);
        }
        getContent(content, event.content_index);
        content[event.content_index] = part;
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateOutputTextEvent(event, snapshot, context) {
  switch (event.type) {
    case "response.output_text.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "message") {
        const content = getContent(output.content, event.content_index);
        if (content.type !== "output_text") {
          throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
        }
        const previousText = content.text;
        ensureCanonicalOutputText(context, snapshot);
        content.text = previousText + event.delta;
        updateCachedOutputTextLength(context, output, event.output_index, previousText, content.text);
        if (event.output_index === snapshot.output.length - 1 && event.content_index === output.content.length - 1) {
          snapshot.output_text += event.delta;
        } else {
          updateOutputText(context, snapshot, event.output_index, previousText, content.text, event.content_index);
        }
      }
      return true;
    }
    case "response.output_text.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "message") {
        const content = getContent(output.content, event.content_index);
        if (content.type !== "output_text") {
          throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
        }
        const previousText = content.text;
        ensureCanonicalOutputText(context, snapshot);
        content.text = event.text;
        updateCachedOutputTextLength(context, output, event.output_index, previousText, event.text);
        updateOutputText(context, snapshot, event.output_index, previousText, event.text, event.content_index);
      }
      return true;
    }
    case "response.output_text.annotation.added": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "message") {
        const content = getContent(output.content, event.content_index);
        if (content.type !== "output_text") {
          throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
        }
        validateArrayIndex(content.annotations, event.annotation_index, "annotation", true);
        content.annotations[event.annotation_index] = structuredClone(event.annotation);
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateRefusalAndArgumentsEvent(event, snapshot) {
  switch (event.type) {
    case "response.refusal.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "message") {
        const content = getContent(output.content, event.content_index);
        if (content.type !== "refusal") {
          throw new OpenAIError(`expected content to be 'refusal', got ${content.type}`);
        }
        content.refusal += event.delta;
      }
      return true;
    }
    case "response.refusal.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "message") {
        const content = getContent(output.content, event.content_index);
        if (content.type !== "refusal") {
          throw new OpenAIError(`expected content to be 'refusal', got ${content.type}`);
        }
        content.refusal = event.refusal;
      }
      return true;
    }
    case "response.function_call_arguments.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "function_call") {
        output.arguments += event.delta;
      }
      return true;
    }
    case "response.function_call_arguments.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "function_call") {
        output.arguments = event.arguments;
      }
      return true;
    }
    case "response.custom_tool_call_input.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "custom_tool_call") {
        output.input += event.delta;
      }
      return true;
    }
    case "response.custom_tool_call_input.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "custom_tool_call") {
        output.input = event.input;
      }
      return true;
    }
    case "response.mcp_call_arguments.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "mcp_call") {
        output.arguments += event.delta;
      }
      return true;
    }
    case "response.mcp_call_arguments.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "mcp_call") {
        output.arguments = event.arguments;
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateShellEvent(event, snapshot) {
  switch (event.type) {
    case "response.shell_call_command.added":
    case "response.shell_call_command.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "shell_call") {
        const allowAppend = event.type === "response.shell_call_command.added";
        validateArrayIndex(output.action.commands, event.command_index, "command", allowAppend);
        output.action.commands[event.command_index] = event.command;
      }
      return true;
    }
    case "response.shell_call_command.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "shell_call") {
        validateArrayIndex(output.action.commands, event.command_index, "command");
        output.action.commands[event.command_index] += event.delta;
      }
      return true;
    }
    case "response.shell_call_output_content.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "shell_call_output") {
        const content = getShellOutputContent(snapshot, output, event.command_index);
        content.stdout += event.delta.stdout ?? "";
        content.stderr += event.delta.stderr ?? "";
      }
      return true;
    }
    case "response.shell_call_output_content.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "shell_call_output") {
        const content = getContent(event.output, 0);
        getShellOutputContent(snapshot, output, event.command_index);
        output.output[event.command_index] = structuredClone(content);
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateReasoningEvent(event, snapshot) {
  switch (event.type) {
    case "response.reasoning_text.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        if (!output.content) {
          throw new OpenAIError(`missing content at index ${event.content_index}`);
        }
        const content = getContent(output.content, event.content_index);
        if (content.type !== "reasoning_text") {
          throw new OpenAIError(`expected content to be 'reasoning_text', got ${content.type}`);
        }
        content.text += event.delta;
      }
      return true;
    }
    case "response.reasoning_text.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        if (!output.content) {
          throw new OpenAIError(`missing content at index ${event.content_index}`);
        }
        const content = getContent(output.content, event.content_index);
        if (content.type !== "reasoning_text") {
          throw new OpenAIError(`expected content to be 'reasoning_text', got ${content.type}`);
        }
        content.text = event.text;
      }
      return true;
    }
    case "response.reasoning_summary_part.added": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        validateArrayAppend(output.summary, event.summary_index, "content");
        output.summary.push(structuredClone(event.part));
      }
      return true;
    }
    case "response.reasoning_summary_part.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        getContent(output.summary, event.summary_index);
        output.summary[event.summary_index] = structuredClone(event.part);
      }
      return true;
    }
    case "response.reasoning_summary_text.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        const part = getContent(output.summary, event.summary_index);
        part.text += event.delta;
      }
      return true;
    }
    case "response.reasoning_summary_text.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "reasoning") {
        const part = getContent(output.summary, event.summary_index);
        part.text = event.text;
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateCodeInterpreterEvent(event, snapshot) {
  switch (event.type) {
    case "response.code_interpreter_call_code.delta": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "code_interpreter_call") {
        output.code = (output.code ?? "") + event.delta;
      }
      return true;
    }
    case "response.code_interpreter_call_code.done": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "code_interpreter_call") {
        output.code = event.code;
      }
      return true;
    }
    case "response.code_interpreter_call.in_progress": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "code_interpreter_call") {
        output.status = "in_progress";
      }
      return true;
    }
    case "response.code_interpreter_call.interpreting": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "code_interpreter_call") {
        output.status = "interpreting";
      }
      return true;
    }
    case "response.code_interpreter_call.completed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "code_interpreter_call") {
        output.status = "completed";
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateSearchStatusEvent(event, snapshot) {
  switch (event.type) {
    case "response.file_search_call.in_progress": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "file_search_call") {
        output.status = "in_progress";
      }
      return true;
    }
    case "response.file_search_call.searching": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "file_search_call") {
        output.status = "searching";
      }
      return true;
    }
    case "response.file_search_call.completed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "file_search_call") {
        output.status = "completed";
      }
      return true;
    }
    case "response.web_search_call.in_progress": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "web_search_call") {
        output.status = "in_progress";
      }
      return true;
    }
    case "response.web_search_call.searching": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "web_search_call") {
        output.status = "searching";
      }
      return true;
    }
    case "response.web_search_call.completed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "web_search_call") {
        output.status = "completed";
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function accumulateImageAndMcpStatusEvent(event, snapshot) {
  switch (event.type) {
    case "response.image_generation_call.in_progress": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "image_generation_call") {
        output.status = "in_progress";
      }
      return true;
    }
    case "response.image_generation_call.generating": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "image_generation_call") {
        output.status = "generating";
      }
      return true;
    }
    case "response.image_generation_call.completed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "image_generation_call") {
        output.status = "completed";
      }
      return true;
    }
    case "response.mcp_call.in_progress": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "mcp_call") {
        output.status = "in_progress";
      }
      return true;
    }
    case "response.mcp_call.completed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "mcp_call") {
        output.status = "completed";
      }
      return true;
    }
    case "response.mcp_call.failed": {
      const output = getOutput(snapshot, event.output_index);
      if (output.type === "mcp_call") {
        output.status = "failed";
      }
      return true;
    }
    default: {
      return false;
    }
  }
}
function isResponseLifecycleEvent(event) {
  switch (event.type) {
    case "response.created":
    case "response.queued":
    case "response.in_progress":
    case "response.completed":
    case "response.failed":
    case "response.incomplete": {
      return true;
    }
    default: {
      return false;
    }
  }
}
function isIgnoredResponseEvent(event) {
  switch (event.type) {
    case "response.audio.delta":
    case "response.audio.done":
    case "response.audio.transcript.delta":
    case "response.audio.transcript.done":
    case "response.compaction.compacting":
    case "response.image_generation_call.partial_image":
    case "response.mcp_list_tools.in_progress":
    case "response.mcp_list_tools.completed":
    case "response.mcp_list_tools.failed":
    case "keepalive":
    case "error": {
      return true;
    }
    default: {
      return false;
    }
  }
}
function createResponseContext() {
  return createCanonicalResponseContext();
}
function accumulateResponseWithContext(event, snapshot, context, rejectInvalidShellTargets = false, onSanitizedEvent) {
  const dispatchEvent = sanitizeResponseEvent(event);
  if (onSanitizedEvent && dispatchEvent.type !== "keepalive") {
    onSanitizedEvent(dispatchEvent);
  }
  if (!snapshot) {
    if (dispatchEvent.type !== "response.created") {
      throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${dispatchEvent.type}`);
    }
    return cloneValidatedResponse(context, dispatchEvent.response);
  }
  validateOutputItemIdentity(dispatchEvent, snapshot, rejectInvalidShellTargets);
  if (accumulateOutputItemEvent(dispatchEvent, snapshot, context)) {
    return snapshot;
  }
  if (accumulateContentPartAddedEvent(dispatchEvent, snapshot, context)) {
    return snapshot;
  }
  if (accumulateContentPartDoneEvent(dispatchEvent, snapshot, context)) {
    return snapshot;
  }
  if (accumulateOutputTextEvent(dispatchEvent, snapshot, context)) {
    return snapshot;
  }
  if (accumulateRefusalAndArgumentsEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (accumulateShellEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (accumulateReasoningEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (accumulateCodeInterpreterEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (accumulateSearchStatusEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (accumulateImageAndMcpStatusEvent(dispatchEvent, snapshot)) {
    return snapshot;
  }
  if (isResponseLifecycleEvent(dispatchEvent)) {
    return cloneValidatedResponse(context, dispatchEvent.response);
  }
  if (isIgnoredResponseEvent(dispatchEvent)) {
    return snapshot;
  }
  return assertNever();
}
var _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_accumulatorContext, _ResponseStream_beginRequest, _ResponseStream_addEvent, _ResponseStream_endRequest;
class ResponseStream extends EventStream$1 {
  /** Creates an unstarted stream, retaining request parameters for structured-output parsing. */
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    _ResponseStream_accumulatorContext.set(this, createResponseContext());
    __classPrivateFieldSet(this, _ResponseStream_params, params);
  }
  /** Starts a new response stream or replays an existing response by its identifier. */
  static createResponse(client, params, options2) {
    const runner = new ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options2,
      __metadata: { ...options2 == null ? void 0 : options2.__metadata, helperMethod: "stream" }
    }));
    return runner;
  }
  /** Consumes serialized response events from a readable stream in another runtime. */
  static fromReadableStream(stream2) {
    const runner = new ResponseStream(null);
    runner._run(() => runner._fromReadableStream(stream2));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream2;
    let starting_after = null;
    if ("response_id" in params) {
      stream2 = await client.responses.retrieve(params.response_id, { stream: true }, { ...options2, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream2 = await client.responses.create({ ...params, stream: true }, { ...options2, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  async _fromReadableStream(readableStream, options2) {
    var _a3;
    this._listenForAbort(options2 == null ? void 0 : options2.signal);
    __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    this._connected();
    const stream2 = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream2) {
      __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, null);
    }
    if ((_a3 = stream2.controller.signal) == null ? void 0 : _a3.aborted) {
      throw this._userAbortError();
    }
    return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  /** Iterates over response events; stopping iteration early aborts the underlying request. */
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_accumulatorContext = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
    if (this.ended) {
      return;
    }
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0);
    __classPrivateFieldSet(this, _ResponseStream_accumulatorContext, createResponseContext());
  }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended) {
      return;
    }
    const maybeEmit = (name, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name, event2);
      }
    };
    if (event.type === "error") {
      const error = (
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- An error event can contain malformed server data; validate its container before extracting error details.
        "error" in event && typeof event.error === "object" && event.error !== null ? event.error : event
      );
      throw new APIError(void 0, error, event.message, void 0);
    }
    let dispatchEvent = event;
    const response = accumulateResponseWithContext(event, __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f"), __classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), true, (sanitizedEvent) => {
      dispatchEvent = sanitizedEvent;
    });
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, response);
    maybeEmit("event", event);
    switch (dispatchEvent.type) {
      case "response.output_text.delta": {
        const output = response.output[dispatchEvent.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${dispatchEvent.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[dispatchEvent.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${dispatchEvent.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...dispatchEvent,
            type: dispatchEvent.type,
            item_id: dispatchEvent.item_id,
            output_index: dispatchEvent.output_index,
            content_index: dispatchEvent.content_index,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[dispatchEvent.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${dispatchEvent.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...dispatchEvent,
            type: dispatchEvent.type,
            item_id: dispatchEvent.item_id,
            output_index: dispatchEvent.output_index,
            snapshot: output.arguments
          });
        }
        break;
      }
      default: {
        maybeEmit(dispatchEvent.type, event);
        break;
      }
    }
  }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0);
    __classPrivateFieldSet(this, _ResponseStream_accumulatorContext, createResponseContext());
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse);
    return parsedResponse;
  }, Symbol.asyncIterator)]() {
    return this._createIterator((push) => {
      const onEvent = (event) => push(event);
      this.on("event", onEvent);
      return () => this.off("event", onEvent);
    }, { onReturn: () => this.abort() });
  }
  /**
   * Waits for the stream to end and returns its latest accumulated response.
   *
   * A clean end after at least one response event resolves even when the response is
   * incomplete. Network errors, cancellation, and streams without a response reject.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
    if (!response) {
      throw new OpenAIError("stream ended without producing a Response");
    }
    return response;
  }
}
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
class InputItems2 extends APIResource {
  /**
   * Returns a list of input items for a given response.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const responseItem of client.responses.inputItems.list(
   *   'response_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(responseID, query = {}, options2) {
    return this._client.getAPIList(path`/responses/${responseID}/input_items`, CursorPage, { query, ...options2, __security: { bearerAuth: true } });
  }
}
class InputTokens2 extends APIResource {
  /**
   * Returns input token counts of the request.
   *
   * Returns an object with `object` set to `response.input_tokens` and an
   * `input_tokens` count.
   *
   * @example
   * ```ts
   * const response = await client.responses.inputTokens.count();
   * ```
   */
  count(body = {}, options2) {
    return this._client.post("/responses/input_tokens", {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
class Responses2 extends APIResource {
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems2(this._client);
    this.inputTokens = new InputTokens2(this._client);
  }
  create(body, options2) {
    return this._client.post("/responses", {
      body,
      ...options2,
      stream: body.stream ?? false,
      __security: { bearerAuth: true }
    })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseID, query = {}, options2) {
    return this._client.get(path`/responses/${responseID}`, {
      query,
      ...options2,
      stream: (query == null ? void 0 : query.stream) ?? false,
      __security: { bearerAuth: true }
    })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.delete(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  delete(responseID, options2) {
    return this._client.delete(path`/responses/${responseID}`, {
      ...options2,
      headers: buildHeaders([{ Accept: "*/*" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  parse(body, options2) {
    return this._client.responses.create(body, options2)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options2) {
    return ResponseStream.createResponse(this._client, body, options2);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://developers.openai.com/api/docs/guides/background).
   *
   * @example
   * ```ts
   * const response = await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseID, options2) {
    return this._client.post(path`/responses/${responseID}/cancel`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Compact a conversation. Returns a compacted response object.
   *
   * Learn when and how to compact long-running conversations in the
   * [conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state#managing-the-context-window).
   * For ZDR-compatible compaction details, see
   * [Compaction (advanced)](https://developers.openai.com/api/docs/guides/conversation-state#compaction-advanced).
   *
   * @example
   * ```ts
   * const compactedResponse = await client.responses.compact({
   *   model: 'gpt-6-astra',
   * });
   * ```
   */
  compact(body, options2) {
    return this._client.post("/responses/compact", { body, ...options2, __security: { bearerAuth: true } });
  }
}
Responses2.InputItems = InputItems2;
Responses2.InputTokens = InputTokens2;
class Alerts extends APIResource {
  /**
   * Get a safety alert belonging to the authenticated API project.
   */
  retrieve(id, options2) {
    return this._client.get(path`/safety/alerts/${id}`, { ...options2, __security: { bearerAuth: true } });
  }
}
class Safety extends APIResource {
  constructor() {
    super(...arguments);
    this.alerts = new Alerts(this._client);
  }
}
Safety.Alerts = Alerts;
let Content$1 = class Content2 extends APIResource {
  /**
   * Download a skill zip bundle by its ID.
   */
  retrieve(skillID, options2) {
    return this._client.get(path`/skills/${skillID}/content`, {
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
};
class Content3 extends APIResource {
  /**
   * Download a skill version zip bundle.
   */
  retrieve(version, params, options2) {
    const { skill_id } = params;
    return this._client.get(path`/skills/${skill_id}/versions/${version}/content`, {
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
}
class Versions extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content3(this._client);
  }
  /**
   * Create a new immutable skill version.
   */
  create(skillID, body = {}, options2) {
    return this._client.post(path`/skills/${skillID}/versions`, maybeMultipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client, {
      stripFilenames: false
    }));
  }
  /**
   * Get a specific skill version.
   */
  retrieve(version, params, options2) {
    const { skill_id } = params;
    return this._client.get(path`/skills/${skill_id}/versions/${version}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List skill versions for a skill.
   */
  list(skillID, query = {}, options2) {
    return this._client.getAPIList(path`/skills/${skillID}/versions`, CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a skill version.
   */
  delete(version, params, options2) {
    const { skill_id } = params;
    return this._client.delete(path`/skills/${skill_id}/versions/${version}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
Versions.Content = Content3;
class Skills extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content$1(this._client);
    this.versions = new Versions(this._client);
  }
  /**
   * Create a new skill.
   */
  create(body = {}, options2) {
    return this._client.post("/skills", maybeMultipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client, {
      stripFilenames: false
    }));
  }
  /**
   * Get a skill by its ID.
   */
  retrieve(skillID, options2) {
    return this._client.get(path`/skills/${skillID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Update the default version pointer for a skill.
   */
  update(skillID, body, options2) {
    return this._client.post(path`/skills/${skillID}`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * List all skills for the current project.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/skills", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a skill by its ID.
   */
  delete(skillID, options2) {
    return this._client.delete(path`/skills/${skillID}`, { ...options2, __security: { bearerAuth: true } });
  }
}
Skills.Content = Content$1;
Skills.Versions = Versions;
class Parts extends APIResource {
  /**
   * Adds a
   * [Part](https://developers.openai.com/api/reference/resources/uploads/subresources/parts)
   * to an [Upload](https://developers.openai.com/api/reference/resources/uploads)
   * object. A Part represents a chunk of bytes from the file you are trying to
   * upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://developers.openai.com/api/reference/resources/uploads/methods/complete).
   */
  create(uploadID, body, options2) {
    return this._client.post(path`/uploads/${uploadID}/parts`, multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
}
class Uploads extends APIResource {
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://developers.openai.com/api/reference/resources/uploads) object
   * that you can add
   * [Parts](https://developers.openai.com/api/reference/resources/uploads/subresources/parts)
   * to. Currently, an Upload can accept at most 8 GB in total and expires after an
   * hour after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://developers.openai.com/api/reference/resources/files) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://developers.openai.com/api/docs/guides/tools-file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://developers.openai.com/api/reference/resources/files/methods/create).
   *
   * Returns the Upload object with status `pending`.
   */
  create(body, options2) {
    return this._client.post("/uploads", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   *
   * Returns the Upload object with status `cancelled`.
   */
  cancel(uploadID, options2) {
    return this._client.post(path`/uploads/${uploadID}/cancel`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Completes the
   * [Upload](https://developers.openai.com/api/reference/resources/uploads).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://developers.openai.com/api/reference/resources/files) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed. Returns the Upload object with status `completed`,
   * including an additional `file` property containing the created usable File
   * object.
   */
  complete(uploadID, body, options2) {
    return this._client.post(path`/uploads/${uploadID}/complete`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
}
Uploads.Parts = Parts;
function pollVectorStoreFile(resource, vectorStoreID, fileID, options2) {
  return pollWithResponse((headers) => resource.retrieve(fileID, { vector_store_id: vectorStoreID }, { ...options2, headers }), ["in_progress"], ["failed", "cancelled", "completed"], options2);
}
function pollVectorStoreFileBatch(resource, vectorStoreID, batchID, options2) {
  return pollWithResponse((headers) => resource.retrieve(batchID, { vector_store_id: vectorStoreID }, { ...options2, headers }), ["in_progress"], ["failed", "cancelled", "completed"], options2);
}
const allSettledWithThrow = async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    throw Object.defineProperty(new Error(`${rejected.length} promise(s) failed`), "rejections", {
      configurable: true,
      value: rejected.map(({ reason }) => reason),
      writable: true
    });
  }
  const values2 = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values2.push(result.value);
    }
  }
  return values2;
};
async function uploadAndPollVectorStoreFileBatch(resource, client, vectorStoreId, files, fileIds, options2) {
  if (files === null || files === void 0 || files.length === 0) {
    throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
  }
  const configuredConcurrency = (options2 == null ? void 0 : options2.maxConcurrency) ?? 5;
  const concurrencyLimit = Math.min(configuredConcurrency, files.length);
  if (concurrencyLimit === 0) {
    throw new RangeError("maxConcurrency must be greater than 0");
  }
  const fileIterator = files.values();
  const allFileIds = [...fileIds];
  async function processFiles(iterator) {
    for (const item of iterator) {
      const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options2);
      allFileIds.push(fileObj.id);
    }
  }
  const workers = [];
  workers.length = concurrencyLimit;
  for (let index = 0; index < workers.length; index += 1) {
    workers[index] = processFiles(fileIterator);
  }
  await allSettledWithThrow(workers);
  return await resource.createAndPoll(vectorStoreId, { file_ids: allFileIds }, options2);
}
class FileBatches extends APIResource {
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreID, body, options2) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/file_batches`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(batchID, params, options2) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/file_batches/${batchID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(batchID, params, options2) {
    const { vector_store_id } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/cancel`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options2) {
    const batch = await this.create(vectorStoreId, body, options2);
    return await this.poll(vectorStoreId, batch.id, options2);
  }
  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(batchID, params, options2) {
    const { vector_store_id, ...query } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/files`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreID, batchID, options2) {
    return await pollVectorStoreFileBatch(this, vectorStoreID, batchID, options2);
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options2) {
    return await uploadAndPollVectorStoreFileBatch(this, this._client, vectorStoreId, files, fileIds, options2);
  }
}
class Files4 extends APIResource {
  /**
   * Create a vector store file by attaching a
   * [File](https://developers.openai.com/api/reference/resources/files) to a
   * [vector store](https://developers.openai.com/api/reference/resources/vector_stores).
   */
  create(vectorStoreID, body, options2) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/files`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(fileID, params, options2) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(fileID, params, options2) {
    const { vector_store_id, ...body } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of vector store files.
   */
  list(vectorStoreID, query = {}, options2) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/files`, CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://developers.openai.com/api/reference/resources/files/methods/delete)
   * endpoint.
   */
  delete(fileID, params, options2) {
    const { vector_store_id } = params;
    return this._client.delete(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options2) {
    const file = await this.create(vectorStoreId, body, options2);
    return await this.poll(vectorStoreId, file.id, options2);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreID, fileID, options2) {
    return await pollVectorStoreFile(this, vectorStoreID, fileID, options2);
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options2) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options2);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options2);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options2) {
    const fileInfo = await this.upload(vectorStoreId, file, options2);
    return await this.poll(vectorStoreId, fileInfo.id, options2);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(fileID, params, options2) {
    const { vector_store_id } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/files/${fileID}/content`, Page, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
class VectorStores extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files4(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options2) {
    return this._client.post("/vector_stores", {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreID, options2) {
    return this._client.get(path`/vector_stores/${vectorStoreID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreID, body, options2) {
    return this._client.post(path`/vector_stores/${vectorStoreID}`, {
      body,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns a list of vector stores.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/vector_stores", CursorPage, {
      query,
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Delete a vector store.
   */
  delete(vectorStoreID, options2) {
    return this._client.delete(path`/vector_stores/${vectorStoreID}`, {
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreID, body, options2) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/search`, Page, {
      body,
      method: "post",
      ...options2,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true }
    });
  }
}
VectorStores.Files = Files4;
VectorStores.FileBatches = FileBatches;
class Videos extends APIResource {
  /**
   * Create a new video generation job from a prompt and optional reference assets.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  create(body, options2) {
    return this._client.post("/videos", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Fetch the latest metadata for a generated video.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  retrieve(videoID, options2) {
    return this._client.get(path`/videos/${videoID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * List recently generated videos for the current project.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/videos", ConversationCursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Permanently delete a completed or failed video and its stored assets.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  delete(videoID, options2) {
    return this._client.delete(path`/videos/${videoID}`, { ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Create a character from an uploaded video.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  createCharacter(body, options2) {
    return this._client.post("/videos/characters", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Download the generated video bytes or a derived preview asset.
   *
   * Streams the rendered video content for the specified video job.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  downloadContent(videoID, query = {}, options2) {
    return this._client.get(path`/videos/${videoID}/content`, {
      query,
      ...options2,
      headers: buildHeaders([{ Accept: "application/binary" }, options2 == null ? void 0 : options2.headers]),
      __security: { bearerAuth: true },
      __binaryResponse: true
    });
  }
  /**
   * Create a new video generation job by editing a source video or existing
   * generated video.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  edit(body, options2) {
    return this._client.post("/videos/edits", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Create an extension of a completed video.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  extend(body, options2) {
    return this._client.post("/videos/extensions", multipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
  /**
   * Fetch a character.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  getCharacter(characterID, options2) {
    return this._client.get(path`/videos/characters/${characterID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Create a remix of a completed video using a refreshed prompt.
   *
   * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
   */
  remix(videoID, body, options2) {
    return this._client.post(path`/videos/${videoID}/remix`, maybeMultipartFormRequestOptions({ body, ...options2, __security: { bearerAuth: true } }, this._client));
  }
}
const MAX_DIRECT_WEBHOOK_VERIFICATIONS = 32;
const SHA256_SIGNATURE_LENGTH = 32;
function webhookSignatureRequiresSigning(signatureHeader) {
  return signatureHeader.split(" ", MAX_DIRECT_WEBHOOK_VERIFICATIONS + 1).length > MAX_DIRECT_WEBHOOK_VERIFICATIONS;
}
function* signatureCandidates(signatureHeader) {
  let start2 = 0;
  while (start2 <= signatureHeader.length) {
    const separator = signatureHeader.indexOf(" ", start2);
    const candidate = signatureHeader.slice(start2, separator === -1 ? void 0 : separator);
    yield candidate.startsWith("v1,") ? candidate.slice(3) : candidate;
    if (separator === -1) {
      break;
    }
    start2 = separator + 1;
  }
}
function decodeSignature(signature) {
  try {
    const signatureBytes = fromBase64(signature);
    return signatureBytes.byteLength === SHA256_SIGNATURE_LENGTH ? signatureBytes : void 0;
  } catch {
    return void 0;
  }
}
function firstValidLengthSignature(signatureHeader) {
  for (const signature of signatureCandidates(signatureHeader)) {
    const signatureBytes = decodeSignature(signature);
    if (signatureBytes) {
      return signatureBytes;
    }
  }
  return void 0;
}
function selectMatchingSignature(signatureHeader, expectedSignature, firstSignature) {
  let matchingSignature = firstSignature;
  for (const signature of signatureCandidates(signatureHeader)) {
    const signatureBytes = decodeSignature(signature);
    if (!signatureBytes) {
      continue;
    }
    let difference = 0;
    for (const [index, byte] of signatureBytes.entries()) {
      difference |= byte ^ (expectedSignature[index] ?? 0);
    }
    if (difference === 0) {
      matchingSignature = signatureBytes;
    }
  }
  return matchingSignature;
}
async function verifyWebhookSignature(payload, signatureHeader, timestamp, webhookId, secret, tolerance) {
  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (Number.isNaN(timestampSeconds)) {
    throw new InvalidWebhookSignatureError("Invalid webhook timestamp format");
  }
  const nowSeconds = Math.floor(Date.now() / 1e3);
  if (nowSeconds - timestampSeconds > tolerance) {
    throw new InvalidWebhookSignatureError("Webhook timestamp is too old");
  }
  if (timestampSeconds > nowSeconds + tolerance) {
    throw new InvalidWebhookSignatureError("Webhook timestamp is too new");
  }
  const useBoundedVerification = webhookSignatureRequiresSigning(signatureHeader);
  const firstSignature = useBoundedVerification ? firstValidLengthSignature(signatureHeader) : void 0;
  if (useBoundedVerification && !firstSignature) {
    throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
  }
  const decodedSecret = Uint8Array.from(secret.startsWith("whsec_") ? fromBase64(secret.slice("whsec_".length)) : encodeUTF8(secret));
  const signedPayload = webhookId ? `${webhookId}.${timestamp}.${payload}` : `${timestamp}.${payload}`;
  const signedPayloadBytes = Uint8Array.from(encodeUTF8(signedPayload));
  const key = await crypto.subtle.importKey("raw", decodedSecret, { name: "HMAC", hash: "SHA-256" }, false, useBoundedVerification ? ["sign", "verify"] : ["verify"]);
  if (useBoundedVerification && firstSignature) {
    const expectedSignature = new Uint8Array(await crypto.subtle.sign("HMAC", key, signedPayloadBytes));
    const signatureToVerify = selectMatchingSignature(signatureHeader, expectedSignature, firstSignature);
    try {
      if (await crypto.subtle.verify("HMAC", key, Uint8Array.from(signatureToVerify), signedPayloadBytes)) {
        return;
      }
    } catch {
    }
    throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
  }
  for (const signature of signatureCandidates(signatureHeader)) {
    try {
      const signatureBytes = Uint8Array.from(fromBase64(signature));
      const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, signedPayloadBytes);
      if (isValid) {
        return;
      }
    } catch {
    }
  }
  throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
}
class EventTypes extends APIResource {
  /**
   * Returns webhook event types visible to the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEventTypeList =
   *   await client.webhooks.eventTypes.list();
   * ```
   */
  list(options2) {
    return this._client.get("/webhook_event_types", { ...options2, __security: { bearerAuth: true } });
  }
}
var _Webhooks_instances, _Webhooks_validateSecret, _Webhooks_getRequiredHeader;
class Webhooks extends APIResource {
  constructor() {
    super(...arguments);
    _Webhooks_instances.add(this);
    this.eventTypes = new EventTypes(this._client);
  }
  /**
   * Creates a webhook endpoint for the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEndpointWithSecret =
   *   await client.webhooks.create({
   *     event_types: ['batch.completed'],
   *     name: 'x',
   *     url: 'https://',
   *   });
   * ```
   */
  create(body, options2) {
    return this._client.post("/webhook_endpoints", { body, ...options2, __security: { bearerAuth: true } });
  }
  /**
   * Retrieves a webhook endpoint for the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEndpoint = await client.webhooks.retrieve(
   *   'whe_123',
   * );
   * ```
   */
  retrieve(webhookEndpointID, options2) {
    return this._client.get(path`/webhook_endpoints/${webhookEndpointID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Updates a webhook endpoint for the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEndpoint = await client.webhooks.update('whe_123');
   * ```
   */
  update(webhookEndpointID, body = {}, options2) {
    return this._client.post(path`/webhook_endpoints/${webhookEndpointID}`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Returns webhook endpoints for the authenticated project in newest-first order.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const webhookEndpoint of client.webhooks.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options2) {
    return this._client.getAPIList("/webhook_endpoints", CursorPage, {
      query,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Deletes a webhook endpoint for the authenticated project.
   *
   * @example
   * ```ts
   * const deletedWebhookEndpoint = await client.webhooks.delete(
   *   'whe_123',
   * );
   * ```
   */
  delete(webhookEndpointID, options2) {
    return this._client.delete(path`/webhook_endpoints/${webhookEndpointID}`, {
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Rotates the signing secret for a webhook endpoint in the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEndpointWithSecret =
   *   await client.webhooks.rotateSecret('whe_123');
   * ```
   */
  rotateSecret(webhookEndpointID, body = {}, options2) {
    return this._client.post(path`/webhook_endpoints/${webhookEndpointID}/rotate_secret`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Sends a sample event to a webhook endpoint for the authenticated project.
   *
   * @example
   * ```ts
   * const webhookEndpointTestResult =
   *   await client.webhooks.test('whe_123', {
   *     event_type: 'batch.completed',
   *   });
   * ```
   */
  test(webhookEndpointID, body, options2) {
    return this._client.post(path`/webhook_endpoints/${webhookEndpointID}/test`, {
      body,
      ...options2,
      __security: { bearerAuth: true }
    });
  }
  /**
   * Validates that the given payload was sent by OpenAI and parses the payload.
   */
  async unwrap(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    await this.verifySignature(payload, headers, secret, tolerance);
    return JSON.parse(payload);
  }
  /**
   * Validates whether or not the webhook payload was sent by OpenAI.
   *
   * An error will be raised if the webhook payload was not sent by OpenAI.
   *
   * @param payload - The webhook payload
   * @param headers - The webhook headers
   * @param secret - The webhook secret (optional, will use client secret if not provided)
   * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
   */
  async verifySignature(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    var _a3;
    if (typeof crypto === "undefined" || typeof ((_a3 = crypto.subtle) == null ? void 0 : _a3.importKey) !== "function" || typeof crypto.subtle.verify !== "function") {
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    }
    __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_validateSecret).call(this, secret);
    const headersObj = buildHeaders([headers]).values;
    const signatureHeader = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-signature");
    const timestamp = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-timestamp");
    const webhookId = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-id");
    if (webhookSignatureRequiresSigning(signatureHeader) && typeof crypto.subtle.sign !== "function") {
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    }
    return await verifyWebhookSignature(payload, signatureHeader, timestamp, webhookId, secret, tolerance);
  }
}
_Webhooks_instances = /* @__PURE__ */ new WeakSet(), _Webhooks_validateSecret = function _Webhooks_validateSecret2(secret) {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new Error(`The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function`);
  }
}, _Webhooks_getRequiredHeader = function _Webhooks_getRequiredHeader2(headers, name) {
  if (!headers) {
    throw new Error(`Headers are required`);
  }
  const value = headers.get(name);
  if (value === null || value === void 0) {
    throw new Error(`Missing required header: ${name}`);
  }
  return value;
};
Webhooks.EventTypes = EventTypes;
async function resolveRealtimeAPIKey(client) {
  let apiKey;
  const isProvider = await client._callApiKey((resolved) => {
    apiKey = resolved;
  });
  return { apiKey: apiKey === void 0 ? client.apiKey : apiKey, isProvider };
}
const providerDefinitionsKey = Symbol.for("openai.node.providerDefinitions.v1");
const providerGlobal = globalThis;
const existingProviderDefinitions = providerGlobal[providerDefinitionsKey];
const providerDefinitions = existingProviderDefinitions ?? /* @__PURE__ */ new WeakMap();
if (!existingProviderDefinitions) {
  Object.defineProperty(providerGlobal, providerDefinitionsKey, { value: providerDefinitions });
}
function configureProvider(provider) {
  const definition = providerDefinitions.get(provider);
  if (!definition) {
    throw new Error("Invalid provider. Providers must be created with createProvider().");
  }
  return definition.configure();
}
var _OpenAI_instances, _a, _OpenAI_encoder, _OpenAI_x509Authentication, _OpenAI_x509Credential, _OpenAI_x509Fetch, _OpenAI_explicitDataResidency, _OpenAI_responseAttempts, _OpenAI_baseURLOverridden;
function isRunningInBrowserOrBrowserWorker() {
  var _a3, _b2, _c2;
  if (isRunningInBrowser())
    return true;
  const scope = globalThis;
  return typeof scope.WorkerGlobalScope === "function" && scope instanceof scope.WorkerGlobalScope && typeof scope.WorkerNavigator === "function" && scope.navigator instanceof scope.WorkerNavigator && typeof ((_a3 = scope.navigator) == null ? void 0 : _a3.userAgent) === "string" && scope.navigator.userAgent !== "Cloudflare-Workers" && ((_c2 = (_b2 = scope.process) == null ? void 0 : _b2.versions) == null ? void 0 : _c2.node) === void 0 && scope.Deno === void 0 && scope.Bun === void 0 && scope.EdgeRuntime === void 0 && scope.WebSocketPair === void 0;
}
const WORKLOAD_IDENTITY_API_KEY_PLACEHOLDER = "workload-identity-auth";
const inheritedDataResidencySelection = Symbol("inheritedDataResidencySelection");
class OpenAI {
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | null | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? null]
   * @param {string | null | undefined} [opts.adminAPIKey=process.env['OPENAI_ADMIN_KEY'] ?? null]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {Provider} [opts.provider] - Configure a third-party API provider. Mutually exclusive with top-level authentication and base URL options.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor(clientOptions = {}) {
    _OpenAI_instances.add(this);
    _OpenAI_encoder.set(this, void 0);
    _OpenAI_x509Authentication.set(this, void 0);
    _OpenAI_x509Credential.set(this, void 0);
    _OpenAI_x509Fetch.set(this, void 0);
    _OpenAI_explicitDataResidency.set(this, false);
    _OpenAI_responseAttempts.set(this, /* @__PURE__ */ new WeakMap());
    this.completions = new Completions2(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files$1(this);
    this.images = new Images(this);
    this.contentProvenanceChecks = new ContentProvenanceChecks(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.safety = new Safety(this);
    this.webhooks = new Webhooks(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.admin = new Admin(this);
    this.responses = new Responses2(this);
    this.live = new Live(this);
    this.realtime = new Realtime2(this);
    this.conversations = new Conversations(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    this.skills = new Skills(this);
    this.videos = new Videos(this);
    const { credential, options: normalizedOptions } = normalizeX509CredentialOptions(clientOptions);
    clientOptions = normalizedOptions;
    const residencyBaseURL = resolveDataResidency(clientOptions);
    const provider = clientOptions.provider;
    const { baseURL = provider ? null : readEnv("OPENAI_BASE_URL"), dataResidency: _dataResidency, [inheritedDataResidencySelection]: inheritedResidencySelection = false, apiKey = provider ? null : readEnv("OPENAI_API_KEY") ?? null, adminAPIKey = provider ? null : readEnv("OPENAI_ADMIN_KEY") ?? null, organization = provider ? null : readEnv("OPENAI_ORG_ID") ?? null, project = provider ? null : readEnv("OPENAI_PROJECT_ID") ?? null, webhookSecret = readEnv("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity, x509Transport, credential: _credential, ...opts } = clientOptions;
    if (provider) {
      const conflictingOptions = ["apiKey", "adminAPIKey", "workloadIdentity", "x509Transport", "baseURL", "dataResidency"].filter((key) => (key === "workloadIdentity" ? workloadIdentity : clientOptions[key]) != null);
      if (conflictingOptions.length) {
        throw new OpenAIError(`The \`provider\` option cannot be used with ${conflictingOptions.map((key) => `\`${key}\``).join(", ")}. Configure authentication and the base URL through the provider instead.`);
      }
    }
    const identity = isX509WorkloadIdentity(workloadIdentity) ? { x509: workloadIdentity, legacy: void 0 } : { x509: void 0, legacy: workloadIdentity };
    const x509Identity = identity.x509;
    const usesX509Identity = x509Identity !== void 0;
    const providerRuntime = provider ? configureProvider(provider) : void 0;
    const options2 = {
      apiKey,
      adminAPIKey,
      organization,
      project,
      webhookSecret,
      workloadIdentity,
      x509Transport,
      provider,
      ...opts,
      baseURL: (providerRuntime == null ? void 0 : providerRuntime.baseURL) ?? residencyBaseURL ?? (baseURL || (usesX509Identity ? X509_API_BASE_URL : `https://api.openai.com/v1`))
    };
    if (x509Transport && !usesX509Identity) {
      throw new OpenAIError("An X.509 transport requires an X.509 workload identity.");
    }
    if (usesX509Identity) {
      if (residencyBaseURL !== void 0 || inheritedResidencySelection) {
        throw new OpenAIError("X.509 workload identity does not support data residency selection.");
      }
      if (clientOptions.fetch !== void 0) {
        throw new OpenAIError("X.509 workload identity does not support a custom fetch implementation.");
      }
      assertX509APIOrigin(options2.baseURL);
      assertX509RequestOptions(options2.fetchOptions);
      if (this.fetchWithAuth !== _a.prototype.fetchWithAuth || this.fetchWithTimeout !== _a.prototype.fetchWithTimeout) {
        throw new OpenAIError("X.509 workload identity does not support overridden fetch dispatch hooks.");
      }
    }
    if (apiKey && workloadIdentity) {
      throw new OpenAIError("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    }
    if (!providerRuntime && !apiKey && !adminAPIKey && !workloadIdentity) {
      throw new OpenAIError("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    }
    if (!options2.dangerouslyAllowBrowser && isRunningInBrowserOrBrowserWorker()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    this.baseURL = options2.baseURL;
    __classPrivateFieldSet(this, _OpenAI_explicitDataResidency, residencyBaseURL !== void 0 || inheritedResidencySelection);
    this.timeout = options2.timeout ?? _a.DEFAULT_TIMEOUT;
    this.logger = options2.logger ?? console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = parseLogLevel(options2.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? defaultLogLevel;
    this.fetchOptions = options2.fetchOptions;
    this.maxRetries = options2.maxRetries ?? 2;
    this.fetch = options2.fetch ?? getDefaultFetch();
    __classPrivateFieldSet(this, _OpenAI_encoder, FallbackEncoder);
    const customHeadersEnv = provider || credential ? void 0 : readEnv("OPENAI_CUSTOM_HEADERS");
    if (customHeadersEnv) {
      const parsed = {};
      for (const line of customHeadersEnv.split("\n")) {
        const colon = line.indexOf(":");
        if (colon >= 0) {
          parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
        }
      }
      options2.defaultHeaders = buildHeaders([parsed, options2.defaultHeaders]);
    }
    this._options = options2;
    this._provider = providerRuntime;
    if (x509Identity) {
      const authentication = new X509WorkloadIdentityAuth(x509Identity, x509Transport, organization, project);
      this._workloadIdentityAuth = authentication;
      __classPrivateFieldSet(this, _OpenAI_x509Authentication, authentication);
      __classPrivateFieldSet(this, _OpenAI_x509Credential, credential);
      __classPrivateFieldSet(this, _OpenAI_x509Fetch, authentication.fetch());
      this.fetch = __classPrivateFieldGet(this, _OpenAI_x509Fetch, "f");
      markApprovedX509Client(this);
    } else if (identity.legacy) {
      this._workloadIdentityAuth = new WorkloadIdentityAuth(identity.legacy, this.fetch);
    }
    this.apiKey = typeof apiKey === "string" ? apiKey : null;
    this.adminAPIKey = adminAPIKey;
    this.organization = organization;
    this.project = project;
    this.webhookSecret = webhookSecret;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options2) {
    const residencyBaseURL = resolveDataResidency(options2);
    const x509Authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
    const inheritedOptions = {
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") ? void 0 : this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this._options.apiKey,
      adminAPIKey: this.adminAPIKey,
      workloadIdentity: (x509Authentication == null ? void 0 : x509Authentication.identitySnapshot()) ?? this._options.workloadIdentity,
      x509Transport: this._options.x509Transport,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret
    };
    const { credential, provider } = prepareX509ClientClone(inheritedOptions, options2, __classPrivateFieldGet(this, _OpenAI_x509Credential, "f"), x509Authentication !== void 0);
    if (residencyBaseURL !== void 0) {
      delete inheritedOptions.baseURL;
    }
    const clientOptions = {
      ...inheritedOptions,
      ...options2,
      credential,
      provider,
      [inheritedDataResidencySelection]: __classPrivateFieldGet(this, _OpenAI_explicitDataResidency, "f") && residencyBaseURL === void 0 && !hasOwn(options2, "baseURL") && options2.credential === void 0 && !provider
    };
    const client = new this.constructor(clientOptions);
    if (provider && new URL(client.baseURL).origin !== new URL(this.baseURL).origin) {
      Object.assign(client._options, {
        defaultHeaders: options2.defaultHeaders,
        defaultQuery: options2.defaultQuery,
        fetchOptions: options2.fetchOptions,
        fetch: options2.fetch
      });
      client.fetchOptions = options2.fetchOptions;
      client.fetch = options2.fetch ?? getDefaultFetch();
      client.organization = options2.organization ?? null;
      client.project = options2.project ?? null;
    }
    if (__classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") && __classPrivateFieldGet(client, _OpenAI_x509Authentication, "f") && this.baseURL === client.baseURL && __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f").matches(__classPrivateFieldGet(client, _OpenAI_x509Authentication, "f"))) {
      client._workloadIdentityAuth = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
      __classPrivateFieldSet(client, _OpenAI_x509Authentication, __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f"));
      __classPrivateFieldSet(client, _OpenAI_x509Fetch, __classPrivateFieldGet(this, _OpenAI_x509Fetch, "f"));
    }
    return client;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  /** @internal Client request headers for each new WebSocket handshake. */
  _buildWebSocketHeaders(authHeaders) {
    return Object.fromEntries(buildHeaders([
      {
        "User-Agent": this.getUserAgent(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      authHeaders,
      this._options.defaultHeaders
    ]).values);
  }
  validateHeaders({ values: values2, nulls }, schemes = {
    bearerAuth: true,
    adminAPIKeyAuth: true
  }) {
    if (values2.get("authorization") || values2.get("api-key")) {
      return;
    }
    if (nulls.has("authorization") || nulls.has("api-key")) {
      return;
    }
    if (this._workloadIdentityAuth && schemes.bearerAuth) {
      return;
    }
    throw new Error('Could not resolve authentication method. Expected either apiKey or adminAPIKey to be set. Or for one of the "Authorization" or "api-key" headers to be explicitly omitted');
  }
  async authHeaders(opts, schemes = {
    bearerAuth: true,
    adminAPIKeyAuth: true
  }) {
    const authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") ?? this._workloadIdentityAuth;
    if (authentication instanceof X509WorkloadIdentityAuth && schemes.adminAPIKeyAuth && this.adminAPIKey !== null) {
      return await this.adminAPIKeyAuth(opts);
    }
    return buildHeaders([
      schemes.bearerAuth ? await this.bearerAuth(opts) : null,
      schemes.adminAPIKeyAuth ? await this.adminAPIKeyAuth(opts) : null
    ]);
  }
  async bearerAuth(opts) {
    const authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") ?? this._workloadIdentityAuth;
    if (authentication) {
      if (authentication instanceof X509WorkloadIdentityAuth) {
        if (authentication === this._workloadIdentityAuth && (this.fetchWithAuth !== _a.prototype.fetchWithAuth || this.fetchWithTimeout !== _a.prototype.fetchWithTimeout)) {
          throw new OpenAIError("X.509 workload identity does not support overridden fetch dispatch hooks.");
        }
        const snapshots = authentication.headerSnapshots();
        if (!X509WorkloadIdentityAuth.shouldAuthenticate(opts, snapshots.defaultHeaders, snapshots.requestHeaders)) {
          return void 0;
        }
      }
      const token = authentication instanceof X509WorkloadIdentityAuth ? await authentication.getToken(opts, {
        apiURL: authentication.requestAPIURL(),
        ...authentication.headerSnapshots(),
        ...authentication.requestSnapshot(),
        signal: authentication.effectiveSignal(),
        ...authentication.tenantSnapshot()
      }) : await authentication.getToken();
      return buildHeaders([{ Authorization: `Bearer ${token}` }]);
    }
    const { apiKey } = await resolveRealtimeAPIKey(this);
    if (apiKey == null) {
      return void 0;
    }
    return buildHeaders([{ Authorization: `Bearer ${apiKey}` }]);
  }
  async adminAPIKeyAuth(opts) {
    if (this.adminAPIKey == null) {
      return void 0;
    }
    return buildHeaders([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(query) {
    return stringifyQuery(query);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status, error, message, headers) {
    const normalizedError = error && typeof error === "object" && error.error == null ? { error } : error;
    return APIError.generate(status, normalizedError, message, headers);
  }
  _hasApiKeyProvider() {
    return typeof this._options.apiKey === "function";
  }
  /**
   * Resolves a function-based API key and retains the resolved value on this client.
   * Returns whether a provider was invoked. Internal callers can capture this
   * invocation's key before another request updates the shared `apiKey` property.
   * Overrides should forward `capture` or invoke it with their own resolved key
   * to preserve invocation-local credentials in concurrent requests and Realtime factories.
   * @internal
   */
  async _callApiKey(capture) {
    if (this._provider) {
      capture == null ? void 0 : capture(this.apiKey);
      return false;
    }
    const apiKey = this._options.apiKey;
    if (typeof apiKey !== "function") {
      capture == null ? void 0 : capture(this.apiKey);
      return false;
    }
    let token;
    try {
      token = await apiKey();
    } catch (err) {
      if (err instanceof OpenAIError)
        throw err;
      throw new OpenAIError(
        `Failed to get token from 'apiKey' function: ${err.message}`,
        // @ts-ignore
        { cause: err }
      );
    }
    if (typeof token !== "string" || !token) {
      throw new OpenAIError(`Expected 'apiKey' function argument to return a string but it returned ${token}`);
    }
    this.apiKey = token;
    capture == null ? void 0 : capture(this.apiKey);
    return true;
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    const pathQuery = Object.fromEntries(url.searchParams);
    if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
      query = { ...pathQuery, ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   * Function-based credentials are resolved later, when building authentication
   * headers, including for direct `buildRequest()` calls. Overriding this hook
   * does not bypass that resolution.
   */
  async prepareOptions(options2) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options: options2 }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return { method, path: path2, ...opts2 };
    }));
  }
  request(options2, remainingRetries = null) {
    const authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") ?? this._workloadIdentityAuth;
    const request = authentication instanceof X509WorkloadIdentityAuth ? Promise.resolve(options2).then((resolved) => authentication.runRequest(() => this.makeRequest(resolved, remainingRetries, void 0), this)) : this.makeRequest(options2, remainingRetries, void 0);
    return this.responsePromise(request);
  }
  responsePromise(request, parse = (client, props) => this.parseResponseWithTimeout(client, props)) {
    const promise = new APIPromise(this, request, (client, props) => {
      var _a3;
      const resume = (_a3 = __classPrivateFieldGet(this, _OpenAI_responseAttempts, "f").get(props.controller)) == null ? void 0 : _a3.continueRequest;
      return resume ? resume(() => parse(client, props)) : parse(client, props);
    });
    promise.withResponse = async () => {
      const data = await promise;
      const { response } = await request;
      return { data, response, request_id: response.headers.get("x-request-id") };
    };
    promise._thenUnwrap = (transform) => this.responsePromise(request, async (client, props) => addRequestID(transform(await parse(client, props), props), props.response));
    return promise;
  }
  async parseResponseWithTimeout(client, props) {
    var _a3;
    if (props.options.stream || props.options.__binaryResponse || props.response.status === 204 || props.response.headers.get("content-length") === "0") {
      return defaultParseResponse(client, props);
    }
    while (true) {
      const attempt = __classPrivateFieldGet(this, _OpenAI_responseAttempts, "f").get(props.controller);
      const timeout = (attempt == null ? void 0 : attempt.timeout) ?? props.options.timeout ?? this.timeout;
      const x509Authentication = attempt == null ? void 0 : attempt.authentication;
      const callerSignal = x509Authentication ? props.controller.signal : props.options.signal;
      const abortError = () => x509Authentication && callerSignal ? this._makeUserAbortError(callerSignal) : new APIUserAbortError();
      let remaining;
      try {
        remaining = (x509Authentication == null ? void 0 : x509Authentication.remainingTimeout(props.options, timeout)) ?? Math.max(0, props.startTime + timeout - Date.now());
      } catch (error) {
        const cancellation = (callerSignal == null ? void 0 : callerSignal.aborted) ? abortError() : void 0;
        props.controller.abort();
        void CancelReadableStream(props.response.body).catch(() => void 0);
        throw cancellation ?? error;
      }
      let timer;
      let abortListener;
      let timedOut = false;
      try {
        if ((callerSignal == null ? void 0 : callerSignal.aborted) && (attempt == null ? void 0 : attempt.helperMethod) !== "runTools") {
          throw abortError();
        }
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => {
            timedOut = true;
            props.controller.abort();
            reject(new APIConnectionTimeoutError());
          }, remaining);
          if (callerSignal) {
            abortListener = () => {
              if (!timedOut)
                reject(abortError());
            };
            callerSignal.addEventListener("abort", abortListener, { once: true });
          }
        });
        return await Promise.race([defaultParseResponse(client, props), timeoutPromise]);
      } catch (error) {
        if ((callerSignal == null ? void 0 : callerSignal.aborted) && !timedOut) {
          throw abortError();
        }
        if (!timedOut) {
          if (x509Authentication && error instanceof SyntaxError) {
            throw new SyntaxError("X.509 workload identity API response contains invalid JSON.");
          }
          if (x509Authentication && !(error instanceof OpenAIError)) {
            throw new APIConnectionError({
              message: "X.509 workload identity API response body could not be read."
            });
          }
          throw error;
        }
        const retriesRemaining = (attempt == null ? void 0 : attempt.retriesRemaining) ?? 0;
        if (!retriesRemaining || (attempt == null ? void 0 : attempt.hasStreamingBody) || ((_a3 = props.options.__metadata) == null ? void 0 : _a3["hasStreamingBody"]) || globalThis.ReadableStream && props.options.body instanceof globalThis.ReadableStream || typeof props.options.body === "object" && props.options.body !== null && (Symbol.asyncIterator in props.options.body || Symbol.iterator in props.options.body && "next" in props.options.body && typeof props.options.body.next === "function")) {
          throw new APIConnectionTimeoutError();
        }
        if (timer !== void 0)
          clearTimeout(timer);
        if (abortListener)
          callerSignal == null ? void 0 : callerSignal.removeEventListener("abort", abortListener);
        abortListener = void 0;
        const next = await this.retryRequest(props.options, retriesRemaining, props.retryOfRequestLogID ?? props.requestLogID, void 0, props.requestSignal);
        Object.assign(props, next);
      } finally {
        if (timer !== void 0)
          clearTimeout(timer);
        if (abortListener)
          callerSignal == null ? void 0 : callerSignal.removeEventListener("abort", abortListener);
      }
    }
  }
  /** Keeps terminal X.509 error-body consumption inside the original logical request deadline. */
  async readX509ResponseError(response, options2, timeout, controller, authentication) {
    const deadline = new AbortController();
    const callerSignal = controller.signal;
    let timedOut = false;
    const cancel = () => deadline.abort(callerSignal.reason);
    callerSignal.addEventListener("abort", cancel, { once: true });
    if (callerSignal.aborted) {
      cancel();
    }
    try {
      const remaining = authentication.remainingTimeout(options2, timeout);
      const expiration = authentication.waitForRetry(remaining, deadline.signal).then(() => {
        throw new APIConnectionTimeoutError();
      });
      const body = await Promise.race([
        response.text().catch(() => "X.509 workload identity API response body could not be read."),
        expiration
      ]);
      if (callerSignal.aborted) {
        throw this._makeUserAbortError(callerSignal);
      }
      return body;
    } catch (error) {
      if (error instanceof APIConnectionTimeoutError) {
        timedOut = !callerSignal.aborted;
        controller.abort();
        void CancelReadableStream(response.body).catch(() => void 0);
      }
      if (callerSignal.aborted && !timedOut) {
        throw this._makeUserAbortError(callerSignal);
      }
      throw error;
    } finally {
      callerSignal.removeEventListener("abort", cancel);
      deadline.abort();
    }
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l, _m;
    const options2 = await optionsInput;
    const maxRetries = options2.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    const x509Authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
    x509Authentication == null ? void 0 : x509Authentication.beginRequestPreparation();
    await this.prepareOptions(options2);
    x509Authentication == null ? void 0 : x509Authentication.beginRequestPlanning();
    let built;
    try {
      const candidate = await this.buildRequest(options2, {
        retryCount: maxRetries - retriesRemaining
      });
      built = { req: candidate.req, url: candidate.url, timeout: candidate.timeout };
      if (x509Authentication) {
        validatePositiveInteger("timeout", built.timeout);
        x509Authentication.authorizePlannedRequest(built.url, built.req, built.timeout);
        if (X509WorkloadIdentityAuth.isStreamingRequestBody(built.req.body)) {
          options2.__metadata = { ...options2.__metadata, hasStreamingBody: true };
        }
        await this.prepareRequest(built.req, { url: built.url, options: options2 });
        await ((_b2 = (_a3 = this._provider) == null ? void 0 : _a3.prepareRequest) == null ? void 0 : _b2.call(_a3, built.req, { url: built.url, options: options2 }));
        x509Authentication.beginRequestPlanning();
        x509Authentication.authorizePlannedRequest(built.url, built.req, built.timeout, true);
        if (X509WorkloadIdentityAuth.isStreamingRequestBody(built.req.body)) {
          options2.__metadata = { ...options2.__metadata, hasStreamingBody: true };
        }
        const callerSignal2 = x509Authentication.requestSnapshot().signal;
        if ((callerSignal2 == null ? void 0 : callerSignal2.aborted) || ((_c2 = built.req.signal) == null ? void 0 : _c2.aborted)) {
          throw this._makeUserAbortError((callerSignal2 == null ? void 0 : callerSignal2.aborted) ? callerSignal2 : built.req.signal);
        }
        x509Authentication.setEffectiveSignal(built.req.signal || callerSignal2 ? createRequestController(built.req.signal ?? callerSignal2, callerSignal2).signal : void 0);
        x509Authentication.beginRequestNetwork();
        const security2 = options2.__security ?? { bearerAuth: true };
        const authenticationHeaders = await this.authHeaders(options2, security2);
        const suppliedHeaders = x509Authentication.headerSnapshots();
        const supplied = buildHeaders([suppliedHeaders.defaultHeaders, suppliedHeaders.requestHeaders]);
        for (const [name, value] of (authenticationHeaders == null ? void 0 : authenticationHeaders.values) ?? []) {
          if (!supplied.nulls.has(name) && !built.req.headers.has(name)) {
            built.req.headers.set(name, value);
          }
        }
        this.validateHeaders(buildHeaders([supplied, built.req.headers]), security2);
      }
    } catch (error) {
      x509Authentication == null ? void 0 : x509Authentication.retireRequestBody();
      if (x509Authentication && retriesRemaining && !((_d2 = options2.__metadata) == null ? void 0 : _d2["hasStreamingBody"]) && X509WorkloadIdentityAuth.isRetryableFailure(error)) {
        return await this.retryRequest(options2, retriesRemaining, retryOfRequestLogID ?? "x509-token-exchange", X509WorkloadIdentityAuth.retryHeaders(error));
      }
      throw error;
    }
    const { req, url } = built;
    const timeout = x509Authentication ? Math.min(built.timeout, x509Authentication.requestSnapshot().timeout) : built.timeout;
    x509Authentication == null ? void 0 : x509Authentication.bindRequest(options2, req, this.adminAPIKey);
    let hasStreamingBody = ((_e2 = options2.__metadata) == null ? void 0 : _e2["hasStreamingBody"]) === true;
    if (!x509Authentication) {
      await this.prepareRequest(req, { url, options: options2 });
      await ((_g2 = (_f2 = this._provider) == null ? void 0 : _f2.prepareRequest) == null ? void 0 : _g2.call(_f2, req, { url, options: options2 }));
    }
    x509Authentication == null ? void 0 : x509Authentication.adoptRequestHeaders(req);
    if (x509Authentication && X509WorkloadIdentityAuth.isStreamingRequestBody(req.body)) {
      hasStreamingBody = true;
    }
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = (x509Authentication == null ? void 0 : x509Authentication.requestStartedAt(options2)) ?? Date.now();
    if (this.logLevel === "debug") {
      const body = typeof req.body === "string" ? { type: "string", length: req.body.length } : req.body;
      loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
        retryOfRequestLogID,
        method: options2.method,
        url,
        options: x509Authentication ? { body, ...x509Authentication.requestSnapshot() } : { ...options2, body },
        headers: req.headers
      }));
    }
    const callerSignal = x509Authentication ? x509Authentication.requestSnapshot().signal : options2.signal;
    if ((callerSignal == null ? void 0 : callerSignal.aborted) || ((_h = req.signal) == null ? void 0 : _h.aborted)) {
      throw this._makeUserAbortError((callerSignal == null ? void 0 : callerSignal.aborted) ? callerSignal : req.signal);
    }
    const security = options2.__security ?? { bearerAuth: true };
    const controller = x509Authentication || this.fetchWithTimeout === _a.prototype.fetchWithTimeout ? createRequestController(req.signal ?? (x509Authentication ? callerSignal : void 0), x509Authentication ? callerSignal : void 0) : new AbortController();
    const remainingTimeout = (x509Authentication == null ? void 0 : x509Authentication.remainingTimeout(options2, timeout)) ?? timeout;
    const fetchWithAuth = x509Authentication ? _a.prototype.fetchWithAuth : this.fetchWithAuth;
    x509Authentication == null ? void 0 : x509Authentication.releaseRequestBody(req.body);
    const response = await fetchWithAuth.call(this, url, req, remainingTimeout, controller, security).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if ((callerSignal == null ? void 0 : callerSignal.aborted) || ((_i = req.signal) == null ? void 0 : _i.aborted)) {
        throw this._makeUserAbortError((callerSignal == null ? void 0 : callerSignal.aborted) ? callerSignal : req.signal);
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining && !hasStreamingBody && (!x509Authentication || isTransientX509ConnectionError(response))) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: x509Authentication ? "X.509 workload identity API connection failed." : response.message
        }));
        return this.retryRequest(options2, retriesRemaining, retryOfRequestLogID ?? requestLogID, void 0, req.signal);
      }
      const terminalMessage = hasStreamingBody ? "error; streaming body cannot be retried" : "error; no more retries left";
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${terminalMessage}`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${terminalMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: x509Authentication ? "X.509 workload identity API connection failed." : response.message
      }));
      if (response instanceof OAuthError || response instanceof SubjectTokenProviderError) {
        throw response;
      }
      if (isTimeout) {
        const transportCause = "cause" in response ? response.cause : void 0;
        const isHeadersTimeout = typeof transportCause === "object" && transportCause !== null && "code" in transportCause && transportCause.code === "UND_ERR_HEADERS_TIMEOUT";
        const timeoutError = isHeadersTimeout ? new APIConnectionTimeoutError({
          message: "Request timed out. Node.js fetch timed out waiting for response headers; configure a matching undici fetch and fetchOptions.dispatcher with an Agent whose headersTimeout is at least the SDK timeout."
        }) : new APIConnectionTimeoutError();
        if (x509Authentication) {
          throw new APIConnectionTimeoutError();
        }
        throw Object.assign(timeoutError, { cause: response });
      }
      if (x509Authentication) {
        throw new APIConnectionError({ message: "X.509 workload identity API connection failed." });
      }
      throw new APIConnectionError({
        message: getConnectionErrorMessage(response),
        cause: response
      });
    }
    const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "x-request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
    const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${redactURL(url)} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const rejectedX509Credential = response.status === 401 && x509Authentication && security.bearerAuth && x509Authentication.usedWorkloadToken(options2);
      if (rejectedX509Credential) {
        x509Authentication.invalidateToken();
      }
      if (response.status === 401 && (x509Authentication || this._workloadIdentityAuth) && security.bearerAuth && (!x509Authentication || x509Authentication.usedWorkloadToken(options2)) && (!x509Authentication || retriesRemaining > 0) && !hasStreamingBody && !((_j = options2.__metadata) == null ? void 0 : _j["workloadIdentityTokenRefreshed"])) {
        if (x509Authentication) {
          void CancelReadableStream(response.body).catch(() => void 0);
        } else {
          await CancelReadableStream(response.body);
          (_k = this._workloadIdentityAuth) == null ? void 0 : _k.invalidateToken();
        }
        const replayOptions = {
          ...options2,
          __metadata: {
            ...options2.__metadata,
            workloadIdentityTokenRefreshed: true
          }
        };
        return this.makeRequest(replayOptions, x509Authentication ? retriesRemaining - 1 : retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      const shouldRetry = rejectedX509Credential && ((_l = options2.__metadata) == null ? void 0 : _l["workloadIdentityTokenRefreshed"]) ? false : await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry && !hasStreamingBody) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        if (x509Authentication) {
          void CancelReadableStream(response.body).catch(() => void 0);
        } else {
          await CancelReadableStream(response.body);
        }
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options2, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers, req.signal);
      }
      const retryMessage = shouldRetry ? hasStreamingBody ? `error; streaming body cannot be retried` : `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = x509Authentication ? await this.readX509ResponseError(response, options2, timeout, controller, x509Authentication) : await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    const continueRequest = x509Authentication == null ? void 0 : x509Authentication.continuation();
    x509Authentication == null ? void 0 : x509Authentication.releaseRequestCredentials();
    __classPrivateFieldGet(this, _OpenAI_responseAttempts, "f").set(controller, {
      timeout,
      retriesRemaining,
      hasStreamingBody,
      ...x509Authentication ? { authentication: x509Authentication } : {},
      helperMethod: (_m = options2.__metadata) == null ? void 0 : _m["helperMethod"],
      ...continueRequest ? { continueRequest } : {}
    });
    return {
      response,
      options: options2,
      controller,
      requestSignal: req.signal,
      requestLogID,
      retryOfRequestLogID,
      startTime
    };
  }
  getAPIList(path2, Page2, opts) {
    return this.requestAPIList(Page2, opts && "then" in opts ? opts.then((opts2) => ({ method: "get", path: path2, ...opts2 })) : { method: "get", path: path2, ...opts });
  }
  requestAPIList(Page2, options2) {
    const authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") ?? this._workloadIdentityAuth;
    const request = authentication instanceof X509WorkloadIdentityAuth ? Promise.resolve(options2).then((resolved) => authentication.runRequest(() => this.makeRequest(resolved, null, void 0), this)) : this.makeRequest(options2, null, void 0);
    const page = new PagePromise(this, request, Page2);
    const guarded = this.responsePromise(request, async (client, props) => {
      const body = await this.parseResponseWithTimeout(client, props);
      return new Page2(client, props.response, body, props.options);
    });
    page.then = guarded.then.bind(guarded);
    page.catch = guarded.catch.bind(guarded);
    page.finally = guarded.finally.bind(guarded);
    page.withResponse = guarded.withResponse.bind(guarded);
    page._thenUnwrap = guarded._thenUnwrap.bind(guarded);
    return page;
  }
  async fetchWithAuth(url, init, timeout, controller, schemes = {
    bearerAuth: true,
    adminAPIKeyAuth: true
  }) {
    if (this._workloadIdentityAuth && !__classPrivateFieldGet(this, _OpenAI_x509Fetch, "f") && schemes.bearerAuth) {
      const headers = init.headers;
      const authHeader = headers.get("Authorization");
      if (authHeader === `Bearer ${WORKLOAD_IDENTITY_API_KEY_PLACEHOLDER}`) {
        const token = await this._workloadIdentityAuth.getToken();
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    const fetchWithTimeout = __classPrivateFieldGet(this, _OpenAI_x509Fetch, "f") ? _a.prototype.fetchWithTimeout : this.fetchWithTimeout;
    const response = await fetchWithTimeout.call(this, url, init, timeout, controller);
    return response;
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, method, ...options2 } = init || {};
    const abort = this._makeAbort(controller);
    const composed = !!signal && composedCallerSignals.get(controller) === signal;
    const cleanup = signal && !composed ? addRequestAbortListener(signal, abort, controller.signal) : void 0;
    const timeout = setTimeout(abort, ms);
    const isReadableBody = globalThis.ReadableStream && options2.body instanceof globalThis.ReadableStream || typeof options2.body === "object" && options2.body !== null && Symbol.asyncIterator in options2.body;
    const fetchOptions = {
      signal: controller.signal,
      ...isReadableBody ? { duplex: "half" } : {},
      method: "GET",
      ...options2
    };
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      const response = await (__classPrivateFieldGet(this, _OpenAI_x509Fetch, "f") ?? this.fetch).call(void 0, url, fetchOptions);
      if (cleanup) {
        retainRequestAbortCallback(response.body ?? response, abort, controller.signal);
      }
      return response;
    } catch (err) {
      cleanup == null ? void 0 : cleanup();
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options2, retriesRemaining, requestLogID, responseHeaders, requestSignal = options2.signal) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders == null ? void 0 : responseHeaders.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders == null ? void 0 : responseHeaders.get("retry-after");
    if (retryAfterHeader && timeoutMillis === void 0) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (timeoutMillis === void 0 || !Number.isFinite(timeoutMillis) || timeoutMillis < 0 || timeoutMillis > 60 * 1e3) {
      const maxRetries = options2.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    const x509Authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
    if (x509Authentication) {
      const remaining = x509Authentication.remainingTimeout(options2, x509Authentication.requestSnapshot().timeout);
      if (timeoutMillis >= remaining) {
        throw new APIConnectionTimeoutError();
      }
    }
    if (x509Authentication) {
      await x509Authentication.waitForRetry(timeoutMillis, x509Authentication.effectiveSignal());
    } else {
      const retrySignals = requestSignal === options2.signal ? [requestSignal] : [requestSignal, options2.signal];
      try {
        await sleep(timeoutMillis, ...retrySignals);
      } catch (error) {
        const abortedSignal = retrySignals.find((signal) => signal == null ? void 0 : signal.aborted);
        if (abortedSignal) {
          throw this._makeUserAbortError(abortedSignal);
        }
        throw error;
      }
    }
    return this.makeRequest(options2, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  /**
   * Builds a request, resolving callback credentials when constructing authentication
   * headers, after any subclass request-option rewrites. Calling this method directly
   * also resolves credentials. Complete replacement builders own authentication and
   * can call `this.authHeaders()` to resolve headers with request-local credentials.
   */
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    if (__classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") && !__classPrivateFieldGet(this, _OpenAI_x509Authentication, "f").inRequest(this)) {
      const authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
      return await authentication.runRequest(async () => {
        const built = await _a.prototype.buildRequest.call(this, inputOptions, { retryCount });
        authentication.releaseRequestBody(built.req.body);
        return built;
      }, this);
    }
    const options2 = { ...inputOptions };
    const x509Authentication = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f");
    const x509Tenant = x509Authentication == null ? void 0 : x509Authentication.snapshotTenant(this.organization, this.project);
    const x509Headers = x509Authentication == null ? void 0 : x509Authentication.snapshotHeaders(this._options.defaultHeaders, options2.headers);
    if (x509Headers) {
      options2.headers = x509Headers.requestHeaders;
    }
    const x509ClientFetchOptions = x509Authentication ? snapshotX509RequestOptions(this.fetchOptions) : void 0;
    const x509RequestFetchOptions = x509Authentication ? snapshotX509RequestOptions(options2.fetchOptions) : void 0;
    const { method, path: path2, query, defaultBaseURL } = options2;
    const url = this.buildURL(path2, query, defaultBaseURL);
    x509Authentication == null ? void 0 : x509Authentication.snapshotAPIURL(url);
    const explicitTimeout = "timeout" in options2;
    if (explicitTimeout)
      validatePositiveInteger("timeout", options2.timeout);
    options2.timeout = options2.timeout ?? this.timeout;
    if (x509Authentication && x509RequestFetchOptions) {
      x509Authentication.snapshotRequest(options2.signal, options2.timeout, x509RequestFetchOptions);
    }
    if (x509Authentication) {
      const snapshot = x509Authentication.requestSnapshot();
      options2.timeout = snapshot.timeout;
      if (snapshot.signal === void 0) {
        delete options2.signal;
      } else {
        options2.signal = snapshot.signal;
      }
    }
    const authenticationHeaders = this._provider || x509Authentication ? void 0 : await this.authHeaders(inputOptions, inputOptions.__security ?? { bearerAuth: true });
    const { bodyHeaders, body, isStreamingBody } = this.buildBody({ options: options2 });
    if (isStreamingBody) {
      inputOptions.__metadata = {
        ...inputOptions.__metadata,
        hasStreamingBody: true
      };
      x509Authentication == null ? void 0 : x509Authentication.ownRequestBody(body, options2.body);
    }
    const reqHeaders = await this.buildHeaders({
      options: inputOptions,
      method,
      bodyHeaders,
      authenticationHeaders,
      retryCount,
      x509Headers,
      x509Timeout: explicitTimeout ? options2.timeout : void 0,
      x509Tenant
    });
    const req = {
      method,
      headers: reqHeaders,
      ...options2.signal && { signal: options2.signal },
      ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
      ...body && { body },
      ...(x509Authentication ? x509ClientFetchOptions : this.fetchOptions) ?? {},
      ...(x509Authentication ? x509RequestFetchOptions : options2.fetchOptions) ?? {}
    };
    return { req, url, timeout: options2.timeout };
  }
  async buildHeaders({ options: options2, method, bodyHeaders, authenticationHeaders, retryCount, x509Headers, x509Timeout, x509Tenant }) {
    var _a3, _b2;
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options2.idempotencyKey)
        options2.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options2.idempotencyKey;
    }
    const helperMethod = (_a3 = options2.__metadata) == null ? void 0 : _a3["helperMethod"];
    const timeout = x509Headers ? x509Timeout : options2.timeout;
    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        ...!isRunningInBrowserOrBrowserWorker() ? { "User-Agent": this.getUserAgent() } : void 0,
        "X-Stainless-Retry-Count": String(retryCount),
        ...timeout ? { "X-Stainless-Timeout": String(Math.trunc(timeout / 1e3)) } : {},
        ...getPlatformHeaders(),
        ...typeof helperMethod === "string" ? { "X-Stainless-Helper-Method": helperMethod } : {},
        "OpenAI-Organization": x509Tenant ? x509Tenant.organization : this.organization,
        "OpenAI-Project": x509Tenant ? x509Tenant.project : this.project
      },
      // X.509 owns streaming uploads before authentication so it can retire them on failure.
      __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f") && !__classPrivateFieldGet(this, _OpenAI_x509Authentication, "f").isPlanningRequest() ? await this.authHeaders(options2, options2.__security ?? { bearerAuth: true }) : authenticationHeaders,
      (x509Headers == null ? void 0 : x509Headers.defaultHeaders) ?? this._options.defaultHeaders,
      bodyHeaders,
      (x509Headers == null ? void 0 : x509Headers.requestHeaders) ?? options2.headers
    ]);
    if (!this._provider && !((_b2 = __classPrivateFieldGet(this, _OpenAI_x509Authentication, "f")) == null ? void 0 : _b2.isPlanningRequest())) {
      this.validateHeaders(headers, options2.__security ?? { bearerAuth: true });
    }
    return headers.values;
  }
  _makeAbort(controller) {
    return () => controller.abort();
  }
  _makeUserAbortError(signal) {
    const error = new APIUserAbortError();
    Object.defineProperty(error, "cause", { value: signal.reason, writable: true, configurable: true });
    return error;
  }
  buildBody({ options: options2 }) {
    const { body, headers: rawHeaders } = options2;
    if (!body) {
      if (body === void 0 && "body" in options2) {
        return { ...__classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers: buildHeaders([rawHeaders]) }), isStreamingBody: false };
      }
      return { bodyHeaders: void 0, body: void 0, isStreamingBody: false };
    }
    const headers = buildHeaders([rawHeaders]);
    const isReadableStream2 = typeof globalThis.ReadableStream !== "undefined" && body instanceof globalThis.ReadableStream;
    const isRetryableBody = !isReadableStream2 && (typeof body === "string" || body instanceof ArrayBuffer || ArrayBuffer.isView(body) || typeof globalThis.Blob !== "undefined" && body instanceof globalThis.Blob || body instanceof URLSearchParams || body instanceof FormData);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      isReadableStream2
    ) {
      return { bodyHeaders: void 0, body, isStreamingBody: !isRetryableBody };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return {
        bodyHeaders: void 0,
        body: ReadableStreamFrom(body),
        isStreamingBody: true
      };
    } else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") {
      return {
        bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
        body: this.stringifyQuery(body),
        isStreamingBody: false
      };
    } else {
      return { ...__classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers }), isStreamingBody: false };
    }
  }
}
_a = OpenAI, _OpenAI_encoder = /* @__PURE__ */ new WeakMap(), _OpenAI_x509Authentication = /* @__PURE__ */ new WeakMap(), _OpenAI_x509Credential = /* @__PURE__ */ new WeakMap(), _OpenAI_x509Fetch = /* @__PURE__ */ new WeakMap(), _OpenAI_explicitDataResidency = /* @__PURE__ */ new WeakMap(), _OpenAI_responseAttempts = /* @__PURE__ */ new WeakMap(), _OpenAI_instances = /* @__PURE__ */ new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden2() {
  return __classPrivateFieldGet(this, _OpenAI_explicitDataResidency, "f") || this._provider !== void 0 || this.baseURL !== "https://api.openai.com/v1";
};
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.InvalidWebhookSignatureError = InvalidWebhookSignatureError;
OpenAI.toFile = toFile;
OpenAI.toStreamingFile = toStreamingFile;
OpenAI.Completions = Completions2;
OpenAI.Chat = Chat;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files$1;
OpenAI.Images = Images;
OpenAI.ContentProvenanceChecks = ContentProvenanceChecks;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.Safety = Safety;
OpenAI.Webhooks = Webhooks;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.Uploads = Uploads;
OpenAI.Admin = Admin;
OpenAI.Responses = Responses2;
OpenAI.Live = Live;
OpenAI.Realtime = Realtime2;
OpenAI.Conversations = Conversations;
OpenAI.Evals = Evals;
OpenAI.Containers = Containers;
OpenAI.Skills = Skills;
OpenAI.Videos = Videos;
OpenAI.ConversationCursorPage = ConversationCursorPage;
OpenAI.CursorPage = CursorPage;
OpenAI.NextCursorPage = NextCursorPage;
OpenAI.Page = Page;
OpenAI.TokenPage = TokenPage;
const composedCallerSignals = /* @__PURE__ */ new WeakMap();
function createRequestController(callerSignal, originalSignal) {
  const controller = new AbortController();
  if (!callerSignal)
    return controller;
  const nativeAbortSignal = globalThis.AbortSignal;
  if (typeof (nativeAbortSignal == null ? void 0 : nativeAbortSignal.any) !== "function" || !(callerSignal instanceof nativeAbortSignal)) {
    return controller;
  }
  try {
    const signals = [controller.signal, callerSignal];
    if (originalSignal && originalSignal !== callerSignal) {
      signals.push(originalSignal);
    }
    const composed = nativeAbortSignal.any(signals);
    Object.defineProperty(controller, "signal", { value: composed, configurable: true });
    composedCallerSignals.set(controller, callerSignal);
  } catch {
  }
  return controller;
}
function getConnectionErrorMessage(error) {
  if (isUndiciDispatcherVersionMismatchError(error)) {
    return `Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });`;
  }
  return void 0;
}
function isUndiciDispatcherVersionMismatchError(error) {
  let current = error;
  for (let i = 0; i < 8 && current && typeof current === "object"; i++) {
    const err = current;
    if (err.code === "UND_ERR_INVALID_ARG" && typeof err.message === "string" && err.message.includes("invalid onRequestStart method")) {
      return true;
    }
    current = err.cause;
  }
  return false;
}
class FifoQueue {
  constructor() {
    __publicField(this, "incoming", []);
    __publicField(this, "outgoing", []);
  }
  get length() {
    return this.incoming.length + this.outgoing.length;
  }
  enqueue(value) {
    this.incoming.push(value);
  }
  dequeue() {
    if (this.outgoing.length === 0) {
      while (this.incoming.length > 0) {
        this.outgoing.push(this.incoming.pop());
      }
    }
    return this.outgoing.pop();
  }
}
class EventStream2 {
  constructor(isComplete, extractResult) {
    __publicField(this, "queue", new FifoQueue());
    __publicField(this, "waiting", new FifoQueue());
    __publicField(this, "done", false);
    __publicField(this, "finalResultPromise");
    __publicField(this, "resolveFinalResult");
    __publicField(this, "isComplete");
    __publicField(this, "extractResult");
    this.isComplete = isComplete;
    this.extractResult = extractResult;
    this.finalResultPromise = new Promise((resolve) => {
      this.resolveFinalResult = resolve;
    });
  }
  push(event) {
    if (this.done)
      return;
    if (this.isComplete(event)) {
      this.done = true;
      this.resolveFinalResult(this.extractResult(event));
    }
    const waiter = this.waiting.dequeue();
    if (waiter) {
      waiter({ value: event, done: false });
    } else {
      this.queue.enqueue(event);
    }
  }
  end(result) {
    this.done = true;
    if (result !== void 0) {
      this.resolveFinalResult(result);
    }
    while (this.waiting.length > 0) {
      const waiter = this.waiting.dequeue();
      waiter({ value: void 0, done: true });
    }
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      if (this.queue.length > 0) {
        yield this.queue.dequeue();
      } else if (this.done) {
        return;
      } else {
        const result = await new Promise((resolve) => this.waiting.enqueue(resolve));
        if (result.done)
          return;
        yield result.value;
      }
    }
  }
  result() {
    return this.finalResultPromise;
  }
}
class AssistantMessageEventStream extends EventStream2 {
  constructor() {
    super((event) => event.type === "done" || event.type === "error", (event) => {
      if (event.type === "done") {
        return event.message;
      } else if (event.type === "error") {
        return event.error;
      }
      throw new Error("Unexpected event type for final result");
    });
    __privateAdd(this, _AssistantMessageEventStream_instances);
    __privateAdd(this, _startedAt, Date.now());
    __privateAdd(this, _startedAtMonotonic, performance.now());
  }
  push(event) {
    if (event.type === "done")
      __privateMethod(this, _AssistantMessageEventStream_instances, time_fn).call(this, event.message);
    else if (event.type === "error")
      __privateMethod(this, _AssistantMessageEventStream_instances, time_fn).call(this, event.error);
    super.push(event);
  }
  end(result) {
    if (result !== void 0)
      __privateMethod(this, _AssistantMessageEventStream_instances, time_fn).call(this, result);
    super.end(result);
  }
}
_startedAt = new WeakMap();
_startedAtMonotonic = new WeakMap();
_AssistantMessageEventStream_instances = new WeakSet();
time_fn = function(message) {
  if (this.done || message.durationMs !== void 0 || message.timestamp < __privateGet(this, _startedAt))
    return;
  message.durationMs = Math.max(0, Math.round(performance.now() - __privateGet(this, _startedAtMonotonic)));
};
function contentText(content, separator = "\n") {
  if (typeof content === "string")
    return content;
  return content.filter((block) => block.type === "text").map((block) => block.text).join(separator);
}
function getSystemMessageText(message) {
  const parts = [contentText(message.content)];
  for (const text of Object.values(message.sections ?? {})) {
    if (text !== null)
      parts.push(text);
  }
  return parts.filter((part) => part.length > 0).join("\n\n");
}
function renderSystemMessageUpdate(message) {
  const parts = [];
  const text = contentText(message.content);
  if (text.length > 0)
    parts.push(text);
  for (const [name, value] of Object.entries(message.sections ?? {})) {
    parts.push(value === null ? `Removed system prompt section "${name}".` : `Updated system prompt section "${name}":

${value}`);
  }
  return parts.join("\n\n");
}
function createInitialSystemMessage(systemPrompt, tools) {
  const hasSystemPrompt = systemPrompt !== void 0 && systemPrompt.length > 0;
  const hasTools = tools !== void 0 && tools.length > 0;
  if (!hasSystemPrompt && !hasTools)
    return void 0;
  return {
    role: "system",
    content: systemPrompt ?? "",
    ...hasTools ? { toolsAdded: tools } : {},
    timestamp: 0
  };
}
function normalizeContext(context) {
  const initialMessage = createInitialSystemMessage(context.systemPrompt, context.tools);
  const messages = initialMessage ? [initialMessage, ...context.messages] : context.messages;
  return { messages };
}
function isSystemMessage(message) {
  return message.role === "system";
}
function getInitialSystemMessage(messages) {
  const first = messages[0];
  return first && isSystemMessage(first) ? first : void 0;
}
function getCurrentTools(messages) {
  const tools = /* @__PURE__ */ new Map();
  for (const message of messages) {
    if (!isSystemMessage(message))
      continue;
    for (const tool of message.toolsRemoved ?? [])
      tools.delete(tool.name);
    for (const tool of message.toolsAdded ?? [])
      tools.set(tool.name, tool);
  }
  return [...tools.values()];
}
function getCurrentSystemMessage(messages) {
  const content = [];
  const sections = /* @__PURE__ */ new Map();
  let timestamp;
  for (const message of messages) {
    if (!isSystemMessage(message))
      continue;
    timestamp ?? (timestamp = message.timestamp);
    const text = contentText(message.content);
    if (text.length > 0)
      content.push(text);
    for (const [name, value] of Object.entries(message.sections ?? {})) {
      if (value === null)
        sections.delete(name);
      else
        sections.set(name, value);
    }
  }
  const tools = getCurrentTools(messages);
  if (timestamp === void 0 && tools.length === 0)
    return void 0;
  return {
    role: "system",
    content: content.join("\n\n"),
    ...sections.size > 0 ? { sections: Object.fromEntries(sections) } : {},
    ...tools.length > 0 ? { toolsAdded: tools } : {},
    timestamp: timestamp ?? 0
  };
}
function collapseSystemMessages(context) {
  const head = getCurrentSystemMessage(context.messages);
  const messages = context.messages.filter((message) => message.role !== "system");
  return { messages: head ? [head, ...messages] : messages };
}
function resolveTranscript(context, supportsMidConvoSystemMessages) {
  return supportsMidConvoSystemMessages ? context : collapseSystemMessages(context);
}
function getDeclaredTools(messages) {
  const definitions = /* @__PURE__ */ new Map();
  for (const message of messages) {
    if (!isSystemMessage(message))
      continue;
    for (const tool of message.toolsAdded ?? [])
      definitions.set(tool.name, tool);
  }
  return [...definitions.values()];
}
function hasNonAdditiveToolChanges(messages) {
  var _a3;
  const declared = /* @__PURE__ */ new Set();
  for (const message of messages) {
    if (!isSystemMessage(message))
      continue;
    if ((((_a3 = message.toolsRemoved) == null ? void 0 : _a3.length) ?? 0) > 0)
      return true;
    for (const tool of message.toolsAdded ?? []) {
      if (declared.has(tool.name))
        return true;
      declared.add(tool.name);
    }
  }
  return false;
}
function resolveTranscriptTools(messages, supportsToolAdditions) {
  var _a3;
  const anchorsAdditions = supportsToolAdditions && !hasNonAdditiveToolChanges(messages);
  return {
    requestTools: anchorsAdditions ? ((_a3 = getInitialSystemMessage(messages)) == null ? void 0 : _a3.toolsAdded) ?? [] : getCurrentTools(messages),
    anchorsAdditions
  };
}
function calculateCost(model, usage) {
  const inputTokens = usage.input + usage.cacheRead + usage.cacheWrite;
  let rates = model.cost;
  let matchedThreshold = -1;
  for (const tier of model.cost.tiers ?? []) {
    if (inputTokens > tier.inputTokensAbove && tier.inputTokensAbove > matchedThreshold) {
      rates = tier;
      matchedThreshold = tier.inputTokensAbove;
    }
  }
  const longWrite = usage.cacheWrite1h ?? 0;
  const shortWrite = usage.cacheWrite - longWrite;
  usage.cost.input = rates.input / 1e6 * usage.input;
  usage.cost.output = rates.output / 1e6 * usage.output;
  usage.cost.cacheRead = rates.cacheRead / 1e6 * usage.cacheRead;
  usage.cost.cacheWrite = (rates.cacheWrite * shortWrite + rates.input * 2 * longWrite) / 1e6;
  usage.cost.total = usage.cost.input + usage.cost.output + usage.cost.cacheRead + usage.cost.cacheWrite;
  return usage.cost;
}
const EXTENDED_THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
function getSupportedThinkingLevels(model) {
  if (!model.reasoning)
    return ["off"];
  return EXTENDED_THINKING_LEVELS.filter((level) => {
    var _a3;
    const mapped = (_a3 = model.thinkingLevelMap) == null ? void 0 : _a3[level];
    if (mapped === null)
      return false;
    if (level === "xhigh" || level === "max")
      return mapped !== void 0;
    return true;
  });
}
function clampThinkingLevel(model, level) {
  const availableLevels = getSupportedThinkingLevels(model);
  if (availableLevels.includes(level))
    return level;
  const requestedIndex = EXTENDED_THINKING_LEVELS.indexOf(level);
  if (requestedIndex === -1)
    return availableLevels[0] ?? "off";
  for (let i = requestedIndex; i < EXTENDED_THINKING_LEVELS.length; i++) {
    const candidate = EXTENDED_THINKING_LEVELS[i];
    if (availableLevels.includes(candidate))
      return candidate;
  }
  for (let i = requestedIndex - 1; i >= 0; i--) {
    const candidate = EXTENDED_THINKING_LEVELS[i];
    if (availableLevels.includes(candidate))
      return candidate;
  }
  return availableLevels[0] ?? "off";
}
const MAX_PROVIDER_ERROR_BODY_CHARS = 4e3;
function normalizeProviderError(error) {
  if (!(error instanceof Error)) {
    return { message: safeJsonStringify$1(error), messageCarriesBody: false };
  }
  const sdkError = error;
  const status = extractStatus(sdkError);
  const body = extractBody(sdkError);
  const messageCarriesBody = body === void 0 || error.message.includes(body);
  return {
    status,
    body,
    message: error.message,
    messageCarriesBody
  };
}
function extractStatus(error) {
  var _a3, _b2;
  if (typeof error.statusCode === "number")
    return error.statusCode;
  if (typeof error.status === "number")
    return error.status;
  if (typeof ((_a3 = error.$metadata) == null ? void 0 : _a3.httpStatusCode) === "number")
    return error.$metadata.httpStatusCode;
  if (typeof ((_b2 = error.$response) == null ? void 0 : _b2.statusCode) === "number")
    return error.$response.statusCode;
  return void 0;
}
function extractBody(error) {
  const bodyText = pickBodyText(error);
  if (bodyText === void 0)
    return void 0;
  const trimmed = bodyText.trim();
  if (trimmed.length === 0)
    return void 0;
  return truncateErrorText(trimmed, MAX_PROVIDER_ERROR_BODY_CHARS);
}
function pickBodyText(error) {
  var _a3;
  if (typeof error.body === "string")
    return error.body;
  if (isPlainNonEmptyObject(error.error))
    return safeJsonStringify$1(error.error);
  const responseBody = (_a3 = error.$response) == null ? void 0 : _a3.body;
  if (typeof responseBody === "string")
    return responseBody;
  if (isReadableStreamLike(responseBody))
    return void 0;
  if (isPlainNonEmptyObject(responseBody))
    return safeJsonStringify$1(responseBody);
  return void 0;
}
function isReadableStreamLike(value) {
  return typeof value === "object" && value !== null && "pipe" in value && typeof value.pipe === "function";
}
function isPlainNonEmptyObject(value) {
  if (typeof value !== "object" || value === null)
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    return false;
  return Object.keys(value).length > 0;
}
function formatProviderError(norm, prefix) {
  if (norm.messageCarriesBody || norm.status === void 0 || norm.body === void 0) {
    return prefix !== void 0 && norm.status !== void 0 ? `${prefix} (${norm.status}): ${norm.message}` : norm.message;
  }
  return prefix !== void 0 ? `${prefix} (${norm.status}): ${norm.body}` : `${norm.status}: ${norm.body}`;
}
function truncateErrorText(text, maxChars) {
  if (text.length <= maxChars)
    return text;
  return `${text.slice(0, maxChars)}... [truncated ${text.length - maxChars} chars]`;
}
function safeJsonStringify$1(value) {
  try {
    const serialized = JSON.stringify(value);
    return serialized === void 0 ? String(value) : serialized;
  } catch {
    return String(value);
  }
}
function shortHash(str) {
  let h1 = 3735928559;
  let h2 = 1103547991;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}
function headersToRecord(headers) {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
}
var dist = {};
var options = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Allow = exports.ALL = exports.COLLECTION = exports.ATOM = exports.SPECIAL = exports.INF = exports._INFINITY = exports.INFINITY = exports.NAN = exports.BOOL = exports.NULL = exports.OBJ = exports.ARR = exports.NUM = exports.STR = void 0;
  exports.STR = 1;
  exports.NUM = 2;
  exports.ARR = 4;
  exports.OBJ = 8;
  exports.NULL = 16;
  exports.BOOL = 32;
  exports.NAN = 64;
  exports.INFINITY = 128;
  exports._INFINITY = 256;
  exports.INF = exports.INFINITY | exports._INFINITY;
  exports.SPECIAL = exports.NULL | exports.BOOL | exports.INF | exports.NAN;
  exports.ATOM = exports.STR | exports.NUM | exports.SPECIAL;
  exports.COLLECTION = exports.ARR | exports.OBJ;
  exports.ALL = exports.ATOM | exports.COLLECTION;
  exports.Allow = { STR: exports.STR, NUM: exports.NUM, ARR: exports.ARR, OBJ: exports.OBJ, NULL: exports.NULL, BOOL: exports.BOOL, NAN: exports.NAN, INFINITY: exports.INFINITY, _INFINITY: exports._INFINITY, INF: exports.INF, SPECIAL: exports.SPECIAL, ATOM: exports.ATOM, COLLECTION: exports.COLLECTION, ALL: exports.ALL };
  exports.default = exports.Allow;
})(options);
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Allow = exports.MalformedJSON = exports.PartialJSON = exports.parseJSON = exports.parse = void 0;
  const options_1 = options;
  Object.defineProperty(exports, "Allow", { enumerable: true, get: function() {
    return options_1.Allow;
  } });
  __exportStar(options, exports);
  class PartialJSON2 extends Error {
  }
  exports.PartialJSON = PartialJSON2;
  class MalformedJSON2 extends Error {
  }
  exports.MalformedJSON = MalformedJSON2;
  function parseJSON2(jsonString, allowPartial = options_1.Allow.ALL) {
    if (typeof jsonString !== "string") {
      throw new TypeError(`expecting str, got ${typeof jsonString}`);
    }
    if (!jsonString.trim()) {
      throw new Error(`${jsonString} is empty`);
    }
    return _parseJSON2(jsonString.trim(), allowPartial);
  }
  exports.parseJSON = parseJSON2;
  const _parseJSON2 = (jsonString, allow) => {
    const length = jsonString.length;
    let index = 0;
    const markPartialJSON = (msg) => {
      throw new PartialJSON2(`${msg} at position ${index}`);
    };
    const throwMalformedError = (msg) => {
      throw new MalformedJSON2(`${msg} at position ${index}`);
    };
    const parseAny = () => {
      skipBlank();
      if (index >= length)
        markPartialJSON("Unexpected end of input");
      if (jsonString[index] === '"')
        return parseStr();
      if (jsonString[index] === "{")
        return parseObj();
      if (jsonString[index] === "[")
        return parseArr();
      if (jsonString.substring(index, index + 4) === "null" || options_1.Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
        index += 4;
        return null;
      }
      if (jsonString.substring(index, index + 4) === "true" || options_1.Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
        index += 4;
        return true;
      }
      if (jsonString.substring(index, index + 5) === "false" || options_1.Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
        index += 5;
        return false;
      }
      if (jsonString.substring(index, index + 8) === "Infinity" || options_1.Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
        index += 8;
        return Infinity;
      }
      if (jsonString.substring(index, index + 9) === "-Infinity" || options_1.Allow._INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
        index += 9;
        return -Infinity;
      }
      if (jsonString.substring(index, index + 3) === "NaN" || options_1.Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
        index += 3;
        return NaN;
      }
      return parseNum();
    };
    const parseStr = () => {
      const start2 = index;
      let escape2 = false;
      index++;
      while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
        escape2 = jsonString[index] === "\\" ? !escape2 : false;
        index++;
      }
      if (jsonString.charAt(index) == '"') {
        try {
          return JSON.parse(jsonString.substring(start2, ++index - Number(escape2)));
        } catch (e) {
          throwMalformedError(String(e));
        }
      } else if (options_1.Allow.STR & allow) {
        try {
          return JSON.parse(jsonString.substring(start2, index - Number(escape2)) + '"');
        } catch (e) {
          return JSON.parse(jsonString.substring(start2, jsonString.lastIndexOf("\\")) + '"');
        }
      }
      markPartialJSON("Unterminated string literal");
    };
    const parseObj = () => {
      index++;
      skipBlank();
      const obj = {};
      try {
        while (jsonString[index] !== "}") {
          skipBlank();
          if (index >= length && options_1.Allow.OBJ & allow)
            return obj;
          const key = parseStr();
          skipBlank();
          index++;
          try {
            const value = parseAny();
            obj[key] = value;
          } catch (e) {
            if (options_1.Allow.OBJ & allow)
              return obj;
            else
              throw e;
          }
          skipBlank();
          if (jsonString[index] === ",")
            index++;
        }
      } catch (e) {
        if (options_1.Allow.OBJ & allow)
          return obj;
        else
          markPartialJSON("Expected '}' at end of object");
      }
      index++;
      return obj;
    };
    const parseArr = () => {
      index++;
      const arr = [];
      try {
        while (jsonString[index] !== "]") {
          arr.push(parseAny());
          skipBlank();
          if (jsonString[index] === ",") {
            index++;
          }
        }
      } catch (e) {
        if (options_1.Allow.ARR & allow) {
          return arr;
        }
        markPartialJSON("Expected ']' at end of array");
      }
      index++;
      return arr;
    };
    const parseNum = () => {
      if (index === 0) {
        if (jsonString === "-")
          throwMalformedError("Not sure what '-' is");
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          if (options_1.Allow.NUM & allow)
            try {
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
            } catch (e2) {
            }
          throwMalformedError(String(e));
        }
      }
      const start2 = index;
      if (jsonString[index] === "-")
        index++;
      while (jsonString[index] && ",]}".indexOf(jsonString[index]) === -1)
        index++;
      if (index == length && !(options_1.Allow.NUM & allow))
        markPartialJSON("Unterminated number literal");
      try {
        return JSON.parse(jsonString.substring(start2, index));
      } catch (e) {
        if (jsonString.substring(start2, index) === "-")
          markPartialJSON("Not sure what '-' is");
        try {
          return JSON.parse(jsonString.substring(start2, jsonString.lastIndexOf("e")));
        } catch (e2) {
          throwMalformedError(String(e2));
        }
      }
    };
    const skipBlank = () => {
      while (index < length && " \n\r	".includes(jsonString[index])) {
        index++;
      }
    };
    return parseAny();
  };
  const parse = parseJSON2;
  exports.parse = parse;
})(dist);
const VALID_JSON_ESCAPES = /* @__PURE__ */ new Set(['"', "\\", "/", "b", "f", "n", "r", "t", "u"]);
function isControlCharacter(char) {
  const codePoint = char.codePointAt(0);
  return codePoint !== void 0 && codePoint >= 0 && codePoint <= 31;
}
function escapeControlCharacter(char) {
  var _a3;
  switch (char) {
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    default:
      return `\\u${((_a3 = char.codePointAt(0)) == null ? void 0 : _a3.toString(16).padStart(4, "0")) ?? "0000"}`;
  }
}
function repairJson(json) {
  let repaired = "";
  let inString = false;
  for (let index = 0; index < json.length; index++) {
    const char = json[index];
    if (!inString) {
      repaired += char;
      if (char === '"') {
        inString = true;
      }
      continue;
    }
    if (char === '"') {
      repaired += char;
      inString = false;
      continue;
    }
    if (char === "\\") {
      const nextChar = json[index + 1];
      if (nextChar === void 0) {
        repaired += "\\\\";
        continue;
      }
      if (nextChar === "u") {
        const unicodeDigits = json.slice(index + 2, index + 6);
        if (/^[0-9a-fA-F]{4}$/.test(unicodeDigits)) {
          repaired += `\\u${unicodeDigits}`;
          index += 5;
          continue;
        }
      }
      if (VALID_JSON_ESCAPES.has(nextChar)) {
        repaired += `\\${nextChar}`;
        index += 1;
        continue;
      }
      repaired += "\\\\";
      continue;
    }
    repaired += isControlCharacter(char) ? escapeControlCharacter(char) : char;
  }
  return repaired;
}
function parseJsonWithRepair(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    const repairedJson = repairJson(json);
    if (repairedJson !== json) {
      return JSON.parse(repairedJson);
    }
    throw error;
  }
}
function parseStreamingJson(partialJson) {
  if (!partialJson || partialJson.trim() === "") {
    return {};
  }
  try {
    return parseJsonWithRepair(partialJson);
  } catch {
    try {
      const result = dist.parse(partialJson);
      return result ?? {};
    } catch {
      try {
        const result = dist.parse(repairJson(partialJson));
        return result ?? {};
      } catch {
        return {};
      }
    }
  }
}
function loadNodeOs() {
  var _a3, _b2, _c2;
  if (typeof process === "undefined" || !(((_a3 = process.versions) == null ? void 0 : _a3.node) || ((_b2 = process.versions) == null ? void 0 : _b2.bun))) {
    return null;
  }
  return ((_c2 = process.getBuiltinModule) == null ? void 0 : _c2.call(process, "node:os")) ?? null;
}
const nodeOs = loadNodeOs();
function getPiUserAgent() {
  return nodeOs ? `pi (${nodeOs.platform()} ${nodeOs.release()}; ${nodeOs.arch()})` : "pi (browser)";
}
let procEnvCache = null;
function getBunSandboxEnvValue(name) {
  var _a3;
  if (typeof process === "undefined" || !((_a3 = process.versions) == null ? void 0 : _a3.bun) || Object.keys(process.env).length > 0) {
    return void 0;
  }
  if (procEnvCache === null) {
    procEnvCache = /* @__PURE__ */ new Map();
    try {
      const { readFileSync } = require("node:fs");
      const data = readFileSync("/proc/self/environ", "utf-8");
      for (const entry of data.split("\0")) {
        const idx = entry.indexOf("=");
        if (idx > 0) {
          procEnvCache.set(entry.slice(0, idx), entry.slice(idx + 1));
        }
      }
    } catch {
    }
  }
  return procEnvCache.get(name);
}
function getProviderEnvValue(name, env) {
  return (env == null ? void 0 : env[name]) || (typeof process !== "undefined" ? process.env[name] : void 0) || getBunSandboxEnvValue(name) || void 0;
}
const DEFAULT_MAX_RETRY_DELAY_MS = 6e4;
function isProviderError(error) {
  if (!(error instanceof Error) || !("status" in error) || !("headers" in error))
    return false;
  return (error.status === void 0 || typeof error.status === "number") && (error.headers === void 0 || error.headers instanceof Headers);
}
function isRetryableProviderError(error) {
  var _a3;
  const shouldRetry = (_a3 = error.headers) == null ? void 0 : _a3.get("x-should-retry");
  if (shouldRetry === "true")
    return true;
  if (shouldRetry === "false")
    return false;
  if (error.status === void 0)
    return true;
  return error.status === 408 || error.status === 409 || error.status === 429 || typeof error.status === "number" && error.status >= 500;
}
function validateServerRetryDelayMs(delayMs, maxRetryDelayMs, providerErrorMessage) {
  const maxDelayMs = maxRetryDelayMs ?? DEFAULT_MAX_RETRY_DELAY_MS;
  if (maxDelayMs > 0 && delayMs > maxDelayMs) {
    throw new Error(`Server requested ${Math.ceil(delayMs / 1e3)}s retry delay (max: ${Math.ceil(maxDelayMs / 1e3)}s). ${providerErrorMessage}`);
  }
  return delayMs;
}
function getRetryDelayMs(error, retryIndex, maxRetryDelayMs) {
  var _a3, _b2;
  const retryAfterMs = (_a3 = error.headers) == null ? void 0 : _a3.get("retry-after-ms");
  if (retryAfterMs) {
    const value = Number.parseFloat(retryAfterMs);
    if (Number.isFinite(value))
      return validateServerRetryDelayMs(value, maxRetryDelayMs, error.message);
  }
  const retryAfter = (_b2 = error.headers) == null ? void 0 : _b2.get("retry-after");
  if (retryAfter) {
    const seconds = Number.parseFloat(retryAfter);
    const delayMs = Number.isNaN(seconds) ? Date.parse(retryAfter) - Date.now() : seconds * 1e3;
    if (Number.isFinite(delayMs))
      return validateServerRetryDelayMs(delayMs, maxRetryDelayMs, error.message);
  }
  const exponentialDelay = Math.min(0.5 * 2 ** retryIndex, 8) * 1e3;
  return exponentialDelay * (1 - Math.random() * 0.25);
}
function createAbortError() {
  const error = new Error("Request aborted");
  error.name = "AbortError";
  return error;
}
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal == null ? void 0 : signal.aborted) {
      reject(createAbortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timeout);
      reject(createAbortError());
    };
    const timeout = setTimeout(() => {
      signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
      resolve();
    }, Math.max(0, ms));
    signal == null ? void 0 : signal.addEventListener("abort", onAbort, { once: true });
  });
}
async function retryProviderRequest(request, options2 = {}) {
  var _a3, _b2;
  const maxRetries = options2.maxRetries ?? 0;
  let retriesRemaining = maxRetries;
  for (; ; ) {
    try {
      return await request();
    } catch (error) {
      if ((_a3 = options2.signal) == null ? void 0 : _a3.aborted)
        throw createAbortError();
      if (retriesRemaining <= 0 || !isProviderError(error) || !isRetryableProviderError(error))
        throw error;
      if (error.status !== void 0 && ((_b2 = options2.noRetryStatuses) == null ? void 0 : _b2.includes(error.status)))
        throw error;
      const retryIndex = maxRetries - retriesRemaining;
      retriesRemaining--;
      await abortableSleep(getRetryDelayMs(error, retryIndex, options2.maxRetryDelayMs), options2.signal);
    }
  }
}
function sanitizeSurrogates(text) {
  return text.replace(new RegExp("[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?<![\\uD800-\\uDBFF])[\\uDC00-\\uDFFF]", "g"), "");
}
class UnsupportedStrictJsonSchemaError extends Error {
}
const UNSUPPORTED_STRICT_SCHEMA_KEYS = [
  "$ref",
  "$defs",
  "definitions",
  "allOf",
  "oneOf",
  "patternProperties",
  "dependentSchemas",
  "dependencies",
  "unevaluatedProperties",
  "propertyNames",
  "contains",
  "prefixItems",
  "not",
  "if",
  "then",
  "else"
];
function isJsonSchemaObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStructuredSchema(schema) {
  if (!isJsonSchemaObject(schema))
    return false;
  const types = typeof schema.type === "string" ? [schema.type] : Array.isArray(schema.type) ? schema.type : [];
  return types.includes("object") || types.includes("array") || schema.properties !== void 0 || schema.items !== void 0;
}
function schemaAllowsNull(schema) {
  if (!isJsonSchemaObject(schema))
    return false;
  if (schema.type === "null" || Array.isArray(schema.type) && schema.type.includes("null"))
    return true;
  if (schema.const === null || Array.isArray(schema.enum) && schema.enum.includes(null))
    return true;
  return Array.isArray(schema.anyOf) && schema.anyOf.some((variant) => schemaAllowsNull(variant));
}
function makeJsonSchemaNodeStrict(schema, isUnsupportedKeyword) {
  if (!isJsonSchemaObject(schema)) {
    throw new UnsupportedStrictJsonSchemaError("boolean schemas are unsupported");
  }
  for (const key of UNSUPPORTED_STRICT_SCHEMA_KEYS) {
    if (schema[key] !== void 0) {
      throw new UnsupportedStrictJsonSchemaError(`${key} schemas are unsupported`);
    }
  }
  if (schema.anyOf !== void 0) {
    if (!Array.isArray(schema.anyOf) || schema.anyOf.length === 0) {
      throw new UnsupportedStrictJsonSchemaError("anyOf must contain at least one schema");
    }
    for (const variant of schema.anyOf) {
      if (isStructuredSchema(variant)) {
        throw new UnsupportedStrictJsonSchemaError("object and array unions are unsupported");
      }
      makeJsonSchemaNodeStrict(variant);
    }
  }
  if (schema.items !== void 0) {
    if (Array.isArray(schema.items)) {
      throw new UnsupportedStrictJsonSchemaError("tuple schemas are unsupported");
    }
    makeJsonSchemaNodeStrict(schema.items);
  }
  const isObjectSchema = schema.type === "object";
  if (schema.properties !== void 0 && !isObjectSchema) {
    throw new UnsupportedStrictJsonSchemaError("properties require type object");
  }
  if (!isObjectSchema)
    return;
  if (schema.additionalProperties !== void 0 && schema.additionalProperties !== false) {
    throw new UnsupportedStrictJsonSchemaError("schema-valued or true additionalProperties is unsupported");
  }
  if (schema.properties !== void 0 && !isJsonSchemaObject(schema.properties)) {
    throw new UnsupportedStrictJsonSchemaError("object properties must be a schema map");
  }
  if (schema.required !== void 0 && (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== "string"))) {
    throw new UnsupportedStrictJsonSchemaError("object required must be a string array");
  }
  const properties = schema.properties ?? {};
  const propertyNames = Object.keys(properties);
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  if ([...required].some((key) => !propertyNames.includes(key))) {
    throw new UnsupportedStrictJsonSchemaError("required contains an unknown property");
  }
  for (const [key, property] of Object.entries(properties)) {
    makeJsonSchemaNodeStrict(property);
    if (!required.has(key) && !schemaAllowsNull(property)) {
      properties[key] = { anyOf: [property, { type: "null" }] };
    }
  }
  schema.required = propertyNames;
  schema.additionalProperties = false;
}
function makeStrictJsonSchema(schema, isUnsupportedKeyword) {
  const cloned = structuredClone(schema);
  if (!isJsonSchemaObject(cloned)) {
    throw new UnsupportedStrictJsonSchemaError("root schema must have type object");
  }
  makeJsonSchemaNodeStrict(cloned);
  if (cloned.type !== "object") {
    throw new UnsupportedStrictJsonSchemaError("root schema must have type object");
  }
  return cloned;
}
function getJsonSchemaToolParameters(tool, strict) {
  return strict === true ? makeStrictJsonSchema(tool.parameters) : tool.parameters;
}
function getGrammarToolInput(toolName, arguments_, inputProperty) {
  const input = arguments_[inputProperty];
  if (typeof input !== "string") {
    throw new Error(`Grammar tool call "${toolName}" requires argument "${inputProperty}" to be a string.`);
  }
  return input;
}
function appendGrammarToolInputJsonDelta(buffer, inputProperty, nextInput, close) {
  if (buffer.closed) {
    if (close && nextInput === buffer.input)
      return void 0;
    throw new Error(`grammar tool input for property "${inputProperty}" changed after it was closed`);
  }
  if (!nextInput.startsWith(buffer.input)) {
    throw new Error(`grammar tool input for property "${inputProperty}" changed non-monotonically`);
  }
  const inputDelta = nextInput.slice(buffer.input.length);
  if (!close && inputDelta.length === 0)
    return void 0;
  let delta = "";
  if (!buffer.started) {
    delta += `{${JSON.stringify(inputProperty)}:"`;
    buffer.started = true;
  }
  delta += JSON.stringify(inputDelta).slice(1, -1);
  buffer.input = nextInput;
  if (close) {
    delta += '"}';
    buffer.closed = true;
  }
  return delta;
}
function inferGrammarInputProperty(tool) {
  var _a3, _b2;
  const schema = tool.parameters;
  if (schema.type !== "object") {
    throw new Error("grammar constrained sampling requires an object parameter schema");
  }
  if (!Array.isArray(schema.required) || schema.required.length !== 1 || typeof schema.required[0] !== "string") {
    throw new Error("grammar constrained sampling requires exactly one required string property");
  }
  const inputProperty = schema.required[0];
  if (!((_a3 = schema.properties) == null ? void 0 : _a3[inputProperty])) {
    throw new Error(`grammar constrained sampling requires a properties entry for ${inputProperty}`);
  }
  if (((_b2 = schema.properties[inputProperty]) == null ? void 0 : _b2.type) !== "string") {
    throw new Error(`grammar constrained sampling property ${inputProperty} must have type string`);
  }
  return inputProperty;
}
function resolveJsonSchemaStrictSampling(tool, supportsStrictMode, isUnsupportedKeyword) {
  const config = tool.constrainedSampling;
  if (!config || config.type !== "json_schema")
    return void 0;
  if (supportsStrictMode) {
    try {
      makeStrictJsonSchema(tool.parameters, isUnsupportedKeyword);
      return true;
    } catch (error) {
      if (!(error instanceof UnsupportedStrictJsonSchemaError))
        throw error;
      if (config.strict !== "require")
        return void 0;
      throw new Error(`Tool "${tool.name}" requires JSON-schema constrained sampling, but ${error.message}.`);
    }
  }
  if (config.strict === "require") {
    throw new Error(`Tool "${tool.name}" requires JSON-schema constrained sampling, but strict tools are unsupported.`);
  }
  return void 0;
}
function resolveGrammarConstrainedSampling(tool, supportsOpenAIGrammarTools) {
  const config = tool.constrainedSampling;
  if (!config || config.type !== "grammar") {
    return void 0;
  }
  if (!supportsOpenAIGrammarTools) {
    return void 0;
  }
  const larkDefinition = config.variants.openai_lark;
  const regexDefinition = config.variants.openai_regex;
  const hasLarkDefinition = typeof larkDefinition === "string" && larkDefinition.trim().length > 0;
  const hasRegexDefinition = typeof regexDefinition === "string" && regexDefinition.trim().length > 0;
  if (!hasLarkDefinition && !hasRegexDefinition) {
    throw new Error(`Tool "${tool.name}" cannot use grammar constrained sampling: no supported grammar variant was provided.`);
  }
  try {
    return {
      format: hasLarkDefinition ? "lark" : "regex",
      definition: hasLarkDefinition ? larkDefinition : regexDefinition,
      inputProperty: inferGrammarInputProperty(tool)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Tool "${tool.name}" cannot use grammar constrained sampling: ${message}.`);
  }
}
function createGrammarToolInputProperties(tools, supportsOpenAIGrammarTools) {
  const properties = /* @__PURE__ */ new Map();
  for (const tool of tools ?? []) {
    const grammar = resolveGrammarConstrainedSampling(tool, supportsOpenAIGrammarTools);
    if (grammar) {
      properties.set(tool.name, grammar.inputProperty);
    }
  }
  return properties;
}
function inferCopilotInitiator(messages) {
  const last = messages[messages.length - 1];
  return last && last.role !== "user" ? "agent" : "user";
}
function hasCopilotVisionInput(messages) {
  return messages.some((msg) => {
    if (msg.role === "user" && Array.isArray(msg.content)) {
      return msg.content.some((c) => c.type === "image");
    }
    if (msg.role === "toolResult" && Array.isArray(msg.content)) {
      return msg.content.some((c) => c.type === "image");
    }
    return false;
  });
}
function buildCopilotDynamicHeaders(params) {
  const headers = {
    "X-Initiator": inferCopilotInitiator(params.messages),
    "Openai-Intent": "conversation-edits"
  };
  if (params.hasImages) {
    headers["Copilot-Vision-Request"] = "true";
  }
  return headers;
}
const OPENAI_PROMPT_CACHE_KEY_MAX_LENGTH = 64;
function clampOpenAIPromptCacheKey(key) {
  if (key === void 0)
    return void 0;
  const chars = Array.from(key);
  if (chars.length <= OPENAI_PROMPT_CACHE_KEY_MAX_LENGTH)
    return key;
  return chars.slice(0, OPENAI_PROMPT_CACHE_KEY_MAX_LENGTH).join("");
}
const CHARS_PER_TOKEN = 3.5;
const ESTIMATED_IMAGE_CHARS = 4800;
function calculateContextTokens(usage) {
  return usage.totalTokens || usage.input + usage.output + usage.cacheRead + usage.cacheWrite;
}
function safeJsonStringify(value) {
  try {
    return JSON.stringify(value) ?? "undefined";
  } catch {
    return "[unserializable]";
  }
}
function estimateTextAndImageContentChars(content) {
  if (typeof content === "string")
    return content.length;
  let chars = 0;
  for (const block of content)
    chars += block.type === "text" ? block.text.length : ESTIMATED_IMAGE_CHARS;
  return chars;
}
function estimateTextTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
function estimateTextAndImageContentTokens(content) {
  return Math.ceil(estimateTextAndImageContentChars(content) / CHARS_PER_TOKEN);
}
function estimateMessageTokens(message) {
  let chars = 0;
  if (message.role === "system") {
    return estimateTextTokens(getSystemMessageText(message)) + estimateToolsTokens(message.toolsAdded) + estimateToolsTokens(message.toolsRemoved);
  }
  if (message.role === "user")
    return estimateTextAndImageContentTokens(message.content);
  if (message.role === "toolResult")
    return estimateTextAndImageContentTokens(message.content);
  for (const block of message.content) {
    if (block.type === "text") {
      chars += block.text.length;
    } else if (block.type === "thinking") {
      chars += block.thinking.length;
    } else {
      chars += block.name.length + safeJsonStringify(block.arguments).length;
    }
  }
  return Math.ceil(chars / CHARS_PER_TOKEN);
}
function getLastAssistantUsageInfo(messages) {
  let latestPrefixTimestamp = Number.NEGATIVE_INFINITY;
  let usageInfo;
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role === "assistant") {
      const assistant = message;
      const usageAppliesToPrefix = assistant.timestamp >= latestPrefixTimestamp;
      if (usageAppliesToPrefix && assistant.stopReason !== "aborted" && assistant.stopReason !== "error" && calculateContextTokens(assistant.usage) > 0) {
        usageInfo = { usage: assistant.usage, index: i };
      }
    }
    latestPrefixTimestamp = Math.max(latestPrefixTimestamp, message.timestamp);
  }
  return usageInfo;
}
function estimateContextTokens(context) {
  const messages = "messages" in context ? context.messages : context;
  const usageInfo = getLastAssistantUsageInfo(messages);
  if (usageInfo) {
    const usageTokens = calculateContextTokens(usageInfo.usage);
    let trailingTokens = 0;
    for (let i = usageInfo.index + 1; i < messages.length; i++) {
      trailingTokens += estimateMessageTokens(messages[i]);
    }
    return { tokens: usageTokens + trailingTokens, usageTokens, trailingTokens, lastUsageIndex: usageInfo.index };
  }
  let tokens = 0;
  for (const message of messages)
    tokens += estimateMessageTokens(message);
  return { tokens, usageTokens: 0, trailingTokens: tokens, lastUsageIndex: null };
}
function estimateToolsTokens(tools) {
  if (!tools || tools.length === 0)
    return 0;
  return estimateTextTokens(safeJsonStringify(tools));
}
const CONTEXT_SAFETY_TOKENS = 4096;
const MIN_MAX_TOKENS = 1;
function clampMaxTokensToContext(model, context, maxTokens) {
  if (model.contextWindow <= 0)
    return Math.max(MIN_MAX_TOKENS, maxTokens);
  const available = model.contextWindow - estimateContextTokens(context).tokens - CONTEXT_SAFETY_TOKENS;
  return Math.min(maxTokens, Math.max(MIN_MAX_TOKENS, available));
}
function resolveSamplingParams(model, thinkingLevel, requestParams) {
  var _a3;
  const effectiveThinkingLevel = clampThinkingLevel(model, thinkingLevel);
  const thinkingLevelParams = (_a3 = model.samplingParamsByThinkingLevel) == null ? void 0 : _a3[effectiveThinkingLevel];
  return model.samplingParams || thinkingLevelParams || requestParams ? { ...model.samplingParams, ...thinkingLevelParams, ...requestParams } : void 0;
}
function buildBaseOptions(model, context, options2, apiKey) {
  const samplingParams = resolveSamplingParams(model, (options2 == null ? void 0 : options2.reasoning) ?? "off", options2 == null ? void 0 : options2.samplingParams);
  return {
    temperature: options2 == null ? void 0 : options2.temperature,
    samplingParams,
    maxTokens: clampMaxTokensToContext(model, context, (options2 == null ? void 0 : options2.maxTokens) ?? model.maxTokens),
    signal: options2 == null ? void 0 : options2.signal,
    telemetryContext: options2 == null ? void 0 : options2.telemetryContext,
    apiKey: apiKey || (options2 == null ? void 0 : options2.apiKey),
    fetch: options2 == null ? void 0 : options2.fetch,
    transport: options2 == null ? void 0 : options2.transport,
    cacheRetention: options2 == null ? void 0 : options2.cacheRetention,
    sessionId: options2 == null ? void 0 : options2.sessionId,
    headers: options2 == null ? void 0 : options2.headers,
    onPayload: options2 == null ? void 0 : options2.onPayload,
    onResponse: options2 == null ? void 0 : options2.onResponse,
    onProviderStreamEvent: options2 == null ? void 0 : options2.onProviderStreamEvent,
    timeoutMs: options2 == null ? void 0 : options2.timeoutMs,
    websocketConnectTimeoutMs: options2 == null ? void 0 : options2.websocketConnectTimeoutMs,
    maxRetries: options2 == null ? void 0 : options2.maxRetries,
    maxRetryDelayMs: options2 == null ? void 0 : options2.maxRetryDelayMs,
    metadata: options2 == null ? void 0 : options2.metadata,
    env: options2 == null ? void 0 : options2.env
  };
}
const MIN_ANSWER_TOKENS = 1024;
const DEFAULT_THINKING_BUDGETS = {
  minimal: 1024,
  low: 2048,
  medium: 8192,
  high: 16384
};
function clampReasoning(effort) {
  return effort === "xhigh" || effort === "max" ? "high" : effort;
}
function thinkingBudgetForLevel(reasoningLevel, customBudgets) {
  const budgets = { ...DEFAULT_THINKING_BUDGETS, ...customBudgets };
  const level = clampReasoning(reasoningLevel);
  return budgets[level];
}
function clampThinkingBudgetToAnswerRoom(thinkingBudget, ceiling) {
  return Math.min(thinkingBudget, Math.max(0, ceiling - MIN_ANSWER_TOKENS));
}
const NON_VISION_USER_IMAGE_PLACEHOLDER = "(image omitted: model does not support images)";
const NON_VISION_TOOL_IMAGE_PLACEHOLDER = "(tool image omitted: model does not support images)";
function replaceImagesWithPlaceholder(content, placeholder) {
  const result = [];
  let previousWasPlaceholder = false;
  for (const block of content) {
    if (block.type === "image") {
      if (!previousWasPlaceholder) {
        result.push({ type: "text", text: placeholder });
      }
      previousWasPlaceholder = true;
      continue;
    }
    result.push(block);
    previousWasPlaceholder = block.text === placeholder;
  }
  return result;
}
function downgradeUnsupportedImages(messages, model) {
  if (model.input.includes("image")) {
    return messages;
  }
  return messages.map((msg) => {
    if (msg.role === "user" && Array.isArray(msg.content)) {
      return {
        ...msg,
        content: replaceImagesWithPlaceholder(msg.content, NON_VISION_USER_IMAGE_PLACEHOLDER)
      };
    }
    if (msg.role === "toolResult") {
      return {
        ...msg,
        content: replaceImagesWithPlaceholder(msg.content, NON_VISION_TOOL_IMAGE_PLACEHOLDER)
      };
    }
    return msg;
  });
}
function transformMessages(messages, model, normalizeToolCallId) {
  const toolCallIdMap = /* @__PURE__ */ new Map();
  const normalizedMessages = messages.map((msg) => msg.content == null ? { ...msg, content: [] } : msg);
  const imageAwareMessages = downgradeUnsupportedImages(normalizedMessages, model);
  const transformed = imageAwareMessages.map((msg) => {
    if (msg.role === "system" || msg.role === "user") {
      return msg;
    }
    if (msg.role === "toolResult") {
      const normalizedId = toolCallIdMap.get(msg.toolCallId);
      if (normalizedId && normalizedId !== msg.toolCallId) {
        return { ...msg, toolCallId: normalizedId };
      }
      return msg;
    }
    if (msg.role === "assistant") {
      const assistantMsg = msg;
      const isSameModel = assistantMsg.provider === model.provider && assistantMsg.api === model.api && assistantMsg.model === model.id;
      const transformedContent = assistantMsg.content.flatMap((block) => {
        if (block.type === "thinking") {
          if (block.redacted) {
            return isSameModel ? block : [];
          }
          if (isSameModel && block.thinkingSignature)
            return block;
          if (!block.thinking || block.thinking.trim() === "")
            return [];
          if (isSameModel)
            return block;
          return {
            type: "text",
            text: block.thinking
          };
        }
        if (block.type === "text") {
          if (isSameModel)
            return block;
          return {
            type: "text",
            text: block.text
          };
        }
        if (block.type === "toolCall") {
          const toolCall = block;
          let normalizedToolCall = toolCall;
          if (!isSameModel && toolCall.thoughtSignature) {
            normalizedToolCall = { ...toolCall };
            delete normalizedToolCall.thoughtSignature;
          }
          if (!isSameModel && normalizeToolCallId) {
            const normalizedId = normalizeToolCallId(toolCall.id, model, assistantMsg);
            if (normalizedId !== toolCall.id) {
              toolCallIdMap.set(toolCall.id, normalizedId);
              normalizedToolCall = { ...normalizedToolCall, id: normalizedId };
            }
          }
          return normalizedToolCall;
        }
        return block;
      });
      return {
        ...assistantMsg,
        content: transformedContent
      };
    }
    return msg;
  });
  const result = [];
  let pendingToolCalls = [];
  let existingToolResultIds = /* @__PURE__ */ new Set();
  const heldSystemMessages = [];
  const closePendingToolCalls = () => {
    if (pendingToolCalls.length > 0) {
      for (const tc of pendingToolCalls) {
        if (!existingToolResultIds.has(tc.id)) {
          result.push({
            role: "toolResult",
            toolCallId: tc.id,
            toolName: tc.name,
            content: [{ type: "text", text: "No result provided" }],
            isError: true,
            timestamp: Date.now()
          });
        }
      }
      pendingToolCalls = [];
      existingToolResultIds = /* @__PURE__ */ new Set();
    }
    result.push(...heldSystemMessages);
    heldSystemMessages.length = 0;
  };
  for (let i = 0; i < transformed.length; i++) {
    const msg = transformed[i];
    if (msg.role === "assistant") {
      closePendingToolCalls();
      const assistantMsg = msg;
      if (assistantMsg.stopReason === "error" || assistantMsg.stopReason === "aborted") {
        continue;
      }
      const toolCalls = assistantMsg.content.filter((b) => b.type === "toolCall");
      if (toolCalls.length > 0) {
        pendingToolCalls = toolCalls;
        existingToolResultIds = /* @__PURE__ */ new Set();
      }
      result.push(msg);
    } else if (msg.role === "toolResult") {
      existingToolResultIds.add(msg.toolCallId);
      result.push(msg);
    } else if (msg.role === "system") {
      if (pendingToolCalls.length > 0) {
        heldSystemMessages.push(msg);
      } else {
        result.push(msg);
      }
    } else if (msg.role === "user") {
      closePendingToolCalls();
      result.push(msg);
    } else {
      result.push(msg);
    }
  }
  closePendingToolCalls();
  return result;
}
function hasHeader(headers, name) {
  if (!headers)
    return false;
  const expected = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === expected && value !== null && value.trim().length > 0)
      return true;
  }
  return false;
}
function getClientApiKey(provider, apiKey, headers) {
  if (apiKey)
    return apiKey;
  if (hasHeader(headers, "authorization") || hasHeader(headers, "cf-aig-authorization"))
    return "unused";
  throw new Error(`No API key for provider: ${provider}`);
}
function hasToolHistory(messages) {
  for (const msg of messages) {
    if (msg.role === "toolResult") {
      return true;
    }
    if (msg.role === "assistant") {
      if (msg.content.some((block) => block.type === "toolCall")) {
        return true;
      }
    }
  }
  return false;
}
function isTextContentBlock(block) {
  return block.type === "text";
}
function isThinkingContentBlock(block) {
  return block.type === "thinking";
}
function isToolCallBlock(block) {
  return block.type === "toolCall";
}
function isImageContentBlock(block) {
  return block.type === "image";
}
function isReasoningDetailObject(detail) {
  return typeof detail === "object" && detail !== null && !Array.isArray(detail);
}
function hasValidCommonReasoningDetailFields(candidate) {
  return (candidate.id === void 0 || candidate.id === null || typeof candidate.id === "string") && (candidate.format === void 0 || typeof candidate.format === "string") && (candidate.index === void 0 || typeof candidate.index === "number");
}
function isOpenAIReasoningDetail(detail) {
  if (!isReasoningDetailObject(detail) || !hasValidCommonReasoningDetailFields(detail)) {
    return false;
  }
  switch (detail.type) {
    case "reasoning.summary":
      return typeof detail.summary === "string";
    case "reasoning.encrypted":
      return typeof detail.data === "string";
    case "reasoning.text":
      return typeof detail.text === "string" && (detail.signature === void 0 || detail.signature === null || typeof detail.signature === "string");
    default:
      return false;
  }
}
function parseOpenAIReasoningDetails(signature) {
  if (!signature)
    return void 0;
  try {
    const parsed = JSON.parse(signature);
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every(isOpenAIReasoningDetail) ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function parseLegacyEncryptedReasoningDetail(signature) {
  if (!signature)
    return void 0;
  try {
    const parsed = JSON.parse(signature);
    return isOpenAIReasoningDetail(parsed) && parsed.type === "reasoning.encrypted" && typeof parsed.id === "string" && parsed.id.length > 0 && parsed.data.length > 0 ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function fillMissingCommonReasoningDetailFields(target, source) {
  target.id ?? (target.id = source.id);
  target.format || (target.format = source.format);
  target.index ?? (target.index = source.index);
}
function appendOpenAIReasoningDetail(details, detail) {
  const lastDetail = details[details.length - 1];
  if (detail.type === "reasoning.text" && (lastDetail == null ? void 0 : lastDetail.type) === "reasoning.text") {
    lastDetail.text += detail.text;
    lastDetail.signature || (lastDetail.signature = detail.signature);
    fillMissingCommonReasoningDetailFields(lastDetail, detail);
    return;
  }
  if (detail.type === "reasoning.summary" && (lastDetail == null ? void 0 : lastDetail.type) === "reasoning.summary") {
    lastDetail.summary += detail.summary;
    fillMissingCommonReasoningDetailFields(lastDetail, detail);
    return;
  }
  details.push({ ...detail });
}
const OPENAI_COMPLETIONS_REASONING_FIELDS = ["reasoning", "reasoning_content", "reasoning_text"];
function isOpenAICompletionsReasoningField(field) {
  return OPENAI_COMPLETIONS_REASONING_FIELDS.includes(field);
}
function resolveCacheRetention(cacheRetention, env) {
  if (cacheRetention) {
    return cacheRetention;
  }
  if (getProviderEnvValue("PI_CACHE_RETENTION", env) === "long") {
    return "long";
  }
  return "short";
}
const stream = (model, context, options2) => {
  const stream2 = new AssistantMessageEventStream();
  const normalizedContext = resolveTranscript(context, getCompat(model).supportsMidConvoSystemMessages);
  (async () => {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l;
    const output = {
      role: "assistant",
      content: [],
      api: model.api,
      provider: model.provider,
      model: model.id,
      usage: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 0,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }
      },
      stopReason: "pending",
      timestamp: Date.now()
    };
    let streamedReasoningDetails;
    const applyStreamedReasoningDetails = (block) => {
      if (streamedReasoningDetails !== void 0) {
        block.thinkingSignature = JSON.stringify(streamedReasoningDetails);
      }
    };
    try {
      const apiKey = getClientApiKey(model.provider, options2 == null ? void 0 : options2.apiKey, options2 == null ? void 0 : options2.headers);
      const compat = getCompat(model);
      const grammarToolInputProperties = createGrammarToolInputProperties(getDeclaredTools(normalizedContext.messages), compat.supportsOpenAIGrammarTools);
      const cacheRetention = resolveCacheRetention(options2 == null ? void 0 : options2.cacheRetention, options2 == null ? void 0 : options2.env);
      const cacheSessionId = cacheRetention === "none" ? void 0 : options2 == null ? void 0 : options2.sessionId;
      const client = createClient(model, normalizedContext, apiKey, options2 == null ? void 0 : options2.headers, options2 == null ? void 0 : options2.fetch, cacheSessionId, compat);
      let params = buildParams(model, normalizedContext, options2, compat, cacheRetention, grammarToolInputProperties);
      const nextParams = await ((_a3 = options2 == null ? void 0 : options2.onPayload) == null ? void 0 : _a3.call(options2, params, model));
      if (nextParams !== void 0) {
        params = nextParams;
      }
      const requestOptions = {
        ...(options2 == null ? void 0 : options2.signal) ? { signal: options2.signal } : {},
        ...(options2 == null ? void 0 : options2.timeoutMs) !== void 0 ? { timeout: options2.timeoutMs } : {},
        maxRetries: 0
      };
      const { data: openaiStream, response } = await retryProviderRequest(() => client.chat.completions.create(params, requestOptions).withResponse(), {
        maxRetries: options2 == null ? void 0 : options2.maxRetries,
        maxRetryDelayMs: options2 == null ? void 0 : options2.maxRetryDelayMs,
        signal: options2 == null ? void 0 : options2.signal
      });
      await ((_b2 = options2 == null ? void 0 : options2.onResponse) == null ? void 0 : _b2.call(options2, { status: response.status, headers: headersToRecord(response.headers) }, model));
      stream2.push({ type: "start", partial: output });
      let textBlock = null;
      let thinkingBlock = null;
      let hasFinishReason = false;
      const toolCallBlocksByIndex = /* @__PURE__ */ new Map();
      const toolCallBlocksById = /* @__PURE__ */ new Map();
      const blocks = output.content;
      const getContentIndex = (block) => blocks.indexOf(block);
      const getCustomToolCallInput = (block) => {
        var _a4;
        const property = (_a4 = block.customInput) == null ? void 0 : _a4.property;
        if (property === void 0)
          return "";
        const value = block.arguments[property];
        return typeof value === "string" ? value : "";
      };
      const appendCustomToolCallInput = (block, nextInput, close) => {
        const customInput = block.customInput;
        if (!customInput)
          return void 0;
        const delta = appendGrammarToolInputJsonDelta(customInput.jsonBuffer, customInput.property, nextInput, close);
        block.arguments = { [customInput.property]: nextInput };
        return delta;
      };
      const finishBlock = (block) => {
        const contentIndex = getContentIndex(block);
        if (contentIndex === -1) {
          return;
        }
        if (block.type === "text") {
          stream2.push({
            type: "text_end",
            contentIndex,
            content: block.text,
            partial: output
          });
        } else if (block.type === "thinking") {
          applyStreamedReasoningDetails(block);
          stream2.push({
            type: "thinking_end",
            contentIndex,
            content: block.thinking,
            partial: output
          });
        } else if (block.type === "toolCall") {
          if (block.customInput) {
            const delta = appendCustomToolCallInput(block, getCustomToolCallInput(block), true);
            if (delta !== void 0) {
              stream2.push({
                type: "toolcall_delta",
                contentIndex,
                delta,
                partial: output
              });
            }
          } else {
            block.arguments = parseStreamingJson(block.partialArgs);
          }
          delete block.partialArgs;
          delete block.customInput;
          delete block.streamIndex;
          stream2.push({
            type: "toolcall_end",
            contentIndex,
            toolCall: block,
            partial: output
          });
        }
      };
      const ensureTextBlock = () => {
        if (!textBlock) {
          textBlock = { type: "text", text: "" };
          blocks.push(textBlock);
          stream2.push({ type: "text_start", contentIndex: getContentIndex(textBlock), partial: output });
        }
        return textBlock;
      };
      const ensureThinkingBlock = (thinkingSignature) => {
        if (!thinkingBlock) {
          thinkingBlock = {
            type: "thinking",
            thinking: "",
            thinkingSignature
          };
          blocks.push(thinkingBlock);
          stream2.push({ type: "thinking_start", contentIndex: getContentIndex(thinkingBlock), partial: output });
        }
        return thinkingBlock;
      };
      const ensureToolCallBlock = (toolCall) => {
        var _a4, _b3;
        const streamIndex = typeof toolCall.index === "number" ? toolCall.index : void 0;
        const name = ((_a4 = toolCall.function) == null ? void 0 : _a4.name) ?? ((_b3 = toolCall.custom) == null ? void 0 : _b3.name) ?? "";
        let block = streamIndex !== void 0 ? toolCallBlocksByIndex.get(streamIndex) : void 0;
        if (!block && toolCall.id) {
          block = toolCallBlocksById.get(toolCall.id);
        }
        if (!block) {
          const customInputProperty = toolCall.custom && !toolCall.function ? grammarToolInputProperties.get(name) ?? "input" : void 0;
          const hasCustomInput = customInputProperty !== void 0;
          block = {
            type: "toolCall",
            id: toolCall.id || "",
            name,
            arguments: hasCustomInput ? { [customInputProperty]: "" } : {},
            partialArgs: hasCustomInput ? void 0 : "",
            customInput: hasCustomInput ? { property: customInputProperty, jsonBuffer: { input: "", started: false, closed: false } } : void 0,
            streamIndex
          };
          if (streamIndex !== void 0) {
            toolCallBlocksByIndex.set(streamIndex, block);
          }
          if (toolCall.id) {
            toolCallBlocksById.set(toolCall.id, block);
          }
          blocks.push(block);
          stream2.push({
            type: "toolcall_start",
            contentIndex: getContentIndex(block),
            partial: output
          });
        }
        if (streamIndex !== void 0 && block.streamIndex === void 0) {
          block.streamIndex = streamIndex;
          toolCallBlocksByIndex.set(streamIndex, block);
        }
        if (toolCall.id) {
          toolCallBlocksById.set(toolCall.id, block);
        }
        if (!block.name && name) {
          block.name = name;
        }
        if (toolCall.custom && !toolCall.function && !block.customInput) {
          const customInputProperty = grammarToolInputProperties.get(block.name) ?? "input";
          block.arguments = { [customInputProperty]: "" };
          block.customInput = {
            property: customInputProperty,
            jsonBuffer: { input: "", started: false, closed: false }
          };
          delete block.partialArgs;
        }
        return block;
      };
      for await (const chunk of openaiStream) {
        await ((_c2 = options2 == null ? void 0 : options2.onProviderStreamEvent) == null ? void 0 : _c2.call(options2, chunk, model));
        if (!chunk || typeof chunk !== "object")
          continue;
        output.responseId || (output.responseId = chunk.id);
        if (typeof chunk.model === "string" && chunk.model.length > 0 && chunk.model !== model.id) {
          output.responseModel || (output.responseModel = chunk.model);
        }
        if (chunk.usage) {
          output.usage = parseChunkUsage(chunk.usage, model);
        }
        const choice = Array.isArray(chunk.choices) ? chunk.choices[0] : void 0;
        if (!choice)
          continue;
        if (!chunk.usage && choice.usage) {
          output.usage = parseChunkUsage(choice.usage, model);
        }
        if (choice.finish_reason) {
          output.rawStopReason = choice.finish_reason;
          const finishReasonResult = mapStopReason(choice.finish_reason);
          output.stopReason = finishReasonResult.stopReason;
          if (finishReasonResult.errorMessage) {
            output.errorMessage = finishReasonResult.errorMessage;
          }
          hasFinishReason = true;
        }
        if (choice.delta) {
          if (choice.delta.content !== null && choice.delta.content !== void 0 && choice.delta.content.length > 0) {
            const block = ensureTextBlock();
            block.text += choice.delta.content;
            stream2.push({
              type: "text_delta",
              contentIndex: getContentIndex(block),
              delta: choice.delta.content,
              partial: output
            });
          }
          const reasoningFields = ["reasoning_content", "reasoning", "reasoning_text"];
          const deltaFields = choice.delta;
          let foundReasoningField = null;
          for (const field of reasoningFields) {
            const value = deltaFields[field];
            if (typeof value === "string" && value.length > 0) {
              foundReasoningField = field;
              break;
            }
          }
          if (foundReasoningField) {
            const delta = deltaFields[foundReasoningField];
            if (typeof delta === "string" && delta.length > 0) {
              const thinkingSignature = model.provider === "opencode-go" && foundReasoningField === "reasoning" ? "reasoning_content" : foundReasoningField;
              const block = ensureThinkingBlock(thinkingSignature);
              block.thinking += delta;
              stream2.push({
                type: "thinking_delta",
                contentIndex: getContentIndex(block),
                delta,
                partial: output
              });
            }
          }
          if ((_d2 = choice == null ? void 0 : choice.delta) == null ? void 0 : _d2.tool_calls) {
            for (const toolCall of choice.delta.tool_calls) {
              const block = ensureToolCallBlock(toolCall);
              if (!block.id && toolCall.id) {
                block.id = toolCall.id;
                toolCallBlocksById.set(toolCall.id, block);
              }
              const name = ((_e2 = toolCall.function) == null ? void 0 : _e2.name) ?? ((_f2 = toolCall.custom) == null ? void 0 : _f2.name);
              if (!block.name && name) {
                block.name = name;
              }
              let delta = "";
              if ((_g2 = toolCall.function) == null ? void 0 : _g2.arguments) {
                delta = toolCall.function.arguments;
                block.partialArgs = (block.partialArgs ?? "") + toolCall.function.arguments;
                block.arguments = parseStreamingJson(block.partialArgs);
              } else if ((_h = toolCall.custom) == null ? void 0 : _h.input) {
                const nextInput = getCustomToolCallInput(block) + toolCall.custom.input;
                delta = appendCustomToolCallInput(block, nextInput, false) ?? "";
              }
              stream2.push({
                type: "toolcall_delta",
                contentIndex: getContentIndex(block),
                delta,
                partial: output
              });
            }
          }
          const reasoningDetails = choice.delta.reasoning_details;
          if (Array.isArray(reasoningDetails)) {
            for (const detail of reasoningDetails) {
              if (!isOpenAIReasoningDetail(detail))
                continue;
              ensureThinkingBlock("");
              streamedReasoningDetails ?? (streamedReasoningDetails = []);
              appendOpenAIReasoningDetail(streamedReasoningDetails, detail);
            }
          }
        }
      }
      for (const block of blocks) {
        finishBlock(block);
      }
      if ((_i = options2 == null ? void 0 : options2.signal) == null ? void 0 : _i.aborted) {
        throw new Error("Request was aborted");
      }
      if (output.stopReason === "aborted") {
        throw new Error("Request was aborted");
      }
      if (!hasFinishReason && !compat.supportsFinishReason) {
        output.stopReason = output.content.some((block) => block.type === "toolCall") ? "toolUse" : "stop";
      }
      if (output.stopReason === "error") {
        throw new Error(output.errorMessage || "Provider returned an error stop reason");
      }
      if (compat.supportsFinishReason && !hasFinishReason || output.stopReason === "pending") {
        throw new Error("Stream ended without finish_reason");
      }
      stream2.push({ type: "done", reason: output.stopReason, message: output });
      stream2.end();
    } catch (error) {
      for (const block of output.content) {
        if (block.type === "thinking") {
          applyStreamedReasoningDetails(block);
        }
        delete block.index;
        delete block.partialArgs;
        delete block.customInput;
        delete block.streamIndex;
      }
      output.stopReason = ((_j = options2 == null ? void 0 : options2.signal) == null ? void 0 : _j.aborted) ? "aborted" : "error";
      output.errorMessage = formatProviderError(normalizeProviderError(error));
      const rawMetadata = (_l = (_k = error == null ? void 0 : error.error) == null ? void 0 : _k.metadata) == null ? void 0 : _l.raw;
      if (rawMetadata && !output.errorMessage.includes(String(rawMetadata))) {
        output.errorMessage += `
${rawMetadata}`;
      }
      stream2.push({ type: "error", reason: output.stopReason, error: output });
      stream2.end();
    }
  })();
  return stream2;
};
const streamSimple = (model, context, options2) => {
  getClientApiKey(model.provider, options2 == null ? void 0 : options2.apiKey, options2 == null ? void 0 : options2.headers);
  const base = {
    ...buildBaseOptions(model, context, options2, options2 == null ? void 0 : options2.apiKey),
    toolChoice: options2 == null ? void 0 : options2.toolChoice
  };
  const clampedReasoning = (options2 == null ? void 0 : options2.reasoning) ? clampThinkingLevel(model, options2.reasoning) : void 0;
  const reasoningEffort = clampedReasoning === "off" ? void 0 : clampedReasoning;
  return stream(model, context, {
    ...base,
    reasoningEffort,
    thinkingBudgets: options2 == null ? void 0 : options2.thinkingBudgets
  });
};
function createClient(model, context, apiKey, optionsHeaders, fetch2, sessionId, compat = getCompat(model)) {
  const headers = { "User-Agent": getPiUserAgent(), ...model.headers };
  if (model.provider === "github-copilot") {
    const hasImages = hasCopilotVisionInput(context.messages);
    const copilotHeaders = buildCopilotDynamicHeaders({
      messages: context.messages,
      hasImages
    });
    Object.assign(headers, copilotHeaders);
  }
  if (sessionId && compat.sendSessionAffinityHeaders) {
    if (compat.sessionAffinityFormat === "openrouter") {
      headers["x-session-id"] = sessionId;
    } else {
      if (compat.sessionAffinityFormat === "openai") {
        headers.session_id = sessionId;
      }
      headers["x-client-request-id"] = sessionId;
      headers["x-session-affinity"] = sessionId;
    }
  }
  if (optionsHeaders) {
    Object.assign(headers, optionsHeaders);
  }
  return new OpenAI({
    apiKey,
    baseURL: model.baseUrl,
    dangerouslyAllowBrowser: true,
    fetch: fetch2,
    defaultHeaders: headers
  });
}
function buildParams(model, context, options2, compat = getCompat(model), cacheRetention = resolveCacheRetention(options2 == null ? void 0 : options2.cacheRetention, options2 == null ? void 0 : options2.env), grammarToolInputProperties = createGrammarToolInputProperties(getDeclaredTools(context.messages), compat.supportsOpenAIGrammarTools)) {
  var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
  const transcriptTools = resolveTranscriptTools(context.messages, compat.supportsMidConvoSystemMessages === true && compat.supportsMidConvoToolAdditions === true);
  const messages = convertMessages(model, context, compat, {
    grammarToolInputProperties
  });
  const cacheControl = getCompatCacheControl(compat, cacheRetention);
  const params = {
    model: model.id,
    messages,
    stream: true,
    prompt_cache_key: model.baseUrl.includes("api.openai.com") && cacheRetention !== "none" || cacheRetention === "long" && compat.supportsLongCacheRetention ? clampOpenAIPromptCacheKey(options2 == null ? void 0 : options2.sessionId) : void 0,
    prompt_cache_retention: cacheRetention === "long" && compat.supportsLongCacheRetention ? "24h" : void 0
  };
  if (compat.supportsUsageInStreaming !== false) {
    params.stream_options = { include_usage: true };
  }
  if (compat.supportsStore) {
    params.store = false;
  }
  if (options2 == null ? void 0 : options2.maxTokens) {
    if (compat.maxTokensField === "max_tokens") {
      params.max_tokens = options2.maxTokens;
    } else {
      params.max_completion_tokens = options2.maxTokens;
    }
  }
  if ((options2 == null ? void 0 : options2.temperature) !== void 0) {
    params.temperature = options2.temperature;
  }
  if (transcriptTools.requestTools.length > 0) {
    params.tools = convertTools(transcriptTools.requestTools, compat);
    if (compat.zaiToolStream) {
      params.tool_stream = true;
    }
  } else if (hasToolHistory(context.messages)) {
    params.tools = [];
  }
  if (cacheControl) {
    applyAnthropicCacheControl(messages, params.tools, cacheControl);
  }
  if (options2 == null ? void 0 : options2.toolChoice) {
    params.tool_choice = options2.toolChoice;
  }
  if (compat.vllmPriority !== void 0) {
    params.priority = compat.vllmPriority;
  }
  const thinkingTokenBudgetField = resolveThinkingTokenBudgetField(compat);
  const thinkingBudget = resolveClampedThinkingBudget(model, options2, params);
  if (compat.thinkingFormat === "zai" && model.reasoning) {
    const zaiParams = params;
    zaiParams.thinking = (options2 == null ? void 0 : options2.reasoningEffort) ? { type: "enabled", clear_thinking: false } : { type: "disabled" };
    if ((options2 == null ? void 0 : options2.reasoningEffort) && compat.supportsReasoningEffort) {
      const mappedEffort = (_a3 = model.thinkingLevelMap) == null ? void 0 : _a3[options2.reasoningEffort];
      const effort = mappedEffort === void 0 ? options2.reasoningEffort : mappedEffort;
      if (typeof effort === "string") {
        zaiParams.reasoning_effort = effort;
      }
    }
  } else if (compat.thinkingFormat === "qwen" && model.reasoning) {
    params.enable_thinking = !!(options2 == null ? void 0 : options2.reasoningEffort);
    if ((options2 == null ? void 0 : options2.reasoningEffort) && compat.supportsReasoningEffort) {
      const effort = ((_b2 = model.thinkingLevelMap) == null ? void 0 : _b2[options2.reasoningEffort]) ?? options2.reasoningEffort;
      if (typeof effort === "string") {
        params.reasoning_effort = effort;
      }
    }
  } else if (compat.thinkingFormat === "qwen-chat-template" && model.reasoning) {
    params.chat_template_kwargs = {
      enable_thinking: !!(options2 == null ? void 0 : options2.reasoningEffort),
      preserve_thinking: true
    };
  } else if (compat.thinkingFormat === "chat-template" && model.reasoning) {
    const chatTemplateKwargs = buildChatTemplateValues(model, options2, compat.chatTemplateKwargs, thinkingBudget);
    if (chatTemplateKwargs) {
      params.chat_template_kwargs = chatTemplateKwargs;
    }
  } else if (compat.thinkingFormat === "baseten" && model.reasoning) {
    const basetenParams = params;
    const chatTemplateArgs = buildChatTemplateValues(model, options2, compat.chatTemplateArgs, thinkingBudget);
    if (chatTemplateArgs) {
      basetenParams.chat_template_args = chatTemplateArgs;
    }
    if (compat.supportsReasoningEffort) {
      const requestedEffort = options2 == null ? void 0 : options2.reasoningEffort;
      const mappedEffort = requestedEffort ? (_c2 = model.thinkingLevelMap) == null ? void 0 : _c2[requestedEffort] : (_d2 = model.thinkingLevelMap) == null ? void 0 : _d2.off;
      const effort = mappedEffort === void 0 ? requestedEffort : mappedEffort;
      if (typeof effort === "string") {
        basetenParams.reasoning_effort = effort;
      }
    }
  } else if (compat.thinkingFormat === "deepseek" && model.reasoning) {
    if (options2 == null ? void 0 : options2.reasoningEffort) {
      params.thinking = { type: "enabled" };
    } else if (((_e2 = model.thinkingLevelMap) == null ? void 0 : _e2.off) !== null) {
      params.thinking = { type: "disabled" };
    }
    if ((options2 == null ? void 0 : options2.reasoningEffort) && compat.supportsReasoningEffort) {
      params.reasoning_effort = ((_f2 = model.thinkingLevelMap) == null ? void 0 : _f2[options2.reasoningEffort]) ?? options2.reasoningEffort;
    }
  } else if (compat.thinkingFormat === "openrouter" && model.reasoning) {
    const openRouterParams = params;
    if (options2 == null ? void 0 : options2.reasoningEffort) {
      openRouterParams.reasoning = {
        effort: ((_g2 = model.thinkingLevelMap) == null ? void 0 : _g2[options2.reasoningEffort]) ?? options2.reasoningEffort
      };
    } else if (((_h = model.thinkingLevelMap) == null ? void 0 : _h.off) !== null) {
      openRouterParams.reasoning = { effort: ((_i = model.thinkingLevelMap) == null ? void 0 : _i.off) ?? "none" };
    }
  } else if (compat.thinkingFormat === "ant-ling" && model.reasoning && (options2 == null ? void 0 : options2.reasoningEffort)) {
    const effort = (_j = model.thinkingLevelMap) == null ? void 0 : _j[options2.reasoningEffort];
    if (typeof effort === "string") {
      params.reasoning = { effort };
    }
  } else if (compat.thinkingFormat === "together" && model.reasoning) {
    const togetherParams = params;
    togetherParams.reasoning = { enabled: !!(options2 == null ? void 0 : options2.reasoningEffort) };
    if ((options2 == null ? void 0 : options2.reasoningEffort) && compat.supportsReasoningEffort) {
      togetherParams.reasoning_effort = ((_k = model.thinkingLevelMap) == null ? void 0 : _k[options2.reasoningEffort]) ?? options2.reasoningEffort;
    }
  } else if (compat.thinkingFormat === "string-thinking" && model.reasoning) {
    const stringThinkingParams = params;
    if (options2 == null ? void 0 : options2.reasoningEffort) {
      stringThinkingParams.thinking = ((_l = model.thinkingLevelMap) == null ? void 0 : _l[options2.reasoningEffort]) ?? options2.reasoningEffort;
    } else if (((_m = model.thinkingLevelMap) == null ? void 0 : _m.off) !== null) {
      stringThinkingParams.thinking = ((_n = model.thinkingLevelMap) == null ? void 0 : _n.off) ?? "none";
    }
  } else if ((options2 == null ? void 0 : options2.reasoningEffort) && model.reasoning && compat.supportsReasoningEffort) {
    params.reasoning_effort = ((_o = model.thinkingLevelMap) == null ? void 0 : _o[options2.reasoningEffort]) ?? options2.reasoningEffort;
  } else if (!(options2 == null ? void 0 : options2.reasoningEffort) && model.reasoning && compat.supportsReasoningEffort) {
    const offValue = (_p = model.thinkingLevelMap) == null ? void 0 : _p.off;
    if (typeof offValue === "string") {
      params.reasoning_effort = offValue;
    }
  }
  if (thinkingTokenBudgetField && thinkingBudget !== void 0) {
    Object.assign(params, { [thinkingTokenBudgetField]: thinkingBudget });
  }
  if ((_q = model.compat) == null ? void 0 : _q.openRouterRouting) {
    params.provider = model.compat.openRouterRouting;
  }
  if ((_r = model.compat) == null ? void 0 : _r.vercelGatewayRouting) {
    const routing = model.compat.vercelGatewayRouting;
    if (routing.only || routing.order) {
      const gatewayOptions = {};
      if (routing.only)
        gatewayOptions.only = routing.only;
      if (routing.order)
        gatewayOptions.order = routing.order;
      params.providerOptions = { gateway: gatewayOptions };
    }
  }
  const samplingParams = resolveSamplingParams(model, (options2 == null ? void 0 : options2.reasoningEffort) ?? "off", options2 == null ? void 0 : options2.samplingParams);
  if (samplingParams) {
    Object.assign(params, samplingParams);
  }
  return params;
}
function resolveThinkingTokenBudgetField(compat) {
  if (compat.thinkingTokenBudgetField)
    return compat.thinkingTokenBudgetField;
  if (compat.supportsThinkingTokenBudget)
    return "thinking_token_budget";
  return void 0;
}
function resolveClampedThinkingBudget(model, options2, params) {
  if (!(options2 == null ? void 0 : options2.reasoningEffort) || !model.reasoning)
    return void 0;
  const ceiling = params.max_tokens ?? params.max_completion_tokens ?? model.maxTokens;
  const budget = clampThinkingBudgetToAnswerRoom(thinkingBudgetForLevel(options2.reasoningEffort, options2.thinkingBudgets), ceiling);
  return budget > 0 ? budget : void 0;
}
function buildChatTemplateValues(model, options2, values2, thinkingBudget) {
  const resolvedValues = {};
  for (const [key, value] of Object.entries(values2)) {
    const resolved = resolveChatTemplateKwargValue(model, options2, value, thinkingBudget);
    if (resolved !== void 0) {
      resolvedValues[key] = resolved;
    }
  }
  return Object.keys(resolvedValues).length > 0 ? resolvedValues : void 0;
}
function resolveChatTemplateKwargValue(model, options2, value, thinkingBudget) {
  var _a3, _b2;
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const reasoningEffort = options2 == null ? void 0 : options2.reasoningEffort;
  if (!reasoningEffort && value.omitWhenOff) {
    return void 0;
  }
  if (value.$var === "thinking.enabled") {
    return !!reasoningEffort;
  }
  if (value.$var === "thinking.budget") {
    return thinkingBudget;
  }
  const mappedValue = reasoningEffort ? (_a3 = model.thinkingLevelMap) == null ? void 0 : _a3[reasoningEffort] : (_b2 = model.thinkingLevelMap) == null ? void 0 : _b2.off;
  return mappedValue === void 0 ? reasoningEffort : typeof mappedValue === "string" ? mappedValue : void 0;
}
function getCompatCacheControl(compat, cacheRetention) {
  if (compat.cacheControlFormat !== "anthropic" || cacheRetention === "none") {
    return void 0;
  }
  const ttl = cacheRetention === "long" && compat.supportsLongCacheRetention ? "1h" : void 0;
  return { type: "ephemeral", ...ttl ? { ttl } : {} };
}
function applyAnthropicCacheControl(messages, tools, cacheControl) {
  addCacheControlToSystemPrompt(messages, cacheControl);
  addCacheControlToLastTool(tools, cacheControl);
  addCacheControlToLastConversationMessage(messages, cacheControl);
}
function addCacheControlToSystemPrompt(messages, cacheControl) {
  for (const message of messages) {
    if (message.role === "system" || message.role === "developer") {
      addCacheControlToInstructionMessage(message, cacheControl);
      return;
    }
  }
}
function addCacheControlToLastConversationMessage(messages, cacheControl) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "user" || message.role === "assistant" || message.role === "tool") {
      if (addCacheControlToMessage(message, cacheControl)) {
        return;
      }
    }
  }
}
function addCacheControlToLastTool(tools, cacheControl) {
  if (!tools || tools.length === 0) {
    return;
  }
  const lastTool = tools[tools.length - 1];
  lastTool.cache_control = cacheControl;
}
function addCacheControlToInstructionMessage(message, cacheControl) {
  return addCacheControlToTextContent(message, cacheControl);
}
function addCacheControlToMessage(message, cacheControl) {
  if (message.role === "user" || message.role === "assistant" || message.role === "tool") {
    return addCacheControlToTextContent(message, cacheControl);
  }
  return false;
}
function addCacheControlToTextContent(message, cacheControl) {
  const content = message.content;
  if (typeof content === "string") {
    if (content.length === 0) {
      return false;
    }
    message.content = [
      {
        type: "text",
        text: content,
        cache_control: cacheControl
      }
    ];
    return true;
  }
  if (!Array.isArray(content)) {
    return false;
  }
  for (let i = content.length - 1; i >= 0; i--) {
    const part = content[i];
    if ((part == null ? void 0 : part.type) === "text") {
      const textPart = part;
      textPart.cache_control = cacheControl;
      return true;
    }
  }
  return false;
}
function convertMessages(model, context, compat, options2) {
  const normalizedContext = resolveTranscript(context, compat.supportsMidConvoSystemMessages);
  const params = [];
  const normalizeToolCallId = (id) => {
    if (id.includes("|")) {
      const separatorIndex = id.indexOf("|");
      const callId = id.slice(0, separatorIndex).replace(/[^a-zA-Z0-9_-]/g, "_");
      const itemId = id.slice(separatorIndex + 1).replace(/[^a-zA-Z0-9_-]/g, "_");
      const combinedId = itemId.length > 0 ? `${callId}_${itemId}` : callId;
      if (combinedId.length <= 40) {
        return combinedId;
      }
      const hash = shortHash(id).slice(0, 8);
      const prefix = callId.slice(0, Math.max(1, 40 - hash.length - 1));
      return `${prefix}_${hash}`;
    }
    if (model.provider === "openai")
      return id.length > 40 ? id.slice(0, 40) : id;
    return id;
  };
  const transformedMessages = transformMessages(normalizedContext.messages, model, (id) => normalizeToolCallId(id));
  const transcriptTools = resolveTranscriptTools(normalizedContext.messages, compat.supportsMidConvoSystemMessages === true && compat.supportsMidConvoToolAdditions === true);
  const instructionRole = model.reasoning && compat.supportsDeveloperRole ? "developer" : "system";
  let lastRole = null;
  for (let i = 0; i < transformedMessages.length; i++) {
    const msg = transformedMessages[i];
    if (compat.requiresAssistantAfterToolResult && lastRole === "toolResult" && msg.role === "user") {
      params.push({
        role: "assistant",
        content: "I have processed the tool results."
      });
    }
    if (msg.role === "system") {
      const addedTools = i > 0 && transcriptTools.anchorsAdditions ? msg.toolsAdded ?? [] : [];
      if (addedTools.length > 0) {
        const kimiToolMessage = {
          role: "system",
          tools: convertTools(addedTools, compat)
        };
        params.push(kimiToolMessage);
      }
      const text = i === 0 ? getSystemMessageText(msg) : renderSystemMessageUpdate(msg);
      if (text.length > 0) {
        params.push({ role: instructionRole, content: sanitizeSurrogates(text) });
      }
    } else if (msg.role === "user") {
      if (typeof msg.content === "string") {
        params.push({
          role: "user",
          content: sanitizeSurrogates(msg.content)
        });
      } else {
        const content = msg.content.filter((item) => item.type !== "text" || item.text.length > 0).map((item) => {
          if (item.type === "text") {
            return {
              type: "text",
              text: sanitizeSurrogates(item.text)
            };
          } else {
            return {
              type: "image_url",
              image_url: {
                url: `data:${item.mimeType};base64,${item.data}`
              }
            };
          }
        });
        if (content.length === 0)
          continue;
        params.push({
          role: "user",
          content
        });
      }
    } else if (msg.role === "assistant") {
      const assistantMsg = {
        role: "assistant",
        content: compat.requiresAssistantAfterToolResult ? "" : null
      };
      const assistantTextParts = msg.content.filter(isTextContentBlock).filter((block) => block.text.trim().length > 0).map((block) => ({
        type: "text",
        text: sanitizeSurrogates(block.text)
      }));
      const assistantText = assistantTextParts.map((part) => part.text).join("");
      const thinkingBlocks = msg.content.filter(isThinkingContentBlock);
      const toolCalls = msg.content.filter(isToolCallBlock);
      const signedReasoningDetails = thinkingBlocks.map((block) => parseOpenAIReasoningDetails(block.thinkingSignature)).find((details) => details !== void 0);
      const legacyReasoningDetails = toolCalls.map((toolCall) => parseLegacyEncryptedReasoningDetail(toolCall.thoughtSignature)).filter((detail) => detail !== void 0);
      const preservedReasoningDetails = signedReasoningDetails ?? (legacyReasoningDetails.length > 0 ? legacyReasoningDetails : void 0);
      const nonEmptyThinkingBlocks = thinkingBlocks.filter((block) => block.thinking.trim().length > 0);
      if (nonEmptyThinkingBlocks.length > 0) {
        if (compat.requiresThinkingAsText) {
          const thinkingText = nonEmptyThinkingBlocks.map((block) => sanitizeSurrogates(block.thinking)).join("\n\n");
          assistantMsg.content = [{ type: "text", text: thinkingText }, ...assistantTextParts];
        } else {
          if (assistantText.length > 0) {
            assistantMsg.content = assistantText;
          }
          if (!preservedReasoningDetails) {
            let signature = nonEmptyThinkingBlocks[0].thinkingSignature;
            if (model.provider === "opencode-go" && signature === "reasoning") {
              signature = "reasoning_content";
            }
            if (signature && isOpenAICompletionsReasoningField(signature)) {
              assistantMsg[signature] = nonEmptyThinkingBlocks.map((block) => block.thinking).join("\n");
            }
          }
        }
      } else if (assistantText.length > 0) {
        assistantMsg.content = assistantText;
      }
      if (toolCalls.length > 0) {
        assistantMsg.tool_calls = toolCalls.map((tc) => {
          var _a3;
          const customInputProperty = (_a3 = options2 == null ? void 0 : options2.grammarToolInputProperties) == null ? void 0 : _a3.get(tc.name);
          if (customInputProperty !== void 0) {
            return {
              id: tc.id,
              type: "custom",
              custom: {
                name: tc.name,
                input: sanitizeSurrogates(getGrammarToolInput(tc.name, tc.arguments, customInputProperty))
              }
            };
          }
          return {
            id: tc.id,
            type: "function",
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments)
            }
          };
        });
      }
      if (preservedReasoningDetails) {
        assistantMsg.reasoning_details = preservedReasoningDetails;
      }
      if (compat.requiresReasoningContentOnAssistantMessages && model.reasoning && assistantMsg.reasoning_content === void 0) {
        assistantMsg.reasoning_content = "";
      }
      const content = assistantMsg.content;
      const hasContent = content !== null && content !== void 0 && (typeof content === "string" ? content.length > 0 : content.length > 0);
      if (!hasContent && !assistantMsg.tool_calls) {
        continue;
      }
      params.push(assistantMsg);
    } else if (msg.role === "toolResult") {
      const imageBlocks = [];
      let j = i;
      for (; j < transformedMessages.length && transformedMessages[j].role === "toolResult"; j++) {
        const toolMsg = transformedMessages[j];
        const textResult = toolMsg.content.filter(isTextContentBlock).map((block) => block.text).join("\n");
        const hasImages = toolMsg.content.some((c) => c.type === "image");
        const hasText = textResult.length > 0;
        const toolResultText = hasText ? textResult : hasImages ? "(see attached image)" : "(no tool output)";
        const toolResultMsg = {
          role: "tool",
          content: sanitizeSurrogates(toolResultText),
          tool_call_id: toolMsg.toolCallId
        };
        if (compat.requiresToolResultName && toolMsg.toolName) {
          toolResultMsg.name = toolMsg.toolName;
        }
        params.push(toolResultMsg);
        if (hasImages && model.input.includes("image")) {
          for (const block of toolMsg.content) {
            if (isImageContentBlock(block)) {
              imageBlocks.push({
                type: "image_url",
                image_url: {
                  url: `data:${block.mimeType};base64,${block.data}`
                }
              });
            }
          }
        }
      }
      i = j - 1;
      if (imageBlocks.length > 0) {
        if (compat.requiresAssistantAfterToolResult) {
          params.push({
            role: "assistant",
            content: "I have processed the tool results."
          });
        }
        params.push({
          role: "user",
          content: [
            {
              type: "text",
              text: "Attached image(s) from tool result:"
            },
            ...imageBlocks
          ]
        });
        lastRole = "user";
      } else {
        lastRole = "toolResult";
      }
      continue;
    }
    lastRole = msg.role;
  }
  return params;
}
function convertTools(tools, compat) {
  return tools.map((tool) => {
    const grammar = resolveGrammarConstrainedSampling(tool, compat.supportsOpenAIGrammarTools);
    if (grammar) {
      return {
        type: "custom",
        custom: {
          name: tool.name,
          description: tool.description,
          format: {
            type: "grammar",
            grammar: {
              syntax: grammar.format,
              definition: grammar.definition
            }
          }
        }
      };
    }
    const strict = resolveJsonSchemaStrictSampling(tool, compat.supportsStrictMode !== false);
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: getJsonSchemaToolParameters(tool, strict),
        // Only include strict if provider supports it. Some reject unknown fields.
        ...compat.supportsStrictMode !== false && { strict: strict ?? false }
      }
    };
  });
}
function parseChunkUsage(rawUsage, model) {
  var _a3, _b2, _c2;
  const promptTokens = rawUsage.prompt_tokens || 0;
  const cacheReadTokens = ((_a3 = rawUsage.prompt_tokens_details) == null ? void 0 : _a3.cached_tokens) ?? rawUsage.prompt_cache_hit_tokens ?? rawUsage.cached_tokens ?? 0;
  const cacheWriteTokens = ((_b2 = rawUsage.prompt_tokens_details) == null ? void 0 : _b2.cache_write_tokens) || 0;
  const input = Math.max(0, promptTokens - cacheReadTokens - cacheWriteTokens);
  const outputTokens = rawUsage.completion_tokens || 0;
  const usage = {
    input,
    output: outputTokens,
    cacheRead: cacheReadTokens,
    cacheWrite: cacheWriteTokens,
    reasoning: ((_c2 = rawUsage.completion_tokens_details) == null ? void 0 : _c2.reasoning_tokens) || 0,
    totalTokens: input + outputTokens + cacheReadTokens + cacheWriteTokens,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }
  };
  calculateCost(model, usage);
  return usage;
}
function mapStopReason(reason) {
  if (reason === null)
    return { stopReason: "stop" };
  switch (reason) {
    case "stop":
    case "end":
      return { stopReason: "stop" };
    case "length":
      return { stopReason: "length" };
    case "function_call":
    case "tool_calls":
      return { stopReason: "toolUse" };
    case "content_filter":
      return { stopReason: "error", errorMessage: "Provider finish_reason: content_filter" };
    case "network_error":
      return { stopReason: "error", errorMessage: "Provider finish_reason: network_error" };
    default:
      return {
        stopReason: "error",
        errorMessage: `Provider finish_reason: ${reason}`
      };
  }
}
function detectCompat(model) {
  const provider = model.provider;
  const baseUrl = model.baseUrl;
  const isZai = provider === "zai" || provider === "zai-coding-cn" || baseUrl.includes("api.z.ai") || baseUrl.includes("open.bigmodel.cn");
  const isTogether = provider === "together" || baseUrl.includes("api.together.ai") || baseUrl.includes("api.together.xyz");
  const isMoonshot = provider === "moonshotai" || provider === "moonshotai-cn" || baseUrl.includes("api.moonshot.");
  const isOpenRouter = provider === "openrouter" || baseUrl.includes("openrouter.ai");
  const isCloudflareWorkersAI = provider === "cloudflare-workers-ai" || baseUrl.includes("api.cloudflare.com");
  const isCloudflareAiGateway = provider === "cloudflare-ai-gateway" || baseUrl.includes("gateway.ai.cloudflare.com");
  const isNvidia = provider === "nvidia" || baseUrl.includes("integrate.api.nvidia.com");
  const isAntLing = provider === "ant-ling" || baseUrl.includes("api.ant-ling.com");
  const isCerebras = provider === "cerebras" || baseUrl.includes("cerebras.ai");
  const isDeepSeek = provider === "deepseek" || baseUrl.toLowerCase().includes("deepseek.com");
  const isNonStandard = isNvidia || isCerebras || provider === "xai" || baseUrl.includes("api.x.ai") || isTogether || baseUrl.includes("chutes.ai") || isDeepSeek || isZai || isMoonshot || provider === "opencode" || baseUrl.includes("opencode.ai") || isCloudflareWorkersAI || isCloudflareAiGateway || isAntLing;
  const useMaxTokens = baseUrl.includes("chutes.ai") || isDeepSeek || isMoonshot || isCloudflareAiGateway || isTogether || isNvidia || isAntLing || isZai;
  const isGrok = provider === "xai" || baseUrl.includes("api.x.ai");
  const isOpenRouterDeveloperRoleModel = isOpenRouter && (model.id.startsWith("anthropic/") || model.id.startsWith("openai/"));
  const cacheControlFormat = provider === "openrouter" && model.id.startsWith("anthropic/") ? "anthropic" : void 0;
  return {
    supportsStore: !isNonStandard,
    supportsDeveloperRole: isOpenRouterDeveloperRoleModel || !isNonStandard && !isOpenRouter,
    supportsReasoningEffort: !isGrok && !isZai && !isMoonshot && !isTogether && !isCloudflareAiGateway && !isNvidia && !isAntLing,
    supportsUsageInStreaming: true,
    supportsFinishReason: true,
    maxTokensField: useMaxTokens ? "max_tokens" : "max_completion_tokens",
    requiresToolResultName: false,
    requiresAssistantAfterToolResult: false,
    requiresThinkingAsText: false,
    requiresReasoningContentOnAssistantMessages: isDeepSeek,
    thinkingFormat: isDeepSeek ? "deepseek" : isZai ? "zai" : isTogether ? "together" : isAntLing ? "ant-ling" : isOpenRouter ? "openrouter" : "openai",
    openRouterRouting: {},
    vercelGatewayRouting: {},
    chatTemplateKwargs: {},
    chatTemplateArgs: {},
    zaiToolStream: false,
    supportsThinkingTokenBudget: false,
    thinkingTokenBudgetField: void 0,
    // OpenAI compatibility alone does not imply strict JSON-schema tool support.
    supportsStrictMode: false,
    supportsOpenAIGrammarTools: false,
    supportsMidConvoSystemMessages: false,
    supportsMidConvoToolAdditions: false,
    cacheControlFormat,
    sendSessionAffinityHeaders: isOpenRouter,
    sessionAffinityFormat: isOpenRouter ? "openrouter" : "openai",
    supportsLongCacheRetention: !(isTogether || isCloudflareWorkersAI || isCloudflareAiGateway || isNvidia || isAntLing)
  };
}
function getCompat(model) {
  const detected = detectCompat(model);
  if (!model.compat)
    return detected;
  return {
    supportsStore: model.compat.supportsStore ?? detected.supportsStore,
    supportsDeveloperRole: model.compat.supportsDeveloperRole ?? detected.supportsDeveloperRole,
    supportsReasoningEffort: model.compat.supportsReasoningEffort ?? detected.supportsReasoningEffort,
    supportsUsageInStreaming: model.compat.supportsUsageInStreaming ?? detected.supportsUsageInStreaming,
    supportsFinishReason: model.compat.supportsFinishReason ?? detected.supportsFinishReason,
    maxTokensField: model.compat.maxTokensField ?? detected.maxTokensField,
    requiresToolResultName: model.compat.requiresToolResultName ?? detected.requiresToolResultName,
    requiresAssistantAfterToolResult: model.compat.requiresAssistantAfterToolResult ?? detected.requiresAssistantAfterToolResult,
    requiresThinkingAsText: model.compat.requiresThinkingAsText ?? detected.requiresThinkingAsText,
    requiresReasoningContentOnAssistantMessages: model.compat.requiresReasoningContentOnAssistantMessages ?? detected.requiresReasoningContentOnAssistantMessages,
    thinkingFormat: model.compat.thinkingFormat ?? detected.thinkingFormat,
    openRouterRouting: model.compat.openRouterRouting ?? {},
    vercelGatewayRouting: model.compat.vercelGatewayRouting ?? detected.vercelGatewayRouting,
    chatTemplateKwargs: model.compat.chatTemplateKwargs ?? detected.chatTemplateKwargs,
    chatTemplateArgs: model.compat.chatTemplateArgs ?? detected.chatTemplateArgs,
    zaiToolStream: model.compat.zaiToolStream ?? detected.zaiToolStream,
    supportsThinkingTokenBudget: model.compat.supportsThinkingTokenBudget ?? detected.supportsThinkingTokenBudget,
    thinkingTokenBudgetField: model.compat.thinkingTokenBudgetField ?? detected.thinkingTokenBudgetField,
    supportsStrictMode: model.compat.supportsStrictMode ?? detected.supportsStrictMode,
    supportsOpenAIGrammarTools: model.compat.supportsOpenAIGrammarTools ?? detected.supportsOpenAIGrammarTools,
    supportsMidConvoSystemMessages: model.compat.supportsMidConvoSystemMessages ?? detected.supportsMidConvoSystemMessages,
    supportsMidConvoToolAdditions: model.compat.supportsMidConvoToolAdditions ?? detected.supportsMidConvoToolAdditions,
    cacheControlFormat: model.compat.cacheControlFormat ?? detected.cacheControlFormat,
    sendSessionAffinityHeaders: model.compat.sendSessionAffinityHeaders ?? detected.sendSessionAffinityHeaders,
    sessionAffinityFormat: model.compat.sessionAffinityFormat ?? detected.sessionAffinityFormat,
    supportsLongCacheRetention: model.compat.supportsLongCacheRetention ?? detected.supportsLongCacheRetention,
    vllmPriority: model.compat.vllmPriority
  };
}
const values$2 = {
  "openai-completions": {
    "chat:glm-4.7": {
      id: "glm-4.7",
      name: "GLM-4.7",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      input: [
        "text"
      ],
      cost: {
        input: 0.6,
        output: 2.2,
        cacheRead: 0.11,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: false,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 204800,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5-turbo": {
      id: "glm-5-turbo",
      name: "GLM-5-Turbo",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      input: [
        "text"
      ],
      cost: {
        input: 1.2,
        output: 4,
        cacheRead: 0.24,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: false,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 2e5,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5.2": {
      id: "glm-5.2",
      name: "GLM-5.2",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: "none",
        minimal: null,
        low: null,
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 1.4,
        output: 4.4,
        cacheRead: 0.26,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5.2-highspeed": {
      id: "glm-5.2-highspeed",
      name: "GLM-5.2 Highspeed",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: "none",
        minimal: null,
        low: null,
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5.3": {
      id: "glm-5.3",
      name: "GLM-5.3",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 1.4,
        output: 4.4,
        cacheRead: 0.26,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5.3-flash": {
      id: "glm-5.3-flash",
      name: "GLM-5.3-Flash",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text",
        "image"
      ],
      cost: {
        input: 0.15,
        output: 0.5,
        cacheRead: 0.03,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      inputLimits: {
        images: {
          resize: {
            maxWidth: 2e3,
            maxHeight: 2e3,
            maxBytes: 4718592,
            jpegQuality: 80
          }
        }
      },
      type: "chat"
    },
    "chat:glm-5.3-highspeed": {
      id: "glm-5.3-highspeed",
      name: "GLM-5.3 Highspeed",
      api: "openai-completions",
      provider: "zai",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    }
  }
};
function flattenModelCatalog(groups, type) {
  return Object.fromEntries(Object.values(groups).flatMap((models) => Object.values(models)).filter((model) => model.type === type).map((model) => [model.id, model]));
}
function flattenChatModelCatalog(_provider, groups) {
  return flattenModelCatalog(groups, "chat");
}
function flattenImageModelCatalog(_provider, groups) {
  return flattenModelCatalog(groups, "image");
}
function flattenClassifierModelCatalog(_provider, groups) {
  return flattenModelCatalog(groups, "classifier");
}
const ZAI_MODELS = flattenChatModelCatalog("zai", values$2);
flattenImageModelCatalog("zai", values$2);
flattenClassifierModelCatalog("zai", values$2);
const values$1 = {
  "openai-completions": {
    "chat:glm-4.6v": {
      id: "glm-4.6v",
      name: "GLM-4.6V",
      api: "openai-completions",
      provider: "zai-coding-cn",
      baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
      reasoning: true,
      input: [
        "text",
        "image"
      ],
      cost: {
        input: 0.3,
        output: 0.9,
        cacheRead: 0,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: false,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 128e3,
      maxTokens: 32768,
      inputLimits: {
        images: {
          resize: {
            maxWidth: 2e3,
            maxHeight: 2e3,
            maxBytes: 4718592,
            jpegQuality: 80
          }
        }
      },
      type: "chat"
    },
    "chat:glm-5.3": {
      id: "glm-5.3",
      name: "GLM-5.3",
      api: "openai-completions",
      provider: "zai-coding-cn",
      baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 1.4,
        output: 4.4,
        cacheRead: 0.26,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    },
    "chat:glm-5.3-flash": {
      id: "glm-5.3-flash",
      name: "GLM-5.3-Flash",
      api: "openai-completions",
      provider: "zai-coding-cn",
      baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text",
        "image"
      ],
      cost: {
        input: 0.15,
        output: 0.5,
        cacheRead: 0.03,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      inputLimits: {
        images: {
          resize: {
            maxWidth: 2e3,
            maxHeight: 2e3,
            maxBytes: 4718592,
            jpegQuality: 80
          }
        }
      },
      type: "chat"
    },
    "chat:glm-5.3-highspeed": {
      id: "glm-5.3-highspeed",
      name: "GLM-5.3 Highspeed",
      api: "openai-completions",
      provider: "zai-coding-cn",
      baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
      reasoning: true,
      thinkingLevelMap: {
        off: null,
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        xhigh: null,
        max: "max"
      },
      input: [
        "text"
      ],
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      },
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai",
        supportsStrictMode: true,
        zaiToolStream: true
      },
      contextWindow: 1e6,
      maxTokens: 131072,
      type: "chat"
    }
  }
};
const ZAI_CODING_CN_MODELS = flattenChatModelCatalog("zai-coding-cn", values$1);
flattenImageModelCatalog("zai-coding-cn", values$1);
flattenClassifierModelCatalog("zai-coding-cn", values$1);
const values = {
  "openai-completions": {
    "chat:deepseek-flash": {
      id: "deepseek-flash",
      name: "DeepSeek V4.1 Flash",
      api: "openai-completions",
      baseUrl: "https://api.deepseek.com",
      provider: "deepseek",
      reasoning: true,
      thinkingLevelMap: {
        minimal: null,
        low: "low",
        medium: null,
        high: "high",
        max: "max"
      },
      input: [
        "text",
        "image"
      ],
      cost: {
        input: 0.3,
        output: 1.2,
        cacheRead: 6e-3,
        cacheWrite: 0
      },
      contextWindow: 1e6,
      maxTokens: 384e3,
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        maxTokensField: "max_tokens",
        requiresReasoningContentOnAssistantMessages: true,
        thinkingFormat: "deepseek",
        supportsStrictMode: true
      },
      inputLimits: {
        images: {
          resize: {
            maxWidth: 2e3,
            maxHeight: 2e3,
            maxBytes: 4718592,
            jpegQuality: 80
          }
        }
      },
      type: "chat"
    },
    "chat:deepseek-v4-pro": {
      id: "deepseek-v4-pro",
      name: "DeepSeek V4 Pro",
      api: "openai-completions",
      baseUrl: "https://api.deepseek.com",
      provider: "deepseek",
      reasoning: true,
      input: [
        "text"
      ],
      cost: {
        input: 1.32,
        output: 3.96,
        cacheRead: 0.044,
        cacheWrite: 0
      },
      contextWindow: 1e6,
      maxTokens: 384e3,
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        maxTokensField: "max_tokens",
        requiresReasoningContentOnAssistantMessages: true,
        thinkingFormat: "deepseek",
        supportsStrictMode: true,
        supportsMidConvoSystemMessages: true
      },
      thinkingLevelMap: {
        minimal: null,
        low: null,
        medium: null,
        high: "high",
        max: "max"
      },
      type: "chat"
    }
  }
};
const DEEPSEEK_MODELS = flattenChatModelCatalog("deepseek", values);
flattenImageModelCatalog("deepseek", values);
flattenClassifierModelCatalog("deepseek", values);
function normalizeBaseUrl(url) {
  return url.replace(/\/chat\/completions\/?$/i, "").replace(/\/+$/, "");
}
function toPiModel(config) {
  let catalogModel;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  if (config.provider === "zhipu") {
    const cnCatalog = ZAI_CODING_CN_MODELS;
    const zaiCatalog = ZAI_MODELS;
    catalogModel = cnCatalog[config.id] ?? zaiCatalog[config.id];
  } else if (config.provider === "DeepSeek") {
    const dsCatalog = DEEPSEEK_MODELS;
    catalogModel = dsCatalog[config.id];
  }
  if (catalogModel) {
    return {
      ...catalogModel,
      name: config.name || catalogModel.name,
      baseUrl
    };
  }
  const isZhipu = config.provider === "zhipu" || baseUrl.includes("bigmodel.cn");
  return {
    id: config.id,
    name: config.name,
    api: "openai-completions",
    provider: config.provider,
    baseUrl,
    reasoning: /glm-(4\.7|5)/.test(config.id),
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: config.maxInputTokens,
    maxTokens: config.maxOutputTokens,
    type: "chat",
    // 智谱非 Coding-Plan 端点对 OpenAI 非标字段容忍度低，显式声明 zai 兼容行为
    ...isZhipu ? {
      compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsReasoningEffort: true,
        maxTokensField: "max_tokens",
        thinkingFormat: "zai"
      }
    } : {}
  };
}
function toPiTool(def) {
  return {
    name: def.function.name,
    description: def.function.description,
    parameters: def.function.parameters
  };
}
const EMPTY_USAGE = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }
};
function toPiMessages(messages, model) {
  const result = [];
  for (const msg of messages) {
    const timestamp = Date.now();
    if (msg.role === "system") continue;
    if (msg.role === "user") {
      const userMsg = { role: "user", content: msg.content, timestamp };
      result.push(userMsg);
      continue;
    }
    if (msg.role === "tool") {
      const toolResult2 = {
        role: "toolResult",
        toolCallId: msg.tool_call_id ?? "",
        toolName: "",
        content: [{ type: "text", text: msg.content }],
        isError: false,
        timestamp
      };
      result.push(toolResult2);
      continue;
    }
    const assistantMsg = {
      role: "assistant",
      content: [{ type: "text", text: msg.content ?? "" }],
      api: "openai-completions",
      provider: model.provider,
      model: model.id,
      usage: EMPTY_USAGE,
      stopReason: "stop",
      timestamp
    };
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        let parsed = {};
        try {
          parsed = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          parsed = { _raw: tc.function.arguments };
        }
        assistantMsg.content.push({
          type: "toolCall",
          id: tc.id,
          name: tc.function.name,
          arguments: parsed
        });
      }
    }
    result.push(assistantMsg);
  }
  return result;
}
function extractSystemPrompt(messages) {
  if (messages.length > 0 && messages[0].role === "system") {
    return { system: messages[0].content, rest: messages.slice(1) };
  }
  return { system: "", rest: messages };
}
async function* chatStreamViaPiAi(messages, modelConfig, tools, signal) {
  var _a3;
  if (!modelConfig.apiKey) {
    throw new Error(
      `模型 ${modelConfig.name || modelConfig.id} 未配置 API Key，请在「设置 → 模型与 API Key」中填写`
    );
  }
  const model = toPiModel(modelConfig);
  const { system, rest } = extractSystemPrompt(messages);
  const piMessages = toPiMessages(rest, model);
  const context = {
    systemPrompt: system || void 0,
    messages: piMessages,
    ...tools && tools.length > 0 && modelConfig.supportsToolCalling ? { tools: tools.map(toPiTool) } : {}
  };
  const eventStream = streamSimple(model, normalizeContext(context), {
    apiKey: modelConfig.apiKey,
    signal
  });
  let sawError = false;
  for await (const event of eventStream) {
    const e = event;
    switch (e.type) {
      case "text_delta":
        if (e.delta) {
          yield { type: "text", content: e.delta };
        }
        break;
      case "toolcall_end":
        yield {
          type: "tool_call",
          toolCall: {
            id: e.toolCall.id,
            name: e.toolCall.name,
            arguments: JSON.stringify(e.toolCall.arguments ?? {})
          }
        };
        break;
      case "error": {
        sawError = true;
        const errMsg = ((_a3 = e.error) == null ? void 0 : _a3.errorMessage) ?? "LLM 流式响应错误";
        throw new Error(`LLM 请求失败: ${errMsg}`);
      }
      case "done":
        yield {
          type: "done",
          finishReason: e.message.stopReason === "toolUse" ? "tool_calls" : "stop"
        };
        return;
    }
  }
  if (!sawError) {
    yield { type: "done", finishReason: "stop" };
  }
}
const MAX_FILE_SIZE = 10 * 1024 * 1024;
function validatePath(workspacePath, targetPath) {
  if (!workspacePath || !targetPath) return false;
  const resolvedWorkspace = path$1.resolve(workspacePath);
  const resolvedTarget = path$1.resolve(targetPath);
  if (resolvedTarget === resolvedWorkspace) return true;
  const prefix = resolvedWorkspace + path$1.sep;
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
  const fullPath = path$1.resolve(context.workspacePath, relPath);
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
  const fullPath = path$1.resolve(context.workspacePath, relPath);
  if (!validatePath(context.workspacePath, fullPath)) {
    return `错误：路径越界，禁止写入工作区外文件：${relPath}`;
  }
  const byteLength = Buffer.byteLength(content, "utf-8");
  if (byteLength > MAX_FILE_SIZE) {
    return `错误：内容过大（${byteLength} bytes），超过 ${MAX_FILE_SIZE} bytes 限制`;
  }
  try {
    const dir = path$1.dirname(fullPath);
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
        "User-Agent": "Mozilla/5.0 (compatible; OpenBudyAgent/1.0; +https://example.com)"
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
  var _a3, _b2, _c2;
  const results = [];
  for (const call of toolCalls) {
    if ((_a3 = context.signal) == null ? void 0 : _a3.aborted) {
      results.push({
        toolCallId: call.id,
        name: call.name,
        output: "任务已取消，工具未执行",
        isError: true
      });
      continue;
    }
    if (call.name === "shell_execute") {
      const cmd = String(((_b2 = call.arguments) == null ? void 0 : _b2.command) ?? "");
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
      const relPath = String(((_c2 = call.arguments) == null ? void 0 : _c2.path) ?? "");
      if (relPath) {
        const fullPath = path$1.resolve(context.workspacePath, relPath);
        if (!validatePath(context.workspacePath, fullPath)) {
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
    modelConfig,
    workspacePath,
    historyMessages,
    signal
  } = params;
  const timer = createTimer(TIMEOUT_MS);
  const systemPrompt = buildAgentSystemPrompt(workspacePath);
  const messages = [
    { role: "system", content: systemPrompt },
    ...historyToLLMMessages(historyMessages),
    { role: "user", content: userMessage }
  ];
  const tools = toolRegistry.getToolDefinitions();
  onEvent(
    emit(taskId, "status_change", {
      status: "running",
      message: "任务开始"
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
      for await (const chunk of chatStreamViaPiAi(messages, modelConfig, tools, signal)) {
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
function resolveModelConfig(params) {
  if (params.modelConfig) {
    return params.modelConfig;
  }
  return void 0;
}
function registerAgentIpc() {
  electron.ipcMain.handle("agent:execute", async (_event, params) => {
    const { taskId, userMessage, workspacePath, historyMessages } = params;
    const modelConfig = resolveModelConfig(params);
    if (!modelConfig) {
      return {
        success: false,
        error: `未找到模型配置（modelId: ${params.modelId ?? "unknown"}），请在设置中检查模型`
      };
    }
    const abortController = new AbortController();
    abortControllers.set(taskId, abortController);
    try {
      await start(
        {
          taskId,
          userMessage,
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
const WORKSPACE_ROOT = path__namespace.join(os__namespace.homedir(), "openbudy-workspace");
function expandHome(p) {
  if (p === "~") return os__namespace.homedir();
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return path__namespace.join(os__namespace.homedir(), p.slice(2));
  }
  return p;
}
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
      const target = expandHome(dirPath);
      await fs__namespace.mkdir(target, { recursive: true }).catch(() => void 0);
      const entries = await fs__namespace.readdir(target, { withFileTypes: true });
      const result = [];
      for (const entry of entries) {
        const fullPath = path__namespace.join(target, entry.name);
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
  electron.ipcMain.handle("file:openPath", async (_event, filePath) => {
    const target = expandHome(filePath);
    const errMsg = await electron.shell.openPath(target);
    if (errMsg) {
      throw new Error(`Failed to open file: ${errMsg}`);
    }
    return true;
  });
  electron.ipcMain.handle("file:openInFolder", async (_event, filePath) => {
    const target = expandHome(filePath);
    try {
      await fs__namespace.access(target);
    } catch {
      throw new Error(`File not found: ${target}`);
    }
    electron.shell.showItemInFolder(target);
    return true;
  });
}
const CONFIG_DIR = path__namespace.join(os__namespace.homedir(), ".openbudy");
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
const devServerUrl = process.env.VITE_DEV_SERVER_URL;
const COMMON_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "img-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "frame-src *",
  "object-src 'none'",
  "base-uri 'self'"
];
function buildCsp() {
  const connectSrc = devServerUrl ? `connect-src 'self' ws: ${devServerUrl} https://cdn.jsdelivr.net` : "connect-src 'self' https://cdn.jsdelivr.net";
  return [...COMMON_CSP, connectSrc].join("; ");
}
function installContentSecurityPolicy() {
  const policy = buildCsp();
  const appOrigin = devServerUrl ? new URL(devServerUrl).origin : null;
  electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isAppDocument = appOrigin ? details.url.startsWith(appOrigin) : details.url.startsWith("file://");
    callback({
      responseHeaders: isAppDocument ? { ...details.responseHeaders, "Content-Security-Policy": [policy] } : details.responseHeaders
    });
  });
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    title: "OpenBudy",
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
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
    mainWindow.loadFile(path$1.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  installContentSecurityPolicy();
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

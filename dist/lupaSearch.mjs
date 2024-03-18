var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { toRaw, isRef, isReactive, toRef, effectScope, ref, markRaw, hasInjectionContext, inject, getCurrentInstance, watch, reactive, nextTick, computed, unref, getCurrentScope, onScopeDispose, toRefs, defineComponent, openBlock, createElementBlock, createElementVNode, normalizeClass, withDirectives, mergeProps, vModelText, toDisplayString, createCommentVNode, onMounted, onBeforeMount, Fragment, renderList, createBlock, toHandlers, withModifiers, resolveDynamicComponent, createVNode, renderSlot, createSlots, withCtx, normalizeProps, guardReactiveProps, onBeforeUnmount, normalizeStyle, createTextVNode, resolveComponent, vModelSelect, h, provide, onUnmounted, cloneVNode } from "vue";
var isVue2 = false;
function set(target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  target[key] = val;
  return val;
}
function del(target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1);
    return;
  }
  delete target[key];
}
function getDevtoolsGlobalHook() {
  return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
  return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
}
const isProxyAvailable = typeof Proxy === "function";
const HOOK_SETUP = "devtools-plugin:setup";
const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
let supported;
let perf;
function isPerformanceSupported() {
  var _a;
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else if (typeof globalThis !== "undefined" && ((_a = globalThis.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
    supported = true;
    perf = globalThis.perf_hooks.performance;
  } else {
    supported = false;
  }
  return supported;
}
function now() {
  return isPerformanceSupported() ? perf.now() : Date.now();
}
class ApiProxy {
  constructor(plugin, hook) {
    this.target = null;
    this.targetQueue = [];
    this.onQueue = [];
    this.plugin = plugin;
    this.hook = hook;
    const defaultSettings = {};
    if (plugin.settings) {
      for (const id in plugin.settings) {
        const item = plugin.settings[id];
        defaultSettings[id] = item.defaultValue;
      }
    }
    const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
    let currentSettings = Object.assign({}, defaultSettings);
    try {
      const raw = localStorage.getItem(localSettingsSaveId);
      const data = JSON.parse(raw);
      Object.assign(currentSettings, data);
    } catch (e) {
    }
    this.fallbacks = {
      getSettings() {
        return currentSettings;
      },
      setSettings(value) {
        try {
          localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
        } catch (e) {
        }
        currentSettings = value;
      },
      now() {
        return now();
      }
    };
    if (hook) {
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
    }
    this.proxiedOn = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target.on[prop];
        } else {
          return (...args) => {
            this.onQueue.push({
              method: prop,
              args
            });
          };
        }
      }
    });
    this.proxiedTarget = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target[prop];
        } else if (prop === "on") {
          return this.proxiedOn;
        } else if (Object.keys(this.fallbacks).includes(prop)) {
          return (...args) => {
            this.targetQueue.push({
              method: prop,
              args,
              resolve: () => {
              }
            });
            return this.fallbacks[prop](...args);
          };
        } else {
          return (...args) => {
            return new Promise((resolve) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve
              });
            });
          };
        }
      }
    });
  }
  setRealTarget(target) {
    return __async(this, null, function* () {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(yield this.target[item.method](...item.args));
      }
    });
  }
}
function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
  const descriptor = pluginDescriptor;
  const target = getTarget();
  const hook = getDevtoolsGlobalHook();
  const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
  } else {
    const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
    list.push({
      pluginDescriptor: descriptor,
      setupFn,
      proxy
    });
    if (proxy) {
      setupFn(proxy.proxiedTarget);
    }
  }
}
/*!
 * pinia v2.1.7
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia) => activePinia = pinia;
const piniaSymbol = process.env.NODE_ENV !== "production" ? Symbol("pinia") : (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
const IS_CLIENT = typeof window !== "undefined";
const USE_DEVTOOLS = (process.env.NODE_ENV !== "production" || false) && !(process.env.NODE_ENV === "test") && IS_CLIENT;
const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
function bom(blob, { autoBom = false } = {}) {
  if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
  }
  return blob;
}
function download(url, name, opts) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.onload = function() {
    saveAs(xhr.response, name, opts);
  };
  xhr.onerror = function() {
    console.error("could not download file");
  };
  xhr.send();
}
function corsEnabled(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("HEAD", url, false);
  try {
    xhr.send();
  } catch (e) {
  }
  return xhr.status >= 200 && xhr.status <= 299;
}
function click(node) {
  try {
    node.dispatchEvent(new MouseEvent("click"));
  } catch (e) {
    const evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  }
}
const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
const saveAs = !IS_CLIENT ? () => {
} : (
  // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
  typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
    // Use msSaveOrOpenBlob as a second approach
    "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
      // Fallback to using FileReader and a popup
      fileSaverSaveAs
    )
  )
);
function downloadSaveAs(blob, name = "download", opts) {
  const a = document.createElement("a");
  a.download = name;
  a.rel = "noopener";
  if (typeof blob === "string") {
    a.href = blob;
    if (a.origin !== location.origin) {
      if (corsEnabled(a.href)) {
        download(blob, name, opts);
      } else {
        a.target = "_blank";
        click(a);
      }
    } else {
      click(a);
    }
  } else {
    a.href = URL.createObjectURL(blob);
    setTimeout(function() {
      URL.revokeObjectURL(a.href);
    }, 4e4);
    setTimeout(function() {
      click(a);
    }, 0);
  }
}
function msSaveAs(blob, name = "download", opts) {
  if (typeof blob === "string") {
    if (corsEnabled(blob)) {
      download(blob, name, opts);
    } else {
      const a = document.createElement("a");
      a.href = blob;
      a.target = "_blank";
      setTimeout(function() {
        click(a);
      });
    }
  } else {
    navigator.msSaveOrOpenBlob(bom(blob, opts), name);
  }
}
function fileSaverSaveAs(blob, name, opts, popup) {
  popup = popup || open("", "_blank");
  if (popup) {
    popup.document.title = popup.document.body.innerText = "downloading...";
  }
  if (typeof blob === "string")
    return download(blob, name, opts);
  const force = blob.type === "application/octet-stream";
  const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
  const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
  if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
    const reader = new FileReader();
    reader.onloadend = function() {
      let url = reader.result;
      if (typeof url !== "string") {
        popup = null;
        throw new Error("Wrong reader.result type");
      }
      url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
      if (popup) {
        popup.location.href = url;
      } else {
        location.assign(url);
      }
      popup = null;
    };
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    if (popup)
      popup.location.assign(url);
    else
      location.href = url;
    popup = null;
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 4e4);
  }
}
function toastMessage(message, type) {
  const piniaMessage = "🍍 " + message;
  if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
    __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
  } else if (type === "error") {
    console.error(piniaMessage);
  } else if (type === "warn") {
    console.warn(piniaMessage);
  } else {
    console.log(piniaMessage);
  }
}
function isPinia(o) {
  return "_a" in o && "install" in o;
}
function checkClipboardAccess() {
  if (!("clipboard" in navigator)) {
    toastMessage(`Your browser doesn't support the Clipboard API`, "error");
    return true;
  }
}
function checkNotFocusedError(error) {
  if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
    toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
    return true;
  }
  return false;
}
function actionGlobalCopyState(pinia) {
  return __async(this, null, function* () {
    if (checkClipboardAccess())
      return;
    try {
      yield navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  });
}
function actionGlobalPasteState(pinia) {
  return __async(this, null, function* () {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(yield navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  });
}
function actionGlobalSaveState(pinia) {
  return __async(this, null, function* () {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  });
}
let fileInput;
function getFileOpener() {
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
  }
  function openFile() {
    return new Promise((resolve, reject) => {
      fileInput.onchange = () => __async(this, null, function* () {
        const files = fileInput.files;
        if (!files)
          return resolve(null);
        const file = files.item(0);
        if (!file)
          return resolve(null);
        return resolve({ text: yield file.text(), file });
      });
      fileInput.oncancel = () => resolve(null);
      fileInput.onerror = reject;
      fileInput.click();
    });
  }
  return openFile;
}
function actionGlobalOpenStateFile(pinia) {
  return __async(this, null, function* () {
    try {
      const open2 = getFileOpener();
      const result = yield open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  });
}
function loadStoresState(pinia, state) {
  for (const key in state) {
    const storeState = pinia.state.value[key];
    if (storeState) {
      Object.assign(storeState, state[key]);
    } else {
      pinia.state.value[key] = state[key];
    }
  }
}
function formatDisplay(display) {
  return {
    _custom: {
      display
    }
  };
}
const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
const PINIA_ROOT_ID = "_root";
function formatStoreForInspectorTree(store) {
  return isPinia(store) ? {
    id: PINIA_ROOT_ID,
    label: PINIA_ROOT_LABEL
  } : {
    id: store.$id,
    label: store.$id
  };
}
function formatStoreForInspectorState(store) {
  if (isPinia(store)) {
    const storeNames = Array.from(store._s.keys());
    const storeMap = store._s;
    const state2 = {
      state: storeNames.map((storeId) => ({
        editable: true,
        key: storeId,
        value: store.state.value[storeId]
      })),
      getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
        const store2 = storeMap.get(id);
        return {
          editable: false,
          key: id,
          value: store2._getters.reduce((getters, key) => {
            getters[key] = store2[key];
            return getters;
          }, {})
        };
      })
    };
    return state2;
  }
  const state = {
    state: Object.keys(store.$state).map((key) => ({
      editable: true,
      key,
      value: store.$state[key]
    }))
  };
  if (store._getters && store._getters.length) {
    state.getters = store._getters.map((getterName) => ({
      editable: false,
      key: getterName,
      value: store[getterName]
    }));
  }
  if (store._customProperties.size) {
    state.customProperties = Array.from(store._customProperties).map((key) => ({
      editable: true,
      key,
      value: store[key]
    }));
  }
  return state;
}
function formatEventData(events) {
  if (!events)
    return {};
  if (Array.isArray(events)) {
    return events.reduce((data, event) => {
      data.keys.push(event.key);
      data.operations.push(event.type);
      data.oldValue[event.key] = event.oldValue;
      data.newValue[event.key] = event.newValue;
      return data;
    }, {
      oldValue: {},
      keys: [],
      operations: [],
      newValue: {}
    });
  } else {
    return {
      operation: formatDisplay(events.type),
      key: formatDisplay(events.key),
      oldValue: events.oldValue,
      newValue: events.newValue
    };
  }
}
function formatMutationType(type) {
  switch (type) {
    case MutationType.direct:
      return "mutation";
    case MutationType.patchFunction:
      return "$patch";
    case MutationType.patchObject:
      return "$patch";
    default:
      return "unknown";
  }
}
let isTimelineActive = true;
const componentStateTypes = [];
const MUTATIONS_LAYER_ID = "pinia:mutations";
const INSPECTOR_ID = "pinia";
const { assign: assign$1 } = Object;
const getStoreType = (id) => "🍍 " + id;
function registerPiniaDevtools(app, pinia) {
  setupDevtoolsPlugin({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes,
    app
  }, (api) => {
    if (typeof api.now !== "function") {
      toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
    }
    api.addTimelineLayer({
      id: MUTATIONS_LAYER_ID,
      label: `Pinia 🍍`,
      color: 15064968
    });
    api.addInspector({
      id: INSPECTOR_ID,
      label: "Pinia 🍍",
      icon: "storage",
      treeFilterPlaceholder: "Search stores",
      actions: [
        {
          icon: "content_copy",
          action: () => {
            actionGlobalCopyState(pinia);
          },
          tooltip: "Serialize and copy the state"
        },
        {
          icon: "content_paste",
          action: () => __async(this, null, function* () {
            yield actionGlobalPasteState(pinia);
            api.sendInspectorTree(INSPECTOR_ID);
            api.sendInspectorState(INSPECTOR_ID);
          }),
          tooltip: "Replace the state with the content of your clipboard"
        },
        {
          icon: "save",
          action: () => {
            actionGlobalSaveState(pinia);
          },
          tooltip: "Save the state as a JSON file"
        },
        {
          icon: "folder_open",
          action: () => __async(this, null, function* () {
            yield actionGlobalOpenStateFile(pinia);
            api.sendInspectorTree(INSPECTOR_ID);
            api.sendInspectorState(INSPECTOR_ID);
          }),
          tooltip: "Import the state from a JSON file"
        }
      ],
      nodeActions: [
        {
          icon: "restore",
          tooltip: 'Reset the state (with "$reset")',
          action: (nodeId) => {
            const store = pinia._s.get(nodeId);
            if (!store) {
              toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
            } else if (typeof store.$reset !== "function") {
              toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
            } else {
              store.$reset();
              toastMessage(`Store "${nodeId}" reset.`);
            }
          }
        }
      ]
    });
    api.on.inspectComponent((payload, ctx) => {
      const proxy = payload.componentInstance && payload.componentInstance.proxy;
      if (proxy && proxy._pStores) {
        const piniaStores = payload.componentInstance.proxy._pStores;
        Object.values(piniaStores).forEach((store) => {
          payload.instanceData.state.push({
            type: getStoreType(store.$id),
            key: "state",
            editable: true,
            value: store._isOptionsAPI ? {
              _custom: {
                value: toRaw(store.$state),
                actions: [
                  {
                    icon: "restore",
                    tooltip: "Reset the state of this store",
                    action: () => store.$reset()
                  }
                ]
              }
            } : (
              // NOTE: workaround to unwrap transferred refs
              Object.keys(store.$state).reduce((state, key) => {
                state[key] = store.$state[key];
                return state;
              }, {})
            )
          });
          if (store._getters && store._getters.length) {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "getters",
              editable: false,
              value: store._getters.reduce((getters, key) => {
                try {
                  getters[key] = store[key];
                } catch (error) {
                  getters[key] = error;
                }
                return getters;
              }, {})
            });
          }
        });
      }
    });
    api.on.getInspectorTree((payload) => {
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        let stores = [pinia];
        stores = stores.concat(Array.from(pinia._s.values()));
        payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
      }
    });
    api.on.getInspectorState((payload) => {
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
        if (!inspectedStore) {
          return;
        }
        if (inspectedStore) {
          payload.state = formatStoreForInspectorState(inspectedStore);
        }
      }
    });
    api.on.editInspectorState((payload, ctx) => {
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
        if (!inspectedStore) {
          return toastMessage(`store "${payload.nodeId}" not found`, "error");
        }
        const { path } = payload;
        if (!isPinia(inspectedStore)) {
          if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
            path.unshift("$state");
          }
        } else {
          path.unshift("state");
        }
        isTimelineActive = false;
        payload.set(inspectedStore, path, payload.state.value);
        isTimelineActive = true;
      }
    });
    api.on.editComponentState((payload) => {
      if (payload.type.startsWith("🍍")) {
        const storeId = payload.type.replace(/^🍍\s*/, "");
        const store = pinia._s.get(storeId);
        if (!store) {
          return toastMessage(`store "${storeId}" not found`, "error");
        }
        const { path } = payload;
        if (path[0] !== "state") {
          return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
        }
        path[0] = "$state";
        isTimelineActive = false;
        payload.set(store, path, payload.state.value);
        isTimelineActive = true;
      }
    });
  });
}
function addStoreToDevtools(app, store) {
  if (!componentStateTypes.includes(getStoreType(store.$id))) {
    componentStateTypes.push(getStoreType(store.$id));
  }
  setupDevtoolsPlugin({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes,
    app,
    settings: {
      logStoreChanges: {
        label: "Notify about new/deleted stores",
        type: "boolean",
        defaultValue: true
      }
      // useEmojis: {
      //   label: 'Use emojis in messages ⚡️',
      //   type: 'boolean',
      //   defaultValue: true,
      // },
    }
  }, (api) => {
    const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
    store.$onAction(({ after, onError, name, args }) => {
      const groupId = runningActionId++;
      api.addTimelineEvent({
        layerId: MUTATIONS_LAYER_ID,
        event: {
          time: now2(),
          title: "🛫 " + name,
          subtitle: "start",
          data: {
            store: formatDisplay(store.$id),
            action: formatDisplay(name),
            args
          },
          groupId
        }
      });
      after((result) => {
        activeAction = void 0;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛬 " + name,
            subtitle: "end",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args,
              result
            },
            groupId
          }
        });
      });
      onError((error) => {
        activeAction = void 0;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            logType: "error",
            title: "💥 " + name,
            subtitle: "end",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args,
              error
            },
            groupId
          }
        });
      });
    }, true);
    store._customProperties.forEach((name) => {
      watch(() => unref(store[name]), (newValue, oldValue) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (isTimelineActive) {
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "Change",
              subtitle: name,
              data: {
                newValue,
                oldValue
              },
              groupId: activeAction
            }
          });
        }
      }, { deep: true });
    });
    store.$subscribe(({ events, type }, state) => {
      api.notifyComponentUpdate();
      api.sendInspectorState(INSPECTOR_ID);
      if (!isTimelineActive)
        return;
      const eventData = {
        time: now2(),
        title: formatMutationType(type),
        data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
        groupId: activeAction
      };
      if (type === MutationType.patchFunction) {
        eventData.subtitle = "⤵️";
      } else if (type === MutationType.patchObject) {
        eventData.subtitle = "🧩";
      } else if (events && !Array.isArray(events)) {
        eventData.subtitle = events.type;
      }
      if (events) {
        eventData.data["rawEvent(s)"] = {
          _custom: {
            display: "DebuggerEvent",
            type: "object",
            tooltip: "raw DebuggerEvent[]",
            value: events
          }
        };
      }
      api.addTimelineEvent({
        layerId: MUTATIONS_LAYER_ID,
        event: eventData
      });
    }, { detached: true, flush: "sync" });
    const hotUpdate = store._hotUpdate;
    store._hotUpdate = markRaw((newStore) => {
      hotUpdate(newStore);
      api.addTimelineEvent({
        layerId: MUTATIONS_LAYER_ID,
        event: {
          time: now2(),
          title: "🔥 " + store.$id,
          subtitle: "HMR update",
          data: {
            store: formatDisplay(store.$id),
            info: formatDisplay(`HMR update`)
          }
        }
      });
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
    });
    const { $dispose } = store;
    store.$dispose = () => {
      $dispose();
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
    };
    api.notifyComponentUpdate();
    api.sendInspectorTree(INSPECTOR_ID);
    api.sendInspectorState(INSPECTOR_ID);
    api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
  });
}
let runningActionId = 0;
let activeAction;
function patchActionForGrouping(store, actionNames, wrapWithProxy) {
  const actions = actionNames.reduce((storeActions, actionName) => {
    storeActions[actionName] = toRaw(store)[actionName];
    return storeActions;
  }, {});
  for (const actionName in actions) {
    store[actionName] = function() {
      const _actionId = runningActionId;
      const trackedStore = wrapWithProxy ? new Proxy(store, {
        get(...args) {
          activeAction = _actionId;
          return Reflect.get(...args);
        },
        set(...args) {
          activeAction = _actionId;
          return Reflect.set(...args);
        }
      }) : store;
      activeAction = _actionId;
      const retValue = actions[actionName].apply(trackedStore, arguments);
      activeAction = void 0;
      return retValue;
    };
  }
}
function devtoolsPlugin({ app, store, options }) {
  if (store.$id.startsWith("__hot:")) {
    return;
  }
  store._isOptionsAPI = !!options.state;
  patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
  const originalHotUpdate = store._hotUpdate;
  toRaw(store)._hotUpdate = function(newStore) {
    originalHotUpdate.apply(this, arguments);
    patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
  };
  addStoreToDevtools(
    app,
    // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
    store
  );
}
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        if (USE_DEVTOOLS) {
          registerPiniaDevtools(app, pinia);
        }
        toBeInstalled.forEach((plugin) => _p.push(plugin));
        toBeInstalled = [];
      }
    },
    use(plugin) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
    pinia.use(devtoolsPlugin);
  }
  return pinia;
}
function patchObject(newState, oldState) {
  for (const key in oldState) {
    const subPatch = oldState[key];
    if (!(key in newState)) {
      continue;
    }
    const targetValue = newState[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && !isRef(subPatch) && !isReactive(subPatch)) {
      newState[key] = patchObject(targetValue, subPatch);
    } else {
      {
        newState[key] = subPatch;
      }
    }
  }
  return newState;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = process.env.NODE_ENV !== "production" ? Symbol("pinia:skipHydration") : (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia.state.value[id];
  let store;
  function setup() {
    if (!initialState && (!(process.env.NODE_ENV !== "production") || !hot)) {
      {
        pinia.state.value[id] = state ? state() : {};
      }
    }
    const localState = process.env.NODE_ENV !== "production" && hot ? (
      // use ref() to unwrap refs inside state TODO: check if this is still necessary
      toRefs(ref(state ? state() : {}).value)
    ) : toRefs(pinia.state.value[id]);
    return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      if (process.env.NODE_ENV !== "production" && name in localState) {
        console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
      }
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia);
        const store2 = pinia._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign({ actions: {} }, options);
  if (process.env.NODE_ENV !== "production" && !pinia._e.active) {
    throw new Error("Pinia destroyed");
  }
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  if (process.env.NODE_ENV !== "production" && !isVue2) {
    $subscribeOptions.onTrigger = (event) => {
      if (isListening) {
        debuggerEvents = event;
      } else if (isListening == false && !store._hotUpdating) {
        if (Array.isArray(debuggerEvents)) {
          debuggerEvents.push(event);
        } else {
          console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
        }
      }
    };
  }
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia.state.value[$id];
  if (!isOptionsStore && !initialState && (!(process.env.NODE_ENV !== "production") || !hot)) {
    {
      pinia.state.value[$id] = {};
    }
  }
  const hotState = ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (process.env.NODE_ENV !== "production") {
      debuggerEvents = [];
    }
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign($state, newState);
    });
  } : (
    /* istanbul ignore next */
    process.env.NODE_ENV !== "production" ? () => {
      throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
    } : noop
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const _hmrPayload = /* @__PURE__ */ markRaw({
    actions: {},
    getters: {},
    state: [],
    hotState
  });
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(process.env.NODE_ENV !== "production" || USE_DEVTOOLS ? assign(
    {
      _hmrPayload,
      _customProperties: markRaw(/* @__PURE__ */ new Set())
      // devtools custom properties
    },
    partialStore
    // must be added later
    // setupStore
  ) : partialStore);
  pinia._s.set($id, store);
  const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia._e.run(() => (scope = effectScope()).run(setup)));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (process.env.NODE_ENV !== "production" && hot) {
        set(hotState.value, key, toRef(setupStore, key));
      } else if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia.state.value[$id][key] = prop;
        }
      }
      if (process.env.NODE_ENV !== "production") {
        _hmrPayload.state.push(key);
      }
    } else if (typeof prop === "function") {
      const actionValue = process.env.NODE_ENV !== "production" && hot ? prop : wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      if (process.env.NODE_ENV !== "production") {
        _hmrPayload.actions[key] = prop;
      }
      optionsForPlugin.actions[key] = prop;
    } else if (process.env.NODE_ENV !== "production") {
      if (isComputed(prop)) {
        _hmrPayload.getters[key] = isOptionsStore ? (
          // @ts-expect-error
          options.getters[key]
        ) : prop;
        if (IS_CLIENT) {
          const getters = setupStore._getters || // @ts-expect-error: same
          (setupStore._getters = markRaw([]));
          getters.push(key);
        }
      }
    }
  }
  {
    assign(store, setupStore);
    assign(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => process.env.NODE_ENV !== "production" && hot ? hotState.value : pinia.state.value[$id],
    set: (state) => {
      if (process.env.NODE_ENV !== "production" && hot) {
        throw new Error("cannot set hotState");
      }
      $patch(($state) => {
        assign($state, state);
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    store._hotUpdate = markRaw((newStore) => {
      store._hotUpdating = true;
      newStore._hmrPayload.state.forEach((stateKey) => {
        if (stateKey in store.$state) {
          const newStateTarget = newStore.$state[stateKey];
          const oldStateSource = store.$state[stateKey];
          if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
            patchObject(newStateTarget, oldStateSource);
          } else {
            newStore.$state[stateKey] = oldStateSource;
          }
        }
        set(store, stateKey, toRef(newStore.$state, stateKey));
      });
      Object.keys(store.$state).forEach((stateKey) => {
        if (!(stateKey in newStore.$state)) {
          del(store, stateKey);
        }
      });
      isListening = false;
      isSyncListening = false;
      pinia.state.value[$id] = toRef(newStore._hmrPayload, "hotState");
      isSyncListening = true;
      nextTick().then(() => {
        isListening = true;
      });
      for (const actionName in newStore._hmrPayload.actions) {
        const action = newStore[actionName];
        set(store, actionName, wrapAction(actionName, action));
      }
      for (const getterName in newStore._hmrPayload.getters) {
        const getter = newStore._hmrPayload.getters[getterName];
        const getterValue = isOptionsStore ? (
          // special handling of options api
          computed(() => {
            setActivePinia(pinia);
            return getter.call(store, store);
          })
        ) : getter;
        set(store, getterName, getterValue);
      }
      Object.keys(store._hmrPayload.getters).forEach((key) => {
        if (!(key in newStore._hmrPayload.getters)) {
          del(store, key);
        }
      });
      Object.keys(store._hmrPayload.actions).forEach((key) => {
        if (!(key in newStore._hmrPayload.actions)) {
          del(store, key);
        }
      });
      store._hmrPayload = newStore._hmrPayload;
      store._getters = newStore._getters;
      store._hotUpdating = false;
    });
  }
  if (USE_DEVTOOLS) {
    const nonEnumerable = {
      writable: true,
      configurable: true,
      // avoid warning on devtools trying to display this property
      enumerable: false
    };
    ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
      Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
    });
  }
  pinia._p.forEach((extender) => {
    if (USE_DEVTOOLS) {
      const extensions = scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      }));
      Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
      assign(store, extensions);
    } else {
      assign(store, scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })));
    }
  });
  if (process.env.NODE_ENV !== "production" && store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
    console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
  }
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
    if (process.env.NODE_ENV !== "production" && typeof id !== "string") {
      throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
    }
  }
  function useStore(pinia, hot) {
    const hasContext = hasInjectionContext();
    pinia = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    (process.env.NODE_ENV === "test" && activePinia && activePinia._testing ? null : pinia) || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia)
      setActivePinia(pinia);
    if (process.env.NODE_ENV !== "production" && !activePinia) {
      throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
    }
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
      if (process.env.NODE_ENV !== "production") {
        useStore._pinia = pinia;
      }
    }
    const store = pinia._s.get(id);
    if (process.env.NODE_ENV !== "production" && hot) {
      const hotId = "__hot:" + id;
      const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
      hot._hotUpdate(newStore);
      delete pinia.state.value[hotId];
      pinia._s.delete(hotId);
    }
    if (process.env.NODE_ENV !== "production" && IS_CLIENT) {
      const currentInstance = getCurrentInstance();
      if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
      !hot) {
        const vm = currentInstance.proxy;
        const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
        cache[id] = store;
      }
    }
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function storeToRefs(store) {
  {
    store = toRaw(store);
    const refs = {};
    for (const key in store) {
      const value = store[key];
      if (isRef(value) || isReactive(value)) {
        refs[key] = // ---
        toRef(store, key);
      }
    }
    return refs;
  }
}
const HISTORY_LOCAL_STORAGE_KEY = "LUPA_HISTORY";
const TRACKING_STORAGE_KEY = "LUPA_STATS";
const TRACKING_STORAGE_KEY_BASE = "LUPA_STATS_BASE";
const TRACKING_ANALYTICS_KEY = "LUPA_ANALYTICS";
const TRACKING_KEY_LENGTH = 10;
const HISTORY_MAX_ITEMS = 7;
const S_MIN_WIDTH = 575;
const MD_MIN_WIDTH = 767;
const L_MIN_WIDTH = 991;
const XL_MIN_WIDTH = 1199;
const MAX_FACET_VALUES = 5e3;
const CURRENCY_KEY_INDICATOR = "price";
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_PAGE_SIZE_SELECTION = [12, 24, 36, 60];
const LUPA_ROUTING_EVENT = "lupaRedirect";
const RESULT_ROOT_SELECTOR = "#lupa-search-results";
const production = "https://api.lupasearch.com/v1/";
const staging = "https://api.staging.lupasearch.com/v1/";
const Env$1 = {
  production,
  staging
};
const getApiUrl$1 = (environment, customBaseUrl) => {
  if (customBaseUrl) {
    return customBaseUrl;
  }
  return Env$1[environment] || Env$1["production"];
};
var __awaiter = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const defaultConfig$1 = {
  method: "POST",
  headers: { "Content-Type": "application/json" }
};
const customRequestConfig = ({ customHeaders }) => {
  return {
    method: defaultConfig$1.method,
    headers: Object.assign(Object.assign({}, defaultConfig$1.headers), customHeaders !== null && customHeaders !== void 0 ? customHeaders : {})
  };
};
const searchCustom = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
  var _a;
  const res = yield fetch(options.customUrl, Object.assign(Object.assign({}, customRequestConfig({ customHeaders: options.customHeaders })), { body: JSON.stringify(Object.assign({ publicQuery: query }, (_a = options.customPayload) !== null && _a !== void 0 ? _a : {})) }));
  if (res.status < 400) {
    const data = yield res.json();
    return Object.assign(Object.assign({}, data), { success: true });
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const suggestCustom = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
  var _b;
  const res = yield fetch(options.customUrl, Object.assign(Object.assign({}, customRequestConfig({ customHeaders: options.customHeaders })), { body: JSON.stringify(Object.assign({ publicQuery: query }, (_b = options.customPayload) !== null && _b !== void 0 ? _b : {})) }));
  if (res.status < 400) {
    const items = yield res.json();
    return { items, success: true };
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const search = (queryKey, query, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}query/${queryKey}`, Object.assign(Object.assign({}, defaultConfig$1), { body: JSON.stringify(query) }));
  if (res.status < 400) {
    const data = yield res.json();
    return Object.assign(Object.assign({}, data), { success: true });
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const queryByIds = (queryKey, ids, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  const idParam = ids.map((id) => `ids=${id}`).join("&");
  const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}query/${queryKey}/ids?${idParam}`, Object.assign(Object.assign({}, defaultConfig$1), { method: "GET" }));
  if (res.status < 400) {
    const data = yield res.json();
    return Object.assign(Object.assign({}, data), { success: true });
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const recommend = (queryKey, recommendForId, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}recommendations/document/${recommendForId}?queryKey=${queryKey}`, Object.assign(Object.assign({}, defaultConfig$1), { method: "GET" }));
  if (res.status < 400) {
    const data = yield res.json();
    return Object.assign(Object.assign({}, data), { success: true });
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const suggest = (queryKey, query, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}query/${queryKey}`, Object.assign(Object.assign({}, defaultConfig$1), { body: JSON.stringify(query) }));
  if (res.status < 400) {
    const items = yield res.json();
    return { items, success: true };
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const track$1 = (queryKey, event, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}events`, Object.assign(Object.assign({}, defaultConfig$1), { body: JSON.stringify(Object.assign({ queryKey }, event)) }));
    if (res.status < 400) {
      return { success: false };
    }
    return res.json();
  } catch (e) {
    return { success: false };
  }
});
const loadRedirectionRules = (queryKey, environment, customBaseUrl) => __awaiter(void 0, void 0, void 0, function* () {
  const res = yield fetch(`${getApiUrl$1(environment, customBaseUrl)}redirections/${queryKey}`, Object.assign(Object.assign({}, defaultConfig$1), { method: "GET" }));
  if (res.status < 400) {
    return res.json();
  }
  const errors = yield res.json();
  return { success: false, errors };
});
const LupaSearchSdk = {
  query: (queryKey, publicQuery, options = null) => {
    if (options === null || options === void 0 ? void 0 : options.customUrl) {
      return searchCustom(publicQuery, options);
    }
    return search(queryKey, publicQuery, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  },
  suggestions: (queryKey, suggestionQuery, options = null) => {
    if (options === null || options === void 0 ? void 0 : options.customUrl) {
      return suggestCustom(suggestionQuery, options);
    }
    return suggest(queryKey, suggestionQuery, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  },
  track: (queryKey, eventData, options = null) => {
    return track$1(queryKey, eventData, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  },
  recommend: (queryKey, recommendForId, options = null) => {
    return recommend(queryKey, recommendForId, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  },
  queryByIds: (queryKey, ids, options = null) => {
    return queryByIds(queryKey, ids, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  },
  loadRedirectionRules: (queryKey, options = null) => {
    return loadRedirectionRules(queryKey, (options === null || options === void 0 ? void 0 : options.environment) || "production", options === null || options === void 0 ? void 0 : options.customBaseUrl);
  }
};
const getNormalizedString = (str) => {
  if (!str) {
    return "";
  }
  const transformedStr = typeof str === "string" ? str : str.toString();
  return transformedStr.normalize === void 0 ? transformedStr.toLocaleLowerCase() : transformedStr.toLocaleLowerCase().normalize("NFKD").replace(/[^\w\s.-_/]/g, "");
};
const capitalize = (str) => {
  if (!str) {
    return "";
  }
  return str[0].toLocaleUpperCase() + str.slice(1);
};
const addParamsToLabel = (label, ...params) => {
  if (!params || params.length < 1) {
    return label;
  }
  const paramKeys = Array.from(Array(params.length).keys());
  return paramKeys.reduce((a, c) => a.replace(`{${c + 1}}`, params[c]), label);
};
const getRandomString = (length) => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
const toFixedIfNecessary = (value, precision = 2) => {
  return (+parseFloat(value).toFixed(precision)).toString();
};
const getDisplayValue = (value) => {
  if (value === void 0) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return toFixedIfNecessary(value.toString());
};
const getProductKey = (index, product, idKey) => {
  if (!idKey) {
    return index;
  }
  if (product[idKey]) {
    return product[idKey];
  }
  return index;
};
const normalizeFloat = (value) => {
  var _a;
  if (!value) {
    return 0;
  }
  return +((_a = value == null ? void 0 : value.replace(/[^0-9,.]/g, "")) == null ? void 0 : _a.replace(",", "."));
};
const escapeHtml = (value) => {
  if (!value) {
    return "";
  }
  let output = "";
  let isSkip = false;
  value.split(/(<del>.*?<\/del>)/g).forEach((segment) => {
    if (segment.startsWith("<del>") && segment.endsWith("</del>")) {
      output += segment;
      isSkip = true;
    }
    if (!isSkip) {
      output += segment.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    if (isSkip) {
      isSkip = false;
    }
  });
  return output;
};
const inputsAreEqual = (input, possibleValues) => {
  if (!input) {
    return false;
  }
  const normalizedInput = getNormalizedString(input);
  return possibleValues.some((v) => getNormalizedString(v) === normalizedInput);
};
const levenshteinDistance = (s = "", t = "") => {
  if (!(s == null ? void 0 : s.length)) {
    return t.length;
  }
  if (!(t == null ? void 0 : t.length)) {
    return s.length;
  }
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] = i === 0 ? j : Math.min(
        arr[i - 1][j] + 1,
        arr[i][j - 1] + 1,
        arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
      );
    }
  }
  return arr[t.length][s.length];
};
const findClosestStringValue = (input, possibleValues, key) => {
  var _a;
  const directMatch = possibleValues.find((v) => v[key] === input);
  if (directMatch) {
    return directMatch;
  }
  const distances = possibleValues.map((v) => levenshteinDistance(`${v[key]}`, input));
  const minDistance = Math.min(...distances);
  const closestValue = (_a = possibleValues.filter((_, i) => distances[i] === minDistance)) == null ? void 0 : _a[0];
  return closestValue;
};
const initAnalyticsTracking = (analyticsOptions) => {
  try {
    if (analyticsOptions == null ? void 0 : analyticsOptions.enabled) {
      window.sessionStorage.setItem(TRACKING_ANALYTICS_KEY, JSON.stringify(analyticsOptions));
    } else {
      window.sessionStorage.removeItem(TRACKING_ANALYTICS_KEY);
    }
  } catch (e) {
  }
};
const initBaseTracking = (enabled) => {
  try {
    if (enabled) {
      window.sessionStorage.setItem(TRACKING_STORAGE_KEY_BASE, "1");
    } else {
      window.sessionStorage.removeItem(TRACKING_STORAGE_KEY_BASE);
      clearSessionTracking();
      clearUserTracking();
    }
  } catch (e) {
  }
};
const clearSessionTracking = () => {
  try {
    window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
  } catch (e) {
  }
};
const initSessionTracking = () => {
  try {
    if (getSessionKey()) {
      return;
    }
    const key = getRandomString(TRACKING_KEY_LENGTH);
    window.sessionStorage.setItem(TRACKING_STORAGE_KEY, key);
  } catch (e) {
  }
};
const initUserTracking = (userKey) => {
  try {
    if (getUserKey()) {
      return;
    }
    const key = userKey || getRandomString(TRACKING_KEY_LENGTH);
    window.localStorage.setItem(TRACKING_STORAGE_KEY, key);
  } catch (e) {
  }
};
const clearUserTracking = () => {
  try {
    window.localStorage.removeItem(TRACKING_STORAGE_KEY);
  } catch (e) {
  }
};
const isTrackingEnabled = () => {
  try {
    return Boolean(window.sessionStorage.getItem(TRACKING_STORAGE_KEY_BASE));
  } catch (e) {
    return false;
  }
};
const getSessionKey = () => {
  var _a;
  try {
    return (_a = window.sessionStorage.getItem(TRACKING_STORAGE_KEY)) != null ? _a : void 0;
  } catch (e) {
    return void 0;
  }
};
const getUserKey = () => {
  var _a;
  try {
    return (_a = window.localStorage.getItem(TRACKING_STORAGE_KEY)) != null ? _a : void 0;
  } catch (e) {
    return void 0;
  }
};
const initTracking = (options) => {
  initBaseTracking(Boolean(options.trackBase));
  if (options.trackSession) {
    initSessionTracking();
  } else {
    clearSessionTracking();
  }
  if (options.trackUser) {
    initUserTracking(options.userKey);
  } else {
    clearUserTracking();
  }
  if (options.analytics) {
    initAnalyticsTracking(options.analytics);
  }
};
const getLupaTrackingContext = () => {
  if (!isTrackingEnabled()) {
    return {};
  }
  return {
    userId: getUserKey(),
    sessionId: getSessionKey()
  };
};
const trackLupaEvent = (queryKey, data = {}, options) => {
  var _a, _b;
  if (!queryKey || !data.type) {
    return;
  }
  const eventData = {
    searchQuery: (_a = data.searchQuery) != null ? _a : "",
    itemId: (_b = data.itemId) != null ? _b : "",
    name: data.type,
    userId: getUserKey(),
    sessionId: getSessionKey()
  };
  LupaSearchSdk.track(queryKey, eventData, options);
};
const sendGa = (name, ...args) => {
  window.ga(() => {
    const trackers = window.ga.getAll();
    const firstTracker = trackers[0];
    if (!firstTracker) {
      console.error("GA tracker not found");
    }
    const trackerName = firstTracker.get("name");
    window.ga(`${trackerName}.${name}`, ...args);
  });
};
const trackAnalyticsEvent = (data) => {
  var _a, _b, _c;
  try {
    const options = JSON.parse(
      (_a = window.sessionStorage.getItem(TRACKING_ANALYTICS_KEY)) != null ? _a : "{}"
    );
    if (!data.analytics || !options.enabled || ((_c = options.ignoreEvents) == null ? void 0 : _c.includes((_b = data.analytics) == null ? void 0 : _b.type))) {
      return;
    }
    switch (options.type) {
      case "ua":
        sendUaAnalyticsEvent(data, options);
        break;
      case "ga4":
        sendGa4AnalyticsEvent(data, options);
        break;
      case "debug":
        processDebugEvent(data);
        break;
      default:
        sendUaAnalyticsEvent(data, options);
    }
  } catch (e) {
    console.error("Unable to send an event to google analytics");
  }
};
const parseEcommerceData = (data, title) => {
  var _a, _b;
  return ((_a = data.analytics) == null ? void 0 : _a.items) ? {
    item_list_name: title,
    items: (_b = data.analytics) == null ? void 0 : _b.items
  } : void 0;
};
const sendUaAnalyticsEvent = (data, options) => {
  var _a, _b, _c, _d;
  const ga = window.ga;
  if (!ga) {
    console.error("Google Analytics object not found");
    return;
  }
  sendGa(
    "send",
    "event",
    options.parentEventName,
    (_b = (_a = data.analytics) == null ? void 0 : _a.type) != null ? _b : "",
    (_d = (_c = data.analytics) == null ? void 0 : _c.label) != null ? _d : ""
  );
};
const sendGa4AnalyticsEvent = (data, options) => {
  var _a, _b, _c, _d, _e, _f, _g;
  if (!window || !window.dataLayer) {
    console.error("dataLayer object not found.");
    return;
  }
  const sendItemTitle = data.searchQuery !== ((_a = data.analytics) == null ? void 0 : _a.label);
  const title = sendItemTitle ? (_b = data.analytics) == null ? void 0 : _b.label : void 0;
  const params = __spreadValues({
    search_text: data.searchQuery,
    item_title: title,
    item_id: data.itemId,
    ecommerce: parseEcommerceData(data, (_c = data.analytics) == null ? void 0 : _c.listLabel)
  }, (_e = (_d = data.analytics) == null ? void 0 : _d.additionalParams) != null ? _e : {});
  window.dataLayer.push(__spreadValues({
    event: (_g = (_f = data.analytics) == null ? void 0 : _f.type) != null ? _g : options.parentEventName
  }, params));
};
const processDebugEvent = (data) => {
  var _a, _b, _c, _d;
  const sendItemTitle = data.searchQuery !== ((_a = data.analytics) == null ? void 0 : _a.label);
  const title = sendItemTitle ? (_b = data.analytics) == null ? void 0 : _b.label : void 0;
  const params = {
    event: (_c = data.analytics) == null ? void 0 : _c.type,
    search_text: data.searchQuery,
    item_title: title,
    item_id: data.itemId,
    ecommerce: parseEcommerceData(data, (_d = data.analytics) == null ? void 0 : _d.listLabel)
  };
  console.debug("Analytics debug event:", params);
};
const track = (queryKey, data = {}, options) => {
  var _a;
  if (!isTrackingEnabled()) {
    return;
  }
  const hasSearchQuery = data.searchQuery;
  if (!hasSearchQuery && !((_a = data.options) == null ? void 0 : _a.allowEmptySearchQuery)) {
    return;
  }
  trackAnalyticsEvent(data);
  if (!hasSearchQuery) {
    return;
  }
  trackLupaEvent(queryKey, data, options);
};
const DEFAULT_SEARCH_BOX_OPTIONS = {
  inputSelector: "#searchBox",
  options: {
    environment: "production"
  },
  showTotalCount: false,
  minInputLength: 1,
  inputAttributes: {
    name: "q"
  },
  debounce: 0,
  labels: {
    placeholder: "Search for products...",
    noResults: "There are no results found.",
    moreResults: "Show more results",
    currency: "€",
    defaultFacetLabel: "Category:"
  },
  links: {
    searchResults: "/search"
  },
  panels: [
    {
      type: "suggestion",
      queryKey: "",
      highlight: true,
      limit: 5
    },
    {
      type: "document",
      queryKey: "",
      limit: 5,
      searchBySuggestion: false,
      links: {
        details: "{url}"
      },
      titleKey: "name",
      elements: []
    }
  ],
  history: {
    labels: {
      clear: "Clear History"
    }
  }
};
const DEFAULT_OPTIONS_RESULTS = {
  options: {
    environment: "production"
  },
  queryKey: "",
  containerSelector: "#searchResultsContainer",
  searchTitlePosition: "page-top",
  labels: {
    pageSize: "Page size:",
    sortBy: "Sort by:",
    itemCount: "Items {1} of {2}",
    filteredItemCount: "",
    currency: "€",
    showMore: "Show more",
    searchResults: "Search Query: ",
    emptyResults: "There are no results for the query:",
    mobileFilterButton: "Filter",
    htmlTitleTemplate: "Search Query: '{1}'",
    noResultsSuggestion: "No results found for this query: {1}",
    didYouMean: "Did you mean to search: {1}",
    similarQuery: "Search results for phrase {1}",
    similarQueries: "Similar queries:",
    similarResultsLabel: "Related to your query:"
  },
  grid: {
    columns: {
      xl: 4,
      l: 3,
      md: 2,
      sm: 2,
      xs: 1
    }
  },
  pagination: {
    sizeSelection: {
      position: {
        top: false,
        bottom: true
      },
      sizes: [10, 20, 25, 50]
    },
    pageSelection: {
      position: {
        top: false,
        bottom: true
      },
      display: 5,
      displayMobile: 3
    }
  },
  sort: [],
  filters: {
    currentFilters: {
      visibility: {
        mobileSidebar: true,
        mobileToolbar: true
      },
      labels: {
        title: "Current filters:",
        clearAll: "Clear all"
      }
    },
    facets: {
      labels: {
        title: "Filters:",
        showAll: "Show more",
        facetFilter: "Filter...",
        facetClear: "Clear"
      },
      filterable: {
        minValues: 5
      },
      hierarchy: {
        maxInitialLevel: 2,
        topLevelValueCountLimit: 5,
        filterable: true
      },
      facetValueCountLimit: 20,
      showDocumentCount: true,
      style: {
        type: "sidebar"
      }
    }
  },
  toolbar: {
    layoutSelector: true,
    itemSummary: true,
    clearFilters: false
  },
  isInStock: () => {
    return true;
  },
  badges: {
    anchor: "tr",
    elements: []
  },
  links: {
    details: "/{id}"
  },
  elements: [],
  breadcrumbs: [{ label: "Main Page", link: "/" }, { label: "Search: {1}" }]
};
const useScreenStore = defineStore("screen", () => {
  const screenWidth = ref(1e3);
  const currentScreenWidth = computed(() => {
    const width = screenWidth.value;
    if (width <= S_MIN_WIDTH) {
      return "xs";
    } else if (width > S_MIN_WIDTH && width <= MD_MIN_WIDTH) {
      return "sm";
    } else if (width > MD_MIN_WIDTH && width <= L_MIN_WIDTH) {
      return "md";
    } else if (width > L_MIN_WIDTH && width <= XL_MIN_WIDTH) {
      return "l";
    } else {
      return "xl";
    }
  });
  const isMobileWidth = computed(
    () => currentScreenWidth.value === "sm" || currentScreenWidth.value === "xs"
  );
  const setScreenWidth = ({ width }) => {
    screenWidth.value = width;
  };
  return { screenWidth, currentScreenWidth, isMobileWidth, setScreenWidth };
});
const useOptionsStore = defineStore("options", () => {
  const searchBoxOptions = ref(
    DEFAULT_SEARCH_BOX_OPTIONS
  );
  const searchResultOptions = ref(
    DEFAULT_OPTIONS_RESULTS
  );
  const trackingOptions = ref({});
  const searchResultInitialFilters = ref({});
  const screenStore = useScreenStore();
  const envOptions = computed(
    () => {
      var _a;
      return (_a = searchBoxOptions.value.options) != null ? _a : searchResultOptions.value.options;
    }
  );
  const classMap = computed(() => {
    var _a;
    return (_a = searchResultOptions.value.classMap) != null ? _a : {};
  });
  const initialFilters = computed(() => searchResultInitialFilters.value);
  const boxRoutingBehavior = computed(() => {
    var _a;
    return (_a = searchBoxOptions.value.routingBehavior) != null ? _a : "direct-link";
  });
  const searchResultsRoutingBehavior = computed(
    () => {
      var _a;
      return (_a = searchResultOptions.value.routingBehavior) != null ? _a : "direct-link";
    }
  );
  const defaultSearchResultPageSize = computed(
    () => {
      var _a, _b;
      return (_b = (_a = currentResolutionPageSizes.value) == null ? void 0 : _a[0]) != null ? _b : DEFAULT_PAGE_SIZE;
    }
  );
  const currentResolutionPageSizes = computed(() => {
    var _a, _b, _c, _d;
    const pageSizes = (_d = (_c = (_b = (_a = searchResultOptions.value) == null ? void 0 : _a.pagination) == null ? void 0 : _b.sizeSelection) == null ? void 0 : _c.sizes) != null ? _d : DEFAULT_PAGE_SIZE_SELECTION;
    if (Array.isArray(pageSizes)) {
      return pageSizes;
    }
    const screenSize = screenStore.currentScreenWidth;
    switch (screenSize) {
      case "xs":
        return pageSizes.xs;
      case "sm":
        return pageSizes.sm;
      case "md":
        return pageSizes.md;
      case "l":
        return pageSizes.l;
      case "xl":
        return pageSizes.xl;
    }
  });
  const setSearchBoxOptions = ({ options }) => {
    searchBoxOptions.value = options;
  };
  const setTrackingOptions = ({ options }) => {
    trackingOptions.value = options;
  };
  const setSearchResultOptions = ({ options }) => {
    searchResultOptions.value = options;
  };
  const setInitialFilters = ({ initialFilters: initialFilters2 }) => {
    searchResultInitialFilters.value = initialFilters2;
  };
  return {
    searchBoxOptions,
    searchResultOptions,
    trackingOptions,
    envOptions,
    classMap,
    initialFilters,
    boxRoutingBehavior,
    searchResultsRoutingBehavior,
    defaultSearchResultPageSize,
    currentResolutionPageSizes,
    setSearchBoxOptions,
    setTrackingOptions,
    setSearchResultOptions,
    setInitialFilters
  };
});
var DocumentElementType = /* @__PURE__ */ ((DocumentElementType2) => {
  DocumentElementType2["IMAGE"] = "image";
  DocumentElementType2["TITLE"] = "title";
  DocumentElementType2["CUSTOM"] = "custom";
  DocumentElementType2["DESCRIPTION"] = "description";
  DocumentElementType2["PRICE"] = "price";
  DocumentElementType2["REGULARPRICE"] = "regularPrice";
  DocumentElementType2["RATING"] = "rating";
  DocumentElementType2["SINGLE_STAR_RATING"] = "singleStarRating";
  DocumentElementType2["ADDTOCART"] = "addToCart";
  DocumentElementType2["CUSTOM_HTML"] = "customHtml";
  return DocumentElementType2;
})(DocumentElementType || {});
var SearchBoxPanelType = /* @__PURE__ */ ((SearchBoxPanelType2) => {
  SearchBoxPanelType2["SUGGESTION"] = "suggestion";
  SearchBoxPanelType2["DOCUMENT"] = "document";
  return SearchBoxPanelType2;
})(SearchBoxPanelType || {});
var BadgeType = /* @__PURE__ */ ((BadgeType2) => {
  BadgeType2["DISCOUNTPERCENTAGE"] = "discountPercentage";
  BadgeType2["DISCOUNTAMOUNT"] = "discountAmount";
  BadgeType2["NEWITEM"] = "newItem";
  BadgeType2["TEXT"] = "text";
  BadgeType2["IMAGE"] = "image";
  BadgeType2["CUSTOM_HTML"] = "customHtml";
  return BadgeType2;
})(BadgeType || {});
const retrieveHistory = () => {
  try {
    const historyString = window.localStorage.getItem(HISTORY_LOCAL_STORAGE_KEY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (e) {
    return [];
  }
};
const saveHistory = (items) => {
  try {
    window.localStorage.setItem(
      HISTORY_LOCAL_STORAGE_KEY,
      JSON.stringify(items.slice(0, HISTORY_MAX_ITEMS))
    );
  } catch (e) {
  }
};
const useHistoryStore = defineStore("history", () => {
  const items = ref(retrieveHistory());
  const count = computed(() => items.value.length);
  const add = ({ item }) => {
    if (!item) {
      return items.value;
    }
    const newItems = items.value ? [item, ...items.value] : [item];
    const uniqueItems = Array.from(new Set(newItems));
    items.value = uniqueItems;
    saveHistory(uniqueItems);
    return uniqueItems;
  };
  const remove = ({ item }) => {
    var _a, _b;
    const tempItems = (_b = (_a = items.value) == null ? void 0 : _a.filter((i) => i !== item)) != null ? _b : [];
    saveHistory(tempItems);
    items.value = tempItems;
    return tempItems;
  };
  const clear = () => {
    saveHistory([]);
    items.value = [];
  };
  return { items, count, add, remove, clear };
});
const QUERY_PARAMS = {
  QUERY: "q",
  PAGE: "p",
  LIMIT: "l",
  SORT: "s"
};
const QUERY_PARAMS_PARSED = {
  QUERY: "query",
  PAGE: "page",
  LIMIT: "limit",
  SORT: "sort"
};
const FACET_PARAMS_TYPE = {
  TERMS: "f.",
  RANGE: "fr.",
  HIERARCHY: "fh."
};
const FACET_FILTER_MAP = {
  terms: FACET_PARAMS_TYPE.TERMS,
  range: FACET_PARAMS_TYPE.RANGE,
  hierarchy: FACET_PARAMS_TYPE.HIERARCHY
};
const FACET_KEY_SEPARATOR = ".";
const FACET_RANGE_SEPARATOR = ":";
const HIERARCHY_SEPARATOR = ">";
const FACET_TERM_RANGE_SEPARATOR = "-";
const getAmount = (price, separator = ".") => {
  var _a, _b;
  if (typeof price === "number") {
    return `${(_a = price.toFixed(2)) == null ? void 0 : _a.replace(".", separator)}`;
  }
  const value = parseFloat(price);
  if (isNaN(value)) {
    return "";
  }
  return (_b = value.toFixed(2)) == null ? void 0 : _b.replace(".", separator);
};
const formatPrice = (price, currency = "€", separator = ",") => {
  if (price !== 0 && !price) {
    return "";
  }
  const amount = getAmount(price, separator);
  if (!amount) {
    return "";
  }
  return `${amount} ${currency}`;
};
const formatPriceSummary = ([min, max], currency, separator = ",") => {
  if (min !== void 0 && max !== void 0) {
    return `${formatPrice(min, currency, separator)} - ${formatPrice(max, currency, separator)}`;
  }
  if (min !== void 0) {
    return `> ${formatPrice(min, currency, separator)}`;
  }
  return `< ${formatPrice(max, currency, separator)}`;
};
const formatRange = (filter) => {
  var _a, _b;
  const lt = (_a = filter.lt) != null ? _a : filter.lte;
  const gt = (_b = filter.gt) != null ? _b : filter.gte;
  if (gt !== void 0 && lt !== void 0) {
    return `${gt} - ${lt}`;
  }
  if (lt !== void 0) {
    return `<${filter.lte !== void 0 ? "=" : ""} ${lt}`;
  }
  return `>${filter.gte !== void 0 ? "=" : ""} ${gt}`;
};
const unfoldTermFilter = (key, filter) => {
  const seed = [];
  return filter.reduce((a, c) => [...a, { key, value: c, type: "terms" }], seed);
};
const unfoldHierarchyFilter = (key, filter) => {
  const seed = [];
  return filter.terms.reduce((a, c) => [...a, { key, value: c, type: "hierarchy" }], seed);
};
const unfoldRangeFilter = (key, filter) => {
  const gt = filter.gte || filter.gt;
  const lt = filter.lte || filter.lt;
  if (key.includes(CURRENCY_KEY_INDICATOR)) {
    return [
      {
        key,
        value: formatPriceSummary([gt, lt]),
        type: "range"
      }
    ];
  }
  return [{ key, value: `${gt} - ${lt}`, type: "range" }];
};
const unfoldFilter = (key, filter) => {
  if (Array.isArray(filter)) {
    return unfoldTermFilter(key, filter);
  }
  if (filter.gte) {
    return unfoldRangeFilter(key, filter);
  }
  if (filter.terms) {
    return unfoldHierarchyFilter(key, filter);
  }
  return [];
};
const unfoldFilters = (filters) => {
  if (!filters) {
    return [];
  }
  const seed = [];
  return Object.entries(filters).reduce((a, c) => [...a, ...unfoldFilter(...c)], seed);
};
const getLabeledFilters = (filters, facets) => {
  return filters.map((f) => {
    var _a, _b;
    return __spreadProps(__spreadValues({}, f), {
      label: (_b = (_a = facets == null ? void 0 : facets.find((ft) => ft.key === f.key)) == null ? void 0 : _a.label) != null ? _b : capitalize(f.key)
    });
  });
};
const isFacetKey = (key) => key.startsWith(FACET_PARAMS_TYPE.RANGE) || key.startsWith(FACET_PARAMS_TYPE.TERMS) || key.startsWith(FACET_PARAMS_TYPE.HIERARCHY);
const getMostSpecificHierarchyTerms = (terms) => {
  const specificTerms = [];
  for (const term of terms) {
    if (!terms.some((t) => t.startsWith(term) && t !== term)) {
      specificTerms.push(term);
    }
  }
  return Array.from(new Set(specificTerms));
};
const recursiveFilter = (items, query = "") => {
  if (!query) {
    return items;
  }
  return items.map((i) => recursiveFilterItem(i, query)).filter(Boolean);
};
const recursiveFilterItem = (item, query = "") => {
  const filterable = getNormalizedString(item.title).includes(getNormalizedString(query)) ? item : void 0;
  if (!item.children) {
    return filterable;
  }
  const children = recursiveFilter(item.children, query).filter(Boolean);
  const include = children.length > 0 || filterable;
  return include ? __spreadProps(__spreadValues({}, item), {
    children
  }) : void 0;
};
const rangeFilterToString = (rangeFilter, separator) => {
  separator = separator || FACET_TERM_RANGE_SEPARATOR;
  return rangeFilter && Object.keys(rangeFilter).length ? rangeFilter.gte + separator + (rangeFilter.lte || rangeFilter.lt) : "";
};
const pick = (obj, keys) => {
  const ret = /* @__PURE__ */ Object.create({});
  for (const k of keys) {
    ret[k] = obj[k];
  }
  return ret;
};
const getHint = (suggestion, inputValue) => {
  var _a;
  if (!inputValue) {
    return escapeHtml(suggestion);
  }
  return (_a = suggestion == null ? void 0 : suggestion.replace(inputValue, `<strong>${escapeHtml(inputValue)}</strong>`)) != null ? _a : "";
};
const reverseKeyValue = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k.toLowerCase()]));
};
const getPageCount = (total, limit) => {
  return Math.ceil(total / limit) || 0;
};
const parseParam = (key, params) => {
  const value = params.get(key);
  if (!value) {
    return void 0;
  }
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return void 0;
  }
};
const parseRegularKeys = (regularKeys, searchParams) => {
  const params = /* @__PURE__ */ Object.create({});
  const keys = reverseKeyValue(QUERY_PARAMS);
  for (const key of regularKeys) {
    const rawKey = keys[key] || key;
    params[rawKey] = parseParam(key, searchParams);
  }
  return params;
};
const parseFacetKey = (key, searchParams) => {
  var _a, _b, _c, _d;
  if (key.startsWith(FACET_PARAMS_TYPE.TERMS)) {
    return (_b = (_a = searchParams.getAll(key)) == null ? void 0 : _a.map((v) => decodeURIComponent(v))) != null ? _b : [];
  }
  if (key.startsWith(FACET_PARAMS_TYPE.RANGE)) {
    const range = searchParams.get(key);
    if (!range) {
      return {};
    }
    const [min, max] = range.split(FACET_RANGE_SEPARATOR);
    return {
      gte: min,
      lte: max
    };
  }
  if (key.startsWith(FACET_PARAMS_TYPE.HIERARCHY)) {
    return {
      level: 0,
      terms: (_d = (_c = searchParams.getAll(key)) == null ? void 0 : _c.map((v) => decodeURIComponent(v))) != null ? _d : []
    };
  }
  return [];
};
const parseFacetKeys = (facetKeys, searchParams) => {
  const params = {};
  params.filters = {};
  for (const key of facetKeys) {
    const parsedKey = key.slice(key.indexOf(FACET_KEY_SEPARATOR) + 1);
    params.filters = __spreadProps(__spreadValues({}, params.filters), {
      [parsedKey]: parseFacetKey(key, searchParams)
    });
  }
  return params;
};
const parseParams = (searchParams) => {
  const params = /* @__PURE__ */ Object.create({});
  if (!searchParams)
    return params;
  const paramKeys = Array.from(searchParams.keys());
  const facetKeys = paramKeys.filter((k) => isFacetKey(k));
  const regularKeys = paramKeys.filter((k) => !isFacetKey(k));
  return __spreadValues(__spreadValues({
    [QUERY_PARAMS_PARSED.QUERY]: ""
  }, parseRegularKeys(regularKeys, searchParams)), parseFacetKeys(facetKeys, searchParams));
};
const appendParam = (url, { name, value }, encode = true) => {
  if (Array.isArray(value)) {
    appendArrayParams(url, { name, value });
  } else {
    appendSingleParam(url, { name, value }, encode);
  }
};
const appendSingleParam = (url, param, encode = true) => {
  const valueToAppend = encode ? encodeParam(param.value) : param.value;
  if (url.searchParams.has(param.name)) {
    url.searchParams.set(param.name, valueToAppend);
  } else {
    url.searchParams.append(param.name, valueToAppend);
  }
};
const appendArrayParams = (url, param) => {
  url.searchParams.delete(param.name);
  param.value.forEach((v) => url.searchParams.append(param.name, encodeParam(v)));
};
const getRemovableParams = (url, paramsToRemove) => {
  if (paramsToRemove === "all") {
    return [
      ...Object.values(QUERY_PARAMS),
      ...Array.from(url.searchParams.keys()).filter((k) => isFacetKey(k))
    ];
  }
  return paramsToRemove;
};
const removeParams = (url, params = []) => {
  for (const param of params) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
    }
  }
};
const encodeParam = (param) => {
  const encoded = encodeURIComponent(param);
  return encoded.replace(/%C4%85/g, "ą").replace(/%C4%8D/g, "č").replace(/%C4%99/g, "ę").replace(/%C4%97/g, "ė").replace(/%C4%AF/g, "į").replace(/%C5%A1/g, "š").replace(/%C5%B3/g, "ų").replace(/%C5%AB/g, "ū").replace(/%C5%BE/g, "ž").replace(/%20/g, " ");
};
const PATH_REPLACE_REGEXP = /{(.*?)}/gm;
const generateLink = (linkPattern, document2) => {
  const matches = linkPattern.match(PATH_REPLACE_REGEXP);
  if (!matches) {
    return linkPattern;
  }
  let link = linkPattern;
  for (const match of matches) {
    const propertyKey = match.slice(1, match.length - 1);
    const property = document2[propertyKey] || "";
    link = link.replace(match, property);
  }
  return link;
};
const generateResultLink = (link, searchText, facet) => {
  if (!searchText) {
    return link;
  }
  const facetParam = facet ? `&${FACET_PARAMS_TYPE.TERMS}${encodeParam(facet.key)}=${encodeParam(facet.title)}` : "";
  const queryParam = `?${QUERY_PARAMS.QUERY}=${encodeParam(searchText)}`;
  return `${link}${queryParam}${facetParam}`;
};
const getRelativePath = (link) => {
  try {
    const url = new URL(link);
    const partialUrl = url.toString().substring(url.origin.length);
    return partialUrl.endsWith("/") ? partialUrl.slice(0, partialUrl.length - 1) : partialUrl;
  } catch (e) {
    return (link == null ? void 0 : link.endsWith("/")) ? link.slice(0, link.length - 1) : link;
  }
};
const linksMatch = (link1, link2) => {
  if (!link1 || !link2) {
    return false;
  }
  return link1 === link2 || getRelativePath(link1) === getRelativePath(link2);
};
const emitRoutingEvent = (url) => {
  const event = new CustomEvent(LUPA_ROUTING_EVENT, { detail: url });
  window.dispatchEvent(event);
};
const handleRoutingEvent = (link, event, hasEventRouting = false) => {
  if (!hasEventRouting) {
    return;
  }
  event == null ? void 0 : event.preventDefault();
  emitRoutingEvent(link);
};
const redirectToResultsPage = (link, searchText, facet, routingBehavior = "direct-link") => {
  const url = generateResultLink(link, searchText, facet);
  if (routingBehavior === "event") {
    emitRoutingEvent(url);
  } else {
    window.location.assign(url);
  }
};
const getPageUrl = (pathnameOverride, ssr) => {
  if (typeof window !== "undefined") {
    const pathname = pathnameOverride || window.location.pathname;
    const origin = window.location.origin;
    const search2 = window.location.search;
    return new URL(origin + pathname + search2);
  }
  return new URL(ssr.url, ssr.baseUrl);
};
const getFacetKey = (key, type) => {
  return `${FACET_FILTER_MAP[type]}${key}`;
};
const getFacetParam = (key, value, type = FACET_PARAMS_TYPE.TERMS) => {
  return {
    name: `${type}${key}`,
    value
  };
};
const toggleTermFilter = (appendParams, facetAction, currentFilters) => {
  const currentFilter = currentFilters == null ? void 0 : currentFilters[facetAction.key];
  const newParams = toggleTermParam(currentFilter, facetAction.value);
  appendParams({
    params: [getFacetParam(facetAction.key, newParams)],
    paramsToRemove: [QUERY_PARAMS.PAGE]
  });
};
const toggleHierarchyFilter = (appendParams, facetAction, currentFilters, removeAllLevels = false) => {
  var _a;
  const currentFilter = currentFilters == null ? void 0 : currentFilters[facetAction.key];
  const newParams = toggleHierarchyParam(
    (_a = currentFilter == null ? void 0 : currentFilter.terms) != null ? _a : [],
    facetAction.value,
    removeAllLevels
  );
  appendParams({
    params: [getFacetParam(facetAction.key, newParams, FACET_PARAMS_TYPE.HIERARCHY)],
    paramsToRemove: [QUERY_PARAMS.PAGE]
  });
};
const toggleRangeFilter = (appendParams, facetAction, currentFilters) => {
  const currentFilter = rangeFilterToString(
    currentFilters == null ? void 0 : currentFilters[facetAction.key],
    FACET_RANGE_SEPARATOR
  );
  let facetValue = facetAction.value.join(FACET_RANGE_SEPARATOR);
  facetValue = currentFilter === facetValue ? "" : facetValue;
  appendParams({
    params: [getFacetParam(facetAction.key, facetValue, FACET_PARAMS_TYPE.RANGE)],
    paramsToRemove: [QUERY_PARAMS.PAGE],
    encode: false
  });
};
const toggleTermParam = (params = [], param = "") => {
  if (params == null ? void 0 : params.includes(param)) {
    return params.filter((p) => p !== param);
  }
  return [param, ...params];
};
const toggleLastPram = (params = [], param = "") => {
  const paramLevel = param.split(">").length;
  return getMostSpecificHierarchyTerms(
    params.map(
      (p) => p.startsWith(param) ? p.split(HIERARCHY_SEPARATOR).slice(0, paramLevel - 1).join(HIERARCHY_SEPARATOR).trim() : p
    ).filter(Boolean)
  );
};
const toggleHierarchyParam = (params = [], param = "", removeAllLevels = false) => {
  if (params == null ? void 0 : params.some((p) => p.startsWith(param))) {
    return removeAllLevels ? getMostSpecificHierarchyTerms(params.filter((p) => !p.startsWith(param))) : toggleLastPram(params, param);
  }
  return getMostSpecificHierarchyTerms([param, ...params]);
};
const CACHE_KEY = "lupasearch-client-redirections";
const useRedirectionStore = defineStore("redirections", () => {
  const redirections = ref({ rules: [] });
  const redirectionOptions = ref({ enabled: false, queryKey: "" });
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ redirections: redirections.value, savedAt: Date.now() })
      );
    } catch (e) {
    }
  };
  const tryLoadFromLocalStorage = (config) => {
    var _a;
    if (!config.cacheSeconds)
      return false;
    try {
      const data = JSON.parse((_a = localStorage.getItem(CACHE_KEY)) != null ? _a : "");
      if ((data == null ? void 0 : data.redirections) && Date.now() - data.savedAt < 1e3 * config.cacheSeconds) {
        redirections.value = data.redirections;
        return true;
      }
    } catch (e) {
    }
    return false;
  };
  const initiate = (config, options) => __async(void 0, null, function* () {
    var _a, _b, _c, _d;
    if ((_a = redirectionOptions.value) == null ? void 0 : _a.enabled) {
      return;
    }
    redirectionOptions.value = config;
    if (!(config == null ? void 0 : config.enabled)) {
      return;
    }
    const loaded = tryLoadFromLocalStorage(config);
    if (loaded || ((_c = (_b = redirections.value) == null ? void 0 : _b.rules) == null ? void 0 : _c.length) > 0) {
      return;
    }
    try {
      const result = yield LupaSearchSdk.loadRedirectionRules(config.queryKey, options);
      if (!((_d = result == null ? void 0 : result.rules) == null ? void 0 : _d.length)) {
        return;
      }
      redirections.value = result;
      saveToLocalStorage();
    } catch (e) {
    }
  });
  const redirectOnKeywordIfConfigured = (input, routingBehavior = "direct-link") => {
    var _a, _b, _c, _d;
    if (!((_b = (_a = redirections.value) == null ? void 0 : _a.rules) == null ? void 0 : _b.length)) {
      return false;
    }
    const redirectTo = redirections.value.rules.find((r) => inputsAreEqual(input, r.sources));
    if (!redirectTo) {
      return false;
    }
    const url = ((_c = redirectionOptions.value) == null ? void 0 : _c.urlTransformer) ? (_d = redirectionOptions.value) == null ? void 0 : _d.urlTransformer(redirectTo == null ? void 0 : redirectTo.target) : redirectTo == null ? void 0 : redirectTo.target;
    if (url === void 0 || url === null || url === "") {
      return false;
    }
    if (routingBehavior === "event") {
      emitRoutingEvent(url);
    } else {
      window.location.assign(url);
    }
    return true;
  };
  return {
    redirections,
    redirectOnKeywordIfConfigured,
    initiate
  };
});
const useParamsStore = defineStore("params", () => {
  const params = ref({});
  const defaultLimit = ref(DEFAULT_PAGE_SIZE);
  const searchResultsLink = ref("");
  const searchString = ref("");
  const optionsStore = useOptionsStore();
  const redirectionStore = useRedirectionStore();
  const sortParams = ref({
    selectedSortKey: "",
    previousSortKey: ""
  });
  const query = computed(() => params.value[QUERY_PARAMS_PARSED.QUERY]);
  const page = computed(() => {
    const page2 = Number(params.value[QUERY_PARAMS_PARSED.PAGE]) || 1;
    return page2 <= 0 ? 1 : page2;
  });
  const limit = computed(() => {
    return Number(params.value[QUERY_PARAMS_PARSED.LIMIT]) || optionsStore.defaultSearchResultPageSize || defaultLimit.value;
  });
  const sort = computed(() => {
    return params.value[QUERY_PARAMS_PARSED.SORT];
  });
  const filters = computed(() => {
    var _a;
    return (_a = params.value.filters) != null ? _a : {};
  });
  const navigate = (url) => {
    var _a, _b, _c;
    window.history.pushState("", "Append params", url.pathname + url.search);
    const params2 = parseParams(url.searchParams);
    (_c = (_b = (_a = optionsStore == null ? void 0 : optionsStore.searchBoxOptions) == null ? void 0 : _a.callbacks) == null ? void 0 : _b.onSearchResultsNavigate) == null ? void 0 : _c.call(_b, {
      params: params2
    });
  };
  const add = (newParams, ssr) => {
    if (!newParams) {
      return { params: params.value };
    }
    const url = getPageUrl(void 0, ssr);
    params.value = newParams;
    searchString.value = url.search;
  };
  const removeAllFilters = () => {
    const url = getPageUrl();
    const paramsToRemove = Array.from(url.searchParams.keys()).filter(isFacetKey);
    removeParams(url, paramsToRemove);
    navigate(url);
    params.value = parseParams(url.searchParams);
    searchString.value = url.search;
  };
  const removeParameters = ({
    paramsToRemove,
    save = true
  }) => {
    const url = getPageUrl();
    paramsToRemove = getRemovableParams(url, paramsToRemove);
    removeParams(url, paramsToRemove);
    navigate(url);
    if (!save) {
      return;
    }
    params.value = parseParams(url.searchParams);
    searchString.value = url.search;
  };
  const handleNoResultsFlag = ({
    resultCount,
    noResultsParam
  }) => {
    if (!noResultsParam || searchResultsLink.value && searchResultsLink.value !== window.location.pathname) {
      return;
    }
    if (resultCount < 1) {
      appendParams({
        params: [{ name: noResultsParam, value: "true" }],
        save: false
      });
    } else {
      removeParameters({
        paramsToRemove: [noResultsParam],
        save: false
      });
    }
  };
  const goToResults = ({
    searchText,
    facet
  }) => {
    var _a;
    const redirectionApplied = redirectionStore.redirectOnKeywordIfConfigured(
      searchText,
      optionsStore.boxRoutingBehavior
    );
    if (redirectionApplied) {
      return;
    }
    if (!searchResultsLink.value || linksMatch(searchResultsLink.value, window.location.pathname)) {
      const singleFacetParam = facet ? getFacetParam(facet.key, [facet.title]) : void 0;
      const facetParam = singleFacetParam ? [
        __spreadProps(__spreadValues({}, singleFacetParam), {
          value: Array.isArray(singleFacetParam.value) ? singleFacetParam.value[0] : singleFacetParam.value
        })
      ] : [];
      appendParams({
        params: [{ name: QUERY_PARAMS.QUERY, value: searchText }, ...facetParam],
        paramsToRemove: "all",
        searchResultsLink: searchResultsLink.value
      });
    } else {
      const routing = (_a = optionsStore.boxRoutingBehavior) != null ? _a : "direct-link";
      redirectToResultsPage(searchResultsLink.value, searchText, facet, routing);
    }
  };
  const appendParams = ({
    params: newParams,
    paramsToRemove,
    encode = true,
    save = true,
    searchResultsLink: searchResultsLink2
  }) => {
    if (!(newParams == null ? void 0 : newParams.length)) {
      return { params: params.value };
    }
    const url = getPageUrl(searchResultsLink2);
    paramsToRemove = getRemovableParams(url, paramsToRemove);
    removeParams(url, paramsToRemove);
    newParams.forEach((p) => appendParam(url, p, encode));
    navigate(url);
    if (!save) {
      return;
    }
    params.value = parseParams(url.searchParams);
    searchString.value = url.search;
  };
  const setDefaultLimit = (newDefaultLimit) => {
    if (!newDefaultLimit) {
      return;
    }
    return defaultLimit.value = newDefaultLimit;
  };
  const setSearchResultsLink = (newSearchResultsLink) => {
    if (!newSearchResultsLink) {
      return;
    }
    searchResultsLink.value = newSearchResultsLink;
  };
  const setSortSettings = ({ selectedSortKey, previousSortKey }) => {
    sortParams.value = {
      selectedSortKey,
      previousSortKey
    };
  };
  return {
    params,
    defaultLimit,
    searchResultsLink,
    searchString,
    query,
    page,
    limit,
    sort,
    filters,
    sortParams,
    add,
    removeAllFilters,
    removeParameters,
    handleNoResultsFlag,
    goToResults,
    appendParams,
    setDefaultLimit,
    setSearchResultsLink,
    setSortSettings
  };
});
const flattenFacet = (key, facets, suggestion, inputValue) => {
  return facets.map((f) => ({
    displayHighlight: getHint(suggestion.suggestion, inputValue != null ? inputValue : ""),
    display: suggestion.suggestion,
    suggestion,
    facet: __spreadValues({
      key
    }, f)
  }));
};
const flattenSuggestionFacet = (suggestion, suggestionFacets, inputValue) => {
  const facets = Object.keys(suggestionFacets).map((key) => ({
    key,
    value: suggestionFacets[key]
  }));
  const seed = [];
  const facetSuggestions = facets.reduce(
    (a, c) => [...a, ...flattenFacet(c.key, c.value, suggestion, inputValue)],
    seed
  );
  return [mapSuggestion(suggestion, inputValue), ...facetSuggestions];
};
const mapSuggestion = (suggestion, inputValue) => {
  return {
    displayHighlight: getHint(suggestion.suggestion, inputValue != null ? inputValue : ""),
    display: suggestion.suggestion,
    suggestion
  };
};
const flattenSuggestion = (suggestion, inputValue) => {
  return suggestion.facets ? flattenSuggestionFacet(suggestion, suggestion.facets, inputValue) : [mapSuggestion(suggestion, inputValue)];
};
const flattenSuggestions = (suggestions, inputValue) => {
  const seed = [];
  return suggestions.reduce((a, c) => [...a, ...flattenSuggestion(c, inputValue)], seed);
};
const useSearchBoxStore = defineStore("searchBox", () => {
  const options = ref(DEFAULT_SEARCH_BOX_OPTIONS);
  const docResults = ref({});
  const suggestionResults = ref({});
  const highlightedIndex = ref(-1);
  const inputValue = ref("");
  const resultInputValue = ref("");
  const historyStore = useHistoryStore();
  const resultsVisible = computed(() => {
    var _a;
    return ((_a = inputValue.value) == null ? void 0 : _a.length) >= options.value.minInputLength;
  });
  const panelItemCounts = computed(
    () => options.value.panels.map((p) => {
      var _a, _b, _c, _d, _e;
      if (p.type === SearchBoxPanelType.SUGGESTION) {
        return {
          queryKey: p.queryKey,
          count: (_b = (_a = suggestionResults.value[p.queryKey]) == null ? void 0 : _a.length) != null ? _b : 0,
          panel: p,
          input: resultInputValue.value
        };
      }
      return {
        queryKey: p.queryKey,
        count: (_e = (_d = (_c = docResults.value[p.queryKey]) == null ? void 0 : _c.items) == null ? void 0 : _d.length) != null ? _e : 0,
        panel: p,
        input: resultInputValue.value
      };
    })
  );
  const hasAnyResults = computed(() => {
    var _a;
    return (_a = panelItemCounts.value) == null ? void 0 : _a.some((p) => p.count > 0);
  });
  const totalCount = computed(
    () => {
      var _a, _b;
      return resultsVisible.value ? (_b = (_a = panelItemCounts.value) == null ? void 0 : _a.reduce((a, c) => a + c.count, 0)) != null ? _b : 0 : historyStore.count;
    }
  );
  const highlightedItem = computed(() => {
    let i = 0;
    for (const panel of panelItemCounts.value) {
      if (highlightedIndex.value < i + panel.count) {
        const mod = highlightedIndex.value - i;
        return { queryKey: panel.queryKey, index: mod, panel: panel.panel };
      }
      i += panel.count;
    }
  });
  const highlightedDocument = computed(() => {
    var _a, _b;
    if (resultsVisible.value || ((_a = highlightedItem.value) == null ? void 0 : _a.panel.type) !== SearchBoxPanelType.DOCUMENT) {
      return { doc: void 0 };
    }
    const doc = docResults.value[highlightedItem.value.queryKey].items[highlightedItem.value.index];
    const panel = highlightedItem.value.panel;
    return {
      doc,
      link: generateLink((_b = panel.links) == null ? void 0 : _b.details, doc),
      queryKey: panel.queryKey,
      id: panel.idKey ? doc[panel.idKey] : "",
      title: panel.titleKey ? doc[panel.titleKey] : ""
    };
  });
  const querySuggestions = (_0) => __async(void 0, [_0], function* ({
    queryKey,
    publicQuery,
    options: options2
  }) {
    var _a;
    try {
      const context = getLupaTrackingContext();
      const result = yield LupaSearchSdk.suggestions(
        queryKey,
        __spreadValues(__spreadValues({}, publicQuery), context),
        options2
      );
      if (!result.success) {
        return { suggestions: void 0 };
      }
      highlightChange({ action: "clear" });
      suggestionResults.value = __spreadProps(__spreadValues({}, suggestionResults.value), {
        [queryKey]: flattenSuggestions(result.items, (_a = publicQuery.searchText) != null ? _a : "")
      });
      inputValue.value = publicQuery.searchText;
      resultInputValue.value = publicQuery.searchText;
      emitSearchResultsCallback();
      return {
        suggestions: result.items
      };
    } catch (err) {
      console.error(err);
      if (options2 == null ? void 0 : options2.onError) {
        options2.onError(err);
      }
      return { suggestions: void 0 };
    }
  });
  const emitSearchResultsCallback = () => {
    var _a;
    if ((_a = options.value.callbacks) == null ? void 0 : _a.onSearchBoxResults) {
      options.value.callbacks.onSearchBoxResults({
        hasAnyResults: hasAnyResults.value,
        docResults: docResults.value,
        suggestionResults: suggestionResults.value,
        totalCount: totalCount.value,
        panelItemCounts: panelItemCounts.value,
        inputValue: inputValue.value
      });
    }
  };
  const queryDocuments = (_0) => __async(void 0, [_0], function* ({
    queryKey,
    publicQuery,
    options: options2
  }) {
    try {
      const context = getLupaTrackingContext();
      const result = yield LupaSearchSdk.query(queryKey, __spreadValues(__spreadValues({}, publicQuery), context), options2);
      if (!result.success) {
        return { queryKey, result: { items: [] } };
      }
      highlightChange({ action: "clear" });
      docResults.value = __spreadProps(__spreadValues({}, docResults.value), { [queryKey]: result });
      emitSearchResultsCallback();
      return { queryKey, result };
    } catch (err) {
      console.error(err);
      if (options2 == null ? void 0 : options2.onError) {
        options2.onError(err);
      }
      return { queryKey, result: { items: [] } };
    }
  });
  const highlightChange = ({ action }) => {
    if (action === "clear") {
      return { highlightIndex: -1 };
    }
    const newIndex = highlightedIndex.value + (action === "up" ? -1 : 1);
    highlightedIndex.value = newIndex >= 0 ? newIndex % totalCount.value : totalCount.value - 1;
  };
  const resetHighlightIndex = () => {
    highlightedIndex.value = -1;
  };
  const saveInputValue = ({ input }) => {
    inputValue.value = input;
  };
  const saveOptions = ({ newOptions }) => {
    options.value = newOptions;
  };
  return {
    options,
    docResults,
    suggestionResults,
    highlightedIndex,
    inputValue,
    resultsVisible,
    panelItemCounts,
    totalCount,
    highlightedItem,
    highlightedDocument,
    hasAnyResults,
    querySuggestions,
    queryDocuments,
    highlightChange,
    saveInputValue,
    saveOptions,
    resetHighlightIndex
  };
});
const _hoisted_1$_ = { id: "lupa-search-box-input-container" };
const _hoisted_2$I = { class: "lupa-input-clear" };
const _hoisted_3$v = { id: "lupa-search-box-input" };
const _hoisted_4$n = ["value"];
const _hoisted_5$e = ["aria-label", "placeholder"];
const _hoisted_6$8 = {
  key: 0,
  class: "lupa-close-label"
};
const _sfc_main$14 = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxInput",
  props: {
    options: {},
    canClose: { type: Boolean },
    emitInputOnFocus: { type: Boolean },
    suggestedValue: {}
  },
  emits: ["input", "focus"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const paramStore = useParamsStore();
    const searchBoxStore = useSearchBoxStore();
    const { query } = storeToRefs(paramStore);
    const emit = __emit;
    const mainInput = ref(null);
    const emitInputOnFocus = computed(() => {
      var _a;
      return (_a = props.emitInputOnFocus) != null ? _a : true;
    });
    const suggestedValue = computed(
      () => {
        var _a;
        return (_a = props.suggestedValue) != null ? _a : { value: "", override: false, item: { suggestion: "" } };
      }
    );
    const labels = computed(() => props.options.labels);
    const input = ref("");
    const inputValue = computed({
      get: () => input.value,
      set: (value) => {
        searchBoxStore.saveInputValue({ input: value });
        input.value = value;
      }
    });
    const showHint = computed(
      () => {
        var _a, _b;
        return Boolean(inputValue.value) && inputValue.value.length > 0 && ((_b = (_a = suggestedValue.value.item) == null ? void 0 : _a.suggestion) == null ? void 0 : _b.startsWith(inputValue.value));
      }
    );
    const inputAttributes = computed(() => {
      var _a;
      return __spreadValues({}, (_a = props.options.inputAttributes) != null ? _a : {});
    });
    const ariaLabel = computed(() => {
      var _a;
      return (_a = labels.value.searchInputAriaLabel) != null ? _a : "Search input";
    });
    watch(suggestedValue, () => {
      if (suggestedValue.value.override) {
        input.value = suggestedValue.value.item.suggestion;
      }
    });
    watch(query, () => {
      inputValue.value = query.value;
    });
    const handleInput = (evt) => {
      const target = evt == null ? void 0 : evt.target;
      if (target) {
        inputValue.value = target.value;
      }
      emit("input", inputValue.value);
    };
    const handleFocus = () => {
      emit("focus");
      if (emitInputOnFocus.value) {
        handleInput();
      }
    };
    const clear = () => {
      emit("input", "");
    };
    const focus = () => {
      var _a;
      if (!mainInput.value) {
        return;
      }
      (_a = mainInput == null ? void 0 : mainInput.value) == null ? void 0 : _a.focus();
    };
    __expose({ focus });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$_, [
        createElementVNode("div", _hoisted_2$I, [
          createElementVNode("div", {
            class: normalizeClass(["lupa-input-clear-content", { "lupa-input-clear-filled": inputValue.value }]),
            onClick: clear
          }, null, 2)
        ]),
        createElementVNode("div", _hoisted_3$v, [
          createElementVNode("input", {
            class: "lupa-hint",
            "aria-hidden": "true",
            value: showHint.value ? suggestedValue.value.item.suggestion : "",
            disabled: ""
          }, null, 8, _hoisted_4$n),
          withDirectives(createElementVNode("input", mergeProps({
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => inputValue.value = $event)
          }, inputAttributes.value, {
            ref_key: "mainInput",
            ref: mainInput,
            autocomplete: "off",
            "aria-label": ariaLabel.value,
            class: "lupa-search-box-input-field",
            "data-cy": "lupa-search-box-input-field",
            type: "text",
            placeholder: labels.value.placeholder,
            onInput: handleInput,
            onFocus: handleFocus
          }), null, 16, _hoisted_5$e), [
            [vModelText, inputValue.value]
          ])
        ]),
        _ctx.canClose ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "lupa-close-search-container",
          onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("close"))
        }, [
          labels.value.close ? (openBlock(), createElementBlock("span", _hoisted_6$8, toDisplayString(labels.value.close), 1)) : createCommentVNode("", true)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _sfc_main$13 = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxMoreResults",
  props: {
    labels: {},
    showTotalCount: { type: Boolean }
  },
  emits: ["go-to-results"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const searchBoxStore = useSearchBoxStore();
    const { docResults, options } = storeToRefs(searchBoxStore);
    const emit = __emit;
    const totalCount = computed(() => {
      var _a, _b, _c;
      if (!props.showTotalCount) {
        return "";
      }
      const queryKey = (_b = (_a = options.value) == null ? void 0 : _a.panels.find((x) => x.type === "document")) == null ? void 0 : _b.queryKey;
      const total = queryKey ? (_c = docResults.value[queryKey]) == null ? void 0 : _c.total : "";
      return total ? `(${total})` : "";
    });
    const handleClick = () => {
      emit("go-to-results");
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("a", {
        class: "lupa-more-results",
        "data-cy": "lupa-more-results",
        onClick: handleClick
      }, toDisplayString(_ctx.labels.moreResults) + " " + toDisplayString(totalCount.value), 1);
    };
  }
});
const _hoisted_1$Z = { class: "lupa-search-box-history-item" };
const _hoisted_2$H = { class: "lupa-search-box-history-item-content" };
const _sfc_main$12 = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxHistoryItem",
  props: {
    item: {},
    highlighted: { type: Boolean }
  },
  emits: ["remove", "click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const remove = () => {
      emit("remove", { item: props.item });
    };
    const click2 = () => {
      emit("click", { query: props.item });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$Z, [
        createElementVNode("div", _hoisted_2$H, [
          createElementVNode("div", {
            class: normalizeClass(["lupa-search-box-history-item-text", { "lupa-search-box-history-item-highlighted": _ctx.highlighted }]),
            onClick: click2
          }, toDisplayString(_ctx.item), 3),
          createElementVNode("div", {
            class: "lupa-search-box-history-item-clear",
            onClick: remove
          }, "×")
        ])
      ]);
    };
  }
});
const _hoisted_1$Y = {
  key: 0,
  class: "lupa-search-box-history-panel"
};
const _sfc_main$11 = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxHistoryPanel",
  props: {
    options: {}
  },
  emits: ["go-to-results"],
  setup(__props, { emit: __emit }) {
    const historyStore = useHistoryStore();
    const searchBoxStore = useSearchBoxStore();
    const { highlightedIndex } = storeToRefs(searchBoxStore);
    const { items: history } = storeToRefs(historyStore);
    const emit = __emit;
    const highlightIndex = computed(() => {
      var _a;
      return (_a = highlightedIndex.value) != null ? _a : -1;
    });
    const hasHistory = computed(() => history.value && history.value.length > 0);
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });
    onBeforeMount(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
    const remove = ({ item }) => {
      historyStore.remove({ item });
    };
    const removeAll = () => {
      historyStore.clear();
    };
    const goToResults = ({ query }) => {
      emit("go-to-results", { query });
    };
    const handleKeyDown = (e) => {
      if (!hasHistory.value || highlightIndex.value < -1) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        goToResults({ query: history.value[highlightIndex.value] });
      }
    };
    return (_ctx, _cache) => {
      return hasHistory.value ? (openBlock(), createElementBlock("div", _hoisted_1$Y, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(history), (item, index) => {
          return openBlock(), createBlock(_sfc_main$12, {
            key: item,
            item,
            highlighted: index === highlightIndex.value,
            onClick: goToResults,
            onRemove: remove
          }, null, 8, ["item", "highlighted"]);
        }), 128)),
        createElementVNode("div", {
          class: "lupa-search-box-history-clear-all",
          onClick: removeAll
        }, toDisplayString(_ctx.options.labels.clear), 1)
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$X = { class: "lupa-search-box-no-results" };
const _sfc_main$10 = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxNoResults",
  props: {
    labels: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("p", _hoisted_1$X, toDisplayString(_ctx.labels.noResults), 1);
    };
  }
});
const _hoisted_1$W = ["innerHTML"];
const _hoisted_2$G = {
  key: 1,
  "data-cy": "lupa-suggestion-value",
  class: "lupa-suggestion-value"
};
const _hoisted_3$u = {
  key: 2,
  class: "lupa-suggestion-facet",
  "data-cy": "lupa-suggestion-facet"
};
const _hoisted_4$m = {
  class: "lupa-suggestion-facet-label",
  "data-cy": "lupa-suggestion-facet-label"
};
const _hoisted_5$d = {
  class: "lupa-suggestion-facet-value",
  "data-cy": "lupa-suggestion-facet-value"
};
const _sfc_main$$ = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxSuggestion",
  props: {
    suggestion: {},
    highlight: { type: Boolean },
    labels: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const facetKey = computed(() => {
      var _a;
      return ((_a = props.suggestion.facet) == null ? void 0 : _a.key) || "";
    });
    const facetLabel = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = props.suggestion.suggestion) == null ? void 0 : _a.facetLabels) == null ? void 0 : _b[facetKey.value]) || props.labels.defaultFacetLabel || facetKey.value;
      }
    );
    const handleSelect = () => {
      emit("select", {
        suggestion: props.suggestion.suggestion,
        facet: props.suggestion.facet,
        override: true
      });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onClick: _cache[0] || (_cache[0] = ($event) => handleSelect())
      }, [
        _ctx.highlight ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "lupa-suggestion-value",
          "data-cy": "lupa-suggestion-value",
          innerHTML: _ctx.suggestion.displayHighlight
        }, null, 8, _hoisted_1$W)) : (openBlock(), createElementBlock("div", _hoisted_2$G, toDisplayString(_ctx.suggestion.display), 1)),
        _ctx.suggestion.facet ? (openBlock(), createElementBlock("div", _hoisted_3$u, [
          createElementVNode("span", _hoisted_4$m, toDisplayString(facetLabel.value), 1),
          createElementVNode("span", _hoisted_5$d, toDisplayString(_ctx.suggestion.facet.title), 1)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$V = {
  id: "lupa-search-box-suggestions",
  "data-cy": "lupa-search-box-suggestions"
};
const _sfc_main$_ = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxSuggestions",
  props: {
    items: {},
    highlight: { type: Boolean },
    queryKey: {},
    labels: {}
  },
  emits: ["suggestionSelect"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const items = computed(() => {
      var _a;
      return (_a = props.items) != null ? _a : [];
    });
    const highlight = computed(() => {
      var _a;
      return (_a = props.highlight) != null ? _a : true;
    });
    const emit = __emit;
    const searchBoxStore = useSearchBoxStore();
    const { highlightedItem } = storeToRefs(searchBoxStore);
    const highlightedIndex = computed(() => {
      var _a, _b, _c;
      if (props.queryKey !== ((_a = highlightedItem.value) == null ? void 0 : _a.queryKey)) {
        return -1;
      }
      return (_c = (_b = highlightedItem.value) == null ? void 0 : _b.index) != null ? _c : -1;
    });
    const handleSelect = ({
      suggestion,
      override,
      facet
    }) => {
      emit("suggestionSelect", {
        item: {
          item: suggestion,
          queryKey: props.queryKey,
          override,
          facet
        },
        type: "suggestion"
      });
    };
    const getSuggestionKey = (suggestion) => {
      var _a, _b;
      return `${suggestion.display}${(_a = suggestion.facet) == null ? void 0 : _a.key}${(_b = suggestion.facet) == null ? void 0 : _b.title}`;
    };
    watch(highlightedItem, () => {
      var _a;
      if (highlightedIndex.value < 0) {
        return;
      }
      const selected = (_a = props.items[highlightedIndex.value]) != null ? _a : { suggestion: {}, facet: void 0 };
      handleSelect({
        suggestion: selected.suggestion,
        facet: selected.facet,
        override: false
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$V, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(items.value, (item, index) => {
          return openBlock(), createBlock(_sfc_main$$, {
            key: getSuggestionKey(item),
            class: normalizeClass(["lupa-suggestion", index === highlightedIndex.value ? "lupa-suggestion-highlighted" : ""]),
            suggestion: item,
            highlight: highlight.value,
            labels: _ctx.labels,
            "data-cy": "lupa-suggestion",
            onSelect: handleSelect
          }, null, 8, ["class", "suggestion", "highlight", "labels"]);
        }), 128))
      ]);
    };
  }
});
const debounce$1 = (func, timeout) => {
  if (!timeout) {
    return (...args) => {
      func(args);
    };
  }
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};
const _sfc_main$Z = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxSuggestionsWrapper",
  props: {
    panel: {},
    options: {},
    inputValue: {},
    debounce: {},
    labels: {}
  },
  emits: ["fetched", "itemSelect"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const inputValueProp = computed(() => props.inputValue);
    const searchBoxStore = useSearchBoxStore();
    const { suggestionResults } = storeToRefs(searchBoxStore);
    const emit = __emit;
    const searchResult = computed(() => {
      var _a;
      return (_a = suggestionResults.value[props.panel.queryKey]) != null ? _a : [];
    });
    onMounted(() => {
      getSuggestionsDebounced();
    });
    watch(inputValueProp, () => {
      getSuggestionsDebounced();
    });
    const getSuggestions = () => {
      searchBoxStore.querySuggestions({
        queryKey: props.panel.queryKey,
        publicQuery: { searchText: props.inputValue, limit: props.panel.limit },
        options: props.options
      }).then(({ suggestions }) => {
        if (!suggestions) {
          return;
        }
        emit("fetched", { items: suggestions, type: props.panel.type });
      }).catch((err) => {
        console.error(err);
      });
    };
    const getSuggestionsDebounced = debounce$1(getSuggestions, props.debounce);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$_, {
        items: searchResult.value,
        highlight: _ctx.panel.highlight,
        queryKey: _ctx.panel.queryKey,
        labels: _ctx.labels,
        onSuggestionSelect: _cache[0] || (_cache[0] = (item) => _ctx.$emit("itemSelect", item))
      }, null, 8, ["items", "highlight", "queryKey", "labels"]);
    };
  }
});
const useDynamicDataStore = defineStore("dynamicData", () => {
  const loading = ref(false);
  const dynamicDataIdMap = ref({});
  const optionsStore = useOptionsStore();
  const loadedIds = computed(() => Object.keys(dynamicDataIdMap.value));
  const searchResultOptions = computed(() => optionsStore.searchResultOptions);
  const searchBoxOptions = computed(() => optionsStore.searchBoxOptions);
  const dynamicSearchResultData = computed(() => {
    var _a;
    return (_a = searchResultOptions.value) == null ? void 0 : _a.dynamicData;
  });
  const dynamicSearchBoxData = computed(() => {
    var _a;
    return (_a = searchBoxOptions.value) == null ? void 0 : _a.dynamicData;
  });
  const isDynamicDataEnabledForSearchResults = computed(
    () => {
      var _a, _b, _c;
      return (_c = (_b = (_a = searchResultOptions.value) == null ? void 0 : _a.dynamicData) == null ? void 0 : _b.enabled) != null ? _c : false;
    }
  );
  const isDynamicDataEnabledForSearchBox = computed(
    () => {
      var _a, _b, _c;
      return (_c = (_b = (_a = searchBoxOptions.value) == null ? void 0 : _a.dynamicData) == null ? void 0 : _b.enabled) != null ? _c : false;
    }
  );
  const isCacheEnabled = computed(() => {
    var _a, _b;
    return (_b = (_a = dynamicSearchResultData == null ? void 0 : dynamicSearchResultData.value) == null ? void 0 : _a.cache) != null ? _b : false;
  });
  const enhanceSearchResultsWithDynamicData = (_0) => __async(void 0, [_0], function* ({
    result,
    mode
  }) {
    var _a, _b, _c, _d, _e, _f;
    const enabledForMode = mode === "searchBox" ? isDynamicDataEnabledForSearchBox.value : isDynamicDataEnabledForSearchResults.value;
    if (!result || !enabledForMode) {
      return;
    }
    const resultIds = (_b = (_a = result == null ? void 0 : result.items) == null ? void 0 : _a.map((i) => i.id)) != null ? _b : [];
    const similarQueryResultIds = (_e = (_d = (_c = result.similarQueries) == null ? void 0 : _c.map((q) => q.items.map((i) => i.id))) == null ? void 0 : _d.flat()) != null ? _e : [];
    let requestedIds = [...resultIds, ...similarQueryResultIds];
    if (isCacheEnabled.value) {
      requestedIds = requestedIds.filter((i) => !loadedIds.value.includes(i));
    }
    if (!requestedIds.length) {
      return;
    }
    loading.value = true;
    try {
      const dynamicData = dynamicSearchResultData.value || dynamicSearchBoxData.value;
      if (!(dynamicData == null ? void 0 : dynamicData.handler)) {
        return {};
      }
      const dynamicDataResult = (_f = yield dynamicData == null ? void 0 : dynamicData.handler(requestedIds)) != null ? _f : [];
      const seed = {};
      const dynamicDataIdMapValue = dynamicDataResult.reduce(
        (a, c) => __spreadProps(__spreadValues({}, a), { [c.id]: c }),
        seed
      );
      dynamicDataIdMap.value = __spreadValues(__spreadValues({}, dynamicDataIdMap.value), dynamicDataIdMapValue);
    } finally {
      loading.value = false;
    }
  });
  return { dynamicDataIdMap, loading, enhanceSearchResultsWithDynamicData };
});
const joinUrlParts = (...parts) => {
  var _a, _b, _c;
  if (parts.length === 1) {
    return `${parts[0]}`;
  }
  return (_c = (_b = (_a = parts == null ? void 0 : parts.map((part) => part.replace(/(^\/+|\/+$)/g, ""))) == null ? void 0 : _a.filter((part) => part !== "")) == null ? void 0 : _b.join("/")) != null ? _c : "";
};
const _hoisted_1$U = ["src"];
const _sfc_main$Y = /* @__PURE__ */ defineComponent({
  __name: "ProductImage",
  props: {
    item: {},
    options: {},
    wrapperClass: {},
    imageClass: {}
  },
  setup(__props) {
    const props = __props;
    const rootImageUrl = computed(() => props.options.baseUrl);
    const image = computed(() => props.item[props.options.key]);
    const hasFullImageUrl = computed(() => {
      const imageUrl2 = image.value;
      return typeof imageUrl2 === "string" && (imageUrl2.indexOf("http://") === 0 || imageUrl2.indexOf("https://") === 0);
    });
    const imageUrl = computed(() => {
      const imageUrl2 = image.value;
      if (hasFullImageUrl.value) {
        return imageUrl2;
      }
      return rootImageUrl.value ? joinUrlParts(rootImageUrl.value, imageUrl2) : `/${imageUrl2}`;
    });
    const hasImage = computed(() => Boolean(hasFullImageUrl.value || image.value));
    const placeholder = computed(() => props.options.placeholder);
    const finalUrl = computed(() => {
      if (props.options.customUrl) {
        return props.options.customUrl(props.item);
      }
      return hasImage.value ? imageUrl.value : placeholder.value;
    });
    const replaceWithPlaceholder = (e) => {
      var _a;
      const targetImage = e == null ? void 0 : e.target;
      if (targetImage && !((_a = targetImage == null ? void 0 : targetImage.src) == null ? void 0 : _a.includes(placeholder.value))) {
        targetImage.src = placeholder.value;
      }
    };
    const imageAlt = computed(() => {
      const alt = props.options.alt;
      if (alt) {
        return alt(props.item);
      }
      return "";
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass((_a = _ctx.wrapperClass) != null ? _a : "")
      }, [
        createElementVNode("img", mergeProps({
          class: (_b = _ctx.imageClass) != null ? _b : "",
          src: finalUrl.value
        }, { alt: imageAlt.value ? imageAlt.value : void 0 }, { onError: replaceWithPlaceholder }), null, 16, _hoisted_1$U)
      ], 2);
    };
  }
});
const _sfc_main$X = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductImage",
  props: {
    item: {},
    options: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$Y, {
        item: _ctx.item,
        options: _ctx.options,
        "wrapper-class": "lupa-search-box-image-wrapper",
        "image-class": "lupa-search-box-image"
      }, null, 8, ["item", "options"]);
    };
  }
});
const _hoisted_1$T = ["innerHTML"];
const _hoisted_2$F = {
  key: 1,
  class: "lupa-search-box-product-title"
};
const _sfc_main$W = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductTitle",
  props: {
    item: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const title = computed(() => {
      return props.item[props.options.key];
    });
    const isHtml = computed(() => {
      var _a;
      return (_a = props.options.isHtml) != null ? _a : false;
    });
    return (_ctx, _cache) => {
      return isHtml.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "lupa-search-box-product-title",
        innerHTML: title.value
      }, null, 8, _hoisted_1$T)) : (openBlock(), createElementBlock("div", _hoisted_2$F, [
        createElementVNode("strong", null, toDisplayString(title.value), 1)
      ]));
    };
  }
});
const _hoisted_1$S = ["innerHTML"];
const _hoisted_2$E = {
  key: 1,
  class: "lupa-search-box-product-description"
};
const _sfc_main$V = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductDescription",
  props: {
    item: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const description = computed(() => {
      return props.item[props.options.key];
    });
    const isHtml = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options) == null ? void 0 : _a.isHtml) != null ? _b : false;
    });
    return (_ctx, _cache) => {
      return isHtml.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "lupa-search-box-product-description",
        innerHTML: description.value
      }, null, 8, _hoisted_1$S)) : (openBlock(), createElementBlock("div", _hoisted_2$E, toDisplayString(description.value), 1));
    };
  }
});
const _hoisted_1$R = { class: "lupa-search-box-product-price" };
const _sfc_main$U = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductPrice",
  props: {
    item: {},
    options: {},
    labels: {}
  },
  setup(__props) {
    const props = __props;
    const price = computed(() => {
      var _a, _b;
      return formatPrice(
        props.item[props.options.key],
        (_a = props.labels) == null ? void 0 : _a.currency,
        (_b = props.labels) == null ? void 0 : _b.priceSeparator
      );
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$R, [
        createElementVNode("strong", null, toDisplayString(price.value), 1)
      ]);
    };
  }
});
const _hoisted_1$Q = { class: "lupa-search-box-product-regular-price" };
const _sfc_main$T = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductRegularPrice",
  props: {
    item: {},
    options: {},
    labels: {}
  },
  setup(__props) {
    const props = __props;
    const price = computed(() => {
      var _a, _b;
      return formatPrice(
        props.item[props.options.key],
        (_a = props.labels) == null ? void 0 : _a.currency,
        (_b = props.labels) == null ? void 0 : _b.priceSeparator
      );
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$Q, toDisplayString(price.value), 1);
    };
  }
});
const _hoisted_1$P = ["innerHTML"];
const _hoisted_2$D = { key: 0 };
const _hoisted_3$t = { key: 1 };
const _hoisted_4$l = { class: "lupa-search-box-custom-label" };
const _hoisted_5$c = { class: "lupa-search-box-custom-text" };
const _sfc_main$S = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductCustom",
  props: {
    item: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const text = computed(() => props.item[props.options.key]);
    const className = computed(() => props.options.className);
    const label = computed(() => props.options.label);
    const isHtml = computed(() => {
      var _a;
      return (_a = props.options.isHtml) != null ? _a : false;
    });
    const handleClick = () => __async(this, null, function* () {
      if (!props.options.action) {
        return;
      }
      yield props.options.action(props.item);
    });
    return (_ctx, _cache) => {
      return isHtml.value ? (openBlock(), createElementBlock("div", mergeProps({
        key: 0,
        class: [className.value, "lupa-search-box-product-custom"],
        innerHTML: text.value
      }, toHandlers(_ctx.options.action ? { click: handleClick } : {}, true)), null, 16, _hoisted_1$P)) : (openBlock(), createElementBlock("div", mergeProps({
        key: 1,
        class: [className.value, "lupa-search-box-product-custom"]
      }, toHandlers(_ctx.options.action ? { click: handleClick } : {}, true)), [
        !label.value ? (openBlock(), createElementBlock("div", _hoisted_2$D, toDisplayString(text.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_3$t, [
          createElementVNode("div", _hoisted_4$l, toDisplayString(label.value), 1),
          createElementVNode("div", _hoisted_5$c, toDisplayString(text.value), 1)
        ]))
      ], 16));
    };
  }
});
const _hoisted_1$O = ["innerHTML"];
const _sfc_main$R = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductCustomHtml",
  props: {
    item: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const text = computed(() => props.options.html(props.item));
    const className = computed(() => props.options.className);
    const handleClick = () => __async(this, null, function* () {
      if (!props.options.action) {
        return;
      }
      yield props.options.action(props.item);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        class: className.value,
        innerHTML: text.value
      }, toHandlers(_ctx.options.action ? { click: handleClick } : {}, true)), null, 16, _hoisted_1$O);
    };
  }
});
var ResultsLayoutEnum = /* @__PURE__ */ ((ResultsLayoutEnum2) => {
  ResultsLayoutEnum2["GRID"] = "Grid";
  ResultsLayoutEnum2["LIST"] = "List";
  return ResultsLayoutEnum2;
})(ResultsLayoutEnum || {});
const SHADOW_ROOT_ID = "lupa-shadow-id";
const CONTAINER_ROOT_ID = "lupa-search-container";
const scrollToSearchResults = (timeout = 500, containerSelector) => {
  if (timeout) {
    setTimeout(() => scrollTo(containerSelector != null ? containerSelector : RESULT_ROOT_SELECTOR), timeout);
  } else {
    scrollTo(RESULT_ROOT_SELECTOR);
  }
};
const scrollTo = (elementSelector) => {
  var _a, _b;
  let el = document.querySelector(elementSelector);
  const shadowRoot = (_a = document.getElementById(SHADOW_ROOT_ID)) == null ? void 0 : _a.shadowRoot;
  if (!el) {
    el = (_b = shadowRoot == null ? void 0 : shadowRoot.getElementById(elementSelector)) != null ? _b : null;
  }
  if (!el) {
    return;
  }
  const searchContainer = shadowRoot ? shadowRoot.getElementById(CONTAINER_ROOT_ID) : void 0;
  const container = searchContainer != null ? searchContainer : window;
  container.scrollTo({
    top: el.offsetTop,
    behavior: "smooth"
  });
};
const disableBodyScroll = () => {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
};
const enableBodyScroll = () => {
  const scrollY = document.body.style.top;
  document.body.style.position = "";
  document.body.style.top = "";
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
};
const setDocumentTitle = (template, textToInsert = "") => {
  document.title = addParamsToLabel(template, textToInsert);
};
const useSearchResultStore = defineStore("searchResult", () => {
  const searchResult = ref({});
  const columnCount = ref(2);
  const addToCartAmount = ref(1);
  const layout = ref(ResultsLayoutEnum.GRID);
  const loading = ref(false);
  const isMobileSidebarVisible = ref(false);
  const optionsStore = useOptionsStore();
  const paramsStore = useParamsStore();
  const facets = computed(() => searchResult.value.facets);
  const filters = computed(() => searchResult.value.filters);
  const currentQueryText = computed(() => searchResult.value.searchText);
  const totalItems = computed(() => searchResult.value.total);
  const hasResults = computed(() => totalItems.value > 0);
  const labeledFilters = computed(
    () => getLabeledFilters(unfoldFilters(filters.value), facets.value)
  );
  const displayFilters = computed(() => {
    var _a, _b;
    const initialFilters = optionsStore.initialFilters;
    return (_b = (_a = labeledFilters.value) == null ? void 0 : _a.filter((f) => !(initialFilters == null ? void 0 : initialFilters[f.key]))) != null ? _b : [];
  });
  const currentFilterCount = computed(() => {
    var _a, _b;
    return (_b = (_a = displayFilters.value) == null ? void 0 : _a.length) != null ? _b : 0;
  });
  const currentFilterKeys = computed(() => {
    var _a;
    return Object.keys((_a = filters.value) != null ? _a : {});
  });
  const hasAnyFilter = computed(() => {
    var _a;
    return Object.keys((_a = filters.value) != null ? _a : {}).length > 0;
  });
  const itemRange = computed(() => {
    var _a, _b;
    const limit = (_a = paramsStore.limit) != null ? _a : 0;
    const offset = (_b = searchResult.value.offset) != null ? _b : 0;
    return [offset + 1, Math.min(offset + limit, totalItems.value)];
  });
  const isPageEmpty = computed(
    () => {
      var _a;
      return hasResults.value && ((_a = searchResult.value.offset) != null ? _a : 0) >= totalItems.value;
    }
  );
  const setSidebarState = ({ visible }) => {
    if (visible) {
      disableBodyScroll();
    } else {
      enableBodyScroll();
    }
    isMobileSidebarVisible.value = visible;
  };
  const queryFacet = (_0) => __async(void 0, [_0], function* ({ queryKey, facetKey }) {
    var _a, _b, _c, _d;
    const query = { searchText: "", filters: __spreadValues({}, filters.value) };
    const options = (_a = optionsStore.envOptions) != null ? _a : { environment: "production" };
    const result = yield LupaSearchSdk.query(queryKey, query, options);
    if (!result.success) {
      return;
    }
    const facet = (_b = result.facets) == null ? void 0 : _b.find((f) => f.key === facetKey);
    const facetItems = (_c = facet == null ? void 0 : facet.items) != null ? _c : [];
    const updatedResult = __spreadProps(__spreadValues({}, searchResult.value), {
      facets: (_d = facets.value) == null ? void 0 : _d.map((f) => f.key === facetKey ? __spreadProps(__spreadValues({}, f), { items: facetItems }) : f)
    });
    searchResult.value = updatedResult;
  });
  const add = (newSearchResult) => {
    var _a, _b;
    if (!newSearchResult) {
      return {
        searchResult: searchResult.value,
        pageSize: searchResult.value.limit || 0
      };
    }
    if (typeof document !== "undefined") {
      setDocumentTitle(
        (_b = (_a = optionsStore.searchResultOptions) == null ? void 0 : _a.labels) == null ? void 0 : _b.htmlTitleTemplate,
        newSearchResult.searchText
      );
    }
    searchResult.value = newSearchResult;
    return { searchResult: newSearchResult };
  };
  const setColumnCount = ({ width, grid }) => {
    if (!width || !grid) {
      return;
    }
    if (width <= S_MIN_WIDTH) {
      columnCount.value = grid.columns.xs;
    } else if (width > S_MIN_WIDTH && width <= MD_MIN_WIDTH) {
      columnCount.value = grid.columns.sm;
    } else if (width > MD_MIN_WIDTH && width <= L_MIN_WIDTH) {
      columnCount.value = grid.columns.md;
    } else if (width > L_MIN_WIDTH && width <= XL_MIN_WIDTH) {
      columnCount.value = grid.columns.l;
    } else {
      columnCount.value = grid.columns.xl;
    }
  };
  const setAddToCartAmount = (newAddToCartAmount) => {
    if (!newAddToCartAmount) {
      return;
    }
    addToCartAmount.value = newAddToCartAmount;
  };
  const setLayout = (newLayout) => {
    if (!newLayout) {
      return;
    }
    layout.value = newLayout;
  };
  const setLoading = (state) => {
    loading.value = state || false;
  };
  return {
    isMobileSidebarVisible,
    searchResult,
    columnCount,
    addToCartAmount,
    facets,
    filters,
    loading,
    layout,
    currentQueryText,
    totalItems,
    hasResults,
    labeledFilters,
    displayFilters,
    currentFilterCount,
    currentFilterKeys,
    hasAnyFilter,
    itemRange,
    isPageEmpty,
    setSidebarState,
    queryFacet,
    add,
    setColumnCount,
    setAddToCartAmount,
    setLayout,
    setLoading
  };
});
const _hoisted_1$N = { class: "lupa-search-box-add-to-cart-wrapper" };
const _hoisted_2$C = { class: "lupa-search-box-product-addtocart" };
const _hoisted_3$s = ["disabled"];
const _sfc_main$Q = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductAddToCart",
  props: {
    item: {},
    options: {},
    inStock: { type: Boolean }
  },
  emits: ["productEvent"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const inStockValue = computed(() => {
      var _a;
      return (_a = props.inStock) != null ? _a : true;
    });
    const searchResultStore = useSearchResultStore();
    const { addToCartAmount } = storeToRefs(searchResultStore);
    const emit = __emit;
    const loading = ref(false);
    const label = computed(() => {
      return props.options.labels.addToCart;
    });
    const handleClick = () => __async(this, null, function* () {
      loading.value = true;
      yield props.options.action(props.item, addToCartAmount.value);
      emit("productEvent", { type: "addToCart" });
      loading.value = false;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$N, [
        createElementVNode("div", _hoisted_2$C, [
          createElementVNode("button", {
            onClick: withModifiers(handleClick, ["stop", "prevent"]),
            class: normalizeClass(loading.value ? "lupa-add-to-cart-loading" : "lupa-add-to-cart"),
            "data-cy": "lupa-add-to-cart",
            type: "button",
            disabled: !inStockValue.value || loading.value
          }, toDisplayString(label.value), 11, _hoisted_3$s)
        ])
      ]);
    };
  }
});
const __default__$2 = {
  components: {
    SearchBoxProductImage: _sfc_main$X,
    SearchBoxProductTitle: _sfc_main$W,
    SearchBoxProductDescription: _sfc_main$V,
    SearchBoxProductPrice: _sfc_main$U,
    SearchBoxProductRegularPrice: _sfc_main$T,
    SearchBoxProductCustom: _sfc_main$S,
    SearchBoxProductCustomHtml: _sfc_main$R,
    SearchBoxProductAddToCart: _sfc_main$Q
  }
};
const _sfc_main$P = /* @__PURE__ */ defineComponent(__spreadProps(__spreadValues({}, __default__$2), {
  __name: "SearchBoxProductElement",
  props: {
    item: {},
    element: {},
    labels: {},
    isInStock: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const dynamicDataStore = useDynamicDataStore();
    const { loading, dynamicDataIdMap } = storeToRefs(dynamicDataStore);
    const elementComponent = computed(() => {
      switch (props.element.type) {
        case DocumentElementType.IMAGE:
          return "search-box-product-image";
        case DocumentElementType.TITLE:
          return "search-box-product-title";
        case DocumentElementType.DESCRIPTION:
          return "search-box-product-description";
        case DocumentElementType.PRICE:
          return "search-box-product-price";
        case DocumentElementType.REGULARPRICE:
          return "search-box-product-regular-price";
        case DocumentElementType.CUSTOM:
          return "search-box-product-custom";
        case DocumentElementType.CUSTOM_HTML:
          return "search-box-product-custom-html";
        case DocumentElementType.ADDTOCART:
          return "search-box-product-add-to-cart";
      }
      return "search-box-product-title";
    });
    const displayElement = computed(() => {
      return props.element.display ? props.element.display(props.item) : true;
    });
    const isLoadingDynamicData = computed(() => {
      return Boolean(props.element.dynamic && loading.value);
    });
    const enhancedItem = computed(() => {
      var _a, _b, _c, _d;
      if (!((_a = props.item) == null ? void 0 : _a.id)) {
        return props.item;
      }
      const enhancementData = (_d = (_c = dynamicDataIdMap.value) == null ? void 0 : _c[(_b = props.item) == null ? void 0 : _b.id]) != null ? _d : {};
      return __spreadValues(__spreadValues({}, props.item), enhancementData);
    });
    return (_ctx, _cache) => {
      return displayElement.value ? (openBlock(), createBlock(resolveDynamicComponent(elementComponent.value), {
        key: 0,
        item: enhancedItem.value,
        options: _ctx.element,
        labels: _ctx.labels,
        class: normalizeClass({ "lupa-loading-dynamic-data": isLoadingDynamicData.value }),
        inStock: _ctx.isInStock
      }, null, 8, ["item", "options", "labels", "class", "inStock"])) : createCommentVNode("", true);
    };
  }
}));
const _hoisted_1$M = ["href"];
const _hoisted_2$B = { class: "lupa-search-box-product-image-section" };
const _hoisted_3$r = { class: "lupa-search-box-product-details-section" };
const _hoisted_4$k = {
  key: 0,
  class: "lupa-search-box-product-add-to-cart-section"
};
const _sfc_main$O = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProduct",
  props: {
    item: {},
    inputValue: {},
    panelOptions: {},
    labels: {},
    highlighted: { type: Boolean }
  },
  emits: ["product-click"],
  setup(__props, { emit: __emit }) {
    const isInStock = ref(true);
    const props = __props;
    const emit = __emit;
    const link = computed(() => {
      var _a, _b;
      return generateLink((_b = (_a = props.panelOptions.links) == null ? void 0 : _a.details) != null ? _b : "", props.item);
    });
    const imageElements = computed(() => {
      var _a, _b;
      return (_b = (_a = props.panelOptions.elements) == null ? void 0 : _a.filter((e) => e.type === DocumentElementType.IMAGE)) != null ? _b : [];
    });
    const detailElements = computed(() => {
      var _a, _b;
      return (_b = (_a = props.panelOptions.elements) == null ? void 0 : _a.filter(
        (e) => e.type !== DocumentElementType.IMAGE && e.type !== DocumentElementType.ADDTOCART
      )) != null ? _b : [];
    });
    const addToCartElement = computed(() => {
      var _a;
      return (_a = props.panelOptions.elements) == null ? void 0 : _a.find((e) => e.type === DocumentElementType.ADDTOCART);
    });
    const customDocumentHtmlAttributes = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.panelOptions).customDocumentHtmlAttributes) == null ? void 0 : _b.call(_a, props.item)) != null ? _c : {};
    });
    const handleClick = (event) => {
      emit("product-click", {
        item: props.item,
        eventType: "itemClick",
        event
      });
    };
    onMounted(() => {
      checkIfIsInStock();
    });
    const checkIfIsInStock = () => __async(this, null, function* () {
      isInStock.value = props.panelOptions.isInStock ? yield props.panelOptions.isInStock(props.item) : true;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("a", mergeProps({
        class: ["lupa-search-box-product", { "lupa-search-box-product-highlighted": _ctx.highlighted }],
        href: link.value
      }, customDocumentHtmlAttributes.value, {
        "data-cy": "lupa-search-box-product",
        onClick: handleClick
      }), [
        createElementVNode("div", _hoisted_2$B, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(imageElements.value, (element) => {
            return openBlock(), createBlock(_sfc_main$P, {
              class: "lupa-search-box-product-element",
              item: _ctx.item,
              element,
              key: element.key,
              labels: _ctx.labels,
              link: link.value
            }, null, 8, ["item", "element", "labels", "link"]);
          }), 128))
        ]),
        createElementVNode("div", _hoisted_3$r, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(detailElements.value, (element) => {
            return openBlock(), createBlock(_sfc_main$P, {
              class: "lupa-search-box-product-element",
              item: _ctx.item,
              element,
              key: element.key,
              labels: _ctx.labels,
              link: link.value
            }, null, 8, ["item", "element", "labels", "link"]);
          }), 128))
        ]),
        addToCartElement.value ? (openBlock(), createElementBlock("div", _hoisted_4$k, [
          createVNode(_sfc_main$P, {
            class: "lupa-search-box-product-element",
            item: _ctx.item,
            element: addToCartElement.value,
            labels: _ctx.labels,
            link: link.value,
            isInStock: isInStock.value
          }, null, 8, ["item", "element", "labels", "link", "isInStock"])
        ])) : createCommentVNode("", true)
      ], 16, _hoisted_1$M);
    };
  }
});
const getSearchTrackingData = (searchText, type) => {
  return {
    searchQuery: searchText,
    analytics: {
      type,
      label: searchText
    }
  };
};
const useTrackingStore = defineStore("tracking", () => {
  const optionsStore = useOptionsStore();
  const trackSearch = ({
    queryKey,
    query,
    type = "search_query"
  }) => {
    var _a, _b;
    const options = (_a = optionsStore.envOptions) != null ? _a : { environment: "production" };
    const hasFilters = Object.keys((_b = query.filters) != null ? _b : {}).length > 0;
    if (hasFilters) {
      const data2 = getSearchTrackingData(query.searchText, "search_filters");
      track(queryKey, data2, options);
      return;
    }
    const data = getSearchTrackingData(query.searchText, type);
    track(queryKey, data, options);
  };
  const trackResults = ({
    queryKey,
    results
  }) => {
    var _a;
    const options = (_a = optionsStore.envOptions) != null ? _a : { environment: "production" };
    if (results.total > 0) {
      return;
    }
    const data = getSearchTrackingData(results.searchText, "search_zero_results");
    track(queryKey, data, options);
  };
  const trackEvent = ({ queryKey, data }) => {
    var _a, _b, _c, _d, _e;
    const options = (_a = optionsStore.envOptions) != null ? _a : { environment: "production" };
    const trackingOptions = (_b = optionsStore.trackingOptions) != null ? _b : {};
    const items = (_d = (_c = data.analytics) == null ? void 0 : _c.items) != null ? _d : [];
    const mappedItems = ((_e = trackingOptions.analytics) == null ? void 0 : _e.itemMap) ? items.map(trackingOptions.analytics.itemMap) : items;
    track(
      queryKey,
      __spreadProps(__spreadValues({}, data), {
        analytics: data.analytics ? __spreadProps(__spreadValues({}, data.analytics), { items: mappedItems }) : void 0
      }),
      options
    );
  };
  return { trackSearch, trackResults, trackEvent };
});
const _hoisted_1$L = { id: "lupa-search-box-products" };
const _sfc_main$N = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProducts",
  props: {
    items: {},
    inputValue: {},
    panelOptions: {},
    labels: {}
  },
  emits: ["product-click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const searchBoxStore = useSearchBoxStore();
    const historyStore = useHistoryStore();
    const trackingStore = useTrackingStore();
    const optionsStore = useOptionsStore();
    const { boxRoutingBehavior } = storeToRefs(optionsStore);
    const emit = __emit;
    const { highlightedItem } = storeToRefs(searchBoxStore);
    const highlightedIndex = computed(() => {
      var _a, _b, _c;
      if (props.panelOptions.queryKey !== ((_a = highlightedItem.value) == null ? void 0 : _a.queryKey)) {
        return -1;
      }
      return (_c = (_b = highlightedItem.value) == null ? void 0 : _b.index) != null ? _c : -1;
    });
    const handleProductClick = ({
      item,
      eventType,
      event
    }) => {
      var _a, _b;
      const link = generateLink((_b = (_a = props.panelOptions.links) == null ? void 0 : _a.details) != null ? _b : "", item);
      const title = props.panelOptions.titleKey ? item[props.panelOptions.titleKey] || "" : "";
      const id = props.panelOptions.idKey ? item[props.panelOptions.idKey] : "";
      if (props.panelOptions.titleKey) {
        historyStore.add({
          item: item[props.panelOptions.titleKey] || ""
        });
      }
      if (!props.panelOptions.idKey) {
        return;
      }
      trackingStore.trackEvent({
        queryKey: props.panelOptions.queryKey,
        data: {
          itemId: id,
          searchQuery: props.inputValue,
          type: eventType || "itemClick",
          analytics: {
            type: "autocomplete_product_click",
            label: title != null ? title : link,
            items: [item]
          }
        }
      });
      if (!link || eventType === "addToCart") {
        return;
      }
      emit("product-click");
      handleRoutingEvent(link, event, boxRoutingBehavior.value === "event");
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$L, [
        _ctx.$slots.productCard ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(_ctx.items, (item, index) => {
          return renderSlot(_ctx.$slots, "productCard", {
            key: index,
            item,
            panelOptions: _ctx.panelOptions,
            labels: _ctx.labels,
            highlighted: index === highlightedIndex.value,
            inputValue: _ctx.inputValue,
            itemClicked: handleProductClick
          });
        }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(_ctx.items, (item, index) => {
          return openBlock(), createBlock(_sfc_main$O, {
            key: index,
            item,
            panelOptions: _ctx.panelOptions,
            labels: _ctx.labels,
            highlighted: index === highlightedIndex.value,
            inputValue: _ctx.inputValue,
            onProductClick: handleProductClick
          }, null, 8, ["item", "panelOptions", "labels", "highlighted", "inputValue"]);
        }), 128))
      ]);
    };
  }
});
const _sfc_main$M = /* @__PURE__ */ defineComponent({
  __name: "SearchBoxProductsWrapper",
  props: {
    panel: {},
    inputValue: {},
    options: {},
    labels: {},
    debounce: {}
  },
  emits: ["fetched"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const searchBoxStore = useSearchBoxStore();
    const dynamicDataStore = useDynamicDataStore();
    const { docResults } = storeToRefs(searchBoxStore);
    const emit = __emit;
    const searchResult = computed(() => {
      var _a;
      return (_a = docResults.value[props.panel.queryKey]) != null ? _a : null;
    });
    const inputValueProp = computed(() => props.inputValue);
    onMounted(() => {
      getItemsDebounced();
    });
    watch(inputValueProp, () => {
      getItemsDebounced();
    });
    const enhancePanelData = () => __async(this, null, function* () {
      yield dynamicDataStore.enhanceSearchResultsWithDynamicData({
        result: searchResult.value,
        mode: "searchBox"
      });
    });
    const enhanceDataDebounced = debounce$1(enhancePanelData, props.debounce);
    const getItems = () => {
      searchBoxStore.queryDocuments({
        queryKey: props.panel.queryKey,
        publicQuery: { searchText: props.inputValue, limit: props.panel.limit },
        options: props.options
      }).then(({ result }) => {
        if (!(result == null ? void 0 : result.items.length)) {
          return;
        }
        emit("fetched", {
          items: result.items,
          type: props.panel.type
        });
        enhanceDataDebounced();
      });
    };
    const getItemsDebounced = debounce$1(getItems, props.debounce);
    return (_ctx, _cache) => {
      var _a, _b;
      return openBlock(), createBlock(_sfc_main$N, {
        items: (_b = (_a = searchResult.value) == null ? void 0 : _a.items) != null ? _b : [],
        panelOptions: _ctx.panel,
        labels: _ctx.labels,
        inputValue: _ctx.inputValue,
        onProductClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("product-click"))
      }, createSlots({ _: 2 }, [
        _ctx.$slots.productCard ? {
          name: "productCard",
          fn: withCtx((props2) => [
            renderSlot(_ctx.$slots, "productCard", normalizeProps(guardReactiveProps(props2)))
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["items", "panelOptions", "labels", "inputValue"]);
    };
  }
});
const _hoisted_1$K = {
  key: 0,
  id: "lupa-search-box-panel"
};
const _hoisted_2$A = ["data-cy"];
const _hoisted_3$q = {
  key: 0,
  class: "lupa-panel-title"
};
const _hoisted_4$j = {
  key: 1,
  id: "lupa-search-box-panel"
};
const __default__$1 = {
  components: {
    SearchBoxSuggestionsWrapper: _sfc_main$Z,
    SearchBoxProductsWrapper: _sfc_main$M
  }
};
const _sfc_main$L = /* @__PURE__ */ defineComponent(__spreadProps(__spreadValues({}, __default__$1), {
  __name: "SearchBoxMainPanel",
  props: {
    options: {},
    inputValue: {},
    isSearchContainer: { type: Boolean },
    focused: { type: Boolean },
    history: {}
  },
  emits: [
    "go-to-results",
    "clear-history-item",
    "clear-history",
    "fetched",
    "itemSelect"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const panelContainer = ref(null);
    const history = computed(() => {
      var _a;
      return (_a = props.history) != null ? _a : [];
    });
    const labels = computed(() => props.options.labels);
    const panels = computed(() => props.options.panels);
    const sdkOptions = computed(() => props.options.options);
    const searchBoxStore = useSearchBoxStore();
    const { suggestionResults, hasAnyResults, panelItemCounts } = storeToRefs(searchBoxStore);
    const emit = __emit;
    const displayResults = computed(() => {
      var _a;
      return ((_a = props.inputValue) == null ? void 0 : _a.length) >= props.options.minInputLength;
    });
    const displayHistory = computed(
      () => {
        var _a;
        return Boolean(props.options.history) && ((_a = props.inputValue) == null ? void 0 : _a.length) < 1 && props.options.minInputLength > 0;
      }
    );
    const displayPanels = computed(
      () => props.isSearchContainer ? panels.value.filter((p) => p.type === SearchBoxPanelType.SUGGESTION) : panels.value
    );
    const getInput = (panel) => {
      var _a, _b;
      if (panel.type === SearchBoxPanelType.SUGGESTION || !panel.searchBySuggestion) {
        return props.inputValue;
      }
      const queryKey = (_a = panels.value.find((x) => x.type === SearchBoxPanelType.SUGGESTION)) == null ? void 0 : _a.queryKey;
      const displaySuggestion = queryKey && ((_b = suggestionResults.value[queryKey]) == null ? void 0 : _b.length) ? suggestionResults.value[queryKey][0] : "";
      return displaySuggestion ? displaySuggestion.suggestion.suggestion : props.inputValue;
    };
    const highlightChange = ({ action }) => {
      searchBoxStore.highlightChange({ action });
    };
    onMounted(() => {
      window.addEventListener("resize", appHeight);
      window.addEventListener("keydown", handleNavigation);
      setTimeout(() => {
        appHeight();
      });
    });
    onBeforeUnmount(() => {
      highlightChange({ action: "clear" });
      window.removeEventListener("resize", appHeight);
      window.removeEventListener("keydown", handleNavigation);
      searchBoxStore.resetHighlightIndex();
    });
    const handleNavigation = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          highlightChange({ action: "down" });
          break;
        case "ArrowUp":
          e.preventDefault();
          highlightChange({ action: "up" });
          break;
      }
    };
    const handleGoToResults = ({ query } = { query: "" }) => {
      emit("go-to-results", { query });
    };
    const remove = ({ item }) => {
      emit("clear-history-item", { item });
    };
    const removeAll = () => {
      emit("clear-history");
    };
    const getComponent = (type) => {
      switch (type) {
        case "suggestion":
          return "SearchBoxSuggestionsWrapper";
        default:
          return "SearchBoxProductsWrapper";
      }
    };
    const appHeight = () => {
      if (!document || !panelContainer.value) {
        return;
      }
      const doc = document.documentElement;
      const panel = panelContainer.value;
      doc.style.setProperty(
        "--lupa-available-height",
        `${window.innerHeight - panel.getBoundingClientRect().y - 10}px`
      );
    };
    const numberOfVisiblePanels = computed(() => {
      return panelItemCounts.value.filter((v) => v.count > 0).length;
    });
    const expandOnSinglePanel = computed(() => {
      return numberOfVisiblePanels.value === 1 && props.options.expandOnSinglePanel;
    });
    const showTopResultsPanelTitle = (queryKey) => {
      const panel = panelItemCounts.value.find((v) => v.queryKey === queryKey);
      return (panel == null ? void 0 : panel.count) > 0 && (panel == null ? void 0 : panel.input.length) < 1;
    };
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", {
        ref_key: "panelContainer",
        ref: panelContainer
      }, [
        displayResults.value ? (openBlock(), createElementBlock("div", _hoisted_1$K, [
          createElementVNode("div", {
            class: "lupa-main-panel",
            style: normalizeStyle(expandOnSinglePanel.value ? { display: "block" } : {}),
            "data-cy": "lupa-main-panel"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(displayPanels.value, (panel, index) => {
              var _a2, _b;
              return openBlock(), createElementBlock("div", {
                key: index,
                class: normalizeClass([
                  "lupa-panel-" + panel.type + "-index",
                  panel.customClassName ? panel.customClassName : ""
                ]),
                "data-cy": "lupa-panel-" + panel.type + "-index"
              }, [
                ((_a2 = panel.labels) == null ? void 0 : _a2.topResultsTitle) && showTopResultsPanelTitle(panel.queryKey) ? (openBlock(), createElementBlock("div", _hoisted_3$q, toDisplayString((_b = panel.labels) == null ? void 0 : _b.topResultsTitle), 1)) : createCommentVNode("", true),
                panel.queryKey ? (openBlock(), createBlock(resolveDynamicComponent(getComponent(panel.type)), {
                  key: 1,
                  panel,
                  options: sdkOptions.value,
                  debounce: _ctx.options.debounce,
                  inputValue: getInput(panel),
                  labels: labels.value,
                  onFetched: _cache[0] || (_cache[0] = (data) => _ctx.$emit("fetched", data)),
                  onItemSelect: _cache[1] || (_cache[1] = (item) => _ctx.$emit("itemSelect", item)),
                  onProductClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("product-click"))
                }, createSlots({ _: 2 }, [
                  _ctx.$slots.productCard ? {
                    name: "productCard",
                    fn: withCtx((props2) => [
                      renderSlot(_ctx.$slots, "productCard", normalizeProps(guardReactiveProps(props2)))
                    ]),
                    key: "0"
                  } : void 0
                ]), 1064, ["panel", "options", "debounce", "inputValue", "labels"])) : createCommentVNode("", true)
              ], 10, _hoisted_2$A);
            }), 128))
          ], 4),
          !unref(hasAnyResults) && _ctx.options.showNoResultsPanel ? (openBlock(), createBlock(_sfc_main$10, {
            key: 0,
            labels: labels.value
          }, null, 8, ["labels"])) : createCommentVNode("", true),
          unref(hasAnyResults) || !_ctx.options.hideMoreResultsButtonOnNoResults ? (openBlock(), createBlock(_sfc_main$13, {
            key: 1,
            labels: labels.value,
            showTotalCount: (_a = _ctx.options.showTotalCount) != null ? _a : false,
            onGoToResults: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("go-to-results"))
          }, null, 8, ["labels", "showTotalCount"])) : createCommentVNode("", true)
        ])) : displayHistory.value ? (openBlock(), createElementBlock("div", _hoisted_4$j, [
          createVNode(_sfc_main$11, {
            options: _ctx.options.history,
            history: history.value,
            onGoToResults: handleGoToResults,
            onRemove: remove,
            onRemoveAll: removeAll
          }, null, 8, ["options", "history"])
        ])) : createCommentVNode("", true)
      ], 512);
    };
  }
}));
const BIND_EVENT = "click";
const getElements = (selectors = []) => {
  var _a;
  return (_a = selectors == null ? void 0 : selectors.map((selector) => document.querySelector(selector))) != null ? _a : [];
};
const bindSearchTriggers = (triggers = [], event) => {
  const elements = getElements(triggers);
  elements.forEach((e) => e == null ? void 0 : e.addEventListener(BIND_EVENT, event));
};
const unbindSearchTriggers = (triggers = [], event) => {
  const elements = getElements(triggers);
  elements.forEach((e) => e == null ? void 0 : e.removeEventListener(BIND_EVENT, event));
};
const _hoisted_1$J = { id: "lupa-search-box" };
const _hoisted_2$z = { class: "lupa-search-box-wrapper" };
const _sfc_main$K = /* @__PURE__ */ defineComponent({
  __name: "SearchBox",
  props: {
    options: {},
    isSearchContainer: { type: Boolean }
  },
  setup(__props) {
    var _a;
    const defaultSuggestedValue = {
      item: { suggestion: "" },
      queryKey: "",
      override: false
    };
    const props = __props;
    const historyStore = useHistoryStore();
    const paramsStore = useParamsStore();
    const searchBoxStore = useSearchBoxStore();
    const optionsStore = useOptionsStore();
    const trackingStore = useTrackingStore();
    const redirectionStore = useRedirectionStore();
    const inputValue = ref("");
    const suggestedValue = ref(defaultSuggestedValue);
    const opened = ref(props.isSearchContainer);
    const searchBoxInput = ref(null);
    const { highlightedDocument } = storeToRefs(searchBoxStore);
    const searchValue = computed(() => {
      return suggestedValue.value.override ? suggestedValue.value.item.suggestion : inputValue.value;
    });
    const inputOptions = computed(
      () => pick(props.options, ["minInputLength", "labels", "links", "inputAttributes"])
    );
    const panelOptions = computed(
      () => pick(props.options, [
        "minInputLength",
        "panels",
        "history",
        "labels",
        "links",
        "options",
        "debounce",
        "showTotalCount",
        "hideMoreResultsButtonOnNoResults",
        "showNoResultsPanel",
        "expandOnSinglePanel"
      ])
    );
    const searchTriggers = computed(() => {
      var _a2;
      return (_a2 = props.options.searchTriggers) != null ? _a2 : [];
    });
    const goToResultsDebounced = debounce$1(paramsStore.goToResults, (_a = props.options.debounce) != null ? _a : 300);
    onMounted(() => {
      var _a2;
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("click", handleMouseClick);
      paramsStore.setSearchResultsLink(props.options.links.searchResults);
      searchBoxStore.saveOptions({ newOptions: props.options });
      optionsStore.setSearchBoxOptions({ options: props.options });
      redirectionStore.initiate(props.options.redirections, props.options.options);
      bindSearchTriggers(searchTriggers.value, handleCurrentValueSearch);
      if (props.isSearchContainer && searchBoxInput.value) {
        (_a2 = searchBoxInput.value) == null ? void 0 : _a2.focus();
      }
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleMouseClick);
      unbindSearchTriggers(searchTriggers.value, handleCurrentValueSearch);
    });
    const handleMouseClick = (e) => {
      var _a2, _b;
      const el = document.getElementById("lupa-search-box");
      const elementClass = (_b = (_a2 = e.target) == null ? void 0 : _a2.className) != null ? _b : "";
      const hasLupaClass = typeof elementClass.includes == "function" && elementClass.includes("lupa-search-box");
      const isOutsideElement = el && !el.contains(e.target) && !hasLupaClass;
      if (!isOutsideElement) {
        return;
      }
      opened.value = false;
      suggestedValue.value = defaultSuggestedValue;
    };
    const handleKeyDown = (e) => {
      if (!opened.value) {
        return;
      }
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          selectSuggestion(__spreadProps(__spreadValues({}, suggestedValue.value), { override: true }));
          break;
        case "Enter":
          e.preventDefault();
          handleSearch();
          resetValues();
          break;
      }
    };
    const handleInput = (value) => {
      var _a2;
      opened.value = true;
      inputValue.value = (_a2 = value == null ? void 0 : value.replace(/\s+$/, "")) != null ? _a2 : "";
      suggestedValue.value = defaultSuggestedValue;
      trackSearchQuery(value);
      if (props.isSearchContainer) {
        goToResultsDebounced({
          searchText: value
        });
      }
    };
    const handleItemsFetch = (data) => {
      var _a2;
      switch (data.type) {
        case SearchBoxPanelType.SUGGESTION: {
          const item = data.items[0];
          let suggestion = item || { suggestion: "" };
          suggestion = !suggestion.suggestion.includes(inputValue.value) || suggestion.suggestion.length === ((_a2 = inputValue.value) == null ? void 0 : _a2.length) ? { suggestion: "" } : suggestion;
          suggestedValue.value = {
            item: suggestion,
            override: false,
            queryKey: ""
          };
          break;
        }
      }
    };
    const handleItemSelect = (data) => {
      switch (data.type) {
        case SearchBoxPanelType.SUGGESTION: {
          const suggestion = data.item;
          selectSuggestion(suggestion, suggestion.override);
          break;
        }
      }
    };
    const selectSuggestion = (inputSuggestion, shouldSearch = false) => {
      if (inputSuggestion.item.suggestion) {
        suggestedValue.value = __spreadProps(__spreadValues({}, inputSuggestion), {
          override: true
        });
        if (inputSuggestion.override) {
          trackSuggestionClick();
        }
        inputValue.value = inputSuggestion.override ? inputSuggestion.item.suggestion : inputValue.value;
      }
      if (shouldSearch) {
        handleSearch();
      }
    };
    const handleNavigateDocument = ({ link }) => {
      if (!link) {
        return;
      }
      window.location.assign(link);
    };
    const handleCurrentValueSearch = () => {
      var _a2;
      if (((_a2 = searchValue.value) == null ? void 0 : _a2.length) < props.options.minInputLength) {
        return;
      }
      opened.value = false;
      paramsStore.goToResults({ searchText: searchValue.value });
      resetValues();
    };
    const handleSearch = ({ query } = { query: "" }) => {
      var _a2;
      const searchText = query || searchValue.value;
      if (searchText.length < props.options.minInputLength) {
        return;
      }
      if ((_a2 = highlightedDocument.value) == null ? void 0 : _a2.doc) {
        trackDocumentClick(highlightedDocument.value);
        handleNavigateDocument(highlightedDocument.value);
        return;
      }
      trackSuggestionClick();
      historyStore.add({ item: searchText });
      opened.value = false;
      paramsStore.goToResults({ searchText, facet: suggestedValue.value.facet });
    };
    const trackDocumentClick = (doc) => {
      if (!doc.queryKey || !doc.doc) {
        return;
      }
      trackingStore.trackEvent({
        queryKey: doc.queryKey,
        data: {
          itemId: doc.id,
          searchQuery: inputValue.value,
          type: "itemClick",
          analytics: {
            type: "autocomplete_product_click",
            label: doc.title || doc.id,
            items: [doc]
          }
        }
      });
    };
    const trackSearchQuery = (query) => {
      if (!query) {
        return;
      }
      trackingStore.trackSearch({
        queryKey: suggestedValue.value.queryKey,
        query: {
          searchText: query
        }
      });
    };
    const trackSuggestionClick = (suggestion) => {
      var _a2;
      if (suggestion || ((_a2 = inputValue.value) == null ? void 0 : _a2.length) < props.options.minInputLength || inputValue.value === searchValue.value) {
        return;
      }
      trackingStore.trackEvent({
        queryKey: suggestedValue.value.queryKey,
        data: {
          itemId: suggestion || searchValue.value,
          searchQuery: inputValue.value,
          type: "suggestionClick",
          analytics: {
            type: "autocomplete_suggestion_click",
            label: suggestion || searchValue.value
          }
        }
      });
    };
    const resetValues = () => {
      inputValue.value = "";
      suggestedValue.value = defaultSuggestedValue;
    };
    const handleProductClick = () => {
      opened.value = false;
    };
    const slotProps = (props2) => {
      return __spreadValues({}, props2);
    };
    return (_ctx, _cache) => {
      var _a2;
      return openBlock(), createElementBlock("div", _hoisted_1$J, [
        createElementVNode("div", _hoisted_2$z, [
          createVNode(_sfc_main$14, {
            options: inputOptions.value,
            suggestedValue: suggestedValue.value,
            "can-close": (_a2 = _ctx.isSearchContainer) != null ? _a2 : false,
            "emit-input-on-focus": !_ctx.isSearchContainer,
            ref_key: "searchBoxInput",
            ref: searchBoxInput,
            onInput: handleInput,
            onFocus: _cache[0] || (_cache[0] = ($event) => opened.value = true),
            onClose: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("close"))
          }, null, 8, ["options", "suggestedValue", "can-close", "emit-input-on-focus"]),
          opened.value || _ctx.isSearchContainer ? (openBlock(), createBlock(_sfc_main$L, {
            key: 0,
            options: panelOptions.value,
            inputValue: inputValue.value,
            isSearchContainer: _ctx.isSearchContainer,
            onFetched: handleItemsFetch,
            onItemSelect: handleItemSelect,
            onGoToResults: handleSearch,
            onProductClick: handleProductClick
          }, createSlots({ _: 2 }, [
            _ctx.$slots.productCard ? {
              name: "productCard",
              fn: withCtx((props2) => [
                renderSlot(_ctx.$slots, "productCard", normalizeProps(guardReactiveProps(slotProps(props2))))
              ]),
              key: "0"
            } : void 0
          ]), 1032, ["options", "inputValue", "isSearchContainer"])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
const createPublicQuery = (queryParams, sortOptions, defaultPageSize) => {
  var _a;
  const publicQuery = {};
  for (const param in queryParams) {
    const value = queryParams[param];
    if (!value && param !== QUERY_PARAMS_PARSED.QUERY) {
      continue;
    }
    switch (param) {
      case QUERY_PARAMS_PARSED.QUERY:
        publicQuery.searchText = Array.isArray(value) ? value[0] : value != null ? value : "";
        break;
      case QUERY_PARAMS_PARSED.LIMIT:
        publicQuery.limit = Number(value) || defaultPageSize;
        break;
      case QUERY_PARAMS_PARSED.PAGE:
        publicQuery.offset = getOffset(
          Number(value),
          Number(queryParams[QUERY_PARAMS_PARSED.LIMIT]) || defaultPageSize || DEFAULT_OPTIONS_RESULTS.pagination.sizeSelection.sizes[0]
        );
        break;
      case QUERY_PARAMS_PARSED.SORT: {
        const config = (_a = sortOptions == null ? void 0 : sortOptions.find(
          (x) => x.key === queryParams[QUERY_PARAMS_PARSED.SORT]
        )) == null ? void 0 : _a.config;
        if (config) {
          publicQuery.sort = config;
        }
        break;
      }
    }
  }
  publicQuery.sort = publicQuery.sort || getDefaultSort(sortOptions);
  publicQuery.filters = queryParams.filters;
  return publicQuery;
};
const getDefaultSort = (sortOptions) => {
  var _a;
  return ((_a = sortOptions == null ? void 0 : sortOptions.find((s) => Boolean(s.default))) == null ? void 0 : _a.config) || void 0;
};
const getOffset = (page, limit = 10) => {
  if (!page || page === 1 || page < 0)
    return 0;
  return (page - 1) * limit;
};
const getPublicQuery = (publicQuery, initialFilters, isProductList) => {
  return __spreadProps(__spreadValues({}, publicQuery), {
    filters: __spreadValues(__spreadValues({}, initialFilters), publicQuery.filters),
    searchText: isProductList ? "" : publicQuery.searchText
  });
};
const getSearchParams = (url, params, baseUrl) => {
  let searchParams;
  if (typeof window !== "undefined") {
    searchParams = params || new URLSearchParams(window.location.search);
  } else {
    if (url) {
      searchParams = params || new URLSearchParams(new URL(url, baseUrl).search);
    } else {
      throw new Error("LupaSaerch: ssr.url is required on the server side");
    }
  }
  return searchParams;
};
const getInitialSearchResults = (options, defaultData) => __async(void 0, null, function* () {
  var _a, _b, _c;
  const searchParams = getSearchParams((_a = options.ssr) == null ? void 0 : _a.url, void 0, (_b = options.ssr) == null ? void 0 : _b.baseUrl);
  const publicQuery = createPublicQuery(
    parseParams(searchParams),
    options.sort,
    defaultData == null ? void 0 : defaultData.pageSize
  );
  const query = getPublicQuery(publicQuery, (_c = defaultData == null ? void 0 : defaultData.filters) != null ? _c : {}, false);
  try {
    const result = yield LupaSearchSdk.query(options.queryKey, query, options.options);
    return result;
  } catch (e) {
    options.options.onError(e);
  }
});
const _hoisted_1$I = {
  key: 0,
  id: "lupa-search-results-did-you-mean"
};
const _hoisted_2$y = {
  key: 0,
  "data-cy": "suggested-search-text-label"
};
const _hoisted_3$p = {
  key: 1,
  "data-cy": "did-you-mean-label"
};
const _hoisted_4$i = { key: 1 };
const _sfc_main$J = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsDidYouMean",
  props: {
    labels: {}
  },
  setup(__props) {
    const searchResultStore = useSearchResultStore();
    const paramStore = useParamsStore();
    const { searchResult } = storeToRefs(searchResultStore);
    const didYouMeanValue = computed(() => {
      var _a;
      return ((_a = searchResult.value.didYouMean) == null ? void 0 : _a.options[0].text) || "";
    });
    const insertValue = (text) => {
      if (text.includes("{1}")) {
        return addParamsToLabel(text, searchResult.value.searchText);
      }
      return text;
    };
    const getStyle = (text) => {
      if (text.includes("{1}")) {
        return "lupa-highlighted-search-text";
      }
      return "";
    };
    const goToResults = ({
      searchText,
      facet
    }) => {
      paramStore.goToResults({ searchText, facet });
    };
    return (_ctx, _cache) => {
      return unref(searchResult).suggestedSearchText || didYouMeanValue.value ? (openBlock(), createElementBlock("div", _hoisted_1$I, [
        unref(searchResult).suggestedSearchText ? (openBlock(), createElementBlock("div", _hoisted_2$y, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.labels.noResultsSuggestion.split(" "), (label, index) => {
            return openBlock(), createElementBlock("span", { key: index }, [
              createElementVNode("span", {
                class: normalizeClass(getStyle(label))
              }, toDisplayString(insertValue(label)) + " ", 3)
            ]);
          }), 128))
        ])) : createCommentVNode("", true),
        didYouMeanValue.value ? (openBlock(), createElementBlock("div", _hoisted_3$p, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.labels.didYouMean.split(" "), (label, index) => {
            return openBlock(), createElementBlock("span", { key: index }, [
              label.includes("{1}") ? (openBlock(), createElementBlock("span", {
                key: 0,
                class: "lupa-did-you-mean lupa-highlighted-search-text",
                "data-cy": "did-you-mean-value",
                onClick: _cache[0] || (_cache[0] = ($event) => goToResults({ searchText: didYouMeanValue.value }))
              }, toDisplayString(didYouMeanValue.value) + " ", 1)) : (openBlock(), createElementBlock("span", _hoisted_4$i, toDisplayString(label) + " ", 1))
            ]);
          }), 128))
        ])) : createCommentVNode("", true)
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$H = {
  key: 0,
  class: "lupa-search-results-summary"
};
const _hoisted_2$x = ["innerHTML"];
const _sfc_main$I = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsSummary",
  props: {
    label: {},
    clearable: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const { totalItems, itemRange } = storeToRefs(searchResultStore);
    const summaryLabel = computed(() => {
      const range = itemRange.value.join("-");
      return addParamsToLabel(props.label, range, `<span>${totalItems.value}</span>`);
    });
    return (_ctx, _cache) => {
      return unref(totalItems) > 0 ? (openBlock(), createElementBlock("div", _hoisted_1$H, [
        createElementVNode("div", { innerHTML: summaryLabel.value }, null, 8, _hoisted_2$x),
        _ctx.clearable ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: "lupa-filter-clear",
          "data-cy": "lupa-facets-summary-clear",
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("clear"))
        }, "✕")) : createCommentVNode("", true)
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$G = {
  key: 0,
  class: "lupa-result-page-title",
  "data-cy": "lupa-result-page-title"
};
const _hoisted_2$w = { key: 0 };
const _hoisted_3$o = {
  key: 1,
  class: "lupa-results-total-count"
};
const _hoisted_4$h = ["innerHTML"];
const _sfc_main$H = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsTitle",
  props: {
    options: {},
    isProductList: { type: Boolean },
    showSummary: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const { currentQueryText, totalItems, searchResult } = storeToRefs(searchResultStore);
    const suggestedSearchText = computed(() => searchResult.value.suggestedSearchText);
    const queryText = computed(() => {
      return suggestedSearchText.value || currentQueryText.value;
    });
    const showProductCount = computed(() => {
      var _a;
      return Boolean((_a = props.options.toolbar) == null ? void 0 : _a.totalCount);
    });
    const showSearchTitle = computed(() => {
      var _a;
      return Boolean(
        ((_a = props.options.labels) == null ? void 0 : _a.searchResults) && (currentQueryText.value || props.isProductList)
      );
    });
    const descriptionTop = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.categories) == null ? void 0 : _a.current) == null ? void 0 : _b.descriptionTop;
    });
    const summaryLabel = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.labels) == null ? void 0 : _a.itemCount) != null ? _b : "";
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        showSearchTitle.value ? (openBlock(), createElementBlock("h1", _hoisted_1$G, [
          createTextVNode(toDisplayString(_ctx.options.labels.searchResults), 1),
          queryText.value ? (openBlock(), createElementBlock("span", _hoisted_2$w, "'" + toDisplayString(queryText.value) + "'", 1)) : createCommentVNode("", true),
          showProductCount.value ? (openBlock(), createElementBlock("span", _hoisted_3$o, "(" + toDisplayString(unref(totalItems)) + ")", 1)) : createCommentVNode("", true)
        ])) : createCommentVNode("", true),
        _ctx.showSummary ? (openBlock(), createBlock(_sfc_main$I, {
          key: 1,
          label: summaryLabel.value
        }, null, 8, ["label"])) : createCommentVNode("", true),
        descriptionTop.value ? (openBlock(), createElementBlock("div", {
          key: 2,
          class: "lupa-result-page-description-top",
          innerHTML: descriptionTop.value
        }, null, 8, _hoisted_4$h)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$F = { class: "lupa-search-result-filter-value" };
const _hoisted_2$v = {
  class: "lupa-current-filter-label",
  "data-cy": "lupa-current-filter-label"
};
const _hoisted_3$n = {
  class: "lupa-current-filter-value",
  "data-cy": "lupa-current-filter-value"
};
const _sfc_main$G = /* @__PURE__ */ defineComponent({
  __name: "CurrentFilterDisplay",
  props: {
    filter: {}
  },
  emits: ["remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const handleClick = () => {
      emit("remove", { filter: props.filter });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$F, [
        createElementVNode("div", {
          class: "lupa-current-filter-action",
          onClick: handleClick
        }, "⨉"),
        createElementVNode("div", _hoisted_2$v, toDisplayString(_ctx.filter.label) + ": ", 1),
        createElementVNode("div", _hoisted_3$n, toDisplayString(_ctx.filter.value), 1)
      ]);
    };
  }
});
const _hoisted_1$E = { class: "lupa-filter-title-text" };
const _hoisted_2$u = {
  key: 0,
  class: "lupa-filter-count"
};
const _hoisted_3$m = {
  key: 0,
  class: "filter-values"
};
const _hoisted_4$g = { class: "lupa-current-filter-list" };
const _sfc_main$F = /* @__PURE__ */ defineComponent({
  __name: "CurrentFilters",
  props: {
    options: {},
    expandable: { type: Boolean }
  },
  setup(__props) {
    const isOpen = ref(false);
    const paramsStore = useParamsStore();
    const searchResultStore = useSearchResultStore();
    const { filters, displayFilters, currentFilterCount } = storeToRefs(searchResultStore);
    const currentFilters = computed(() => filters.value);
    const hasFilters = computed(() => {
      var _a;
      return ((_a = displayFilters.value) == null ? void 0 : _a.length) > 0;
    });
    const handleClearAll = () => {
      paramsStore.removeAllFilters();
    };
    const handleRemove = ({ filter }) => {
      switch (filter.type) {
        case "terms":
          toggleTermFilter(
            // TODO: Fix any
            paramsStore.appendParams,
            { type: "terms", value: filter.value, key: filter.key },
            currentFilters.value
          );
          break;
        case "hierarchy":
          toggleHierarchyFilter(
            paramsStore.appendParams,
            { type: "hierarchy", value: filter.value, key: filter.key },
            currentFilters.value,
            true
          );
          break;
        case "range":
          paramsStore.removeParameters({
            paramsToRemove: [QUERY_PARAMS.PAGE, `${FACET_PARAMS_TYPE.RANGE}${filter.key}`]
          });
          break;
      }
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return hasFilters.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass(["lupa-search-result-current-filters", { expandable: _ctx.expandable }]),
        "data-cy": "lupa-search-result-current-filters"
      }, [
        createElementVNode("div", {
          class: "lupa-current-filter-title",
          onClick: _cache[0] || (_cache[0] = ($event) => isOpen.value = !isOpen.value)
        }, [
          createElementVNode("div", _hoisted_1$E, [
            createTextVNode(toDisplayString((_c = (_b = (_a = _ctx.options) == null ? void 0 : _a.labels) == null ? void 0 : _b.title) != null ? _c : "") + " ", 1),
            _ctx.expandable ? (openBlock(), createElementBlock("span", _hoisted_2$u, " (" + toDisplayString(unref(currentFilterCount)) + ") ", 1)) : createCommentVNode("", true)
          ]),
          _ctx.expandable ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["lupa-filter-title-caret", isOpen.value && "open"])
          }, null, 2)) : createCommentVNode("", true)
        ]),
        !_ctx.expandable || isOpen.value ? (openBlock(), createElementBlock("div", _hoisted_3$m, [
          createElementVNode("div", _hoisted_4$g, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(displayFilters), (filter) => {
              return openBlock(), createBlock(_sfc_main$G, {
                key: filter.key + "_" + filter.value,
                filter,
                onRemove: handleRemove
              }, null, 8, ["filter"]);
            }), 128))
          ]),
          createElementVNode("div", {
            class: "lupa-clear-all-filters",
            "data-cy": "lupa-clear-all-filters",
            onClick: handleClearAll
          }, toDisplayString((_f = (_e = (_d = _ctx.options) == null ? void 0 : _d.labels) == null ? void 0 : _e.clearAll) != null ? _f : ""), 1)
        ])) : createCommentVNode("", true)
      ], 2)) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$D = ["href"];
const _sfc_main$E = /* @__PURE__ */ defineComponent({
  __name: "CategoryFilterItem",
  props: {
    options: {},
    item: {}
  },
  setup(__props) {
    const props = __props;
    const itemValue = computed(() => {
      var _a;
      return (_a = props.item) != null ? _a : {};
    });
    const title = computed(() => {
      var _a, _b;
      return props.options.keys.titleKey ? (_b = (_a = itemValue.value) == null ? void 0 : _a[props.options.keys.titleKey]) != null ? _b : "" : "";
    });
    const urlLink = computed(() => {
      var _a, _b;
      return props.options.keys.urlKey ? (_b = (_a = itemValue.value) == null ? void 0 : _a[props.options.keys.urlKey]) != null ? _b : "" : "";
    });
    const isActive = computed(() => {
      return linksMatch(urlLink.value, window.location.origin + window.location.pathname);
    });
    const hasEventRouting = computed(() => {
      return props.options.routingBehavior === "event";
    });
    const handleNavigation = (event) => {
      handleRoutingEvent(urlLink.value, event, hasEventRouting.value);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["lupa-child-category-item", { "lupa-child-category-item-active": isActive.value }])
      }, [
        createElementVNode("a", {
          "data-cy": "lupa-child-category-item",
          href: urlLink.value,
          onClick: handleNavigation
        }, toDisplayString(title.value), 9, _hoisted_1$D)
      ], 2);
    };
  }
});
const _hoisted_1$C = {
  class: "lupa-category-filter",
  "data-cy": "lupa-category-filter"
};
const _hoisted_2$t = { class: "lupa-category-back" };
const _hoisted_3$l = ["href"];
const _hoisted_4$f = ["href"];
const _hoisted_5$b = { class: "lupa-child-category-list" };
const _sfc_main$D = /* @__PURE__ */ defineComponent({
  __name: "CategoryFilter",
  props: {
    options: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const categoryChildren = ref([]);
    const optionStore = useOptionsStore();
    const { envOptions, searchResultOptions } = storeToRefs(optionStore);
    const hasBackButton = computed(() => {
      var _a;
      return Boolean((_a = props.options.back) == null ? void 0 : _a.title);
    });
    const hasEventRouting = computed(() => {
      return props.options.routingBehavior === "event";
    });
    const backTitle = computed(() => {
      var _a;
      return (_a = props.options.back) == null ? void 0 : _a.title;
    });
    const backUrlLink = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.back) == null ? void 0 : _a.url) != null ? _b : "";
    });
    const parentTitle = computed(() => {
      var _a;
      return (_a = props.options.parent) == null ? void 0 : _a.title;
    });
    const parentUrlLink = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.parent) == null ? void 0 : _a.url) != null ? _b : "";
    });
    const isActive = () => {
      if (!window) {
        return false;
      }
      return linksMatch(parentUrlLink.value, window.location.origin + window.location.pathname);
    };
    const handleResult = (result) => {
      var _a, _b, _c;
      if (!result.success || !((_a = props.options) == null ? void 0 : _a.queryKey)) {
        return;
      }
      categoryChildren.value = result.items;
      (_c = (_b = searchResultOptions.value.callbacks) == null ? void 0 : _b.onCategoryFilterResults) == null ? void 0 : _c.call(_b, {
        queryKey: props.options.queryKey,
        hasResults: result.total > 0
      });
    };
    const fetch2 = () => __async(this, null, function* () {
      var _a;
      if (!((_a = props.options) == null ? void 0 : _a.queryKey)) {
        return;
      }
      const result = yield LupaSearchSdk.query(
        props.options.queryKey,
        {
          searchText: "",
          filters: props.options.filters
        },
        envOptions.value
      );
      handleResult(result);
    });
    onMounted(() => __async(this, null, function* () {
      yield fetch2();
    }));
    const getCategoryKey = (item) => {
      var _a, _b;
      return (item == null ? void 0 : item[(_a = props.options.keys.titleKey) != null ? _a : ""]) + (item == null ? void 0 : item[(_b = props.options.keys.urlKey) != null ? _b : ""]);
    };
    const handleNavigationParent = (event) => {
      if (!parentUrlLink.value) {
        return;
      }
      handleRoutingEvent(parentUrlLink.value, event, hasEventRouting.value);
    };
    const handleNavigationBack = (event) => {
      if (!backUrlLink.value) {
        return;
      }
      handleRoutingEvent(backUrlLink.value, event, hasEventRouting.value);
    };
    __expose({ fetch: fetch2 });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$C, [
        createElementVNode("div", _hoisted_2$t, [
          hasBackButton.value ? (openBlock(), createElementBlock("a", {
            key: 0,
            "data-cy": "lupa-category-back",
            href: backUrlLink.value,
            onClick: handleNavigationBack
          }, toDisplayString(backTitle.value), 9, _hoisted_3$l)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", {
          class: normalizeClass(["lupa-current-category", { "lupa-current-category-active": isActive }])
        }, [
          createElementVNode("a", {
            "data-cy": "lupa-current-category",
            href: parentUrlLink.value,
            class: normalizeClass({ "lupa-title-category": !hasBackButton.value }),
            onClick: handleNavigationParent
          }, toDisplayString(parentTitle.value), 11, _hoisted_4$f)
        ], 2),
        createElementVNode("div", _hoisted_5$b, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(categoryChildren.value, (child) => {
            return openBlock(), createBlock(_sfc_main$E, {
              key: getCategoryKey(child),
              item: child,
              options: _ctx.options
            }, null, 8, ["item", "options"]);
          }), 128))
        ])
      ]);
    };
  }
});
const _hoisted_1$B = {
  class: "lupa-search-result-facet-term-values",
  "data-cy": "lupa-search-result-facet-term-values"
};
const _hoisted_2$s = ["placeholder"];
const _hoisted_3$k = { class: "lupa-terms-list" };
const _hoisted_4$e = ["onClick"];
const _hoisted_5$a = { class: "lupa-term-checkbox-wrapper" };
const _hoisted_6$7 = { class: "lupa-term-checkbox-label" };
const _hoisted_7$4 = { class: "lupa-term-label" };
const _hoisted_8$1 = {
  key: 0,
  class: "lupa-term-count"
};
const _hoisted_9$1 = { key: 0 };
const _hoisted_10$1 = { key: 1 };
const _sfc_main$C = /* @__PURE__ */ defineComponent({
  __name: "TermFacet",
  props: {
    options: {},
    facet: {},
    currentFilters: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const facet = computed(() => {
      var _a;
      return (_a = props.facet) != null ? _a : { type: "terms", items: [], key: "" };
    });
    const currentFiltersaValue = computed(() => {
      var _a;
      return (_a = props.currentFilters) != null ? _a : [];
    });
    const showAll = ref(false);
    const termFilter = ref("");
    const emit = __emit;
    const itemLimit = computed(() => {
      return showAll.value || !props.options.facetValueCountLimit ? MAX_FACET_VALUES : props.options.facetValueCountLimit;
    });
    const allValues = computed(() => {
      var _a, _b;
      return (_b = (_a = facet.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const displayValues = computed(() => {
      return filteredValues.value.slice(0, itemLimit.value).map((v) => __spreadProps(__spreadValues({}, v), { title: getDisplayValue(v.title) }));
    });
    const filteredValues = computed(() => {
      return isFilterable.value ? allValues.value.filter(
        (v) => {
          var _a;
          return (_a = getNormalizedString(v.title)) == null ? void 0 : _a.includes(getNormalizedString(termFilter.value));
        }
      ) : allValues.value;
    });
    const isFilterable = computed(() => {
      var _a, _b;
      return allValues.value.length >= ((_b = (_a = props.options.filterable) == null ? void 0 : _a.minValues) != null ? _b : MAX_FACET_VALUES);
    });
    const isRange = computed(() => {
      return facet.value.type === "range";
    });
    const displayShowMore = computed(() => {
      return Boolean(
        showAll.value && props.options.labels.showLess || itemLimit.value < filteredValues.value.length
      );
    });
    const handleFacetClick = (item) => {
      var _a;
      const value = isRange.value ? item.title.split(FACET_TERM_RANGE_SEPARATOR) : (_a = item.title) == null ? void 0 : _a.toString();
      emit("select", {
        key: facet.value.key,
        value,
        type: facet.value.type
      });
    };
    const toggleShowAll = () => {
      showAll.value = !showAll.value;
    };
    const isChecked = (item) => {
      var _a, _b;
      let selectedItems = (_a = currentFiltersaValue.value) != null ? _a : [];
      selectedItems = isRange.value && selectedItems ? [rangeFilterToString(selectedItems)] : selectedItems;
      return selectedItems == null ? void 0 : selectedItems.includes((_b = item.title) == null ? void 0 : _b.toString());
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$B, [
        isFilterable.value ? withDirectives((openBlock(), createElementBlock("input", {
          key: 0,
          class: "lupa-term-filter",
          "data-cy": "lupa-term-filter",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => termFilter.value = $event),
          placeholder: _ctx.options.labels.facetFilter
        }, null, 8, _hoisted_2$s)), [
          [vModelText, termFilter.value]
        ]) : createCommentVNode("", true),
        createElementVNode("div", _hoisted_3$k, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(displayValues.value, (item) => {
            return openBlock(), createElementBlock("div", {
              class: normalizeClass(["lupa-facet-term", { checked: isChecked(item) }]),
              "data-cy": "lupa-facet-term",
              key: item.title,
              onClick: ($event) => handleFacetClick(item)
            }, [
              createElementVNode("div", _hoisted_5$a, [
                createElementVNode("span", {
                  class: normalizeClass(["lupa-term-checkbox", { checked: isChecked(item) }])
                }, null, 2)
              ]),
              createElementVNode("div", _hoisted_6$7, [
                createElementVNode("span", _hoisted_7$4, toDisplayString(item.title), 1),
                _ctx.options.showDocumentCount ? (openBlock(), createElementBlock("span", _hoisted_8$1, "(" + toDisplayString(item.count) + ")", 1)) : createCommentVNode("", true)
              ])
            ], 10, _hoisted_4$e);
          }), 128))
        ]),
        displayShowMore.value ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: "lupa-facet-term lupa-show-more-facet-results",
          "data-cy": "lupa-facet-term",
          onClick: toggleShowAll
        }, [
          showAll.value ? (openBlock(), createElementBlock("span", _hoisted_9$1, toDisplayString(_ctx.options.labels.showLess), 1)) : (openBlock(), createElementBlock("span", _hoisted_10$1, toDisplayString(_ctx.options.labels.showAll), 1))
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$A = { class: "lupa-search-result-facet-stats-values" };
const _hoisted_2$r = {
  key: 0,
  class: "lupa-stats-facet-summary"
};
const _hoisted_3$j = {
  key: 1,
  class: "lupa-stats-facet-summary-input"
};
const _hoisted_4$d = {
  key: 0,
  class: "lupa-stats-range-label"
};
const _hoisted_5$9 = { class: "lupa-stats-from" };
const _hoisted_6$6 = ["max", "min", "pattern", "aria-label"];
const _hoisted_7$3 = { key: 0 };
const _hoisted_8 = /* @__PURE__ */ createElementVNode("div", { class: "lupa-stats-separator" }, null, -1);
const _hoisted_9 = {
  key: 0,
  class: "lupa-stats-range-label"
};
const _hoisted_10 = { class: "lupa-stats-to" };
const _hoisted_11 = ["max", "min", "pattern", "aria-label"];
const _hoisted_12 = { key: 0 };
const _hoisted_13 = {
  key: 2,
  class: "lupa-stats-slider-wrapper"
};
const _sfc_main$B = /* @__PURE__ */ defineComponent({
  __name: "StatsFacet",
  props: {
    options: {},
    facet: {},
    currentFilters: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const facetValue = computed(() => {
      var _a;
      return (_a = props.facet) != null ? _a : { key: "", min: 0, max: 100 };
    });
    const currentFilters = computed(() => {
      var _a;
      return (_a = props.currentFilters) != null ? _a : {};
    });
    const emit = __emit;
    const innerSliderRange = ref([]);
    const optionsStore = useOptionsStore();
    const { searchResultOptions } = storeToRefs(optionsStore);
    const rangeLabelFrom = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.options.stats) == null ? void 0 : _a.labels) == null ? void 0 : _b.from) != null ? _c : "";
    });
    const rangeLabelTo = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.options.stats) == null ? void 0 : _a.labels) == null ? void 0 : _b.to) != null ? _c : "";
    });
    const currency = computed(() => {
      var _a;
      return (_a = searchResultOptions.value) == null ? void 0 : _a.labels.currency;
    });
    const isSliderVisible = computed(() => {
      var _a, _b;
      return Boolean((_b = (_a = props.options.stats) == null ? void 0 : _a.slider) != null ? _b : true);
    });
    const isInputVisible = computed(() => {
      var _a;
      return Boolean((_a = props.options.stats) == null ? void 0 : _a.inputs);
    });
    const fromValue = computed({
      get: () => isPrice.value ? sliderRange.value[0].toFixed(2).replace(".", separator.value) : `${sliderRange.value[0]}`,
      set: (stringValue) => {
        let value = normalizeFloat(stringValue);
        if (value < facetMin.value) {
          value = facetMin.value;
        }
        if (!value || value > facetMax.value) {
          return;
        }
        innerSliderRange.value = [value, sliderRange.value[1]];
        handleInputChange();
      }
    });
    const toValue = computed({
      get: () => isPrice.value ? sliderRange.value[1].toFixed(2).replace(".", separator.value) : `${sliderRange.value[1]}`,
      set: (stringValue) => {
        let value = normalizeFloat(stringValue);
        if (value > facetMax.value) {
          value = facetMax.value;
        }
        if (!value || value < facetMin.value) {
          return;
        }
        innerSliderRange.value = [sliderRange.value[0], value];
        handleInputChange();
      }
    });
    const currentGte = computed(() => {
      return typeof currentFilters.value.gte === "string" ? parseFloat(currentFilters.value.gte) : currentFilters.value.gte;
    });
    const currentLte = computed(() => {
      return typeof currentFilters.value.lte === "string" ? parseFloat(currentFilters.value.lte) : currentFilters.value.lte;
    });
    const currentMinValue = computed(() => {
      return currentGte.value ? Math.max(currentGte.value, facetMin.value) : facetMin.value;
    });
    const currentMaxValue = computed(() => {
      return currentLte.value ? Math.min(currentLte.value, facetMax.value) : facetMax.value;
    });
    const sliderRange = computed({
      get: () => {
        if (!innerSliderRange.value.length) {
          return [currentMinValue.value, currentMaxValue.value];
        }
        return [
          Math.max(innerSliderRange.value[0], facetMin.value),
          Math.min(innerSliderRange.value[1], facetMax.value)
        ];
      },
      set: (value) => {
        innerSliderRange.value = value;
      }
    });
    const isPrice = computed(() => {
      var _a;
      return (_a = facetValue.value.key) == null ? void 0 : _a.includes(CURRENCY_KEY_INDICATOR);
    });
    const facetMin = computed(() => {
      return Math.floor(facetValue.value.min);
    });
    const facetMax = computed(() => {
      return Math.ceil(facetValue.value.max);
    });
    const statsSummary = computed(() => {
      const [min, max] = sliderRange.value;
      return isPrice.value ? formatPriceSummary([min, max], currency.value, separator.value) : formatRange({ gte: min, lte: max });
    });
    const separator = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = searchResultOptions.value) == null ? void 0 : _a.labels) == null ? void 0 : _b.priceSeparator) != null ? _c : ",";
    });
    const isIntegerRange = computed(() => {
      return Number.isInteger(currentMinValue.value) && Number.isInteger(currentMaxValue.value);
    });
    computed(() => {
      return isIntegerRange.value ? 1 : -1;
    });
    const sliderInputFormat = computed(() => {
      return isPrice.value ? `[0-9]+([${separator.value}][0-9]{1,2})?` : void 0;
    });
    computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        "aria-label": ((_b = (_a = props.options.stats) == null ? void 0 : _a.labels) == null ? void 0 : _b.sliderDotAriaLabel) ? `${(_d = (_c = props.options.stats) == null ? void 0 : _c.labels) == null ? void 0 : _d.sliderDotAriaLabel} - ${(_e = props.facet) == null ? void 0 : _e.label}` : `Range slider control dot for ${(_f = props.facet) == null ? void 0 : _f.label}`
      };
    });
    const ariaLabelFrom = computed(() => {
      var _a, _b, _c, _d, _e;
      return `${(_b = (_a = props.facet) == null ? void 0 : _a.label) != null ? _b : ""} ${(_e = (_d = (_c = props.options.stats) == null ? void 0 : _c.labels) == null ? void 0 : _d.ariaFrom) != null ? _e : rangeLabelFrom.value}`;
    });
    const ariaLabelTo = computed(() => {
      var _a, _b, _c, _d, _e;
      return `${(_b = (_a = props.facet) == null ? void 0 : _a.label) != null ? _b : ""} ${(_e = (_d = (_c = props.options.stats) == null ? void 0 : _c.labels) == null ? void 0 : _d.ariaTo) != null ? _e : rangeLabelTo.value}`;
    });
    watch(currentMinValue, () => {
      innerSliderRange.value = [];
    });
    watch(currentMaxValue, () => {
      innerSliderRange.value = [];
    });
    const handleInputChange = () => {
      if (innerSliderRange.value.length < 1) {
        return;
      }
      if (sliderRange.value[0] === currentGte.value && sliderRange.value[1] === currentLte.value) {
        return;
      }
      handleChange();
    };
    const handleChange = () => {
      emit("select", {
        key: facetValue.value.key,
        value: sliderRange.value,
        type: "range"
      });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$A, [
        !isInputVisible.value ? (openBlock(), createElementBlock("div", _hoisted_2$r, toDisplayString(statsSummary.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_3$j, [
          createElementVNode("div", null, [
            rangeLabelFrom.value ? (openBlock(), createElementBlock("div", _hoisted_4$d, toDisplayString(rangeLabelFrom.value), 1)) : createCommentVNode("", true),
            createElementVNode("div", _hoisted_5$9, [
              withDirectives(createElementVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => fromValue.value = $event),
                type: "text",
                maxlength: "8",
                max: facetMax.value,
                min: facetMin.value,
                pattern: sliderInputFormat.value,
                "aria-label": ariaLabelFrom.value
              }, null, 8, _hoisted_6$6), [
                [
                  vModelText,
                  fromValue.value,
                  void 0,
                  { lazy: true }
                ]
              ]),
              isPrice.value ? (openBlock(), createElementBlock("span", _hoisted_7$3, toDisplayString(currency.value), 1)) : createCommentVNode("", true)
            ])
          ]),
          _hoisted_8,
          createElementVNode("div", null, [
            rangeLabelTo.value ? (openBlock(), createElementBlock("div", _hoisted_9, toDisplayString(rangeLabelTo.value), 1)) : createCommentVNode("", true),
            createElementVNode("div", _hoisted_10, [
              withDirectives(createElementVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => toValue.value = $event),
                type: "text",
                maxlength: "8",
                max: facetMax.value,
                min: facetMin.value,
                pattern: sliderInputFormat.value,
                "aria-label": ariaLabelTo.value
              }, null, 8, _hoisted_11), [
                [
                  vModelText,
                  toValue.value,
                  void 0,
                  { lazy: true }
                ]
              ]),
              isPrice.value ? (openBlock(), createElementBlock("span", _hoisted_12, toDisplayString(currency.value), 1)) : createCommentVNode("", true)
            ])
          ])
        ])),
        isSliderVisible.value ? (openBlock(), createElementBlock("div", _hoisted_13)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$z = { class: "lupa-term-checkbox-wrapper" };
const _hoisted_2$q = { class: "lupa-term-checkbox-label" };
const _hoisted_3$i = { class: "lupa-term-label" };
const _hoisted_4$c = {
  key: 0,
  class: "lupa-term-count"
};
const _hoisted_5$8 = {
  key: 0,
  class: "lupa-facet-level"
};
const _sfc_main$A = /* @__PURE__ */ defineComponent({
  __name: "HierarchyFacetLevel",
  props: {
    options: {},
    level: {},
    item: {},
    currentFilters: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const level = computed(() => {
      var _a;
      return (_a = props.level) != null ? _a : 0;
    });
    const treeItem = computed(() => {
      var _a;
      return (_a = props.item) != null ? _a : { key: "", children: [] };
    });
    const currentFilters = computed(() => {
      var _a;
      return (_a = props.currentFilters) != null ? _a : { terms: [] };
    });
    const emit = __emit;
    const showChildren = computed(() => {
      var _a, _b;
      return isChecked.value || level.value + 1 < ((_b = (_a = props.options.hierarchy) == null ? void 0 : _a.maxInitialLevel) != null ? _b : 2);
    });
    const isChecked = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = currentFilters.value) == null ? void 0 : _a.terms) == null ? void 0 : _b.some((t) => t.startsWith(treeItem.value.key))) != null ? _c : false;
    });
    const handleFacetClick = (item) => {
      emit("select", {
        value: item.key
      });
    };
    return (_ctx, _cache) => {
      const _component_HierarchyFacetLevel = resolveComponent("HierarchyFacetLevel", true);
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["lupa-facet-hierarchy", { "lupa-term-active": isChecked.value }])
      }, [
        createElementVNode("div", {
          class: "lupa-facet-term",
          "data-cy": "lupa-facet-term",
          onClick: _cache[0] || (_cache[0] = ($event) => handleFacetClick(_ctx.item))
        }, [
          createElementVNode("div", _hoisted_1$z, [
            createElementVNode("span", {
              class: normalizeClass(["lupa-term-checkbox", { checked: isChecked.value }])
            }, null, 2)
          ]),
          createElementVNode("div", _hoisted_2$q, [
            createElementVNode("span", _hoisted_3$i, toDisplayString(_ctx.item.title) + toDisplayString(" "), 1),
            _ctx.options.showDocumentCount ? (openBlock(), createElementBlock("span", _hoisted_4$c, "(" + toDisplayString(_ctx.item.count) + ")", 1)) : createCommentVNode("", true)
          ])
        ]),
        showChildren.value ? (openBlock(), createElementBlock("div", _hoisted_5$8, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(treeItem.value.children, (itemChild) => {
            return openBlock(), createBlock(_component_HierarchyFacetLevel, {
              key: itemChild.title,
              options: _ctx.options,
              item: itemChild,
              currentFilters: currentFilters.value,
              level: level.value + 1,
              onSelect: _cache[1] || (_cache[1] = (i) => _ctx.$emit("select", i))
            }, null, 8, ["options", "item", "currentFilters", "level"]);
          }), 128))
        ])) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const _hoisted_1$y = {
  class: "lupa-search-result-facet-term-values lupa-search-result-facet-hierarchy-values",
  "data-cy": "lupa-search-result-facet-term-values"
};
const _hoisted_2$p = { key: 0 };
const _hoisted_3$h = ["placeholder"];
const _sfc_main$z = /* @__PURE__ */ defineComponent({
  __name: "HierarchyFacet",
  props: {
    options: {},
    facet: {},
    currentFilters: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const currentFilters = computed(() => {
      var _a;
      return (_a = props.currentFilters) != null ? _a : { terms: [] };
    });
    const facet = computed(() => {
      var _a;
      return (_a = props.facet) != null ? _a : { items: [], key: "" };
    });
    const showAll = ref(false);
    const termFilter = ref("");
    const level = ref(0);
    const emit = __emit;
    const itemLimit = computed(() => {
      var _a, _b;
      return showAll.value || !((_a = props.options.hierarchy) == null ? void 0 : _a.topLevelValueCountLimit) ? MAX_FACET_VALUES : (_b = props.options.hierarchy) == null ? void 0 : _b.topLevelValueCountLimit;
    });
    const allValues = computed(() => {
      var _a, _b;
      return (_b = (_a = facet.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const displayValues = computed(() => {
      return filteredValues.value.slice(0, itemLimit.value);
    });
    const filteredValues = computed(() => {
      return isFilterable.value ? recursiveFilter(allValues.value, termFilter.value) : allValues.value;
    });
    const isFilterable = computed(() => {
      var _a, _b, _c;
      return Boolean((_a = props.options.hierarchy) == null ? void 0 : _a.filterable) && allValues.value.length >= ((_c = (_b = props.options.filterable) == null ? void 0 : _b.minValues) != null ? _c : MAX_FACET_VALUES);
    });
    const handleFacetClick = ({ value }) => {
      emit("select", {
        key: facet.value.key,
        value,
        type: "hierarchy"
      });
    };
    const handleShowAll = () => {
      showAll.value = true;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$y, [
        isFilterable.value ? (openBlock(), createElementBlock("div", _hoisted_2$p, [
          withDirectives(createElementVNode("input", {
            class: "lupa-term-filter",
            "data-cy": "lupa-term-filter",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => termFilter.value = $event),
            placeholder: _ctx.options.labels.facetFilter
          }, null, 8, _hoisted_3$h), [
            [vModelText, termFilter.value]
          ])
        ])) : createCommentVNode("", true),
        (openBlock(true), createElementBlock(Fragment, null, renderList(displayValues.value, (item) => {
          return openBlock(), createBlock(_sfc_main$A, {
            key: item.title,
            options: _ctx.options,
            item,
            termFilter: termFilter.value,
            currentFilters: currentFilters.value,
            level: level.value,
            onSelect: handleFacetClick
          }, null, 8, ["options", "item", "termFilter", "currentFilters", "level"]);
        }), 128)),
        itemLimit.value < filteredValues.value.length ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: "lupa-facet-term lupa-show-more-facet-results",
          "data-cy": "lupa-facet-term",
          onClick: handleShowAll
        }, toDisplayString(_ctx.options.labels.showAll), 1)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$x = { class: "lupa-facet-label-text" };
const _hoisted_2$o = {
  key: 0,
  class: "lupa-facet-content",
  "data-cy": "lupa-facet-content"
};
const __default__ = {
  components: {
    TermFacet: _sfc_main$C,
    StatsFacet: _sfc_main$B,
    HierarchyFacet: _sfc_main$z
  }
};
const _sfc_main$y = /* @__PURE__ */ defineComponent(__spreadProps(__spreadValues({}, __default__), {
  __name: "FacetDisplay",
  props: {
    options: {},
    facet: {},
    currentFilters: {},
    clearable: { type: Boolean }
  },
  emits: ["select", "clear"],
  setup(__props, { emit: __emit }) {
    var _a, _b;
    const props = __props;
    const facet = computed(() => {
      var _a2;
      return (_a2 = props.facet) != null ? _a2 : { type: "", key: "" };
    });
    const currentFilters = computed(() => {
      var _a2;
      return (_a2 = props.currentFilters) != null ? _a2 : {};
    });
    const searchResultStore = useSearchResultStore();
    const { currentFilterKeys } = storeToRefs(searchResultStore);
    const emit = __emit;
    const isOpen = ref((_b = (_a = props.options.expand) == null ? void 0 : _a.includes(props.facet.key)) != null ? _b : false);
    const facetPanel = ref(null);
    const facetType = computed(() => {
      switch (facet.value.type) {
        case "terms":
          return "term-facet";
        case "stats":
          return "stats-facet";
        case "hierarchy":
          return "hierarchy-facet";
        default:
          return "term-facet";
      }
    });
    const hasItems = computed(() => {
      var _a2;
      if (facet.value.type === "stats") {
        return true;
      }
      const currentFacet = facet.value;
      return ((_a2 = currentFacet.items) == null ? void 0 : _a2.length) > 0;
    });
    const hasFilter = computed(() => {
      var _a2;
      return Boolean(((_a2 = currentFilters.value) != null ? _a2 : {})[facet.value.key]);
    });
    const filterQueryKey = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = props.options.facetFilterQueries) == null ? void 0 : _a2[facet.value.key]) == null ? void 0 : _b2.queryKey;
    });
    const activeFilterKeys = computed(() => {
      var _a2;
      return ((_a2 = currentFilterKeys.value) != null ? _a2 : []).join(",");
    });
    onMounted(() => {
      var _a2;
      if (((_a2 = props.options.style) == null ? void 0 : _a2.type) === "top-dropdown") {
        window.addEventListener("click", handleMouseClick);
      }
    });
    onBeforeUnmount(() => {
      window.removeEventListener("click", handleMouseClick);
    });
    const handleMouseClick = (e) => {
      const el = facetPanel.value;
      if (!el) {
        return;
      }
      const isOutsideElement = el && !el.contains(e.target);
      if (isOutsideElement) {
        isOpen.value = false;
      }
    };
    watch(activeFilterKeys, () => {
      handleFacetQueryFilter();
    });
    const toggleFacet = () => {
      isOpen.value = !isOpen.value;
      handleFacetQueryFilter();
    };
    const handleFacetQueryFilter = () => {
      if (!filterQueryKey.value || !isOpen.value) {
        return;
      }
      searchResultStore.queryFacet({
        queryKey: filterQueryKey.value,
        facetKey: facet.value.key
      });
    };
    const handleFacetSelect = (item) => {
      emit("select", item);
    };
    const clear = () => {
      emit("clear", facet.value);
      isOpen.value = false;
    };
    return (_ctx, _cache) => {
      return hasItems.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        ref_key: "facetPanel",
        ref: facetPanel,
        class: "lupa-search-result-facet-display",
        "data-cy": "lupa-search-result-facet-display"
      }, [
        createElementVNode("div", {
          class: normalizeClass(["lupa-search-result-facet-label", { open: isOpen.value, "lupa-has-filter": hasFilter.value }]),
          "data-cy": "lupa-search-result-facet-label",
          onClick: toggleFacet
        }, [
          createElementVNode("div", _hoisted_1$x, toDisplayString(facet.value.label), 1),
          createElementVNode("div", {
            class: normalizeClass(["lupa-facet-label-caret", isOpen.value && "open"])
          }, null, 2)
        ], 2),
        isOpen.value ? (openBlock(), createElementBlock("div", _hoisted_2$o, [
          (openBlock(), createBlock(resolveDynamicComponent(facetType.value), {
            facet: facet.value,
            currentFilters: currentFilters.value[facet.value.key],
            options: _ctx.options,
            onSelect: handleFacetSelect
          }, null, 40, ["facet", "currentFilters", "options"])),
          _ctx.clearable ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "lupa-single-facet-clear",
            "data-cy": "lupa-single-facet-clear",
            onClick: clear
          }, toDisplayString(_ctx.options.labels.facetClear), 1)) : createCommentVNode("", true)
        ])) : createCommentVNode("", true)
      ], 512)) : createCommentVNode("", true);
    };
  }
}));
const _hoisted_1$w = { class: "lupa-search-result-facet-section" };
const _hoisted_2$n = {
  key: 0,
  class: "lupa-facets-title"
};
const _sfc_main$x = /* @__PURE__ */ defineComponent({
  __name: "FacetList",
  props: {
    options: {},
    facets: {},
    currentFilters: {},
    facetStyle: {},
    clearable: { type: Boolean }
  },
  emits: ["select", "clear"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const currentFiltersValue = computed(() => {
      var _a;
      return (_a = props.currentFilters) != null ? _a : {};
    });
    const facetsValue = computed(() => {
      var _a;
      return (_a = props.facets) != null ? _a : [];
    });
    const displayFacets = computed(() => {
      return props.options.exclude ? facetsValue.value.filter((f) => {
        var _a;
        return !((_a = props.options.exclude) == null ? void 0 : _a.includes(f.key));
      }) : facetsValue.value;
    });
    const handleFacetSelect = (facetAction) => {
      emit("select", facetAction);
    };
    const clear = (facet) => {
      emit("clear", facet);
    };
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", _hoisted_1$w, [
        _ctx.options.labels.title ? (openBlock(), createElementBlock("div", _hoisted_2$n, toDisplayString(_ctx.options.labels.title), 1)) : createCommentVNode("", true),
        createElementVNode("div", {
          class: normalizeClass(["lupa-search-result-facet-list", "lupa-" + ((_a = _ctx.facetStyle) != null ? _a : "")])
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(displayFacets.value, (facet) => {
            var _a2;
            return openBlock(), createBlock(_sfc_main$y, {
              key: facet.key,
              facet,
              currentFilters: currentFiltersValue.value,
              options: _ctx.options,
              clearable: (_a2 = _ctx.clearable) != null ? _a2 : false,
              onSelect: handleFacetSelect,
              onClear: clear
            }, null, 8, ["facet", "currentFilters", "options", "clearable"]);
          }), 128))
        ], 2)
      ]);
    };
  }
});
const _hoisted_1$v = { class: "lupa-search-result-facets" };
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "Facets",
  props: {
    options: {},
    facetStyle: {},
    clearable: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const paramStore = useParamsStore();
    const searchResultStore = useSearchResultStore();
    const optionsStore = useOptionsStore();
    const { filters } = storeToRefs(paramStore);
    const { facets } = storeToRefs(searchResultStore);
    const { searchResultOptions } = storeToRefs(optionsStore);
    computed(() => {
      var _a;
      return (_a = facets.value) == null ? void 0 : _a.filter((f) => {
        var _a2;
        return (_a2 = props.options.promotedFacets) == null ? void 0 : _a2.includes(f.key);
      });
    });
    const regularFacets = computed(() => {
      var _a;
      return (_a = facets.value) == null ? void 0 : _a.filter((f) => {
        var _a2;
        return !((_a2 = props.options.promotedFacets) == null ? void 0 : _a2.includes(f.key));
      });
    });
    const scrollToResultsOptions = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        enabled: ((_a = searchResultOptions.value.scrollToResults) == null ? void 0 : _a.enabled) === void 0 ? true : (_b = searchResultOptions.value.scrollToResults) == null ? void 0 : _b.enabled,
        container: (_d = (_c = searchResultOptions.value.scrollToResults) == null ? void 0 : _c.scrollToContainerSelector) != null ? _d : RESULT_ROOT_SELECTOR,
        timeout: (_f = (_e = searchResultOptions.value.scrollToResults) == null ? void 0 : _e.timeout) != null ? _f : 500
      };
    });
    const handleFacetSelect = (facetAction) => {
      switch (facetAction.type) {
        case "terms":
          toggleTermFilter(paramStore.appendParams, facetAction, filters.value);
          break;
        case "range":
          toggleRangeFilter(paramStore.appendParams, facetAction, filters.value);
          break;
        case "hierarchy":
          toggleHierarchyFilter(paramStore.appendParams, facetAction, filters.value);
          break;
      }
      if (scrollToResultsOptions.value.enabled) {
        scrollToSearchResults(
          scrollToResultsOptions.value.timeout,
          scrollToResultsOptions.value.container
        );
      }
    };
    const clear = (facet) => {
      const param = getFacetKey(facet.key, facet.type);
      paramStore.removeParameters({ paramsToRemove: [param] });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$v, [
        regularFacets.value ? (openBlock(), createBlock(_sfc_main$x, {
          key: 0,
          options: _ctx.options,
          facets: regularFacets.value,
          currentFilters: unref(filters),
          facetStyle: _ctx.facetStyle,
          clearable: _ctx.clearable,
          onSelect: handleFacetSelect,
          onClear: clear
        }, null, 8, ["options", "facets", "currentFilters", "facetStyle", "clearable"])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$u = {
  id: "lupa-search-result-filters",
  class: "lupa-search-result-filters"
};
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsFilters",
  props: {
    options: {},
    expandable: { type: Boolean }
  },
  setup(__props, { expose: __expose }) {
    const categoryFilters = ref(null);
    const props = __props;
    const desktopFiltersVisible = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.options.currentFilters) == null ? void 0 : _a.visibility) == null ? void 0 : _b.desktopSidebar) != null ? _c : true;
    });
    const currentFiltersVisible = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.options.currentFilters) == null ? void 0 : _a.visibility) == null ? void 0 : _b.mobileSidebar) || desktopFiltersVisible.value;
    });
    const showCurrentFilters = computed(() => {
      return currentFiltersVisible.value ? Boolean(props.options.facets) : false;
    });
    const fetch2 = () => {
      var _a;
      if (categoryFilters.value) {
        (_a = categoryFilters.value) == null ? void 0 : _a.fetch();
      }
    };
    __expose({ fetch: fetch2 });
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", _hoisted_1$u, [
        showCurrentFilters.value ? (openBlock(), createBlock(_sfc_main$F, {
          key: 0,
          options: _ctx.options.currentFilters,
          expandable: (_a = _ctx.expandable) != null ? _a : false
        }, null, 8, ["options", "expandable"])) : createCommentVNode("", true),
        _ctx.options.categories ? (openBlock(), createBlock(_sfc_main$D, {
          key: 1,
          options: _ctx.options.categories,
          ref_key: "categoryFilters",
          ref: categoryFilters
        }, null, 8, ["options"])) : createCommentVNode("", true),
        _ctx.options.facets ? (openBlock(), createBlock(_sfc_main$w, {
          key: 2,
          options: _ctx.options.facets
        }, null, 8, ["options"])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$t = {
  key: 0,
  class: "lupa-mobile-filter-sidebar"
};
const _hoisted_2$m = { class: "lupa-mobile-sidebar-content" };
const _hoisted_3$g = { class: "lupa-sidebar-top" };
const _hoisted_4$b = { class: "lupa-sidebar-title" };
const _hoisted_5$7 = {
  key: 0,
  class: "lupa-sidebar-filter-count"
};
const _hoisted_6$5 = { class: "lupa-sidebar-filter-options" };
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  __name: "MobileFilterSidebar",
  props: {
    options: {}
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const { currentFilterCount } = storeToRefs(searchResultStore);
    const sidebarTitle = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.options.facets) == null ? void 0 : _a.labels) == null ? void 0 : _b.title) != null ? _c : "";
    });
    const isFilterCountVisible = computed(() => {
      var _a, _b;
      return Boolean((_b = (_a = props.options.currentFilters) == null ? void 0 : _a.mobileSidebar) == null ? void 0 : _b.showFilterCount) && currentFilterCount.value > 0;
    });
    const isMobileSidebarVisible = computed(() => searchResultStore.isMobileSidebarVisible);
    const isActiveFiltersExpanded = computed(() => {
      var _a, _b;
      return !((_b = (_a = props.options.currentFilters) == null ? void 0 : _a.mobileSidebar) == null ? void 0 : _b.activeFiltersExpanded);
    });
    const handleMobileToggle = () => {
      searchResultStore.setSidebarState({ visible: false });
    };
    return (_ctx, _cache) => {
      return isMobileSidebarVisible.value ? (openBlock(), createElementBlock("div", _hoisted_1$t, [
        createElementVNode("div", {
          class: "lupa-sidebar-close",
          onClick: withModifiers(handleMobileToggle, ["stop"])
        }),
        createElementVNode("div", _hoisted_2$m, [
          createElementVNode("div", _hoisted_3$g, [
            createElementVNode("div", _hoisted_4$b, [
              createTextVNode(toDisplayString(sidebarTitle.value) + " ", 1),
              isFilterCountVisible.value ? (openBlock(), createElementBlock("span", _hoisted_5$7, toDisplayString(unref(currentFilterCount)), 1)) : createCommentVNode("", true)
            ]),
            createElementVNode("div", {
              class: "lupa-filter-toggle-mobile",
              onClick: handleMobileToggle
            })
          ]),
          createElementVNode("div", _hoisted_6$5, [
            createVNode(_sfc_main$v, {
              options: _ctx.options,
              expandable: isActiveFiltersExpanded.value
            }, null, 8, ["options", "expandable"])
          ])
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$s = { id: "lupa-search-results-breadcrumbs" };
const _hoisted_2$l = ["href", "onClick"];
const _hoisted_3$f = {
  key: 1,
  class: "lupa-search-results-breadcrumb-text"
};
const _hoisted_4$a = { key: 2 };
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsBreadcrumbs",
  props: {
    breadcrumbs: {}
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const optionStore = useOptionsStore();
    const { currentQueryText } = storeToRefs(searchResultStore);
    const { searchResultOptions } = storeToRefs(optionStore);
    const breadcrumbsValue = computed(() => {
      var _a;
      return (_a = props.breadcrumbs) != null ? _a : [];
    });
    const hasEventRouting = computed(() => {
      return searchResultOptions.value.routingBehavior === "event";
    });
    const getLabel = (label) => {
      return addParamsToLabel(label, `'${currentQueryText.value}'`);
    };
    const handleNavigation = (event, link) => {
      handleRoutingEvent(link, event, hasEventRouting.value);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$s, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(breadcrumbsValue.value, (breadcrumb, index) => {
          return openBlock(), createElementBlock("span", {
            class: "lupa-search-results-breadcrumb",
            key: index
          }, [
            breadcrumb.link ? (openBlock(), createElementBlock("a", {
              key: 0,
              class: "lupa-search-results-breadcrumb-link",
              href: breadcrumb.link,
              onClick: (e) => {
                var _a;
                return handleNavigation(e, (_a = breadcrumb == null ? void 0 : breadcrumb.link) != null ? _a : "");
              }
            }, toDisplayString(getLabel(breadcrumb.label)), 9, _hoisted_2$l)) : (openBlock(), createElementBlock("span", _hoisted_3$f, toDisplayString(getLabel(breadcrumb.label)), 1)),
            index < breadcrumbsValue.value.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_4$a, " / ")) : createCommentVNode("", true)
          ]);
        }), 128))
      ]);
    };
  }
});
const _hoisted_1$r = {
  id: "lupa-search-result-filters",
  class: "lupa-search-result-filters"
};
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  __name: "FiltersTopDropdown",
  props: {
    options: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", _hoisted_1$r, [
        _ctx.options.facets ? (openBlock(), createBlock(_sfc_main$w, {
          key: 0,
          options: _ctx.options.facets,
          "facet-style": (_a = _ctx.options.facets.style) == null ? void 0 : _a.type,
          clearable: true
        }, null, 8, ["options", "facet-style"])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$q = { id: "lupa-search-results-layout-selection" };
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsLayoutSelection",
  setup(__props) {
    const searchResultStore = useSearchResultStore();
    const optionsStore = useOptionsStore();
    const { layout } = storeToRefs(searchResultStore);
    const { classMap } = storeToRefs(optionsStore);
    const handleLayoutChange = (layout2) => {
      searchResultStore.setLayout(layout2);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$q, [
        createElementVNode("div", {
          class: normalizeClass([
            "lupa-layout-selection-grid",
            unref(classMap).layoutSelectionGrid,
            unref(layout) === "Grid" ? "lupa-layout-selection-active " + unref(classMap).layoutSelectionGridActive : ""
          ]),
          onClick: _cache[0] || (_cache[0] = ($event) => handleLayoutChange("Grid"))
        }, " ☷ ", 2),
        createElementVNode("div", {
          class: normalizeClass([
            "lupa-layout-selection-list",
            unref(classMap).layoutSelectionList,
            unref(layout) === "List" ? "lupa-layout-selection-active " + unref(classMap).layoutSelectionListActive : ""
          ]),
          "data-cy": "lupa-layout-selection-list",
          onClick: _cache[1] || (_cache[1] = ($event) => handleLayoutChange("List"))
        }, " ☰ ", 2)
      ]);
    };
  }
});
const _hoisted_1$p = {
  key: 0,
  class: "lupa-mobile-toggle-filter-count"
};
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsMobileToggle",
  props: {
    label: {},
    showFilterCount: { type: Boolean }
  },
  setup(__props) {
    const searchResultStore = useSearchResultStore();
    const { currentFilterCount } = storeToRefs(searchResultStore);
    const handleMobileToggle = () => {
      searchResultStore.setSidebarState({ visible: true });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["lupa-mobile-toggle", { "lupa-mobile-toggle-filters-empty": unref(currentFilterCount) < 1 }]),
        onClick: handleMobileToggle
      }, [
        createTextVNode(toDisplayString(_ctx.label) + " ", 1),
        _ctx.showFilterCount && unref(currentFilterCount) > 0 ? (openBlock(), createElementBlock("span", _hoisted_1$p, toDisplayString(unref(currentFilterCount)), 1)) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const _hoisted_1$o = {
  key: 0,
  id: "lupa-search-results-page-select",
  "data-cy": "lupa-search-results-page-select"
};
const _hoisted_2$k = {
  key: 0,
  class: "lupa-page-number-separator"
};
const _hoisted_3$e = ["onClick"];
const _hoisted_4$9 = {
  key: 0,
  class: "lupa-page-number-separator"
};
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsPageSelect",
  props: {
    lastPageLabel: {},
    firstPageLabel: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const lastPageLabel = computed(() => {
      var _a;
      return (_a = props.lastPageLabel) != null ? _a : ">";
    });
    const firstPageLabel = computed(() => {
      var _a;
      return (_a = props.firstPageLabel) != null ? _a : "<";
    });
    const paramStore = useParamsStore();
    const screenStore = useScreenStore();
    const optionsStore = useOptionsStore();
    const { isMobileWidth } = storeToRefs(screenStore);
    const { searchResultOptions } = storeToRefs(optionsStore);
    const pageOptionsCount = computed(() => {
      return isMobileWidth.value ? props.options.displayMobile : props.options.display;
    });
    const pages = computed(() => {
      const currentPage = Math.min(props.options.count, props.options.selectedPage);
      const delta = Math.floor(pageOptionsCount.value / 2), left = currentPage - delta, right = currentPage + (pageOptionsCount.value - delta);
      return Array.from({ length: props.options.count }, (v, k) => k + 1).filter(
        (i) => i && i >= left && i < right
      );
    });
    const showBack = computed(() => {
      return props.options.selectedPage > 1 && props.options.selectedPage <= props.options.count;
    });
    const lastPage = computed(() => {
      var _a;
      return (_a = props.options.count) != null ? _a : void 0;
    });
    const showLastPage = computed(() => {
      return Boolean(lastPage.value && !pages.value.includes(lastPage.value));
    });
    const showLastPageSeparator = computed(() => {
      var _a;
      return showLastPage.value && !pages.value.includes(((_a = lastPage.value) != null ? _a : 0) - 1);
    });
    const showFirstPage = computed(() => {
      return !pages.value.includes(1);
    });
    const showFirstPageSeparator = computed(() => {
      return showFirstPage.value && !pages.value.includes(2);
    });
    const showPagination = computed(() => {
      return pages.value.length > 1;
    });
    const scrollToResultsOptions = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        enabled: ((_a = searchResultOptions.value.scrollToResults) == null ? void 0 : _a.enabled) === void 0 ? true : (_b = searchResultOptions.value.scrollToResults) == null ? void 0 : _b.enabled,
        container: (_d = (_c = searchResultOptions.value.scrollToResults) == null ? void 0 : _c.scrollToContainerSelector) != null ? _d : RESULT_ROOT_SELECTOR,
        timeout: (_f = (_e = searchResultOptions.value.scrollToResults) == null ? void 0 : _e.timeout) != null ? _f : 500
      };
    });
    const handlePageChange = (page) => {
      if (page > 0) {
        paramStore.appendParams({
          params: [{ name: QUERY_PARAMS.PAGE, value: page.toString() }]
        });
        if (scrollToResultsOptions.value.enabled) {
          scrollToSearchResults(
            scrollToResultsOptions.value.timeout,
            scrollToResultsOptions.value.container
          );
        }
      }
    };
    return (_ctx, _cache) => {
      return showPagination.value ? (openBlock(), createElementBlock("div", _hoisted_1$o, [
        showBack.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(firstPageLabel.value === "<" ? "lupa-page-arrow" : "lupa-show-less"),
          onClick: _cache[0] || (_cache[0] = () => handlePageChange(_ctx.options.selectedPage - 1))
        }, toDisplayString(firstPageLabel.value), 3)) : createCommentVNode("", true),
        showFirstPage.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createElementVNode("div", {
            class: "lupa-page-number lupa-page-number-first",
            onClick: _cache[1] || (_cache[1] = () => handlePageChange(1))
          }, " 1 "),
          showFirstPageSeparator.value ? (openBlock(), createElementBlock("div", _hoisted_2$k, "...")) : createCommentVNode("", true)
        ], 64)) : createCommentVNode("", true),
        (openBlock(true), createElementBlock(Fragment, null, renderList(pages.value, (page) => {
          return openBlock(), createElementBlock("div", {
            key: page,
            onClick: () => handlePageChange(page),
            class: normalizeClass([
              "lupa-page-number",
              page === _ctx.options.selectedPage ? "lupa-page-number-selected" : ""
            ]),
            "data-cy": "lupa-page-number"
          }, toDisplayString(page), 11, _hoisted_3$e);
        }), 128)),
        showLastPage.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          showLastPageSeparator.value ? (openBlock(), createElementBlock("div", _hoisted_4$9, "...")) : createCommentVNode("", true),
          createElementVNode("div", {
            class: "lupa-page-number lupa-page-number-last",
            onClick: _cache[2] || (_cache[2] = () => {
              var _a;
              return handlePageChange((_a = lastPage.value) != null ? _a : 1);
            })
          }, toDisplayString(lastPage.value), 1)
        ], 64)) : createCommentVNode("", true),
        _ctx.options.selectedPage < _ctx.options.count ? (openBlock(), createElementBlock("div", {
          key: 3,
          class: normalizeClass(lastPageLabel.value === ">" ? "lupa-page-arrow" : "lupa-show-more"),
          "data-cy": "lupa-show-more",
          onClick: _cache[3] || (_cache[3] = () => handlePageChange(_ctx.options.selectedPage + 1))
        }, toDisplayString(lastPageLabel.value), 3)) : createCommentVNode("", true)
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$n = {
  id: "lupa-search-results-page-size",
  "data-cy": "lupa-search-results-page-size"
};
const _hoisted_2$j = { id: "lupa-select" };
const _hoisted_3$d = { class: "lupa-select-label" };
const _hoisted_4$8 = ["aria-label"];
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsPageSize",
  props: {
    label: {},
    options: {}
  },
  setup(__props) {
    const paramsStore = useParamsStore();
    const select = ref(null);
    const handleSelect = (e) => {
      const value = e.target.value;
      paramsStore.appendParams({
        params: [{ name: QUERY_PARAMS.LIMIT, value }],
        paramsToRemove: [QUERY_PARAMS.PAGE]
      });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$n, [
        createElementVNode("div", _hoisted_2$j, [
          createElementVNode("label", _hoisted_3$d, toDisplayString(_ctx.label), 1),
          createElementVNode("select", {
            class: "lupa-select-dropdown",
            "aria-label": _ctx.label,
            "data-cy": "lupa-page-size-select-dropdown",
            onChange: handleSelect,
            ref_key: "select",
            ref: select
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.options.sizes, (option) => {
              return openBlock(), createElementBlock("option", { key: option }, toDisplayString(option), 1);
            }), 128))
          ], 40, _hoisted_4$8)
        ])
      ]);
    };
  }
});
const _hoisted_1$m = {
  id: "lupa-search-results-sort",
  class: "lupa-search-results-sort"
};
const _hoisted_2$i = { id: "lupa-select" };
const _hoisted_3$c = { class: "lupa-select-label" };
const _hoisted_4$7 = ["aria-label"];
const _hoisted_5$6 = ["value"];
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsSort",
  props: {
    options: {},
    callbacks: {}
  },
  setup(__props) {
    const props = __props;
    const paramStore = useParamsStore();
    const { sort } = storeToRefs(paramStore);
    const selectedKey = ref("");
    const previousKey = ref("");
    const sortItems = computed(() => {
      if (props.options.options && props.options.options.length) {
        return props.options.options;
      } else {
        return [];
      }
    });
    const defaultSortValue = computed(() => {
      var _a;
      return (_a = props.options.options.find((x) => x.default)) != null ? _a : props.options.options[0];
    });
    const setSortValue = () => {
      var _a, _b;
      const optionToSelect = (_a = sortItems.value.find((x) => x.key === sort.value)) == null ? void 0 : _a.key;
      selectedKey.value = optionToSelect != null ? optionToSelect : (_b = defaultSortValue.value) == null ? void 0 : _b.key;
      previousKey.value = selectedKey.value;
    };
    watch(sort, () => setSortValue());
    onMounted(() => {
      setSortValue();
    });
    const handleSelect = () => {
      var _a, _b, _c;
      const value = (_a = sortItems.value.find((x) => x.key === selectedKey.value)) == null ? void 0 : _a.key;
      if (!value) {
        return;
      }
      paramStore.setSortSettings({ selectedSortKey: value, previousSortKey: previousKey.value });
      (_c = (_b = props.callbacks) == null ? void 0 : _b.onSortChange) == null ? void 0 : _c.call(_b, { selectedSortKey: value, previousSortKey: previousKey.value });
      paramStore.appendParams({
        params: [{ name: QUERY_PARAMS.SORT, value }],
        paramsToRemove: [QUERY_PARAMS.PAGE]
      });
      previousKey.value = selectedKey.value;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$m, [
        createElementVNode("div", _hoisted_2$i, [
          createElementVNode("label", _hoisted_3$c, toDisplayString(_ctx.options.label), 1),
          withDirectives(createElementVNode("select", {
            class: "lupa-select-dropdown",
            "aria-label": _ctx.options.label,
            "data-cy": "lupa-sort-select-dropdown",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedKey.value = $event),
            onChange: handleSelect,
            ref: "select"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(sortItems.value, (option) => {
              return openBlock(), createElementBlock("option", {
                key: option.key,
                value: option.key
              }, toDisplayString(option.label), 9, _hoisted_5$6);
            }), 128))
          ], 40, _hoisted_4$7), [
            [vModelSelect, selectedKey.value]
          ])
        ])
      ]);
    };
  }
});
const _hoisted_1$l = { class: "lupa-toolbar-left" };
const _hoisted_2$h = { key: 1 };
const _hoisted_3$b = { key: 3 };
const _hoisted_4$6 = { key: 5 };
const _hoisted_5$5 = { class: "lupa-toolbar-right" };
const _hoisted_6$4 = { key: 1 };
const _hoisted_7$2 = { key: 3 };
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsToolbar",
  props: {
    options: {},
    paginationLocation: {}
  },
  setup(__props) {
    const props = __props;
    const optionsValue = computed(() => {
      var _a;
      return (_a = props.options) != null ? _a : { labels: {} };
    });
    const paramStore = useParamsStore();
    const searchResultStore = useSearchResultStore();
    const optionsStore = useOptionsStore();
    const { page, limit } = storeToRefs(paramStore);
    const { hasAnyFilter, searchResult } = storeToRefs(searchResultStore);
    const { currentResolutionPageSizes } = storeToRefs(optionsStore);
    const isBottomLocation = computed(() => {
      return props.paginationLocation === "bottom";
    });
    const showFilterClear = computed(() => {
      var _a;
      return isBottomLocation.value ? false : Boolean((_a = optionsValue.value.toolbar) == null ? void 0 : _a.clearFilters);
    });
    const showItemSummary = computed(() => {
      var _a;
      return isBottomLocation.value ? false : Boolean((_a = optionsValue.value.toolbar) == null ? void 0 : _a.itemSummary);
    });
    const showLayoutSelection = computed(() => {
      var _a;
      return isBottomLocation.value ? false : Boolean((_a = optionsValue.value.toolbar) == null ? void 0 : _a.layoutSelector);
    });
    const sortOptions = computed(() => {
      var _a, _b;
      if (isBottomLocation.value || !((_a = optionsValue.value.sort) == null ? void 0 : _a.length)) {
        return void 0;
      }
      return {
        label: optionsValue.value.labels.sortBy,
        options: (_b = optionsValue.value.sort) != null ? _b : []
      };
    });
    const paginationDisplay = computed(() => {
      if (props.paginationLocation === "top") {
        return {
          pageSize: optionsValue.value.pagination.sizeSelection.position.top,
          pageSelect: optionsValue.value.pagination.pageSelection.position.top
        };
      } else {
        return {
          pageSize: optionsValue.value.pagination.sizeSelection.position.bottom,
          pageSelect: optionsValue.value.pagination.pageSelection.position.bottom
        };
      }
    });
    const paginationOptions = computed(() => {
      const pageSelect = optionsValue.value.pagination.pageSelection;
      return {
        pageSize: {
          sizes: currentResolutionPageSizes.value,
          selectedSize: limit.value
        },
        pageSelect: {
          count: getPageCount(searchResult.value.total, limit.value),
          selectedPage: page.value,
          display: pageSelect.display,
          displayMobile: pageSelect.displayMobile
        },
        labels: optionsValue.value.labels
      };
    });
    const displayPageSelect = computed(() => {
      return paginationDisplay.value.pageSelect && paginationOptions.value.pageSelect.count > 0;
    });
    const searchSummaryLabel = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      const defaultLabel = (_c = (_b = (_a = paginationOptions.value) == null ? void 0 : _a.labels) == null ? void 0 : _b.itemCount) != null ? _c : "";
      return !hasAnyFilter.value || !showFilterClear.value ? defaultLabel : (_f = (_e = (_d = paginationOptions.value) == null ? void 0 : _d.labels) == null ? void 0 : _e.filteredItemCount) != null ? _f : defaultLabel;
    });
    const showMobileFilterCount = computed(() => {
      var _a, _b, _c;
      return Boolean((_c = (_b = (_a = optionsValue.value.filters) == null ? void 0 : _a.currentFilters) == null ? void 0 : _b.mobileSidebar) == null ? void 0 : _c.showFilterCount);
    });
    const hasResults = computed(() => {
      return searchResult.value.total > 0;
    });
    const callbacks = computed(() => {
      var _a;
      return (_a = props.options.callbacks) != null ? _a : {};
    });
    const handleClearAll = () => {
      paramStore.removeAllFilters();
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        id: "lupa-search-results-toolbar",
        class: normalizeClass({ "lupa-filter-no-results": !hasResults.value })
      }, [
        createElementVNode("div", _hoisted_1$l, [
          showLayoutSelection.value ? (openBlock(), createBlock(_sfc_main$r, { key: 0 })) : (openBlock(), createElementBlock("div", _hoisted_2$h)),
          showItemSummary.value ? (openBlock(), createBlock(_sfc_main$I, {
            key: 2,
            label: searchSummaryLabel.value,
            clearable: unref(hasAnyFilter) && showFilterClear.value,
            onClear: handleClearAll
          }, null, 8, ["label", "clearable"])) : (openBlock(), createElementBlock("div", _hoisted_3$b)),
          displayPageSelect.value ? (openBlock(), createBlock(_sfc_main$p, {
            key: 4,
            options: paginationOptions.value.pageSelect,
            "last-page-label": paginationOptions.value.labels.showMore,
            "first-page-label": paginationOptions.value.labels.showLess
          }, null, 8, ["options", "last-page-label", "first-page-label"])) : (openBlock(), createElementBlock("div", _hoisted_4$6))
        ]),
        createElementVNode("div", _hoisted_5$5, [
          createVNode(_sfc_main$q, {
            label: optionsValue.value.labels.mobileFilterButton,
            "show-filter-count": showMobileFilterCount.value
          }, null, 8, ["label", "show-filter-count"]),
          paginationDisplay.value.pageSize ? (openBlock(), createBlock(_sfc_main$o, {
            key: 0,
            options: paginationOptions.value.pageSize,
            label: paginationOptions.value.labels.pageSize
          }, null, 8, ["options", "label"])) : (openBlock(), createElementBlock("div", _hoisted_6$4)),
          sortOptions.value ? (openBlock(), createBlock(_sfc_main$n, {
            key: 2,
            options: sortOptions.value,
            callbacks: callbacks.value
          }, null, 8, ["options", "callbacks"])) : (openBlock(), createElementBlock("div", _hoisted_7$2))
        ])
      ], 2);
    };
  }
});
const _hoisted_1$k = {
  key: 0,
  class: "loading-overlay active"
};
const _hoisted_2$g = { key: 1 };
const _hoisted_3$a = ["innerHTML"];
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsProductCards",
  props: {
    products: {}
  },
  setup(__props) {
    const props = __props;
    const optionsStore = useOptionsStore();
    const isInStock = ref(true);
    const loading = ref(true);
    const error = ref("");
    const rawHtml = ref("");
    const ssr = computed(() => Boolean(optionsStore.searchResultOptions.ssr));
    onMounted(() => __async(this, null, function* () {
      try {
        const product_ids = Object.values(props.products).map(({ id }) => id);
        const response = yield fetch(`https://stg.bigbox.lt/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=${product_ids.join()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const json = yield response.json();
        console.log("Response json: ", json);
        rawHtml.value = json.html;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }));
    const checkIfIsInStock = () => __async(this, null, function* () {
      isInStock.value = props.options.isInStock ? yield props.options.isInStock(props.product) : true;
    });
    if (ssr.value) {
      checkIfIsInStock();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_1$k)) : createCommentVNode("", true),
        error.value ? (openBlock(), createElementBlock("div", _hoisted_2$g, toDisplayString(error.value), 1)) : createCommentVNode("", true),
        !loading.value && !error.value ? (openBlock(), createElementBlock("div", {
          key: 2,
          innerHTML: rawHtml.value
        }, null, 8, _hoisted_3$a)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$j = { key: 0 };
const _hoisted_2$f = { key: 1 };
const _hoisted_3$9 = ["innerHTML"];
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsProductCard",
  props: {
    product: {},
    options: {},
    isAdditionalPanel: { type: Boolean },
    clickTrackingSettings: {}
  },
  setup(__props) {
    const props = __props;
    const optionsStore = useOptionsStore();
    const isInStock = ref(true);
    const loading = ref(true);
    const error = ref("");
    const rawHtml = ref("");
    const ssr = computed(() => Boolean(optionsStore.searchResultOptions.ssr));
    onMounted(() => __async(this, null, function* () {
      try {
        console.log("product: => ", props.product);
        const response = yield fetch(`https://stg.bigbox.lt/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=1027573`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const json = yield response.json();
        console.log("Response json: ", json);
        rawHtml.value = json.html;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }));
    const checkIfIsInStock = () => __async(this, null, function* () {
      isInStock.value = props.options.isInStock ? yield props.options.isInStock(props.product) : true;
    });
    if (ssr.value) {
      checkIfIsInStock();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_1$j, "Loading...")) : createCommentVNode("", true),
        error.value ? (openBlock(), createElementBlock("div", _hoisted_2$f, toDisplayString(error.value), 1)) : createCommentVNode("", true),
        !loading.value && !error.value ? (openBlock(), createElementBlock("div", {
          key: 2,
          innerHTML: rawHtml.value
        }, null, 8, _hoisted_3$9)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$i = {
  id: "lupa-search-results-similar-queries",
  "data-cy": "lupa-search-results-similar-queries"
};
const _hoisted_2$e = { class: "lupa-similar-queries-label" };
const _hoisted_3$8 = {
  class: "lupa-similar-query-label",
  "data-cy": "lupa-similar-query-label"
};
const _hoisted_4$5 = ["onClick"];
const _hoisted_5$4 = ["innerHTML"];
const _hoisted_6$3 = { key: 0 };
const _hoisted_7$1 = {
  class: "lupa-products",
  "data-cy": "lupa-products"
};
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsSimilarQueries",
  props: {
    labels: {},
    columnSize: {},
    productCardOptions: {}
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const paramsStore = useParamsStore();
    const { searchResult } = storeToRefs(searchResultStore);
    const similarQueries = computed(() => searchResult.value.similarQueries);
    const getDocumentKey = (index, product) => {
      return getProductKey(`${index}`, product, props.productCardOptions.idKey);
    };
    const similarQueryLabel = computed(() => {
      var _a, _b;
      return (_b = (_a = props.labels.similarQuery) == null ? void 0 : _a.replace("{1}", "")) != null ? _b : "";
    });
    const getSimilarQueryContent = (displayQuery) => {
      return escapeHtml(displayQuery);
    };
    const goToResults = ({
      searchText,
      facet
    }) => {
      paramsStore.goToResults({ searchText, facet });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$i, [
        createElementVNode("div", _hoisted_2$e, toDisplayString(_ctx.labels.similarQueries), 1),
        (openBlock(true), createElementBlock(Fragment, null, renderList(similarQueries.value, (similarQuery, index) => {
          return openBlock(), createElementBlock("div", { key: index }, [
            createElementVNode("div", _hoisted_3$8, [
              createElementVNode("span", null, toDisplayString(similarQueryLabel.value), 1),
              createElementVNode("span", {
                id: "lupa-similar-query-text-component",
                class: "lupa-similar-query-value lupa-similar-query-link",
                onClick: ($event) => goToResults({ searchText: similarQuery.query }),
                "data-cy": "lupa-similar-query-value"
              }, [
                createElementVNode("span", {
                  innerHTML: getSimilarQueryContent(similarQuery.displayQuery)
                }, null, 8, _hoisted_5$4),
                similarQuery.count ? (openBlock(), createElementBlock("span", _hoisted_6$3, " (" + toDisplayString(similarQuery.count) + ")", 1)) : createCommentVNode("", true)
              ], 8, _hoisted_4$5)
            ]),
            createElementVNode("div", _hoisted_7$1, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(similarQuery.items, (product, index2) => {
                return openBlock(), createBlock(_sfc_main$k, {
                  style: normalizeStyle(_ctx.columnSize),
                  key: getDocumentKey(index2, product),
                  product,
                  options: _ctx.productCardOptions
                }, null, 8, ["style", "product", "options"]);
              }), 128))
            ])
          ]);
        }), 128))
      ]);
    };
  }
});
const _hoisted_1$h = {
  key: 0,
  class: "lupa-results-additional-panel"
};
const _hoisted_2$d = {
  class: "lupa-results-additional-panel-items",
  "data-cy": "lupa-results-additional-panel-items"
};
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "AdditionalPanel",
  props: {
    panel: {},
    options: {}
  },
  setup(__props) {
    const props = __props;
    const result = ref({
      total: 0,
      searchText: "",
      items: [],
      success: true
    });
    const paramStore = useParamsStore();
    const optionStore = useOptionsStore();
    const { query, searchString } = storeToRefs(paramStore);
    const { searchResultOptions } = storeToRefs(optionStore);
    const showAll = ref(false);
    const itemCount = computed(() => {
      var _a, _b;
      return (_b = (_a = result.value) == null ? void 0 : _a.items.length) != null ? _b : 0;
    });
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = result.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const displayShowMore = computed(() => {
      return items.value.length > props.panel.initialCountLimit;
    });
    const visibleItems = computed(() => {
      return showAll.value ? items.value : items.value.slice(0, props.panel.initialCountLimit);
    });
    const hasResults = computed(() => {
      return Boolean(query.value && result.value.total > 0 && result.value.items.length);
    });
    watch(searchString, () => handleQueryChange());
    const handleResults = (res) => {
      var _a, _b;
      result.value = res;
      (_b = (_a = searchResultOptions.value.callbacks) == null ? void 0 : _a.onAdditionalPanelResults) == null ? void 0 : _b.call(_a, {
        queryKey: props.panel.queryKey,
        hasResults: res.total > 0
      });
    };
    const handleQueryChange = () => {
      const context = getLupaTrackingContext();
      const queryBody = __spreadProps(__spreadValues({}, context), {
        limit: props.panel.totalCountLimit,
        searchText: query.value
      });
      LupaSearchSdk.query(props.panel.queryKey, queryBody, props.options).then((res) => {
        if (res.success) {
          handleResults(res);
        }
      }).catch((err) => {
        console.error(err);
      });
    };
    const toggleShowMore = () => {
      showAll.value = !showAll.value;
    };
    const addParams = (label, itemCount2) => {
      return addParamsToLabel(label, itemCount2);
    };
    onMounted(() => {
      if (!query.value) {
        return;
      }
      handleQueryChange();
    });
    return (_ctx, _cache) => {
      return hasResults.value ? (openBlock(), createElementBlock("div", _hoisted_1$h, [
        createElementVNode("div", _hoisted_2$d, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(visibleItems.value, (item, index) => {
            return openBlock(), createBlock(_sfc_main$k, {
              key: index,
              product: item,
              options: _ctx.panel,
              isAdditionalPanel: true
            }, null, 8, ["product", "options"]);
          }), 128))
        ]),
        displayShowMore.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["lupa-additional-panel-show-more", { "lupa-additional-panel-show-less": showAll.value }]),
          "data-cy": "lupa-additional-panel-show-more",
          onClick: toggleShowMore
        }, toDisplayString(showAll.value ? addParams(_ctx.panel.labels.showLess, itemCount.value) : addParams(_ctx.panel.labels.showMore, itemCount.value)), 3)) : createCommentVNode("", true)
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$g = {
  key: 0,
  class: "lupa-results-additional-panels"
};
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "AdditionalPanels",
  props: {
    options: {},
    sdkOptions: {},
    location: {}
  },
  setup(__props) {
    const props = __props;
    const locationPanels = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.additionalPanels) == null ? void 0 : _a.filter((p) => p.location === props.location)) != null ? _b : [];
    });
    const isVisible = computed(() => {
      return locationPanels.value.length > 0;
    });
    return (_ctx, _cache) => {
      return isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_1$g, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(locationPanels.value, (panel) => {
          return openBlock(), createBlock(_sfc_main$i, {
            key: panel.queryKey,
            panel,
            options: _ctx.sdkOptions
          }, null, 8, ["panel", "options"]);
        }), 128))
      ])) : createCommentVNode("", true);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$g = {};
const _hoisted_1$f = { class: "lupa-spinner-wrapper" };
const _hoisted_2$c = { class: "lupa-spinner" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$f, [
    createElementVNode("div", _hoisted_2$c, [
      (openBlock(), createElementBlock(Fragment, null, renderList(12, (x) => {
        return createElementVNode("div", { key: x });
      }), 64))
    ])
  ]);
}
const Spinner = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render]]);
const _hoisted_1$e = {
  id: "lupa-search-results-similar-results",
  "data-cy": "lupa-search-results-similar-results"
};
const _hoisted_2$b = { class: "lupa-similar-results-label" };
const _hoisted_3$7 = {
  class: "lupa-products",
  "data-cy": "lupa-products"
};
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsSimilarResults",
  props: {
    columnSize: {},
    labels: {},
    productCardOptions: {}
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const { searchResult } = storeToRefs(searchResultStore);
    const similarResults = computed(() => searchResult.value.similarResults);
    const getDocumentKey = (index, product) => {
      return getProductKey(`${index}`, product, props.productCardOptions.idKey);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createElementVNode("div", _hoisted_2$b, toDisplayString(_ctx.labels.similarResultsLabel), 1),
        createElementVNode("div", _hoisted_3$7, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(similarResults.value.items, (product, index) => {
            return openBlock(), createBlock(_sfc_main$k, {
              style: normalizeStyle(_ctx.columnSize),
              key: getDocumentKey(index, product),
              product,
              options: _ctx.productCardOptions
            }, null, 8, ["style", "product", "options"]);
          }), 128))
        ])
      ]);
    };
  }
});
const _hoisted_1$d = { id: "lupa-search-results-products" };
const _hoisted_2$a = { id: "lupa-container" };
const _hoisted_3$6 = {
  key: 0,
  class: "lupa-empty-results",
  "data-cy": "lupa-no-results-in-page"
};
const _hoisted_4$4 = {
  key: 3,
  class: "lupa-empty-results",
  "data-cy": "lupa-no-results"
};
const _hoisted_5$3 = { key: 4 };
const _hoisted_6$2 = { key: 5 };
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "SearchResultsProducts",
  props: {
    options: {},
    ssr: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const paramStore = useParamsStore();
    useOptionsStore();
    const {
      hasResults,
      currentQueryText,
      isPageEmpty,
      isMobileSidebarVisible,
      columnCount,
      searchResult,
      layout,
      loading
    } = storeToRefs(searchResultStore);
    const productCardOptions = computed(() => {
      return pick(props.options, [
        "isInStock",
        "badges",
        "links",
        "elements",
        "labels",
        "queryKey",
        "idKey",
        "titleKey",
        "routingBehavior",
        "customDocumentHtmlAttributes"
      ]);
    });
    const similarQueriesLabels = computed(() => {
      return props.options.labels;
    });
    const similarResultsLabels = computed(() => {
      return props.options.labels;
    });
    const showTopFilters = computed(() => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = props.options.filters) == null ? void 0 : _a.facets) == null ? void 0 : _b.style) == null ? void 0 : _c.type) === "top-dropdown";
    });
    const showMobileFilters = computed(() => {
      return props.options.searchTitlePosition !== "search-results-top";
    });
    const currentFilterToolbarVisible = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return Boolean(
        ((_c = (_b = (_a = props.options.filters) == null ? void 0 : _a.currentFilters) == null ? void 0 : _b.visibility) == null ? void 0 : _c.mobileToolbar) || ((_f = (_e = (_d = props.options.filters) == null ? void 0 : _d.currentFilters) == null ? void 0 : _e.visibility) == null ? void 0 : _f.desktopToolbar)
      );
    });
    const currentFilterOptions = computed(() => {
      var _a;
      return currentFilterToolbarVisible.value ? (_a = props.options.filters) == null ? void 0 : _a.currentFilters : void 0;
    });
    const currentFiltersClass = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      if (!currentFilterToolbarVisible.value) {
        return "";
      }
      if (((_c = (_b = (_a = props.options.filters) == null ? void 0 : _a.currentFilters) == null ? void 0 : _b.visibility) == null ? void 0 : _c.mobileToolbar) && ((_f = (_e = (_d = props.options.filters) == null ? void 0 : _d.currentFilters) == null ? void 0 : _e.visibility) == null ? void 0 : _f.desktopToolbar)) {
        return "lupa-toolbar-filters";
      }
      return ((_i = (_h = (_g = props.options.filters) == null ? void 0 : _g.currentFilters) == null ? void 0 : _h.visibility) == null ? void 0 : _i.mobileToolbar) ? "lupa-filters-mobile" : "lupa-toolbar-filters-desktop";
    });
    const desktopFiltersExpanded = computed(() => {
      var _a, _b, _c, _d, _e;
      return (_e = (_d = (_c = (_b = (_a = props.options) == null ? void 0 : _a.filters) == null ? void 0 : _b.currentFilters) == null ? void 0 : _c.desktopToolbar) == null ? void 0 : _d.activeFiltersExpanded) != null ? _e : false;
    });
    const columnSize = computed(() => {
      if (props.ssr) {
        return "";
      }
      if (layout.value === ResultsLayoutEnum.LIST) {
        return "width: 100%";
      }
      return `width: ${100 / columnCount.value}%`;
    });
    const hasSimilarQueries = computed(() => {
      var _a;
      return Boolean((_a = searchResult.value.similarQueries) == null ? void 0 : _a.length);
    });
    const hasSimilarResults = computed(() => {
      var _a, _b;
      return Boolean((_b = (_a = searchResult.value.similarResults) == null ? void 0 : _a.items) == null ? void 0 : _b.length);
    });
    const goToFirstPage = () => {
      paramStore.appendParams({
        params: [{ name: QUERY_PARAMS.PAGE, value: "1" }]
      });
    };
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        unref(loading) && !unref(isMobileSidebarVisible) ? (openBlock(), createBlock(Spinner, {
          key: 0,
          class: "lupa-loader"
        })) : createCommentVNode("", true),
        unref(hasResults) ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          showTopFilters.value ? (openBlock(), createBlock(_sfc_main$s, {
            key: 0,
            options: (_a = _ctx.options.filters) != null ? _a : {}
          }, null, 8, ["options"])) : createCommentVNode("", true),
          showMobileFilters.value ? (openBlock(), createBlock(_sfc_main$m, {
            key: 1,
            class: "lupa-toolbar-mobile",
            options: _ctx.options,
            "pagination-location": "top"
          }, null, 8, ["options"])) : createCommentVNode("", true),
          currentFilterOptions.value ? (openBlock(), createBlock(_sfc_main$F, {
            key: 2,
            class: normalizeClass(currentFiltersClass.value),
            "data-cy": "lupa-search-result-filters-mobile-toolbar",
            options: currentFilterOptions.value,
            expandable: !desktopFiltersExpanded.value
          }, null, 8, ["class", "options", "expandable"])) : createCommentVNode("", true)
        ], 64)) : createCommentVNode("", true),
        createVNode(_sfc_main$h, {
          options: _ctx.options,
          location: "top",
          sdkOptions: _ctx.options.options
        }, null, 8, ["options", "sdkOptions"]),
        unref(hasResults) ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createVNode(_sfc_main$m, {
            class: "lupa-toolbar-top",
            options: _ctx.options,
            "pagination-location": "top"
          }, null, 8, ["options"]),
          createElementVNode("div", _hoisted_2$a, [
            createVNode(_sfc_main$l, {
              products: unref(searchResult).items
            }, null, 8, ["products"])
          ]),
          unref(isPageEmpty) && _ctx.options.labels.noItemsInPage ? (openBlock(), createElementBlock("div", _hoisted_3$6, [
            createTextVNode(toDisplayString(_ctx.options.labels.noItemsInPage) + " ", 1),
            _ctx.options.labels.backToFirstPage ? (openBlock(), createElementBlock("span", {
              key: 0,
              class: "lupa-empty-page-action",
              onClick: goToFirstPage
            }, toDisplayString(_ctx.options.labels.backToFirstPage), 1)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          createVNode(_sfc_main$m, {
            class: "lupa-toolbar-bottom",
            options: _ctx.options,
            "pagination-location": "bottom"
          }, null, 8, ["options"]),
          createVNode(_sfc_main$h, {
            options: _ctx.options,
            location: "bottom",
            sdkOptions: _ctx.options.options
          }, null, 8, ["options", "sdkOptions"])
        ], 64)) : !unref(loading) && unref(currentQueryText) ? (openBlock(), createElementBlock("div", _hoisted_4$4, [
          createTextVNode(toDisplayString(_ctx.options.labels.emptyResults) + " ", 1),
          createElementVNode("span", null, toDisplayString(unref(currentQueryText)), 1)
        ])) : createCommentVNode("", true),
        hasSimilarQueries.value ? (openBlock(), createElementBlock("div", _hoisted_5$3, [
          createVNode(_sfc_main$j, {
            labels: similarQueriesLabels.value,
            columnSize: columnSize.value,
            productCardOptions: productCardOptions.value
          }, null, 8, ["labels", "columnSize", "productCardOptions"])
        ])) : createCommentVNode("", true),
        hasSimilarResults.value ? (openBlock(), createElementBlock("div", _hoisted_6$2, [
          createVNode(_sfc_main$f, {
            labels: similarResultsLabels.value,
            columnSize: columnSize.value,
            productCardOptions: productCardOptions.value
          }, null, 8, ["labels", "columnSize", "productCardOptions"])
        ])) : createCommentVNode("", true),
        renderSlot(_ctx.$slots, "append")
      ]);
    };
  }
});
const _hoisted_1$c = { class: "lupa-top-mobile-filter-wrapper" };
const _hoisted_2$9 = {
  key: 0,
  class: "lupa-category-back"
};
const _hoisted_3$5 = ["href"];
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "CategoryTopFilters",
  props: {
    options: {}
  },
  setup(__props) {
    const props = __props;
    const hasBackButton = computed(() => {
      var _a, _b;
      return Boolean((_b = (_a = props.options.categories) == null ? void 0 : _a.back) == null ? void 0 : _b.title);
    });
    const backTitle = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.categories) == null ? void 0 : _a.back) == null ? void 0 : _b.title;
    });
    const backUrlLink = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = props.options.categories) == null ? void 0 : _a.back) == null ? void 0 : _b.url) != null ? _c : "";
    });
    const hasEventRouting = computed(() => {
      return props.options.routingBehavior === "event";
    });
    const handleNavigationBack = (event) => {
      if (!backUrlLink.value) {
        return;
      }
      handleRoutingEvent(backUrlLink.value, event, hasEventRouting.value);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["lupa-category-top-mobile-filters", { "lupa-has-back-button": hasBackButton.value }])
      }, [
        createElementVNode("div", _hoisted_1$c, [
          hasBackButton.value ? (openBlock(), createElementBlock("div", _hoisted_2$9, [
            createElementVNode("a", {
              "data-cy": "lupa-category-back",
              href: backUrlLink.value,
              onClick: handleNavigationBack
            }, toDisplayString(backTitle.value), 9, _hoisted_3$5)
          ])) : createCommentVNode("", true),
          createVNode(_sfc_main$m, {
            class: "lupa-toolbar-mobile",
            "pagination-location": "top",
            options: _ctx.options
          }, null, 8, ["options"])
        ])
      ], 2);
    };
  }
});
const _hoisted_1$b = {
  key: 0,
  class: "lupa-container-title-summary-mobile"
};
const _hoisted_2$8 = {
  key: 4,
  id: "lupa-search-results",
  class: "top-layout-wrapper"
};
const _hoisted_3$4 = { class: "search-content" };
const _hoisted_4$3 = { id: "lupa-search-results" };
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "SearchResults",
  props: {
    options: {},
    initialFilters: {},
    isProductList: { type: Boolean },
    isContainer: { type: Boolean },
    initialData: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const searchResultStore = useSearchResultStore();
    const optionStore = useOptionsStore();
    const paramStore = useParamsStore();
    const trackingStore = useTrackingStore();
    const dynamicDataStore = useDynamicDataStore();
    const screenStore = useScreenStore();
    const redirectionStore = useRedirectionStore();
    const initialFilters = computed(() => {
      var _a;
      return (_a = props.initialFilters) != null ? _a : {};
    });
    const { currentQueryText, hasResults, currentFilterCount } = storeToRefs(searchResultStore);
    const { searchString, sortParams } = storeToRefs(paramStore);
    const { defaultSearchResultPageSize } = storeToRefs(optionStore);
    const searchResultsFilters = ref(null);
    const mounted = ref(false);
    const ssrEnabled = computed(() => Boolean(props.options.ssr));
    const didYouMeanLabels = computed(() => {
      return pick(props.options.labels, ["noResultsSuggestion", "didYouMean"]);
    });
    const showFilterSidebar = computed(() => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = props.options.filters) == null ? void 0 : _a.facets) == null ? void 0 : _b.style) == null ? void 0 : _c.type) === "sidebar" && (hasResults.value || currentFilterCount.value > 0);
    });
    const isTitleResultTopPosition = computed(() => {
      return props.options.searchTitlePosition === "search-results-top";
    });
    const handlePopState = () => {
      var _a;
      const searchParams = getSearchParams((_a = props.options.ssr) == null ? void 0 : _a.url);
      paramStore.add(parseParams(searchParams));
    };
    onMounted(() => __async(this, null, function* () {
      var _a, _b;
      window.addEventListener("popstate", handlePopState);
      window.addEventListener("resize", handleResize);
      yield redirectionStore.initiate(props.options.redirections, props.options.options);
      if (props.initialData) {
        searchResultStore.add(__spreadValues({}, props.initialData));
      }
      handleMounted();
      (_b = (_a = props.options.callbacks) == null ? void 0 : _a.onMounted) == null ? void 0 : _b.call(_a);
      mounted.value = true;
    }));
    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("popstate", handlePopState);
    });
    const trackItemListView = (title, items = []) => {
      var _a, _b;
      trackingStore.trackEvent({
        queryKey: props.options.queryKey,
        data: {
          analytics: {
            type: "view_item_list",
            label: title,
            listLabel: title,
            items,
            additionalParams: {
              previousSortKey: (_a = sortParams.value) == null ? void 0 : _a.previousSortKey,
              newSortKey: (_b = sortParams.value) == null ? void 0 : _b.selectedSortKey
            }
          },
          options: { allowEmptySearchQuery: true }
        }
      });
    };
    const handleResults = (_0) => __async(this, [_0], function* ({
      queryKey,
      results
    }) {
      var _a, _b, _c, _d, _e, _f;
      trackingStore.trackResults({ queryKey, results });
      const hasResults2 = Boolean(
        results.total > 0 || ((_a = results.similarQueries) == null ? void 0 : _a.length) || ((_b = results.didYouMean) == null ? void 0 : _b.options)
      );
      if (!hasResults2) {
        (_d = (_c = props.options.callbacks) == null ? void 0 : _c.onSearchResults) == null ? void 0 : _d.call(_c, { queryKey, hasResults: hasResults2, params: paramStore.params, html: "" });
        return;
      }
      const response = yield fetch(`https://stg.bigbox.lt/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=${results.items.map(({ id }) => id).join()}`);
      const json = yield response.json();
      (_f = (_e = props.options.callbacks) == null ? void 0 : _e.onSearchResults) == null ? void 0 : _f.call(_e, { queryKey, hasResults: hasResults2, params: paramStore.params, html: json.html });
      trackItemListView(props.options.labels.htmlTitleTemplate, results.items);
      yield dynamicDataStore.enhanceSearchResultsWithDynamicData({ result: results });
    });
    const query = (publicQuery) => {
      trackingStore.trackSearch({
        queryKey: props.options.queryKey,
        query: publicQuery,
        type: "search_form_submit"
      });
      const context = getLupaTrackingContext();
      const limit = publicQuery.limit || defaultSearchResultPageSize.value;
      const query2 = __spreadProps(__spreadValues(__spreadValues({}, publicQuery), context), { limit });
      const redirectionApplied = redirectionStore.redirectOnKeywordIfConfigured(
        publicQuery.searchText,
        optionStore.searchResultsRoutingBehavior
      );
      if (redirectionApplied) {
        return;
      }
      if (!query2.searchText && props.options.disallowEmptyQuery) {
        return;
      }
      LupaSearchSdk.query(props.options.queryKey, query2, props.options.options).then((res) => {
        var _a, _b;
        if (res.success) {
          handleResults({ queryKey: props.options.queryKey, results: res });
          searchResultStore.add(__spreadValues({}, res));
        } else if ((_b = (_a = props.options) == null ? void 0 : _a.options) == null ? void 0 : _b.onError) {
          props.options.options.onError(res);
        }
      }).catch((err) => {
        var _a, _b;
        console.error(err);
        if ((_b = (_a = props.options) == null ? void 0 : _a.options) == null ? void 0 : _b.onError) {
          props.options.options.onError(err);
        }
      }).finally(() => {
        searchResultStore.setLoading(false);
      });
    };
    const handleResize = () => {
      const doc = document.documentElement;
      doc.style.setProperty("--lupa-full-height", `${window.innerHeight}px`);
      searchResultStore.setColumnCount({ width: window.innerWidth, grid: props.options.grid });
      screenStore.setScreenWidth({ width: window.innerWidth });
    };
    const handleUrlChange = (params) => {
      var _a;
      const searchParams = getSearchParams((_a = props.options.ssr) == null ? void 0 : _a.url, params);
      const publicQuery = createPublicQuery(
        parseParams(searchParams),
        props.options.sort,
        defaultSearchResultPageSize.value
      );
      searchResultStore.setLoading(true);
      query(getPublicQuery(publicQuery, initialFilters.value, props.isProductList));
    };
    const handleMounted = () => {
      var _a;
      optionStore.setSearchResultOptions({ options: props.options });
      optionStore.setInitialFilters({ initialFilters: initialFilters.value });
      handleResize();
      if (props.isProductList) {
        const pageTitle = props.options.labels.htmlTitleTemplate;
        setDocumentTitle(pageTitle, "");
        if (searchResultsFilters.value) {
          (_a = searchResultsFilters.value) == null ? void 0 : _a.fetch();
        }
      }
      const params = new URLSearchParams(window.location.search);
      if (!params.has(QUERY_PARAMS.QUERY) && !props.initialData) {
        handleUrlChange(params);
      }
      paramStore.add(parseParams(params));
      paramStore.setDefaultLimit(defaultSearchResultPageSize.value);
    };
    watch(searchString, () => handleParamsChange());
    const handleParamsChange = () => {
      var _a, _b;
      if (props.initialData && !mounted.value) {
        return;
      }
      handleUrlChange();
      (_b = (_a = props.options.callbacks) == null ? void 0 : _a.onUrlQueryChange) == null ? void 0 : _b.call(_a, {
        queryKey: props.options.queryKey,
        urlQueryString: searchString.value
      });
    };
    const handleCreated = () => {
      var _a, _b;
      const initialData = props.initialData;
      if (initialData) {
        if (typeof window !== "undefined") {
          optionStore.setSearchResultOptions({ options: props.options });
          if (props.initialData) {
            searchResultStore.add(__spreadValues({}, props.initialData));
          }
          handleMounted();
          return;
        }
        const searchParams = getSearchParams(
          (_a = props.options.ssr) == null ? void 0 : _a.url,
          void 0,
          (_b = props.options.ssr) == null ? void 0 : _b.baseUrl
        );
        optionStore.setSearchResultOptions({ options: props.options });
        searchResultStore.add(__spreadValues({}, initialData));
        paramStore.add(parseParams(searchParams), props.options.ssr);
        paramStore.setDefaultLimit(defaultSearchResultPageSize.value);
        handleResults({ queryKey: props.options.queryKey, results: initialData });
      }
    };
    handleCreated();
    __expose({ handleMounted, handleUrlChange });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["lupa-search-result-wrapper", { "lupa-search-wrapper-no-results": !unref(hasResults) }])
      }, [
        _ctx.isContainer ? (openBlock(), createElementBlock("div", _hoisted_1$b, [
          createVNode(_sfc_main$J, { labels: didYouMeanLabels.value }, null, 8, ["labels"]),
          createVNode(_sfc_main$H, {
            "show-summary": true,
            options: _ctx.options,
            "is-product-list": (_a = _ctx.isProductList) != null ? _a : false
          }, null, 8, ["options", "is-product-list"])
        ])) : createCommentVNode("", true),
        isTitleResultTopPosition.value ? (openBlock(), createBlock(_sfc_main$d, {
          key: 1,
          options: _ctx.options
        }, null, 8, ["options"])) : createCommentVNode("", true),
        _ctx.options.filters ? (openBlock(), createBlock(_sfc_main$u, {
          key: 2,
          options: _ctx.options.filters
        }, null, 8, ["options"])) : createCommentVNode("", true),
        unref(currentQueryText) || _ctx.isProductList ? (openBlock(), createBlock(_sfc_main$t, {
          key: 3,
          breadcrumbs: _ctx.options.breadcrumbs
        }, null, 8, ["breadcrumbs"])) : createCommentVNode("", true),
        isTitleResultTopPosition.value ? (openBlock(), createElementBlock("div", _hoisted_2$8, [
          showFilterSidebar.value ? (openBlock(), createBlock(_sfc_main$v, {
            key: 0,
            options: (_b = _ctx.options.filters) != null ? _b : {},
            ref_key: "searchResultsFilters",
            ref: searchResultsFilters
          }, null, 8, ["options"])) : createCommentVNode("", true),
          createElementVNode("div", _hoisted_3$4, [
            createVNode(_sfc_main$J, { labels: didYouMeanLabels.value }, null, 8, ["labels"]),
            createVNode(_sfc_main$H, {
              options: _ctx.options,
              "is-product-list": (_c = _ctx.isProductList) != null ? _c : false
            }, null, 8, ["options", "is-product-list"]),
            createVNode(_sfc_main$e, {
              options: _ctx.options,
              ssr: ssrEnabled.value
            }, {
              append: withCtx(() => [
                renderSlot(_ctx.$slots, "default")
              ]),
              _: 3
            }, 8, ["options", "ssr"])
          ])
        ])) : (openBlock(), createElementBlock(Fragment, { key: 5 }, [
          createVNode(_sfc_main$J, { labels: didYouMeanLabels.value }, null, 8, ["labels"]),
          createVNode(_sfc_main$H, {
            options: _ctx.options,
            "is-product-list": (_d = _ctx.isProductList) != null ? _d : false
          }, null, 8, ["options", "is-product-list"]),
          createElementVNode("div", _hoisted_4$3, [
            showFilterSidebar.value ? (openBlock(), createBlock(_sfc_main$v, {
              key: 0,
              options: (_e = _ctx.options.filters) != null ? _e : {},
              ref_key: "searchResultsFilters",
              ref: searchResultsFilters
            }, null, 8, ["options"])) : createCommentVNode("", true),
            createVNode(_sfc_main$e, {
              options: _ctx.options,
              ssr: ssrEnabled.value
            }, createSlots({
              append: withCtx(() => [
                renderSlot(_ctx.$slots, "default")
              ]),
              _: 2
            }, [
              _ctx.$slots.productCard ? {
                name: "productCard",
                fn: withCtx((props2) => [
                  renderSlot(_ctx.$slots, "productCard", normalizeProps(guardReactiveProps(props2)))
                ]),
                key: "0"
              } : void 0
            ]), 1032, ["options", "ssr"])
          ])
        ], 64))
      ], 2);
    };
  }
});
const _hoisted_1$a = {
  key: 0,
  class: "lupa-category-overview"
};
const _hoisted_2$7 = ["innerHTML"];
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "CategoryDescription",
  props: {
    options: {}
  },
  setup(__props) {
    const props = __props;
    const description = computed(() => {
      var _a, _b;
      return (_b = (_a = props.options.categories) == null ? void 0 : _a.current) == null ? void 0 : _b.description;
    });
    const overviewVisible = computed(() => {
      var _a, _b;
      return Boolean((_b = (_a = props.options.categories) == null ? void 0 : _a.current) == null ? void 0 : _b.description);
    });
    return (_ctx, _cache) => {
      return overviewVisible.value ? (openBlock(), createElementBlock("div", _hoisted_1$a, [
        createElementVNode("div", {
          class: "lupa-category-description",
          innerHTML: description.value
        }, null, 8, _hoisted_2$7)
      ])) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "ProductList",
  props: {
    options: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const searchResults = ref(null);
    const componentOptions = computed(() => {
      return __spreadProps(__spreadValues({}, props.options), {
        filters: __spreadProps(__spreadValues({}, props.options.filters), {
          categories: props.options.categories
        })
      });
    });
    const fetch2 = () => {
      var _a;
      (_a = searchResults.value) == null ? void 0 : _a.handleMounted();
    };
    __expose({ fetch: fetch2 });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createVNode(_sfc_main$c, {
          options: componentOptions.value,
          "initial-filters": _ctx.options.initialFilters,
          "is-product-list": true,
          ref_key: "searchResults",
          ref: searchResults
        }, {
          default: withCtx(() => [
            createVNode(_sfc_main$b, { options: _ctx.options }, null, 8, ["options"])
          ]),
          _: 1
        }, 8, ["options", "initial-filters"])
      ]);
    };
  }
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var lodash = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
lodash.exports;
(function(module, exports) {
  (function() {
    var undefined$1;
    var VERSION = "4.17.21";
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [
      ["ary", WRAP_ARY_FLAG],
      ["bind", WRAP_BIND_FLAG],
      ["bindKey", WRAP_BIND_KEY_FLAG],
      ["curry", WRAP_CURRY_FLAG],
      ["curryRight", WRAP_CURRY_RIGHT_FLAG],
      ["flip", WRAP_FLIP_FLAG],
      ["partial", WRAP_PARTIAL_FLAG],
      ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
      ["rearg", WRAP_REARG_FLAG]
    ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrimStart = /^\s+/;
    var reWhitespace = /\s/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [
      "Array",
      "Buffer",
      "DataView",
      "Date",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "Map",
      "Math",
      "Object",
      "Promise",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "WeakMap",
      "_",
      "clearTimeout",
      "isFinite",
      "parseInt",
      "setTimeout"
    ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "Ç": "C",
      "ç": "c",
      "Ð": "D",
      "ð": "d",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "Ñ": "N",
      "ñ": "n",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "Ý": "Y",
      "ý": "y",
      "ÿ": "y",
      "Æ": "Ae",
      "æ": "ae",
      "Þ": "Th",
      "þ": "th",
      "ß": "ss",
      // Latin Extended-A block.
      "Ā": "A",
      "Ă": "A",
      "Ą": "A",
      "ā": "a",
      "ă": "a",
      "ą": "a",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "Ď": "D",
      "Đ": "D",
      "ď": "d",
      "đ": "d",
      "Ē": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ę": "E",
      "Ě": "E",
      "ē": "e",
      "ĕ": "e",
      "ė": "e",
      "ę": "e",
      "ě": "e",
      "Ĝ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ģ": "G",
      "ĝ": "g",
      "ğ": "g",
      "ġ": "g",
      "ģ": "g",
      "Ĥ": "H",
      "Ħ": "H",
      "ĥ": "h",
      "ħ": "h",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "Į": "I",
      "İ": "I",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "į": "i",
      "ı": "i",
      "Ĵ": "J",
      "ĵ": "j",
      "Ķ": "K",
      "ķ": "k",
      "ĸ": "k",
      "Ĺ": "L",
      "Ļ": "L",
      "Ľ": "L",
      "Ŀ": "L",
      "Ł": "L",
      "ĺ": "l",
      "ļ": "l",
      "ľ": "l",
      "ŀ": "l",
      "ł": "l",
      "Ń": "N",
      "Ņ": "N",
      "Ň": "N",
      "Ŋ": "N",
      "ń": "n",
      "ņ": "n",
      "ň": "n",
      "ŋ": "n",
      "Ō": "O",
      "Ŏ": "O",
      "Ő": "O",
      "ō": "o",
      "ŏ": "o",
      "ő": "o",
      "Ŕ": "R",
      "Ŗ": "R",
      "Ř": "R",
      "ŕ": "r",
      "ŗ": "r",
      "ř": "r",
      "Ś": "S",
      "Ŝ": "S",
      "Ş": "S",
      "Š": "S",
      "ś": "s",
      "ŝ": "s",
      "ş": "s",
      "š": "s",
      "Ţ": "T",
      "Ť": "T",
      "Ŧ": "T",
      "ţ": "t",
      "ť": "t",
      "ŧ": "t",
      "Ũ": "U",
      "Ū": "U",
      "Ŭ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ų": "U",
      "ũ": "u",
      "ū": "u",
      "ŭ": "u",
      "ů": "u",
      "ű": "u",
      "ų": "u",
      "Ŵ": "W",
      "ŵ": "w",
      "Ŷ": "Y",
      "ŷ": "y",
      "Ÿ": "Y",
      "Ź": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "ź": "z",
      "ż": "z",
      "ž": "z",
      "Ĳ": "IJ",
      "ĳ": "ij",
      "Œ": "Oe",
      "œ": "oe",
      "ŉ": "'n",
      "ſ": "s"
    };
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var htmlUnescapes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'"
    };
    var stringEscapes = {
      "\\": "\\",
      "'": "'",
      "\n": "n",
      "\r": "r",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEachRight(array, iteratee) {
      var length = array == null ? 0 : array.length;
      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEvery(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }
      return true;
    }
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function arrayIncludesWith(array, value, comparator) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }
    function arrayMap(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
      var length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection2) {
        if (predicate(value, key, collection2)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (comparator(array[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseMean(array, iteratee) {
      var length = array == null ? 0 : array.length;
      return length ? baseSum(array, iteratee) / length : NAN;
    }
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
      });
      return accumulator;
    }
    function baseSortBy(array, comparer) {
      var length = array.length;
      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }
    function baseSum(array, iteratee) {
      var result, index = -1, length = array.length;
      while (++index < length) {
        var current = iteratee(array[index]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : result + current;
        }
      }
      return result;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseToPairs(object, props) {
      return arrayMap(props, function(key) {
        return [key, object[key]];
      });
    }
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1, length = strSymbols.length;
      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;
      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function countHolders(array, placeholder) {
      var length = array.length, result = 0;
      while (length--) {
        if (array[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
      return "\\" + stringEscapes[chr];
    }
    function getValue(object, key) {
      return object == null ? undefined$1 : object[key];
    }
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
      var data, result = [];
      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function replaceHolders(array, placeholder) {
      var index = -1, length = array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (value === placeholder || value === PLACEHOLDER) {
          array[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }
      return result;
    }
    function setToArray(set2) {
      var index = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    function setToPairs(set2) {
      var index = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index] = [value, value];
      });
      return result;
    }
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function strictLastIndexOf(array, value, fromIndex) {
      var index = fromIndex + 1;
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return index;
    }
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var runInContext = function runInContext2(context) {
      context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
      var Array2 = context.Array, Date2 = context.Date, Error2 = context.Error, Function2 = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String, TypeError2 = context.TypeError;
      var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
      var coreJsData = context["__core-js_shared__"];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;
      var maskSrcKey = function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      }();
      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object2);
      var oldDash = root._;
      var reIsNative = RegExp2(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Buffer2 = moduleExports ? context.Buffer : undefined$1, Symbol2 = context.Symbol, Uint8Array2 = context.Uint8Array, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : undefined$1, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined$1, symIterator = Symbol2 ? Symbol2.iterator : undefined$1, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined$1;
      var defineProperty = function() {
        try {
          var func = getNative(Object2, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      }();
      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date2 && Date2.now !== root.Date.now && Date2.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
      var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined$1, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
      var DataView = getNative(context, "DataView"), Map2 = getNative(context, "Map"), Promise2 = getNative(context, "Promise"), Set2 = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object2, "create");
      var metaMap = WeakMap && new WeakMap();
      var realNames = {};
      var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol2 ? Symbol2.prototype : undefined$1, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1, symbolToString = symbolProto ? symbolProto.toString : undefined$1;
      function lodash2(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, "__wrapped__")) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }
      var baseCreate = function() {
        function object() {
        }
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result2 = new object();
          object.prototype = undefined$1;
          return result2;
        };
      }();
      function baseLodash() {
      }
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }
      lodash2.templateSettings = {
        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "escape": reEscape,
        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "evaluate": reEvaluate,
        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "interpolate": reInterpolate,
        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        "variable": "",
        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        "imports": {
          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          "_": lodash2
        }
      };
      lodash2.prototype = baseLodash.prototype;
      lodash2.prototype.constructor = lodash2;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }
      function lazyClone() {
        var result2 = new LazyWrapper(this.__wrapped__);
        result2.__actions__ = copyArray(this.__actions__);
        result2.__dir__ = this.__dir__;
        result2.__filtered__ = this.__filtered__;
        result2.__iteratees__ = copyArray(this.__iteratees__);
        result2.__takeCount__ = this.__takeCount__;
        result2.__views__ = copyArray(this.__views__);
        return result2;
      }
      function lazyReverse() {
        if (this.__filtered__) {
          var result2 = new LazyWrapper(this);
          result2.__dir__ = -1;
          result2.__filtered__ = true;
        } else {
          result2 = this.clone();
          result2.__dir__ *= -1;
        }
        return result2;
      }
      function lazyValue() {
        var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array, this.__actions__);
        }
        var result2 = [];
        outer:
          while (length-- && resIndex < takeCount) {
            index += dir;
            var iterIndex = -1, value = array[index];
            while (++iterIndex < iterLength) {
              var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed2 = iteratee2(value);
              if (type == LAZY_MAP_FLAG) {
                value = computed2;
              } else if (!computed2) {
                if (type == LAZY_FILTER_FLAG) {
                  continue outer;
                } else {
                  break outer;
                }
              }
            }
            result2[resIndex++] = value;
          }
        return result2;
      }
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      function hashDelete(key) {
        var result2 = this.has(key) && delete this.__data__[key];
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result2 = data[key];
          return result2 === HASH_UNDEFINED ? undefined$1 : result2;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined$1 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined$1 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? undefined$1 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map2 || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        var result2 = getMapData(this, key)["delete"](key);
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size2 = data.size;
        data.set(key, value);
        this.size += data.size == size2 ? 0 : 1;
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function SetCache(values2) {
        var index = -1, length = values2 == null ? 0 : values2.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values2[index]);
        }
      }
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      function stackDelete(key) {
        var data = this.__data__, result2 = data["delete"](key);
        this.size = data.size;
        return result2;
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined$1;
      }
      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }
      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }
      function assignMergeValue(object, key, value) {
        if (value !== undefined$1 && !eq(object[key], value) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAggregator(collection, setter, iteratee2, accumulator) {
        baseEach(collection, function(value, key, collection2) {
          setter(accumulator, value, iteratee2(value), collection2);
        });
        return accumulator;
      }
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }
      function baseAssignValue(object, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object[key] = value;
        }
      }
      function baseAt(object, paths) {
        var index = -1, length = paths.length, result2 = Array2(length), skip = object == null;
        while (++index < length) {
          result2[index] = skip ? undefined$1 : get(object, paths[index]);
        }
        return result2;
      }
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined$1) {
            number = number <= upper ? number : upper;
          }
          if (lower !== undefined$1) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }
      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result2 = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result2 !== undefined$1) {
          return result2;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result2 = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result2);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            result2 = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result2 = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result2);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result2;
      }
      function baseConforms(source) {
        var props = keys(source);
        return function(object) {
          return baseConformsTo(object, source, props);
        };
      }
      function baseConformsTo(object, source, props) {
        var length = props.length;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (length--) {
          var key = props[length], predicate = source[key], value = object[key];
          if (value === undefined$1 && !(key in object) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }
      function baseDelay(func, wait, args) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return setTimeout2(function() {
          func.apply(undefined$1, args);
        }, wait);
      }
      function baseDifference(array, values2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, isCommon = true, length = array.length, result2 = [], valuesLength = values2.length;
        if (!length) {
          return result2;
        }
        if (iteratee2) {
          values2 = arrayMap(values2, baseUnary(iteratee2));
        }
        if (comparator) {
          includes2 = arrayIncludesWith;
          isCommon = false;
        } else if (values2.length >= LARGE_ARRAY_SIZE) {
          includes2 = cacheHas;
          isCommon = false;
          values2 = new SetCache(values2);
        }
        outer:
          while (++index < length) {
            var value = array[index], computed2 = iteratee2 == null ? value : iteratee2(value);
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed2 === computed2) {
              var valuesIndex = valuesLength;
              while (valuesIndex--) {
                if (values2[valuesIndex] === computed2) {
                  continue outer;
                }
              }
              result2.push(value);
            } else if (!includes2(values2, computed2, comparator)) {
              result2.push(value);
            }
          }
        return result2;
      }
      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);
      function baseEvery(collection, predicate) {
        var result2 = true;
        baseEach(collection, function(value, index, collection2) {
          result2 = !!predicate(value, index, collection2);
          return result2;
        });
        return result2;
      }
      function baseExtremum(array, iteratee2, comparator) {
        var index = -1, length = array.length;
        while (++index < length) {
          var value = array[index], current = iteratee2(value);
          if (current != null && (computed2 === undefined$1 ? current === current && !isSymbol(current) : comparator(current, computed2))) {
            var computed2 = current, result2 = value;
          }
        }
        return result2;
      }
      function baseFill(array, value, start, end) {
        var length = array.length;
        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end === undefined$1 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array[start++] = value;
        }
        return array;
      }
      function baseFilter(collection, predicate) {
        var result2 = [];
        baseEach(collection, function(value, index, collection2) {
          if (predicate(value, index, collection2)) {
            result2.push(value);
          }
        });
        return result2;
      }
      function baseFlatten(array, depth, predicate, isStrict, result2) {
        var index = -1, length = array.length;
        predicate || (predicate = isFlattenable);
        result2 || (result2 = []);
        while (++index < length) {
          var value = array[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result2);
            } else {
              arrayPush(result2, value);
            }
          } else if (!isStrict) {
            result2[result2.length] = value;
          }
        }
        return result2;
      }
      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);
      function baseForOwn(object, iteratee2) {
        return object && baseFor(object, iteratee2, keys);
      }
      function baseForOwnRight(object, iteratee2) {
        return object && baseForRight(object, iteratee2, keys);
      }
      function baseFunctions(object, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object[key]);
        });
      }
      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : undefined$1;
      }
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result2 = keysFunc(object);
        return isArray(object) ? result2 : arrayPush(result2, symbolsFunc(object));
      }
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
      }
      function baseGt(value, other) {
        return value > other;
      }
      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }
      function baseHasIn(object, key) {
        return object != null && key in Object2(object);
      }
      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }
      function baseIntersection(arrays, iteratee2, comparator) {
        var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
        while (othIndex--) {
          var array = arrays[othIndex];
          if (othIndex && iteratee2) {
            array = arrayMap(array, baseUnary(iteratee2));
          }
          maxLength = nativeMin(array.length, maxLength);
          caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined$1;
        }
        array = arrays[0];
        var index = -1, seen = caches[0];
        outer:
          while (++index < length && result2.length < maxLength) {
            var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (!(seen ? cacheHas(seen, computed2) : includes2(result2, computed2, comparator))) {
              othIndex = othLength;
              while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed2) : includes2(arrays[othIndex], computed2, comparator))) {
                  continue outer;
                }
              }
              if (seen) {
                seen.push(computed2);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseInverter(object, setter, iteratee2, accumulator) {
        baseForOwn(object, function(value, key, object2) {
          setter(accumulator, iteratee2(value), key, object2);
        });
        return accumulator;
      }
      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object, args);
      }
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result2 = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result2 === undefined$1 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
              return false;
            }
          }
        }
        return true;
      }
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result2 = [];
        for (var key in Object2(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object), result2 = [];
        for (var key in object) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseLt(value, other) {
        return value < other;
      }
      function baseMap(collection, iteratee2) {
        var index = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result2[++index] = iteratee2(value, key, collection2);
        });
        return result2;
      }
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return objValue === undefined$1 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack());
          if (isObject(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined$1;
            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined$1;
        var isCommon = newValue === undefined$1;
        if (isCommon) {
          var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject2(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }
      function baseNth(array, n) {
        var length = array.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array[n] : undefined$1;
      }
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee2) {
            if (isArray(iteratee2)) {
              return function(value) {
                return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
              };
            }
            return iteratee2;
          });
        } else {
          iteratees = [identity];
        }
        var index = -1;
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        var result2 = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee2) {
            return iteratee2(value);
          });
          return { "criteria": criteria, "index": ++index, "value": value };
        });
        return baseSortBy(result2, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }
      function basePickBy(object, paths, predicate) {
        var index = -1, length = paths.length, result2 = {};
        while (++index < length) {
          var path = paths[index], value = baseGet(object, path);
          if (predicate(value, path)) {
            baseSet(result2, castPath(path, object), value);
          }
        }
        return result2;
      }
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      function basePullAll(array, values2, iteratee2, comparator) {
        var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen = array;
        if (array === values2) {
          values2 = copyArray(values2);
        }
        if (iteratee2) {
          seen = arrayMap(array, baseUnary(iteratee2));
        }
        while (++index < length) {
          var fromIndex = 0, value = values2[index], computed2 = iteratee2 ? iteratee2(value) : value;
          while ((fromIndex = indexOf2(seen, computed2, fromIndex, comparator)) > -1) {
            if (seen !== array) {
              splice.call(seen, fromIndex, 1);
            }
            splice.call(array, fromIndex, 1);
          }
        }
        return array;
      }
      function basePullAt(array, indexes) {
        var length = array ? indexes.length : 0, lastIndex = length - 1;
        while (length--) {
          var index = indexes[length];
          if (length == lastIndex || index !== previous) {
            var previous = index;
            if (isIndex(index)) {
              splice.call(array, index, 1);
            } else {
              baseUnset(array, index);
            }
          }
        }
        return array;
      }
      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }
      function baseRange(start, end, step, fromRight) {
        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result2 = Array2(length);
        while (length--) {
          result2[fromRight ? length : ++index] = start;
          start += step;
        }
        return result2;
      }
      function baseRepeat(string, n) {
        var result2 = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result2;
        }
        do {
          if (n % 2) {
            result2 += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result2;
      }
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
      }
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant(string),
          "writable": true
        });
      };
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result2 = Array2(length);
        while (++index < length) {
          result2[index] = array[index + start];
        }
        return result2;
      }
      function baseSome(collection, predicate) {
        var result2;
        baseEach(collection, function(value, index, collection2) {
          result2 = predicate(value, index, collection2);
          return !result2;
        });
        return !!result2;
      }
      function baseSortedIndex(array, value, retHighest) {
        var low = 0, high = array == null ? low : array.length;
        if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1, computed2 = array[mid];
            if (computed2 !== null && !isSymbol(computed2) && (retHighest ? computed2 <= value : computed2 < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array, value, identity, retHighest);
      }
      function baseSortedIndexBy(array, value, iteratee2, retHighest) {
        var low = 0, high = array == null ? 0 : array.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee2(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined$1;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed2 = iteratee2(array[mid]), othIsDefined = computed2 !== undefined$1, othIsNull = computed2 === null, othIsReflexive = computed2 === computed2, othIsSymbol = isSymbol(computed2);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed2 <= value : computed2 < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      function baseSortedUniq(array, iteratee2) {
        var index = -1, length = array.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
          if (!index || !eq(computed2, seen)) {
            var seen = computed2;
            result2[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result2;
      }
      function baseToNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function baseUniq(array, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, length = array.length, isCommon = true, result2 = [], seen = result2;
        if (comparator) {
          isCommon = false;
          includes2 = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set3 = iteratee2 ? null : createSet(array);
          if (set3) {
            return setToArray(set3);
          }
          isCommon = false;
          includes2 = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee2 ? [] : result2;
        }
        outer:
          while (++index < length) {
            var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed2 === computed2) {
              var seenIndex = seen.length;
              while (seenIndex--) {
                if (seen[seenIndex] === computed2) {
                  continue outer;
                }
              }
              if (iteratee2) {
                seen.push(computed2);
              }
              result2.push(value);
            } else if (!includes2(seen, computed2, comparator)) {
              if (seen !== result2) {
                seen.push(computed2);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }
      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }
      function baseWhile(array, predicate, isDrop, fromRight) {
        var length = array.length, index = fromRight ? length : -1;
        while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {
        }
        return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
      }
      function baseWrapperValue(value, actions) {
        var result2 = value;
        if (result2 instanceof LazyWrapper) {
          result2 = result2.value();
        }
        return arrayReduce(actions, function(result3, action) {
          return action.func.apply(action.thisArg, arrayPush([result3], action.args));
        }, result2);
      }
      function baseXor(arrays, iteratee2, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index = -1, result2 = Array2(length);
        while (++index < length) {
          var array = arrays[index], othIndex = -1;
          while (++othIndex < length) {
            if (othIndex != index) {
              result2[index] = baseDifference(result2[index] || array, arrays[othIndex], iteratee2, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
      }
      function baseZipObject(props, values2, assignFunc) {
        var index = -1, length = props.length, valsLength = values2.length, result2 = {};
        while (++index < length) {
          var value = index < valsLength ? values2[index] : undefined$1;
          assignFunc(result2, props[index], value);
        }
        return result2;
      }
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      function castFunction(value) {
        return typeof value == "function" ? value : identity;
      }
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      var castRest = baseRest;
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined$1 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      var clearTimeout2 = ctxClearTimeout || function(id) {
        return root.clearTimeout(id);
      };
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result2);
        return result2;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result2).set(new Uint8Array2(arrayBuffer));
        return result2;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneRegExp(regexp) {
        var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result2.lastIndex = regexp.lastIndex;
        return result2;
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined$1, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      function compareMultiple(object, other, orders) {
        var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index < length) {
          var result2 = compareAscending(objCriteria[index], othCriteria[index]);
          if (result2) {
            if (index >= ordersLength) {
              return result2;
            }
            var order = orders[index];
            return result2 * (order == "desc" ? -1 : 1);
          }
        }
        return object.index - other.index;
      }
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
        while (++leftIndex < leftLength) {
          result2[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result2[leftIndex++] = args[argsIndex++];
        }
        return result2;
      }
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
        while (++argsIndex < rangeLength) {
          result2[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result2[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result2;
      }
      function copyArray(source, array) {
        var index = -1, length = source.length;
        array || (array = Array2(length));
        while (++index < length) {
          array[index] = source[index];
        }
        return array;
      }
      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined$1;
          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }
      function createAggregator(setter, initializer) {
        return function(collection, iteratee2) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
        };
      }
      function createAssigner(assigner) {
        return baseRest(function(object, sources) {
          var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined$1, guard = length > 2 ? sources[2] : undefined$1;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined$1;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object = Object2(object);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object, source, index, customizer);
            }
          }
          return object;
        });
      }
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee2) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee2);
          }
          var length = collection.length, index = fromRight ? length : -1, iterable = Object2(collection);
          while (fromRight ? index-- : ++index < length) {
            if (iteratee2(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      function createBaseFor(fromRight) {
        return function(object, iteratee2, keysFunc) {
          var index = -1, iterable = Object2(object), props = keysFunc(object), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee2(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object;
        };
      }
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined$1;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
        };
      }
      function createCtor(Ctor) {
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return new Ctor();
            case 1:
              return new Ctor(args[0]);
            case 2:
              return new Ctor(args[0], args[1]);
            case 3:
              return new Ctor(args[0], args[1], args[2]);
            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);
            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
          return isObject(result2) ? result2 : thisBinding;
        };
      }
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length, placeholder = getHolder(wrapper);
          while (index--) {
            args[index] = arguments[index];
          }
          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              undefined$1,
              args,
              holders,
              undefined$1,
              undefined$1,
              arity - length
            );
          }
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object2(collection);
          if (!isArrayLike(collection)) {
            var iteratee2 = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee2(iterable[key], key, iterable);
            };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee2 ? collection[index] : index] : undefined$1;
        };
      }
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != "function") {
              throw new TypeError2(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == "wrapper") {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];
            var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined$1;
            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments, value = args[0];
            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }
            var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
            while (++index2 < length) {
              result2 = funcs[index2].call(this, result2);
            }
            return result2;
          };
        });
      }
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined$1 : createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length;
          while (index--) {
            args[index] = arguments[index];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              thisArg,
              args,
              newHolders,
              argPos,
              ary2,
              arity - length
            );
          }
          var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary2 < length) {
            args.length = ary2;
          }
          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }
      function createInverter(setter, toIteratee) {
        return function(object, iteratee2) {
          return baseInverter(object, setter, toIteratee(iteratee2), {});
        };
      }
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result2;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result2 = value;
          }
          if (other !== undefined$1) {
            if (result2 === undefined$1) {
              return other;
            }
            if (typeof value == "string" || typeof other == "string") {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result2 = operator(value, other);
          }
          return result2;
        };
      }
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee2) {
              return apply(iteratee2, thisArg, args);
            });
          });
        });
      }
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
      }
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
            end = step = undefined$1;
          }
          start = toFinite(start);
          if (end === undefined$1) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == "string" && typeof other == "string")) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined$1, newHoldersRight = isCurry ? undefined$1 : holders, newPartials = isCurry ? partials : undefined$1, newPartialsRight = isCurry ? undefined$1 : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func,
          bitmask,
          thisArg,
          newPartials,
          newHolders,
          newPartialsRight,
          newHoldersRight,
          argPos,
          ary2,
          arity
        ];
        var result2 = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result2, newData);
        }
        result2.placeholder = placeholder;
        return setWrapToString(result2, func, bitmask);
      }
      function createRound(methodName) {
        var func = Math2[methodName];
        return function(number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number)) {
            var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
            pair = (toString(value) + "e").split("e");
            return +(pair[0] + "e" + (+pair[1] - precision));
          }
          return func(number);
        };
      }
      var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop2 : function(values2) {
        return new Set2(values2);
      };
      function createToPairs(keysFunc) {
        return function(object) {
          var tag = getTag(object);
          if (tag == mapTag) {
            return mapToArray(object);
          }
          if (tag == setTag) {
            return setToPairs(object);
          }
          return baseToPairs(object, keysFunc(object));
        };
      }
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary2 = ary2 === undefined$1 ? ary2 : nativeMax(toInteger(ary2), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;
        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials, holdersRight = holders;
          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);
        var newData = [
          func,
          bitmask,
          thisArg,
          partials,
          holders,
          partialsRight,
          holdersRight,
          argPos,
          ary2,
          arity
        ];
        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result2 = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result2 = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result2 = createPartial(func, bitmask, thisArg, partials);
        } else {
          result2 = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result2, newData), func, bitmask);
      }
      function customDefaultsAssignIn(objValue, srcValue, key, object) {
        if (objValue === undefined$1 || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          return srcValue;
        }
        return objValue;
      }
      function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
        if (isObject(objValue) && isObject(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack["delete"](srcValue);
        }
        return objValue;
      }
      function customOmitClone(value) {
        return isPlainObject2(value) ? undefined$1 : value;
      }
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array;
        }
        var index = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined$1;
        stack.set(array, other);
        stack.set(other, array);
        while (++index < arrLength) {
          var arrValue = array[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result2 = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result2 = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result2 = false;
            break;
          }
        }
        stack["delete"](array);
        stack["delete"](other);
        return result2;
      }
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);
          case errorTag:
            return object.name == other.name && object.message == other.message;
          case regexpTag:
          case stringTag:
            return object == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result2 = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result2;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object;
        }
        var result2 = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }
          if (!(compared === undefined$1 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result2 = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result2 && !skipCtor) {
          var objCtor = object.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result2 = false;
          }
        }
        stack["delete"](object);
        stack["delete"](other);
        return result2;
      }
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten), func + "");
      }
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }
      var getData = !metaMap ? noop2 : function(func) {
        return metaMap.get(func);
      };
      function getFuncName(func) {
        var result2 = func.name + "", array = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array.length : 0;
        while (length--) {
          var data = array[length], otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result2;
      }
      function getHolder(func) {
        var object = hasOwnProperty.call(lodash2, "placeholder") ? lodash2 : func;
        return object.placeholder;
      }
      function getIteratee() {
        var result2 = lodash2.iteratee || iteratee;
        result2 = result2 === iteratee ? baseIteratee : result2;
        return arguments.length ? result2(arguments[0], arguments[1]) : result2;
      }
      function getMapData(map2, key) {
        var data = map2.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getMatchData(object) {
        var result2 = keys(object), length = result2.length;
        while (length--) {
          var key = result2[length], value = object[key];
          result2[length] = [key, value, isStrictComparable(value)];
        }
        return result2;
      }
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined$1;
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {
        }
        var result2 = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result2;
      }
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object2(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result2 = [];
        while (object) {
          arrayPush(result2, getSymbols(object));
          object = getPrototype(object);
        }
        return result2;
      };
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined$1, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result2;
        };
      }
      function getView(start, end, transforms) {
        var index = -1, length = transforms.length;
        while (++index < length) {
          var data = transforms[index], size2 = data.size;
          switch (data.type) {
            case "drop":
              start += size2;
              break;
            case "dropRight":
              end -= size2;
              break;
            case "take":
              end = nativeMin(end, start + size2);
              break;
            case "takeRight":
              start = nativeMax(start, end - size2);
              break;
          }
        }
        return { "start": start, "end": end };
      }
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index = -1, length = path.length, result2 = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result2 = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result2 || ++index != length) {
          return result2;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
      }
      function initCloneArray(array) {
        var length = array.length, result2 = new array.constructor(length);
        if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
          result2.index = array.index;
          result2.input = array.input;
        }
        return result2;
      }
      function initCloneObject(object) {
        return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }
      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);
          case boolTag:
          case dateTag:
            return new Ctor(+object);
          case dataViewTag:
            return cloneDataView(object, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object);
          case regexpTag:
            return cloneRegExp(object);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object);
        }
      }
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
        details = details.join(length > 2 ? ", " : " ");
        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
      }
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
          return eq(object[index], value);
        }
        return false;
      }
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object2(object);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isLaziable(func) {
        var funcName = getFuncName(func), other = lodash2[funcName];
        if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var isMaskable = coreJsData ? isFunction : stubFalse;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue && (srcValue !== undefined$1 || key in Object2(object));
        };
      }
      function memoizeCapped(func) {
        var result2 = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result2.cache;
        return result2;
      }
      function mergeData(data, source) {
        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
        if (!(isCommon || isCombo)) {
          return data;
        }
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        value = source[7];
        if (value) {
          data[7] = value;
        }
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        if (data[9] == null) {
          data[9] = source[9];
        }
        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }
      function nativeKeysIn(object) {
        var result2 = [];
        if (object != null) {
          for (var key in Object2(object)) {
            result2.push(key);
          }
        }
        return result2;
      }
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      function overRest(func, start, transform2) {
        start = nativeMax(start === undefined$1 ? func.length - 1 : start, 0);
        return function() {
          var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array2(length);
          while (++index < length) {
            array[index] = args[start + index];
          }
          index = -1;
          var otherArgs = Array2(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform2(array);
          return apply(func, this, otherArgs);
        };
      }
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }
      function reorder(array, indexes) {
        var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
        while (length--) {
          var index = indexes[length];
          array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
        }
        return array;
      }
      function safeGet(object, key) {
        if (key === "constructor" && typeof object[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object[key];
      }
      var setData = shortOut(baseSetData);
      var setTimeout2 = ctxSetTimeout || function(func, wait) {
        return root.setTimeout(func, wait);
      };
      var setToString = shortOut(baseSetToString);
      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + "";
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      function shortOut(func) {
        var count = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }
      function shuffleSelf(array, size2) {
        var index = -1, length = array.length, lastIndex = length - 1;
        size2 = size2 === undefined$1 ? length : size2;
        while (++index < size2) {
          var rand = baseRandom(index, lastIndex), value = array[rand];
          array[rand] = array[index];
          array[index] = value;
        }
        array.length = size2;
        return array;
      }
      var stringToPath = memoizeCapped(function(string) {
        var result2 = [];
        if (string.charCodeAt(0) === 46) {
          result2.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result2.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result2;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = "_." + pair[0];
          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result2.__actions__ = copyArray(wrapper.__actions__);
        result2.__index__ = wrapper.__index__;
        result2.__values__ = wrapper.__values__;
        return result2;
      }
      function chunk(array, size2, guard) {
        if (guard ? isIterateeCall(array, size2, guard) : size2 === undefined$1) {
          size2 = 1;
        } else {
          size2 = nativeMax(toInteger(size2), 0);
        }
        var length = array == null ? 0 : array.length;
        if (!length || size2 < 1) {
          return [];
        }
        var index = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
        while (index < length) {
          result2[resIndex++] = baseSlice(array, index, index += size2);
        }
        return result2;
      }
      function compact(array) {
        var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array[index];
          if (value) {
            result2[resIndex++] = value;
          }
        }
        return result2;
      }
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array2(length - 1), array = arguments[0], index = length;
        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }
      var difference = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function(array, values2) {
        var iteratee2 = last(values2);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
      });
      var differenceWith = baseRest(function(array, values2) {
        var comparator = last(values2);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), undefined$1, comparator) : [];
      });
      function drop(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function dropRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function dropRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
      }
      function dropWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
      }
      function fill(array, value, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array, value, start, end);
      }
      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index);
      }
      function findLastIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length - 1;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index, true);
      }
      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }
      function flattenDeep(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, INFINITY) : [];
      }
      function flattenDepth(array, depth) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array, depth);
      }
      function fromPairs(pairs) {
        var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
        while (++index < length) {
          var pair = pairs[index];
          result2[pair[0]] = pair[1];
        }
        return result2;
      }
      function head(array) {
        return array && array.length ? array[0] : undefined$1;
      }
      function indexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseIndexOf(array, value, index);
      }
      function initial(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 0, -1) : [];
      }
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        if (iteratee2 === last(mapped)) {
          iteratee2 = undefined$1;
        } else {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
      });
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined$1, comparator) : [];
      });
      function join(array, separator) {
        return array == null ? "" : nativeJoin.call(array, separator);
      }
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined$1;
      }
      function lastIndexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
      }
      function nth(array, n) {
        return array && array.length ? baseNth(array, toInteger(n)) : undefined$1;
      }
      var pull = baseRest(pullAll);
      function pullAll(array, values2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2) : array;
      }
      function pullAllBy(array, values2, iteratee2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, getIteratee(iteratee2, 2)) : array;
      }
      function pullAllWith(array, values2, comparator) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, undefined$1, comparator) : array;
      }
      var pullAt = flatRest(function(array, indexes) {
        var length = array == null ? 0 : array.length, result2 = baseAt(array, indexes);
        basePullAt(array, arrayMap(indexes, function(index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));
        return result2;
      });
      function remove(array, predicate) {
        var result2 = [];
        if (!(array && array.length)) {
          return result2;
        }
        var index = -1, indexes = [], length = array.length;
        predicate = getIteratee(predicate, 3);
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result2.push(value);
            indexes.push(index);
          }
        }
        basePullAt(array, indexes);
        return result2;
      }
      function reverse(array) {
        return array == null ? array : nativeReverse.call(array);
      }
      function slice(array, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
          start = 0;
          end = length;
        } else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array, start, end);
      }
      function sortedIndex(array, value) {
        return baseSortedIndex(array, value);
      }
      function sortedIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2));
      }
      function sortedIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value);
          if (index < length && eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedLastIndex(array, value) {
        return baseSortedIndex(array, value, true);
      }
      function sortedLastIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2), true);
      }
      function sortedLastIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value, true) - 1;
          if (eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedUniq(array) {
        return array && array.length ? baseSortedUniq(array) : [];
      }
      function sortedUniqBy(array, iteratee2) {
        return array && array.length ? baseSortedUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function tail(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 1, length) : [];
      }
      function take(array, n, guard) {
        if (!(array && array.length)) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function takeRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function takeRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
      }
      function takeWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
      }
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
      });
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });
      function uniq(array) {
        return array && array.length ? baseUniq(array) : [];
      }
      function uniqBy(array, iteratee2) {
        return array && array.length ? baseUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function uniqWith(array, comparator) {
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return array && array.length ? baseUniq(array, undefined$1, comparator) : [];
      }
      function unzip(array) {
        if (!(array && array.length)) {
          return [];
        }
        var length = 0;
        array = arrayFilter(array, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index) {
          return arrayMap(array, baseProperty(index));
        });
      }
      function unzipWith(array, iteratee2) {
        if (!(array && array.length)) {
          return [];
        }
        var result2 = unzip(array);
        if (iteratee2 == null) {
          return result2;
        }
        return arrayMap(result2, function(group) {
          return apply(iteratee2, undefined$1, group);
        });
      }
      var without = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, values2) : [];
      });
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
      });
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });
      var zip = baseRest(unzip);
      function zipObject(props, values2) {
        return baseZipObject(props || [], values2 || [], assignValue);
      }
      function zipObjectDeep(props, values2) {
        return baseZipObject(props || [], values2 || [], baseSet);
      }
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined$1;
        iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined$1;
        return unzipWith(arrays, iteratee2);
      });
      function chain(value) {
        var result2 = lodash2(value);
        result2.__chain__ = true;
        return result2;
      }
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }
      function thru(value, interceptor) {
        return interceptor(value);
      }
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
          return baseAt(object, paths);
        };
        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          "func": thru,
          "args": [interceptor],
          "thisArg": undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array) {
          if (length && !array.length) {
            array.push(undefined$1);
          }
          return array;
        });
      });
      function wrapperChain() {
        return chain(this);
      }
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length, value = done ? undefined$1 : this.__values__[this.__index__++];
        return { "done": done, "value": value };
      }
      function wrapperToIterator() {
        return this;
      }
      function wrapperPlant(value) {
        var result2, parent2 = this;
        while (parent2 instanceof baseLodash) {
          var clone2 = wrapperClone(parent2);
          clone2.__index__ = 0;
          clone2.__values__ = undefined$1;
          if (result2) {
            previous.__wrapped__ = clone2;
          } else {
            result2 = clone2;
          }
          var previous = clone2;
          parent2 = parent2.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result2;
      }
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            "func": thru,
            "args": [reverse],
            "thisArg": undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      var countBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          ++result2[key];
        } else {
          baseAssignValue(result2, key, 1);
        }
      });
      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }
      var find = createFind(findIndex);
      var findLast = createFind(findLastIndex);
      function flatMap(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), 1);
      }
      function flatMapDeep(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), INFINITY);
      }
      function flatMapDepth(collection, iteratee2, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map(collection, iteratee2), depth);
      }
      function forEach(collection, iteratee2) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function forEachRight(collection, iteratee2) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee2, 3));
      }
      var groupBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          result2[key].push(value);
        } else {
          baseAssignValue(result2, key, [value]);
        }
      });
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }
      var invokeMap = baseRest(function(collection, path, args) {
        var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value) {
          result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result2;
      });
      var keyBy = createAggregator(function(result2, value, key) {
        baseAssignValue(result2, key, value);
      });
      function map(collection, iteratee2) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }
      var partition = createAggregator(function(result2, value, key) {
        result2[key ? 0 : 1].push(value);
      }, function() {
        return [[], []];
      });
      function reduce(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
      }
      function reduceRight(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
      }
      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }
      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      var now2 = ctxNow || function() {
        return root.Date.now();
      };
      function after(n, func) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }
      function before(n, func) {
        var result2;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result2 = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result2;
        };
      }
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey = baseRest(function(object, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object, partials, holders);
      });
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curry.placeholder;
        return result2;
      }
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curryRight.placeholder;
        return result2;
      }
      function debounce2(func, wait, options) {
        var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function invokeFunc(time) {
          var args = lastArgs, thisArg = lastThis;
          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result2 = func.apply(thisArg, args);
          return result2;
        }
        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout2(timerExpired, wait);
          return leading ? invokeFunc(time) : result2;
        }
        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined$1 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }
        function timerExpired() {
          var time = now2();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          timerId = setTimeout2(timerExpired, remainingWait(time));
        }
        function trailingEdge(time) {
          timerId = undefined$1;
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result2;
        }
        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout2(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }
        function flush() {
          return timerId === undefined$1 ? result2 : trailingEdge(now2());
        }
        function debounced() {
          var time = now2(), isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              clearTimeout2(timerId);
              timerId = setTimeout2(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout2(timerExpired, wait);
          }
          return result2;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result2 = func.apply(this, args);
          memoized.cache = cache.set(key, result2) || cache;
          return result2;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function negate(predicate) {
        if (typeof predicate != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return !predicate.call(this);
            case 1:
              return !predicate.call(this, args[0]);
            case 2:
              return !predicate.call(this, args[0], args[1]);
            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }
      function once(func) {
        return before(2, func);
      }
      var overArgs = castRest(function(func, transforms) {
        transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1, length = nativeMin(args.length, funcsLength);
          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });
      function rest(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start === undefined$1 ? start : toInteger(start);
        return baseRest(func, start);
      }
      function spread(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array = args[start], otherArgs = castSlice(args, 0, start);
          if (array) {
            arrayPush(otherArgs, array);
          }
          return apply(func, this, otherArgs);
        });
      }
      function throttle2(func, wait, options) {
        var leading = true, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        if (isObject(options)) {
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return debounce2(func, wait, {
          "leading": leading,
          "maxWait": wait,
          "trailing": trailing
        });
      }
      function unary(func) {
        return ary(func, 1);
      }
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray(value) ? value : [value];
      }
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      function cloneWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }
      function conformsTo(object, source) {
        return source == null || baseConformsTo(object, source, keys(source));
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(function() {
        return arguments;
      }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      var isArray = Array2.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject2(value);
      }
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        var result2 = customizer ? customizer(value, other) : undefined$1;
        return result2 === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result2;
      }
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject2(value);
      }
      function isFinite(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isInteger(value) {
        return typeof value == "number" && value == toInteger(value);
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }
      function isMatchWith(object, source, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseIsMatch(object, source, getMatchData(source), customizer);
      }
      function isNaN2(value) {
        return isNumber(value) && value != +value;
      }
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error2(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }
      function isNull(value) {
        return value === null;
      }
      function isNil(value) {
        return value == null;
      }
      function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
      }
      function isPlainObject2(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      function isString(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      function isUndefined(value) {
        return value === undefined$1;
      }
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result2 = toFinite(value), remainder = result2 % 1;
        return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      var assign2 = createAssigner(function(object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function(object, source) {
        copyObject(source, keysIn(source), object);
      });
      var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
      });
      var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keys(source), object, customizer);
      });
      var at = flatRest(baseAt);
      function create(prototype, properties) {
        var result2 = baseCreate(prototype);
        return properties == null ? result2 : baseAssign(result2, properties);
      }
      var defaults = baseRest(function(object, sources) {
        object = Object2(object);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];
            if (value === undefined$1 || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
              object[key] = source[key];
            }
          }
        }
        return object;
      });
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });
      function findKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
      }
      function findLastKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
      }
      function forIn(object, iteratee2) {
        return object == null ? object : baseFor(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forInRight(object, iteratee2) {
        return object == null ? object : baseForRight(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forOwn(object, iteratee2) {
        return object && baseForOwn(object, getIteratee(iteratee2, 3));
      }
      function forOwnRight(object, iteratee2) {
        return object && baseForOwnRight(object, getIteratee(iteratee2, 3));
      }
      function functions(object) {
        return object == null ? [] : baseFunctions(object, keys(object));
      }
      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn(object));
      }
      function get(object, path, defaultValue) {
        var result2 = object == null ? undefined$1 : baseGet(object, path);
        return result2 === undefined$1 ? defaultValue : result2;
      }
      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }
      var invert = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        result2[value] = key;
      }, constant(identity));
      var invertBy = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        if (hasOwnProperty.call(result2, value)) {
          result2[value].push(key);
        } else {
          result2[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }
      function mapKeys(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, iteratee2(value, key, object2), value);
        });
        return result2;
      }
      function mapValues(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, key, iteratee2(value, key, object2));
        });
        return result2;
      }
      var merge = createAssigner(function(object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });
      var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      });
      var omit = flatRest(function(object, paths) {
        var result2 = {};
        if (object == null) {
          return result2;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object, getAllKeysIn(object), result2);
        if (isDeep) {
          result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result2, paths[length]);
        }
        return result2;
      });
      function omitBy(object, predicate) {
        return pickBy(object, negate(getIteratee(predicate)));
      }
      var pick2 = flatRest(function(object, paths) {
        return object == null ? {} : basePick(object, paths);
      });
      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      function result(object, path, defaultValue) {
        path = castPath(path, object);
        var index = -1, length = path.length;
        if (!length) {
          length = 1;
          object = undefined$1;
        }
        while (++index < length) {
          var value = object == null ? undefined$1 : object[toKey(path[index])];
          if (value === undefined$1) {
            index = length;
            value = defaultValue;
          }
          object = isFunction(value) ? value.call(object) : value;
        }
        return object;
      }
      function set2(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }
      function setWith(object, path, value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseSet(object, path, value, customizer);
      }
      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);
      function transform(object, iteratee2, accumulator) {
        var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
        iteratee2 = getIteratee(iteratee2, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object2) {
          return iteratee2(accumulator, value, index, object2);
        });
        return accumulator;
      }
      function unset(object, path) {
        return object == null ? true : baseUnset(object, path);
      }
      function update(object, path, updater) {
        return object == null ? object : baseUpdate(object, path, castFunction(updater));
      }
      function updateWith(object, path, updater, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
      }
      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }
      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn(object));
      }
      function clamp(number, lower, upper) {
        if (upper === undefined$1) {
          upper = lower;
          lower = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower !== undefined$1) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }
        return baseClamp(toNumber(number), lower, upper);
      }
      function inRange(number, start, end) {
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        number = toNumber(number);
        return baseInRange(number, start, end);
      }
      function random(lower, upper, floating) {
        if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == "boolean") {
            floating = upper;
            upper = undefined$1;
          } else if (typeof lower == "boolean") {
            floating = lower;
            lower = undefined$1;
          }
        }
        if (lower === undefined$1 && upper === undefined$1) {
          lower = 0;
          upper = 1;
        } else {
          lower = toFinite(lower);
          if (upper === undefined$1) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }
        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
        }
        return baseRandom(lower, upper);
      }
      var camelCase = createCompounder(function(result2, word, index) {
        word = word.toLowerCase();
        return result2 + (index ? capitalize2(word) : word);
      });
      function capitalize2(string) {
        return upperFirst(toString(string).toLowerCase());
      }
      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
      }
      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined$1 ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }
      function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }
      function escapeRegExp(string) {
        string = toString(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
      }
      var kebabCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "-" : "") + word.toLowerCase();
      });
      var lowerCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst("toLowerCase");
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      function parseInt2(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
      }
      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }
      function replace() {
        var args = arguments, string = toString(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }
      var snakeCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "_" : "") + word.toLowerCase();
      });
      function split(string, separator, limit) {
        if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString(string);
        if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }
      var startCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + upperFirst(word);
      });
      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }
      function template(string, options, guard) {
        var settings = lodash2.templateSettings;
        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
        var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
        var reDelimiters = RegExp2(
          (options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
          "g"
        );
        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = hasOwnProperty.call(options, "variable") && options.variable;
        if (!variable) {
          source = "with (obj) {\n" + source + "\n}\n";
        } else if (reForbiddenIdentifierChars.test(variable)) {
          throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
        }
        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
        var result2 = attempt(function() {
          return Function2(importsKeys, sourceURL + "return " + source).apply(undefined$1, importsValues);
        });
        result2.source = source;
        if (isError(result2)) {
          throw result2;
        }
        return result2;
      }
      function toLower(value) {
        return toString(value).toLowerCase();
      }
      function toUpper(value) {
        return toString(value).toUpperCase();
      }
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return baseTrim(string);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start, end).join("");
      }
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.slice(0, trimmedEndIndex(string) + 1);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join("");
      }
      function trimStart(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, "");
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start).join("");
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === undefined$1) {
          return result2 + omission;
        }
        if (strSymbols) {
          end += result2.length - end;
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result2;
            if (!separator.global) {
              separator = RegExp2(separator.source, toString(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result2 = result2.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result2.lastIndexOf(separator);
          if (index > -1) {
            result2 = result2.slice(0, index);
          }
        }
        return result2 + omission;
      }
      function unescape(string) {
        string = toString(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }
      var upperCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toUpperCase();
      });
      var upperFirst = createCaseFirst("toUpperCase");
      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined$1 : pattern;
        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error2(e);
        }
      });
      var bindAll = flatRest(function(object, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object, key, bind(object[key], object));
        });
        return object;
      });
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function(args) {
          var index = -1;
          while (++index < length) {
            var pair = pairs[index];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }
      function constant(value) {
        return function() {
          return value;
        };
      }
      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }
      var flow = createFlow();
      var flowRight = createFlow(true);
      function identity(value) {
        return value;
      }
      function iteratee(func) {
        return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
      }
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }
      var method = baseRest(function(path, args) {
        return function(object) {
          return baseInvoke(object, path, args);
        };
      });
      var methodOf = baseRest(function(object, args) {
        return function(path) {
          return baseInvoke(object, path, args);
        };
      });
      function mixin(object, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object;
          object = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain2 = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object[methodName] = func;
          if (isFunc) {
            object.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain2 || chainAll) {
                var result2 = object(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                actions.push({ "func": func, "args": arguments, "thisArg": object });
                result2.__chain__ = chainAll;
                return result2;
              }
              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }
        });
        return object;
      }
      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }
        return this;
      }
      function noop2() {
      }
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }
      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      function propertyOf(object) {
        return function(path) {
          return object == null ? undefined$1 : baseGet(object, path);
        };
      }
      var range = createRange();
      var rangeRight = createRange(true);
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      function stubObject() {
        return {};
      }
      function stubString() {
        return "";
      }
      function stubTrue() {
        return true;
      }
      function times(n, iteratee2) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee2 = getIteratee(iteratee2);
        n -= MAX_ARRAY_LENGTH;
        var result2 = baseTimes(length, iteratee2);
        while (++index < n) {
          iteratee2(index);
        }
        return result2;
      }
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound("ceil");
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound("floor");
      function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined$1;
      }
      function maxBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseGt) : undefined$1;
      }
      function mean(array) {
        return baseMean(array, identity);
      }
      function meanBy(array, iteratee2) {
        return baseMean(array, getIteratee(iteratee2, 2));
      }
      function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined$1;
      }
      function minBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseLt) : undefined$1;
      }
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound("round");
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);
      function sum(array) {
        return array && array.length ? baseSum(array, identity) : 0;
      }
      function sumBy(array, iteratee2) {
        return array && array.length ? baseSum(array, getIteratee(iteratee2, 2)) : 0;
      }
      lodash2.after = after;
      lodash2.ary = ary;
      lodash2.assign = assign2;
      lodash2.assignIn = assignIn;
      lodash2.assignInWith = assignInWith;
      lodash2.assignWith = assignWith;
      lodash2.at = at;
      lodash2.before = before;
      lodash2.bind = bind;
      lodash2.bindAll = bindAll;
      lodash2.bindKey = bindKey;
      lodash2.castArray = castArray;
      lodash2.chain = chain;
      lodash2.chunk = chunk;
      lodash2.compact = compact;
      lodash2.concat = concat;
      lodash2.cond = cond;
      lodash2.conforms = conforms;
      lodash2.constant = constant;
      lodash2.countBy = countBy;
      lodash2.create = create;
      lodash2.curry = curry;
      lodash2.curryRight = curryRight;
      lodash2.debounce = debounce2;
      lodash2.defaults = defaults;
      lodash2.defaultsDeep = defaultsDeep;
      lodash2.defer = defer;
      lodash2.delay = delay;
      lodash2.difference = difference;
      lodash2.differenceBy = differenceBy;
      lodash2.differenceWith = differenceWith;
      lodash2.drop = drop;
      lodash2.dropRight = dropRight;
      lodash2.dropRightWhile = dropRightWhile;
      lodash2.dropWhile = dropWhile;
      lodash2.fill = fill;
      lodash2.filter = filter;
      lodash2.flatMap = flatMap;
      lodash2.flatMapDeep = flatMapDeep;
      lodash2.flatMapDepth = flatMapDepth;
      lodash2.flatten = flatten;
      lodash2.flattenDeep = flattenDeep;
      lodash2.flattenDepth = flattenDepth;
      lodash2.flip = flip;
      lodash2.flow = flow;
      lodash2.flowRight = flowRight;
      lodash2.fromPairs = fromPairs;
      lodash2.functions = functions;
      lodash2.functionsIn = functionsIn;
      lodash2.groupBy = groupBy;
      lodash2.initial = initial;
      lodash2.intersection = intersection;
      lodash2.intersectionBy = intersectionBy;
      lodash2.intersectionWith = intersectionWith;
      lodash2.invert = invert;
      lodash2.invertBy = invertBy;
      lodash2.invokeMap = invokeMap;
      lodash2.iteratee = iteratee;
      lodash2.keyBy = keyBy;
      lodash2.keys = keys;
      lodash2.keysIn = keysIn;
      lodash2.map = map;
      lodash2.mapKeys = mapKeys;
      lodash2.mapValues = mapValues;
      lodash2.matches = matches;
      lodash2.matchesProperty = matchesProperty;
      lodash2.memoize = memoize;
      lodash2.merge = merge;
      lodash2.mergeWith = mergeWith;
      lodash2.method = method;
      lodash2.methodOf = methodOf;
      lodash2.mixin = mixin;
      lodash2.negate = negate;
      lodash2.nthArg = nthArg;
      lodash2.omit = omit;
      lodash2.omitBy = omitBy;
      lodash2.once = once;
      lodash2.orderBy = orderBy;
      lodash2.over = over;
      lodash2.overArgs = overArgs;
      lodash2.overEvery = overEvery;
      lodash2.overSome = overSome;
      lodash2.partial = partial;
      lodash2.partialRight = partialRight;
      lodash2.partition = partition;
      lodash2.pick = pick2;
      lodash2.pickBy = pickBy;
      lodash2.property = property;
      lodash2.propertyOf = propertyOf;
      lodash2.pull = pull;
      lodash2.pullAll = pullAll;
      lodash2.pullAllBy = pullAllBy;
      lodash2.pullAllWith = pullAllWith;
      lodash2.pullAt = pullAt;
      lodash2.range = range;
      lodash2.rangeRight = rangeRight;
      lodash2.rearg = rearg;
      lodash2.reject = reject;
      lodash2.remove = remove;
      lodash2.rest = rest;
      lodash2.reverse = reverse;
      lodash2.sampleSize = sampleSize;
      lodash2.set = set2;
      lodash2.setWith = setWith;
      lodash2.shuffle = shuffle;
      lodash2.slice = slice;
      lodash2.sortBy = sortBy;
      lodash2.sortedUniq = sortedUniq;
      lodash2.sortedUniqBy = sortedUniqBy;
      lodash2.split = split;
      lodash2.spread = spread;
      lodash2.tail = tail;
      lodash2.take = take;
      lodash2.takeRight = takeRight;
      lodash2.takeRightWhile = takeRightWhile;
      lodash2.takeWhile = takeWhile;
      lodash2.tap = tap;
      lodash2.throttle = throttle2;
      lodash2.thru = thru;
      lodash2.toArray = toArray;
      lodash2.toPairs = toPairs;
      lodash2.toPairsIn = toPairsIn;
      lodash2.toPath = toPath;
      lodash2.toPlainObject = toPlainObject;
      lodash2.transform = transform;
      lodash2.unary = unary;
      lodash2.union = union;
      lodash2.unionBy = unionBy;
      lodash2.unionWith = unionWith;
      lodash2.uniq = uniq;
      lodash2.uniqBy = uniqBy;
      lodash2.uniqWith = uniqWith;
      lodash2.unset = unset;
      lodash2.unzip = unzip;
      lodash2.unzipWith = unzipWith;
      lodash2.update = update;
      lodash2.updateWith = updateWith;
      lodash2.values = values;
      lodash2.valuesIn = valuesIn;
      lodash2.without = without;
      lodash2.words = words;
      lodash2.wrap = wrap;
      lodash2.xor = xor;
      lodash2.xorBy = xorBy;
      lodash2.xorWith = xorWith;
      lodash2.zip = zip;
      lodash2.zipObject = zipObject;
      lodash2.zipObjectDeep = zipObjectDeep;
      lodash2.zipWith = zipWith;
      lodash2.entries = toPairs;
      lodash2.entriesIn = toPairsIn;
      lodash2.extend = assignIn;
      lodash2.extendWith = assignInWith;
      mixin(lodash2, lodash2);
      lodash2.add = add;
      lodash2.attempt = attempt;
      lodash2.camelCase = camelCase;
      lodash2.capitalize = capitalize2;
      lodash2.ceil = ceil;
      lodash2.clamp = clamp;
      lodash2.clone = clone;
      lodash2.cloneDeep = cloneDeep;
      lodash2.cloneDeepWith = cloneDeepWith;
      lodash2.cloneWith = cloneWith;
      lodash2.conformsTo = conformsTo;
      lodash2.deburr = deburr;
      lodash2.defaultTo = defaultTo;
      lodash2.divide = divide;
      lodash2.endsWith = endsWith;
      lodash2.eq = eq;
      lodash2.escape = escape;
      lodash2.escapeRegExp = escapeRegExp;
      lodash2.every = every;
      lodash2.find = find;
      lodash2.findIndex = findIndex;
      lodash2.findKey = findKey;
      lodash2.findLast = findLast;
      lodash2.findLastIndex = findLastIndex;
      lodash2.findLastKey = findLastKey;
      lodash2.floor = floor;
      lodash2.forEach = forEach;
      lodash2.forEachRight = forEachRight;
      lodash2.forIn = forIn;
      lodash2.forInRight = forInRight;
      lodash2.forOwn = forOwn;
      lodash2.forOwnRight = forOwnRight;
      lodash2.get = get;
      lodash2.gt = gt;
      lodash2.gte = gte;
      lodash2.has = has;
      lodash2.hasIn = hasIn;
      lodash2.head = head;
      lodash2.identity = identity;
      lodash2.includes = includes;
      lodash2.indexOf = indexOf;
      lodash2.inRange = inRange;
      lodash2.invoke = invoke;
      lodash2.isArguments = isArguments;
      lodash2.isArray = isArray;
      lodash2.isArrayBuffer = isArrayBuffer;
      lodash2.isArrayLike = isArrayLike;
      lodash2.isArrayLikeObject = isArrayLikeObject;
      lodash2.isBoolean = isBoolean;
      lodash2.isBuffer = isBuffer;
      lodash2.isDate = isDate;
      lodash2.isElement = isElement;
      lodash2.isEmpty = isEmpty;
      lodash2.isEqual = isEqual;
      lodash2.isEqualWith = isEqualWith;
      lodash2.isError = isError;
      lodash2.isFinite = isFinite;
      lodash2.isFunction = isFunction;
      lodash2.isInteger = isInteger;
      lodash2.isLength = isLength;
      lodash2.isMap = isMap;
      lodash2.isMatch = isMatch;
      lodash2.isMatchWith = isMatchWith;
      lodash2.isNaN = isNaN2;
      lodash2.isNative = isNative;
      lodash2.isNil = isNil;
      lodash2.isNull = isNull;
      lodash2.isNumber = isNumber;
      lodash2.isObject = isObject;
      lodash2.isObjectLike = isObjectLike;
      lodash2.isPlainObject = isPlainObject2;
      lodash2.isRegExp = isRegExp;
      lodash2.isSafeInteger = isSafeInteger;
      lodash2.isSet = isSet;
      lodash2.isString = isString;
      lodash2.isSymbol = isSymbol;
      lodash2.isTypedArray = isTypedArray;
      lodash2.isUndefined = isUndefined;
      lodash2.isWeakMap = isWeakMap;
      lodash2.isWeakSet = isWeakSet;
      lodash2.join = join;
      lodash2.kebabCase = kebabCase;
      lodash2.last = last;
      lodash2.lastIndexOf = lastIndexOf;
      lodash2.lowerCase = lowerCase;
      lodash2.lowerFirst = lowerFirst;
      lodash2.lt = lt;
      lodash2.lte = lte;
      lodash2.max = max;
      lodash2.maxBy = maxBy;
      lodash2.mean = mean;
      lodash2.meanBy = meanBy;
      lodash2.min = min;
      lodash2.minBy = minBy;
      lodash2.stubArray = stubArray;
      lodash2.stubFalse = stubFalse;
      lodash2.stubObject = stubObject;
      lodash2.stubString = stubString;
      lodash2.stubTrue = stubTrue;
      lodash2.multiply = multiply;
      lodash2.nth = nth;
      lodash2.noConflict = noConflict;
      lodash2.noop = noop2;
      lodash2.now = now2;
      lodash2.pad = pad;
      lodash2.padEnd = padEnd;
      lodash2.padStart = padStart;
      lodash2.parseInt = parseInt2;
      lodash2.random = random;
      lodash2.reduce = reduce;
      lodash2.reduceRight = reduceRight;
      lodash2.repeat = repeat;
      lodash2.replace = replace;
      lodash2.result = result;
      lodash2.round = round;
      lodash2.runInContext = runInContext2;
      lodash2.sample = sample;
      lodash2.size = size;
      lodash2.snakeCase = snakeCase;
      lodash2.some = some;
      lodash2.sortedIndex = sortedIndex;
      lodash2.sortedIndexBy = sortedIndexBy;
      lodash2.sortedIndexOf = sortedIndexOf;
      lodash2.sortedLastIndex = sortedLastIndex;
      lodash2.sortedLastIndexBy = sortedLastIndexBy;
      lodash2.sortedLastIndexOf = sortedLastIndexOf;
      lodash2.startCase = startCase;
      lodash2.startsWith = startsWith;
      lodash2.subtract = subtract;
      lodash2.sum = sum;
      lodash2.sumBy = sumBy;
      lodash2.template = template;
      lodash2.times = times;
      lodash2.toFinite = toFinite;
      lodash2.toInteger = toInteger;
      lodash2.toLength = toLength;
      lodash2.toLower = toLower;
      lodash2.toNumber = toNumber;
      lodash2.toSafeInteger = toSafeInteger;
      lodash2.toString = toString;
      lodash2.toUpper = toUpper;
      lodash2.trim = trim;
      lodash2.trimEnd = trimEnd;
      lodash2.trimStart = trimStart;
      lodash2.truncate = truncate;
      lodash2.unescape = unescape;
      lodash2.uniqueId = uniqueId;
      lodash2.upperCase = upperCase;
      lodash2.upperFirst = upperFirst;
      lodash2.each = forEach;
      lodash2.eachRight = forEachRight;
      lodash2.first = head;
      mixin(lodash2, function() {
        var source = {};
        baseForOwn(lodash2, function(func, methodName) {
          if (!hasOwnProperty.call(lodash2.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), { "chain": false });
      lodash2.VERSION = VERSION;
      arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
        lodash2[methodName].placeholder = lodash2;
      });
      arrayEach(["drop", "take"], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
          var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
          if (result2.__filtered__) {
            result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
          } else {
            result2.__views__.push({
              "size": nativeMin(n, MAX_ARRAY_LENGTH),
              "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
            });
          }
          return result2;
        };
        LazyWrapper.prototype[methodName + "Right"] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
        var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
        LazyWrapper.prototype[methodName] = function(iteratee2) {
          var result2 = this.clone();
          result2.__iteratees__.push({
            "iteratee": getIteratee(iteratee2, 3),
            "type": type
          });
          result2.__filtered__ = result2.__filtered__ || isFilter;
          return result2;
        };
      });
      arrayEach(["head", "last"], function(methodName, index) {
        var takeName = "take" + (index ? "Right" : "");
        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(["initial", "tail"], function(methodName, index) {
        var dropName = "drop" + (index ? "" : "Right");
        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });
      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };
      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };
      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };
      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == "function") {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });
      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };
      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);
        var result2 = this;
        if (result2.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result2);
        }
        if (start < 0) {
          result2 = result2.takeRight(-start);
        } else if (start) {
          result2 = result2.drop(start);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
        }
        return result2;
      };
      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };
      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash2[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
        if (!lodashFunc) {
          return;
        }
        lodash2.prototype[methodName] = function() {
          var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
          var interceptor = function(value2) {
            var result3 = lodashFunc.apply(lodash2, arrayPush([value2], args));
            return isTaker && chainAll ? result3[0] : result3;
          };
          if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result2 = func.apply(value, args);
            result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined$1 });
            return new LodashWrapper(result2, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result2 = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
        };
      });
      arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
        lodash2.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value2) {
            return func.apply(isArray(value2) ? value2 : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash2[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + "";
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ "name": methodName, "func": lodashFunc });
        }
      });
      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        "name": "wrapper",
        "func": undefined$1
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash2.prototype.at = wrapperAt;
      lodash2.prototype.chain = wrapperChain;
      lodash2.prototype.commit = wrapperCommit;
      lodash2.prototype.next = wrapperNext;
      lodash2.prototype.plant = wrapperPlant;
      lodash2.prototype.reverse = wrapperReverse;
      lodash2.prototype.toJSON = lodash2.prototype.valueOf = lodash2.prototype.value = wrapperValue;
      lodash2.prototype.first = lodash2.prototype.head;
      if (symIterator) {
        lodash2.prototype[symIterator] = wrapperToIterator;
      }
      return lodash2;
    };
    var _ = runInContext();
    if (freeModule) {
      (freeModule.exports = _)._ = _;
      freeExports._ = _;
    } else {
      root._ = _;
    }
  }).call(commonjsGlobal);
})(lodash, lodash.exports);
var lodashExports = lodash.exports;
const _hoisted_1$9 = { class: "lupa-search-box-container" };
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "SearchContainer",
  props: {
    options: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const paramStore = useParamsStore();
    const optionsStore = useOptionsStore();
    const searchResults = ref(null);
    const searchBox = ref(null);
    const fullSearchResultsOptions = computed(() => {
      const options = lodashExports.cloneDeep(props.options.searchResults);
      return lodashExports.merge({}, DEFAULT_OPTIONS_RESULTS, options);
    });
    const fullSearchBoxOptions = computed(() => {
      const options = lodashExports.cloneDeep(props.options.searchBox);
      return lodashExports.merge({}, DEFAULT_SEARCH_BOX_OPTIONS, options);
    });
    const fetch2 = () => {
      var _a, _b;
      (_a = searchResults.value) == null ? void 0 : _a.handleUrlChange();
      (_b = searchBox.value) == null ? void 0 : _b.handleSearch();
    };
    const innerClick = () => {
    };
    const reloadOptions = () => {
      setTimeout(() => {
        optionsStore.setSearchResultOptions({ options: fullSearchResultsOptions.value });
      });
    };
    onBeforeUnmount(() => {
      paramStore.removeParameters({ paramsToRemove: "all" });
    });
    __expose({ reloadOptions, fetch: fetch2 });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "lupa-search-container-overlay",
        onClick: _cache[1] || (_cache[1] = withModifiers(($event) => _ctx.$emit("close"), ["stop", "prevent"]))
      }, [
        createElementVNode("div", {
          id: "lupa-search-container",
          class: "lupa-search-container",
          onClick: withModifiers(innerClick, ["stop"])
        }, [
          createElementVNode("div", _hoisted_1$9, [
            createVNode(_sfc_main$K, {
              options: fullSearchBoxOptions.value,
              "is-search-container": true,
              ref_key: "searchBox",
              ref: searchBox,
              onClose: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close"))
            }, null, 8, ["options"])
          ]),
          createVNode(_sfc_main$c, {
            options: fullSearchResultsOptions.value,
            "is-container": true,
            ref_key: "searchResults",
            ref: searchResults
          }, null, 8, ["options"])
        ])
      ]);
    };
  }
});
/**
 * Vue 3 Carousel 0.3.1
 * (c) 2023
 * @license MIT
 */
const defaultConfigs = {
  itemsToShow: 1,
  itemsToScroll: 1,
  modelValue: 0,
  transition: 300,
  autoplay: 0,
  snapAlign: "center",
  wrapAround: false,
  throttle: 16,
  pauseAutoplayOnHover: false,
  mouseDrag: true,
  touchDrag: true,
  dir: "ltr",
  breakpoints: void 0,
  i18n: {
    ariaNextSlide: "Navigate to next slide",
    ariaPreviousSlide: "Navigate to previous slide",
    ariaNavigateToSlide: "Navigate to slide {slideNumber}",
    ariaGallery: "Gallery",
    itemXofY: "Item {currentSlide} of {slidesCount}",
    iconArrowUp: "Arrow pointing upwards",
    iconArrowDown: "Arrow pointing downwards",
    iconArrowRight: "Arrow pointing to the right",
    iconArrowLeft: "Arrow pointing to the left"
  }
};
const carouselProps = {
  // count of items to showed per view
  itemsToShow: {
    default: defaultConfigs.itemsToShow,
    type: Number
  },
  // count of items to be scrolled
  itemsToScroll: {
    default: defaultConfigs.itemsToScroll,
    type: Number
  },
  // control infinite scrolling mode
  wrapAround: {
    default: defaultConfigs.wrapAround,
    type: Boolean
  },
  // control max drag
  throttle: {
    default: defaultConfigs.throttle,
    type: Number
  },
  // control snap position alignment
  snapAlign: {
    default: defaultConfigs.snapAlign,
    validator(value) {
      return ["start", "end", "center", "center-even", "center-odd"].includes(value);
    }
  },
  // sliding transition time in ms
  transition: {
    default: defaultConfigs.transition,
    type: Number
  },
  // an object to store breakpoints
  breakpoints: {
    default: defaultConfigs.breakpoints,
    type: Object
  },
  // time to auto advance slides in ms
  autoplay: {
    default: defaultConfigs.autoplay,
    type: Number
  },
  // pause autoplay when mouse hover over the carousel
  pauseAutoplayOnHover: {
    default: defaultConfigs.pauseAutoplayOnHover,
    type: Boolean
  },
  // slide number number of initial slide
  modelValue: {
    default: void 0,
    type: Number
  },
  // toggle mouse dragging.
  mouseDrag: {
    default: defaultConfigs.mouseDrag,
    type: Boolean
  },
  // toggle mouse dragging.
  touchDrag: {
    default: defaultConfigs.touchDrag,
    type: Boolean
  },
  // control snap position alignment
  dir: {
    default: defaultConfigs.dir,
    validator(value) {
      return ["rtl", "ltr"].includes(value);
    }
  },
  // aria-labels and additional text labels
  i18n: {
    default: defaultConfigs.i18n,
    type: Object
  },
  // an object to pass all settings
  settings: {
    default() {
      return {};
    },
    type: Object
  }
};
function getMaxSlideIndex({ config, slidesCount }) {
  const { snapAlign, wrapAround, itemsToShow = 1 } = config;
  if (wrapAround) {
    return Math.max(slidesCount - 1, 0);
  }
  let output;
  switch (snapAlign) {
    case "start":
      output = slidesCount - itemsToShow;
      break;
    case "end":
      output = slidesCount - 1;
      break;
    case "center":
    case "center-odd":
      output = slidesCount - Math.ceil((itemsToShow - 0.5) / 2);
      break;
    case "center-even":
      output = slidesCount - Math.ceil(itemsToShow / 2);
      break;
    default:
      output = 0;
      break;
  }
  return Math.max(output, 0);
}
function getMinSlideIndex({ config, slidesCount }) {
  const { wrapAround, snapAlign, itemsToShow = 1 } = config;
  let output = 0;
  if (wrapAround || itemsToShow > slidesCount) {
    return output;
  }
  switch (snapAlign) {
    case "start":
      output = 0;
      break;
    case "end":
      output = itemsToShow - 1;
      break;
    case "center":
    case "center-odd":
      output = Math.floor((itemsToShow - 1) / 2);
      break;
    case "center-even":
      output = Math.floor((itemsToShow - 2) / 2);
      break;
    default:
      output = 0;
      break;
  }
  return output;
}
function getNumberInRange({ val, max, min }) {
  if (max < min) {
    return val;
  }
  return Math.min(Math.max(val, min), max);
}
function getSlidesToScroll({ config, currentSlide, slidesCount }) {
  const { snapAlign, wrapAround, itemsToShow = 1 } = config;
  let output = currentSlide;
  switch (snapAlign) {
    case "center":
    case "center-odd":
      output -= (itemsToShow - 1) / 2;
      break;
    case "center-even":
      output -= (itemsToShow - 2) / 2;
      break;
    case "end":
      output -= itemsToShow - 1;
      break;
  }
  if (wrapAround) {
    return output;
  }
  return getNumberInRange({
    val: output,
    max: slidesCount - itemsToShow,
    min: 0
  });
}
function getSlidesVNodes(vNode) {
  if (!vNode)
    return [];
  return vNode.reduce((acc, node) => {
    var _a;
    if (node.type === Fragment) {
      return [...acc, ...getSlidesVNodes(node.children)];
    }
    if (((_a = node.type) === null || _a === void 0 ? void 0 : _a.name) === "CarouselSlide") {
      return [...acc, node];
    }
    return acc;
  }, []);
}
function mapNumberToRange({ val, max, min = 0 }) {
  if (val > max) {
    return mapNumberToRange({ val: val - (max + 1), max, min });
  }
  if (val < min) {
    return mapNumberToRange({ val: val + (max + 1), max, min });
  }
  return val;
}
function throttle(fn, limit) {
  let inThrottle;
  if (!limit) {
    return fn;
  }
  return function(...args) {
    const self2 = this;
    if (!inThrottle) {
      fn.apply(self2, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}
function i18nFormatter(string = "", values = {}) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), string);
}
var ARIAComponent = defineComponent({
  name: "ARIA",
  setup() {
    const config = inject("config", reactive(Object.assign({}, defaultConfigs)));
    const currentSlide = inject("currentSlide", ref(0));
    const slidesCount = inject("slidesCount", ref(0));
    return () => h("div", {
      class: ["carousel__liveregion", "carousel__sr-only"],
      "aria-live": "polite",
      "aria-atomic": "true"
    }, i18nFormatter(config.i18n["itemXofY"], {
      currentSlide: currentSlide.value + 1,
      slidesCount: slidesCount.value
    }));
  }
});
var Carousel = defineComponent({
  name: "Carousel",
  props: carouselProps,
  setup(props, { slots, emit, expose }) {
    var _a;
    const root = ref(null);
    const slides = ref([]);
    const slideWidth = ref(0);
    const slidesCount = ref(0);
    const config = reactive(Object.assign({}, defaultConfigs));
    let __defaultConfig = Object.assign({}, defaultConfigs);
    let breakpoints;
    const currentSlideIndex = ref((_a = props.modelValue) !== null && _a !== void 0 ? _a : 0);
    const prevSlideIndex = ref(0);
    const middleSlideIndex = ref(0);
    const maxSlideIndex = ref(0);
    const minSlideIndex = ref(0);
    let autoplayTimer;
    let transitionTimer;
    provide("config", config);
    provide("slidesCount", slidesCount);
    provide("currentSlide", currentSlideIndex);
    provide("maxSlide", maxSlideIndex);
    provide("minSlide", minSlideIndex);
    provide("slideWidth", slideWidth);
    function initDefaultConfigs() {
      breakpoints = Object.assign({}, props.breakpoints);
      __defaultConfig = Object.assign(Object.assign(Object.assign({}, __defaultConfig), props), { i18n: Object.assign(Object.assign({}, __defaultConfig.i18n), props.i18n), breakpoints: void 0 });
      bindConfigs(__defaultConfig);
    }
    function updateBreakpointsConfigs() {
      if (!breakpoints || !Object.keys(breakpoints).length)
        return;
      const breakpointsArray = Object.keys(breakpoints).map((key) => Number(key)).sort((a, b) => +b - +a);
      let newConfig = Object.assign({}, __defaultConfig);
      breakpointsArray.some((breakpoint) => {
        const isMatched = window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
        if (isMatched) {
          newConfig = Object.assign(Object.assign({}, newConfig), breakpoints[breakpoint]);
        }
        return isMatched;
      });
      bindConfigs(newConfig);
    }
    function bindConfigs(newConfig) {
      Object.entries(newConfig).forEach(([key, val]) => config[key] = val);
    }
    const handleWindowResize = debounce(() => {
      updateBreakpointsConfigs();
      updateSlideWidth();
    }, 16);
    function updateSlideWidth() {
      if (!root.value)
        return;
      const rect = root.value.getBoundingClientRect();
      slideWidth.value = rect.width / config.itemsToShow;
    }
    function updateSlidesData() {
      if (slidesCount.value <= 0)
        return;
      middleSlideIndex.value = Math.ceil((slidesCount.value - 1) / 2);
      maxSlideIndex.value = getMaxSlideIndex({ config, slidesCount: slidesCount.value });
      minSlideIndex.value = getMinSlideIndex({ config, slidesCount: slidesCount.value });
      if (!config.wrapAround) {
        currentSlideIndex.value = getNumberInRange({
          val: currentSlideIndex.value,
          max: maxSlideIndex.value,
          min: minSlideIndex.value
        });
      }
    }
    onMounted(() => {
      nextTick(() => updateSlideWidth());
      setTimeout(() => updateSlideWidth(), 1e3);
      updateBreakpointsConfigs();
      initAutoplay();
      window.addEventListener("resize", handleWindowResize, { passive: true });
      emit("init");
    });
    onUnmounted(() => {
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
      }
      window.removeEventListener("resize", handleWindowResize, {
        passive: true
      });
    });
    let isTouch = false;
    const startPosition = { x: 0, y: 0 };
    const endPosition = { x: 0, y: 0 };
    const dragged = reactive({ x: 0, y: 0 });
    const isHover = ref(false);
    const isDragging = ref(false);
    const handleMouseEnter = () => {
      isHover.value = true;
    };
    const handleMouseLeave = () => {
      isHover.value = false;
    };
    function handleDragStart(event) {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
        return;
      }
      isTouch = event.type === "touchstart";
      if (!isTouch) {
        event.preventDefault();
      }
      if (!isTouch && event.button !== 0 || isSliding.value) {
        return;
      }
      startPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
      startPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
      document.addEventListener(isTouch ? "touchmove" : "mousemove", handleDragging, true);
      document.addEventListener(isTouch ? "touchend" : "mouseup", handleDragEnd, true);
    }
    const handleDragging = throttle((event) => {
      isDragging.value = true;
      endPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
      endPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
      const deltaX = endPosition.x - startPosition.x;
      const deltaY = endPosition.y - startPosition.y;
      dragged.y = deltaY;
      dragged.x = deltaX;
    }, config.throttle);
    function handleDragEnd() {
      const direction = config.dir === "rtl" ? -1 : 1;
      const tolerance = Math.sign(dragged.x) * 0.4;
      const draggedSlides = Math.round(dragged.x / slideWidth.value + tolerance) * direction;
      if (draggedSlides && !isTouch) {
        const captureClick = (e) => {
          e.stopPropagation();
          window.removeEventListener("click", captureClick, true);
        };
        window.addEventListener("click", captureClick, true);
      }
      slideTo(currentSlideIndex.value - draggedSlides);
      dragged.x = 0;
      dragged.y = 0;
      isDragging.value = false;
      document.removeEventListener(isTouch ? "touchmove" : "mousemove", handleDragging, true);
      document.removeEventListener(isTouch ? "touchend" : "mouseup", handleDragEnd, true);
    }
    function initAutoplay() {
      if (!config.autoplay || config.autoplay <= 0) {
        return;
      }
      autoplayTimer = setInterval(() => {
        if (config.pauseAutoplayOnHover && isHover.value) {
          return;
        }
        next();
      }, config.autoplay);
    }
    function resetAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      initAutoplay();
    }
    const isSliding = ref(false);
    function slideTo(slideIndex) {
      const currentVal = config.wrapAround ? slideIndex : getNumberInRange({
        val: slideIndex,
        max: maxSlideIndex.value,
        min: minSlideIndex.value
      });
      if (currentSlideIndex.value === currentVal || isSliding.value) {
        return;
      }
      emit("slide-start", {
        slidingToIndex: slideIndex,
        currentSlideIndex: currentSlideIndex.value,
        prevSlideIndex: prevSlideIndex.value,
        slidesCount: slidesCount.value
      });
      isSliding.value = true;
      prevSlideIndex.value = currentSlideIndex.value;
      currentSlideIndex.value = currentVal;
      transitionTimer = setTimeout(() => {
        if (config.wrapAround) {
          const mappedNumber = mapNumberToRange({
            val: currentVal,
            max: maxSlideIndex.value,
            min: 0
          });
          if (mappedNumber !== currentSlideIndex.value) {
            currentSlideIndex.value = mappedNumber;
            emit("loop", {
              currentSlideIndex: currentSlideIndex.value,
              slidingToIndex: slideIndex
            });
          }
        }
        emit("update:modelValue", currentSlideIndex.value);
        emit("slide-end", {
          currentSlideIndex: currentSlideIndex.value,
          prevSlideIndex: prevSlideIndex.value,
          slidesCount: slidesCount.value
        });
        isSliding.value = false;
        resetAutoplay();
      }, config.transition);
    }
    function next() {
      slideTo(currentSlideIndex.value + config.itemsToScroll);
    }
    function prev() {
      slideTo(currentSlideIndex.value - config.itemsToScroll);
    }
    const nav = { slideTo, next, prev };
    provide("nav", nav);
    provide("isSliding", isSliding);
    const slidesToScroll = computed(() => getSlidesToScroll({
      config,
      currentSlide: currentSlideIndex.value,
      slidesCount: slidesCount.value
    }));
    provide("slidesToScroll", slidesToScroll);
    const trackStyle = computed(() => {
      const direction = config.dir === "rtl" ? -1 : 1;
      const xScroll = slidesToScroll.value * slideWidth.value * direction;
      return {
        transform: `translateX(${dragged.x - xScroll}px)`,
        transition: `${isSliding.value ? config.transition : 0}ms`,
        margin: config.wrapAround ? `0 -${slidesCount.value * slideWidth.value}px` : "",
        width: `100%`
      };
    });
    function restartCarousel() {
      initDefaultConfigs();
      updateBreakpointsConfigs();
      updateSlidesData();
      updateSlideWidth();
      resetAutoplay();
    }
    Object.keys(carouselProps).forEach((prop) => {
      if (["modelValue"].includes(prop))
        return;
      watch(() => props[prop], restartCarousel);
    });
    watch(() => props["modelValue"], (val) => {
      if (val === currentSlideIndex.value) {
        return;
      }
      slideTo(Number(val));
    });
    watch(slidesCount, updateSlidesData);
    emit("before-init");
    initDefaultConfigs();
    const data = {
      config,
      slidesCount,
      slideWidth,
      next,
      prev,
      slideTo,
      currentSlide: currentSlideIndex,
      maxSlide: maxSlideIndex,
      minSlide: minSlideIndex,
      middleSlide: middleSlideIndex
    };
    expose({
      updateBreakpointsConfigs,
      updateSlidesData,
      updateSlideWidth,
      initDefaultConfigs,
      restartCarousel,
      slideTo,
      next,
      prev,
      nav,
      data
    });
    const slotSlides = slots.default || slots.slides;
    const slotAddons = slots.addons;
    const slotsProps = reactive(data);
    return () => {
      const slidesElements = getSlidesVNodes(slotSlides === null || slotSlides === void 0 ? void 0 : slotSlides(slotsProps));
      const addonsElements = (slotAddons === null || slotAddons === void 0 ? void 0 : slotAddons(slotsProps)) || [];
      slidesElements.forEach((el, index) => el.props.index = index);
      let output = slidesElements;
      if (config.wrapAround) {
        const slidesBefore = slidesElements.map((el, index) => cloneVNode(el, {
          index: -slidesElements.length + index,
          isClone: true,
          key: `clone-before-${index}`
        }));
        const slidesAfter = slidesElements.map((el, index) => cloneVNode(el, {
          index: slidesElements.length + index,
          isClone: true,
          key: `clone-after-${index}`
        }));
        output = [...slidesBefore, ...slidesElements, ...slidesAfter];
      }
      slides.value = slidesElements;
      slidesCount.value = Math.max(slidesElements.length, 1);
      const trackEl = h("ol", {
        class: "carousel__track",
        style: trackStyle.value,
        onMousedownCapture: config.mouseDrag ? handleDragStart : null,
        onTouchstartPassiveCapture: config.touchDrag ? handleDragStart : null
      }, output);
      const viewPortEl = h("div", { class: "carousel__viewport" }, trackEl);
      return h("section", {
        ref: root,
        class: {
          carousel: true,
          "is-sliding": isSliding.value,
          "is-dragging": isDragging.value,
          "is-hover": isHover.value,
          "carousel--rtl": config.dir === "rtl"
        },
        dir: config.dir,
        "aria-label": config.i18n["ariaGallery"],
        tabindex: "0",
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave
      }, [viewPortEl, addonsElements, h(ARIAComponent)]);
    };
  }
});
var IconName;
(function(IconName2) {
  IconName2["arrowUp"] = "arrowUp";
  IconName2["arrowDown"] = "arrowDown";
  IconName2["arrowRight"] = "arrowRight";
  IconName2["arrowLeft"] = "arrowLeft";
})(IconName || (IconName = {}));
const icons = {
  arrowUp: "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z",
  arrowDown: "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  arrowRight: "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z",
  arrowLeft: "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
};
function isIconName(candidate) {
  return candidate in IconName;
}
const Icon = (props) => {
  const config = inject("config", reactive(Object.assign({}, defaultConfigs)));
  const iconName = String(props.name);
  const iconI18n = `icon${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`;
  if (!iconName || typeof iconName !== "string" || !isIconName(iconName)) {
    return;
  }
  const path = icons[iconName];
  const pathEl = h("path", { d: path });
  const iconTitle = config.i18n[iconI18n] || props.title || iconName;
  const titleEl = h("title", iconTitle);
  return h("svg", {
    class: "carousel__icon",
    viewBox: "0 0 24 24",
    role: "img",
    "aria-label": iconTitle
  }, [titleEl, pathEl]);
};
Icon.props = { name: String, title: String };
const Navigation = (props, { slots, attrs }) => {
  const { next: slotNext, prev: slotPrev } = slots || {};
  const config = inject("config", reactive(Object.assign({}, defaultConfigs)));
  const maxSlide = inject("maxSlide", ref(1));
  const minSlide = inject("minSlide", ref(1));
  const currentSlide = inject("currentSlide", ref(1));
  const nav = inject("nav", {});
  const { dir, wrapAround, i18n } = config;
  const isRTL = dir === "rtl";
  const prevButton = h("button", {
    type: "button",
    class: [
      "carousel__prev",
      !wrapAround && currentSlide.value <= minSlide.value && "carousel__prev--disabled",
      attrs === null || attrs === void 0 ? void 0 : attrs.class
    ],
    "aria-label": i18n["ariaPreviousSlide"],
    onClick: nav.prev
  }, (slotPrev === null || slotPrev === void 0 ? void 0 : slotPrev()) || h(Icon, { name: isRTL ? "arrowRight" : "arrowLeft" }));
  const nextButton = h("button", {
    type: "button",
    class: [
      "carousel__next",
      !wrapAround && currentSlide.value >= maxSlide.value && "carousel__next--disabled",
      attrs === null || attrs === void 0 ? void 0 : attrs.class
    ],
    "aria-label": i18n["ariaNextSlide"],
    onClick: nav.next
  }, (slotNext === null || slotNext === void 0 ? void 0 : slotNext()) || h(Icon, { name: isRTL ? "arrowLeft" : "arrowRight" }));
  return [prevButton, nextButton];
};
var Slide = defineComponent({
  name: "CarouselSlide",
  props: {
    index: {
      type: Number,
      default: 1
    },
    isClone: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const config = inject("config", reactive(Object.assign({}, defaultConfigs)));
    const currentSlide = inject("currentSlide", ref(0));
    const slidesToScroll = inject("slidesToScroll", ref(0));
    const isSliding = inject("isSliding", ref(false));
    const isActive = () => props.index === currentSlide.value;
    const isPrev = () => props.index === currentSlide.value - 1;
    const isNext = () => props.index === currentSlide.value + 1;
    const isVisible = () => {
      const min = Math.floor(slidesToScroll.value);
      const max = Math.ceil(slidesToScroll.value + config.itemsToShow - 1);
      return props.index >= min && props.index <= max;
    };
    return () => {
      var _a;
      return h("li", {
        style: { width: `${100 / config.itemsToShow}%` },
        class: {
          carousel__slide: true,
          "carousel__slide--clone": props.isClone,
          "carousel__slide--visible": isVisible(),
          "carousel__slide--active": isActive(),
          "carousel__slide--prev": isPrev(),
          "carousel__slide--next": isNext(),
          "carousel__slide--sliding": isSliding.value
        },
        "aria-hidden": !isVisible()
      }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
    };
  }
});
const carousel = "";
const _hoisted_1$8 = { class: "lupa-search-product-recommendations-wrapper" };
const _hoisted_2$6 = {
  key: 0,
  class: "lupa-recommended-products",
  "data-cy": "lupa-recommended-products"
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "Recommendations",
  props: {
    options: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const optionsStore = useOptionsStore();
    const recommendations = ref([]);
    const recommendationsType = ref(
      "recommendations_lupasearch"
    );
    const loading = ref(true);
    const carouselOptions = computed(() => {
      var _a;
      return (_a = props.options.carousel) != null ? _a : {};
    });
    const clickTrackingSettings = computed(() => {
      return {
        eventType: "product_recommendation_click",
        listLabel: recommendationsType.value,
        eventLabel: recommendationsType.value
      };
    });
    onMounted(() => {
      loadRecommendations();
      optionsStore.setSearchResultOptions({
        options: props.options
      });
    });
    const getProductKeyAction = (index, product) => {
      return getProductKey(index.toString(), product, props.options.idKey);
    };
    const loadRecommendations = () => {
      var _a, _b, _c, _d, _e;
      if ((_a = props.options.abTesting) == null ? void 0 : _a.enabled) {
        const decisionValue = Math.random();
        if (!((_c = (_b = props.options.abTesting) == null ? void 0 : _b.originalIds) == null ? void 0 : _c.length) || decisionValue > ((_e = (_d = props.options.abTesting) == null ? void 0 : _d.oldRecommenderDisplayRatio) != null ? _e : 0)) {
          loadLupaRecommendations();
        } else {
          loadOriginalRecommendations();
        }
      } else {
        loadLupaRecommendations();
      }
    };
    const fetch2 = () => {
      loadRecommendations();
    };
    const loadOriginalRecommendations = () => __async(this, null, function* () {
      var _a, _b;
      recommendationsType.value = "recommendations_original";
      try {
        loading.value = true;
        const result = yield LupaSearchSdk.queryByIds(
          props.options.queryKey,
          (_b = (_a = props.options.abTesting) == null ? void 0 : _a.originalIds) != null ? _b : [],
          props.options.options
        );
        if (!result.success) {
          return;
        }
        recommendations.value = result.items;
      } finally {
        loading.value = false;
      }
    });
    const loadLupaRecommendations = () => __async(this, null, function* () {
      recommendationsType.value = "recommendations_lupasearch";
      try {
        loading.value = true;
        const result = yield LupaSearchSdk.recommend(
          props.options.queryKey,
          props.options.itemId,
          props.options.options
        );
        if (!result.success) {
          return;
        }
        recommendations.value = result.recommended;
      } finally {
        loading.value = false;
      }
    });
    __expose({ fetch: fetch2 });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
        !loading.value ? (openBlock(), createElementBlock("div", _hoisted_2$6, [
          createVNode(unref(Carousel), mergeProps(carouselOptions.value, { "wrap-around": true }), {
            addons: withCtx(() => [
              createVNode(unref(Navigation))
            ]),
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(recommendations.value, (product, index) => {
                return openBlock(), createBlock(unref(Slide), {
                  key: getProductKeyAction(index, product)
                }, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$k, {
                      product,
                      options: _ctx.options,
                      "click-tracking-settings": clickTrackingSettings.value
                    }, null, 8, ["product", "options", "click-tracking-settings"])
                  ]),
                  _: 2
                }, 1024);
              }), 128))
            ]),
            _: 1
          }, 16)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$7 = { class: "lupa-chat-spinner" };
const _hoisted_2$5 = /* @__PURE__ */ createElementVNode("div", null, null, -1);
const _hoisted_3$3 = /* @__PURE__ */ createElementVNode("div", null, null, -1);
const _hoisted_4$2 = /* @__PURE__ */ createElementVNode("div", null, null, -1);
const _hoisted_5$2 = /* @__PURE__ */ createElementVNode("div", null, null, -1);
const _hoisted_6$1 = [
  _hoisted_2$5,
  _hoisted_3$3,
  _hoisted_4$2,
  _hoisted_5$2
];
const _hoisted_7 = { class: "lupa-chat-spinner-message" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "ChatSpinner",
  props: {
    small: { type: Boolean },
    message: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$7, [
        createElementVNode("div", {
          class: normalizeClass([{ small: _ctx.small }, "lds-ring"])
        }, _hoisted_6$1, 2),
        createElementVNode("div", _hoisted_7, toDisplayString(_ctx.message), 1)
      ]);
    };
  }
});
const _hoisted_1$6 = { class: "lupa-chat-input-container" };
const _hoisted_2$4 = { id: "lupa-search-box-input" };
const _hoisted_3$2 = {
  key: 0,
  class: "lupa-chat-form-submit"
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "ChatInput",
  props: {
    disabled: { type: Boolean }
  },
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const inputValue = ref("");
    const emit = __emit;
    const submit = () => {
      emit("submit", inputValue.value);
      inputValue.value = "";
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createElementVNode("form", {
          action: "javascript:void(0);",
          class: "chat-input-form",
          onSubmit: submit
        }, [
          createElementVNode("div", _hoisted_2$4, [
            withDirectives(createElementVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => inputValue.value = $event),
              ref: "mainInput",
              autocomplete: "off",
              class: "lupa-search-box-input-field",
              "data-cy": "lupa-search-box-input-field",
              type: "text",
              placeholder: "Type your request here..."
            }, null, 512), [
              [vModelText, inputValue.value]
            ])
          ]),
          !_ctx.disabled ? (openBlock(), createElementBlock("button", _hoisted_3$2, "Ask LupaChat")) : (openBlock(), createBlock(_sfc_main$7, {
            key: 1,
            small: true
          }))
        ], 32)
      ]);
    };
  }
});
const Env = {
  production: "https://api.lupasearch.com/v1/",
  staging: "https://api.staging.lupasearch.com/v1/"
};
const defaultConfig = {
  method: "POST",
  headers: { "Content-Type": "application/json" }
};
const headers = defaultConfig.headers;
const getApiUrl = (environment, customBaseUrl) => {
  if (customBaseUrl) {
    return customBaseUrl;
  }
  return Env[environment] || Env["production"];
};
const suggestSearchChatPhrases = (options, request, chatSettings) => __async(void 0, null, function* () {
  var _a, _b, _c;
  const { environment, customBaseUrl } = options;
  const model = (chatSettings == null ? void 0 : chatSettings.model) ? `?model=${chatSettings.model}` : ``;
  try {
    const res = yield fetch(`${getApiUrl(environment, customBaseUrl)}chat${model}`, __spreadProps(__spreadValues({}, defaultConfig), {
      body: JSON.stringify(request),
      headers: __spreadValues(__spreadValues({}, headers), (_a = options.customHeaders) != null ? _a : {})
    }));
    if (res.status < 400) {
      const data = yield res.json();
      return __spreadProps(__spreadValues({}, data), { success: true });
    }
    const errors = yield res.json();
    (_b = options == null ? void 0 : options.onError) == null ? void 0 : _b.call(options, errors);
    return { success: false, errors };
  } catch (e) {
    (_c = options == null ? void 0 : options.onError) == null ? void 0 : _c.call(options, e);
    return { success: false, errors: [e] };
  }
});
const suggestPhraseAlternatives = (options, request, chatSettings) => __async(void 0, null, function* () {
  var _a, _b, _c;
  const { environment, customBaseUrl } = options;
  const model = (chatSettings == null ? void 0 : chatSettings.model) ? `?model=${chatSettings.model}` : ``;
  try {
    const res = yield fetch(
      `${getApiUrl(environment, customBaseUrl)}chat/phraseAlternatives${model}`,
      __spreadProps(__spreadValues({}, defaultConfig), {
        body: JSON.stringify(request),
        headers: __spreadValues(__spreadValues({}, headers), (_a = options.customHeaders) != null ? _a : {})
      })
    );
    if (res.status < 400) {
      const data = yield res.json();
      return __spreadProps(__spreadValues({}, data), { success: true });
    }
    const errors = yield res.json();
    (_b = options == null ? void 0 : options.onError) == null ? void 0 : _b.call(options, errors);
    return { success: false, errors };
  } catch (e) {
    (_c = options == null ? void 0 : options.onError) == null ? void 0 : _c.call(options, e);
    return { success: false, errors: [e] };
  }
});
const suggestBestProductMatches = (options, request, chatSettings) => __async(void 0, null, function* () {
  var _a, _b, _c;
  const { environment, customBaseUrl } = options;
  const model = (chatSettings == null ? void 0 : chatSettings.model) ? `?model=${chatSettings.model}` : ``;
  try {
    const res = yield fetch(`${getApiUrl(environment, customBaseUrl)}chat/bestProducts${model}`, __spreadProps(__spreadValues({}, defaultConfig), {
      body: JSON.stringify(request),
      headers: __spreadValues(__spreadValues({}, headers), (_a = options.customHeaders) != null ? _a : {})
    }));
    if (res.status < 400) {
      const data = yield res.json();
      return __spreadProps(__spreadValues({}, data), { success: true });
    }
    const errors = yield res.json();
    (_b = options == null ? void 0 : options.onError) == null ? void 0 : _b.call(options, errors);
    return { success: false, errors };
  } catch (e) {
    (_c = options == null ? void 0 : options.onError) == null ? void 0 : _c.call(options, e);
    return { success: false, errors: [e] };
  }
});
const prepareChatHistory = (chatLog) => {
  var _a, _b;
  const history = [];
  for (const log of chatLog) {
    history.push({
      role: "user",
      content: log.userInput
    });
    history.push({
      role: "assistant",
      content: log.suggestedPhrases.join(", ")
    });
    if (((_a = log.bestItems) == null ? void 0 : _a.length) > 0) {
      history.push({
        role: "assistant",
        content: `I suggest these best item matches to your query: ${(_b = log.bestItems) == null ? void 0 : _b.join(", ")}`
      });
    }
  }
  return history;
};
const getTextResponseChunkStream = (options, request, onChunkReceived, chatSettings) => {
  var _a;
  const model = (chatSettings == null ? void 0 : chatSettings.model) ? `?model=${chatSettings.model}` : ``;
  fetch(`${getApiUrl(options.environment, options.customBaseUrl)}chat/text${model}`, __spreadProps(__spreadValues({}, defaultConfig), {
    body: JSON.stringify(request),
    headers: __spreadValues(__spreadValues({}, headers), (_a = options.customHeaders) != null ? _a : {})
  })).then((response) => {
    const reader = response.body.getReader();
    return reader.read().then(function processStream({ done, value }) {
      if (done) {
        return "";
      }
      const result = new TextDecoder("utf-8").decode(value);
      const sanitezedResult = result.replace("\n", '<div class="br"></div>');
      onChunkReceived(sanitezedResult);
      return reader.read().then(processStream);
    });
  }).catch((error) => {
    console.error(`Fetch Error: ${error}`);
  });
};
const ChatService = {
  suggestSearchChatPhrases,
  suggestPhraseAlternatives,
  suggestBestProductMatches,
  prepareChatHistory,
  getTextResponseChunkStream
};
const _hoisted_1$5 = { class: "lupa-chat-results" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "ChatPhraseProductsList",
  props: {
    options: {},
    searchResults: {}
  },
  setup(__props) {
    const props = __props;
    const getProductKeyAction = (index, product) => {
      return getProductKey(`${index}`, product, props.options.idKey);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$5, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.searchResults, (product, index) => {
          return openBlock(), createBlock(_sfc_main$k, {
            class: "lupa-chat-product-card",
            key: getProductKeyAction(index, product),
            product,
            options: _ctx.options
          }, null, 8, ["product", "options"]);
        }), 128))
      ]);
    };
  }
});
const _hoisted_1$4 = { class: "lupa-chat-content-entry-phrase" };
const _hoisted_2$3 = { class: "lupa-chat-phrase-title" };
const _hoisted_3$1 = {
  key: 0,
  class: "alert"
};
const _hoisted_4$1 = {
  key: 0,
  class: "lupa-chat-no-results"
};
const _hoisted_5$1 = /* @__PURE__ */ createElementVNode("p", null, "We found no matches for this search term", -1);
const _hoisted_6 = [
  _hoisted_5$1
];
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ChatContentEntryPhrase",
  props: {
    options: {},
    phrase: {}
  },
  emits: ["loaded"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const searchResults = ref([]);
    const usedAlternativePhrases = ref([]);
    const usedPartialResults = ref(false);
    const loading = ref(false);
    const emit = __emit;
    const currentAction = ref("");
    const displayPhrase = computed(() => props.phrase.replace(",", ""));
    onMounted(() => __async(this, null, function* () {
      loading.value = true;
      currentAction.value = "Loading search results...";
      try {
        const initialResults = yield getSearchResults(props.phrase, 8);
        if (initialResults.length) {
          searchResults.value = initialResults;
          if (initialResults.length > 2) {
            return;
          }
        }
        currentAction.value = "Checking for alternative phrases...";
        const alternatives = yield getPhraseAlternatives();
        yield addAlternativePhraseResults(alternatives, 6);
        if (!searchResults.value.length) {
          const partialAlteratives = [props.phrase].map((phrase) => phrase.split(/\s+/)).flat();
          currentAction.value = "Checking for partial alternatives...";
          const partialResults = yield addAlternativePhraseResults(partialAlteratives, 4);
          if (partialResults == null ? void 0 : partialResults.length) {
            usedPartialResults.value = true;
          }
        }
      } finally {
        loading.value = false;
        currentAction.value = "";
        emit("loaded", searchResults.value);
      }
    }));
    const addAlternativePhraseResults = (phrases, limit = 5) => __async(this, null, function* () {
      const allResults = [];
      for (const phrase of phrases) {
        const results = yield getSearchResults(phrase, limit);
        if (results.length) {
          usedAlternativePhrases.value.push(phrase);
          addToSearchResults(results);
          allResults.push(...results);
        }
      }
      return allResults;
    });
    const addToSearchResults = (items) => {
      const newDocuments = items.filter((item) => {
        return !searchResults.value.find((result) => result.id === item.id);
      });
      searchResults.value.push(...newDocuments);
    };
    const getSearchResults = (phrase, limit = 5) => __async(this, null, function* () {
      const query = { searchText: phrase, limit };
      const result = yield LupaSearchSdk.query(
        props.options.displayOptions.queryKey,
        query,
        props.options.sdkOptions
      );
      if (!result.success) {
        return [];
      }
      return result.items;
    });
    const getPhraseAlternatives = () => __async(this, null, function* () {
      const { phrases } = yield ChatService.suggestPhraseAlternatives(
        props.options.sdkOptions,
        {
          phrases: [props.phrase],
          queryKey: props.options.displayOptions.queryKey
        },
        props.options.chatSettings
      );
      return phrases != null ? phrases : [];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createElementVNode("div", _hoisted_2$3, [
          createElementVNode("h3", null, toDisplayString(displayPhrase.value), 1),
          createElementVNode("sub", null, toDisplayString(usedAlternativePhrases.value.join(", ")), 1),
          usedPartialResults.value ? (openBlock(), createElementBlock("sub", _hoisted_3$1, "Including partial matches - which might not be what you are looking for")) : createCommentVNode("", true)
        ]),
        createElementVNode("div", null, [
          createVNode(_sfc_main$5, {
            "search-results": searchResults.value,
            options: _ctx.options.displayOptions
          }, null, 8, ["search-results", "options"])
        ]),
        !loading.value && !searchResults.value.length ? (openBlock(), createElementBlock("div", _hoisted_4$1, _hoisted_6)) : createCommentVNode("", true),
        loading.value ? (openBlock(), createBlock(_sfc_main$7, {
          key: 1,
          message: currentAction.value
        }, null, 8, ["message"])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$3 = { class: "lupa-chat-best-matches lupa-chat-content-entry" };
const _hoisted_2$2 = /* @__PURE__ */ createElementVNode("h3", null, "Best matches", -1);
const MAX_SOURCES_FOR_BEST_ITEM_MATCHING = 250;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ChatContentEntry",
  props: {
    entry: {},
    options: {},
    history: {}
  },
  emits: ["loaded"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const bestMatches = ref([]);
    const loadedResults = ref([]);
    const loadedEntries = ref(0);
    const loading = ref(true);
    const emit = __emit;
    const entryCount = computed(() => {
      return props.entry.allPhrases.length;
    });
    const loaded = (results = []) => {
      loadedResults.value.push(...results);
      loadedEntries.value++;
      if (loadedEntries.value === entryCount.value) {
        loadFinalRecommendations();
      }
    };
    const titleKey = computed(() => {
      var _a;
      return (_a = props.options.displayOptions.titleKey) != null ? _a : "title";
    });
    const loadFinalRecommendations = () => __async(this, null, function* () {
      var _a, _b;
      try {
        const productResultStrings = (_a = loadedResults.value.map((result) => {
          var _a2, _b2;
          return (_b2 = (_a2 = result[titleKey.value]) == null ? void 0 : _a2.toString()) != null ? _b2 : "";
        })) == null ? void 0 : _a.slice(0, MAX_SOURCES_FOR_BEST_ITEM_MATCHING);
        const { products } = yield ChatService.suggestBestProductMatches(
          props.options.sdkOptions,
          {
            initialQuery: props.entry.userInput,
            productStrings: productResultStrings,
            messageHistory: (_b = props.history) != null ? _b : [],
            queryKey: props.options.displayOptions.queryKey
          },
          props.options.chatSettings
        );
        bestMatches.value = products;
        emit("loaded", products);
      } finally {
        loading.value = false;
      }
    });
    const bestMatchProducts = computed(() => {
      return bestMatches.value.map((productName) => {
        return findClosestStringValue(productName, loadedResults.value, titleKey.value);
      }).filter(Boolean);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createElementVNode("ul", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.entry.allPhrases, (phrase) => {
            return openBlock(), createElementBlock("li", {
              key: phrase,
              class: "lupa-chat-content-entry"
            }, [
              phrase ? (openBlock(), createBlock(_sfc_main$4, {
                key: 0,
                phrase,
                options: _ctx.options,
                onLoaded: loaded
              }, null, 8, ["phrase", "options"])) : createCommentVNode("", true)
            ]);
          }), 128))
        ]),
        createElementVNode("section", _hoisted_1$3, [
          _hoisted_2$2,
          loading.value ? (openBlock(), createBlock(_sfc_main$7, {
            key: 0,
            message: "Selecting the best matches for you. This might take a few seconds."
          })) : createCommentVNode("", true),
          bestMatches.value.length ? (openBlock(), createBlock(_sfc_main$5, {
            key: 1,
            "search-results": bestMatchProducts.value,
            options: _ctx.options.displayOptions
          }, null, 8, ["search-results", "options"])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
const _hoisted_1$2 = { class: "lupa-chat-text-response" };
const _hoisted_2$1 = ["innerHTML"];
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ChatTextEntry",
  props: {
    content: {},
    options: {},
    history: {}
  },
  setup(__props) {
    const props = __props;
    const content = ref("");
    const processChunk = (chunk) => {
      content.value += chunk;
    };
    onMounted(() => {
      var _a;
      ChatService.getTextResponseChunkStream(
        props.options.sdkOptions,
        {
          initialQuery: props.content,
          messageHistory: (_a = props.history) != null ? _a : [],
          queryKey: props.options.displayOptions.queryKey
        },
        processChunk,
        props.options.chatSettings
      );
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createElementVNode("p", { innerHTML: content.value }, null, 8, _hoisted_2$1)
      ]);
    };
  }
});
const _hoisted_1$1 = { class: "lupa-chat-section-title" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChatContentList",
  props: {
    content: {},
    options: {},
    history: {}
  },
  emits: ["loaded"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const bestItemsLoaded = (items, key) => {
      emit("loaded", { items, key });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createElementVNode("ul", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.content, (entry) => {
            var _a;
            return openBlock(), createElementBlock("li", {
              key: entry.key
            }, [
              createElementVNode("h4", _hoisted_1$1, toDisplayString(entry.userInput), 1),
              createVNode(_sfc_main$2, {
                content: entry.userInput,
                history: _ctx.history,
                options: _ctx.options
              }, null, 8, ["content", "history", "options"]),
              ((_a = entry.suggestedPhrases) == null ? void 0 : _a.length) ? (openBlock(), createBlock(_sfc_main$3, {
                key: 0,
                entry,
                options: _ctx.options,
                history: _ctx.history,
                onLoaded: (items) => bestItemsLoaded(items, entry.key)
              }, null, 8, ["entry", "options", "history", "onLoaded"])) : createCommentVNode("", true)
            ]);
          }), 128))
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "lupasearch-chat" };
const _hoisted_2 = /* @__PURE__ */ createElementVNode("section", { class: "lupa-chat-logo" }, [
  /* @__PURE__ */ createElementVNode("img", { src: "https://www.lupasearch.com/images/partials/header/lupasearch-logo.svg" })
], -1);
const _hoisted_3 = {
  key: 0,
  class: "lupasearch-chat-content"
};
const _hoisted_4 = {
  key: 1,
  class: "lupa-chat-spinner-main"
};
const _hoisted_5 = { class: "lupasearch-chat-input" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ChatContainer",
  props: {
    options: {}
  },
  setup(__props) {
    const loading = ref(false);
    const error = ref("");
    const chatContent = ref([]);
    const props = __props;
    const history = computed(() => ChatService.prepareChatHistory(chatContent.value));
    const submitChatInput = (input) => __async(this, null, function* () {
      var _a;
      if (input.length < 3) {
        return;
      }
      try {
        loading.value = true;
        const key = Date.now().toString();
        let chatLog = {
          key,
          userInput: input,
          allPhrases: [],
          suggestedPhrases: []
        };
        chatContent.value.push(chatLog);
        const request = {
          userPrompt: input,
          messageHistory: (_a = history.value) != null ? _a : [],
          queryKey: props.options.displayOptions.queryKey
        };
        const { phrases, success } = yield ChatService.suggestSearchChatPhrases(
          props.options.sdkOptions,
          request,
          props.options.chatSettings
        );
        if (!success || !phrases.length) {
          error.value = "Something went wrong";
          return;
        }
        const validPhrases = phrases.filter((p) => (p == null ? void 0 : p.trim().length) > 0);
        chatContent.value = chatContent.value.map(
          (c) => c.key === key ? __spreadProps(__spreadValues({}, c), {
            allPhrases: [...validPhrases],
            suggestedPhrases: phrases
          }) : c
        );
      } finally {
        loading.value = false;
      }
    });
    const bestItemsLoaded = ({ items, key }) => {
      const entry = chatContent.value.find((c) => c.key === key);
      entry.bestItems = items;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1, [
        _hoisted_2,
        chatContent.value.length ? (openBlock(), createElementBlock("section", _hoisted_3, [
          createVNode(_sfc_main$1, {
            content: chatContent.value,
            options: _ctx.options,
            onLoaded: bestItemsLoaded,
            history: history.value
          }, null, 8, ["content", "options", "history"])
        ])) : createCommentVNode("", true),
        loading.value ? (openBlock(), createElementBlock("section", _hoisted_4, [
          createVNode(_sfc_main$7, { message: "Loading initial recommendations... This might take up to 20s" })
        ])) : createCommentVNode("", true),
        createElementVNode("section", _hoisted_5, [
          createVNode(_sfc_main$6, {
            onSubmit: submitChatInput,
            disabled: loading.value
          }, null, 8, ["disabled"])
        ])
      ]);
    };
  }
});
let piniaInstance = null;
const initPinia = () => {
  if (piniaInstance) {
    return piniaInstance;
  }
  const pinia = createPinia();
  piniaInstance = pinia;
  return pinia;
};
const setupTracking = (options) => {
  const pinia = initPinia();
  const store = useOptionsStore(pinia);
  initTracking(options);
  store.setTrackingOptions({ options });
};
const LupaSearch = {
  install: (app) => {
    const pinia = createPinia();
    app.use(pinia);
  }
};
export {
  BadgeType,
  _sfc_main as ChatContainer,
  DocumentElementType,
  LupaSearch,
  _sfc_main$a as ProductList,
  _sfc_main$8 as Recommendations,
  _sfc_main$K as SearchBox,
  SearchBoxPanelType,
  _sfc_main$9 as SearchContainer,
  _sfc_main$c as SearchResults,
  getInitialSearchResults,
  initPinia,
  setupTracking
};

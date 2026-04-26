import {
  Component,
  ErrorFactory,
  FirebaseApp,
  FirebaseApps,
  FirebaseError,
  LogLevel,
  Logger,
  SDK_VERSION,
  VERSION,
  _getProvider,
  _registerComponent,
  calculateBackoffMillis,
  deepEqual,
  getApp,
  getModularInstance,
  isIndexedDBAvailable,
  registerVersion,
  validateIndexedDBOpenable,
  ɵAngularFireSchedulers,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵzoneWrap
} from "./chunk-TL57RXDZ.js";
import "./chunk-DIPUEJUJ.js";
import {
  isPlatformServer
} from "./chunk-CBMFXMFJ.js";
import {
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  setClassMetadata,
  ɵɵdefineNgModule
} from "./chunk-NGU34SH3.js";
import {
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  ɵɵdefineInjector
} from "./chunk-KY77W7P7.js";
import {
  Observable,
  concatMap,
  distinct,
  from,
  timer
} from "./chunk-YB2C65QT.js";
import {
  openDB
} from "./chunk-U672KND5.js";
import {
  __async
} from "./chunk-KBUIKKCC.js";

// node_modules/@angular/fire/node_modules/@firebase/installations/dist/esm/index.esm2017.js
var name = "@firebase/installations";
var version = "0.6.18";
var PENDING_TIMEOUT_MS = 1e4;
var PACKAGE_VERSION = `w:${version}`;
var INTERNAL_AUTH_VERSION = "FIS_v2";
var INSTALLATIONS_API_URL = "https://firebaseinstallations.googleapis.com/v1";
var TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1e3;
var SERVICE = "installations";
var SERVICE_NAME = "Installations";
var ERROR_DESCRIPTION_MAP = {
  [
    "missing-app-config-values"
    /* ErrorCode.MISSING_APP_CONFIG_VALUES */
  ]: 'Missing App configuration value: "{$valueName}"',
  [
    "not-registered"
    /* ErrorCode.NOT_REGISTERED */
  ]: "Firebase Installation is not registered.",
  [
    "installation-not-found"
    /* ErrorCode.INSTALLATION_NOT_FOUND */
  ]: "Firebase Installation not found.",
  [
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  ]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
  [
    "app-offline"
    /* ErrorCode.APP_OFFLINE */
  ]: "Could not process request. Application offline.",
  [
    "delete-pending-registration"
    /* ErrorCode.DELETE_PENDING_REGISTRATION */
  ]: "Can't delete installation while there is a pending registration request."
};
var ERROR_FACTORY = new ErrorFactory(SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
function isServerError(error) {
  return error instanceof FirebaseError && error.code.includes(
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  );
}
function getInstallationsEndpoint({ projectId }) {
  return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
  return {
    token: response.token,
    requestStatus: 2,
    expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
    creationTime: Date.now()
  };
}
function getErrorFromResponse(requestName, response) {
  return __async(this, null, function* () {
    const responseJson = yield response.json();
    const errorData = responseJson.error;
    return ERROR_FACTORY.create("request-failed", {
      requestName,
      serverCode: errorData.code,
      serverMessage: errorData.message,
      serverStatus: errorData.status
    });
  });
}
function getHeaders({ apiKey }) {
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
  const headers = getHeaders(appConfig);
  headers.append("Authorization", getAuthorizationHeader(refreshToken));
  return headers;
}
function retryIfServerError(fn) {
  return __async(this, null, function* () {
    const result = yield fn();
    if (result.status >= 500 && result.status < 600) {
      return fn();
    }
    return result;
  });
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
  return Number(responseExpiresIn.replace("s", "000"));
}
function getAuthorizationHeader(refreshToken) {
  return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}
function createInstallationRequest(_0, _1) {
  return __async(this, arguments, function* ({ appConfig, heartbeatServiceProvider }, { fid }) {
    const endpoint = getInstallationsEndpoint(appConfig);
    const headers = getHeaders(appConfig);
    const heartbeatService = heartbeatServiceProvider.getImmediate({
      optional: true
    });
    if (heartbeatService) {
      const heartbeatsHeader = yield heartbeatService.getHeartbeatsHeader();
      if (heartbeatsHeader) {
        headers.append("x-firebase-client", heartbeatsHeader);
      }
    }
    const body = {
      fid,
      authVersion: INTERNAL_AUTH_VERSION,
      appId: appConfig.appId,
      sdkVersion: PACKAGE_VERSION
    };
    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    const response = yield retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
      const responseValue = yield response.json();
      const registeredInstallationEntry = {
        fid: responseValue.fid || fid,
        registrationStatus: 2,
        refreshToken: responseValue.refreshToken,
        authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
      };
      return registeredInstallationEntry;
    } else {
      throw yield getErrorFromResponse("Create Installation", response);
    }
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function bufferToBase64UrlSafe(array) {
  const b64 = btoa(String.fromCharCode(...array));
  return b64.replace(/\+/g, "-").replace(/\//g, "_");
}
var VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
var INVALID_FID = "";
function generateFid() {
  try {
    const fidByteArray = new Uint8Array(17);
    const crypto = self.crypto || self.msCrypto;
    crypto.getRandomValues(fidByteArray);
    fidByteArray[0] = 112 + fidByteArray[0] % 16;
    const fid = encode(fidByteArray);
    return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
  } catch (_a) {
    return INVALID_FID;
  }
}
function encode(fidByteArray) {
  const b64String = bufferToBase64UrlSafe(fidByteArray);
  return b64String.substr(0, 22);
}
function getKey(appConfig) {
  return `${appConfig.appName}!${appConfig.appId}`;
}
var fidChangeCallbacks = /* @__PURE__ */ new Map();
function fidChanged(appConfig, fid) {
  const key = getKey(appConfig);
  callFidChangeCallbacks(key, fid);
  broadcastFidChange(key, fid);
}
function callFidChangeCallbacks(key, fid) {
  const callbacks = fidChangeCallbacks.get(key);
  if (!callbacks) {
    return;
  }
  for (const callback of callbacks) {
    callback(fid);
  }
}
function broadcastFidChange(key, fid) {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ key, fid });
  }
  closeBroadcastChannel();
}
var broadcastChannel = null;
function getBroadcastChannel() {
  if (!broadcastChannel && "BroadcastChannel" in self) {
    broadcastChannel = new BroadcastChannel("[Firebase] FID Change");
    broadcastChannel.onmessage = (e) => {
      callFidChangeCallbacks(e.data.key, e.data.fid);
    };
  }
  return broadcastChannel;
}
function closeBroadcastChannel() {
  if (fidChangeCallbacks.size === 0 && broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
var DATABASE_NAME = "firebase-installations-database";
var DATABASE_VERSION = 1;
var OBJECT_STORE_NAME = "firebase-installations-store";
var dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: (db, oldVersion) => {
        switch (oldVersion) {
          case 0:
            db.createObjectStore(OBJECT_STORE_NAME);
        }
      }
    });
  }
  return dbPromise;
}
function set(appConfig, value) {
  return __async(this, null, function* () {
    const key = getKey(appConfig);
    const db = yield getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const objectStore = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = yield objectStore.get(key);
    yield objectStore.put(value, key);
    yield tx.done;
    if (!oldValue || oldValue.fid !== value.fid) {
      fidChanged(appConfig, value.fid);
    }
    return value;
  });
}
function remove(appConfig) {
  return __async(this, null, function* () {
    const key = getKey(appConfig);
    const db = yield getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    yield tx.objectStore(OBJECT_STORE_NAME).delete(key);
    yield tx.done;
  });
}
function update(appConfig, updateFn) {
  return __async(this, null, function* () {
    const key = getKey(appConfig);
    const db = yield getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = yield store.get(key);
    const newValue = updateFn(oldValue);
    if (newValue === void 0) {
      yield store.delete(key);
    } else {
      yield store.put(newValue, key);
    }
    yield tx.done;
    if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
      fidChanged(appConfig, newValue.fid);
    }
    return newValue;
  });
}
function getInstallationEntry(installations) {
  return __async(this, null, function* () {
    let registrationPromise;
    const installationEntry = yield update(installations.appConfig, (oldEntry) => {
      const installationEntry2 = updateOrCreateInstallationEntry(oldEntry);
      const entryWithPromise = triggerRegistrationIfNecessary(installations, installationEntry2);
      registrationPromise = entryWithPromise.registrationPromise;
      return entryWithPromise.installationEntry;
    });
    if (installationEntry.fid === INVALID_FID) {
      return { installationEntry: yield registrationPromise };
    }
    return {
      installationEntry,
      registrationPromise
    };
  });
}
function updateOrCreateInstallationEntry(oldEntry) {
  const entry = oldEntry || {
    fid: generateFid(),
    registrationStatus: 0
    /* RequestStatus.NOT_STARTED */
  };
  return clearTimedOutRequest(entry);
}
function triggerRegistrationIfNecessary(installations, installationEntry) {
  if (installationEntry.registrationStatus === 0) {
    if (!navigator.onLine) {
      const registrationPromiseWithError = Promise.reject(ERROR_FACTORY.create(
        "app-offline"
        /* ErrorCode.APP_OFFLINE */
      ));
      return {
        installationEntry,
        registrationPromise: registrationPromiseWithError
      };
    }
    const inProgressEntry = {
      fid: installationEntry.fid,
      registrationStatus: 1,
      registrationTime: Date.now()
    };
    const registrationPromise = registerInstallation(installations, inProgressEntry);
    return { installationEntry: inProgressEntry, registrationPromise };
  } else if (installationEntry.registrationStatus === 1) {
    return {
      installationEntry,
      registrationPromise: waitUntilFidRegistration(installations)
    };
  } else {
    return { installationEntry };
  }
}
function registerInstallation(installations, installationEntry) {
  return __async(this, null, function* () {
    try {
      const registeredInstallationEntry = yield createInstallationRequest(installations, installationEntry);
      return set(installations.appConfig, registeredInstallationEntry);
    } catch (e) {
      if (isServerError(e) && e.customData.serverCode === 409) {
        yield remove(installations.appConfig);
      } else {
        yield set(installations.appConfig, {
          fid: installationEntry.fid,
          registrationStatus: 0
          /* RequestStatus.NOT_STARTED */
        });
      }
      throw e;
    }
  });
}
function waitUntilFidRegistration(installations) {
  return __async(this, null, function* () {
    let entry = yield updateInstallationRequest(installations.appConfig);
    while (entry.registrationStatus === 1) {
      yield sleep(100);
      entry = yield updateInstallationRequest(installations.appConfig);
    }
    if (entry.registrationStatus === 0) {
      const { installationEntry, registrationPromise } = yield getInstallationEntry(installations);
      if (registrationPromise) {
        return registrationPromise;
      } else {
        return installationEntry;
      }
    }
    return entry;
  });
}
function updateInstallationRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!oldEntry) {
      throw ERROR_FACTORY.create(
        "installation-not-found"
        /* ErrorCode.INSTALLATION_NOT_FOUND */
      );
    }
    return clearTimedOutRequest(oldEntry);
  });
}
function clearTimedOutRequest(entry) {
  if (hasInstallationRequestTimedOut(entry)) {
    return {
      fid: entry.fid,
      registrationStatus: 0
      /* RequestStatus.NOT_STARTED */
    };
  }
  return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
  return installationEntry.registrationStatus === 1 && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
}
function generateAuthTokenRequest(_0, _1) {
  return __async(this, arguments, function* ({ appConfig, heartbeatServiceProvider }, installationEntry) {
    const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
    const headers = getHeadersWithAuth(appConfig, installationEntry);
    const heartbeatService = heartbeatServiceProvider.getImmediate({
      optional: true
    });
    if (heartbeatService) {
      const heartbeatsHeader = yield heartbeatService.getHeartbeatsHeader();
      if (heartbeatsHeader) {
        headers.append("x-firebase-client", heartbeatsHeader);
      }
    }
    const body = {
      installation: {
        sdkVersion: PACKAGE_VERSION,
        appId: appConfig.appId
      }
    };
    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    const response = yield retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
      const responseValue = yield response.json();
      const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
      return completedAuthToken;
    } else {
      throw yield getErrorFromResponse("Generate Auth Token", response);
    }
  });
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
  return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}
function refreshAuthToken(installations, forceRefresh = false) {
  return __async(this, null, function* () {
    let tokenPromise;
    const entry = yield update(installations.appConfig, (oldEntry) => {
      if (!isEntryRegistered(oldEntry)) {
        throw ERROR_FACTORY.create(
          "not-registered"
          /* ErrorCode.NOT_REGISTERED */
        );
      }
      const oldAuthToken = oldEntry.authToken;
      if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
        return oldEntry;
      } else if (oldAuthToken.requestStatus === 1) {
        tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
        return oldEntry;
      } else {
        if (!navigator.onLine) {
          throw ERROR_FACTORY.create(
            "app-offline"
            /* ErrorCode.APP_OFFLINE */
          );
        }
        const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
        tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
        return inProgressEntry;
      }
    });
    const authToken = tokenPromise ? yield tokenPromise : entry.authToken;
    return authToken;
  });
}
function waitUntilAuthTokenRequest(installations, forceRefresh) {
  return __async(this, null, function* () {
    let entry = yield updateAuthTokenRequest(installations.appConfig);
    while (entry.authToken.requestStatus === 1) {
      yield sleep(100);
      entry = yield updateAuthTokenRequest(installations.appConfig);
    }
    const authToken = entry.authToken;
    if (authToken.requestStatus === 0) {
      return refreshAuthToken(installations, forceRefresh);
    } else {
      return authToken;
    }
  });
}
function updateAuthTokenRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!isEntryRegistered(oldEntry)) {
      throw ERROR_FACTORY.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    }
    const oldAuthToken = oldEntry.authToken;
    if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
      return Object.assign(Object.assign({}, oldEntry), { authToken: {
        requestStatus: 0
        /* RequestStatus.NOT_STARTED */
      } });
    }
    return oldEntry;
  });
}
function fetchAuthTokenFromServer(installations, installationEntry) {
  return __async(this, null, function* () {
    try {
      const authToken = yield generateAuthTokenRequest(installations, installationEntry);
      const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken });
      yield set(installations.appConfig, updatedInstallationEntry);
      return authToken;
    } catch (e) {
      if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
        yield remove(installations.appConfig);
      } else {
        const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken: {
          requestStatus: 0
          /* RequestStatus.NOT_STARTED */
        } });
        yield set(installations.appConfig, updatedInstallationEntry);
      }
      throw e;
    }
  });
}
function isEntryRegistered(installationEntry) {
  return installationEntry !== void 0 && installationEntry.registrationStatus === 2;
}
function isAuthTokenValid(authToken) {
  return authToken.requestStatus === 2 && !isAuthTokenExpired(authToken);
}
function isAuthTokenExpired(authToken) {
  const now = Date.now();
  return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
}
function makeAuthTokenRequestInProgressEntry(oldEntry) {
  const inProgressAuthToken = {
    requestStatus: 1,
    requestTime: Date.now()
  };
  return Object.assign(Object.assign({}, oldEntry), { authToken: inProgressAuthToken });
}
function hasAuthTokenRequestTimedOut(authToken) {
  return authToken.requestStatus === 1 && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
}
function getId(installations) {
  return __async(this, null, function* () {
    const installationsImpl = installations;
    const { installationEntry, registrationPromise } = yield getInstallationEntry(installationsImpl);
    if (registrationPromise) {
      registrationPromise.catch(console.error);
    } else {
      refreshAuthToken(installationsImpl).catch(console.error);
    }
    return installationEntry.fid;
  });
}
function getToken(installations, forceRefresh = false) {
  return __async(this, null, function* () {
    const installationsImpl = installations;
    yield completeInstallationRegistration(installationsImpl);
    const authToken = yield refreshAuthToken(installationsImpl, forceRefresh);
    return authToken.token;
  });
}
function completeInstallationRegistration(installations) {
  return __async(this, null, function* () {
    const { registrationPromise } = yield getInstallationEntry(installations);
    if (registrationPromise) {
      yield registrationPromise;
    }
  });
}
function extractAppConfig(app) {
  if (!app || !app.options) {
    throw getMissingValueError("App Configuration");
  }
  if (!app.name) {
    throw getMissingValueError("App Name");
  }
  const configKeys = [
    "projectId",
    "apiKey",
    "appId"
  ];
  for (const keyName of configKeys) {
    if (!app.options[keyName]) {
      throw getMissingValueError(keyName);
    }
  }
  return {
    appName: app.name,
    projectId: app.options.projectId,
    apiKey: app.options.apiKey,
    appId: app.options.appId
  };
}
function getMissingValueError(valueName) {
  return ERROR_FACTORY.create("missing-app-config-values", {
    valueName
  });
}
var INSTALLATIONS_NAME = "installations";
var INSTALLATIONS_NAME_INTERNAL = "installations-internal";
var publicFactory = (container) => {
  const app = container.getProvider("app").getImmediate();
  const appConfig = extractAppConfig(app);
  const heartbeatServiceProvider = _getProvider(app, "heartbeat");
  const installationsImpl = {
    app,
    appConfig,
    heartbeatServiceProvider,
    _delete: () => Promise.resolve()
  };
  return installationsImpl;
};
var internalFactory = (container) => {
  const app = container.getProvider("app").getImmediate();
  const installations = _getProvider(app, INSTALLATIONS_NAME).getImmediate();
  const installationsInternal = {
    getId: () => getId(installations),
    getToken: (forceRefresh) => getToken(installations, forceRefresh)
  };
  return installationsInternal;
};
function registerInstallations() {
  _registerComponent(new Component(
    INSTALLATIONS_NAME,
    publicFactory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    INSTALLATIONS_NAME_INTERNAL,
    internalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
}
registerInstallations();
registerVersion(name, version);
registerVersion(name, version, "esm2017");

// node_modules/@angular/fire/node_modules/@firebase/remote-config/dist/esm/index.esm2017.js
var name2 = "@firebase/remote-config";
var version2 = "0.6.5";
var RemoteConfigAbortSignal = class {
  constructor() {
    this.listeners = [];
  }
  addEventListener(listener) {
    this.listeners.push(listener);
  }
  abort() {
    this.listeners.forEach((listener) => listener());
  }
};
var RC_COMPONENT_NAME = "remote-config";
var RC_CUSTOM_SIGNAL_MAX_ALLOWED_SIGNALS = 100;
var RC_CUSTOM_SIGNAL_KEY_MAX_LENGTH = 250;
var RC_CUSTOM_SIGNAL_VALUE_MAX_LENGTH = 500;
var ERROR_DESCRIPTION_MAP2 = {
  [
    "already-initialized"
    /* ErrorCode.ALREADY_INITIALIZED */
  ]: "Remote Config already initialized",
  [
    "registration-window"
    /* ErrorCode.REGISTRATION_WINDOW */
  ]: "Undefined window object. This SDK only supports usage in a browser environment.",
  [
    "registration-project-id"
    /* ErrorCode.REGISTRATION_PROJECT_ID */
  ]: "Undefined project identifier. Check Firebase app initialization.",
  [
    "registration-api-key"
    /* ErrorCode.REGISTRATION_API_KEY */
  ]: "Undefined API key. Check Firebase app initialization.",
  [
    "registration-app-id"
    /* ErrorCode.REGISTRATION_APP_ID */
  ]: "Undefined app identifier. Check Firebase app initialization.",
  [
    "storage-open"
    /* ErrorCode.STORAGE_OPEN */
  ]: "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
  [
    "storage-get"
    /* ErrorCode.STORAGE_GET */
  ]: "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
  [
    "storage-set"
    /* ErrorCode.STORAGE_SET */
  ]: "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
  [
    "storage-delete"
    /* ErrorCode.STORAGE_DELETE */
  ]: "Error thrown when deleting from storage. Original error: {$originalErrorMessage}.",
  [
    "fetch-client-network"
    /* ErrorCode.FETCH_NETWORK */
  ]: "Fetch client failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
  [
    "fetch-timeout"
    /* ErrorCode.FETCH_TIMEOUT */
  ]: 'The config fetch request timed out.  Configure timeout using "fetchTimeoutMillis" SDK setting.',
  [
    "fetch-throttle"
    /* ErrorCode.FETCH_THROTTLE */
  ]: 'The config fetch request timed out while in an exponential backoff state. Configure timeout using "fetchTimeoutMillis" SDK setting. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.',
  [
    "fetch-client-parse"
    /* ErrorCode.FETCH_PARSE */
  ]: "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
  [
    "fetch-status"
    /* ErrorCode.FETCH_STATUS */
  ]: "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
  [
    "indexed-db-unavailable"
    /* ErrorCode.INDEXED_DB_UNAVAILABLE */
  ]: "Indexed DB is not supported by current browser",
  [
    "custom-signal-max-allowed-signals"
    /* ErrorCode.CUSTOM_SIGNAL_MAX_ALLOWED_SIGNALS */
  ]: "Setting more than {$maxSignals} custom signals is not supported."
};
var ERROR_FACTORY2 = new ErrorFactory("remoteconfig", "Remote Config", ERROR_DESCRIPTION_MAP2);
function hasErrorCode(e, errorCode) {
  return e instanceof FirebaseError && e.code.indexOf(errorCode) !== -1;
}
var DEFAULT_VALUE_FOR_BOOLEAN = false;
var DEFAULT_VALUE_FOR_STRING = "";
var DEFAULT_VALUE_FOR_NUMBER = 0;
var BOOLEAN_TRUTHY_VALUES = ["1", "true", "t", "yes", "y", "on"];
var Value = class {
  constructor(_source, _value = DEFAULT_VALUE_FOR_STRING) {
    this._source = _source;
    this._value = _value;
  }
  asString() {
    return this._value;
  }
  asBoolean() {
    if (this._source === "static") {
      return DEFAULT_VALUE_FOR_BOOLEAN;
    }
    return BOOLEAN_TRUTHY_VALUES.indexOf(this._value.toLowerCase()) >= 0;
  }
  asNumber() {
    if (this._source === "static") {
      return DEFAULT_VALUE_FOR_NUMBER;
    }
    let num = Number(this._value);
    if (isNaN(num)) {
      num = DEFAULT_VALUE_FOR_NUMBER;
    }
    return num;
  }
  getSource() {
    return this._source;
  }
};
function getRemoteConfig(app = getApp(), options = {}) {
  var _a, _b;
  app = getModularInstance(app);
  const rcProvider = _getProvider(app, RC_COMPONENT_NAME);
  if (rcProvider.isInitialized()) {
    const initialOptions = rcProvider.getOptions();
    if (deepEqual(initialOptions, options)) {
      return rcProvider.getImmediate();
    }
    throw ERROR_FACTORY2.create(
      "already-initialized"
      /* ErrorCode.ALREADY_INITIALIZED */
    );
  }
  rcProvider.initialize({ options });
  const rc = rcProvider.getImmediate();
  if (options.initialFetchResponse) {
    rc._initializePromise = Promise.all([
      rc._storage.setLastSuccessfulFetchResponse(options.initialFetchResponse),
      rc._storage.setActiveConfigEtag(((_a = options.initialFetchResponse) === null || _a === void 0 ? void 0 : _a.eTag) || ""),
      rc._storageCache.setLastSuccessfulFetchTimestampMillis(Date.now()),
      rc._storageCache.setLastFetchStatus("success"),
      rc._storageCache.setActiveConfig(((_b = options.initialFetchResponse) === null || _b === void 0 ? void 0 : _b.config) || {})
    ]).then();
    rc._isInitializationComplete = true;
  }
  return rc;
}
function activate(remoteConfig) {
  return __async(this, null, function* () {
    const rc = getModularInstance(remoteConfig);
    const [lastSuccessfulFetchResponse, activeConfigEtag] = yield Promise.all([
      rc._storage.getLastSuccessfulFetchResponse(),
      rc._storage.getActiveConfigEtag()
    ]);
    if (!lastSuccessfulFetchResponse || !lastSuccessfulFetchResponse.config || !lastSuccessfulFetchResponse.eTag || lastSuccessfulFetchResponse.eTag === activeConfigEtag) {
      return false;
    }
    yield Promise.all([
      rc._storageCache.setActiveConfig(lastSuccessfulFetchResponse.config),
      rc._storage.setActiveConfigEtag(lastSuccessfulFetchResponse.eTag)
    ]);
    return true;
  });
}
function ensureInitialized(remoteConfig) {
  const rc = getModularInstance(remoteConfig);
  if (!rc._initializePromise) {
    rc._initializePromise = rc._storageCache.loadFromStorage().then(() => {
      rc._isInitializationComplete = true;
    });
  }
  return rc._initializePromise;
}
function fetchConfig(remoteConfig) {
  return __async(this, null, function* () {
    const rc = getModularInstance(remoteConfig);
    const abortSignal = new RemoteConfigAbortSignal();
    setTimeout(() => __async(null, null, function* () {
      abortSignal.abort();
    }), rc.settings.fetchTimeoutMillis);
    const customSignals = rc._storageCache.getCustomSignals();
    if (customSignals) {
      rc._logger.debug(`Fetching config with custom signals: ${JSON.stringify(customSignals)}`);
    }
    try {
      yield rc._client.fetch({
        cacheMaxAgeMillis: rc.settings.minimumFetchIntervalMillis,
        signal: abortSignal,
        customSignals
      });
      yield rc._storageCache.setLastFetchStatus("success");
    } catch (e) {
      const lastFetchStatus = hasErrorCode(
        e,
        "fetch-throttle"
        /* ErrorCode.FETCH_THROTTLE */
      ) ? "throttle" : "failure";
      yield rc._storageCache.setLastFetchStatus(lastFetchStatus);
      throw e;
    }
  });
}
function getAll(remoteConfig) {
  const rc = getModularInstance(remoteConfig);
  return getAllKeys(rc._storageCache.getActiveConfig(), rc.defaultConfig).reduce((allConfigs, key) => {
    allConfigs[key] = getValue(remoteConfig, key);
    return allConfigs;
  }, {});
}
function getBoolean(remoteConfig, key) {
  return getValue(getModularInstance(remoteConfig), key).asBoolean();
}
function getNumber(remoteConfig, key) {
  return getValue(getModularInstance(remoteConfig), key).asNumber();
}
function getString(remoteConfig, key) {
  return getValue(getModularInstance(remoteConfig), key).asString();
}
function getValue(remoteConfig, key) {
  const rc = getModularInstance(remoteConfig);
  if (!rc._isInitializationComplete) {
    rc._logger.debug(`A value was requested for key "${key}" before SDK initialization completed. Await on ensureInitialized if the intent was to get a previously activated value.`);
  }
  const activeConfig = rc._storageCache.getActiveConfig();
  if (activeConfig && activeConfig[key] !== void 0) {
    return new Value("remote", activeConfig[key]);
  } else if (rc.defaultConfig && rc.defaultConfig[key] !== void 0) {
    return new Value("default", String(rc.defaultConfig[key]));
  }
  rc._logger.debug(`Returning static value for key "${key}". Define a default or remote value if this is unintentional.`);
  return new Value("static");
}
function setLogLevel(remoteConfig, logLevel) {
  const rc = getModularInstance(remoteConfig);
  switch (logLevel) {
    case "debug":
      rc._logger.logLevel = LogLevel.DEBUG;
      break;
    case "silent":
      rc._logger.logLevel = LogLevel.SILENT;
      break;
    default:
      rc._logger.logLevel = LogLevel.ERROR;
  }
}
function getAllKeys(obj1 = {}, obj2 = {}) {
  return Object.keys(Object.assign(Object.assign({}, obj1), obj2));
}
function setCustomSignals(remoteConfig, customSignals) {
  return __async(this, null, function* () {
    const rc = getModularInstance(remoteConfig);
    if (Object.keys(customSignals).length === 0) {
      return;
    }
    for (const key in customSignals) {
      if (key.length > RC_CUSTOM_SIGNAL_KEY_MAX_LENGTH) {
        rc._logger.error(`Custom signal key ${key} is too long, max allowed length is ${RC_CUSTOM_SIGNAL_KEY_MAX_LENGTH}.`);
        return;
      }
      const value = customSignals[key];
      if (typeof value === "string" && value.length > RC_CUSTOM_SIGNAL_VALUE_MAX_LENGTH) {
        rc._logger.error(`Value supplied for custom signal ${key} is too long, max allowed length is ${RC_CUSTOM_SIGNAL_VALUE_MAX_LENGTH}.`);
        return;
      }
    }
    try {
      yield rc._storageCache.setCustomSignals(customSignals);
    } catch (error) {
      rc._logger.error(`Error encountered while setting custom signals: ${error}`);
    }
  });
}
var CachingClient = class {
  constructor(client, storage, storageCache, logger) {
    this.client = client;
    this.storage = storage;
    this.storageCache = storageCache;
    this.logger = logger;
  }
  /**
   * Returns true if the age of the cached fetched configs is less than or equal to
   * {@link Settings#minimumFetchIntervalInSeconds}.
   *
   * <p>This is comparable to passing `headers = { 'Cache-Control': max-age <maxAge> }` to the
   * native Fetch API.
   *
   * <p>Visible for testing.
   */
  isCachedDataFresh(cacheMaxAgeMillis, lastSuccessfulFetchTimestampMillis) {
    if (!lastSuccessfulFetchTimestampMillis) {
      this.logger.debug("Config fetch cache check. Cache unpopulated.");
      return false;
    }
    const cacheAgeMillis = Date.now() - lastSuccessfulFetchTimestampMillis;
    const isCachedDataFresh = cacheAgeMillis <= cacheMaxAgeMillis;
    this.logger.debug(`Config fetch cache check. Cache age millis: ${cacheAgeMillis}. Cache max age millis (minimumFetchIntervalMillis setting): ${cacheMaxAgeMillis}. Is cache hit: ${isCachedDataFresh}.`);
    return isCachedDataFresh;
  }
  fetch(request) {
    return __async(this, null, function* () {
      const [lastSuccessfulFetchTimestampMillis, lastSuccessfulFetchResponse] = yield Promise.all([
        this.storage.getLastSuccessfulFetchTimestampMillis(),
        this.storage.getLastSuccessfulFetchResponse()
      ]);
      if (lastSuccessfulFetchResponse && this.isCachedDataFresh(request.cacheMaxAgeMillis, lastSuccessfulFetchTimestampMillis)) {
        return lastSuccessfulFetchResponse;
      }
      request.eTag = lastSuccessfulFetchResponse && lastSuccessfulFetchResponse.eTag;
      const response = yield this.client.fetch(request);
      const storageOperations = [
        // Uses write-through cache for consistency with synchronous public API.
        this.storageCache.setLastSuccessfulFetchTimestampMillis(Date.now())
      ];
      if (response.status === 200) {
        storageOperations.push(this.storage.setLastSuccessfulFetchResponse(response));
      }
      yield Promise.all(storageOperations);
      return response;
    });
  }
};
function getUserLanguage(navigatorLanguage = navigator) {
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    navigatorLanguage.languages && navigatorLanguage.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    navigatorLanguage.language
  );
}
var RestClient = class {
  constructor(firebaseInstallations, sdkVersion, namespace, projectId, apiKey, appId) {
    this.firebaseInstallations = firebaseInstallations;
    this.sdkVersion = sdkVersion;
    this.namespace = namespace;
    this.projectId = projectId;
    this.apiKey = apiKey;
    this.appId = appId;
  }
  /**
   * Fetches from the Remote Config REST API.
   *
   * @throws a {@link ErrorCode.FETCH_NETWORK} error if {@link GlobalFetch#fetch} can't
   * connect to the network.
   * @throws a {@link ErrorCode.FETCH_PARSE} error if {@link Response#json} can't parse the
   * fetch response.
   * @throws a {@link ErrorCode.FETCH_STATUS} error if the service returns an HTTP error status.
   */
  fetch(request) {
    return __async(this, null, function* () {
      const [installationId, installationToken] = yield Promise.all([
        this.firebaseInstallations.getId(),
        this.firebaseInstallations.getToken()
      ]);
      const urlBase = window.FIREBASE_REMOTE_CONFIG_URL_BASE || "https://firebaseremoteconfig.googleapis.com";
      const url = `${urlBase}/v1/projects/${this.projectId}/namespaces/${this.namespace}:fetch?key=${this.apiKey}`;
      const headers = {
        "Content-Type": "application/json",
        "Content-Encoding": "gzip",
        // Deviates from pure decorator by not passing max-age header since we don't currently have
        // service behavior using that header.
        "If-None-Match": request.eTag || "*"
      };
      const requestBody = {
        /* eslint-disable camelcase */
        sdk_version: this.sdkVersion,
        app_instance_id: installationId,
        app_instance_id_token: installationToken,
        app_id: this.appId,
        language_code: getUserLanguage(),
        custom_signals: request.customSignals
        /* eslint-enable camelcase */
      };
      const options = {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      };
      const fetchPromise = fetch(url, options);
      const timeoutPromise = new Promise((_resolve, reject) => {
        request.signal.addEventListener(() => {
          const error = new Error("The operation was aborted.");
          error.name = "AbortError";
          reject(error);
        });
      });
      let response;
      try {
        yield Promise.race([fetchPromise, timeoutPromise]);
        response = yield fetchPromise;
      } catch (originalError) {
        let errorCode = "fetch-client-network";
        if ((originalError === null || originalError === void 0 ? void 0 : originalError.name) === "AbortError") {
          errorCode = "fetch-timeout";
        }
        throw ERROR_FACTORY2.create(errorCode, {
          originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
        });
      }
      let status = response.status;
      const responseEtag = response.headers.get("ETag") || void 0;
      let config;
      let state;
      if (response.status === 200) {
        let responseBody;
        try {
          responseBody = yield response.json();
        } catch (originalError) {
          throw ERROR_FACTORY2.create("fetch-client-parse", {
            originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
          });
        }
        config = responseBody["entries"];
        state = responseBody["state"];
      }
      if (state === "INSTANCE_STATE_UNSPECIFIED") {
        status = 500;
      } else if (state === "NO_CHANGE") {
        status = 304;
      } else if (state === "NO_TEMPLATE" || state === "EMPTY_CONFIG") {
        config = {};
      }
      if (status !== 304 && status !== 200) {
        throw ERROR_FACTORY2.create("fetch-status", {
          httpStatus: status
        });
      }
      return { status, eTag: responseEtag, config };
    });
  }
};
function setAbortableTimeout(signal, throttleEndTimeMillis) {
  return new Promise((resolve, reject) => {
    const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
    const timeout = setTimeout(resolve, backoffMillis);
    signal.addEventListener(() => {
      clearTimeout(timeout);
      reject(ERROR_FACTORY2.create("fetch-throttle", {
        throttleEndTimeMillis
      }));
    });
  });
}
function isRetriableError(e) {
  if (!(e instanceof FirebaseError) || !e.customData) {
    return false;
  }
  const httpStatus = Number(e.customData["httpStatus"]);
  return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
var RetryingClient = class {
  constructor(client, storage) {
    this.client = client;
    this.storage = storage;
  }
  fetch(request) {
    return __async(this, null, function* () {
      const throttleMetadata = (yield this.storage.getThrottleMetadata()) || {
        backoffCount: 0,
        throttleEndTimeMillis: Date.now()
      };
      return this.attemptFetch(request, throttleMetadata);
    });
  }
  /**
   * A recursive helper for attempting a fetch request repeatedly.
   *
   * @throws any non-retriable errors.
   */
  attemptFetch(_0, _1) {
    return __async(this, arguments, function* (request, { throttleEndTimeMillis, backoffCount }) {
      yield setAbortableTimeout(request.signal, throttleEndTimeMillis);
      try {
        const response = yield this.client.fetch(request);
        yield this.storage.deleteThrottleMetadata();
        return response;
      } catch (e) {
        if (!isRetriableError(e)) {
          throw e;
        }
        const throttleMetadata = {
          throttleEndTimeMillis: Date.now() + calculateBackoffMillis(backoffCount),
          backoffCount: backoffCount + 1
        };
        yield this.storage.setThrottleMetadata(throttleMetadata);
        return this.attemptFetch(request, throttleMetadata);
      }
    });
  }
};
var DEFAULT_FETCH_TIMEOUT_MILLIS = 60 * 1e3;
var DEFAULT_CACHE_MAX_AGE_MILLIS = 12 * 60 * 60 * 1e3;
var RemoteConfig = class {
  get fetchTimeMillis() {
    return this._storageCache.getLastSuccessfulFetchTimestampMillis() || -1;
  }
  get lastFetchStatus() {
    return this._storageCache.getLastFetchStatus() || "no-fetch-yet";
  }
  constructor(app, _client, _storageCache, _storage, _logger) {
    this.app = app;
    this._client = _client;
    this._storageCache = _storageCache;
    this._storage = _storage;
    this._logger = _logger;
    this._isInitializationComplete = false;
    this.settings = {
      fetchTimeoutMillis: DEFAULT_FETCH_TIMEOUT_MILLIS,
      minimumFetchIntervalMillis: DEFAULT_CACHE_MAX_AGE_MILLIS
    };
    this.defaultConfig = {};
  }
};
function toFirebaseError(event, errorCode) {
  const originalError = event.target.error || void 0;
  return ERROR_FACTORY2.create(errorCode, {
    originalErrorMessage: originalError && (originalError === null || originalError === void 0 ? void 0 : originalError.message)
  });
}
var APP_NAMESPACE_STORE = "app_namespace_store";
var DB_NAME = "firebase_remote_config";
var DB_VERSION = 1;
function openDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => {
        reject(toFirebaseError(
          event,
          "storage-open"
          /* ErrorCode.STORAGE_OPEN */
        ));
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        switch (event.oldVersion) {
          case 0:
            db.createObjectStore(APP_NAMESPACE_STORE, {
              keyPath: "compositeKey"
            });
        }
      };
    } catch (error) {
      reject(ERROR_FACTORY2.create("storage-open", {
        originalErrorMessage: error === null || error === void 0 ? void 0 : error.message
      }));
    }
  });
}
var Storage = class {
  getLastFetchStatus() {
    return this.get("last_fetch_status");
  }
  setLastFetchStatus(status) {
    return this.set("last_fetch_status", status);
  }
  // This is comparable to a cache entry timestamp. If we need to expire other data, we could
  // consider adding timestamp to all storage records and an optional max age arg to getters.
  getLastSuccessfulFetchTimestampMillis() {
    return this.get("last_successful_fetch_timestamp_millis");
  }
  setLastSuccessfulFetchTimestampMillis(timestamp) {
    return this.set("last_successful_fetch_timestamp_millis", timestamp);
  }
  getLastSuccessfulFetchResponse() {
    return this.get("last_successful_fetch_response");
  }
  setLastSuccessfulFetchResponse(response) {
    return this.set("last_successful_fetch_response", response);
  }
  getActiveConfig() {
    return this.get("active_config");
  }
  setActiveConfig(config) {
    return this.set("active_config", config);
  }
  getActiveConfigEtag() {
    return this.get("active_config_etag");
  }
  setActiveConfigEtag(etag) {
    return this.set("active_config_etag", etag);
  }
  getThrottleMetadata() {
    return this.get("throttle_metadata");
  }
  setThrottleMetadata(metadata) {
    return this.set("throttle_metadata", metadata);
  }
  deleteThrottleMetadata() {
    return this.delete("throttle_metadata");
  }
  getCustomSignals() {
    return this.get("custom_signals");
  }
};
var IndexedDbStorage = class extends Storage {
  /**
   * @param appId enables storage segmentation by app (ID + name).
   * @param appName enables storage segmentation by app (ID + name).
   * @param namespace enables storage segmentation by namespace.
   */
  constructor(appId, appName, namespace, openDbPromise = openDatabase()) {
    super();
    this.appId = appId;
    this.appName = appName;
    this.namespace = namespace;
    this.openDbPromise = openDbPromise;
  }
  setCustomSignals(customSignals) {
    return __async(this, null, function* () {
      const db = yield this.openDbPromise;
      const transaction = db.transaction([APP_NAMESPACE_STORE], "readwrite");
      const storedSignals = yield this.getWithTransaction("custom_signals", transaction);
      const updatedSignals = mergeCustomSignals(customSignals, storedSignals || {});
      yield this.setWithTransaction("custom_signals", updatedSignals, transaction);
      return updatedSignals;
    });
  }
  /**
   * Gets a value from the database using the provided transaction.
   *
   * @param key The key of the value to get.
   * @param transaction The transaction to use for the operation.
   * @returns The value associated with the key, or undefined if no such value exists.
   */
  getWithTransaction(key, transaction) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        const objectStore = transaction.objectStore(APP_NAMESPACE_STORE);
        const compositeKey = this.createCompositeKey(key);
        try {
          const request = objectStore.get(compositeKey);
          request.onerror = (event) => {
            reject(toFirebaseError(
              event,
              "storage-get"
              /* ErrorCode.STORAGE_GET */
            ));
          };
          request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {
              resolve(result.value);
            } else {
              resolve(void 0);
            }
          };
        } catch (e) {
          reject(ERROR_FACTORY2.create("storage-get", {
            originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
          }));
        }
      });
    });
  }
  /**
   * Sets a value in the database using the provided transaction.
   *
   * @param key The key of the value to set.
   * @param value The value to set.
   * @param transaction The transaction to use for the operation.
   * @returns A promise that resolves when the operation is complete.
   */
  setWithTransaction(key, value, transaction) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        const objectStore = transaction.objectStore(APP_NAMESPACE_STORE);
        const compositeKey = this.createCompositeKey(key);
        try {
          const request = objectStore.put({
            compositeKey,
            value
          });
          request.onerror = (event) => {
            reject(toFirebaseError(
              event,
              "storage-set"
              /* ErrorCode.STORAGE_SET */
            ));
          };
          request.onsuccess = () => {
            resolve();
          };
        } catch (e) {
          reject(ERROR_FACTORY2.create("storage-set", {
            originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
          }));
        }
      });
    });
  }
  get(key) {
    return __async(this, null, function* () {
      const db = yield this.openDbPromise;
      const transaction = db.transaction([APP_NAMESPACE_STORE], "readonly");
      return this.getWithTransaction(key, transaction);
    });
  }
  set(key, value) {
    return __async(this, null, function* () {
      const db = yield this.openDbPromise;
      const transaction = db.transaction([APP_NAMESPACE_STORE], "readwrite");
      return this.setWithTransaction(key, value, transaction);
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      const db = yield this.openDbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([APP_NAMESPACE_STORE], "readwrite");
        const objectStore = transaction.objectStore(APP_NAMESPACE_STORE);
        const compositeKey = this.createCompositeKey(key);
        try {
          const request = objectStore.delete(compositeKey);
          request.onerror = (event) => {
            reject(toFirebaseError(
              event,
              "storage-delete"
              /* ErrorCode.STORAGE_DELETE */
            ));
          };
          request.onsuccess = () => {
            resolve();
          };
        } catch (e) {
          reject(ERROR_FACTORY2.create("storage-delete", {
            originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
          }));
        }
      });
    });
  }
  // Facilitates composite key functionality (which is unsupported in IE).
  createCompositeKey(key) {
    return [this.appId, this.appName, this.namespace, key].join();
  }
};
var InMemoryStorage = class extends Storage {
  constructor() {
    super(...arguments);
    this.storage = {};
  }
  get(key) {
    return __async(this, null, function* () {
      return Promise.resolve(this.storage[key]);
    });
  }
  set(key, value) {
    return __async(this, null, function* () {
      this.storage[key] = value;
      return Promise.resolve(void 0);
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      this.storage[key] = void 0;
      return Promise.resolve();
    });
  }
  setCustomSignals(customSignals) {
    return __async(this, null, function* () {
      const storedSignals = this.storage["custom_signals"] || {};
      this.storage["custom_signals"] = mergeCustomSignals(customSignals, storedSignals);
      return Promise.resolve(this.storage["custom_signals"]);
    });
  }
};
function mergeCustomSignals(customSignals, storedSignals) {
  const combinedSignals = Object.assign(Object.assign({}, storedSignals), customSignals);
  const updatedSignals = Object.fromEntries(Object.entries(combinedSignals).filter(([_, v]) => v !== null).map(([k, v]) => {
    if (typeof v === "number") {
      return [k, v.toString()];
    }
    return [k, v];
  }));
  if (Object.keys(updatedSignals).length > RC_CUSTOM_SIGNAL_MAX_ALLOWED_SIGNALS) {
    throw ERROR_FACTORY2.create("custom-signal-max-allowed-signals", {
      maxSignals: RC_CUSTOM_SIGNAL_MAX_ALLOWED_SIGNALS
    });
  }
  return updatedSignals;
}
var StorageCache = class {
  constructor(storage) {
    this.storage = storage;
  }
  /**
   * Memory-only getters
   */
  getLastFetchStatus() {
    return this.lastFetchStatus;
  }
  getLastSuccessfulFetchTimestampMillis() {
    return this.lastSuccessfulFetchTimestampMillis;
  }
  getActiveConfig() {
    return this.activeConfig;
  }
  getCustomSignals() {
    return this.customSignals;
  }
  /**
   * Read-ahead getter
   */
  loadFromStorage() {
    return __async(this, null, function* () {
      const lastFetchStatusPromise = this.storage.getLastFetchStatus();
      const lastSuccessfulFetchTimestampMillisPromise = this.storage.getLastSuccessfulFetchTimestampMillis();
      const activeConfigPromise = this.storage.getActiveConfig();
      const customSignalsPromise = this.storage.getCustomSignals();
      const lastFetchStatus = yield lastFetchStatusPromise;
      if (lastFetchStatus) {
        this.lastFetchStatus = lastFetchStatus;
      }
      const lastSuccessfulFetchTimestampMillis = yield lastSuccessfulFetchTimestampMillisPromise;
      if (lastSuccessfulFetchTimestampMillis) {
        this.lastSuccessfulFetchTimestampMillis = lastSuccessfulFetchTimestampMillis;
      }
      const activeConfig = yield activeConfigPromise;
      if (activeConfig) {
        this.activeConfig = activeConfig;
      }
      const customSignals = yield customSignalsPromise;
      if (customSignals) {
        this.customSignals = customSignals;
      }
    });
  }
  /**
   * Write-through setters
   */
  setLastFetchStatus(status) {
    this.lastFetchStatus = status;
    return this.storage.setLastFetchStatus(status);
  }
  setLastSuccessfulFetchTimestampMillis(timestampMillis) {
    this.lastSuccessfulFetchTimestampMillis = timestampMillis;
    return this.storage.setLastSuccessfulFetchTimestampMillis(timestampMillis);
  }
  setActiveConfig(activeConfig) {
    this.activeConfig = activeConfig;
    return this.storage.setActiveConfig(activeConfig);
  }
  setCustomSignals(customSignals) {
    return __async(this, null, function* () {
      this.customSignals = yield this.storage.setCustomSignals(customSignals);
    });
  }
};
function registerRemoteConfig() {
  _registerComponent(new Component(
    RC_COMPONENT_NAME,
    remoteConfigFactory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name2, version2);
  registerVersion(name2, version2, "esm2017");
  function remoteConfigFactory(container, { options }) {
    const app = container.getProvider("app").getImmediate();
    const installations = container.getProvider("installations-internal").getImmediate();
    const { projectId, apiKey, appId } = app.options;
    if (!projectId) {
      throw ERROR_FACTORY2.create(
        "registration-project-id"
        /* ErrorCode.REGISTRATION_PROJECT_ID */
      );
    }
    if (!apiKey) {
      throw ERROR_FACTORY2.create(
        "registration-api-key"
        /* ErrorCode.REGISTRATION_API_KEY */
      );
    }
    if (!appId) {
      throw ERROR_FACTORY2.create(
        "registration-app-id"
        /* ErrorCode.REGISTRATION_APP_ID */
      );
    }
    const namespace = (options === null || options === void 0 ? void 0 : options.templateId) || "firebase";
    const storage = isIndexedDBAvailable() ? new IndexedDbStorage(appId, app.name, namespace) : new InMemoryStorage();
    const storageCache = new StorageCache(storage);
    const logger = new Logger(name2);
    logger.logLevel = LogLevel.ERROR;
    const restClient = new RestClient(
      installations,
      // Uses the JS SDK version, by which the RC package version can be deduced, if necessary.
      SDK_VERSION,
      namespace,
      projectId,
      apiKey,
      appId
    );
    const retryingClient = new RetryingClient(restClient, storage);
    const cachingClient = new CachingClient(retryingClient, storage, storageCache, logger);
    const remoteConfigInstance = new RemoteConfig(app, cachingClient, storageCache, storage, logger);
    ensureInitialized(remoteConfigInstance);
    return remoteConfigInstance;
  }
}
function fetchAndActivate(remoteConfig) {
  return __async(this, null, function* () {
    remoteConfig = getModularInstance(remoteConfig);
    yield fetchConfig(remoteConfig);
    return activate(remoteConfig);
  });
}
function isSupported() {
  return __async(this, null, function* () {
    if (!isIndexedDBAvailable()) {
      return false;
    }
    try {
      const isDBOpenable = yield validateIndexedDBOpenable();
      return isDBOpenable;
    } catch (error) {
      return false;
    }
  });
}
registerRemoteConfig();

// node_modules/@angular/fire/node_modules/rxfire/remote-config/index.esm.js
function parameter$(_a) {
  var remoteConfig = _a.remoteConfig, key = _a.key, getter = _a.getter;
  return new Observable(function(subscriber) {
    ensureInitialized(remoteConfig).then(function() {
      var boundGetter = getter.bind(remoteConfig);
      subscriber.next(boundGetter(remoteConfig, key));
    });
  });
}
function getValue2(remoteConfig, key) {
  var getter = getValue;
  return parameter$({ remoteConfig, key, getter });
}
function getString2(remoteConfig, key) {
  var getter = getString;
  return parameter$({ remoteConfig, key, getter });
}
function getNumber2(remoteConfig, key) {
  var getter = getNumber;
  return parameter$({ remoteConfig, key, getter });
}
function getBoolean2(remoteConfig, key) {
  var getter = getBoolean;
  return parameter$({ remoteConfig, key, getter });
}
function getAll2(remoteConfig) {
  var getter = getAll;
  return parameter$({ remoteConfig, key: "", getter });
}

// node_modules/@angular/fire/fesm2022/angular-fire-remote-config.mjs
var RemoteConfig2 = class {
  constructor(remoteConfig) {
    return remoteConfig;
  }
};
var REMOTE_CONFIG_PROVIDER_NAME = "remote-config";
var RemoteConfigInstances = class {
  constructor() {
    return ɵgetAllInstancesOf(REMOTE_CONFIG_PROVIDER_NAME);
  }
};
var remoteConfigInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(REMOTE_CONFIG_PROVIDER_NAME))), distinct());
var PROVIDED_REMOTE_CONFIG_INSTANCES = new InjectionToken("angularfire2.remote-config-instances");
function defaultRemoteConfigInstanceFactory(provided, defaultApp, platformId) {
  if (isPlatformServer(platformId)) {
    return null;
  }
  const defaultRemoteConfig = ɵgetDefaultInstanceOf(REMOTE_CONFIG_PROVIDER_NAME, provided, defaultApp);
  return defaultRemoteConfig && new RemoteConfig2(defaultRemoteConfig);
}
function remoteConfigInstanceFactory(fn) {
  return (zone, injector, platformId) => {
    if (isPlatformServer(platformId)) {
      return null;
    }
    const remoteConfig = zone.runOutsideAngular(() => fn(injector));
    return new RemoteConfig2(remoteConfig);
  };
}
var REMOTE_CONFIG_INSTANCES_PROVIDER = {
  provide: RemoteConfigInstances,
  deps: [[new Optional(), PROVIDED_REMOTE_CONFIG_INSTANCES]]
};
var DEFAULT_REMOTE_CONFIG_INSTANCE_PROVIDER = {
  provide: RemoteConfig2,
  useFactory: defaultRemoteConfigInstanceFactory,
  deps: [[new Optional(), PROVIDED_REMOTE_CONFIG_INSTANCES], FirebaseApp, PLATFORM_ID]
};
var RemoteConfigModule = class _RemoteConfigModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "rc");
  }
  static ɵfac = function RemoteConfigModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RemoteConfigModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _RemoteConfigModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_REMOTE_CONFIG_INSTANCE_PROVIDER, REMOTE_CONFIG_INSTANCES_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RemoteConfigModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_REMOTE_CONFIG_INSTANCE_PROVIDER, REMOTE_CONFIG_INSTANCES_PROVIDER]
    }]
  }], () => [], null);
})();
function provideRemoteConfig(fn, ...deps) {
  registerVersion("angularfire", VERSION.full, "rc");
  return makeEnvironmentProviders([DEFAULT_REMOTE_CONFIG_INSTANCE_PROVIDER, REMOTE_CONFIG_INSTANCES_PROVIDER, {
    provide: PROVIDED_REMOTE_CONFIG_INSTANCES,
    useFactory: remoteConfigInstanceFactory(fn),
    multi: true,
    deps: [NgZone, Injector, PLATFORM_ID, ɵAngularFireSchedulers, FirebaseApps, ...deps]
  }]);
}
var getAllChanges = ɵzoneWrap(getAll2, true);
var getBooleanChanges = ɵzoneWrap(getBoolean2, true);
var getNumberChanges = ɵzoneWrap(getNumber2, true);
var getStringChanges = ɵzoneWrap(getString2, true);
var getValueChanges = ɵzoneWrap(getValue2, true);
var activate2 = ɵzoneWrap(activate, true);
var ensureInitialized2 = ɵzoneWrap(ensureInitialized, true);
var fetchAndActivate2 = ɵzoneWrap(fetchAndActivate, true);
var fetchConfig2 = ɵzoneWrap(fetchConfig, true);
var getAll3 = ɵzoneWrap(getAll, true);
var getBoolean3 = ɵzoneWrap(getBoolean, true);
var getNumber3 = ɵzoneWrap(getNumber, true);
var getRemoteConfig2 = ɵzoneWrap(getRemoteConfig, true);
var getString3 = ɵzoneWrap(getString, true);
var getValue3 = ɵzoneWrap(getValue, true);
var isSupported2 = ɵzoneWrap(isSupported, true);
var setCustomSignals2 = ɵzoneWrap(setCustomSignals, true);
var setLogLevel2 = ɵzoneWrap(setLogLevel, true);
export {
  RemoteConfig2 as RemoteConfig,
  RemoteConfigInstances,
  RemoteConfigModule,
  activate2 as activate,
  ensureInitialized2 as ensureInitialized,
  fetchAndActivate2 as fetchAndActivate,
  fetchConfig2 as fetchConfig,
  getAll3 as getAll,
  getAllChanges,
  getBoolean3 as getBoolean,
  getBooleanChanges,
  getNumber3 as getNumber,
  getNumberChanges,
  getRemoteConfig2 as getRemoteConfig,
  getString3 as getString,
  getStringChanges,
  getValue3 as getValue,
  getValueChanges,
  isSupported2 as isSupported,
  provideRemoteConfig,
  remoteConfigInstance$,
  setCustomSignals2 as setCustomSignals,
  setLogLevel2 as setLogLevel
};
//# sourceMappingURL=@angular_fire_remote-config.js.map

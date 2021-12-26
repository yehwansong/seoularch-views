(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const axios = require("axios");

// Helper to deal with pulling an inner object out of returned data
// and then assigning other data as "attrs"
const pullObject = (key) => (object) => {
  let newObj = object[key];
  delete object[key];
  Object.defineProperty(newObj, "attrs", {
    value: object,
  });
  return newObj;
};

// Helper to accept an array or multiple arguments
// and convert to array
const arrayOrList = (list) => {
  if (typeof list[0] === "object" || typeof list[0] === "array") {
    return list[0];
  }
  return list;
};

class Arena {
  constructor(opts) {
    opts = opts || {};
    let headers = {
      "Content-Type": "application/json",
    };
    if (opts.accessToken) {
      headers["Authorization"] = `Bearer ${opts.accessToken}`;
    }
    if (opts.authToken) {
      headers["X-AUTH-TOKEN"] = `${opts.authToken}`;
    }
    this.axios = axios.create({
      baseURL: opts.baseURL || "https://api.are.na/v2/",
      headers,
    });
    this.requestHandler =
      opts.requestHandler ||
      ((method, url, data) => {
        return method === "get"
          ? this.axios
              .request({ method, url, params: data })
              .then(({ data }) => data)
          : this.axios.request({ method, url, data }).then(({ data }) => data);
      });
  }

  _req(method, url, ...data) {
    return this.requestHandler(
      method.toLowerCase(),
      url,
      Object.assign({}, ...data)
    );
  }

  group(slug) {
    slug = slug || "";
    return {
      get: (opts) => this._req("GET", "groups/" + slug, opts),

      channels: (opts) =>
        this._req("GET", "groups/" + slug + "/channels", opts).then(
          pullObject("channels")
        ),
    };
  }

  channel(slug, data) {
    slug = slug || "";
    return {
      get: (opts) => this._req("GET", "channels/" + slug, data, opts),

      thumb: (opts) =>
        this._req("GET", "channels/" + slug + "/thumb", data, opts),

      connections: (opts) =>
        this._req("GET", "channels/" + slug + "/connections", data, opts).then(
          pullObject("channels")
        ),

      channels: (opts) =>
        this._req("GET", "channels/" + slug + "/channels", data, opts).then(
          pullObject("channels")
        ),

      contents: (opts) =>
        this._req("GET", "channels/" + slug + "/contents", data, opts).then(
          pullObject("contents")
        ),

      collaborators: (opts) =>
        this._req(
          "GET",
          "channels/" + slug + "/collaborators",
          data,
          opts
        ).then(pullObject("users")),

      create: (title, status) =>
        this._req("POST", "channels", {
          // Allow it to be called as .channel(title).create(status) or
          // .channel().create(title, status)
          title: slug || title,
          status: slug ? title : status,
        }),

      delete: (deleteSlug) =>
        this._req("DELETE", "channels/" + (slug || deleteSlug)),

      update: (opts) => this._req("PUT", "channels/" + slug, opts),

      addCollaborators: (...ids) =>
        this._req("POST", "channels/" + slug + "/collaborators", {
          "ids[]": arrayOrList(ids),
        }).then(pullObject("users")),

      deleteCollaborators: (...ids) =>
        this._req("DELETE", "channels/" + slug + "/collaborators", {
          "ids[]": arrayOrList(ids),
        }).then(pullObject("users")),

      createBlock: (opts) => {
        if (opts.content.match(/^https?:\/\//)) {
          opts.source = opts.content;
        }
        return this._req("POST", "channels/" + slug + "/blocks", opts);
      },

      deleteBlock: (id) =>
        this._req("DELETE", "channels/" + slug + "/blocks/" + id),
    };
  }

  block(id, data) {
    return {
      get: (opts) => this._req("GET", "blocks/" + id, data, opts),

      channels: (opts) =>
        this._req("GET", "blocks/" + id + "/channels", data, opts).then(
          pullObject("channels")
        ),

      create: (channel, opts) => this.channel(channel).createBlock(opts),

      update: (opts) => this._req("PUT", "blocks/" + id, data, opts),
    };
  }

  user(id, data) {
    return {
      get: (opts) => this._req("GET", "users/" + id, data, opts),

      channels: (opts) =>
        this._req("GET", "users/" + id + "/channels", data, opts).then(
          pullObject("channels")
        ),

      following: (opts) =>
        this._req("GET", "users/" + id + "/following", data, opts).then(
          pullObject("following")
        ),

      followers: (opts) =>
        this._req("GET", "users/" + id + "/followers", data, opts).then(
          pullObject("users")
        ),
    };
  }

  search(q, data) {
    return {
      all: (opts) => this._req("GET", "search", { q }, data, opts),

      users: (opts) =>
        this._req("GET", "search/users", { q }, data, opts).then(
          pullObject("users")
        ),

      channels: (opts) =>
        this._req("GET", "search/channels", { q }, data, opts).then(
          pullObject("channels")
        ),

      blocks: (opts) =>
        this._req("GET", "search/blocks", { q }, data, opts).then(
          pullObject("blocks")
        ),
    };
  }
}

module.exports = Arena;

},{"axios":2}],2:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":4}],3:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../core/createError":10,"./../core/settle":13,"./../helpers/buildURL":17,"./../helpers/cookies":19,"./../helpers/isURLSameOrigin":21,"./../helpers/parseHeaders":23,"./../utils":25}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":5,"./cancel/CancelToken":6,"./cancel/isCancel":7,"./core/Axios":8,"./defaults":15,"./helpers/bind":16,"./helpers/spread":24,"./utils":25}],5:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],6:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":5}],7:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],8:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":15,"./../utils":25,"./InterceptorManager":9,"./dispatchRequest":11}],9:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":25}],10:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":12}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":7,"../defaults":15,"./../helpers/combineURLs":18,"./../helpers/isAbsoluteURL":20,"./../utils":25,"./transformData":14}],12:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],13:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":10}],14:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":25}],15:[function(require,module,exports){
(function (process){(function (){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this)}).call(this,require('_process'))
},{"./adapters/http":3,"./adapters/xhr":3,"./helpers/normalizeHeaderName":22,"./utils":25,"_process":28}],16:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],17:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":25}],18:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],19:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":25}],20:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],21:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":25}],22:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":25}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":25}],24:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],25:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":16,"is-buffer":26}],26:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

},{}],27:[function(require,module,exports){

$(document).ready(function(){

	var db = [
		[12		,1		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.16.2021','','','',''],
		[11		,3		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.17.2021','','','',''],
		[13		,3		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.18.2021','','','',''],
		[13		,5		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.19.2021','','','',''],
		[10.5	,1		, 1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.20.2021','','','',''],
		[11.5	,0		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.21.2021','','','',''],
		[11		,7		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.22.2021','','','',''],
		[12		,7		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.23.2021','','','',''],
		[10		,7		,-2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.24.2021','','','',''],
		[14		,9		,-4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.25.2021','','','',''],
		[11		,9		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.26.2021','','','',''],
		[11		,9		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.27.2021','','','',''],
		[14		,9		, 4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.28.2021','','','',''],
		[10		,12		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.29.2021','','','',''],
		[16		,12		,-4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.30.2021','','','',''],
		[17		,12		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.1.2021 ','','','',''],
		[8		,14		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Oct.2.2021 ','','','',''],
		[7		,15		,-3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Oct.3.2021 ','','','',''],
		[19		,16		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.4.2021 ','','','',''],
		[19		,16		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.5.2021 ','','','',''],
		[19.5	,18		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.6.2021 ','','','',''],
		[18		,18		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.7.2021 ','','','',''],
		[5		,19		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Oct.8.2021 ','','','',''],
		[3		,19		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.9.2021 ','','','',''],
		[12		,17		, 4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Oct.10.2021','','','',''],
		[9		,19		, 3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Oct.11.2021','','','',''],
		[15.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.12.2021','','','',''],
		[14.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.13.2021','','','',''],
		[13.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.14.2021','','','',''],
		[3.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.15.2021','','','',''],
		[4.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.16.2021','','','',''],
		[5.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.17.2021','','','',''],
		[19		,20		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.18.2021','','','',''],
		[19		,20		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.19.2021','','','',''],
		[19.5	,21		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.20.2021','','','',''],
		[18		,21		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.21.2021','','','',''],
		[5		,21		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.22.2021','','','',''],
		[3		,21		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.23.2021','','','',''],
		[14		,21		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.24.2021','','','',''],
		[10		,23		, 3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Oct.25.2021','','','',''],
		[15.5	,23		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.26.2021','','','',''],
		[21.5	,23		, 3,	'e','3','img_l_3','img_r_3','img_f_3','img_b_3','Oct.27.2021','','','',''],
		[13.5	,23		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Oct.28.2021','','','',''],
		[3.5	,23		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Oct.29.2021','','','','']
	]



const Arena = require("are.na");
const arena = new Arena({ accessToken: 'c804ea49d239889ad5fdb98785a500c347e93662dd2c09d9fbf92f8415274e01' });
var img_array = [];
var img_counter = 0
var material_loaded = false
get_elem('seoularch-2021-1-nignz34lk4q')
get_elem('seoularch-2021-2')
function get_elem(chan){
	arena
		.channel(chan)
		.get({per: 500 })
			.then(sub_chan => {
			sub_chan.contents.map(item => {
				for (var k = db.length - 1; k >= 0; k--) {
					var val_0 = item.title.split('.')[0]
					var val_1 = val_0.split('_')[1]+'_'+val_0.split('_')[2]+'_'+val_0.split('_')[3]
					if(db[k][9].toLowerCase().replaceAll(".", "_").replaceAll(" ", "") === val_1){
						img_counter++
						if(val_0.split('_')[0] === 'topview'){db[k][10] = item.image.thumb.url}
						if(val_0.split('_')[0] === 'sideview1'){db[k][11] = item.image.thumb.url}
						if(val_0.split('_')[0] === 'sideview2'){db[k][12] = item.image.thumb.url}
						if(val_0.split('_')[0] === 'sideview3'){db[k][13] = item.image.thumb.url}
						if(img_counter== db.length*4){
							console.log(db)
							create_tex()
							render_setting()
							ground()
							create_list()
							create_tag()
						}
					}
				}
			});

		})
}



	var w = window.innerWidth;
	var h = window.innerHeight;
	var renderer, scene, camera, camera_pivot, light;
	var textureLoader = new THREE.TextureLoader();
	var mainpivot = new THREE.Group()
	var light_group = new THREE.Group()
	var ground
	var post_array = Array()
	var unit = 5
	var post_height = 20
	var counter = 0
	var tex_array = Array(5)
	var mousedown = false;
	var h = window.innerHeight
	var w = window.innerWidth
	var prev_hovered,whole_mouse_x
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	var mousedown_timeout


	function map_range(value, low1, high1, low2, high2) {
	    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}
	const geometry = new THREE.BoxGeometry( 1, 1, 10 );
	const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	const cube = new THREE.Mesh( geometry, material );
	cube.castShadow = true
	cube.position.x = -10
	// scene.add( cube );

function easeOutCubic(x){
	return 1 - Math.pow(1 - x, 3);
}
function easeInQuart(x) {
return x * x * x * x;
}
	function for_rec(counter){
		// counter = 0
				// camera.fov = 2
				// camera.updateProjectionMatrix();
		if(counter%4000 <= 1000){
			if (counter%4000 < 50){
				$('.cat').css({'opacity':1})
			}else{
				$('.cat').css({'opacity':0})
			}
			if (counter%4000 < 500){
				camera.position.z = map_range(counter%4000, 0, 500, 120,  400)
				camera.fov = map_range(easeOutCubic(counter%4000/500)*500, 0, 500, 45 , 2)
				camera.updateProjectionMatrix();
			}else{
				camera.position.z = map_range(counter%4000, 500, 1000, 400,  990)
			}
		}else if (counter%4000>3000){
			if (counter%4000 < 3050){
				$('.cat').css({'opacity':1})
			}else{
				$('.cat').css({'opacity':0})
			}
			if (counter%4000 < 3500){
				camera.position.z = map_range(counter%4000, 3000, 3500,  990, 400)
			}else{
				camera.position.z = map_range(counter%4000, 3500, 4000,  400, 120)
				camera.fov = map_range(easeInQuart((counter%4000-3500)/500)*500+3500, 3500, 4000, 2 , 45)
				camera.updateProjectionMatrix();
			}
		}else{
			camera.fov = 2
			camera.position.z = 990
		}
		mainpivot.rotation.z = degrees_to_radians(map_range(counter, 0, 1000,  0, 360))
		camera_pivot.rotation.x = degrees_to_radians(map_range(Math.abs((counter+1000)%2000-1000), 0, 1000,  0, 90))
		camera_pivot.position.z = map_range(Math.abs((counter+1000)%2000-1000), 0, 1000,  0, post_height/2)
		// camera.position.z = map_range(Math.abs((counter+1000)%2000-1000), 0, 1000,  100, 80)
		var loop = Math.abs((counter+1000)%2000-1000)
		if((loop < 1100) && (loop > 900)){
			for (var i = post_array.length - 1; i >= 0; i--) {
				var x= toScreenPosition(post_array[i].children[3]).x
				var y= toScreenPosition(post_array[i].children[3]).y
				$('.tag_elem_'+i).css({'left':Math.floor(x/100)*100+'px'})
				$('.tag_elem_'+i).css({'top':Math.floor(y/25)*25+'px'})
			}
		}else{
			for (var i = post_array.length - 1; i >= 0; i--) {
				$('.tag_elem_'+i).css({'left':toScreenPosition(post_array[i].children[3]).x+'px'})
				$('.tag_elem_'+i).css({'top':toScreenPosition(post_array[i].children[3]).y+'px'})
			}

		}

		for (var i = post_array.length - 1; i >= 0; i--) {
			post_array[i].position.z = 0
		}
		// if((counter%20) == 0){
		// 	animate_for_rec(Math.floor(counter/20),0)
		// }
	}

	// function animate_for_rec(index,sub_counter){
	// 	sub_counter = 200
	// 	post_array[index].position.z = map_range(sub_counter, 0, 200,  -1*post_height+0.1, 0)

		
	// 	setTimeout(function(){
	// 		if(sub_counter<200){
	// 					animate_for_rec(index,sub_counter+1)
	// 				}
	// 	},1)
	// }
	function toScreenPosition(obj)
	{	
		var vector = new THREE.Vector3();
		var canvas = renderer.domElement
	    vector.setFromMatrixPosition(obj.matrixWorld);

		// map to normalized device coordinate (NDC) space
		vector.project( camera );

		// map to 2D screen space
		vector.x = Math.round( (   vector.x + 1 ) * canvas.width  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * canvas.height / 2 );

	    return { 
	        x: vector.x,
	        y: vector.y
	    };

	};
	function render_setting(){
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 5000);
		// camera.lookAt(0, 0, 0);
		camera_pivot = new THREE.Group()
		// camera_pivot.position.y = post_height/2
		camera.position.z = 120
		camera_pivot.add(camera)

		scene = new THREE.Scene();
		scene.add(mainpivot)
		scene.add(camera_pivot)

  		const color = 0x000000;  // white
  		const near = 150;
  		const far = 200;


                    light = new THREE.DirectionalLight( 0xffffff );
                    light.lookAt( 0,0,0 );
					light.position.z = 50
					light.position.x = 50
					light.position.y = 20
                    light.castShadow = true;
                    light.shadow.camera.left = -50;
                    light.shadow.camera.right = 50;
                    light.shadow.camera.top = 50;
                    light.shadow.camera.bottom = -50;
                    light.shadow.radius = 0.25
                    camera_pivot.add(light)
                    // light.shadow.mapSize.width = 512; // default
                    // light.shadow.mapSize.height = 512; // default
                    light.shadow.camera.near = 0.1; // default
                    light.shadow.camera.far = 5000; // default
                    light.shadow.camera.fov = 45;
                    scene.add( light_group );
  		// scene.fog = new THREE.Fog(color, near, far);
  

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		document.body.appendChild(renderer.domElement);

		render()

	}
		window.addEventListener( 'mousemove', onMouseMove, false );
		function onMouseMove( event ) {
			whole_mouse_x = event.clientX
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}
		$('canvas').mousedown(function() {
			mousedown = true
		});
		$('canvas').mouseup(function() {
			mousedown = false
		});

	function render(){
				window.requestAnimationFrame(render)
		if(material_loaded){
				counter++
				// counter = counter+4
				// camera_pivot.rotation.z = degrees_to_radians(counter/10)
				renderer.render(scene, camera);
		
				raycaster.setFromCamera( mouse, camera );
				// if(whole_mouse_x > h*0.5 ){
					for (var j = post_array.length - 1; j >= 0; j--) {
						const intersects = raycaster.intersectObjects(post_array[j].children)
							post_array[ j ].children[0].material.color.set( 0xffffff );
							post_array[ j ].children[1].material.color.set( 0xffffff );
							post_array[ j ].children[2].material.color.set( 0xffffff );
							post_array[ j ].children[3].material.color.set( 0xffffff );
							if(mousedown){
								post_array[j].position.z = -1*post_height+0.1
								mousedown_timeout = setTimeout(function(){
									for (var k = post_array.length - 1; k >= 0; k--) {
										post_array[ k ].position.z =  0
									}
								},1000)
							}
						for ( let i = 0; i < intersects.length; i ++ ) {
							if(prev_hovered !== j){
								$('.list_hovered').removeClass('list_hovered')
							}
							prev_hovered = j
							$('.list_wrapper').find('.list').eq(j).addClass('list_hovered')
							post_array[ j ].children[0].material.color.set( 0xff865c );
							post_array[ j ].children[1].material.color.set( 0xff865c );
							post_array[ j ].children[2].material.color.set( 0xff865c );
							post_array[ j ].children[3].material.color.set( 0xff865c );
							if(mousedown){
								intersects[ i ].object.parent.position.z =  0
							}
						}
					}
				// };
				if(post_array.length == db.length){
						for_rec(counter)
					}
				}
	}
	$('.list').click(function(){
		var selected = parseInt($(this).attr('class').split('list_')[1])
		for (var j = post_array.length - 1; j >= 0; j--) {
			post_array[j].position.z = -1*post_height+0.1
		}
		post_array[selected].position.z =0
	})
	$('.list').hover(function(){
		var selected = parseInt($(this).attr('class').split('list_')[1])
		for (var j = post_array.length - 1; j >= 0; j--) {
			post_array[ j ].children[0].material.color.set( 0xffffff );
			post_array[ j ].children[1].material.color.set( 0xffffff );
			post_array[ j ].children[2].material.color.set( 0xffffff );
			post_array[ j ].children[3].material.color.set( 0xffffff );
		}
		post_array[selected].children[0].material.color.set( 0xff0000 );
		post_array[selected].children[1].material.color.set( 0xff0000 );
		post_array[selected].children[2].material.color.set( 0xff0000 );
		post_array[selected].children[3].material.color.set( 0xff0000 );
	})
	function ground(){
		var ground_geom = new THREE.PlaneGeometry(1050,1041, 1, 1 );
		var ground_texture = textureLoader.load( 'img/grid-01-01.png' );
			ground_texture.wrapS = ground_texture.wrapT = THREE.RepeatWrapping;
			ground_texture.repeat.set(10, 10);
		var ground_mat = new THREE.MeshBasicMaterial({color:0xffffff, map: ground_texture, side: THREE.DoubleSide});
		ground = new THREE.Mesh(ground_geom, ground_mat);
		// e refers emitter
		// c refers collector
		mainpivot.add(ground)
		// top,left,right,front,bottom
                // shadow_ground                
                var planeGeometry = new THREE.PlaneGeometry(1050,1041, 1, 1 );
                var planeMaterial = new THREE.ShadowMaterial({color: 0xaec1e2, transparent:true, opacity: 1, side: THREE.DoubleSide});
                var plane = new THREE.Mesh( planeGeometry, planeMaterial );
                plane.position.z = 1
                plane.receiveShadow = true;
                mainpivot.add( plane );
                // light                


		for (var i = db.length - 1; i >= 0; i--) {
			post(db[i][0] , db[i][1] , db[i][2] , db[i][3] , db[i][4] , db[i][5] , db[i][6] , db[i][7] , db[i][8])
		}




	}
	function post(posx,posz,scale,category,top,left,right,front,bottom){
		var array = Array(5)
		post_array.push(new THREE.Group())

		mainpivot.add(post_array[post_array.length-1])

		post_side(post_array.length-1,category,top,left,right,front,bottom)
		// move_post(post_array.length-1,posx,posz)

		mainpivot.add(post_array[post_array.length-1])
		var static_side_texture_1 = textureLoader.load( 'img/side-01.png' );
		static_side_texture_1.repeat.set(1, 1);

	}
	function create_list(){
		for (var i = db.length - 1; i >= 0; i--) {
			$('.list_wrapper').append(
				'<div class="list list_'+i+'">\
					<div class="list_elem category">'+db[i][4]+'</div>\
					<div class="list_elem top" style="background-image:url(img/'+db[i][5]+'.png)">&nbsp;</div>\
					<div class="list_elem left" style="background-image:url(img/'+db[i][6]+'.png)">&nbsp;</div>\
					<div class="list_elem right" style="background-image:url(img/'+db[i][7]+'.png)">&nbsp;</div>\
					<div class="list_elem front" style="background-image:url(img/'+db[i][8]+'.png)">&nbsp;</div>\
					<div class="list_elem bottom" style="background-image:url(img/'+db[i][9]+'.png)">&nbsp;</div>\
				<div>'
				
			)
		}
	}
	function replaceAll(str, find, replace) {
	  return str.replace(new RegExp(find, 'g'), replace);
	}
	function create_tag(){
		for (var i = db.length - 1; i >= 0; i--) {
			$('.tag_wrapper').append(
					'<div class="tag_elem tag_elem_'+i+'">'+db[i][9]+'</div>'
			)
		}
	}
	function create_tex(){
		tex_array[0] = Array(5)
		tex_array[0][0] = textureLoader.load( 'vid/img_1.png' );
		tex_array[0][0].needsUpdate = true;

		tex_array[0][1] = textureLoader.load( 'vid/img_2.png' );
		tex_array[0][1].needsUpdate = true;

		tex_array[0][2] = textureLoader.load( 'vid/img_3.png' );
		tex_array[0][2].needsUpdate = true;

		tex_array[0][3] = textureLoader.load( 'vid/img_4.png' );
		tex_array[0][3].needsUpdate = true;

		tex_array[0][4] = textureLoader.load( 'vid/img_5.png' );
		tex_array[0][4].needsUpdate = true;
		// left

		// tex_array[0] =
		for (var i = tex_array.length - 1; i >= 0; i--) {
			tex_array[i] = Array(5)
			// console.log(i)
		// left
			tex_array[i][0] = textureLoader.load( 'img/img_l_'+i+'.png' );
			tex_array[i][0].repeat.set(1, post_height/unit);

		// right
			tex_array[i][1] = textureLoader.load( 'img/img_r_'+i+'.png' );
			tex_array[i][1].repeat.set(1, post_height/unit);

		// front
			tex_array[i][2] = textureLoader.load( 'img/img_f_'+i+'.png' );
			tex_array[i][2].repeat.set(1, post_height/unit);
		// top
			tex_array[i][3] = textureLoader.load( 'img/img_t_'+i+'.png' );
			tex_array[i][3].repeat.set(0.2,0.23);
			tex_array[i][3].offset.x = 0.5;
		// bot
			tex_array[i][4] = textureLoader.load( 'img/img_b_'+i+'.png' );
			tex_array[i][4].repeat.set(0.2,0.2);
		}
	}
	function post_side(array_index,category,top,left,right,front,bottom){

		var vid_array = [37,43,36,43,36,25,39,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,39,24,42,38,40,35,41,26,9]

  var xhr = new XMLHttpRequest();
  xhr.open('GET', db[array_index][11]);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
		    texture = new THREE.Texture(reader.result);
		    texture.needsUpdate = true;
			var material1 = new THREE.MeshBasicMaterial({color:0xffffff, map: texture, side: THREE.DoubleSide});
				material1.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
				material1.map.offset.set((1/25*(db[array_index][1]-Math.abs(db[array_index][2]/2)))-3/25, 0);
				material1.map.needsUpdate = true;
			var final_mesh = new THREE.Mesh(geometry,material1)
				final_mesh.rotation.x = degrees_to_radians(90)
				final_mesh.rotation.y = degrees_to_radians(120)
				final_mesh.position.x =  unit/4
				final_mesh.position.y =  1.73*unit/4
				final_mesh.position.z =  post_height/2
	            final_mesh.castShadow = true;
			post_array[array_index].add(final_mesh)
			if(array_index == db.length-1 && post_array[array_index].children.length == 4){material_loaded = true; console.log('===========')}
			console.log(array_index)
			console.log(db.length-1)
			console.log(post_array[array_index].children.length)
    }
    reader.readAsDataURL(xhr.response);
  };


		// var texture;
		// var imageElement = new Image();
		// imageElement.src = db[array_index][11];
		// imageElement.crossOrigin = '';
		// imageElement.onload = function(e) {
		//     texture = new THREE.Texture(reader.result);
		//     texture.needsUpdate = true;
		// 	var material1 = new THREE.MeshBasicMaterial({color:0xffffff, map: texture, side: THREE.DoubleSide});
		// 		material1.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
		// 		material1.map.offset.set((1/25*(db[array_index][1]-Math.abs(db[array_index][2]/2)))-3/25, 0);
		// 		material1.map.needsUpdate = true;
		// 	var final_mesh = new THREE.Mesh(geometry,material1)
		// 		final_mesh.rotation.x = degrees_to_radians(90)
		// 		final_mesh.rotation.y = degrees_to_radians(120)
		// 		final_mesh.position.x =  unit/4
		// 		final_mesh.position.y =  1.73*unit/4
		// 		final_mesh.position.z =  post_height/2
	 //            final_mesh.castShadow = true;
		// 	post_array[array_index].add(final_mesh)
		// 	if(array_index == db.length-1 && post_array[array_index].children.length == 4){material_loaded = true; console.log('===========')}
		// 	console.log(array_index)
		// 	console.log(db.length-1)
		// 	console.log(post_array[array_index].children.length)
		// };

  var xhr = new XMLHttpRequest();
  xhr.open('GET', db[array_index][12]);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
		    texture = new THREE.Texture(reader.result);
		    texture.needsUpdate = true;
			var material2 = new THREE.MeshBasicMaterial({color:0xffffff, map: texture, side: THREE.DoubleSide});
				material2.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
				material2.map.offset.set((1/25*(db[array_index][1]-Math.abs(db[array_index][2]/2)))-3/25, 0);
				material2.map.needsUpdate = true;
			var final_mesh = new THREE.Mesh(geometry,material2)
				final_mesh.rotation.x = degrees_to_radians(90)
				final_mesh.rotation.y = degrees_to_radians(-120)
				final_mesh.position.x =  -1*unit/4
				final_mesh.position.y =  1.73*unit/4
				final_mesh.position.z =  post_height/2
	            final_mesh.castShadow = true;
			post_array[array_index].add(final_mesh)
			if(array_index == db.length-1 && post_array[array_index].children.length == 4){material_loaded = true; console.log('===========')}
			console.log(array_index)
			console.log(db.length-1)
			console.log(post_array[array_index].children.length)
		};
    reader.readAsDataURL(xhr.response);
  };

  var xhr = new XMLHttpRequest();
  xhr.open('GET', db[array_index][13]);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
		    texture = new THREE.Texture(reader.result);
		    texture.needsUpdate = true;
			var material3 = new THREE.MeshBasicMaterial({color:0xffffff, map: texture, side: THREE.DoubleSide});
				material3.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
				material3.map.offset.set((1/25*(db[array_index][0]-Math.abs(db[array_index][2]/2)))-3/25, 0);
				material3.map.needsUpdate = true;
			var final_mesh = new THREE.Mesh(geometry,material3)
				final_mesh.rotation.x = degrees_to_radians(90)
				final_mesh.rotation.y = degrees_to_radians(0)
				final_mesh.position.z =  post_height/2
	            final_mesh.castShadow = true;
			post_array[array_index].add(final_mesh)
			if(array_index == db.length-1 && post_array[array_index].children.length == 4){material_loaded = true; console.log('===========')}
			console.log(array_index)
			console.log(db.length-1)
			console.log(post_array[array_index].children.length)
		};
    reader.readAsDataURL(xhr.response);
  };

  var xhr = new XMLHttpRequest();
  xhr.open('GET', db[array_index][10]);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
		    texture = new THREE.Texture(reader.result);
		    texture.needsUpdate = true;
			var material4 = new THREE.MeshBasicMaterial({color:0xffffff, map: texture, side: THREE.DoubleSide});
				material4.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1/25*Math.abs(db[array_index][2]));
				material4.map.offset.set(1/25*(db[array_index][0]-Math.abs(db[array_index][2]/2)), 1-1/25*(db[array_index][1]));
				material4.map.wrapS = material4.map.wrapT = THREE.RepeatWrapping;
				material4.map.needsUpdate = true;
			const shape4 = new THREE.Shape();
			const x4 = 0, y4 = 0;
			shape4.moveTo(x4 - unit/2, y4 + 0);
			shape4.lineTo(x4 + 0, y4 + 1.73*unit/2);
			shape4.lineTo(x4 + unit/2, y4 + 0);
			const TriangleGeometry4 = new THREE.ShapeBufferGeometry(shape4);
			var final_mesh = new THREE.Mesh(TriangleGeometry4, material4);
				final_mesh.position.z =  post_height
	            final_mesh.castShadow = true;
			post_array[array_index].add(final_mesh);
			if(array_index == db.length-1 && post_array[array_index].children.length == 4){material_loaded = true; console.log('===========')}
			console.log(array_index)
			console.log(db.length-1)
			console.log(post_array[array_index].children.length)
		};
    reader.readAsDataURL(xhr.response);
  };
		post_array[array_index].castShadow = true

		post_array[array_index].scale.set(db[array_index][2],db[array_index][2],1)

		post_array[array_index].position.x = -12*(unit)+((db[array_index][1]%2)*(1.73*1/4*unit))+(db[array_index][0]*unit)
		post_array[array_index].position.y = 14*(1.73*1/2*unit)-(db[array_index][1]*(1.73*1/2*unit))
		post_array[array_index].position.z = -1*post_height+0.1
	// }else{
	// 	// console.log(tex_array[parseInt(db[array_index][4])][0])
	// 	// console.log(tex_array)
	// 	// left
	// 	var material1 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][0], side: THREE.DoubleSide});

	// 	// right
	// 	var material2 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][1], side: THREE.DoubleSide});

	// 	// front
	// 	var material3 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][2], side: THREE.DoubleSide});
		
	// 	//top
	// 	var material4 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][3], side: THREE.DoubleSide});

	// 	//bottom
	// 	var material5 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][4], side: THREE.DoubleSide});


	// }



// geom & mesh

	}


// category 1,2
// timeline 1-22
// image-file-name




























	function degrees_to_radians(degrees){
	  var pi = Math.PI;
	  return degrees * (pi/180);
	}
})
},{"are.na":1}],28:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[27]);

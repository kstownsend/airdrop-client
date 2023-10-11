import appBundles from "../app-bundles";

function setCache(key, value) {
  window.localStorage.setItem(
    key,
    JSON.stringify({
      t: new Date().toISOString(),
      value,
    })
  );
}

function getFromCache(key, maxAge = 0) {
  const item = window.localStorage.getItem(key);
  if (!item) {
    return undefined;
  }
  const parsed = JSON.parse(item);
  if (maxAge > 0) {
    const age = new Date().getTime() - new Date(parsed.t).getTime();
    if (age > maxAge) {
      window.localStorage.removeItem(key);
      return undefined;
    }
  }
  return parsed.value;
}

class Store extends EventTarget {
  constructor({ bundles = [] }) {
    super();
    this.state = {};
    this.initFns = [];
    bundles.forEach((bundle) => this.loadBundle(bundle));
    this.init();
  }

  loadBundleState(bundle) {
    const fromCache = getFromCache(bundle.name, bundle.maxAge);
    if (fromCache) {
      this.state[bundle.name] = Object.assign({}, bundle.state, fromCache);
    } else {
      this.state[bundle.name] = bundle.state;
    }
  }

  loadBundleGetters(bundle) {
    Object.keys(bundle).forEach((key) => {
      if (
        key === "name" ||
        key === "state" ||
        key === "persist" ||
        key === "maxAge" ||
        key === "init"
      ) {
        return;
      }

      if (key.indexOf("get") === 0) {
        this[key] = function () {
          return bundle[key](this.state);
        };
      }
    });
  }

  loadBundleSetters(bundle) {
    Object.keys(bundle).forEach((key) => {
      if (
        key === "name" ||
        key === "state" ||
        key === "persist" ||
        key === "maxAge" ||
        key === "init"
      ) {
        return;
      }

      if (key.indexOf("get") !== 0) {
        this[key] = function (...args) {
          const newState = bundle[key].apply(null, [this, ...args]);
          Promise.resolve(newState).then((value) => {
            this.state[bundle.name] = Object.assign(
              {},
              this.state[bundle.name],
              value
            );

            this.fire(new CustomEvent("statechange", { detail: this.state }));

            if (bundle.persist) {
              setCache(bundle.name, this.state[bundle.name]);
            }

            if (value._event) {
              if (value._event_detail) {
                this.fire(
                  new CustomEvent(value._event, { detail: value._event_detail })
                );
              } else {
                this.fire(new Event(value._event));
              }
            }
          });
        };
      }
    });
  }

  loadInitFunctions(bundle) {
    if (bundle.init && typeof bundle.init === "function") {
      this.initFns.push(bundle.init);
    }
  }

  init() {
    console.log("init");
    this.initFns.forEach((fn) => fn(this));
  }

  loadBundle(bundle) {
    console.log("loading bundle", bundle.name);
    this.loadBundleState(bundle);
    this.loadBundleGetters(bundle);
    this.loadBundleSetters(bundle);
    this.loadInitFunctions(bundle);
  }

  fire(e) {
    this.dispatchEvent(e);
  }

  on(eventName, callback) {
    this.addEventListener(eventName, callback);
  }
}

function createStore() {
  const bundles = [...appBundles];

  const store = new Store({ bundles });

  return store;
}

export { createStore };

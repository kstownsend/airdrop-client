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
    this.persist = [];
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

  setState(bundleName) {
    return (newState) => {
      this.state[bundleName] = Object.assign(
        {},
        this.state[bundleName],
        newState
      );
      this.fire(new CustomEvent("statechange", { detail: this.state }));
      if (this.persist.includes(bundleName)) {
        console.log("should persist", bundleName);
        setCache(bundleName, this.state[bundleName]);
      }
    };
  }

  fireEvent(eventName, detail) {
    this.fire(new CustomEvent(eventName, { detail }));
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
          const fn = bundle[key](...args);
          if (typeof fn === "function") {
            fn.apply(null, [
              {
                store: this,
                set: this.setState.bind(this).apply(null, [bundle.name]),
                fire: this.fireEvent.bind(this),
              },
            ]);
            return;
          }
        };
      }
    });
  }

  loadInitFunctions(bundle) {
    if (bundle.init && typeof bundle.init === "function") {
      this.initFns.push(bundle.init);
    }
  }

  loadBundlePersists(bundle) {
    if (bundle.persist) {
      this.persist.push(bundle.name);
    }
  }

  init() {
    console.log("init");
    this.initFns.forEach((fn) => fn({ store: this }));
  }

  loadBundle(bundle) {
    console.log("loading bundle", bundle.name);
    this.loadBundleState(bundle);
    this.loadBundlePersists(bundle);
    this.loadBundleGetters(bundle);
    this.loadBundleSetters(bundle);
    this.loadInitFunctions(bundle);
  }

  fire(e) {
    console.log(e);
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

import { createStore } from "../store";
import { useState, useEffect } from "react";

function getterNameToStateName(name) {
  let newName = name.replace("get", "");
  return newName[0].toLowerCase() + newName.slice(1);
}

const store = createStore();
window.store = store;

export default function useStore(...args) {
  const [state, setState] = useState(store.state);

  console.log("useStore.js: useStore() args", state);

  useEffect(
    () => {
      console.log("useStore.js: useEffect()");
      const listener = (e) => {
        console.log(
          "useStore.js: useEffect() listener()",
          e.detail,
          state === e.detail
        );
        setState({ ...e.detail });
      };
      store.addEventListener("statechange", listener);
      return () => {
        store.removeEventListener("statechange", listener);
      };
    } /* eslint-disable-next-line react-hooks/exhaustive-deps */,
    []
  );

  const out = {};

  args.forEach((arg) => {
    if (store[arg] === undefined) {
      throw new Error(`store.${arg} is undefined`);
    }
    if (typeof store[arg] === "function") {
      if (arg.indexOf("get") === 0) {
        out[getterNameToStateName(arg)] = store[arg](state);
      } else {
        out[arg] = (...args) => store[arg](...args);
      }
    } else {
      throw new Error(`store.${arg} is not a function`);
    }
  });

  return out;
}

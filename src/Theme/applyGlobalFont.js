// ──────────────────────────────────────────────────────────────
// applyGlobalFont — installs the Baloo 2 font app-wide WITHOUT
// editing every StyleSheet.
//
// It wraps the render of <Text> and <TextInput> so each element gets
// a `fontFamily` chosen from its own `fontWeight` (via weightToFamily).
// An explicitly-set fontFamily on the element ALWAYS wins (it is placed
// after the injected default), so Urdu/Arabic overrides keep working.
//
// Call once, after fonts have finished loading.
// ──────────────────────────────────────────────────────────────
import { Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';
import { weightToFamily } from './fonts';

let installed = false;

const wrap = (Component) => {
  const originalRender = Component.render;
  if (typeof originalRender !== 'function') return;

  Component.render = function render(...args) {
    const element = originalRender.apply(this, args);
    if (!element) return element;

    const flat = StyleSheet.flatten(element.props.style) || {};
    const injected = { fontFamily: weightToFamily(flat.fontWeight) };

    return React.cloneElement(element, {
      // Injected default first → the element's own style (incl. an
      // explicit fontFamily for Urdu/Arabic) overrides it.
      style: [injected, element.props.style],
    });
  };
};

export const applyGlobalFont = () => {
  if (installed) return;
  installed = true;
  wrap(Text);
  wrap(TextInput);
};

export default applyGlobalFont;

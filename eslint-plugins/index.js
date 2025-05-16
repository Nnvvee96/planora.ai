/**
 * @fileoverview ESLint plugin for enforcing Planora architectural boundaries
 * @author Planora Team
 */

"use strict";

module.exports = {
  rules: {
    "enforce-architecture": require("./rules/enforce-architecture")
  },
  configs: {
    recommended: {
      plugins: ["eslint-plugins"],
      rules: {
        "eslint-plugins/enforce-architecture": "error"
      }
    }
  }
};

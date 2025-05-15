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
      plugins: ["planora-architecture"],
      rules: {
        "planora-architecture/enforce-architecture": "error"
      }
    }
  }
};

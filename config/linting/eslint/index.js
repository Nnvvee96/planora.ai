/**
 * @fileoverview ESLint plugin for enforcing Planora architectural boundaries
 * @author Planora Team
 */

// Import rules
import enforceArchitecture from "./rules/enforce-architecture.js";

// Export the plugin
const planoraPlugin = {
  rules: {
    "enforce-architecture": enforceArchitecture
  },
  configs: {
    recommended: {
      plugins: ["planora"],
      rules: {
        "planora/enforce-architecture": "error"
      }
    }
  }
};

export default planoraPlugin;

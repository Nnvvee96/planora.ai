/**
 * ESLint configuration setup file for local plugins
 * This file helps register the local custom plugins with ESLint
 */

// Register the planora-architecture custom plugin
const planoraArchitecturePlugin = require('./eslint-plugins');

module.exports = {
  // Export the plugin for ESLint to find
  plugins: {
    'planora-architecture': planoraArchitecturePlugin
  }
};

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const characterRoot = path.resolve(monorepoRoot, "../radio-character");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo + the external radio-character package
config.watchFolders = [monorepoRoot, characterRoot];

// Let Metro resolve packages from the monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Map the portal dependency to its actual location
config.resolver.extraNodeModules = {
  "@radio-lingo/character": characterRoot,
};

module.exports = config;

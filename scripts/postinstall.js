const fs = require('fs');
const path = require('path');

console.log('[postinstall] Running post-install setup...');

const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@babel',
  'plugin-transform-block-scoped-functions'
);

const libDir = path.join(pluginPath, 'lib');
const indexJs = path.join(libDir, 'index.js');

const shimContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (api) {
  api.assertVersion(7);
  return { name: "transform-block-scoped-functions", visitor: {} };
};
`;

try {
  if (!fs.existsSync(pluginPath)) {
    console.log('[postinstall] @babel/plugin-transform-block-scoped-functions not found, skipping');
    process.exit(0);
  }

  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    console.log('[postinstall] Created lib directory');
  }

  if (!fs.existsSync(indexJs)) {
    fs.writeFileSync(indexJs, shimContent, 'utf8');
    console.log('[postinstall] Created babel shim: lib/index.js');
  } else {
    console.log('[postinstall] babel shim already exists, skipping');
  }

  console.log('[postinstall] Setup complete ✅');
} catch (e) {
  console.error('[postinstall] Failed:', e.message);
  process.exit(0);
}

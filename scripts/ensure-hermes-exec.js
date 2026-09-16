const fs = require('fs');
const path = require('path');

const hermesPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'sdks',
  'hermesc',
  'linux64-bin',
  'hermesc'
);

try {
  if (fs.existsSync(hermesPath)) {
    fs.chmodSync(hermesPath, 0o755);
  }
} catch (error) {
  console.warn(`Unable to set executable bit on Hermes compiler: ${error.message}`);
}
// persistence.js
const storage = require('node-persist');

async function init() {
  if (!storage.defaultInstance) {
    await storage.init({ dir: 'persist', logging: false });
  }
}

async function saveShutdown(ts) {
  await init();
  await storage.setItem('lastShutdown', ts);
}

async function readShutdown() {
  await init();
  return (await storage.getItem('lastShutdown')) || 0;
}

async function saveStatus(data) {
  await init();
  await storage.setItem('status', data);
}

async function readStatus() {
  await init();
  return (await storage.getItem('status')) || null;
}

module.exports = {
  saveShutdown,
  readShutdown,
  saveStatus,
  readStatus
};
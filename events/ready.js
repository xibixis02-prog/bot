// events/ready.js
const { restoreStatus } = require('../logger.js');
module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('Bot pronto.');
    await restoreStatus(client);
  }
};
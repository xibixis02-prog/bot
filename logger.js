// logger.js
const { buildStartupEmbed } = require('./helpers/sendStartupEmbed.js');
const { setActivity }       = require('./statusHandler.js');
const { readStatus }        = require('./persistence.js');

async function sendStartupLog(client) {
  const channel = await client.channels.fetch('1401835015939031066').catch(() => null);
  if (!channel) return;
  const embed = await buildStartupEmbed(client);
  await channel.send({ embeds: [embed] });
}

async function restoreStatus(client) {
  const saved = await readStatus();
  if (!saved) return;
  // Reaplica o status salvo (pode ser permanente ou agendado)
  await setActivity(client, saved);
}

module.exports = {
  sendStartupLog,
  restoreStatus
};
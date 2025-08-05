// statusHandler.js
const schedule = require('node-schedule');
const { saveStatus } = require('./persistence.js');

// Define ou agenda a activity no client
async function setActivity(client, opts) {
  // opts = { tipo, mensagem, agendar, start, end }
  const { tipo, mensagem, agendar, start, end } = opts;
  // Mapear tipo para ActivityType
  const typeMap = {
    Playing: 0,
    Streaming: 1,
    Listening: 2,
    Watching: 3,
    Competing: 5,
    Custom: 4
  };
  // Cancela jobs prévios
  Object.values(schedule.scheduledJobs).forEach(job => job.cancel());
  // Função que aplica
  const apply = () => client.user.setActivity(mensagem, { type: typeMap[tipo] });
  if (agendar === 'sim' && start && end) {
    // agenda início
    const [sh, sm] = start.split(':').map(n=>+n);
    const [eh, em] = end.split(':').map(n=>+n);
    schedule.scheduleJob({ hour: sh, minute: sm }, apply);
    // agenda fim (remove activity)
    schedule.scheduleJob({ hour: eh, minute: em }, () => client.user.setActivity(null));
  } else {
    apply();
  }
  // persiste
  await saveStatus(opts);
}

module.exports = { setActivity };
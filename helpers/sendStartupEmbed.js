const { EmbedBuilder } = require('discord.js');
const axios            = require('axios');
const os               = require('os');
const { readShutdown } = require('../persistence.js');

const COLOR = 0x6a52ff;
const pad   = n => n.toString().padStart(2, '0');

const fmtUTC = d =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const fmtLocal = d => {
  const mon = [
    'jan.','fev.','mar.','abr.','mai.','jun.',
    'jul.','ago.','set.','out.','nov.','dez.'
  ][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()}, ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function geoText() {
  try {
    const { data } = await axios.get('http://ip-api.com/json/?lang=pt_br');
    if (data.status === 'success')
      return `${data.city}, ${data.regionName}, ${data.country} - ${data.timezone}`;
  } catch {}
  return 'Indisponível';
}

function fmtUptime(sec) {
  if (!sec) return '0 segundos';
  const d = Math.floor(sec / 86400);
  const h = Math.floor(sec % 86400 / 3600);
  const m = Math.floor(sec % 3600  / 60);
  const s = sec % 60;
  const p = [];
  if (d) p.push(`${d} dia${d > 1 ? 's' : ''}`);
  if (h) p.push(`${h} hora${h > 1 ? 's' : ''}`);
  if (m) p.push(`${m} minuto${m > 1 ? 's' : ''}`);
  if (s) p.push(`${s} segundo${s > 1 ? 's' : ''}`);
  return p.join(', ');
}

module.exports.buildStartupEmbed = async client => {
  const last = await readShutdown();
  const now  = new Date();

  const cpu = `${os.cpus()[0].model.replace(/\(R\)|Intel\s|CPU.*$/g, '').trim()} - ${os.cpus().length} núcleos`;
  const lastText = last
    ? `\`${new Date(last).toLocaleTimeString('pt-BR')}\``
    : 'Indisponível';

  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('🚀 Bot Iniciado')
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '⏰ Horário no Servidor',  value: fmtLocal(now),     inline: false },
      { name: '🕒 Horário UTC',          value: fmtUTC(now),       inline: false },
      { name: '🌐 Localização',          value: await geoText(),   inline: false },
      { name: '💻 Plataforma',           value: 'Windows',         inline: true  },
      { name: '🖥️ CPU',                 value: cpu,               inline: true  },
      { name: '⏱️ Último desligamento',  value: lastText,          inline: false }
    )
    .setFooter({
      text: `Hoje às ${now.toLocaleTimeString('pt-BR')}`,
      iconURL: client.user.displayAvatarURL({ dynamic: true })
    });
};
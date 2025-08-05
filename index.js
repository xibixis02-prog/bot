require('dotenv').config({ quiet: true });
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const { sendStartupLog } = require('./logger.js');
const { saveShutdown }   = require('./persistence.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

let uptimeSec = 0;
setInterval(() => uptimeSec++, 1000);

// Salva timestamp no desligamento (Ctrl+C e afins)
['exit','SIGINT','SIGTERM','SIGBREAK'].forEach(sig =>
  process.on(sig, async () => {
    await saveShutdown(Date.now());
    if (sig !== 'exit') process.exit(0);
  })
);

// Carrega comandos
fs.readdirSync(path.join(__dirname,'commands')).forEach(category => {
  fs.readdirSync(path.join(__dirname,'commands',category))
    .filter(f => f.endsWith('.js'))
    .forEach(file => {
      const cmd = require(`./commands/${category}/${file}`);
      client.commands.set(cmd.data.name, cmd);
    });
});

// Carrega eventos
fs.readdirSync(path.join(__dirname,'events'))
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const evt = require(`./events/${file}`);
    client.on(evt.name, (...args) => evt.execute(...args, client));
  });

client.once('ready', async () => {
  const rest = new REST({ version:'10' }).setToken(process.env.TOKEN);
  const body = [...client.commands.values()].map(c => c.data.toJSON());
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });

  await sendStartupLog(client);
  console.log('Bot pronto.');
});

client.login(process.env.TOKEN);
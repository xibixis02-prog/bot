// commands/general/ping.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Exibe métricas de latência do bot'),

  async execute(interaction) {
    // Resposta inicial
    await interaction.reply('🏓 Calculando latência...');
    const sent = await interaction.fetchReply();

    // Métricas de latência
    const apiLat  = Math.max(0, interaction.client.ws.ping);
    const respLat = sent.createdTimestamp - interaction.createdTimestamp;

    // Dados de usuário e guilda
    const userTag   = interaction.user.tag;
    const userIcon  = interaction.user.displayAvatarURL({ dynamic: true });
    const guildIcon = interaction.guild.iconURL({ dynamic: true, size: 512 });

    // Embed final
    const embed = new EmbedBuilder()
      .setColor('#df5454')
      .setTitle('🚀 Latência Atualizada')
      .addFields(
        { name: '🛰️ Latência da API',      value: `${apiLat} ms`,  inline: true },
        { name: '⏱️ Latência de Resposta', value: `${respLat} ms`, inline: true }
      )
      .setImage(guildIcon)
      .setFooter({ text: `Solicitado por ${userTag}`, iconURL: userIcon })
      .setTimestamp();

    // Edita a mensagem para exibir o embed
    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setActivity } = require('../../statusHandler.js');

const ALLOWED_USERS = new Set([
  '1212873186559922188',
  '864308040084750346'
]);

const STATUS_COLOR = 0xdf5454; // cor em hexadecimal

const ACTIVITY_TYPES = ['Playing','Streaming','Listening','Watching','Competing','Custom'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstatus')
    .setDescription('Define o status do bot (restrito a administradores)')
    .addStringOption(opt =>
      opt.setName('tipo')
        .setDescription('Tipo de atividade')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(opt =>
      opt.setName('mensagem')
        .setDescription('Mensagem do status')
        .setRequired(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'tipo') {
      await interaction.respond(
        ACTIVITY_TYPES
          .filter(t => t.toLowerCase().startsWith(focused.value.toLowerCase()))
          .map(t => ({ name: t, value: t }))
          .slice(0, 5)
      );
    }
  },

  async execute(interaction) {
    if (!ALLOWED_USERS.has(interaction.user.id)) {
      return interaction.reply({ content: '🚫 Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const tipo = interaction.options.getString('tipo');
    const mensagem = interaction.options.getString('mensagem');

    try {
      // Define o status permanente (agendar retirado)
      await setActivity(interaction.client, { tipo, mensagem, agendar: 'não' });

      const embed = new EmbedBuilder()
        .setColor(STATUS_COLOR)
        .setTitle('✅ Status Atualizado')
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '🔖 Tipo', value: tipo, inline: true },
          { name: '💬 Mensagem', value: mensagem, inline: true }
        )
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      const errEmbed = new EmbedBuilder()
        .setColor(STATUS_COLOR)
        .setTitle('❌ Falha ao Atualizar Status')
        .setDescription('Ocorreu um erro ao definir o status. Tente novamente mais tarde.')
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  }
};
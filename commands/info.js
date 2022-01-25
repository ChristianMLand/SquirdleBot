const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Displays stats and information about the requested Pokemon')
        .addStringOption(option => {
            return option.setName('pokemon')
                .setDescription('The requested Pokemon')
                .setRequired(true)
        }),
    async execute(interaction) {
        const opt = interaction.options.data[0].value
        const matches = interaction.client.allPokemon.filter(p => p.name === opt);
        if (matches.length) {
            const infoPoke = matches[0];
            interaction.reply({
                embeds: [{
                    "type": "rich",
                    "title": opt,
                    "description": `**Dex Number:** ${infoPoke.id}\n\n**Generation:** ${infoPoke.gen}\n\n**Types:** ${infoPoke.types[0]} / ${infoPoke.types[1] || 'None'}\n\n**Height:** ${infoPoke.height} m\n\n**Weight:** ${infoPoke.weight} kg\n\n`,
                    "color": 0x09a210,
                    "image": {
                        "url": infoPoke.front_sprite,
                    }
                }]
            });
        } else {
            interaction.reply({
                content: 'Invalid Pokemon'
            });
        }
    }
};
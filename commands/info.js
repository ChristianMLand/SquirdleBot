const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadAllPokemon, getPokemon } = require('../models/pokemon');

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
        const allPokemon = await loadAllPokemon();
        const opt = interaction.options.data[0].value
        const matches = allPokemon.filter(p => p.name === opt);
        if (matches.length) {
            const infoPoke = await getPokemon(matches[0].id);
            interaction.reply({
                embeds: [{
                    "type": "rich",
                    "title": opt,
                    "description": `**Generation:** ${infoPoke.gen}\n\n**Types:** ${infoPoke.types[0]} / ${infoPoke.types[1] || 'None'}\n\n**Height:** ${infoPoke.height / 10} m\n\n**Weight:** ${infoPoke.weight / 10} kg\n\n`,
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
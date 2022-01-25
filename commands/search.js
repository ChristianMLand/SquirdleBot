const { SlashCommandBuilder } = require('@discordjs/builders');
const { types, generations } = require('../models/pokemon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Displays a list of all Pokemon that match the given parameters')
        .addIntegerOption(option => {
            return option.setName('gen')
                .setDescription('The generation the Pokemon was first introduced')
                .setRequired(false)
                .addChoices(generations.map((_, i) => [`${i+1}`, i+1]))
        })
        .addStringOption(option => {
            return option.setName('type1')
                .setDescription('The primary type of a Pokemon')
                .setRequired(false)
                .addChoices(types.map(t => [t, t]))
        })
        .addStringOption(option => {
            return option.setName('type2')
                .setDescription('The secondary type of a Pokemon')
                .setRequired(false)
                .addChoices(types.map(t => [t, t]))
        })
        .addNumberOption(option => {
            return option.setName('height')
                .setDescription('The weight of a Pokemon in meters')
                .setRequired(false)
        })
        .addNumberOption(option => {
            return option.setName('weight')
                .setDescription('The weight of a Pokemon in kg')
                .setRequired(false)
        }),
    async execute(interaction) {
        const matches = interaction.client.allPokemon.filter(p => {
            for(const opt of interaction.options.data) {
                if (opt.name.startsWith('type')) {
                    let typeIdx = parseInt(opt.name[opt.name.length-1]) - 1
                    if (p.types[typeIdx] !== opt.value) {
                        return false
                    }
                } else if (p[opt.name] !== opt.value) {
                    return false
                }
            }
            return true
        });
        if (matches.length) {
            interaction.reply({
                embeds: [{
                    "type": "rich",
                    "title": `Matches for: ${interaction.options.data.map(o => o.name+'='+o.value).join(', ')}`,
                    "description": `${matches.map(p => p.name).join('\n')}`,
                    "color": 0x09a210,
                }]
            });
        } else {
            interaction.reply({
                content: 'No matches!'
            });
        }
    }
};
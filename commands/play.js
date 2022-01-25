const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPokemon, comparePokemon, loadAllPokemon, generations } = require('../models/pokemon');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Starts a new game of Squirdle')
        .addIntegerOption(opt => 
            opt
                .setName('generation')
                .setRequired(false)
                .setDescription('Limits the game to a given generation')
                .addChoices(
                    generations.map((_, i) => [`${i}`, i])
                )
        ),
    async execute(interaction) {
        let min,max;
        const fixedGen = interaction.options.data.length >= 1
        if (fixedGen) {
            [min,max] = generations[interaction.options.data[0].value - 1];
        } else {
            [min,max] = [1,898];
        }
        const randPoke = await getPokemon(Math.floor(Math.random() * (max - min + 1)) + min);
        const allPokemon = await loadAllPokemon();
        console.log(randPoke)
        await interaction.reply({
            content: "Guess the Pokemon I'm thinking of!",
        });
        const reply = await interaction.fetchReply();
        const thread = await reply.startThread({
            name: 'Squirdle',
            autoArchiveDuration: 60,
            reason: 'Thread for playing the Squirdle game'
        });
        await thread.setLocked(true);
        while (true) {
            const filter = m => m.author.id !== reply.author.id;
            const messages = await thread.awaitMessages({ filter, max: 1, time: 600_000, errors: ['time'] })
                .catch(console.error);
            if (messages) {
                const msg = messages.first();
                const matches = allPokemon.filter(p => p.name === msg.content);
                if (matches.length) {
                    const guessPoke = await getPokemon(matches[0].id);
                    const matchup = comparePokemon(guessPoke, randPoke, useId=fixedGen);
                    const matchupEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Matchup')
                        .setDescription(`${matchup.gen} ${matchup.type1} ${matchup.type2} ${matchup.height} ${matchup.weight}`)
                    await msg.reply({
                        embeds: [matchupEmbed]
                    });
                    if (Object.values(matchup).every(v => v === '🟩')) {
                        await thread.send('You got it right!');
                        break;
                    }
                } else {
                    await msg.reply({
                        content: 'Invalid Pokemon!'
                    })
                }
            } else {
                await thread.send('Game timed out!');
                break;
            }
        }
        await interaction.editReply(`The Pokemon was: ${randPoke.name}`)
        await thread.delete();
    }
};
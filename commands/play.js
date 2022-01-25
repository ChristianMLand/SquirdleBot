const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPokemon, comparePokemon, generations } = require('../models/pokemon');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Starts a new game of Squirdle')
        .addIntegerOption(opt => 
            opt
                .setName('genstart')
                .setRequired(false)
                .setDescription('Starting generation for the game to pick from')
                .addChoices(generations.map((_, i) => [`${i}`, i]))
        )
        .addIntegerOption(opt => 
            opt
                .setName('genstop')
                .setRequired(false)
                .setDescription('End generation for the game to pick from')
                .addChoices(generations.map((_, i) => [`${i}`, i]))
        ),
    async execute(interaction) {
        /******* Pick Random Pokemon **********/
        let [startGen, endGen] = [1,8]
        if (interaction.options.data[0]) {
            startGen = interaction.options.data[0].value
            endGen = startGen
        }
        if (interaction.options.data[1]) {
            endGen = interaction.options.data[1].value
        }
        const min = generations[startGen - 1][0];
        const max = generations[endGen - 1][1];
        const randPoke = await getPokemon(Math.floor(Math.random() * (max - min + 1)) + min);
        console.log(randPoke);
        /************* Setup thread channel for game ******************/
        await interaction.reply({
            content: "Guess the Pokemon I'm thinking of!",
        });
        const reply = await interaction.fetchReply();
        const thread = await reply.startThread({
            name: 'Squirdle',
            autoArchiveDuration: 60,
            reason: 'Thread for playing the Squirdle game'
        });
        /***************** Game loop ******************/
        let msg;
        while (true) {
            const messages = await thread.awaitMessages({ 
                    filter: m => m.author.id !== reply.author.id, 
                    max: 1, 
                    time: 600_000, 
                    errors: ['time'] 
                })
                .catch(console.error);
            if (messages) {
                msg = messages.first();
                const allPokemon = interaction.client.allPokemon.filter(p => min <= p.id && p.id <= max)
                const matches = allPokemon.filter(p => p.name === msg.content);
                if (matches.length) {
                    const guessPoke = await getPokemon(matches[0].id);
                    const matchup = comparePokemon(guessPoke, randPoke, useId=(startGen.value == endGen.value));
                    const matchupEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Matchup')
                        .setDescription(`${matchup.gen} ${matchup.type1} ${matchup.type2} ${matchup.height} ${matchup.weight}`);
                    await msg.reply({
                        embeds: [matchupEmbed]
                    });
                    if (Object.values(matchup).every(v => v === '🟩')) {
                        await interaction.editReply(`${msg.author} won! The Pokemon was: ${randPoke.name}`)
                        break;
                    }
                } else {
                    await msg.reply({
                        content: 'Invalid Pokemon!'
                    });
                }
            } else {
                await interaction.editReply(`Game timed out! The Pokemon was: ${randPoke.name}`)
                break;
            }
        }
        /******* clean up thread *********/
        await thread.delete();
    }
};
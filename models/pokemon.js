const axios = require('axios').default;

const generations = [
    [1,151],// gen 1
    [152,251],//gen 2
    [252,386],//gen 3
    [387,493],// gen 4
    [494,649],//gen 5
    [650,721],//gen 6
    [722,809],//gen 7
    [810,898]// gen 8
]

class Pokemon {
    constructor(id,name,types,height,weight,front_sprite) {
        this.id = id
        this.name = name
        this.types = types
        this.height = height
        this.weight = weight
        this.front_sprite = front_sprite
    }

    get gen() {
        for(let i = 0; i < generations.length; i++) {
            let [min, max] = generations[i]
            if (min <= this.id && this.id <= max) {
                return i+1
            }
        }
        return -1
    }
}

const comparisons = {
    'greater' : '🔼',
    'less' : '🔽',
    'correct' : '🟩',
    'incorrect' : '🟥',
    'wrong_position' : '🟨'
}


module.exports = {
    generations,
    getPokemon : async filter => {
        const query = `https://pokeapi.co/api/v2/pokemon/${filter}`;
        const data = await axios.get(query)
            .catch(console.error);
        if (data.status === 200) {
            return new Pokemon(
                data.data.id,
                data.data.name,
                data.data.types.map(type => type.type.name),
                data.data.height,
                data.data.weight,
                data.data.sprites.front_default
            );
        }
    }, 
    comparePokemon : (pokeA, pokeB, useId=false) => {
        matchup = {}
        if (useId) {
            if (pokeA.id > pokeB.id) {
                matchup.gen = comparisons['less']
            } else if (pokeA.id < pokeB.id) {
                matchup.gen = comparisons['greater']
            } else {
                matchup.gen = comparisons['correct']
            }
        } else {
            if (pokeA.gen > pokeB.gen) {
                matchup.gen = comparisons['less']
            } else if (pokeA.gen < pokeB.gen) {
                matchup.gen = comparisons['greater']
            } else {
                matchup.gen = comparisons['correct']
            }
        }

        for (let i = 0; i < 2; i++) {
            if (pokeA.types[i] === pokeB.types[i]) {
                matchup[`type${i+1}`] = comparisons['correct']
            } else if (pokeB.types.includes(pokeA.types[i])) {
                matchup[`type${i+1}`] = comparisons['wrong_position']
            } else {
                matchup[`type${i+1}`] = comparisons['incorrect']
            }
        }

        if (pokeA.height > pokeB.height) {
            matchup.height = comparisons['less']
        } else if (pokeA.height < pokeB.height) {
            matchup.height = comparisons['greater']
        } else {
            matchup.height = comparisons['correct']
        }

        if (pokeA.weight > pokeB.weight) {
            matchup.weight = comparisons['less']
        } else if (pokeA.weight < pokeB.weight) {
            matchup.weight = comparisons['greater']
        } else {
            matchup.weight = comparisons['correct']
        }
        return matchup;
    },
    async loadAllPokemon() {
        const blacklist = [385,412,486,491,549,554,640,641,644,646,647,677,680,709,710,740,744,745,773,777,848,874,875,887,888,891]
        const allPokemon = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=898');
        return allPokemon.data.results
            .map((poke, i) => {
                if (!blacklist.includes(i)) {
                    return {name: poke.name, id: i+1}
                } else {
                    return {name: poke.name.split('-')[0], id: i+1}
                }
            });
    }
}
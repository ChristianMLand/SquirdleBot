const axios = require('axios').default;

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
        if (1 <= this.id && this.id <= 151) {
            return 1
        } else if (152 <= this.id && this.id <= 251) {
            return 2
        } else if (252 <= this.id && this.id <= 386) {
            return 3
        } else if (387 <= this.id && this.id <= 493) {
            return 4
        } else if (494 <= this.id && this.id <= 649) {
            return 5
        } else if (650 <= this.id && this.id <= 721) {
            return 6
        } else if (722 <= this.id && this.id <= 809) {
            return 7
        } else if (810 <= this.id && this.id <= 898) {
            return 8
        } else {
            return -1
        }
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
    comparePokemon : (pokeA, pokeB) => {
        matchup = {}
        if (pokeA.gen > pokeB.gen) {
            matchup.gen = comparisons['less']
        } else if (pokeA.gen < pokeB.gen) {
            matchup.gen = comparisons['greater']
        } else {
            matchup.gen = comparisons['correct']
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
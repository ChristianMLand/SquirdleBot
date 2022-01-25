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

const types = [
    'fire',
    'water',
    'grass',
    'bug',
    'flying',
    'normal',
    'electric',
    'rock',
    'ground',
    'steel',
    'dark',
    'ghost',
    'fairy',
    'ice',
    'fighting',
    'dragon',
    'psychic',
    'poison',
]

const blacklist = [385,412,486,491,549,554,640,641,644,646,647,677,680,709,710,740,744,745,773,777,848,874,875,887,888,891];

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
};

function compareSize(a, b) {
    if (a > b) {
        return comparisons['less']
    } else if (a < b) {
        return comparisons['greater']
    } else {
        return comparisons['correct']
    }
}

function compareOrder(a, b, i) {
    if (a[i] === b[i]) {
        return comparisons['correct']
    } else if (b.includes(a[i])) {
        return comparisons['wrong_position']
    } else {
        return comparisons['incorrect']
    }
}

module.exports = {
    generations,
    types,
    getPokemon : async filter => {
        const query = `https://pokeapi.co/api/v2/pokemon/${filter}`;
        const data = await axios.get(query)
            .catch(console.error);
        if (data.status === 200) {
            return new Pokemon(
                data.data.id,
                data.data.name,
                data.data.types.map(type => type.type.name),
                data.data.height / 10,
                data.data.weight / 10,
                data.data.sprites.front_default
            );
        }
    }, 
    comparePokemon : (pokeA, pokeB, useId=false) => {
        matchup = {}
        for (let i = 0; i < 2; i++) {
            matchup[`type${i+1}`] = compareOrder(pokeA.types, pokeB.types, i);
        }
        matchup.gen = useId ? compareSize(pokeA.id, pokeB.id) : compareSize(pokeA.gen, pokeB.gen);
        matchup.height = compareSize(pokeA.height, pokeB.height);
        matchup.weight = compareSize(pokeA.weight, pokeB.weight);
        return matchup;
    },
    async loadAllPokemon(min=1, max=898) {
        const allPokemon = [];
        for (let i = min; i <= max; i++) {
            const poke_data = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);
            allPokemon.push(new Pokemon(
                poke_data.data.id,
                blacklist.includes(i-1) ? poke_data.data.name.split('-')[0] : poke_data.data.name,
                poke_data.data.types.map(t => t.type.name),
                poke_data.data.height / 10,
                poke_data.data.weight / 10,
                poke_data.data.sprites.front_default
            ));
        }
        return allPokemon
    }
}
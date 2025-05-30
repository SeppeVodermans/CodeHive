import { ObjectId } from "mongodb";
import "express-session";
import { Pokemon } from "./trainer";

declare module "express-session" {
    interface SessionData {
        trainer?: {
            _id: string | ObjectId,
            name: string,
            gender: "male" | "female",
            team: ObjectId[],
            pokemonIds: ObjectId[],
            caughtPokemons: caughtPokemon[],
        }
    }
}

export interface Pokemons {
    _id?: ObjectId;
    id: number;
    name: string;
    height: number;
    weight: number;
    image: string;
    generation: number;
    cries: string;
    types: string[];
    base_experience: number;
    base_stats: {
        hp: number;
        attack: number;
        defense: number;
        special_attack: number;
        special_defense: number;
        speed: number;
    };
    abilities: string[];
    sprites: {
        front_default: string;
        back_default: string;
        front_shiny: string;
        back_shiny: string;
    };
    species_url: string;
}


export interface Trainer {
    _id?: ObjectId;
    id: string | ObjectId,
    name: string,
    gender: "male" | "female",
    team: ObjectId[],
    pokemons: ObjectId[],
    caughtPokemons: caughtPokemon[]
}

export interface TrainerPokemons {
    id: ObjectId,
    name: string,
    stats: Stats,
    type: string
}

export interface Stats {
    wins: number,
    draws: number,
    losses: number
}

export interface PokeBall {
    rare: number,
    normal: number,
    epic: number
}

export type Rarity = "normal" | "rare" | "epic";

export interface PokemonSpecies {
    evolves_from_species: null | { name: string };
}

export interface caughtPokemon extends Pokemons {
    nickName: string
}

export interface EvolutionChainLink {
    species: { name: string };
    evolves_to: EvolutionChainLink[];
}

export interface PokemonQuizdata {
    name: string,
    silhouetteImage: string,
    fullImage: string

}

type userRole = "ADMIN" | "USER";

export interface User {
    email: string,
    password: string,
    role?: userRole

}
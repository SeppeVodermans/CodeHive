import { ObjectId } from "mongodb";

export interface Stats {
    wins: number;
    losses: number;
    draws: number;
  }
  
  export interface Pokemon {
    _id?: ObjectId;
    name: string;
    geslacht: string;
    stats: Stats;
    type: string[];
    /*foto: string;*/
  }
  
  export interface Trainer {
    _id?: ObjectId;
    name: string;
    geslacht: string;
    pokemons: ObjectId[]; // References to Pokemon _id
    team: ObjectId[]; // References to Pokemon _id

  }
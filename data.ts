import express, { Express, Request, Response } from "express";
import { PokeBall, Rarity } from "./Pokemon/types";

export async function catchPokemon(pokeballs: PokeBall) {
    await delay(3000);


    const catchChances: Record<Rarity, number> = {
        normal: 0.7,
        rare: 0.4,
        epic: 0.1,
    };


    const results: Record<Rarity, string[]> = {
        normal: [],
        rare: [],
        epic: [],
    };

    for (const rarity of Object.keys(pokeballs) as Rarity[]) {
        const attempts = pokeballs[rarity];
        for (let i = 0; i < attempts; i++) {
            const success = Math.random() < catchChances[rarity];
            results[rarity].push(success ? "Caught" : "Missed");
        }
    }

    return results;
}


function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function reload() {

}
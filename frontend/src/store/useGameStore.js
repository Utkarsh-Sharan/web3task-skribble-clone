import {create} from "zustand";

export const useGameStore = create((set, get) => ({
    currentDrawer: null,
    gameState: "waiting",
    wordChoices: [],

    setCurrentDrawer: (data) => {
        set({currentDrawer: data});
    },

    setGameState: (data) => {
        set({gameState: data});
    },

    setWordChoices: (data) => {
        set({wordChoices: data});
    },
}));
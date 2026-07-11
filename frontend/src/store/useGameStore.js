import {create} from "zustand";

export const useGameStore = create((set, get) => ({
    currentDrawer: null,

    setCurrentDrawer: (data) => {
        set({currentDrawer: data});
    },
}));
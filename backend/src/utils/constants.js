export const rooms = new Map();
export const WORD_LIST = [
  "apple", "bicycle", "castle", "dragon", "elephant", 
  "forest", "guitar", "helicopter", "island", "jungle", 
  "kangaroo", "lighthouse", "mountain", "ninja", "ocean", 
  "penguin", "quantum", "robot", "spaceship", "tornado", 
  "unicorn", "vampire", "wizard", "xylophone", "yacht", "zebra"
];

export const getRandomWords = (count) => {
    const shuffled = [...WORD_LIST];

    for(let i = WORD_LIST.length - 1; i >= 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
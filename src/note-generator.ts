export const Layouts: any = {
    "CtoB": [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ],

    "AtoG": [
        "A",
        "A#",
        "B",
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
    ]
};

export interface Note {
    name: string;
    octave: number;
}

export function* noteGenerator(layout: string[]): IterableIterator<Note> {
    let octave = 0;
    let first = true;
    while (true) {
        for (let i = 0; i < layout.length; i++) {
            const note = layout[i];
            if (note === "C" && !first) {
                octave = octave + 1
            }
            yield {name: note, octave: octave};
            first = false;
        }
    }
}
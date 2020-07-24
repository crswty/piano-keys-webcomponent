const Notes = [
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
];

export interface Note {
    name: string;
    octave: number;
}

export function* noteGenerator(startNote: string): IterableIterator<Note> {

    const pivot = Notes.indexOf(startNote);
    const layout = [...Notes.slice(pivot, Notes.length), ...Notes.slice(0, pivot)];

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
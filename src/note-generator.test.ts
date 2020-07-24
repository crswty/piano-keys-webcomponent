import "@testing-library/jest-dom";
import {noteGenerator} from "./note-generator";

function getN(generator: any, n: number): any {
    return new Array(n).fill({}).map(() => generator.next().value);
}

describe("NoteGenerator", () => {

    it("gets notes from CtoB", () => {
        const generator = noteGenerator("C");

        const notes = getN(generator, 13);
        expect(notes).toEqual([
            {name: "C", octave: 0},
            {name: "C#", octave: 0},
            {name: "D", octave: 0},
            {name: "D#", octave: 0},
            {name: "E", octave: 0},
            {name: "F", octave: 0},
            {name: "F#", octave: 0},
            {name: "G", octave: 0},
            {name: "G#", octave: 0},
            {name: "A", octave: 0},
            {name: "A#", octave: 0},
            {name: "B", octave: 0},
            {name: "C", octave: 1},
        ]);
    });

    it("gets notes from AtoG", () => {
        const generator = noteGenerator("A");

        const notes = getN(generator, 12);
        expect(notes).toEqual([
            {name: "A", octave: 0},
            {name: "A#", octave: 0},
            {name: "B", octave: 0},
            {name: "C", octave: 1},
            {name: "C#", octave: 1},
            {name: "D", octave: 1},
            {name: "D#", octave: 1},
            {name: "E", octave: 1},
            {name: "F", octave: 1},
            {name: "F#", octave: 1},
            {name: "G", octave: 1},
            {name: "G#", octave: 1}
        ]);
    });

    it("gets notes from G# to A", () => {
        const generator = noteGenerator("G#");

        const notes = getN(generator, 12);
        expect(notes).toEqual([
            {name: "G#", octave: 0},
            {name: "A", octave: 0},
            {name: "A#", octave: 0},
            {name: "B", octave: 0},
            {name: "C", octave: 1},
            {name: "C#", octave: 1},
            {name: "D", octave: 1},
            {name: "D#", octave: 1},
            {name: "E", octave: 1},
            {name: "F", octave: 1},
            {name: "F#", octave: 1},
            {name: "G", octave: 1},
        ]);
    });


});
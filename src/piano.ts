import {Layouts, Note, noteGenerator} from "./note-generator";

const KeyWidth = 10;
const SharpWidth = 6;

function sharpKey(note: string, octave: string, offset: number) {
    return `<rect
            class="sharp-note note"
            data-note="${note}"
            data-octave="${octave}"
            x=${offset}
            y=1
            stroke="#555555"
            fill="#555555"
            width=${SharpWidth}
            height=30></rect>`;
}

function normalKey(note: string, octave: string, offset: number) {
    return `<rect
            class="natural-note note"
            data-note="${note}"
            data-octave="${octave}"
            x=${offset}
            y=1
            stroke="#555555"
            fill="white"
            width=${KeyWidth}
            height=50></rect>`;
}

export interface PianoElement extends HTMLElement {

    setNoteDown(note: string, octave: number): void;

    setNoteUp(note: string, octave: number): void;
}

interface PianoAttributes {
    keycount: number;
    layout: string;
    readOnly: boolean;
}

export class Piano extends HTMLElement implements PianoElement {
    private config!: PianoAttributes;

    static get observedAttributes() {
        return ["key-count", "keyboard-layout", "read-only"]
    }

    constructor() {
        super();
    }

    readAttributes(): PianoAttributes {
        return {
            keycount: parseInt(this.getAttribute("key-count") || "88"),
            layout: this.getAttribute("keyboard-layout") || "AtoG",
            readOnly: this.hasAttribute("read-only"),
        };
    }

    connectedCallback() {

        this.addEventListener('mousedown', (event) => {
            this.handleClick(event, true);
            event.preventDefault();
        });
        this.addEventListener('mouseup', (event) => {
            this.handleClick(event, false);
            event.preventDefault();
        });

        this.config = this.readAttributes();
        this.innerHTML = `<style>${this.getCss()}</style><div>${this.getNoteSvg()}</div>`;
    }

    attributeChangedCallback() {
        this.config = this.readAttributes();
        this.innerHTML = `<style>${this.getCss()}</style><div>${this.getNoteSvg()}</div>`;
    }

    handleClick(event: any, down: boolean) {
        const readOnly = this.config.readOnly;
        if (readOnly) {
            return;
        }

        const target = event.target;
        if (target.tagName === "rect") {
            const note = event.target.getAttribute("data-note");
            const octave = event.target.getAttribute("data-octave");


            if (down) {
                this.dispatchEvent(new CustomEvent('note-down', {detail: {note, octave}}));
                this.setNoteDown(note, octave);
            } else {
                this.dispatchEvent(new CustomEvent('note-up', {detail: {note, octave}}));
                this.setNoteUp(note, octave);
            }
        }
    }


    setNoteDown(note: string, octave: number) {
        const elem = this.querySelector(keySelector(note, octave))!;
        const color = note.includes("#") ? "grey" : "grey";
        elem.setAttribute("fill", color);
        elem.setAttribute("transform", "scale(1 0.95)");
    }

    setNoteUp(note: string, octave: number) {
        const elem = this.querySelector(keySelector(note, octave))!;
        const color = note.includes("#") ? "#555555" : "white";
        elem.setAttribute("fill", color);
        elem.setAttribute("transform", "scale(1 1)");
    }

    getNoteSvg() {
        const noteCount = this.config.keycount;

        const generator = noteGenerator(Layouts[this.config.layout]);
        const notes = new Array(noteCount).fill(1).map(() => generator.next().value);

        const whiteKeys = notes
            .filter((note) => !note.name.includes("#"))
            .length;

        const totalWidth = (whiteKeys * KeyWidth) + (SharpWidth);
        return `<svg viewBox="0 0 ${totalWidth} 52" version="1.1" xmlns="http://www.w3.org/2000/svg">
            ${this.getKeysForNotes(notes)}
        </svg>`;
    }


    getKeysForNotes(notes: Note[]) {
        let totalOffset = -KeyWidth + 1;
        type NotePosition = { note: string; octave: string; offset: number };

        const offsets = notes.map((note: any) => {

            const isSharp = note.name.includes("#");

            let thisOffset = 0;
            if (isSharp) {
                thisOffset = totalOffset + 7;
            } else {
                totalOffset = totalOffset + KeyWidth;
                thisOffset = totalOffset;
            }

            return {
                note: note.name,
                octave: note.octave,
                offset: thisOffset
            } as NotePosition;
        });

        const normalKeys = offsets.filter(({note}: NotePosition) => !note.includes("#"))
            .map(({note, octave, offset}: NotePosition) => normalKey(note, octave, offset));

        const sharpKeys = offsets.filter(({note}: NotePosition) => note.includes("#"))
            .map(({note, octave, offset}: NotePosition) => sharpKey(note, octave, offset));

        return `<g>
            ${normalKeys}
            ${sharpKeys}
        </g>`
    }

    getCss() {
        return `
        `
    }
}

const keySelector = (note: string, octave: number) => `[data-note="${note}"][data-octave="${octave}"]`;

customElements.define("piano-keys", Piano);

import {Note, noteGenerator} from "./note-generator";

const NaturalWidth = 10;
const SharpWidth = 6;

function sharpKey(note: string, octave: number, offset: number) {
    return `<rect class="sharp-note note" data-note="${note}" data-octave="${octave}" x=${offset} y=1></rect>`;
}

function naturalKey(note: string, octave: number, offset: number) {
    return `<rect class="natural-note note" data-note="${note}" data-octave="${octave}" x=${offset} y=1></rect>`;
}

export interface PianoElement extends HTMLElement {

    setNoteDown(note: string, octave: number): void;

    setNoteUp(note: string, octave: number): void;
}

interface PianoAttributes {
    keyCount: number;
    keyboardLayout: string
    readOnly: boolean;
}

class Piano extends HTMLElement implements PianoElement {
    private config!: PianoAttributes;

    static get observedAttributes() {
        return ["key-count", "keyboard-layout", "read-only"]
    }

    readAttributes(): PianoAttributes {
        return {
            keyCount: parseInt(this.getAttribute("key-count") || "88"),
            keyboardLayout: this.getAttribute("keyboard-layout") || "A",
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
        elem.classList.add("depressed");
    }

    setNoteUp(note: string, octave: number) {
        const elem = this.querySelector(keySelector(note, octave))!;
        elem.classList.remove("depressed");
    }

    getNoteSvg() {
        const noteCount = this.config.keyCount;

        const generator = noteGenerator(this.config.keyboardLayout);
        const notes = new Array(noteCount).fill(1).map(() => generator.next().value);

        const naturalKeys = notes
            .filter((note) => !note.name.includes("#"))
            .length;
        //TODO only add padding for sharp if last key is actually sharp
        const totalWidth = (naturalKeys * NaturalWidth) + (SharpWidth);
        return `<svg viewBox="0 0 ${totalWidth} 52" version="1.1" xmlns="http://www.w3.org/2000/svg">
            ${this.getKeysForNotes(notes)}
        </svg>`;
    }


    getKeysForNotes(notes: Note[]) {
        let totalOffset = -NaturalWidth + 1;

        const offsets = notes.map((note: Note) => {

            const isSharp = note.name.includes("#");

            let thisOffset = 0;
            if (isSharp) {
                thisOffset = totalOffset + 7;
            } else {
                totalOffset = totalOffset + NaturalWidth;
                thisOffset = totalOffset;
            }

            return {
                note: note.name,
                octave: note.octave,
                offset: thisOffset
            };
        });

        const naturalKeys = offsets.filter((pos) => !pos.note.includes("#"))
            .map((pos) => naturalKey(pos.note, pos.octave, pos.offset));

        const sharpKeys = offsets.filter((pos) => pos.note.includes("#"))
            .map((pos) => sharpKey(pos.note, pos.octave, pos.offset));

        return `<g>
            ${naturalKeys}
            ${sharpKeys}
        </g>`
    }

    getCss() {
        return `
        .natural-note {
          stroke: #555555;
          fill: white;
          width: ${NaturalWidth};
          height: 50;
        }
        .sharp-note {
          stroke: #555555;
          fill: #555555;
          width: ${SharpWidth};
          height: 30;
        }
        .depressed {
          fill: grey;
          transform: scale(1, 0.95);
        }
        `
    }
}

const keySelector = (note: string, octave: number) => `[data-note="${note}"][data-octave="${octave}"]`;

customElements.define("piano-keys", Piano);

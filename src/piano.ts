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
    private root: ShadowRoot;

    static get observedAttributes() {
        return ["key-count", "keyboard-layout", "read-only"]
    }

    get config(): PianoAttributes {
        return {
            keyCount: parseInt(this.getAttribute("key-count") || "88"),
            keyboardLayout: this.getAttribute("keyboard-layout") || "A",
            readOnly: this.hasAttribute("read-only"),
        };
    }

    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"});
        this.root.addEventListener('mousedown', (event) => {
            this.handleClick(event, true);
            event.preventDefault();
        });

        this.root.addEventListener('mouseup', (event) => {
            this.handleClick(event, false);
            event.preventDefault();
        });

        this.root.addEventListener('mouseout', (event) => {
            this.handleClick(event, false);
            event.preventDefault();
        });

        this.root.innerHTML = `<style>${this.getCss()}</style><div>${this.getNoteSvg()}`;
    }

    connectedCallback() {
    }

    attributeChangedCallback() {
        this.root.innerHTML = `<style>${this.getCss()}</style><div>${this.getNoteSvg()}</div>`;
    }

    handleClick(event: any, down: boolean) {
        if (this.config.readOnly) {
            return;
        }

        const target = event.target;
        if (target.tagName === "rect") {
            const note = event.target.getAttribute("data-note");
            const octave = parseInt(event.target.getAttribute("data-octave"));

            if (down) {
                this.setNoteDown(note, octave);
                this.dispatchEvent(new CustomEvent('note-down', {detail: {note, octave}}));
            } else {
                if (target.hasAttribute("data-depressed")) {
                    this.setNoteUp(note, octave);
                    this.dispatchEvent(new CustomEvent('note-up', {detail: {note, octave}}));
                }
            }
        }
    }

    setNoteDown(note: string, octave: number) {
        const elem = this.root.querySelector(keySelector(note, octave))!;
        elem.classList.add("depressed");
        elem.setAttribute("data-depressed", "data-depressed");
    }

    setNoteUp(note: string, octave: number) {
        const elem = this.root.querySelector(keySelector(note, octave))!;
        elem.classList.remove("depressed");
        elem.removeAttribute("data-depressed");
    }

    getNoteSvg() {
        const noteCount = this.config.keyCount;

        const generator = noteGenerator(this.config.keyboardLayout);
        const notes = new Array(noteCount).fill(1).map(() => generator.next().value);

        const naturalKeys = notes
            .filter((note) => !note.name.includes("#"))
            .length;
        const lastKeySharp = notes[notes.length - 1].name.includes("#");

        const totalWidth = (naturalKeys * NaturalWidth) + (lastKeySharp ? SharpWidth / 2 : 0) + 2;
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
        
        :host {
            --natural-key-color: #FFFFFF; 
            --natural-key-outline-color: #555555;
            
            --sharp-key-color: #555555;
            --sharp-key-outline-color: #555555;
            
            --depressed-key-color: #808080;
            --depressed-key-transform: scale(1, 0.95);
        }
        
        :host {
          display: block;
        }
        
        .natural-note {
          stroke: var(--natural-key-outline-color);
          fill: var(--natural-key-color);
          width: ${NaturalWidth}px;
          height: 50px;
        }
        
        .sharp-note {
          stroke: var(--sharp-key-outline-color);
          fill: var(--sharp-key-color);
          width: ${SharpWidth}px;
          height: 30px;
        }
        
        .depressed {
          fill: var(--depressed-key-color);
          transform: var(--depressed-key-transform);
        }
        `
    }
}

const keySelector = (note: string, octave: number) => `[data-note="${note}"][data-octave="${octave}"]`;

customElements.define("piano-keys", Piano);

import {fireEvent} from "@testing-library/dom";
import "@testing-library/jest-dom";
import './piano';
import {PianoElement} from "./piano";


describe("Piano Component", () => {

    describe("key count", () => {
        it("defaults to 88 keys", () => {
            const component = render(`<piano-keys/>`);

            expect(component.getElementsByClassName("note")).toHaveLength(88)
        });

        it("Renders an arbitrary number of keys", () => {
            const component = render(`<piano-keys key-count=10/>`);

            expect(component.getElementsByClassName("note")).toHaveLength(10)
        });

        it("responds to key count change", () => {
            const component = render(`<piano-keys key-count=1/>`);

            expect(component.getElementsByClassName("note")).toHaveLength(1);
            component.setAttribute("key-count", "2");
            expect(component.getElementsByClassName("note")).toHaveLength(2);
        });
    });

    describe("key layout", () => {

        it("defaults to starting from A", () => {
            const component = render(`<piano-keys key-count=13/>`);

            const keys = Array.from(component.getElementsByClassName("note"))
                .sort(byHorizontalPosition)
                .map(displayName);

            expect(keys).toEqual([
                'A-0', 'A#-0', 'B-0', 'C-1', 'C#-1',
                'D-1', 'D#-1', 'E-1', 'F-1', 'F#-1',
                'G-1', 'G#-1', 'A-1'
            ]);
        });

        it("can render keys starting from C", () => {
            const component = render(`<piano-keys keyboard-layout="C" key-count=13/>`);

            const keys = Array.from(component.getElementsByClassName("note"))
                .sort(byHorizontalPosition)
                .map(displayName);

            expect(keys).toEqual([
                "C-0", "C#-0", "D-0", "D#-0", "E-0",
                "F-0", "F#-0", "G-0", "G#-0", "A-0",
                "A#-0", "B-0", "C-1"
            ]);
        });

        it("responds to layout change", () => {
            const component = render(`<piano-keys key-count=1/>`);
            const keys = Array.from(component.getElementsByClassName("note"))
                .map(displayName);

            expect(keys[0]).toEqual("A-0");
            component.setAttribute("keyboard-layout", "C");

            const updatedKeys = Array.from(component.getElementsByClassName("note"))
                .map(displayName);
            expect(updatedKeys[0]).toEqual("C-0");
        });

    });

    describe("key press", () => {

        it("can press keys down and up", () => {
            const component = render(`<piano-keys key-count=3/>`) as PianoElement;

            const A0 = component.querySelector(keySelector("A", 0))!;
            const ASharp0 = component.querySelector(keySelector("A#", 0))!;

            expect(A0).not.toHaveClass("depressed");
            expect(ASharp0).not.toHaveClass("depressed");

            component.setNoteDown("A", 0);
            component.setNoteDown("A#", 0);

            expect(A0).toHaveClass("depressed");
            expect(ASharp0).toHaveClass("depressed");

            component.setNoteUp("A", 0);
            component.setNoteUp("A#", 0);

            expect(A0).not.toHaveClass("depressed");
            expect(ASharp0).not.toHaveClass("depressed");
        });
    });

    describe("key interactivity", () => {

        it("triggers note-down and note-up event on mousedown/up", (done) => {
            const component = render(`<piano-keys/>`) as PianoElement;
            const A0 = component.querySelector(keySelector("A", 0))!;

            component.addEventListener("note-down", () => {

                component.addEventListener("note-up", () => {
                    done();
                });

                fireEvent.mouseUp(A0);
            });

            fireEvent.mouseDown(A0);
        });

        it("marks keys as depressed when mouse down", () => {
            const component = render(`<piano-keys/>`) as PianoElement;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0).not.toHaveClass("depressed");

            fireEvent.mouseDown(A0);
            expect(A0).toHaveClass("depressed");

            fireEvent.mouseUp(A0);
            expect(A0).not.toHaveClass("depressed");
        });

        it("read-only disables interactivity", () => {
            const component = render(`<piano-keys read-only="true"/>`) as PianoElement;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0).not.toHaveClass("depressed");

            fireEvent.mouseDown(A0);
            expect(A0).not.toHaveClass("depressed");
        });

        it("read-only disables callback", (done) => {
            const component = render(`<piano-keys read-only="true"/>`) as PianoElement;
            const A0 = component.querySelector(keySelector("A", 0))!;

            component.addEventListener("note-down", () => {
                fail("note-down should not have been fired");
            });

            fireEvent.mouseDown(A0);
            //Not great essentially have to wait for something to not happen but this timeout works (for now)
            setTimeout(done, 100);
        });

        it("read-only can be updated", () => {
            const component = render(`<piano-keys/>`) as PianoElement;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0).not.toHaveClass("depressed");

            fireEvent.mouseDown(A0);
            expect(A0).toHaveClass("depressed");
            fireEvent.mouseUp(A0);
            expect(A0).not.toHaveClass("depressed");

            component.setAttribute("read-only", "true");
            fireEvent.mouseDown(A0);
            expect(A0).not.toHaveClass("depressed");
        });

    });

});

const byHorizontalPosition = (a: Element, b: Element) => {
    const aPos = parseInt(a.getAttribute("x")!);
    const bPos = parseInt(b.getAttribute("x")!);
    return aPos - bPos
};

const displayName = (value: Element) => value.getAttribute("data-note") + "-" + value.getAttribute("data-octave");
const keySelector = (note: string, octave: number) => `[data-note="${note}"][data-octave="${octave}"]`;


function render(content: string): Element {
    const testContainer = document.createElement("div");
    document.body.appendChild(testContainer);
    testContainer.innerHTML = content;
    return testContainer.children.item(0)!;
}
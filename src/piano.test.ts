import "@testing-library/jest-dom";
import './piano';
import {Piano} from "@/piano";
import {fireEvent, waitFor} from "@testing-library/dom";

function render(content: string): Element {
    const testContainer = document.createElement("div");
    document.body.appendChild(testContainer);
    testContainer.innerHTML = content;
    return testContainer.children.item(0)!;
}

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
                .map(value => value.getAttribute("id"));

            expect(keys).toEqual([
                'note-A-0', 'note-A#-0', 'note-B-0', 'note-C-1', 'note-C#-1',
                'note-D-1', 'note-D#-1', 'note-E-1', 'note-F-1', 'note-F#-1',
                'note-G-1', 'note-G#-1', 'note-A-1'
            ]);
        });

        it("can render keys starting from C", () => {
            const component = render(`<piano-keys keyboard-layout="CtoB" key-count=13/>`);

            const keys = Array.from(component.getElementsByClassName("note"))
                .sort(byHorizontalPosition)
                .map(value => value.getAttribute("id"));

            expect(keys).toEqual([
                "note-C-0", "note-C#-0", "note-D-0", "note-D#-0", "note-E-0",
                "note-F-0", "note-F#-0", "note-G-0", "note-G#-0", "note-A-0",
                "note-A#-0", "note-B-0", "note-C-1"
            ]);
        });

        it("responds to layout change", () => {
            const component = render(`<piano-keys key-count=1/>`);
            const keys = Array.from(component.getElementsByClassName("note"));

            expect(keys[0].getAttribute("id")).toEqual("note-A-0");
            component.setAttribute("keyboard-layout", "CtoB");

            const updatedKeys = Array.from(component.getElementsByClassName("note"));
            expect(updatedKeys[0].getAttribute("id")).toEqual("note-C-0");
        });

    });

    describe("key press", () => {

        it("can press keys down and up", () => {
            const component = render(`<piano-keys key-count=3/>`) as Piano;

            const A0 = component.querySelector(keySelector("A", 0))!;
            const ASharp0 = component.querySelector(keySelector("A#", 0))!;

            expect(A0.getAttribute("fill")).toEqual("white");
            expect(ASharp0.getAttribute("fill")).toEqual("#555555");

            component.setNoteDown("A", 0);
            component.setNoteDown("A#", 0);

            expect(A0.getAttribute("fill")).toEqual("grey");
            expect(ASharp0.getAttribute("fill")).toEqual("grey");

            component.setNoteUp("A", 0);
            component.setNoteUp("A#", 0);

            expect(A0.getAttribute("fill")).toEqual("white");
            expect(ASharp0.getAttribute("fill")).toEqual("#555555");
        });
    });

    describe("key interactivity", () => {

        it("triggers note-down and note-up event on mousedown/up", (done) => {
            const component = render(`<piano-keys/>`) as Piano;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0.getAttribute("fill")).toEqual("white");

            component.addEventListener("note-down", () => {

                component.addEventListener("note-up", () => {
                    done();
                });

                fireEvent.mouseUp(A0);
            });

            fireEvent.mouseDown(A0);
        });

        it("marks keys as depressed when mouse down", () => {
            const component = render(`<piano-keys/>`) as Piano;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0.getAttribute("fill")).toEqual("white");

            fireEvent.mouseDown(A0);
            expect(A0.getAttribute("fill")).toEqual("grey");
            fireEvent.mouseUp(A0);
            expect(A0.getAttribute("fill")).toEqual("white");
        });

        it("read-only disables interactivity", () => {
            const component = render(`<piano-keys read-only="true"/>`) as Piano;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0.getAttribute("fill")).toEqual("white");

            fireEvent.mouseDown(A0);
            expect(A0.getAttribute("fill")).toEqual("white");
        });

        it("read-only disables callback", (done) => {
            const component = render(`<piano-keys read-only="true"/>`) as Piano;
            const A0 = component.querySelector(keySelector("A", 0))!;

            component.addEventListener("note-down", () => {
                fail("note-down should not have been fired");
            });

            fireEvent.mouseDown(A0);
            //Not great essentially have to wait for something to not happen but this timeout works (for now)
            setTimeout(done, 100);
        });

        it("read-only can be updated", () => {
            const component = render(`<piano-keys/>`) as Piano;
            const A0 = component.querySelector(keySelector("A", 0))!;

            expect(A0.getAttribute("fill")).toEqual("white");

            fireEvent.mouseDown(A0);
            expect(A0.getAttribute("fill")).toEqual("grey");
            fireEvent.mouseUp(A0);
            expect(A0.getAttribute("fill")).toEqual("white");

            component.setAttribute("read-only", "true");
            fireEvent.mouseDown(A0);
            expect(A0.getAttribute("fill")).toEqual("white");
        });

    });

});

const byHorizontalPosition = (a: Element, b: Element) => {
    const aPos = parseInt(a.getAttribute("x")!);
    const bPos = parseInt(b.getAttribute("x")!);
    return aPos - bPos
};

const keySelector = (note: string, octave: number) => `[data-note="${note}"][data-octave="${octave}"]`;
# Piano Keys Webcomponent

## Overview
Piano Keys is a webcomponent that renders a piano keyboard layout. It supports any number of keys and any layout. 
It provides methods to programatically trigger note up/down effects as well as callbacks for when users click on a note. 
The keyboard is rendered as SVG so should scale to work well at any size. 
You can also customize the look and feel using CSS variables.

## Examples
[Examples](https://crswty.github.io/piano-keys-webcomponent/) with code samples 

## Configuration Options

The component supports the following HTML attributes

| Attribute        | Default   | Description
| ---------------- | --------- | -----------
| key-count        | 88        | Number of keys to render.
| keyboard-layout  | A         | Note to start rendering from 
| read-only        | off       | Set attribute to disable clicking on notes

## Methods

### Press Notes
Sets the state of the note to either pressed or not
```typescript
setNoteDown(note: string, octave: number)
setNoteDown(note: string, octave: number)
```
example:
```javascript
document.getElementById("piano").setNoteDown("C", 4);
```


## Styling


| Attribute                  |  Description
| ----------------           |  -----------
| natural-key-color          | 
| natural-key-outline-color  |   
| sharp-key-color            |   
| sharp-key-outline-color    |   
| depressed-key-color        |   
| depressed-key-transform    |   

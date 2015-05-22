# drawcellJS
This library provides a programmatic (JSON) interface for creating 2D rendering of biochemical systems composed of cells, molecular components such as enzymes and metabolites, and reactions.

The purpose of the JSON interface is to allow other editors, e.g. plasmid editor or mathematical model editor, to automatically generate wiring diagrams illustrating the cellular processes. For example, a mathematical model can call "updateScene({ name: 'Glucose', count: 100 })" to update the number of Glucose molecules drawn on the canvas. Similarly, a DNA editing program can call "updateScene({name: "pTet", inside: "DNA1", offset: 0.1})" to add a new promoter inside the DNA strand named DNA1 at offset 0.1 (relative position based on the DNA1 object's length). 

See the screenshots folder for examples. 
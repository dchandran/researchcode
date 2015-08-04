var source_molecule = new AnimModule("source");

source_molecule.init = function() {

    var self = source_molecule;
    self.sourceSheet = new createjs.SpriteSheet({
                        framerate: 30,
                        "images": ["source.png"],
                        "frames": {"regX": 0, "height": 20, "count": 1, "regY": 0, "width": 20},
                        "animations": {
                            "normal": 0
                        }
                    });
    self.molecules = [];
    self.inputs.numMolecules = 0;
    self.delay = 7;
};

source_molecule.tick = function(event) {

    var self = source_molecule;
    var molecules = self.molecules;
    var bounds = self.inputs.bounds;
    var mol;
    var numMolecules = self.inputs.numMolecules;

    if (numMolecules > 0) {

        if (molecules.length < self.inputs.numMolecules && self.delay > 6) {
            mol = new createjs.Sprite(self.sourceSheet, "normal");
            mol.x = bounds.left + Math.random()*bounds.width;
            mol.y = bounds.top;
            mol.scaleY = 0.3;
            mol.scaleX = 0.3;
            _EASEL_STAGE.addChild(mol);
            molecules.push(mol);
            self.delay = 0;

            initDiffusableMolecule(mol, bounds, false, 3);
            mol.velY = Math.abs(mol.velY);
        }

        self.delay = self.delay + 1;

        for (i=0; i < molecules.length; ++i) {
            if (molecules[i] && molecules[i].y > bounds.top + bounds.height && molecules.length <= numMolecules) {
                molecules[i].x = bounds.left + Math.random()*bounds.width;
                molecules[i].y = bounds.top;
            }
        }

        for (i=0; i < molecules.length; ++i) {
            if (molecules[i])
                moveDiffusableMolecule(self.molecules[i]);
        }
    }

    while (molecules.length > self.inputs.numMolecules) {
        _EASEL_STAGE.removeChild(molecules[molecules.length-1]);
        molecules.length = molecules.length-1;
    }
};

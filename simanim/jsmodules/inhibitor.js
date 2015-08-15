var inhibitor = new AnimModule("inhibitor");
    
inhibitor.init = function() {
    var i;
    var self = inhibitor;
    var bounds = self.inputs.inactiveBounds;
            
    self.spriteSheet = new createjs.SpriteSheet({
        framerate: 30,
        "images": ["substrate.png"],
        "frames": {"regX": 0, "height": 60, "count": 2, "regY": 0, "width": 69.5},
        "animations": {
            "bound": [0],
            "free": [1]
        }
    });

    self.molecules = [];
};

inhibitor.tick = function(event) {
    var self = inhibitor;
    var bounds = self.inputs.bounds;
    var molecules = self.molecules;
    var n = self.inputs.count || 0;
    var mol;

    if (!bounds) return;

    while (molecules.length > n) {
        markForDegradation(molecules[molecules.length-1]);
        molecules.length = molecules.length-1;
    }

    while (molecules.length < n) {
        mol = new createjs.Sprite(self.spriteSheet, "free");
        initDiffusableMolecule(mol, bounds, true, 3);
        mol.x = mol.bounds.left + mol.bounds.width*(Math.random());
        mol.y = mol.bounds.top + mol.bounds.height*(Math.random());
        mol.scaleX = mol.scaleY = 0.4;
        mol.alpha = 0.1;

        _EASEL_STAGE.addChild(mol);          
        molecules.push(mol);
    }

    var i, j, k, k2, arr;

    if (!self.isPaused()) {

        for (j in self.inputs) {
            if (j !== "bounds") {
                arr = self.inputs[j];
                for (k=0; k < arr.length && k < molecules.length; ++k) {
                    mol = molecules[k2];
                    mol.targetBounds = arr[k];
                    k2 += 1;
                }
            }
        }

        for (i=0; i < molecules.length; ++i) {
            mol = molecules[i];
            if (mol.alpha < 1) {
                mol.alpha += 0.02;
            }

            moveDiffusableMolecule(mol);
        }
    }
};
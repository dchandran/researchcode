function SmallMolecule() {
    var module = AnimModule();

    module.onInit( function() {
        var i;
        var self = module;
        var bounds = self.inputs.inactiveBounds;

        self.spriteSheet = {
            framerate: 30,
            "images": ["substrate.png"],
            "frames": {"regX": 0, "height": 60, "count": 2, "regY": 0, "width": 69.5},
            "animations": {
                "bound": [0],
                "free": [1]
            }
        };

        self.molecules = [];
    });

    module.onTick( function(event) {
        var self = module;
        var bounds = self.inputs.bounds;
        var molecules = self.molecules;
        var n = self.inputs.numMolecules || 0;
        var mol;

        if (!bounds) return;

        while (molecules.length > n) {
            molecules[molecules.length-1].degrade();
            molecules.length = molecules.length-1;
        }

        while (molecules.length < n) {
            mol = Molecule(self.spriteSheet, "free");
            mol.setSpeed(3,true);
            mol.setBounds(bounds);
            mol.x = mol.bounds.left + mol.bounds.width*(Math.random());
            mol.y = mol.bounds.top + mol.bounds.height*(Math.random());
            mol.scaleX = mol.scaleY = 0.4;
            mol.alpha = 0.1;

            molecules.push(mol);
        }

        var i, j, k, k2, n, arr, percentBound;

        if (!self.isPaused()) {
            k2 = 0;

            for (j in self.inputs) {
                percentBound = self.inputs[ j + ' bound' ];
                if (j !== "bounds" && percentBound) {
                    n = percentBound;
                    arr = self.inputs[j];
                    for (k=arr.length-1; k >= 0 && k2 < molecules.length && n > 0; --k) {
                        mol = molecules[k2];
                        mol.target = arr[k];
                        mol.gotoAndPlay('bound');
                        k2 += 1;
                        n -= 1;
                    }
                }
            }

            for (; k2 < molecules.length; ++k2) {
                mol = molecules[k2];
                if (mol.target) {
                    delete mol.target;
                    molecules[k2].gotoAndPlay('free');
                }
            }

            for (i=0; i < molecules.length; ++i) {
                mol = molecules[i];
                if (mol.alpha < 1) {
                    mol.alpha += 0.02;
                }

                mol.diffuse();
            }
        }

        self.outputs.molecules = molecules;
    });

    return module;
}

registerModuleType("small molecule", SmallMolecule);

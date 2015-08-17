function InhibitorModule(name,typename) {
    var module = new AnimModule(name,typename);
        
    module.init = function() {
        var i;
        var self = module;
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

    module.tick = function(event) {
        var self = module;
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

        var i, j, k, k2, n, arr;

        if (!self.isPaused()) {
            k2 = 0;

            var percentBound = self.inputs.percentBound;

            if (percentBound) {
                for (j in self.inputs) {
                    if (j !== "bounds" && percentBound[j]) {
                        n = percentBound[j]*molecules.length;
                        arr = self.inputs[j];
                        for (k=0; k < arr.length && k2 < molecules.length && n > 0; ++k) {
                            mol = molecules[k2];
                            mol.target = arr[k];
                            mol.gotoAndPlay('bound');
                            k2 += 1;
                            n -= 1;
                        }
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

                moveDiffusableMolecule(mol);
            }
        }
    };

    return module;
}

registerModuleType("inhibitor", InhibitorModule);

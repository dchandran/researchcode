function EnzymeActivity() {
    var module = AnimModule();

    module.onInit( function() {
        var i;
        var self = module;
        var imageFile = "protein_chomp" + EnzymeActivity.lastIndex;

        ++EnzymeActivity.lastIndex;
        if (EnzymeActivity.lastIndex > EnzymeActivity.maxIndex) {
            EnzymeActivity.lastIndex = 1;
        }
                
        self.proteinChompSheet = {
            framerate: 30,
            "images": [imageFile + ".png"],
            "frames": {"regX": 0, "height": 51, "count": 17, "regY": 0, "width": 65},
            // define two animations, run (loops, 1.5x speed) and jump (returns to run):
            "animations": {
                "active": [0, 15, "active", 0.5],
                "bind": [0, 8, "bound", 0.7],
                "bound": 8,
                "inactive": 16,
            }
        };
        
        self.tfs = [];
    });

    module.onTick( function(event) {
        var self = module;

        var tf, i, j;
        var percentActive = self.inputs.percentActive;
        var tfs = self.tfs;
        var states = self.inputs.states || [];

        self.outputs.tfs = [];

        var targets = [];

        if (self.inputs.targets) {
            targets = self.inputs.targets;
        } else {
            
            if (self.inputs.target) {
                targets.push(self.inputs.target);
            } else {
                i = 1;
                while (self.inputs['target' + i] !== undefined) {
                    targets.push(self.inputs['target' + i]);
                    ++i;
                }
            }
        }

        n = self.inputs.numMolecules || 0;
        var tfs = self.tfs;
        var tf;

        if (tfs.length != n) {

            while (tfs.length > n) {
                tfs[tfs.length-1].degrade();
                tfs.length = tfs.length-1;
            }

            while (tfs.length < n) {
                tf = Molecule(self.proteinChompSheet, "inactive");
                tf.setBounds(self.inputs.inactiveBounds);

                if (self.inputs.startPos && self.inputs.startPos.x && self.inputs.startPos.y) {
                    tf.x = self.inputs.startPos.x;
                    tf.y = self.inputs.startPos.y;

                } else {
                    tf.x = tf.bounds.left + tf.bounds.width*(Math.random());
                    tf.y = tf.bounds.top;// + (Math.random());
                }
                
                tf.scaleX = tf.scaleY = 1;
                tf.alpha = 0.1;

                // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
                _EASEL_STAGE.addChild(tf);   
                tfs.push(tf);
            }
        }

        var taken = [];
        var numTaken = 0;
        taken.length = targets.length;

        for (i=0; i < tfs.length; ++i) {
            tf = tfs[i];
            if (tf.alpha < 1) {
                tf.alpha += 0.02;
            }

            if (tf.currentAnimation !== 'active' && 
                (i < percentActive*tfs.length ||
                 (states.length > i && states[i]==='active'))) {
                tf.gotoAndPlay('active');
                tf.setSpeed(3, true);
                tf.setBounds(self.inputs.activeBounds);
            } else {
                if (tf.currentAnimation !== 'inactive' && 
                    (i >= percentActive*tfs.length ||
                     (states.length > i && states[i]==='inactive'))) {
                    if (tf.target)
                        delete tf.target;
                    tf.gotoAndPlay('inactive');
                    tf.setSpeed(1, true);
                    tf.setBounds(self.inputs.inactiveBounds);
                }
            }

            if (tf.target) {
                if (Math.random() < 0.00) {
                    delete tf.target;
                } else {
                    j = targets.indexOf(tf.target);
                    if (j > -1) {
                        taken[j] = true;
                        ++numTaken;
                    }
                }
            }
        }

        if (percentActive * tfs.length > numTaken)
            for (i=0; i < targets.length; ++i) {
                if (!taken[i]) {
                    j = Math.floor(Math.random() * percentActive * tfs.length);
                    while (tfs[j] && tfs[j].target && j < percentActive * tfs.length) ++j;
                    if (tfs[j] && !tfs[j].target) {
                        tfs[j].target = targets[i];
                        tfs[j].rotation = tfs[j].target.rotation;
                    }
                }
            }

        if (!self.isPaused())
            for (i=0; i < tfs.length; ++i) {
                tfs[i].diffuse();
            }

        self.outputs.molecules = tfs;
        self.updateDownstream();
    });

    return module;
}

function MembraneReceptor() {
    var module = AnimModule();

    module.onInit( function() {
        var i;
        var self = module;
        var bounds = self.inputs.inactiveBounds;

        self.membraneChompSheet = {
            framerate: 30,
            "images": ["membrane_protein_chomp.png"],
            "frames": {"regX": 0, "height": 120, "count": 11, "regY": 0, "width": 50},              
            "animations": {
                "active": [0, 9, "active", 0.5],
                "inactive": 10
            }
        };
        
        self.receptors = [];
    });

    module.onTick( function(event) {
        var self = module;

        var percentActive = self.inputs.percentActive;
        var receptors = self.receptors;
        var recp, i;
        var bounds = self.inputs.inactiveBounds;
        var receptorStates = self.inputs.states || [];

        self.outputs.receptors = [];

        var n = self.inputs.numMolecules || 0;    
        if (receptors.length != n) {

            while (receptors.length > n) {
                receptors[receptors.length-1].degrate();
                receptors.length = receptors.length-1;
            }

            while (receptors.length < n) {
                recp = Molecule(self.membraneChompSheet, "inactive");
                recp.setSpeed(1,false);
                recp.setBounds({left: bounds.left, width: bounds.width, height: 0, top: bounds.top-140});
                if (self.inputs.startPos) {
                    recp.x = self.inputs.startPos.x;
                    recp.y = self.inputs.startPos.y;
                } else {
                    recp.x = recp.bounds.left + recp.bounds.width*(Math.random());
                    recp.y = recp.bounds.top + recp.bounds.height*(Math.random());
                }
                recp.scaleX = recp.scaleY = 1;
                recp.velY = 0;
                recp.velTheta = 0;
                recp.alpha = 0.1;
                
                receptors.push(recp);
            }
        }

        if (!self.isPaused())
            for (i=0; i < receptors.length; ++i) {
                rec = receptors[i];
                if (rec.alpha < 1) {
                    rec.alpha += 0.05 * Math.random();
                }

                if (rec.currentAnimation !== 'active' && 
                    (i < percentActive*receptors.length || 
                        (receptorStates.length > i && receptorStates[i]==='active'))) {
                    rec.gotoAndPlay('active');
                } else {
                    if (rec.currentAnimation !== 'inactive' && 
                        (i >= percentActive*receptors.length || 
                            (receptorStates.length > i && receptorStates[i]==='inactive'))) {
                        rec.gotoAndPlay('inactive');
                    }
                }

                rec.diffuse();
            }

        self.outputs.receptors = receptors;
    });

    return module;
}

function TwoComponentSystem() {
    var module = AnimModule();
    module.submodules.membrane_receptor = createModuleFromType(name + "-submodule", "membrane receptor");
    module.submodules.transcription_factor = createModuleFromType(name + "-submodule", "enzyme");

    module.onInit( function() {
        var i;
        var self = module;
        var bounds = self.inputs.inactiveBounds;
        self.initSubmodules();
    });

    module.onTick( function(event) {
        var self = module;

        var h;
        if (self.inputs.inactiveBounds) {
            h = self.inputs.inactiveBounds.height;
            self.inputs.inactiveBounds.height = 100; //inputs are REFERENCES            
        }

        self.submodules.transcription_factor.inputs.numMolecules = self.inputs.numTFs;
        self.submodules.membrane_receptor.inputs.numMolecules = self.inputs.numReceptors;
        self.submodules.transcription_factor.inputs.percentActive = self.inputs.percentActiveTFs;
        self.submodules.membrane_receptor.inputs.percentActive = self.inputs.percentActiveMembranes;


        self.tickSubmodules(event);
        
        if (h) {
            self.inputs.inactiveBounds.height = h;
        }

        self.updateDownstream();
    });

    return module;
}


registerModuleType("membrane receptor", MembraneReceptor);
registerModuleType("enzyme", EnzymeActivity);
registerModuleType("two component", TwoComponentSystem);

EnzymeActivity.lastIndex = 1;
EnzymeActivity.maxIndex = 2;
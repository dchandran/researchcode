function TranscriptionFactor(name, typename) {
    var module = new AnimModule(name, typename);

    module.init = function() {
        var i;
        var self = module;
        var imageFile = "protein_chomp" + TranscriptionFactor.lastIndex;

        ++TranscriptionFactor.lastIndex;
        if (TranscriptionFactor.lastIndex > TranscriptionFactor.maxIndex) {
            TranscriptionFactor.lastIndex = 1;
        }
                
        self.proteinChompSheet = new createjs.SpriteSheet({
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
        });
        
        self.tfs = [];
    };

    module.tick = function(event) {
        var self = module;

        var tf, i, j;
        var percentActiveTFs = self.inputs.percentActiveTFs;
        var tfs = self.tfs;
        var tfStates = self.inputs.tfStates || [];

        self.outputs.tfs = [];

        var targets = [];
        
        if (self.inputs.target) {
            targets.push(self.inputs.target);
        } else {
            i = 1;
            while (self.inputs['target' + i] !== undefined) {
                targets.push(self.inputs['target' + i]);
                ++i;
            }
        }

        n = self.inputs.numTfs || 0;
        var tfs = self.tfs;
        var tf;

        if (tfs.length != n) {

            while (tfs.length > n) {
                markForDegradation(tfs[tfs.length-1]);
                tfs.length = tfs.length-1;
            }

            while (tfs.length < n) {
                tf = new createjs.Sprite(self.proteinChompSheet, "inactive");
                initDiffusableMolecule(tf, self.inputs.inactiveBounds);
                if (self.inputs.tfStartPos && self.inputs.tfStartPos.x && self.inputs.tfStartPos.y) {
                    tf.x = self.inputs.tfStartPos.x;
                    tf.y = self.inputs.tfStartPos.y;

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
        taken.length = targets.length;

        for (i=0; i < tfs.length; ++i) {
            tf = tfs[i];
            if (tf.alpha < 1) {
                tf.alpha += 0.02;
            }

            if (tf.currentAnimation !== 'active' && 
                (i < percentActiveTFs*tfs.length ||
                 (tfStates.length > i && tfStates[i]==='active'))) {
                tf.gotoAndPlay('active');
                initDiffusableMolecule(tf, self.inputs.activeBounds, true, 3);
            } else {
                if (tf.currentAnimation !== 'inactive' && 
                    (i >= percentActiveTFs*tfs.length ||
                     (tfStates.length > i && tfStates[i]==='inactive'))) {
                    if (tf.target)
                        delete tf.target;
                    tf.gotoAndPlay('inactive');
                    initDiffusableMolecule(tf, self.inputs.inactiveBounds);
                }
            }

            if (tf.target) {
                if (Math.random() < 0.00) {
                    delete tf.target;
                } else {
                    j = targets.indexOf(tf.target);
                    if (j > -1) {
                        taken[j] = true;
                    }
                }
            }
        }

        for (i=0; i < targets.length; ++i) {
            if (!taken[i] && percentActiveTFs * tfs.length > 0) {
                j = Math.floor(Math.random() * percentActiveTFs * tfs.length);
                while (tfs[j] && tfs[j].target && j < percentActiveTFs * tfs.length) ++j;
                if (tfs[j] && !tfs[j].target) {
                    tfs[j].target = targets[i];
                    tfs[j].rotation = tfs[j].target.rotation;
                }
            }
        }

        if (!self.isPaused())
            for (i=0; i < tfs.length; ++i) {
                moveDiffusableMolecule(tfs[i]);
            }

        self.outputs.tfs = tfs;
        self.updateDownstream();
    };

    return module;
}

function MembraneReceptor(name, typename) {
    var module = new AnimModule(name, typename);

    module.init = function() {
        var i;
        var self = module;
        var bounds = self.inputs.inactiveBounds;

        self.membraneChompSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["membrane_protein_chomp.png"],
            "frames": {"regX": 0, "height": 120, "count": 11, "regY": 0, "width": 50},              
            "animations": {
                "active": [0, 9, "active", 0.5],
                "inactive": 10
            }
        });
        
        self.receptors = [];
    };

    module.tick = function(event) {
        var self = module;

        var percentActiveTFs = self.inputs.percentActiveTFs;
        var percentActiveMembranes = self.inputs.percentActiveMembranes;
        var receptors = self.receptors;
        var recp, i;
        var bounds = self.inputs.inactiveBounds;
        var receptorStates = self.inputs.receptorStates || [];

        self.outputs.receptors = [];

        var n = self.inputs.numReceptors || 0;    
        if (receptors.length != n) {

            while (receptors.length > n) {
                markForDegradation(receptors[receptors.length-1]);
                receptors.length = receptors.length-1;
            }

            while (receptors.length < n) {
                recp = new createjs.Sprite(self.membraneChompSheet, "inactive", false);
                initDiffusableMolecule(recp, {left: bounds.left, width: bounds.width, height: 0, top: bounds.top-140}, false);
                if (self.inputs.receptorStartPos) {
                    recp.x = self.inputs.receptorStartPos.x;
                    recp.y = self.inputs.receptorStartPos.y;
                } else {
                    recp.x = recp.bounds.left + recp.bounds.width*(Math.random());
                    recp.y = recp.bounds.top + recp.bounds.height*(Math.random());
                }
                recp.scaleX = recp.scaleY = 1;
                recp.velY = 0;
                recp.velTheta = 0;
                recp.alpha = 0.1;

                // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
                _EASEL_STAGE.addChild(recp);
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
                    (i < percentActiveMembranes*receptors.length || 
                        (receptorStates.length > i && receptorStates[i]==='active'))) {
                    rec.gotoAndPlay('active');
                } else {
                    if (rec.currentAnimation !== 'inactive' && 
                        (i >= percentActiveMembranes*receptors.length || 
                            (receptorStates.length > i && receptorStates[i]==='inactive'))) {
                        rec.gotoAndPlay('inactive');
                    }
                }

                moveDiffusableMolecule(rec);
            }

        self.outputs.receptors = receptors;
        self.updateDownstream();
    };

    return module;
}

function TwoComponentSystem(name,typename) {
    var module = new AnimModule(name, typename);
    module.submodules.membrane_receptor = createModuleFromType(name + "-submodule", "membrane receptor");
    module.submodules.transcription_factor = createModuleFromType(name + "-submodule", "transcription factor");

    module.init = function() {
        var i;
        var self = module;
        var bounds = self.inputs.inactiveBounds;
        self.initSubmodules();
    };

    module.tick = function(event) {
        var self = module;

        var h;
        if (self.inputs.inactiveBounds) {
            h = self.inputs.inactiveBounds.height;
            self.inputs.inactiveBounds.height = 100; //inputs are REFERENCES            
        }

        self.tickSubmodules(event);
        
        if (h) {
            self.inputs.inactiveBounds.height = h;
        }

        self.updateDownstream();
    };

    return module;
}


registerModuleType("membrane receptor", MembraneReceptor);
registerModuleType("transcription factor", TranscriptionFactor);
registerModuleType("two component", TwoComponentSystem);

TranscriptionFactor.lastIndex = 1;
TranscriptionFactor.maxIndex = 2;
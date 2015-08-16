var two_component = new AnimModule("two component");
    
two_component.init = function() {
    var i;
    var self = two_component;
    var bounds = self.inputs.inactiveBounds;
            
    self.proteinChompSheet = new createjs.SpriteSheet({
        framerate: 30,
        "images": ["protein_chomp.png"],
        "frames": {"regX": 0, "height": 51, "count": 17, "regY": 0, "width": 65},
        // define two animations, run (loops, 1.5x speed) and jump (returns to run):
        "animations": {
            "active": [0, 15, "active", 0.5],
            "bind": [0, 8, "bound", 0.7],
            "bound": 8,
            "inactive": 16,
        }
    });

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
    self.tfs = [];
};

two_component.tick = function(event) {
    var self = two_component;

    var tf, rec, recp, i;
    var percentActiveTFs = self.inputs.percentActiveTFs;
    var percentActiveMembranes = self.inputs.percentActiveMembranes;
    var receptors = self.receptors;
    var tfs = self.tfs;
    var recp;
    var bounds = self.inputs.inactiveBounds;
    var receptorStates = self.inputs.receptorStates || [];
    var tfStates = self.inputs.tfStates || [];

    self.outputs.tfs = [];
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
            recp.x = recp.bounds.left + recp.bounds.width*(Math.random());
            recp.y = recp.bounds.top + recp.bounds.height*(Math.random());
            recp.scaleX = recp.scaleY = 1;
            recp.velY = 0;
            recp.velTheta = 0;
            recp.alpha = 0.1;

            // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
            _EASEL_STAGE.addChild(recp);
            receptors.push(recp);
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
            initDiffusableMolecule(tf, {left: bounds.left, width: bounds.width, height: 50, top: bounds.top});
            tf.x = tf.bounds.left + tf.bounds.width*(Math.random());
            tf.y = tf.bounds.top;// + (Math.random());
            tf.scaleX = tf.scaleY = 1;
            tf.alpha = 0.1;

            // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
            _EASEL_STAGE.addChild(tf);          
            tfs.push(tf);
        }
    }

    if (!self.isPaused())
        for (i=0; i < receptors.length; ++i) {
            rec = receptors[i];
            if (rec.alpha < 1) {
                rec.alpha += 0.02;
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

    var taken = false;

    for (i=0; i < tfs.length; ++i) {
        tf = tfs[i];
        if (tf.alpha < 1) {
            tf.alpha += 0.02;
        }

        if (tf.currentAnimation !== 'active' && 
            (i < percentActiveTFs*tfs.length ||
             (tfStates.length > i && tfStates[i]==='active'))) {
            tf.gotoAndPlay('active');
            bounds = self.inputs.activeBounds;
            initDiffusableMolecule(tf, bounds, true, 3);
        } else {
            if (tf.currentAnimation !== 'inactive' && 
                (i >= percentActiveTFs*tfs.length ||
                 (tfStates.length > i && tfStates[i]==='inactive'))) {
                if (tf.target)
                    delete tf.target;
                tf.gotoAndPlay('inactive');
                bounds = self.inputs.inactiveBounds;
                initDiffusableMolecule(tf, {left: bounds.left, width: bounds.width, height: 50, top: bounds.top});
            }
        }

        if (tf.target) {
            if (Math.random() < 0.00) {
                delete tf.target;
            } else {
                taken = true;
            }
        }
    }

    i = Math.random() * percentActiveTFs * tfs.length;
    if (i > 0 && self.inputs.target && !taken) {
        tfs[Math.floor(i)].target = self.inputs.target;
    }

    if (!self.isPaused())
        for (i=0; i < tfs.length; ++i) {
            moveDiffusableMolecule(tfs[i]);
        }

    self.outputs.receptors = receptors;
    self.outputs.tfs = tfs;
};
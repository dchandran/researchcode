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
            "inert": 16,
        }
    });

    self.membraneChompSheet = new createjs.SpriteSheet({
        framerate: 30,
        "images": ["membrane_protein_chomp.png"],
        "frames": {"regX": 0, "height": 120, "count": 11, "regY": 0, "width": 50},              
        "animations": {
            "active": [0, 9, "active", 0.5],
            "inert": 10
        }
    });

    var n = self.inputs.numReceptors;
    self.receptors = [];
    receptors = self.receptors;
    var recp;
    for (i=0; i < n; ++i) {
        recp = new createjs.Sprite(self.membraneChompSheet, "inert", false);
        initDiffusableMolecule(recp, {left: bounds.left, width: bounds.width, height: 0, top: bounds.top-140}, false);
        recp.x = recp.bounds.left + recp.bounds.width*(Math.random());
        recp.y = recp.bounds.top + recp.bounds.height*(Math.random());
        recp.scaleX = recp.scaleY = 1;
        recp.velY = 0;
        recp.velTheta = 0;

        // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
        _EASEL_STAGE.addChild(recp);
        receptors.push(recp);
    }

    n = self.inputs.numTfs;
    self.tfs = [];
    var tfs = self.tfs;
    var tf;
    for (i=0; i < n; ++i) {
        tf = new createjs.Sprite(self.proteinChompSheet, "inert");
        initDiffusableMolecule(tf, {left: bounds.left, width: bounds.width, height: 50, top: bounds.top});
        tf.x = tf.bounds.left + tf.bounds.width*(Math.random());
        tf.y = tf.bounds.top;// + (Math.random());
        tf.scaleX = tf.scaleY = 1;

        // Add Grant to the _EASEL_STAGE, and add it as a listener to Ticker to get updates each frame.
        _EASEL_STAGE.addChild(tf);          
        tfs.push(tf);
    }
};

two_component.tick = function(event) {
    var tf, rec, recp, i;
    var self = two_component;
    var percentActiveTFs = self.inputs.percentActiveTFs;
    var percentActiveMembranes = self.inputs.percentActiveMembranes;
    var receptors = self.receptors;
    var tfs = self.tfs;

    for (i=0; i < receptors.length; ++i) {
        rec = receptors[i];

        if (rec.currentAnimation !== 'active' && i < percentActiveMembranes*receptors.length) {
            rec.gotoAndPlay('active');
        } else {
            if (rec.currentAnimation !== 'inert' && i >= percentActiveMembranes*receptors.length) {
                rec.gotoAndPlay('inert');
            }
        }

        moveDiffusableMolecule(rec);
    }

    var bounds;
    for (i=0; i < tfs.length; ++i) {
        tf = tfs[i];

        if (tf.currentAnimation !== 'active' && i < percentActiveTFs*tfs.length) {
            tf.gotoAndPlay('active');
            bounds = self.inputs.activeBounds;
            initDiffusableMolecule(tf, bounds);
        } else {
            if (tf.currentAnimation !== 'inert' && i >= percentActiveTFs*tfs.length) {
                tf.gotoAndPlay('inert');
                bounds = self.inputs.inactiveBounds;
                initDiffusableMolecule(tf, {left: bounds.left, width: bounds.width, height: 50, top: bounds.top});
            }
        }

        moveDiffusableMolecule(tf);
    }
};
var protein_bursts = new AnimModule("protein bursts");

protein_bursts.init = function() {

    var self = protein_bursts;
    self.mrnaSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["mrna_wiggle.png"],
            "frames": {"regX": 0, "height": 26, "count": 10, "regY": 0, "width": 100},
            "animations": {
                "wiggle": [0, 9, "wiggle", 0.3]
            }
        });

    self.protSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["protein_green_grey.png"],
            "frames": {"regX": 0, "height": 50, "count": 10, "regY": 0, "width": 60.5},
            "animations": {
                "grey": [0,0,"green", 0.02],
                "green": 1
            }
        });

    self.mrnas = [];
    self.existingProts = [];
    self.newProts = [];
    self.inputs.startLocation = {x:0, y:0};
    self.inputs.burstRNA = 0;
    self.inputs.burstProt = 0;
    self.delayRNA = 300;
    self.delayProt = 30;
    self.time = 0;
};

protein_bursts.tick = function(event) {

    var self = protein_bursts;
    var mrnas = self.mrnas;
    var existingProts = self.existingProts;
    var newProts = self.newProts;
    var mrna;
    var prot;
    var rnaStartBounds = self.inputs.rnaStartBounds;
    var burstRNA = self.inputs.burstRNA;
    var burstProt = self.inputs.burstProt;
    var bounds = self.inputs.bounds;
    if (!rnaStartBounds) return;

    var dt = (event.time - self.time);

    if (mrnas.length < burstRNA && self.delayRNA < dt) {
        mrna = new createjs.Sprite(self.mrnaSheet, "wiggle");
        mrna.x = rnaStartBounds.left + Math.random()*20;
        mrna.y = rnaStartBounds.top - 20;
        mrna.scaleY = 1;
        mrna.scaleX = 1;
        _EASEL_STAGE.addChild(mrna);
        mrnas.push(mrna);
        self.time = event.time;

        initDiffusableMolecule(mrna, bounds, false, 2);
        mrna.velY = - Math.abs(mrna.velY) - 0.7;
    }

    if (mrnas.length > 3 && newProts.length < burstProt && self.delayProt < dt) {
        prot = new createjs.Sprite(self.protSheet, "grey");
        prot.x = mrnas[mrnas.length-1].x + 5;
        prot.y = mrnas[mrnas.length-1].y;
        prot.scaleY = 1;
        prot.scaleX = 1;
        _EASEL_STAGE.addChild(prot);
        newProts.push(prot);
        self.time = event.time;

        initDiffusableMolecule(prot, bounds);
    }
    
    var allRNADead = true;

    for (i=0; i < mrnas.length; ++i) {

        if (mrnas[i]) {
            allRNADead = false;
            moveDiffusableMolecule(self.mrnas[i]);

            if (mrnas[i].y < bounds.top + bounds.height*0.6) {

                mrnas[i].alpha = 0.5;

                if (mrnas[i].y < bounds.top + bounds.height*0.5) {

                    mrnas[i].alpha = 0.2;

                    if (mrnas[i].y < bounds.top + bounds.height*0.3) {
                        _EASEL_STAGE.removeChild(mrnas[i]);
                        mrnas[i] = undefined;
                    }
                }
            }
        }

    }

    if (allRNADead && mrnas.length > 0) {
        mrnas.length = 0;
        self.existingProts = self.existingProts.concat(newProts);
        self.newProts.length = 0;
        self.inputs.burstRNA = 0;
        self.time = event.time;
    }

    for (i=0; i < self.existingProts.length; ++i) {
        moveDiffusableMolecule(self.existingProts[i]);
    }

    for (i=0; i < self.newProts.length; ++i) {
        moveDiffusableMolecule(self.newProts[i]);
    }
};
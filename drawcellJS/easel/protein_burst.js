var protein_bursts = createAnimModule("protein bursts");

protein_bursts.init = function(_EASEL_STAGE, scene) {

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
    self.inputs.burstRNA = 5;
    self.inputs.burstProt = 12;
};

protein_bursts.tick = function(event) {

    var self = protein_bursts;
    var mrnas = self.mrnas;
    var existingProts = self.existingProts;
    var newProts = self.newProts;
    var mrna;
    var prot;
    var delayRNA = 26, delayProt = 11;
    var location = self.inputs.startLocation;
    var burstRNA = self.inputs.burstRNA;
    var burstProt = self.inputs.burstProt;
    if (!location) return;

    if (mrnas.length < burstRNA && delayRNA > 25) {
        mrna = new createjs.Sprite(mrnaSheet, "wiggle");
        mrna.x = location.x + Math.random()*20;
        mrna.y = location.y
        mrna.scaleY = 1;
        mrna.scaleX = 1;
        _EASEL_STAGE.addChild(mrna);
        mrnas.push(mrna);
        delayRNA = 0;
    }

    if (mrnas.length > 3 && newProts.length < burstProt && delayProt > 10) {
        prot = new createjs.Sprite(protSheet, "grey");
        prot.x = mrnas[mrnas.length-1].x + 5;
        prot.y = mrnas[mrnas.length-1].y;
        prot.scaleY = 1;
        prot.scaleX = 1;
        _EASEL_STAGE.addChild(prot);
        newProts.push(prot);
        delayProt = 0;

        initDiffusableMolecule(prot, scene);
    }

    delayRNA = delayRNA + 1;
    delayProt = delayProt + 1;
    var allRNADead = true;

    for (i=0; i < mrnas.length; ++i) {

        if (mrnas[i]) {
            allRNADead = false;
            mrnas[i].x = mrnas[i].x + (Math.random()-0.5) * 4;
            mrnas[i].y = mrnas[i].y - Math.random() * 2;

            if (mrnas[i].y < scene.top + scene.height*0.6) {

                mrnas[i].alpha = 0.5;

                if (mrnas[i].y < scene.top + scene.height*0.10) {
                    _EASEL_STAGE.removeChild(mrnas[i]);
                    mrnas[i] = undefined;
                }
            }
        }

    }

    if (allRNADead && mrnas.length > 0) {
        mrnas.length = 0;
        existingProts = existingProts.concat(newProts);
        newProts.length = 0;
        parameters.protein_bursts.burstRNA = 0;
        delayRNA = 11;
        delayProt = 6;
    }

    for (i=0; i < existingProts.length; ++i) {
        moveDiffusableMolecule(existingProts[i]);
    }

    for (i=0; i < newProts.length; ++i) {
        moveDiffusableMolecule(newProts[i]);
    }
};
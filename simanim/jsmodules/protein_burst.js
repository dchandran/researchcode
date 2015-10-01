function ProteinProduction() {
    var module = AnimModule();

    module.onInit( function() {

        var self = module;
        self.mrnaSheet = {
                framerate: 30,
                "images": ["mrna_wiggle.png"],
                "frames": {"regX": 0, "height": 26, "count": 10, "regY": 0, "width": 100},
                "animations": {
                    "wiggle": [0, 9, "wiggle", 0.3]
                }
            };

        self.protSheet = {
                framerate: 30,
                "images": ["protein_green_grey.png"],
                "frames": {"regX": 0, "height": 50, "count": 10, "regY": 0, "width": 60.5},
                "animations": {
                    "grey": [0,0,"green", 0.02],
                    "green": 1
                }
            };

        self.mrnas = [];
        self.proteins = [];
        self.inputs.startLocation = {x:0, y:0};
        self.inputs.numRNA = self.inputs.numRNA || 0;
        self.inputs.numGFP = self.inputs.numGFP || 0;
        self.delayRNA = 30;
        self.delayProt = 30;
        self.inputs.cds = null;
        self.time = 0;
        self.outputs.mRNAPos = self.outputs.mRNAPos || {};
    });

    module.onTick( function(event) {

        var self = module;
        var mrnas = self.mrnas;
        var proteins = self.proteins;
        var mrna;
        var prot;
        var cds = self.inputs.cds;
        var numRNA = self.inputs.numRNA || 0;
        var numGFP = self.inputs.numGFP || 0;
        var bounds = self.inputs.bounds;
        if (!cds) return;

        var dt = (event.time - self.time);

        while (mrnas.length > numRNA) {
            mrnas[mrnas.length-1].degrade();
            mrnas.length = mrnas.length-1;
        }

        while (proteins.length > numGFP) {
            proteins[proteins.length-1].degrade();
            proteins.length = proteins.length-1;
        }

        if (mrnas.length < numRNA && self.delayRNA < dt) {
            mrna = Molecule(self.mrnaSheet, "wiggle");
            mrna.x = cds.x + Math.random()*20;
            mrna.y = cds.y - 20;
            mrna.scaleY = 1;
            mrna.scaleX = 1;            
            mrnas.push(mrna);
            self.time = event.time;

            mrna.setBounds(bounds);
            mrna.setSpeed(5,false);
            mrna.velY = - Math.abs(mrna.velY) - 0.7;
        }

        if (mrnas.length > 0) {
            var lastx = mrnas[mrnas.length-1].x + 5;
            var lasty = mrnas[mrnas.length-1].y;

            self.outputs.mRNAPos.x = lastx;
            self.outputs.mRNAPos.y = lasty;
        } else {
            self.outputs.mRNAPos.x = cds.x + Math.random()*20;
            self.outputs.mRNAPos.y = cds.y - 20;
        }

        if (mrnas.length > 0 && proteins.length < numGFP && self.delayProt < dt) {
            prot = Molecule(self.protSheet, "grey");
            prot.x = lastx;
            prot.y = lasty;
            prot.scaleY = 1;
            prot.scaleX = 1;
            
            proteins.push(prot);
            self.time = event.time;

            prot.setBound(bounds);
            prot.setSpeed(2,true);
        }
        
        var allRNADead = true;

        if (!self.isPaused()) {
            for (i=0; i < mrnas.length; ++i) {
                if (mrnas[i]) {
                    allRNADead = false;
                    self.mrnas[i].diffuse();

                    if (mrnas[i].y < bounds.top + bounds.height*0.2) {
                        mrna = mrnas[i];
                        mrna.x = cds.x + Math.random()*20;
                        mrna.y = cds.y - 20;
                        mrna.setBounds(bounds);
                        mrna.setSpeed(2,false);
                        mrna.velY = - Math.abs(mrna.velY) - 0.7;
                    }
                }
            }

            for (i=0; i < self.proteins.length; ++i) {
                self.proteins[i].diffuse();
            }
        }
    });

    return module;
}

registerModuleType("protein bursts", ProteinProduction);

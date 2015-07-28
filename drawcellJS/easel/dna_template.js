var dna_template = new AnimModule("dna template");

dna_template.init = function() {
    var self = dna_template;
    var scene = self.inputs.bounds;        

    var dnaSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["DNA.png"],
            "frames": {"regX": 0, "height": 50, "count": 1, "regY": 0, "width": 90},
            "animations": {
                "normal": 0
            }
        });

    var dnaStrand;
    var y = scene.top + scene.height*0.75;
    scene.left = scene.left + 100;
    scene.width = scene.width - 200;

    for (var i=0; i <= scene.width; i = i + 90*0.3) {
        dnaStrand = new createjs.Sprite(dnaSheet, "normal");
        dnaStrand.x = scene.left + i;
        dnaStrand.y = y;            
        dnaStrand.scaleY = 0.3;
        dnaStrand.scaleX = 0.3;
        _EASEL_STAGE.addChild(dnaStrand);
    }

    self.outputs.bounds = {left: scene.left, width: scene.width, top: y, height:10};
};
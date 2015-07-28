var lipid_bilayer = createAnimModule("lipid bilayer");

lipid_bilayer.init = function() {

    var self = lipid_bilayer;
    var scene = self.inputs.bounds;

    var bilayerSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["bilayer.png"],
            "frames": {"regX": 0, "height": 53, "count": 1, "regY": 0, "width": 9},
            "animations": {
                "normal": 0
            }
        });

    var bilayer;
    for (var i=0; i <= scene.width; i = i + 9) {
        bilayer = new createjs.Sprite(bilayerSheet, "normal");
        bilayer.x = i;
        bilayer.y = scene.top + 100;
        _EASEL_STAGE.addChild(bilayer);
    }

    self.outputs.bounds = scene;
    self.outputs.bounds.top = scene.top + 150;
    self.outputs.bounds.height = scene.height - 150;
};
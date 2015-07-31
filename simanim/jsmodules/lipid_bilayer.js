var lipid_bilayer = new AnimModule("lipid bilayer");

lipid_bilayer.init = function() {

    var self = lipid_bilayer;
    var scene = self.inputs.bounds;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("#333333").drawRect(scene.left, scene.top + 100, scene.width, scene.height);
    _EASEL_STAGE.addChild(bg);    

    var bilayerSheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["bilayer.png"],
            "frames": {"regX": 0, "height": 43, "count": 1, "regY": 0, "width": 9},
            "animations": {
                "normal": 0
            }
        });

    var bilayer;
    for (var i=0; i <= scene.width; i = i + 9) {
        bilayer = new createjs.Sprite(bilayerSheet, "normal");
        bilayer.x = i + scene.left;
        bilayer.y = scene.top + 100;
        _EASEL_STAGE.addChild(bilayer);
    }

    self.outputs.bounds = scene;
    self.outputs.bounds.top = scene.top + 200;
    self.outputs.bounds.height = scene.height - 150;
};
function LipidBilayer(name,typename) {
    var module = AnimModule(name, typename);

    module.onInit( function() {

        var self = module;
        var scene = self.inputs.bounds;

        var bg = new createjs.Shape();
        bg.graphics.beginFill("#222233").drawRect(scene.left, scene.top + 100, scene.width, scene.height);
        _EASEL_STAGE.addChild(bg);

        var bilayerSheetInfo = {
                framerate: 30,
                "images": ["bilayer.png"],
                "frames": {"regX": 0, "height": 43, "count": 1, "regY": 0, "width": 9},
                "animations": {
                    "normal": 0
                }
            };

        var bilayerSheet = new createjs.SpriteSheet(bilayerSheetInfo);

        var bilayer;
        for (var i=0; i <= scene.width; i = i + 9) {
            bilayer = new createjs.Sprite(bilayerSheet, "normal");
            bilayer.x = i + scene.left;
            bilayer.y = scene.top + 100;
            _EASEL_STAGE.addChild(bilayer);
        }

        self.outputs.outerCellBounds = {left: scene.left, top: scene.top, height: 100, width: scene.width};
        self.outputs.innerCellBounds = {left: scene.left, top: scene.top+200, height: scene.height-150, width: scene.width};
    });
    return module;
}
registerModuleType("lipid bilayer", LipidBilayer);

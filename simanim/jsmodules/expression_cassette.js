var expression_cassette = new AnimModule("expression cassette");

expression_cassette.init = function() {

    var self = expression_cassette;
    self.partTypeSpriteHash = {
        'promoter': new createjs.SpriteSheet({
                        framerate: 30,
                        "images": ["SBOL/promoter.png"],
                        "frames": {"regX": 0, "height": 220, "count": 2, "regY": 0, "width": 170},
                        "animations": {
                            "off": 0,
                            "on": 1
                        }
                    }),
        'cds':      new createjs.SpriteSheet({
                        framerate: 30,
                        "images": ["SBOL/CDS.png"],
                        "frames": {"regX": 0, "height": 101, "count": 2, "regY": 0, "width": 225},
                        "animations": {
                            "off": 0,
                            "on": 1
                        }
                    })
    };

    self.parts = [];
};

expression_cassette.tick = function(event) {

    var self = expression_cassette;
    var bounds = self.inputs.bounds;
    var part, desc, i, sheet;
    var partDesc = self.inputs.parts; //e.g. { p: {type:'promoter', state:'off'}, gfp:{type:'cds', state:'off'} }
    var partTypeSpriteHash = self.partTypeSpriteHash;
    var parts = self.parts;
    var x = bounds.left, y = bounds.top;
    var j = 0, n = Object.keys(partDesc).length;
    var state = self.inputs.state;

    if (partDesc) {
        for (i in partDesc) {
            desc = partDesc[i];
            if (desc) { 
                part = parts[i];
                if (part) {                    
                    if (state)
                        part.gotoAndPlay("on");
                    else
                        part.gotoAndPlay("off");
                } else {
                    sheet = partTypeSpriteHash[desc.type];
                    if (sheet) {
                        if (state)
                            part =  new createjs.Sprite(sheet, "on");
                        else
                            part =  new createjs.Sprite(sheet, "off");
                        part.scaleY = part.scaleX = 0.3;
                        _EASEL_STAGE.addChild(part);
                        parts[i] = part;
                    }
                }
                part.x = x;
                bounds = part.getBounds();
                if (bounds) {
                    if (j == 0) {
                        self.outputs.firstPartBounds = {
                            left: x, 
                            top: y,
                            width: bounds.width * 0.3,
                            height: bounds.height * 0.3
                        };
                        self.updateDownstream();
                    } else {
                        if (j == (n-1)) {
                            self.outputs.lastPartBounds = {
                                left: x, 
                                top: y,
                                width: bounds.width * 0.3,
                                height: bounds.height * 0.3
                            };
                        }
                        self.updateDownstream();
                    }
                    x = x + bounds.width * 0.3;
                    part.y = y - bounds.height * 0.3;
                }
            }
            j = j + 1;
        }
    }
};

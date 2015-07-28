var expression_cassette = createAnimModule("expression cassette");

expression_cassette.init = function(_EASEL_STAGE, scene) {

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
    var location = self.inputs.startLocation;
    var part, desc, i, sheet;
    var partDesc = self.inputs.parts; //e.g. { p: {type:'promoter', state:'off'}, gfp:{type:'cds', state:'off'} }
    var partTypeSpriteHash = self.partTypeSpriteHash;
    var parts = self.parts;
    var x = location.x;

    if (partDesc) {
        for (i in partDesc) {
            desc = partDesc[i];
            if (desc) { 
                part = parts[i];
                if (part) {
                    state = desc.state;
                    if (state)
                        part.gotoAndPlay(state);
                } else {
                    sheet = partTypeSpriteHash[desc.type];
                    state = desc.state;
                    if (sheet && state) {
                        part =  new createjs.Sprite(sheet, state);                              
                        part.scaleY = part.scaleX = 0.3;
                        _EASEL_STAGE.addChild(part);
                        parts[i] = part;
                    }
                }
                part.x = x;
                x = x + part.getBounds().width * 0.3;
                part.y = location.y;
            }
        }
    }

    self.outputs.endLocation = {x: x - 100, y: location.y - 20};
};

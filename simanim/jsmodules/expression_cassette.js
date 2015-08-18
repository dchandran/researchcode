function ExpressionCassette(name,typename) {
    var module = new AnimModule(name, typename);
    module.submodules.protein_bursts = createModuleFromType(name + "-submodule", "protein bursts");

    module.init = function() {

        var self = module;
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
        self.partsCached = [];        
        self.initSubmodules();
        self.connect('lastPart', self.submodules.protein_bursts, 'cds');
    };

    module.tick = function(event) {

        var self = module;

        var orientation = self.inputs.orientation || 'f';
        var startPos = self.inputs.startPos;

        if (!startPos) return;
        
        var part, desc, i, sheet;
        var partDesc = self.inputs.parts; //e.g. { p: {type:'promoter', state:'off'}, gfp:{type:'cds', state:'off'} }
        var partTypeSpriteHash = self.partTypeSpriteHash;
        var parts = self.parts;
        var partsCached = self.partsCached;
        var x = startPos.x || 0, y = startPos.y || 0;
        var j = 0, n = Object.keys(partDesc).length;
        var state = self.inputs.state;

        if (partDesc) {
            for (i in partDesc) {
                desc = partDesc[i];
                if (desc && partsCached[i] != desc)  {
                    part = parts[i];
                    partsCached[i] = part;
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
                            self.outputs.firstPart = part;                            
                        } else {
                            if (j == (n-1)) {
                                self.outputs.lastPart = part;
                            }
                        }
                        if (orientation[0]==='r') {
                            x = x - bounds.width * 0.3;
                            part.rotation = 180;
                            part.y = y + bounds.height * 0.3;
                        } else {
                            x = x + bounds.width * 0.3;
                            part.y = y - bounds.height * 0.3;
                        }
                    }
                }
                j = j + 1;
            }
        }
        
        
        self.tickSubmodules(event);
        self.updateDownstream();
    };

    return module;
}
registerModuleType("expression cassette", ExpressionCassette);

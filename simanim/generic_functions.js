var _MODULES = {};
var _MODULETYPES = {};
var _DEGRADING_MOLECULES = [];

function registerModuleType(typename, constructor) {
    _MODULETYPES[typename] = constructor;
}

function createModuleFromType(name,typename) {
    var constructor = _MODULETYPES[typename];
    if (constructor) {
        var module = constructor();
        module.name = name;
        module.family = typename;
        return module;
    }
}

function getAllModules() {
    var lst = [];
    for (var i in _MODULES) {
        lst.push(_MODULES[i]);
    }
    return lst;
}

function AnimModule(name, family) {
    var that = {};
    that.name = name;
    that.family = family;
    that.inputs = {};
    that.outputs = {};
    that.submodules = {};
    that.init = null;
    that.connections = [];

    _MODULES[name] = that;

    that.tick = function(evt) {
        if (that.tickFunc) {
            that.tickFunc(evt);
            that.updateDownstream();
        }
    };

    that.isPaused = function() {
        return createjs.Ticker.getPaused();
    };

    that.initSubmodules = function() {
        var i;
        var module;
        for (i in this.submodules) {
            module = this.submodules[i];
            if (isModule(module) && module.init) {
                module.init();
            }
        }
    };

    that.tickSubmodules = function(e) {
        var i,j, outputs;
        var inputs = this.inputs;
        var module;
        for (i in this.submodules) {
            module = this.submodules[i];
            if (isModule(module)) {
                for (j in inputs) {
                    module.inputs[j] = this.inputs[j];
                }
            }
        }

        for (i in this.submodules) {
            module = this.submodules[i];
            if (isModule(module)) {
                module.tick(e);
            }
        }

        for (i in this.submodules) {
            module = this.submodules[i];
            if (isModule(module)) {
                outputs = module.outputs;
                for (j in outputs) {
                    this.outputs[j] = module.outputs[j];
                }
            }
        }
    };

    that.connect = function(output, targetModule, input) {
        if (targetModule) {
            this.connections.push({
                output: output,
                targetModule: targetModule,
                input: input
              });
            if (this.outputs[output]===undefined) {
                this.outputs[output] = 0;
            }
            targetModule.inputs[input] = this.outputs[output];
        }
    };

    that.updateDownstream = function() {
        var targetModule, input, output;
        for (var i=0; i < this.connections.length; ++i) {
            targetModule = this.connections[i].targetModule;
            input = this.connections[i].input;
            output = this.connections[i].output;
            targetModule.inputs[input] = this.outputs[output];
        }
    };

    that.onTick = function(f) {
        that.tickFunc = f;
    };

    that.onInit = function(f) {
        that.init = f;
    };

    return that;
}

function isModule(obj) {
    return obj.inputs !== undefined &&
           obj.outputs !== undefined &&
           obj.isPaused !== undefined &&
           obj.connect !== undefined;
}


function Molecule(spritesheetinfo, spritestart) {
    var spritesheet = new createjs.SpriteSheet(spritesheetinfo);
    var that = new createjs.Sprite(spritesheet, spritestart);

    that.diffuse = function() {
        var m = this;

        var bounds = m.bounds;

        if (m.target) {
            if (m.target.parent === m.parent) {
                var x = m.target.x;
                var y = m.target.y;
                var dist = (m.x - x)*(m.x - x) + (m.y - y)*(m.y - y);
                if (dist < 25) {
                    //m.rotation = 0;
                    //m.target.rotation = 0;
                    m.x = x;
                    m.y = y;
                    return;
                }
            }

            bounds = { left: x - 10, top: y - 10, width: 20, height: 20};
        }

        if (!bounds) return;

        var right = bounds.left + bounds.width;
        var bottom = bounds.top + bounds.height;
        var outside = false;
        var vX = m.velX, vY = m.velY;

        if (m.x > right) {
            m.velX = - Math.abs(m.velX);
            vX = m.velX - 0.2;
            outside = true;
        }
        if (m.x < bounds.left) {
            m.velX = Math.abs(m.velX);
            vX = m.velX + 0.2;
            outside = true;
        }
        if (m.y < bounds.top) {
            m.velY = Math.abs(m.velY);
            vY = m.velY + 0.2;
            outside = true;
        }
        if (m.y > bottom) {
            m.velY = - Math.abs(m.velY);
            vY = m.velY - 0.2;
            outside = true;
        }

        if (outside) {
            m.x = m.x +  10*Math.abs(0.01+m.velX)*(bounds.left + bounds.width/2 - m.x)/(1+bounds.width);
            m.y = m.y +  10*Math.abs(0.01+m.velY)*(bounds.top + bounds.height/2 - m.y)/(1+bounds.height);
        } else {
            m.x = m.x + vX;
            m.y = m.y + vY;
        }

        if (m.allowRotation) {
            m.rotation = m.rotation + m.velTheta;
            if (m.rotation < 0) m.rotation = 360;
            if (m.rotation > 360) m.rotation = 0;

            if (Math.random() < 0.01) {
                m.velTheta = Math.random() - 0.5;
            }

            if (Math.random() < 0.01) {
                if (m.velX !== 0)
                    m.velX = m.speed*(Math.random() - 0.5);
                if (m.velY !== 0)
                    m.velY = m.speed*(Math.random() - 0.5);
                if (m.velTheta !== 0)
                    m.velTheta = m.speed*(Math.random() - 0.5);
            }
        }
    };

    that.setSpeed = function(speed, rotate) {
        var m = this;

        if (rotate===undefined) {
            rotate = true;
        }

        if (!speed) {
            speed = 1.0;
        }

        if (rotate) {
            m.rotation = 360*Math.random();
            m.velTheta = speed*(Math.random() - 0.5);
        } else {
            m.velTheta = 0;
        }

        m.speed = speed;

        m.allowRotation = rotate;
        m.velX = speed*(Math.random() - 0.5);
        m.velY = speed*(Math.random() - 0.5);
    };

    that.setBounds = function(bounds) {
        this.bounds = bounds;
    };

    that.degrade = function() {
        markForDegradation(this);
    };

    _EASEL_STAGE.addChild(that);

    that.x = 0;
    that.y = 0;
    that.setSpeed(5,false);

    return that;
}


function markForDegradation(item) {
    _DEGRADING_MOLECULES.push(item);
}

function degradationAnimation(event) {
    var allDone = true;
    for (i=0; i < _DEGRADING_MOLECULES.length; ++i) {
        if (_DEGRADING_MOLECULES[i]) {
            allDone = false;
            _DEGRADING_MOLECULES[i].alpha -= 0.1 * Math.random();
            if (_DEGRADING_MOLECULES[i].alpha < 0.1) {
                _EASEL_STAGE.removeChild(_DEGRADING_MOLECULES[i]);
                _DEGRADING_MOLECULES[i] = undefined;
            }
            if (Math.random() > 0.8) break;
        }
    }
    if (allDone) {
        _DEGRADING_MOLECULES.length = 0;
    }
}

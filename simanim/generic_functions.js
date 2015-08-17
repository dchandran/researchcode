var _MODULES = {};
var _MODULETYPES = {};
var _DEGRADING_MOLECULES = [];

function registerModuleType(typename, constructor) {
    _MODULETYPES[typename] = constructor;
}

function createModuleFromType(name, typename) {
    var constructor = _MODULETYPES[typename];
    if (constructor) {
        return constructor(name, typename);
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
    this.name = name;
    this.family = family;
    this.inputs = {};
    this.outputs = {};
    this.init = null;
    this.tick = null;

    this.connections = [];

    _MODULES[name] = this;
    return this;
}

AnimModule.prototype = {
    isPaused: function() {
        return createjs.Ticker.getPaused();
    },

    connect: function(output, targetModule, input) {
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
    },

    updateDownstream: function() {
        var targetModule, input, output;
        for (var i=0; i < this.connections.length; ++i) {
            targetModule = this.connections[i].targetModule;
            input = this.connections[i].input;
            output = this.connections[i].output;
            targetModule.inputs[input] = this.outputs[output];
        }
    }
};

function initDiffusableMolecule(m, bounds, rotate, speed) {
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
    m.bounds = bounds;
}

function moveDiffusableMolecule(m) {
    var bounds = m.bounds;
    if (!bounds) return;

    if (m.target) {
        if (m.target.parent === m.parent) {
            var x = m.target.x;
            var y = m.target.y;
            var dist = (m.x - x)*(m.x - x) + (m.y - y)*(m.y - y);
            if (dist < 25) {
                m.rotation = 0;
                m.target.rotation = 0;
                m.x = x;
                m.y = y;
                return;
            }
        }

        bounds = { left: x - 10, top: y - 10, width: 20, height: 20};
    }

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
        m.x = m.x +  10*Math.abs(m.velX)*(bounds.left + bounds.width/2 - m.x)/(1+bounds.width);
        m.y = m.y +  10*Math.abs(m.velY)*(bounds.top + bounds.height/2 - m.y)/(1+bounds.height);
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

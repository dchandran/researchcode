var _MODULES = {};

function getAllModules() {
    var lst = [];
    for (var i in _MODULES) {
        lst.push(_MODULES[i]);
    }
    return lst;
}

function AnimModule(name) {
    this.name = name;
    this.inputs = {};
    this.outputs = {};
    this.init = null;
    this.tick = null;

    this.connections = [];

    _MODULES[name] = this;
    return this;
}

AnimModule.prototype = {
    connect: function(output, targetModule, input) {
        if (targetModule) {
            this.connections.push({ 
                output: output, 
                targetModule: targetModule,
                input: input
              });
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

    if (rotate) {
        m.rotation = 360*Math.random();
    }

    if (!speed) {
        speed = 1.0;
    }

    m.speed = speed;

    m.allowRotation = rotate;
    m.velX = speed*(Math.random() - 0.5);
    m.velY = speed*(Math.random() - 0.5);
    m.velTheta = (Math.random() - 0.5);
    m.bounds = bounds;
}

function moveDiffusableMolecule(m) {
    var right = m.bounds.left + m.bounds.width;
    var bottom = m.bounds.top + m.bounds.height;
    var outside = false;
    var vX = m.velX, vY = m.velY;

    if (m.x > right) {
        m.velX = - Math.abs(m.velX);
        vX = m.velX - 0.2;
        outside = true;
    }
    if (m.x < m.bounds.left) {
        m.velX = Math.abs(m.velX);
        vX = m.velX + 0.2;
        outside = true;
    }
    if (m.y < m.bounds.top) {
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
        m.x = m.x + 5*vX;
        m.y = m.y + 5*vY;
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
        }
    }
}


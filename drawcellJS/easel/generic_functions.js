var _MODULES = {};

function createAnimModule(name) {
    _MODULES[name] = {
        name:name, 
        inputs: {}, 
        outputs: {},
        init: {},
        tick: {}
    };
    return _MODULES[name];
}

function initDiffusableMolecule(m, bounds, rotate) {
    if (rotate===undefined) {
        rotate = true;
    }

    if (rotate) {
        m.rotation = 360*Math.random();
    }

    m.allowRotation = rotate;
    m.velX = 0.7*(Math.random() - 0.5);
    m.velY = 0.7*(Math.random() - 0.5);
    m.velTheta = (Math.random() - 0.5);
    m.bounds = bounds;
}

function moveDiffusableMolecule(m) {
    m.x = m.x + m.velX;
    m.y = m.y + m.velY;
    var right = m.bounds.left + m.bounds.width;
    var bottom = m.bounds.top + m.bounds.height;

    if (m.x > right) {
        m.x = right;
        m.velX = - m.velX;
    }
    if (m.x < m.bounds.left) {
        m.x = m.bounds.left;
        m.velX = - m.velX;
    }
    if (m.y < m.bounds.top) {
        m.y = m.bounds.top;
        m.velY = - m.velY;
    }
    if (m.y > bottom) {
        m.y = bottom;
        m.velY = - m.velY;
    }

    if (m.allowRotation) {
        m.rotation = m.rotation + m.velTheta;
        if (m.rotation < 0) m.rotation = 360;
        if (m.rotation > 360) m.rotation = 0;

        if (Math.random() < 0.01) {
            m.velTheta = Math.random() - 0.5;
        }
    }
}
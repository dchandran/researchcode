var _SceneComponents = {};
var _SceneReactions = {};
var _ReactionLayer = null;
var _ComponentsLayer = null;
var _ARROWHEADSCALE = 5; //x line width
var _ARROWHEADCTRLDIST = 10; //hard coded

var distance = function(p1, p2) {
  return ((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
}

function placeItemOnPath(group, parentPath, offset) {
  var offset = group.data.offset * parentPath.length;       
  var p = parentPath.getPointAt( offset );

  if (!group.data.align || group.data.align === 'center') {
      group.position.x = p.x;
      group.position.y = p.y;
  } else {
      var norm = parentPath.getNormalAt( offset );
      if (group.data.align === 'top') {
          p = p.add(norm.normalize(group.bounds.height/2));
          group.position.x = p.x;
          group.position.y = p.y;
      } else {
          if (group.data.align === 'bottom') {
              p = p.subtract(norm.normalize(group.bounds.height/2));
              group.position.x = p.x;
              group.position.y = p.y;
          }
       }
  }
  if (group.data.oldAngle) {
    group.rotate(-group.data.oldAngle);  
  }

  group.data.angle = parentPath.getTangentAt(offset).angle;
  group.rotate(group.data.angle);
}

function createInnermembrane(path, group) {
  var path2 = path.clone();
  var bounds = path.bounds;
  var ratioW = 0.9;
  var ratioH = ratioW;
  if (Math.min(bounds.height,bounds.width)/Math.max(bounds.height,bounds.width) < 0.8) {
    ratioH = ratioW + (ratioW - 1)*(bounds.height/bounds.width);
  }
  //path2.scale(ratioW, ratioH);
  path2.scale(ratioW);
  group.addChild(path2);
}

function setFillStrokeColor(path, json, firstTime) {

  if (json.strokeColor || firstTime) {
    json.strokeColor = json.strokeColor || 'black';
    path.strokeColor = json.strokeColor;
  }

  if (json.strokeWidth) {
    path.strokeWidth = json.strokeWidth;
  }


  if (typeof(json.fillColor) === 'object' && typeof(json.fillColor.origin)==='string') {
    if (json.fillColor.origin) {
      json.fillColor.origin = eval(json.fillColor.origin);
    }
    if (json.fillColor.destination) {
      json.fillColor.destination = eval(json.fillColor.destination);
    }
  }

  if (json.fillColor || firstTime) {
    json.fillColor = json.fillColor || 'white';
    path.fillColor = json.fillColor;
  }
}

function getSceneReaction(name) {
  return _SceneReactions[name];
}


//the second arg is a multi-purpose arg (name is misleading)
//when second arg is true, returns all items under this name
//when second arg is a point, returns closest item
function getSceneComponent(name, closestPosition) {
  if (_SceneComponents[name]) 
    return _SceneComponents[name];

  var name2, obj, dist, closestObj;
  var array = [];
  var i = 1;

  while (true) { //eek!
    name2 = name + '[' + i + ']';
    i = i+1;

    obj = _SceneComponents[name2];
    if (obj) {
        if (closestPosition === true) { //get all items
          array.push(obj);
        } else {
          if (!closestPosition) 
            return obj;
          
          if (dist===undefined || distance(obj.position,closestPosition) < dist) {
            closestObj = obj;
            dist = distance(obj.position,closestPosition);
          }
        }
    } else {
      break;
    }
  }
  if (closestPosition===true && array.length > 0) return array;
  return closestObj;
}

function saveSceneComponent(name, object) {
  _SceneComponents[name] = object;
}


function updateSceneArray(jsonArray) {
  var lst = {}, component;
  for (i=0; i < jsonArray.length; ++i) {
    component = updateScene(jsonArray[i]);
    if (component) {
      lst[component.data.name] = component;
    }
  }
  return lst;
}


function parseDescription(s) {
  var re1 = /(\S+)\s+named\s+(\S+)/gi;
  var re2a = /at\s+\((\d+)\s*,\s*(\d+)\)/gi;
  var re2b = /at\s+(0\.\d+)\s+/gi;
  var re4a = /inside\s+(\S+)/gi;
  var re4b = /inside\s+["']([^"']+)["']/gi;
  var re3 = /style\s*\:\s*({[^}]+})/gi;
  
  var m1 = re1.exec(s);
  var m2, m3, m4;
  
  var json, style, i;

  if (m1 && m1[1] && m1[2]) {
    json = {};
    s.replace(m1[0],"");
    json.inputStrings = [m1[0]];
    json.type = m1[1];
    json.name = m1[2];

    m1 = re1.exec(s);

    m2 = re2a.exec(s);
    if (m1 && m2 && m2.index > m1.index) {
      m2 = null;
    }
    if (m2===null || m2===undefined) {
      m2 = re2b.exec(s);
    }
    if (m1 && m2 && m2.index > m1.index) {
      m2 = null;
    }
    m3 = re3.exec(s);
    if (m1 && m3 && m3.index > m1.index) {
      m3 = null;
    }
    m4 = re4a.exec(s);
    if (m1 && m4 && m4.index > m1.index) {
      m4 = null;
    }
    if (m4===null || m4===undefined) {
      m4 = re4b.exec(s);
    }
    if (m1 && m4 && m4.index > m1.index) {
      m4 = null;
    }

    if (m2) {
      if (m2.length === 3 && m2[1] !== undefined && m2[2] !== undefined) {
        json.position = {x: m2[1], y: m2[2]};        
      } else
      if (m2.length === 2 && m2[1] !== undefined) {
        debugger;
        json.position = {x: 0, y: 0};
        json.offset = m2[1];
      }
      json.inputStrings.push(m2[0]);
    }

    if (m3) {
      style = JSON.parse(m3[1]);
      for (i in style) {
        json[i] = style[i];
      }
      json.inputStrings.push(m3[0]);
    }

    if (m4) {
      json.inside = m4[1];
      json.inputStrings.push(m4[0]);
    }
  }

  if (json) {
    return json;
  }

  re1 = /Connect\s+(("\S+"\s*,)*\s*"\S+")\s+to\s+(("\S+"\s*,)*\s*"\S+")\s*/gi;
  re2 = /through\s+("\S+")/gi;
  re3 = /style\s*\:\s*({[^}]+})/gi;
  
  m1 = re1.exec(s);
  m2 = re2.exec(s);
  m3 = re3.exec(s);
  
  if (m1 && m1[1] && m1[3]) {
    json = {};
    json.inputStrings = [];
    json.from = JSON.parse("["+m1[1]+"]");
    json.to = JSON.parse("["+m1[3]+"]");
    json.type = "Connection";
    json.inputStrings.push(m1[0]);

    if (m2) {
      json.through = eval(m2[1]);
      json.inputStrings.push(m2[0]);
    }

    if (m3 && m3[1]) {
      style = JSON.parse(m3[1]);
      for (i in style) {
        json[i] = style[i];
      }
      json.inputStrings.push(m3[0]);
    }
  }

  return json;
}

function removeUnusedComponents(inUseItems) {
  var delList = [];
  var i;
  
  for (i in _SceneReactions) {
    if (inUseItems[i] === undefined || inUseItems[i] === null) {
      delList.push(i);
    }
  }
  
  for (i in _SceneComponents) {
    if (inUseItems[i] === undefined || inUseItems[i] === null) {
      delList.push(i);
    }
  }

  for (i=0; i < delList.length; ++i) {
    deleteObject(delList[i]);
  }
}

function scrapeCodeComments(code) {
  var commentsMarker = /"""|'''/gi;
  var lines = code.split(/\n|\r/);
  var i, i2, j, block, json;
  var jsonArray = [];
  block = null;
  for (i=0; i < lines.length; ++i) {
    if (commentsMarker.exec(lines[i])) {
      if (block !== null) {
        json = parseDescription(block);
        i2 = i;
        while (json !== undefined && json !== null) {
          if (json) {
            for (j=i+1; j < lines.length; ++j) {
              if (commentsMarker.exec(lines[j])) break;
            }
            json.lineNumbers = [ i, j ];
            jsonArray.push(json);
          } else {
            console.log(block);
          }
          for (j=0; j < json.inputStrings.length; ++j) {
            block = block.replace(json.inputStrings[j],"");
          }
          json = parseDescription(block);
          i2 = i2 + 1;
        }
        block = null;
      } else {
        block = "";
      }
    } else {
      if (block !== null) {
        block = block + " " + lines[i];
      }      
    }
  }
  return jsonArray;
}

function updateScene(json) {

  if (typeof(json)==='string') {
    json = parseDescription(json);
  }

  if (json.length !== undefined) {
    return updateSceneArray(json);
  }

  var objs = getSceneComponent(json.name, true);

  if (objs) {
    if (json.count) {
      var oldJson, i;
      if (objs && objs.length > 0) {
        oldJson = objs[0].data;
        for (i in oldJson) {
          if (!json[i]) {
            json[i] = oldJson[i];
          }
        }
        deleteObject(json.name);
      }
    } else {
      if (objs.length) {
        json.count = objs.length;
      }
    }
  }

  return updateSceneHelper(json);
}

function updateSceneHelper(json) {

  var i;
  
  //check if its a reaction
  if (json.from && json.from.length !== undefined &&
      json.to && json.to.length !== undefined) {
    var fromArray = [], toArray = [];
    var throughItem = undefined;
    var closestPosition = undefined;
    if (json.through) {
      throughItem = getSceneComponent(json.through);
      if (throughItem.length) 
        throughItem = throughItem[0];
      closestPosition = throughItem.position;
    }
    for (i=0; i < json.from.length; ++i) {
      if (getSceneComponent(json.from[i])) {
        fromArray.push(getSceneComponent( json.from[i] , closestPosition));
      }
    }

    for (i=0; i < json.to.length; ++i) {
      if (getSceneComponent(json.to[i])) {
        toArray.push(getSceneComponent( json.to[i] , closestPosition));
      }
    }

    delete json.toItems;
    delete json.fromItems;
    if (json.throughItem) {
      delete json.throughItem;
    }

    if (!json.name) {
      json.name = createReactionName(fromArray, toArray);
    }
    
    if (_SceneReactions[json.name]) {
      updateReactionCurve(_SceneReactions[json.name]);
    } else {
      createReactionCurve(fromArray, toArray, throughItem, json);
    }
    return _SceneReactions[json.name];
  }

  var name = json.name;
  var count = json.count;
  var parent = json.inside;
  if (parent) {
    parent = getSceneComponent(parent);
  }
  var type = json.type;
  var showName = (type !== null && type !== undefined && type.toLowerCase() !== "dot"); //show component name
  var text, textItem;
  var pos = json.position;
  if (count !== undefined && count !== null) {
    
    if (count < 1) return;

    json.count = json.count - 1;
    updateSceneHelper(json);

    var bounds;
    if (parent) {
      bounds = parent.bounds;
      pos = new paper.Point( bounds.left + bounds.width/4 + Math.random() * bounds.width*1/2, bounds.top + bounds.height/4 + Math.random() * bounds.height*1/2 );      
    } else {
      bounds = paper.project.view.bounds;
      pos = new paper.Point( bounds.left + Math.random() * bounds.width, bounds.top + Math.random() * bounds.height);
    }
    
    if (json.offset) {
      json.offset = Math.random();
    }
    if (json.angle !== undefined && json.angle !== null) {
      json.angle = Math.random() * 360;
    }
    name = name + '[' + count + ']';
  }

  if (!_PathData[type]) {
    type = 'Substrate';
  }

  if (_ComponentsLayer) {
    _ComponentsLayer.activate();
  }

  if (name) {
    var pathData = _PathData[type];
    var group = getSceneComponent(name);
    var path;
    var firstTime = false;
    if (!group) {
      firstTime = true;
      group = new paper.Group();
      path = new paper.Path(pathData);
      saveSceneComponent(name,group);
      group.data.oldAngle = 0;
      group.addChild(path);
    } else {
      if (!parent && group.data.inside) {
        parent = getSceneComponent(group.data.inside);
      }
    }

    if (group.data.angle) {
      group.data.oldAngle = group.data.angle;
    }

    for (var i in json) {
      group.data[i] = json[i];
    }

    group.data.name = name;
    
    path = group.getChildren()[0]; //main path

    if (pos || firstTime) {
      pos = pos || {x:0,y:0};      
      group.position.x = group.position.x + (pos.x - path.position.x);
      group.position.y = group.position.y + (pos.y - path.position.y);    
    }

    bounds = path.bounds;
    var topLeft = bounds.topLeft;
    var topRight = bounds.topRight;
    var bottomLeft = bounds.bottomLeft;
    var bottomRight = bounds.bottomRight;
    var centerLeft = bounds.leftCenter;
    var centerRight = bounds.rightCenter;
    var centerTop = bounds.topCenter;
    var centerBottom = bounds.bottomCenter;
    var top = bounds.top;
    var bottom = bounds.bottom;
    var left = bounds.left;
    var right = bounds.right;
    var center = bounds.center;

    setFillStrokeColor(path, json, firstTime);

    if (group.data.size) {
      var ratio;
      if (path.bounds.width > path.bounds.height) {
        ratio = group.data.size/path.bounds.width;
      } else {
        ratio = group.data.size/path.bounds.height;
      }
      group.scale(ratio);
    }

    if (json.innermembrane && firstTime) {
      createInnermembrane(path, group);        
    }

    if (group.data.membraneColor) {
      if (typeof(group.data.membraneColor) === 'string'  && group.data.membraneColor[0] != '#') {
        group.data.membraneColor = '#' + group.data.membraneColor;
      }
      path.fillColor = group.data.membraneColor;
    }

    if (group.data.opacity) {
      group.opacity = group.data.opacity;
    }

    if (json.inside && (!parent || parent.name !== json.inside)) {
      json.offset = group.data.offset;
    }

    if (parent && json.offset) {
      var parentPath = parent.getChildren()[0];
      placeItemOnPath(group, parentPath, json.offset);
    } else {
      if (json.angle) {
        if (group.data.oldAngle) {
          group.rotate(-group.data.oldAngle);  
        }
        group.rotate(group.data.angle);
      }
    }

    if (parent && parent != group.parent) {
      parent.addChild(group);
    }

    
    if (!group.data.textItem && showName) {
    
      text = group.data.name;
      text = text.replace(/\[\d+\]/,'');

      pos = path.bounds.topRight;

      textItem = new paper.PointText({
            point: [pos.x, pos.y],
            content: text,
            fillColor: 'black',
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 15
        });
      group.addChild(textItem);
      group.data.textItem = textItem;
    }

    if (json.count) {
      group.sendToBack();
    }

    return group;
  }
};

var _SceneInteractiveComponents = {};

function getSelectedItems(addObj) {
  var selected = [];
  var fromPaper = paper.project.selectedItems;
  for (var i=0; i < fromPaper.length; ++i) {
    if (fromPaper[i].data.name) {
      selected.push(fromPaper[i]);
      if (addObj && addObj.data.name === fromPaper[i].data.name) {
        addObj = undefined;
      }
    }
  }

  if (addObj) {
    selected.push(addObj);
  }
  return selected;
}

function deselectAll() {
  paper.project.deselectAll();
}

function getPositionOnPath(position, path) {
  var offset = 0.5;
  position = path.getNearestPoint(position);

  var len = path.length;
  var threshold = len/100;
  var step = 0.5;
  var p = path.getPointAt( offset*len );
  var offsetDown, offsetUp, pDown, pUp;
  var dist = distance(position, p);

  for (var i=0; i < 10; ++i) {
    step = step/2;

    offsetUp = (offset+step);
    if (offsetUp > 1) offsetUp = 1;

    offsetDown = (offset-step);
    if (offsetDown < 0) offsetDown = 0;
    
    pUp = path.getPointAt( offsetUp*len );
    pDown = path.getPointAt( offsetDown*len );

    if (distance(pUp,position) > distance(pDown,position)) {
      offset = offsetDown;
    } else {
      offset = offsetUp;
    }
    p = path.getPointAt( offset*len );
    dist = distance(position, p);
  }
  return offset;
}

_onHitCBs = [];

function onHit(func) {
  if (typeof(func)==='function') {
    _onHitCBs.push(func);
  }
}

function moveObjects(array, pos, delta) {
  for (var i=0; i < array.length; ++i) {
    moveObject(array[i], pos, delta);
  }
}

function moveObject(obj, pos, delta) {
  if (obj.data.offset && obj.parent) {
    var path = obj.parent.getChildren()[0];
    /*var pos = { 
      x: obj.position.x+delta.x, 
      y: obj.position.y+delta.y 
    };*/
    var p = new paper.Point(pos.x,pos.y);
    //p = path.getNearestPoint(p);
    var newOffset = getPositionOnPath(p, path);
    updateScene({name: obj.data.name, offset: newOffset});
  } else {
    obj.position.x = obj.position.x + delta.x;
    obj.position.y = obj.position.y + delta.y;
  }

  var alreadyUpdatedReactions = {};

  var updateReactionsForObj = function(obj) {
    var i,j,children,rxn;
    if (obj.data.reactions) {
      for (i in obj.data.reactions) {
        rxn = obj.data.reactions[i];
        if (!alreadyUpdatedReactions[rxn.data.name]) {
          alreadyUpdatedReactions[rxn.data.name] = true;
          updateReactionCurve(rxn);
        }
      }
    }

    children = obj.getChildren();
    if (children) {
      for (j=0; j < children.length; ++j) {
        updateReactionsForObj(children[j]);
      }
    } 
  
  };

  updateReactionsForObj(obj);
}

function deleteObject(name) {
  function disconnectReaction(reaction) {
    var fromItems = reaction.data.fromItems;
    var toItems = reaction.data.toItems;
    var throughItem = reaction.data.throughItem;

    var i;
    var name = reaction.data.name;

    for (i=0; i < fromItems.length; ++i) {
      delete fromItems[i].data.reactions[name];
    }

    for (i=0; i < toItems.length; ++i) {
      delete toItems[i].data.reactions[name];
    }

    if (throughItem) {
      delete throughItem.data.reactions[name];
    }
  }

  var component = getSceneComponent(name, true);
  if (component && component.length !== undefined) {
    for (var i=0; i < component.length; ++i) {
      if (!component[i].data.reactions ||
          Object.keys(component[i].data.reactions).length === 0) {
        delete _SceneComponents[component[i].data.name];
        component[i].remove();
      }
    }
  } else {
    if (component) {
      if (!component.data.reactions ||
          Object.keys(component.data.reactions).length === 0) {
        delete _SceneComponents[component.data.name];
        component.remove();
      }
    } else {
      var reaction =  getSceneReaction(name);

      if (reaction) {
        disconnectReaction(reaction);
        delete _SceneReactions[reaction.data.name];
        reaction.remove();
      }
    }
  }
}

function getDescription(obj) {
  var descr = "";
  if (obj.data.name) {
    //descr = obj.data.name;
    //descr = descr + "\n";
    if (obj.data.description) {
      descr = descr + obj.data.description;
    }
  }
  return descr;
}

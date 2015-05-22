var _SceneComponents = {};
var _SceneReactions = {};
var _ReactionLayer = null;
var _ComponentsLayer = null;
var _ARROWHEADSCALE = 10; //x line width
var _ARROWHEADCTRLDIST = 20; //hard coded

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

  for (i=0; i < jsonArray.length; ++i) {
    updateScene(jsonArray[i]);
  }
}

function updateScene(json) {
  if (json.length !== undefined) {
    updateSceneArray(json);
    return;
  }

  if (json.name && getSceneReaction(json.name)) {
    deleteObject(json.name);
  }

  var objs = getSceneComponent(json.name, true);

  if (objs) {
    if (json.count) {
      var oldJson;
      if (objs && objs.length > 0) {
        oldJson = objs[0].data;
        for (var i in oldJson) {
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

  updateSceneHelper(json);
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
    
    createReactionCurve(fromArray, toArray, throughItem, json);
    return;
  }

  var name = json.name;
  var count = json.count;
  var parent = json.inside;
  if (parent) {
    parent = getSceneComponent(parent);
  }
  var type = json.type;
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
      group.position.x = pos.x;
      group.position.y = pos.y;    
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

    if (json.count) {
      group.sendToBack();
    }
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

function createReactionCurve(fromItems, toItems, throughItem, style) {

  if (_ReactionLayer) {
    _ReactionLayer.activate();
  }

  var reactionCurve = new paper.Group();
  reactionCurve.data.fromItems = fromItems;
  reactionCurve.data.toItems = toItems;
  reactionCurve.data.throughItem = throughItem;
  
  var name;
  if (style && style.name) 
    name = style.name;
  else 
    name = 'Rxn-' + Object.keys(_SceneReactions).length;
  
  var fromMidPt = new paper.Point(0,0), 
      toMidPt = new paper.Point(0,0),
      allMidPt = new paper.Point(0,0);

  var i,j,k;
  var visited = {};
  var loop;
  var len1 = 0, len2 = 0;

  for (i=0; i < fromItems.length; ++i) {
    allMidPt.x = allMidPt.x + fromItems[i].position.x;
    allMidPt.y = allMidPt.y + fromItems[i].position.y;
    fromMidPt.x = fromMidPt.x + fromItems[i].position.x;
    fromMidPt.y = fromMidPt.y + fromItems[i].position.y;
    visited[ fromItems[i].data.name ] = true;
    len1 = len1 + 1;
  }

  for (i=0; i < toItems.length; ++i) {
    if (!visited[toItems[i].data.name]) {
      allMidPt.x = allMidPt.x + toItems[i].position.x;
      allMidPt.y = allMidPt.y + toItems[i].position.y;
      toMidPt.x = toMidPt.x + toItems[i].position.x;
      toMidPt.y = toMidPt.y + toItems[i].position.y;
      visited[ toItems[i].data.name ] = true;
      len2 = len2 + 1;
    } else {
      loop = toItem[i];
    }
  }

  allMidPt.x = allMidPt.x / (len1+len2);
  allMidPt.y = allMidPt.y / (len1+len2);
  
  var vector;
  var throughPoint;

  if (!throughItem) {
    throughPoint = allMidPt;
  } else {
    throughPoint = throughItem.position;
    throughItem.data.reactions = throughItem.data.reactions || {};
    throughItem.data.reactions[name] = reactionCurve;
  }

  fromMidPt.x = (fromMidPt.x + throughPoint.x*2)/(2+len1);
  fromMidPt.y = (fromMidPt.y + throughPoint.y*2)/(2+len1);
  toMidPt.x = (toMidPt.x + throughPoint.x*2)/(2+len2);
  toMidPt.y = (toMidPt.y + throughPoint.y*2)/(2+len2);

  var fromMidPtCtr, toMidPtCtr;

  if (loop) {
    if (len1 + len2 === 1) {
      var theOne;
      if (fromItem.length) 
        theOne = fromItem[0];
      else 
        theOne = toItems[0];

      throughPoint = theOne.position;
      throughPoint.x = theOne.bounds.rightCenter + _ARROWHEADCTRLDIST*2;
    }



  } else {
    vector = throughPoint.subtract(fromMidPt).normalize(_ARROWHEADCTRLDIST);
    fromMidPtCtr = throughPoint.subtract(vector);
    toMidPtCtr = throughPoint.add(vector);
  }

  var path, segment, objectPath;
  var p1, p2, p3;

  for (i=0; i < fromItems.length; ++i) {
    objectPath = fromItems[i].getChildren()[0];
    path = new paper.Path();

    p1 = objectPath.getNearestPoint(fromMidPt);
    vector = fromMidPt.subtract(p1).normalize(_ARROWHEADCTRLDIST);
    p2 = p1.add(vector);
    p3 = fromMidPtCtr;

    path.moveTo(p1);
    path.cubicCurveTo(p2,p3,throughPoint);

    if (style) {
      for (k in style) {
        path[k] = style[k];
      }
    }

    reactionCurve.addChild(path);
    fromItems[i].data.reactions = fromItems[i].data.reactions || {};
    fromItems[i].data.reactions[name] = reactionCurve;
  }

  var arrowHead, pathData, arrowPath;
  if (style && style.arrowHead) {
    pathData = _ArrowData[style.arrowHead];
    reactionCurve.data.arrowHead = style.arrowHead;
  }

  for (i=0; i < toItems.length; ++i) {
    objectPath = toItems[i].getChildren()[0];
    path = new paper.Path();

    p1 = objectPath.getNearestPoint(toMidPt);
    vector = toMidPt.subtract(p1).normalize(_ARROWHEADCTRLDIST);
    p2 = p1.add(vector);
    p3 = toMidPtCtr;

    path.moveTo(throughPoint);
    path.cubicCurveTo(p3,p2,p1);
    reactionCurve.addChild(path);

    if (style) {
      for (k in style) {
        path[k] = style[k];
      }
    }

    toItems[i].data.reactions = toItems[i].data.reactions || {};
    toItems[i].data.reactions[name] = reactionCurve;

    if (pathData && reactionCurve.data.arrowHead) {
      var arrowSize = path.strokeWidth * _ARROWHEADSCALE;
      var ratio;
      arrowPath = new paper.Path(pathData);
      arrowPath.fillColor = path.strokeColor;
      arrowPath.strokeWidth = 0;
      
      if (arrowPath.bounds.width > arrowPath.bounds.height) {
        ratio = arrowSize/arrowPath.bounds.width;
      } else {
        ratio = arrowSize/arrowPath.bounds.height;
      }
      arrowPath.scale(ratio);
    
      arrowPath.position = p1.add(path.segments[1].handleIn.normalize(_ARROWHEADCTRLDIST/4));
      arrowPath.data.angle = path.segments[1].handleIn.angle;
      arrowPath.rotate(arrowPath.data.angle);
      reactionCurve.addChild(arrowPath);
    }
  }

  reactionCurve.data.name = name;
  _SceneReactions[name] = reactionCurve;
  
  //item.children[1].segments[0].point = end.add(arrowVector.rotate(155));
  //item.children[1].segments[1].point = end;
  //item.children[1].segments[2].point = end.add(arrowVector.rotate(-155));

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

    delete throughItem.data.reactions[name];
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
        delete _SceneReactions[reaction[i].data.name];
        reaction.remove();
      }
    }
  }
}

function updateReactionCurve(reactionCurve) {
  var fromItems = reactionCurve.data.fromItems;
  var toItems = reactionCurve.data.toItems;
  var throughPoint; 
  if (reactionCurve.data.throughItem) {
    throughPoint = reactionCurve.data.throughItem.position;
  }

  var fromMidPt = new paper.Point(0,0), 
      toMidPt = new paper.Point(0,0),
      allMidPt = new paper.Point(0,0);

  var i,j;
  var visited = {};
  var loop;
  var len1 = 0, len2 = 0;

  for (i=0; i < fromItems.length; ++i) {
    allMidPt.x = allMidPt.x + fromItems[i].position.x;
    allMidPt.y = allMidPt.y + fromItems[i].position.y;
    fromMidPt.x = fromMidPt.x + fromItems[i].position.x;
    fromMidPt.y = fromMidPt.y + fromItems[i].position.y;
    visited[ fromItems[i].data.name ] = true;
    len1 = len1 + 1;
  }

  var arrowHead, pathData, arrowPath;
  if (reactionCurve.data.arrowHead) {
    pathData = _ArrowData[reactionCurve.data.arrowHead];
  }

  for (i=0; i < toItems.length; ++i) {
    if (!visited[toItems[i].data.name]) {
      allMidPt.x = allMidPt.x + toItems[i].position.x;
      allMidPt.y = allMidPt.y + toItems[i].position.y;
      toMidPt.x = toMidPt.x + toItems[i].position.x;
      toMidPt.y = toMidPt.y + toItems[i].position.y;
      visited[ toItems[i].data.name ] = true;
      len2 = len2 + 1;
    } else {
      loop = toItem[i];
    }
  }

  allMidPt.x = allMidPt.x / (len1+len2);
  allMidPt.y = allMidPt.y / (len1+len2);

  if (!throughPoint) {
    throughPoint = allMidPt;
  }

  fromMidPt.x = (fromMidPt.x + throughPoint.x*2)/(2+len1);
  fromMidPt.y = (fromMidPt.y + throughPoint.y*2)/(2+len1);
  toMidPt.x = (toMidPt.x + throughPoint.x*2)/(2+len2);
  toMidPt.y = (toMidPt.y + throughPoint.y*2)/(2+len2);;
  
  var vector;

  var fromMidPtCtr, toMidPtCtr;

  if (loop) {
    if (len1 + len2 === 1) {
      var theOne;
      if (fromItem.length) 
        theOne = fromItem[0];
      else 
        theOne = toItems[0];

      throughPoint = theOne.position;
      throughPoint.x = theOne.bounds.rightCenter + _ARROWHEADCTRLDIST*2;
    }

  } else {
    vector = throughPoint.subtract(fromMidPt).normalize(_ARROWHEADCTRLDIST);
    fromMidPtCtr = throughPoint.subtract(vector);
    toMidPtCtr = throughPoint.add(vector);
  }

  var path, segment, objectPath;
  var p1, p2, p3;
  var k = 0;

  var paths = reactionCurve.getChildren();

  for (i=0; i < fromItems.length; ++i) {
    objectPath = fromItems[i].getChildren()[0];
    path = paths[k];
    k = k+1;

    p1 = objectPath.getNearestPoint(fromMidPt);
    vector = fromMidPt.subtract(p1).normalize(_ARROWHEADCTRLDIST);
    p2 = p1.add(vector);
    p3 = fromMidPtCtr;

    path.segments[0].point = p1;
    path.segments[1].point = throughPoint;
    path.segments[0].handleOut = p2.subtract(p1);
    path.segments[1].handleIn = p3.subtract(throughPoint);
  }

  for (i=0; i < toItems.length; ++i) {
    objectPath = toItems[i].getChildren()[0];
    path = paths[k];
    k = k+2;

    p1 = objectPath.getNearestPoint(toMidPt);
    vector = toMidPt.subtract(p1).normalize(_ARROWHEADCTRLDIST);
    p2 = p1.add(vector);
    p3 = toMidPtCtr;

    path.segments[0].point = throughPoint;
    path.segments[1].point = p1;
    path.segments[0].handleOut = p3.subtract(throughPoint);
    path.segments[1].handleIn = p2.subtract(p1);

    if (reactionCurve.data.arrowHead) {
      var arrowSize = path.strokeWidth * _ARROWHEADSCALE;
      var ratio;
      var arrowPath = paths[k-1];
      arrowPath.fillColor = path.strokeColor;
      arrowPath.strokeWidth = 0;
      
      if (arrowPath.bounds.width > arrowPath.bounds.height) {
        ratio = arrowSize/arrowPath.bounds.width;
      } else {
        ratio = arrowSize/arrowPath.bounds.height;
      }
      arrowPath.scale(ratio);
    
      arrowPath.position = p1.add(path.segments[1].handleIn.normalize(_ARROWHEADCTRLDIST/4));
      arrowPath.rotate(-arrowPath.data.angle);
      arrowPath.data.angle = path.segments[1].handleIn.angle;
      arrowPath.rotate(arrowPath.data.angle);
    }
  }
}

function getDescription(obj) {
  var descr = "";
  if (obj.data.name) {
    descr = obj.data.name;
    descr = descr + "\n";
    if (obj.data.description) {
      descr = descr + obj.data.description;
    }
  }
  return descr;
}

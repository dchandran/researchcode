function createReactionName(fromItems, toItems) {
  var name = "";
  for (i=0; i < fromItems.length; ++i) 
    name = name + fromItems[i].data.name;
  name = name + "->";
  for (i=0; i < toItems.length; ++i) 
    name = name + toItems[i].data.name;
  return name;
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
  var i,j,k;
  if (style && style.name) 
    name = style.name;
  else {
    name = createReactionName(fromItems, toItems);
  }
  
  var fromMidPt = new paper.Point(0,0), 
      toMidPt = new paper.Point(0,0),
      allMidPt = new paper.Point(0,0);

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


function drawBubblesAroundPath(path, density) {
  
}
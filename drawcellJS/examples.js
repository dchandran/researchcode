  var example1 = [{ 
       name: 'Glu', 
       type: 'Substrate3', 
       count: 100, 
       angle: 0,
       size: 10,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
   { 
       name: 'Euk' , 
       type: 'Eukaryote', 
       innermembrane: true,
       position : {x:200,y:200},
       fillColor: '#e2ffa4',
       strokeColor: '#8aaf3c',
       membraneColor: '#8aaf3c',
       size: 200
    },
    { 
       name: 'Duk' , 
       type: 'Eukaryote', 
       innermembrane: true,
       position : {x:500,y:200},
       fillColor: '#f2fea4',
       strokeColor: '#faa83c',
       membraneColor: '#faa83c',
       size: 250
    },
    { 
       name: 'Ecoli' , 
       type: 'Prokaryote', 
       innermembrane: true,
       count: 3,
       inside: 'Duk',
       angle: 45,
       position : {x:400,y:300},
       fillColor: '#e2ffa4',
       strokeColor: '#8aaf3c',
       membraneColor: '#8aaf3c',
       size: 80
    },

   { 
       name: 'D' , 
       type: 'DNA', 
       position : {x:400,y:600},
       strokeColor: '#29464f',
       strokeWidth: 5,
       size: 400
    },

   { 
       name: 'R' , 
       type: 'Receptor', 
       count: 10, 
       offset: 0.1,
       align: 'center',
       inside: 'Euk',
       strokeColor: 'black',
       size: 25,
       strokeColor: '#356270',
       fillColor: '#62a1b4'
    },

   { 
       name: 'E' , 
       type: 'Enzyme', 
       count: 20, 
       angle: 0,
       inside: 'Euk',
       size: 10,
       strokeColor: '#356270',
       fillColor: '#62a1b4'
    },

   { 
       name: 'S1' , 
       type: 'Substrate1', 
       count: 50, 
       angle: 0,
       inside: 'Euk',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

   { 
       name: 'S2' , 
       type: 'Substrate2', 
       count: 10, 
       angle: 0,
       inside: 'Euk',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

    { 
       name: 'S3' , 
       type: 'Substrate2', 
       count: 10, 
       angle: 0,
       inside: 'Ecoli',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

   { 
       name: 'pTac' , 
       type: 'Promoter', 
       offset: 0.1,
       align: 'top',
       inside: 'D',
       fillColor: '#2ad51e',
       strokeColor: '#11730a',
       size: 20
    },

   { 
       name: 'Pex1' , 
       type: 'CDS', 
       offset: 0.15,
       align: 'center',
       inside: 'D',
       fillColor: '#6c86b1',
       strokeColor: '#274371',
       size: 25
    },

    { 
       name: 'Hex1' , 
       type: 'CDS', 
       offset: 0.15,
       align: 'center',
       inside: 'D',
       fillColor: '#6c86b1',
       strokeColor: '#274371',
       size: 25
    },

    {
       name: 'A' ,
       position: {x:200,y:400},
       type: 'Substrate1',
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'B' ,
       position: {x:170,y:530},
       type: 'Substrate2',
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'C' ,
       type: 'Substrate3',
       position: {x:500,y:450},
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'Enz' ,
       position: {x:300,y:500},
       type: 'Enzyme',
       angle: 0,
       size: 30,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
        name: 'R1',
        from: ['A','B'],
        to: ['C'],
        through: 'Enz',
        arrowHead: 'Triangle',
        strokeColor: '#8aa111',
    },
    {
        name: 'R2',
        from: ['Pex1'],
        to: ['Enz'],
        strokeColor: '#274371',
        dashArray: [10,4]
    },
    {
        name: 'R3',
        from: ['Hex1'],
        to: ['R'],
        strokeColor: '#274371',
        dashArray: [10,4]
    },
    {
        name: 'R4',
        from: ['Glu'],
        to: ['S2'],
        through: 'R',
        arrowHead: 'Triangle',
        strokeColor: '#274371'
    },
    {
        name: 'R5',
        from: ['S1'],
        to: ['S3'],
        arrowHead: 'Triangle',
        strokeColor: '#274371'
    }];


var example2 = [{ 
       name: 'Glu', 
       type: 'Substrate3', 
       count: 100, 
       angle: 0,
       size: 10,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },

   { 
       name: 'Euk' , 
       type: 'Eukaryote', 
       innermembrane: true,
       position : {x:200,y:200},
       fillColor: '#e2ffa4',
       strokeColor: '#8aaf3c',
       membraneColor: '#8aaf3c',
       size: 200
    },

    { 
       name: 'Duk' , 
       type: 'Eukaryote', 
       innermembrane: true,
       position : {x:500,y:200},
       fillColor: '#f2fea4',
       strokeColor: '#faa83c',
       membraneColor: '#faa83c',
       size: 250
    },
    { 
       name: 'Ecoli' , 
       type: 'Prokaryote', 
       innermembrane: true,
       count: 3,
       inside: 'Duk',
       angle: 45,
       position : {x:400,y:300},
       fillColor: '#e2ffa4',
       strokeColor: '#8aaf3c',
       membraneColor: '#8aaf3c',
       size: 80
    },

   { 
       name: 'D' , 
       type: 'DNA', 
       position : {x:400,y:600},
       strokeColor: '#29464f',
       strokeWidth: 5,
       size: 400
    },

   { 
       name: 'R' , 
       type: 'Receptor', 
       count: 10, 
       offset: 0.1,
       align: 'center',
       inside: 'Euk',
       strokeColor: 'black',
       size: 25,
       strokeColor: '#356270',
       fillColor: '#62a1b4'
    },

    { 
       name: 'R2' , 
       type: 'Two Component System', 
       position: {x: 400, y: 500},
       strokeColor: 'black',
       size: 200,
       strokeColor: '#356270',
       fillColor: '#62a1b4'
    },
   { 
       name: 'E' , 
       type: 'Enzyme', 
       count: 20, 
       angle: 0,
       inside: 'Euk',
       size: 10,
       strokeColor: '#356270',
       fillColor: '#62a1b4'
    },

   { 
       name: 'S1' , 
       type: 'Substrate1', 
       count: 50, 
       angle: 0,
       inside: 'Euk',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

   { 
       name: 'S2' , 
       type: 'Substrate2', 
       count: 10, 
       angle: 0,
       inside: 'Euk',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

    { 
       name: 'S3' , 
       type: 'Substrate2', 
       count: 10, 
       angle: 0,
       inside: 'Ecoli',
       fillColor: '#f6ad16',
       strokeColor: '#9d6a02',
       size: 5
    },

   { 
       name: 'pTac' , 
       type: 'Promoter', 
       offset: 0.1,
       align: 'top',
       inside: 'D',
       fillColor: '#2ad51e',
       strokeColor: '#11730a',
       size: 20
    },

   { 
       name: 'Pex1' , 
       type: 'CDS', 
       offset: 0.15,
       align: 'center',
       inside: 'D',
       fillColor: '#6c86b1',
       strokeColor: '#274371',
       size: 25
    },

    { 
       name: 'Hex1' , 
       type: 'CDS', 
       offset: 0.15,
       align: 'center',
       inside: 'D',
       fillColor: '#6c86b1',
       strokeColor: '#274371',
       size: 25
    },

    {
       name: 'A' ,
       position: {x:200,y:400},
       type: 'Substrate1',
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'B' ,
       position: {x:170,y:530},
       type: 'Substrate2',
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'C' ,
       type: 'Substrate3',
       position: {x:500,y:450},
       angle: 0,
       size: 20,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
       name: 'Enz' ,
       position: {x:300,y:500},
       type: 'Enzyme',
       angle: 0,
       size: 30,
       fillColor: '#daff00',
       strokeColor: '#8aa100'
    },
    {
        name: 'R1',
        from: ['A','B'],
        to: ['C'],
        through: 'Enz',
        arrowHead: 'Triangle',
        strokeColor: '#8aa111',
    },
    {
        name: 'R2',
        from: ['Pex1'],
        to: ['Enz'],
        strokeColor: '#274371',
        dashArray: [10,4]
    },
    {
        name: 'R3',
        from: ['Hex1'],
        to: ['R'],
        strokeColor: '#274371',
        dashArray: [10,4]
    },
    {
        name: 'R4',
        from: ['Glu'],
        to: ['S2'],
        through: 'R',
        arrowHead: 'Triangle',
        strokeColor: '#274371'
    },
    {
        name: 'R5',
        from: ['S1'],
        to: ['S3'],
        arrowHead: 'Triangle',
        strokeColor: '#274371'
    }];

var phageExample = [
{ 
  name: "WT Phage Stage 1",
  type: "Phage",
  count: 30,
  angle: 1,
  size: 30,
  strokeColor: "#e0771d",
  fillColor: "#e0771d",
  description: "Wild Type phage that infects\nand lyses the target cells"
},
{ 
  name: "Defective Phage Stage 1",
  type: "Phage",
  count: 100,
  angle: 1,
  size: 30,
  strokeColor: "#00780c",
  fillColor: "#00780c",
  description: "Defective phage that requires\nWT Phage for replicating inside the target cell"
},
{ 
  name: "Target Cell",
  type: "Prokaryote",
  position: {x: 200, y: 300},
  strokeColor: "#1d6b25",
  strokeWidth: 5,
  fillColor: "#b7b7b7",
  size: 200
},
{ 
  name: "Infected Cell",
  type: "Prokaryote",
  position: {x: 500, y: 300},
  strokeColor: "#1d6b25",
  strokeWidth: 5,
  fillColor: "#b7b7b7",
  size: 200
},
{ 
  name: "Protected Cell",
  type: "Prokaryote",
  position: {x: 500, y: 100},
  strokeWidth: 5,
  strokeColor: "#75a266",
  fillColor: "#73e01d",
  size: 200
},
{ 
  name: "Double Infected Cell",
  type: "Prokaryote",
  position: {x: 700, y: 100},
  strokeWidth: 5,
  strokeColor: "#75a266",
  fillColor: "#73e01d",
  size: 200,
  description: "This cell has been infected by\nboth types of virus particles"
},
{ 
  name: "Cell Lysis",
  type: "Prokaryote Lysis",
  position: {x: 500, y: 500},
  strokeColor: "#1d6b25",
  fillColor: "#b7b7b7",
  size: 200,
  description: "Cells that have died due to the\npresence of lytic phages"
},
{ 
  name: "WT Phage Stage 2",
  type: "Phage",
  inside: "Infected Cell",
  count: 5,
  angle: 1,
  size: 30,
  strokeColor: "#e0771d",
  fillColor: "#e0771d"
},
{ 
  name: "Defective Phage Stage 2",
  type: "Phage",
  inside: "Protected Cell",
  count: 5,
  angle: 1,
  size: 30,
  strokeColor: "#00780c",
  fillColor: "#00780c"
},
{ 
  name: "Defective Phage Stage 3",
  type: "Phage",
  inside: "Double Infected Cell",
  count: 5,
  angle: 1,
  size: 30,
  strokeColor: "#00780c",
  fillColor: "#00780c"
},
{ 
  name: "WT Phage Stage 4",
  type: "Phage",
  inside: "Double Infected Cell",
  count: 5,
  angle: 1,
  size: 30,
  strokeColor: "#e0771d",
  fillColor: "#e0771d"
},
{ 
  name: "WT Phage Stage 3",
  type: "Phage",
  inside: "Cell Lysis",
  count: 5,
  angle: 1,
  size: 30,
  strokeColor: "#e0771d",
  fillColor: "#e0771d"
},
{
  name: "R1",
  from: ["Target Cell", "Free Phage"],
  to: ["Infected Cell"],
  strokeColor: "#21475b",
  strokeWidth: 2,
  arrowHead: "Triangle"
},
{
  name: "R2",
  from: ["Infected Cell"],
  to: ["Cell Lysis"],
  strokeColor: "#21475b",
  strokeWidth: 2,
  arrowHead: "Triangle"
},
{
  name: "R3",
  from: ["Target Cell", "Defective Phage Stage 1"],
  to: ["Protected Cell"],
  strokeColor: "#21475b",
  strokeWidth: 2,
  arrowHead: "Triangle"
},
{
  name: "R4",
  from: ["Protected Cell", "WT Phage Stage 1"],
  to: ["Double Infected Cell"],
  strokeColor: "#21475b",
  strokeWidth: 2,
  arrowHead: "Triangle"
}
];


var feedbackExample = [
  'Enzyme named x0 at (100,300)\n\
   style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }',

  'Enzyme named x1 at (100,400)\n\
   style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }',

  'Substate named dot[1] at (80,350)\n\
   style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 5 }',

  'Substate named dot[2] at (120,350)\n\
   style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 5 }',

  'Substate named Source at (50,400)\n\
   style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 10 }',

  {
    name: "S0",
    type: "Substrate",
    position: {x: 150, y: 400},
    strokeColor: "#00780c",
    fillColor: "#00780c",
    size: 20
  },
  {
    name: "S1",
    type: "Substrate",
    position: {x: 250, y: 400},
    strokeColor: "#00780c",
    fillColor: "#00780c",
    size: 20
  },
  {
    name: "S2",
    type: "Substrate",
    position: {x: 350, y: 400},
    strokeColor: "#00780c",
    fillColor: "#00780c",
    size: 20
  },
  {
    name: "Sink",
    type: "Substrate",
    position: {x: 450, y: 400},
    strokeColor: "#00780c",
    fillColor: "#00780c",
    opacity: 0.5,
    size: 10
  },
  {
    name: "R1",
    from: ["x0"],
    to: ["x1"],
    through: "dot[1]",
    strokeColor: "#21475b",
    strokeWidth: 2,
    arrowHead: "Triangle"
  },
  {
    name: "R2",
    from: ["x1"],
    to: ["x0"],
    through: "dot[2]",
    strokeColor: "#21475b",
    strokeWidth: 2,
    arrowHead: "Triangle"
  },
  {
    name: "R3",
    from: ["Source"],
    to: ["S0"],
    strokeColor: "#21475b",
    strokeWidth: 2,
    arrowHead: "Triangle"
  },
  {
    name: "R4",
    from: ["S0"],
    to: ["S1"],
    strokeColor: "#21475b",
    strokeWidth: 2,
    arrowHead: "Triangle"
  },
  {
    name: "R5",
    from: ["S1"],
    to: ["S2"],
    strokeColor: "#21475b",
    strokeWidth: 2,
    arrowHead: "Triangle"
  },
  'Connect "S2" to "Sink"\n\
  style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}'
];


var feedbackExampleCode = "# -*- coding: utf-8 -*-\n\
import numpy\n\
from scipy import integrate\n\
from matplotlib import pyplot\n\
from scipy import random\n\
from scipy import linspace\n\
\n\
E2 = 50\n\
source = 50\n\
def f(x,t):\n\
    global E2, source\n\
    \n\
    x0 = x[0]\n\
    x1 = x[1]\n\
    s0 = x[2]\n\
    s1 = x[3]\n\
    s2 = x[4]\n\
    s3 = x[5]\n\
    s4 = x[6]\n\
\n\
    #linear region\n\
    ds0 = source/(1+x1) - 0.2*s0\n\
    ds1 = 0.2*s0 - 0.2*s1\n\
    ds2 = 0.2*s1 - 0.2*s2\n\
    ds3 = 0.2*s2 - 0.2*s3\n\
    ds4 = 0.2*s3 - 0.2*s4\n\
    \n\
    E = s1*(1+x1)\n\
    #E = s4\n\
    #dual enzyme\n\
    dx0 = E2*x1/(1+x1) - E*x0/(200+x0)\n\
    dx1 = -E2*x1/(1+x1) + E*x0/(200+x0)    \n\
    \n\
    return [dx0,dx1,ds0,ds1,ds2,ds3,ds4]\n\
\n\
x0 = [50.,30.] + [0]*5\n\
names = ['x0', 'x1', 's0', 's1', 's2', 's3', 's4']\n\
n = 200\n\
time = linspace(0,200,n)\n\
result = integrate.odeint(f,x0,time)\n\
#result.resize(n, 2)\n\
pyplot.plot(time, result)\n\
pyplot.legend(names, bbox_to_anchor=(1.05, 1), loc=2)\n\
#pyplot.ylim([0,100])\n\
\n\
pyplot.figure()\n\
y = []\n\
x = [50,60,80,100,150,180,200,250,300,400,500]\n\
for i in x:\n\
    source = i\n\
    result = integrate.odeint(f,x0,time)\n\
    y.append(result[199][6])\n\
\n\
pyplot.plot(x, y)\n\
\n\
\n\
pyplot.figure()\n\
n = 100\n\
x = linspace(0,80,n)\n\
y = 80 - x\n\
v1 = 50.0*x/(1.0+x)\n\
v2 = 70.0*x*y/(400.0 + y)\n\
pyplot.plot(x,v2-v1)\n\
";
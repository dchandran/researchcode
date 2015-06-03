# -*- coding: utf-8 -*-
import numpy
from scipy import integrate
from matplotlib import pyplot
from scipy import random
from scipy import linspace

E2 = 50
'''
Membrane named membrane at (100,400)
style: { "strokeColor": "#6fafd6", "fillColor": "#6fafd6", "opacity":1, "size": 400, "angle": 90 }
Substrate named Source at (30,400)
style: { "strokeColor": "#666666", "fillColor": "#eeeeee", "opacity":0.8, "size": 20 }
'''
source = 50
def f(x,t):
    global E2, source
    
    x0 = x[0]
    x1 = x[1]
    s0 = x[2]
    s1 = x[3]
    s2 = x[4]
    s3 = x[5]
    s4 = x[6]

    '''
    Substrate1 named S0 at (180,400)
    style: { "strokeColor": "#00780c", "fillColor": "#1faf2d", "size": 30 }
    Connect "Source" to "S0"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds0 = source/(1+x1) - 0.2*s0
    '''
    Substrate2 named S1 at (260,400)
    style: { "strokeColor": "#00780c","fillColor": "#1faf2d", "size": 30 }
    Connect "S0" to "S1"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds1 = 0.2*s0 - 0.2*s1
    '''
    Substrate3 named S2 at (360,400)
    style: { "strokeColor": "#00780c", "fillColor": "#1faf2d", "size": 30 }
    Connect "S1" to "S2"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds2 = 0.2*s1 - 0.2*s2
    '''
    Substrate4 named S3 at (450,400)
    style: { "strokeColor": "#00780c", "fillColor": "#1faf2d", "size": 30 }
    Connect "S2" to "S3"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds3 = 0.2*s2 - 0.2*s3
    '''
    Substrate5 named S4 at (550,400)
    style: { "strokeColor": "#00780c", "fillColor": "#1faf2d", "size": 30 }
    Substrate named Sink at (650,400)
    style: { "strokeColor": "#666666", "fillColor": "#eeeeee", "opacity":0.8, "size": 20 }
    Connect "S3" to "S4"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    Connect "S4" to "Sink"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds4 = 0.2*s3 - 0.2*s4
    
    '''
    Receptor named x0 at (100,300) inside membrane
    style: { "strokeColor": "#00780c", "fillColor": "#6f777a", "size": 40, "angle": 90, "opacity": 0.5}
    Dot named dot[1] at (80,350)
    style: { "strokeColor": "#555555", "fillColor": "#555555", "size": 2 }
    Dot named dot[2] at (120,350)
    style: { "strokeColor": "#555555", "fillColor": "#555555", "size": 2 }
    Dot named dot[3] at (250,360)
    style: { "strokeColor": "#555555", "fillColor": "#555555", "size": 2 }
    Dot named dot[4] at (140,320)
    style: { "strokeColor": "#555555", "fillColor": "#555555", "size": 2 }
    Connect "S1" to "dot[2]" through "dot[3]"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle", "dashArray": [10,4]}
    Connect "x0" to "dot[2]" through "dot[4]"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle", "dashArray": [10,4]}
    '''
    E = s1*(1+x1)
    dx0 = E2*x1/(1+x1) - E*x0/(200+x0)
    '''
    Receptor named x1 at (100,400) inside membrane
    style: { "strokeColor": "#00780c", "fillColor": "#1f83af", "size": 40, "angle": 270 }
    '''
    dx1 = -E2*x1/(1+x1) + E*x0/(200+x0)
    '''
    Connect "x0" to "x1" through "dot[1]"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    Connect "x1" to "x0" through "dot[2]"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    
    return [dx0,dx1,ds0,ds1,ds2,ds3,ds4]

pyplot.figure(1)
x0 = [50.,30.] + [0]*5
names = ['x0', 'x1', 's0', 's1', 's2', 's3', 's4']
n = 200
time = linspace(0,200,n)
result = integrate.odeint(f,x0,time)
pyplot.subplot(311)
pyplot.plot(time, result)
pyplot.legend(names, bbox_to_anchor=(1.05, 1), loc=2)
#pyplot.ylim([0,100])

pyplot.subplot(312)
y = []
x = [50,60,80,100,150,180,200,250,300,400,500]
for i in x:
    source = i
    result = integrate.odeint(f,x0,time)
    y.append(result[199][6])

pyplot.plot(x, y)


pyplot.subplot(313)
n = 100
x = linspace(0,80,n)
y = 80 - x
v1 = 50.0*x/(1.0+x)
v2 = 70.0*x*y/(400.0 + y)
pyplot.plot(x,v2-v1)
pyplot.show()

# -*- coding: utf-8 -*-
import numpy
from scipy import integrate
from matplotlib import pyplot
from scipy import random
from scipy import linspace

E2 = 20
'''
Substate named Source at (50,400)
style: { "strokeColor": "#00780c", "fillColor": "#00780c", "opacity":0.5, "size": 10 }
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
    Substate named S0 at (150,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
    Connect "Source" to "S0"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds0 = source/(1+x1) - 0.2*s0
    '''
    Substate named S1 at (250,400)
    style: { "strokeColor": "#00780c","fillColor": "#00780c", "size": 20 }
    Connect "S0" to "S1"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds1 = 0.2*s0 - 0.2*s1
    '''
    Substate named S2 at (350,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
    Connect "S1" to "S2"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds2 = 0.2*s1 - 0.2*s2
    '''
    Substate named S3 at (450,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
    Connect "S2" to "S3"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds3 = 0.2*s2 - 0.2*s3
    '''
    Substate named S4 at (550,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
    Substate named Sink at (650,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "opacity":0.5, "size": 10 }
    Connect "S3" to "S4"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    Connect "S4" to "Sink"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle"}
    '''
    ds4 = 0.2*s3 - 0.2*s4
    
    '''
    Enzyme named x0 at (100,300)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
    Dot named dot[1] at (80,350)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 5 }
    Dot named dot[2] at (120,350)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 5 }
    Dot named dot[3] at (550,360)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 5 }
    Connect "S4" to "dot[2]" through "dot[3]"
    style: {"strokeColor": "#21475b", "strokeWidth": 2, "arrowHead": "Triangle", "dashArray": [10,4]}
    '''
    E = s4
    dx0 = E2*x1/(1+x1) - E*x0/(200+x0)
    '''
    Enzyme named x1 at (100,400)
    style: { "strokeColor": "#00780c", "fillColor": "#00780c", "size": 20 }
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

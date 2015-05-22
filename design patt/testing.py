# -*- coding: utf-8 -*-
"""
Created on Tue May 19 12:59:41 2015

@author: chandrd
"""

import numpy
from scipy import integrate
from matplotlib import pyplot
from scipy import random
from scipy import linspace

E2 = 50
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

    #linear region
    ds0 = source/(1+x1) - 0.2*s0
    ds1 = 0.2*s0 - 0.2*s1
    ds2 = 0.2*s1 - 0.2*s2
    ds3 = 0.2*s2 - 0.2*s3
    ds4 = 0.2*s3 - 0.2*s4
    
    E = s1*(1+x1)
    #E = s4
    #dual enzyme
    dx0 = E2*x1/(1+x1) - E*x0/(200+x0)
    dx1 = -E2*x1/(1+x1) + E*x0/(200+x0)    
    
    return [dx0,dx1,ds0,ds1,ds2,ds3,ds4]

x0 = [50.,30.] + [0]*5
names = ['x0', 'x1', 's0', 's1', 's2', 's3', 's4']
n = 200
time = linspace(0,200,n)
result = integrate.odeint(f,x0,time)
#result.resize(n, 2)
pyplot.plot(time, result)
pyplot.legend(names, bbox_to_anchor=(1.05, 1), loc=2)
#pyplot.ylim([0,100])

pyplot.figure()
y = []
x = [50,60,80,100,150,180,200,250,300,400,500]
for i in x:
    source = i
    result = integrate.odeint(f,x0,time)
    y.append(result[199][6])

pyplot.plot(x, y)


pyplot.figure()
n = 100
x = linspace(0,80,n)
y = 80 - x
v1 = 50.0*x/(1.0+x)
v2 = 70.0*x*y/(400.0 + y)
pyplot.plot(x,v2-v1)

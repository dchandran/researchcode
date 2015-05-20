# -*- coding: utf-8 -*-
"""
Created on Tue May 19 12:59:41 2015

@author: chandrd
"""

from scipy import integrate
from matplotlib import pyplot
from scipy import random

E2 = 50
def f(x,t):
    global E2
    
    x0 = x[0]
    x1 = x[1]
    s0 = x[2]
    s1 = x[3]
    s2 = x[4]
    s3 = x[5]
    s4 = x[6]

    #linear region
    ds0 = 10/(1+x1) - 0.2*s0
    ds1 = 0.2*s0 - 0.2*s1
    ds2 = 0.2*s1 - 0.2*s2
    ds3 = 0.2*s2 - 0.2*s3
    ds4 = 0.2*s3 - 0.2*s4
    
    E = s1*x1
    #dual enzyme
    dx0 = E2*x1/(1+x1) - E*x0/(100+x0)
    dx1 = -E2*x1/(1+x1) + E*x0/(100+x0)
    
    return [dx0,dx1,ds0,ds1,ds2,ds3,ds4]

x0 = [50.,30.] + [0]*5
names = ['x0', 'x1', 's0', 's1', 's2', 's3', 's4']
time = linspace(0,400,200)
result = integrate.odeint(f,x0,time)
pyplot.plot(time, result)
pyplot.legend(names, bbox_to_anchor=(1.05, 1), loc=2)
#pyplot.ylim([0,100])

pyplot.figure()
y = []
for i in range(0,10):
    E2 = 1 * i*10
    result = integrate.odeint(f,x0,time)
    y.append(result[199][6])

pyplot.plot(range(0,10), y)


pyplot.figure()
n = 100
x = linspace(0,80,n)
y = 80 - x
v = []
v1 = 50.0*x/(1.0+x)
v2 = 20.0*x*y/(20*20.0 + y)
for i in range(0,n):
    v.append([v1[i], v2[i]])
pyplot.plot(x,v)
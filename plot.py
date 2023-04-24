#!/opt/homebrew/bin/python3
import matplotlib.pyplot as plt;
import numpy as np;

x = np.linspace(0, 10, 5)
y = [1, 5, 4, 1, 2]

plt.plot(x, y)
plt.xlabel("age")
plt.ylabel("stupidity level")
plt.show()

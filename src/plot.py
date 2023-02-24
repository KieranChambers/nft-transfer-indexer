import matplotlib.pyplot as plt
import csv

x = []
y = []
with open('db/50rowsExample.csv', 'r') as file:
    reader = csv.reader(file)
    next(reader)
    for row in reader:
        x.append(row[1])
        y.append(float(row[2]))

plt.plot(x, y)
plt.xticks(rotation=30, fontsize=6)
plt.yticks(fontsize=6)
plt.xlabel('Block Number', fontsize=8)
plt.ylabel('Weth Price', fontsize=8)
plt.title('Weth Price over 50 blocks')
plt.show()
plt.savefig('./docs/images/test-image.png')

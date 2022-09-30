from collections import defaultdict
from numpy import histogram
import requests
from collections import defaultdict
import json

histogram = defaultdict(int)

# Get a set of dice rolls from roll.cx
for i in range(1):
    url = 'http://roll.cx/1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20,1d20'
    response = requests.get(url, headers={'Content-Type': 'application/json'})
    rolls = response.json()

    for roll in rolls:
        histogram[roll['result'][0]] += 1

print(json.dumps(histogram))
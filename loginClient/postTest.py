import requests
import psutil
import subprocess
from datetime import datetime
import time
import sys

def devicePost():
    SSID = None
    for line in subprocess.check_output(['netsh', 'wlan', 'show', 'interfaces']).decode('utf-8').strip().split('\n'):
        if "SSID" in line and "BSSID" not in line:
            SSID = line.split(':')[1].strip()
    data = {
        # "deviceName": socket.gethostname(),
        "deviceName": sys.argv[1],
        "batteryPercentage": psutil.sensors_battery().percent,
        "plugged": psutil.sensors_battery().power_plugged,
        "wifi": SSID,
        "bootTime": datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S"),
        "lastPing": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    result = requests.post('http://localhost:3000/api/device/', json = data)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} >>> device info delivered, code {result.status_code}.")
        
def userPost(userInfo):
    result = requests.post('http://localhost:3000/api/user/', json = userInfo)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} >>> user info delivered, code {result.status_code}.")


userInfo = {
    "firstName": sys.argv[2],
    "lastName": sys.argv[3],
    "grade": "12",
    "strand": "STEM",
    "section": "1",
    "deviceID": sys.argv[1],
    "loginTime": datetime.now().strftime('%Y-%m-%d %H:%M:%S')

}

userPost(userInfo)
while True:
    devicePost()
    time.sleep(1)

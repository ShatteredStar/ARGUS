import os
from datetime import datetime
import time
import requests
import psutil
import subprocess
import sys

# sys.argv[1] is the http request destination
# sys.argv[2] is the device id
# sys.argv[3] is devMode activation



try:
    sys.argv[1]
except:
    raise RuntimeError("Arguments Error")
    sys.exit()

def getWifi():
    try:
        # Run the command
        output = subprocess.check_output(
            ['netsh', 'wlan', 'show', 'interfaces'],
            creationflags=subprocess.CREATE_NO_WINDOW,
            stderr=subprocess.STDOUT # Capture error messages too
        ).decode('utf-8')

        for line in output.strip().split('\n'):
            if "SSID" in line and "BSSID" not in line:
                return line.split(':')[1].strip()

        return "Not connected through Wi-Fi" # No SSID found even if command worked

    except subprocess.CalledProcessError:
        # This happens if Wi-Fi is off or still connecting
        return "Wi-Fi is off"

def heartbeat():
    data = {
        "deviceName": sys.argv[2],
        "batteryPercentage": psutil.sensors_battery().percent,
        "plugged": psutil.sensors_battery().power_plugged,
        "wifi": str(getWifi()),
        "bootTime": datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S"),
        "lastPing": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    result = requests.post(f"{sys.argv[1]}/api/device", json = data)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} >>> device info delivered, code {result.status_code}.")




#lockPath = r"C:\Users\user\Documents\Projects\ARGUS\loginClient\dist\ArgusLock\ArgusLock.exe"
#flags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW
lockPath = os.path.join(os.getcwd(), "lock", "ArgusLock.exe")
print(lockPath)

while True:
    # lockAlive = False

    # try:
        # if len(sys.argv) > 3 and sys.argv[3] == 'devMode':
            # print('devmode active, wont run Lock')
            # lockAlive = True
    # except IndexError:
        # pass
    # # if devmode not active, check if lock is alive
    # if not lockAlive:
        # for i in psutil.process_iter(['name']):
            # if i.info['name'] == 'ArgusLock.exe':
                # lockAlive = True
                # print("lock is alive, won't run lock")
                # break # Exit the for-loop immediately
        # if not lockAlive:
            # subprocess.Popen(
                # [lockPath, sys.argv[1], sys.argv[2]],
                # #creationflags=flags,
                # #shell=True,
                # close_fds=True
            # )
            # print("cant find lock, created new instance")
    heartbeat()
    time.sleep(1)

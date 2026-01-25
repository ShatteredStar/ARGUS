import os
from datetime import datetime
import time
import socket
import requests
import psutil
import subprocess

webhookUrl = "https://discord.com/api/webhooks/1409471156397936693/HzK-5KZLHP1kXHaC5zO2gKg_Nyu2rJnnm_TyyoW8AbyVVtlrQDEOtS1t68k_KcvlPT9H"

def hearbeat():
    SSID = None
    for line in subprocess.check_output(['netsh', 'wlan', 'show', 'interfaces']).decode('utf-8').strip().split('\n'):
        if "SSID" in line and "BSSID" not in line:
            SSID = line.split(':')[1].strip()
    data = {
        "content" : f"""
        **Device Name**: {socket.gethostname()}
        **Battery Percentage**: {psutil.sensors_battery().percent}
        **Plugged In?**: {psutil.sensors_battery().power_plugged}
        **WIFI Name**: {SSID}
        **Boot Time**: {datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S")}"""
    }
    result = requests.post(webhookUrl, json = data)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} >>> Payload delivered successfully, code {result.status_code}.")



lockPath = r"C:\Users\user\Documents\Projects\ARGUS\dist\ArgusLock\ArgusLock.exe"




while True:
    lockAlive = False
    
    for i in psutil.process_iter(['name']):
        if i.info['name'] == 'ArgusLock.exe':
            lockAlive = True
            print("lock is alive, won't run lock")
    
    if lockAlive == False:
        subprocess.Popen([lockPath], creationflags=subprocess.DETACHED_PROCESS, close_fds=True)
        print("cant find lock, created new instance")
    
    hearbeat()
    time.sleep(3)
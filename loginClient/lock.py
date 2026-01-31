import sys
try:
    sys.argv[1]
except:
    raise RuntimeError("Arguments Error")
    sys.exit()

import customtkinter as ctk
from PIL import Image, ImageTk
import cv2
import threading
from datetime import datetime
import requests

# loading QReader on a thread so it doesnt stall start time
qreaderLoaded = False
def loadQReader():
    global qreaderLoaded
    global qreader
    from qreader import QReader
    qreader = QReader()
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Imported QReader")
    qreaderLoaded = True
    qrScanButton.configure(state="enabled")
    qrTipLabel.configure(text="Put your QR Identifier in the camera!")
threading.Thread(target=loadQReader, daemon=True).start()

ctk.set_appearance_mode("light")
ctk.set_default_color_theme("dark-blue")

screen = ctk.CTk()

try:
    if sys.argv[2] == "devMode":
        screen.attributes("-fullscreen", True)
except:
    screen.overrideredirect(True)
    screen.attributes("-topmost", True)
    screen.geometry(f"{screen.winfo_screenwidth()}x{screen.winfo_screenheight()}+0+0")





# initial frame
loginFrame = ctk.CTkFrame(screen, fg_color="transparent")

argusLogo = ctk.CTkImage( light_image=Image.open("assets/argus.png"), size=(478.1,203.35) )
logoLabel = ctk.CTkLabel( loginFrame, text="", image=argusLogo )

welcomeLabel = ctk.CTkLabel(
    loginFrame,
    text="WELCOME!",
    font=("Segoe UI Variable", 35, "italic"),
    fg_color="transparent",
    bg_color="transparent"
)

scanButton = ctk.CTkButton(
    loginFrame,
    text="SCAN QR",
    corner_radius=60,
    fg_color="#545454",
    hover_color="#292828",
    height=100,
    width=480,
    text_color="white",
    font=("Segoe UI Variable", 60, "bold"),
    command=lambda: switchQrFrame()
)

manualButton = ctk.CTkButton(
    loginFrame,
    text="Enter Information Manually",
    corner_radius=20,
    fg_color="#a6a6a6",
    hover_color="#292828",
    height=50,
    width=120,
    text_color="white",
    font=("Segoe UI Variable", 28, "italic"),
    command=lambda: glideLogo(manualFrame)
)

#logoLabel.pack(pady = (30 , 0))
#welcomeLabel.pack(pady = (0, 30))
#scanButton.pack(pady=70)
#manualButton.pack(pady= (50, 0))

logoLabel.place(anchor="center", relx=0.5, rely=0.2)
welcomeLabel.place(anchor="center", relx=0.5, rely=0.40)
scanButton.place(anchor="center", relx=0.5, rely=0.63)
manualButton.place(anchor="center", relx=0.5, rely=0.80)
loginFrame.place(relx=0, rely=0, relwidth=1, relheight=1)

# manual frame

manualFrame = ctk.CTkFrame(screen, fg_color="transparent")

firstNameEntry = ctk.CTkEntry(
    manualFrame,
    placeholder_text="Juan",
    font=("Segoe UI Variable", 20)
)

lastNameEntry = ctk.CTkEntry(
    manualFrame,
    placeholder_text="Dela Cruz",
    font=("Segoe UI Variable", 20)
)

gradeLevelOptions = ctk.CTkOptionMenu(
    manualFrame,
    values = ["[Grade Level]", "11th Grade", "12th Grade"],
    font=("Segoe UI Variable", 20)
)

strandOptions = ctk.CTkOptionMenu(
    manualFrame,
    values = ["[Strand]","ABM", "CSS", "HUMSS", "STEM"],
    font=("Segoe UI Variable", 20)
)

sectionOptions = ctk.CTkOptionMenu(
    manualFrame,
    values = ["[Section]","1", "2", "3"],
    font=("Segoe UI Variable", 20)
)


firstNameLabel = ctk.CTkLabel(
    manualFrame,
    text="First Name: ",
    font=("Segoe UI Variable", 20)
).place(anchor="e", relx=0.35, rely=0.4)

lastNameLabel = ctk.CTkLabel(
    manualFrame,
    text="Last Name: ",
    font=("Segoe UI Variable", 20)
).place(anchor="e", relx=0.35, rely=0.48)

gradeLevelLabel = ctk.CTkLabel(
    manualFrame,
    text="Grade Level: ",
    font=("Segoe UI Variable", 20)
).place(anchor="e", relx=0.35, rely=0.56)

strandLabel = ctk.CTkLabel(
    manualFrame,
    text="Strand: ",
    font=("Segoe UI Variable", 20)
).place(anchor="e", relx=0.35, rely=0.64)

sectionLabel = ctk.CTkLabel(
    manualFrame,
    text="Section: ",
    font=("Segoe UI Variable", 20)
).place(anchor="e", relx=0.35, rely=0.72)


manualTipLabel = ctk.CTkLabel(
    manualFrame,
    text="",
    font=("Segoe UI Variable", 20, "italic")
)


manualSubmitButton = ctk.CTkButton(
    manualFrame,
    text="SUBMIT",
    corner_radius=20,
    fg_color="#545454",
    hover_color="#292828",
    height=50,
    width=120,
    text_color="white",
    font=("Segoe UI Variable", 28, "bold"),
    command=lambda: submitManual()
).place(relx=0.5, rely=0.85, anchor="center")

firstNameEntry.place(anchor="center", relwidth=0.3, relx=0.5, rely=0.4)
lastNameEntry.place(anchor="center", relwidth=0.3, relx=0.5, rely=0.48)
gradeLevelOptions.place(anchor="center", relwidth=0.3, relx=0.5, rely=0.56)
strandOptions.place(anchor="center", relwidth=0.3, relx=0.5, rely=0.64)
sectionOptions.place(anchor="center", relwidth=0.3, relx=0.5, rely=0.72)

manualTipLabel.place(anchor="center", relx=0.5, rely=0.78)

manualFrame.place(relx=0, rely=0, relwidth=1, relheight=1)

# start frame

startFrame = ctk.CTkFrame(screen, fg_color="transparent")

startLogo = ctk.CTkLabel( startFrame, text="", image=argusLogo )
loadingBar = ctk.CTkProgressBar(startFrame, orientation="horizontal", mode="indeterminate")
startMessageLabel = ctk.CTkLabel(
    startFrame,
    text="WELCOME!",
    font=("Segoe UI Variable", 50, "italic")
)

startFrame.place(relx=0, rely=0, relwidth=1, relheight=1)
startLogo.place(anchor="center", relx=0.5, rely=0.14)
loadingBar.place(anchor="center", relwidth=0.8, relx=0.5, rely=0.95)
startMessageLabel.place(anchor="center", relx=0.5, rely=0.5)

# scanqr frame

qrFrame = ctk.CTkFrame(screen, fg_color="transparent")

cameraLabel = ctk.CTkLabel(
    qrFrame,
    text="LOADING CAMERA...",
    font=("Segoe UI Variable", 35, "italic")
)

qrTipLabel = ctk.CTkLabel(
    qrFrame,
    text="Wait for the QR Scanner to load...",
    font=("Segoe UI Variable", 20, "italic")
)

qrScanButton = ctk.CTkButton(
    qrFrame,
    text="SCAN",
    corner_radius=20,
    fg_color="#545454",
    hover_color="#292828",
    height=50,
    width=120,
    text_color="white",
    font=("Segoe UI Variable", 28, "bold"),
    command=lambda: scanQR()
)

qrFrame.place(relx=0, rely=0, relwidth=1, relheight=1)
cameraLabel.place(relx=0.5, rely=0.57, relwidth=0.8, relheight=0.55, anchor="center")
qrTipLabel.place(relx=0.5, rely=0.88, anchor="center")
qrScanButton.place(relx=0.5, rely=0.95, anchor="center")


#camera stuff

webcam = None
cameraLoaded = False
lastFrame = None
isScanning = False

def renderFrames():
    retrieved, cameraFrame = webcam.read()
    global lastFrame
    global isScanning
    if retrieved:
        lastFrame = cameraFrame.copy()
        cameraFrame = cv2.flip( cv2.cvtColor(cameraFrame, cv2.COLOR_BGR2RGB), 1)
        tkCamera = ImageTk.PhotoImage( Image.fromarray(cameraFrame) )
        cameraLabel.configure(image=tkCamera)
        cameraLabel.image = tkCamera
        if not isScanning:
            isScanning = True
            threading.Thread(target=scanQR, daemon=True).start()
    screen.after(15, renderFrames)
    

def loadCamera():
    global cameraLoaded
    cameraLoaded = True
    global webcam
    webcam = cv2.VideoCapture(0)
    if not webcam.isOpened():
        raise RuntimeError("Cannot open webcam")
    cameraLabel.configure(text="")
    renderFrames()

def scanQR():
    global isScanning
    if lastFrame is None:
        return
    
    if qreaderLoaded:
        #global qreader
        print("scanning..")
        scanResult = qreader.detect_and_decode( image=cv2.cvtColor(lastFrame, cv2.COLOR_BGR2RGB) )
        
        if scanResult:
            print(scanResult[0])
            submitQR(str(scanResult[0]))
        else:
            print("no qr code found")
            #qrTipLabel.configure(text="No QR code detected")
            isScanning = False
    else:
        print("qreader not imported yet")
        isScanning = False

# submit info

def sendPost(userInfo): 
    result = requests.post('http://localhost:3000/user/', json = userInfo)
    try:
        result.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(err)
    else:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} >>> user info delivered, code {result.status_code}.")

def submitQR(qrData):
    global isScanning
    if not qrData.startswith("KC"):
        print("invalid QR, no KC prefix")
        isScanning = False
        qrTipLabel.configure(text="Failed to read, put your QR closer")
        return
    
    qrData = qrData[2:] # remove KC
    name, school = qrData.split("|") # separate between |
    firstName, lastName = name.split("+") # split between + in the name part
    grade = school[:2] # first 2 chars of school part, "11" or "12"
    section = school[-1] # last char of school part, "1" or "2" or "3"
    strand = school[2:-1] # middle part between the prev 2
    
    userInfo = {
        "firstName": firstName,
        "lastName": lastName,
        "grade": grade,
        "strand": strand,
        "section": section,
        "deviceID": sys.argv[1],
        "loginTime": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    print(userInfo)
    sendPost(userInfo)
    
    switchStartFrame(f"Welcome {firstName} {lastName}!")

def submitManual():
    if not firstNameEntry.get().strip():
        manualTipLabel.configure(text="First Name is empty!")
        return
        
    if not lastNameEntry.get().strip():
        manualTipLabel.configure(text="Last Name is empty!")
        return
    
    if gradeLevelOptions.get() == "[Grade Level]":
        manualTipLabel.configure(text="Select your Grade Level!")
        return
    if gradeLevelOptions.get() == "11th Grade":
        grade = '11'
    if gradeLevelOptions.get() == "12th Grade":
        grade = '12'
    
    if strandOptions.get() == "[Strand]":
        manualTipLabel.configure(text="Select your Strand!")
        return
    
    if sectionOptions.get() == "[Section]":
        manualTipLabel.configure(text="Select your Section!")
        return
    
    userInfo = {
        "firstName": firstNameEntry.get().title(),
        "lastName": lastNameEntry.get().title(),
        "grade": grade,
        "strand": strandOptions.get(),
        "section": sectionOptions.get(),
        "laptopID": sys.argv[1],
        "loginTime": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    print(userInfo)
    sendPost(userInfo)
    
    switchStartFrame(f"Welcome {firstNameEntry.get().title()} {lastNameEntry.get().title()}!")
# frame switcher

def switchQrFrame():
    if not cameraLoaded:
        threading.Thread(target=loadCamera, daemon=True).start()
    if not qreaderLoaded:
        qrScanButton.configure(state="disabled")
    glideLogo(qrFrame)

def glideLogo(frame):
    pos = 0.2
    def move():
        nonlocal pos
        if pos > 0.14:
            pos -= 0.005
            logoLabel.place(rely=pos)
            logoLabel.after(10, move)
        else:
            afterglideLogo = ctk.CTkLabel( frame, text="", image=argusLogo ).place(anchor="center", relx=0.5, rely=0.14)
            frame.after(80)
            frame.tkraise()
    logoLabel.place(rely=0.2)
    move()
    
def switchStartFrame(message):
    startMessageLabel.configure(text=message)
    loadingBar.start()
    startFrame.tkraise()
    screen.after(1000, screen.destroy)
    

loginFrame.tkraise()

print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Started App")
screen.mainloop()

webcam.release()


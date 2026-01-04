import customtkinter as ctk
from PIL import Image

ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

screen = ctk.CTk()

screen.overrideredirect(True)
screen.attributes("-topmost", True)
screen.geometry(f"{screen.winfo_screenwidth()}x{screen.winfo_screenheight()}+0+0")

argusLogo = ctk.CTkImage( light_image=Image.open("assets/argus.png"), size=(478.1,268.8) )

logoLabel = ctk.CTkLabel(
    screen,
    text="",
    image=argusLogo
).pack(pady = (30 , 0))

welcomeLabel = ctk.CTkLabel(
    screen,
    text="WELCOME!",
    font=("Segoe UI Variable", 35, "italic"),
    fg_color="transparent",
    bg_color="transparent"
).pack(pady = (0, 30))

scanButton = ctk.CTkButton(
    screen,
    text="SCAN QR",
    corner_radius=60,
    fg_color="#545454",
    hover_color="#292828",
    height=100,
    width=480,
    text_color="white",
    font=("Segoe UI Variable", 60, "bold"),
    command=screen.destroy
).pack(pady=70)

manualButton = ctk.CTkButton(
    screen,
    text="Enter Information Manually",
    corner_radius=20,
    fg_color="#a6a6a6",
    hover_color="#292828",
    height=50,
    width=120,
    text_color="white",
    font=("Segoe UI Variable", 28, "italic"),
    command=screen.destroy
).pack(pady= (50, 0))

#vignetteLabel = ctk.CTkLabel(screen, text="", image=vignetteImg).place(x=0, y=0, relwidth=1, relheight=1)

screen.mainloop()

import os
import sys
from PyQt6.QtWidgets import QApplication, QVBoxLayout, QWidget, QMainWindow, QLabel, QPushButton, QProgressBar
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

app = QApplication([])

window = QMainWindow()
window.setWindowTitle("ARGUS Log In")
window.setStyleSheet("background-color: white;")


bgLbl = QLabel(window)
bgLbl.setPixmap(QPixmap(r"assets\vignette.png"))
bgLbl.setScaledContents(True)
bgLbl.setGeometry(0, 0, screen.width(), screen.height())

# Start Process

def startDefault():
    window.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.Tool)
    window.showFullScreen()


try:
    if sys.argv[3] == "devMode":
        window.resize(800, 600)
        window.show()
    else:
        startDefault()
except:
    startDefault()

sys.exit(app.exec())

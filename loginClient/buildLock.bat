pyinstaller ^
--name="ArgusLock" ^
-y ^
--onedir ^
--add-binary "libs\libiconv.dll;pyzbar" ^
--add-binary "libs\libzbar-64.dll;pyzbar" ^
lock.py
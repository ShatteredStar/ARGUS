python -m PyInstaller ^
--name="ArgusLock" ^
-y ^
--onedir ^
--noconsole ^
--add-binary "libs\libiconv.dll;pyzbar" ^
--add-binary "libs\libzbar-64.dll;pyzbar" ^
lock.py
@ECHO OFF

for %%f in (*.scss) do (
    echo Compiling %%~nf
    scss --no-cache --update %%~nf.scss:../css/%%~nf.css --style=compressed --sourcemap=none
)
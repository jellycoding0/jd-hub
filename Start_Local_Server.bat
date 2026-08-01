@echo off
title ROBO-JD Local Server
echo ===================================================
echo   ROBO-JD 대시보드 로컬 서버를 실행합니다.
echo   브라우저 보안 제약(CORS) 없이 안전하게 구동됩니다.
echo ===================================================
echo.
echo   * 대시보드 접속 주소: http://localhost:8000
echo   * 서버를 종료하려면 이 창을 닫거나 Ctrl + C 를 누르세요.
echo.
start http://localhost:8000
python -m http.server 8000 --directory docs

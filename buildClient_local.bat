@echo off

cd clients

echo 'npm install'
npm install

rem COMMENT IN WHICH CLIENT YOU WANT TO WATCH LOCALLY

echo 'build youtube_producer client'
call npm run build-youtube-producer

echo 
echo 'test youtube_producer client'
call npm run test-youtube-producer-server

rem echo 'test  youtube-viewer-level2-TV client'
rem npm run  test-youtube-viewer-level2-tv-local &

rem echo 'watch  youtube-viewer-level2-TV client'
rem npm run watch-youtube-viewer-level2-tv

cd ..

pause

@echo off
REM Fast Production Deployment Script for univercel-tech-forge
REM DigitalOcean + Cloudflare Infrastructure

set SERVER=root@138.68.64.80
set DOMAIN=softwarewala.net

echo Starting deployment for univercel-tech-forge...

REM Build production
call npm run build:prod

REM Create deployment package
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'deploy.zip' -CompressionLevel Fastest -Force"

REM Upload to DigitalOcean server
scp deploy.zip %SERVER%:/tmp/

REM Deploy on server
ssh %SERVER% "cd /tmp && unzip -o deploy.zip -d /var/www/softwarewala.net/univercel-tech-forge/ && chown -R www-data:www-data /var/www/softwarewala.net/univercel-tech-forge && systemctl reload nginx"

REM Cleanup
del deploy.zip

echo Deployment completed successfully!
echo Application available at: https://%DOMAIN/univercel-tech-forge

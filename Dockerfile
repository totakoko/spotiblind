# FROM nginx:1.18.0-alpine
# Use an image with brotli module
FROM fholzer/nginx-brotli:v1.18.0

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/init.sh /init.sh
COPY dist/. /usr/share/nginx/html/

EXPOSE 5000
CMD ["/init.sh"]

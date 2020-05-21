FROM nginx:1.18.0-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/init.sh /init.sh
COPY dist/. /usr/share/nginx/html/

EXPOSE 5000
CMD ["/init.sh"]

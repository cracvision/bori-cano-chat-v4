FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 8080
# Repo fix test
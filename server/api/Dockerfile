FROM projectlighthouse/dockerables:node_alpine.1.0.3

RUN mkdir -p /home/app/api/node_modules /etc/service/api /etc/service/api/log /etc/service/log_forwarder

WORKDIR /home/app/api

COPY package.json /home/app/api

RUN npm cache clean && npm i
# RUN npm cache clean && npm i --silent --progress=false

COPY . /home/app/api

# ADD internal/build/docker-entrypoint.sh /docker-entrypoint

ADD internal/build/runit/service/api.runit /etc/service/api/run
ADD internal/build/runit/dummy_forwarder/dummy_forwarder.runit /etc/service/log_forwarder/run
ADD internal/build/runit/service/log/run /etc/service/api/log/run

RUN chmod +x /etc/service/api/run && chmod +x /etc/service/api/log/run && chmod +x /etc/service/log_forwarder/run

ENTRYPOINT ["/docker-entrypoint"]

EXPOSE 8000

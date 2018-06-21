FROM mongo:3.2.17

RUN mkdir -p /home/dump

WORKDIR /home/dump

COPY dump /home/dump 
COPY mongo.sh /home/mongo.sh
RUN chmod 777 /home/mongo.sh

CMD ["/home/mongo.sh"]

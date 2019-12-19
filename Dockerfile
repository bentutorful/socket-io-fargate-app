FROM node:10 AS build

WORKDIR /srv

ADD package.json .
RUN npm install

ADD . .


FROM node:10-alpine

COPY --from=build /srv .

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
FROM redhat/ubi9 as build_base
COPY package.json /opt/src/package.json

WORKDIR /opt/src
EXPOSE 8080
RUN curl -sL https://rpm.nodesource.com/setup_20.x | bash -
RUN yum install -y nodejs
RUN npm install

FROM build_base
COPY . /opt/src
CMD npm run start
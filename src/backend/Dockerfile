FROM redhat/ubi9 as build_base

COPY ./requirements.txt ./opt/src/requirements.txt

ARG AZURE_OPENAI_API_KEY
ARG DB_HOST

ENV AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
ENV DB_HOST=${DB_HOST}
ENV OPENAI_API_TYPE=azure

EXPOSE 8000

WORKDIR /opt/src

RUN yum install -y python3-pip

RUN python3 -m pip install -r ./requirements.txt

FROM build_base

COPY . /opt/src

CMD env && python3 main.py
FROM redhat/ubi9

COPY . /opt/src

ARG AZURE_OPENAI_API_KEY
ARG DB_HOST

ENV AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
ENV DB_HOST=${DB_HOST}
EXPOSE 8000

WORKDIR /opt/src

RUN yum install -y python3-pip

RUN python3 -m pip install -r ./requirements.txt

CMD env && python3 main.py
FROM debian:12-slim AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        socat \
        libpq-dev \
        && \
    apt-get clean

RUN mkdir -p /build
WORKDIR /build

COPY arasaka_academy .
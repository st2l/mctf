#!/usr/bin/env bash

while true; do
    psql postgresql://postgres@db:5432/arasaka_academy -c "DELETE FROM session WHERE timestamp <= NOW() - INTERVAL '5 minutes'";
    sleep 60;
done
#!/bin/bash

docker exec -it matcha-postgres-1 psql -U postgres -d matcha_dev -c "truncate table users cascade";
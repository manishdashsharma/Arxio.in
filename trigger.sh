#!/bin/bash
docker exec arxio-api uv run python /app/trigger.py 2>&1

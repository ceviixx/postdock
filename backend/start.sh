#!/usr/bin/env bash
set -e
mkdir -p /app/data
exec uvicorn app.api:app --host 0.0.0.0 --port 8080

#!/usr/bin/env bash

set -o errexit

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# Optional: fill the demo with sample data when SEED_DEMO=true (safe to repeat)
if [ "$SEED_DEMO" = "true" ]; then
  python manage.py seed_demo
fi

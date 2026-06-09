FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY ingest.py .
COPY scripts ./scripts
COPY data ./data

RUN chmod +x scripts/render_build.sh scripts/render_start.sh

EXPOSE 8000

CMD ["bash", "scripts/render_start.sh"]

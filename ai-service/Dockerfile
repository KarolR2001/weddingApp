# --- AI Service Dockerfile ---
FROM python:3.10-slim

# Zmienne środowiskowe dla Pythona
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=180 PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1

# (Opcj.) systemowe zależności do budowy kółek
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Katalog roboczy
WORKDIR /app

# Zależności Pythona
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel \
 && pip install --retries 5 --timeout 300 --prefer-binary -r /app/requirements.txt

# Skopiuj pozostałe pliki (na razie pusto; Etap 2 doda kod)
COPY . /app

# Port dla przyszłego FastAPI (Etap 2)
EXPOSE 8000

# Na Etapie 1 podtrzymujemy kontener przy życiu bez uruchamiania API
CMD ["sh", "-c", "sleep infinity"]



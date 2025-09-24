FROM python:3.11-slim

RUN groupadd -r mediaservice && useradd -r -g mediaservice mediaservice

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=mediaservice:mediaservice src/ .

# Variables d'environnement pour Flask
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

# Create uploads directory with proper permissions before switching user
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

USER mediaservice
EXPOSE 8006

# --reload active le rechargement automatique
CMD ["flask", "run", "--host=0.0.0.0", "--port=8006", "--reload"]

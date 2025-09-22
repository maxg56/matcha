FROM python:3.11-slim

RUN groupadd -r notifyservice && useradd -r -g notifyservice notifyservice

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=notifyservice:notifyservice src/ .

# Variables d'environnement pour Flask
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

# Pour que les logs s'affichent immédiatement
ENV PYTHONUNBUFFERED=1

USER notifyservice
EXPOSE 8005

# --reload active le rechargement automatique
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
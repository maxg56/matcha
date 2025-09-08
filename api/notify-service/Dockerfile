FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

# Variables d'environnement pour Flask
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

# Pour que les logs s'affichent immédiatement
ENV PYTHONUNBUFFERED=1

EXPOSE 8005

# --reload active le rechargement automatique
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
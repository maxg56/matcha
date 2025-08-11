FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

# Variables d'environnement pour Flask
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

EXPOSE 8003

# --reload active le rechargement automatique
CMD ["flask", "run", "--host=0.0.0.0", "--port=8003", "--reload"]

FROM python:3.11-slim

RUN groupadd -r usercreation && useradd -r -g usercreation usercreation

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=usercreation:usercreation src/main.py ./

USER usercreation
CMD ["python3", "main.py"]

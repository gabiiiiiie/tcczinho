FROM python:3.12-slim

WORKDIR /app

# Copia e instala as dependências
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia todos os arquivos do projeto para o container
COPY . .

# Comando padrão
CMD ["python", "app.py"]

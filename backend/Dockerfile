FROM python:3.8

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_ENV=development
CMD ["flask", "run", "--host=0.0.0.0"]

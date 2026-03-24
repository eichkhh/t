## Configuration

всі змінні середовища задані в `docker-compose.yml`. перед запуском замінити webhook URL в секції `notification-service`:

```yaml
PUSH_WEBHOOK_URL: https://webhook.site/<your-id>
```

отримати URL можна на [webhook.site](https://webhook.site).

## Run

```bash
docker compose up --build -d
```

## Web UIs

| Service    | URL                                |
| ---------- | ---------------------------------- |
| Kibana     | http://localhost:5601              |
| Grafana    | http://localhost:3100              |
| Jaeger     | http://localhost:16686             |
| Prometheus | http://localhost:9090              |
| RabbitMQ   | http://localhost:15672             |
| Bull Board | http://localhost:3002/admin/queues |

## Register a user

```bash
curl -X POST http://localhost:3000/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

## Run

```bash
docker compose up --build -d
```

## Register a user

```bash
curl -X POST http://localhost:3000/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

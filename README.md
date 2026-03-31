# BetterDraxAger
Memes shall live

## Stack

- **Backend** — ASP.NET Core, SignalR, Entity Framework Core, SQLite, .NET Identity, JWT
- **Frontend** — React, Vite, TypeScript, tsparticles, @microsoft/signalr
- **Infrastructure** — Docker Compose, nginx

---

## Local Development

**Requirements:** .NET 10 SDK, Node 22, Docker (optional for local)

```bash
# 1. Backend
cd src/BetterDraxAger.Api
cp ../../configuration/appsettings.json.example appsettings.json
# Fill in appsettings.json (set a JWT secret, keep DefaultConnection as-is for local)
dotnet run

# 2. Frontend (separate terminal)
cd src/BetterDraxAger.Client
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

---

## Hosting with Docker Compose

**Requirements:** Docker, Docker Compose, nginx on the host machine

### 1. Clone and configure

```bash
git clone <repo> /srv/draxager
cd /srv/draxager

cp configuration/.env.example .env
cp configuration/appsettings.json.example src/BetterDraxAger.Api/appsettings.json
```

Edit `.env`:

```env
JWT_SECRET=your_strong_secret_minimum_32_characters
NGINX_PORT=8080
```

Edit `src/BetterDraxAger.Api/appsettings.json`:

```json
"CorsOrigins": [ "https://yourdomain.com" ]
```

### 2. Start containers

```bash
docker compose up -d --build
```

The app is now running on `http://localhost:8080` (or whatever `NGINX_PORT` is set to).

### 3. Configure host nginx

Copy and edit the VPS nginx example:

```bash
cp configuration/nginx.vps.conf.example /etc/nginx/sites-available/draxager
# Replace yourdomain.com with your actual domain
nano /etc/nginx/sites-available/draxager

ln -s /etc/nginx/sites-available/draxager /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 4. SSL

```bash
certbot --nginx -d yourdomain.com
```

### Redeploying

```bash
bash scripts/deploy.sh
```

---

## Configuration

| File | Purpose |
| ---- | ------- |
| `.env` | Docker Compose secrets (`JWT_SECRET`, `NGINX_PORT`) |
| `src/BetterDraxAger.Api/appsettings.json` | App config (CORS origins, DB path, JWT settings) |
| `configuration/nginx.conf` | nginx config inside the Docker container |
| `configuration/nginx.vps.conf.example` | Host machine nginx template (SSL termination, reverse proxy) |

Both `.env` and `appsettings.json` are gitignored. Copy from the `.example` files and fill in your values.

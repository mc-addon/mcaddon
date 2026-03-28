<div align="center">

![MC Addon](./assets/banner.png)

# MC Addon

A minimal companion site for Minecraft server management with Discord integration and Tebex store support.

</div>

## 💫 Prerequisites

| Tool                                                                                                                        | Type     | Version | Purpose                 |
| --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----------------------- |
| [![Git](https://img.shields.io/badge/Git-%23F05133?style=for-the-badge&logo=git&logoColor=%23FFFFFF)](https://git-scm.com/) | Required | 2.50+   | Source control          |
| [![Bun](https://img.shields.io/badge/Bun-%23F472B6?style=for-the-badge&logo=bun&logoColor=%23FFFFFF)](https://bun.sh/)      | Required | 1.3+    | Runtime package manager |

> [!NOTE]
> *`wrangler` is required only for Cloudflare deployment.

## 🚀 Production

1. Clone this repository:
   ```sh
   git clone https://github.com/mc-addon/mcaddon
   cd mcaddon
   ```

2. Install dependencies:
   ```sh
   bun i
   ```
3. Copy `.env` file and configure secrets
    ```sh
    cp .env.example .env
    ```
> [!TIP]
> Check [environment variables](#-environment-variables) section for details on the environment variables.

4. Initialize database schema
    ```sh
    bun run db:push
    ```

5. Sync static assets
    ```sh
    bun run sync-assets
    ```

6. Authenticate with Cloudflare
   ```sh
   bunx wrangler login
   ```

7. Copy `example.wrangler.toml` to `wrangler.toml` and configure it. (*For `[vars]` section, copy-paste the values from `.env`*)

8. Deploy
   ```sh
   bun run deploy
   ```

## 🛸 Development

1. Follow first 3 steps from the [production](#-production) section.

2. Start development server
    ```sh
    bun run dev
    ```

## 🔑 Environment Variables

| Variable                      | Type     | Description                       |
| ----------------------------- | -------- | --------------------------------- |
| `PUBLIC_DISCORD_URL`          | `string` | Discord API base URI              |
| `PUBLIC_MCSTATUS_JAVA_API`    | `string` | Java server status API            |
| `PUBLIC_MCSTATUS_BEDROCK_API` | `string` | Bedrock server status API         |
| `DATABASE_URL`                | `string` | Supabase connection string        |
| `DISCORD_CLIENT_ID`           | `string` | Discord client ID                 |
| `DISCORD_CLIENT_SECRET`       | `string` | Discord client secret             |
| `DISCORD_BOT_TOKEN`           | `string` | Discord bot token                 |
| `JWT_SECRET`                  | `string` | Secret key for JWT signin         |
| `PUBLIC_TEBEX_TOKEN`          | `string` | Public Tebex token for API access |
| `TEBEX_PRIVATE_KEY`           | `string` | Private key for Tebex API         |

## ❤️ Contributing

- Follow commit conventions.
- Keep code style consistent.
- Run formatting and checks before pushing
    ```sh
    bun run format && bun run check
    ```
- See [`STYLES.md`](./STYLES.MD) for style guidelines.

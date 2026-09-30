<div align="center">

![MC Addon](./assets/banner.png)

# MC Addon

Official MC Addon Webstore

[![Svelte](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmc-addon%2Fmcaddon%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22svelte%22%5D&style=for-the-badge&logo=svelte&logoColor=%23FFFFFF&label=Svelte&labelColor=%23FF3E00&color=%23000000)](https://svelte.dev/docs/svelte/overview)
[![Tailwind CSS](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmc-addon%2Fmcaddon%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22tailwindcss%22%5D&style=for-the-badge&logo=tailwindcss&logoColor=%23FFFFFF&label=Tailwind%20CSS&labelColor=%2306B6D4&color=%23000000)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmc-addon%2Fmcaddon%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22drizzle-orm%22%5D&style=for-the-badge&logo=drizzle&logoColor=%23000000&label=Drizzle%20ORM&labelColor=%23C5F74F&color=%23000000)](https://orm.drizzle.team)
[![License](https://img.shields.io/github/license/mc-addon/mcaddon?style=for-the-badge&logo=gnu&logoColor=%23FFFFFF&labelColor=%23A32D2A&color=%23000000)](https://github.com/mc-addon/mcaddon/blob/main/LICENSE)

</div>

## 📸 Preview

https://github.com/user-attachments/assets/7d95cf4d-6f08-419d-b9c8-d6076feccb9d

## 💫 Prerequisites

| Tool                                                                                                                        | Type     | Version | Purpose                 |
| --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----------------------- |
| [![Git](https://img.shields.io/badge/Git-%23F05133?style=for-the-badge&logo=git&logoColor=%23FFFFFF)](https://git-scm.com/) | Required | 2.50+   | Source control          |
| [![Bun](https://img.shields.io/badge/Bun-%23F472B6?style=for-the-badge&logo=bun&logoColor=%23FFFFFF)](https://bun.sh/)      | Required | 1.3+    | Runtime package manager |

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

1. Follow first 5 steps from the [production](#-production) section.

2. Start the development server
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

### 📚 Getting database keys

1. Host a PostgreSQL database (e.g. Local PostgreSQL, Supabase, etc.).

2. Set connection string in `DATABASE_URL` environment variable.
    ```
    postgresql://<username>:<password>@<host>:<port>/<database>
    ```
> [!TIP]
> For Supabase, you can find the connection string by clicking the `Connect` button at the top bar of the Supabase dashboard.
> ![Supabase Database URL](./assets/db_url.png)

### 🔮 Getting Discord OAuth keys

- Get `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` from the Discord Developer Portal.
        ![Client Info](./assets/client_info.png)

- Get `DISCORD_BOT_TOKEN` from the Discord Developer Portal.
    ![Bot Token](./assets/bot_token.png)

### 💸 Getting Tebex keys

- Open Tebex dashboard and go to `Integration` > `API Keys`
    ![Tebex](./assets/tebex.png)

### 🪇 Other keys

- Generate `JWT_SECRET` by running the following command.
    ```sh
    bun run gen-secret
    ```

## ❤️ Contributing

- Follow commit conventions.
- Keep code style consistent.
- Run formatting and checks before pushing
    ```sh
    bun run format && bun run check
    ```
- See [`STYLES.md`](./STYLES.MD) for style guidelines.

## 🎨 Assets

The code is licensed under [GPL-3.0](./LICENSE). Assets are not.

- Minecraft textures & sounds belong to Mojang. Not affiliated with Mojang AB or Microsoft.
- [Minecraftia](https://andrewtyler.gumroad.com) font by Andrew Tyler, licensed CC BY-SA.

# BACKEND UPT - Node.JS Express.JS Prisma PostgreSQL & Docker

This guide provides an overview of the codebase, the functionality of the app, and detailed instructions on how to set up and run the app. Make sure to follow all steps carefully, especially regarding Node.js version requirements.

## Overview

This is an **Dockerized** and authentication-protected Todo App using **Node.js**, **Express.js**, **bcrypt**, **JWT authentication**, **Prisma**, and **PostgreSQL**. The app allows users to:

- **Register**: Create a new account.
- **Login**: Authenticate and receive a JWT token.

### Example Workflow

1. **Define or Update Schema**: Modify the `schema.prisma` file to change your database structure.
2. **Create Migrations**: Use Prisma to generate and apply migrations.
3. **Run Docker Compose**: Build and run the Node.js app and PostgreSQL using Docker Compose.
4. **Interact with the API**: Use the frontend or API client (e.g., Postman) to register, login, and manage all features.

This project structure and workflow will help organize your code and make it easier to maintain and scale as your application grows.

## Getting Started

0. **Install Docker Desktop**

1. **Clone the Repository**:

```bash
git clone https://github.com/isshoo/BE-UPT.git
cd BE-UPT
```

2. **Generate the Prisma Client**:

`npx prisma generate`

3. **Build your docker images**:

`docker compose build`

4. **Create PostgreSQL migrations and apply them**:

`docker compose run app npx prisma migrate dev --name init`

_Also_ - to run/apply migrations if necessary:

`docker-compose run app npx prisma migrate deploy`

5. **Boot up 2x docker containers**:

`docker compose up`

_or_

`docker compose up -d`

If you want to boot it up without it commandeering your terminal (you'll have to stop if via Docker Desktop though).

6. **To login to docker PostgreSQL database (from a new terminal instance while docker containers are running) where you can run SQL commands and modify database!**:

`docker exec -it postgres-db psql -U postgres -d upt_db`

7. **To stop Docker containers**:

`docker compose down`

8. **To delete all docker containers**:

`docker system prune`

9. **Access the App**:

Open `http://localhost:5001` (or `localhost:3000` if changed) in your browser to see the frontend. You can register, log in, and manage your todo list from there.

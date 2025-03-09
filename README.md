<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A well-structured and scalable <a href="http://nodejs.org" target="_blank">Node.js</a> API built with NestJS, following Clean Architecture principles.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

---

# 🚀 NestJS Advanced Setup

## 📌 Project Overview
This project is a structured and modular NestJS API, following best practices to ensure maintainability and scalability. The goal is to configure an advanced NestJS architecture while integrating PostgreSQL with TypeORM and applying Clean Architecture principles.

## 📅 Development Plan

### Jours 1-2: Setup & Advanced Architecture
- ✅ Configure a modular NestJS project to prevent technical debt.
- ✅ Set up TypeORM with PostgreSQL.
- ✅ Implement automatic migration scripts.
- ✅ Structure the API following Clean Architecture principles.

## 🛠 Installation & Configuration

### 1️⃣ Install & Setup NestJS
```bash
npx @nestjs/cli new my-api
cd my-api
pnpm install
```

### 2️⃣ Configure TypeORM with PostgreSQL
```bash
pnpm install @nestjs/typeorm typeorm pg
```
- Create a PostgreSQL database.
- Add the connection in `app.module.ts`.

### 3️⃣ Setup dotenv for Environment Variables
```bash
pnpm install @nestjs/config
```

## 🔧 Used Libraries
- `@nestjs/typeorm`
- `typeorm`
- `pg`
- `@nestjs/config`
- `@nestjs/mapped-types`

## 🛠 Practical Exercise: Users API

### ✅ Task List
- Create a well-structured **Users API**.
- Implement a `users` module with its **service** and **controller**.
- Define a `User` entity with the following properties:
    - `id`
    - `email`
    - `password`
    - `createdAt`
- Add a **repository layer** to separate logic efficiently.

## 🚀 Run the Project

```bash
# Development mode
pnpm run start

# Watch mode
pnpm run start:dev

# Production mode
pnpm run start:prod
```

## ✅ Run Tests
```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📦 Deployment
For deployment best practices, refer to the [NestJS Deployment Guide](https://docs.nestjs.com/deployment).

## 📚 Resources
- Official [NestJS Documentation](https://docs.nestjs.com)
- Connect with the community on [Discord](https://discord.gg/G7Qnnhy)
- Follow updates on [Twitter](https://twitter.com/nestframework)
- Explore NestJS [Courses](https://courses.nestjs.com)

## 📜 License
This project is licensed under the [MIT License](https://github.com/nestjs/nest/blob/master/LICENSE).


# 🖼️ NFT Platform Backend

A backend service for managing NFT auctions, built with **Node.js**, **TypeScript**, **PostgreSQL**, **Redis**, and **BullMQ**.

## 🚀 Features

- 🧾 RESTful API for managing NFTs and auctions
- ⏱️ Background jobs via BullMQ (e.g., closing auctions)
- 🗃️ PostgreSQL for data persistence
- ⚡ Redis for caching and job queues
- 🧪 Modular and scalable code structure with TypeScript

---

## 📦 Tech Stack

- **Node.js**
- **TypeScript**
- **PostgreSQL**
- **Redis**
- **BullMQ**
- **Cache Manager**
- **Docker & Docker Compose**

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nft-platform.git
cd nft-platform/backend

### install dependencies 

npm install 

### 3. Configure environment variables

Create a .env file in the backend folder:

PORT=4000
REDIS_HOST=localhost
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=nft_db

### 4. Run via Docker (Postgres & Redis)

docker-compose up -d

### 5. Start the Development Server

npm run dev

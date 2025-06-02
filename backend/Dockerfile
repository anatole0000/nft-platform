# Dockerfile

FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package files trước để cache npm install
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build Prisma client
RUN npx prisma generate

# Expose cổng (nếu bạn chạy backend trên cổng 3000)
EXPOSE 3000

# Chạy app bằng ts-node (phù hợp với script:dev)
CMD ["npm", "run", "dev"]

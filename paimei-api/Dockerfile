# Stage 1: Builder
FROM golang:1.25-alpine AS builder
WORKDIR /app
# Copy go.mod dan go.sum dulu agar caching dependency efisien
COPY go.mod go.sum ./
RUN go mod download
# Copy semua kode source
COPY . .
# Build aplikasi menjadi binary bernama 'main'
RUN go build -o main ./cmd/api/main.go

# Stage 2: Runner
FROM alpine:latest
# Mengatur zona waktu agar Golang bisa membaca Asia/Jakarta dengan akurat
RUN apk add --no-cache tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app
# Copy binary dari stage builder
COPY --from=builder /app/main .
# Copy file env jika kamu tidak pass lewat docker-compose
# COPY .env .

EXPOSE 3000

# Jalankan aplikasi
CMD ["./main"]
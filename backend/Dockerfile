FROM golang:1.25-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Asumsi entrypoint kamu nanti ada di cmd/api/main.go
RUN go build -o main ./cmd/api/main.go
EXPOSE 8080
CMD ["./main"]
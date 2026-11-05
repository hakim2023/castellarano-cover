FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data TRUST_PROXY=1
COPY . .
# /data must be a persistent volume on the host (database + uploaded photos).
# Runs as root because host-mounted volumes are root-owned on Railway/Fly.
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "server.js"]

module.exports = {
  apps : [{
    name: 'assignment3',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
        NODE_PORT: 3300,
        MONGO_URL: "mongodb://18.223.143.26:27017/",
        REDIS_URL: "redis://13.59.222.209:6379",
		SERVER_HOSTNAME : "ian-gaither.cs261.net",
		SERVER_PORT : "8004"
    },
    cwd: './assignment3'
  }]
};

module.exports = {
  apps: [
    {
      name: 'overhous-admin',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        "NUXT_APP_BASE_URL": "/overhous",
        "PORT": 3005
      }
    }
  ]
}
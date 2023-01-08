module.exports = {
  apps: [
    {
      name: 'quicks',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        "NUXT_APP_BASE_URL": "/quicks",
        "PORT": 3005
      }
    }
  ]
}
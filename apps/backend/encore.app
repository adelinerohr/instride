{
  "id": "instride-zeai",
  "lang": "typescript",
  "build": {
    "hooks": {
      "prebuild": "npx turbo build --filter=backend^..."
    }
  },
  "global_cors": {
    "allow_origins_with_credentials": [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://127.0.0.1:9800",
      "http://localhost:5173",
      "https://instride.vercel.app",
      "https://instrideapp.com",
      "https://app.instrideapp.com",
      "https://api.instrideapp.com"
    ],
    "allow_origins_without_credentials": [
      "http://localhost:3000",
      "http://127.0.0.1:9800",
      "http://localhost:4000",
      "https://instride.vercel.app",
      "https://*.instride.vercel.app",
      "https://instrideapp.com",
      "https://*.instrideapp.com"
    ]
  }
}
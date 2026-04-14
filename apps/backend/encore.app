{
	"id":   "instride-zeai",
	"lang": "typescript",
  "build": {
    "hooks": {
      "prebuild": "npx turbo build --filter=@instride/backend^..."
    }
  }
}

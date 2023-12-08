package main

import (
	"embed"

	"jeefy/drawer"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	api := drawer.NewApi()
	draw := drawer.NewDrawer(api)
	base := NewImgBase64(api, draw)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "paint-ui",
		Width:  1600,
		Height: 900,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app, api, draw, base,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

package main

import (
	"context"
	"fmt"
	"os"
	"bytes"
	"strings"
	"encoding/base64"

	"jeefy/drawer"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type ImgBase64 struct {
	api *drawer.Api
	draw *drawer.ImageDrawer
}

func (img *ImgBase64) GetBoard() string {
	var data bytes.Buffer
	var res strings.Builder
	img.api.SaveBoard(&data)

	encoder := base64.NewEncoder(base64.StdEncoding, &res)
	data.WriteTo(encoder)
	encoder.Close()

	fmt.Println("Get Board OK !!!")
	return res.String()
}

func (img *ImgBase64) FromBase64(str string) string {
	decoded, err := base64.StdEncoding.DecodeString(str)
	if err != nil {
		fmt.Println("Decode Error !!!", err)
		return err.Error()
	}

	f, err := os.CreateTemp("", "draw-*.png")
	if err != nil {
		fmt.Println("Create tmp image failed !!!", err)
		return err.Error()
	}
	f.Write(decoded)
	f.Close()

	path := f.Name()
	defer os.Remove(path)
	fmt.Println("CreateTemp File at", path)

	if ok, msg := img.draw.SetImage(path); !ok {
		return "Error: " + msg
	}

	return ""
}

func NewImgBase64(api *drawer.Api, draw *drawer.ImageDrawer) (*ImgBase64) {
	return &ImgBase64{api, draw}
}


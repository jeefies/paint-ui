package main

import (
	"context"
	"fmt"
	"os"
	"bufio"
	"bytes"
	"strings"
	"encoding/base64"
	"image"
	"image/png"
	_ "image/jpeg"

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

func (this *ImgBase64) FromBase64(str string) string {
	img, _, err := image.Decode(base64.NewDecoder(base64.StdEncoding, strings.NewReader(str)))
	if err != nil {
		fmt.Println("Error:", err)
		return ""
	}

	tmp, err := os.CreateTemp("", "draw*.png")
	if err != nil {
		fmt.Println("Create Temp Failed ??? ", err)
		return ""
	}

	path := tmp.Name()
	defer os.Remove(path)

	fmt.Println("Create Temp Image at", path)

	if err := png.Encode(tmp, img); err != nil {
		tmp.Close()
		return ""
	}

	tmp.Close()
	err = this.draw.SetImage(path)
	if err != nil {
		fmt.Println("Set Image Failed")
		return ""
	}

	fp, err := os.Open(path)
	if err != nil {
		fmt.Println("Open Temp file failed...", err)
		return ""
	}

	var result strings.Builder
	encoder := base64.NewEncoder(base64.StdEncoding, &result)
	bufio.NewReader(fp).WriteTo(encoder)
	encoder.Close()

	return result.String()
}

func NewImgBase64(api *drawer.Api, draw *drawer.ImageDrawer) (*ImgBase64) {
	return &ImgBase64{api, draw}
}


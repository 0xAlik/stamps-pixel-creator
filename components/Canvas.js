import React, { useState, useEffect } from 'react';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { palette } from '@/utils/consts';

function Canvas({onCanvasChange}) {

  const [pixels, setPixels] = useState([]);
  const [pixelsSize, setPixelsSize] = useState(24);
  const [mousingPixel, setMousingPixel] = useState(false);
  const [paletteCustom, setPaletteCustom] = useState([]);
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#ffff00');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundTransparent, setBackgroundTransparent] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    changeBackground(backgroundColor);
  }, []);
  
  const changeBackground = (color) => {
    const _pixels = [];
    for(let i = 0; i < pixelsSize; i++) {
      const row = [];
      for(let j = 0; j < pixelsSize; j++) {
        if(started) {
          if(pixels[i][j] === backgroundColor) row.push(color);
          else row.push(pixels[i][j]);
        }else{
          row.push(color);
        }
      }
      _pixels.push(row);
    }
    if(color === '#00000000') setBackgroundTransparent(true);
    else setBackgroundTransparent(false);
    setBackgroundColor(color);
    setActiveTool('brush');
    setPixels(_pixels);
    changeCanvas(_pixels);
  }
  const clearBackground = () => {
    changeBackground('#00000000');
  }

  const changeTool = (tool) => {
    switch(tool) {
      case 'brush':
        toast('Brush selected');
        break;
      case 'colorpicker':
        toast('Choose brush color from palette or canvas');
        break;
      case 'background':
        toast('Choose background color from palette or canvas');
        break;
      case 'nobackground':
        toast('Background set to transparent');
        clearBackground();
        tool = 'brush';
        break;
    }
    setActiveTool(tool);
  }

  const mouseUp = (e) => {
    e.stopPropagation();e.preventDefault();
    setMousingPixel(false);
  }

  const mouseDown = (e, pixel, row, column) => {
    e.stopPropagation();e.preventDefault();
    setMousingPixel(true);
    switch(activeTool) {
      case 'brush':
        setPixelToPixels(row, column);
        setStarted(true);
        break;
      case 'colorpicker':
        setActiveColor(pixel);
        break;
      case 'background':
        changeBackground(pixel)
        break;
      }
    setActiveTool('brush');
  }

  const stopMousingPixel = () => {
    setMousingPixel(false);
  }

  const changeColor = (color) => {
    switch(activeTool) {
      case 'background':
        changeBackground(color);
        setActiveTool('brush');
        break;
      default:
        setActiveColor(color);
        break;
    }
  }

  const mouseOver = (e, pixel, row, column) => {
    e.stopPropagation();e.preventDefault();
    if(mousingPixel) {
      switch(activeTool) {
        case 'brush':
          setPixelToPixels(row, column);
          break;
      }
    }
  }

  const setPixelToPixels = (row, column) => {
    const _pixels = [...pixels];
    const _paletteCustom = paletteCustom;
    _pixels[row][column] = activeColor;
    setPixels(_pixels);
    changeCanvas(_pixels);
    if(!_paletteCustom.find(c=>c===activeColor)) {
      _paletteCustom.push(activeColor);
    }
    setPaletteCustom(_paletteCustom);
  }

  const arrayToPngBuffer = async (pixels) => {
    if(pixels?.length === 0) return;
    const width = pixels.length;
    const height = pixels[0].length;
  
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
  
    // Create an ImageData object to store the pixel data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const hex = pixels[y][x].substring(1); // Remove '#' from the hexadecimal string
        const rgb = parseInt(hex, 16);
  
        data[idx] = (rgb >> 16) & 0xFF; // R
        data[idx + 1] = (rgb >> 8) & 0xFF; // G
        data[idx + 2] = rgb & 0xFF; // B
        data[idx + 3] = 0xFF; // A
        if(pixels[y][x] === '#00000000') data[idx + 3] = 0x00; // A (transparent
      }
    }
  
    // Put the pixel data on the canvas
    ctx.putImageData(imageData, 0, 0);
  
    // Convert the canvas to a Blob (binary data)
    const pngBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  
    return pngBlob;
  }

  const changeCanvas = async () => {
    const pngBlob = await arrayToPngBuffer(pixels);
    if(pngBlob) {
      const pngBuffer = await pngBlob.arrayBuffer();
      const pngBase64 = btoa(String.fromCharCode(...new Uint8Array(pngBuffer)));
      onCanvasChange(pngBase64);
    }
  }

  return (
    <>
      <div className="Canvas">
        <aside>
          <div className="tools">
            <div className={`tool currentColor ${activeTool==='brush'?'active':''}`} onClick={()=>changeTool('brush')}>
              <div className="color" style={{background: activeColor}}></div>
            </div>
            <div className={`tool colorPicker ${activeTool==='picker'?'active':''}`} onClick={()=>changeTool('colorpicker')}>
              <img src="/picker.png"/>
            </div>
          </div>
        </aside>
        <section className="canvas" onMouseOver={()=>stopMousingPixel()}>
          <div className="board">
            {pixels?.map((row, rowIndex)=>(
              <div className="row" key={rowIndex}>
                {row.map((pixel, pixelIndex)=>(
                  <div 
                    className={`pixel row_${rowIndex} column_${pixelIndex} ${backgroundTransparent?'transparent':''}`} 
                    key={pixelIndex} 
                    style={{background: pixel}}
                    onMouseUp={(event)=>mouseUp(event)} 
                    onMouseDown={(event)=>mouseDown(event, pixel, rowIndex, pixelIndex)} 
                    onMouseOver={(event)=>mouseOver(event, pixel, rowIndex, pixelIndex)}
                  ></div>
                ))}
              </div>
            ))}
          </div>
          <div className="palette">
            {palette?.map((paletteColor, paletteColorIndex)=>(
              <div
                className="palette-color"
                key={paletteColorIndex}
                style={{background: paletteColor}}
                onClick={()=>changeColor(paletteColor)}
              ></div>
            ))}
          </div>
        </section>
        <aside>
          <div className="tools">
            <div className={`tool backgroundColor ${activeTool==='background'?'active':''}`} onClick={()=>changeTool('background')}>
              <div className="color" style={{background: backgroundColor}}>BG</div>
            </div>
            <div className={`tool colorPicker ${activeTool==='picker'?'active':''}`} onClick={()=>changeTool('nobackground')}>
              <img src="/cancel.png"/>
            </div>
          </div>
        </aside>
      </div>
      <style jsx>{`
        .Canvas {
          max-width: 100%;
          margin: auto;
          background-image: url('/dots.png');
          background-repeat: repeat;
          background-position: center center;
          background-size: auto;
          text-align: center;
        }
        .Canvas aside, 
        .Canvas .canvas {
          display: inline-block;
          vertical-align: top;
        }
        .Canvas .canvas {
          margin: 4px;
        }
        .Canvas aside {
          width: 40px;
        }
        .Canvas aside .tool {
          width: 26px;
          height: 26px;
          margin: 0 auto 10px;
          padding: 2px;
          cursor: pointer;
          border: 1px solid #fff;
        }
        .Canvas aside .tool.active {
          border: 1px solid #d1d1d1;
        }
        .Canvas aside .tool img,
        .Canvas aside .tool .color {
          width: 20px;
          height: 20px;
        }
        .Canvas aside .tool.backgroundColor {
          border: 1px solid #e1e1e1;
        }
        .Canvas aside .tool.backgroundColor .color,
        .Canvas aside .tool.currentColor .color {
          width: 20px;
          height: 20px;
          line-height: 25px;
          font-size: 14px;
          color: #c1c1c1;
        }
        .Canvas .canvas section {
          width: 484px;
          max-width: 100%;
          margin: auto;
          text-align: center;
          border: 1px solid #c1c1c1;
        }
        .Canvas .canvas .board {
          width: 482px;
          max-width: 100%;
          height: 490px;
          overflow: auto;
        }
        .Canvas .canvas.feature {
          position: absolute;
          top: 60px;
          left: 20px;
          width: 480px;
          height: 480px;
          background: rgba(255,255,255,0.6);
        }
        .Canvas .canvas .row {
          width: 482px;
          height: 20px;
        }
        .Canvas .canvas .pixel {
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
          cursor: pointer;
          user-drag: none;
          -webkit-user-drag: none;
          user-select: none;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          box-shadow: inset 0 0 1px #f9f9f9;
        }
        .Canvas .canvas .pixel.transparent {
          box-shadow: inset 0 0 1px #a1a1a1;
        }
        .Canvas .pixel:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: none;
        }
        .Canvas .pixel:hover:after {
          background: rgba(0,0,0,0.1);
        }
        .Canvas .palette {
          width: 480px;
          max-width: calc(100vw - 42px);
          max-height: 48px;
          overflow: scroll;
        }
        .Canvas .palette .palette-color {
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .Canvas .palette .palette-color:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: none;
        }
        .Canvas .palette .palette-color:hover:after {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
      <ToastContainer theme="dark"/>
    </>
  );
}

export default Canvas;
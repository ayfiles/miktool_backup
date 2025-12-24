"use client"

import React, { useRef, useEffect, useState, forwardRef } from "react"
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva"
import useImage from "use-image"
import Konva from "konva"

interface ConfiguratorCanvasProps {
  baseImageUrl: string | null
  logoUrl: string | null
}

// 1. Background Image Komponente (Bleibt gleich)
const BackgroundImage = ({ src, stageWidth, stageHeight }: { src: string, stageWidth: number, stageHeight: number }) => {
  const [image] = useImage(src, "anonymous")
  const [imgParams, setImgParams] = useState({ width: 0, height: 0, x: 0, y: 0 })

  useEffect(() => {
    if (image) {
      const imgWidth = image.width
      const imgHeight = image.height
      const scale = Math.min(stageWidth / imgWidth, stageHeight / imgHeight)
      
      const newWidth = imgWidth * scale
      const newHeight = imgHeight * scale
      
      setImgParams({ width: newWidth, height: newHeight, x: (stageWidth - newWidth) / 2, y: (stageHeight - newHeight) / 2 })
    }
  }, [image, stageWidth, stageHeight])

  if (!image) return null

  return <KonvaImage image={image} width={imgParams.width} height={imgParams.height} x={imgParams.x} y={imgParams.y} listening={false} id="base-image" />
}

// 2. Logo Image Komponente (Bleibt gleich)
const LogoImage = ({ src, isSelected, onSelect, onChange, id }: any) => {
  const [image] = useImage(src, "anonymous")
  const shapeRef = useRef<any>()
  const trRef = useRef<any>()

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <KonvaImage
        image={image}
        ref={shapeRef}
        id={id}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        x={300} y={300} scaleX={0.5} scaleY={0.5}
        onDragEnd={(e) => onChange?.({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current
          onChange?.({ x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() })
        }}
      />
      {isSelected && (
        <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)} />
      )}
    </>
  )
}

// 3. Haupt-Canvas (JETZT MIT forwardRef)
export const ConfiguratorCanvas = forwardRef<Konva.Stage, ConfiguratorCanvasProps>(({ baseImageUrl, logoUrl }, ref) => {
  const [selectedId, selectShape] = React.useState<string | null>(null)
  const width = 1000
  const height = 1000

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) selectShape(null)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex justify-center items-center">
      <Stage
        ref={ref} // 👈 WICHTIG: Hier wird die Ref verbunden!
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {baseImageUrl && <BackgroundImage src={baseImageUrl} stageWidth={width} stageHeight={height} />}
          {logoUrl && (
            <LogoImage
              src={logoUrl}
              id="logo-1"
              isSelected={selectedId === "logo-1"}
              onSelect={() => selectShape("logo-1")}
              onChange={(newAttrs: any) => console.log("Logo updated:", newAttrs)}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
})

ConfiguratorCanvas.displayName = "ConfiguratorCanvas"
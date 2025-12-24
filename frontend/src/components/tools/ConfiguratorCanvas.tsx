"use client"

import React, { useRef, useEffect } from "react"
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva"
import useImage from "use-image"

interface ConfiguratorCanvasProps {
  baseImageUrl: string | null
  logoUrl: string | null
}

// Interne Komponente für Bilder, die transformiert (skaliert/gedreht) werden können
const URLImage = ({ src, isDraggable, isSelected, onSelect, onChange, id }: any) => {
  const [image] = useImage(src, "anonymous") // "anonymous" hilft bei CORS Problemen
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
        draggable={isDraggable}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange?.({
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          
          // Reset Scale im Node und speichere echte Größe (optional)
          // node.scaleX(1); node.scaleY(1);
          
          onChange?.({
            x: node.x(),
            y: node.y(),
            scaleX: scaleX,
            scaleY: scaleY,
            rotation: node.rotation(),
          })
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Mindestgröße verhindern (5px)
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export function ConfiguratorCanvas({ baseImageUrl, logoUrl }: ConfiguratorCanvasProps) {
  const [selectedId, selectShape] = React.useState<string | null>(null)
  
  // Feste Größe für den Canvas Container (kann später responsiv gemacht werden)
  const width = 500
  const height = 500

  const checkDeselect = (e: any) => {
    // Klick auf leeren Bereich oder das Basis-Bild -> Auswahl aufheben
    const clickedOnEmpty = e.target === e.target.getStage()
    const clickedOnBase = e.target.attrs.id === "base-image"
    if (clickedOnEmpty || clickedOnBase) {
      selectShape(null)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex justify-center items-center">
      <Stage
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {/* 1. Layer: Das Produkt (T-Shirt) - Nicht bewegbar */}
          {baseImageUrl && (
            <URLImage 
              src={baseImageUrl} 
              isDraggable={false} 
              id="base-image"
            />
          )}

          {/* 2. Layer: Das Logo - Bewegbar & Transformierbar */}
          {logoUrl && (
            <URLImage
              src={logoUrl}
              isDraggable={true}
              id="logo-1"
              isSelected={selectedId === "logo-1"}
              onSelect={() => selectShape("logo-1")}
              onChange={(newAttrs: any) => {
                console.log("Logo updated:", newAttrs)
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
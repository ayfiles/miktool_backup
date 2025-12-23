"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateOrderStatus } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar, Package, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Typen definieren
type Order = {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  itemsCount?: number;
};

// Unsere 4 Spalten
const COLUMNS = {
  draft: { id: "draft", title: "Draft 📝", color: "border-zinc-500/20" },
  confirmed: { id: "confirmed", title: "Confirmed ✅", color: "border-blue-500/20" },
  production: { id: "production", title: "In Production 🏗️", color: "border-yellow-500/20" },
  done: { id: "done", title: "Done 🎉", color: "border-green-500/20" },
};

interface Props {
  initialOrders: Order[];
}

export default function ProductionKanban({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [isMounted, setIsMounted] = useState(false);

  // Fix für Hydration Error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getOrdersByStatus = (status: string) => {
    return orders.filter((o) => o.status === status);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const newStatus = destination.droppableId;
    
    // Optimistisches Update
    const newOrders = orders.map(order => 
      order.id === draggableId ? { ...order, status: newStatus } : order
    );
    
    setOrders(newOrders);

    try {
      await updateOrderStatus(draggableId, newStatus);
      toast.success(`Moved to ${COLUMNS[newStatus as keyof typeof COLUMNS].title}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      setOrders(orders); // Rollback
    }
  };

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100vh-200px)] w-full overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-6 min-w-[1000px]">
          
          {Object.entries(COLUMNS).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col w-1/4 min-w-[280px]">
              
              {/* Header */}
              <div className={`p-4 mb-4 rounded-lg border bg-zinc-900/50 ${column.color} flex items-center justify-between`}>
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="bg-zinc-800">
                  {getOrdersByStatus(columnId).length}
                </Badge>
              </div>

              {/* Spalte */}
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-zinc-800/30" : "bg-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {getOrdersByStatus(columnId).map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                cursor-grab active:cursor-grabbing border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all
                                ${snapshot.isDragging ? "shadow-xl ring-1 ring-primary rotate-2 z-50" : ""}
                              `}
                            >
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-medium text-sm truncate flex items-center gap-2">
                                     <User className="h-3 w-3 text-muted-foreground" />
                                     {order.customer_name}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-mono bg-zinc-950 px-1 py-0.5 rounded">
                                    #{order.id.slice(0, 4)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                   <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(order.created_at), "dd. MMM")}
                                   </div>
                                   <div className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      {order.itemsCount || 0} Items
                                   </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}

        </div>
      </DragDropContext>
    </div>
  );
}
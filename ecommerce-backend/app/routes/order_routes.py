from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.models import Product
from app.schemas.orders import OrderCreate, OrderResponse, OrderItemResponse

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"]
)

# 📌 GET historial de pedidos
@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """Obtiene todas las órdenes del sistema"""
    orders = db.query(Order).all()
    return orders

# 📌 GET pedido específico por ID
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Obtiene una orden específica por su ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return order

# 📌 POST crear un pedido (finalizar carrito)
@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Crea una nueva orden a partir del carrito"""
    
    # Crear la orden
    new_order = Order()
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Procesar cada item del carrito
    for item in order_data.items:
        # Buscar el producto
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404, 
                detail=f"Producto {item.product_id} no encontrado"
            )
        
        # Verificar stock
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"No hay stock suficiente para {product.name}. Stock disponible: {product.stock}"
            )

        # Crear item de la orden
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )
        
        # Descontar stock
        product.stock -= item.quantity
        
        db.add(order_item)

    # Guardar cambios
    db.commit()
    db.refresh(new_order)
    
    return new_order

# 📌 DELETE eliminar una orden
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Elimina una orden (útil para pruebas)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    db.delete(order)
    db.commit()
    
    return {"message": "Orden eliminada correctamente"}
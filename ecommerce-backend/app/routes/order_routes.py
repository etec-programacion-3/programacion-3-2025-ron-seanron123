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
    return db.query(Order).all()

# 📌 POST crear un pedido (finalizar carrito)
@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order()
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"No hay stock suficiente para {product.name}")

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )
        product.stock -= item.quantity  # descontar stock
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

from sqlalchemy import Column, Integer, ForeignKey, Float, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.models import Product

class Order(Base):
    __tablename__ = "orders"  # ✅ corregido

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # Opcional por ahora
    status = Column(String, default="pending")  # pending, completed, canceled

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"  # ✅ corregido

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
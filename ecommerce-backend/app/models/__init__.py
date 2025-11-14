# ✅ Solo importamos desde models.py para evitar duplicados
from .models import Category, Product
from .user import User
from .order import Order, OrderItem

# Esto hace que todos los modelos estén disponibles cuando importes desde app.models
__all__ = ["Category", "Product", "User", "Order", "OrderItem"]
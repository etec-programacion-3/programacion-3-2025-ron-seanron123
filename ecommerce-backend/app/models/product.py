"""
Compatibility shim: re-export models defined in `models.py`.
This avoids duplicate table definitions when modules import `app.models.product`.
"""
from .models import Category, Product

__all__ = ["Category", "Product"]

# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)

    # importar rutas si las tenés y registrarlas aquí
    # from .routes import product_routes, category_routes, order_routes
    # app.register_blueprint(product_routes.bp)
    # app.register_blueprint(category_routes.bp)
    # app.register_blueprint(order_routes.bp)

    return app

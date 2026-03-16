# Shop SPA

Full-stack e-commerce application built with Angular, Spring Boot, PostgreSQL, JWT, and Flyway.

This project demonstrates a complete web application architecture with authentication, product catalog, shopping cart, checkout flow, order history, and admin management features.

## Tech Stack

### Frontend
- Angular
- RxJS
- Standalone Components
- SCSS
- Route Guards
- HTTP Interceptors

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- JPA / Hibernate
- Flyway

### Database
- PostgreSQL
- Relational schema design
- Flyway migrations

## Project Structure

```text
shop-spa
├── frontend   # Angular SPA
└── backend    # Spring Boot REST API
```

## Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing with BCrypt
- Role-based access control (`USER`, `ADMIN`)

### Product Catalog
- Product listing
- Product details page
- Search
- Category filter
- Sorting
- Pagination
- Skeleton loading

### Cart
- Add item to cart
- Remove item from cart
- Update item quantity
- Clear cart

### Checkout
- Shipping address input
- Promo code support
- Order creation from cart

### Orders
- Order history
- Order details
- Order status tracking

Supported order statuses:
- `NEW`
- `PAID`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

### Admin Panel
- View orders
- Update order status
- Create products
- Edit products
- Delete products

## Security

Public endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/categories`

Protected endpoints:
- `/api/cart/**`
- `/api/orders/**`

Admin-only endpoints:
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `PATCH /api/orders/{id}/status`

JWT is passed in the header:

```http
Authorization: Bearer <token>
```

## Main Domain Models

### Users
Fields:
- `id`
- `email`
- `password_hash`
- `role`
- `created_at`

### Profiles
Fields:
- `user_id`
- `email`
- `name`
- `phone`
- `address`
- `preferences`
- `updated_at`

### Products
Fields:
- `id`
- `title`
- `description`
- `price`
- `category`
- `image`
- `stock_quantity`
- `is_active`
- `created_at`
- `updated_at`

### Cart
Tables:
- `cart`
- `cart_items`

### Orders
Tables:
- `orders`
- `order_items`

### Promo Codes
Fields:
- `code`
- `discount_percent`
- `expires_at`
- `is_active`

## Frontend Architecture

Core services / stores:
- `AuthService`
- `ProductsStore`
- `CartStore`
- `OrdersStore`

Route guards:
- `authGuard`
- `adminGuard`

HTTP interceptors:
- `authInterceptor`
- `loadingInterceptor`
- `errorInterceptor`

## Seed Data

The project includes 50+ seeded products in categories:
- shoes
- clothing
- electronics
- bags
- fitness
- outdoor
- accessories

## How to Run

### Backend

Configure PostgreSQL connection in:

```text
backend/src/main/resources/application.yml
```

Run backend:

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run frontend:

```bash
npm start
```

Default frontend URL:

```text
http://localhost:4200
```

## What This Project Demonstrates

### Frontend
- Angular application architecture
- RxJS usage
- State management
- Route guards
- HTTP interceptors
- Responsive UI structure

### Backend
- Spring Boot REST API design
- Spring Security configuration
- JWT authentication
- JPA / Hibernate
- Transactional business logic
- Role-based authorization

### Database
- PostgreSQL integration
- Relational modelling
- Schema versioning with Flyway

## Future Improvements
- Docker support
- Refresh tokens
- Payment integration
- Product reviews
- CI/CD pipeline
- More unit and integration tests



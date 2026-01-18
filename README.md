# Tech House - E-commerce Website

A fully functional e-commerce website for household appliances built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Functionality
- **50 Products** - All products loaded from `js/data.js`, no hardcoded product cards
- **Product Filtering** - Category, brand, price range, and search filters
- **Sorting** - By popularity, price (low/high), rating, newest
- **Pagination** - Client-side pagination for products list
- **Grid/List View** - Toggle between viewing modes

### Shopping Experience
- **Product Detail** - Detailed product page with related products
- **Shopping Cart** - Add/remove items, quantity controls, persistent storage
- **Wishlist** - Save favorite products, add to cart from wishlist
- **Checkout** - Multi-step checkout with form validation
- **Order Success** - Order confirmation with order details

### User Features
- **User Registration & Login** - Mock authentication with localStorage
- **User Profile** - Edit profile info, change password
- **Session Persistence** - User stays logged in across pages

### UI/UX
- **Responsive Design** - Works on desktop and mobile
- **Toast Notifications** - Feedback for user actions
- **Cart Count Badge** - Real-time cart count in header
- **Cross-tab Sync** - Cart updates across browser tabs

## File Structure

```
techhouse/
├── index.html          # Home page
├── products.html       # Products listing with filters
├── product-detail.html # Single product page
├── cart.html           # Shopping cart
├── checkout.html       # Checkout form
├── order-success.html  # Order confirmation
├── wishlist.html       # Saved products
├── profile.html        # User profile
├── contact.html        # Contact page
│
├── auth/
│   ├── login.html      # Login/Register page
│   ├── script.js       # Auth logic
│   └── style.css       # Auth styles
│
├── js/
│   ├── data.js         # Product data (50 products)
│   ├── store.js        # State management (cart, wishlist, user)
│   ├── ui.js           # UI utilities (toast, card rendering)
│   ├── products.js     # Products page logic
│   ├── product.js      # Product detail logic
│   ├── cart-page.js    # Cart page logic
│   ├── checkout-page.js # Checkout logic
│   ├── home.js         # Home page dynamic sections
│   └── profile.js      # Profile page logic
│
├── css/
│   ├── home.css        # Main styles
│   ├── products.css    # Products page styles
│   └── ...             # Other CSS files
│
└── assets/
    └── images/         # Product images
```

## localStorage Keys

| Key | Description |
|-----|-------------|
| `techhouse_cart` | Cart items `[{id, qty}]` |
| `techhouse_wishlist` | Wishlist product IDs `[id, id, ...]` |
| `techhouse_user` | Current logged-in user |
| `techhouse_users` | Registered users list |
| `techhouse_orders` | Placed orders list |

## How to Run

1. Open the project folder
2. Open `index.html` in a web browser
3. No server required - works with `file://` protocol

## Test Checklist

- [ ] Add to cart from products/home/detail pages
- [ ] Like/unlike products from any page
- [ ] Cart quantity update with +/- buttons
- [ ] Cart totals update correctly (subtotal, shipping, total)
- [ ] Free shipping for orders $299+
- [ ] Checkout form validation
- [ ] Place order redirects to success page
- [ ] Order success shows order details
- [ ] Cart clears after order
- [ ] Navigation links work on all pages
- [ ] Search from header redirects to products page
- [ ] Product detail with invalid slug shows "not found"
- [ ] User registration and login
- [ ] Profile updates save correctly
- [ ] Logout clears session

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Font Awesome 7.0.1 (icons)
- localStorage (state persistence)

## Author

BTEC Level 3 - Unit 6 Website Development Project

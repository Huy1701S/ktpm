const express = require('express');
const app = express();
const port = 3000;

// Middleware để xử lý JSON body
app.use(express.json());

let menu = [
    { id: 1, name: "Pizza Margherita", price: 10.5 },
    { id: 2, name: "Pasta Carbonara", price: 12.0 },
];

let cart = [];
let orderHistory = [];

// Endpoint to get menu items
app.get('/api/menu', (req, res) => {
    res.json(menu);
});

// Endpoint to get the cart items
app.get('/api/cart', (req, res) => {
    if (cart.length === 0) {
        return res.json({ message: "Your cart is empty." });
    }
    res.json(cart);
});

// Endpoint to add an item to the cart
app.post('/api/cart', (req, res) => {
    const { id } = req.body;
    const item = menu.find(i => i.id === id);
    if (item) {
        // Kiểm tra xem món đã có trong giỏ chưa, nếu có thì tăng số lượng
        const cartItem = cart.find(i => i.id === item.id);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        res.status(201).json(cart);
    } else {
        res.status(404).json({ message: "Item not found" });
    }
});

// Endpoint to update the quantity of an item in the cart
app.put('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const cartItem = cart.find(i => i.id === parseInt(id));

    if (cartItem) {
        if (quantity > 0) {
            cartItem.quantity = quantity;
            res.json(cart);
        } else {
            res.status(400).json({ message: "Quantity must be greater than 0" });
        }
    } else {
        res.status(404).json({ message: "Item not found in cart" });
    }
});

// Endpoint to remove an item from the cart
app.delete('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    cart = cart.filter(item => item.id !== parseInt(id));
    res.json(cart);
});

// Endpoint to place an order
app.post('/api/order', (req, res) => {
    if (cart.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderId = orderHistory.length + 1;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderHistory.push({ id: orderId, total, items: [...cart] });

    // Clear the cart after placing the order
    cart = [];
    res.status(201).json({ message: "Order placed successfully", orderId, total });
});

// Endpoint to get the order history
app.get('/api/orders', (req, res) => {
    if (orderHistory.length === 0) {
        return res.json({ message: "No past orders" });
    }
    res.json(orderHistory);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

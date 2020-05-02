const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

//CREATE A POST REQUEST TO ADD AN ITEM TO THE CART
router.post('/cart/products', async (req, res) => {
    //FIGURE OUT THE CART
    let cart;
    if(!req.session.cartId) {
        //WE DON'T HAVE A CART, SO LET'S CREATE ONE
        //STORE THE CART ID IN THE REQ.SESSION.CARTID PROPERTY
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
        } else {
        //WE HAVE A CART, LET'S GET IT FROM THE REPOSITORY
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find(item => item.id === req.body.productId);
    //EITHER INCREMENT THE QUANTITY OF AN EXISTING PRODUCT
    //OR ADD A NEW PRODUCT TO THE CART ITEM
    if(existingItem) {
        //INCREMENT QUANTITY AND SAVE THE CART
        existingItem.quantity++;
    } else {
        //ADD NEW PRODUCT ID TO ITEMS ARRAY
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.redirect('/cart');
});

//CREATE A GET REQUEST TO SHOW ALL ITEMS IN THE CART
router.get('/cart', async (req, res) => {
    if(!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        const product = await productsRepo.getOne(item.id);

        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

//CREATE A POST REQUEST TO DELETE AN ITEM IN THE CART
router.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId, { items: items });

    res.redirect('/cart');
});

module.exports = router;
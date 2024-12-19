const OrderService = require('../services/orderService');
const CartService = require('../services/cartService');
const stripe = require('stripe')('sk_test_51PM5ZmRo1ugHi7yBx8TlkVPGwBaib6rqIVeE5ucOFZvlNREuD8MMyIJSqWDxbPc6WYzQnxK6pezX4RzA1IEOVocs00vTzj3If1'); // Replace with your Stripe secret key
const nodemailer = require('nodemailer');

const YOUR_DOMAIN = 'http://localhost:3001'; 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abdulsamea2003@gmail.com',
    pass: 'zosc xpja opef ngqp', 
  },
});

const sendConfirmationEmail = async (userEmail, orderId) => {
  const mailOptions = {
    from: 'abdulsamea2003@gmail.com',
    to: userEmail,
    subject: 'Order Confirmation',
    text: `Thank you for your purchase! Your order ID is ${orderId}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.checkout = async (req, res) => {
  const { paymentMethod, shippingAddress, phoneNumber } = req.body;
  const userId = req.user._id;

  try {
    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const totalPrice = cart.items.reduce((total, item) => total + item.book.price * item.quantity, 0);

    const orderData = {
      user: userId,
      items: cart.items,
      totalPrice,
      shippingAddress,
      phoneNumber,
      paymentMethod,
      status: paymentMethod === 'cash' ? 'Pending' : 'Confirmed',
    };

    const order = await OrderService.createOrder(orderData);
    await CartService.clearCart(userId);

    if (paymentMethod === 'cash') {
      await sendConfirmationEmail(req.user.email, order._id);
    }

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Checkout failed. Please try again.' });
  }
};

exports.createCheckoutSession = async (req, res) => {
  const userId = req.user._id.toString(); // Ensure userId is a string
  const { shippingAddress, phoneNumber } = req.body;

  try {
    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.book.title },
        unit_amount: Math.round(item.book.price * 100),
      },
      quantity: item.quantity,
    }));

    const totalPrice = cart.items.reduce((total, item) => total + item.book.price * item.quantity, 0);

    // Create the order
    const orderData = {
      user: userId,
      items: cart.items,
      totalPrice,
      shippingAddress,
      phoneNumber,
      paymentMethod: 'visa',
      status: 'Pending',
    };

    const order = await OrderService.createOrder(orderData);

    // Clear the cart
    await CartService.clearCart(userId);

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        orderId: order._id.toString(), // Attach the order ID to metadata
        userId,
      },
      success_url: `${YOUR_DOMAIN}/profile`,
      cancel_url: `${YOUR_DOMAIN}/checkout`,
    });

    // Optionally send an email confirmation here
    await sendConfirmationEmail(req.user.email, order._id);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session.' });
  }
};





exports.getOrderById = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await OrderService.getOrdersByUserId(userId);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    const formattedOrders = orders.map((order) => ({
      orderId: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      items: order.items.map((item) => ({
        bookTitle: item.book?.title || 'Unknown Title',
        quantity: item.quantity,
      })),
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error retrieving user orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await OrderService.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ message: error.message });
  }
};

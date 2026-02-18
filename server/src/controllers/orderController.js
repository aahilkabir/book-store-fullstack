import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/db.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

export const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        // 1. Create Order in DB
        const order = await prisma.order.create({
            data: {
                user_id: req.user.id,
                total_amount: totalPrice,
                status: 'PENDING',
                items: {
                    create: orderItems.map((item) => ({
                        book_id: item.book_id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });

        // 2. Create Razorpay Order
        const options = {
            amount: Math.round(totalPrice * 100), // Amount in paise
            currency: 'INR',
            receipt: `order_${order.id}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Update DB Order with Razorpay ID
        await prisma.order.update({
            where: { id: order.id },
            data: { razorpay_order_id: razorpayOrder.id },
        });

        res.status(201).json({
            ...order,
            razorpay_order_id: razorpayOrder.id,
            razorpayKey: process.env.RAZORPAY_KEY_ID, // Send key for frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        try {
            // Find order by Razorpay ID
            const order = await prisma.order.findFirst({
                where: { razorpay_order_id },
            });

            if (order) {
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'PAID' },
                });
                res.json({ message: 'Payment verified', success: true });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    } else {
        res.status(400).json({ message: 'Invalid signature', success: false });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.user.id },
            include: { items: { include: { book: true } } },
            orderBy: { created_at: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: true, items: true },
            orderBy: { created_at: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (order) {
            const updatedOrder = await prisma.order.update({
                where: { id: parseInt(req.params.id) },
                data: { status: 'DELIVERED' },
            });
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

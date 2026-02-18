import React, { useEffect, useState } from 'react';
import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";
import api from '@/services/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css'; // Will create this

const AdminDashboard = () => {
    const { store, orders, auth } = useGlobalContext();
    const [activeTab, setActiveTab] = useState('products');
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        category_id: 1 // Default for now
    });

    useEffect(() => {
        if (auth.state.user?.role === 'ADMIN') {
            store.getProducts();
            orders.getAllOrders();
        }
    }, [auth.state.user]);

    const handleCreateBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/books', {
                ...newBook,
                price: parseFloat(newBook.price),
                stock: parseInt(newBook.stock),
                category_id: parseInt(newBook.category_id)
            });
            toast.success("Book created successfully");
            store.getProducts();
            setNewBook({ title: '', author: '', description: '', price: '', stock: '', image_url: '', category_id: 1 });
        } catch (error) {
            toast.error("Failed to create book");
        }
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await api.delete(`/books/${id}`);
                toast.success("Book deleted");
                store.getProducts();
            } catch (error) {
                toast.error("Failed to delete book");
            }
        }
    };

    if (auth.state.user?.role !== 'ADMIN') {
        return <div className="p-10 text-center">Access Denied. Admins only.</div>;
    }

    return (
        <div className="admin-dashboard sub-container">
            <h1>Admin Dashboard</h1>
            <div className="admin-tabs">
                <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
            </div>

            {activeTab === 'products' && (
                <div className="admin-section">
                    <h3>Add New Book</h3>
                    <form onSubmit={handleCreateBook} className="admin-form">
                        <input placeholder="Title" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
                        <input placeholder="Author" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
                        <input placeholder="Description" value={newBook.description} onChange={e => setNewBook({ ...newBook, description: e.target.value })} />
                        <input type="number" placeholder="Price" value={newBook.price} onChange={e => setNewBook({ ...newBook, price: e.target.value })} required />
                        <input type="number" placeholder="Stock" value={newBook.stock} onChange={e => setNewBook({ ...newBook, stock: e.target.value })} required />
                        <input placeholder="Image URL" value={newBook.image_url} onChange={e => setNewBook({ ...newBook, image_url: e.target.value })} />
                        <input type="number" placeholder="Category ID" value={newBook.category_id} onChange={e => setNewBook({ ...newBook, category_id: e.target.value })} required />
                        <button type="submit" className="btn-submit">Add Book</button>
                    </form>

                    <h3>Manage Products</h3>
                    <div className="admin-product-list">
                        {store.state.products.map(product => (
                            <div key={product._id} className="admin-product-item">
                                <img src={product.image_url} alt={product.title} width="50" />
                                <div>
                                    <h4>{product.title}</h4>
                                    <p>${product.price}</p>
                                </div>
                                <button onClick={() => handleDeleteBook(product._id)} className="btn-danger">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="admin-section">
                    <h3>All Orders</h3>
                    <div className="admin-order-list">
                        {orders.state.allOrders?.map(order => (
                            <div key={order.id} className="admin-order-item">
                                <h4>Order #{order.id}</h4>
                                <p>User: {order.user?.email}</p>
                                <p>Total: ${order.total_amount}</p>
                                <p>Status: {order.status}</p>
                                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

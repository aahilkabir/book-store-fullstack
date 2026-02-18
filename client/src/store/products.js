import { useReducer } from "react";
import localforage from "localforage";
import { toast } from "react-toastify";
import api from "../services/api";

const initialState = {
  products: [],
  cart: [],
  cartTotal: 0,
  cartQuantity: 0,
  order: [],
};

const actions = Object.freeze({
  ADD_TO_CART: "ADD_TO_CART",
  GET_PRODUCTS: "GET_PRODUCTS",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  CLEAR_CART: "CLEAR_CART",
  ADD_QUANTITY: "ADD_QUANTITY",
  REDUCE_QUANTITY: "REDUCE_QUANTITY",
});

const reducer = (state, action) => {
  if (action.type === actions.GET_PRODUCTS) {
    if (action.backed_up_cart.length === 0) {
      return { ...state, products: action.products };
    }
    const cartTotal = action.backed_up_cart.reduce(
      (acc, item) => acc + (item.price * item.quantity),
      0
    );
    const cartQuantity = action.backed_up_cart.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const updatedProducts = action.products.map((product) => {
      const cartItem = action.backed_up_cart.find(
        (item) => item._id === product._id
      );
      if (cartItem) {
        return { ...cartItem, addedToCart: true };
      }
      return product;
    });
    return {
      ...state,
      products: updatedProducts,
      cart: action.backed_up_cart,
      cartQuantity,
      cartTotal,
    };
  }
  if (action.type === actions.ADD_TO_CART) {
    const product = state.products.find(
      (product) => product._id === action.product
    );
    product.addedToCart = true;
    product.quantity = 1;
    const newCart = [...state.cart, product];
    localforage.setItem("cartItems", newCart);

    return {
      ...state,
      cart: newCart,
      cartQuantity: state.cartQuantity + 1,
      cartTotal: state.cartTotal + Number(product.price),
    };
  }
  if (action.type === actions.REMOVE_FROM_CART) {
    const product = state.products.find(
      (product) => product._id === action.product
    );
    const newCart = state.cart.filter(
      (product) => product._id !== action.product
    );
    const updatedProduct = { ...product, addedToCart: false };
    localforage.setItem("cartItems", newCart);

    let newCartTotal = 0;
    newCart.forEach((item) => {
      newCartTotal += Number(item.price) * item.quantity;
    });
    return {
      ...state,
      products: state.products.map((p) =>
        p._id === product._id ? updatedProduct : p
      ),
      cart: newCart,
      cartQuantity: state.cartQuantity - 1,
      cartTotal: newCartTotal,
    };
  }
  if (action.type === actions.ADD_QUANTITY) {
    const product = state.cart.find((product) => product._id === action.product);
    product.quantity = product.quantity + 1;
    return {
      ...state,
      cartTotal: state.cartTotal + Number(product.price),
    };
  }
  if (action.type === actions.REDUCE_QUANTITY) {
    const product = state.cart.find((product) => product._id === action.product);
    if (product.quantity === 1) return state;
    product.quantity = product.quantity - 1;
    return {
      ...state,
      cartTotal: state.cartTotal - Number(product.price),
    };
  }
  if (action.type === actions.CLEAR_CART) {
    localforage.setItem("cartItems", []);
    return {
      ...state,
      cart: [],
      order: [],
      cartTotal: 0,
      cartQuantity: 0,
    };
  }
  return state;
};

const useStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (product) => {
    dispatch({ type: actions.ADD_TO_CART, product });
  };

  const removeFromCart = (product) => {
    dispatch({ type: actions.REMOVE_FROM_CART, product });
  };

  const clearCart = () => {
    dispatch({ type: actions.CLEAR_CART });
  };

  const getProducts = () => {
    api.get('/books')
      .then(async (response) => {
        const data = response.data.books || response.data; // Handle pagination or plain array
        let modifiedData = data.map((product) => {
          return { ...product, _id: product.id, addedToCart: false, price: Number(product.price) };
        });
        let cart = (await localforage.getItem("cartItems")) || [];
        dispatch({
          type: actions.GET_PRODUCTS,
          products: modifiedData,
          backed_up_cart: cart,
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching products");
      });
  };

  const addQuantity = (product) => {
    dispatch({ type: actions.ADD_QUANTITY, product });
  };

  const reduceQuantity = (product) => {
    dispatch({ type: actions.REDUCE_QUANTITY, product });
  };

  const confirmOrder = async (orderData) => {
    try {
      // 1. Create Order
      const payload = {
        orderItems: state.cart.map(item => ({
          book_id: item.id, // Use original ID
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: state.cartTotal
      };

      const { data } = await api.post('/orders', payload);

      const options = {
        key: data.razorpayKey,
        amount: data.total_amount * 100, // Should be from backend response really, but logic matches
        currency: "INR",
        name: "Bookstore",
        description: "Order Payment",
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              toast.success("Payment Successful!");
              clearCart();
            }
          } catch (error) {
            toast.error("Payment Verification Failed");
          }
        },
        prefill: {
          name: "User Name", // TODO: Get from Auth
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#fd8a15"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

      return true;

    } catch (error) {
      console.error(error);
      const msg = error.response?.status === 401 ? "Please login to place order" : "Order failed";
      toast.error(msg);
      return { showRegisterLogin: error.response?.status === 401 };
    }
  };

  return {
    state,
    addToCart,
    removeFromCart,
    clearCart,
    getProducts,
    addQuantity,
    reduceQuantity,
    confirmOrder,
  };
};

export default useStore;

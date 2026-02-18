import { useReducer } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const initialState = {
  orders: [],
  allOrders: [], // For admin
  order_to_be_canceled: null,
};

const actions = Object.freeze({
  GET_ORDERS: "GET_ORDERS",
  GET_ALL_ORDERS: "GET_ALL_ORDERS",
  GET_ORDER_TO_BE_CANCELED: "GET_ORDER_TO_BE_CANCELED",
});

const reducer = (state, action) => {
  if (action.type === actions.GET_ORDERS) {
    return { ...state, orders: action.orders };
  }
  if (action.type === actions.GET_ALL_ORDERS) {
    return { ...state, allOrders: action.orders };
  }
  if (action.type === actions.GET_ORDER_TO_BE_CANCELED) {
    return { ...state, order_to_be_canceled: action.order_id };
  }
  return state;
};

const useOrders = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      dispatch({ type: actions.GET_ORDERS, orders: data });
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
      return [];
    }
  };

  const getAllOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      dispatch({ type: actions.GET_ALL_ORDERS, orders: data });
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch all orders");
      return [];
    }
  };

  const setOrderToBeCanceled = (order_id) => {
    dispatch({ type: actions.GET_ORDER_TO_BE_CANCELED, order_id });
  };

  const cancelOrder = async (order_id) => {
    toast.info("Cancellation feature coming soon");
    return;
  };

  return { state, getOrders, getAllOrders, setOrderToBeCanceled, cancelOrder };
};

export default useOrders;

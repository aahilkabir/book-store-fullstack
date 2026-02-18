import "./DeliveryItem.css";
import { useState } from "react";
import { FaCaretUp } from "react-icons/fa";
import { useGlobalContext } from "../../GlobalContext/GlobalContext";

const DeliveryItem = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(order.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getPercentage = (status) => {
    switch (status) {
      case "PENDING": return 10;
      case "PAID": return 30;
      case "SHIPPED": return 70;
      case "DELIVERED": return 100;
      case "CANCELLED": return 0;
      default: return 0;
    }
  };

  const percentage = getPercentage(order.status);

  const checkFlair = (percentage) => {
    if (order.status === "CANCELLED") return "flair danger-flair";
    if (percentage < 50) return "flair warning-flair";
    if (percentage < 90) return "flair warning-flair";
    return "flair success-flair";
  };

  const checkFlairText = () => {
    if (order.status === "CANCELLED") return "Cancelled";
    if (order.status === "PENDING") return "Payment Pending";
    if (order.status === "PAID") return "Processing";
    if (order.status === "SHIPPED") return "Shipped";
    if (order.status === "DELIVERED") return "Delivered";
    return order.status;
  };

  const { modal, orders } = useGlobalContext();

  const handleOpenCancelModal = (order_id) => {
    modal.openCancelModal();
    orders.setOrderToBeCanceled(order_id);
  };

  return (
    <div className="sub-container delivery-item-container">
      <div className="delivery-overview">
        <div className="delivery-summary">
          <div className="delivery-order-number">
            <h2 className="delivery-item-title order-main" title={order.id}>
              Order: <span>#</span>
              {order.id}
            </h2>
            <div className="delivery-items">
              <h5>Item Count: {order.items.length}</h5>
              <h5>Total Cost: ${Number(order.total_amount).toFixed(2)}</h5>
            </div>
          </div>
          <div className="delivery-progress">
            <h3 className="delivery-item-title">Status</h3>
            <h4>
              {percentage}%{" "}
              <span className={checkFlair(percentage)}>
                {checkFlairText()}
              </span>
            </h4>
            <progress
              className="progress-bar"
              value={percentage}
              max="100"
            ></progress>
          </div>
          <div className="delivery-date">
            <h3 className="delivery-item-title">Date Placed</h3>
            <h4>{formattedDate}</h4>
          </div>
        </div>
        <div
          className={expanded ? "fully-expanded isExpanded" : "fully-expanded"}
        >
          <div className="products-in-delivery">
            <h3>Products</h3>
            <div className="delivery-products">
              {order.items.map((item) => {
                return (
                  <div className="delivery-products-item" key={item.id}>
                    <img src={item.book.image_url} alt="" width="50" />
                    <h5>{item.book.title}</h5>
                    <h5>By {item.book.author}</h5>
                    <h5>Price: ${Number(item.price).toFixed(2)}</h5>
                    <h5>Quantity: {item.quantity}</h5>
                  </div>
                );
              })}
            </div>
          </div>
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <div className="danger-zone">
              <div className="danger-zone-buttons">
                {/* <button
                  className="btn-rounded danger-zone-button"
                  onClick={() => {
                    handleOpenCancelModal(order.id);
                  }}
                >
                  Cancel Order
                </button> */}
                <button
                  className="btn-rounded danger-zone-button report-issue"
                  onClick={() => {
                    window.location.href = `mailto:admin@bookshop.com?subject=Reporting Order #${order.id}`;
                  }}
                >
                  Report Issue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="expand-collapse-delivery">
        <button onClick={toggleExpanded}>
          {expanded ? "Collapse" : "Expand"}
          <span>
            <FaCaretUp
              className={
                expanded ? "caret-delivery" : "caret-delivery caret-expanded"
              }
            ></FaCaretUp>
          </span>
        </button>
      </div>
    </div>
  );
};
export default DeliveryItem;

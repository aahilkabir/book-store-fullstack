import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";
import "./Account.css";

const Account = () => {
  let { auth, store, modal } = useGlobalContext();
  const cartTotal = store.state.cartQuantity;

  const handleShowModal = () => {
    modal.openModal(false);
  };

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <div className="account">
      <div className="cart">
        <Link to={"/cart"} className="contains-link-to-accounts">
          {auth.state.user == null ? (
            <span className="account-user">Guest</span>
          ) : (
            <span className="account-user">
              {auth.state.user.name}
            </span>
          )}
          <span className="account-details">
            <FaShoppingCart></FaShoppingCart>
            <span className="items-in-cart">{cartTotal}</span>
          </span>
        </Link>
      </div>

      {/* Admin Link */}
      {auth.state.user?.role === 'ADMIN' && (
        <Link to="/admin" className="account-link" style={{ marginLeft: '10px', fontWeight: 'bold' }}>
          Admin
        </Link>
      )}

      {/* Orders Link */}
      {auth.state.user && (
        <Link to="/delivery" className="account-link" style={{ marginLeft: '10px' }}>
          Orders
        </Link>
      )}

      <div className="login">
        {auth.state.user == null ? (
          <button
            className="btn-rounded small-rounded"
            onClick={handleShowModal}
          >
            Login
          </button>
        ) : (
          <button className="btn-rounded small-rounded" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};
export default Account;

import { useSelector, useDispatch } from "react-redux";
import Button from "./Button";
import { addToCart } from "../api/cart.api";
import { Link, useNavigate } from "react-router-dom";
import { fadeIn } from "../animations/FadeIn";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";

import "./styles/ProductCard.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleAdd = async () => {
    if (!user) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }

    //  Block admins
    if (user.role !== "user") {
      alert("Only customers can add items to cart.");
      return;
    }

    try {
      await addToCart(product._id);
      dispatch(refreshCartCountThunk());
    } catch {
      // optional: toast/error handling
    }
  };

  const discount = product.costPrice
    ? Math.round(
        ((product.costPrice - product.salePrice) / product.costPrice) * 100
      )
    : 0;

  return (
    <div
      className="pc-card"
      {...fadeIn({
        direction: "up",
        distance: 80,
        duration: 0.7,
      })}
    >
      <div className="pc-image-box">
        {discount > 0 && (
          <span className="pc-discount-badge">-{discount}%</span>
        )}

        <Link to={`/product/${product._id}`} className="pc-view-overlay">
          View Details
        </Link>

        <img
          src={product.image?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="pc-image"
          {...fadeIn({
            direction: "right",
            distance: 80,
            duration: 0.3,
          })}
        />
      </div>

      <div className="pc-info">
        <h3 className="pc-name">{product.name}</h3>

        <div className="pc-rating">
          <span className="pc-stars">⭐⭐⭐⭐☆</span>
          <span className="pc-rating-count">(120)</span>
        </div>

        <div className="pc-price-row">
          <p className="pc-price">
            ₹{product.salePrice}/
            <span className="pc-old-price">{product.costPrice}</span>
          </p>
        </div>

        {user?.role === "user" && (
          <Button onClick={handleAdd}>Add to Cart</Button>
        )}
      </div>
    </div>
  );
}

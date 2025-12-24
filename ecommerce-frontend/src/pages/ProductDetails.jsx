import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  fetchProductByIdThunk,
  fetchRelatedProductsThunk,
} from "../redux/slice/productSlice";

import { addToCartThunk, fetchCartThunk } from "../redux/slice/cartItemsSlice";

import { refreshCartCountThunk } from "../redux/slice/cartSlice";

import { fadeIn } from "../animations/FadeIn";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";

import "./styles/ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const { user } = useSelector((state) => state.auth);

  const {
    currentProduct: product,
    relatedProducts: related,
    loading,
  } = useSelector((state) => state.product);

  /* =========================
     LOCAL UI STATE
  ========================= */
  const [activeImage, setActiveImage] = useState(0);
  const [msg, setMsg] = useState("");

  /* =========================
     LOAD PRODUCT
  ========================= */
  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
  }, [id, dispatch]);

  /* =========================
     LOAD RELATED PRODUCTS
  ========================= */
  useEffect(() => {
    if (!product?.category) return;

    dispatch(
      fetchRelatedProductsThunk({
        category: product.category,
        excludeId: product._id,
        limit: 6,
      })
    );
  }, [product, dispatch]);

  /* =========================
     ADD TO CART (REDUX)
  ========================= */
  const handleAdd = async () => {
    if (!user) {
      alert("Please login to add to cart.");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      alert("Only customers can add items to cart.");
      return;
    }

    try {
      await dispatch(addToCartThunk({ productId: product._id })).unwrap();

      // 🔥 Sync cart state everywhere
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());

      setMsg("Added to cart!");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("Failed to add to cart.");
      setTimeout(() => setMsg(""), 2000);
    }
  };

  /* =========================
     GUARDS
  ========================= */
  if (loading || !product) {
    return <p className="loading">Loading...</p>;
  }

  const discount = product.costPrice
    ? Math.round(
        ((product.costPrice - product.salePrice) / product.costPrice) * 100
      )
    : 0;

  const isOutOfStock = product.stock === 0;
  const isUser = user?.role === "user";

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="pd-page">
      {/* TOP SECTION */}
      <div className="pd-wrapper">
        {/* LEFT — IMAGES */}
        <div
          className="pd-left"
          {...fadeIn({ direction: "right", distance: 80, duration: 0.9 })}
        >
          <div className="pd-image-box">
            {discount > 0 && (
              <span className="pd-discount-badge">-{discount}%</span>
            )}

            <img
              src={product.image?.[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              className="pd-main-img"
            />
          </div>

          {product.image?.length > 1 && (
            <div className="pd-thumbs">
              {product.image.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`pd-thumb ${activeImage === i ? "active" : ""}`}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div
          className="pd-right"
          {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
        >
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating">
            ⭐⭐⭐⭐☆ <span className="pd-rating-count">(120 reviews)</span>
          </div>

          <div className="pd-price-section">
            <div className="pd-price-row">
              <h2 className="pd-sale">₹{product.salePrice}</h2>
              {product.costPrice && (
                <>
                  <p className="pd-old">₹{product.costPrice}</p>
                  <span className="pd-offer-tag">{discount}% OFF</span>
                </>
              )}
            </div>
            <p className="pd-special-offer">
              🔥 Special Offer – Limited Stock!
            </p>
          </div>

          <div className="pd-stock">
            {product.stock > 0 ? (
              <span className="in-stock">
                ✔ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="out-stock">❌ Out of Stock</span>
            )}
          </div>

          <p className="pd-description">{product.description}</p>

          {isUser && (
            <Button
              variant="primary"
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          )}

          {msg && <p className="pd-success">{msg}</p>}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="pd-related-section">
          <h2 className="pd-related-title">
            Related Products in "{product.category}"
          </h2>

          <div className="pd-related-grid">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

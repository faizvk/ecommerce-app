import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../api/cart.api";
import { Link, useNavigate } from "react-router-dom";
import { fadeIn } from "../animations/fadeIn";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { ShoppingCart, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "user") return;
    try {
      await addToCart(product._id);
      dispatch(refreshCartCountThunk());
    } catch {
      // handled silently
    }
  };

  const discount =
    product.costPrice && product.costPrice > 0
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;

  return (
    <Link
      to={`/product/${product._id}`}
      className="no-underline block group"
      {...fadeIn({ direction: "up", distance: 50, duration: 0.6 })}
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-hover hover:border-brand/20">
        {/* IMAGE */}
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-md leading-none">
                -{discount}%
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-md leading-none">
                Few left
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-700 text-white text-[0.75rem] font-bold px-3 py-1.5 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}

          <img
            src={product.image?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* INFO */}
        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <span className="text-[0.68rem] font-bold text-brand-medium uppercase tracking-wider mb-1.5 capitalize">
            {product.category}
          </span>

          <h3 className="text-[0.88rem] md:text-[0.92rem] font-semibold text-gray-900 leading-snug line-clamp-2 mb-auto">
            {product.name}
          </h3>

          {/* PRICE */}
          <div className="flex items-baseline gap-1.5 mt-2.5 mb-3">
            <span className="text-[1.05rem] md:text-[1.1rem] font-extrabold text-brand">
              ₹{product.salePrice}
            </span>
            {product.costPrice && product.costPrice > product.salePrice && (
              <span className="line-through text-gray-400 text-[0.8rem]">₹{product.costPrice}</span>
            )}
          </div>

          {user?.role === "user" && (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="w-full py-2 md:py-2.5 bg-brand-light text-brand border border-brand/20 rounded-xl text-[0.8rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:bg-brand hover:text-white hover:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

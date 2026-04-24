import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../api/cart.api";
import { Link, useNavigate } from "react-router-dom";
import { fadeIn } from "../animations/fadeIn";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { ShoppingCart } from "lucide-react";

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

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-[#e6e9ef] transition-all duration-300 h-full flex flex-col group hover:-translate-y-1.5 hover:shadow-hover"
      {...fadeIn({ direction: "up", distance: 60, duration: 0.6 })}
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-square bg-[#f6f7fb] overflow-hidden">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 right-3 z-10 bg-gray-700 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}

        <Link to={`/product/${product._id}`} className="absolute inset-x-0 bottom-0 z-10 py-3 bg-brand-dark/90 text-white text-center font-semibold text-sm opacity-0 translate-y-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 no-underline">
          View Details
        </Link>

        <img
          src={product.image?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        />
      </div>

      {/* INFO */}
      <div className="p-4 flex-1 flex flex-col sm:p-3">
        <span className="text-[0.72rem] font-semibold text-brand-medium uppercase tracking-wider mb-1 capitalize">
          {product.category}
        </span>

        <h3 className="text-[0.95rem] font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-[1.15rem] font-extrabold text-brand">₹{product.salePrice}</span>
          {product.costPrice && product.costPrice > product.salePrice && (
            <span className="line-through text-gray-400 text-[0.85rem]">₹{product.costPrice}</span>
          )}
        </div>

        {user?.role === "user" && (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-full py-2.5 bg-brand text-white border-0 rounded-xl text-[0.85rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}

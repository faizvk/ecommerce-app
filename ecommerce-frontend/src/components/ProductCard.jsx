import { useSelector, useDispatch } from "react-redux";
import Button from "./Button";
import { addToCart } from "../api/cart.api";
import { Link, useNavigate } from "react-router-dom";
import { fadeIn } from "../animations/fadeIn";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";

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
    if (user.role !== "user") {
      alert("Only customers can add items to cart.");
      return;
    }
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

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-[#e6e9ef] transition-all duration-300 h-full flex flex-col group hover:-translate-y-1.5 hover:shadow-hover hover:opacity-95"
      {...fadeIn({ direction: "up", distance: 80, duration: 0.7 })}
    >
      {/* IMAGE */}
      <div className="relative w-full h-[230px] bg-[#f6f7fb] overflow-hidden md:h-[180px] sm:h-[150px]">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
            -{discount}%
          </span>
        )}

        <Link
          to={`/product/${product._id}`}
          className="absolute inset-x-0 bottom-0 z-10 py-3 bg-brand-dark/95 text-white text-center font-semibold text-sm opacity-0 translate-y-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 no-underline"
        >
          View Details
        </Link>

        <img
          src={product.image?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
          {...fadeIn({ direction: "right", distance: 80, duration: 0.3 })}
        />
      </div>

      {/* INFO */}
      <div className="p-4 flex-1 flex flex-col sm:p-3">
        <h3 className="text-[1.1rem] font-bold text-brand-dark mb-1.5 sm:text-base">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2.5 text-sm">
          <span className="text-yellow-500">⭐⭐⭐⭐☆</span>
          <span className="text-gray-500 text-[0.85rem]">(120)</span>
        </div>

        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <p className="text-[1.25rem] font-bold text-green-700 sm:text-lg">
            ₹{product.salePrice}
            {product.costPrice && (
              <span className="line-through text-gray-500 text-base ml-1">
                ₹{product.costPrice}
              </span>
            )}
          </p>
        </div>

        {user?.role === "user" && (
          <Button onClick={handleAdd} className="mt-auto">Add to Cart</Button>
        )}
      </div>
    </div>
  );
}

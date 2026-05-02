import { Link } from "react-router-dom";
import { ChevronRight, Home as HomeIcon } from "lucide-react";

export default function Breadcrumbs({ items = [], className = "" }) {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-[0.78rem] text-gray-400 flex-wrap ${className}`}
    >
      <Link to="/" className="flex items-center gap-1 hover:text-brand transition-colors no-underline text-gray-400">
        <HomeIcon size={12} />
        Home
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-gray-300" />
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-brand transition-colors no-underline text-gray-400 truncate max-w-[180px] md:max-w-[260px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-semibold truncate max-w-[180px] md:max-w-[260px]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

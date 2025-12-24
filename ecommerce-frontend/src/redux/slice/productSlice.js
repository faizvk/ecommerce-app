import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProducts,
  getProduct,
  searchProducts,
  getPaginatedProducts,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  updateStock,
} from "../../api/product.api";

/* FETCH ALL PRODUCTS (Home, Admin) */
export const fetchProductsThunk = createAsyncThunk(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProducts();
      return res.data.products;
    } catch {
      return rejectWithValue("Failed to load products");
    }
  }
);

/* FETCH SINGLE PRODUCT (ProductDetails) */
export const fetchProductByIdThunk = createAsyncThunk(
  "product/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getProduct(id);
      return res.data.product;
    } catch {
      return rejectWithValue("Failed to load product");
    }
  }
);

/* SEARCH PRODUCTS (SearchResults) */
export const searchProductsThunk = createAsyncThunk(
  "product/search",
  async (params, { rejectWithValue }) => {
    try {
      const res = await searchProducts(params);
      return {
        products: res.data.products || [],
        totalPages: res.data.totalPages || 1,
      };
    } catch {
      return rejectWithValue("Search failed");
    }
  }
);

/* FETCH RELATED PRODUCTS (ProductDetails) */
export const fetchRelatedProductsThunk = createAsyncThunk(
  "product/fetchRelated",
  async ({ category, excludeId, limit = 6 }, { rejectWithValue }) => {
    try {
      const res = await searchProducts({ category, limit });

      const filtered =
        res.data.products?.filter((p) => p._id !== excludeId) || [];

      return filtered;
    } catch {
      return rejectWithValue("Failed to load related products");
    }
  }
);

/* PAGINATED PRODUCTS (Optional / Admin) */
export const fetchPaginatedProductsThunk = createAsyncThunk(
  "product/fetchPaginated",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const res = await getPaginatedProducts(page, limit);
      return res.data.products;
    } catch {
      return rejectWithValue("Failed to load paginated products");
    }
  }
);

export const adminAddProductThunk = createAsyncThunk(
  "product/adminAdd",
  async (data, { rejectWithValue }) => {
    try {
      const res = await adminAddProduct(data);
      return res.data.product;
    } catch {
      return rejectWithValue("Failed to add product");
    }
  }
);

export const adminUpdateProductThunk = createAsyncThunk(
  "product/adminUpdate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await adminUpdateProduct(id, data);
      return res.data.product;
    } catch {
      return rejectWithValue("Failed to update product");
    }
  }
);

export const adminDeleteProductThunk = createAsyncThunk(
  "product/adminDelete",
  async (id, { rejectWithValue }) => {
    try {
      await adminDeleteProduct(id);
      return id;
    } catch {
      return rejectWithValue("Failed to delete product");
    }
  }
);

export const updateStockThunk = createAsyncThunk(
  "product/updateStock",
  async ({ productId, stock }, { rejectWithValue }) => {
    try {
      const res = await updateStock(productId, stock);
      return res.data.product;
    } catch {
      return rejectWithValue("Failed to update stock");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    /* ALL PRODUCTS */
    products: [],

    /* SINGLE PRODUCT */
    currentProduct: null,

    /* SEARCH */
    searchedProducts: [],
    totalPages: 1,

    /* RELATED PRODUCTS */
    relatedProducts: [],

    /* STATUS */
    loading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH ONE ================= */
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= SEARCH ================= */
      .addCase(searchProductsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProductsThunk.fulfilled, (state, action) => {
        state.searchedProducts = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(searchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.searchedProducts = [];
        state.totalPages = 1;
        state.error = action.payload;
      })

      /* ================= RELATED ================= */
      .addCase(fetchRelatedProductsThunk.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
      })

      /* ================= ADMIN ================= */
      .addCase(adminAddProductThunk.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })

      .addCase(adminUpdateProductThunk.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      .addCase(adminDeleteProductThunk.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      })

      .addCase(updateStockThunk.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;

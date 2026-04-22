import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

// ✅ FETCH CART FROM BACKEND
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data; // must be array
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ✅ ADD TO CART
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/cart/add`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ✅ UPDATE CART QUANTITY
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, type }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.put(
        `${API_URL}/api/cart/update`,
        { productId, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ✅ REMOVE FROM CART
export const removeFromCartAPI = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return productId; // Return the productId that was removed
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ✅ CLEAR CART
export const clearCartAPI = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.delete(`${API_URL}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Local state reducers (for immediate UI updates)
    clearCart: (state) => {
      state.items = [];
    },
    
    // ✅ Remove single item from Redux state
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    },

    // ✅ Remove multiple items at once
    removeMultipleFromCart: (state, action) => {
      const productIdsToRemove = action.payload;
      state.items = state.items.filter(
        item => !productIdsToRemove.includes(item.productId)
      );
    },

    // ✅ Update item quantity locally
    updateItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    updateCartPrices: (state, action) => {
      const updatedProducts = action.payload;
      state.items = state.items.map((item) => {
        const updated = updatedProducts.find((p) => p.id === item.id);
        if (updated) {
          return { ...item, price: Number(updated.price) || item.price };
        }
        return item;
      });
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cart";
      })

      // ADD TO CART
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to update the cart with the response
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add to cart";
      })

      // UPDATE QUANTITY
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update quantity";
      })

      // REMOVE FROM CART
      .addCase(removeFromCartAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the item from state using the local reducer
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.error = null;
      })
      .addCase(removeFromCartAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item";
      })

      // CLEAR CART
      .addCase(clearCartAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAPI.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.error = null;
      })
      .addCase(clearCartAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

// ✅ Export all actions
export const { 
  clearCart, 
  removeFromCart, 
  removeMultipleFromCart, 
  updateItemQuantity,
  updateCartPrices,
  clearError 
} = cartSlice.actions;

// ✅ Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
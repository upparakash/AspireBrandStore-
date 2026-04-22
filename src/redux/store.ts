import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    cart: cartReducer,
  },
});

//  EXPORT TYPES
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

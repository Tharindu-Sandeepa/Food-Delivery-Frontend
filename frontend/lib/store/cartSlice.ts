import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "./store"

// Define a type for the cart item
export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  image: string
}

// Define the initial state
interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.menuItemId === action.payload.menuItemId)

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; change: number }>) => {
      const { id, change } = action.payload
      const item = state.items.find((item) => item.id === id)

      if (item) {
        item.quantity = Math.max(1, item.quantity + change)
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

// Export actions
export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions

// Export selectors
export const selectCartItems = (state: RootState) => state.cart.items
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
export const selectCartItemsCount = (state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export default cartSlice.reducer

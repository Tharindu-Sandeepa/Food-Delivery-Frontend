import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_DELIVERY_API || "http://localhost:3003/api/deliveries";

// 🧑‍✈️ Get all deliveries assigned to a delivery person
export async function getDeliveriesByUser(userId: string) {
  const response = await axios.get(`${API_BASE}/driver/${userId}`);
  return response.data;
}

// 📦 Get a single delivery order by delivery ID
export async function getDeliveryById(deliveryId: string) {
  const response = await axios.get(`${API_BASE}/order/${deliveryId}`);
  return response.data;
}

export async function getOrderById(orderId: string) {
    const res = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
    console.log("Order data:", res.data);
    return res.data;
  }

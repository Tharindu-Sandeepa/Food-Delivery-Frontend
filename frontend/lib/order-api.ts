import axios from "axios";
import { BASE_URL_ORDERS } from "./constants/Base_url";


export async function getOrderById(orderId: string) {
    const res = await axios.get(`${BASE_URL_ORDERS}/api/orders/${orderId}`);
    console.log("Order data:", res.data);
    return res.data;
}

export async function getOrderByResturentsId(id: string) {
    const res = await axios.get(`${BASE_URL_ORDERS}/api/orders/restaurant/${id}`);
    console.log("Order data:", res.data);
    return res.data;
}
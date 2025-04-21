import axios from "axios";


export async function getOrderById(orderId: string) {
    const res = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
    console.log("Order data:", res.data);
    return res.data;
}

export async function getOrderByResturentsId(id: string) {
    const res = await axios.get(`http://localhost:3001/api/orders/restaurant/${id}`);
    console.log("Order data:", res.data);
    return res.data;
}
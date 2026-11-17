import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/order/seller");
      if (data.success) {
        setOrders(data.data || data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
  };

  const statusHandler = async (orderId: string, newStatus: string) => {
    try {
      const { data } = await axios.put(`/api/v1/order/status/${orderId}`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders available.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={order._id || index}
              className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white"
            >
              {/* Product Image & Name */}
              <div className="flex gap-4 max-w-80 items-center">
                <img
                  className="w-14 h-14 object-cover rounded border border-gray-200 shrink-0"
                  src={order.items?.[0]?.product?.image?.[0] || assets.box_icon}
                  alt="product"
                />
                <div className="space-y-1">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                      <p className="font-medium text-gray-800">
                        {item.product?.name || "Product"}{" "}
                        <span className="text-primary">x {item.quantity}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="text-sm md:text-base text-black/60">
                <p className="text-black/80 font-medium">
                  {order.address?.firstName} {order.address?.lastName}
                </p>
                <p>
                  {order.address?.street}, {order.address?.city}
                </p>
                <p>
                  {order.address?.state}, {order.address?.zipcode},{" "}
                  {order.address?.country}
                </p>
                <p>{order.address?.phone}</p>
              </div>

              {/* Amount */}
              <p className="font-medium text-lg my-auto text-gray-800">
                {currency}
                {order.amount}
              </p>

              {/* Payment & Date Info */}
              <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>
                  Payment:{" "}
                  <span
                    className={
                      order.isPaid
                        ? "text-green-600 font-medium"
                        : "text-orange-500"
                    }
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>

              {/* Order Status Selector */}
              <div>
                <select
                  onChange={(e) => statusHandler(order._id, e.target.value)}
                  value={order.status || "Order Placed"}
                  className="p-2 text-sm font-medium border border-gray-300 rounded-md bg-gray-50 text-gray-700 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Order Confirmed">Order Confirmed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;

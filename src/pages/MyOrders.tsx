import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const { currency, user, axios } = useAppContext();

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  // Cancel Confirmation Popup Modal State
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );
  const [cancelling, setCancelling] = useState(false);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/order/user");
      if (data.success) {
        setMyOrders(data.data || data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  // Open Edit Modal
  const openEditModal = (order: any) => {
    setEditingOrder(order);
    setEditItems(
      (order.items || []).map((item: any) => ({
        product: item.product?._id || item.product,
        name: item.product?.name || "Product",
        offerPrice: item.product?.offerPrice || 0,
        quantity: item.quantity || 1,
      })),
    );
  };

  // Update Quantity in Modal
  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...editItems];
    updated[index].quantity = newQty;
    setEditItems(updated);
  };

  // Save Updated Order
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setUpdating(true);
      const { data } = await axios.put(
        `/api/v1/order/update/${editingOrder._id}`,
        {
          items: editItems.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })),
        },
      );

      if (data.success) {
        toast.success(data.message || "Order updated successfully");
        setEditingOrder(null);
        fetchMyOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  // Confirm Cancel Order Handler
  const confirmCancelOrder = async () => {
    if (!cancellingOrderId) return;

    try {
      setCancelling(true);
      const { data } = await axios.delete(
        `/api/v1/order/cancel/${cancellingOrderId}`,
      );
      if (data.success) {
        toast.success(data.message || "Order cancelled");
        setCancellingOrderId(null);
        fetchMyOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {myOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        myOrders.map((order, index) => (
          <div
            key={order._id || index}
            className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
          >
            <div className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col gap-2 pb-3 border-b border-gray-200">
              <span>OrderId : {order._id}</span>
              <span>Payment : {order.paymentType}</span>
              <span>
                Total Amount : {currency}
                {order.amount}
              </span>
            </div>

            {(order.items || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className={`relative bg-white text-gray-500/70 ${
                  order.items.length !== idx + 1 && "border-b"
                } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <img
                      src={item.product?.image?.[0] || ""}
                      alt=""
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-800">
                      {item.product?.name || "Product"}
                    </h2>
                    <p>
                      Category :{" "}
                      {Array.isArray(item.product?.category)
                        ? item.product.category[0]
                        : item.product?.category}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                  <p>Quantity: {item.quantity || "1"}</p>
                  <p>Status: {order.status || "Order Placed"}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-primary text-lg font-medium">
                  Amount: {currency}
                  {(item.product?.offerPrice || 0) * (item.quantity || 1)}
                </p>
              </div>
            ))}

            {/* Edit & Cancel Actions (Only when Status is "Order Placed") */}
            {order.status === "Order Placed" && (
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(order)}
                  className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer transition"
                >
                  Edit Quantity
                </button>
                <button
                  onClick={() => setCancellingOrderId(order._id)}
                  className="px-4 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer transition"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Custom Cancel Confirmation Popup Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Cancel Order?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancelOrder}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Quantity Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Order Quantity
              </h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              {editItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Unit Price: {currency}
                      {item.offerPrice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(idx, item.quantity - 1)
                      }
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(idx, item.quantity + 1)
                      }
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dull rounded cursor-pointer disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Update Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

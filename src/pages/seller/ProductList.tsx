import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { categories } from "../../assets/assets";
import toast from "react-hot-toast";

const ProductList = () => {
  const { products, currency, fetchProducts, axios } = useAppContext();

  // Edit Modal States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [weight, setWeight] = useState("1kg");
  const [stockQuantity, setStockQuantity] = useState("20");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleStock = async (id: string, inStock: boolean) => {
    try {
      const { data } = await axios.post("/api/v1/product/stock", {
        id,
        inStock,
      });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    }
  };

  // Confirm Delete Handler
  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      setDeleting(true);
      const { data } = await axios.delete(
        `/api/v1/product/delete/${deletingProduct._id}`
      );
      if (data.success) {
        toast.success(data.message || "Product deleted");
        setDeletingProduct(null);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // Open Edit Modal & Pre-fill fields
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setName(product.name || "");
    setDescription(product.description || "");
    setCategory(
      Array.isArray(product.category)
        ? product.category[0]
        : product.category || ""
    );
    setWeight(product.weight || "1kg");
    setStockQuantity(String(product.stockQuantity ?? 20));
    setPrice(String(product.price || ""));
    setOfferPrice(String(product.offerPrice || ""));
    setImageFile(null);
  };

  // Update Submit Handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("weight", weight);
      formData.append("stockQuantity", stockQuantity);
      formData.append("price", price);
      formData.append("offerPrice", offerPrice);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.put(
        `/api/v1/product/update/${editingProduct._id}`,
        formData
      );

      if (data.success) {
        toast.success(data.message || "Product updated successfully");
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-semibold truncate hidden sm:table-cell">
                  Stock Qty
                </th>
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                <th className="px-4 py-3 font-semibold truncate text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {(products || []).map((product: any) => (
                <tr key={product._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded overflow-hidden shrink-0">
                      <img
                        src={product.image?.[0] || ""}
                        alt="Product"
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <div className="truncate max-sm:hidden">
                      <p className="font-medium text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.weight || "1kg"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {Array.isArray(product.category)
                      ? product.category[0]
                      : product.category}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (product.stockQuantity ?? 20) <= 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stockQuantity ?? 20} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        onChange={() =>
                          toggleStock(product._id, !product.inStock)
                        }
                        checked={Boolean(product.inStock)}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Confirmation Popup */}
      {deletingProduct && (
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                "{deletingProduct.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : editingProduct.image?.[0] || ""
                    }
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="text-sm text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                  >
                    {categories.map((item, idx) => (
                      <option key={idx} value={item.path}>
                        {item.path}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight / Unit
                  </label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                  >
                    <option value="250g">250g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                    <option value="2kg">2kg</option>
                    <option value="5kg">5kg</option>
                    <option value="500ml">500ml</option>
                    <option value="1L">1L</option>
                    <option value="1 Pack">1 Pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dull rounded cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
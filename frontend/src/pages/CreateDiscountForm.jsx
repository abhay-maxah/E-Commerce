import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateDiscountForm = () => {
  const [type, setType] = useState('CATEGORY');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    value: '',
    isPercentage: true,
    category: '',
    productName: '',
    minQuantity: '',
    maxQuantity: '',
    expiresAt: '',
  });

  // Fetch categories dynamically (fallback to static)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories'); // adjust path if needed
        setCategories(res.data);
      } catch (error) {
        // fallback static categories
        setCategories([
          { name: 'Cookies' },
          { name: 'Chocolates' },
          { name: 'Cakes' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    // Reset form fields on type change
    setForm({
      value: '',
      isPercentage: true,
      category: '',
      productName: '',
      minQuantity: '',
      maxQuantity: '',
      expiresAt: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type,
      value: parseFloat(form.value),
      isPercentage: form.isPercentage,
      expiresAt: form.expiresAt || null,
    };

    if (type === 'CATEGORY') {
      payload.category = form.category;
    } else if (type === 'PRODUCT') {
      payload.productName = form.productName;
    } else if (type === 'QUANTITY') {
      payload.minQuantity = parseInt(form.minQuantity);
      if (form.maxQuantity) payload.maxQuantity = parseInt(form.maxQuantity);
    } else if (type === 'PRODUCT_QUANTITY') {
      payload.productName = form.productName;
      payload.minQuantity = parseInt(form.minQuantity);
      if (form.maxQuantity) payload.maxQuantity = parseInt(form.maxQuantity);
    }

    try {
      await axios.post('/api/discounts', payload);
      alert('Discount created successfully!');
      // Optionally reset form after success:
      setForm({
        value: '',
        isPercentage: true,
        category: '',
        productName: '',
        minQuantity: '',
        maxQuantity: '',
        expiresAt: '',
      });
      setType('CATEGORY');
    } catch (err) {
      console.error(err);
      alert('Failed to create discount.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded-xl space-y-4"
    >
      <h2 className="text-2xl font-bold text-center mb-4">Create Discount</h2>

      <label className="block">
        Discount Type:
        <select
          value={type}
          onChange={handleTypeChange}
          className="block w-full mt-1 border p-2 rounded"
        >
          <option value="CATEGORY">Category</option>
          <option value="PRODUCT">Product</option>
          <option value="QUANTITY">Quantity (Any Product)</option>
          <option value="PRODUCT_QUANTITY">Product + Quantity</option>
        </select>
      </label>

      {type === 'CATEGORY' && (
        <label className="block">
          Select Category:
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="block w-full mt-1 border p-2 rounded"
            required
          >
            <option value="">-- Select a Category --</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === 'PRODUCT' && (
        <label className="block">
          Product Name:
          <input
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            className="block w-full mt-1 border p-2 rounded"
            required
          />
        </label>
      )}

      {type === 'QUANTITY' && (
        <>
          <label className="block">
            Min Quantity:
            <input
              type="number"
              name="minQuantity"
              value={form.minQuantity}
              onChange={handleChange}
              className="block w-full mt-1 border p-2 rounded"
              required
              min={1}
            />
          </label>
          <label className="block">
            Max Quantity (optional):
            <input
              type="number"
              name="maxQuantity"
              value={form.maxQuantity}
              onChange={handleChange}
              className="block w-full mt-1 border p-2 rounded"
              min={form.minQuantity || 1}
            />
          </label>
        </>
      )}

      {type === 'PRODUCT_QUANTITY' && (
        <>
          <label className="block">
            Product Name:
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              className="block w-full mt-1 border p-2 rounded"
              required
            />
          </label>

          <label className="block">
            Min Quantity:
            <input
              type="number"
              name="minQuantity"
              value={form.minQuantity}
              onChange={handleChange}
              className="block w-full mt-1 border p-2 rounded"
              required
              min={1}
            />
          </label>

          <label className="block">
            Max Quantity (optional):
            <input
              type="number"
              name="maxQuantity"
              value={form.maxQuantity}
              onChange={handleChange}
              className="block w-full mt-1 border p-2 rounded"
              min={form.minQuantity || 1}
            />
          </label>
        </>
      )}

      <label className="block">
        Discount Value:
        <input
          type="number"
          name="value"
          value={form.value}
          onChange={handleChange}
          className="block w-full mt-1 border p-2 rounded"
          required
          min={0}
          step="0.01"
        />
      </label>

      <label className="block flex items-center space-x-2">
        <input
          type="checkbox"
          name="isPercentage"
          checked={form.isPercentage}
          onChange={handleChange}
        />
        <span>Is Percentage?</span>
      </label>

      <label className="block">
        Expiration Date (optional):
        <input
          type="datetime-local"
          name="expiresAt"
          value={form.expiresAt}
          onChange={handleChange}
          className="block w-full mt-1 border p-2 rounded"
        />
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Create Discount
      </button>
    </form>
  );
};

export default CreateDiscountForm;

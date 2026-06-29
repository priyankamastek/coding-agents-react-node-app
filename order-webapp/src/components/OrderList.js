import React, { useState, useEffect, useCallback } from 'react';
import './OrderList.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(`Failed to fetch orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchOrders = useCallback(async (customerId, status, startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }

      const response = await fetch(`${API_BASE_URL}/orders/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(`Failed to search orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateItemCount = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemNames = (items) => {
    return items.map(item => item.name).join(', ');
  };

  const handleRefresh = () => {
    if (isSearchActive) {
      searchOrders(searchCustomerId, searchStatus, searchStartDate, searchEndDate);
    } else {
      fetchOrders();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchActive(true);
    searchOrders(searchCustomerId, searchStatus, searchStartDate, searchEndDate);
  };

  const handleClearSearch = () => {
    setSearchCustomerId('');
    setSearchStatus('');
    setSearchStartDate('');
    setSearchEndDate('');
    setIsSearchActive(false);
    fetchOrders();
  };

  if (loading) {
    return <div className="order-list-loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="order-list-error">
        <p>{error}</p>
        <button onClick={handleRefresh} className="refresh-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>Order List</h2>
        <button onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-fields">
          <div className="search-field">
            <label htmlFor="searchCustomerId">Customer ID</label>
            <input
              id="searchCustomerId"
              type="text"
              placeholder="Search by Customer ID"
              value={searchCustomerId}
              onChange={(e) => setSearchCustomerId(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label htmlFor="searchStatus">Status</label>
            <select
              id="searchStatus"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="search-field">
            <label htmlFor="searchStartDate">Start Date</label>
            <input
              id="searchStartDate"
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label htmlFor="searchEndDate">End Date</label>
            <input
              id="searchEndDate"
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="search-actions">
          <button type="submit" className="search-button">Search</button>
          <button type="button" className="clear-button" onClick={handleClearSearch}>Clear</button>
        </div>
      </form>

      {orders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Number</th>
              <th>Item Count</th>
              <th>Item Names</th>
              <th>Total</th>
              <th>Order Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerId}</td>
                <td>{calculateItemCount(order.items)}</td>
                <td>{getItemNames(order.items)}</td>
                <td>${order.total.toFixed(2)}</td>
                <td><span className={`status-${order.status}`}>{order.status}</span></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;

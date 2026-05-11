import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminTickets, getAdminTicketReplies, addAdminTicketReply, updateAdminTicketStatus } from '../api/api';
import toast from 'react-hot-toast';

const AdminTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Verify user is admin
    if (!user?.roles?.includes('ROLE_ADMIN')) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    fetchTickets();
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    // Fetch replies when a ticket is selected
    if (selectedTicket?.id) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAdminTickets();
      if (response.data && Array.isArray(response.data)) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId) => {
    try {
      const res = await getAdminTicketReplies(ticketId);
      if (res.data) {
        setSelectedTicket((prev) => ({ ...prev, replies: res.data }));
        setTickets((prev) => prev.map(t => t.id === ticketId ? { ...t, replies: res.data } : t));
      }
    } catch (err) {
      console.error('Failed to fetch replies', err);
      toast.error('Failed to load replies');
    }
  };

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      setLoading(true);
      await addAdminTicketReply(ticketId, { message: replyText });
      toast.success('Reply sent');
      setReplyText('');
      await fetchReplies(ticketId);
      await fetchTickets();
    } catch (err) {
      console.error('Failed to send reply', err);
      toast.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      setLoading(true);
      await updateAdminTicketStatus(ticketId, status);
      toast.success('Ticket status updated');
      await fetchReplies(ticketId);
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-orange-100 text-orange-700',
      IN_PROGRESS: 'bg-gold-100 text-gold-700',
      WAITING_FOR_CUSTOMER: 'bg-orange-100 text-orange-700',
      WAITING_FOR_ADMIN: 'bg-gold-100 text-gold-700',
      RESOLVED: 'bg-gold-100 text-gold-700',
      CLOSED: 'bg-neutral-100 text-neutral-700'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="heading-serif text-neutral-900">Support Tickets - Admin Portal</h1>
          <p className="text-neutral-600 mt-2">Manage customer support tickets and send replies</p>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="card-minimal p-12 text-center">
            <p className="text-neutral-500 text-lg">No tickets yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                className="card-minimal p-5 cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1 animate-fade-in"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono bg-neutral-100 px-3 py-1 rounded text-neutral-700">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">{ticket.subject}</h3>
                    <p className="text-neutral-600 text-sm mt-2">
                      <strong>Customer:</strong> {ticket.userFullName}
                    </p>
                    <p className="text-neutral-600 text-sm">
                      {ticket.description.substring(0, 100)}...
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                      <span>{ticket.replyCount} replies</span>
                    </div>
                  </div>
                  <span className="text-gray-400 ml-4">›</span>
                </div>

                {/* Ticket Details */}
                {selectedTicket?.id === ticket.id && (
                  <div onClick={(e) => e.stopPropagation()} className="mt-6 pt-6 border-t border-neutral-100">
                    {/* Full Description */}
                    <div className="panel-muted rounded p-4 mb-4">
                      <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
                      <p className="text-neutral-700">{ticket.description}</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        <strong>Customer:</strong> {ticket.userFullName}
                      </p>
                    </div>

                    {/* Conversation History */}
                    {selectedTicket?.replies && selectedTicket.replies.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <h4 className="font-semibold text-neutral-900">Conversation History</h4>
                        {selectedTicket.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-4 rounded ${
                              reply.type === 'ADMIN'
                                ? 'bg-gold-50 border-l-4 border-gold-500'
                                : 'bg-neutral-50 border-l-4 border-neutral-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-neutral-900">{reply.userName}</p>
                                <p className="text-xs text-neutral-500">
                                  {reply.type === 'ADMIN' ? '🔶 Admin Support' : '👤 Customer'}
                                </p>
                              </div>
                              <span className="text-xs text-neutral-500">
                                {new Date(reply.createdAt).toLocaleDateString('en-IN')}{' '}
                                {new Date(reply.createdAt).toLocaleTimeString('en-IN')}
                              </span>
                            </div>
                            <p className="text-neutral-700">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Section */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-neutral-900 mb-3">Send Reply & Update Status</h4>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply to the customer..."
                        maxLength="2000"
                        rows="4"
                        className="input-minimal w-full"
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => handleSendReply(ticket.id)}
                          disabled={!replyText.trim() || loading}
                          className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                          {loading ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                          disabled={loading}
                          className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'WAITING_FOR_CUSTOMER')}
                          disabled={loading}
                          className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                          Waiting for Customer
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                          disabled={loading}
                          className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                          disabled={loading}
                          className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;

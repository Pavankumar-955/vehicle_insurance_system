import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTickets, createTicket, getTicketReplies, addTicketReply, updateTicketStatus, reopenTicket } from '../api/api';
import toast from 'react-hot-toast';

const Tickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'GENERAL_INQUIRY',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // when a ticket is selected, fetch its replies
    if (selectedTicket?.id) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const isAdmin = (u) => {
    return !!(u && Array.isArray(u.roles) && u.roles.includes('ROLE_ADMIN'));
  };

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      setLoading(true);
      await addTicketReply(ticketId, { message: replyText });
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
      await updateTicketStatus(ticketId, status);
      toast.success('Ticket status updated');
      // refresh
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

  const handleReopen = async (ticketId) => {
    try {
      setLoading(true);
      await reopenTicket(ticketId);
      toast.success('Ticket reopened');
      await fetchReplies(ticketId);
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: 'OPEN' }));
      }
    } catch (err) {
      console.error('Failed to reopen ticket', err);
      toast.error(err.response?.data?.message || 'Failed to reopen ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTickets();
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || formData.subject.length < 10) {
      toast.error('Subject must be at least 10 characters');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    try {
      setLoading(true);
      await createTicket(formData);
      toast.success('Ticket created successfully');
      setShowCreateForm(false);
      setFormData({ category: 'GENERAL_INQUIRY', subject: '', description: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId) => {
    try {
      const res = await getTicketReplies(ticketId);
      if (res.data) {
        // attach replies to selectedTicket
        setSelectedTicket((prev) => ({ ...prev, replies: res.data }));
        // also update in the tickets list
        setTickets((prev) => prev.map(t => t.id === ticketId ? { ...t, replies: res.data } : t));
      }
    } catch (err) {
      console.error('Failed to fetch replies', err);
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
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <p className="text-neutral-500">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-gold-100">
          <div>
            <h1 className="heading-serif text-3xl text-neutral-900">Support Tickets</h1>
            <p className="text-neutral-600 text-lg mt-1">Get help from our support team</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-gold-300 outline-none ${showCreateForm ? 'bg-gold-600 text-white hover:bg-gold-700 shadow-lg shadow-gold-200' : 'bg-gold-600 text-white hover:bg-gold-700 shadow-lg shadow-gold-200'}`}
          >
            {showCreateForm ? '✕ Cancel' : '+ New Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="card-minimal p-8 mb-10 animate-fade-in border-t-4 border-gold-600">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Create New Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
                  >
                    <option value="CLAIM_RELATED">📋 Claim Related</option>
                    <option value="POLICY_RELATED">📄 Policy Related</option>
                    <option value="PAYMENT_ISSUE">💳 Payment Issue</option>
                    <option value="GENERAL_INQUIRY">❓ General Inquiry</option>
                    <option value="COMPLAINT">⚠️ Complaint</option>
                    <option value="DOCUMENTATION">📁 Documentation</option>
                    <option value="OTHER">📌 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief subject of your issue (minimum 10 characters)"
                  maxLength="200"
                  className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
                  required
                />
                <p className="text-xs text-neutral-500 mt-2">{formData.subject.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your issue (minimum 20 characters)"
                  maxLength="2000"
                  rows="5"
                  className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all p-4"
                  required
                />
                <p className="text-xs text-neutral-500 mt-2">{formData.description.length}/2000 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-gold-300 disabled:opacity-50"
              >
                {loading ? '⏳ Creating...' : '✓ Create Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="card-minimal p-12 text-center">
            <p className="text-neutral-500 text-lg">No tickets created yet.</p>
            <p className="text-neutral-400 mt-2">Click "New Ticket" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                className="card-minimal p-6 cursor-pointer hover:shadow-lg transition animate-fade-in border-l-4 border-gold-600 hover:border-gold-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-sm font-mono bg-gold-100 px-3 py-1 rounded text-gold-800 font-semibold">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">{ticket.subject}</h3>
                    <p className="text-neutral-700 text-sm mt-2 leading-relaxed">{ticket.description.substring(0, 100)}...</p>
                    <div className="flex gap-6 mt-4 text-sm text-neutral-600 flex-wrap">
                      <span>📌 {ticket.category}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                      <span>💬 {ticket.replyCount} replies</span>
                    </div>
                  </div>
                  <span className="text-gold-600 ml-4 text-2xl font-bold">{selectedTicket?.id === ticket.id ? '▼' : '▶'}</span>
                </div>

                {/* Ticket Details */}
                {selectedTicket?.id === ticket.id && (
                  <div onClick={(e) => e.stopPropagation()} className="mt-6 pt-6 border-t border-gold-100 space-y-6">
                    <div className="bg-gold-50 rounded-lg p-5 border-l-4 border-gold-600">
                      <h4 className="font-bold text-neutral-900 mb-3 text-lg">Full Description</h4>
                      <p className="text-neutral-700 leading-relaxed">{ticket.description}</p>
                    </div>

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
                                  {reply.type === 'ADMIN' ? '🔶 Admin Support' : '👤 You'}
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

                    <div className="mt-6 space-y-4">
                      {/* Show reply form if ticket is OPEN, IN_PROGRESS, or WAITING_* */}
                      {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || 
                        ticket.status === 'WAITING_FOR_ADMIN' || ticket.status === 'WAITING_FOR_CUSTOMER') ? (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-neutral-900 mb-2">Add Reply</label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply here..."
                              maxLength="2000"
                              rows="3"
                              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all p-4"
                            />
                            <p className="text-xs text-neutral-500 mt-1">{replyText.length}/2000</p>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            <button onClick={() => handleSendReply(ticket.id)} disabled={!replyText.trim() || loading}
                              className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50">
                              ✓ Send Reply
                            </button>
                            {isAdmin(user) && (
                              <>
                                <button onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')} disabled={loading}
                                  className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50">
                                  ✓ Mark Resolved
                                </button>
                                <button onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')} disabled={loading}
                                  className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50">
                                  ✕ Close
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        // Show re-open button if ticket is CLOSED or RESOLVED
                        <div className="flex gap-3">
                          <button onClick={() => handleReopen(ticket.id)} disabled={loading}
                            className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all duration-200 active:scale-95 disabled:opacity-50">
                            🔄 Re-open Ticket
                          </button>
                        </div>
                      )}
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

export default Tickets;

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getMyClaims, submitClaim, getMyActivePolicies, uploadDocument, getDocumentsByEntity, deleteDocument, downloadDocument, downloadClaimApprovalCertificate } from '../api/api'

export default function Claims() {
  const [claims, setClaims] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ policyId: '', claimDescription: '', claimSettlementType: '' })
  const [attachedFile, setAttachedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [claimDocuments, setClaimDocuments] = useState([])
  const [uploadingFile, setUploadingFile] = useState(false)

  const load = () => {
    Promise.all([getMyClaims(), getMyActivePolicies()])
      .then(([c, p]) => {
        setClaims(c.data || [])
        setPolicies(p.data || [])
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const loadClaimDocuments = async (claimId) => {
    try {
      const response = await getDocumentsByEntity(claimId, 'CLAIM')
      setClaimDocuments(response.data || [])
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.claimSettlementType) {
      toast.error('Please select a settlement type (Cashless or Reimbursement)')
      return
    }
    
    if (!attachedFile) {
      toast.error('Please attach a PDF document to submit the claim')
      return
    }

    setSubmitting(true)
    try {
      // First submit the claim
      const claimResponse = await submitClaim({
        policyId: Number(form.policyId),
        claimDescription: form.claimDescription,
        claimSettlementType: form.claimSettlementType,
      })
      
      const newClaimId = claimResponse.data?.id
      
      // Then upload the document
      if (newClaimId && attachedFile) {
        const formData = new FormData()
        formData.append('file', attachedFile)
        formData.append('documentType', 'CLAIM_ATTACHMENT')
        formData.append('relatedEntityId', newClaimId)
        formData.append('relatedEntityType', 'CLAIM')
        
        await uploadDocument(formData)
      }
      
      toast.success('Claim submitted with document')
      setForm({ policyId: '', claimDescription: '', claimSettlementType: '' })
      setAttachedFile(null)
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (e, claimId) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'CLAIM_ATTACHMENT')
      formData.append('relatedEntityId', claimId)
      formData.append('relatedEntityType', 'CLAIM')

      await uploadDocument(formData)
      toast.success('Document uploaded')
      loadClaimDocuments(claimId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(docId)
      toast.success('Document deleted')
      if (selectedClaim) loadClaimDocuments(selectedClaim.id)
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      const response = await downloadDocument(docId)
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Download failed')
    }
  }

  const handleDownloadApprovalCertificate = async (claimId) => {
    try {
      const response = await downloadClaimApprovalCertificate(claimId)
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `claim-approval-${claimId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Approval certificate downloaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download approval certificate')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-8 border-b border-gold-100">
        <div>
          <h1 className="heading-serif text-3xl text-neutral-900">Claims Management</h1>
          <p className="text-neutral-600 text-lg mt-1">Submit and track your insurance claims</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-gold-300 outline-none ${showForm ? 'bg-gold-600 text-white hover:bg-gold-700 shadow-lg shadow-gold-200' : 'bg-gold-600 text-white hover:bg-gold-700 shadow-lg shadow-gold-200'}`}>
          {showForm ? '✕ Cancel' : '+ Submit New Claim'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-minimal p-8 mb-10 max-w-3xl space-y-6 animate-fade-in border-t-4 border-gold-600">
          <h2 className="text-2xl font-bold text-neutral-900">New Claim</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-3">Select Policy</label>
              <select
                value={form.policyId}
                onChange={(e) => setForm((f) => ({ ...f, policyId: e.target.value }))}
                className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
                required
              >
                <option value="">— Choose your policy —</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber} · {p.insuranceCategory === 'COMPREHENSIVE' ? 'Comprehensive' : p.insuranceCategory === 'THIRD_PARTY' ? 'Third Party' : (p.policyType || p.insuranceCategory || '')}
                  </option>
                ))}
              </select>
              {policies.length === 0 && <p className="text-gold-600 text-sm mt-2 font-medium">📌 No active policies. Buy one first.</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-3">Coverage Type</label>
              <select
                value={form.claimSettlementType}
                onChange={(e) => setForm((f) => ({ ...f, claimSettlementType: e.target.value }))}
                className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
                required
              >
                <option value="">— Select coverage type —</option>
                <option value="CASHLESS">Cashless</option>
                <option value="REIMBURSEMENT">Reimbursement</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">Description of Claim</label>
            <textarea
              value={form.claimDescription}
              onChange={(e) => setForm((f) => ({ ...f, claimDescription: e.target.value }))}
              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all p-4"
              rows={4}
              placeholder="Describe the incident and claim details..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">
              📎 Attach PDF Document <span className="text-red-600 text-lg">*</span>
            </label>
            <div className="relative border-2 border-dashed border-gold-300 rounded-lg p-8 text-center hover:border-gold-600 transition-colors bg-gold-50 group">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              <div className="pointer-events-none">
                <svg className="w-10 h-10 mx-auto text-gold-600 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {attachedFile ? (
                  <div>
                    <p className="font-bold text-gold-700 text-lg">✓ {attachedFile.name}</p>
                    <p className="text-sm text-gold-600 mt-1">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-neutral-900 text-lg">Click or drag PDF to upload</p>
                    <p className="text-sm text-neutral-600 mt-1">PDF files only • Max 10MB</p>
                  </div>
                )}
              </div>
            </div>
            {!attachedFile && <p className="text-gold-600 text-sm mt-3 font-semibold">⚠️ Document is required to submit claim</p>}
          </div>
          <button type="submit" disabled={submitting || !attachedFile} className="w-full px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-gold-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Submitting...
              </span>
            ) : (
              '✓ Submit Claim'
            )}
          </button>
        </form>
      )}

      <div className="card-minimal overflow-hidden border border-gold-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-gradient-to-r from-gold-50 to-gold-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Claim #</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Policy</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Coverage Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gold-900 uppercase">Submitted</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gold-900 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {claims.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-500"><p className="text-lg">No claims submitted yet.</p><p className="text-sm mt-1">Submit your first claim above.</p></td></tr>
              ) : (
                claims.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr 
                      onClick={() => {
                        setSelectedClaim(selectedClaim?.id === c.id ? null : c)
                        if (selectedClaim?.id !== c.id) loadClaimDocuments(c.id)
                      }}
                      className="hover:bg-gold-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-neutral-900">{c.claimNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-700">{c.policyNumber}</td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate text-neutral-700">{c.claimDescription}</td>
                      <td className="px-6 py-4 font-semibold text-gold-600">
                        {c.claimSettlementType === 'CASHLESS' ? '💳 Cashless' : c.claimSettlementType === 'REIMBURSEMENT' ? '💰 Reimbursement' : c.claimSettlementType || '—'}
                      </td>
                      <td>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${
                          c.status === 'APPROVED' ? 'bg-gold-100 text-gold-700' :
                          c.status === 'REJECTED' ? 'bg-neutral-100 text-neutral-700' : 'bg-orange-100 text-orange-700'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gold-600">{selectedClaim?.id === c.id ? '▼' : '▶'}</td>
                    </tr>
                    {selectedClaim?.id === c.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 bg-gold-50 border-t-2 border-gold-100">
                          <div className="space-y-5 max-w-4xl">
                            {/* Claim Details */}
                            <div className="grid grid-cols-3 gap-3 bg-white border-l-4 border-gold-600 p-5 rounded-lg shadow-sm">
                              <div>
                                <p className="text-xs text-neutral-600 font-semibold uppercase">Settlement Type</p>
                                <p className="text-sm font-semibold text-gold-600 mt-1">
                                  {c.claimSettlementType === 'CASHLESS' ? '💳 Cashless' : c.claimSettlementType === 'REIMBURSEMENT' ? '💰 Reimbursement' : c.claimSettlementType || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-600 font-semibold uppercase">Status</p>
                                <p className="text-sm font-semibold text-gold-600 mt-1">{c.status}</p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-600 font-semibold uppercase">Submitted</p>
                                <p className="text-sm font-semibold text-neutral-900 mt-1">{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN') : '—'}</p>
                              </div>
                            </div>

                            {/* Approval Certificate - Show only if APPROVED */}
                            {c.status === 'APPROVED' && (
                              <div className="bg-white border-l-4 border-green-600 p-5 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-neutral-900 text-lg mb-1">✅ Claim Approved</h4>
                                    <p className="text-sm text-neutral-600">Download your approval certificate</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadApprovalCertificate(c.id)}
                                    className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 active:scale-95 whitespace-nowrap"
                                  >
                                    📄 Download Certificate
                                  </button>
                                </div>
                              </div>
                            )}                            {c.adminRemark && (
                              <div className="bg-white border-l-4 border-gold-600 p-5 rounded-lg shadow-sm">
                                <h4 className="font-bold text-neutral-900 mb-2 text-lg">💬 Admin Remark</h4>
                                <p className="text-neutral-700 leading-relaxed">{c.adminRemark}</p>
                              </div>
                            )}
                            
                            <div className="bg-white border-l-4 border-blue-600 p-5 rounded-lg shadow-sm">
                              <h4 className="font-bold text-neutral-900 mb-3 text-lg">📎 Attached Documents</h4>
                              {claimDocuments.length === 0 ? (
                                <p className="text-neutral-600">No documents attached</p>
                              ) : (
                                <div className="space-y-3">
                                  {claimDocuments.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg border border-gold-200 hover:bg-gold-50 transition-colors">
                                      <div className="flex-1">
                                        <p className="font-semibold text-neutral-900">{doc.fileName}</p>
                                        <p className="text-sm text-neutral-500 mt-1">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <button
                                          onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                                          className="px-4 py-2 bg-gold-600 text-white font-medium text-sm rounded-lg hover:bg-gold-700 transition-all duration-200 active:scale-95"
                                        >
                                          ⬇️ Download
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>


                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Circular {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function ManageCirculars() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await fetch('/api/circulars');
      if (res.ok) {
        const data = await res.json();
        setCirculars(data);
      }
    } catch (error) {
      console.error("Error fetching circulars:", error);
    }
  };

  // 2. Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, title, content } : { title, content };

      const res = await fetch('/api/circulars', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setEditingId(null);
        fetchCirculars(); // Refresh list
        alert(editingId ? "Circular Updated!" : "Circular Published!");
      } else {
        alert("Operation failed.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Edit Click
  const handleEdit = (c: Circular) => {
    setEditingId(c.id);
    setTitle(c.title);
    setContent(c.content);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  // 4. Handle Delete Click
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/circulars?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCirculars(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  if (status === "loading") return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📢 Manage Circulars</h1>
            <p className="text-gray-500 mt-1">Create, edit, and remove student announcements.</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Input Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-indigo-700">
            {editingId ? "✏️ Edit Circular" : "📝 Create New Circular"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exam Schedule Released"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the detailed announcement here..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-bold text-white shadow-md transition transform hover:-translate-y-0.5 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : editingId 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Processing...' : editingId ? 'Update Circular' : 'Publish Circular'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Circulars List */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">📜 Posted Announcements</h2>
        
        {circulars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No circulars posted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {circulars.map((circular) => (
              <div key={circular.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{circular.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-1 rounded">
                      🕒 {new Date(circular.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(circular)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(circular.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{circular.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
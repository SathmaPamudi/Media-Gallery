import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mediaAPI, formatDate, formatFileSize, downloadFile } from '../utils/api';
import { toast } from 'react-hot-toast';

const MediaDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    fetchMedia();
  }, [id]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getMediaById(id);
      setMedia(response.data.data);
      setEditForm({
        title: response.data.data.title || '',
        description: response.data.data.description || '',
        tags: response.data.data.tags?.join(', ') || ''
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
      navigate('/gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await mediaAPI.toggleLike(id);
      setMedia(prev => ({
        ...prev,
        likes: prev.likedBy?.includes(user?._id) ? prev.likes - 1 : prev.likes + 1,
        likedBy: prev.likedBy?.includes(user?._id) 
          ? prev.likedBy.filter(id => id !== user?._id) 
          : [...(prev.likedBy || []), user?._id]
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mediaAPI.deleteMedia(id);
      toast.success('Media deleted successfully');
      navigate('/gallery');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await mediaAPI.updateMedia(id, updateData);
      setMedia(response.data.data);
      setEditing(false);
      toast.success('Media updated successfully');
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    }
  };

  const isOwner = media?.user?._id === user?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Media not found</h2>
          <Link to="/gallery" className="text-indigo-600 hover:text-indigo-500">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to="/gallery"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-2"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Gallery
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{media.title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFullscreen(true)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                
                <button
                  onClick={() => downloadFile(media.url, media.title)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Media Display */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : media.type === 'video' ? (
                  <video
                    controls
                    className="w-full h-auto max-h-96"
                    src={media.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">Document Preview</p>
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                      media.likedBy?.includes(user?._id)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={media.likedBy?.includes(user?._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{media.likes || 0} likes</span>
                  </button>
                </div>

                {/* Edit Form */}
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={editForm.tags}
                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Media Details */
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{media.title}</h3>
                      {media.description && (
                        <p className="mt-2 text-gray-600">{media.description}</p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">File Type</dt>
                          <dd className="text-sm text-gray-900 capitalize">{media.type}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">File Size</dt>
                          <dd className="text-sm text-gray-900">{formatFileSize(media.size)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                          <dd className="text-sm text-gray-900">{formatDate(media.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">By</dt>
                          <dd className="text-sm text-gray-900">
                            {media.user?.firstName} {media.user?.lastName}
                          </dd>
                        </div>
                        {media.tags && media.tags.length > 0 && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Tags</dt>
                            <dd className="text-sm text-gray-900">
                              <div className="flex flex-wrap gap-1 mt-1">
                                {media.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : media.type === 'video' ? (
              <video
                controls
                className="max-w-full max-h-full"
                src={media.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-white">
                <p>Document preview not available in fullscreen</p>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Open Document
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Media
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{media.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaDetailPage; 
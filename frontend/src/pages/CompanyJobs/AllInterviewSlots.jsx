import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AllInterviewSlots = () => {
  const [slots, setSlots] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJob, setFilterJob] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    time: '',
    duration: 30,
    type: 'in-person',
    status: 'available',
    notes: '',
    location: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all jobs
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);

        // Fetch slots for all jobs
        const allSlots = [];
        for (const job of jobsData) {
          const slotsResponse = await fetch(`http://localhost:5000/api/interview-slots/job/${job._id}`);
          if (slotsResponse.ok) {
            const slotsData = await slotsResponse.json();
            allSlots.push(...slotsData);
          }
        }
        setSlots(allSlots);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this interview slot?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/interview-slots/${slotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Interview slot deleted successfully!');
        fetchAllData();
      } else {
        alert('Failed to delete interview slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot');
    }
  };

  const handleEditClick = (slot) => {
    setEditingSlot(slot);
    setEditFormData({
      date: slot.date.split('T')[0], // Convert to YYYY-MM-DD format
      time: slot.time,
      duration: slot.duration,
      type: slot.type,
      status: slot.status,
      notes: slot.notes || '',
      location: slot.location || '',
      meetingLink: slot.meetingLink || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/interview-slots/${editingSlot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        alert('Interview slot updated successfully!');
        setShowEditModal(false);
        setEditingSlot(null);
        fetchAllData();
      } else {
        const errorData = await response.json();
        alert(`Failed to update slot: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Error updating slot');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSlot(null);
    setEditFormData({
      date: '',
      time: '',
      duration: 30,
      type: 'in-person',
      status: 'available',
      notes: '',
      location: '',
      meetingLink: ''
    });
  };

  const filteredSlots = slots.filter(slot => {
    if (filterJob !== 'all' && slot.jobId._id !== filterJob) return false;
    if (filterStatus !== 'all' && slot.status !== filterStatus) return false;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    booked: slots.filter(s => s.isBooked).length,
    expired: slots.filter(s => new Date(s.date + 'T' + s.time) < new Date() && !s.isBooked).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Interview Slots</h1>
          <p className="text-gray-600 mt-2">View and manage all interview time slots across all jobs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.booked}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Job</label>
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title} - {job.department}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading slots...</div>
          ) : filteredSlots.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No interview slots found. Create some slots to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{slot.jobId.title}</div>
                        <div className="text-sm text-gray-500">{slot.jobId.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(slot.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(slot.status)}`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(slot)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit slot"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete slot"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Interview Slot</h2>
                  <button
                    onClick={handleCloseEditModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdateSlot} className="space-y-4">
                  {/* Job Info (Read-only) */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Job</p>
                    <p className="text-lg font-semibold text-gray-900">{editingSlot?.jobId?.title}</p>
                    <p className="text-sm text-gray-600">{editingSlot?.jobId?.department}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={editFormData.time}
                        onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <select
                        value={editFormData.duration}
                        onChange={(e) => setEditFormData({...editFormData, duration: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Type *
                      </label>
                      <select
                        value={editFormData.type}
                        onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="in-person">In-Person</option>
                        <option value="video">Video Call</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      placeholder="e.g., Office Room 305 or Video Call"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link (for video calls)
                    </label>
                    <input
                      type="url"
                      value={editFormData.meetingLink}
                      onChange={(e) => setEditFormData({...editFormData, meetingLink: e.target.value})}
                      placeholder="https://zoom.us/j/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllInterviewSlots;

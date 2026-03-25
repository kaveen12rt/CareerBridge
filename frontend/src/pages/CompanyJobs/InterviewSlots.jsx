import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const InterviewSlots = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [interviewSlots, setInterviewSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    duration: 30,
    type: 'in-person'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchInterviewSlots();
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchInterviewSlots = async () => {
    if (!selectedJob) {
      console.log('No job selected, skipping fetch');
      return;
    }
    
    console.log('Fetching slots for job:', selectedJob);
    try {
      const response = await fetch(`http://localhost:5000/api/interview-slots/job/${selectedJob}`);
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched interview slots:', data);
        console.log('Number of slots:', data.length);
        setInterviewSlots(data);
      } else {
        console.error('Failed to fetch interview slots, status:', response.status);
        setInterviewSlots([]);
      }
    } catch (error) {
      console.error('Error fetching interview slots:', error);
      setInterviewSlots([]);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      alert('Please select a job first');
      return;
    }

    // Validate form data
    if (!newSlot.date || !newSlot.time) {
      alert('Please fill in both date and time');
      return;
    }
    
    setLoading(true);
    try {
      const slotData = {
        jobId: selectedJob,
        date: newSlot.date,
        time: newSlot.time,
        duration: newSlot.duration,
        type: newSlot.type
      };

      console.log('Sending slot data:', slotData);

      const response = await fetch('http://localhost:5000/api/interview-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData)
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        setNewSlot({ date: '', time: '', duration: 30, type: 'in-person' });
        alert('Interview slot added successfully!');
        await fetchInterviewSlots();
      } else {
        alert(`Failed to add slot: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Error adding slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/interview-slots/${slotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Interview slot deleted successfully!');
        await fetchInterviewSlots();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete slot: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSlotStatus = (slot) => {
    if (slot.isBooked) return 'booked';
    if (new Date(slot.date + 'T' + slot.time) < new Date()) return 'expired';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Slots Management</h1>
          <p className="text-gray-600 mt-2">Create and manage interview time slots for your job postings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Slot Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <PlusIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Add New Slot</h2>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job *
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={newSlot.duration}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in-person">In-Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* Interview Slots List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Interview Slots</h2>
              </div>
              {selectedJob && (
                <span className="text-sm text-gray-500">
                  {jobs.find(j => j._id === selectedJob)?.title}
                </span>
              )}
            </div>

            {!selectedJob ? (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No job selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a job to view its interview slots.</p>
              </div>
            ) : interviewSlots.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No slots created</h3>
                <p className="mt-1 text-sm text-gray-500">Start by adding interview slots for this job.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {interviewSlots.map((slot) => {
                  const status = getSlotStatus(slot);
                  return (
                    <div key={slot._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(slot.date)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {slot.time} • {slot.duration} min • {slot.type}
                              </p>
                            </div>
                          </div>
                          {slot.bookedBy && (
                            <p className="text-sm text-gray-600 mt-2">
                              Booked by: {slot.bookedBy.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          {status !== 'booked' && (
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {selectedJob && interviewSlots.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {interviewSlots.filter(slot => getSlotStatus(slot) === 'available').length}
                </p>
                <p className="text-sm text-gray-600">Available Slots</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {interviewSlots.filter(slot => getSlotStatus(slot) === 'booked').length}
                </p>
                <p className="text-sm text-gray-600">Booked Slots</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {interviewSlots.filter(slot => getSlotStatus(slot) === 'expired').length}
                </p>
                <p className="text-sm text-gray-600">Expired Slots</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSlots;
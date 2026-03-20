import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaEdit, FaTrash, FaUserPlus, FaTimes, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { API_URL } from '../utils/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'member',
    country: '',
    contact: '',
    address: ''
  });

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { 'x-auth-token': token }
      });
      setMembers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter Logic
  const filteredMembers = members.filter(member => {
    const matchesCountry = filterCountry === '' || member.country.toLowerCase().includes(filterCountry.toLowerCase());
    const matchesRole = filterRole === '' || member.role === filterRole;
    return matchesCountry && matchesRole;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/api/users/${editingUser.id}`, formData, {
          headers: { 'x-auth-token': token }
        });
      } else {
        // Create new user
        await axios.post(`${API_URL}/api/users`, formData, {
          headers: { 'x-auth-token': token }
        });
      }
      
      closeModal();
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error deleting user');
    }
  };

  const startEdit = (member) => {
    setEditingUser(member);
    setFormData({
      fullname: member.fullname,
      email: member.email,
      password: '', // Don't populate password
      role: member.role,
      country: member.country,
      contact: member.contact || '',
      address: member.address || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ 
        fullname: '', 
        email: '', 
        password: '', 
        role: 'member', 
        country: user.role === 'leader' ? user.country : '', 
        contact: '', 
        address: '' 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ fullname: '', email: '', password: '', role: 'member', country: '', contact: '', address: '' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">
            {user.role === 'admin' ? 'All Users' : 'My Country Members'}
          </h2>
          {(user.role === 'admin' || user.role === 'leader') && (
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaUserPlus /> Add User
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
                <FaFilter /> <span className="font-semibold">Filters:</span>
            </div>
            <input 
                type="text" 
                placeholder="Filter by Country" 
                value={filterCountry}
                onChange={(e) => { setFilterCountry(e.target.value); setCurrentPage(1); }}
                className="p-2 border rounded focus:outline-none focus:border-indigo-500"
            />
            <select 
                value={filterRole} 
                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                className="p-2 border rounded focus:outline-none focus:border-indigo-500"
            >
                <option value="">All Roles</option>
                <option value="member">Member</option>
                <option value="leader">Leader</option>
                <option value="admin">Admin</option>
            </select>
            {(filterCountry || filterRole) && (
                <button 
                    onClick={() => { setFilterCountry(''); setFilterRole(''); setCurrentPage(1); }}
                    className="text-red-500 hover:text-red-700 text-sm underline"
                >
                    Clear Filters
                </button>
            )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'Add New Member'}</h3>
                    <button onClick={closeModal} className="text-white hover:text-gray-200">
                        <FaTimes size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                            value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    {!editingUser && (
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    )}
                    
                    {(user.role === 'admin' || (user.role === 'leader' && !editingUser)) && (
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                          <option value="member">Member</option>
                          <option value="leader">Leader</option>
                          {user.role === 'admin' && <option value="admin">Admin</option>}
                            </select>
                        </div>
                    )}
                    
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input 
                            type="text" 
                            required 
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${user.role === 'leader' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData.country} 
                            onChange={e => setFormData({...formData, country: e.target.value})}
                            readOnly={user.role === 'leader'}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                            value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                    </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded border">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-medium shadow-md">
                        {editingUser ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
        )}
        
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 overflow-hidden">
                                {member.profile_image ? (
                                    <img 
                                        src={`${API_URL}/${member.profile_image}`}
                                        alt="Profile" 
                                        className="h-full w-full object-cover"
                                        key={member.id}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.textContent = member.fullname.charAt(0);
                                        }}
                                    />
                                ) : (
                                    member.fullname.charAt(0)
                                )}
                            </div>
                            {member.fullname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'admin' ? 'bg-red-100 text-red-800' :
                            member.role === 'leader' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {(user.role === 'admin' || (user.role === 'leader' && member.role === 'member')) && (
                            <div className="flex gap-3">
                                <button onClick={() => startEdit(member)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                    <FaTrash />
                                </button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {currentMembers.map((member) => (
                    <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                    {member.profile_image ? (
                                        <img 
                                            src={`${API_URL}/${member.profile_image}`}
                                            alt="Profile" 
                                            className="h-full w-full object-cover"
                                            key={member.id}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.textContent = member.fullname.charAt(0);
                                            }}
                                        />
                                    ) : (
                                        member.fullname.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{member.fullname}</h3>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                member.role === 'admin' ? 'bg-red-100 text-red-800' :
                                member.role === 'leader' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {member.role}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Country:</span> {member.country}
                            </div>
                            {(user.role === 'admin' || (user.role === 'leader' && member.role === 'member')) && (
                                <div className="flex gap-3">
                                    <button onClick={() => startEdit(member)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
                <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                    <FaChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentPage === i + 1 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                    <FaChevronRight />
                </button>
            </div>
        )}
      </div>
    </>
  );
};

export default Members;

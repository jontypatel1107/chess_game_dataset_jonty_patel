import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Filter, Edit2, Trash2, UserX, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import userService from '../../services/userService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ search });
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userService.deleteUser(id);
        toast.success('User status updated successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Operation failed');
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      username: selectedUser?.username || '',
      email: selectedUser?.email || '',
      country: selectedUser?.country || '',
      rating: selectedUser?.rating || 1200,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      country: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedUser) {
          await userService.updateProfile(values); 
          toast.success('User updated successfully');
        } else {
          toast.info('Create user logic would go here');
        }
        setIsModalOpen(false);
        fetchUsers();
      } catch (error) {
        toast.error(error.message || 'Action failed');
      }
    },
  });

  const columns = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {row.username ? row.username[0].toUpperCase() : '?'}
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{row.username}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.rating}</span>
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => { setSelectedUser(row); setIsModalOpen(true); }}
            className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            {row.isActive ? <UserX size={16} title="Deactivate" /> : <UserCheck size={16} title="Activate" />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Users | Chess Analytics Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">User Directory</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage and monitor all platform participants.</p>
        </div>
        <Button icon={Plus} onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}>
          Add Member
        </Button>
      </div>

      <Card className="!p-0 border-none shadow-lg shadow-gray-200/50 dark:shadow-none">
        <div className="p-4 border-b dark:border-gray-800 flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or email..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-600 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" icon={Filter} className="!rounded-xl font-bold">Advanced</Button>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={users} 
          loading={loading}
          emptyMessage="No users found."
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        title={selectedUser ? "Update User Profile" : "Onboard New User"}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <Input 
            label="Username" 
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.username}
            touched={formik.touched.username}
            required 
          />
          <Input 
            label="Email Address" 
            name="email"
            type="email" 
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Country" 
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.country}
              touched={formik.touched.country}
              required
            />
            <Input 
              label="Elo Rating" 
              name="rating"
              type="number" 
              value={formik.values.rating}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t dark:border-gray-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button type="submit" isLoading={formik.isSubmitting}>
              {selectedUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

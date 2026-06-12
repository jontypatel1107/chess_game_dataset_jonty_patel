import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Globe, Shield, Calendar, Award, Edit3, Save } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import userService from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      country: user?.country || '',
      avatar: user?.avatar || '',
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3).required('Required'),
      email: Yup.string().email().required('Required'),
      country: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await userService.updateProfile(values);
        dispatch(updateUser(response.data));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } catch (error) {
        toast.error(error.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>My Profile | Chess Analytics</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        {!isEditing ? (
          <Button icon={Edit3} onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button icon={Save} isLoading={loading} onClick={formik.handleSubmit}>Save</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-black mb-4 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.[0].toUpperCase()
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Edit3 className="text-white" size={24} />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
            <p className="text-sm text-gray-500 mb-6">{user?.role === 'admin' ? 'Administrator' : 'Chess Player'}</p>
            
            <div className="w-full grid grid-cols-2 gap-4 border-t pt-6 dark:border-gray-800">
              <div className="text-center">
                <p className="text-lg font-black text-primary">{user?.rating || 1200}</p>
                <p className="text-[10px] uppercase font-bold text-gray-400">Current Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-secondary">{user?.gamesPlayed || 0}</p>
                <p className="text-[10px] uppercase font-bold text-gray-400">Games Played</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Personal Information" className="lg:col-span-2">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                name="username"
                icon={User}
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                error={formik.errors.username}
                touched={formik.touched.username}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                error={formik.errors.email}
                touched={formik.touched.email}
              />
              <Input
                label="Country"
                name="country"
                icon={Globe}
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                error={formik.errors.country}
                touched={formik.touched.country}
              />
               <Input
                label="Avatar URL"
                name="avatar"
                placeholder="https://example.com/photo.jpg"
                value={formik.values.avatar}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
              />
            </div>
          </form>
          
          <div className="mt-8 border-t pt-6 dark:border-gray-800">
             <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 flex items-center gap-2">
               <Shield size={16} /> Account Details
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Account ID</span>
                   <span className="font-mono text-gray-900 dark:text-white">{user?._id}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Member Since</span>
                   <span className="text-gray-900 dark:text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Last Active</span>
                   <span className="text-gray-900 dark:text-white">{new Date(user?.updatedAt).toLocaleTimeString()}</span>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

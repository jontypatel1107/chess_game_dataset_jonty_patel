import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Mail, Lock, User, UserPlus, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3, 'Minimum 3 characters').required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
      country: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      dispatch(loginStart());
      try {
        const { confirmPassword, ...registerData } = values;
        const data = await authService.register(registerData);
        dispatch(loginSuccess({ user: data.data.user, token: data.data.token }));
        toast.success('Registration successful!');
        navigate('/');
      } catch (error) {
        dispatch(loginFailure(error.message));
        toast.error(error.message || 'Registration failed');
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <Helmet>
        <title>Register | Chess Analytics Dashboard</title>
        <meta name="description" content="Create an account to start tracking your chess progress and analyze games." />
      </Helmet>
      
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-2xl font-bold">
            C
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join the community of chess enthusiasts
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={formik.handleSubmit}>
          <Input
            label="Username"
            name="username"
            placeholder="johndoe"
            icon={User}
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
            placeholder="john@example.com"
            icon={Mail}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
            required
          />

          <Input
            label="Country"
            name="country"
            placeholder="e.g. United States"
            icon={Globe}
            value={formik.values.country}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.country}
            touched={formik.touched.country}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              required
            />

            <Input
              label="Confirm"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              icon={UserPlus}
            >
              Sign Up
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

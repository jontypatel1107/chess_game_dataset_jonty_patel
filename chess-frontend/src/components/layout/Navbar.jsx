import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Bell, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { toggleTheme, setSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(setSidebar(!sidebarOpen))}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="hidden text-xl font-bold text-primary dark:text-white md:block">
          Chess Analytics
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-600" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </button>

        <button className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="ml-2 flex items-center gap-3 border-l pl-4 dark:border-gray-800">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role || 'Player'}
            </p>
          </div>
          <div className="group relative">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <UserIcon className="h-6 w-6" />
              )}
            </button>
            <div className="invisible absolute right-0 mt-2 w-48 scale-95 rounded-lg border bg-white p-2 shadow-lg transition-all duration-200 group-focus-within:visible group-focus-within:scale-100 dark:border-gray-800 dark:bg-gray-900">
              <button 
                onClick={() => navigate('/profile')}
                className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

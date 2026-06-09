import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  BarChart3, 
  UserCircle, 
  Settings,
  ChevronLeft
} from 'lucide-react';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'User Management', icon: Users, path: '/users', adminOnly: true },
    { name: 'Data Listing', icon: Database, path: '/data' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  const filteredItems = menuItems.filter(
    item => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen bg-white transition-all duration-300 border-r dark:bg-gray-900 dark:border-gray-800 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b dark:border-gray-800">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-xl font-bold dark:text-white">ChessAPI</span>
        </div>
        {!sidebarOpen && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold mx-auto">
            C
          </div>
        )}
      </div>

      <nav className="mt-6 px-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              } ${!sidebarOpen && 'justify-center'}`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className={`${!sidebarOpen && 'hidden'} font-medium`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 w-full px-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            } ${!sidebarOpen && 'justify-center'}`
          }
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span className={`${!sidebarOpen && 'hidden'} font-medium`}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

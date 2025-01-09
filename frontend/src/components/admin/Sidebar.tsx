import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Settings, FileText } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 font-poppins text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <NavLink to="/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Users className="inline-block mr-2" size={20} />
          User Management
        </NavLink>
        <NavLink to="/admin/row-requests" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <FileText className="inline-block mr-2" size={20} />
          Row Requests
        </NavLink>
        <NavLink to="/admin/configuration" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Settings className="inline-block mr-2" size={20} />
          Configuration
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;


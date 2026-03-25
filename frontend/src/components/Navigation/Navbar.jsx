import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserCircleIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items based on 4 member functions
  const navItems = [
    {
      id: 'jobs',
      label: 'Browse Jobs',
      icon: MagnifyingGlassIcon,
      path: '/jobs',
      description: 'Search & match with jobs',
      member: 'Member 3'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: ClipboardDocumentListIcon,
      path: '/applications',
      description: 'Track your applications',
      member: 'Member 4'
    },
    {
      id: 'cv',
      label: 'CV Generator',
      icon: DocumentTextIcon,
      path: '/cv-generator',
      description: 'Create professional CVs',
      member: 'Member 3'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    // Add logout logic here
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CareerBridge
            </span>
          </Link>

          {/* Center - Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-all duration-200 group"
                  title={item.description}
                >
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* All Jobs Button */}
            <button
              onClick={() => handleNavigation('/job-listings')}
              className="flex items-center space-x-2 px-4 py-2 ml-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all duration-200 group"
            >
              <BuildingOfficeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">All Jobs</span>
            </button>
          </div>

          {/* Right side - User Profile & Mobile menu */}
          <div className="flex items-center space-x-2">
            {/* User Profile - Desktop */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center ring-2 ring-white shadow-md">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <ChevronDownIcon 
                  className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slideDown">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500 truncate">john.doe@example.com</p>
                  </div>
                  <button
                    onClick={() => {
                      handleNavigation('/profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-gray-200 animate-slideDown">
            {/* User Profile - Mobile */}
            <div className="px-4 py-3 border-b border-gray-200 mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center ring-2 ring-white shadow-md">
                  <span className="text-white font-semibold">JD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john.doe@example.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
              
              {/* All Jobs - Mobile */}
              <button
                onClick={() => handleNavigation('/job-listings')}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">All Jobs</p>
                  <p className="text-xs text-indigo-600">Browse all job opportunities</p>
                </div>
              </button>

              {/* Settings and Logout - Mobile */}
              <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Settings</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

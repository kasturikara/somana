import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser } from "../../../utils/auth";
import { useAuth } from "../../../context/AuthContext";

const DashboardPages = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = getUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecords: 0,
    lastSync: "Never",
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;

      // Fetch users count from SSO Clone
      const usersResponse = await fetch(`${API_URL}/sso-clone/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let totalUsers = 0;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.data?.length || 0;
      }

      // Fetch all tables to calculate total records
      const tables = [
        "departments",
        "divisions",
        "sections",
        "positions",
        "roles",
        "skills",
        "human-resources",
        "hr-skills",
      ];

      let totalRecords = totalUsers;

      for (const table of tables) {
        const response = await fetch(`${API_URL}/sso-clone/${table}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          totalRecords += data.data?.length || 0;
        }
      }

      setStats({
        totalUsers,
        totalRecords,
        lastSync: "Never", // TODO: Get from sync history API if available
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      {" "}
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">SOMANA Dashboard</a>
        </div>
        <div className="flex gap-2">
          <Link to="/sso-clone" className="btn btn-ghost btn-sm">
            📊 SSO Clone
          </Link>
          <Link to="/sso-services" className="btn btn-ghost btn-sm">
            🔐 SSO Services
          </Link>
          <Link to="/sync-sso" className="btn btn-ghost btn-sm">
            🔄 Sync
          </Link>
        </div>
        <div className="flex-none gap-2">
          {user && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>{" "}
              <ul
                tabIndex={0}
                className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span>{user.name}</span>
                </li>
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a onClick={handleLogout}>Logout</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto p-6">
        {" "}
        {/* Stats Cards  */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Total SSO Users</div>
            <div className="stat-value text-primary">
              {loading ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                stats.totalUsers.toLocaleString()
              )}
            </div>
            <div className="stat-desc">Users in SIKONFI database</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Cloned Records</div>
            <div className="stat-value text-secondary">
              {loading ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                stats.totalRecords.toLocaleString()
              )}
            </div>
            <div className="stat-desc">Local database records</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Last Sync</div>
            <div className="stat-value text-accent text-2xl">
              {loading ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                stats.lastSync
              )}
            </div>
            <div className="stat-desc">Click Sync to update data</div>
          </div>
        </div>
        {/* User Info Card */}
        {user && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                User Information
              </h2>
              <div className="divider"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-60">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm opacity-60">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm opacity-60">Role</p>
                  <div className="badge badge-primary badge-lg mt-1">
                    {user.role}
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-60">Department</p>
                  <p className="font-semibold">{user.department || "N/A"}</p>
                </div>
                {user.nip && (
                  <div>
                    <p className="text-sm opacity-60">NIP</p>
                    <p className="font-semibold">{user.nip}</p>
                  </div>
                )}
                {user.phone_number && (
                  <div>
                    <p className="text-sm opacity-60">Phone</p>
                    <p className="font-semibold">{user.phone_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="card bg-success text-success-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => navigate("/sso-clone")}
          >
            <div className="card-body">
              <h2 className="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
                SSO Clone
              </h2>
              <p>View local database clone from SIKONFI</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View Data</button>
              </div>
            </div>
          </div>

          <div
            className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => navigate("/sso-services")}
          >
            <div className="card-body">
              <h2 className="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                SSO Services
              </h2>
              <p>Access SSO Database directly (read-only)</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View Services</button>
              </div>
            </div>
          </div>

          <div
            className="card bg-info text-info-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => navigate("/sync-sso")}
          >
            <div className="card-body">
              <h2 className="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Sync SSO
              </h2>
              <p>Synchronize SSO data to main database</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">Sync Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPages;

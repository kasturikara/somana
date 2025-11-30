import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/auth";
import { useAuth } from "../../../context/AuthContext";

const DashboardPages = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">SOMANA Dashboard</a>
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
        {/* Stats Cards */}
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">21% more than last month</div>
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Active Sessions</div>
            <div className="stat-value text-secondary">2.6K</div>
            <div className="stat-desc">↗︎ 400 (22%)</div>
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Tasks</div>
            <div className="stat-value text-accent">1.2K</div>
            <div className="stat-desc">↘︎ 90 (14%)</div>
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
          <div className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">Configuration Items</h2>
              <p>Manage your IT assets and configurations</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View</button>
              </div>
            </div>
          </div>

          <div className="card bg-secondary text-secondary-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">Change Requests</h2>
              <p>Submit and track change requests</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View</button>
              </div>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">Patch Management</h2>
              <p>Monitor patch jobs and updates</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPages;

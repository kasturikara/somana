import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { getUser } from "../../../../utils/auth";
import axios from "axios";

const SSOServicesPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = getUser();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("department");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const tables = [
    {
      id: "department",
      name: "Departments",
      icon: "🏢",
      endpoint: "department",
      columns: ["department_id", "department_name"],
    },
    {
      id: "division",
      name: "Divisions",
      icon: "📊",
      endpoint: "division",
      columns: ["division_id", "division_name", "department_id"],
    },
    {
      id: "section",
      name: "Sections",
      icon: "📁",
      endpoint: "section",
      columns: ["section_id", "section_name", "division_id"],
    },
    {
      id: "position",
      name: "Positions",
      icon: "💼",
      endpoint: "position",
      columns: ["position_id", "position_name"],
    },
    {
      id: "role",
      name: "Roles",
      icon: "🎭",
      endpoint: "role",
      columns: ["role_id", "role_name"],
    },
    {
      id: "skill",
      name: "Skills",
      icon: "⚡",
      endpoint: "skill",
      columns: ["skill_id", "skill_name"],
    },
    {
      id: "human_resources",
      name: "Human Resources",
      icon: "👥",
      endpoint: "human-resources",
      columns: [
        "hr_id",
        "nip",
        "name",
        "phone_number",
        "address",
        "department_id",
        "division_id",
        "section_id",
        "position_id",
        "spv_id",
      ],
    },
    {
      id: "hr_skill",
      name: "HR Skills",
      icon: "🎓",
      endpoint: "hr-skill",
      columns: ["hr_id", "skill_id", "certificate_file"],
    },
    {
      id: "user",
      name: "Users",
      icon: "👤",
      endpoint: "user",
      columns: [
        "user_id",
        "name",
        "role_id",
        "hr_id",
        "created_at",
        "updated_at",
        "created_by",
        "image",
      ],
    },
  ];

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tableName) => {
    setLoading(true);
    try {
      const table = tables.find((t) => t.id === tableName);
      const response = await axios.get(
        `${apiUrl}/special/sso/${table.endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`Fetched data for ${tableName}:`, response.data);

      if (response.data?.data) {
        setData(response.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsPromises = tables.map(async (table) => {
        try {
          const response = await axios.get(
            `${apiUrl}/special/sso/${table.endpoint}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return {
            table: table.id,
            count: response.data?.data?.length || 0,
          };
        } catch (error) {
          console.error(`Error fetching stats for ${table.id}:`, error);
          return { table: table.id, count: 0 };
        }
      });

      const results = await Promise.all(statsPromises);
      const statsObj = results.reduce((acc, { table, count }) => {
        acc[table] = count;
        return acc;
      }, {});

      setStats(statsObj);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshData = () => {
    fetchData(activeTab);
    fetchStats();
  };

  const renderTableHeader = (columns) => {
    return (
      <thead>
        <tr className="bg-base-200">
          <th className="w-16">#</th>
          {columns.map((col) => (
            <th key={col} className="capitalize">
              {col.replace(/_/g, " ")}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableBody = (columns) => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + 1} className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-2">Loading data...</p>
            </td>
          </tr>
        </tbody>
      );
    }

    if (!data || data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + 1} className="text-center py-8">
              <div className="text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>No data available</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="hover">
            <td>{index + 1}</td>
            {columns.map((col) => (
              <td key={col}>
                {row[col] !== null && row[col] !== undefined
                  ? String(row[col])
                  : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-xl">
            🔐 SSO Services Database
          </Link>
        </div>
        <div className="flex gap-2">
          <Link to="/sso-clone" className="btn btn-ghost btn-sm">
            📊 SSO Clone
          </Link>
          <Link to="/sso-services" className="btn btn-ghost btn-sm btn-active">
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
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span>{user.name}</span>
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
        {/* Info Alert */}
        <div className="alert alert-info mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">SSO Services Database (Read-Only)</h3>
            <div className="text-xs">
              Viewing data directly from SSO Database. This is read-only access
              for non-admin users.
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
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
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Total Tables</div>
              <div className="stat-value text-primary">{tables.length}</div>
              <div className="stat-desc">SSO Database tables</div>
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
              <div className="stat-title">Total Records</div>
              <div className="stat-value text-secondary">
                {Object.values(stats).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="stat-desc">Across all tables</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <div className="avatar online">
                  <div className="w-16 rounded-full">
                    <div className="bg-accent text-accent-content rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl">🔐</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stat-title">SSO Database</div>
              <div className="stat-value text-accent">Live</div>
              <div className="stat-desc text-accent">Connected</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {tables.find((t) => t.id === activeTab)?.icon}{" "}
            {tables.find((t) => t.id === activeTab)?.name}
          </h2>
          <div className="flex gap-2">
            <button onClick={refreshData} className="btn btn-sm btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link to="/sync-sso" className="btn btn-sm btn-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Go to Sync
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4 overflow-x-auto flex-nowrap">
          {tables.map((table) => (
            <a
              key={table.id}
              className={`tab ${
                activeTab === table.id ? "tab-active" : ""
              } whitespace-nowrap`}
              onClick={() => setActiveTab(table.id)}
            >
              {table.icon} {table.name}
              {stats && stats[table.id] !== undefined && (
                <span className="badge badge-sm ml-2">{stats[table.id]}</span>
              )}
            </a>
          ))}
        </div>

        {/* Table Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                {renderTableHeader(
                  tables.find((t) => t.id === activeTab)?.columns || []
                )}
                {renderTableBody(
                  tables.find((t) => t.id === activeTab)?.columns || []
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Data Count */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Showing {data.length} record{data.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default SSOServicesPage;

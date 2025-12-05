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
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, delete
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownOptions, setDropdownOptions] = useState({
    departments: [],
    divisions: [],
    sections: [],
    positions: [],
    roles: [],
    skills: [],
    humanResources: [],
  });

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
      formFields: [
        {
          name: "department_name",
          label: "Department Name",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "division",
      name: "Divisions",
      icon: "📊",
      endpoint: "division",
      columns: ["division_id", "division_name", "department_id"],
      formFields: [
        {
          name: "division_name",
          label: "Division Name",
          type: "text",
          required: true,
        },
        {
          name: "department_id",
          label: "Department",
          type: "select",
          required: true,
          options: "departments",
          displayKey: "department_name",
          valueKey: "department_id",
        },
      ],
    },
    {
      id: "section",
      name: "Sections",
      icon: "📁",
      endpoint: "section",
      columns: ["section_id", "section_name", "division_id"],
      formFields: [
        {
          name: "section_name",
          label: "Section Name",
          type: "text",
          required: true,
        },
        {
          name: "division_id",
          label: "Division",
          type: "select",
          required: true,
          options: "divisions",
          displayKey: "division_name",
          valueKey: "division_id",
        },
      ],
    },
    {
      id: "position",
      name: "Positions",
      icon: "💼",
      endpoint: "position",
      columns: ["position_id", "position_name"],
      formFields: [
        {
          name: "position_name",
          label: "Position Name",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "role",
      name: "Roles",
      icon: "🎭",
      endpoint: "role",
      columns: ["role_id", "role_name"],
      formFields: [
        { name: "role_name", label: "Role Name", type: "text", required: true },
      ],
    },
    {
      id: "skill",
      name: "Skills",
      icon: "⚡",
      endpoint: "skill",
      columns: ["skill_id", "skill_name"],
      formFields: [
        {
          name: "skill_name",
          label: "Skill Name",
          type: "text",
          required: true,
        },
      ],
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
      formFields: [
        { name: "nip", label: "NIP", type: "text", required: true },
        { name: "name", label: "Name", type: "text", required: true },
        { name: "phone_number", label: "Phone Number", type: "text" },
        { name: "address", label: "Address", type: "textarea" },
        {
          name: "department_id",
          label: "Department",
          type: "select",
          options: "departments",
          displayKey: "department_name",
          valueKey: "department_id",
        },
        {
          name: "division_id",
          label: "Division",
          type: "select",
          options: "divisions",
          displayKey: "division_name",
          valueKey: "division_id",
        },
        {
          name: "section_id",
          label: "Section",
          type: "select",
          options: "sections",
          displayKey: "section_name",
          valueKey: "section_id",
        },
        {
          name: "position_id",
          label: "Position",
          type: "select",
          options: "positions",
          displayKey: "position_name",
          valueKey: "position_id",
        },
        {
          name: "spv_id",
          label: "Supervisor",
          type: "select",
          options: "humanResources",
          displayKey: "name",
          valueKey: "hr_id",
        },
      ],
    },
    {
      id: "hr_skill",
      name: "HR Skills",
      icon: "🎓",
      endpoint: "hr-skill",
      columns: [
        "hr_id",
        "hr_name",
        "skill_id",
        "skill_name",
        "certificate_file",
      ],
      displayColumns: {
        hr_id: "HR ID",
        hr_name: "Employee Name",
        skill_id: "Skill ID",
        skill_name: "Skill Name",
        certificate_file: "Certificate",
      },
      formFields: [
        {
          name: "hr_id",
          label: "Employee",
          type: "select",
          required: true,
          options: "humanResources",
          displayKey: "name",
          valueKey: "hr_id",
        },
        {
          name: "skill_id",
          label: "Skill",
          type: "select",
          required: true,
          options: "skills",
          displayKey: "skill_name",
          valueKey: "skill_id",
        },
        { name: "certificate_file", label: "Certificate File", type: "text" },
      ],
    },
    {
      id: "user",
      name: "Users",
      icon: "👤",
      endpoint: "user",
      columns: ["user_id", "name", "email", "role_id", "hr_id"],
      formFields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "password",
          label: "Password",
          type: "password",
          required: true,
          createOnly: true,
        },
        {
          name: "role_id",
          label: "Role",
          type: "select",
          required: true,
          options: "roles",
          displayKey: "role_name",
          valueKey: "role_id",
        },
        {
          name: "hr_id",
          label: "HR Profile",
          type: "select",
          options: "humanResources",
          displayKey: "name",
          valueKey: "hr_id",
        },
      ],
    },
  ];
  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    setLoadingDropdowns(true);
    try {
      const [
        departmentsRes,
        divisionsRes,
        sectionsRes,
        positionsRes,
        rolesRes,
        skillsRes,
        hrRes,
      ] = await Promise.all([
        axios.get(`${apiUrl}/special/sso/department`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/division`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/section`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/position`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/role`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/skill`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/special/sso/human-resources`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDropdownOptions({
        departments: departmentsRes.data?.data || [],
        divisions: divisionsRes.data?.data || [],
        sections: sectionsRes.data?.data || [],
        positions: positionsRes.data?.data || [],
        roles: rolesRes.data?.data || [],
        skills: skillsRes.data?.data || [],
        humanResources: hrRes.data?.data || [],
      });

      console.log("✅ Dropdown options loaded successfully");
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

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

      console.log(`Fetched ${tableName}:`, response.data);

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
          console.error(`Error fetching ${table.id} stats:`, error);
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
    fetchDropdownOptions();
  }, []);

  const refreshData = () => {
    fetchData(activeTab);
    fetchStats();
  }; // Modal handlers
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setModalMode("delete");
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const table = tables.find((t) => t.id === activeTab);

      if (modalMode === "create") {
        await axios.post(`${apiUrl}/special/sso/${table.endpoint}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        alert(
          "✅ Data berhasil ditambahkan!\n\n⚠️ Note: Data akan otomatis ter-sync ke Clone DB"
        );
      } else if (modalMode === "edit") {
        const idField = table.columns[0]; // First column is usually ID
        const id = selectedItem[idField];
        await axios.put(
          `${apiUrl}/special/sso/${table.endpoint}/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        alert(
          "✅ Data berhasil diupdate!\n\n⚠️ Note: Data akan otomatis ter-sync ke Clone DB"
        );
      } else if (modalMode === "delete") {
        const idField = table.columns[0];
        const id = selectedItem[idField];
        await axios.delete(`${apiUrl}/special/sso/${table.endpoint}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert(
          "✅ Data berhasil dihapus!\n\n⚠️ Note: Data akan otomatis ter-sync ke Clone DB"
        );
      }

      closeModal();
      refreshData();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  const renderTableHeader = (columns) => {
    const displayColumns = currentTable?.displayColumns || {};
    return (
      <thead>
        <tr className="bg-base-200">
          <th className="w-16">#</th>
          {columns.map((col) => (
            <th key={col} className="capitalize">
              {displayColumns[col] || col.replace(/_/g, " ")}
            </th>
          ))}
          <th className="w-32">Actions</th>
        </tr>
      </thead>
    );
  };

  const renderTableBody = (columns) => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + 2} className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </td>
          </tr>
        </tbody>
      );
    }

    if (!data || data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + 2} className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-base-content/30"
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
                <p className="text-base-content/60">No data available</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="hover">
            <td>{index + 1}</td>
            {columns.map((col) => {
              let value = item[col];

              // Handle relational data for HR Skills table
              if (currentTable?.id === "hr_skill") {
                if (col === "hr_name" && item.hr) {
                  value = item.hr.name;
                } else if (col === "skill_name" && item.skill) {
                  value = item.skill.skill_name;
                }
              }

              return (
                <td key={col} className="max-w-xs truncate">
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value !== null && value !== undefined
                    ? String(value)
                    : "-"}
                </td>
              );
            })}
            <td>
              <div className="flex gap-1">
                <button
                  className="btn btn-ghost btn-xs text-info"
                  onClick={() => openEditModal(item)}
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => openDeleteModal(item)}
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  const currentTable = tables.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-xl">
            🔐 SSO Services (Direct Access)
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
                className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
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
        {/* Warning Alert */}
        <div className="alert alert-warning mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Direct SSO Database Access!</h3>
            <div className="text-xs">
              ⚠️ Any changes made here will directly modify the SSO Database and
              automatically sync to Clone DB.
              <br />
              🔐 Admin-only operations: Create, Update, Delete
            </div>
          </div>
        </div>{" "}
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {tables.slice(0, 5).map((table) => (
              <div
                key={table.id}
                className="stat bg-base-100 shadow rounded-lg"
              >
                <div className="stat-figure text-2xl">{table.icon}</div>
                <div className="stat-title text-xs">{table.name}</div>
                <div className="stat-value text-primary text-2xl">
                  {stats[table.id] || 0}
                </div>
              </div>
            ))}
            {loadingDropdowns && (
              <div className="stat bg-base-100 shadow rounded-lg border-2 border-warning">
                <div className="stat-figure">
                  <span className="loading loading-spinner loading-md text-warning"></span>
                </div>
                <div className="stat-title text-xs">Dropdown Options</div>
                <div className="stat-desc text-warning">Loading...</div>
              </div>
            )}
          </div>
        )}
        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 p-2 mb-6 overflow-x-auto">
          {tables.map((table) => (
            <a
              key={table.id}
              className={`tab ${activeTab === table.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(table.id)}
            >
              <span className="mr-2">{table.icon}</span>
              {table.name}
              {stats && stats[table.id] !== undefined && (
                <span className="badge badge-sm ml-2">{stats[table.id]}</span>
              )}
            </a>
          ))}
        </div>
        {/* Data Table Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="text-3xl mr-2">{currentTable?.icon}</span>
                {currentTable?.name}
              </h2>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Refresh
                </button>{" "}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={openCreateModal}
                  disabled={loadingDropdowns}
                >
                  {loadingDropdowns ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Add New
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                {renderTableHeader(currentTable?.columns || [])}
                {renderTableBody(currentTable?.columns || [])}
              </table>
            </div>

            {/* Footer */}
            <div className="text-sm text-base-content/60 mt-4">
              Total: <span className="font-semibold">{data.length}</span>{" "}
              records
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={closeModal}
                disabled={submitting}
              >
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">
              {modalMode === "create" && `➕ Add New ${currentTable?.name}`}
              {modalMode === "edit" && `✏️ Edit ${currentTable?.name}`}
              {modalMode === "delete" && `🗑️ Delete ${currentTable?.name}`}
            </h3>

            {modalMode === "delete" ? (
              <div>
                <div className="alert alert-error mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Are you sure you want to delete this record? This action
                    cannot be undone!
                  </span>
                </div>
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedItem, null, 2)}
                  </pre>
                </div>
                <div className="modal-action">
                  <button
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {currentTable?.formFields
                    ?.filter(
                      (field) => modalMode === "create" || !field.createOnly
                    )
                    .map((field) => (
                      <div key={field.name} className="form-control">
                        <label className="label">
                          <span className="label-text">
                            {field.label}
                            {field.required && (
                              <span className="text-error ml-1">*</span>
                            )}
                          </span>
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            className="textarea textarea-bordered"
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            required={field.required}
                            rows={3}
                          />
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            className="select select-bordered"
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            required={field.required}
                            disabled={loadingDropdowns}
                          >
                            <option value="">
                              {loadingDropdowns
                                ? "Loading options..."
                                : `-- Select ${field.label} --`}
                            </option>
                            {!loadingDropdowns &&
                              (() => {
                                const options =
                                  dropdownOptions[field.options] || [];
                                return options.map((option) => (
                                  <option
                                    key={option[field.valueKey]}
                                    value={option[field.valueKey]}
                                  >
                                    {option[field.displayKey]}
                                  </option>
                                ));
                              })()}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            className="input input-bordered"
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
};

export default SSOServicesPage;

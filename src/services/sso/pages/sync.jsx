import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getUser } from "../../../utils/auth";
import axios from "axios";

const SyncPages = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = getUser();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("department");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [syncResults, setSyncResults] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  // Helper function to get preview data (handles nested structure from backend)
  const getPreviewData = () => {
    return previewData?.data?.data || previewData?.data || {};
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  // Daftar tabel yang akan di-sync dari SSO ke My DB
  const tables = [
    {
      id: "department",
      name: "Department",
      icon: "🏢",
      apiPath: "department",
      clonePath: "departments",
      columns: ["department_id", "department_name"],
    },
    {
      id: "division",
      name: "Division",
      icon: "📊",
      apiPath: "division",
      clonePath: "divisions",
      columns: ["division_id", "division_name", "department_id"],
    },
    {
      id: "section",
      name: "Section",
      icon: "📁",
      apiPath: "section",
      clonePath: "sections",
      columns: ["section_id", "section_name", "division_id"],
    },
    {
      id: "position",
      name: "Position",
      icon: "💼",
      apiPath: "position",
      clonePath: "positions",
      columns: ["position_id", "position_name"],
    },
    {
      id: "role",
      name: "Role",
      icon: "🎭",
      apiPath: "role",
      clonePath: "roles",
      columns: ["role_id", "role_name"],
    },
    {
      id: "skill",
      name: "Skill",
      icon: "⚡",
      apiPath: "skill",
      clonePath: "skills",
      columns: ["skill_id", "skill_name"],
    },
    {
      id: "human_resources",
      name: "Human Resources",
      icon: "👥",
      apiPath: "hr",
      clonePath: "human-resources",
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
      apiPath: "hr-skill",
      clonePath: "hr-skills",
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
    },
    {
      id: "user",
      name: "Users",
      icon: "👤",
      apiPath: "user",
      clonePath: "users",
      columns: ["user_id", "name", "email", "role_id", "hr_id"],
    },
  ];

  const handleOpenSyncModal = async () => {
    setShowSyncModal(true);
    await loadPreviewData(activeTab);
  };

  const handleCloseSyncModal = () => {
    setShowSyncModal(false);
    setPreviewData(null);
    setSelectedItems({});
  };

  const loadPreviewData = async (tableName) => {
    setLoading(true);
    setPreviewData(null);
    setSelectedItems({});

    try {
      const table = tables.find((t) => t.id === tableName);
      const apiPath = table?.apiPath || tableName;
      const response = await axios.get(
        `${apiUrl}/sync/sso/${apiPath}/preview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Preview response:", response.data); // Debug log
      setPreviewData(response.data);

      // Initialize selected items (semua selected by default)
      const initialSelected = {};
      // Backend mengembalikan nested data: response.data.data.data
      const previewDataItems = response.data?.data?.data || response.data?.data;

      if (previewDataItems) {
        ["toInsert", "toUpdate", "toDelete"].forEach((action) => {
          if (previewDataItems[action]) {
            previewDataItems[action].forEach((item, index) => {
              initialSelected[`${action}_${index}`] = true;
            });
          }
        });
      }
      setSelectedItems(initialSelected);
    } catch (error) {
      console.error("Error loading preview:", error);
      setPreviewData({
        success: false,
        error: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSelectAll = (action) => {
    const newSelected = { ...selectedItems };
    const data = getPreviewData();
    const items = data[action] || [];
    const allSelected = items.every(
      (_, index) => selectedItems[`${action}_${index}`]
    );

    items.forEach((_, index) => {
      newSelected[`${action}_${index}`] = !allSelected;
    });

    setSelectedItems(newSelected);
  };

  const handleSelectItem = (action, index) => {
    setSelectedItems((prev) => ({
      ...prev,
      [`${action}_${index}`]: !prev[`${action}_${index}`],
    }));
  };
  const handleExecuteSync = async () => {
    const data = getPreviewData();
    if (!data) return;

    setSyncing(true);

    try {
      const table = tables.find((t) => t.id === activeTab);
      const apiPath = table?.apiPath || activeTab;

      // Filter hanya item yang dicentang
      // Backend expects: selectedInsert, selectedUpdate, selectedDelete
      const selectedData = {
        selectedInsert: [],
        selectedUpdate: [],
        selectedDelete: [],
      };

      // Map toInsert -> selectedInsert
      if (data.toInsert) {
        data.toInsert.forEach((item, index) => {
          if (selectedItems[`toInsert_${index}`]) {
            selectedData.selectedInsert.push(item);
          }
        });
      }

      // Map toUpdate -> selectedUpdate
      if (data.toUpdate) {
        data.toUpdate.forEach((item, index) => {
          if (selectedItems[`toUpdate_${index}`]) {
            selectedData.selectedUpdate.push(item);
          }
        });
      }

      // Map toDelete -> selectedDelete
      if (data.toDelete) {
        data.toDelete.forEach((item, index) => {
          if (selectedItems[`toDelete_${index}`]) {
            selectedData.selectedDelete.push(item);
          }
        });
      }

      console.log("Sending sync data:", selectedData); // Debug log

      const response = await axios.post(
        `${apiUrl}/sync/sso/${apiPath}/execute`,
        selectedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSyncResults((prev) => ({
        ...prev,
        [activeTab]: {
          success: true,
          ...response.data,
          timestamp: new Date().toISOString(),
        },
      }));

      // Close modal
      handleCloseSyncModal();

      // Show success notification
      alert(
        `Sync berhasil!\nInserted: ${response.data.inserted || 0}\nUpdated: ${
          response.data.updated || 0
        }\nDeleted: ${response.data.deleted || 0}`
      );
    } catch (error) {
      console.error("Error executing sync:", error);
      setSyncResults((prev) => ({
        ...prev,
        [activeTab]: {
          success: false,
          error: error.response?.data?.message || error.message,
          timestamp: new Date().toISOString(),
        },
      }));
      alert(`Sync gagal: ${error.response?.data?.message || error.message}`);
    } finally {
      setSyncing(false);
    }
  };
  const getSelectedCount = (action) => {
    const data = getPreviewData();
    if (!data[action]) return 0;
    return data[action].filter(
      (_, index) => selectedItems[`${action}_${index}`]
    ).length;
  };

  const getTotalSelectedCount = () => {
    return (
      getSelectedCount("toInsert") +
      getSelectedCount("toUpdate") +
      getSelectedCount("toDelete")
    );
  };

  const renderDataComparison = (action, item, index) => {
    const table = tables.find((t) => t.id === activeTab);
    const columns = table?.columns || [];

    return (
      <tr
        key={index}
        className={selectedItems[`${action}_${index}`] ? "bg-opacity-10" : ""}
      >
        <td>
          <input
            type="checkbox"
            className={`checkbox checkbox-sm ${
              action === "toInsert"
                ? "checkbox-success"
                : action === "toUpdate"
                ? "checkbox-warning"
                : "checkbox-error"
            }`}
            checked={selectedItems[`${action}_${index}`] || false}
            onChange={() => handleSelectItem(action, index)}
          />
        </td>
        {columns.map((col) => (
          <td key={col}>
            {action === "toUpdate" && item.old && item.new ? (
              <div className="flex flex-col gap-1">
                <div className="text-error line-through text-xs">
                  {item.old[col] !== null && item.old[col] !== undefined
                    ? String(item.old[col])
                    : "-"}
                </div>
                <div className="text-success text-sm font-semibold">
                  {item.new[col] !== null && item.new[col] !== undefined
                    ? String(item.new[col])
                    : "-"}
                </div>
              </div>
            ) : typeof item[col] === "object" && item[col] !== null ? (
              JSON.stringify(item[col])
            ) : item[col] !== null && item[col] !== undefined ? (
              String(item[col])
            ) : (
              "-"
            )}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {" "}
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-xl">
            🔄 SSO Synchronization
          </Link>
        </div>
        <div className="flex gap-2">
          <Link to="/sso-clone" className="btn btn-ghost btn-sm">
            📊 SSO Clone
          </Link>
          <Link to="/sso-services" className="btn btn-ghost btn-sm">
            🔐 SSO Services
          </Link>
          <Link to="/sync-sso" className="btn btn-ghost btn-sm btn-active">
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
                  <a onClick={handleLogout}>Logout</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>{" "}
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
            <h3 className="font-bold">SSO Synchronization</h3>
            <div className="text-xs">
              Sync data from SSO Database to your local SSO Clone. Preview
              changes before applying.
            </div>
          </div>
        </div>

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
            </a>
          ))}
        </div>

        {/* Sync Actions Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="card-title text-2xl">
                  <span className="text-3xl mr-2">
                    {tables.find((t) => t.id === activeTab)?.icon}
                  </span>
                  {tables.find((t) => t.id === activeTab)?.name} Synchronization
                </h2>
                <p className="text-sm text-base-content/60 mt-1">
                  Sync from SSO Database to SSO Clone
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/sso-clone" className="btn btn-outline btn-sm">
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
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                  View SSO Clone
                </Link>
                <Link to="/sso-services" className="btn btn-outline btn-sm">
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
                      d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
                    />
                  </svg>
                  View SSO Services
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenSyncModal}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                  Preview & Sync
                </button>
              </div>
            </div>

            {/* Last Sync Info */}
            {syncResults[activeTab] && (
              <div className="mb-4">
                {syncResults[activeTab].success ? (
                  <div className="alert alert-success">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-bold">Last Sync Successful!</h3>
                      <div className="text-xs">
                        {new Date(
                          syncResults[activeTab].timestamp
                        ).toLocaleString()}{" "}
                        - {syncResults[activeTab].inserted || 0} inserted,{" "}
                        {syncResults[activeTab].updated || 0} updated,{" "}
                        {syncResults[activeTab].deleted || 0} deleted
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-error">
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
                      Last sync failed: {syncResults[activeTab].error}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-bold mb-2">How to Sync:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Select the table you want to sync from the tabs above</li>
                <li>Click "Preview & Sync" to see what changes will be made</li>
                <li>Review the changes (new records, updates, deletions)</li>
                <li>Select which changes you want to apply</li>
                <li>Click "Execute Sync" to apply selected changes</li>
              </ol>{" "}
            </div>
          </div>
        </div>
      </div>
      {/* Sync Modal */}
      {showSyncModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-7xl w-11/12 max-h-[90vh]">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={handleCloseSyncModal}
                disabled={syncing}
              >
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-2">
              <span className="text-2xl mr-2">
                {tables.find((t) => t.id === activeTab)?.icon}
              </span>
              Sync Preview - {tables.find((t) => t.id === activeTab)?.name}
            </h3>
            <p className="text-sm text-base-content/60 mb-6">
              Compare and select data changes to sync from SSO Database
            </p>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {/* Preview Data */}
            {!loading && previewData && (
              <>
                {previewData.success === false ? (
                  <div className="alert alert-error">
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
                    <span>{previewData.error}</span>
                  </div>
                ) : (
                  <>
                    {/* Statistics */}
                    <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
                      <div className="stat">
                        <div className="stat-figure text-success">
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                        </div>{" "}
                        <div className="stat-title">To Insert</div>
                        <div className="stat-value text-success">
                          {getSelectedCount("toInsert")} /{" "}
                          {getPreviewData().toInsert?.length || 0}
                        </div>
                        <div className="stat-desc">New records from SSO</div>
                      </div>

                      <div className="stat">
                        <div className="stat-figure text-warning">
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            ></path>
                          </svg>
                        </div>
                        <div className="stat-title">To Update</div>
                        <div className="stat-value text-warning">
                          {getSelectedCount("toUpdate")} /{" "}
                          {getPreviewData().toUpdate?.length || 0}
                        </div>
                        <div className="stat-desc">Modified in SSO</div>
                      </div>

                      <div className="stat">
                        <div className="stat-figure text-error">
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
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </div>
                        <div className="stat-title">To Delete</div>
                        <div className="stat-value text-error">
                          {getSelectedCount("toDelete")} /{" "}
                          {getPreviewData().toDelete?.length || 0}
                        </div>
                        <div className="stat-desc">Not in SSO</div>
                      </div>
                    </div>{" "}
                    {/* Data Tables */}
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {/* To Insert */}
                      {getPreviewData().toInsert &&
                        getPreviewData().toInsert.length > 0 && (
                          <div className="card bg-success/10 border border-success/20">
                            <div className="card-body p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-success text-sm">
                                  ➕ Records to Insert (
                                  {getPreviewData().toInsert.length})
                                </h3>
                                <label className="label cursor-pointer gap-2">
                                  <span className="label-text text-xs">
                                    Select All
                                  </span>
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-success checkbox-sm"
                                    checked={getPreviewData().toInsert.every(
                                      (_, i) => selectedItems[`toInsert_${i}`]
                                    )}
                                    onChange={() => handleSelectAll("toInsert")}
                                  />
                                </label>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="table table-xs">
                                  <thead>
                                    <tr>
                                      <th className="w-8"></th>
                                      {tables
                                        .find((t) => t.id === activeTab)
                                        ?.columns.map((col) => (
                                          <th
                                            key={col}
                                            className="capitalize text-xs"
                                          >
                                            {col.replace(/_/g, " ")}
                                          </th>
                                        ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getPreviewData().toInsert.map(
                                      (item, index) =>
                                        renderDataComparison(
                                          "toInsert",
                                          item,
                                          index
                                        )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}{" "}
                      {/* To Update */}
                      {getPreviewData().toUpdate &&
                        getPreviewData().toUpdate.length > 0 && (
                          <div className="card bg-warning/10 border border-warning/20">
                            <div className="card-body p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-warning text-sm">
                                  🔄 Records to Update (
                                  {getPreviewData().toUpdate.length})
                                </h3>
                                <label className="label cursor-pointer gap-2">
                                  <span className="label-text text-xs">
                                    Select All
                                  </span>
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-warning checkbox-sm"
                                    checked={getPreviewData().toUpdate.every(
                                      (_, i) => selectedItems[`toUpdate_${i}`]
                                    )}
                                    onChange={() => handleSelectAll("toUpdate")}
                                  />
                                </label>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="table table-xs">
                                  <thead>
                                    <tr>
                                      <th className="w-8"></th>
                                      {tables
                                        .find((t) => t.id === activeTab)
                                        ?.columns.map((col) => (
                                          <th
                                            key={col}
                                            className="capitalize text-xs"
                                          >
                                            {col.replace(/_/g, " ")}
                                          </th>
                                        ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getPreviewData().toUpdate.map(
                                      (item, index) =>
                                        renderDataComparison(
                                          "toUpdate",
                                          item,
                                          index
                                        )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-2 text-xs text-base-content/60">
                                <span className="text-error">■ Old value</span>{" "}
                                →{" "}
                                <span className="text-success font-semibold">
                                  ■ New value
                                </span>
                              </div>
                            </div>
                          </div>
                        )}{" "}
                      {/* To Delete */}
                      {getPreviewData().toDelete &&
                        getPreviewData().toDelete.length > 0 && (
                          <div className="card bg-error/10 border border-error/20">
                            <div className="card-body p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-error text-sm">
                                  🗑️ Records to Delete (
                                  {getPreviewData().toDelete.length})
                                </h3>
                                <label className="label cursor-pointer gap-2">
                                  <span className="label-text text-xs">
                                    Select All
                                  </span>
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-error checkbox-sm"
                                    checked={getPreviewData().toDelete.every(
                                      (_, i) => selectedItems[`toDelete_${i}`]
                                    )}
                                    onChange={() => handleSelectAll("toDelete")}
                                  />
                                </label>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="table table-xs">
                                  <thead>
                                    <tr>
                                      <th className="w-8"></th>
                                      {tables
                                        .find((t) => t.id === activeTab)
                                        ?.columns.map((col) => (
                                          <th
                                            key={col}
                                            className="capitalize text-xs"
                                          >
                                            {col.replace(/_/g, " ")}
                                          </th>
                                        ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getPreviewData().toDelete.map(
                                      (item, index) =>
                                        renderDataComparison(
                                          "toDelete",
                                          item,
                                          index
                                        )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      {/* No Changes */}
                      {(!getPreviewData().toInsert ||
                        getPreviewData().toInsert.length === 0) &&
                        (!getPreviewData().toUpdate ||
                          getPreviewData().toUpdate.length === 0) &&
                        (!getPreviewData().toDelete ||
                          getPreviewData().toDelete.length === 0) && (
                          <div className="alert">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="stroke-info shrink-0 w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            <span>
                              No changes detected. All data is already
                              synchronized!
                            </span>
                          </div>
                        )}
                    </div>
                    {/* Modal Actions */}
                    <div className="modal-action">
                      <button
                        className="btn btn-ghost"
                        onClick={handleCloseSyncModal}
                        disabled={syncing}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleExecuteSync}
                        disabled={syncing || getTotalSelectedCount() === 0}
                      >
                        {syncing ? (
                          <>
                            <span className="loading loading-spinner"></span>
                            Syncing...
                          </>
                        ) : (
                          <>✓ Execute Sync ({getTotalSelectedCount()} items)</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
};

export default SyncPages;

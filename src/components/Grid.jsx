import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./back_end_url/api_url";

const DEFAULT_GRID_PROPS = {
  sortable: true,
  filterable: true,
  altrows: true,
  hoverable: true,
};

function Grid({
  buttonLabel = "Load Data",
  addbuttonLabel = "Add Student",
  title = "Student List",
  rows = [],
  columns = [],
  dataFields = [],
  isLoading = false,
  error = null,
  onReload = () => { },
  onEdit = null,
  onDelete = null,
  onView = null,
  onAdd = null,
  gridProps = DEFAULT_GRID_PROPS,
  toolbarContent = null,
  showActions = true,
  actionColumnWidth = "140px",
  userPermissions = { insert: true, update: true, delete: true, view: true }
}) {
  const location = useLocation();
  const [hasLoaded, setHasLoaded] = useState(location.state?.hasLoaded || false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterText, setFilterText] = useState('');

  // --- New State for Column Filter Visibility ---
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState("1");

  const [gridPermissions, setGridPermissions] = useState({ insert: 1, update: 1, delete: 1, view: 1 });

  useEffect(() => {
    const fetchGridPermissions = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const searchParams = new URLSearchParams(window.location.search);
        const userid = searchParams.get('userId') || storedUser.um_id;
        const Roleid = searchParams.get('userId') || storedUser.login_id;
        const isAdmin = Roleid === 1 || Roleid === '1';

        if (isAdmin) {
          setGridPermissions({ insert: 1, update: 1, delete: 1, view: 1 });
          return;
        }

        const currentPath = location.pathname.replace(/^\//, '');

        // Fetch all menus to map current path to menu ID
        const menuRes = await api.get('api/menu_master_Contoller/menu_master_select_all');
        let menuPayload = menuRes.data;
        if (typeof menuPayload === 'string') menuPayload = JSON.parse(menuPayload);

        let currentMenuId = null;
        if (menuPayload?.Result) {
          const matchedMenu = menuPayload.Result.find(m => {
            if (!m.mm_menu_path) return false;
            const mPath = m.mm_menu_path.toLowerCase().replace(/^\//, '');
            const cPath = currentPath.toLowerCase();
            return mPath === cPath;
          });
          if (matchedMenu) {
            currentMenuId = matchedMenu.mm_id;
          }
        }
        
        // Fetch user permissions
        const permRes = await api.get('api/menu_master_Contoller/user_menu_permissions_select_by_user_id', {
          params: { ump_user_id: userid }
        });
        let permData = permRes.data;
        if (typeof permData === 'string') permData = JSON.parse(permData);

        if (permData?.Result && currentMenuId) {
          const userPerm = permData.Result.find(p => p.ump_menu_id === currentMenuId);
          if (userPerm) {
            setGridPermissions({
              insert: userPerm.ump_can_insert,
              update: userPerm.ump_can_update,
              delete: userPerm.ump_can_delete,
              view: userPerm.ump_can_view
            });
            return;
          }
        }

        // Default to no permissions if not found
        setGridPermissions({ insert: 0, update: 0, delete: 0, view: 0 });

      } catch (err) {
        console.error("Error fetching permissions for Grid", err);
      }
    };

    fetchGridPermissions();
  }, [location.pathname]);


  const handleadddata = () => {
    if (onAdd) {
      onAdd();
    }
  }

  const handleInitialLoad = () => {
    setHasLoaded(true);
    onReload();
  };

  const handleColumnFilterChange = (datafield, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [datafield]: value
    }));
  };

  useEffect(() => {
    setCurrentPage(1);
    setGoToPage("1");
  }, [filterText, columnFilters]);

  const resolvedColumns = useMemo(() => {
    const cols = columns.length ? columns : dataFields.map(({ name }) => ({
      text: name,
      datafield: name,
    }));
    return showActions
      ? [{ text: "Actions", datafield: "actions", width: actionColumnWidth }, ...cols]
      : cols;
  }, [columns, dataFields, showActions, actionColumnWidth]);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (filterText) {
      const token = filterText.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(token))
      );
    }

    Object.keys(columnFilters).forEach(key => {
      const filterVal = columnFilters[key];
      if (filterVal) {
        result = result.filter(row =>
          String(row[key] || "").toLowerCase().includes(filterVal.toLowerCase())
        );
      }
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const res = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortConfig.direction === 'ascending' ? res : -res;
      });
    }
    return result;
  }, [rows, filterText, columnFilters, sortConfig]);

  const totalRows = filteredRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, startIndex, rowsPerPage]);

  const handlePageInput = (e) => {
    const val = e.target.value;
    setGoToPage(val);
    const num = parseInt(val);
    if (num > 0 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  const theme = {
    primary: "#4f46e5",
    textMain: "#1e293b",
    bg: "#f8fafc",
    card: "#ffffff",
    border: "#e2e8f0",
    footerBg: "#eeeeee"
  };

  const styles = {
    wrapper: { padding: "24px", backgroundColor: theme.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" },
    headerBtn: { padding: "10px 18px", fontSize: "14px", fontWeight: "600", borderRadius: "6px", cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: "8px" },

    searchWrapper: { position: "relative", display: "flex", alignItems: "center" },
    searchInput: { padding: "10px 12px 10px 35px", width: "280px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
    searchIcon: { position: "absolute", left: "12px", color: "#94a3b8", fontSize: "14px" },

    colFilterInput: { width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #dfe4ea", outline: "none", boxSizing: "border-box", marginTop: "5px", fontWeight: "normal" },

    gridCard: { backgroundColor: theme.card, borderRadius: "8px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px 16px", backgroundColor: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "700", textAlign: "left", borderBottom: "1px solid #e2e8f0" },
    td: { padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "14px", color: "#334155" },
    actionIcon: { fontSize: "18px", cursor: "pointer", padding: "5px" },

    footer: { display: "flex", alignItems: "center", gap: "15px", padding: "12px 20px", backgroundColor: theme.footerBg, borderTop: "1px solid #cccccc", fontSize: "15px" }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button style={{ ...styles.headerBtn, backgroundColor: theme.primary, color: "#fff" }} onClick={handleInitialLoad}>
            <i className="fa fa-refresh"></i> {buttonLabel}
          </button>
          {gridPermissions.insert == 1 && (
            <button style={{ ...styles.headerBtn, backgroundColor: "#10b981", color: "#fff" }} onClick={handleadddata}>
              <i className="fa fa-plus"></i> {addbuttonLabel}
            </button>
          )}

          {/* --- New Toggle Filter Button --- */}
          <button
            style={{ ...styles.headerBtn, backgroundColor: showColumnFilters ? "#64748b" : "#f1f5f9", color: showColumnFilters ? "#fff" : "#475569", border: "1px solid #cbd5e1" }}
            onClick={() => setShowColumnFilters(!showColumnFilters)}
          >
            <i className="fa fa-filter"></i> {showColumnFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <h2 style={{ margin: "0 0 0 10px", fontSize: "22px", color: theme.textMain, fontWeight: "700" }}>{title}</h2>
        </div>

        <div style={styles.searchWrapper}>
          <i className="fa fa-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Global search..."
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.gridCard}>
        {!hasLoaded ? (
          <div style={{ padding: "80px", textAlign: "center", color: "#64748b" }}>
            Click <strong>Load Data</strong> to see records
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  {/* Row 1: Column Titles */}
                  <tr>
                    {resolvedColumns.map((col, i) => (
                      <th key={i} style={{ ...styles.th, width: col.width || 'auto' }}>
                        {col.text}
                      </th>
                    ))}
                  </tr>

                  {/* Row 2: Precision Column Filters (Conditionally Rendered) */}
                  {showColumnFilters && (
                    <tr>
                      {resolvedColumns.map((col, i) => (
                        <th key={`filter-${i}`} style={{ ...styles.th, backgroundColor: "#f8fafc", paddingTop: "0px" }}>
                          {col.datafield !== "actions" && (
                            <input
                              style={styles.colFilterInput}
                              placeholder={`Filter ${col.text}...`}
                              value={columnFilters[col.datafield] || ""}
                              onChange={(e) => handleColumnFilterChange(col.datafield, e.target.value)}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? "#fff" : "#fbfcfd" }}>
                      {resolvedColumns.map((col, cIdx) => {
                        if (col.datafield === "actions") {
                          return (
                            <td key={cIdx} style={styles.td}>
                              <div style={{ display: "flex", gap: "12px" }}>
                                {onEdit && gridPermissions.update == 1 && <i className="fa fa-pencil-square-o" style={{ ...styles.actionIcon, color: "#2563eb" }} title="Edit" onClick={() => onEdit(row)}></i>}
                                {onView && gridPermissions.view == 1 && <i className="fa fa-eye" style={{ ...styles.actionIcon, color: "#64748b" }} title="View" onClick={() => onView(row)}></i>}
                                {onDelete && gridPermissions.delete == 1 && <i className="fa fa-trash-o" style={{ ...styles.actionIcon, color: "#dc2626" }} title="Delete" onClick={() => onDelete(row)}></i>}
                              </div>
                            </td>
                          );
                        }
                        const cellValue = row[col.datafield];
                        const displayValue = cellValue === null || cellValue === undefined || cellValue === "" ? "—" : cellValue;
                        return <td key={cIdx} style={styles.td}>{displayValue}</td>;
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={resolvedColumns.length} style={{ ...styles.td, textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        No matching records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Logic remains the same */}
            <div style={styles.footer}>
              <span>Go to page:</span>
              <input type="text" value={goToPage} onChange={handlePageInput} style={{ width: "45px", padding: "5px", textAlign: "center", border: "1px solid #999", borderRadius: "4px" }} />

              <span style={{ marginLeft: "10px" }}>Show rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); setGoToPage("1"); }}
                style={{ padding: "5px", borderRadius: "4px", border: "1px solid #999" }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>

              <span style={{ marginLeft: "auto", fontWeight: "600" }}>
                {totalRows > 0 ? `${startIndex + 1}-${endIndex}` : "0"} of {totalRows}
              </span>

              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => { const p = currentPage - 1; setCurrentPage(p); setGoToPage(p.toString()); }}
                  style={{ padding: "5px 12px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid #999", borderRadius: "4px", opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => { const p = currentPage + 1; setCurrentPage(p); setGoToPage(p.toString()); }}
                  style={{ padding: "5px 12px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid #999", borderRadius: "4px", opacity: currentPage >= totalPages ? 0.5 : 1 }}
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Grid;
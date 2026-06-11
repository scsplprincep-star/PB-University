import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, UserPlus, LogOut, ChevronDown, User, LayoutDashboard } from 'lucide-react';
import logoimage from "../../assets/pb_university_logo.png";
import api from '../back_end_url/api_url';

function Sidebar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const dropdownRef = useRef(null);
  const [searchParams] = useSearchParams();

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id;
  const EmailId = searchParams.get('userEmail') || storedUser.um_email_id;
  const userlogin = searchParams.get('userName') || storedUser.um_user_name;
  const Roleid = searchParams.get('loginid') || storedUser.login_id;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    let isActive = true;
    const fetchMenus = async () => {
      try {
        const response = await api.get('api/menu_master_Contoller/menu_master_select_all', {
        });
        let payload = response.data;
        if (typeof payload === 'string') payload = JSON.parse(payload);

        // Fetch permissions for the logged-in user
        let userPerms = [];
        try {
          const permRes = await api.get('api/menu_master_Contoller/user_menu_permissions_select_by_user_id', {
            params: { ump_user_id: userid }
          });
          let permData = permRes.data;
          if (typeof permData === 'string') permData = JSON.parse(permData);
          if (permData?.Result) {
            userPerms = permData.Result;
            // Store permissions in local storage so other pages can use them to hide/show Add/Edit/Delete buttons!
            localStorage.setItem('userMenuPermissions', JSON.stringify(userPerms));
          }
        } catch (err) {
          console.error("Error fetching user permissions:", err);
        }

        if (isActive && payload.Status === 1 && payload.Result) {
          // Identify if user is Admin (role 1 or user id 1)
          const isAdmin = Roleid === 1 || Roleid === '1';

          // Filter menus based on status AND user permissions
          const activeMenus = payload.Result.filter(menu => {
            const isMenuActive = menu.Status === 'Active' || menu.mm_is_status === 1;
            if (!isMenuActive) return false;

            // Admin sees all active menus
            if (isAdmin) return true;

            // Regular users only see menus where they have the view or show permission
            const perm = userPerms.find(p => p.ump_menu_id === menu.mm_id);
            return perm && (perm.ump_can_menu_show === 1 || perm.ump_can_view === 1);
          });

          const grouped = [];
          const parentMap = {};

          activeMenus.forEach(menu => {
            const path = menu.mm_menu_path.startsWith('/') ? menu.mm_menu_path : `/${menu.mm_menu_path}`;
            const item = {
              path,
              label: menu.mm_menu_name,
              iconClass: menu.mm_menu_icon
            };

            if (menu.parent_menu) {
              if (!parentMap[menu.parent_menu]) {
                parentMap[menu.parent_menu] = {
                  isParent: true,
                  label: menu.parent_menu,
                  iconClass: menu.parent_menu_icon,
                  children: []
                };
                grouped.push(parentMap[menu.parent_menu]);
              }
              parentMap[menu.parent_menu].children.push(item);
            } else {
              grouped.push(item);
            }
          });

          setNavItems(grouped);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };
    fetchMenus();
    return () => { isActive = false; };
  }, [userid]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div style={styles.shell(isSidebarOpen)}>
      {/* COLORFUL SIDEBAR */}
      <aside style={styles.sidebar(isSidebarOpen)}>
        <div style={styles.brandContainer(isSidebarOpen)}>
          <div style={styles.logoContainer}>
            <img src={logoimage} alt="PB University Logo" style={styles.logoImage} />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 style={styles.brand}>PB University</h1>
              <p style={styles.sidebarSubtitle}>ADMIN PORTAL</p>
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {isSidebarOpen && <div style={styles.navLabel}>MAIN NAVIGATION</div>}
          {navItems.map((item) => (
            item.isParent ? (
              <div key={item.label}>
                <div onClick={() => toggleMenu(item.label)} style={styles.parentLink(isSidebarOpen)}>
                  <span style={styles.iconWrapper}>
                    <i className={item.iconClass} style={{ fontSize: '20px', width: '20px', textAlign: 'center' }}></i>
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <ChevronDown size={16} style={{ transform: openMenus[item.label] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </>
                  )}
                </div>
                {openMenus[item.label] && (
                  <div style={styles.childContainer(isSidebarOpen)}>
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        style={({ isActive }) => ({
                          ...styles.childLink(isSidebarOpen),
                          ...(isActive ? styles.navLinkActive : {}),
                        })}
                      >
                        <span style={styles.iconWrapper}>
                          <i className={child.iconClass} style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}></i>
                        </span>
                        {isSidebarOpen && child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.navLink(isSidebarOpen),
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                <span style={styles.iconWrapper}>
                  {item.iconClass ? (
                    <i className={item.iconClass} style={{ fontSize: '20px', width: '20px', textAlign: 'center' }}></i>
                  ) : (
                    item.icon || <div style={{ width: '20px' }}></div>
                  )}
                </span>
                {isSidebarOpen && item.label}
              </NavLink>
            )
          ))}
        </nav>

        {/* Support Section at Bottom */}
        <div style={styles.sidebarFooter}>
          {isSidebarOpen && <p style={{ fontSize: '11px', opacity: 0.7 }}>© 2024 PB University</p>}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>System Overview</h2>
            <div style={styles.breadcrumb}>
              Pages <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Overview</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* USER PROFILE WITH DROPDOWN */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                style={styles.userProfile}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div style={styles.avatar}>{userlogin?.charAt(0)?.toUpperCase() + userlogin?.charAt(1)?.toUpperCase()} </div>
                <span style={styles.userNameText}>{userlogin}</span>
                <ChevronDown size={16} style={{
                  color: '#64748b',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} />
              </div>

              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{userlogin}</p>
                    <p style={styles.userEmailText}>{EmailId}</p>
                  </div>

                  <button style={styles.dropdownItem}>
                    <User size={16} /> My Profile
                  </button>

                  <div style={styles.divider}></div>

                  {/* NEW STYLIZED SIGN OUT BUTTON */}
                  <div style={{ padding: '4px' }}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                      <LogOut size={16} />
                      <span style={{ fontWeight: 600 }}>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={styles.sidebarToggle}
              title="Toggle Sidebar"
            >
              <i className="fa fa-bars" style={{ fontSize: '20px', color: '#64748b' }}></i>
            </button>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.innerCard}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  shell: (isOpen) => ({
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', system-ui, sans-serif",
  }),
  sidebar: (isOpen) => ({
    width: isOpen ? '280px' : '88px',
    padding: isOpen ? '32px 20px' : '32px 12px',
    // Colorful Gradient Background
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isOpen ? '4px 0 10px rgba(0,0,0,0.05)' : 'none',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  }),
  sidebarToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  brandContainer: (isOpen) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: '12px',
    marginBottom: '40px',
    padding: isOpen ? '0 8px' : '0',
  }),
  logoContainer: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '2px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  brand: { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' },
  sidebarSubtitle: { margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },

  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '10px',
    paddingLeft: '12px',
    letterSpacing: '0.1em'
  },
  navLink: (isOpen) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: isOpen ? '12px' : '0',
    padding: isOpen ? '12px 16px' : '12px 0',
    borderRadius: '12px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  }),
  navLinkActive: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    fontWeight: 600,
    boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.2)'
  },
  parentLink: (isOpen) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: isOpen ? '12px' : '0',
    padding: isOpen ? '12px 16px' : '12px 0',
    borderRadius: '12px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }),
  childContainer: (isOpen) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: isOpen ? '32px' : '0px',
    marginTop: '4px',
  }),
  childLink: (isOpen) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: isOpen ? '12px' : '0',
    padding: isOpen ? '10px 16px' : '10px 0',
    borderRadius: '10px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
  }),
  iconWrapper: { display: 'flex', alignItems: 'center' },

  main: { flex: 1, padding: '32px', overflowY: 'auto', width: '100%', transition: 'all 0.3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  headerTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  breadcrumb: { fontSize: '0.85rem', color: '#64748b', marginTop: '4px' },

  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 16px 6px 8px',
    background: '#fff',
    borderRadius: '999px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    background: '#f59e0b', // Keeping your orange theme from the image
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  userNameText: { fontSize: '0.9rem', fontWeight: 600, color: '#334155' },

  dropdownMenu: {
    position: 'absolute',
    top: '120%',
    right: 0,
    width: '220px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 100,
  },
  dropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '8px'
  },
  userEmailText: { margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '2px' },
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#475569',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  // NEW SIGN OUT THEME
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: '#fff1f2', // Soft red background
    border: '1px solid #fecdd3',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#e11d48', // Deep red text
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },

  divider: { height: '1px', background: '#f1f5f9', margin: '8px 0' },
  sidebarFooter: { marginTop: 'auto', padding: '0 12px', color: '#475569' },
  content: { minHeight: 'calc(100vh - 180px)' },
  innerCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  }
};

export default Sidebar;
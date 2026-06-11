import React, { useState, useEffect } from 'react';
import logoimage from "../../assets/pb_university_logo.png";

const Welcome_Screen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // REPLACE THIS with your actual backend URL (e.g., http://localhost:5000/api/user)
        const response = await fetch('/api/get-logged-in-user'); 

        // 1. Check if the response is successful (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        // 2. Check the Content-Type before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // It is safely JSON, parse it!
          const data = await response.json();
          setUser(data);
          setLoading(false);
        } else {
          // It is NOT JSON (likely HTML). Let's catch it.
          const text = await response.text();
          console.error("Expected JSON but received HTML:", text.substring(0, 100) + "...");
          throw new Error("API returned HTML instead of JSON. Check your backend URL, proxy settings, or authentication redirects.");
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
        
        // FOR DEVELOPMENT: If the fetch fails, load the mock data so you can still see the UI
        console.warn("Loading mock data so the UI doesn't break...");
        setUser({ 
          name: 'Sarah Jenkins (Mock Data)', 
          role: 'admin', // You can change this to 'teacher' or 'student'
          id: 'FAC-2015-88', 
          department: 'IT Operations',
          status: 'Active'
        });
        
        // We set error to null here because we are falling back to mock data.
        // If you want to show the red error screen instead, uncomment the line below:
        // setError(err.message); 
        
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', color: '#ef4444', padding: '20px', textAlign: 'center' }}>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <p style={{ color: '#475569', marginTop: '10px' }}>Open your browser console (F12) for more details.</p>
      </div>
    );
  }

  const getRoleSpecificData = () => {
    if (!user) return null; 

    switch (user.role) {
      case 'admin':
        return {
          badgeColor: '#ef4444',
          portalName: 'Admin Control Panel',
          details: [
            { label: 'Admin ID', value: user.id },
            { label: 'Department', value: 'IT Operations' },
            { label: 'Access Level', value: 'Superuser' },
          ],
          stats: [
            { label: 'System Status', value: 'Online' },
            { label: 'Active Users', value: '1,240' },
            { label: 'Support Tickets', value: '12' },
          ],
          primaryAction: 'Enter Dashboard'
        };
      case 'teacher':
        return {
          badgeColor: '#3b82f6',
          portalName: 'Faculty Portal',
          details: [
            { label: 'Faculty ID', value: user.id },
            { label: 'Department', value: user.department },
            { label: 'Employment', value: 'Full-Time' },
          ],
          stats: [
            { label: 'Classes Today', value: '3' },
            { label: 'Pending Grading', value: '34' },
            { label: 'Unread Messages', value: '5' },
          ],
          primaryAction: 'View Courses'
        };
      case 'student':
      default:
        return {
          badgeColor: '#22c55e',
          portalName: 'Student Portal',
          details: [
            { label: 'Student ID', value: user.id },
            { label: 'Program', value: user.department || 'B.S. General' },
            { label: 'Semester', value: 'Fall 2026' },
          ],
          stats: [
            { label: 'Unread Messages', value: '3' },
            { label: 'Pending Assignments', value: '2' },
            { label: 'Upcoming Exams', value: '1' },
          ],
          primaryAction: 'Enter Portal'
        };
    }
  };

  const roleData = getRoleSpecificData();

  const styles = {
    pageBackground: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', backgroundColor: '#f1f5f9', padding: '40px 20px', fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif" },
    cardContainer: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', maxWidth: '1300px', width: '100%', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
    headerSection: { display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px' },
    logo: { maxWidth: '120px', marginRight: '25px' },
    titleText: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '2.2rem', margin: '0', color: '#121A2F', fontWeight: '800', letterSpacing: '0.5px' },
    subtitle: { fontSize: '1rem', margin: '8px 0 0 0', color: '#64748b' },
    mainContent: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
    userCard: { flex: '1', minWidth: '250px', backgroundColor: '#121A2F', padding: '25px', borderRadius: '12px', color: '#ffffff', position: 'relative' },
    roleBadge: { position: 'absolute', top: '25px', right: '25px', backgroundColor: roleData.badgeColor, color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
    greeting: { fontSize: '1.4rem', fontWeight: '600', color: '#DCA74B', marginBottom: '25px', paddingRight: '80px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' },
    statsContainer: { flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '15px' },
    statBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    statLabel: { color: '#475569', fontWeight: '600', fontSize: '0.95rem' },
    statValue: { backgroundColor: '#DCA74B', color: '#121A2F', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' },
    buttonContainer: { marginTop: '35px', display: 'flex', gap: '15px', justifyContent: 'flex-end' },
    primaryButton: { padding: '12px 25px', fontSize: '1rem', backgroundColor: '#121A2F', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    secondaryButton: { padding: '12px 25px', fontSize: '1rem', backgroundColor: '#FFFFFF', color: '#121A2F', border: '1px solid #121A2F', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.cardContainer}>
        
        <div style={styles.headerSection}>
          <img src={logoimage} alt="PB University Logo" style={styles.logo} />
          <div style={styles.titleText}>
            <h1 style={styles.title}>PB University</h1>
            <p style={styles.subtitle}>{roleData.portalName} Overview</p>
          </div>
        </div>
        
        <div style={styles.mainContent}>
          <div style={styles.userCard}>
            <div style={styles.roleBadge}>{user.role}</div>
            <div style={styles.greeting}>Welcome, {user.name}</div>
            
            {roleData.details.map((detail, index) => (
              <div key={index} style={styles.detailRow}>
                <span style={{color: '#94a3b8'}}>{detail.label}:</span>
                <span>{detail.value}</span>
              </div>
            ))}
            
            <div style={{...styles.detailRow, borderBottom: 'none'}}>
              <span style={{color: '#94a3b8'}}>Account Status:</span>
              <span style={{color: '#4ade80'}}>{user.status || 'Active'}</span>
            </div>
          </div>

          <div style={styles.statsContainer}>
            {roleData.stats.map((stat, index) => (
              <div key={index} style={styles.statBox}>
                <span style={styles.statLabel}>{stat.label}</span>
                <span style={styles.statValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button style={styles.secondaryButton}>Account Settings</button>
          <button style={styles.primaryButton}>{roleData.primaryAction}</button>
        </div>
        
      </div>
    </div>
  );
};

export default Welcome_Screen;
import React from 'react';
import logoimage from "../../assets/pb_university_logo.png";

// I added a 'user' prop here to simulate the logged-in user's details being passed in.
// You can replace this with your actual user state/context later.
const Welcome_Screen = ({ user = { name: 'John Doe', studentId: 'PB-2026-001' } }) => {
  
  // Inline CSS styling
  const styles = {
    pageBackground: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9', // The light background color you requested
      padding: '20px',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    cardContainer: {
      backgroundColor: '#FFFFFF', // White card to create the border/layered effect
      borderRadius: '24px', // Smooth rounded corners matching your image
      padding: '50px 40px',
      maxWidth: '95%',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', // Very soft shadow
      border: '1px solid #e2e8f0', // The subtle edge border shown in your image
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logo: {
      maxWidth: '800px', 
      marginBottom: '25px',
    },
    title: {
      fontSize: '2.5rem',
      margin: '0 0 10px 0',
      color: '#121A2F', // Changed to deep navy so it shows up on the light background
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
    },
    userInfoBox: {
      backgroundColor: '#f8fafc',
      padding: '15px 30px',
      borderRadius: '12px',
      margin: '20px 0',
      border: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: '1.1rem',
      width: '80%',
    },
    userName: {
      fontWeight: 'bold',
      color: '#DCA74B', // Gold accent for the user's name
      fontSize: '1.3rem',
      marginBottom: '5px',
    },
    subtitle: {
      fontSize: '1.1rem',
      margin: '20px 0 35px 0',
      color: '#475569', // Dark gray for readability
      lineHeight: '1.6',
    },
    button: {
      padding: '15px 40px',
      fontSize: '1.1rem',
      backgroundColor: '#121A2F', // Deep navy button
      color: '#FFFFFF', 
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* This inner div acts as the white bordered card from your image */}
      <div style={styles.cardContainer}>
        
        <img 
          src={logoimage} 
          alt="PB University Logo" 
          style={styles.logo} 
        />
        
        <h1 style={styles.title}>PB University</h1>
        
        {/* Logged-in User Details Section */}
        <div style={styles.userInfoBox}>
          <div style={styles.userName}>Welcome back, {user.name}</div>
          <div>Student ID: {user.studentId}</div>
        </div>

        <p style={styles.subtitle}>
          Lighting the path to excellence, leadership, and a brighter future. Continue your academic journey.
        </p>
       
        
      </div>
    </div>
  );
};

export default Welcome_Screen;
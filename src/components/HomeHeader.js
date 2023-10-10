import React, { Fragment, useState, useEffect } from "react";
import styles from './HomeHeader.module.css';
import logoIcon from '../assets/Davao_City.png'


const HomeHeader = (props) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserDetails(storedUserDetails);
  }, []);


const handleMenu = () => {

  props.formOnCancel();
  
}


  const handleAddParcel = () => {
      props.onAddParcelClick();
      
      };

    const handleLogout =() => {

        props.onLogoutClick();

    };

    const handleMonument = () => {

      props.onMonumentClick();

    };
    const handleKmlFileUpload = () => {
       props.onKMLUpload();
    }; 


  return (
    <Fragment>
      <header>
        <nav className={styles.navbar}>
        <div className={styles["navbar-left"]}>
            <img src={logoIcon} alt="Logo" className={styles.logo} style={{ height: '50px' }}/>
            
             <h3>DAVAO CITY</h3>
           
          </div>
          <div className={styles["navbar-right"]}>
            <div className={styles.dropdown}>
            
              <button className={styles.dropbtn} onClick={handleMenu}>MENU</button>
    
              <div className={styles["dropdown-content"]}>
                <button onClick={handleAddParcel}>Plot Parcel</button>
                <button onClick={handleKmlFileUpload}>Upload KML </button>
                {/* <button >Edit/Update</button> */}
                <button>Assign PIN</button>
                <button onClick={handleMonument}>List of Monuments</button>
                {userDetails && <button>{userDetails.name} {userDetails.role}</button>}
                <button onClick={handleLogout}>Log Out</button>
            
                
              </div>
            </div>
          </div>
        </nav>
      </header>
    </Fragment>
  );
}

export default HomeHeader;

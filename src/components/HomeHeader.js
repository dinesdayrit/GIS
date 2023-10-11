import React, { Fragment, useState, useEffect } from "react";
import styles from './HomeHeader.module.css';
import logoIcon from '../assets/Davao_City.png'


const HomeHeader = (props) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserDetails(storedUserDetails);
  }, []);



  const handleAddParcel = () => {
      props.onAddParcelClick();
      setIsDropdownOpen(true);
      
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

    const handleMenuClick = () => {
      setIsDropdownOpen(false);
      props.formOnCancel();
    }
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
          
              <button className={`${styles.dropbtn} ${isDropdownOpen ? styles.open : ''}`} onClick={handleMenuClick}>
              <div className={`${styles.hamburgerIcon} ${isDropdownOpen ? styles.open : ''}`}>
              <div className={styles.bar1}></div>
              <div className={styles.bar2}></div>
              <div className={styles.bar3}></div>
              </div>
              MENU
              </button>
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

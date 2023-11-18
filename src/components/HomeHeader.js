import React, { Fragment, useState, useEffect } from "react";
import styles from './HomeHeader.module.css';
import logoIcon from '../assets/Davao_City.png'


const HomeHeader = (props) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserDetails(storedUserDetails);
    if (storedUserDetails && storedUserDetails.role === "user") {
      setIsAdmin(false);
     
    }
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
      setIsDropdownOpen(true);

    };
    const handleKmlFileUpload = () => {
       props.onKMLUploadClick();
       setIsDropdownOpen(true);
    }; 

    const signUpForm = () => {
      props.onToggleSignUpForm();
      setIsDropdownOpen(true);
    };

    const handleMenuClick = () => {
      setIsDropdownOpen(false);
      props.formOnCancel();
      
      
    }

    const handdlePinClick = () => {
      props.onAssignPinClick();
      setIsDropdownOpen(true);
      
    }

    const handleEdit = () => {
      props.onEditFormOpen();
      setIsDropdownOpen(true);
    }

  return (
    <Fragment>
      <header>
        <nav className={styles.navbar}>
        <div className={styles["navbar-left"]}>
            <img src={logoIcon} alt="Logo" className={styles.logo} style={{ height: '50px' }}/>
            
             <h3 style={{marginLeft: '10px'}}>TAX MAPPING</h3>
           
          </div>
          <div className={styles["navbar-right"]}>
            <div className={styles.dropdown}>
          
              <button className={`${styles.dropbtn} ${isDropdownOpen ? styles.open : ''}`} onClick={handleMenuClick}>
              <div className={`${styles.hamburgerIcon} ${isDropdownOpen ? styles.open : ''}`}>
              <div className={styles.bar1}></div>
              <div className={styles.bar2}></div>
              <div className={styles.bar3}></div>
              </div>
              
              </button>
              <div className={styles["dropdown-content"]}>
                <button onClick={handleAddParcel}>
                <i className="fa-solid fa-draw-polygon" style={{ marginRight: '8px' }}></i>
                Plot Parcel</button>

                <button onClick={handleKmlFileUpload}>
                <i className="fa-solid fa-file-import" style={{ marginRight: '8px' }}></i>
                Upload KML </button>
                  
                <button onClick={handleEdit}>
                <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }}></i>

                {!isAdmin ? 'Edit/Update' : 'Plot Approval/Edit'}
                </button>

                <button onClick={handdlePinClick}>
                {!isAdmin ? (
                              <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
                           ) : (
                              <i className="fa-solid fa-square-check" style={{ marginRight: '8px' }}></i>
                           )}
                {!isAdmin ? 'Assign PIN' : 'PIN Approval'}
                </button>

                <button onClick={handleMonument}>
                <i className="fas fa-list-alt" style={{ marginRight: '8px' }}></i>
                List of Monuments</button>
           
                {userDetails && <button onClick={signUpForm}>
                <i className="fas fa-user-alt" style={{ marginRight: '8px' }}></i>
                {userDetails.name} {userDetails.role}</button>}

                <button onClick={handleLogout}>
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                Log Out</button>
            
                
              </div>
            </div>
          </div>
        </nav>
      </header>
    </Fragment>
  );
}

export default HomeHeader;

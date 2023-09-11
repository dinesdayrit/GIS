import React, { Fragment } from "react";
import styles from './HomeHeader.module.css';
import logoIcon from '../assets/Davao_City.png'

const HomeHeader = (props) => {


    const handleAddParcel = () => {
 
       
          props.onAddParcelClick();
      
      };

    const handleLogout =() => {

        props.onLogoutClick();

    };

  return (
    <Fragment>
      <header>
        <nav className={styles.navbar}>
        <div className={styles["navbar-left"]}>
            <img src={logoIcon} alt="Logo" className={styles.logo} style={{ height: '60px' }}/> <h1>Davao City</h1>
           
          </div>
          <div className={styles["navbar-right"]}>
            <div className={styles.dropdown}>
              <button className={styles.dropbtn}>Menu</button>
              <div className={styles["dropdown-content"]}>
                <button onClick={handleAddParcel}>Plot A Parcel</button>
                <button href={null} >Edit/Update</button>
               
              </div>
            </div>
            <button  href={null} className={styles.logout} onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      </header>
    </Fragment>
  );
}

export default HomeHeader;

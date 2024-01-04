import React, { useEffect, useState } from 'react';
import styles from './UserLogs.module.css';

const UserLogs = (props) => {


return (
    <div className={styles['popup-form-container']}>
      <h3 style={{marginBottom: '1rem', fontWeight: 'bold', color: '#3e8e41'}}>User Logs</h3>
      <br/>
      <table >
        <thead>
          <tr>
            <th>User</th>
            <th>User Type</th>
            <th>Plotted</th>
            <th>Assigned Pin</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {(() => (
            <tr>
              <td>{}</td>
              <td>{}</td>
              <td>{}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLogs;
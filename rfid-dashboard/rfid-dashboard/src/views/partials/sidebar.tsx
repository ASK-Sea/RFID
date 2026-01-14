import React from 'react';
import { Link } from 'react-router-dom';
import styles from './sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/tagmanagement">Tag Management</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

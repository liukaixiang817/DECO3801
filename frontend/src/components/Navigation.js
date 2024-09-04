import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';  // 确保导入了正确的 CSS 文件

const Navigation = () => {
    return (
        <nav className="navigation">
            <NavLink to="/home" activeClassName="active">🏠</NavLink>
            <NavLink to="/events" activeClassName="active">📅</NavLink>
            <NavLink to="/profile" activeClassName="active">📁</NavLink>
        </nav>
    );
};

export default Navigation;

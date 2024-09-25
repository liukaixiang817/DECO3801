import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';  // 确保导入了正确的 CSS 文件
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navigation = () => {
    return (
        <div>
            <nav className="navigation">
                <NavLink to="/home" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-house" size='2x' /></NavLink>
                <NavLink to="/events" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-calendar-days" size="2x" />
                </NavLink>
                <NavLink to="/profile" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-user" size="2x" />
                </NavLink>
            </nav>
        </div>

    );
};

export default Navigation;

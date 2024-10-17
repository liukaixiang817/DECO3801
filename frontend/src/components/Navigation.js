import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';  // make sure to import the css file
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navigation = () => {
    return (
        <div>
            <nav className="navigation">
                <NavLink to="/home" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-house" size='2x' /></NavLink>
                <NavLink to="/events" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-table-tennis-paddle-ball" size="2x"/>
                </NavLink>
                <NavLink to="/rewards" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-medal" size="2x" />
                </NavLink>

                <NavLink to="/profile" activeClassName="active">
                    <FontAwesomeIcon icon="fa-solid fa-user" size="2x" />
                </NavLink>
            </nav>
        </div>

    );
};

export default Navigation;

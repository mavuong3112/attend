import React from "react";
import Logo from "../Logo/Logo";
import "./Navigation.css";

interface IProps {
  changeRoute: (route: string) => void;
  isSignedIn: boolean;
}

const Navigation: React.FC<IProps> = ({ changeRoute, isSignedIn }) => {
  if (isSignedIn === false) {
    return (
      <nav className="navigation">
        <div className="logo-container">
          <Logo />
          <h1 className="app-title">HỆ THỐNG ĐIỂM DANH</h1>
        </div>
        <div className="nav-links">
          <button 
            className="nav-button signin-nav" 
            onClick={() => changeRoute("signin")}
          >
            Đăng Nhập
          </button>
          <button 
            className="nav-button register-nav"
            onClick={() => changeRoute("register")}
          >
            Đăng Ký
          </button>
        </div>
      </nav>
    );
  } else if (isSignedIn === true) {
    return (
      <nav className="navigation">
        <div className="logo-container">
          <Logo />
          <h1 className="app-title">HỆ THỐNG ĐIỂM DANH</h1>
        </div>
        <div className="nav-links">
          <button 
            className="nav-button signout-nav"
            onClick={() => changeRoute("signout")}
          >
            Đăng Xuất
          </button>
        </div>
      </nav>
    );
  } else {
    return null;
  }
};

export default Navigation;

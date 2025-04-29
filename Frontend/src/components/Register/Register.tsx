import React from "react";
import { User } from "../../interfaces/interfaces";
import "./Register.css";
import axios from "axios";

interface IProps {
  loadUser: (data: User) => void;
  changeRoute: (route: string) => void;
}

interface IState {
  Email: string;
  Password: string;
  FullName: string;
}

class Register extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      Email: "",
      Password: "",
      FullName: "",
    };
  }

  onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ Email: event.target.value });
  };

  onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ Password: event.target.value });
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ FullName: event.target.value });
  };

  onRegister = async () => {
    // Giả lập đăng ký thành công và điều hướng về trang chính
    const fakeUser: User = {
      id: "1",
      fullname: this.state.FullName || "Người dùng mới",
      email: this.state.Email || "user@example.com",
      password: this.state.Password,
      entries: 0,
    };

    // register user here
    try {
      const response = await axios.post('http://127.0.0.1:1748/register', fakeUser)

      console.log(response.data);
      
      if(response.status === 201) {
        this.props.loadUser(response.data);
        localStorage.setItem("user_id", response.data.user_id)
        localStorage.setItem("fullname", response.data.fullname)
        localStorage.setItem("status", "register")
        this.props.changeRoute("home");
      } else {
        alert("Đăng ký không thành công")
      }
    } catch (error) {
      console.log(error);
    }
    
  };

  render() {
    const { changeRoute } = this.props;
    return (
      <div className="register-container">
        <div className="register-card">
          <h1>ĐĂNG KÝ TÀI KHOẢN</h1>
          <div className="form-content">
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                onChange={this.onNameChange}
                type="text"
                name="name"
                id="name"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-address">Email</label>
              <input
                onChange={this.onEmailChange}
                type="email"
                name="email-address"
                id="email-address"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                onChange={this.onPasswordChange}
                type="password"
                name="password"
                id="password"
                placeholder="Tạo mật khẩu mới"
              />
            </div>
            <button 
              className="register-button"
              onClick={this.onRegister}
            >
              Đăng Ký
            </button>
            <div className="signin-link">
              <p>
                Đã có tài khoản?{" "}
                <span onClick={() => changeRoute("signin")}>
                  Đăng nhập
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;

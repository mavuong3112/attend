import React from "react";
import { User } from "../../interfaces/interfaces";
import "./Signin.css";
import axios from "axios";

interface IProps {
  loadUser: (data: User) => void;
  changeRoute: (route: string) => void;
}

interface IState {
  signinEmail: string;
  signinPassword: string;
  signInErrorMessage: string;
}

class Signin extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      signinEmail: "",
      signinPassword: "",
      signInErrorMessage: ""
    };
  }

  onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ signinEmail: event.target.value });
  };

  onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ signinPassword: event.target.value });
  };

  onSubmitSignin = async () => {
    // Cho phép vào home ngay lập tức với thông tin giả
    const fakeUser: User = {
      id: "1",
      fullname: "Guest",
      email: this.state.signinEmail || "guest@example.com",
      password: this.state.signinPassword,
      entries: 0,
    };

    try {
      const response = await axios.post('http://127.0.0.1:1748/login', fakeUser)

      console.log(response.data);

      
      this.props.loadUser(fakeUser);
      localStorage.setItem("user_id", response.data.user_id)
      localStorage.setItem("fullname", response.data.fullname)
      localStorage.setItem("status", "login")
      this.props.changeRoute("home");
    } catch (error: any) {
      console.log(error);
      if(error.status === 404) {
        this.setState({signInErrorMessage: "Thông tin đăng nhập bị sai!"})
      }
    }

  };

  render() {
    const { changeRoute } = this.props;
    return (
      <div className="signin-container">
        <div className="signin-card">
          <h1>ĐĂNG NHẬP</h1>
          <div className="form-content">
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
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div>
              <span style={{color: "red"}}>{this.state.signInErrorMessage !== "" ? this.state.signInErrorMessage : ""}</span>
            </div>
            <button 
              className="signin-button"
              onClick={this.onSubmitSignin}
            >
              Đăng Nhập
            </button>
            <div className="register-link">
              <p>
                Chưa có tài khoản?{" "}
                <span onClick={() => changeRoute("Register")}>
                  Đăng ký ngay
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Signin;






// import React from "react";
// import { User } from "../../interfaces/interfaces";
// import "./Signin.css";

// interface IProps {
//   loadUser: (data: User) => void;
//   changeRoute: (route: string) => void;
// }

// interface IState {
//   signinEmail: string;
//   signinPassword: string;
// }

// class Signin extends React.Component<IProps, IState> {
//   constructor(props: IProps) {
//     super(props);
//     this.state = {
//       signinEmail: "",
//       signinPassword: "",
//     };
//   }

//   onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     this.setState({ signinEmail: event.target.value });
//   };

//   onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     this.setState({ signinPassword: event.target.value });
//   };

//   onSubmitSignin = () => {
//     const fakeUser: User = {
//       id: "1",
//       name: "Guest",
//       email: this.state.signinEmail || "guest@example.com",
//       entries: 0,
//     };
//     this.props.loadUser(fakeUser);
//     this.props.changeRoute("home");
//   };

//   render() {
//     const { changeRoute } = this.props;
//     return (
//       <div className="signin-container">
//         <div className="signin-card">
//           <h1>Sign In</h1>
//           <form>
//             <div className="form-group">
//               <label htmlFor="email-address">Email</label>
//               <input
//                 onChange={this.onEmailChange}
//                 type="email"
//                 id="email-address"
//                 value={this.state.signinEmail}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 onChange={this.onPasswordChange}
//                 type="password"
//                 id="password"
//                 value={this.state.signinPassword}
//               />
//             </div>
//             <button type="button" onClick={this.onSubmitSignin}>
//               Sign in
//             </button>
//           </form>
//           <div className="register-link">
//             <p onClick={() => changeRoute("Register")}>Register</p>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default Signin;
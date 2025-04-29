
import React, { Component } from "react";
import Particles from "react-particles-js";
import Navigation from "./components/navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import FaceRecognitionCore from "./components/FaceRecognition/FaceRecognition";
import "./App.css";
import { options } from "./utils/particles";

interface IProps {}

interface IState {
  route: string;
  isSignedIn: boolean;
  user: {
    id: string;
    fullname: string;
    email: string;
    entries: number;
  };
  userName: string;
  message: string;
  annotatedImage: string;
}

const initialState: IState = {
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    fullname: "",
    email: "",
    entries: 0,
  },
  userName: "",
  message: "",
  annotatedImage: "",
};

class App extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = initialState;
  }

  loadUser = (data: { id: string; fullname: string; email: string; entries: number }) => {
    this.setState({
      user: {
        id: data.id,
        fullname: data.fullname,
        email: data.email,
        entries: data.entries,
      },
    });
  };

  changeRoute = (route: string) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  };

  setUserName = (userName: string) => {
    this.setState({ userName });
  };

  setMessage = (message: string) => {
    this.setState({ message });
  };

  setAnnotatedImage = (annotatedImage: string) => {
    this.setState({ annotatedImage });
  };

  render() {
    const { route, isSignedIn, userName, message, annotatedImage } = this.state;

    return (
      <div className="App">
        <Particles className="particles" params={options} />
        <Navigation isSignedIn={isSignedIn} changeRoute={this.changeRoute} />
        {route === "home" ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Hệ thống Nhận Diện Khuôn Mặt</h1>
            <FaceRecognitionCore
              userName={userName}
              setUserName={this.setUserName}
              message={message}
              setMessage={this.setMessage}
              annotatedImage={annotatedImage}
              setAnnotatedImage={this.setAnnotatedImage}
            />
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={this.loadUser} changeRoute={this.changeRoute} />
        ) : (
          <Register loadUser={this.loadUser} changeRoute={this.changeRoute} />
        )}
      </div>
    );
  }
}

export default App;
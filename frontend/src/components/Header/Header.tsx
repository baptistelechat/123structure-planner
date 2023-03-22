import AddProjectFromExcel from "./components/AddProjectFromExcel/AddProjectFromExcel";
import logo from "../../assets/img/logo.png";
import ManageUsers from "./components/ManageUsers/ManageUsers";
import Auth from "./components/Auth";
import "../../assets/style/Header.css";
import animationData from "../../assets/lottie/loader-buildings.json";
import Lottie from "react-lottie";
import SearchBar from "./components/SearchBar/SearchBar";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import LottieLoader from "../utils/LottieLoader";
import { useAuth } from "../../hooks/Auth/useAuth";
import { IJwtPayload } from "../../data/interfaces/IJwtPayload";
import { useEffect, useState } from "react";
import { decodeJwt } from "../../utils/decodeJwt";

const Header = () => {
  const [userData, setUserData] = useState<IJwtPayload>();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { auth } = useAuth();

  const theme = useMantineTheme();
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  useEffect(() => {
    if (auth.user) {
      const payload = decodeJwt(auth.user.token);
      setUserData(payload);
    } else {
      setUserData(undefined);
    }
  }, [auth.user]);

  return (
    <>
      {/* <LottieLoader visible={true} /> */}
      <div className={`header ${smallScreen ? "header-mobile" : ""}`}>
        <div className={`menu ${smallScreen ? "menu-mobile" : ""}`}>
          {!smallScreen && userData?.role.includes("Administrateur") ? (
            <div className="admin">
              <ManageUsers />
              <AddProjectFromExcel />
            </div>
          ) : (
            <></>
          )}
          <Auth />
        </div>
        {auth.user ? <SearchBar /> : <></>}
        <div className="logoHeaderContainer">
          <Lottie
            options={defaultOptions}
            height={"125px"}
            style={{
              marginBottom: "-6px",
            }}
          />
          <img id="LogoHeader" src={logo} alt="logo" />
        </div>
      </div>
    </>
  );
};

export default Header;

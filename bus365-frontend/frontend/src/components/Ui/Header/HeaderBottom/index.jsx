import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import navigationBarPhoto from "../../../../assets/images/navBar.png";
import Container from "../../../../bootstrap/Container/";
import SinglePhoto from "../../SinglePhoto/";
import TrackOrder from "../../TrackOrder";
import {
  HeaderBottomWrapper,
  Logo,
  LogoLink,
  NavigationBar,
  NavigationBarIcon,
  NavigationUl,
  NavigationWithOutRes,
  NavigationWrapper,
  NavLink,
  SingleNavItem,
  Wrapper,
} from "./HeaderBottom.styles.js";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../../bootstrap/Button/index.jsx";

const HeaderBottom = ({ userProfileInfo, isLoading }) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [showNavItem, setShowNavItem] = useState(false);
  const [token, setToken] = useState(null);
  const history = useHistory();
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []); // Empty dependency array means this effect runs once on component mount

  const navigation = () => {
    history.push("/login");
  };
  const HeroBtn = styled(Button)`
    text-transform: capitalize;
    ${(props) => ` 
 background: ${props.btnbgcolor};
  color: ${props.btntextcolor};
  border: none;
  border-radius: 0px;
  padding: 13px 28px;
  margin:  auto;
  font-size: 14px;
  border-radius: 3px;
  transition: 0.4s;
  &&:hover {
    background: ${props.btnhvcolor};
  }
`}
  `;

  return (
    <Wrapper bg={webSettingData?.headercolor}>
      <Container>
        <HeaderBottomWrapper>
          <Logo>
            <LogoLink href="/">
              <SinglePhoto
                img={webSettingData?.headerlogo}
                alt="logo"
                style={{ height: "70px" }}
              />
            </LogoLink>
            <NavigationBar>
              <NavigationBarIcon
                src={navigationBarPhoto}
                alt="navigationIcon"
                onClick={() => setShowNavItem((prevState) => !prevState)}
              />
            </NavigationBar>
          </Logo>
          <NavigationWrapper>
            <NavigationWithOutRes>
              <SingleNavItem>
                <NavLink to="/">
                  {
                    languageData?.navigation_home_button[
                      webSettingData?.language
                    ]
                  }
                </NavLink>
              </SingleNavItem>
              <SingleNavItem>
                <NavLink to="/work">
                  {
                    languageData?.navigation_work_button[
                      webSettingData?.language
                    ]
                  }
                </NavLink>
              </SingleNavItem>
              <SingleNavItem>
                <NavLink to="/blog">
                  {
                    languageData?.navigation_blog_button[
                      webSettingData?.language
                    ]
                  }
                </NavLink>
              </SingleNavItem>

              <SingleNavItem>
                <Popup
                  trigger={
                    <NavLink to="#">
                      {
                        languageData?.navigation_track_button[
                          webSettingData?.language
                        ]
                      }
                    </NavLink>
                  }
                  position="bottom center"
                >
                  <TrackOrder />
                </Popup>
              </SingleNavItem>

              {!isLoading && (
                <>
                  {token && userProfileInfo ? (
                    <SingleNavItem>
                      <NavLink to="/tickets">
                        {userProfileInfo?.first_name}
                      </NavLink>
                    </SingleNavItem>
                  ) : (
                    <HeroBtn
                      btnbgcolor={webSettingData?.buttoncolor}
                      btnhvcolor={webSettingData?.buttoncolorhover}
                      btntextcolor={webSettingData?.buttontextcolor}
                      onClick={navigation}
                    >
                      {
                        languageData?.navigation_login_button[
                          webSettingData?.language
                        ]
                      }
                    </HeroBtn>
                  )}
                </>
              )}
            </NavigationWithOutRes>

            {showNavItem && (
              <NavigationUl>
                <SingleNavItem>
                  <NavLink to="/">
                    {" "}
                    {
                      languageData?.navigation_home_button[
                        webSettingData?.language
                      ]
                    }
                  </NavLink>
                </SingleNavItem>
                <SingleNavItem>
                  <NavLink to="/work">
                    {
                      languageData?.navigation_work_button[
                        webSettingData?.language
                      ]
                    }
                  </NavLink>
                </SingleNavItem>
                <SingleNavItem>
                  <NavLink to="/blog">
                    {" "}
                    {
                      languageData?.navigation_blog_button[
                        webSettingData?.language
                      ]
                    }
                  </NavLink>
                </SingleNavItem>

                <SingleNavItem>
                  <Popup
                    trigger={
                      <NavLink to="#">
                        {" "}
                        {
                          languageData?.navigation_track_button[
                            webSettingData?.language
                          ]
                        }{" "}
                      </NavLink>
                    }
                    position="bottom center"
                  >
                    <TrackOrder />
                  </Popup>
                </SingleNavItem>

                {token ? (
                  <SingleNavItem>
                    <NavLink to="/tickets">
                      {userProfileInfo?.first_name}
                    </NavLink>
                  </SingleNavItem>
                ) : (
                  <SingleNavItem>
                    <NavLink to="/login">
                      {
                        languageData?.navigation_login_button[
                          webSettingData?.language
                        ]
                      }
                    </NavLink>
                  </SingleNavItem>
                )}
              </NavigationUl>
            )}
          </NavigationWrapper>
        </HeaderBottomWrapper>
      </Container>
    </Wrapper>
  );
};

export default HeaderBottom;

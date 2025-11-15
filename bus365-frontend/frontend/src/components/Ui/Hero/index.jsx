import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import Container from "../../../bootstrap/Container/";
import {
  HeroBtn,
  HeroHeader,
  HeroSubHeader,
  HeroTextWrapper,
  HeroWrapper,
} from "./Hero.styles.js";
import { Oval } from "react-loader-spinner";

const Hero = ({ img, header, subHeader, btnText, locationRef, ...styles }) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [heroData, setHeroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const isHome = history.location.pathname !== "/";

  const getHeroData = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/hero`);
    const result = await response.json();
    if (result.status == "success") {
      setLoading(false);
      setHeroData(result.data[0]);
    }
  };

  useEffect(() => {
    try {
      getHeroData();
      return () => {
        setHeroData({});
      };
    } catch (error) {
      console.error("hero error", error);
    }
  }, []);

  const cursorPointer = () => {
    locationRef?.current?.focus();
  };

  return (
    <HeroWrapper img={heroData?.image} {...styles}>
      <Container>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "500px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Oval
              visible={true}
              height="50"
              width="50"
              color="#4fa94d"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        ) : (
          <HeroTextWrapper>
            {!isHome && (
              <>
                <HeroHeader>
                  {languageData?.hero_title[webSettingData?.language]}
                </HeroHeader>
                <HeroSubHeader>
                  {languageData?.hero_sub_title[webSettingData?.language]}
                </HeroSubHeader>
                {languageData?.hero_button_text && (
                  <HeroBtn
                    btnbgcolor={webSettingData?.buttoncolor}
                    btnhvcolor={webSettingData?.buttoncolorhover}
                    btntextcolor={webSettingData?.buttontextcolor}
                    onClick={cursorPointer}
                  >
                    {languageData?.hero_button_text[webSettingData?.language]}
                  </HeroBtn>
                )}
              </>
            )}
            {isHome && (
              <>
                {header && (
                  <>
                    <HeroHeader>{header}</HeroHeader>
                    <HeroSubHeader>{subHeader}</HeroSubHeader>
                  </>
                )}
              </>
            )}
          </HeroTextWrapper>
        )}
      </Container>
    </HeroWrapper>
  );
};

export default Hero;

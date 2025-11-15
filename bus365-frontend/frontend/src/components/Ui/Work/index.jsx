import { useEffect, useState } from "react";
import Container from "../../../bootstrap/Container";
import SectionHeader from "../SectionHeader/";
import { CardWrapper, InnerWrapper, SingleCard } from "./Work.styles.js";
import Skeleton from "react-loading-skeleton";
import { Oval } from "react-loader-spinner";
import styled from "styled-components";

const Work = () => {
  const [header, setHeader] = useState([]);
  const [articale, setArticale] = useState([]);
  const [loading, setLoading] = useState(true);

  const getWorkHeader = async () => {
    setLoading(true);
    const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/work`);
    const result = await response.json();
    setHeader(result?.data[0]);
    setLoading(false);
  };

  const getWorkContent = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_DOMAIN}/work/articles`
    );
    const result = await response.json();
    setArticale(result?.data);
  };

  useEffect(() => {
    try {
      getWorkHeader();
      getWorkContent();
      return () => {
        setHeader({});
        setArticale({});
      };
    } catch (error) {
      console.log("work error", error);
      setLoading(false);
    }
  }, []);

  const selectedArticale = articale.slice(0, 3);
  const HeaderWrapper = styled.div`
    padding-top: 20px;
    width: 50%;
    margin: 0 auto;
    @media (max-width: 768px) {
      width: 90%;
    }
  `;
  return (
    <Container>
      <InnerWrapper>
        <HeaderWrapper>
          <SectionHeader header={header.title} subHeader={header.sub_title} />
        </HeaderWrapper>
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
          <CardWrapper>
            {selectedArticale?.map((item) => (
              <SingleCard
                url={`/work/${item?.id}`}
                key={item?.id}
                item={item}
                headerLength="30"
                descriptaionLength="60"
              />
            ))}
          </CardWrapper>
        )}
      </InnerWrapper>
    </Container>
  );
};

export default Work;

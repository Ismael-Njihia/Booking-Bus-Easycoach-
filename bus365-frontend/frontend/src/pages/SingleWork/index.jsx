import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Container from "../../bootstrap/Container";
import Layout from "../../bootstrap/Layout/";
import {
  WorkDescription,
  WorkImage,
  WorkTitle,
  WorkWrapper,
} from "./SingleWork.styles";
import workImgOne from "../../assets/images/work_img_1.png";
import { SpinnerWrapper } from "../AllWork/AllWork.styles";
import Spinner from "../../bootstrap/Spinner";

const SingleWork = () => {
  const [singleWork, setSingleWork] = useState([]);
  const { id } = useParams();
  const [userProfileInfo, setUserProfileInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserProfileInfo(JSON.parse(localStorage.getItem("userProfileInfo")));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/work/articles/${id}`)
      .then((res) => res.json())
      .then((data) => setSingleWork(data.data[0]), setLoading(false));
  }, [id]);

  return (
    <Layout title={`work ${id}`} userProfileInfo={userProfileInfo}>
      {loading ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <Container>
          <WorkWrapper>
            <WorkImage
              src={singleWork?.image}
              onError={(e) => (e.target.src = workImgOne)}
              alt="workImage"
            />
            <WorkTitle>{singleWork?.title}</WorkTitle>
            <WorkDescription
              dangerouslySetInnerHTML={{ __html: singleWork.description }}
            ></WorkDescription>
          </WorkWrapper>
        </Container>
      )}
    </Layout>
  );
};

export default SingleWork;

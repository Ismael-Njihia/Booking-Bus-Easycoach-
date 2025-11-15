import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "react-accessible-accordion/dist/fancy-example.css";
import ReactPaginate from "react-paginate";
import Container from "../../bootstrap/Container";
import Layout from "../../bootstrap/Layout";
import ChangePassword from "../../components/Ui/ChangePassword";
import Luggage from "../../components/Ui/Laggues";
import SingleTicket from "../../components/Ui/SingleTicket";
import TicketHeader from "../../components/Ui/TicketHeader";
import TicketSidebar from "../../components/Ui/TicketSidebar";
import UserProfile from "../../components/Ui/UserProfile";
import {
  Accordions,
  PageBody,
  PaginationWrapper,
  TicketList,
} from "./Tickets.styles";
import Spinner from "../../bootstrap/Spinner";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
const Tickets = () => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const router = useHistory();
  const [userProfileInfo, setUserProfileInfo] = useState([]);
  const [ticketLoader, setTicketLoader] = useState(false);
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [passengerTicket, setPassengerTicket] = useState([]);
  const [profile, setProfile] = useState(false);
  const [ticket, setTicket] = useState(true);
  const [luggage, setLuggage] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [advertisement, setAdvertisement] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [reload, setReload] = useState(false);
  const ticketsPerPage = 6;

  const pageVisited = pageNumber * ticketsPerPage;
  const displayTickets = passengerTicket?.slice(
    pageVisited,
    pageVisited + ticketsPerPage
  );
  console.log("passengerTicket", displayTickets);
  const pageCount = Math.ceil(passengerTicket.length / ticketsPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/adds`)
      .then((res) => res.json())
      .then((result) => setAdvertisement(result?.data));
  }, []);

  const profileAdvertisement = advertisement?.find(
    (item) => item?.pagename === "customer"
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.warn("Token not available in localStorage.");
    }

    if (userProfileInfo?.first_name && userProfileInfo?.last_name) {
      setFullName(`${userProfileInfo.first_name} ${userProfileInfo.last_name}`);
    }
  }, [userProfileInfo]);

  useEffect(() => {
    setTicketLoader(true);

    // Only make the API call if the token is not empty
    setTimeout(() => {
      if (token) {
        getPassengerTickets();
        fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/passangers/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((result) => {
            if (result?.status === "success") {
              setUserProfileInfo(result?.data);
              localStorage.setItem(
                "userProfileInfo",
                JSON.stringify(result?.data)
              );
            } else if (result?.status === "fail") {
              router.push("/login");
            }
          })
          .catch((error) => {
            console.error("Error fetching passenger info:", error);
          });
      } else {
        console.warn("Token is empty, skipping API call");
      }
    }, 1000);
  }, [token, reload]);

  async function getPassengerTickets() {
    if (!token) {
      console.warn("Token is not available");
      return; // Exit the function if the token is not set
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/passangers/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result?.status === "success") {
        setTicketLoader(false);
        setPassengerTicket(result?.data);
      } else {
        setTicketLoader(false);
        console.warn("Ticket fetching failed", result);
      }
    } catch (error) {
      setTicketLoader(false);
      console.error("Passenger ticket error", error);
    }
  }

  return (
    <Layout
      title={languageData?.account_tab_title[webSettingData?.language]}
      userProfileInfo={userProfileInfo}
    >
      {token && userProfileInfo && (
        <>
          <TicketHeader
            token={token}
            fullName={fullName}
            userProfileInfo={userProfileInfo}
          />
          <Container>
            <PageBody>
              <TicketSidebar
                setTicket={setTicket}
                setProfile={setProfile}
                setChangePassword={setChangePassword}
                setLaggues={setLuggage}
                ticket={ticket}
                laggues={luggage}
                changePassword={changePassword}
                profile={profile}
                profileAdvertisement={profileAdvertisement}
              />

              <div>
                {profile && <UserProfile token={token} />}
                {luggage && <Luggage />}
                {changePassword && <ChangePassword token={token} />}

                {ticketLoader ? (
                  <Spinner />
                ) : (
                  <>
                    <TicketList>
                      {displayTickets?.length ? (
                        <>
                          <Accordions>
                            <>
                              {displayTickets?.map((item) => (
                                <SingleTicket
                                  setReload={setReload}
                                  item={item}
                                  key={item?.id}
                                  userProfileInfo={userProfileInfo}
                                />
                              ))}
                            </>
                          </Accordions>
                          <PaginationWrapper
                            btnAndBorderColor={webSettingData?.buttoncolor}
                            btnColor={webSettingData?.buttontextcolor}
                          >
                            <ReactPaginate
                              previousLabel={"<"}
                              nextLabel={">"}
                              pageCount={pageCount}
                              onPageChange={changePage}
                              containerClassName={"paginationBttn"}
                              previousLinkClassName={"previousBttn"}
                              nextLinkClassName={"nextBttn"}
                              disabledClassName={"paginationDisabled"}
                              activeClassName="active"
                            />
                          </PaginationWrapper>
                        </>
                      ) : (
                        <h1 style={{ textAlign: "center" }}>
                          {languageData?.no_ticket_found
                            ? languageData?.no_ticket_found[
                                webSettingData?.language
                              ]
                            : "no_ticket_found"}
                        </h1>
                      )}
                    </TicketList>
                  </>
                )}
              </div>
            </PageBody>
          </Container>
        </>
      )}
    </Layout>
  );
};

export default Tickets;

import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { useDispatch, useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";
import "reactjs-popup/dist/index.css";
import { dateForm, getLocation } from "../../../helpers";
import TicketTraking from "../../../pages/TicketTraking";
import { ticketTracking } from "../../../redux/action/busAction";
import NewPayPal from "../PaymentGateway/NewPayPal";
import Paystack from "../PaymentGateway/Paystack";
import Razorpay from "../PaymentGateway/Razorpay";

import SslCommerzLatter from "../PaymentGateway/SslCommerz/sslCommerzLatter";
import StripeCheckoutBtn from "../PaymentGateway/StripeCheckoutBtn";

import {
  BookingId,
  Btn,
  ButtonWrapper,
  Close,
  CommentWrapper,
  Content,
  Date,
  DateAndTime,
  FirstRow,
  Input,
  Location,
  Modal,
  PaymentBtn,
  PaymentBtns,
  PaymentList,
  PaymentTitle,
  PaymentWrapper,
  RatingWrapper,
  SecondRow,
  SinglePayment,
  StyledPopup,
  Textarea,
  TicketBookingIdTitle,
  TicketId,
  Time,
  Wrapper,
} from "./SingleTicket.styles";
import AOS, { init } from "aos";
import "aos/dist/aos.css"; // You can also use <link> for styles
import Flutterwave from "../PaymentGateway/Flutterwave";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Spinner from "../../../bootstrap/Spinner";
import SpinGrow from "../../../bootstrap/Loader/SpinGrow";
import Loader from "../../../bootstrap/Loader";
import { Oval } from "react-loader-spinner";
// ..
AOS.init();

const SingleTicket = ({ item, userProfileInfo, setReload }) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [boardingAndDroppingPoint, setBoardingAndDroppingPoint] = useState([]);
  const [rating, setRating] = useState(0);
  const [values, setValues] = useState(null);
  const [token, setToken] = useState(null);
  const [allPaymentGateway, setAllPaymentGateway] = useState(null);
  const [singlePayment, setSinglePayment] = useState("");
  const [comments, setComments] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [languageData, setLanguageData] = useState();

  const history = useHistory();
  const dispatch = useDispatch();

  const [payPalClientId, setPayPalPaymentId] = useState(null);

  const [passengerInformation, setPassengerInformation] = useState({
    address: "",
    city: "",
    country_id: "",
    first_name: "",
    id_number: "",
    id_type: "",
    last_name: "",
    login_email: "",
    login_mobile: "",
    slug: "",
    status: "",
    user_id: "",
    zip_code: "",
  });

  const baseUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000";

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/paymethods`)
      .then((res) => res.json())
      .then((result) => setAllPaymentGateway(result?.data));
  }, []);

  useEffect(() => {
    const result = allPaymentGateway?.find(
      (item) => item?.name === singlePayment
    );
    if (result) {
      setPaymentMethod(result?.id);
    }
  }, [allPaymentGateway, singlePayment]);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  useEffect(() => {
    setValues({
      comment: "",
      bookingId: item?.booking_id,
      ratting: rating ? String(Number(rating / 20)) : 0,
      subTripId: Number(item?.subtrip_id),
      passangerId: item?.passanger_id,
      tripId: Number(item?.trip_id),
      status: item?.payment_status,
    });

    setToken(localStorage.getItem("token"));
  }, [item, rating]);

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/passangers/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((result) => {
            if (result?.status === "success") {
              setPassengerInformation(result?.data);
              localStorage.setItem(
                "userProfileInfo",
                JSON.stringify(result?.data)
              );
            }
          });
      }, 1000);
    }
  }, [token]);

  const handleRating = (rate) => {
    setRating(rate);
    // other logic
  };

  const getBoardingAndDropingPoint = async (params) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/locations`
    );
    const result = await response.json();
    setBoardingAndDroppingPoint(result?.data);
  };

  useEffect(() => {
    try {
      getBoardingAndDropingPoint();
      return () => {
        setBoardingAndDroppingPoint([]);
      };
    } catch (error) {
      console.log("singleTicket", error);
    }
  }, []);

  const handleView = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/bookingid/${id}`
      );
      const result = await response.json();

      if (result?.status === "success") {
        dispatch(ticketTracking(result?.data));
        history.push(`/ticket-tracking?booking_id=${id}`);
      }
    } catch (error) {
      console.log("Tracking error", error);
    }
  };

  const handleReviwSubmit = async (e) => {
    e.preventDefault();

    if (!values?.ratting) {
      toast.error("please set ratting");
      return;
    }
    if (!values?.comment) {
      toast.error("please set comment");
      return;
    }

    const formData = new FormData();

    formData.append("user_id", values?.passangerId);
    formData.append("trip_id", values?.tripId);
    formData.append("subtrip_id", values?.subTripId);
    formData.append("booking_id", values?.bookingId);
    formData.append("comments", values?.comment);
    formData.append("rating", values?.ratting);
    formData.append("status", values?.status);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/ratings/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const result = await response.json();

      if (result?.status === "success") {
        toast.success(result?.status);

        setReload((preState) => !preState);
      } else {
        toast.error(result?.data);
      }
    } catch (error) {
      console.log("review", error);
    }
  };

  const handlePayment = (item) => {
    console.log("item", item);
  };

  const handleSubmitPayment = async () => {
    if (comments === "") {
      toast.error("set comments");
      return;
    } else {
      setLoading(true);

      const bookingData = {
        booking_id: item?.booking_id,
        paydetail: item?.payment_detail,
        paidamount: item?.paidamount,
        pay_method: paymentMethod,
        is_round_pay: 0,
        callback_url: `${baseUrl}/ticket-tracking`,
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/laterpay`,
          {
            method: "POST",
            body: JSON.stringify(bookingData),
            headers: {
              "Content-Type": "application/json", // Add this line
            },
          }
        );
        const result = await response.json();

        if (result?.status === "success") {
          window.location.replace(result.data.url);
          toast.success(result?.status);
          setLoading(false);
        }
      } catch (error) {
        console.error("anik", error);
      }
    }
  };

  // const getPaypalData = async () => {
  //   const response = await fetch(
  //     `${process.env.REACT_APP_API_MODULE_DOMAIN}/paymethods/paypal`
  //   );
  //   const result = await response.json();

  //   if (result?.status === "success") {
  //     setPayPalPaymentId(result?.data?.client_id);
  //   }
  // };

  // useEffect(() => {
  //   getPaypalData();
  // }, []);

  const handleTicketTracking = async (id) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/bookingid/${id}`
    );
    const result = await response.json();

    if (result?.status === "success") {
      dispatch(ticketTracking(result?.data));
      history.push(`/ticket-tracking?booking_id=${id}`);
    }
  };
  const initPayPal = {
    "client-id": payPalClientId,
    currency: "USD",
    intent: "capture",
  };

  console.log(
    languageData?.review
      ? languageData?.review[webSettingData?.language]
      : "review"
  );

  return (
    <PayPalScriptProvider options={initPayPal}>
      <AccordionItem>
        <Wrapper>
          <FirstRow>
            <Location>{getLocation(item, boardingAndDroppingPoint)}</Location>

            <TicketId>
              <TicketBookingIdTitle>
                {
                  languageData?.tickets_page_booking_id[
                    webSettingData?.language
                  ]
                }
                :
              </TicketBookingIdTitle>{" "}
              {item?.booking_id}
            </TicketId>
          </FirstRow>
          <SecondRow>
            <DateAndTime>
              <Date>{dateForm(item?.journeydata)}</Date>
              <Time>{item?.startime}</Time>
            </DateAndTime>
            <ButtonWrapper>
              {item?.refund === "0" &&
                item?.review_status === 0 &&
                item?.payment_status === "paid" &&
                item?.cancel_status === "0" && (
                  <StyledPopup
                    trigger={
                      <Btn
                        btnbgcolor={webSettingData?.buttoncolor}
                        btnbghvcolor={webSettingData?.buttoncolorhover}
                        btntextcolor={webSettingData?.buttontextcolor}
                      >
                        {languageData?.review
                          ? languageData?.review[webSettingData?.language]
                          : "review"}
                      </Btn>
                    }
                    position="bottom center"
                  >
                    {(close) => (
                      <Modal>
                        <Close onClick={close}>&times;</Close>

                        <Content>
                          <RatingWrapper>
                            <label>
                              {" "}
                              {languageData?.rating
                                ? languageData?.rating[webSettingData?.language]
                                : "rating"}
                              :{" "}
                            </label>
                            <Rating
                              onClick={handleRating}
                              ratingValue={rating}
                              size={20}
                            />
                          </RatingWrapper>
                          <CommentWrapper>
                            <label htmlFor="comment">
                              {languageData?.comment
                                ? languageData?.comment[
                                    webSettingData?.language
                                  ]
                                : "comment"}
                              :
                            </label>
                            <textarea
                              id="comment"
                              name="comment"
                              rows="7"
                              cols="50"
                              value={values?.comment}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  comment: e.target.value,
                                })
                              }
                            ></textarea>
                          </CommentWrapper>
                          <Btn
                            onClick={handleReviwSubmit}
                            btnbgcolor={webSettingData?.buttoncolor}
                            btnbghvcolor={webSettingData?.buttoncolorhover}
                            btntextcolor={webSettingData?.buttontextcolor}
                          >
                            {languageData?.submit
                              ? languageData?.submit[webSettingData?.language]
                              : "submit"}
                          </Btn>
                        </Content>
                      </Modal>
                    )}
                  </StyledPopup>
                )}

              {item?.payment_status !== "paid" &&
                item?.payment_status !== "partial" &&
                item?.cancel_status === "0" &&
                item?.refund === "0" && (
                  <StyledPopup
                    trigger={
                      <Btn
                        onClick={() => handlePayment(item)}
                        btnbgcolor={webSettingData?.buttoncolor}
                        btnbghvcolor={webSettingData?.buttoncolorhover}
                        btntextcolor={webSettingData?.buttontextcolor}
                      >
                        {
                          languageData?.tickets_page_payment_btn[
                            webSettingData?.language
                          ]
                        }
                      </Btn>
                    }
                  >
                    {(close) => (
                      <Modal>
                        <Close onClick={close}>&times;</Close>

                        <Content>
                          <BookingId>{item?.booking_id}</BookingId>
                          <Textarea
                            name=""
                            id=""
                            cols="30"
                            rows="4"
                            placeholder="comments"
                            onChange={(e) => setComments(e.target.value)}
                          ></Textarea>
                          <PaymentList>
                            {allPaymentGateway?.map((item) => (
                              <li key={item?.id}>
                                <Input
                                  type="radio"
                                  id={item?.name}
                                  name="payment"
                                  value={item?.name}
                                  onChange={(e) =>
                                    setSinglePayment(e.target.value)
                                  }
                                />
                                <PaymentTitle htmlFor={item?.name}>
                                  {item?.name}
                                </PaymentTitle>
                              </li>
                            ))}
                          </PaymentList>

                          <PaymentWrapper>
                            {!loading ? (
                              <PaymentBtn onClick={handleSubmitPayment}>
                                {languageData?.payment
                                  ? languageData?.payment[
                                      webSettingData?.language
                                    ]
                                  : "payment"}
                              </PaymentBtn>
                            ) : (
                              <PaymentBtn>
                                <div
                                  style={{
                                    width: "60px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Oval
                                    visible={true}
                                    height="20"
                                    width="20"
                                    color="#4fa94d"
                                    ariaLabel="oval-loading"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                  />
                                </div>
                              </PaymentBtn>
                            )}
                          </PaymentWrapper>
                        </Content>
                      </Modal>
                    )}
                  </StyledPopup>
                )}

              <Btn
                onClick={() => handleTicketTracking(item?.booking_id)}
                btnbgcolor={webSettingData?.buttoncolor}
                btnbghvcolor={webSettingData?.buttoncolorhover}
                btntextcolor={webSettingData?.buttontextcolor}
              >
                {languageData?.invoice
                  ? languageData?.invoice[webSettingData?.language]
                  : "invoice"}
              </Btn>
              <AccordionItemHeading>
                <AccordionItemButton>
                  <Btn
                    onClick={() => handleView(item?.booking_id)}
                    btnbgcolor={webSettingData?.buttoncolor}
                    btnbghvcolor={webSettingData?.buttoncolorhover}
                    btntextcolor={webSettingData?.buttontextcolor}
                  >
                    {
                      languageData?.tickets_page_view_btn[
                        webSettingData?.language
                      ]
                    }
                  </Btn>
                </AccordionItemButton>
              </AccordionItemHeading>
            </ButtonWrapper>
          </SecondRow>
        </Wrapper>
        <AccordionItemPanel>
          <TicketTraking maxWidth="true" />
        </AccordionItemPanel>
      </AccordionItem>
    </PayPalScriptProvider>
  );
};

export default SingleTicket;

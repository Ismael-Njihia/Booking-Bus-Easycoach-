import html2canvas from "html2canvas";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import Footer from "../../components/Ui/Footer";
import Header from "../../components/Ui/Header";
import PassengersCheckList from "../../components/Ui/PassengersCheckList";

import {
  Close,
  Content,
  Input,
  Modal,
  PaymentBtn,
  PaymentBtns,
  PaymentList,
  PaymentTitle,
  PaymentWrapper,
  SinglePayment,
  StyledPopup,
  Textarea,
} from "../../components/Ui/SingleTicket/SingleTicket.styles";
import TicketTrackingBody from "../../components/Ui/TicketTrackingBody";
import { getLocation } from "../../helpers";

import {
  CompanyName,
  CustomerBookingId,
  DownloadButton,
  DownloadButtonWrapper,
  InnerBody,
  LeftSide,
  Logo,
  PaymentButton,
  RightSide,
  RightSideProperty,
  TermAndConditionWrapper,
  TicketHeaderWrapper,
} from "./TicketTraking.styles";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Flutterwave from "../../components/Ui/PaymentGateway/Flutterwave";
import SslCommerzLatter from "../../components/Ui/PaymentGateway/SslCommerz/sslCommerzLatter";
import generatePDF from "react-to-pdf";
import { ticketTracking } from "../../redux/action/busAction";
import Spin from "../../bootstrap/Loader/Spin";
import { Oval } from "react-loader-spinner";
import jsPDF from "jspdf";

const TicketTraking = ({ maxWidth }) => {
  const busList = useSelector((state) => state.busLists);
  const { webSettingData, regularBookingInformation, languageData } = busList;
  const dispatch = useDispatch();
  const [boardingAndDroppingPoint, setBoardingAndDroppingPoint] = useState([]);
  const history = useHistory();
  const pathName = history.location.pathname === "/ticket-tracking";
  const [userProfileInfo, setUserProfileInfo] = useState(null);
  const [comments, setComments] = useState("");
  const [allPaymentGateway, setAllPaymentGateway] = useState(null);
  const [singlePayment, setSinglePayment] = useState("");

  const [paypalShow, setPaypalShow] = useState(false);
  const [paystackShow, setPaystacklShow] = useState(false);
  const [stripeShow, setStripeShow] = useState(false);
  const [razorpayShow, setRazorpayShow] = useState(false);
  const [sslCommerzShow, setSslCommerzShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [reload, setReload] = useState(false);
  const [passengerInformation, setPassengerInformation] = useState(null);
  const [regularBookingTraking, setRegularBookingTraking] = useState(null);
  const [payPalClientId, setPayPalPaymentId] = useState(null);
  const [flutterwaveShow, setFlutterwaveShow] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [width, setWidth] = useState();

  // const [languageData, setLanguageData] = useState();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingIdFromParams = queryParams.get("booking_id");
  const status = queryParams.get("status");
  const message = queryParams.get("message");
  const baseUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000";
  const fetchTicketTracking = async (id) => {
    // Fetch from API if ticketTracking is not in Redux state
    if (!busList?.ticketTracking) {
      setLoadingData(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/bookingid/${id}`
      );
      const result = await response.json();

      if (result?.status === "success") {
        dispatch(ticketTracking(result?.data));
        setDataLoaded(true);
        toast.success(message);
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    // If booking_id is missing, redirect to home page
    if (pathName && !bookingIdFromParams) {
      history.push("/"); // Redirect to home page
    }
  }, [bookingIdFromParams, pathName]);
  useEffect(() => {
    fetchTicketTracking(bookingIdFromParams);
  }, [busList?.ticketTracking, dispatch]);

  useEffect(() => {
    if (busList?.ticketTracking?.length > 0) {
      setDataLoaded(true);
    }
  }, [busList?.ticketTracking]);

  const regularHandleTicketTracking = async (id) => {
    if (id !== " ") {
      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/bookingid/${id}`
      );
      const result = await response.json();

      if (result?.status === "success") {
        setRegularBookingTraking(result?.data);
        setDataLoaded(true);
      }
    }
  };

  useEffect(() => {
    regularHandleTicketTracking(regularBookingInformation);
  }, [regularBookingInformation]);

  useEffect(() => {
    setPassengerInformation(
      JSON.parse(localStorage.getItem("passengerInformation"))
    );
  }, []);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);
  const getPaypalData = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/paymethods/paypal`
    );
    const result = await response.json();

    if (result?.status === "success") {
      setPayPalPaymentId(result?.data?.client_id);
    }
  };

  useEffect(() => {
    getPaypalData();
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/paymethods`)
      .then((res) => res.json())
      .then((result) => setAllPaymentGateway(result?.data));

    setUserProfileInfo(JSON.parse(localStorage.getItem("userProfileInfo")));

    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/locations`)
      .then((res) => res.json())
      .then((result) => setBoardingAndDroppingPoint(result?.data));
  }, [reload]);

  const componentRefOneWay = useRef(null);
  const componentRefRound = useRef(null);
  const combinedRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRefOneWay.current,
  });
  const handlePrintRound = useReactToPrint({
    content: () => componentRefRound.current,
  });

  const handleCombinedPrint = useReactToPrint({
    content: () => combinedRef.current,
  });

  const handleDownloadCombined = async () => {
    const fileName = `Invoice`;

    // Get both elements
    const element1 = document.getElementById("download");
    const element2 = document.getElementById("downloadRound");

    // Capture each element with html2canvas and add to PDF
    const pdf = new jsPDF("p", "mm", "a4");

    // First Element (download)
    const canvas1 = await html2canvas(element1);
    const imgData1 = canvas1.toDataURL("image/png");
    pdf.addImage(imgData1, "PNG", 10, 10, 190, 0); // Adjust position as needed

    // New page for second element (downloadRound)
    pdf.addPage();
    const canvas2 = await html2canvas(element2);
    const imgData2 = canvas2.toDataURL("image/png");
    pdf.addImage(imgData2, "PNG", 10, 10, 190, 0); // Adjust position as needed

    // Save the PDF
    pdf.save(fileName);
  };

  const handleDownload = (id) => {
    const getTargetElement = () => document.getElementById("download");
    const fileName = `Invoice - ${id}`;

    generatePDF(getTargetElement, {
      filename: fileName,
      overrides: {
        pdf: {
          compress: true,
        },
      },
    });
  };

  const handleDownloadRound = (id) => {
    const getTargetElement = () => document.getElementById("downloadRound");
    const fileName = `Invoice} - ${id}`;

    generatePDF(getTargetElement, {
      filename: fileName,
      overrides: {
        pdf: {
          compress: true,
        },
      },
    });
  };

  // if (pathName) {
  //   if (!ticketTracking) {
  //     history.push("/");
  //   }
  // }

  const handlePayment = (item) => {
    console.log("anik", item);
  };
  const handleSubmitPayment = async (item, payWay) => {
    if (comments === "") {
      toast.error("set comments");
      return;
    } else {
      setLoading(true);

      const bookingData = {
        booking_id: item?.booking_id,
        paydetail: item?.payment_detail,
        paidamount: item?.paidamount,
        pay_method: Number(paymentMethod),
        is_round_pay: payWay,
        callback_url: `${baseUrl}/ticket-tracking`,
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/laterpay`,
          {
            method: "POST",
            body: JSON.stringify(bookingData),
            headers: {
              "Content-Type": "application/json",
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

  useEffect(() => {
    const result = allPaymentGateway?.find(
      (item) => item?.name === singlePayment
    );
    if (result) {
      setPaymentMethod(result?.id);
    }
  }, [allPaymentGateway, singlePayment]);

  console.log("width", width);

  return (
    <>
      {pathName && <Header userProfileInfo={userProfileInfo} />}

      {/* {pathName &&
        regularBookingTraking &&
        regularBookingInformation !== " " && (
          <RegularTicketTracking
            regularBookingTraking={regularBookingTraking}
            maxWidth={maxWidth}
          />
        )} */}

      {loadingData ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <div ref={combinedRef}>
          {dataLoaded && (
            <>
              <InnerBody maxWidth={maxWidth}>
                <div id="ticket">
                  <div id="download">
                    <div ref={componentRefOneWay}>
                      {" "}
                      <div style={{ padding: "50px" }}>
                        <TicketHeaderWrapper>
                          <LeftSide>
                            <Logo src={webSettingData?.headerlogo} alt="logo" />
                            <CompanyName>
                              {" "}
                              {busList?.ticketTracking[0]?.company_name} (
                              {busList?.ticketTracking[0]?.company})
                            </CompanyName>
                          </LeftSide>

                          <RightSide>
                            <li>
                              <RightSideProperty>
                                {
                                  languageData?.ticket_traking_page_name[
                                    webSettingData?.language
                                  ]
                                }
                              </RightSideProperty>
                              :{" "}
                              <strong>
                                {busList?.ticketTracking[0]?.fullName}
                              </strong>
                            </li>
                            <li>
                              <RightSideProperty>
                                {
                                  languageData?.ticket_traking_page_phone[
                                    webSettingData?.language
                                  ]
                                }
                              </RightSideProperty>
                              : {busList?.ticketTracking[0]?.mobile}
                            </li>
                            <li>
                              <RightSideProperty>
                                {
                                  languageData?.ticket_traking_page_booking_id[
                                    webSettingData?.language
                                  ]
                                }
                              </RightSideProperty>
                              :{" "}
                              <strong>
                                {busList?.ticketTracking[0]?.booking_id}
                              </strong>
                            </li>
                            <li>
                              {getLocation(
                                busList?.ticketTracking[0],
                                boardingAndDroppingPoint
                              )}
                            </li>
                            {busList?.ticketTracking[0]?.cancel_status ===
                              "1" && (
                              <li>
                                {" "}
                                {languageData?.status
                                  ? languageData?.status[
                                      webSettingData?.language
                                    ]
                                  : "status"}{" "}
                                :{" "}
                                {languageData?.canceled
                                  ? languageData?.canceled[
                                      webSettingData?.language
                                    ]
                                  : "canceled"}
                              </li>
                            )}
                            {busList?.ticketTracking[0]?.refund === "1" && (
                              <li>
                                {" "}
                                {languageData?.status
                                  ? languageData?.status[
                                      webSettingData?.language
                                    ]
                                  : "status"}{" "}
                                :{" "}
                                {languageData?.refunded
                                  ? languageData?.refunded[
                                      webSettingData?.language
                                    ]
                                  : "refunded"}
                              </li>
                            )}
                            {busList?.ticketTracking[0]?.cancel_status ===
                              "0" &&
                              busList?.ticketTracking[0]?.refund === "0" && (
                                <>
                                  {busList?.ticketTracking[0]
                                    ?.payment_status === "paid" && (
                                    <li>
                                      {" "}
                                      {languageData?.status
                                        ? languageData?.status[
                                            webSettingData?.language
                                          ]
                                        : "status"}{" "}
                                      :{" "}
                                      {languageData?.paid
                                        ? languageData?.paid[
                                            webSettingData?.language
                                          ]
                                        : "paid"}
                                    </li>
                                  )}
                                  {busList?.ticketTracking[0]
                                    ?.payment_status === "unpaid" && (
                                    <li>
                                      {" "}
                                      {languageData?.status
                                        ? languageData?.status[
                                            webSettingData?.language
                                          ]
                                        : "status"}{" "}
                                      :{" "}
                                      {languageData?.unpaid
                                        ? languageData?.unpaid[
                                            webSettingData?.language
                                          ]
                                        : "unpaid"}
                                    </li>
                                  )}
                                  {busList?.ticketTracking[0]
                                    ?.payment_status === "partial" && (
                                    <li>
                                      {" "}
                                      {languageData?.status
                                        ? languageData?.status[
                                            webSettingData?.language
                                          ]
                                        : "status"}{" "}
                                      :{" "}
                                      {languageData?.partial_paid
                                        ? languageData?.partial_paid[
                                            webSettingData?.language
                                          ]
                                        : "partial_paid"}
                                    </li>
                                  )}
                                </>
                              )}
                          </RightSide>
                        </TicketHeaderWrapper>

                        <TicketTrackingBody
                          ticketTracking={busList?.ticketTracking[0]}
                        />
                        {pathName && (
                          <TermAndConditionWrapper>
                            <PassengersCheckList shadow="false" />
                          </TermAndConditionWrapper>
                        )}
                      </div>
                    </div>
                  </div>
                  {pathName && (
                    <>
                      <DownloadButtonWrapper>
                        <DownloadButton
                          onClick={handlePrint}
                          btnBgColor={webSettingData?.buttoncolor}
                          btnBgHvColor={webSettingData?.buttoncolorhover}
                          btnTextColor={webSettingData?.buttontextcolor}
                        >
                          {
                            languageData?.ticket_traking_page_print_btn[
                              webSettingData?.language
                            ]
                          }
                        </DownloadButton>
                        <DownloadButton
                          onClick={() =>
                            handleDownload(
                              busList?.ticketTracking[0]?.booking_id
                            )
                          }
                          btnBgColor={webSettingData?.buttoncolor}
                          btnBgHvColor={webSettingData?.buttoncolorhover}
                          btnTextColor={webSettingData?.buttontextcolor}
                        >
                          {
                            languageData?.ticket_traking_page_download_btn[
                              webSettingData?.language
                            ]
                          }
                        </DownloadButton>
                        {busList?.ticketTracking.length > 1 && (
                          <>
                            <DownloadButton
                              onClick={handleCombinedPrint}
                              btnBgColor={webSettingData?.buttoncolor}
                              btnBgHvColor={webSettingData?.buttoncolorhover}
                              btnTextColor={webSettingData?.buttontextcolor}
                            >
                              {languageData?.print_both
                                ? languageData?.print_both[
                                    webSettingData?.language
                                  ]
                                : "print_both"}
                            </DownloadButton>
                            {width >= 768 && (
                              <DownloadButton
                                onClick={handleDownloadCombined}
                                btnBgColor={webSettingData?.buttoncolor}
                                btnBgHvColor={webSettingData?.buttoncolorhover}
                                btnTextColor={webSettingData?.buttontextcolor}
                              >
                                {languageData?.download_both
                                  ? languageData?.download_both[
                                      webSettingData?.language
                                    ]
                                  : "download_both"}
                              </DownloadButton>
                            )}
                          </>
                        )}

                        {busList?.ticketTracking[0]?.payment_status !==
                          "paid" &&
                          busList?.ticketTracking[0]?.payment_status !==
                            "partial" &&
                          busList?.ticketTracking[0]?.cancel_status === "0" &&
                          busList?.ticketTracking[0]?.refund === "0" &&
                          !reload && (
                            <>
                              <StyledPopup
                                trigger={
                                  <PaymentButton
                                    onClick={() => handlePayment}
                                    btnBgColor={webSettingData?.buttoncolor}
                                    btnBgHvColor={
                                      webSettingData?.buttoncolorhover
                                    }
                                    btnTextColor={
                                      webSettingData?.buttontextcolor
                                    }
                                  >
                                    {languageData?.pay_single
                                      ? languageData?.pay_single[
                                          webSettingData?.language
                                        ]
                                      : "pay_single"}
                                  </PaymentButton>
                                }
                              >
                                {(close) => (
                                  <Modal>
                                    <Close onClick={close}>&times;</Close>

                                    <Content>
                                      <CustomerBookingId>
                                        {busList?.ticketTracking[0]?.booking_id}
                                      </CustomerBookingId>
                                      <Textarea
                                        name=""
                                        id=""
                                        cols="30"
                                        rows="4"
                                        placeholder="comments"
                                        onChange={(e) =>
                                          setComments(e.target.value)
                                        }
                                      ></Textarea>
                                      <PaymentList>
                                        {allPaymentGateway?.map((item) => (
                                          <li key={item.id}>
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
                                          <PaymentBtn
                                            onClick={() =>
                                              handleSubmitPayment(
                                                busList?.ticketTracking[0],
                                                0
                                              )
                                            }
                                          >
                                            {languageData?.pay_single
                                              ? languageData?.pay_single[
                                                  webSettingData?.language
                                                ]
                                              : "pay_single"}
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

                              {busList?.ticketTracking.length > 1 && (
                                <StyledPopup
                                  trigger={
                                    <PaymentButton
                                      onClick={() => handlePayment}
                                      btnBgColor={webSettingData?.buttoncolor}
                                      btnBgHvColor={
                                        webSettingData?.buttoncolorhover
                                      }
                                      btnTextColor={
                                        webSettingData?.buttontextcolor
                                      }
                                    >
                                      {languageData?.pay_for_both_tickets
                                        ? languageData?.pay_for_both_tickets[
                                            webSettingData?.language
                                          ]
                                        : "pay_for_both_tickets"}
                                    </PaymentButton>
                                  }
                                >
                                  {(close) => (
                                    <Modal>
                                      <Close onClick={close}>&times;</Close>

                                      <Content>
                                        <CustomerBookingId>
                                          {
                                            busList?.ticketTracking[0]
                                              ?.booking_id
                                          }
                                        </CustomerBookingId>
                                        <Textarea
                                          name=""
                                          id=""
                                          cols="30"
                                          rows="4"
                                          placeholder="comments"
                                          onChange={(e) =>
                                            setComments(e.target.value)
                                          }
                                        ></Textarea>
                                        <PaymentList>
                                          {allPaymentGateway?.map((item) => (
                                            <li key={item.id}>
                                              <Input
                                                type="radio"
                                                id={item?.name}
                                                name="payment"
                                                value={item?.name}
                                                onChange={(e) =>
                                                  setSinglePayment(
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <PaymentTitle
                                                htmlFor={item?.name}
                                              >
                                                {item?.name}
                                              </PaymentTitle>
                                            </li>
                                          ))}
                                        </PaymentList>

                                        <PaymentWrapper>
                                          {!loading ? (
                                            <PaymentBtn
                                              onClick={() =>
                                                handleSubmitPayment(
                                                  busList?.ticketTracking[0],
                                                  1
                                                )
                                              }
                                            >
                                              {languageData?.pay_for_both_tickets
                                                ? languageData
                                                    ?.pay_for_both_tickets[
                                                    webSettingData?.language
                                                  ]
                                                : "pay_for_both_tickets"}
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
                            </>
                          )}
                      </DownloadButtonWrapper>
                    </>
                  )}
                </div>

                {/* {pathName && (
    <DownloadButtonWrapper>
      <DownloadButton onClick={() => handleDownload("ticket")}>Download</DownloadButton>
    </DownloadButtonWrapper>
  )} */}
              </InnerBody>
              {busList?.ticketTracking.length > 1 && (
                <InnerBody maxWidth={maxWidth}>
                  <div id="ticket">
                    <div id="downloadRound">
                      <div ref={componentRefRound}>
                        {" "}
                        <div style={{ padding: "50px" }}>
                          <TicketHeaderWrapper>
                            <LeftSide>
                              <Logo
                                src={webSettingData?.headerlogo}
                                alt="logo"
                              />
                              <CompanyName>
                                {" "}
                                {busList?.ticketTracking[1]?.company_name} (
                                {busList?.ticketTracking[1]?.company})
                              </CompanyName>
                            </LeftSide>

                            <RightSide>
                              <li>
                                <RightSideProperty>
                                  {
                                    languageData?.ticket_traking_page_name[
                                      webSettingData?.language
                                    ]
                                  }
                                </RightSideProperty>
                                :{" "}
                                <strong>
                                  {busList?.ticketTracking[1]?.fullName}
                                </strong>
                              </li>
                              <li>
                                <RightSideProperty>
                                  {
                                    languageData?.ticket_traking_page_phone[
                                      webSettingData?.language
                                    ]
                                  }
                                </RightSideProperty>
                                : {busList?.ticketTracking[1]?.mobile}
                              </li>
                              <li>
                                <RightSideProperty>
                                  {
                                    languageData
                                      ?.ticket_traking_page_booking_id[
                                      webSettingData?.language
                                    ]
                                  }
                                </RightSideProperty>
                                :{" "}
                                <strong>
                                  {busList?.ticketTracking[1]?.booking_id}
                                </strong>
                              </li>
                              <li>
                                {getLocation(
                                  busList?.ticketTracking[1],
                                  boardingAndDroppingPoint
                                )}
                              </li>
                              {busList?.ticketTracking[1]?.cancel_status ===
                                "1" && (
                                <li>
                                  {" "}
                                  {languageData?.status
                                    ? languageData?.status[
                                        webSettingData?.language
                                      ]
                                    : "status"}{" "}
                                  :{" "}
                                  {languageData?.canceled
                                    ? languageData?.canceled[
                                        webSettingData?.language
                                      ]
                                    : "canceled"}
                                </li>
                              )}
                              {busList?.ticketTracking[1]?.refund === "1" && (
                                <li>
                                  {" "}
                                  {languageData?.status
                                    ? languageData?.status[
                                        webSettingData?.language
                                      ]
                                    : "status"}{" "}
                                  :{" "}
                                  {languageData?.refunded
                                    ? languageData?.refunded[
                                        webSettingData?.language
                                      ]
                                    : "refunded"}
                                </li>
                              )}
                              {busList?.ticketTracking[1]?.cancel_status ===
                                "0" &&
                                busList?.ticketTracking[1]?.refund === "0" && (
                                  <>
                                    {busList?.ticketTracking[1]
                                      ?.payment_status === "paid" && (
                                      <li>
                                        {" "}
                                        {languageData?.status
                                          ? languageData?.status[
                                              webSettingData?.language
                                            ]
                                          : "status"}{" "}
                                        :{" "}
                                        {languageData?.paid
                                          ? languageData?.paid[
                                              webSettingData?.language
                                            ]
                                          : "paid"}
                                      </li>
                                    )}
                                    {busList?.ticketTracking[1]
                                      ?.payment_status === "unpaid" && (
                                      <li>
                                        {" "}
                                        {languageData?.status
                                          ? languageData?.status[
                                              webSettingData?.language
                                            ]
                                          : "status"}{" "}
                                        :{" "}
                                        {languageData?.unpaid
                                          ? languageData?.unpaid[
                                              webSettingData?.language
                                            ]
                                          : "unpaid"}
                                      </li>
                                    )}
                                    {busList?.ticketTracking[1]
                                      ?.payment_status === "partial" && (
                                      <li>
                                        {" "}
                                        {languageData?.status
                                          ? languageData?.status[
                                              webSettingData?.language
                                            ]
                                          : "status"}{" "}
                                        :{" "}
                                        {languageData?.partial_paid
                                          ? languageData?.partial_paid[
                                              webSettingData?.language
                                            ]
                                          : "partial_paid"}
                                      </li>
                                    )}
                                  </>
                                )}
                            </RightSide>
                          </TicketHeaderWrapper>

                          <TicketTrackingBody
                            ticketTracking={busList?.ticketTracking[1]}
                          />
                          {pathName && (
                            <TermAndConditionWrapper>
                              <PassengersCheckList shadow="false" />
                            </TermAndConditionWrapper>
                          )}
                        </div>
                      </div>
                    </div>
                    {pathName && (
                      <>
                        <DownloadButtonWrapper>
                          <DownloadButton
                            onClick={handlePrintRound}
                            btnBgColor={webSettingData?.buttoncolor}
                            btnBgHvColor={webSettingData?.buttoncolorhover}
                            btnTextColor={webSettingData?.buttontextcolor}
                          >
                            {
                              languageData?.ticket_traking_page_print_btn[
                                webSettingData?.language
                              ]
                            }
                          </DownloadButton>
                          <DownloadButton
                            onClick={() =>
                              handleDownloadRound(
                                busList?.ticketTracking[1]?.booking_id
                              )
                            }
                            btnBgColor={webSettingData?.buttoncolor}
                            btnBgHvColor={webSettingData?.buttoncolorhover}
                            btnTextColor={webSettingData?.buttontextcolor}
                          >
                            {
                              languageData?.ticket_traking_page_download_btn[
                                webSettingData?.language
                              ]
                            }
                          </DownloadButton>
                          <DownloadButton
                            onClick={handleCombinedPrint}
                            btnBgColor={webSettingData?.buttoncolor}
                            btnBgHvColor={webSettingData?.buttoncolorhover}
                            btnTextColor={webSettingData?.buttontextcolor}
                          >
                            {languageData?.print_both
                              ? languageData?.print_both[
                                  webSettingData?.language
                                ]
                              : "print_both"}
                          </DownloadButton>

                          {width >= 768 && (
                            <DownloadButton
                              onClick={handleDownloadCombined}
                              btnBgColor={webSettingData?.buttoncolor}
                              btnBgHvColor={webSettingData?.buttoncolorhover}
                              btnTextColor={webSettingData?.buttontextcolor}
                            >
                              {languageData?.download_both
                                ? languageData?.download_both[
                                    webSettingData?.language
                                  ]
                                : "download_both"}
                            </DownloadButton>
                          )}

                          {busList?.ticketTracking[1]?.payment_status !==
                            "paid" &&
                            busList?.ticketTracking[1]?.payment_status !==
                              "partial" &&
                            busList?.ticketTracking[1]?.cancel_status === "0" &&
                            busList?.ticketTracking[1]?.refund === "0" &&
                            !reload && (
                              <>
                                <StyledPopup
                                  trigger={
                                    <PaymentButton
                                      onClick={() => handlePayment}
                                      btnBgColor={webSettingData?.buttoncolor}
                                      btnBgHvColor={
                                        webSettingData?.buttoncolorhover
                                      }
                                      btnTextColor={
                                        webSettingData?.buttontextcolor
                                      }
                                    >
                                      {languageData?.pay_single
                                        ? languageData?.pay_single[
                                            webSettingData?.language
                                          ]
                                        : "pay_single"}
                                    </PaymentButton>
                                  }
                                >
                                  {(close) => (
                                    <Modal>
                                      <Close onClick={close}>&times;</Close>

                                      <Content>
                                        <CustomerBookingId>
                                          {
                                            busList?.ticketTracking[1]
                                              ?.booking_id
                                          }
                                        </CustomerBookingId>
                                        <Textarea
                                          name=""
                                          id=""
                                          cols="30"
                                          rows="4"
                                          placeholder="comments"
                                          onChange={(e) =>
                                            setComments(e.target.value)
                                          }
                                        ></Textarea>
                                        <PaymentList>
                                          {allPaymentGateway?.map((item) => (
                                            <li key={item.id}>
                                              <Input
                                                type="radio"
                                                id={item?.name}
                                                name="payment"
                                                value={item?.name}
                                                onChange={(e) =>
                                                  setSinglePayment(
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <PaymentTitle
                                                htmlFor={item?.name}
                                              >
                                                {item?.name}
                                              </PaymentTitle>
                                            </li>
                                          ))}
                                        </PaymentList>

                                        <PaymentWrapper>
                                          {!loading ? (
                                            <PaymentBtn
                                              onClick={() =>
                                                handleSubmitPayment(
                                                  busList?.ticketTracking[1],
                                                  0
                                                )
                                              }
                                            >
                                              {languageData?.pay_single
                                                ? languageData?.pay_single[
                                                    webSettingData?.language
                                                  ]
                                                : "pay_single"}
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
                                {busList?.ticketTracking.length > 1 && (
                                  <StyledPopup
                                    trigger={
                                      <PaymentButton
                                        onClick={() => handlePayment}
                                        btnBgColor={webSettingData?.buttoncolor}
                                        btnBgHvColor={
                                          webSettingData?.buttoncolorhover
                                        }
                                        btnTextColor={
                                          webSettingData?.buttontextcolor
                                        }
                                      >
                                        {languageData?.pay_for_both_tickets
                                          ? languageData?.pay_for_both_tickets[
                                              webSettingData?.language
                                            ]
                                          : "pay_for_both_tickets"}
                                      </PaymentButton>
                                    }
                                  >
                                    {(close) => (
                                      <Modal>
                                        <Close onClick={close}>&times;</Close>

                                        <Content>
                                          <CustomerBookingId>
                                            {
                                              busList?.ticketTracking[1]
                                                ?.booking_id
                                            }
                                          </CustomerBookingId>
                                          <Textarea
                                            name=""
                                            id=""
                                            cols="30"
                                            rows="4"
                                            placeholder="comments"
                                            onChange={(e) =>
                                              setComments(e.target.value)
                                            }
                                          ></Textarea>
                                          <PaymentList>
                                            {allPaymentGateway?.map((item) => (
                                              <li key={item.id}>
                                                <Input
                                                  type="radio"
                                                  id={item?.name}
                                                  name="payment"
                                                  value={item?.name}
                                                  onChange={(e) =>
                                                    setSinglePayment(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <PaymentTitle
                                                  htmlFor={item?.name}
                                                >
                                                  {item?.name}
                                                </PaymentTitle>
                                              </li>
                                            ))}
                                          </PaymentList>

                                          <PaymentWrapper>
                                            {!loading ? (
                                              <PaymentBtn
                                                onClick={() =>
                                                  handleSubmitPayment(
                                                    busList?.ticketTracking[1],
                                                    1
                                                  )
                                                }
                                              >
                                                {languageData?.pay_for_both_tickets
                                                  ? languageData
                                                      ?.pay_for_both_tickets[
                                                      webSettingData?.language
                                                    ]
                                                  : "pay_for_both_tickets"}
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
                              </>
                            )}
                        </DownloadButtonWrapper>
                      </>
                    )}
                  </div>

                  {/* {pathName && (
    <DownloadButtonWrapper>
      <DownloadButton onClick={() => handleDownload("ticket")}>Download</DownloadButton>
    </DownloadButtonWrapper>
  )} */}
                </InnerBody>
              )}
            </>
          )}
        </div>
      )}

      {pathName && <Footer />}
    </>
  );
};

export default TicketTraking;

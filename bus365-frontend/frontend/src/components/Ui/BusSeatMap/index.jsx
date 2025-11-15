/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import available from "../../../assets/available.svg";
import steering from "../../../assets/images/steering.svg";
import selectedSeatIcon from "../../../assets/selected-seat.svg";
import unavailable from "../../../assets/unavailable.svg";
import Alert from "../../../bootstrap/Alert";
import BusFacilities from "../BusFacilities/index.jsx";
import SeatCount from "../SeatCount/index.jsx";
import { toast } from "react-toastify";
import {
  BusFacilitiesWrapper,
  BusSeatMapWrapper,
  LeftSide,
  LeftSideWrapper,
  RightSide,
  SeatCoutWrapper,
  SeatLegend,
  SeatType,
  SeatTypeHeader,
  SeatUl,
  SeatWrapper,
  SingleSeat,
  Steering,
} from "./BusSeatMap.styles.js";
import fetchSeatData from "../../../helpers/fetch-seat-data";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";

const BusSeatMap = ({
  tripData,
  busDetails,
  selectedSeatNumbers,
  setSelectedSeatNumbers,
  showBusSeat,
  luggageSettings,
  setNewLuggageData,
  newLuggageData,
  specialLuggageName,
  setSpecialLuggageName,
}) => {
  const router = useHistory();

  const {
    totalSelectSeat,
    setTotalSelectSeat,
    childrenSelectSeat,
    setChildrenSelectSeat,
    adultSelectSeat,
    setAdultSelectSeat,
    specialSelectSeat,
    setSpecialSelectSeat,
    setLuggageData,
  } = busDetails;

  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );

  const [seats, setSeats] = useState([]);
  const [selectSeat, setSelectSeat] = useState(false);
  const [seatSelectionError, setSeatSelectionError] = useState("");
  const seatNumberRef = useRef(null);
  const [date, setDate] = useState(null);
  // const [languageData, setLanguageData] = useState();

  const fetchSeat = async () => {
    const searchInfo = JSON.parse(localStorage.getItem("searchInfo"));
    setDate(searchInfo?.journeydate);

    if (date && tripData?.subtripId) {
      const result = await fetchSeatData(date, tripData?.subtripId);

      // Check response data
      if (!result?.seatlayout) {
        toast.error(
          "Something wrong with the trip. Please get in touch with the software administrator."
        );

        router.push("/");
      } else {
        setSeats(result?.seatlayout);
      }
    }
  };

  useEffect(() => {
    fetchSeat();
  }, [tripData?.subtripId, date]);



  console.log(childrenSelectSeat, adultSelectSeat, specialSelectSeat);
  const seatSelectionStatus = (e) => {
    if (e.currentTarget.dataset.seatStatus === "available") {
      setTotalSelectSeat((prevState) => {
        const newTotal = Number(prevState) + 1;

        handleAdultSelectSeat(
          Math.max(
            0,
            newTotal - (Number(childrenSelectSeat) + Number(specialSelectSeat))
          )
        );

        return newTotal;
      });

      e.currentTarget.dataset.seatStatus = "unavailable";
      e.currentTarget.querySelector("img").src = selectedSeatIcon;
    } else if (e.currentTarget.dataset.seatStatus === "unavailable") {
      setTotalSelectSeat((prevState) => {
        const newTotal = Number(prevState) - 1;

        handleAdultSelectSeat(
          Math.max(
            0,
            newTotal - (Number(childrenSelectSeat) + Number(specialSelectSeat))
          )
        );

        return newTotal;
      });
      e.currentTarget.querySelector("img").src = available;
      e.currentTarget.dataset.seatStatus = "available";
    }
  };

  const handleAdultSelectSeat = (num) => {
    setAdultSelectSeat(num);
  };

  const handleSelectSeat = (event, selectedSeat) => {
    if (selectedSeat?.isBooked) {
      setSeatSelectionError("Seat is not available");
      return;
    }

    if (totalSelectSeat >= webSettingData?.max_ticket) {
      if (event.currentTarget.dataset.seatStatus === "unavailable") {
        setTotalSelectSeat((prevState) => {
          return prevState - 1;
        });

        setSelectedSeatNumbers((prevState) => {
          const index = prevState.findIndex(
            (seat) => seat.seat_no === selectedSeat.seat_no
          );

          return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
        });

        event.currentTarget.querySelector("img").src = available;
        event.currentTarget.dataset.seatStatus = "available";
        setSeatSelectionError("");
        return;
      }

      setSeatSelectionError(
        `Sorry, you can not book more than ${webSettingData?.max_ticket} seats at a time`
      );

      return;
    } else if (totalSelectSeat === webSettingData?.max_ticket) {
      setSeatSelectionError("");
    }
    seatSelectionStatus(event);

    if (event.currentTarget.dataset.seatStatus === "unavailable") {
      setSeatSelectionError("");
      setSelectedSeatNumbers((prevState) => [
        ...prevState,
        { ...selectedSeat },
      ]);
    } else if (event.currentTarget.dataset.seatStatus === "available") {
      setSeatSelectionError("");
      setSelectedSeatNumbers((prevState) => {
        const index = prevState.findIndex(
          (seat) => seat.seat_no === selectedSeat.seat_no
        );
        return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
      });
    }
  };

  return (
    <BusSeatMapWrapper>
      <LeftSideWrapper>
        <div
          style={{
            borderWidth: "6px",
            borderStyle: "solid",
            borderColor:
              "rgb(119, 119, 119) rgb(211, 213, 215) rgb(195, 195, 195)",
            width: "100%",
            height: "100%",
            margin: "0px auto",
            maxWidth: "320px",
          }}
        >
          <table
            style={{
              width: "100%",
            }}
            className="bus_seat_plan_table"
          >
            <tbody>
              {seats?.rowData?.map((item, index) => (
                <tr key={index}>
                  {item?.columns?.map((seatData, idx) => (
                    <>
                      {seatData?.column_element === "Blank" ? (
                        <td key={idx}></td>
                      ) : (
                        <td
                          key={idx}
                          ref={seatNumberRef}
                          onClick={(e) => handleSelectSeat(e, seatData)}
                          data-seat-status={
                            seatData?.column_element === "Driver"
                              ? "steering"
                              : seatData?.isBooked
                              ? "unavailable"
                              : "available"
                          }
                          data-seatno={seatData.seat_no}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: "35px",
                              height: "35px",
                            }}
                          >
                            <img
                              src={
                                seatData?.column_element === "Driver"
                                  ? steering
                                  : seatData?.isBooked
                                  ? unavailable
                                  : available
                              }
                              alt="seat"
                            />
                            {seatData?.seat_no && (
                              <span
                                className="seat_layout"
                                style={{
                                  position: "absolute",
                                  top: "37%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  fontSize: "13px",
                                }}
                              >
                                {seatData?.seat_no}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LeftSideWrapper>

      <RightSide>
        {seatSelectionError && (
          <Alert type="danger">{seatSelectionError}</Alert>
        )}

        <SeatTypeHeader>
          {languageData?.booking_page_seat_legend[webSettingData?.language]}
        </SeatTypeHeader>
        <SeatLegend>
          <SeatType>
            <img src={available} alt="Available Seat" />
            <div>
              {languageData?.booking_page_available[webSettingData?.language]}
            </div>
          </SeatType>
          <SeatType>
            <img src={unavailable} alt="Unavailable Seat" />
            <div>
              {languageData?.booking_page_unavailable[webSettingData?.language]}
            </div>
          </SeatType>
          <SeatType>
            <img src={selectedSeatIcon} alt="Selected Seat" />
            <div>
              {languageData?.booking_page_book[webSettingData?.language]}
            </div>
          </SeatType>
        </SeatLegend>

        <SeatCoutWrapper>
          <SeatCount
            luggageSettings={luggageSettings}
            totalSelectSeat={totalSelectSeat}
            setTotalSelectSeat={setTotalSelectSeat}
            childrenSelectSeat={childrenSelectSeat}
            setChildrenSelectSeat={setChildrenSelectSeat}
            specialSelectSeat={specialSelectSeat}
            setSpecialSelectSeat={setSpecialSelectSeat}
            setAdultSelectSeat={setAdultSelectSeat}
            adultSelectSeat={adultSelectSeat}
            setLuggageData={setLuggageData}
            setNewLuggageData={setNewLuggageData}
            newLuggageData={newLuggageData}
            specialLuggageName={specialLuggageName}
            setSpecialLuggageName={setSpecialLuggageName}
          />
        </SeatCoutWrapper>

        <BusFacilitiesWrapper>
          <BusFacilities facility={tripData.facility} />
        </BusFacilitiesWrapper>
      </RightSide>
    </BusSeatMapWrapper>
  );
};

export default BusSeatMap;

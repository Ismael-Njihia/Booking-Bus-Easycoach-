import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Buffer } from "buffer";
import { useHistory } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import Ul from "../../../bootstrap/Ul";
import { isRegurnDateValid } from "../../../helpers";
import { addBusName, addError } from "../../../redux/action/busAction";
import BoardingAndDropping from "../BoardingAndDropping/index.jsx";
import BusSeatMap from "../BusSeatMap/index.jsx";
import SelectedBoardingAndDropping from "../SelectedBoardingAndDropping/index.jsx";
import {
  Amount,
  BookingBtn,
  BusSeatWrapper,
  FareDetails,
  FareHeader,
  LuggageDetailsWrapper,
  LuggageItem,
  PriceItem,
  SeatNo,
  TaxText,
} from "./BustSeat.styles.js";

const BusSeat = ({ tripData, setFirstJourneyDateCheck }) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [boardingInformation, setBoardingInformation] = useState({
    time: "",
    detail: "",
    standName: "",
    stand_id: "",
  });

  const [luggageData, setLuggageData] = useState(null);

  const [newLuggageData, setNewLuggageData] = useState({
    free_luggage_pcs: "",
    free_luggage_kg: "",
    paid_max_luggage_pcs: "",
    paid_max_luggage_kg: "",
  });

  const [specialLuggageName, setSpecialLuggageName] = useState("");

  const [totalLuggageCost, setTotalLuggageCost] = useState(0);

  const [droppingInformation, setDroppingInformation] = useState({
    time: "",
    detail: "",
    standName: "",
    stand_id: "",
  });

  const [totalSelectSeat, setTotalSelectSeat] = useState("");
  const [childrenSelectSeat, setChildrenSelectSeat] = useState("");
  const [adultSelectSeat, setAdultSelectSeat] = useState(totalSelectSeat);
  const [specialSelectSeat, setSpecialSelectSeat] = useState("");
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
  const [totalSeats, setTotalSeats] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [journeyInfo, setJourneyInfo] = useState(null);
  // const [languageData, setLanguageData] = useState();

  useEffect(() => {
    setTotalSeats(
      Number(childrenSelectSeat) +
        Number(adultSelectSeat) +
        Number(specialSelectSeat)
    );
  }, [childrenSelectSeat, adultSelectSeat, specialSelectSeat]);

  useEffect(() => {
    setSearchData(JSON.parse(localStorage.getItem("searchInfo")));
    setJourneyInfo(JSON.parse(localStorage.getItem("journeyInfo")));
  }, []);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  const busDetails = {
    totalSelectSeat,
    setTotalSelectSeat,
    childrenSelectSeat,
    setChildrenSelectSeat,
    adultSelectSeat,
    setAdultSelectSeat,
    specialSelectSeat,
    setSpecialSelectSeat,
  };

  const ticketPrice = () => {
    return (
      childrenSelectSeat * tripData.child_fair +
      adultSelectSeat * tripData.adult_fair +
      specialSelectSeat * tripData.special_fair
    );
  };

  const saveSeatBookingInfo = async (bookingInfo) => {
    if (
      (!isRegurnDateValid(searchData?.returnDate) &&
        moment(searchData?.journeydate).isBefore(searchData?.returnDate)) ||
      (moment(searchData?.journeydate).isSame(searchData?.returnDate) &&
        !journeyInfo)
    ) {
      const formData = new FormData();
      formData.append("pick_location_id", searchData?.dropLocation);
      formData.append("drop_location_id", searchData?.pickLocation);
      formData.append("journeydate", searchData?.returnDate);

      const response = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/triplist`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result?.status === "success") {
        dispatch(addBusName(result.data));
      } else if (result?.status === "failed") {
        dispatch(addError(result));
      }

      const searchInfo = {
        dropLocation: searchData.pickLocation,
        journeydate: searchData?.returnDate,
        pickLocation: searchData.dropLocation,
        returnDate: searchData?.journeydate,
      };

      const returnFirstJourneyInfo = {
        dropLocation: searchData.dropLocation,
        pickLocation: searchData.pickLocation,
        journeydate: searchData?.journeydate,
        returnDate: searchData?.returnDate,
      };

      localStorage.setItem("searchInfo", JSON.stringify(searchInfo));
      localStorage.setItem(
        "returnFirstJourneyInfo",
        JSON.stringify(returnFirstJourneyInfo)
      );

      //if return is more than journey date save the booking info into localStorage
      localStorage.setItem(
        "journeyInfo",
        JSON.stringify({
          ...bookingInfo,
          journeydate: searchData?.journeydate,
          returnDate: searchData?.returnDate,
          isRoundTrip: true,
        })
      );
    } else {
      //if no return date execute as journey info and save the journey info into localStorage
      //if return date is available, save the booking info as return ticket details into localStorage
      localStorage.setItem(
        "bookingInfo",
        JSON.stringify({ ...bookingInfo, isRoundTrip: false })
      );
      history.push("/checkout");
    }
  };

  const handleBooking = async () => {
    setFirstJourneyDateCheck(true);
    setLoading(true);

    let ticket_token = localStorage.getItem("ticket_token");

    if (!ticket_token) {
      ticket_token = [...Array(15)]
        .map(() => Math.random().toString(36)[2])
        .join("");
      localStorage.setItem("ticket_token", ticket_token);
    }

    let formdata = new FormData();
    formdata.append("subtrip_id", tripData.subtripId);
    formdata.append("ticket_token", ticket_token);
    formdata.append(
      "seat_names",
      selectedSeatNumbers?.map((seat) => seat.seat_no).join(",")
    );
    formdata.append("journey_date", searchData?.journeydate);

    const checkseats = await fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/checkseats`,
      {
        method: "POST",
        body: formdata,
      }
    );

    const result = await checkseats.json();

    if (result.status === "success") {
      if (String(totalSelectSeat) === "0") {
        toast.error("Please select seat first");
        setLoading(false);
        return;
      } else if (Number(totalSelectSeat) !== Number(totalSeats)) {
        toast.error("selected seat and total seat must be equal");
        setLoading(false);
        return;
      } else if (childrenSelectSeat > tripData.child_seat) {
        toast.error(
          `For children, only ${tripData.child_seat} seats are available`
        );
        setLoading(false);
        return;
      } else if (specialSelectSeat > tripData.special_seat) {
        toast.error(`Only ${tripData.special_seat} seats are available`);
        setLoading(false);
        return;
      } else if (!boardingInformation.stand_id) {
        toast.error("Please select boarding point");
        setLoading(false);
        return;
      } else if (!droppingInformation.stand_id) {
        toast.error("Please select dropping point");
        setLoading(false);
        return;
      } else if (totalSeats > webSettingData?.max_ticket) {
        toast.error(
          `Your total seats are ${totalSeats}. You may add only 4 seats at a time.`
        );
        setLoading(false);
        return;
      }

      const { free_luggage_kg, free_luggage_pcs, ...restNewLuggage } = {
        ...newLuggageData,
      };

      const {
        paid_max_luggage_pcs,
        paid_max_luggage_kg: special_max_luggage_pcs,
      } = restNewLuggage;

      const paidLuggagePriceTotal =
        luggageData?.price_pcs * paid_max_luggage_pcs;

      const specialLuggagePriceTotal =
        Number(luggageData?.special_price_pcs) * special_max_luggage_pcs;

      const bookingInfo = {
        trip_id: tripData.trip_id,
        subtripId: tripData.subtripId,
        pickstand: boardingInformation.stand_id,
        dropstand: droppingInformation.stand_id,
        totalprice: String(ticketPrice()),
        grandtotal: String(ticketPrice()),
        aseat: String(adultSelectSeat),
        cseat: String(childrenSelectSeat),
        spseat: String(specialSelectSeat),
        vehicle_id: tripData.vehicle_id,
        seatnumbers: selectedSeatNumbers?.map((seat) => seat.seat_no).join(","),
        totalseat: totalSeats,
        luggageInfo: {
          paid_max_luggage_pcs,
          special_max_luggage_pcs,
          luggageCost: totalLuggageCost,
          price_pcs: paidLuggagePriceTotal,
          special_price_pcs: luggageData?.special_price_pcs,
        },
        specialLuggage:
          specialLuggageName == "undefined" || undefined
            ? ""
            : specialLuggageName,
      };

      saveSeatBookingInfo(bookingInfo);
    } else {
      setLoading(false);
      toast.error(result.message);
    }
  };

  // get luggage information
  const getLuggage = async () => {
    try {
      const luggage = await fetch(
        `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/luggage-setttings/${tripData?.subtripId}`
      );

      const result = await luggage.json();
      if (result.status === "success" && result?.luggageSettings) {
        setLuggageData(result.luggageSettings);
      } else {
        setLuggageData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tripData?.subtripId) {
      getLuggage();
    }
  }, [tripData]);

  useEffect(() => {
    if (newLuggageData) {
      const luggageQtyPrice =
        luggageData?.price_pcs * newLuggageData?.paid_max_luggage_pcs;
      const luggageWeightPrice =
        luggageData?.special_price_pcs *
        1 *
        newLuggageData?.paid_max_luggage_kg;

      setTotalLuggageCost(luggageQtyPrice + luggageWeightPrice);
    }
  }, [newLuggageData]);

  return (
    <BusSeatWrapper>
      <BusSeatMap
        tripData={tripData}
        busDetails={busDetails}
        selectedSeatNumbers={selectedSeatNumbers}
        setSelectedSeatNumbers={setSelectedSeatNumbers}
        luggageSettings={luggageData}
        setLuggageData={setLuggageData}
        setNewLuggageData={setNewLuggageData}
        newLuggageData={newLuggageData}
        specialLuggageName={specialLuggageName}
        setSpecialLuggageName={setSpecialLuggageName}
      />
      {/* end busSeat map */}

      <div>
        <BoardingAndDropping
          id={tripData?.id}
          tripId={tripData?.trip_id}
          setBoardingInfromation={setBoardingInformation}
          setDroppingInformation={setDroppingInformation}
        />
        {/* end BoardingAndDropping  */}

        <SelectedBoardingAndDropping
          boardingInfromation={boardingInformation}
          droppingInformation={droppingInformation}
        />
        {/* end SelectedBoardingAndDropping */}

        {selectedSeatNumbers?.length > 0 && (
          <SeatNo>
            <div>Seat No</div>
            <div>{selectedSeatNumbers.map((seat) => `${seat.seat_no}, `)}</div>
          </SeatNo>
        )}
        {/* end seat no */}

        <FareDetails>
          <FareHeader>
            {
              languageData?.booking_page_fare_details_title[
                webSettingData?.language
              ]
            }
          </FareHeader>
          <Ul style={{ flexDirection: "column" }}>
            <PriceItem>
              <div>
                {
                  languageData?.booking_page_child_price_title[
                    webSettingData?.language
                  ]
                }
              </div>
              <div>
                {`${webSettingData?.currency_code} `}
                {childrenSelectSeat * tripData.child_fair}
              </div>
            </PriceItem>
            <PriceItem>
              <div>
                {
                  languageData?.booking_page_adult_price_title[
                    webSettingData?.language
                  ]
                }
              </div>
              <div>
                {`${webSettingData?.currency_code} `}
                {adultSelectSeat * tripData.adult_fair}
              </div>
            </PriceItem>
            <PriceItem>
              <div>
                {
                  languageData?.booking_page_special_price_title[
                    webSettingData?.language
                  ]
                }
              </div>
              <div>
                {`${webSettingData?.currency_code} `}
                {specialSelectSeat * tripData.special_fair}
              </div>
            </PriceItem>

            {webSettingData?.luggage_service && (
              <LuggageDetailsWrapper>
                <LuggageItem>
                  <div>
                    {/* {
                           languageData?.booking_page_special_price_title[
                              webSettingData?.language
                           ]
                        } */}
                    {languageData?.paid_luggage
                      ? languageData?.paid_luggage[webSettingData?.language]
                      : "paid_luggage"}
                    ({newLuggageData?.paid_max_luggage_pcs || 0} Pcs )
                  </div>
                  <div>
                    {`${webSettingData?.currency_code} `}
                    {luggageData?.price_pcs *
                      newLuggageData?.paid_max_luggage_pcs}
                  </div>
                </LuggageItem>
                <LuggageItem>
                  <div>
                    {/* {
                           languageData?.booking_page_special_price_title[
                              webSettingData?.language
                           ]
                        } */}
                    {languageData?.special_luggage
                      ? languageData?.special_luggage[webSettingData?.language]
                      : "special_luggage"}
                    ({newLuggageData?.paid_max_luggage_kg || 0} Pcs )
                  </div>
                  <div>
                    {`${webSettingData?.currency_code} `}
                    {luggageData?.special_price_pcs *
                      1 *
                      newLuggageData?.paid_max_luggage_kg}
                  </div>
                </LuggageItem>
                <LuggageItem>
                  <div>
                    {/* {
                           languageData?.booking_page_special_price_title[
                              webSettingData?.language
                           ]
                        } */}
                    {languageData?.ticket_price
                      ? languageData?.ticket_price[webSettingData?.language]
                      : "ticket_price"}
                  </div>
                  <div>
                    {`${webSettingData?.currency_code} `}
                    {ticketPrice()}
                  </div>
                </LuggageItem>
              </LuggageDetailsWrapper>
            )}

            <PriceItem>
              <Amount>
                {
                  languageData?.booing_page_total_ammount_title[
                    webSettingData?.language
                  ]
                }
              </Amount>
              <Amount>
                {`${webSettingData?.currency_code} `}
                {totalLuggageCost
                  ? totalLuggageCost + ticketPrice()
                  : ticketPrice()}
              </Amount>
            </PriceItem>
          </Ul>
        </FareDetails>
        {/* end FareDetails */}

        <TaxText>
          {languageData?.booking_page_tax_message[webSettingData?.language]}
        </TaxText>
        {/* end TaxText */}

        <BookingBtn
          onClick={(e) => handleBooking()}
          disabled={isLoading}
          btnbgcolor={webSettingData?.buttoncolor}
          btnbghvcolor={webSettingData?.buttoncolorhover}
          btntextcolor={webSettingData?.buttontextcolor}
        >
          {
            languageData?.booking_page_Proccess_to_book_btn[
              webSettingData?.language
            ]
          }
        </BookingBtn>
        {/* end Button */}
      </div>
    </BusSeatWrapper>
  );
};

export default BusSeat;

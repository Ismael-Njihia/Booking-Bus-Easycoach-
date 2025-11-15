import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { dateForm } from "../../../helpers";

import {
  Amount,
  AmountProperty,
  AmountWrapper,
  BookingTime,
  Discount,
  DropLocation,
  Due,
  JourneyDetails,
  JourneyDetailsProperty,
  JourneyTime,
  PickLocation,
  Seat,
  SeatAndAmount,
  SeatNumber,
  SeatProperty,
  Time,
  TimeProperty,
  Total,
  TotalTax,
  Wrapper,
  Luggage,
  LuggageFirst,
} from "../TicketTrackingBody/TicketTrackingBody.style";
import { convertTo12HourFormat } from "../../../utils/time24converter";

const RegularTicketTrackingBody = ({ regularBookingTraking }) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const bookingTime =
    regularBookingTraking?.created_at &&
    convertTo12HourFormat(regularBookingTraking.created_at.split(" ")[1]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [droppingPoint, setDroppingPoint] = useState(null);
  const [standLists, setStandLists] = useState(null);
  // const [languageData, setLanguageData] = useState();

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/triplist/boardings/${regularBookingTraking?.trip_id}`
    )
      .then((res) => res.json())
      .then((data) => setBoardingPoint(data.data));

    fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/triplist/droppings/${regularBookingTraking?.trip_id}`
    )
      .then((res) => res.json())
      .then((data) => setDroppingPoint(data.data));

    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/stands`)
      .then((res) => res.json())
      .then((data) => setStandLists(data.data));
  }, [regularBookingTraking]);
  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  const PicktandName = (id) => {
    const findNumber = boardingPoint?.find((item) => item?.id === id);
    const findName = standLists?.find(
      (item) => item?.id === findNumber?.stand_id
    );
    return findName?.name;
  };

  const dropStandName = (id) => {
    const findNumber = droppingPoint?.find((item) => item?.id === id);
    const findName = standLists?.find(
      (item) => item?.id === findNumber?.stand_id
    );
    return findName?.name;
  };

  return (
    <Wrapper>
      <JourneyDetails>
        <PickLocation>
          <JourneyDetailsProperty>
            {
              languageData?.ticket_traking_page_pick_laction[
                webSettingData?.language
              ]
            }{" "}
          </JourneyDetailsProperty>
          : {PicktandName(regularBookingTraking?.pick_stand_id)}
        </PickLocation>
        <DropLocation>
          <JourneyDetailsProperty>
            {
              languageData?.ticket_traking_page_drop_laction[
                webSettingData?.language
              ]
            }{" "}
          </JourneyDetailsProperty>
          : {dropStandName(regularBookingTraking?.drop_stand_id)}
        </DropLocation>
      </JourneyDetails>

      <Time>
        <BookingTime>
          <TimeProperty>
            {
              languageData?.ticket_traking_page_booking_date[
                webSettingData?.language
              ]
            }
          </TimeProperty>
          : {dateForm(regularBookingTraking?.created_at)}{" "}
        </BookingTime>
        <JourneyTime>
          <TimeProperty>
            {
              languageData?.ticket_traking_page_journey_date[
                webSettingData?.language
              ]
            }
          </TimeProperty>
          : {dateForm(regularBookingTraking?.journeydata)}
        </JourneyTime>
      </Time>
      <div style={{ marginTop: "10px" }}>
        <Time>
          <BookingTime>
            <TimeProperty>
              {/* {
                     languageData?.ticket_traking_page_booking_date[
                        webSettingData?.language
                     ]
                  } */}
              Booking Time
            </TimeProperty>
            : {bookingTime && bookingTime}
          </BookingTime>
          <JourneyTime>
            <TimeProperty>
              {/* {
                     languageData?.ticket_traking_page_journey_date[
                        webSettingData?.language
                     ]
                  } */}
              Journey Start Time
            </TimeProperty>
            : {regularBookingTraking?.trip_start_time}
          </JourneyTime>
        </Time>
      </div>
      {regularBookingTraking?.special_luggage && (
        <SeatAndAmount>
          <Seat>
            <SeatProperty>
              {/* {
                     languageData?.ticket_traking_page_seat_number[
                        webSettingData?.language
                     ]
                  } */}
              Special Luggage
            </SeatProperty>
          </Seat>
          <AmountWrapper>
            <Amount>{regularBookingTraking.special_luggage}</Amount>
          </AmountWrapper>
        </SeatAndAmount>
      )}
      <SeatAndAmount>
        <Seat>
          <SeatProperty>
            {
              languageData?.ticket_traking_page_seat_number[
                webSettingData?.language
              ]
            }
          </SeatProperty>

          <SeatNumber> {regularBookingTraking?.seatnumber}</SeatNumber>
        </Seat>
        di
        <AmountWrapper>
          <AmountProperty>
            {
              languageData?.ticket_traking_page_ammount[
                webSettingData?.language
              ]
            }
          </AmountProperty>

          <Amount>
            {" "}
            {webSettingData?.currency_symbol}
            {regularBookingTraking?.price}
          </Amount>
        </AmountWrapper>
      </SeatAndAmount>
      <LuggageFirst>
        <div>
          {/* {
                  languageData?.ticket_traking_page_discount[
                     webSettingData?.language
                  ]
               } */}
          {languageData?.total_paid_luggage_fee
            ? languageData?.total_paid_luggage_fee[webSettingData?.language]
            : "total_paid_luggage_fee"}{" "}
          ({regularBookingTraking?.paid_max_luggage_pcs} Pcs)
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.total_paid_luggage_price}
        </div>
      </LuggageFirst>
      <Luggage>
        <div>
          {/* {
                  languageData?.ticket_traking_page_discount[
                     webSettingData?.language
                  ]
               } */}
          Total Special Luggage Fee (
          {regularBookingTraking?.special_max_luggage_pcs} Pcs)
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.total_special_luggage_price}
        </div>
      </Luggage>
      <Luggage>
        <div>
          {/* {
                  languageData?.ticket_traking_page_discount[
                     webSettingData?.language
                  ]
               } */}
          Sub Total
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.sub_total}
        </div>
      </Luggage>

      <Discount>
        <div>
          {" "}
          {languageData?.ticket_traking_page_discount[webSettingData?.language]}
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.discount}
        </div>
      </Discount>
      <TotalTax>
        <div>
          {
            languageData?.ticket_traking_page_total_tax[
              webSettingData?.language
            ]
          }
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.totaltax}
        </div>
      </TotalTax>
      <Total>
        <div>
          {/* {languageData?.ticket_traking_page_total[webSettingData?.language]} */}
          Grand Total
        </div>
        <div>
          {webSettingData?.currency_symbol}
          {regularBookingTraking?.grand_total}
        </div>
      </Total>
      {regularBookingTraking?.payment_status === "unpaid" && (
        <Due>
          <div>
            {languageData?.ticket_traking_page_due[webSettingData?.language]}
          </div>
          <div>
            {" "}
            {webSettingData?.currency_symbol}
            {regularBookingTraking?.grand_total}
          </div>
        </Due>
      )}
    </Wrapper>
  );
};

export default RegularTicketTrackingBody;

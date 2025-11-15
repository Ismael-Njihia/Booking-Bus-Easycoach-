import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Adult,
  Children,
  FreeLuggage,
  InputArea,
  InputHeader,
  PaidLuggage,
  PriceField,
  SingleInput,
  Special,
  SpecialLuggageWrap,
} from "./SeatCount.styles.js";
import { CommonNavItem } from "../BoardingAndDropping/BoardingAndDropping.styles.js";
import { Input } from "../TrackOrder/TrackOrder.styles.js";
import { CheckBoxUl, CommonLabel } from "./../SideBar/SideBar.styles.js";

const SeatCount = ({
  totalSelectSeat,
  setTotalSelectSeat,
  setAdultSelectSeat,
  adultSelectSeat,
  setSpecialSelectSeat,
  childrenSelectSeat,
  setChildrenSelectSeat,
  specialSelectSeat,
  luggageSettings,
  setLuggageData,
  setNewLuggageData,
  newLuggageData,
  setSpecialLuggageName,
  specialLuggageName,
}) => {
  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [showSpecialLuggage, setShowSpecialLuggage] = useState(true);

  const [bookingData, setBookingData] = useState(null);
  // const [languageData, setLanguageData] = useState();

  useEffect(() => {
    const bookingInfo = JSON.parse(localStorage.getItem("bookingInfo"));
    setBookingData(bookingInfo);
  }, []);
  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  const handleChildren = (e) => {
    if (e.target.value < 0) return;

    // Ensure totalSet is not negative
    const totalSet = Math.max(0, totalSelectSeat - Number(specialSelectSeat));

    if (e.target.value > totalSet) {
      toast.error(
        languageData?.seat_limit_exceeded
          ? languageData?.seat_limit_exceeded[webSettingData?.language]
          : "seat_limit_exceeded"
      );
    } else {
      if (e.target.value > Number(bookingData?.cseat)) {
        toast.error(
          `${bookingData?.cseat} ${
            languageData?.children_seats_only
              ? languageData?.children_seats_only[webSettingData?.language]
              : "children_seats_only"
          }`
        );
        setChildrenSelectSeat(e.target.value - 1);
        return;
      }
      setChildrenSelectSeat(e.target.value);

      setAdultSelectSeat(
        Number(specialSelectSeat) + totalSelectSeat - e.target.value
      );
    }
  };

  const handleAdult = (e) => {
    if (e.target.value < 0) return;

    const selectedSeats = Number(totalSelectSeat);

    if (e.target.value > selectedSeats) {
      toast.error(
        `${
          languageData?.you_only_selected
            ? languageData?.you_only_selected[webSettingData?.language]
            : "you_only_selected"
        } ${selectedSeats} ${
          languageData?.seats
            ? languageData?.seats[webSettingData?.language]
            : "seats"
        }`
      );
      setAdultSelectSeat(selectedSeats); // Set to max available seats
    } else {
      setAdultSelectSeat(e.target.value);
    }
  };

  const handleSpecial = (e) => {
    if (e.target.value < 0) return;

    // Ensure totalSet is not negative
    const totalSet = Math.max(0, totalSelectSeat - Number(childrenSelectSeat));

    if (e.target.value > totalSet) {
      toast.error(
        languageData?.seat_limit_exceeded
          ? languageData?.seat_limit_exceeded[webSettingData?.language]
          : "seat_limit_exceeded"
      );
    } else {
      if (e.target.value > Number(bookingData?.spseat)) {
        toast.error(
          `${bookingData?.spseat}${
            languageData?.special_seats_only
              ? languageData?.special_seats_only[webSettingData?.language]
              : "special_seats_only"
          }`
        );
        setSpecialSelectSeat(e.target.value - 1);
        return;
      }
      setSpecialSelectSeat(e.target.value);

      setAdultSelectSeat(
        totalSelectSeat - Number(childrenSelectSeat) - e.target.value
      );
    }
  };

  const handleLuggage = (e, canTakeTotal) => {
    const totalSeat = totalSelectSeat - Number(childrenSelectSeat);
    const value = Number(e.target.value) || "";
    const limit = canTakeTotal;
    const target = e.target.id;
    console.log(totalSeat, canTakeTotal);

    switch (target) {
      // case 'free_luggage_pcs':
      //    if (value > limit) {
      //       toast.error(`You can't take more than ${limit}`);
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_pcs: limit,
      //       }));
      //       return;
      //    } else if (value < 0) {
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_pcs: '',
      //       }));
      //    } else {
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_pcs: value,
      //       }));
      //    }
      //    break;

      case "paid_max_luggage_pcs":
        if (value > limit) {
          toast.error(
            `${
              languageData?.you_cant_take_more_than
                ? languageData?.you_cant_take_more_than[
                    webSettingData?.language
                  ]
                : "you_cant_take_more_than"
            } ${limit}`
          );
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_pcs: limit,
          }));
          return;
        } else if (value < 0) {
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_pcs: "",
          }));
        } else {
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_pcs: value,
          }));
        }
        break;

      // case 'free_luggage_kg':
      //    if (value > limit) {
      //       toast.error(`You can't take more than ${limit}`);
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_kg: limit,
      //       }));
      //       return;
      //    } else if (value < 0) {
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_kg: '',
      //       }));
      //    } else {
      //       setNewLuggageData((prev) => ({
      //          ...prev,
      //          free_luggage_kg: value,
      //       }));
      //    }
      //    break;

      case "paid_max_luggage_kg":
        if (value > limit) {
          toast.error(
            `${
              languageData?.you_cant_take_more_than
                ? languageData?.you_cant_take_more_than[
                    webSettingData?.language
                  ]
                : "you_cant_take_more_than"
            } ${limit}`
          );
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_kg: limit,
          }));
          return;
        } else if (value < 0) {
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_kg: "",
          }));
        } else {
          setNewLuggageData((prev) => ({
            ...prev,
            paid_max_luggage_kg: value,
          }));
        }
        break;

      default:
        break;
    }
  };
  console.log(luggageSettings);

  return (
    <>
      {webSettingData?.luggage_service && (
        <div style={{ color: "#E5343D" }}>
          <p>
            ***{" "}
            {languageData?.one_luggage
              ? languageData?.one_luggage[webSettingData?.language]
              : "one_luggage"}{" "}
            {""}
            <strong>{luggageSettings?.free_luggage_kg}</strong>{" "}
            {languageData?.kg_is_free
              ? languageData?.kg_is_free[webSettingData?.language]
              : "kg_is_free"}
            .
          </p>
          <p>
            ***{" "}
            {languageData?.special_luggage
              ? languageData?.special_luggage[webSettingData?.language]
              : "special_luggage"}
            (
            {languageData?.max_length
              ? languageData?.max_length[webSettingData?.language]
              : "max_length"}{" "}
            <strong>{luggageSettings?.max_length}</strong>{" "}
            {languageData?.meters
              ? languageData?.meters[webSettingData?.language]
              : "meters"}{" "}
            {languageData?.and
              ? languageData?.and[webSettingData?.language]
              : "and"}{" "}
            {languageData?.max_weight
              ? languageData?.max_weight[webSettingData?.language]
              : "max_weight"}{" "}
            {""}
            <strong>{luggageSettings?.max_weight}</strong> kg)
          </p>
        </div>
      )}

      <InputArea>
        <Children>
          <InputHeader htmlFor="children">
            {languageData?.booking_page_children_seat[webSettingData?.language]}
          </InputHeader>
          <SingleInput
            id="children"
            type="number"
            inputProps={{ min: 0, max: bookingData?.cseat }}
            min={0}
            max={bookingData?.cseat}
            value={childrenSelectSeat}
            disabled={Number(bookingData?.cseat == 0)}
            onChange={handleChildren}
            placeholder="0"
          />
        </Children>
        {/* end children */}
        <Adult>
          <InputHeader htmlFor="adult">
            {languageData?.booking_page_adul_seat[webSettingData?.language]}
          </InputHeader>
          <SingleInput
            id="adult"
            type="number"
            value={adultSelectSeat}
            onChange={handleAdult}
            placeholder="0"
          />
        </Adult>
        {/* end Adult */}
        <Special>
          <InputHeader htmlFor="special">
            {languageData?.booking_page_special_seat[webSettingData?.language]}
          </InputHeader>
          <SingleInput
            id="special"
            type="number"
            inputProps={{ min: 0, max: bookingData?.spseat }}
            min={0}
            max={bookingData?.spseat}
            value={specialSelectSeat}
            disabled={Number(bookingData?.spseat == 0)}
            onChange={handleSpecial}
            placeholder="0"
          />
        </Special>

        {webSettingData?.luggage_service && (
          <>
            <PaidLuggage>
              <InputHeader htmlFor="paid_max_luggage_pcs">
                {languageData?.paid_luggage
                  ? languageData?.paid_luggage[webSettingData?.language]
                  : "paid_luggage"}
                (Max {luggageSettings?.paid_max_luggage_pcs} Pcs ) | Price Per
                Pcs ({luggageSettings?.price_pcs})
              </InputHeader>
              <SingleInput
                id="paid_max_luggage_pcs"
                type="number"
                value={newLuggageData?.paid_max_luggage_pcs}
                onChange={(e) =>
                  handleLuggage(e, luggageSettings?.paid_max_luggage_pcs)
                }
                placeholder="0"
              />
            </PaidLuggage>

            <PaidLuggage>
              <InputHeader htmlFor="paid_max_luggage_kg">
                {languageData?.special_luggage
                  ? languageData?.special_luggage[webSettingData?.language]
                  : "special_luggage"}{" "}
                (Max {luggageSettings?.special_max_luggage_pcs} Pcs ) |{" "}
                {languageData?.price_per_pcs
                  ? languageData?.price_per_pcs[webSettingData?.language]
                  : "price_per_pcs"}
                ({luggageSettings?.special_price_pcs})
              </InputHeader>
              <SingleInput
                id="paid_max_luggage_kg"
                type="number"
                value={newLuggageData?.paid_max_luggage_kg}
                onChange={(e) =>
                  handleLuggage(e, luggageSettings?.special_max_luggage_pcs)
                }
                placeholder="0"
              />
            </PaidLuggage>

            {/* end special */}
          </>
        )}

        {webSettingData?.luggage_service && (
          <SpecialLuggageWrap>
            <InputHeader htmlFor="free_luggage_pcs">
              {/* {
                     languageData?.booking_page_free_luggage_pcs[
                        webSettingData?.language
                     ]
                  } */}
              <p>
                <input
                  onChange={() => setShowSpecialLuggage((prev) => !prev)}
                  checked={showSpecialLuggage}
                  id="specialLuggage"
                  type="checkbox"
                />
                <span htmlFor="specialLuggage">
                  {languageData?.special_luggage
                    ? languageData?.special_luggage[webSettingData?.language]
                    : "special_luggage"}{" "}
                </span>
              </p>
            </InputHeader>
            {showSpecialLuggage && (
              <SingleInput
                id="free_luggage_pcs"
                type="text"
                value={specialLuggageName}
                onChange={(e) => setSpecialLuggageName(e.target.value)}
                placeholder={
                  languageData?.item_name_here
                    ? languageData?.item_name_here[webSettingData?.language]
                    : "item_name_here"
                }
              />
            )}
          </SpecialLuggageWrap>
        )}
      </InputArea>
      {/* end input area */}
    </>
  );
};

export default SeatCount;

import { toast } from "react-toastify";
import {
  addError,
  regularBookingInformation,
  ticketTracking,
  updateFareSummery,
} from "../../../redux/action/busAction";

// export const payLatter = async (
//   bookingData,
//   allBookingInformation,
//   dispatch
// ) => {
//   const {
//     totalprice,
//     passengerInformation,
//     values,
//     setValues,
//     paymentStutas,
//     paymentGateway,
//     fareSummry,
//     searchInfo,
//     bookingInfo,
//     journeyInfo,
//     returnSearchInfo,
//     returnFirstJourneyInfo,
//     returnAmmount,
//     discountValue,
//     subTripid,
//     journeyInfoTax,
//     bookingInfoTax,
//   } = allBookingInformation;
//   let firstNames = [],
//     lastNames = [],
//     mobileNumbers = [],
//     identityNumbers = [];

//   let returunfirstNames = [],
//     returunlastNames = [],
//     returunmobileNumbers = [],
//     returunidentityNumbers = [];

//   for (let [name, value] of Object.entries(values)) {
//     if (name.includes("name")) {
//       firstNames.push(value);
//     }
//     if (name.includes("first")) {
//       returunfirstNames.push(value);
//     }
//     if (name.includes("surName")) {
//       lastNames.push(value);
//     }
//     if (name.includes("second")) {
//       returunlastNames.push(value);
//     }
//     if (name.includes("contactNo")) {
//       mobileNumbers.push(value);
//     }
//     if (name.includes("third")) {
//       returunmobileNumbers.push(value);
//     }
//     if (name.includes("passPort")) {
//       identityNumbers.push(value);
//     }
//     if (name.includes("fourth")) {
//       returunidentityNumbers.push(value);
//     }
//   }
//   const returnAmount = localStorage.getItem("return");
//   const regularAmount = localStorage.getItem("regular");
//   const first_name_new = JSON.stringify(Object.assign({}, firstNames));
//   const last_name_new = JSON.stringify(Object.assign({}, lastNames));
//   const login_mobile_new = JSON.stringify(Object.assign({}, mobileNumbers));
//   const id_number_new = JSON.stringify(Object.assign({}, identityNumbers));
//   //retuen

//   const return_first_name_new = JSON.stringify(
//     Object.assign({}, returunfirstNames)
//   );
//   const return_last_name_new = JSON.stringify(
//     Object.assign({}, returunlastNames)
//   );
//   const return_login_mobile_new = JSON.stringify(
//     Object.assign({}, returunmobileNumbers)
//   );
//   const return_id_number_new = JSON.stringify(
//     Object.assign({}, returunidentityNumbers)
//   );
//   // const { luggageCost } = journeyInfo?.luggageInfo;

//   // const calcGrandTotal =
//   //   Number(bookingInfo?.grandtotal) +
//   //   luggageCost +
//   //   bookingInfoTax -
//   //   discountValue;
//   if (journeyInfo?.isRoundTrip) {

//     const {
//       paid_max_luggage_pcs,
//       paid_max_luggage_kg,
//       free_luggage_pcs,
//       free_luggage_kg,
//       special_price_pcs,
//       special_max_luggage_pcs,
//       luggageCost,
//     } = bookingInfo?.luggageInfo;
//     bookingData.append(
//       "pick_location_id_round",
//       returnFirstJourneyInfo.pickLocation
//     );
//     bookingData.append(
//       "drop_location_id_round",
//       returnFirstJourneyInfo.dropLocation
//     );
//     bookingData.append("total_price_round", bookingInfo.totalprice);
//     bookingData.append("pickstand_round", bookingInfo.pickstand);
//     bookingData.append("dropstand_round", bookingInfo.dropstand);
//     bookingData.append("journeydate_round", journeyInfo.returnDate);
//     // bookingData.append("returndate", journeyInfo.returnDate);
//     bookingData.append("vehicle_id_round", bookingInfo.vehicle_id);

//     // test start

//     bookingData.append("seatnumbers_round", bookingInfo?.seatnumbers);
//     bookingData.append("grandtotal_round", Number(calcGrandTotal));
//     if (subTripid === journeyInfo?.subtripId) {
//       bookingData.append("discount_round", discountValue);
//     } else {
//       bookingData.append("discount_round", 0);
//     }
//     bookingData.append("tax_round", bookingInfoTax);
//     //extra passenger
//     bookingData.append("first_name_new", first_name_new);
//     bookingData.append("last_name_new", last_name_new);
//     bookingData.append("login_mobile_new", login_mobile_new);
//     bookingData.append("id_number_new", id_number_new);
//     // test end

//     bookingData.append("trip_id_round", bookingInfo.trip_id);
//     bookingData.append("subtripId_round", bookingInfo.subtripId);

//     // luggage info
//     // const {
//     //   paid_max_luggage_pcs,
//     //   paid_max_luggage_kg,
//     //   free_luggage_pcs,
//     //   free_luggage_kg,
//     //   luggageCost,
//     // } = bookingInfo?.luggageInfo;

//     bookingData.append(
//       "paid_max_luggage_pcs_round",
//       paid_max_luggage_pcs ? paid_max_luggage_pcs : 0
//     );
//     bookingData.append(
//       "paid_max_luggage_kg_round",
//       paid_max_luggage_kg ? paid_max_luggage_kg : ""
//     );
//     bookingData.append(
//       "free_luggage_pcs_round",
//       free_luggage_pcs ? free_luggage_pcs : 0
//     );
//     bookingData.append(
//       "free_luggage_kg_round",
//       free_luggage_kg ? free_luggage_kg : ""
//     );
//     bookingData.append(
//       "price_pcs_round",
//       bookingInfo?.luggageInfo?.price_pcs
//         ? bookingInfo.luggageInfo.price_pcs
//         : ""
//     );
//     bookingData.append(
//       "price_kg_round",
//       bookingInfo?.luggageInfo?.price_kg ? bookingInfo.luggageInfo.price_kg : ""
//     );
//     bookingData.append(
//       "special_price_pcs_round",
//       special_price_pcs ? special_price_pcs : 0
//     );
//     bookingData.append(
//       "special_max_luggage_pcs_round",
//       special_max_luggage_pcs ? special_max_luggage_pcs : 0
//     );
//     bookingData.append("special_luggage_round", bookingInfo?.specialLuggage);

//     const response = await fetch(
//       `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/unpaid/booking`,
//       {
//         method: "POST",
//         body: bookingData,
//       }
//     );
//     const result = await response.json();
//     // If success then submit return ticket information
//     if (result.status === "success") {
//       if (bookingInfo?.seatnumbers) {
//         dispatch(regularBookingInformation(result?.data?.booking_id));

//         bookingData.append("pick_location_id", searchInfo.pickLocation);
//         bookingData.append("drop_location_id", searchInfo.dropLocation);

//         bookingData.append("pickstand", bookingInfo.pickstand);
//         bookingData.append("dropstand", bookingInfo.dropstand);
//         bookingData.append("journeydate", searchInfo.journeydate);
//         // bookingData.append("returndate", "");
//         // test start
//         bookingData.append("payment_status", "unpaid");

//         //extra passenger

//         bookingData.append("first_name_new", return_first_name_new);
//         bookingData.append("last_name_new", return_last_name_new);
//         bookingData.append("login_mobile_new", return_login_mobile_new);
//         bookingData.append("id_number_new", return_id_number_new);

//         bookingData.append("seatnumbers", journeyInfo?.seatnumbers);
//         bookingData.append("grandtotal", regularAmount);
//         if (subTripid === bookingInfo?.subtripId) {
//           bookingData.append("discount", discountValue);
//         } else {
//           bookingData.append("discount", 0);
//         }
//         bookingData.append("tax", bookingInfoTax);

//         // test end

//         // luggage info
//         const {
//           paid_max_luggage_pcs,
//           paid_max_luggage_kg,
//           free_luggage_pcs,
//           free_luggage_kg,
//           luggageCost,
//         } = bookingInfo?.luggageInfo;

//         bookingData.append(
//           "paid_max_luggage_pcs",
//           paid_max_luggage_pcs ? paid_max_luggage_pcs : 0
//         );
//         bookingData.append(
//           "paid_max_luggage_kg",
//           paid_max_luggage_kg ? paid_max_luggage_kg : ""
//         );
//         bookingData.append(
//           "free_luggage_pcs",
//           free_luggage_pcs ? free_luggage_pcs : 0
//         );
//         bookingData.append(
//           "free_luggage_kg",
//           free_luggage_kg ? free_luggage_kg : ""
//         );
//         bookingData.append(
//           "price_pcs",
//           bookingInfo?.luggageInfo?.price_pcs
//             ? bookingInfo.luggageInfo.price_pcs
//             : ""
//         );
//         bookingData.append(
//           "price_kg",
//           bookingInfo?.luggageInfo?.price_kg
//             ? bookingInfo.luggageInfo.price_kg
//             : ""
//         );

//         const response2 = await fetch(
//           `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/unpaid/booking`,
//           {
//             method: "POST",
//             body: bookingData,
//           }
//         );
//         const result2 = await response2.json();
//         if (result2.status === "success") {
//           dispatch(updateFareSummery(null));
//           localStorage.removeItem("journeyInfo");
//           localStorage.removeItem("searchInfo");
//           localStorage.removeItem("returnFirstJourneyInfo");
//           localStorage.removeItem("bookingInfo");

//           toast.success("Your booking has been done successfully");
//           return Promise.resolve(result2);
//         }
//         return Promise.reject(result2);
//       } else {
//         dispatch(addError(""));
//         dispatch(updateFareSummery(null));
//         localStorage.removeItem("journeyInfo");
//         localStorage.removeItem("searchInfo");
//         localStorage.removeItem("returnFirstJourneyInfo");
//         localStorage.removeItem("bookingInfo");
//         return Promise.resolve(result);
//       }
//     }
//     return Promise.reject(result);
//   }
//     // luggage info
//     const {
//       paid_max_luggage_pcs,
//       paid_max_luggage_kg,
//       free_luggage_pcs,
//       free_luggage_kg,
//       special_price_pcs,
//       special_max_luggage_pcs,
//       luggageCost,
//     } = bookingInfo?.luggageInfo;

//     const calcGrandTotal =
//       Number(journeyInfo?.grandtotal) +
//       luggageCost +
//       bookingInfoTax -
//       discountValue;

//     bookingData.append("payment_status", "unpaid");

//     bookingData.append("grandtotal", calcGrandTotal);
//     bookingData.append("discount", discountValue ? discountValue : 0);
//     bookingData.append("tax", journeyInfoTax);
//     bookingData.append("total_price", Number(journeyInfo?.totalprice));
//     bookingData.append("vehicle_id", journeyInfo.vehicle_id);
//     //extra passenger
//     bookingData.append("aseat", journeyInfo?.aseat);
//     bookingData.append("cseat", journeyInfo?.cseat);
//     bookingData.append("spseat", journeyInfo?.spseat);
//     bookingData.append("journeydate", journeyInfo?.journeydate);
//     bookingData.append("first_name_new", first_name_new);
//     bookingData.append("last_name_new", last_name_new);
//     bookingData.append("login_mobile_new", login_mobile_new);
//     bookingData.append("id_number_new", id_number_new);
//     bookingData.append("pickstand", journeyInfo?.pickstand);
//     bookingData.append("dropstand", journeyInfo?.dropstand);
//     bookingData.append("totalprice", journeyInfo?.totalprice);
//     bookingData.append("pick_location_id", searchInfo?.pickLocation);
//     bookingData.append("drop_location_id", searchInfo?.dropLocation);
//     bookingData.append("trip_id", journeyInfo?.trip_id);
//     bookingData.append("subtripId", journeyInfo?.subtripId);

//     bookingData.append("paydetail", "This is pay details");
//     bookingData.append("seatnumbers", journeyInfo?.seatnumbers);
//     bookingData.append("totalseat", journeyInfo?.totalseat);

//     bookingData.append(
//       "paid_max_luggage_pcs",
//       paid_max_luggage_pcs ? paid_max_luggage_pcs : 0
//     );
//     bookingData.append(
//       "paid_max_luggage_kg",
//       paid_max_luggage_kg ? paid_max_luggage_kg : ""
//     );
//     bookingData.append(
//       "free_luggage_pcs",
//       free_luggage_pcs ? free_luggage_pcs : 0
//     );
//     bookingData.append(
//       "free_luggage_kg",
//       free_luggage_kg ? free_luggage_kg : ""
//     );
//     bookingData.append(
//       "price_pcs",
//       bookingInfo?.luggageInfo?.price_pcs
//         ? bookingInfo.luggageInfo.price_pcs / paid_max_luggage_pcs
//         : ""
//     );
//     bookingData.append(
//       "price_kg",
//       bookingInfo?.luggageInfo?.price_kg ? bookingInfo.luggageInfo.price_kg : ""
//     );
//     bookingData.append(
//       "special_price_pcs",
//       special_price_pcs ? special_price_pcs / special_max_luggage_pcs : ""
//     );
//     bookingData.append("special_max_luggage_pcs", special_max_luggage_pcs);
//     bookingData.append("special_luggage", bookingInfo?.specialLuggage);

//     const response = await fetch(
//       `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/unpaid/booking`,
//       {
//         method: "POST",
//         body: bookingData,
//       }
//     );
//     const result = await response.json();

//     if (result.status === "success") {
//       localStorage.removeItem("searchInfo");
//       localStorage.removeItem("bookingInfo");
//       setValues({
//         login_email: "",
//         login_mobile: "",
//         first_name: "",
//         last_name: "",
//         id_type: "",
//         country_id: "",
//         id_number: "",
//         address: "",
//         city: "",
//         zip_code: "",
//       });

//       toast.success("Your booking has been done successfully");
//       return Promise.resolve(result);
//     }
//     return Promise.reject(result);

// };

export const payLatter = async (
  bookingData,
  allBookingInformation,
  dispatch,
  history
) => {
  const {
    totalprice,
    passengerInformation,
    values,
    setValues,
    paymentStutas,
    paymentGateway,
    fareSummery,
    searchInfo,
    bookingInfo,
    journeyInfo,
    returnSearchInfo,
    returnFirstJourneyInfo,
    returnAmmount,
    discountValue,
    subTripid,
    journeyInfoTax,
    bookingInfoTax,
  } = allBookingInformation;

  let firstNames = [],
    lastNames = [],
    mobileNumbers = [],
    identityNumbers = [];

  let returunfirstNames = [],
    returunlastNames = [],
    returunmobileNumbers = [],
    returunidentityNumbers = [];

  for (let [name, value] of Object.entries(values)) {
    if (name.includes("name")) firstNames.push(value);
    if (name.includes("first")) returunfirstNames.push(value);
    if (name.includes("surName")) lastNames.push(value);
    if (name.includes("second")) returunlastNames.push(value);
    if (name.includes("contactNo")) mobileNumbers.push(value);
    if (name.includes("third")) returunmobileNumbers.push(value);
    if (name.includes("passPort")) identityNumbers.push(value);
    if (name.includes("fourth")) returunidentityNumbers.push(value);
  }

  const first_name_new = JSON.stringify(Object.assign({}, firstNames));
  const last_name_new = JSON.stringify(Object.assign({}, lastNames));
  const login_mobile_new = JSON.stringify(Object.assign({}, mobileNumbers));
  const id_number_new = JSON.stringify(Object.assign({}, identityNumbers));

  const return_first_name_new = JSON.stringify(
    Object.assign({}, returunfirstNames)
  );
  const return_last_name_new = JSON.stringify(
    Object.assign({}, returunlastNames)
  );
  const return_login_mobile_new = JSON.stringify(
    Object.assign({}, returunmobileNumbers)
  );
  const return_id_number_new = JSON.stringify(
    Object.assign({}, returunidentityNumbers)
  );

  const isRoundTrip = journeyInfo?.isRoundTrip;

  // Append regular trip info
  bookingData.append("payment_status", "unpaid");
  // bookingData.append("grandtotal", fareSummery?.grandTotalOneWay || 0);
  // bookingData.append("discount", discountValue || 0);
  // bookingData.append("tax", journeyInfoTax || 0);
  bookingData.append(
    "journeydate",
    isRoundTrip ? journeyInfo.journeydate : searchInfo.journeydate
  );
  // bookingData.append(
  //   "totalprice",
  //   isRoundTrip
  //     ? Number(journeyInfo?.totalprice) || 0
  //     : Number(bookingInfo?.totalprice)
  // );
  bookingData.append(
    "aseat",
    isRoundTrip ? journeyInfo?.aseat : bookingInfo?.aseat
  );
  bookingData.append(
    "cseat",
    isRoundTrip ? journeyInfo?.cseat : bookingInfo?.cseat
  );
  bookingData.append(
    "spseat",
    isRoundTrip ? journeyInfo?.spseat : bookingInfo?.spseat
  );
  bookingData.append(
    "vehicle_id",
    isRoundTrip ? journeyInfo?.vehicle_id || "" : bookingInfo?.vehicle_id
  );
  bookingData.append(
    "seatnumbers",
    isRoundTrip ? journeyInfo?.seatnumbers || "" : bookingInfo?.seatnumbers
  );
  bookingData.append(
    "totalseat",
    isRoundTrip ? journeyInfo?.totalseat || "" : bookingInfo?.totalseat
  );
  bookingData.append("first_name_new", first_name_new);
  bookingData.append("last_name_new", last_name_new);
  bookingData.append("login_mobile_new", login_mobile_new);
  bookingData.append("id_number_new", id_number_new);
  bookingData.append(
    "pickstand",
    isRoundTrip ? journeyInfo?.pickstand || "" : bookingInfo?.pickstand
  );
  bookingData.append(
    "dropstand",
    isRoundTrip ? journeyInfo?.dropstand || "" : bookingInfo.dropstand
  );
  bookingData.append(
    "pick_location_id",
    isRoundTrip ? searchInfo?.dropLocation || "" : searchInfo?.pickLocation
  );
  bookingData.append(
    "drop_location_id",
    isRoundTrip ? searchInfo?.pickLocation || "" : searchInfo?.dropLocation
  );
  bookingData.append(
    "trip_id",
    isRoundTrip ? journeyInfo?.trip_id || "" : bookingInfo?.trip_id
  );
  bookingData.append(
    "subtripId",
    isRoundTrip ? journeyInfo?.subtripId || "" : bookingInfo?.subtripId
  );

  // Append round trip fields, with data if it's a round trip, or empty if not

  bookingData.append("aseat_round", isRoundTrip ? bookingInfo?.aseat : "");
  bookingData.append("cseat_round", isRoundTrip ? bookingInfo?.cseat : "");
  bookingData.append("spseat_round", isRoundTrip ? bookingInfo?.spseat : "");
  bookingData.append(
    "pick_location_id_round",
    isRoundTrip ? returnFirstJourneyInfo?.dropLocation : ""
  );
  bookingData.append(
    "drop_location_id_round",
    isRoundTrip ? returnFirstJourneyInfo?.pickLocation : ""
  );
  // bookingData.append(
  //   "totalprice_round",
  //   isRoundTrip ? bookingInfo?.totalprice : 0
  // );
  bookingData.append(
    "pickstand_round",
    isRoundTrip ? bookingInfo?.pickstand : ""
  );
  bookingData.append(
    "dropstand_round",
    isRoundTrip ? bookingInfo?.dropstand : ""
  );
  bookingData.append("totalseat_round", bookingInfo?.totalseat || "");

  bookingData.append(
    "journeydate_round",
    isRoundTrip ? journeyInfo?.returnDate : ""
  );
  bookingData.append(
    "vehicle_id_round",
    isRoundTrip ? bookingInfo?.vehicle_id : ""
  );
  bookingData.append(
    "seatnumbers_round",
    isRoundTrip ? bookingInfo?.seatnumbers : ""
  );
  // bookingData.append("grandtotal_round", fareSummery?.grandTotalRound || 0);
  // bookingData.append("discount_round", isRoundTrip ? discountValue : 0);
  // bookingData.append("tax_round", isRoundTrip ? bookingInfoTax : 0);
  bookingData.append(
    "first_name_new_round",
    isRoundTrip ? return_first_name_new : ""
  );
  bookingData.append(
    "last_name_new_round",
    isRoundTrip ? return_last_name_new : ""
  );
  bookingData.append(
    "login_mobile_new_round",
    isRoundTrip ? return_login_mobile_new : ""
  );
  bookingData.append(
    "id_number_new_round",
    isRoundTrip ? return_id_number_new : ""
  );
  bookingData.append("trip_id_round", isRoundTrip ? bookingInfo?.trip_id : "");
  bookingData.append(
    "subtripId_round",
    isRoundTrip ? bookingInfo?.subtripId : ""
  );

  // Luggage information
  const {
    paid_max_luggage_pcs,
    paid_max_luggage_kg,
    free_luggage_pcs,
    free_luggage_kg,
    price_pcs,
    price_kg,
    special_price_pcs,
    special_max_luggage_pcs,
    luggageCost,
  } = journeyInfo?.luggageInfo || {};

  bookingData.append(
    "paid_max_luggage_pcs",
    isRoundTrip
      ? paid_max_luggage_pcs || 0
      : Number(bookingInfo.luggageInfo?.paid_max_luggage_pcs)
  );
  // bookingData.append(
  //   "paid_max_luggage_kg",
  //   isRoundTrip
  //     ? paid_max_luggage_kg || 0
  //     : Number(bookingInfo?.luggageInfo?.paid_max_luggage_kg)
  // );
  // bookingData.append(
  //   "free_luggage_pcs",
  //   isRoundTrip
  //     ? free_luggage_pcs || 0
  //     : bookingInfo?.luggageInfo?.free_luggage_pcs
  // );
  // bookingData.append(
  //   "free_luggage_kg",
  //   isRoundTrip
  //     ? free_luggage_kg || ""
  //     : bookingInfo?.luggageInfo?.free_luggage_kg
  // );
  // bookingData.append(
  //   "price_pcs",
  //   isRoundTrip ? price_pcs || 0 : Number(bookingInfo?.luggageInfo?.price_pcs)
  // );
  // bookingData.append(
  //   "price_kg",
  //   isRoundTrip ? price_kg || 0 : Number(bookingInfo?.luggageInfo?.price_kg)
  // );
  // bookingData.append(
  //   "special_price_pcs",
  //   isRoundTrip
  //     ? special_price_pcs || 0
  //     : Number(bookingInfo?.luggageInfo?.special_price_pcs)
  // );
  bookingData.append(
    "special_max_luggage_pcs",
    isRoundTrip
      ? special_max_luggage_pcs || 0
      : Number(bookingInfo?.luggageInfo?.special_max_luggage_pcs)
  );
  bookingData.append(
    "special_luggage",
    isRoundTrip
      ? journeyInfo?.specialLuggage || ""
      : bookingInfo?.specialLuggage
  );

  bookingData.append(
    "paid_max_luggage_pcs_round",
    isRoundTrip ? Number(bookingInfo.luggageInfo?.paid_max_luggage_pcs) || 0 : 0
  );
  // bookingData.append(
  //   "paid_max_luggage_kg_round",
  //   isRoundTrip ? Number(bookingInfo?.luggageInfo?.paid_max_luggage_kg) || 0 : 0
  // );
  // bookingData.append(
  //   "free_luggage_pcs_round",
  //   isRoundTrip ? free_luggage_pcs || 0 : 0
  // );
  // bookingData.append(
  //   "free_luggage_kg_round",
  //   isRoundTrip ? bookingInfo?.luggageInfo?.free_luggage_pcs || "" : ""
  // );
  // bookingData.append(
  //   "price_pcs_round",
  //   isRoundTrip ? Number(bookingInfo?.luggageInfo?.price_pcs) || 0 : 0
  // );
  // bookingData.append(
  //   "price_kg_round",
  //   isRoundTrip ? Number(bookingInfo?.luggageInfo?.price_kg) || 0 : 0
  // );
  // bookingData.append(
  //   "special_price_pcs_round",
  //   isRoundTrip ? Number(bookingInfo?.luggageInfo?.special_price_pcs) || 0 : 0
  // );
  bookingData.append(
    "special_max_luggage_pcs_round",
    isRoundTrip
      ? Number(bookingInfo?.luggageInfo?.special_max_luggage_pcs) || 0
      : 0
  );
  bookingData.append(
    "special_luggage_round",
    isRoundTrip ? bookingInfo?.specialLuggage || "" : ""
  );

  // Send the request
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_MODULE_DOMAIN}/tickets/unpaid/booking`,
      {
        method: "POST",
        body: bookingData,
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      dispatch(regularBookingInformation(result?.data[0]?.booking_id));
      localStorage.removeItem("searchInfo");
      localStorage.removeItem("bookingInfo");
      localStorage.removeItem("coupon");
      setValues({
        login_email: "",
        login_mobile: "",
        first_name: "",
        last_name: "",
        id_type: "",
        country_id: "",
        id_number: "",
        address: "",
        city: "",
        zip_code: "",
      });
      // dispatch(ticketTracking(result?.data));
      toast.success("Your booking has been done successfully");
      return Promise.resolve(result);
    } else {
      toast.error(result.message);
      return Promise.reject(result);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

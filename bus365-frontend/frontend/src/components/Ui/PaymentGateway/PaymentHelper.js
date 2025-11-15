import { toast } from "react-toastify";
import { payLatter } from "./payLatter";
import { payNow } from "./payNow";

export const PaymentHelper = async (
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
    regularAmmount,
    discountValue,
    subTripid,
    journeyInfoTax,
    bookingInfoTax,
    token,
    coupon,
  } = allBookingInformation;
  const bookingData = new FormData();
  const baseUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000";
  if (!passengerInformation.first_name) {
    toast.error("First name is required");
    return;
  }

  bookingData.append("login_email", passengerInformation.login_email);
  if (!token) {
    bookingData.append(
      "login_mobile",
      values?.mobile_country_code.concat(passengerInformation?.login_mobile)
    );
  } else {
    bookingData.append("login_mobile", passengerInformation?.login_mobile);
  }

  bookingData.append(
    "first_name",
    ` ${passengerInformation.gender || "Mr"} ${passengerInformation.first_name}`
  );
  bookingData.append("last_name", passengerInformation.last_name);
  bookingData.append("id_type", passengerInformation.id_type || "Nid");
  bookingData.append("country_id", passengerInformation.country_id);
  bookingData.append("id_number", passengerInformation.id_number);
  bookingData.append("address", passengerInformation.address);
  bookingData.append("city", passengerInformation.city);
  bookingData.append("zip_code", passengerInformation.zip_code);
  bookingData.append("coupon_code", coupon);
  bookingData.append("callback_url", `${baseUrl}/ticket-tracking`);

  // Extra passenger info

  try {
    if (paymentStutas === "Pay Latter") {
      return await payLatter(
        bookingData,
        allBookingInformation,
        dispatch,
        history
      );
    } else if (paymentStutas === "Pay Now") {
      return await payNow(
        bookingData,
        allBookingInformation,
        dispatch,
        history
      );
    }
  } catch (error) {
    console.error(error);
  }
};

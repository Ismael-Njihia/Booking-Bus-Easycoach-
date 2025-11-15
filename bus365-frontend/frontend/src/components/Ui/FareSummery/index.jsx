import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { updateFareSummery } from "../../../redux/action/busAction";
import {
  Amount,
  BaseFare,
  DepartureAmmount,
  Discount,
  FareSummaryHeader,
  FareSummaryWrapper,
  SubTotalAmount,
  Summary,
  TotalAmount,
} from "./FareSummery.styles";

const FareSummery = ({ discountValue, subTripid, setSubtripid }) => {
  const dispatch = useDispatch();

  const { webSettingData, languageData } = useSelector(
    (state) => state.busLists
  );
  const [taxApi, setTaxApi] = useState([]);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [journeyInfo, setJourneyInfo] = useState(null);
  const [discount, setDiscount] = useState(null);
  // const [languageData, setLanguageData] = useState();

  useEffect(() => {
    setJourneyInfo(JSON.parse(localStorage.getItem("journeyInfo")));
    setBookingInfo(JSON.parse(localStorage.getItem("bookingInfo")));

    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/taxs`)
      .then((res) => res.json())
      .then((data) => {
        setTaxApi(data);
      });
  }, []);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  useEffect(() => {
    setDiscount(JSON.parse(localStorage.getItem("discount")));
  }, [discountValue, subTripid]);

  const taxReturn = (taxAmount) => {
    taxAmount =
      Number(taxAmount) + Number(bookingInfo?.luggageInfo?.luggageCost);

    let value = 0;
    for (let i = 0; i < taxApi?.data?.length; i++) {
      value = value + (taxApi?.data[i]?.value * taxAmount) / 100;
    }

    return isNaN(value) ? 0 : value;
  };
  const tax = (taxAmount) => {
    let luggageCost = 0;
    if (journeyInfo?.isRoundTrip) {
      luggageCost = journeyInfo?.luggageInfo?.luggageCost;
    } else {
      luggageCost = bookingInfo?.luggageInfo?.luggageCost;
    }
    taxAmount = Number(taxAmount) + Number(luggageCost);

    let value = 0;
    for (let i = 0; i < taxApi?.data?.length; i++) {
      value = value + (taxApi?.data[i]?.value * taxAmount) / 100;
    }

    return isNaN(value) ? 0 : value;
  };

  const getGrandTotalAmount = () => {
    const luggageFare = journeyInfo?.isRoundTrip
      ? journeyInfo?.luggageInfo?.luggageCost
      : bookingInfo?.luggageInfo?.luggageCost;

    const luggageFareReturn = journeyInfo?.isRoundTrip
      ? bookingInfo?.luggageInfo?.luggageCost
      : 0;

    if (taxApi?.data) {
      if (taxApi?.tax_type == "exclusive") {
        const totalReturnTicketFare =
          Number(
            taxReturn(
              journeyInfo?.isRoundTrip ? bookingInfo?.totalprice || 0 : 0
            )
          ) +
          Number(
            journeyInfo?.isRoundTrip
              ? Number(bookingInfo?.totalprice) + Number(luggageFareReturn)
              : 0
          );
        const totalAmount =
          Number(
            tax(
              journeyInfo?.isRoundTrip
                ? journeyInfo?.totalprice
                : bookingInfo?.totalprice
            )
          ) +
          Number(
            journeyInfo?.isRoundTrip
              ? Number(journeyInfo.totalprice) + Number(luggageFare)
              : Number(bookingInfo?.totalprice) + Number(luggageFare)
          );

        if (journeyInfo?.isRoundTrip) {
          return Number(totalAmount) + Number(totalReturnTicketFare);
        } else {
          return Number(totalAmount);
        }
      } else {
        const totalAmount = Number(
          bookingInfo?.totalprice ? bookingInfo?.totalprice : 0
        );
        // 100
        const totalReturnTicketFare = Number(
          journeyInfo?.totalprice ? journeyInfo?.totalprice : 0
        );
        // 200

        if (journeyInfo) {
          return Number(totalAmount + totalReturnTicketFare);
        } else {
          return Number(bookingInfo?.totalprice ? totalAmount : 0);
        }
      }
    }
  };

  const isRoundTrip = journeyInfo?.isRoundTrip;
  const getGrandTotalAmountOneWay = () => {
    // Use the appropriate data based on isRoundTrip
    const data = isRoundTrip ? journeyInfo : bookingInfo;

    // Calculate luggage fare
    const luggageFare = data?.luggageInfo?.luggageCost || 0;

    // Check if taxApi data is available
    if (taxApi?.data) {
      if (taxApi.tax_type === "exclusive") {
        const totalAmount =
          Number(tax(data?.totalprice)) +
          Number(data?.totalprice ? Number(data.totalprice) + luggageFare : 0);

        // If it's a round trip, include the return fare from journeyInfo

        return Number(totalAmount);
      } else {
        const totalAmount = Number(data?.totalprice || 0);
        return totalAmount;
      }
    }

    return 0; // Return 0 if no tax data is available
  };

  const getRoundTripGrandTotalAmount = () => {
    const luggageFare = bookingInfo?.luggageInfo?.luggageCost || 0;

    if (taxApi?.data) {
      if (taxApi.tax_type === "exclusive") {
        const totalAmount =
          Number(tax(bookingInfo?.totalprice)) +
          Number(
            bookingInfo?.totalprice
              ? Number(bookingInfo.totalprice) + luggageFare
              : 0
          );
        // Assuming journeyInfo is available for round-trip return fare calculation

        return Number(totalAmount);
      } else {
        const totalAmount = Number(bookingInfo?.totalprice || 0);

        return Number(totalAmount);
      }
    }
    return 0; // Return 0 if no tax data is available
  };

  useEffect(() => {
    const fareSummery = {
      tax: Number(tax(bookingInfo?.totalprice) + tax(journeyInfo?.totalprice)),
      grandTotalOneWay:
        getGrandTotalAmountOneWay() -
        Number(discount?.discount ? discount?.discount : 0),
      grandTotalRound:
        getRoundTripGrandTotalAmount() -
        Number(discount?.discount ? discount?.discount : 0),
      grandTotal:
        getGrandTotalAmount() -
        Number(discount?.discount ? discount?.discount : 0),
    };

    dispatch(updateFareSummery(fareSummery));
  }, [taxApi, discountValue, discount?.discount]);

  // start taxpercentage
  useEffect(() => {
    const singleTax = (ammount) => {
      let taxId = [];
      let taxvalue = [];

      for (let i = 0; i < taxApi?.data?.length; i++) {
        taxId.push(taxApi?.data[i]?.id);
        taxvalue.push((taxApi?.data[i]?.value * ammount) / 100);
      }

      return `${taxId}-${taxvalue}`;
    };

    if (journeyInfo?.isRoundTrip && bookingInfo) {
      const single = singleTax(journeyInfo?.totalprice);
      const double = singleTax(bookingInfo?.totalprice);
      const singleId = single.split("-")[0];
      const singleValue = single.split("-")[1];
      const doubleId = double.split("-")[0];
      const doubleValue = double.split("-")[1];

      const taxPercentage = {
        singleId: singleId,
        singleValue: singleValue,
        doubleId: doubleId,
        doubleValue: doubleValue,
      };
    } else if (!journeyInfo?.isRoundTrip && bookingInfo) {
      const single = singleTax(bookingInfo?.totalprice);
      const singleId = single.split("-")[0];
      const singleValue = single.split("-")[1];

      const taxPercentage = {
        singleId: singleId,
        singleValue: singleValue,
      };
    }
  }, [bookingInfo, journeyInfo, taxApi?.data]);
  // end taxpercentage

  // test start
  useEffect(() => {
    setSubtripid(JSON.parse(localStorage.getItem("subtripId")));

    const bookingInfoTax = tax(bookingInfo?.grandtotal);
    const journeyInfoTax = tax(journeyInfo?.grandtotal);

    localStorage.setItem("bookingInfoTax", JSON.stringify(bookingInfoTax));
    localStorage.setItem("journeyInfoTax", JSON.stringify(journeyInfoTax));

    // luggage cost
    const luggageFare = bookingInfo?.luggageInfo?.luggageCost;
    const luggageFareReturn = journeyInfo?.luggageInfo?.luggageCost;

    if (taxApi?.tax_type === "exclusive") {
      if (journeyInfo?.isRoundTrip) {
        // calculation for round trip
        const regularTotalAmmount =
          Number(journeyInfo?.grandtotal) + Number(journeyInfoTax);

        const returnTotalAmmount =
          Number(bookingInfo?.grandtotal) +
          Number(bookingInfoTax) +
          luggageFareReturn;

        localStorage.setItem("regular", JSON.stringify(regularTotalAmmount));
        localStorage.setItem("return", JSON.stringify(returnTotalAmmount));

        if (subTripid === journeyInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(regularTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(regularTotalAmmount)) {
            newAmount = regularTotalAmmount;
          }

          localStorage.setItem("regular", JSON.stringify(newAmount));
        }

        if (subTripid === bookingInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(returnTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(returnTotalAmmount)) {
            newAmount = returnTotalAmmount;
          }

          localStorage.setItem("return", JSON.stringify(newAmount));
        }
      }

      if (!journeyInfo?.isRoundTrip) {
        const discountObj = JSON.parse(localStorage.getItem("discount"));

        const cutDiscount =
          Number(bookingInfo?.grandtotal) -
          Number(discountObj?.discount ? Number(discountObj.discount) : 0);

        const returnTotalAmmount =
          cutDiscount + Number(bookingInfoTax) + luggageFare;
        localStorage.setItem("return", JSON.stringify(returnTotalAmmount));

        if (subTripid === bookingInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(returnTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(returnTotalAmmount)) {
            newAmount = returnTotalAmmount;
          }

          localStorage.setItem("return", JSON.stringify(newAmount));
        }
      }
    } else {
      if (journeyInfo?.isRoundTrip) {
        const regularTotalAmmount = Number(journeyInfo?.grandtotal);
        const returnTotalAmmount = Number(bookingInfo?.grandtotal);

        localStorage.setItem("regular", JSON.stringify(regularTotalAmmount));
        localStorage.setItem("return", JSON.stringify(returnTotalAmmount));

        if (subTripid === journeyInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(regularTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(regularTotalAmmount)) {
            newAmount = regularTotalAmmount;
          }

          localStorage.setItem("regular", JSON.stringify(newAmount));
        }
        if (subTripid === bookingInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(returnTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(returnTotalAmmount)) {
            newAmount = returnTotalAmmount;
          }

          localStorage.setItem("return", JSON.stringify(newAmount));
        }
      }

      if (!journeyInfo?.isRoundTrip) {
        const returnTotalAmmount = Number(bookingInfo?.grandtotal);

        localStorage.setItem("return", JSON.stringify(returnTotalAmmount));

        if (subTripid === bookingInfo?.subtripId && discount?.discount) {
          let newAmount =
            Number(returnTotalAmmount) - Number(discount?.discount);

          if (newAmount > Number(returnTotalAmmount)) {
            newAmount = returnTotalAmmount;
          }

          localStorage.setItem("return", JSON.stringify(newAmount));
        }
      }
    }
  }, [bookingInfo, journeyInfo, discountValue, subTripid, taxApi?.tax_type]);
  // test end

  const NewTotalAmount = (totalbl, discountbl) => {
    let NewBalance = totalbl - discountbl;

    // if (NewBalance < totalbl) {
    //   return Number(`00`);
    // } else {
    //   return NewBalance;
    // }
    return NewBalance;
  };

  return (
    <Summary>
      <FareSummaryWrapper>
        <FareSummaryHeader>
          {languageData?.side_bar_fare_summery_title[webSettingData?.language]}
        </FareSummaryHeader>
        <div
          style={{
            display: "flex",
            marginTop: "10px",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <div>
              {journeyInfo?.isRoundTrip
                ? journeyInfo?.aseat == ""
                  ? "0"
                  : `${journeyInfo?.aseat}`
                : bookingInfo?.aseat}{" "}
              {languageData?.adult
                ? languageData?.adult[webSettingData?.language]
                : "adult"}
            </div>
            <div>
              {journeyInfo?.isRoundTrip
                ? journeyInfo?.cseat == ""
                  ? "0"
                  : `${journeyInfo?.cseat}`
                : bookingInfo?.cseat}{" "}
              {languageData?.child
                ? languageData?.child[webSettingData?.language]
                : "child"}
            </div>
            <div>
              {journeyInfo?.isRoundTrip
                ? journeyInfo?.spseat == ""
                  ? "0"
                  : `${journeyInfo?.spseat}`
                : bookingInfo?.spseat}{" "}
              {languageData?.special
                ? languageData?.special[webSettingData?.language]
                : "special"}
            </div>
          </div>

          <div>
            {journeyInfo?.isRoundTrip ? (
              <>
                <div>
                  {bookingInfo?.aseat == "" ? "0" : `${bookingInfo?.aseat}`}{" "}
                  {languageData?.adult
                    ? languageData?.adult[webSettingData?.language]
                    : "adult"}
                </div>
                <div>
                  {bookingInfo?.cseat == "" ? "0" : `${bookingInfo?.cseat}`}{" "}
                  {languageData?.children
                    ? languageData?.children[webSettingData?.language]
                    : "children"}
                </div>
                <div>
                  {bookingInfo?.spseat == "" ? "0" : `${bookingInfo?.spseat}`}{" "}
                  {languageData?.special
                    ? languageData?.special[webSettingData?.language]
                    : "special"}
                </div>{" "}
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </FareSummaryWrapper>
      {/* end fareSummary */}

      <Amount>
        <DepartureAmmount>
          <BaseFare>
            <div>
              {languageData?.side_bar_base_fare_title[webSettingData?.language]}
            </div>

            {taxApi?.tax_type === "exclusive" ? (
              <>
                {journeyInfo?.isRoundTrip ? (
                  <strong>
                    {`${webSettingData?.currency_code} `}
                    {journeyInfo && journeyInfo?.totalprice
                      ? Number(journeyInfo?.totalprice).toFixed(2)
                      : "0.00"}
                  </strong>
                ) : (
                  <strong>
                    {`${webSettingData?.currency_code} `}
                    {bookingInfo && bookingInfo?.totalprice
                      ? Number(bookingInfo?.totalprice).toFixed(2)
                      : "0.00"}
                  </strong>
                )}
              </>
            ) : (
              <>
                {journeyInfo?.isRoundTrip ? (
                  <strong>
                    {`${webSettingData?.currency_code} `}
                    {journeyInfo && journeyInfo?.totalprice
                      ? Number(
                          journeyInfo?.totalprice - tax(journeyInfo?.totalprice)
                        ).toFixed(2)
                      : "0.00"}
                  </strong>
                ) : (
                  <strong>
                    {`${webSettingData?.currency_code} `}
                    {bookingInfo && bookingInfo?.totalprice
                      ? Number(
                          bookingInfo?.totalprice -
                            taxReturn(bookingInfo?.totalprice)
                        ).toFixed(2)
                      : "0.00"}
                  </strong>
                )}
              </>
            )}
          </BaseFare>

          {webSettingData?.luggage_service && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p>
                {languageData?.luggage_cost
                  ? languageData?.luggage_cost[webSettingData?.language]
                  : "luggage_cost"}{" "}
              </p>

              {journeyInfo?.isRoundTrip ? (
                <strong>
                  {`${webSettingData?.currency_code} ${(
                    journeyInfo?.luggageInfo?.luggageCost || 0
                  ).toFixed(2)}`}
                </strong>
              ) : (
                <strong>
                  {`${webSettingData?.currency_code} ${(
                    bookingInfo?.luggageInfo?.luggageCost || 0
                  )?.toFixed(2)}`}
                </strong>
              )}
            </div>
          )}

          <BaseFare>
            <div>
              {languageData?.side_bar_tax_title[webSettingData?.language]}
            </div>
            {journeyInfo?.isRoundTrip ? (
              <strong>
                {`${webSettingData?.currency_code} `}
                {tax(journeyInfo?.totalprice).toFixed(2)}
              </strong>
            ) : (
              <strong>
                {`${webSettingData?.currency_code} `}
                {tax(bookingInfo?.totalprice).toFixed(2)}
              </strong>
            )}
          </BaseFare>
        </DepartureAmmount>
        {journeyInfo?.isRoundTrip && (
          <>
            <BaseFare>
              <div>
                <p>
                  {" "}
                  {
                    languageData?.side_bar_return_ticket_fare_title[
                      webSettingData?.language
                    ]
                  }
                </p>
              </div>
              {taxApi?.tax_type === "exclusive" ? (
                <strong>
                  {`${webSettingData?.currency_code} `}
                  {bookingInfo && bookingInfo?.totalprice
                    ? Number(bookingInfo?.totalprice).toFixed(2)
                    : "0.00"}
                </strong>
              ) : (
                <strong>
                  {`${webSettingData?.currency_code} `}
                  {bookingInfo && bookingInfo?.totalprice
                    ? Number(
                        bookingInfo?.totalprice - tax(bookingInfo?.totalprice)
                      ).toFixed(2)
                    : "0.00"}
                </strong>
              )}
            </BaseFare>
          </>
        )}
        {webSettingData?.luggage_service
          ? journeyInfo?.isRoundTrip && (
              <BaseFare>
                <div>
                  <p>
                    {languageData?.luggage_cost_return
                      ? languageData?.luggage_cost_return[
                          webSettingData?.language
                        ]
                      : "luggage_cost_return"}{" "}
                  </p>
                </div>
                <strong>
                  {" "}
                  {`${webSettingData?.currency_code} `}
                  {bookingInfo?.luggageInfo?.luggageCost
                    ? bookingInfo?.luggageInfo?.luggageCost.toFixed(2)
                    : "0.00"}
                </strong>
              </BaseFare>
            )
          : ""}
        {journeyInfo?.isRoundTrip && (
          <BaseFare>
            <div>
              <p>
                {" "}
                {
                  languageData?.side_bar_return_ticket_tax_title[
                    webSettingData?.language
                  ]
                }
              </p>
            </div>

            <strong>
              {" "}
              {`${webSettingData?.currency_code} `}
              {taxReturn(bookingInfo?.totalprice).toFixed(2)}
            </strong>
          </BaseFare>
        )}{" "}
      </Amount>
      {/* end amount */}

      <SubTotalAmount>
        <div>
          {
            languageData?.side_bar_sub_total_ammount_title[
              webSettingData?.language
            ]
          }
        </div>
        <strong>
          {`${webSettingData?.currency_code} `}
          {getGrandTotalAmount()}
        </strong>
      </SubTotalAmount>
      <Discount>
        <div>
          {languageData?.side_bar_total_discount[webSettingData?.language]}
        </div>
        <strong>
          {`${webSettingData?.currency_code} `}
          {discount?.discount ? Number(discount?.discount).toFixed(2) : "0.00"}
        </strong>
      </Discount>
      <TotalAmount>
        <div>
          {languageData?.side_bar_total_ammount[webSettingData?.language]}
        </div>
        <strong>
          {`${webSettingData?.currency_code} `}
          {NewTotalAmount(
            getGrandTotalAmount(),
            discount?.discount ? Number(discount?.discount).toFixed(2) : "0.00"
          ).toFixed(2)}
        </strong>
      </TotalAmount>
      {/* end TotalAmount */}
    </Summary>
  );
};

export default FareSummery;

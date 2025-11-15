/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import Container from "../../bootstrap/Container";
import Layout from "../../bootstrap/Layout";
import Spinner from "../../bootstrap/Spinner/index";
import BusName from "../../components/Ui/BusNames/BusName";
import MobileBusName from "../../components/Ui/BusNames/MobileBusName/index.jsx";
import SearchFrom from "../../components/Ui/SearchFrom";
import SideBar from "../../components/Ui/SideBar";
import {
  getMaxValue,
  getMinValue,
  isRegurnDateValid,
  toUpperFirst,
} from "../../helpers";
// import languageData from "../../lib/lang.config.json";
import {
  BookingBody,
  CardHeaderList,
  CardHeaderListUl,
  Date,
  Depature,
  HeroComponent,
  HeroWrapper,
  InnerContainer,
  Location,
  LocationAndDate,
  NotFound,
  PageLoaderContainer,
  RightSide,
  SearchFormWrapper,
  TripHeader,
  TripHeaderLeft,
  TripHeaderRight,
} from "./Booking.styles.js";
import moment from "moment";

const Booking = () => {
  const { webSettingData, busLists, error, searchInfoStore, languageData } =
    useSelector((state) => state.busLists);

  const [pageLoader, setPageLoader] = useState(true);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  const [userProfileInfo, setUserProfileInfo] = useState(null);
  const [busTypes, setBusTypes] = useState("");
  const [selectedFleet, setSelectedFleet] = useState("");

  const [isLoading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState([]);
  const [width, setWidth] = useState();
  const [rangeValue, setRangeValue] = useState({
    min: 300,
    max: 3000,
  });
  const [commomArray, setCommomArray] = useState([]);
  const [arrivalDuration, setArrivalDuration] = useState("");
  const [departureDuration, setDepartureDuration] = useState();
  const [location, setLocation] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [bookingInfo, setBookingInfo] = useState();
  const [journeyInfo, setJourneyInfo] = useState();

  const [searchInfo, setSearchInfo] = useState({
    pick_location: "",
    drop_location: "",
    journeydate: "",
  });
  const [busTypesArray, setBusTypesArray] = useState([]);

  const [departureArray, setDepartureArray] = useState([]);
  const [arrivalArray, setArrivalArray] = useState([]);
  const [selectedCommonArray, setSelectedCommonArray] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [filterPriceRange, setFilterPriceRange] = useState(null);
  const history = useHistory();
  const newFilterBus = busLists?.filter(
    (item, index) =>
      item?.adult_fair >= rangeValue.min && item?.adult_fair <= rangeValue.max
  );
  const [roundCheck, setRoundCheck] = useState(false);
  const [firstJourneyDateCheck, setFirstJourneyDateCheck] = useState(false);

  const [filterBus, setFilterBus] = useState(newFilterBus);
  useEffect(() => {
    setBookingInfo(JSON.parse(localStorage.getItem("bookingInfo")));
  }, [roundCheck]);
  useEffect(() => {
    setJourneyInfo(JSON.parse(localStorage.getItem("journeyInfo")));
  }, [firstJourneyDateCheck]);

  const handleDepartureChange = (e) => {
    const value = e.target.id;

    if (e.target.checked === true) {
      setDepartureDuration(value);
    } else {
      setDepartureDuration("");
    }
  };

  const handleArrivalChange = (e) => {
    const value = e.target.id;
    if (e.target.checked === true) {
      setArrivalDuration(value);
    } else {
      setArrivalDuration("");
    }
  };

  const handleBusTypeChange = (e) => {
    const value = e.target.id;

    if (e.target.checked === true) {
      setBusTypes(value);
    }

    // update fleet
    const updatedFleet = fleet?.map((item) => {
      if (item.id === value) {
        return {
          ...item,
          busType: {
            ...item.busType,
            isSelected: !item.busType.isSelected,
          },
        };
      } else {
        return {
          ...item,
          busType: {
            ...item.busType,
            isSelected: false,
          },
        };
      }
    });

    if (updatedFleet.length > 0) setFleet(updatedFleet);

    // set selected fleet
    const getSelectedFleet = updatedFleet?.find(
      (item) => item.busType.isSelected
    );
    setSelectedFleet(getSelectedFleet || "");
  };

  useEffect(() => {
    if (width > 768) {
      setFilterBus(newFilterBus);
    }

    setTimeout(() => {
      setPageLoader(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setCommomArray([...busTypesArray, ...departureArray, ...arrivalArray]);
  }, [busTypesArray, departureArray, arrivalArray]);
  console.log("busTypeArray", selectedCommonArray);
  useEffect(() => {
    function getUnique(array) {
      var uniqueArray = [];

      // Loop through array values
      for (let i = 0; i < array.length; i++) {
        if (uniqueArray.indexOf(array[i]) === -1) {
          uniqueArray.push(array[i]);
        }
      }
      return uniqueArray;
    }

    setSelectedCommonArray(getUnique(commomArray));
  }, [commomArray]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/frontend/fleets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const fleetData = data?.data?.map((item) => ({
            ...item,
            busType: {
              isSelected: false,
            },
          }));

          setFleet(fleetData);
        } else {
          setFleet([]);
        }
      });
    setUserProfileInfo(JSON.parse(localStorage.getItem("userProfileInfo")));
  }, []);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/localize/strings`)
  //     .then((res) => res.json())
  //     .then((data) => setLanguageData(data.data));
  // }, []);

  useEffect(() => {
    if (busLists === undefined || busLists?.length > 0) {
      setLoading(false);
    }

    setSearchInfo(JSON.parse(localStorage.getItem("searchInfo")));

    if (
      getMaxValue(busLists) !== undefined &&
      getMinValue(busLists) !== undefined
    ) {
      setRangeValue((Prevstate) => ({
        min: Prevstate?.min,
        max: Prevstate?.max,
      }));
    }
  }, [busLists]);

  useEffect(() => {
    function priceFilter(array, rangeValue) {
      var uniqueArray = [];

      // Loop through array values
      for (let i = 0; i < array?.length; i++) {
        if (
          rangeValue?.min <= array[i]?.adult_fair &&
          rangeValue?.max >= array[i]?.adult_fair
        ) {
          uniqueArray.push(array[i]);
        } else {
          uniqueArray.push([]);
        }
      }
      return uniqueArray;
    }

    setPriceRange(priceFilter(busLists, rangeValue));
  }, []);

  useEffect(() => {
    function selectedPriceFilter(array, rangeValue) {
      var uniqueArray = [];
      // Loop through array values
      for (let i = 0; i < array?.length; i++) {
        if (
          rangeValue?.min <= array[i]?.adult_fair &&
          rangeValue?.max >= array[i]?.adult_fair
        ) {
          uniqueArray.push(array[i]);
        }
      }

      return uniqueArray;
    }

    if (width > 768) {
      setFilterPriceRange(selectedPriceFilter(newFilterBus, rangeValue));
      setFilterBus(selectedPriceFilter(newFilterBus, rangeValue));
    }
  }, [rangeValue, selectedCommonArray]);

  async function getFilteredBusLists() {
    if (searchInfo?.pickLocation && searchInfo?.dropLocation) {
      try {
        setIsLoadingTrip(true);

        const response = await fetch(
          `${process.env.REACT_APP_API_MODULE_DOMAIN}/triplist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_journeydate: filterBus[0].journey_date || null,
              trip_id: bookingInfo?.trip_id || null,
              subtripId: bookingInfo?.subtripId || null,
              fleet_id: selectedFleet?.id,
              ariv_time: arrivalDuration,
              dep_time: departureDuration,
              journeydate: searchInfo?.journeydate,
              drop_location_id: searchInfo?.dropLocation,
              pick_location_id: searchInfo?.pickLocation,
            }),
          }
        );
        const result = await response.json();
        setIsLoadingTrip(false);
        if (result?.status === "success") {
          setFilterBus(result?.data);
        } else {
          setFilterBus([]);
        }
      } catch (err) {
        setIsLoadingTrip(false);
        setFilterBus([]);
      }
    }

    // setFilterBus(newBusLists);
  }

  useEffect(() => {
    // if (selectedFleet || departureDuration || arrivalDuration) {
    getFilteredBusLists();
  }, [selectedFleet, departureDuration, arrivalDuration, searchInfo]);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/hero`)
      .then((res) => res.json())
      .then((data) => {
        setHeroData(data.data[0]);
      });

    fetch(`${process.env.REACT_APP_API_MODULE_DOMAIN}/locations`)
      .then((res) => res.json())
      .then((data) => {
        setLocation(data.data);
      });
  }, []);

  const handleCheckout = () => {
    history.push("/checkout");
  };

  const getLocationName = (id) => {
    const locationName = location.find((item) => item.id === id);
    return toUpperFirst(locationName?.name);
  };

  const locationProvider = (type) => {
    const from = getLocationName(searchInfoStore?.pickLocation);
    const to = getLocationName(searchInfoStore?.dropLocation);

    if (from && to) {
      return type === "forward" ? `${from} - ${to}` : `${to} - ${from}`;
    } else {
      return "Loading...";
    }
  };

  return (
    <div>
      {pageLoader && (
        <PageLoaderContainer>
          <Spinner></Spinner>
        </PageLoaderContainer>
      )}

      {!pageLoader && (
        <Layout title="Booking" userProfileInfo={userProfileInfo}>
          {/* start hero section */}
          <HeroWrapper>
            <HeroComponent img={heroData?.image} />
            {filterBus?.length === 0 ? (
              <></>
            ) : (
              <>
                <SearchFormWrapper>
                  <SearchFrom
                    searchInfo={searchInfo}
                    setFilterBus={setFilterBus}
                  />
                </SearchFormWrapper>
              </>
            )}
          </HeroWrapper>
          {/* end hero section */}

          {/* start card section */}
          {/* {busLists?.length <= 0 ? (
            <div>
              <Spinner></Spinner>
            </div>
          ) : (
          )} */}

          <Container>
            <InnerContainer>
              {error ? (
                <>
                  <h4 style={{ textAlign: "center" }}>{error.message}</h4>
                  <p>
                    {languageData?.search_again_message
                      ? languageData?.search_again_message[
                          webSettingData?.language
                        ]
                      : "search_again_message"}

                    <Link to="/checkout">
                      {languageData?.checkout
                        ? languageData?.checkout[webSettingData?.language]
                        : "checkout"}
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  {width <= 768 ? (
                    // <div>
                    //   {filterBus?.length &&
                    //     filterBus?.map((item, index) => (
                    //       <MobileBusName
                    //         setFirstJourneyDateCheck={setFirstJourneyDateCheck}
                    //         setRoundCheck={setRoundCheck}
                    //         tripData={item}
                    //         key={item.id}
                    //         fleet={fleet}
                    //       />
                    //     ))}
                    // </div>

                    <div>
                      {isLoadingTrip ? (
                        <Spinner />
                      ) : (
                        <>
                          {filterBus?.map((item, index) => (
                            <MobileBusName
                              setFirstJourneyDateCheck={
                                setFirstJourneyDateCheck
                              }
                              setRoundCheck={setRoundCheck}
                              tripData={item}
                              key={item.id}
                              fleet={fleet}
                            />
                          ))}
                        </>
                      )}
                      {filterBus?.length === 0 && (
                        <>
                          <NotFound>
                            {languageData?.result_not_found
                              ? languageData?.result_not_found[
                                  webSettingData?.language
                                ]
                              : "result_not_found"}
                          </NotFound>
                          <a
                            href="/"
                            style={{
                              color: "#d11111",
                              textDecoration: "none",
                            }}
                          >
                            {languageData?.back_to_home
                              ? languageData?.back_to_home[
                                  webSettingData?.language
                                ]
                              : "back_to_home"}
                          </a>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <>
                        <TripHeader>
                          <TripHeaderLeft>
                            <Depature>
                              {
                                languageData?.booking_page_departure_title[
                                  webSettingData?.language
                                ]
                              }
                            </Depature>
                            <LocationAndDate>
                              <Location>{locationProvider("forward")}</Location>
                              <Date>{searchInfoStore?.journeydate}</Date>
                            </LocationAndDate>
                          </TripHeaderLeft>

                          {!isRegurnDateValid(searchInfoStore?.returnDate) && (
                            <TripHeaderRight>
                              <Depature>
                                {
                                  languageData?.booking_page_return_title[
                                    webSettingData?.language
                                  ]
                                }
                              </Depature>
                              <LocationAndDate>
                                <Location>
                                  {locationProvider("reverse")}
                                </Location>
                                <Date>{searchInfoStore?.returnDate}</Date>
                              </LocationAndDate>
                            </TripHeaderRight>
                          )}
                        </TripHeader>

                        <BookingBody>
                          <SideBar
                            rangeValue={rangeValue}
                            setRangeValue={setRangeValue}
                            filterBus={filterBus}
                            commomArray={commomArray}
                            setCommomArray={setCommomArray}
                            arrivalDuration={arrivalDuration}
                            setArrivalDuration={setArrivalDuration}
                            departureDuration={departureDuration}
                            setDepartureDuration={setDepartureDuration}
                            busTypes={busTypes}
                            setBusTypes={setBusTypes}
                            fleet={fleet}
                            busTypesArray={busTypesArray}
                            setBusTypesArray={setBusTypesArray}
                            departureArray={departureArray}
                            setDepartureArray={setDepartureArray}
                            arrivalArray={arrivalArray}
                            setArrivalArray={setArrivalArray}
                            setFleet={setFleet}
                            handleDepartureChange={handleDepartureChange}
                            handleArrivalChange={handleArrivalChange}
                            handleBusTypeChange={handleBusTypeChange}
                          />

                          <RightSide>
                            <CardHeaderListUl>
                              <CardHeaderList>
                                {filterBus?.length ? (
                                  <strong>
                                    {filterBus.length}{" "}
                                    {
                                      languageData
                                        ?.booking_page_card_title_buses_found[
                                        webSettingData?.language
                                      ]
                                    }
                                  </strong>
                                ) : (
                                  <strong> 0 Bus found</strong>
                                )}
                              </CardHeaderList>
                              <CardHeaderList>
                                {
                                  languageData
                                    ?.booking_page_card_title_departure[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                              <CardHeaderList>
                                {
                                  languageData
                                    ?.booking_page_card_title_duration[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                              <CardHeaderList>
                                {
                                  languageData
                                    ?.booking_page_card_title_arraival[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                              <CardHeaderList>
                                {
                                  languageData?.booking_page_card_title_ratings[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                              <CardHeaderList>
                                {
                                  languageData?.booking_page_card_title_fare[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                              {/* <CardHeaderList>
                                {
                                  languageData
                                    ?.booking_page_card_title_distance[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList> */}
                              <CardHeaderList>
                                {
                                  languageData
                                    ?.booking_page_card_title_seat_available[
                                    webSettingData?.language
                                  ]
                                }
                              </CardHeaderList>
                            </CardHeaderListUl>

                            {arrivalDuration &&
                            departureDuration &&
                            busTypes?.length > 0 ? (
                              <>
                                {/* {selectedCommonArray?.length >= 0 ? (
                                  <NotFound>
                                    {languageData?.result_not_found
                                      ? languageData?.result_not_found[
                                          webSettingData?.language
                                        ]
                                      : "result_not_found"}
                                  </NotFound>
                                ) : (
                                  <>
                                    {filterPriceRange?.map((item, index) => (
                                      <BusName
                                        tripData={item}
                                        key={index}
                                        fleet={fleet}
                                      />
                                    ))}
                                  </>
                                )} */}
                              </>
                            ) : (
                              <>
                                {isLoadingTrip ? (
                                  <Spinner />
                                ) : (
                                  <>
                                    {filterBus?.map((item, index) => (
                                      <BusName
                                        setFirstJourneyDateCheck={
                                          setFirstJourneyDateCheck
                                        }
                                        setRoundCheck={setRoundCheck}
                                        tripData={item}
                                        key={item.id}
                                        fleet={fleet}
                                      />
                                    ))}
                                  </>
                                )}

                                {filterBus?.length === 0 && (
                                  <>
                                    <NotFound>
                                      {languageData?.result_not_found
                                        ? languageData?.result_not_found[
                                            webSettingData?.language
                                          ]
                                        : "result_not_found"}
                                    </NotFound>
                                    <a
                                      href="/"
                                      style={{
                                        color: "#d11111",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {languageData?.back_to_home
                                        ? languageData?.back_to_home[
                                            webSettingData?.language
                                          ]
                                        : "back_to_home"}
                                    </a>
                                  </>
                                )}
                              </>
                            )}

                            {/* arrivalDuration,       
         departureDuration,             
         busTypes, */}

                            {/* {filterBus?.map((item) => (
           <BusName tripData={item} key={item.id} />
         ))} */}
                          </RightSide>
                        </BookingBody>
                      </>
                      {isLoading ? (
                        <Spinner />
                      ) : filterBus?.length > 0 ? (
                        <></>
                      ) : (
                        <>
                          {/* <div
                            style={{
                              margin: "auto",
                              width: "100%",
                              padding: "50px",
                            }}
                          >
                            <Spinner />
                          </div> */}

                          {/* <ErrorMsg>
                              Sorry no bus found with your search. Please search  again
                            </ErrorMsg> */}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </InnerContainer>
          </Container>

          {/* end card section */}
        </Layout>
      )}
    </div>
  );
};

export default Booking;

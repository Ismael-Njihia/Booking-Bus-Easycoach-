<?php

namespace Modules\Ticket\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use Modules\Employee\Models\EmployeeModel;
use Modules\Fleet\Models\FleetModel;
use Modules\Fleet\Models\VehicleModel;
use Modules\Location\Models\LocationModel;
use Modules\Location\Models\StandModel;
use Modules\Paymethod\Models\PaymethodModel;
use Modules\Schedule\Models\ScheduleModel;
use Modules\Tax\Models\TaxModel;
use Modules\Ticket\Models\JourneylistModel;
use Modules\Ticket\Models\PartialpaidModel;
use Modules\Ticket\Models\TicketModel;
use Modules\Ticket\Models\MaxtimeModel;
use Modules\Trip\Models\FacilityModel;
use Modules\Trip\Models\PickdropModel;
use Modules\Trip\Models\StuffassignModel;
use Modules\Trip\Models\SubtripModel;
use Modules\Trip\Models\TripModel;
use Modules\User\Models\UserDetailModel;
use Modules\User\Models\UserModel;

use App\Libraries\Ticketmail;
use Modules\Paymethod\Models\StripeModel;
use Modules\Website\Models\WebsettingModel;
use Modules\Layout\Models\LayoutModel;
use Modules\Layout\Models\LayoutDetailsModel;
use Modules\Luggage\Models\LuggagesettingModel;
use Modules\Coupon\Models\CouponModel;
use Modules\Paymethod\Controllers\Api\Paymentgateway;
use Modules\Coupon\Models\CoupondiscountModel;

class Ticket extends BaseController
{
    use ResponseTrait;

    protected $Viewpath;
    protected $ticketModel;
    protected $tripModel;
    protected $subtripModel;
    protected $stuffassignModel;
    protected $locationModel;
    protected $employeeModel;
    protected $fleetTypeModel;
    protected $scheduleeModel;
    protected $vehicleModel;
    protected $standModel;
    protected $picdropModel;
    protected $facilitypModel;
    protected $taxModel;
    protected $db;
    protected $paymethodModel;
    protected $stripeModel;
    protected $userModel;
    protected $userDetailModel;
    protected $journeylistModel;
    protected $partialpaidModel;
    protected $maxtimeModel;
    protected $webSettingModel;
    private $layoutModel;
    private $layoutDetailsModel;
    private $luggageSettingModel;
    protected $couponModel;
    protected $coupondiscountModel;

    public function __construct()
    {
        $this->ticketModel = new TicketModel();
        $this->tripModel = new TripModel();
        $this->subtripModel = new SubtripModel();
        $this->stuffassignModel = new StuffassignModel();
        $this->locationModel = new LocationModel();
        $this->employeeModel = new EmployeeModel();
        $this->fleetTypeModel = new FleetModel();
        $this->vehicleModel = new VehicleModel();
        $this->scheduleeModel = new ScheduleModel();
        $this->standModel = new StandModel();
        $this->picdropModel = new PickdropModel();
        $this->facilitypModel = new FacilityModel();
        $this->taxModel = new TaxModel();
        $this->db = \Config\Database::connect();
        $this->paymethodModel = new PaymethodModel();
        $this->stripeModel = new StripeModel;

        $this->userModel = new UserModel();
        $this->userDetailModel = new UserDetailModel();

        $this->journeylistModel = new JourneylistModel();
        $this->partialpaidModel = new PartialpaidModel();

        $this->maxtimeModel = new MaxtimeModel();
        $this->webSettingModel = new WebsettingModel;
        $this->layoutModel = new LayoutModel();
        $this->layoutDetailsModel = new LayoutDetailsModel();
        $this->luggageSettingModel = new LuggagesettingModel();
        $this->couponModel = new CouponModel();
        $this->coupondiscountModel = new CoupondiscountModel();
    }

    public function bookticket()
    {
        $ticketmailLibrary = new Ticketmail();
        $ticketid = null;

        $rand = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
        $rand = "TB" . $rand;

        $round_id = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
        $round_id = "RT" . $round_id;

        $login_email = $this->request->getVar('login_email');
        $login_mobile = $this->request->getVar('login_mobile');
        $this->db->transStart();

        $userid = $this->userCheck($login_email, $login_mobile);
        if (empty($userid)) {
            $data = [
                'message' => "User check fail",
                'status' => "fail",
                'response' => 404,
                'data' => "user check error",
            ];
            return $this->response->setJSON($data);
        }

        $websetting = $this->webSettingModel->first();
        $currencybuilder = $this->db->table('currencies');
        $curencyquery = $currencybuilder->where('id', $websetting->currency)->get();
        $currency = $curencyquery->getRow()->code;

        if ($websetting) {
            $timeForTimezone = $websetting->timezone;
            $timezone = new \DateTimeZone($timeForTimezone);
            $date = new \DateTime('now', $timezone);
            $created_at = $date->format('Y-m-d H:i:s');
        }

        $paymentStatus = $this->request->getVar('payment_status');
        $paymentMethod = $this->request->getVar('pay_method');
        $coupon_code = $this->request->getVar('coupon_code');
        $tax_percent = 0;
        $taxInfo = $this->taxModel->select('SUM(value) AS total_tax')->where('status',1)->findAll();
        if ($taxInfo) {
            $websetting	= $this->webSettingModel->first();
            if($websetting->tax_type == 'exclusive'){
                $tax_percent = $taxInfo[0]->total_tax;
            }
        }

        $tripInfo = '';
        $tripInfo_round = '';
        $grand_total_round = 0;
        $grand_total = 0;

        // For sing ticket
        $trip_id = $this->request->getVar('trip_id');
        $subtrip_id = $this->request->getVar('subtripId');
        $validTicketbooking = array();
        $ticketbooking = array();

        if($trip_id && $subtrip_id && $paymentStatus == 'paid' && $paymentMethod > 0 ){

            $validTicketbooking = array(
                "booking_id" => $rand,
                "trip_id" => $this->request->getVar('trip_id'),
                "subtrip_id" => $this->request->getVar('subtripId'),
                "passanger_id" => $userid,
                "pick_location_id" => $this->request->getVar('pick_location_id'),
                "drop_location_id" => $this->request->getVar('drop_location_id'),
                "pick_stand_id" => $this->request->getVar('pickstand'),
                "drop_stand_id" => $this->request->getVar('dropstand'),
                "seatnumber" => $this->request->getVar('seatnumbers'),
                "totalseat" => $this->request->getVar('totalseat'),
                "bookby_user_id" => $userid,
                "journeydata" => $this->request->getVar('journeydate'),
                "vehicle_id" => $this->request->getVar('vehicle_id'),
                "payment_status" => $this->request->getVar('payment_status'),
            );
            
            $tripInfo = $this->subtripModel->select('trips.id as tripid,trips.*,subtrips.id as subtripId,subtrips.*')
                ->join('trips', 'trips.id = subtrips.trip_id')
                ->where('subtrips.status', 1)
                ->where('subtrips.id', $subtrip_id)
                ->where('subtrips.trip_id', $trip_id)
                ->findAll();

            if($tripInfo){
                $coupon_discount = 0;
                if($coupon_code){
                    $journey_date = $this->request->getVar('journeydate');
                    $journey_date = date("Y-m-d",strtotime($journey_date));
                    $validCouponDetail = $this->couponModel->where('code',$coupon_code)
                        ->where('subtrip_id', $subtrip_id)
                        ->where('end_date >=', $journey_date)
                        ->where('start_date <=', $journey_date)
                        ->findAll();

                    if ($validCouponDetail) {
                        $coupon_discount =  $validCouponDetail[0]->discount;
                        $coupon_id = $validCouponDetail[0]->id;
                    }
                }

                $adults = (float) $this->request->getVar('aseat');
                $chields = (float) $this->request->getVar('cseat');
                $specials = (float) $this->request->getVar('spseat');

                $total_seats = $adults + $chields + $specials;

                $adult_price = $adults * $tripInfo[0]->adult_fair;
                $chield_price = $chields * $tripInfo[0]->child_fair;
                $special_price = $specials * $tripInfo[0]->special_fair;
                $total_price = $adult_price + $chield_price + $special_price;

                $luggages = (float) $this->request->getVar('paid_max_luggage_pcs');
                if ($luggages > $tripInfo[0]->paid_max_luggage_pcs){
                    $data = [
                        'message' => "Paid luggage limit exceeded",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => "Paid luggage limit exceeded",
                    ];
                    return $this->response->setJSON($data);
                }
                $luggage_price = $luggages * $tripInfo[0]->price_pcs;

                $special_luggages = (float) $this->request->getVar('special_max_luggage_pcs');
                if ($special_luggages > $tripInfo[0]->special_max_luggage_pcs){
                    $data = [
                        'message' => "Special luggage limit exceeded",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => "Special luggage limit exceeded",
                    ];
                    return $this->response->setJSON($data);
                }
                $special_luggage_price = $special_luggages * $tripInfo[0]->special_price_pcs;

                $sub_total = $total_price + $luggage_price + $special_luggage_price;

                $tax_total = 0;
                if ($tax_percent > 0) {
                    $tax_total = $sub_total * ($tax_percent / 100);
                }

                $grand_total = ($sub_total + $tax_total) - $coupon_discount;

                $ticketbooking = array(
                    "booking_id" => $rand,
                    "round_id" => $this->request->getVar('trip_id_round') ? $round_id : NULL,
                    "trip_id" => $this->request->getVar('trip_id'),
                    "subtrip_id" => $this->request->getVar('subtripId'),
                    "passanger_id" => $userid,
                    "pick_location_id" => $this->request->getVar('pick_location_id'),
                    "drop_location_id" => $this->request->getVar('drop_location_id'),
                    "pick_stand_id" => $this->request->getVar('pickstand'),
                    "drop_stand_id" => $this->request->getVar('dropstand'),
                    "price" => $total_price,
                    "discount" => $coupon_discount,
                    "totaltax" => $tax_total,
                    "paidamount" => $grand_total,
                    "adult" => $this->request->getVar('aseat'),
                    "chield" => $this->request->getVar('cseat'),
                    "special" => $this->request->getVar('spseat'),
                    "refund" => 0,
                    "bookby_user_id" => $userid,
                    "bookby_user_type" => "passanger",
                    "journeydata" => $this->request->getVar('journeydate'),
                    "pay_method_id" => 999,
                    "payment_status" => "unpaid",
                    "vehicle_id" => $this->request->getVar('vehicle_id'),
                    "cancel_status" => 0,
        
                    "offerer" => $coupon_discount > 0 ? $coupon_code : NULL,
                    "seatnumber" => $this->request->getVar('seatnumbers'),
                    "totalseat" => $total_seats,
                    "free_luggage_kg" => 0.00,
                    "paid_max_luggage_pcs" => $this->request->getVar('paid_max_luggage_pcs'),
                    "price_pcs" =>  $tripInfo[0]->price_pcs,
                    "special_max_luggage_pcs" => $this->request->getVar('special_max_luggage_pcs'),
                    "special_price_pcs" => $tripInfo[0]->special_price_pcs,
                    "special_luggage" => $this->request->getVar('special_luggage'),
                    "created_at" => $created_at ?? now(),
                );

                // For Round Trip
                $trip_id_round = $this->request->getVar('trip_id_round');
                $subtrip_id_round = $this->request->getVar('subtripId_round');
                $validTicketbooking_round = array();
                $ticketbooking_round = array();

                if ($trip_id_round && $subtrip_id_round) {
                    
                    $rand_round = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
                    $rand_round = "TB" . $rand_round;

                    $validTicketbooking_round = array(
                        "booking_id" => $rand_round,
                        "trip_id" => $this->request->getVar('trip_id_round'),
                        "subtrip_id" => $this->request->getVar('subtripId_round'),
                        "passanger_id" => $userid,
                        "pick_location_id" => $this->request->getVar('pick_location_id_round'),
                        "drop_location_id" => $this->request->getVar('drop_location_id_round'),
                        "pick_stand_id" => $this->request->getVar('pickstand_round'),
                        "drop_stand_id" => $this->request->getVar('dropstand_round'),
                        "seatnumber" => $this->request->getVar('seatnumbers_round'),
                        "totalseat" => $this->request->getVar('totalseat_round'),
                        "bookby_user_id" => $userid,
                        "journeydata" => $this->request->getVar('journeydate_round'),
                        "vehicle_id" => $this->request->getVar('vehicle_id_round'),
                        "payment_status" => $this->request->getVar('payment_status'),
                    );

                    $tripInfo_round = $this->subtripModel->select('trips.id as tripid,trips.*,subtrips.id as subtripId,subtrips.*')
                        ->join('trips', 'trips.id = subtrips.trip_id')
                        ->where('subtrips.status', 1)
                        ->where('subtrips.id', $subtrip_id_round)
                        ->where('subtrips.trip_id', $trip_id_round)
                        ->findAll();
        
                    if ($tripInfo_round) {

                        $coupon_discount_round = 0;
                        if($coupon_code){
                            $journey_date_round = $this->request->getVar('journeydate_round');
                            $journey_date_round = date("Y-m-d",strtotime($journey_date_round));
                            $validCouponDetailRound = $this->couponModel->where('code',$coupon_code)
                                ->where('subtrip_id', $subtrip_id_round)
                                ->where('end_date >=', $journey_date_round)
                                ->where('start_date <=', $journey_date_round)
                                ->findAll();
    
                            if ($validCouponDetailRound) {
                                $coupon_discount_round = $validCouponDetailRound[0]->discount;
                                $coupon_id_round = $validCouponDetailRound[0]->id;
                            }
                        }
    
                        $adults_round = (float) $this->request->getVar('aseat_round');
                        $chields_round = (float) $this->request->getVar('cseat_round');
                        $specials_round = (float) $this->request->getVar('spseat_round');
    
                        $total_seats_round = $adults_round + $chields_round + $specials_round;
    
                        $adult_price_round = $adults_round * $tripInfo_round[0]->adult_fair;
                        $chield_price_round = $chields_round * $tripInfo_round[0]->child_fair;
                        $special_price_round = $specials_round * $tripInfo_round[0]->special_fair;
                        $total_price_round = $adult_price_round + $chield_price_round + $special_price_round;
    
                        $luggages_round = (float) $this->request->getVar('paid_max_luggage_pcs_round');
                        if ($luggages_round > $tripInfo_round[0]->paid_max_luggage_pcs){
                            $data = [
                                'message' => "Paid luggage limit exceeded for round trip",
                                'status' => "failed",
                                'response' => 204,
                                'errors' => "Paid luggage limit exceeded",
                            ];
                            return $this->response->setJSON($data);
                        }
                        $luggage_price_round = $luggages_round * $tripInfo_round[0]->price_pcs;
    
                        $special_luggages_round = (float) $this->request->getVar('special_max_luggage_pcs_round');
                        if ($special_luggages_round > $tripInfo_round[0]->special_max_luggage_pcs){
                            $data = [
                                'message' => "Special luggage limit exceeded  for round trip",
                                'status' => "failed",
                                'response' => 204,
                                'errors' => "Special luggage limit exceeded",
                            ];
                            return $this->response->setJSON($data);
                        }
                        $special_luggage_price_round = $special_luggages_round * $tripInfo_round[0]->special_price_pcs;
    
                        $sub_total_round = $total_price_round + $luggage_price_round + $special_luggage_price_round;
    
                        $tax_total_round = 0;
                        if ($tax_percent > 0) {
                            $tax_total_round = $sub_total_round * ($tax_percent / 100);
                        }
    
                        $grand_total_round = ($sub_total_round + $tax_total_round) - $coupon_discount_round;
                        
                        $ticketbooking_round = array(
                            "booking_id" => $rand_round,
                            "round_id" => $this->request->getVar('trip_id_round') ? $round_id : NULL,
                            "trip_id" => $this->request->getVar('trip_id_round'),
                            "subtrip_id" => $this->request->getVar('subtripId_round'),
                            "passanger_id" => $userid,
                            "pick_location_id" => $this->request->getVar('pick_location_id_round'),
                            "drop_location_id" => $this->request->getVar('drop_location_id_round'),
                            "pick_stand_id" => $this->request->getVar('pickstand_round'),
                            "drop_stand_id" => $this->request->getVar('dropstand_round'),
                            "price" => $total_price_round,
                            "discount" => $coupon_discount_round,
                            "totaltax" => $tax_total_round,
                            "paidamount" => $grand_total_round,
                            "adult" => $this->request->getVar('aseat_round'),
                            "chield" => $this->request->getVar('cseat_round'),
                            "special" => $this->request->getVar('spseat_round'),
                            "refund" => 0,
                            "bookby_user_id" => $userid,
                            "bookby_user_type" => "passanger",
                            "journeydata" => $this->request->getVar('journeydate_round'),
                            "pay_method_id" => 999,
                            "payment_status" => "unpaid",
                            "vehicle_id" => $this->request->getVar('vehicle_id_round'),
                            "cancel_status" => 0,
                
                            "offerer" => $coupon_discount_round > 0 ? $coupon_code : NULL,
                            "seatnumber" => $this->request->getVar('seatnumbers_round'),
                            "totalseat" => $total_seats_round,
                            "free_luggage_kg" => 0.00,
                            "paid_max_luggage_pcs" => $this->request->getVar('paid_max_luggage_pcs_round'),
                            "price_pcs" =>  $tripInfo_round[0]->price_pcs,
                            "special_max_luggage_pcs" => $this->request->getVar('special_max_luggage_pcs_round'),
                            "special_price_pcs" => $tripInfo_round[0]->special_price_pcs,
                            "special_luggage" => $this->request->getVar('special_luggage_round'),
                            "created_at" => $created_at ?? now(),
                        );
                    }
                }

                // Ticket info insert start
                if ($this->validation->run($validTicketbooking, 'web_ticket')) {
                    $ticketid = $this->ticketModel->insert($ticketbooking);

                    if($ticketid){

                        $paidpartial = array(
                            "booking_id" => $rand,
                            "trip_id" => $this->request->getVar('trip_id'),
                            "subtrip_id" => $this->request->getVar('subtripId'),
                            "passanger_id" => $userid,
                            "paidamount" => 0,
                            "pay_method_id" => 999,
                        );
                        $this->partialpaidModel->insert($paidpartial);

                        if($coupon_discount > 0){
                            $coupondetail = array(
                                "code" => $coupon_code,
                                "coupon_id" => $coupon_id,
                                "booking_id" => $rand,
                                "subtrip_id" => $this->request->getVar('subtripId'),
                                "amount" => $coupon_discount,
                            );
                
                            $this->coupondiscountModel->insert($coupondetail);
                        }

                        $maitripid = $this->request->getVar('trip_id');
                        $subtripid = $this->request->getVar('subtripId');
                        $piclocation = $this->request->getVar('pick_location_id');
                        $droplocation = $this->request->getVar('drop_location_id');
                        $pick_stand_id = $this->request->getVar('pickstand');
                        $drop_stand_id = $this->request->getVar('dropstand');

                        $journeylist = $this->journeylist($rand, $userid, $maitripid, $subtripid, $piclocation, $droplocation, $pick_stand_id, $drop_stand_id);
                        if(empty($journeylist)){
                            $data = [
                                'message' => "journey list data not inserted",
                                'status' => "fail",
                                'response' => 204,
                                'errors' => "journey list data not inserted",
                            ];
                            // return $this->response->setJSON($data);
                        }

                        // Round trip data insertion
                        if ($tripInfo_round) {
                            if ($this->validation->run($validTicketbooking_round, 'web_ticket')) {

                                $ticketid_round = $this->ticketModel->insert($ticketbooking_round);
                                if($ticketid_round){
                                    $paidpartial_round = array(
                                        "booking_id" => $rand_round,
                                        "trip_id" => $this->request->getVar('trip_id_round'),
                                        "subtrip_id" => $this->request->getVar('subtripId_round'),
                                        "passanger_id" => $userid,
                                        "paidamount" => 0,
                                        "pay_method_id" => 999,
                                        "payment_detail" => $this->request->getVar('paydetail'),
                                    );
                                    $this->partialpaidModel->insert($paidpartial_round);

                                    if($coupon_discount_round > 0){
                                        $coupondetail_round = array(
                                            "code" => $coupon_code,
                                            "coupon_id" => $coupon_id_round,
                                            "booking_id" => $rand_round,
                                            "subtrip_id" => $this->request->getVar('subtripId_round'),
                                            "amount" => $coupon_discount_round,
                                        );
                            
                                        $this->coupondiscountModel->insert($coupondetail_round);
                                    }

                                    $maitripid = $this->request->getVar('trip_id_round');
                                    $subtripid = $this->request->getVar('subtripId_round');
                                    $piclocation = $this->request->getVar('pick_location_id_round');
                                    $droplocation = $this->request->getVar('drop_location_id_round');
                                    $pick_stand_id = $this->request->getVar('pickstand_round');
                                    $drop_stand_id = $this->request->getVar('dropstand_round');
                                    
                                    $journeylist_round = $this->journeylist($rand_round, $userid, $maitripid, $subtripid, $piclocation, $droplocation, $pick_stand_id, $drop_stand_id);
        
                                    if (empty($journeylist_round)) {
                                        $data = [
                                            'message' => "journey list data not inserted for round trip",
                                            'status' => "fail",
                                            'response' => 204,
                                            'errors' => "journey list data not inserted",
                                        ];
                                        // return $this->response->setJSON($data);
                                    }

                                    $this->db->transComplete();
                                }else{
                                    $data = [
                                        'message' => "Round Trip Booking Failed",
                                        'status' => "fail",
                                        'response' => 204,
                                        'data' => "Round Trip booking data not inserted",
                                    ];
                                    return $this->response->setJSON($data);
                                }
                                
                            } else {
                                $errors = $this->validation->getErrors();
                                $data = [
                                    'message' => "Round Trip Booking Information Not Valid",
                                    'status' => "failed",
                                    'response' => 204,
                                    'errors' => $errors,
                                ];
                                return $this->response->setJSON($data);
                            }
                        } else {
                            $this->db->transComplete();
                        }

                        // Payment information
                        $paymentGateway = new Paymentgateway();
                        $total_amount = $grand_total + $grand_total_round;
                        $passengerdetail = $this->userModel->select("users.login_email AS email, users.login_mobile AS phone, CONCAT_WS(' ', user_details.first_name, user_details.last_name) AS name, user_details.address, user_details.city, user_details.zip_code, country.name AS country")
                            ->join('user_details', 'user_details.user_id = users.id')
                            ->join('country', 'country.id = user_details.country_id')
                            ->where('users.id', $userid)
                            ->first();

                        if($paymentMethod == 5) { // For sslcommerz

                            $post_data = array(
                                "total_amount" => $total_amount,
                                "currency" => $currency,
                                "tran_id" => $rand,
                                "callback_url" => $this->request->getVar('callback_url'),
                                "cus_id" => $userid,
                                "shipping_method" => 'No',
                                "product_name" => 'Bus Ticket',
                                "product_category" => 'Bus',
                                "product_profile" => 'general',
                                "cus_name" => $passengerdetail->name,
                                "cus_email" => $passengerdetail->email,
                                "cus_add1" => $passengerdetail->address,
                                "cus_add2" => '',
                                "cus_city" => $passengerdetail->city,
                                "cus_state" => $passengerdetail->city,
                                "cus_postcode" => $passengerdetail->zip_code,
                                "cus_country" => $passengerdetail->country,
                                "cus_phone" => $passengerdetail->phone,
                                "cus_fax" => $passengerdetail->phone,
                                "multi_card_name" => 'mastercard',
                            );

                            $result = $paymentGateway->sslCommerz($post_data);

                            return $this->response->setJSON($result);

                        }elseif($paymentMethod == 3) { // For stripe
                            
                            $post_data = array(
                                "total_amount" => $total_amount * 100,
                                "currency" => $currency,
                                "tran_id" => $rand,
                                "callback_url" => $this->request->getVar('callback_url'),
                                "cus_id" => $userid,
                                "product_name" => 'Bus Ticket'
                            );
                
                            $result = $paymentGateway->stripePayment($post_data);

                            return $this->response->setJSON($result);
                        }else{
                            $data = [
                               'message' => "Payment Gateway Not Supported",
                               'status' => "fail",
                               'response' => 204,
                               'data' => "Payment Gateway not supported",
                            ];
                            return $this->response->setJSON($data);
                        }                        

                    } else {
                        $data = [
                            'message' => "Booking data error",
                            'status' => "fail",
                            'response' => 204,
                            'data' => "booking data not appropriate",
                        ];
                        return $this->response->setJSON($data);
                    }

                } else {
                    $errors = $this->validation->getErrors();
                    $data = [
                        'message' => "Booking Information Not Valid",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => $errors,
                    ];
                    return $this->response->setJSON($data);
                }
                // Ticket info insert end

            } else {
                $errors = $this->validation->getErrors();
                $data = [
                    'message' => "Booking Information Not Valid",
                    'status' => "failed",
                    'response' => 204,
                    'errors' => $errors,
                ];
                return $this->response->setJSON($data);
            }

        } else {
            $errors = $this->validation->getErrors();
            $data = [
                'message' => "Trip info not found",
                'status' => "failed",
                'response' => 404,
                'errors' => $errors,
            ];
            return $this->response->setJSON($data);
        }  
    }

    public function journeylist($rand, $userid, $maitripid, $subtripid, $piclocation, $droplocation, $pick_stand_id, $drop_stand_id)
    {
        $journeydate = date("Y-m-d", strtotime($this->request->getVar('journeydate')));
        $joruneylistid = null;

        $mainpassanger = array(
            "booking_id" => $rand,
            "trip_id" => $maitripid,
            "subtrip_id" => $subtripid,
            "pick_location_id" => $piclocation,
            "drop_location_id" => $droplocation,
            "pick_stand_id" => $pick_stand_id,
            "drop_stand_id" => $drop_stand_id,
            "first_name" => $this->request->getVar('first_name'),
            "last_name" => $this->request->getVar('last_name'),
            "phone" => $this->request->getVar('login_mobile'),
            "journeydate" => $journeydate,
            "id_number" => $this->request->getVar('id_number'),
        );

        if ($this->validation->run($mainpassanger, 'journeylist')) {

            $joruneylistid = $this->journeylistModel->insert($mainpassanger);
        }



        $newPassangerFName = $this->request->getVar('first_name_new');
        $newPassangerLName = $this->request->getVar('last_name_new');
        $newPassangerMobile = $this->request->getVar('login_mobile_new');
        $newPassangerNidNumber = $this->request->getVar('id_number_new');

        $newPassangerFName =  json_decode($newPassangerFName, true);
        $newPassangerLName =  json_decode($newPassangerLName, true);
        $newPassangerMobile =  json_decode($newPassangerMobile, true);
        $newPassangerNidNumber =  json_decode($newPassangerNidNumber, true);

        if (!empty($newPassangerFName)) {
            foreach ($newPassangerFName as $nkey => $newpassanger) {
                $newpassangerlist[$nkey] = array(

                    "booking_id" => $rand,
                    "trip_id" => $maitripid,
                    "subtrip_id" => $subtripid,
                    "pick_location_id" => $piclocation,
                    "drop_location_id" => $droplocation,
                    "pick_stand_id" => $pick_stand_id,
                    "drop_stand_id" => $drop_stand_id,
                    "first_name" => $newPassangerFName[$nkey],
                    "last_name" => $newPassangerLName[$nkey],
                    "phone" => $newPassangerMobile[$nkey],
                    "journeydate" => $journeydate,
                    "id_number" => $newPassangerNidNumber[$nkey],

                );
            }



            $alljourneydata =  $this->journeylistModel->insertBatch($newpassangerlist);

            if (empty($alljourneydata)) {
                $data = [
                    'message' => "Multiple Pasanger input error",
                    'status' => "failed",
                    'response' => 204,
                    'data' => "journey list input error",
                ];
                return $this->response->setJSON($data);
            }
        }


        return   $joruneylistid;
    }


    public function userCheck($login_email, $login_mobile)
    {
        $userid = null;
        $evalue = $this->userModel->where('login_email', $login_email)->findAll();
        $mvalue = $this->userModel->where('login_mobile', $login_mobile)->findAll();

        if (!empty($evalue) || !empty($mvalue)) {

            if ($evalue) {
                foreach ($evalue as $key => $mobilevalue) {
                    $userid = $mobilevalue->id;
                }
            }
            if ($mvalue) {
                foreach ($mvalue as $key => $emailvalue) {
                    $userid = $emailvalue->id;
                }
            }

            return $userid;
        } else {

            $status = 1;
            $role_id = 3;
            $slug = bin2hex(random_bytes(5));
            $password = $confirm = "123456";


            $userData = array(
                "login_email" => $login_email,
                "login_mobile" => $login_mobile,
                "password" => $password,
                "confirm" => $confirm,
                "slug" => $slug,
                "role_id" => $role_id,
                "status" => $status,
            );

            $validdata = array(
                // "user_id" => $userid,
                "first_name" => $this->request->getVar('first_name'),
                "id_type" => $this->request->getVar('id_type') ?: null,
                "id_number" => $this->request->getVar('id_number') ?: null,
            );

            if ($this->validation->run($userData, 'user') && $this->validation->run($validdata, 'userDetail')) {
                $this->db->transStart();

                $userData['password'] = password_hash($password, PASSWORD_DEFAULT);
                $userid = $this->userModel->insert($userData);


                $data = array(
                    "user_id" => $userid,
                    "first_name" => $this->request->getVar('first_name'),
                    "last_name" => $this->request->getVar('last_name'),
                    "id_type" => $this->request->getVar('id_type') ?: null,
                    "country_id" => $this->request->getVar('country_id'),
                    "id_number" => $this->request->getVar('id_number') ?: null,
                    "address" => $this->request->getVar('address'),
                    "city" => $this->request->getVar('city'),
                    "zip_code" => $this->request->getVar('zip_code'),

                );

                $this->userDetailModel->insert($data);

                $this->db->transComplete();
            }

            return $userid;
        }
    }

    public function busSeat($subTripId, $journeyDate)
    {
        $bookSeat = array();
        $maxtime = $this->maxtimeModel->first();
        $maxtime =  60 * (int)$maxtime->maxtime;
        $journeyDate = date("Y-m-d", strtotime($journeyDate));

        $getData = $this->ticketModel
            ->where('subtrip_id', $subTripId)
            ->where('journeydata', $journeyDate)
            ->where('payment_status', "unpaid")
            ->where('cancel_status', 0)
            ->where('refund', 0)
            ->findAll();

        foreach ($getData as $key => $delvalue) {
            $cratetime = strtotime($delvalue->created_at);
            $timenow = strtotime("now");

            if (($timenow - $cratetime) > $maxtime) {
                $this->ticketModel->where('id', $delvalue->id)->set(['cancel_status' => 1])->update();
                $bookingId = $this->ticketModel->find($delvalue->id);
                $this->journeylistModel->where('booking_id', $bookingId->booking_id)->delete();
            }
        }

        // sub trip and fllet details
        $subtripInfo = $this->subtripModel
            ->select('subtrips.*, trips.fleet_id')
            ->join('trips', 'subtrips.trip_id = trips.id')
            ->where('subtrips.id', $subTripId)
            ->first();

        $getFleetDetails = $this->fleetTypeModel->where('status', 1)->find($subtripInfo->fleet_id);

        // total seat

        // booked seats
        $this->ticketModel
            ->where('journeydata', $journeyDate)
            ->where('cancel_status', 0);

        if ($subtripInfo->type == 'subtrip') {
            $mainTripId = $subtripInfo->trip_id;
            $subtripStoppagePointsArr = array_filter(explode(',', $subtripInfo->stoppage));
            $mainTripMainSubtripId = $this->subtripModel->where('trip_id', $mainTripId)->where('type', 'main')->first();

            $this->ticketModel
                ->groupStart()
                ->whereIn('subtrip_id', [$subtripInfo->id, $mainTripMainSubtripId->id])

                ->orGroupStart()
                ->where('trip_id', $subtripInfo->trip_id)
                ->whereIn('pick_location_id', array_filter($subtripStoppagePointsArr, fn ($stp_id) => $stp_id != $subtripInfo->drop_location_id))
                ->groupEnd()

                ->orGroupStart()
                ->where('trip_id', $subtripInfo->trip_id)
                ->whereIn('drop_location_id', array_filter($subtripStoppagePointsArr, fn ($stp_id) => $stp_id != $subtripInfo->pick_location_id))
                ->groupEnd()
                ->groupEnd();
        } else {
            $this->ticketModel->where('trip_id', $subtripInfo->trip_id);
        }

        $resBookSeats = array_column($this->ticketModel->findAll(), 'seatnumber');
        $bookSeat = array_merge(...array_map(fn ($v) => explode(',', $v), $resBookSeats));

        // build layout
        $seatnumber = explode(",", $getFleetDetails->seat_number);
        $totalseatnumber = count($seatnumber);


        $layout = $this->layoutModel->find($getFleetDetails->layout);
        $layout_details = $this->layoutDetailsModel
            ->select('layout_details.*, sd1.element as column1_element, sd2.element as column2_element, sd3.element as column3_element, sd4.element as column4_element, sd5.element as column5_element')
            ->join('seat_elements sd1', 'sd1.id = layout_details.column1', 'left')
            ->join('seat_elements sd2', 'sd2.id = layout_details.column2', 'left')
            ->join('seat_elements sd3', 'sd3.id = layout_details.column3', 'left')
            ->join('seat_elements sd4', 'sd4.id = layout_details.column4', 'left')
            ->join('seat_elements sd5', 'sd5.id = layout_details.column5', 'left')
            ->where('layout_id', $getFleetDetails->layout)->findAll();


        // Extracting layout details
        $seatRows = [];
        $seatRows['layout_number'] = $layout->layout_number;
        $seatRows['layout_id'] = (int)$layout->id;
        $seatRows['car_type'] = $layout->car_type;
        $seatRows['total_seat'] = (int)$layout->total_seat;
        $seatRows['total_row'] = (int)$layout->total_row;
        $seatRows['total_column'] = (int)$layout->total_column;

        // Initializing seatRows array
        $seatRows['rowData'] = [];

        // Loop through each row
        foreach ($layout_details as $row) {
            $rowData = [
                'row_no' => $row->row_no,
                'columns' => [],
            ];

            // Loop through each column
            for ($i = 1; $i <= (int)$layout->total_column; $i++) {
                $columnKey = 'column' . $i;
                $columnElementKey = 'column' . $i . '_element';
                $seatNoKey = 'seat_no' . $i;

                // Concatenate row and column values to get the full seat number

                $columnData = [
                    'column_no' => $i,
                    'column_value' => (int)$row->$columnKey,
                    'column_element' => $row->$columnElementKey,
                    'seat_no' => $row->$seatNoKey,
                    'isBooked' => ($row->$seatNoKey != '') ? in_array($row->$seatNoKey, $bookSeat) : false,
                ];

                // Adding the column data to the row
                $rowData['columns'][] = $columnData;
            }

            // Adding the row data to the result
            $seatRows['rowData'][] = $rowData;
        }

        $data = [
            'status' => "success",
            'response' => 200,
            'layout' =>  $getFleetDetails->layout,
            'seatlayout' => $seatRows,
            'totalseat' => $totalseatnumber,
        ];

        return $this->response->setJSON($data);
    }
    // public function busSeat($subTripId, $journeyDate)
    // {
    //     $bookSeat = array();
    //     $maxtime = $this->maxtimeModel->first();
    //     $maxtime =  60 * (int)$maxtime->maxtime;
    //     $journeyDate = date("Y-m-d", strtotime($journeyDate));

    //     $getData = $this->ticketModel
    //         ->where('subtrip_id', $subTripId)
    //         ->where('journeydata', $journeyDate)
    //         ->where('payment_status', "unpaid")
    //         ->where('cancel_status', 0)
    //         ->where('refund', 0)
    //         ->findAll();

    //     foreach ($getData as $key => $delvalue) {
    //         $cratetime = strtotime($delvalue->created_at);
    //         $timenow = strtotime("now");

    //         if (($timenow - $cratetime) > $maxtime) {
    //             $this->ticketModel->where('id', $delvalue->id)->set(['cancel_status' => 1])->update();
    //             $bookingId = $this->ticketModel->find($delvalue->id);
    //             $this->journeylistModel->where('booking_id', $bookingId->booking_id)->delete();
    //         }
    //     }

    //     $displaySeat = array();
    //     $sortingdisplaySeat = array();
    //     $anotherarray = array();
    //     $lastSeat = null;

    //     // sub trip and fllet details
    //     $subtripInfo = $this->subtripModel
    //         ->select('subtrips.*, trips.fleet_id')
    //         ->join('trips', 'subtrips.trip_id = trips.id')
    //         ->where('subtrips.id', $subTripId)
    //         ->first();

    //     $getFleetDetails = $this->fleetTypeModel->where('status', 1)->find($subtripInfo->fleet_id);

    //     // total seat
    //     $totalseat = (int) $getFleetDetails->total_seat + (int)$getFleetDetails->last_seat;

    //     // booked seats
    //     $this->ticketModel
    //         ->where('journeydata', $journeyDate)
    //         ->where('cancel_status', 0);

    //     if ($subtripInfo->type == 'subtrip') {
    //         $mainTripId = $subtripInfo->trip_id;
    //         $subtripStoppagePointsArr = array_filter(explode(',', $subtripInfo->stoppage));
    //         $mainTripMainSubtripId = $this->subtripModel->where('trip_id', $mainTripId)->where('type', 'main')->first();

    //         $this->ticketModel
    //             ->groupStart()
    //                 ->whereIn('subtrip_id', [$subtripInfo->id, $mainTripMainSubtripId->id])

    //                 ->orGroupStart()
    //                     ->where('trip_id', $subtripInfo->trip_id)
    //                     ->whereIn('pick_location_id', array_filter($subtripStoppagePointsArr, fn ($stp_id) => $stp_id != $subtripInfo->drop_location_id))
    //                 ->groupEnd()

    //                 ->orGroupStart()
    //                     ->where('trip_id', $subtripInfo->trip_id)
    //                     ->whereIn('drop_location_id', array_filter($subtripStoppagePointsArr, fn ($stp_id) => $stp_id != $subtripInfo->pick_location_id))
    //                 ->groupEnd()
    //             ->groupEnd();
    //     } else {
    //         $this->ticketModel->where('trip_id', $subtripInfo->trip_id);
    //     }

    //     $resBookSeats = array_column($this->ticketModel->findAll(), 'seatnumber');
    //     $bookSeat = array_merge(...array_map(fn ($v) => explode(',', $v), $resBookSeats));

    //     // build layout
    //     $layout = explode("-", $getFleetDetails->layout);
    //     $seatColumn = count($layout);
    //     $numberSeatRow = array_sum($layout);
    //     $seatnumber = explode(",", $getFleetDetails->seat_number);
    //     $storeSeatNumber = $seatnumber;


    //     if ($getFleetDetails->last_seat) {
    //         $lastSeat = array_slice($seatnumber, -1, 1);
    //         array_pop($seatnumber);
    //     }
    //     $totalseatnumber = count($seatnumber);

    //     $seatloopslicenumber =  floor($totalseatnumber / $numberSeatRow);

    //     for ($i = 1; $i <= $seatloopslicenumber; $i++) {
    //         $arrayslice = null;
    //         $arrayslice = array_splice($seatnumber, $numberSeatRow);
    //         $displaySeat[$i] = $seatnumber;
    //         $seatnumber  =  $arrayslice;
    //     }



    //     for ($totalseatrow = 1; $totalseatrow  <= $seatloopslicenumber; $totalseatrow++) {

    //         for ($column = 0; $column < $seatColumn; $column++) {
    //             $x = 0;
    //             foreach ($displaySeat[$totalseatrow] as $key => $seatvalue) {

    //                 if ($layout[$column] >= $key + 1) {
    //                     array_push($anotherarray, $seatvalue);
    //                 } else {
    //                     array_push($anotherarray, null);

    //                     break;
    //                 }
    //                 array_shift($displaySeat[$totalseatrow]);
    //             }
    //         }
    //         $sortingdisplaySeat[$totalseatrow] = $anotherarray;
    //         $anotherarray = array();
    //     }





    //     $kyepos = null;
    //     if (!empty($lastSeat)) {

    //         foreach ($sortingdisplaySeat[$seatloopslicenumber] as $key => $checknull) {
    //             if ($checknull == null) {
    //                 $sortingdisplaySeat[$seatloopslicenumber][$key] = $lastSeat[0];
    //             }
    //         }
    //     }



    //     $newseatarray = array();
    //     $arraynew = array();
    //     $id = 1;
    //     foreach ($sortingdisplaySeat as $key => $shortseat) {

    //         foreach ($shortseat as $skey => $newseat) {

    //             if ($newseat == null) {
    //                 array_push($newseatarray, null);
    //             } else {
    //                 if (in_array($newseat, $bookSeat)) {
    //                     $seatvalue = true;
    //                 } else {
    //                     $seatvalue = false;
    //                 }
    //                 $seatarray  = array(
    //                     "id" => $id,
    //                     "seatNumber" => $newseat,
    //                     "isReserved" => $seatvalue,
    //                 );
    //                 array_push($newseatarray, $seatarray);
    //             }


    //             $id = $id + 1;
    //         }

    //         $arraynew[] = $newseatarray;
    //         $newseatarray = array();
    //     }


    //     $data = [
    //         'status' => "success",
    //         'response' => 200,
    //         'layout' =>  $getFleetDetails->layout,
    //         'seatlayout' => $arraynew,
    //         'totalseat' => $totalseat,

    //     ];

    //     return $this->response->setJSON($data);
    // }


    public function singelBooking($bookingid)
    {
        $ticket = $this->ticketModel->where('booking_id', $bookingid)->first();
        $db = \Config\Database::connect();

        if (empty($ticket)) {
            $data = [
                'message' => "No ticket found",
                'status' => "fail",
                'response' => 201,
                'data' => null,
            ];
        } else {
            // Initialize an array to store ticket results
            $ticketDataArray = [];

            // Check if the ticket has a round_id and retrieve related tickets
            if (!empty($ticket->round_id)) {
                // Get all tickets related to the round trip
                $tickets = $this->ticketModel->where('round_id', $ticket->round_id)->findAll();
            } else {
                // If no round_id, process only the single ticket
                $tickets = [$ticket];
            }

            foreach ($tickets as $ticket) {
                // Fetch trip, schedule, and subtrip data for the current ticket
                $gettripdata = $this->tripModel
                    ->select('trips.*, l_p.name AS pl_name, l_d.name AS dl_name, sc.start_time, sc.end_time')
                    ->join('locations l_p', 'trips.pick_location_id = l_p.id', 'left')
                    ->join('locations l_d', 'trips.drop_location_id = l_d.id', 'left')
                    ->join('schedules sc', 'trips.schedule_id = sc.id', 'left')
                    ->withDeleted()
                    ->find($ticket->trip_id);

                $travelartripdata = $this->subtripModel
                    ->select('subtrips.*, l_p.name AS pl_name, l_d.name AS dl_name')
                    ->join('locations l_p', 'subtrips.pick_location_id = l_p.id')
                    ->join('locations l_d', 'subtrips.drop_location_id = l_d.id')
                    ->withDeleted()
                    ->find($ticket->subtrip_id);

                $paymentdata = $db->table('partialpaids')
                                ->selectSum('paidamount', 'total_paid')
                                ->where('booking_id', $ticket->booking_id)
                                ->get()
                                ->getRow();

                $passengerdata = $this->userModel->find($ticket->passanger_id);
                $ticket->mobile = $passengerdata->login_mobile;
                $ticket->email = $passengerdata->login_email;
                $passengerdetail = $this->userDetailModel->where('user_id', $passengerdata->id)->first();
                $ticket->fullName = $passengerdetail->first_name . ' ' . $passengerdetail->last_name;

                $company = $this->vehicleModel->where('id', $ticket->vehicle_id)->first();
                $ticket->company = $company->company;

                $company_name = $this->tripModel->where('id', $ticket->trip_id)->first();
                $ticket->company_name = $company_name->company_name;

                // Set luggage and price details
                $ticket->paid_max_luggage_pcs = $ticket->paid_max_luggage_pcs ?? 0;
                $ticket->price_pcs = $ticket->price_pcs ?? 0.00;
                $ticket->special_max_luggage_pcs = $ticket->special_max_luggage_pcs ?? 0;
                $ticket->special_price_pcs = $ticket->special_price_pcs ?? 0.00;

                // Trip details
                $ticket->from = $gettripdata->pl_name;
                $ticket->to = $gettripdata->dl_name;
                $ticket->trip_start_time = $gettripdata->start_time;
                $ticket->trip_end_time = $gettripdata->end_time;
                $ticket->travelerPick = $travelartripdata->pl_name;
                $ticket->travelerDrop = $travelartripdata->dl_name;

                // Calculate pricing and total values
                $ticket->discount = (float)$ticket->discount;
                $ticket->totaltax = (float)$ticket->totaltax;
                $ticket->roundtrip_discount = (float)$ticket->roundtrip_discount;
                $ticket->price = (float)$ticket->price;
                $ticket->total_paid_luggage_price = round(((int)$ticket->paid_max_luggage_pcs * (float)$ticket->price_pcs), 2);
                $ticket->total_special_luggage_price = round(((int)$ticket->special_max_luggage_pcs * (float)$ticket->special_price_pcs), 2);

                $ticket->sub_total = round(((float)$ticket->price + (float)$ticket->total_paid_luggage_price + (float)$ticket->total_special_luggage_price), 2);
                $ticket->grand_total = round((float)$ticket->sub_total + (float)$ticket->totaltax - ((float)$ticket->discount + (float)$ticket->roundtrip_discount), 2);
                $ticket->paidamount = $paymentdata->total_paid;

                // Add the processed ticket to the results array
                $ticketDataArray[] = $ticket;
            }

            // Return all processed ticket data
            $data = [
                'message' => count($ticketDataArray) > 1 ? "Multiple tickets found" : "Ticket found",
                'status' => "success",
                'response' => 200,
                'data' => $ticketDataArray,
            ];
        }

        return $this->response->setJSON($data);
    }

    public function paylaterByUser()
    {
        $bookingId = $this->request->getVar('booking_id');
        $paydetail = $this->request->getVar('paydetail');
        $paidamount = $this->request->getVar('paidamount');
        $paymentMethod = $this->request->getVar('pay_method');
        $is_round_pay = $this->request->getVar('is_round_pay');
        $callbackUrl = $this->request->getVar('callback_url');

        if($bookingId && $paymentMethod && $callbackUrl){
        
            $paymentGateway = new Paymentgateway();
            $websetting = $this->webSettingModel->first();
            $currencybuilder = $this->db->table('currencies');
            $curencyquery = $currencybuilder->where('id', $websetting->currency)->get();
            $currency = $curencyquery->getRow()->code;

            $round_amount = 0;

            $ticketInfo = $this->ticketModel->where('booking_id', $bookingId)->where('payment_status', 'unpaid')->first();
            if (isset($ticketInfo)) {

                if (!empty($ticketInfo->round_id) && $is_round_pay == 1) {
                    $tickets = $this->ticketModel->where('round_id', $ticketInfo->round_id)->where('booking_id !=', $bookingId)->where('cancel_status', 0)->where('payment_status', 'unpaid')->first();
                    if(!empty($tickets)) {
                        $round_amount = $tickets->paidamount;
                    }
                }

                $total_amount = $ticketInfo->paidamount + $round_amount;
                $passengerdetail = $this->userModel->select("users.login_email AS email, users.login_mobile AS phone, CONCAT_WS(' ', user_details.first_name, user_details.last_name) AS name, user_details.address, user_details.city, user_details.zip_code, country.name AS country")
                    ->join('user_details', 'user_details.user_id = users.id')
                    ->join('country', 'country.id = user_details.country_id')
                    ->where('users.id', $ticketInfo->passanger_id)
                    ->first();
                
                if($paymentMethod == 5) { // For sslcommerz

                    $post_data = array(
                        "total_amount" => $total_amount,
                        "currency" => $currency,
                        "tran_id" => $bookingId,
                        "callback_url" => $callbackUrl,
                        "cus_id" => $ticketInfo->passanger_id,
                        "shipping_method" => 'No',
                        "product_name" => 'Bus Ticket',
                        "product_category" => 'Bus',
                        "product_profile" => 'general',
                        "cus_name" => $passengerdetail->name,
                        "cus_email" => $passengerdetail->email,
                        "cus_add1" => $passengerdetail->address,
                        "cus_add2" => '',
                        "cus_city" => $passengerdetail->city,
                        "cus_state" => $passengerdetail->city,
                        "cus_postcode" => $passengerdetail->zip_code,
                        "cus_country" => $passengerdetail->country,
                        "cus_phone" => $passengerdetail->phone,
                        "cus_fax" => $passengerdetail->phone,
                        "multi_card_name" => 'mastercard',
                    );
        
                    $result = $paymentGateway->sslCommerz($post_data);
        
                    return $this->response->setJSON($result);
        
                }elseif($paymentMethod == 3) { // For stripe
                    
                    $post_data = array(
                        "total_amount" => $total_amount * 100,
                        "currency" => $currency,
                        "tran_id" => $bookingId,
                        "callback_url" => $callbackUrl,
                        "cus_id" => $ticketInfo->passanger_id,
                        "product_name" => 'Bus Ticket'
                    );
        
                    $result = $paymentGateway->stripePayment($post_data);
        
                    return $this->response->setJSON($result);
                }else{
                    $data = [
                        'message' => "Payment Gateway Not Supported",
                        'status' => "fail",
                        'response' => 204,
                        'data' => "Payment Gateway not supported",
                    ];
                    return $this->response->setJSON($data);
                }

            } else {
                $data = [
                    'message' => "Invalid booking id",
                    'status' => "failed",
                    'response' => 204,
                    'data' => "Invalid booking id or already paid",
                ];
                return $this->response->setJSON($data);
            } 
        } else {
            $data = [
                'message' => "Booking info are missing",
                'status' => "failed",
                'response' => 204,
                'data' => "Booking id, payment method or callback url are missing",
            ];
            return $this->response->setJSON($data);
        } 
    }

    public function stripePayment()
    {
        $rules = [
            'stripetoken'  => 'required',
            'amount'       => 'required',
        ];

        if ($this->validate($rules)) {
            $amount = $this->request->getVar('amount');
            $paymentToken = $this->request->getVar('stripetoken');
            $getPayData = $this->stripeModel->first();

            if ($getPayData->environment == 1) {
                $secret_key = $getPayData->live_s_kye;
                $environment = "live";
            } else {
                $secret_key = $getPayData->test_s_kye;
                $environment = "Test";
            }

            $websetting  = $this->webSettingModel->first();
            $currencybuilder = $this->db->table('currencies');
            $curencyquery = $currencybuilder->where('id', $websetting->currency)->get();
            $currency = $curencyquery->getRow()->code;

            try {
                \Stripe\Stripe::setApiKey($secret_key);

                // stripe, old charge code
                /* $paymentIntent = \Stripe\Charge::create([
                    "amount"     => $amount * 100,
                    "currency"     => $currency,
                    "source"     => $paymentToken,
                    "description"   => "Seat Booking Payment"
                ]); */

                // upgrading to 3Ds
                $customer = \Stripe\Customer::create([
                    'name' => 'Jahid Limon',
                    'email' => 'jahid@bdtask.net'
                ]);

                $paymentIntent = \Stripe\PaymentIntent::create([
                    'amount' => $amount,
                    'currency' => $currency,
                    'payment_method_data' => [
                        'type' => 'card',
                        'card' => [
                            'token' => $paymentToken,
                        ],
                    ],
                    'confirmation_method' => 'manual',
                    'customer' => $customer->id
                ]);

                $paymentIntent->confirm();

                $data = [
                    'message'   => "Payment Successfull",
                    'status'    => "success",
                    'response'  => 200,
                    'data'      => $paymentIntent,
                ];
                return $this->response->setJSON($data);
            } catch (\Exception $e) {
                $data = [
                    'message' => "Payment Fail",
                    'status' => "fail",
                    'response' => 404,
                    'data' => $e->getMessage(),
                ];
                return $this->response->setJSON($data);
            }
        } else {
            $data = array(
                'success' => false,
                'response' => 204,
                'message' => 'All field required',
                'data' => $this->validator->getErrors(),
            );
            return $this->response->setJSON($data);
        }
    }

    public function laterBookticket()
    {
        $ticketmailLibrary = new Ticketmail();
        $ticketid = null;

        $rand = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
        $rand = "TB" . $rand;

        $round_id = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
        $round_id = "RT" . $round_id;

        $login_email = $this->request->getVar('login_email');
        $login_mobile = $this->request->getVar('login_mobile');
        $this->db->transStart();

        $userid = $this->userCheck($login_email, $login_mobile);
        if (empty($userid)) {
            $data = [
                'message' => "User check fail",
                'status' => "fail",
                'response' => 404,
                'data' => "user check error",
            ];
            return $this->response->setJSON($data);
        }

        $websetting = $this->webSettingModel->first();
        if ($websetting) {
            $timeForTimezone = $websetting->timezone;
            $timezone = new \DateTimeZone($timeForTimezone);
            $date = new \DateTime('now', $timezone);
            $created_at = $date->format('Y-m-d H:i:s');
        }

        $coupon_code = $this->request->getVar('coupon_code');
        $tax_percent = 0;
        $taxInfo = $this->taxModel->select('SUM(value) AS total_tax')->where('status',1)->findAll();
        if ($taxInfo) {
            $websetting	= $this->webSettingModel->first();
            if($websetting->tax_type == 'exclusive'){
                $tax_percent = $taxInfo[0]->total_tax;
            }
        }

        $tripInfo = '';
        $tripInfo_round = '';

        // For sing ticket
        $trip_id = $this->request->getVar('trip_id');
        $subtrip_id = $this->request->getVar('subtripId');
        $validTicketbooking = array();
        $ticketbooking = array();

        if($trip_id && $subtrip_id){

            $validTicketbooking = array(
                "booking_id" => $rand,
                "trip_id" => $this->request->getVar('trip_id'),
                "subtrip_id" => $this->request->getVar('subtripId'),
                "passanger_id" => $userid,
                "pick_location_id" => $this->request->getVar('pick_location_id'),
                "drop_location_id" => $this->request->getVar('drop_location_id'),
                "pick_stand_id" => $this->request->getVar('pickstand'),
                "drop_stand_id" => $this->request->getVar('dropstand'),
                "seatnumber" => $this->request->getVar('seatnumbers'),
                "totalseat" => $this->request->getVar('totalseat'),
                "bookby_user_id" => $userid,
                "journeydata" => $this->request->getVar('journeydate'),
                "vehicle_id" => $this->request->getVar('vehicle_id'),
                "payment_status" => $this->request->getVar('payment_status'),
            );
            
            $tripInfo = $this->subtripModel->select('trips.id as tripid,trips.*,subtrips.id as subtripId,subtrips.*')
                ->join('trips', 'trips.id = subtrips.trip_id')
                ->where('subtrips.status', 1)
                ->where('subtrips.id', $subtrip_id)
                ->where('subtrips.trip_id', $trip_id)
                ->findAll();

            if($tripInfo){
                $coupon_discount = 0;
                if($coupon_code){
                    $journey_date = $this->request->getVar('journeydate');
                    $journey_date = date("Y-m-d",strtotime($journey_date));
                    $validCouponDetail = $this->couponModel->where('code',$coupon_code)
                        ->where('subtrip_id', $subtrip_id)
                        ->where('end_date >=', $journey_date)
                        ->where('start_date <=', $journey_date)
                        ->findAll();

                    if ($validCouponDetail) {
                        $coupon_discount =  $validCouponDetail[0]->discount;
                        $coupon_id =  $validCouponDetail[0]->id;
                    }
                }

                $adults = (float) $this->request->getVar('aseat');
                $chields = (float) $this->request->getVar('cseat');
                $specials = (float) $this->request->getVar('spseat');

                $total_seats = $adults + $chields + $specials;

                $adult_price = $adults * $tripInfo[0]->adult_fair;
                $chield_price = $chields * $tripInfo[0]->child_fair;
                $special_price = $specials * $tripInfo[0]->special_fair;
                $total_price = $adult_price + $chield_price + $special_price;

                $luggages = (float) $this->request->getVar('paid_max_luggage_pcs');
                if ($luggages > $tripInfo[0]->paid_max_luggage_pcs){
                    $data = [
                        'message' => "Paid luggage limit exceeded",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => "Paid luggage limit exceeded",
                    ];
                    return $this->response->setJSON($data);
                }
                $luggage_price = $luggages * $tripInfo[0]->price_pcs;

                $special_luggages = (float) $this->request->getVar('special_max_luggage_pcs');
                if ($special_luggages > $tripInfo[0]->special_max_luggage_pcs){
                    $data = [
                        'message' => "Special luggage limit exceeded",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => "Special luggage limit exceeded",
                    ];
                    return $this->response->setJSON($data);
                }
                $special_luggage_price = $special_luggages * $tripInfo[0]->special_price_pcs;

                $sub_total = $total_price + $luggage_price + $special_luggage_price;

                $tax_total = 0;
                if ($tax_percent > 0) {
                    $tax_total = $sub_total * ($tax_percent / 100);
                }

                $grand_total = ($sub_total + $tax_total) - $coupon_discount;

                $ticketbooking = array(
                    "booking_id" => $rand,
                    "round_id" => $this->request->getVar('trip_id_round') ? $round_id : NULL,
                    "trip_id" => $this->request->getVar('trip_id'),
                    "subtrip_id" => $this->request->getVar('subtripId'),
                    "passanger_id" => $userid,
                    "pick_location_id" => $this->request->getVar('pick_location_id'),
                    "drop_location_id" => $this->request->getVar('drop_location_id'),
                    "pick_stand_id" => $this->request->getVar('pickstand'),
                    "drop_stand_id" => $this->request->getVar('dropstand'),
                    "price" => $total_price,
                    "discount" => $coupon_discount,
                    "totaltax" => $tax_total,
                    "paidamount" => $grand_total,
                    "adult" => $this->request->getVar('aseat'),
                    "chield" => $this->request->getVar('cseat'),
                    "special" => $this->request->getVar('spseat'),
                    "refund" => 0,
                    "bookby_user_id" => $userid,
                    "bookby_user_type" => "passanger",
                    "journeydata" => $this->request->getVar('journeydate'),
                    "pay_method_id" => 999,
                    "payment_status" => $this->request->getVar('payment_status'),
                    "vehicle_id" => $this->request->getVar('vehicle_id'),
                    "cancel_status" => 0,
        
                    "offerer" => $coupon_discount > 0 ? $coupon_code : NULL,
                    "seatnumber" => $this->request->getVar('seatnumbers'),
                    "totalseat" => $total_seats,
                    "free_luggage_kg" => 0.00,
                    "paid_max_luggage_pcs" => $this->request->getVar('paid_max_luggage_pcs'),
                    "price_pcs" =>  $tripInfo[0]->price_pcs,
                    "special_max_luggage_pcs" => $this->request->getVar('special_max_luggage_pcs'),
                    "special_price_pcs" => $tripInfo[0]->special_price_pcs,
                    "special_luggage" => $this->request->getVar('special_luggage'),
                    "created_at" => $created_at ?? now(),
                );

                // For Round Trip
                $trip_id_round = $this->request->getVar('trip_id_round');
                $subtrip_id_round = $this->request->getVar('subtripId_round');
                $validTicketbooking_round = array();
                $ticketbooking_round = array();

                if ($trip_id_round && $subtrip_id_round) {
                    
                    $rand_round = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 8);
                    $rand_round = "TB" . $rand_round;

                    $validTicketbooking_round = array(
                        "booking_id" => $rand_round,
                        "trip_id" => $this->request->getVar('trip_id_round'),
                        "subtrip_id" => $this->request->getVar('subtripId_round'),
                        "passanger_id" => $userid,
                        "pick_location_id" => $this->request->getVar('pick_location_id_round'),
                        "drop_location_id" => $this->request->getVar('drop_location_id_round'),
                        "pick_stand_id" => $this->request->getVar('pickstand_round'),
                        "drop_stand_id" => $this->request->getVar('dropstand_round'),
                        "seatnumber" => $this->request->getVar('seatnumbers_round'),
                        "totalseat" => $this->request->getVar('totalseat_round'),
                        "bookby_user_id" => $userid,
                        "journeydata" => $this->request->getVar('journeydate_round'),
                        "vehicle_id" => $this->request->getVar('vehicle_id_round'),
                        "payment_status" => $this->request->getVar('payment_status'),
                    );

                    $tripInfo_round = $this->subtripModel->select('trips.id as tripid,trips.*,subtrips.id as subtripId,subtrips.*')
                        ->join('trips', 'trips.id = subtrips.trip_id')
                        ->where('subtrips.status', 1)
                        ->where('subtrips.id', $subtrip_id_round)
                        ->where('subtrips.trip_id', $trip_id_round)
                        ->findAll();
        
                    if ($tripInfo_round) {

                        $coupon_discount_round = 0;
                        if($coupon_code){
                            $journey_date_round = $this->request->getVar('journeydate_round');
                            $journey_date_round = date("Y-m-d",strtotime($journey_date_round));
                            $validCouponDetailRound = $this->couponModel->where('code',$coupon_code)
                                ->where('subtrip_id', $subtrip_id_round)
                                ->where('end_date >=', $journey_date_round)
                                ->where('start_date <=', $journey_date_round)
                                ->findAll();
    
                            if ($validCouponDetailRound) {
                                $coupon_discount_round =  $validCouponDetailRound[0]->discount;
                                $coupon_id_round = $validCouponDetailRound[0]->id;
                            }
                        }
    
                        $adults_round = (float) $this->request->getVar('aseat_round');
                        $chields_round = (float) $this->request->getVar('cseat_round');
                        $specials_round = (float) $this->request->getVar('spseat_round');
    
                        $total_seats_round = $adults_round + $chields_round + $specials_round;
    
                        $adult_price_round = $adults_round * $tripInfo_round[0]->adult_fair;
                        $chield_price_round = $chields_round * $tripInfo_round[0]->child_fair;
                        $special_price_round = $specials_round * $tripInfo_round[0]->special_fair;
                        $total_price_round = $adult_price_round + $chield_price_round + $special_price_round;
    
                        $luggages_round = (float) $this->request->getVar('paid_max_luggage_pcs_round');
                        if ($luggages_round > $tripInfo_round[0]->paid_max_luggage_pcs){
                            $data = [
                                'message' => "Paid luggage limit exceeded for round trip",
                                'status' => "failed",
                                'response' => 204,
                                'errors' => "Paid luggage limit exceeded",
                            ];
                            return $this->response->setJSON($data);
                        }
                        $luggage_price_round = $luggages_round * $tripInfo_round[0]->price_pcs;
    
                        $special_luggages_round = (float) $this->request->getVar('special_max_luggage_pcs_round');
                        if ($special_luggages_round > $tripInfo_round[0]->special_max_luggage_pcs){
                            $data = [
                                'message' => "Special luggage limit exceeded  for round trip",
                                'status' => "failed",
                                'response' => 204,
                                'errors' => "Special luggage limit exceeded",
                            ];
                            return $this->response->setJSON($data);
                        }
                        $special_luggage_price_round = $special_luggages_round * $tripInfo_round[0]->special_price_pcs;
    
                        $sub_total_round = $total_price_round + $luggage_price_round + $special_luggage_price_round;
    
                        $tax_total_round = 0;
                        if ($tax_percent > 0) {
                            $tax_total_round = $sub_total_round * ($tax_percent / 100);
                        }
    
                        $grand_total_round = ($sub_total_round + $tax_total_round) - $coupon_discount_round;
                        
                        $ticketbooking_round = array(
                            "booking_id" => $rand_round,
                            "round_id" => $this->request->getVar('trip_id_round') ? $round_id : NULL,
                            "trip_id" => $this->request->getVar('trip_id_round'),
                            "subtrip_id" => $this->request->getVar('subtripId_round'),
                            "passanger_id" => $userid,
                            "pick_location_id" => $this->request->getVar('pick_location_id_round'),
                            "drop_location_id" => $this->request->getVar('drop_location_id_round'),
                            "pick_stand_id" => $this->request->getVar('pickstand_round'),
                            "drop_stand_id" => $this->request->getVar('dropstand_round'),
                            "price" => $total_price_round,
                            "discount" => $coupon_discount_round,
                            "totaltax" => $tax_total_round,
                            "paidamount" => $grand_total_round,
                            "adult" => $this->request->getVar('aseat_round'),
                            "chield" => $this->request->getVar('cseat_round'),
                            "special" => $this->request->getVar('spseat_round'),
                            "refund" => 0,
                            "bookby_user_id" => $userid,
                            "bookby_user_type" => "passanger",
                            "journeydata" => $this->request->getVar('journeydate_round'),
                            "pay_method_id" => 999,
                            "payment_status" => $this->request->getVar('payment_status'),
                            "vehicle_id" => $this->request->getVar('vehicle_id_round'),
                            "cancel_status" => 0,
                
                            "offerer" => $coupon_discount_round > 0 ? $coupon_code : NULL,
                            "seatnumber" => $this->request->getVar('seatnumbers_round'),
                            "totalseat" => $total_seats_round,
                            "free_luggage_kg" => 0.00,
                            "paid_max_luggage_pcs" => $this->request->getVar('paid_max_luggage_pcs_round'),
                            "price_pcs" =>  $tripInfo_round[0]->price_pcs,
                            "special_max_luggage_pcs" => $this->request->getVar('special_max_luggage_pcs_round'),
                            "special_price_pcs" => $tripInfo_round[0]->special_price_pcs,
                            "special_luggage" => $this->request->getVar('special_luggage_round'),
                            "created_at" => $created_at ?? now(),
                        );
                    }
                }

                // Ticket info insert start
                if ($this->validation->run($validTicketbooking, 'web_ticket')) {
                    
                    $paymentStatus = $this->request->getVar('payment_status');
                    if ($paymentStatus == "unpaid") {
                        $paidamount = 0;
                    }

                    $ticketid = $this->ticketModel->insert($ticketbooking);
                    if($ticketid){
                        $partialPaid = array(
                            "booking_id" => $rand,
                            "trip_id" => $this->request->getVar('trip_id'),
                            "subtrip_id" => $this->request->getVar('subtripId'),
                            "passanger_id" => $userid,
                            "paidamount" => $paidamount,
                        );
            
                        $paidpartial = array(
                            "booking_id" => $rand,
                            "trip_id" => $this->request->getVar('trip_id'),
                            "subtrip_id" => $this->request->getVar('subtripId'),
                            "passanger_id" => $userid,
                            "paidamount" => $paidamount,
                            "pay_method_id" => 999,
                            "payment_detail" => $this->request->getVar('paydetail'),
                        );

                        if($coupon_discount > 0){
                            $coupondetail = array(
                                "code" => $coupon_code,
                                "coupon_id" => $coupon_id,
                                "booking_id" => $rand,
                                "subtrip_id" => $this->request->getVar('subtripId'),
                                "amount" => $coupon_discount,
                            );
                
                            $this->coupondiscountModel->insert($coupondetail);
                        }
                        

                        if ($this->validation->run($partialPaid, 'partialpay')) {
                            
                            $this->partialpaidModel->insert($paidpartial);

                            $maitripid = $this->request->getVar('trip_id');
                            $subtripid = $this->request->getVar('subtripId');
                            $piclocation = $this->request->getVar('pick_location_id');
                            $droplocation = $this->request->getVar('drop_location_id');
                            $pick_stand_id = $this->request->getVar('pickstand');
                            $drop_stand_id = $this->request->getVar('dropstand');

                            $journeylist = $this->journeylist($rand, $userid, $maitripid, $subtripid, $piclocation, $droplocation, $pick_stand_id, $drop_stand_id);
                            if(empty($journeylist)){
                                $data = [
                                    'message' => "journey list data not inserted",
                                    'status' => "fail",
                                    'response' => 204,
                                    'errors' => "journey list data not inserted",
                                ];
                                // return $this->response->setJSON($data);
                            }
                            
                            // Round trip data insertion
                            if ($tripInfo_round) {
                                if ($this->validation->run($validTicketbooking_round, 'web_ticket')) {

                                    $ticketid_round = $this->ticketModel->insert($ticketbooking_round);
                                    if($ticketid_round){
                                        $partialPaid_round = array(
                                            "booking_id" => $rand_round,
                                            "trip_id" => $this->request->getVar('trip_id_round'),
                                            "subtrip_id" => $this->request->getVar('subtripId_round'),
                                            "passanger_id" => $userid,
                                            "paidamount" => $paidamount,
                                        );
                            
                                        $paidpartial_round = array(
                                            "booking_id" => $rand_round,
                                            "trip_id" => $this->request->getVar('trip_id_round'),
                                            "subtrip_id" => $this->request->getVar('subtripId_round'),
                                            "passanger_id" => $userid,
                                            "paidamount" => $paidamount,
                                            "pay_method_id" => 999,
                                            "payment_detail" => $this->request->getVar('paydetail'),
                                        );

                                        if($coupon_discount_round > 0){
                                            $coupondetail_round = array(
                                                "code" => $coupon_code,
                                                "coupon_id" => $coupon_id_round,
                                                "booking_id" => $rand_round,
                                                "subtrip_id" => $this->request->getVar('subtripId_round'),
                                                "amount" => $coupon_discount_round,
                                            );
                                
                                            $this->coupondiscountModel->insert($coupondetail_round);
                                        }

                                        if ($this->validation->run($partialPaid_round, 'partialpay')) {
                                            
                                            $this->partialpaidModel->insert($paidpartial_round);
                                            
                                            $maitripid = $this->request->getVar('trip_id_round');
                                            $subtripid = $this->request->getVar('subtripId_round');
                                            $piclocation = $this->request->getVar('pick_location_id_round');
                                            $droplocation = $this->request->getVar('drop_location_id_round');
                                            $pick_stand_id = $this->request->getVar('pickstand_round');
                                            $drop_stand_id = $this->request->getVar('dropstand_round');
                                            
                                            $journeylist_round = $this->journeylist($rand_round, $userid, $maitripid, $subtripid, $piclocation, $droplocation, $pick_stand_id, $drop_stand_id);
                
                                            if (empty($journeylist_round)) {
                                                $data = [
                                                    'message' => "journey list data not inserted for round trip",
                                                    'status' => "fail",
                                                    'response' => 204,
                                                    'errors' => "journey list data not inserted",
                                                ];
                                                // return $this->response->setJSON($data);
                                            }
                                            
                                            $this->db->transComplete();

                                            $ticketInfo =  $this->ticketModel->find($ticketid);
                                            $emaildata = $ticketmailLibrary->getticketEmailData($rand);
                                            $status = sendTicket($login_email, $emaildata);

                                            $ticketInfo_round =  $this->ticketModel->find($ticketid_round);
                                            $emaildata_round = $ticketmailLibrary->getticketEmailData($rand_round);
                                            $status_round = sendTicket($login_email, $emaildata_round);

                                            if ($status == true && $status_round == true) {
                                                $data = [
                                                    'status' => "success",
                                                    'response' => 200,
                                                    'data' => [
                                                        $ticketInfo,
                                                        $ticketInfo_round
                                                    ],
                                                ];
                                                return $this->response->setJSON($data);

                                            } else {
                                                $data = [
                                                    'status' => "success",
                                                    'response' => 200,
                                                    'data' => [
                                                        $ticketInfo,
                                                        $ticketInfo_round
                                                    ],
                                                    'emailerror' => $status,
                                                ];
                                                return $this->response->setJSON($data);
                                            }
                                        } else {
                                            $errors = $this->validation;
                                            $data = [
                                                'message' => "Booking & Paid Information Not Valid",
                                                'status' => "failed",
                                                'response' => 204,
                                                'errors' => $errors->listErrors(),
                                            ];
                                            // return $this->response->setJSON($data);
                                        }

                                    } else {
                                        $data = [
                                            'message' => "Round Trip Booking data error",
                                            'status' => "fail",
                                            'response' => 204,
                                            'data' => "Booking data not appropriate",
                                        ];
                                        // return $this->response->setJSON($data);
                                    }

                                } else {
                                    $errors = $this->validation->getErrors();
                                    $data = [
                                        'message' => "Round Trip Booking Information Not Valid",
                                        'status' => "failed",
                                        'response' => 204,
                                        'errors' => $errors,
                                    ];
                                    // return $this->response->setJSON($data);
                                }


                            } else {
                                $this->db->transComplete();
            
                                $ticketInfo =  $this->ticketModel->find($ticketid);
                                $emaildata = $ticketmailLibrary->getticketEmailData($rand);
                
                                $status = sendTicket($login_email, $emaildata);
                                if ($status == true) {
                                    $data = [
                                        'status' => "success",
                                        'response' => 200,
                                        'data' => $ticketInfo,
                                    ];
                                    return $this->response->setJSON($data);
                                } else {
                                    $data = [
                                        'status' => "success",
                                        'response' => 200,
                                        'data' => $ticketInfo,
                                        'emailerror' => $status,
                                    ];
                                    return $this->response->setJSON($data);
                                }
                            }

                        } else {
                            $errors = $this->validation;
                            $data = [
                                'message' => "Booking & Paid Information Not Valid",
                                'status' => "failed",
                                'response' => 204,
                                'errors' => $errors->listErrors(),
                            ];
                            return $this->response->setJSON($data);
                        }

                    }else{
                        $data = [
                            'message' => "Booking data error",
                            'status' => "fail",
                            'response' => 204,
                            'data' => "booking data not appropriate",
                        ];
                        return $this->response->setJSON($data);
                    }

                } else {
                    $errors = $this->validation->getErrors();
                    $data = [
                        'message' => "Booking Information Not Valid",
                        'status' => "failed",
                        'response' => 204,
                        'errors' => $errors,
                    ];
                    return $this->response->setJSON($data);
                }
                // Ticket info insert end

            } else {
                $errors = $this->validation->getErrors();
                $data = [
                    'message' => "Booking Information Not Valid",
                    'status' => "failed",
                    'response' => 204,
                    'errors' => $errors,
                ];
                return $this->response->setJSON($data);
            }

        } else {
            $errors = $this->validation->getErrors();
            $data = [
                'message' => "Trip info not found",
                'status' => "failed",
                'response' => 404,
                'errors' => $errors,
            ];
            return $this->response->setJSON($data);
        }

        return $this->response->setJSON($data);
    }
    public function luggageSettings($subTripId)
    {
        $tripLuggageInfo = $this->subtripModel
            ->select(
                'trips.free_luggage_kg, 
            trips.paid_max_luggage_pcs, 
            trips.price_pcs,
            trips.special_max_luggage_pcs,
            trips.special_price_pcs,
            trips.max_length,
            trips.max_weight'
            )
            ->join('trips', 'subtrips.trip_id = trips.id')
            ->where('subtrips.id', $subTripId)
            ->first();

        $luggageInfoGlobal = $this->luggageSettingModel->first();

        // Create a new object to store the merged values
        $mergedLuggageInfo = new \stdClass();

        // Merge objects, considering the condition and casting to int or float
        $mergedLuggageInfo->free_luggage_kg = is_numeric($tripLuggageInfo->free_luggage_kg) ? intval($tripLuggageInfo->free_luggage_kg) : intval($luggageInfoGlobal->free_luggage_kg);
        $mergedLuggageInfo->paid_max_luggage_pcs = is_numeric($tripLuggageInfo->paid_max_luggage_pcs) ? intval($tripLuggageInfo->paid_max_luggage_pcs) : intval($luggageInfoGlobal->paid_max_luggage_pcs);
        $mergedLuggageInfo->price_pcs = is_numeric($tripLuggageInfo->price_pcs) ? number_format(floatval($tripLuggageInfo->price_pcs), 2, '.', '') : number_format(floatval($luggageInfoGlobal->price_pcs), 2, '.', '');
        $mergedLuggageInfo->special_max_luggage_pcs = is_numeric($tripLuggageInfo->special_max_luggage_pcs) ? intval($tripLuggageInfo->special_max_luggage_pcs) : intval($luggageInfoGlobal->special_max_luggage_pcs);
        $mergedLuggageInfo->special_price_pcs = is_numeric($tripLuggageInfo->special_price_pcs) ? number_format(floatval($tripLuggageInfo->special_price_pcs), 2, '.', '') : number_format(floatval($luggageInfoGlobal->special_price_pcs), 2, '.', '');
        $mergedLuggageInfo->max_length = is_numeric($tripLuggageInfo->max_length) ? number_format(floatval($tripLuggageInfo->max_length), 2, '.', '') : number_format(floatval($luggageInfoGlobal->max_length), 2, '.', '');
        $mergedLuggageInfo->max_weight = is_numeric($tripLuggageInfo->max_weight) ? number_format(floatval($tripLuggageInfo->max_weight), 2, '.', '') : number_format(floatval($luggageInfoGlobal->max_weight), 2, '.', '');



        $data = [
            'status' => "success",
            'response' => 200,
            'luggageInfoForTrip' => $tripLuggageInfo,
            'luggageInfoGlobal' => $luggageInfoGlobal,
            'luggageSettings' => $mergedLuggageInfo,
        ];

        return $this->response->setJSON($data);
    }
}

<?php

namespace Modules\Report\Controllers;

use App\Controllers\BaseController;
use App\Libraries\UserCheck;
use Modules\Trip\Models\TripModel;
use Modules\Ticket\Models\TicketModel;

use Modules\Trip\Models\SubtripModel;
use Modules\Trip\Models\PickdropModel;

use Modules\Location\Models\LocationModel;

use Modules\Fleet\Models\FleetModel;
use Modules\Fleet\Models\VehicleModel;
use Modules\Schedule\Models\ScheduleModel;
use Modules\Location\Models\StandModel;

use Modules\Agent\Models\AgentModel;
use Modules\Agent\Models\Agentcommission;

use Modules\User\Models\UserModel;
use Modules\User\Models\UserDetailModel;

use Modules\Employee\Models\EmployeeModel;
use Modules\Trip\Models\StuffassignModel;



class Report extends BaseController
{

    protected $Viewpath;
    protected $tripModel;
    protected $subtripModel;
    protected $locationModel;
    protected $fleetTypeModel;
    protected $scheduleeModel;
    protected $vehicleModel;
    protected $standModel;
    protected $picdropModel;

    protected $ticketModel;
    protected $agenttModel;

    protected $agentCommissionModel;

    protected $userModel;
    protected $userDetailModel;

    protected $employeeModel;
    protected $stuffassignModel;

    protected $db;

    public function __construct()
    {
        $this->Viewpath = "Modules\Report\Views";
        $this->tripModel = new TripModel();
        $this->subtripModel = new SubtripModel();
        $this->locationModel = new LocationModel();
        $this->fleetTypeModel = new FleetModel();
        $this->vehicleModel = new VehicleModel();
        $this->scheduleeModel = new ScheduleModel();
        $this->standModel = new StandModel();
        $this->picdropModel = new PickdropModel();

        $this->ticketModel = new TicketModel();
        $this->agenttModel = new AgentModel();
        $this->agentCommissionModel = new Agentcommission();

        $this->userModel = new UserModel();
        $this->userDetailModel = new UserDetailModel();

        $this->employeeModel = new EmployeeModel();
        $this->stuffassignModel = new StuffassignModel();

        $this->db      = \Config\Database::connect();
    }

    public function ticketSaleLoad()
    {
        $data['trip'] = $this->tripModel->select('trips.id as tripid,trips.*,schedules.*,a.name as pickup_location_name,b.name as drop_location_name')
            ->join('schedules', 'schedules.id = trips.schedule_id', 'left')
            ->join('locations a', 'a.id = trips.pick_location_id', 'left')
            ->join('locations b', 'b.id = trips.drop_location_id', 'left')
            ->where('trips.status', 1)
            ->findAll();

        $data['filepath'] =  $this->Viewpath;
        $ticket = array();
        $data['ticket'] = $ticket;

        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.ticket_sold");

        $heading = lang("Localize.ticket") . ' ' . lang("Localize.report");
        $data['pageheading'] = $heading;

        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        echo view($this->Viewpath . '\report/ticketsold', $data);
    }

    public function ticketSaleData()
    {
        $fromDate = $this->request->getVar('start_date');
        $toDate = $this->request->getVar('end_date');
        $maintripId = $this->request->getVar('trip_id');
        $subTripId = $this->request->getVar('subtrip_id');
        $ticketType = $this->request->getVar('type');

        if ($ticketType == "normal") {

            $this->ticketModel->where('refund', 0)->where('cancel_status', 0);
        }
        if ($ticketType == "refund") {

            $this->ticketModel->where('refund', 1);
        }
        if ($ticketType == "cancel") {
            $this->ticketModel->where('cancel_status', 1);
        }

        if ($maintripId == "all") {
            // $this->ticketModel->where('refund',0)->where('cancel_status',0);

        } else {
            if ($subTripId == "all") {

                $this->ticketModel->where('tickets.trip_id', $maintripId);
            } else {
                $this->ticketModel->where('tickets.trip_id', $maintripId)->where('subtrip_id', $subTripId);
            }
        }

        $this->ticketModel->where('DATE(tickets.created_at) >=', $fromDate)->where('DATE(tickets.created_at) <=', $toDate);


        $ticket = $this->ticketModel->select('tickets.created_at as date,tickets.*,trips.id as tripid,trips.*,subtrips.id as subtripid,subtrips.*,schedules.*,a.name as pickup_location_name,b.name as drop_location_name,c.name as sub_pickup_location_name,d.name as sub_drop_location_name')

            ->join('trips', 'trips.id = tickets.trip_id')
            ->join('subtrips', 'subtrips.id = tickets.subtrip_id')
            ->join('schedules', 'schedules.id = trips.schedule_id')
            ->join('locations a', 'a.id = trips.pick_location_id', 'left')
            ->join('locations b', 'b.id = trips.drop_location_id', 'left')
            ->join('locations c', 'c.id = subtrips.pick_location_id', 'left')
            ->join('locations d', 'd.id = subtrips.drop_location_id', 'left')
            ->where('trips.status', 1)

            ->findAll();


        // dd($ticket);
        $data['filepath'] =  $this->Viewpath;

        $data['ticket'] = $ticket;

        $data['trip'] = $this->tripModel->select('trips.id as tripid,trips.*,schedules.*,a.name as pickup_location_name,b.name as drop_location_name')
            ->join('schedules', 'schedules.id = trips.schedule_id', 'left')
            ->join('locations a', 'a.id = trips.pick_location_id', 'left')
            ->join('locations b', 'b.id = trips.drop_location_id', 'left')
            ->where('trips.status', 1)
            ->findAll();

        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.ticket_sold");

        $heading = lang("Localize.ticket") . ' ' . lang("Localize.report");
        $data['pageheading'] = $heading;

        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        echo view($this->Viewpath . '\report/ticketsold', $data);
    }

    public function agentCommissionLoad()
    {
        $userchek = new UserCheck();
        $agentData = "";
        $userType = $userchek->getUserType();

        if ($userType == 2) {
            $agentId =  $this->session->get('user_id');
            $agentData = $this->agenttModel->where('user_id', $agentId)->findAll();
        } else {
            $agentData = $this->agenttModel->findAll();
        }

        $data['agentList'] = $agentData;
        $data['userType'] = $userType;
        $data['filepath'] =  $this->Viewpath;
        $commission = array();
        $data['commission'] = $commission;

        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.agent_report");

        $heading = lang("Localize.agent") . ' ' . lang("Localize.report");
        $data['pageheading'] = $heading;

        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        return view($this->Viewpath . '\report\agentcommission', $data);
    }

    public function agentCommissionDetails()
    {
        $userchek = new UserCheck();
        $userType = $userchek->getUserType();

        $fromDate = $this->request->getVar('start_date');
        $toDate = $this->request->getVar('end_date');

        // $subTripId = $this->request->getVar('subtrip_id');
        $agentid = $this->request->getVar('agent_id');

        if ($agentid != "all") {
            $this->agentCommissionModel->where('agentcommissions.agent_id', $agentid);
        }

        $this->agentCommissionModel->where('DATE(agentcommissions.created_at) >=', $fromDate);
        $this->agentCommissionModel->where('DATE(agentcommissions.created_at) <=', $toDate);

        $passangerinfo = $this->userDetailModel->findAll();

        $commission = $this->agentCommissionModel
            ->select('agentcommissions.*,agents.*,agentcommissions.id as commissionid,
                agentcommissions.user_id as commission_user_id,
                agentcommissions.commission as commissionamount,
                agents.id as agentid')
            ->join('agents', 'agents.id  = agentcommissions.agent_id')
            ->join('subtrips', 'subtrips.id   = agentcommissions.subtrip_id')
            ->findAll();

        foreach ($commission as $key => $cvalue) {
            foreach ($passangerinfo as $nkey => $pvalue) {
                if ($pvalue->user_id == $cvalue->commission_user_id) {
                    $commission[$key]->commission_user_id = $pvalue->first_name . ' ' . $pvalue->last_name;
                }
            }

            $commission[$key]->first_name = $cvalue->first_name . ' ' . $cvalue->last_name;
        }
        $data['commission'] = $commission;

        if ($userType == 2) {
            $agentId =  $this->session->get('user_id');
            $agentData = $this->agenttModel->where('user_id', $agentId)->findAll();
        } else {
            $agentData = $this->agenttModel->findAll();
        }

        $data['agentList'] = $agentData;
        $data['userType'] = $userType;
        $data['filepath'] =  $this->Viewpath;
        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.agent_report");
        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        return view($this->Viewpath . '\report/agentcommission', $data);
    }

    public function agentSumReportLoad()
    {
        $userchek = new UserCheck();
        $agentData = "";
        $userType = $userchek->getUserType();

        if ($userType == 2) {
            $agentId =  $this->session->get('user_id');
            $agentData = $this->agenttModel->where('user_id', $agentId)->findAll();
        } else {
            $agentData = $this->agenttModel->findAll();
        }

        $data['agentList'] = $agentData;
        $data['userType'] = $userType;
        $data['filepath'] =  $this->Viewpath;

        $data['ticket'] = array();
        $data['expenseticket'] = array();

        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.sum_report");

        $heading = lang("Localize.agent") . ' ' . lang("Localize.sum_report");
        $data['pageheading'] = $heading;

        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        return view($this->Viewpath . '\sumreport\sumreport', $data);
    }

    public function agentSumReportDetails()
    {
        $userchek = new UserCheck();
        $agentData = "";
        $userType = $userchek->getUserType();

        if ($userType == 2) {
            $agentId =  $this->session->get('user_id');
            $agentData = $this->agenttModel->where('user_id', $agentId)->findAll();
        } else {
            $agentData = $this->agenttModel->findAll();
        }

        $data['agentList'] = $agentData;
        $data['userType'] = $userType;


        $fromDate = $this->request->getVar('start_date');
        $toDate = $this->request->getVar('end_date');
        // $maintripId = $this->request->getVar('trip_id');
        // $subTripId = $this->request->getVar('subtrip_id');
        $ticketType = $this->request->getVar('type');
        $agentid = $this->request->getVar('agent_id');

        $agentDetail = $this->agenttModel->find($agentid);
        if ($agentid != "all") {

            $this->ticketModel->where('tickets.bookby_user_id ', $agentDetail->user_id);
        }

        // if ($ticketType == "normal") {

        // 	$this->ticketModel->where('refund',0)->where('cancel_status',0);
        // }
        // if ($ticketType == "refund") {

        // 	$this->ticketModel->where('refund',1);
        // }
        // if ($ticketType == "cancel") {
        // 	$this->ticketModel->where('cancel_status',1);
        // }

        // if($maintripId == "all")
        // {


        // }

        $this->ticketModel->where('refund', 0)->where('cancel_status', 0);

        $this->ticketModel->where('DATE(tickets.created_at) >=', $fromDate)->where('DATE(tickets.created_at) <=', $toDate);


        $ticket = $this->ticketModel
            ->select('MAX(tickets.created_at) as date,
                MAX(schedules.start_time) AS start_time, MAX(schedules.end_time) AS end_time,
                MAX(a.name) as pickup_location_name, MAX(b.name) as drop_location_name,
                MAX(c.name) as sub_pickup_location_name, MAX(d.name) as sub_drop_location_name')
            ->selectSum('price')
            ->selectSum('totalseat')
            ->selectSum('discount')
            ->selectSum('totaltax')
            ->selectSum('paidamount')
            ->groupBy('trips.id')
            ->join('trips', 'trips.id = tickets.trip_id')
            ->join('subtrips', 'subtrips.id = tickets.subtrip_id')
            ->join('schedules', 'schedules.id = trips.schedule_id')
            ->join('locations a', 'a.id = trips.pick_location_id', 'left')
            ->join('locations b', 'b.id = trips.drop_location_id', 'left')
            ->join('locations c', 'c.id = subtrips.pick_location_id', 'left')
            ->join('locations d', 'd.id = subtrips.drop_location_id', 'left')
            ->where('trips.status', 1)
            ->findAll();

        $data['filepath'] =  $this->Viewpath;

        $data['ticket'] = $ticket;


        // for refund and cancle

        $this->ticketModel->groupStart();
        $this->ticketModel->where('refund', 1);
        $this->ticketModel->orwhere('cancel_status', 1);
        $this->ticketModel->groupEnd();



        $agentid = $this->request->getVar('agent_id');

        $agentDetail = $this->agenttModel->find($agentid);
        if ($agentid != "all") {
            $this->ticketModel->where('tickets.bookby_user_id ', $agentDetail->user_id);
        }

        $this->ticketModel->where('DATE(tickets.created_at) >=', $fromDate)->where('DATE(tickets.created_at) <=', $toDate);

        $expenseticket = $this->ticketModel
            // ->select('tickets.*,
            //     trips.id as tripid,
            //     trips.*,
            //     subtrips.id as subtripid,
            //     subtrips.*,
            //     schedules.*,
            //     a.name as pickup_location_name,
            //     b.name as drop_location_name,
            //     c.name as sub_pickup_location_name,
            //     d.name as sub_drop_location_name')

            ->select('MAX(tickets.booking_id) AS booking_id,
                MAX(tickets.
                created_at) AS date,
                MAX(schedules.start_time) AS start_time, MAX(schedules.end_time) AS end_time,
                MAX(a.name) as pickup_location_name, MAX(b.name) as drop_location_name,
                MAX(c.name) as sub_pickup_location_name, MAX(d.name) as sub_drop_location_name')
            ->selectSum('price')
            ->selectSum('totalseat')
            ->selectSum('discount')
            ->selectSum('totaltax')
            ->selectSum('paidamount')
            ->groupBy('trips.id')
            ->join('trips', 'trips.id = tickets.trip_id')
            ->join('subtrips', 'subtrips.id = tickets.subtrip_id')
            ->join('schedules', 'schedules.id = trips.schedule_id')
            ->join('locations a', 'a.id = trips.pick_location_id', 'left')
            ->join('locations b', 'b.id = trips.drop_location_id', 'left')
            ->join('locations c', 'c.id = subtrips.pick_location_id', 'left')
            ->join('locations d', 'd.id = subtrips.drop_location_id', 'left')
            ->where('trips.status', 1)

            ->findAll();


        $data['expenseticket'] = $expenseticket;

        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.ticket_sold");

        $heading = lang("Localize.agent") . ' ' . lang("Localize.sum_report");
        $data['pageheading'] = $heading;

        $data['currency_symbol']  =    $this->session->get('currency_symbol');

        echo view($this->Viewpath . '\sumreport\sumreport', $data);
    }

    public function driverReport()
    {
        $data['drivers'] = $this->employeeModel->where('employeetype_id', 1)->findAll();
        
        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.driver_report");
        $heading = lang("Localize.driver_report");
        $data['pageheading'] = $heading;
        return view($this->Viewpath . '\report\driverreport', $data);
    }

    public function driverTripDetails($id)
    {
        // Check if the id is not numeric
        if (!is_numeric($id)) {
            return redirect()->route('driver-report');
        }

        $today = date('Y-m-d');

        // Query for dropdown
        $dropdown_query = $this->db->table('stuffassigns')
                ->select('stuffassigns.trip_id, pick_location.name AS pick_location, drop_location.name AS drop_location')
                ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
                ->join('locations AS pick_location', 'pick_location.id = trips.pick_location_id', 'left')
                ->join('locations AS drop_location', 'drop_location.id = trips.drop_location_id', 'left')
                ->where('stuffassigns.employee_id', $id)
                ->where('stuffassigns.employee_type', 1)
                ->groupBy('stuffassigns.trip_id')
                ->get();
        $data['trips_dropdown'] = $dropdown_query->getResult();
        $data['driver'] = $this->employeeModel->find($id);

        // Main trips query
        // $trips_query = $this->db->table('stuffassigns')
        //         ->select('stuffassigns.trip_id, subtrips.id AS subtrip_id, stuffassigns.start_date, stuffassigns.end_date, trips.distance, trips.journey_hour, pick_location.name AS pick_location, drop_location.name AS drop_location')
        //         ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
        //         ->join('subtrips', 'subtrips.trip_id = stuffassigns.trip_id', 'left')
        //         ->join('locations AS pick_location', 'pick_location.id = subtrips.pick_location_id', 'left')
        //         ->join('locations AS drop_location', 'drop_location.id = subtrips.drop_location_id', 'left')
        //         ->where('stuffassigns.employee_id', $id)
        //         ->where('stuffassigns.employee_type', 1)
        //         ->groupBy('subtrips.id')
        //         ->groupBy('stuffassigns.id')
        //         ->orderBy('stuffassigns.id', 'DESC')
        //         ->get();
        
        // Main trips query (** Update the main queries for skip the subtrips)
        $trips_query = $this->db->table('stuffassigns')
            ->select('stuffassigns.trip_id, stuffassigns.start_date, stuffassigns.end_date, trips.distance, trips.journey_hour, pick_location.name AS pick_location, drop_location.name AS drop_location')
            ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
            ->join('locations AS pick_location', 'pick_location.id = trips.pick_location_id', 'left')
            ->join('locations AS drop_location', 'drop_location.id = trips.drop_location_id', 'left')
            ->where('stuffassigns.employee_id', $id)
            ->where('stuffassigns.employee_type', 1)
            ->where('stuffassigns.start_date <=', $today)
            ->orderBy('stuffassigns.id', 'DESC')
            ->get();

        $data['trips'] = $trips_query->getResult();

        $data['driver_id'] = $id;
        
        // Additional data for view
        $data['module'] =    lang("Localize.report");
        $data['title']  =    lang("Localize.driver_trip_details");
        $heading = lang("Localize.driver_trip_details");
        $data['pageheading'] = $heading;
        return view($this->Viewpath . '\report\drivertripdetails', $data);
    }

    public function driverTripDetailsFilter()
    {
        $id = $this->request->getPost('driver_id');
        $data['trip_id'] = $trip_id = $this->request->getPost('trip_id');
        $data['start_date'] = $start_date = $this->request->getPost('start_date');
        $data['end_date'] = $end_date = $this->request->getPost('end_date');
        $today = date('Y-m-d');

        // Query for dropdown
        $dropdown_query = $this->db->table('stuffassigns')
                ->select('stuffassigns.trip_id, pick_location.name AS pick_location, drop_location.name AS drop_location')
                ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
                ->join('locations AS pick_location', 'pick_location.id = trips.pick_location_id', 'left')
                ->join('locations AS drop_location', 'drop_location.id = trips.drop_location_id', 'left')
                ->where('stuffassigns.employee_id', $id)
                ->where('stuffassigns.employee_type', 1)
                ->groupBy('stuffassigns.trip_id')
                ->get();
            
        $data['trips_dropdown'] = $dropdown_query->getResult();
        $data['driver'] = $this->employeeModel->find($id);

        // Main trips query
        // $trips_query = $this->db->table('stuffassigns')
        //     ->select('stuffassigns.trip_id, subtrips.id AS subtrip_id, stuffassigns.start_date, stuffassigns.end_date, trips.distance, trips.journey_hour, pick_location.name AS pick_location, drop_location.name AS drop_location')
        //     ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
        //     ->join('subtrips', 'subtrips.trip_id = stuffassigns.trip_id', 'left')
        //     ->join('locations AS pick_location', 'pick_location.id = subtrips.pick_location_id', 'left')
        //     ->join('locations AS drop_location', 'drop_location.id = subtrips.drop_location_id', 'left')
        //     ->where('stuffassigns.employee_id', $id);
        
        // Main trips query (** Update the main queries for skip the subtrips)
        $trips_query = $this->db->table('stuffassigns')
            ->select('stuffassigns.trip_id, stuffassigns.start_date, stuffassigns.end_date, trips.distance, trips.journey_hour, pick_location.name AS pick_location, drop_location.name AS drop_location')
            ->join('trips', 'trips.id = stuffassigns.trip_id', 'left')
            ->join('locations AS pick_location', 'pick_location.id = trips.pick_location_id', 'left')
            ->join('locations AS drop_location', 'drop_location.id = trips.drop_location_id', 'left')
            ->where('stuffassigns.employee_id', $id)
            ->where('stuffassigns.start_date <=', $today);

        // Conditionally apply `trip_id` filter if provided
        if ($trip_id) {
            $trips_query->where('stuffassigns.trip_id', $trip_id);
        }

        if ($start_date && $end_date) {
            $trips_query->where('stuffassigns.start_date <=', $end_date) 
                        ->where('stuffassigns.end_date >=', $start_date);
        }

        // Add any additional conditions
        // $trips_query->groupBy('subtrips.id')
        //     ->groupBy('stuffassigns.id')
        //     ->orderBy('stuffassigns.id', 'DESC');
        $trips_query->orderBy('stuffassigns.id', 'DESC'); // Skip subtrips

        // dd($trips_query->getCompiledSelect());

        $trips = $trips_query->get();
        $data['trips'] = $trips->getResult();

        // Additional data for view
        $data['driver_id'] = $id;
        $data['module'] = lang("Localize.report");
        $data['title'] = lang("Localize.driver_trip_details");
        $heading = lang("Localize.driver_trip_details");
        $data['pageheading'] = $heading;

        return view($this->Viewpath . '\report\drivertripdetails', $data);
    }

}

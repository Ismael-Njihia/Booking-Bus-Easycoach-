<?php

namespace Modules\Paymethod\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use Firebase\JWT\JWT;
use Modules\Paymethod\Libraries\SSLCommerz;
use Modules\Paymethod\Models\FlutterWave;
use Modules\Paymethod\Models\PaymentGatewayModel;
use Modules\Paymethod\Models\PaypalModel;
use Modules\Paymethod\Models\PaystackModel;
use Modules\Paymethod\Models\RazorModel;
use Modules\Paymethod\Models\SslCommerzModel;
use Modules\Paymethod\Models\StripeModel;
use \stdClass;
use Modules\Ticket\Models\TicketModel;
use Modules\Ticket\Models\PartialpaidModel;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Libraries\Ticketmail;
use Modules\User\Models\UserModel;

class Paymentgateway extends BaseController
{
    use ResponseTrait;

    protected $paymentGatewayModel;
    protected $razorModel;
    protected $payStackModel;
    protected $stripeModel;
    protected $paypalModel;
    protected $sslModel;
    protected $flutterWaveModel;
    protected $db;
    protected $ticketModel;
    protected $partialpaidModel;
    protected $userModel;

    public function __construct()
    {
        $this->paymentGatewayModel = new PaymentGatewayModel();
        $this->razorModel = new RazorModel();
        $this->payStackModel = new PaystackModel();
        $this->stripeModel = new StripeModel();
        $this->paypalModel = new PaypalModel();
        $this->sslModel = new SslCommerzModel;
        $this->flutterWaveModel = new FlutterWave;
        $this->ticketModel = new TicketModel();
        $this->partialpaidModel = new PartialpaidModel();
        $this->userModel = new UserModel();

        $this->db = \Config\Database::connect();
    }

    public function paymentGateway()
    {
        $paymentGateway = $this->paymentGatewayModel->where('status', 1)->findAll();

        if (!empty($paymentGateway)) {

            $data = [
                'status' => "success",
                'response' => 200,
                'data' => $paymentGateway,
            ];

            return $this->response->setJSON($data);
        } else {

            $data = [
                'message' => "No not found.",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }

    public function paypal()
    {
        $paypaldata = new stdClass();
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(1);

        if (!empty($paymentGatewayStatus)) {

            $paypal = $this->paypalModel->first();

            if (!empty($paypal)) {

                if ($paypal->environment == 1) {
                    $paypaldata->secrate_id = $paypal->live_s_kye;
                    $paypaldata->client_id = $paypal->live_c_kye;
                    $paypaldata->email = $paypal->email;
                    $paypaldata->merchantid = $paypal->marchantid;
                    $paypaldata->environment = "live";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paypaldata,
                    ];

                    return $this->response->setJSON($data);
                } else {

                    $paypaldata->secrate_id = $paypal->test_s_kye;
                    $paypaldata->client_id = $paypal->test_c_kye;
                    $paypaldata->email = $paypal->email;
                    $paypaldata->merchantid = $paypal->marchantid;
                    $paypaldata->environment = "Test";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paypaldata,
                    ];

                    return $this->response->setJSON($data);
                }
            } else {
                $data = [
                    'message' => "No Credential found for Paypal",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {

            $data = [
                'message' => "Paypal is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }


    public function paystack()
    {
        $paydata = new stdClass();
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(2);

        if (!empty($paymentGatewayStatus)) {

            $getPayData = $this->payStackModel->first();

            if (!empty($getPayData)) {

                if ($getPayData->environment == 1) {
                    $paydata->secrate_key = $getPayData->live_s_kye;
                    $paydata->private_key = $getPayData->live_p_kye;
                    $paydata->environment = "live";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                } else {

                    $paydata->secrate_key = $getPayData->test_s_kye;
                    $paydata->private_key = $getPayData->test_p_kye;
                    $paydata->environment = "Test";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                }
            } else {
                $data = [
                    'message' => "No Credential found for Paystack",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {

            $data = [
                'message' => "Paystack is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }


    public function stripe()
    {
        $paydata = new stdClass();
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(3);

        if (!empty($paymentGatewayStatus)) {

            $getPayData = $this->stripeModel->first();

            if (!empty($getPayData)) {

                if ($getPayData->environment == 1) {
                    $paydata->secrate_key = $getPayData->live_s_kye;
                    $paydata->private_key = $getPayData->live_p_kye;
                    $paydata->environment = "live";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                } else {

                    $paydata->secrate_key = $getPayData->test_s_kye;
                    $paydata->private_key = $getPayData->test_p_kye;
                    $paydata->environment = "Test";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                }
            } else {
                $data = [
                    'message' => "No Credential found for Stripe",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {

            $data = [
                'message' => "Stripe is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }

    public function razor()
    {
        $paydata = new stdClass();
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(4);

        if (!empty($paymentGatewayStatus)) {

            $getPayData = $this->razorModel->first();

            if (!empty($getPayData)) {

                if ($getPayData->environment == 1) {
                    $paydata->secrate_key = $getPayData->live_s_kye;

                    $paydata->environment = "live";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                } else {

                    $paydata->secrate_key = $getPayData->test_s_kye;

                    $paydata->environment = "Test";

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => $paydata,
                    ];

                    return $this->response->setJSON($data);
                }
            } else {
                $data = [
                    'message' => "No Credential found for RazorPay",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {

            $data = [
                'message' => "RazorPay is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }

    public function flutterWave()
    {
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(6);

        if (!empty($paymentGatewayStatus)) {

            $getPayData = $this->flutterWaveModel->first();

            if (!empty($getPayData)) {

                if ($getPayData->environment == 1) {

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => [
                            'public_key' => $getPayData->live_public_key,
                            'secret_key' => $getPayData->live_secret_key,
                            'encryption_key' => $getPayData->live_encryption_key,
                            'environment' => "Live"
                        ],
                    ];

                    return $this->response->setJSON($data);
                } else {

                    $data = [
                        'status' => "success",
                        'response' => 200,
                        'data' => [
                            'public_key' => $getPayData->test_public_key,
                            'secret_key' => $getPayData->test_secret_key,
                            'encryption_key' => $getPayData->test_encryption_key,
                            'environment' => "Test"
                        ],
                    ];

                    return $this->response->setJSON($data);
                }
            } else {
                $data = [
                    'message' => "No Credential found for Flutterwave",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {

            $data = [
                'message' => "Flutterwave is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }

    public function sslCommerz($postedData)
    {
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(5);

        if (!empty($paymentGatewayStatus)) {
            $getPayData = $this->sslModel->first();

            if (!empty($getPayData)) {
                // Collect credintial from model
                $sslStoreId = $getPayData->ssl_store_id;
                $sslStorePassword = $getPayData->ssl_store_password;
                $sslPaymentEnvironment = $getPayData->environment;

                // initialize sslcommerz instance
                $ssl = new SSLCommerz($sslStoreId, $sslStorePassword, !$sslPaymentEnvironment);

                // build checkout data
                // $postedData = $this->request->getPost();

                if (!isset($postedData['callback_url'])) {
                    return ['status' => "failed", 'response' => 204, 'message' => 'Callback url missing'];
                }

                $postedData['success_url'] = base_url(route_to('ssl-payment-callback'));
                $postedData['fail_url']    = base_url(route_to('ssl-payment-callback'));
                $postedData['cancel_url']  = base_url(route_to('ssl-payment-callback'));
                $postedData['value_a']     = $postedData['callback_url'];
                $postedData['value_b']     = $postedData['cus_id'];

                $paydata = $ssl->easyCheckout($postedData);

                if (!empty($ssl->error)) {
                    return ['status' => "failed", 'response' => 204, 'message' => $ssl->error];
                }

                return [
                    'message' => "Payment successfull",
                    'status' => "success",
                    'response' => 200,
                    'data' => $paydata
                ];

            } else {
                return [
                    'message' => "No Credential found for ssl commerz",
                    'status' => "failed",
                    'response' => 204,
                ];
            }
        } else {
            return [
                'message' => "SSL Commerz is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];
        }
    }

    public function sslCommerzValidate()
    {
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(5);

        if (!empty($paymentGatewayStatus)) {
            $getPayData = $this->sslModel->first();

            if (!empty($getPayData)) {
                // Collect credintial from model
                $sslStoreId = $getPayData->ssl_store_id;
                $sslStorePassword = $getPayData->ssl_store_password;
                $sslPaymentEnvironment = $getPayData->environment;

                // initialize sslcommerz instance
                $ssl = new SSLCommerz($sslStoreId, $sslStorePassword, !$sslPaymentEnvironment);

                // build validation data
                $postedData = $this->request->getPost();

                if (!isset($postedData['data'])) {
                    // invalid posted data
                    return $this->response->setJSON(['status' => "failed", 'response' => 204, 'message' => 'data not found']);
                }

                try {
                    // parse jwt token
                    $validatedData = JWT::decode($postedData['data'], getenv('TOKEN_SECRET'), ["HS256"]);
                    $paydata = $ssl->validateResponse((array) $validatedData);
                } catch (\Exception $e) {
                    return $this->response->setJSON(['status' => "failed", 'response' => 204, 'message' => $e->getMessage()]);
                }

                if ($paydata === false) {
                    return $this->response->setJSON(['status' => "failed", 'response' => 204, 'message' => $ssl->error]);
                }

                return $this->response->setJSON(['status' => "success", 'response' => 200, 'valid' => true, 'data' => $ssl->getGatewayResponse()]);
            } else {
                $data = [
                    'message' => "No Credential found for ssl commerz",
                    'status' => "failed",
                    'response' => 204,
                ];

                return $this->response->setJSON($data);
            }
        } else {
            $data = [
                'message' => "SSL Commerz is Disable in System",
                'status' => "failed",
                'response' => 204,
            ];

            return $this->response->setJSON($data);
        }
    }

    public function sslCommerzCallback()
    {
        // collect posted data
        $postedData = $this->request->getPost();

        if (isset($postedData) && isset($postedData['tran_id']) && $postedData['status'] == 'VALID') { //success

            // Retrieve ticket information using transaction ID (booking_id)
            $ticketInfo = $this->ticketModel->where('booking_id', $postedData['tran_id'])->first();

            if (isset($ticketInfo)) {
                // Check if the ticket is already paid
                if ($ticketInfo->payment_status == 'paid') {
                    $redirectUrl  = $postedData['value_a'] . "?status=failed&message=Already paid";
                    return redirect()->to($redirectUrl);
                }

                // Check if the ticket has a round_id
                if (!empty($ticketInfo->round_id)) {
                    // Get all tickets related to the round trip
                    $tickets = $this->ticketModel->where('round_id', $ticketInfo->round_id)->where('cancel_status', 0)->where('payment_status', 'unpaid')->findAll();
                    if(empty($tickets) || $postedData['amount'] <= $ticketInfo->paidamount) {
                        $tickets = [$ticketInfo];
                    }
                } else {
                    // If no round_id, process only the single ticket
                    $tickets = [$ticketInfo];
                }

                // Start database transaction
                $this->db->transStart();

                foreach ($tickets as $ticket) {
                    // Update each ticket's payment status
                    $updateTicketData = [
                        "pay_type_id" => 3,
                        "pay_method_id" => 5,
                        "payment_status" => "paid",
                        "payment_detail" => $postedData['card_type']
                    ];

                    $ticketUpdate = $this->ticketModel->where('booking_id', $ticket->booking_id)->set($updateTicketData)->update();

                    if ($ticketUpdate) {
                        // Update corresponding payment details
                        $updatePaymentData = [
                            "paidamount" => $ticket->paidamount,
                            "pay_type_id" => 3,
                            "pay_method_id" => 5,
                            "payment_detail" => $postedData['card_type']
                        ];

                        $ticketPayment = $this->partialpaidModel->where('booking_id', $ticket->booking_id)->set($updatePaymentData)->update();

                        // Account
                        $type = "income";
                        $detail = "Ticket Booking (" . $ticket->booking_id . ") ";
                        accoutTranjection($type, $detail, $ticket->paidamount, $ticket->passanger_id);

                        if (!$ticketPayment) {
                            // If payment update fails, rollback and exit
                            $this->db->transRollback();
                            return redirect()->to($postedData['value_a'] . "?status=failed&message=Payment update failed");
                        }
                    } else {
                        // If ticket update fails, rollback and exit
                        $this->db->transRollback();
                        return redirect()->to($postedData['value_a'] . "?status=failed&message=Ticket update failed");
                    }
                }

                // Complete the transaction
                $this->db->transComplete();

                if ($this->db->transStatus() === false) {
                    // If transaction fails, return error
                    return redirect()->to($postedData['value_a'] . "?status=failed&message=Transaction failed");
                }

                // Sned email
                $ticketmailLibrary = new Ticketmail();
                $passenger_email = $this->userModel->select("login_email")->where('id', $ticket->passanger_id)->first();
                $emaildata = $ticketmailLibrary->getticketEmailData($ticket->booking_id);
                sendTicket($passenger_email->login_email, $emaildata);

                // Success redirect
                $redirectUrl = $postedData['value_a'] . "?booking_id=" . $postedData['tran_id'] . "&status=success&message=Payment successful";
                return redirect()->to($redirectUrl);
            } else {
                // If invalid transaction ID
                $redirectUrl  = $postedData['value_a'] . "?status=failed&message=Invalid transaction id";
                return redirect()->to($redirectUrl);
            }
        } elseif ($postedData['status'] == 'FAILED') {
            $redirectUrl  = $postedData['value_a'] . "?status=failed&message=Payment failed";
            return redirect()->to($redirectUrl);
        } elseif ($postedData['status'] == 'CANCELLED') {
            $redirectUrl  = $postedData['value_a'] . "?status=canceled&message=Payment canceled";
            return redirect()->to($redirectUrl);
        } else {
            $redirectUrl  = $postedData['value_a'] . "?status=failed&message=Invalid data parsed";
            return redirect()->to($redirectUrl);
        }
    }

    public function stripePayment($postedData)
    {
        $paydata = new stdClass();
        $paymentGatewayStatus = $this->paymentGatewayModel->where('status', 1)->find(3);

        if (empty($paymentGatewayStatus)) {
            return [
                'message' => "Stripe is disabled in the system",
                'status' => "failed",
                'response' => 204,
            ];
        }

        // Fetch Stripe credentials from the database
        $getPayData = $this->stripeModel->first();

        if (empty($getPayData)) {
            return [
                'message' => "No credentials found for Stripe",
                'status' => "failed",
                'response' => 204,
            ];
        }

        // Set Stripe API key based on environment (live or test)
        if ($getPayData->environment == 1) {
            $paydata->secret_key = $getPayData->live_s_kye;
            $paydata->public_key = $getPayData->live_p_kye;
        } else {
            $paydata->secret_key = $getPayData->test_s_kye;
            $paydata->public_key = $getPayData->test_p_kye;
        }

        // Initialize Stripe with the secret key
        Stripe::setApiKey($paydata->secret_key);

        // Add the callback_url parameter to the success and cancel URLs
        $callback_url = $postedData['callback_url'];
        $successUrl = base_url(route_to('stripe-payment-callback')) . '?callback_url=' . urlencode($callback_url) . '&session_id={CHECKOUT_SESSION_ID}&tran_id=' . $postedData['tran_id'] . '&cus_id=' . $postedData['cus_id'] . '&status=success';
        $cancelUrl = base_url(route_to('stripe-payment-callback')) . '?callback_url=' . urlencode($callback_url) . '&session_id={CHECKOUT_SESSION_ID}&tran_id=' . $postedData['tran_id'] . '&cus_id=' . $postedData['cus_id'] . '&status=cancelled';

        try {
            // Create a new Stripe Checkout session
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => $postedData['currency'],
                        'product_data' => [
                            'name' => $postedData['product_name'],
                        ],
                        'unit_amount' => $postedData['total_amount'],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ]);

            // Return url to frontend
            return [
                'message' => "Payment successfull",
                'status' => "success",
                'response' => 200,
                'data' => [
                    'url' => $session->url,
                ]
            ];

        } catch (\Exception $e) {
            return [
                'message' => "Failed to initiate payment",
                'status' => "failed",
                'error' => $e->getMessage(),
            ];
        }
    }

    public function stripeCallback()
    {
        // collect get data
        $callbackUrl = $this->request->getGet('callback_url');
        $sessionId = $this->request->getGet('session_id');
        $tranId = $this->request->getGet('tran_id');
        $cusId = $this->request->getGet('cus_id');
        $status = $this->request->getGet('status');

        if ($sessionId) {

            try {
                // Retrieve the session from Stripe
                $getPayData = $this->stripeModel->first();
                if ($getPayData->environment == 1) {
                    Stripe::setApiKey($this->stripeModel->first()->live_s_kye);
                } else {
                    Stripe::setApiKey($this->stripeModel->first()->test_s_kye);
                }
                
                $session = Session::retrieve($sessionId);

                // Check payment status
                if ($session->payment_status === 'paid' && $tranId && $cusId && $status=='success') {
                    
                    $ticketInfo = $this->ticketModel->where('booking_id', $tranId)->first();

                    if (isset($ticketInfo)) {
                        // Check if the ticket is already paid
                        if ($ticketInfo->payment_status == 'paid') {
                            $redirectUrl  = $callbackUrl . "?status=failed&message=Already paid";
                            return redirect()->to($redirectUrl);
                        }
        
                        // Check if the ticket has a round_id
                        if (!empty($ticketInfo->round_id)) {
                            // Get all tickets related to the round trip
                            $tickets = $this->ticketModel->where('round_id', $ticketInfo->round_id)->where('cancel_status', 0)->where('payment_status', 'unpaid')->findAll();
                            if(empty($tickets) || ($session->amount_total / 100) <= $ticketInfo->paidamount) {
                                $tickets = [$ticketInfo];
                            }

                        } else {
                            // If no round_id, process only the single ticket
                            $tickets = [$ticketInfo];
                        }
        
                        // Start database transaction
                        $this->db->transStart();
        
                        foreach ($tickets as $ticket) {
                            // Update each ticket's payment status
                            $updateTicketData = [
                                "pay_type_id" => 3,
                                "pay_method_id" => 3,
                                "payment_status" => "paid",
                                "payment_detail" => "Stripe Payment"
                            ];
        
                            $ticketUpdate = $this->ticketModel->where('booking_id', $ticket->booking_id)->set($updateTicketData)->update();
        
                            if ($ticketUpdate) {
                                // Update corresponding payment details
                                $updatePaymentData = [
                                    "paidamount" => $ticket->paidamount,
                                    "pay_type_id" => 3,
                                    "pay_method_id" => 3,
                                    "payment_detail" => "Stripe Payment"
                                ];
        
                                $ticketPayment = $this->partialpaidModel->where('booking_id', $ticket->booking_id)->set($updatePaymentData)->update();

                                // Account
                                $type = "income";
                                $detail = "Ticket Booking (" . $ticket->booking_id . ") ";
                                accoutTranjection($type, $detail, $ticket->paidamount, $ticket->passanger_id);
        
                                if (!$ticketPayment) {
                                    // If payment update fails, rollback and exit
                                    $this->db->transRollback();
                                    return redirect()->to($callbackUrl . "?status=failed&message=Payment update failed");
                                }
                            } else {
                                // If ticket update fails, rollback and exit
                                $this->db->transRollback();
                                return redirect()->to($callbackUrl . "?status=failed&message=Ticket update failed");
                            }
                        }
        
                        // Complete the transaction
                        $this->db->transComplete();
        
                        if ($this->db->transStatus() === false) {
                            // If transaction fails, return error
                            return redirect()->to($callbackUrl . "?status=failed&message=Transaction failed");
                        }

                        // Sned email
                        $ticketmailLibrary = new Ticketmail();
                        $passenger_email = $this->userModel->select("login_email")->where('id', $ticket->passanger_id)->first();
                        $emaildata = $ticketmailLibrary->getticketEmailData($ticket->booking_id);
                        sendTicket($passenger_email->login_email, $emaildata);
        
                        // Success redirect
                        $redirectUrl = $callbackUrl . "?booking_id=" . $tranId . "&status=success&message=Payment successful";
                        return redirect()->to($redirectUrl);
                    } else {
                        // If invalid transaction ID
                        $redirectUrl  = $callbackUrl . "?status=failed&message=Invalid transaction id";
                        return redirect()->to($redirectUrl);
                    }

                } else {
                    $redirectUrl  = $callbackUrl . "?status=failed&message=Payment failed";
                    return redirect()->to($redirectUrl);
                }
            } catch (\Exception $e) {
                $redirectUrl  = $callbackUrl . "?status=failed&message=Payment failed";
                return redirect()->to($redirectUrl);
            }

        } else {
            // If invalid transaction ID
            $redirectUrl  = $callbackUrl . "?status=failed&message=Session ID not provided";
            return redirect()->to($redirectUrl);
        }
    }

}

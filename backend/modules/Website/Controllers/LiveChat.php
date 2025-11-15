<?php
namespace Modules\Website\Controllers;

use App\Controllers\BaseController;
use Modules\Website\Models\LiveChatModel;
use App\Libraries\Rolepermission;

class LiveChat extends BaseController
{
	protected $Viewpath;
	protected $liveChatModel;
	protected $db;
	protected $rolepermissionLibrary;
	
	public function __construct()
    {
        $this->Viewpath = "Modules\Website\Views";
		$this->liveChatModel = new LiveChatModel();
		$this->db = \Config\Database::connect();
		$this->rolepermissionLibrary = new Rolepermission();
    }

	public function index()
	{
		$data['tawk']  = $this->liveChatModel->first();
		$data['add_data'] = $this->rolepermissionLibrary->create("live_chat");
		$data['edit_data'] = $this->rolepermissionLibrary->edit("live_chat");

		$data['module'] =    lang("Localize.website_setting") ; 
		$data['title']  =    lang("Localize.live_chat") ;
		$data['pageheading'] = lang("Localize.live_chat");

		echo view($this->Viewpath.'\live_chat/index',$data);
	}

	public function tawkSave()
	{
		// Get the status checkbox value (1 if checked, 0 if unchecked)
		// $status = $this->request->getVar('status') ? 1 : 0;
		$status = 1;
		
		$id = $this->request->getVar('id');

		// Prepare the validated data array
		$validatedata = array(
			"name"        => $this->request->getVar('name'),
			"property_id" => $this->request->getVar('property_id'),
			"widget_id"   => $this->request->getVar('widget_id'),
			"status"      => $status,
		);

		// Validation for form data using 'tawk' rule
		if ($this->validation->run($validatedata, 'tawk')) {
			
			// Check if updating or inserting
			if ($id) {
				$this->liveChatModel->update($id, $validatedata);
				return redirect()->route('livechat')->with("success", "Data Updated");
			} else {
				$this->liveChatModel->insert($validatedata);
				return redirect()->route('livechat')->with("success", "Data Saved");
			}

		} else {
			// Validation failed, send back to the form with errors
			$data['validation'] = $this->validation;
			
			$data['tawk']  = $this->liveChatModel->first();
			$data['add_data'] = $this->rolepermissionLibrary->create("live_chat");
			$data['edit_data'] = $this->rolepermissionLibrary->edit("live_chat");

			$data['module'] = lang("Localize.website_setting"); 
			$data['title']  = lang("Localize.live_chat");
			$data['pageheading'] = lang("Localize.live_chat");

			echo view($this->Viewpath . '\live_chat/index', $data);
		}
	}
}

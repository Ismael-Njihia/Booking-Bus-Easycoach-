<?php echo $this->extend('template/admin/main') ?>

<?php echo $this->section('content') ?>
<?php echo $this->include('common/message') ?>
<?php $sessiondata = \Config\Services::session(); ?>

<style>
    @media print {
        /* Remove scroll bars in print */
        .table-responsive {
            overflow: visible !important;
        }
    }
</style>

<div class="card mb-4">
    <div class="card-body">
        <div class="sp3 mb-3">
            <div class="card">
                <div class="card-body">
                    <form action="<?php echo base_url(route_to('driver-trip-details-filter')) ?>" id="" method="post">
                        <?php echo $this->include('common/security') ?>
                        
                        <input type="hidden" name="driver_id" id="driver_id" value="<?php echo $driver_id; ?>">
                        <div class="row">
                            <div class="col-md-6 col-lg-3">
                                <label for="trip_id" class="form-label"><?php echo lang("Localize.trip") ?></label>
                                <select id="trip_id" name="trip_id" class="form-select">
                                    <option value=""><?php echo lang("Localize.all").' '.lang("Localize.trip"); ?></option>
                                    <?php foreach ($trips_dropdown as $item) : ?>
                                        <option value="<?php echo $item->trip_id ?>" <?php echo (isset($trip_id) && $trip_id == $item->trip_id) ? 'selected':'';  ?> ><?php echo $item->pick_location ?> -> <?php echo $item->drop_location ?> </option>
                                    <?php endforeach ?>  
                                </select>
                            </div>
                            <div class="col-md-6 col-lg-3">
                                <label for="start_date" class="form-label"><?php echo lang("Localize.from") ?></label>
                                <div class="input-append date datepicker" id="start_date"  data-date-format="yyyy-mm-dd">
                                    <input size="16" type="text" name="start_date" class="form-control" value="<?php echo isset($start_date) ? $start_date : date('Y-m-01');?>"  required readonly>
                                    <span class="add-on"><i class="icon-th"></i></span>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-3">
                                <label for="end_date" class="form-label"><?php echo lang("Localize.to") ?></label>
                                <div class="input-append date datepicker" id="end_date" data-date-format="yyyy-mm-dd">
                                    <input size="16" type="text" name="end_date" class="form-control" value="<?php echo isset($end_date) ? $end_date : date('Y-m-d');?>"  required readonly>
                                    <span class="add-on"><i class="icon-th"></i></span>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-3 d-flex align-items-end">
                                <label for="end_date" class="form-label"></label>
                                <button type="submit" class="btn btn-success form-control" style="width: fit-content; height: fit-content;"><?php echo lang("Localize.submit") ?></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end mt-1 mb-2">
            <button class="text-end btn btn-sm btn-warning" id="print"><i class="fas fa-print"></i> <?php echo lang("Localize.print") ?></button>
        </div>

        <div id="printDiv">
            <h6 class="text-center"><?php echo $sessiondata->get('logotext'); ?></h6>
            <h6 class="text-center fw-semi-bold"><?php echo lang("Localize.driver_trip_details"); ?></h6>

            <?php if(isset($start_date) || isset($end_date)) { ?>
                <p class="text-center"> <?php echo $start_date; ?> - <?php echo $end_date; ?></p>
            <?php } else {?>
                <p class="text-center"> <?php echo date('Y-m-d'); ?></p>
            <?php } ?>

            <div class="row">
                <div class="col text-start">
                    <h6><b><?php echo lang("Localize.driver") ?> <?php echo lang("Localize.name") ?> : </b><?php echo $driver->first_name . " " . $driver->last_name; ?></h6>
                    <h6><b><?php echo lang("Localize.mobile") ?> : </b> <?php echo $driver->phone; ?> </h6>
                    <h6><b><?php echo lang("Localize.email") ?> : </b> <?php echo $driver->email; ?> </h6>
                </div>
            </div>

            <div class="table-responsive mt-1">
                <table class="table table-bordered" id="" style="width: 100%;">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col"><?php echo lang("Localize.pick_up") ?></th>
                            <th scope="col"><?php echo lang("Localize.drop") ?></th>
                            <th scope="col"><?php echo lang("Localize.from") ?> <?php echo lang("Localize.date") ?></th>
                            <th scope="col"><?php echo lang("Localize.to") ?> <?php echo lang("Localize.date") ?></th>
                            <th scope="col"><?php echo lang("Localize.total") ?> <?php echo lang("Localize.days") ?></th>
                            <th scope="col"><?php echo lang("Localize.distance") ?>(<?php echo lang("Localize.km") ?>)</th>
                            <th scope="col"><?php echo lang("Localize.time") ?>(<?php echo lang("Localize.hour") ?>)</th>
                            <th class="text-center" scope="col"><?php echo lang("Localize.total") ?> <?php echo lang("Localize.distance") ?>(<?php echo lang("Localize.km") ?>)</th>
                            <th class="text-center" scope="col"><?php echo lang("Localize.total") ?> <?php echo lang("Localize.time") ?>(<?php echo lang("Localize.hour") ?>)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $today = date("Y-m-d");
                        $days = 0;
                        $total_distance = 0;
                        $total_journey= 0;
                        if(!empty($trips)):
                        foreach ($trips as $kye => $trip) : 
                            
                            if($trip->end_date > $today ){
                                $end_date = $today;
                            }else{
                                $end_date = $trip->end_date;
                            }

                            $startDate = new DateTime($trip->start_date);
                            $endDate = new DateTime($end_date);
                            $interval = $startDate->diff($endDate);
                            $days = $interval->days + 1; 

                            $total_distance += $trip->distance * $days;
                            $total_journey += $trip->journey_hour * $days;
                        ?>
                            <tr>
                                <th scope="row"><?php echo $kye + 1; ?></th>
                                <td><?php echo $trip->pick_location; ?></td>
                                <td><?php echo $trip->drop_location; ?></td>
                                <td><?php echo $trip->start_date; ?></td>
                                <td><?php echo $end_date; ?></td>
                                <td><?php echo $days; ?></td>
                                <td><?php echo $trip->distance; ?></td>
                                <td><?php echo $trip->journey_hour; ?></td>
                                <td class="text-end"><?php echo number_format(($trip->distance * $days), 2); ?></td>
                                <td class="text-end"><?php echo number_format(($trip->journey_hour * $days), 2); ?></td>
                            </tr>
                        <?php endforeach ?>
                            
                        <tr>
                            <th class="text-end" colspan="8"><?php echo lang("Localize.total") ?></th>
                            <th class="text-end"><?php echo number_format(($total_distance), 2); ?></th>
                            <th class="text-end"><?php echo number_format(($total_journey), 2); ?></th>
                        </tr>
                        
                    <?php else:?>
                        <tr>
                            <td colspan="10" class="text-center"><?php echo lang("Localize.no_data_found") ?></td>
                        </tr>
                    <?php endif?>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<?php echo $this->include('common/datatable_default_lang_change') ?>
<?php echo $this->endSection() ?>

<?php echo $this->section('js') ?>
    <script src="<?php echo base_url('public/js/print.js'); ?>"></script>
    <script>
        $(document).ready(function() {
            $("#print").click(function() {
                //Hide all other elements other than printarea.
                $("#printDiv").print();
            });
        });
    </script>
<?php echo $this->endSection() ?>
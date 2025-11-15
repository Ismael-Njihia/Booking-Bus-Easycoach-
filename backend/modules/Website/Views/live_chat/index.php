<?php echo $this->extend('template/admin/main') ?>
    <?php echo $this->section('content') ?>
    <?php echo $this->include('common/message') ?>
	
    <div class="card mb-4">
        <div class="card-body">
			
            <form action="<?php echo base_url(route_to('tawk-save'))?>" id="tawkform" method="post" class="row g-3" accept-charset="utf-8" enctype="multipart/form-data">
				<?php echo $this->include('common/security') ?>
                
                <div class="row justify-content-center">
					<div class="col-lg-8">

						<div class="row">

                            <div class="col-12 mt-3">
                                <h4><?php echo lang("Localize.tawk_info") ?></h4>
                            </div>

                            <input type="hidden" name="name" id="name" value="tawk">
                            <input type="hidden" name="id" id="id" value="<?php echo $tawk->id ?? '' ?>">

                            <div class="col-12 mt-3">
                                <label for="property_id" class=""><?= lang("Localize.property_id") ?></label>	
                                <input type="text" id="property_id" name="property_id" 
                                    value="<?php echo old('property_id', $tawk->property_id ?? '') ?>" 
                                    class="form-control" placeholder="<?= lang("Localize.property_id") ?>">
                            </div>

                            <div class="col-12 mt-3">
                                <label for="widget_id" class=""><?= lang("Localize.widget_id") ?></label>
                                <input type="text" id="widget_id" name="widget_id" 
                                    value="<?php echo old('widget_id', $tawk->widget_id ?? '') ?>" 
                                    class="form-control" placeholder="<?= lang("Localize.widget_id") ?>">
                            </div>

                            <!-- <div class="col-12 mt-3">
                                <div class="d-flex align-items-center">
                                    <label class="form-check-label fw-normal me-2" for="status"><?php //echo lang("Localize.status") ?></label>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch" id="status" name="status"
                                            <?php //echo isset($tawk->status) ? ($tawk->status == 1 ? 'checked' : '') : 'checked'; ?>>
                                    </div>
                                </div>
                            </div> -->

                            <div class="text-danger">
                                <?php if (isset($validation)): ?>
                                    <?=$validation->listErrors();?>
                                <?php endif?>
                            </div>
                        
                            <?php if($add_data || $edit_data): ?>
                            
                                <div class="col-12 text-center">
                                    <br>
                                    <button type="submit" class="btn btn-success"><?php echo lang("Localize.submit") ?></button>
                                </div>
                            <?php endif?>
                        </div>
				    </div>	
				</div>	
			</form>
	    </div>
	</div>

<?php echo $this->endSection() ?>
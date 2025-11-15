<?php echo $this->extend('template/admin/main') ?>
<?php echo $this->section('content') ?>
<?php echo $this->include('common/message') ?>

<div class="card mb-4">
  <div class="card-body">

    <?php if ($add_data == true) : ?>
    <div class="text-center mb-3">
      <a href="<?php echo base_url(route_to('backupdb-create')) ?>" class="btn btn-info"><?php echo lang('Localize.create_backup_file'); ?> <i class="fa fa-save"></i></a>
    </div>
    <?php endif ?>
    
    <div class="table-responsive">
      <table class="table display table-bordered table-striped table-hover basic" id="databasebackuplist">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col"><?php echo lang("Localize.file_name") ?></th>
            <th scope="col"><?php echo lang("Localize.file_size") ?></th>
            <th scope="col"><?php echo lang("Localize.action") ?></th>
          </tr>
        </thead>
        <tbody>
          <?php if (!empty($files)): 
            $i=1;
            ?>
            <?php foreach ($files as $fileDetail): ?>
              <tr>
                <th scope="row"><?php echo $i++ ;?></th>
                <td><?php echo esc($fileDetail['name']); ?></td>
                <td><?php echo esc(number_format($fileDetail['size'] / 1024, 2)); ?> KB</td>
                <td>
                  <a href="<?php echo base_url() . "public/DB/" . $fileDetail['name']; ?>" class="btn btn-sm btn-primary"><i class="fas fa-download"></i></a>
                  
                  <?php if ($delete_data == true) : ?>
                  <form action="<?php echo base_url(route_to('backupdb-delete', $fileDetail['name'])); ?>" method="post" style="display:inline;">
                    <?php echo $this->include('common/security') ?>
                    <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure you want to delete this file?');"><i class="fas fa-trash"></i></button>
                  </form>
                  <?php endif ?>
                </td>
              </tr>
            <?php endforeach ?>
          <?php else: ?>
              <tr>
                <td colspan="4" class="text-center"><?php echo lang("Localize.result_not_found") ?></td>
              </tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php echo $this->include('common/datatable_default_lang_change') ?>
<?php echo $this->endSection() ?>
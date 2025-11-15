<?php echo $this->extend('template/admin/main') ?>
<?php echo $this->section('content') ?>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table display table-bordered basic" id="reportDriverList" style="width: 100%;">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col"><?php echo lang("Localize.driver") ?> <?php echo lang("Localize.name") ?></th>
                        <th scope="col"><?php echo lang("Localize.driver") ?> <?php echo lang("Localize.mobile") ?></th>
                        <th scope="col"><?php echo lang("Localize.driver") ?> <?php echo lang("Localize.email") ?></th>
                        <th scope="col"><?php echo lang("Localize.blood") ?></th>
                        <th scope="col"><?php echo lang("Localize.nid_passport_number") ?></th>
                        <th scope="col"><?php echo lang("Localize.address") ?></th>
                        <th scope="col"><?php echo lang("Localize.action") ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($drivers as $kye => $driver) : ?>
                        <tr>
                            <th scope="row"><?php echo $kye + 1; ?></th>
                            <td><?php echo $driver->first_name . " " . $driver->last_name; ?></td>
                            <td><?php echo $driver->phone; ?></td>
                            <td><?php echo $driver->email; ?></td>
                            <td><?php echo $driver->blood; ?></td>
                            <td><?php echo $driver->id_type ? $driver->id_type.': '.$driver->nid : $driver->nid; ?></td>
                            <td><?php echo $driver->address; ?></td>
                            <td>
                                <a href="<?php echo  base_url(route_to('driver-trip-details', $driver->id)) ?>" class="btn btn-sm btn-success text-white">
                                    <i class="fas fa-file-invoice"></i> <?php echo lang("Localize.trip").' '.lang("Localize.details") ?>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php echo $this->include('common/datatable_default_lang_change') ?>
<?php echo $this->endSection() ?>
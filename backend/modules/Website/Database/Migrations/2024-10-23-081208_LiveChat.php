<?php

namespace Modules\Website\Database\Migrations;

use CodeIgniter\Database\Migration;

class LiveChat extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],

            'name' => [
                'type'           => 'VARCHAR',
                'constraint'     => '225',
            ],

            'property_id' => [
                'type'           => 'VARCHAR',
                'constraint'     => '225',
            ],
            'widget_id' => [
                'type'           => 'VARCHAR',
                'constraint'     => '225',
            ],
            'status' => [
                'type'           => 'TINYINT',
                'constraint'     => 1,
                'default'        => 1,
            ],

            'created_at datetime default current_timestamp',
            'updated_at datetime default current_timestamp on update current_timestamp',
            'deleted_at' => [
                'type' => 'datetime',
                'null' => true
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->createTable('livechats');
    }

    public function down()
    {
		$this->forge->dropTable('livechats');
    }
}

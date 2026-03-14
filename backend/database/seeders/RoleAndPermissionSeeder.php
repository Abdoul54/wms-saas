<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-users',
            'manage-roles',
            'manage-warehouses',
            'manage-inventory',
            'manage-orders',
            'manage-transfers',
            'view-reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $roles = [
            'admin' => [
                'manage-users',
                'manage-roles',
                'manage-warehouses',
                'manage-inventory',
                'manage-orders',
                'manage-transfers',
                'view-reports',
            ],
            'warehouse_manager' => [
                'manage-warehouses',
                'manage-inventory',
                'manage-orders',
                'manage-transfers',
                'view-reports',
            ],
            'warehouse_employee' => [
                'manage-inventory',
                'manage-orders',
                'manage-transfers',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }
    }
}

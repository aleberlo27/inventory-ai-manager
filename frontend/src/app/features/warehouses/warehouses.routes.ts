import { Routes } from '@angular/router';

import { WarehouseListComponent } from './components/warehouse-list/warehouse-list.component';
import { WarehouseDetailComponent } from './components/warehouse-detail/warehouse-detail.component';

export const warehouseRoutes: Routes = [
  { path: '', component: WarehouseListComponent },
  { path: ':id', component: WarehouseDetailComponent },
];

import { Router } from 'express';
import { addInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller.js';
import { authoriseRoles, verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/add-item/:shopId')
    .post(verifyJWT,authoriseRoles("OWNER"),addInventoryItem); 

router.route('/get-inventory/:shopId')
    .get(verifyJWT,authoriseRoles("OWNER"),getInventoryItems);

router.route('/update-item/:inventoryItemId/:shopId')
    .put(verifyJWT,authoriseRoles("OWNER"),updateInventoryItem);  

router.route('/delete-item/:inventoryItemId/:shopId')
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteInventoryItem);  

export default router;
    
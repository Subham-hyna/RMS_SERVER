import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addEmployee, deleteEmployee, editEmployee, employeeOfShop, getAllEmployees, loginWaiter } from "../controllers/employee.controllers.js";

const router = Router();

router.route("/register-employee/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addEmployee)

router.route("/login-employee")
    .post(loginWaiter)

router.route("/employeeOf")
    .get(verifyJWT,employeeOfShop)

router.route("/delete-employee/:employeeId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteEmployee)

router.route("/get-employee/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAllEmployees)

router.route("/edit-employee/:employeeId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editEmployee)

export default router
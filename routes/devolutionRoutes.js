const express = require("express")
const router = express.Router()
const devolutionController = require("../controllers/devolutionController")
const auth = require("../middleware/auth") // ✅ Importar auth

// Todas las rutas requieren autenticación
router.post("/", auth, devolutionController.createDevolution) // ✅ Con auth
router.get("/", auth, devolutionController.getDevolutions)
router.get("/:id", auth, devolutionController.getDevolutionById)
router.get("/sale/:saleId", auth, devolutionController.getDevolutionsBySale)
router.get("/next-number", auth, devolutionController.getNextDevolutionNumber)

module.exports = router

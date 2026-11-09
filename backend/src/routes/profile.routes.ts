import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from '../validators/profile.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.put('/', validateRequest(updateProfileSchema), (req, res) => profileController.updateProfile(req, res));

router.get('/addresses', (req, res) => profileController.getAddresses(req, res));
router.post('/addresses', validateRequest(createAddressSchema), (req, res) => profileController.createAddress(req, res));
router.put('/addresses/:id', validateRequest(updateAddressSchema), (req, res) => profileController.updateAddress(req, res));
router.delete('/addresses/:id', (req, res) => profileController.deleteAddress(req, res));

export default router;

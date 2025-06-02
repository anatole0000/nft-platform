import express from 'express';
import { getTransfers, createTransfer} from '../controllers/transfer.controller';

const router = express.Router();

router.get('/', getTransfers);

router.post('/', createTransfer);


export default router;

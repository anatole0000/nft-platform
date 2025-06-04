import express from 'express';
import {
  getTransfers,
  createTransfer,
  getTransferById,
  deleteTransfer,
} from '../controllers/transfer.controller';

const router = express.Router();

router.get('/', getTransfers);          // Lấy danh sách transfer (option filter userId)
router.post('/', createTransfer);       // Tạo mới transfer
router.get('/:id', getTransferById);    // Lấy chi tiết transfer theo id
router.delete('/:id', deleteTransfer);  // Xóa transfer theo id

export default router;

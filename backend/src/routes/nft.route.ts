import express from 'express';
import { createNFTController, listNFTsController, getNFTController } from '../controllers/nft.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createNFTSchema, nftIdParamSchema } from '../validations/nft.validation';
import { validateBody, validateParams } from '../middlewares/validate';
import { validateQuery } from '../middlewares/validate';
import { nftListQuerySchema } from '../validations/nft.validation';



const router = express.Router();

router.post('/', authMiddleware, validateBody(createNFTSchema), createNFTController);

router.get('/', validateQuery(nftListQuerySchema), listNFTsController);

router.get('/:id', validateParams(nftIdParamSchema), getNFTController);


export default router;

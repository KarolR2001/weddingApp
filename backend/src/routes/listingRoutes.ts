import { Router } from 'express';
import { authVendorMiddleware } from '../middleware/authVendorMiddleware';
import {
    uploadImages, 
    upload, 
    getListingsByCategory, 
    addListing, 
    deleteListing, 
    getListingById, 
    getListingsByUserId,
    updateListing,
    deleteImages, 
    getListingStatsWithFirstImage,
    toggleSuspension,
    updateListingActivity,
    updateListingStatistics
  } 
    from '../controllers/listingController';

const router = Router();

router.post('/category/:categoryId', getListingsByCategory);
router.get('/listing/:listingId', getListingById);
router.post('/add', addListing);
router.delete('/:listingId', deleteListing);
router.get('/user/:userId', getListingsByUserId);
router.post('/upload-images', upload.array('images'), uploadImages);
router.post('/delete-images', deleteImages);
router.get('/stats/:listingId', authVendorMiddleware, getListingStatsWithFirstImage);
router.put('/update', authVendorMiddleware, updateListing);
router.put('/toggle-suspension/:listingId', authVendorMiddleware, toggleSuspension);
router.post('/activity', updateListingActivity);
router.post("/stats", updateListingStatistics);

export default router;

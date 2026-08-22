import express, { Request, Response, NextFunction } from 'express';
import { DataStore } from '../db/store';
import {
  CreateTripSchema,
  UpdateTripSchema,
  CreateActivitySchema,
  UpdateActivitySchema,
  CreateReviewSchema,
  UpdateUserSchema,
  formatZodError,
} from '../validators';

const router = express.Router();

// ----------------------------------------------------
// Health & Debugging Endpoints
// ----------------------------------------------------
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'Node.js Express + MongoDB Data Layer',
  });
});

router.get('/debug/state', (req: Request, res: Response) => {
  const debugData = DataStore.getDebugState();
  res.json({
    success: true,
    data: debugData,
  });
});

// ----------------------------------------------------
// User Profile Endpoints
// ----------------------------------------------------
router.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await DataStore.getUser();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.patch('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = UpdateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({ success: false, error: formatted.message, fieldErrors: formatted.fieldErrors });
    }

    const currentUser = await DataStore.getUser();
    const updates: any = { ...parseResult.data };
    if (parseResult.data.preferences) {
      updates.preferences = {
        ...currentUser.preferences,
        ...parseResult.data.preferences,
      };
    }

    const updatedUser = await DataStore.updateUser(updates);
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Destinations Endpoints
// ----------------------------------------------------
router.get('/destinations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category } = req.query;
    const destinations = await DataStore.getDestinations(
      typeof q === 'string' ? q : undefined,
      typeof category === 'string' ? category : undefined
    );
    res.json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    next(err);
  }
});

router.get('/destinations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dest = await DataStore.getDestinationById(req.params.id);
    if (!dest) {
      return res.status(404).json({ success: false, error: `Destination "${req.params.id}" not found` });
    }
    res.json({ success: true, data: dest });
  } catch (err) {
    next(err);
  }
});

router.post('/destinations/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({ success: false, error: formatted.message, fieldErrors: formatted.fieldErrors });
    }

    const result = await DataStore.addReviewToDestination(req.params.id, {
      author: parseResult.data.author,
      avatarInitial: parseResult.data.author.charAt(0).toUpperCase(),
      rating: parseResult.data.rating,
      content: parseResult.data.content,
      tags: parseResult.data.tags,
    });

    res.status(201).json({
      success: true,
      message: 'Review published successfully',
      data: result.review,
      destination: result.destination,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('not found')) {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
});

router.post('/destinations/:id/reviews/:reviewId/helpful', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedReview = await DataStore.toggleReviewHelpful(req.params.id, req.params.reviewId);
    if (!updatedReview) {
      return res.status(404).json({ success: false, error: 'Destination or review not found' });
    }
    res.json({ success: true, data: updatedReview });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Bookmarks Endpoints
// ----------------------------------------------------
router.get('/bookmarks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookmarks = await DataStore.getBookmarks();
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

router.post('/bookmarks/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destinationId } = req.body;
    if (!destinationId || typeof destinationId !== 'string') {
      return res.status(400).json({ success: false, error: 'destinationId is required' });
    }
    const result = await DataStore.toggleBookmark(destinationId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Trips CRUD Endpoints
// ----------------------------------------------------
router.get('/trips', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trips = await DataStore.getTrips();
    res.json({ success: true, count: trips.length, data: trips });
  } catch (err) {
    next(err);
  }
});

router.post('/trips', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateTripSchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({ success: false, error: formatted.message, fieldErrors: formatted.fieldErrors });
    }

    const trip = await DataStore.createTrip(parseResult.data);
    res.status(201).json({ success: true, message: 'Trip created successfully', data: trip });
  } catch (err) {
    next(err);
  }
});

router.get('/trips/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trip = await DataStore.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: `Trip "${req.params.id}" not found` });
    }
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
});

router.put('/trips/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = UpdateTripSchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({ success: false, error: formatted.message, fieldErrors: formatted.fieldErrors });
    }

    const updated = await DataStore.updateTrip(req.params.id, parseResult.data);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Trip "${req.params.id}" not found` });
    }
    res.json({ success: true, message: 'Trip updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/trips/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await DataStore.deleteTrip(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Trip "${req.params.id}" not found` });
    }
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Activities Endpoints (Sub-resource of Trips)
// ----------------------------------------------------
router.post('/trips/:id/activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateActivitySchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({
        success: false,
        error: formatted.message,
        fieldErrors: formatted.fieldErrors,
      });
    }

    const result = await DataStore.addActivityToTrip(req.params.id, parseResult.data);
    res.status(201).json({
      success: true,
      message: 'Activity added to trip successfully',
      data: result.activity,
      trip: result.trip,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('not found')) {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
});

router.put('/trips/:id/activities/:activityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = UpdateActivitySchema.safeParse(req.body);
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return res.status(400).json({
        success: false,
        error: formatted.message,
        fieldErrors: formatted.fieldErrors,
      });
    }

    const updatedActivity = await DataStore.updateActivity(
      req.params.id,
      req.params.activityId,
      parseResult.data
    );

    if (!updatedActivity) {
      return res.status(404).json({ success: false, error: 'Activity not found on trip' });
    }

    const fullTrip = await DataStore.getTripById(req.params.id);
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity,
      trip: fullTrip,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/trips/:id/activities/:activityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await DataStore.deleteActivity(req.params.id, req.params.activityId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Activity not found on trip' });
    }
    const fullTrip = await DataStore.getTripById(req.params.id);
    res.json({
      success: true,
      message: 'Activity deleted successfully',
      trip: fullTrip,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

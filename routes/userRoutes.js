import express from 'express';
import {
  getUserData,
  getEnrolledCourses, // ✅ Corrected
  purchaseCourse,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.post('/enrolled-courses', getEnrolledCourses); // ✅ Corrected
userRouter.post('/purchase', purchaseCourse);
userRouter.post('/update-course-progress', updateUserCourseProgress);
userRouter.post('/get-course-progress', getUserCourseProgress);
userRouter.post('/add-rating', addUserRating);

export default userRouter;

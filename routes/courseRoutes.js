import express from 'express';
import { getAllCourse, getCourseId } from '../controllers/courseController.js';


const courseRoutes = express.Router();

courseRoutes.get('/all', getAllCourse);
courseRoutes.get('/:id', getCourseId);

export default courseRoutes;

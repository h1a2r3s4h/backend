import mongoose, { mongo } from 'mongoose'

const courseProgressScheme = new mongoose.Schema({
    userid: {type: String, required:true},
    courseId:{type:String, required:true},
    completed:{type:String, default:false},
    lectureCompleted: []
},{minimize:false});


const courseProgress = mongoose.model('CourseProgress', courseProgressScheme);
export default courseProgress;

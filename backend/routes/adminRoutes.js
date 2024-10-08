const express = require("express");
const bodyParser = require("body-parser");
const zod = require("zod");
const { Listing } = require("../models/Listing");
const app = express();
// const port = 3000;

app.use(express.json());
app.use(bodyParser.json());

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.headers.role))
      return res.sendStatus(403).json({ msg: "failed" });
    next();
  };
};

app.use(authorizeRole(["admin"]));
const adminRouter = express.Router();

let pendingCourses = [
  {
    id: "1",
    course: "full stack by harkirat",
    price: 5999,
    isPublished: "false",
  },
];
let courses = [
  {
    id: "4",
    course: "full stack by harkirat",
    price: 5999,
    isPublished: "true",
  },
  {
    id: 2,
    course: "full stack by harkirat",
    price: 5999,
    isPublished: "true",
  },
  {
    id: 3,
    course: "full stack by harkirat",
    price: 5999,
    isPublished: "true",
  },
];
let pendingTeachers = [
  {
    id: "1",
    name: "tushar singh",
    rank: 3,
    rating: 4.5,
  },
];
let teachers = [
  {
    id: 3,
    name: "sarthak singh",
    rank: 1,
    rating: 5,
  },
  {
    id: 4,
    name: "harkirat singh",
    rank: 2,
    rating: 4.8,
  },
];

// Route to view all courses
adminRouter.get("/listing", async (req, res) => {
  //   res.json(courses);
  const filter = req.query.filter || "";
  const listings = await Listing.find({
    $or: [
      {
        category: {
          $regex: filter,
        },
      },
      {
        title: {
          $regex: filter,
        },
      },
    ],
  });

  res.status(200).json({
    user: listings.map((listing) => ({
      listId: listing._id,
      trainerId: listing.trainerId,
      category: listing.category,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      quantity: listing.quantity,
      startDate: listing.startDate,
      endDate: listing.endDate,
      days: listing.days,
      gender: listing.gender,
      startTime: listing.startTime,
      endTime: listing.endTime,
      ageGroup: listing.ageGroup,
      description: listing.description,
    })),
  });
});

// Route to view all teachers
adminRouter.get("/teachers", (req, res) => {
  res.json(teachers);
});

// Route to view pending courses
adminRouter.get("/pending-courses", (req, res) => {
  res.json(pendingCourses);
});

// Route to approve a pending course
adminRouter.post("/approve-course/:id", (req, res) => {
  const courseId = req.params.id;
  console.log(courseId);
  const courseIndex = pendingCourses.findIndex(
    (course) => course.id === courseId
  );

  if (courseIndex > -1) {
    const course = pendingCourses.splice(courseIndex, 1)[0];

    course.isPublished = "true";
    console.log(course);
    courses.push(course);
    res.json({ message: "Course approved", course });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// Route to discard a pending course
adminRouter.delete("/discard-course/:id", (req, res) => {
  const courseId = req.params.id;
  const courseIndex = pendingCourses.findIndex(
    (course) => course.id === courseId
  );

  if (courseIndex > -1) {
    const course = pendingCourses.splice(courseIndex, 1)[0];
    res.json({ message: "Course discarded", course });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// Route to view pending teachers
adminRouter.get("/pending-teachers", (req, res) => {
  res.json(pendingTeachers);
});

// Route to approve a pending teacher
adminRouter.post("/approve-teacher/:id", (req, res) => {
  const teacherId = req.params.id;
  //   console.log(teacherId)
  const teacherIndex = pendingTeachers.findIndex(
    (teacher) => teacher.id === teacherId
  );
  //   console.log(teacherIndex)
  if (teacherIndex > -1) {
    const teacher = pendingTeachers.splice(teacherIndex, 1)[0];
    teachers.push(teacher);
    res.json({ message: "Teacher approved", teacher });
  } else {
    res.status(404).json({ message: "Teacher not found" });
  }
});

// Route to discard a pending teacher
adminRouter.delete("/discard-teacher/:id", (req, res) => {
  const teacherId = req.params.id;
  const teacherIndex = pendingTeachers.findIndex(
    (teacher) => teacher.id === teacherId
  );

  if (teacherIndex > -1) {
    const teacher = pendingTeachers.splice(teacherIndex, 1)[0];
    res.json({ message: "Teacher discarded", teacher });
  } else {
    res.status(404).json({ message: "Teacher not found" });
  }
});

// Example route to add a pending course (for testing)
adminRouter.post("/add-pending-course", (req, res) => {
  const newCourse = req.body;
  pendingCourses.push({ ...newCourse, id: String(pendingCourses.length + 1) });
  res.json({ message: "Pending course added", course: newCourse });
});

// Example route to add a pending teacher (for testing)
adminRouter.post("/add-pending-teacher", (req, res) => {
  const newTeacher = req.body;
  pendingTeachers.push({
    ...newTeacher,
    id: String(pendingTeachers.length + 1),
  });
  res.json({ message: "Pending teacher added", teacher: newTeacher });
});

module.exports = adminRouter;

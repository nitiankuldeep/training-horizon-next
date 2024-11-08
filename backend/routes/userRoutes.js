const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwt");
const { User } = require("../models/user");
const { authMiddleware } = require("../middleware/authMiddleware");
const Member = require("../models/Member");
const { Enrollment } = require("../models/Enrollment");

const userRouter = express.Router();

// input validation
const userSignupSchema = zod.object({
  email: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
  role: zod.string(),
});
const userSigninSchema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});
const userUpdateSchema = zod.object({
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
  password: zod.string().optional(),
});

userRouter.post("/signup", async function (req, res) {
  const inputFromUser = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
    role: req.body.role || "user",
  };
  const result = userSignupSchema.safeParse(inputFromUser);

  if (!result.success) {
    return res.status(411).json({
      message: "Email already taken  1 / Incorrect inputs",
    });
  }
  try {
    const isValid = await User.findOne({
      email: inputFromUser.email,
    });
    if (isValid) {
      return res.status(411).json({
        message: "Email already taken 2 /Incorrect inputs",
      });
    }

    const user = await User.create(inputFromUser);
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET
    );
    res.status(200).json({
      message: "user created successfully",
      token: token,
      _id: user._id,
    });
  } catch (error) {
    res.status(411).json({
      message: error,
    });
  }
});

userRouter.post("/signin", async function (req, res) {
  const userInput = {
    email: req.body.email,
    password: req.body.password,
  };
  const result = userSigninSchema.safeParse(userInput);
  if (!result.success) {
    return res.status(411).json({
      message: "Error while logging in",
    });
  }
  try {
    const user = await User.findOne({
      email: userInput.email,
      password: userInput.password,
    });

    if (user) {
      //admin role
      // const userRole = user.role;
      // if (userRole=="admin") {
      // }

      const token = jwt.sign(
        {
          userId: user._id,
        },
        JWT_SECRET
      );

      res.status(200).json({
        msg: "User logged in successfully",
        token: token,
        _id: user._id,
      });
    } else {
      res.status(411).json({
        message: "Error while logging in",
      });
    }
  } catch (error) {
    console.log("error in signin page" + error);
  }
});

userRouter.put("/", authMiddleware, async function (req, res) {
  const userInput = req.body;

  const isValid = userUpdateSchema.safeParse(userInput);
  if (!isValid.success) {
    return res.status(411).json({
      essage: "Error while updating information",
    });
  }
  try {
    // console.log(" is it correct ?"+res.userId);
    await User.updateOne({ _id: res.userId }, { $set: userInput });
    res.status(200).json({
      message: "Updated successfully",
    });
  } catch (error) {
    console.log("error in /page update page" + error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// for user Dashboard
userRouter.get("/username", authMiddleware, async function (req, res) {
  const user = await User.findOne({
    _id: req.userId,
  });
  res.status(200).json({
    _id: user._id,
    user: user.firstName,
    role: user.role,
  });
});

userRouter.post("/registerMember", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      age,
      dob,
      relationship,
      doctorName,
      doctorNumber,
      gender,
      city,
      address,
      postalCode,
      agreeToTerms,
    } = req.body;
    const userId = req.userId;
    console.log("The user Id is " + userId);
    const newMember = new Member({
      name,
      age,
      dob,
      relationship,
      doctorName,
      doctorNumber,
      gender,
      city,
      address,
      postalCode,
      agreeToTerms,
    });
    userRouter.get("/username", authMiddleware, async function (req, res) {
      const user = await User.findOne({
        _id: req.userId,
      });
      res.status(200).json({
        _id: user._id,
        user: user.firstName,
        role: user.role,
      });
    });

    userRouter.get("/getUserById/:id", authMiddleware, async (req, res) => {
      const userId = req.params.id;

      try {
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User retrieved successfully", user });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching user", error: error.message });
      }
    });

    userRouter.post("/registerMember", authMiddleware, async (req, res) => {
      try {
        const {
          name,
          age,
          dob,
          relationship,
          doctorName,
          doctorNumber,
          gender,
          city,
          address,
          postalCode,
          agreeToTerms,
        } = req.body;
        const userId = req.userId;
        // console.log("The user Id is " + userId);
        const newMember = new Member({
          name,
          age,
          dob,
          relationship,
          doctorName,
          doctorNumber,
          gender,
          city,
          address,
          postalCode,
          agreeToTerms,
        });

        const savedMember = await newMember.save();

        // Add the member to the user's familyMembers array
        const user = await User.findById(userId);
        user.familyMembers.push(savedMember._id);
        await user.save();

        res.status(201).json({
          message: "Family member registered successfully",
          member: savedMember,
        });
      } catch (error) {
        res.status(500).json({
          message: "Error registering family member",
          error: error.message,
        });
      }
    });
    const savedMember = await newMember.save();

    // Add the member to the user's familyMembers array
    const user = await User.findById(userId);
    user.familyMembers.push(savedMember._id);
    await user.save();

    res.status(201).json({
      message: "Family member registered successfully",
      member: savedMember,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering family member",
      error: error.message,
    });
  }
});

userRouter.get("/allmembers", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Find user and populate familyMembers field
    const user = await User.findById(userId).populate("familyMembers");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ familyMembers: user.familyMembers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching family members", error: error.message });
  }
});

userRouter.put("/members/:id", authMiddleware, async (req, res) => {
  const memberId = req.params.id;
  console.log(memberId);
  const {
    name,
    age,
    dob,
    relationship,
    doctorName,
    doctorNumber,
    gender,
    city,
    address,
    postalCode,
    agreeToTerms,
  } = req.body;
  try {
    // Find the member by ID and update it
    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      {
        name,
        age,
        dob,
        relationship,
        doctorName,
        doctorNumber,
        gender,
        city,
        address,
        postalCode,
        agreeToTerms,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res
      .status(200)
      .json({ message: "Family member updated successfully", updatedMember });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating family member", error: error.message });
  }
});

userRouter.get("/members/:id", authMiddleware, async (req, res) => {
  const memberId = req.params.id;

  try {
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res
      .status(200)
      .json({ message: "Family member retrieved successfully", member });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching family member", error: error.message });
  }
});
// Routes for enrollement logic
// Enroll a user in a course
userRouter.post("/enroll", async (req, res) => {
  const { listingId, memberIds } = req.body; // Accept an array of memberIds

  if (!listingId || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({
      error: "Listing ID and an array of Member IDs are required",
    });
  }

  try {
    // Find the enrollment document for the given listingId
    let enrollment = await Enrollment.findOne({ listingId });

    if (!enrollment) {
      enrollment = new Enrollment({
        listingId,
        memberIds: memberIds,
      });
      await enrollment.save();
      return res.status(200).json({
        message: "Enrollment created and members added",
        enrollment,
      });
    }

    // Filter out memberIds that are already in the members array
    const newMembers = memberIds.filter(
      (id) => !enrollment.memberIds.includes(id)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({
        error: "All provided members are already enrolled in this listing",
      });
    }

    // Add the new members to the array and save
    enrollment.memberIds.push(...newMembers);
    await enrollment.save();

    res.status(200).json({
      message: "New members added to the enrollment",
      addedMembers: newMembers,
      enrollment,
    });
  } catch (error) {
    console.error("Error enrolling members:", error);
    res.status(500).json({ error: "Failed to enroll members" });
  }
});

// userRouter.post("/enroll", async (req, res) => {
//   const { listingId, memberId } = req.body;

//   if (!listingId || !memberId) {
//     return res
//       .status(400)
//       .json({ error: "Listing ID and Member ID are required" });
//   }

//   try {
//     let enrollment = await Enrollment.findOne({ listingId });

//     if (!enrollment) {
//       // Create a new enrollment if it doesn't exist
//       enrollment = new Enrollment({
//         listingId,
//         members: [memberId],
//       });
//       await enrollment.save();
//       return res
//         .status(200)
//         .json({ message: "Enrollment created and member added", enrollment });
//     }

//     // Check if memberId already exists in members array
//     if (enrollment.members.includes(memberId)) {
//       return res
//         .status(400)
//         .json({ error: "Member already enrolled in this listing" });
//     }

//     // Add the new member to the array and save
//     enrollment.members.push(memberId);
//     await enrollment.save();

//     res
//       .status(200)
//       .json({ message: "Member added to the enrollment", enrollment });
//   } catch (error) {
//     console.error("Error enrolling member:", error);
//     res.status(500).json({ error: "Failed to enroll member" });
//   }
// });

// userRouter.post("/enroll", async (req, res) => {
//   const { listingId, userId, memberId } = req.body;

//   if (!listingId || !userId || !memberId) {
//     return res
//       .status(400)
//       .json({ error: "Listing ID, User ID, and Member ID are required" });
//   }

//   try {
//     const existingEnrollment = await Enrollment.findOne({
//       listingId,
//       userId,
//       memberId,
//     });

//     if (existingEnrollment) {
//       return res
//         .status(400)
//         .json({ error: "User/Member already enrolled in this course" });
//     }

//     const enrollment = new Enrollment({ listingId, userId, memberId });
//     await enrollment.save();

//     res
//       .status(200)
//       .json({ message: "User/Member enrolled successfully", enrollment });
//   } catch (error) {
//     console.error("Error enrolling user:", error);
//     res.status(500).json({ error: "Failed to enroll user/member" });
//   }
// });
// userRouter.post("/enroll", async (req, res) => {
//   const { listingId, userId, memberId } = req.body;

//   if (!listingId || !userId || !memberId) {
//     return res
//       .status(400)
//       .json({ error: "Listing ID, User ID, and Member ID are required" });
//   }

//   try {
//     const enrollment = await Enrollment.findOne({ listingId, userId });

//     if (!enrollment) {
//       // Create a new enrollment if it doesn't exist
//       const newEnrollment = new Enrollment({
//         listingId,
//         userId,
//         members: [memberId],
//       });
//       await newEnrollment.save();
//       return res.status(200).json({
//         message: "Enrollment created and member added",
//         enrollment: newEnrollment,
//       });
//     }

//     // Check if memberId already exists in members array
//     if (enrollment.members.includes(memberId)) {
//       return res
//         .status(400)
//         .json({ error: "Member already enrolled in this course" });
//     }

//     // Add the new member to the array and save
//     enrollment.members.push(memberId);
//     await enrollment.save();

//     res
//       .status(200)
//       .json({ message: "Member added to the enrollment", enrollment });
//   } catch (error) {
//     console.error("Error enrolling member:", error);
//     res.status(500).json({ error: "Failed to enroll member" });
//   }
// });

// Get enrollment count for a course
// userRouter.get("/enrollment/:listingId", async (req, res) => {
//   const { listingId } = req.params;

//   if (!listingId) {
//     return res.status(400).json({ error: "Course ID is required" });
//   }

//   try {
//     const count = await Enrollment.countDocuments({ listingId });
//     res.status(200).json({ listingId, enrollmentCount: count });
//   } catch (error) {
//     console.error("Error fetching enrollment count:", error);
//     res.status(500).json({ error: "Failed to fetch enrollment count" });
//   }
// });
userRouter.get("/enrolled/:listingId", async (req, res) => {
  const { listingId } = req.params;

  if (!listingId) {
    return res.status(400).json({ error: "Listing ID is required" });
  }

  try {
    const enrollment = await Enrollment.findOne({ listingId });

    if (!enrollment) {
      return res
        .status(404)
        .json({ error: "No enrollment found for this listing" });
    }

    const memberCount = enrollment.memberIds.length;

    res.status(200).json({ listingId, memberCount });
  } catch (error) {
    console.error("Error counting members:", error);
    res.status(500).json({ error: "Failed to count members" });
  }
});

module.exports = userRouter;

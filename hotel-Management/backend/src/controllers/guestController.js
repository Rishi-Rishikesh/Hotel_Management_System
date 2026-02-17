import Booking from "../models/Booking.model.js";
import HallBooking from "../models/HallBooking.model.js";
import Guest from "../models/guestModel.js";
import DeletedGuest from "../models/deleted_guest.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import firebaseAdmin from "../config/firebaseAdmin.js";

export const authMiddleware = async (req, res, next) => {
  console.log(`AuthMiddleware: ${req.method} ${req.path}`);
  const authHeader = req.headers.authorization;
  const cookieEmail = req.cookies.user?.email || req.cookies.email;

  if (!authHeader && !cookieEmail) {
    return res.status(401).json({ success: false, message: "No token or email provided" });
  }

  try {
    let user;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      console.log("Token verified. UID:", decodedToken.uid, "Email:", decodedToken.email);
      user = await Guest.findOne({ firebaseUid: decodedToken.uid });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found in database" });
      }
    } else if (cookieEmail) {
      user = await Guest.findOne({ email: cookieEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found for email in cookies" });
      }
    } else {
      return res.status(401).json({ success: false, message: "Invalid authentication" });
    }

    req.user = user;
    req.userEmail = user.email;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.code, error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Middleware to check if the user is an admin

export const loginGuest = async (req, res) => {
  try {
    console.log("loginGuest called with:", req.body);
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "ID token is required" });
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    console.log("User authenticated:", decodedToken.uid, decodedToken.email);

    let user = await Guest.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      user = await Guest.findOne({ email: decodedToken.email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found. Please sign up." });
      }
      if (user.firebaseUid !== decodedToken.uid) {
        console.log(`Updating firebaseUid for email: ${decodedToken.email}`);
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    try {
      await firebaseAdmin.auth().setCustomUserClaims(decodedToken.uid, { role: user.role });
      console.log(`✅ Set custom claims for UID ${decodedToken.uid}:`, { role: user.role });
    } catch (claimError) {
      console.warn("⚠️ Warning: Could not set custom user claims:", claimError.message);
      // Not fatal, continue with login
    }

    user.lastLogin = new Date();
    await user.save();

    console.log("User processed:", {
      email: user.email,
      role: user.role,
      firebaseUid: user.firebaseUid,
    });

    res.cookie("user", { email: user.email, role: user.role }, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 86400000,
    });

    console.log("User processed successfully:", user.email);
    res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        fname: user.fname || "",
        lname: user.lname || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        profileImage: user.profileImage || "",
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR DETAILS:");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.stack) console.error("Stack Trace:", error.stack);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate email found. Please contact support.",
      });
    }
    res.status(401).json({
      success: false,
      message: `Login failed: ${error.message}`,
      error_code: error.code
    });
  }
};

// export const loginGuest = async (req, res) => {
//   try {
//     console.log("loginGuest called with:", req.body);
//     const { idToken } = req.body;
//     if (!idToken) {
//       return res.status(400).json({ success: false, message: "ID token is required" });
//     }

//     const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
//     console.log("User authenticated:", decodedToken.uid, decodedToken.email);

//     let user = await Guest.findOne({ email: decodedToken.email });

//     if (user) {
//       if (user.firebaseUid !== decodedToken.uid) {
//         console.log(`Updating firebaseUid for existing email: ${decodedToken.email}`);
//         user.firebaseUid = decodedToken.uid;
//         user.lastLogin = new Date();
//         await user.save();
//       }
//     } else {
//       user = await Guest.create({
//         email: decodedToken.email,
//         firebaseUid: decodedToken.uid,
//         lastLogin: new Date(),
//         role: "User",
//         status: "Active",
//       });
//     }

//     console.log("User processed:", {
//       email: user.email,
//       role: user.role,
//       firebaseUid: user.firebaseUid,
//     });

//     res.cookie("user", { email: user.email, role: user.role }, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Lax",
//       maxAge: 86400000,
//     });

//     res.json({
//       success: true,
//       message: "Login successful",
//       role: user.role,
//       user: {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//         fname: user.fname || "",
//         lname: user.lname || "",
//         phoneNumber: user.phoneNumber || "",
//         gender: user.gender || "",
//         profileImage: user.profileImage || "",
//         lastLogin: user.lastLogin,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error.code, error.message);
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate email found. Please contact support to resolve the issue.",
//       });
//     }
//     res.status(401).json({ success: false, message: `Login failed: ${error.message}` });
//   }
// };





// Include other controller functions (signupGuest, updateGuest, etc.) from your provided code without changes
export const signupGuest = async (req, res) => {
  try {
    const { email, password, firebaseUid } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newGuest = new Guest({
      email,
      password: hashedPassword,
      firebaseUid: firebaseUid || null, // Store Firebase UID if provided
      status: "Active",
      role: "User",
    });
    await newGuest.save();
    console.log("Guest Added To The Database Successfully with Firebase UID:", firebaseUid || "None");
    res.status(201).json({ success: true, message: "Signup successful" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, message: "Error during signup" });
  }
};



export const updateGuest = async (req, res) => {
  try {
    const email = req.query.email || req.cookies.user?.email || req.cookies.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "User not logged in: No email found",
      });
    }
    const existingGuest = await Guest.findOne({ email });
    if (!existingGuest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    const requester = await Guest.findOne({ email: req.userEmail });
    if (!requester) {
      return res.status(404).json({ success: false, message: "Requester not found" });
    }
    // Admin updating another user
    if (requester.role === "Admin" && existingGuest.email !== req.userEmail) {
      const { status, fname, lname, phoneNumber, gender, role } = req.body;
      if (existingGuest.role === "User") {
        // Admins can update status, role, and details for guests
        if (status && !["Active", "Non-Active"].includes(status)) {
          return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        if (role && !["User", "Staff"].includes(role)) {
          return res.status(400).json({ success: false, message: "Invalid role value" });
        }
        existingGuest.status = status || existingGuest.status;
        existingGuest.role = role || existingGuest.role;
        existingGuest.fname = fname || existingGuest.fname;
        existingGuest.lname = lname || existingGuest.lname;
        existingGuest.phoneNumber = phoneNumber || existingGuest.phoneNumber;
        existingGuest.gender = gender || existingGuest.gender;
      } else if (existingGuest.role === "Staff") {
        // Admins can update staff details
        existingGuest.fname = fname || existingGuest.fname;
        existingGuest.lname = lname || existingGuest.lname;
        existingGuest.phoneNumber = phoneNumber || existingGuest.phoneNumber;
        existingGuest.gender = gender || existingGuest.gender;
        existingGuest.status = status || existingGuest.status;
      } else {
        return res.status(403).json({
          success: false,
          message: "Admins cannot update other admins",
        });
      }
    } else {
      // Non-admin or self-update
      const { fname, lname, address, gender, phonenum, nic, profileImage } = req.body;
      if (fname) existingGuest.fname = fname;
      if (lname) existingGuest.lname = lname;
      if (address) existingGuest.address = address;
      if (gender) existingGuest.gender = gender;
      if (phonenum) existingGuest.phoneNumber = phonenum;
      if (nic) existingGuest.nic = nic;
      if (profileImage && profileImage !== existingGuest.profileImage) {
        existingGuest.profileImage = profileImage;
      }
    }
    const updatedGuest = await existingGuest.save();
    res.cookie("user", { email: updatedGuest.email, role: updatedGuest.role }, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 86400000,
    });
    return res.status(200).json({
      success: true,
      message: "Guest profile updated successfully",
      data: updatedGuest,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ success: false, message: "Error during update" });
  }
};

// Other controller functions (unchanged from your provided code)
export const createStaff = async (req, res) => {
  try {
    const adminEmail = req.cookies.user?.email || req.cookies.email;
    if (adminEmail !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Only the admin can create staff accounts" });
    }
    const { email, password, fname, lname, phoneNumber, gender } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
    });
    const newStaff = new Guest({
      email,
      firebaseUid: firebaseUser.uid,
      fname,
      lname,
      phoneNumber,
      gender,
      role: "Staff",
      status: "Active",
    });
    await newStaff.save();
    res.status(201).json({ success: true, message: "Staff account created successfully" });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ success: false, message: "Error creating staff" });
  }
};

export const uploadStaffProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }
    const { staffId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ success: false, message: "Invalid staff ID" });
    }
    const staff = await Guest.findOne({ _id: staffId, role: "Staff" });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "staff_profiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    if (staff.profileImage) {
      const publicId = staff.profileImage.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    staff.profileImage = uploadResult.secure_url;
    await staff.save();
    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: staff.profileImage,
    });
  } catch (error) {
    console.error("Error uploading staff profile image:", error);
    res.status(500).json({ success: false, message: "Error uploading profile image" });
  }
};

export const getGuestMe = async (req, res) => {
  try {
    const email = req.cookies.user?.email || req.cookies.email;
    console.log("Fetching user with email:", email);
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await Guest.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        address: user.address,
        nic: user.nic,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        profileImage: user.profileImage,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

export const otpGuest = (req, res) => {
  console.log("Received email:", req.body.email);
  Guest.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        console.log("User not found");
        return res.send("User not found");
      } else {
        res.send(true);
      }
      console.log("Retrieved email:", user.email);
    })
    .catch((err) => {
      console.error("Database operation was unsuccessful:", err);
      res.send("Database operation was unsuccessful");
    });
};

export const guestRegistration = async (req, res) => {
  try {
    const email = req.cookies.user?.email || req.cookies.email;
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    const existingGuest = await Guest.findOne({ email });
    if (!existingGuest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    const { fname, lname, address, nic, phonenum, gender, profileImage } = req.body;
    if (profileImage && !profileImage.startsWith("https://res.cloudinary.com")) {
      return res.status(400).json({ success: false, message: "Invalid profile image URL" });
    }
    existingGuest.fname = fname;
    existingGuest.lname = lname;
    existingGuest.address = address;
    existingGuest.nic = nic;
    existingGuest.phoneNumber = phonenum;
    existingGuest.gender = gender;
    existingGuest.profileImage = profileImage || existingGuest.profileImage;
    await existingGuest.save();
    console.log("Guest details updated successfully:", email);
    res.json({
      success: true,
      user: {
        _id: existingGuest._id,
        fname: existingGuest.fname,
        lname: existingGuest.lname,
        address: existingGuest.address,
        nic: existingGuest.nic,
        phoneNumber: existingGuest.phoneNumber,
        gender: existingGuest.gender,
        profileImage: existingGuest.profileImage,
        email: existingGuest.email,
        role: existingGuest.role,
        status: existingGuest.status,
      },
    });
  } catch (err) {
    console.error("Error updating guest details:", err);
    res.status(500).json({ success: false, message: "Guest update failed" });
  }
};

export const getCloudinaryConfig = (req, res) => {
  try {
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (error) {
    console.error("Error fetching Cloudinary config:", error);
    res.status(500).json({ success: false, message: "Failed to load Cloudinary configuration" });
  }
};

export const getDashboard = (req, res) => {
  const email = req.cookies.user?.email || req.cookies.email;
  if (!email) {
    console.log("No email cookie found");
    return res.status(401).json({ success: false, message: "Unauthorized access" });
  }
  Guest.findOne({ email })
    .then((retdata) => {
      if (!retdata) {
        console.log("Guest not found for email:", email);
        return res.status(404).json({ success: false, message: "Guest not found" });
      }
      console.log("Guest data fetched:", retdata);
      res.json({
        success: true,
        user: {
          fname: retdata.fname || "",
          lname: retdata.lname || "",
          address: retdata.address || "",
          nic: retdata.nic || "",
          phoneNumber: retdata.phoneNumber || "",
          gender: retdata.gender || "",
          profileImage: retdata.profileImage || "",
          email: retdata.email,
          role: retdata.role,
          status: retdata.status,
        },
      });
    })
    .catch((err) => {
      console.error("Error retrieving user data:", err);
      res.status(500).json({ success: false, message: "Error retrieving user data" });
    });
};

export const findGuest = async (req, res) => {
  try {
    const guestId = req.params.id;
    console.log("findGuest called with guestId:", guestId);
    if (!guestId) {
      return res.status(400).json({ success: false, message: "Guest ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      return res.status(400).json({ success: false, message: "Invalid Guest ID format" });
    }
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    res.status(200).json({ success: true, guest });
  } catch (error) {
    console.error("Error retrieving guest data:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid Guest ID" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getGuest = async (req, res) => {
  try {
    let { page, limit, search, roomNo, date, role } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const query = {};
    if (search) {
      query.$or = [
        { fname: { $regex: search, $options: "i" } },
        { lname: { $regex: search, $options: "i" } },
      ];
    }
    if (roomNo) {
      query.roomNo = roomNo;
    }
    if (date) {
      query.date = date;
    }
    if (role && ["User", "Staff"].includes(role)) {
      query.role = role;
    }
    const totalCustomers = await Guest.countDocuments(query);
    const guests = await Guest.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({
      success: true,
      retdata: guests || [],
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving guests:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const newPassword = (req, res) => {
  const email = req.cookies.user?.email || req.cookies.email;
  const { password } = req.body;
  Guest.findOne({ email })
    .then((user) => {
      if (!user) {
        console.log("User not found");
        return res.send("User not found");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            console.log("New password cannot be the same as old password");
            return res.send("New password cannot be the same as old password");
          }
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              return Guest.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true }
              );
            })
            .then(() => {
              console.log("Password updated successfully");
              res.send(true);
            })
            .catch((err) => {
              console.error("Error updating password:", err);
              res.send("Error updating password");
            });
        })
        .catch((err) => {
          console.error("Error comparing passwords:", err);
          res.send("Error comparing passwords");
        });
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      res.send("Error fetching user");
    });
};

export const deleteGuest = async (req, res) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    console.log(`Deleting guest with email: ${email} for reason: ${reason}`);
    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    const requester = await Guest.findOne({ email: req.userEmail });
    if (!requester) {
      return res.status(404).json({ success: false, message: "Requester not found" });
    }
    if (requester.role !== "Admin" && guest.email !== req.userEmail) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete other accounts",
      });
    }
    if (guest.role === "Admin" && guest.email !== req.userEmail) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot delete other admin accounts",
      });
    }
    const existingDeletedGuest = await DeletedGuest.findOne({ email });
    if (existingDeletedGuest) {
      existingDeletedGuest.reason = reason;
      existingDeletedGuest.deletedAt = new Date();
      await existingDeletedGuest.save();
    } else {
      const deletedGuest = new DeletedGuest({
        email: guest.email,
        reason,
        deletedAt: new Date(),
      });
      await deletedGuest.save();
    }
    if (guest.firebaseUid) {
      await firebaseAdmin.auth().deleteUser(guest.firebaseUid);
    }
    await Guest.deleteOne({ email });
    return res.json({
      success: true,
      message: "Guest account deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting guest account:", error);
    return res.status(500).json({ success: false, message: "Error deleting guest account" });
  }
};

export const deleteProfileImage = async (req, res) => {
  const email = req.cookies.user?.email || req.cookies.email;
  if (!email) {
    console.log("No email cookie found");
    return res.status(400).json({ success: false, message: "Email cookie missing" });
  }
  try {
    const guest = await Guest.findOne({ email });
    if (!guest) {
      console.log("Guest not found for email:", email);
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    if (guest.profileImage && guest.profileImage !== "") {
      const publicId = guest.profileImage.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      console.log("Profile image deleted from Cloudinary:", publicId);
    }
    const updatedGuest = await Guest.findOneAndUpdate(
      { email },
      { profileImage: "" },
      { new: true }
    );
    if (updatedGuest) {
      console.log("Profile image removed for guest:", email);
      res.json({ success: true });
    } else {
      console.log("Guest not found for email:", email);
      res.status(404).json({ success: false, message: "Guest not found" });
    }
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({ success: false, message: "Error deleting profile image" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("getReservations called with userId:", userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const roomBookings = await Booking.find({ guestEmail: req.userEmail }).sort({
      createdAt: -1,
    });

    const hallBookings = await HallBooking.find({ guestEmail: req.userEmail }).sort({
      createdAt: -1,
    });

    const reservations = [
      ...roomBookings.map((booking) => ({
        _id: booking._id,
        userId,
        date: booking.checkInDate,
        type: "room",
        details: {
          roomNumber: booking.roomNumber,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          bookingStatus: booking.bookingStatus,
        },
      })),
      ...hallBookings.map((booking) => ({
        _id: booking._id,
        userId,
        date: booking.eventDate,
        type: "hall",
        details: {
          hallId: booking.hallId,
          eventDate: booking.eventDate,
          eventType: booking.eventType,
          bookingStatus: booking.bookingStatus,
        },
      })),
    ];

    res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error("Error in getReservations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export async function getGuestById(req, res) {
  try {
    const guest = await Guest.findById(req.params.id).select("fname lname phoneNumber email");
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        firstName: guest.fname,
        lastName: guest.lname,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
      },
    });
  } catch (error) {
    console.error(`getGuestById: ${req.method} ${req.originalUrl} - Error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
}
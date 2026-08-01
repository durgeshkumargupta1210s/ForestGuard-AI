import multer from "multer";
import path from "path";
import fs from "fs";

import { UPLOADS_DIR } from "../config/paths.js";

// Create uploads folder if it doesn't exist

const uploadDir = UPLOADS_DIR;

if (!fs.existsSync(uploadDir)) {

  fs.mkdirSync(uploadDir, {

    recursive: true,

  });

}

// Storage configuration

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadDir);

  },

  filename: (req, file, cb) => {

    const uniqueName =

      Date.now() +

      "-" +

      Math.round(Math.random() * 1e9) +

      path.extname(file.originalname);

    cb(null, uniqueName);

  },

});

// File filter

const fileFilter = (req, file, cb) => {

  const allowedTypes = [

    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp",

  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  }

  else {

    cb(

      new Error(

        "Only JPG, PNG and WEBP images are allowed."

      ),

      false

    );

  }

};

// Multer instance

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 5 * 1024 * 1024,

  },

});

export default upload;
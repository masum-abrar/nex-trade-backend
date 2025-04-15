import { v2 as cloudinary } from "cloudinary";
import { extname } from "path";
import sharp from "sharp";
import { Readable } from "stream";

const uploadToCLoudinary = async (files, folder, callBack) => {
  try {
    let filesLength = 1;
    let images = "";

    if (Array.isArray(files)) {
      images = [];
      filesLength = files.length;
    } else {
      images = "";
    }

    //max 3 images
    if (filesLength > 3) {
      console.log("You cannot upload more than 3 pictures");
      return false;
    }

    for (let i = 0; i < filesLength; i++) {
      let file;

      if (Array.isArray(files)) {
        file = files[i];
      } else {
        file = files;
      }

      if (file === undefined) {
        return false;
      }

      let filename = file.originalname;
      let fileUniqueName = file.filename;
      let destination = file.destination;
      let path = file.path;
      let file_extension = extname(filename);

      if (
        file_extension.toLowerCase() === ".jpg" ||
        file_extension.toLowerCase() === ".png" ||
        file_extension.toLowerCase() === ".jpeg" ||
        file_extension.toLowerCase() === ".JPG" ||
        file_extension.toLowerCase() === ".JPEG" ||
        file_extension.toLowerCase() === ".PNG" ||
        file_extension.toLowerCase() === ".webp"
      ) {
        const bufferToStream = (buffer) => {
          const readable = new Readable({
            read() {
              this.push(buffer);
              this.push(null);
            },
          });
          return readable;
        };

        const data = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
        const stream = cloudinary.uploader.upload_stream({ folder }, callBack);

        const bufferImage = bufferToStream(data).pipe(stream);
      } else {
        console.log("Please select jpg/jpeg/png image");
        return false;
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default uploadToCLoudinary;

import { v2 as cloudinary } from "cloudinary";
import { extname } from "path";
import sharp from "sharp";
import { Readable } from "stream";

// Upload function that returns a Promise
const uploadToCLoudinary = async (files, folder) => {
  return new Promise((resolve, reject) => {
    try {
      let filesLength = 1;
      let images = "";

      if (Array.isArray(files)) {
        images = [];
        filesLength = files.length;
      } else {
        images = "";
      }

      // Max 3 images
      if (filesLength > 3) {
        console.log("You cannot upload more than 3 pictures");
        return reject("Too many files");
      }

      for (let i = 0; i < filesLength; i++) {
        let file;

        if (Array.isArray(files)) {
          file = files[i];
        } else {
          file = files;
        }

        if (file === undefined) {
          return reject("File is undefined");
        }

        let filename = file.originalname;
        let file_extension = extname(filename).toLowerCase();

        if (
          file_extension === ".jpg" ||
          file_extension === ".png" ||
          file_extension === ".jpeg" ||
          file_extension === ".webp"
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

          // Process image with sharp (convert to webp format)
          sharp(file.buffer)
            .webp({ quality: 80 })
            .toBuffer()
            .then((data) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                  if (error) {
                    console.log("Cloudinary Upload Error:", error);
                    return reject(error);
                  }
                  if (result && result.secure_url) {
                    resolve(result); // Resolve with the result (contains secure_url)
                  } else {
                    reject("Failed to retrieve image URL from Cloudinary");
                  }
                }
              );

              bufferToStream(data).pipe(stream); // Upload image to Cloudinary
            })
            .catch((error) => {
              reject(error); // Handle errors in image processing
            });
        } else {
          reject("Invalid file type. Please select jpg/jpeg/png image");
        }
      }
    } catch (error) {
      reject(error); // Catch and reject any unexpected errors
    }
  });
};

export default uploadToCLoudinary;

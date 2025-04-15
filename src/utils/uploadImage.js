import fs from "fs";
import { extname } from "path";
import sharp from "sharp";

const uploadImage = async (files) => {
  try {
    let filesLength = 1;
    let images = "";

    if (Array.isArray(files)) {
      images = [];
      filesLength = files.length;
    } else {
      images = "";
    }

    //max 5 images
    if (filesLength > 5) {
      for (let j = 0; j < filesLength; j++) {
        fs.unlinkSync(files[j].path);
      }
      console.log("You cannot upload more than 5 pictures");
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

      let sharp_webp;

      if (
        file_extension.toLowerCase() === ".jpg" ||
        file_extension.toLowerCase() === ".png" ||
        file_extension.toLowerCase() === ".jpeg" ||
        file_extension.toLowerCase() === ".JPG" ||
        file_extension.toLowerCase() === ".JPEG" ||
        file_extension.toLowerCase() === ".PNG" ||
        file_extension.toLowerCase() === ".webp"
      ) {
        // let timestamp = new Date().getTime();
        var web_file_name = `${fileUniqueName}.webp`;

        //convert to webp
        sharp_webp = await sharp(destination + "/" + fileUniqueName)
          .toFile(destination + "/" + web_file_name)
          .then((data) => {
            fs.unlinkSync(path);

            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });

        if (Array.isArray(files)) {
          images.push({
            image:
              destination.split("/")[1] +
              "/" +
              destination.split("/")[2] +
              "/" +
              web_file_name,
          });
        } else {
          images =
            destination.split("/")[1] +
            "/" +
            destination.split("/")[2] +
            "/" +
            web_file_name;
        }
      } else {
        console.log("Please select jpg/jpeg/png image");
        return false;
      }

      //   if (!sharp_webp) {
      //     fs.unlinkSync(path);
      //   }
    }

    return images;
  } catch (error) {
    console.log("Something went wrong!");
    return false;
  }
};

export default uploadImage;

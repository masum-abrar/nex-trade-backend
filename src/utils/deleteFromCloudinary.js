import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (file, callBack) => {
  const fileName = file?.split("/");
  if (!fileName) {
    return;
  }
  const fileNameWithFolder =
    fileName[fileName?.length - 2] + "/" + fileName[fileName?.length - 1];
  const fileNameWithoutExtension = fileNameWithFolder.split(".")[0];

  await cloudinary.uploader.destroy(fileNameWithoutExtension, callBack);
};

export default deleteFromCloudinary;

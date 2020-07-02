using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;
using AMWUtil.Common;
using System.Threading.Tasks;
using System.Drawing.Drawing2D;
using System.Drawing.Text;

namespace AWMSEngine.Engine.V2.General
{
    public class UploadImageFile : BaseEngine<UploadImageFile.TReq, UploadImageFile.TRes>
    {
     
        public class TReq
        {
            public string baseCode;
            public string imageBase64;
        }
        public class TRes
        {
            public string fileName;
        }
        // Orientations.
        public const int OrientationId = 0x0112; //274
        public enum ExifOrientations
        {
            Unknown = 0,
            RotateNone = 1,
            RotateNoneFlipX = 2,
            Rotate180FlipNone = 3,
            Rotate180FlipX = 4,
            Rotate90FlipX = 5,
            Rotate90FlipNone = 6,
            Rotate270FlipX = 7,
            Rotate270FlipNone = 8,
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            string[] strings = reqVO.imageBase64.Split(",");

            byte[] bytes = Convert.FromBase64String(strings[1]);

            string extension;
            switch (strings[0])
            {//check image's extension
                case "data:image/jpeg;base64":
                    extension = "jpeg";
                    break;
                case "data:image/png;base64":
                    extension = "png";
                    break;
                default://should write cases for more images types
                    extension = "jpg";
                    break;
            }
            
            var filepath = StaticValue.GetConfigValue(ConfigCode.PATH_FOLDER_IMAGES);
            CreateFolder(filepath);
            DeleteOldFile(filepath, reqVO.baseCode);

            var fileName = reqVO.baseCode + "." + extension;
            var fileFullPath = filepath + "/" + fileName;

            //CreateThumbnail(bytes, 800, extension, fileFullPath);
            Image image;
             
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                image = Image.FromStream(ms);

                // Get the PropertyItems property from image.
                ImageOrientation(image);

                int w, h;
                if(image.Width > image.Height)
                {
                    w = 800;
                    h = (int)((double)image.Height * (800.0f / (double)image.Width));
                }
                else
                {
                    h = 800;
                    w = (int)((double)image.Width * (800.0f / (double)image.Height));
                }
                Bitmap resizedImage = new Bitmap(w, h);
                using (Graphics gfx = Graphics.FromImage(resizedImage))
                {
                    gfx.DrawImage(image, new Rectangle(0, 0, w, h),
                        new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                }
                resizedImage.Save(fileFullPath);
            }
            var res = new TRes() {
                fileName = fileName
            };
            return res;
        }
        private ImageFormat ParseImageFormat(string str)
        {
            return (ImageFormat)typeof(ImageFormat)
                    .GetProperty(str, BindingFlags.Public | BindingFlags.Static | BindingFlags.IgnoreCase)
                    .GetValue(str, null);
        }
        private void CreateFolder(string filePath)
        {
            // Specify the directory you want to manipulate.
            try
            {
                // Determine whether the directory exists.
                if (Directory.Exists(filePath))
                {
                    return;
                }

                // Try to create the directory.
                DirectoryInfo di = Directory.CreateDirectory(filePath);

                //// Delete the directory.
                //di.Delete();
                //Console.WriteLine("The directory was deleted successfully.");
            }
            catch (Exception e)
            { 
                throw new AMWException(this.Logger, AMWExceptionCode.S0001, "The process failed: " + e.ToString());
            }
            finally { }
        }

         
        private void DeleteOldFile(string filePath, string fileName)
        {
            DirectoryInfo diInfo = new DirectoryInfo(filePath);
            FileInfo[] files = diInfo.GetFiles();
            for (int i = 0; i < files.Length; i++)
            {
                var name = files[i].Name.Split(".");
                if (fileName == name[0])
                {
                    string _filePath = files[i].ToString();
                    if (File.Exists(_filePath))
                    {
                        File.Delete(_filePath);
                    }
                }
              
            }
        }

        // Return the image's orientation.
        private void ImageOrientation(Image image)
        {
            ExifOrientations orientations = new ExifOrientations();
            // Get the index of the orientation property.
            int orientation_index =
                Array.IndexOf(image.PropertyIdList, OrientationId);

            // If there is no such property, return Unknown.
            if (orientation_index < 0)
            {
                orientations = ExifOrientations.Unknown;
            }

            // Return the orientation value.
            orientations = (ExifOrientations)image.GetPropertyItem(OrientationId).Value[0];
            // Orient the result.
            switch (orientations)
            {
                case ExifOrientations.RotateNone:
                    break;
                case ExifOrientations.RotateNoneFlipX:
                    image.RotateFlip(RotateFlipType.RotateNoneFlipX);
                    break;
                case ExifOrientations.Rotate180FlipNone:
                    image.RotateFlip(RotateFlipType.Rotate180FlipNone);
                    break;
                case ExifOrientations.Rotate180FlipX:
                    image.RotateFlip(RotateFlipType.Rotate180FlipX);
                    break;
                case ExifOrientations.Rotate90FlipX:
                    image.RotateFlip(RotateFlipType.Rotate90FlipX);
                    break;
                case ExifOrientations.Rotate90FlipNone:
                    image.RotateFlip(RotateFlipType.Rotate90FlipNone);
                    break;
                case ExifOrientations.Rotate270FlipX:
                    image.RotateFlip(RotateFlipType.Rotate270FlipX);
                    break;
                case ExifOrientations.Rotate270FlipNone:
                    image.RotateFlip(RotateFlipType.Rotate270FlipNone);
                    break;
            }
            image.RemovePropertyItem(OrientationId);
        }
    }
}

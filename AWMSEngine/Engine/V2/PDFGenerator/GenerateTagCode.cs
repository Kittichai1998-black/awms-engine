using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Drawing;
using QRCoder;
using System.IO;
using AMWUtil.Exception;
using Zen.Barcode;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class GenerateTagCode //: BaseEngine<GenerateTagCode.TReq, GenerateTagCode.TRes>
    {
       
        public byte[] CreateQRCode(string textCode)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(textCode
                , QRCodeGenerator.ECCLevel.H);
            QRCode qrCode = new QRCode(qrCodeData);
            Bitmap bitmap = qrCode.GetGraphic(20); //มีขอบรูป
            //bitmap.Save("qrcode.bmp");
            MemoryStream ms = new MemoryStream();
            bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            byte[] qrcodeByte = ms.ToArray();
            return qrcodeByte;
        }

        public byte[] CreateBarCode(string textCode)
        {
            try
            {
                Image image;
                Zen.Barcode.Code128BarcodeDraw brCode =
                Zen.Barcode.BarcodeDrawFactory.Code128WithChecksum;
                image = brCode.Draw(textCode, 60, 1);
                
                using (MemoryStream ms = new MemoryStream())
                {
                    image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                    byte[] qrcodeByte = ms.ToArray();
                    return qrcodeByte;
                }
                
            }
            catch (Exception e )
            {
                //throw new AMWException(this.Logger, AMWExceptionCode.S0001, "The process of generate Barcode failed: " + e.ToString());
                throw new Exception("The process of generate Barcode failed: " + e.ToString());
            }
        }

       
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Drawing;
using QRCoder;
using System.IO;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class QRCodeGenerate
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
    }
}

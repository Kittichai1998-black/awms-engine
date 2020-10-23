using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;
using System.Linq;
using System.Drawing.Text;
using System.Drawing;

namespace MyTest2
{
    public class ClassA
    {
        public int valA;
        public int valB;
        public int valC;
    }
    public class ClassB
    {
        public int val;
    }

    public class TestFile
    {
        public readonly ITestOutputHelper sysout;
        public TestFile(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void Test2()
        {
        }

        [Fact]
        public void TestGUID()
        {
            //AWMSEngine.ADO.WMSDB.DataADO data = new AWMSEngine.ADO.WMSDB.DataADO();
            //AWMSEngine.ADO.WMSDB.DataADO data2 = new AWMSEngine.ADO.WMSDB.DataADO();
            //AWMSEngine.ADO.WMSDB.DataADO data3 = new AWMSEngine.ADO.WMSDB.DataADO();

        }
       

        public static string UTF8toASCII(string text)
        {
            System.Text.Encoding utf8 = System.Text.Encoding.UTF8;
            Byte[] encodedBytes = utf8.GetBytes(text);
            Byte[] convertedBytes =
                    Encoding.Convert(Encoding.UTF8, Encoding.ASCII, encodedBytes);
            System.Text.Encoding ascii = System.Text.Encoding.ASCII;

            return ascii.GetString(convertedBytes);
        }
        public static string End1ToEnd2(string text)
        {
            System.Text.Encoding e1 = System.Text.Encoding.UTF8;
            System.Text.Encoding e2 = System.Text.Encoding.ASCII; 
            Byte[] encodedBytes = e1.GetBytes(text);
            Byte[] convertedBytes = Encoding.Convert(e1, e2, encodedBytes);

            return e2.GetString(convertedBytes);
        }
        [Fact]
        public void TestFont()
        {
            StringBuilder familyNames = new StringBuilder();
            InstalledFontCollection ifc = new InstalledFontCollection();
            FontFamily[] families = ifc.Families;
            foreach (FontFamily family in families)
            {
                familyNames.AppendFormat("{0}\n", family.Name);
            }
            sysout.WriteLine(familyNames.ToString());

        }

        [Fact]
        public void TestFTP()
        {
            AMWUtil.DataAccess.FTPFileAccess.MoveFileFromFTP("ftp://191.20.80.120:3007/", "Archive/", "../Archive2/", "sap_pallet_20190712-190719-001.xml", "administrator", "amwteam", null);
        }
    }
}

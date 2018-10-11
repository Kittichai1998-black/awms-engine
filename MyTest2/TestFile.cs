using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class TestFile
    {
        public readonly ITestOutputHelper sysout;
        public TestFile(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void TestGUID()
        {
            AWMSEngine.ADO.DataADO data = new AWMSEngine.ADO.DataADO();
            AWMSEngine.ADO.DataADO data2 = new AWMSEngine.ADO.DataADO();
            AWMSEngine.ADO.DataADO data3 = new AWMSEngine.ADO.DataADO();

        }
        [Fact]
        public void TestASCIIFile()
        {// Print the header.
            var v = CodePagesEncodingProvider.Instance.GetEncoding(874);
            //Encoding.RegisterProvider(CodePagesEncodingProvider.Instance.GetEncoding(874));
            Console.Write("CodePage identifier and name     ");
            Console.WriteLine("WindowsCodePage");

            // For every encoding, get the Windows code page for it.
            foreach (EncodingInfo ei in Encoding.GetEncodings())
            {
                string sout = string.Empty;
                Encoding e = ei.GetEncoding();

                sout += string.Format("{0,-6} {1,-25} ", ei.CodePage, ei.Name);
                sout +=  string.Format("{0,-6} ", e.WindowsCodePage);

                // Mark the ones that are different.
                if (ei.CodePage != e.WindowsCodePage)
                    sout += ("*");

                sysout.WriteLine(sout);
            }

            System.IO.StreamReader sr = new System.IO.StreamReader(@"D:\logs\buf_prd.csv", CodePagesEncodingProvider.Instance.GetEncoding(874), true);

            int i = 0;
            CsvHelper.CsvParser csv = new CsvHelper.CsvParser(sr);
            string[] line;
            try
            {
                while ((line = csv.Read()) != null)
                {
                    i++;
                    string s = i + "|";
                    for (int c = 0; c < line.Length; c++)
                    {
                        string f1 = UTF8toASCII(line[c]);
                        string f2 = End1ToEnd2(line[c]);

                        s += line[c]+"|";
                    }
                    sysout.WriteLine(s + "|");

                }
            }
            catch { return; }
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
    }
}

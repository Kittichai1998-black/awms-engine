using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;
using System.Linq;

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
            AWMSEngine.ADO.DataADO data = new AWMSEngine.ADO.DataADO();
            AWMSEngine.ADO.DataADO data2 = new AWMSEngine.ADO.DataADO();
            AWMSEngine.ADO.DataADO data3 = new AWMSEngine.ADO.DataADO();

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

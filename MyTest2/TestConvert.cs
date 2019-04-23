using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace TestConvert
{
    public class TestConvert
    {
        public readonly ITestOutputHelper sysout;
        public TestConvert(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void Test1()
        {
           string[] testval = new string[] { "1-10","13","20-25" };
            // string testval = "5-15";
            string resTest = "";
            resTest = AMWUtil.Common.ConvertUtil.ConverRangeNumToString(testval);
            sysout.WriteLine(resTest);
        }
    }

}

using AMWUtil.Common;
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
           //string[] testval = new string[] { "1-10","13","20-25" };
            string testval = "5-15,20-21";
            var resTest = AMWUtil.Common.RangeNumUtil.ExplodeRangeNum(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test2()
        {
            string testval = "1,5,4,3,2,20,24,25,26,10,11,12";
            var resTest = AMWUtil.Common.RangeNumUtil.MergeRangeNum(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test3()
        {
            var res = ObjectUtil.GenUniqID();
            sysout.WriteLine(res);
            sysout.WriteLine(res);
            sysout.WriteLine(res);
        }
        [Fact]
        public void TestIntersectRangeNum()
        {
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-2", "3-4"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-5", "3-9"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1,2,3,4,5,7", "5,6"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-10,20-30", "5-25"));
        }
    }

}

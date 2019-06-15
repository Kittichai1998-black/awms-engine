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
        public void Test5()
        {
            var iw = Z.Expressions.Eval.Execute("EvalExec(2);");

            int EvalExec(int i) { return i; }
        }
        [Fact]
        public void Test1()
        {
           //string[] testval = new string[] { "1-10","13","20-25" };
            string testval = "5-15,20-21";
            var resTest = AMWUtil.Common.ConvertUtil.ConvertRangeNumToString(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test2()
        {
            string testval = "1,5,4,3,2,20,24,25,26,10,11,12";
            var resTest = AMWUtil.Common.ConvertUtil.ConvertStringToRangeNum(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test3()
        {
            var intlist = new List<int>() { 1, 2, 3, 6, 7, 8, 9, 10, 14 };
            var res = AMWUtil.Common.ConvertUtil.ToRanges(intlist);
            sysout.WriteLine(string.Join(",", res));
        }
    }

}

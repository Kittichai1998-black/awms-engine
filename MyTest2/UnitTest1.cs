using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Globalization;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public interface IA { }
    public class A : IA { }
    public class B : A { }
    public class C : B { }
    public class UnitTest1
    {
        public readonly ITestOutputHelper sysout;
        public UnitTest1(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void TestCondition()
        {
            sysout.WriteLine("typeof(A)==typeof(C) : " + (typeof(A).IsSubclassOf(typeof(C))));
            sysout.WriteLine("typeof(C)==typeof(A) : " + (typeof(C).IsSubclassOf(typeof(C))));
            sysout.WriteLine("new A() is C : " + (new A() is C));
            sysout.WriteLine("new C() is A : " + (new C() is C));
        }
        [Fact]
        public void TestDateTime()
        {
            string dateStr = "12-01-2018 16:30:00";
            string dateFormat = "dd-MM-yyyy hh:mm:ss";
            DateTime dt = DateTime.ParseExact(dateStr, dateFormat, new CultureInfo("en-EN"););
            sysout.WriteLine("");
        }
    }
}

using AMWUtil.Common;
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
            string dtStr = "2018-08-17T04:00:02.461Z";
            string dStr = "2017-09-02Z";
            DateTime dt = dtStr.GetDateTime().Value;
            DateTime d = dStr.GetDate().Value;

            sysout.WriteLine("dtStr : " + dtStr);
            sysout.WriteLine("dStr : " + dStr);
            sysout.WriteLine("dt : " + dt);
            sysout.WriteLine("d : " + dt.ToISOString());
            sysout.WriteLine("d : " + dt.ToISODateString());
        }

        [Fact]
        public void TestDateTime_JSON()
        {
            dynamic dy = new { dt = "2019-01-07T08:00Z" };
            ClassDT dy2 = ObjectUtil.DynamicToModel<ClassDT>(dy);

            sysout.WriteLine("Date ISO : " + dy.dt);
            sysout.WriteLine("Date ToUniversalTime : " + dy2.dt.ToUniversalTime());
            sysout.WriteLine("Date ToLocalTime : " + dy2.dt.ToLocalTime());
            sysout.WriteLine("Date Json : " + dy2.dt.Json());
        }
    }
    class ClassDT
    {
        public DateTime dt;
    }
}

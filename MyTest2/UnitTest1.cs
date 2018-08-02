using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using Xunit;

namespace MyTest2
{
    public interface IA { }
    public class A : IA { }
    public class B : A { }
    public class C : B { }
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            Console.WriteLine("typeof(A)==typeof(C) : " + (typeof(A).IsSubclassOf(typeof(C))));
            Console.WriteLine("typeof(C)==typeof(A) : " + (typeof(C).IsSubclassOf(typeof(C))));
            Console.WriteLine("new A() is C : " + (new A() is C));
            Console.WriteLine("new C() is A : " + (new C() is C));
        }
    }
}

using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace UnitTest03
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            CA ca = new CA();
            ca.a = 5;

            bool xxx = Z.Expressions.Eval.Execute<bool>("a>2", ca);
        }
    }

    public class CA
    {
        public int a;
    }
}

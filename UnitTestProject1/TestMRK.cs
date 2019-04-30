using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace UnitTestProject1
{
    [TestClass]
    public class TestMRK
    {
        [TestMethod]
        public void TestRead()
        {
            var proj = new ProjectMRK.Engine.Bussiness.ReadFileXML();
            proj.test();
        }
    }
}

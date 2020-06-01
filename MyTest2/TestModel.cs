using AMWUtil.Validation;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class Model01
    {
        [ValidationAttribute(RegexPattern = "^[0-9]+$")]
        public string test;
        [ValidationAttribute(RegexPattern = "^[0-9]+$")]
        public int test1;
        [ValidationAttribute(RegexPattern = "^[0-9]+$")]
        public int? test2;

        public List<Model02> m02;
        public Model02[] m03;
        public class Model02
        {
            [ValidationAttribute(MethodValidate = "AMWUtil.Validation.ValidationUtil.IsCheck")]
            public string test3;
        }
    }

    public class TestModel
    {
        public readonly ITestOutputHelper sysout;
        public TestModel(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        public static bool IsCheck(string code)
        {
            return code == "test01";
        }
        [Fact]
        public void TestCreateModel()
        {
            try
            {
                Model01 m1 = new Model01() { test = "1", test1 = 1, test2 = 3 };
                m1.m02 = new List<Model01.Model02>() { new Model01.Model02() { test3 = "xxx" } };
                m1.m03 = new Model01.Model02[] { new Model01.Model02() { test3 = "yyy" } };
                ValidationUtil.ValidateModel(m1);
                sysout.WriteLine("Success");
            }
            catch(Exception ex)
            {
                sysout.WriteLine(ex.Message);
            }
        }
    }
}

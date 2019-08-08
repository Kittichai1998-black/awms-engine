using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Dynamic;
using Z.Expressions;

namespace UnitTestProject1
{
    [TestClass]
    public class UnitTest1
    {
        public static bool IsPropertyExist(dynamic settings, string name)
        {
            if (settings is ExpandoObject)
                return ((IDictionary<string, object>)settings).ContainsKey(name);

            return settings.GetType().GetProperty(name) != null;
        }
        public class T1
        {
            public T2 t2;
            public class T2
            {
                public string t3;
                public string t4;
            }
        }

        [TestMethod]
        public void TestMethod1()
        {
            int i = Eval.Execute<int>("X + Y", new { X = 1, Y = 2 });
            AWMSModel.Criteria.VOCriteria vo = new AWMSModel.Criteria.VOCriteria();
            T1 t1 = new T1();
            t1.t2 = new T1.T2();
            t1.t2.t3 = "xx";
            t1.t2.t4 = "cc";
            vo.Set("t1", t1);
            dynamic xxx = new ExpandoObject();
            xxx.a = 1;
            string v = vo.GetString("t1.t2.t3");
            dynamic d = vo.GetDynamic("*t1.t2");
            dynamic d2 = vo.GetDynamic("*t1");
            Console.WriteLine(v + "\n" + d);
        }
    }
}

using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Globalization;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class MyList
    {
        private List<List<int>> _List1_2;
        public List<List<int>> List1_2 { get { return _List1_2; } }
        public MyList(params List<int>[] l)
        {
            this._List1_2 = new List<List<int>>();
            foreach(var x in l)
            {
                this.List1_2.Add(x);
            }

        }
    }
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
        public void TestCondition2()
        {
            List<int> l1 = new List<int>() { 1, 2, 3, 4, 5 };
            List<int> l2 = new List<int>() { 10, 20, 30, 40, 50 };
            List<int> l3 = new List<int>() { 10, 20, 30, 40, 50 };
            List<int> l4 = new List<int>() { 10, 20, 30, 40, 50 };
            MyList ml = new MyList(l1, l2, l3, l4);

            
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

        [Fact]
        public void TestTreeChild()
        {
            ClassChild root = new ClassChild() { ID = 1, ParentID = null, ChildRight = new List<ClassChild>(), ChildLeft = new List<ClassChild>() };
            ClassChild c2 = new ClassChild() { ID = 2, ParentID = 1, ChildRight = new List<ClassChild>() };
            root.ChildRight.Add(c2);
            ClassChild c3 = new ClassChild() { ID = 3, ParentID = 1, ChildRight = new List<ClassChild>() };
            root.ChildRight.Add(c3);
            ClassChild c4 = new ClassChild() { ID = 4, ParentID = 1, ChildRight = new List<ClassChild>() };
            root.ChildRight.Add(c4);
            ClassChild c2_1 = new ClassChild() { ID = 21, ParentID = 2, ChildRight = new List<ClassChild>() };
            c2.ChildRight.Add(c2_1);
            ClassChild c2_2 = new ClassChild() { ID = 22, ParentID = 2, ChildRight = new List<ClassChild>() };
            c2.ChildRight.Add(c2_2);
            ClassChild c2_2_1 = new ClassChild() { ID = 221, ParentID = 2, ChildRight = new List<ClassChild>() };
            c2_2.ChildRight.Add(c2_2_1);
            ClassChild c900 = new ClassChild() { ID = 221, ParentID = 2, ChildRight = new List<ClassChild>() };
            root.ChildLeft.Add(c900);

            
        }
    }

    public class ClassDT
    {
        public DateTime dt;
    }
    public class ClassChild
    {
        public int ID;
        public int? ParentID;
        public List<ClassChild> ChildRight;
        public List<ClassChild> ChildLeft;
    }
}

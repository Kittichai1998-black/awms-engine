using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Common
{
    public static class TreeUtil
    {
        public static List<TSource> ToList<TSource>(this TSource source)
            where TSource : ITreeObject
        {
            return ToList(source,null);
        }
        private static List<TSource> ToList<TSource>(this TSource source, List<dynamic> childFieldInfos)
            where TSource : ITreeObject
        {
            List<TSource> res = new List<TSource>();
            if (childFieldInfos == null)
            {
                res.Add(source);
                childFieldInfos = new List<dynamic>();
                foreach (var info in typeof(TSource).GetFields())
                {
                    if (info.FieldType == typeof(List<TSource>))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = true, isProperty = false, isList = true, isArray = false });
                    }
                    else if (info.FieldType == typeof(TSource[]))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = true, isProperty = false, isList = false, isArray = true });
                    }
                    else if (info.FieldType == typeof(TSource))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = true, isProperty = false, isList = false, isArray = false });
                    }
                }
                foreach (var info in typeof(TSource).GetProperties())
                {
                    if (info.PropertyType == typeof(List<TSource>))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = false, isProperty = true, isList = true, isArray = false });
                    }
                    else if (info.PropertyType == typeof(TSource[]))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = false, isProperty = true, isList = false, isArray = true });
                    }
                    else if (info.PropertyType == typeof(TSource))
                    {
                        childFieldInfos.Add(new { name = info.Name, isField = false, isProperty = true, isList = false, isArray = false });
                    }
                }
            }

            foreach(var child in childFieldInfos)
            {
                List<TSource> lis = new List<TSource>();
                if ((bool)child.isField)
                {
                    var info = typeof(TSource).GetField((string)child.name);
                    object val = info.GetValue(source);
                    if (val == null) continue;
                    if ((bool)child.isList)
                    {
                        lis.AddRange((List<TSource>)val);
                    }
                    else if ((bool)child.isArray)
                    {
                        lis.AddRange((TSource[])val);
                    }
                    else
                    {
                        lis.Add((TSource)val);
                    }
                }
                else if ((bool)child.isProperty)
                {
                    var info = typeof(TSource).GetProperty((string)child.name);
                    object val = info.GetValue(source);
                    if (val == null) continue;
                    if ((bool)child.isList)
                    {
                        lis.AddRange((List<TSource>)val);
                    }
                    else if ((bool)child.isArray)
                    {
                        lis.AddRange((TSource[])val);
                    }
                    else
                    {
                        lis.Add((TSource)val);
                    }
                }

                res.AddRange(lis);
                lis.ForEach(x => { res.AddRange(ToList<TSource>(x, childFieldInfos)); });
            }
            return res;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AMWUtil.Common
{
    public static class ConvertUtil
    {
        public static string ExplodeRangeNum(string[] rangeNums)
        {
            string newValue = "";
            int[] newArray = new int[] { };
            if (rangeNums.Length > 0)
            {
                for (int i = 0; i < rangeNums.Length; i++){
                    newArray = newArray.Concat(ConvertRangeNumToIntArray(rangeNums[i])).ToArray();
                }
            }

            for (int i = 0; i < newArray.Length; i++)
            {
                if (i == newArray.Length - 1)
                {
                    newValue = String.Concat(newValue, newArray[i]);
                }
                else
                {
                    newValue = String.Concat(newValue, newArray[i] + ",");
                }
            }
            return newValue;
        }
        public static string ExplodeRangeNum(string value)
        {
            string newValue = "";
            int[] newArray = new int[] { };
            string[] strVal = null;
            if (value.Contains(","))
            {
                strVal = value.Split(",");
                return ExplodeRangeNum(strVal);
            }
            else
            {
                newArray = newArray.Concat(ConvertRangeNumToIntArray(value)).ToArray();
            }

            for (int i = 0; i < newArray.Length; i++)
            {
                if (i == newArray.Length - 1)
                {
                    newValue = String.Concat(newValue, newArray[i]);
                }
                else
                {
                    newValue = String.Concat(newValue, newArray[i] + ",");
                }
            }
            return newValue;
        }


        public static int[] ConvertRangeNumToIntArray(string value)
        {
            List<int> termsList = new List<int>();
            int[] newArray = new int[] { };
            if (value.Contains("-"))
            {
                string[] eleArray = value.Split("-");
                int i = int.Parse(eleArray[0]);
                int end = int.Parse(eleArray[1]);
                while (i <= end)
                {
                    termsList.Add(i);
                    i++;
                }
                newArray = termsList.ToArray();
            }
            else
            {
                termsList.Add(int.Parse(value));
                newArray = termsList.ToArray();
            }
            return newArray;
        }

        public static string MergeRangeNum(string value)
        {
            var res = ToRanges(value.Split(',').Select(Int32.Parse).ToList());
            return string.Join(",", res);
        }
        public static string ConvertToRangeNum(this List<int> values)
        {
            var res = ToRanges(values);
            return string.Join(",", res);
        }

        private static string[] ToRanges(this List<int> ints)
        {
            if (ints.Count < 1) return new string[] { };
            ints.Sort();
            var lng = ints.Count;
            var fromnums = new List<int>();
            var tonums = new List<int>();
            for (var i = 0; i < lng - 1; i++)
            {
                if (i == 0)
                    fromnums.Add(ints[0]);
                if (ints[i + 1] > ints[i] + 1)
                {
                    tonums.Add(ints[i]);
                    fromnums.Add(ints[i + 1]);
                }
            }
            tonums.Add(ints[lng - 1]);
            return Enumerable.Range(0, tonums.Count).Select(
                i => fromnums[i].ToString() +
                    (tonums[i] == fromnums[i] ? "" : "-" + tonums[i].ToString())
            ).ToArray();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AMWUtil.Common
{
    public static class ConvertUtil
    {
        public static string ConverRangeNumToString(string[] value)
        {
            string newValue = "";
            int[] newArray = new int[] { };
            if (value.Length > 0)
            {
                for (int i = 0; i < value.Length; i++){
                    newArray = newArray.Concat(TransferToArray(value[i])).ToArray();
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
        public static string ConverRangeNumToString(string value)
        {
            string newValue = "";
            int[] newArray = new int[] { };
            newArray = newArray.Concat(TransferToArray(value)).ToArray();

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


        public static int[] TransferToArray(string value)
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
    }
}
